import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { ReviewSubmitData, ReviewSubmitResponse } from '@/types/review'

/**
 * 提交教师评价的API路由处理器
 * 
 * 此API接收包含评价数据的POST请求，并将数据写入Supabase数据库
 */
export async function POST(request: Request) {
  try {
    // 1. 解析请求体中的JSON数据
    const reviewData: ReviewSubmitData = await request.json()
    
    // 2. 验证必要字段
    if (!reviewData.teacher_id) {
      return NextResponse.json<ReviewSubmitResponse>(
        { success: false, error: '缺少教师ID' },
        { status: 400 }
      )
    }
    
    // 验证评分范围 (0.5-5分，步长为0.5)
    if (
      typeof reviewData.rating !== 'number' || 
      reviewData.rating < 0.5 || 
      reviewData.rating > 5 || 
      (reviewData.rating * 10) % 5 !== 0 // 确保只能是0.5的倍数
    ) {
      return NextResponse.json<ReviewSubmitResponse>(
        { success: false, error: '评分无效，必须是0.5到5分之间，且是0.5的倍数' },
        { status: 400 }
      )
    }
    
    // 验证评论文本（现在是必填项）
    if (!reviewData.comment || reviewData.comment.trim() === '') {
      return NextResponse.json<ReviewSubmitResponse>(
        { success: false, error: '评价内容不能为空' },
        { status: 400 }
      )
    }
    
    if (typeof reviewData.does_roll_call !== 'boolean') {
      return NextResponse.json<ReviewSubmitResponse>(
        { success: false, error: '点名标记必须是布尔值' },
        { status: 400 }
      )
    }
    
    // 3. 创建带有管理员权限的Supabase客户端
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // 4. 添加IP哈希作为简单的重复提交检测
    // 注意: 在生产环境中，应该使用更安全的方法来处理这个问题
    const userIp = request.headers.get('x-forwarded-for') || 'unknown'
    const submitterHash = Buffer.from(userIp).toString('base64')
    
    // 添加提交者哈希到请求数据
    const reviewDataWithHash: ReviewSubmitData = {
      ...reviewData,
      submitter_hash: submitterHash
    }
    
    // 5. 调用数据库函数执行评价提交操作
    const { data, error } = await supabaseAdmin.rpc(
      'handle_submit_review',
      { review_data: reviewDataWithHash }
    )
    
    // 6. 处理响应
    if (error) {
      console.error('提交评价失败:', error)
      return NextResponse.json<ReviewSubmitResponse>(
        { success: false, error: '处理评价时发生错误' },
        { status: 500 }
      )
    }
    
    // 7. 检查数据库函数的响应
    if (data && !data.success) {
      return NextResponse.json<ReviewSubmitResponse>(
        { success: false, error: data.error || '处理评价时发生错误' },
        { status: 400 }
      )
    }
    
    // 8. 返回成功响应
    return NextResponse.json<ReviewSubmitResponse>(
      { success: true, review_id: data.review_id, message: '评价提交成功' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json<ReviewSubmitResponse>(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 