import { Teacher, Review, ReviewSubmitData, ReviewSubmitResponse } from '@/types/review'

// API工具函数
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.error || '请求失败', response.status)
  }

  return data
}

// 教师相关API
export const teacherApi = {
  // 获取单个教师信息
  getById: (id: string) =>
    apiCall(`/api/teachers/${id}`),

  // 搜索教师列表
  search: (params?: {
    search?: string
    department?: string
    page?: number
    page_size?: number
    sort_by?: 'name' | 'rating' | 'review_count'
  }) => {
    const queryParams = new URLSearchParams()
    
    if (params?.search) queryParams.append('search', params.search)
    if (params?.department) queryParams.append('department', params.department)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)

    const queryString = queryParams.toString()
    return apiCall(`/api/teachers${queryString ? `?${queryString}` : ''}`)
  },

  // 获取教师评价列表
  getReviews: (id: string, params?: {
    course_id?: string
    page?: number
    page_size?: number
    order_by_recent?: boolean
  }) => {
    const queryParams = new URLSearchParams()
    
    if (params?.course_id) queryParams.append('course_id', params.course_id)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params?.order_by_recent) queryParams.append('order_by_recent', 'true')

    const queryString = queryParams.toString()
    return apiCall(`/api/teachers/${id}/reviews${queryString ? `?${queryString}` : ''}`)
  }
}

// 评价相关API
export const reviewApi = {
  // 提交评价
  submit: (data: any) =>
    apiCall('/api/submit-review', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 评价投票
  vote: (reviewId: string, voteType: 'upvote' | 'downvote') =>
    apiCall('/api/reviews/vote', {
      method: 'POST',
      body: JSON.stringify({
        review_id: reviewId,
        vote_type: voteType,
      }),
    }),
}

// 课程相关API
export const courseApi = {
  // 获取课程列表
  getList: (params?: {
    search?: string
    page?: number
    page_size?: number
    sort_by?: 'popularity' | 'name'
  }) => {
    const queryParams = new URLSearchParams()
    
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)

    const queryString = queryParams.toString()
    return apiCall(`/api/courses${queryString ? `?${queryString}` : ''}`)
  }
}

// 系统相关API
export const systemApi = {
  // 获取学院列表
  getDepartments: () =>
    apiCall('/api/departments'),
}

// 工具函数
export const utils = {
  // 格式化日期
  formatDate: (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  },

  // 格式化相对时间
  formatRelativeTime: (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return '刚刚'
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} 分钟前`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} 小时前`
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} 天前`
    } else {
      return utils.formatDate(dateString)
    }
  },

  // 格式化评分
  formatRating: (rating: number) => {
    return rating.toFixed(1)
  },
} 