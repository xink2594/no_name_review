export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * 评价投票API - 处理赞和踩操作
 * 使用数据库事务和原子操作确保数据一致性
 */
export async function POST(request: Request) {
  try {
    // 解析请求数据
    const { review_id, vote_type } = await request.json()
    
    // 验证必填参数
    if (!review_id) {
      return NextResponse.json(
        { success: false, error: '缺少评价ID' },
        { status: 400 }
      )
    }
    
    if (!['upvote', 'downvote'].includes(vote_type)) {
      return NextResponse.json(
        { success: false, error: '无效的投票类型，必须是 upvote 或 downvote' },
        { status: 400 }
      )
    }
    
    // 创建带有管理员权限的Supabase客户端
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
    
    // 使用数据库函数进行原子操作处理投票
    const { data: updatedReview, error } = await supabaseAdmin.rpc(
      'atomic_vote_operation',
      { 
        p_review_id: review_id, 
        p_vote_type: vote_type 
      }
    )
    
    if (error) {
      console.error('投票操作失败:', error)
      return NextResponse.json(
        { success: false, error: '投票失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: vote_type === 'upvote' ? '点赞成功' : '踩评论成功',
        upvotes: updatedReview[0].upvotes,
        downvotes: updatedReview[0].downvotes
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}