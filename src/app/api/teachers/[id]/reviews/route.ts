import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * 获取教师评价列表的API路由
 * 
 * 支持按课程筛选，分页以及时间排序
 */
export async function GET(request: Request) {
  try {
    // 从URL中直接获取ID，避免使用context.params
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const teacherId = pathParts[pathParts.length - 2] // 获取倒数第二部分作为ID
    const { searchParams } = url
    
    // 获取查询参数
    const courseId = searchParams.get('course_id') || null
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '10')
    const orderByRecent = searchParams.get('order_by_recent') !== 'false' // 默认按最新排序
    
    // 计算分页
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: '缺少教师ID' },
        { status: 400 }
      )
    }

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // 修改查询方式：不使用嵌套查询，而是分别查询
    let reviewsQuery = supabase
      .from('reviews')
      .select('*')
      .eq('teacher_id', teacherId)
    
    // 排序
    if (orderByRecent) {
      reviewsQuery = reviewsQuery.order('created_at', { ascending: false })
    } else {
      reviewsQuery = reviewsQuery.order('upvotes', { ascending: false })
    }
    
    // 如果提供了课程ID，我们需要先获取包含该课程的评价ID列表
    let reviewIds: string[] = []
    if (courseId) {
      const { data: courseReviewsData, error: courseReviewsError } = await supabase
        .from('course_reviews')
        .select('review_id')
        .eq('course_id', courseId)
        .eq('teacher_id', teacherId)
      
      if (courseReviewsError) {
        console.error('获取课程评价失败:', courseReviewsError)
        return NextResponse.json(
          { success: false, error: '获取课程评价失败' },
          { status: 500 }
        )
      }
      
      // 从结果中提取评价ID并添加到查询中
      reviewIds = courseReviewsData.map(item => item.review_id)
      if (reviewIds.length === 0) {
        // 如果没有找到评价，返回空数组
        return NextResponse.json(
          { 
            success: true, 
            reviews: [],
            pagination: {
              page,
              page_size: pageSize,
              total: 0,
              total_pages: 0
            }
          },
          { status: 200 }
        )
      }
      
      reviewsQuery = reviewsQuery.in('id', reviewIds)
    }
    
    // 获取总数 - 使用正确的方法
    let totalCount = 0
    
    if (courseId && reviewIds.length > 0) {
      totalCount = reviewIds.length
    } else {
      const { data, error: countError } = await supabase
        .from('reviews')
        .select('id', { count: 'exact' })
        .eq('teacher_id', teacherId)
      
      if (countError) {
        console.error('获取评价数量失败:', countError)
      } else {
        totalCount = data.length
      }
    }
    
    // 应用分页
    reviewsQuery = reviewsQuery.range(from, to)
    
    // 执行评价查询
    const { data: reviewsData, error: reviewsError } = await reviewsQuery
    
    if (reviewsError) {
      console.error('获取评价失败:', reviewsError)
      return NextResponse.json(
        { success: false, error: '获取评价失败' },
        { status: 500 }
      )
    }
    
    // 对于每个评价，查询其关联的课程评价
    const reviewsWithCourseReviews = await Promise.all(
      (reviewsData || []).map(async (review) => {
        const { data: courseReviews, error: courseReviewsError } = await supabase
          .from('course_reviews')
          .select('*')
          .eq('review_id', review.id)
        
        if (courseReviewsError) {
          console.error(`获取评价ID ${review.id} 的课程评价失败:`, courseReviewsError)
        }
        
        return {
          ...review,
          course_reviews: courseReviews || []
        }
      })
    )
    
    return NextResponse.json(
      { 
        success: true, 
        reviews: reviewsWithCourseReviews,
        pagination: {
          page,
          page_size: pageSize,
          total: totalCount,
          total_pages: Math.ceil(totalCount / pageSize)
        }
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