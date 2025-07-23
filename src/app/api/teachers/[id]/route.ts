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
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = params.id

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

    // 2. 获取与教师关联的所有课程标签
    const { data: courseTags, error: courseError } = await supabase
      .from('teacher_course_associations')
      .select(`
        association_count,
        courses:course_id (
          id,
          course_name,
          course_code
        )
      `)
      .eq('teacher_id', teacherId)
      .order('association_count', { ascending: false })

    if (courseError) {
      console.error('获取课程标签失败:', courseError)
    }

    // 3. 格式化课程标签数据
    const formattedCourseTags: CourseTagCount[] = (courseTags || []).map(item => {
      // 使用类型断言处理嵌套结构
      const courses = item.courses as any;
      return {
        id: courses?.id || '',
        course_name: courses?.course_name || '',
        course_code: courses?.course_code,
        count: item.association_count as number
      };
    });

    // 4. 计算最近一周的评价数量
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

    // 5. 构建返回数据
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