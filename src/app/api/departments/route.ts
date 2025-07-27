import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * 获取学院列表API
 * 
 * 返回所有学院名称列表，用于筛选
 */
export async function GET() {
  try {
    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // 查询所有不重复的学院名称
    const { data: departments, error } = await supabase
      .from('teachers')
      .select('department')
      .not('department', 'is', null)
      .not('department', 'eq', '')

    if (error) {
      console.error('获取学院列表失败:', error)
      return NextResponse.json(
        { success: false, error: '获取学院列表失败' },
        { status: 500 }
      )
    }

    // 去重并排序
    const uniqueDepartments = Array.from(
      new Set(departments?.map(item => item.department).filter(Boolean))
    ).sort()

    return NextResponse.json({
      success: true,
      departments: uniqueDepartments
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 