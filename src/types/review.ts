/**
 * 评价系统相关类型定义
 */

// 评价提交相关类型
export interface ReviewSubmitData {
  teacher_id: string
  rating: number // 0.5-5分，0.5递增
  does_roll_call: boolean
  comment: string // 必填
  course_tags?: CourseTag[]
  course_reviews?: CourseReview[]
  submitter_hash?: string // 可选的提交者哈希
}

export interface CourseTag {
  course_name: string
}

export interface CourseReview {
  course_name: string
  course_rating: number
  course_comment?: string
}

export interface ReviewSubmitResponse {
  success: boolean
  message?: string
  error?: string
  review_id?: string // 可选的评价ID，成功时返回
}

// 教师相关类型
export interface Teacher {
  id: string
  name: string
  department: string
  title?: string
  avg_rating: number
  review_count: number
  roll_call_percentage: number
  course_tags?: CourseTagCount[]
  recent_review_count?: number
  created_at: string
  updated_at: string
}

export interface CourseTagCount {
  id: string
  course_name: string
  course_code?: string
  count: number
}

// 评价相关类型
export interface Review {
  id: string
  teacher_id: string
  rating: number
  comment: string
  does_roll_call: boolean
  upvotes: number
  downvotes: number
  submitter_hash: string
  created_at: string
  course_reviews?: CourseReviewDetail[]
}

export interface CourseReviewDetail {
  id: string
  review_id: string
  teacher_id: string
  course_id: string
  course_rating: number
  course_comment?: string
  created_at: string
}

// 分页相关类型
export interface PaginatedResponse<T> {
  success: boolean
  data?: T[]
  teachers?: T[] // 兼容教师列表响应
  reviews?: T[] // 兼容评价列表响应
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  error?: string
}

// 教师搜索响应类型
export interface TeacherSearchResponse {
  success: boolean
  teachers: Teacher[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  error?: string
}

// 学院列表响应类型
export interface DepartmentResponse {
  success: boolean
  departments: string[]
  error?: string
} 