import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Teacher } from '@/types/review'

/**
 * 教师搜索和筛选API
 * 
 * 支持按姓名搜索和按学院筛选
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 获取查询参数
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '20')
    const sortBy = searchParams.get('sort_by') || 'name' // name, rating, review_count

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // 构建查询
    let query = supabase
      .from('teachers')
      .select('*')

    // 搜索条件：按姓名搜索
    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`)
    }

    // 筛选条件：按学院筛选
    if (department.trim()) {
      query = query.eq('department', department.trim())
    }

    // 排序
    switch (sortBy) {
      case 'rating':
        query = query.order('avg_rating', { ascending: false })
        break
      case 'review_count':
        query = query.order('review_count', { ascending: false })
        break
      case 'name':
      default:
        query = query.order('name', { ascending: true })
        break
    }

    // 分页
    const startIndex = (page - 1) * pageSize
    query = query.range(startIndex, startIndex + pageSize - 1)

    const { data: teachers, error: teachersError } = await query

    if (teachersError) {
      console.error('获取教师列表失败:', teachersError)
      return NextResponse.json(
        { success: false, error: '获取教师列表失败' },
        { status: 500 }
      )
    }

    // 获取总数（用于分页）
    let countQuery = supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true })

    if (search.trim()) {
      countQuery = countQuery.ilike('name', `%${search.trim()}%`)
    }

    if (department.trim()) {
      countQuery = countQuery.eq('department', department.trim())
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('获取教师总数失败:', countError)
    }

    // 构建响应数据
    const totalPages = Math.ceil((totalCount || 0) / pageSize)

    return NextResponse.json({
      success: true,
      teachers: teachers || [],
      pagination: {
        page,
        pageSize,
        totalCount: totalCount || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 