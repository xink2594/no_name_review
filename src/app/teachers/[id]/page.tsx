import { notFound } from 'next/navigation'
import { Teacher, Review } from '@/types/review'
import TeacherInfoCard from '@/components/TeacherInfoCard'
import ReviewsList from '@/components/ReviewsList'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 获取教师信息
async function getTeacherData(id: string): Promise<Teacher | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/teachers/${id}`, {
      cache: 'no-store', // 确保获取最新数据
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('获取教师数据失败')
    }
    
    const data = await response.json()
    return data.success ? data.teacher : null
  } catch (error) {
    console.error('获取教师数据时出错:', error)
    throw error
  }
}

// 获取教师所有评价列表（不进行课程筛选，一次性获取所有数据）
async function getAllTeacherReviews(id: string): Promise<Review[]> {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/teachers/${id}/reviews`)
    
    // 获取所有评价，不进行课程筛选
    url.searchParams.append('page_size', '100') // 增加页面大小，一次性获取更多数据
    
    const response = await fetch(url.toString(), {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error('获取评价数据失败')
    }
    
    const data = await response.json()
    return data.success ? data.reviews : []
  } catch (error) {
    console.error('获取评价数据时出错:', error)
    return []
  }
}

export default async function TeacherDetailPage({ params }: PageProps) {
  // 正确地await动态路由参数
  const resolvedParams = await params
  const teacherId = resolvedParams.id

  try {
    // 并行获取教师信息和所有评价数据
    const [teacherData, allReviews] = await Promise.all([
      getTeacherData(teacherId),
      getAllTeacherReviews(teacherId)
    ])

    // 如果教师不存在，显示404页面
    if (!teacherData) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 教师信息卡片 */}
          <TeacherInfoCard 
            teacher={teacherData}
          />
          
          {/* 评价列表 - 传入所有评价数据，完全在前端进行筛选 */}
          <div className="mt-8">
            <ReviewsList 
              allReviews={allReviews}
              teacherId={teacherId}
              courseTags={teacherData.course_tags || []}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    // 错误状态
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">加载失败</h3>
            <p className="text-red-600">
              无法加载教师信息，请稍后重试。
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }
}

// 生成页面元数据
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const teacherData = await getTeacherData(resolvedParams.id)
    
    if (!teacherData) {
      return {
        title: '教师未找到',
        description: '抱歉，未找到该教师信息。'
      }
    }

    return {
      title: `${teacherData.name} - 教师评价`,
      description: `查看${teacherData.name}（${teacherData.department}）的学生评价和教学信息。平均评分：${teacherData.avg_rating}分`
    }
  } catch {
    return {
      title: '教师评价',
      description: '查看教师的学生评价和教学信息。'
    }
  }
} 