/**
 * 评价系统相关类型定义
 */

// 提交评价的请求数据类型
export interface ReviewSubmitData {
  // 必填字段
  teacher_id: string;          // 教师ID (UUID格式)
  rating: number;              // 总体评分 (0.5-5分，步长为0.5)
  does_roll_call: boolean;     // 是否点名
  comment: string;             // 总体评价内容（必填项）
  
  // 可选字段
  course_tags?: CourseTag[];   // 课程标签列表
  course_reviews?: CourseReview[]; // 具体课程评价列表
  submitter_hash?: string;     // 提交者哈希(由服务器生成)
}

// 课程标签
export interface CourseTag {
  course_name: string;         // 课程名称
  course_code?: string;        // 课程代码(可选)
}

// 简化后的课程评价（只使用名称）
export interface CourseReview {
  course_name: string;         // 课程名称
  course_rating: number;       // 课程评分 (0.5-5分，步长为0.5)
  course_comment?: string;     // 课程评价内容
}

// API响应类型
export interface ReviewSubmitResponse {
  success: boolean;
  review_id?: string;          // 成功时返回评价ID
  message?: string;            // 成功时返回的消息
  error?: string;              // 失败时返回的错误信息
}

// 教师信息类型
export interface Teacher {
  id: string;
  name: string;
  department?: string;
  title?: string;
  review_count: number;
  avg_rating: number;
  roll_call_percentage: number;
  created_at: string;
  updated_at: string;
  course_tags?: CourseTagCount[];
  recent_review_count?: number;
}

// 带计数的课程标签
export interface CourseTagCount {
  id: string;
  course_name: string;
  course_code?: string;
  count: number;
}

// 评价类型
export interface Review {
  id: string;
  teacher_id: string;
  rating: number;
  comment: string;
  does_roll_call: boolean;
  upvotes: number;
  downvotes: number;
  submitter_hash?: string;
  created_at: string;
  course_reviews?: CourseReviewDetail[];
}

// 课程评价详情（用于API返回）
export interface CourseReviewDetail {
  id: string;
  review_id: string;
  teacher_id: string;
  course_id: string;
  course_rating: number;
  course_comment?: string;
  created_at: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  error?: string;
} 