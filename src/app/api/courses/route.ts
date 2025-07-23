import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * 获取课程列表的API路由
 * 
 * 支持搜索、分页和排序
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 获取查询参数
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '20')
    const orderByPopularity = searchParams.get('order_by_popularity') === 'true'
    
    // 计算分页
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // 构建查询
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
    
    // 如果有搜索词，添加搜索条件
    if (search) {
      query = query.ilike('course_name', `%${search}%`)
    }
    
    // 排序
    if (orderByPopularity) {
      // 按关联次数排序需要连接teacher_course_associations表
      // 这里我们先查出课程IDs，然后再查询详情
      const { data: popularCourses } = await supabase
        .from('teacher_course_associations')
        .select('course_id')
        .order('association_count', { ascending: false })
        .limit(100) // 限制数量避免性能问题
      
      if (popularCourses && popularCourses.length > 0) {
        const courseIds = popularCourses.map(item => item.course_id)
        // 使用IN查询并按照course_name排序
        query = query.in('id', courseIds)
      }
      // 然后按名称排序 (当无法保持关联排序时的后备方案)
      query = query.order('course_name')
    } else {
      // 默认按课程名称排序
      query = query.order('course_name')
    }
    
    // 应用分页
    query = query.range(from, to)
    
    // 执行查询
    const { data: courses, error, count } = await query

    if (error) {
      console.error('获取课程失败:', error)
      return NextResponse.json(
        { success: false, error: '获取课程失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        courses: courses || [],
        pagination: {
          page,
          page_size: pageSize,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / pageSize)
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