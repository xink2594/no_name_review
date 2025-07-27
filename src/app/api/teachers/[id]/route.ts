import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { CourseTagCount } from '@/types/review'

/**
 * 获取单个教师详细信息的API路由
 * 
 * 返回教师基本信息、统计数据及相关课程标签
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 正确地await动态路由参数
    const resolvedParams = await params
    const teacherId = resolvedParams.id

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: '缺少教师ID' },
        { status: 400 }
      )
    }

    // 创建Supabase客户端 (这里使用匿名客户端即可，因为只是读取操作)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // 1. 获取教师基本信息和统计数据
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .single()

    if (teacherError || !teacherData) {
      return NextResponse.json(
        { success: false, error: '找不到该教师' },
        { status: 404 }
      )
    }

    // 2. 分别查询教师课程关联和课程详情
    const { data: associations, error: associationError } = await supabase
      .from('teacher_course_associations')
      .select('course_id, association_count')
      .eq('teacher_id', teacherId)
      .order('association_count', { ascending: false })

    if (associationError) {
      console.error('获取教师课程关联失败:', associationError)
    }

    let formattedCourseTags: CourseTagCount[] = []

    if (associations && associations.length > 0) {
      // 获取所有相关课程的详情
      const courseIds = associations.map(item => item.course_id)
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, course_name, course_code')
        .in('id', courseIds)

      if (coursesError) {
        console.error('获取课程详情失败:', coursesError)
      } else if (courses) {
        // 组合数据
        formattedCourseTags = associations.map(association => {
          const course = courses.find(c => c.id === association.course_id)
          return {
            id: association.course_id,
            course_name: course?.course_name || '未知课程',
            course_code: course?.course_code,
            count: association.association_count
          }
        }).filter(item => item.course_name !== '未知课程') // 过滤掉找不到详情的课程
      }
    }

    // 3. 计算最近一周的评价数量
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { count: recentReviewCount, error: recentError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .gte('created_at', oneWeekAgo.toISOString())

    if (recentError) {
      console.error('获取最近评价数量失败:', recentError)
    }

    // 4. 构建返回数据
    const teacherInfo = {
      ...teacherData,
      course_tags: formattedCourseTags,
      recent_review_count: recentReviewCount || 0
    }

    return NextResponse.json(
      { 
        success: true, 
        teacher: teacherInfo
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