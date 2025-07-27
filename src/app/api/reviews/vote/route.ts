export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * 评价投票API - 处理赞和踩操作
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
    
    // 获取评价当前状态
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('upvotes, downvotes')
      .eq('id', review_id)
      .single()
    
    if (fetchError) {
      return NextResponse.json(
        { success: false, error: '评价不存在或获取失败' },
        { status: 404 }
      )
    }
    
    // 更新投票计数
    let updateData = {}
    if (vote_type === 'upvote') {
      updateData = { upvotes: (review.upvotes || 0) + 1 }
    } else {
      updateData = { downvotes: (review.downvotes || 0) + 1 }
    }
    
    // 执行更新
    const { error: updateError } = await supabaseAdmin
      .from('reviews')
      .update(updateData)
      .eq('id', review_id)
    
    if (updateError) {
      return NextResponse.json(
        { success: false, error: '投票失败' },
        { status: 500 }
      )
    }
    
    // 获取更新后的数据
    const { data: updatedReview } = await supabaseAdmin
      .from('reviews')
      .select('upvotes, downvotes')
      .eq('id', review_id)
      .single()
    
    return NextResponse.json(
      { 
        success: true, 
        message: vote_type === 'upvote' ? '点赞成功' : '踩评论成功',
        upvotes: updatedReview?.upvotes || review.upvotes + (vote_type === 'upvote' ? 1 : 0),
        downvotes: updatedReview?.downvotes || review.downvotes + (vote_type === 'downvote' ? 1 : 0)
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