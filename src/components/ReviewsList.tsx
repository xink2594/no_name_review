'use client'

import { useState, useMemo, useEffect } from 'react'
import { Review, CourseReviewDetail, CourseTagCount } from '@/types/review'

interface ReviewsListProps {
  allReviews: Review[]  // 改为接收所有评价数据
  teacherId: string
  selectedCourseId?: string
  courseTags?: CourseTagCount[]
}

// 星级评分显示组件（简化版）
function SimpleStarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFullStar = rating >= starIndex
        const isHalfStar = rating >= starIndex - 0.5 && rating < starIndex
        
        return (
          <div key={starIndex} className="relative w-4 h-4">
            {/* 背景星星 */}
          <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            
            {/* 完整星星 */}
            {isFullStar && (
              <svg className="absolute inset-0 w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07 3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
      )}
            
            {/* 半星 */}
            {isHalfStar && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
              </div>
            )}
          </div>
        )
      })}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  )
}

// 课程筛选组件（不使用路由跳转）
function CourseFilter({ 
  courseTags, 
  selectedCourseId, 
  onFilterChange 
}: { 
  courseTags: CourseTagCount[], 
  selectedCourseId?: string, 
  onFilterChange: (courseId?: string) => void
}) {
  if (!courseTags || courseTags.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
        <h3 className="text-sm font-medium text-gray-700">按课程筛选评价</h3>
        {selectedCourseId && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            已筛选
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* 全部评价按钮 */}
        <button
          onClick={() => onFilterChange(undefined)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            !selectedCourseId
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>全部评价</span>
          </div>
        </button>
        
        {/* 课程筛选按钮 */}
        {courseTags.map((course) => (
          <button
            key={course.id}
            onClick={() => onFilterChange(course.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCourseId === course.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{course.course_name}</span>
              <span className="bg-white bg-opacity-20 text-xs px-1.5 py-0.5 rounded">
                {course.count}
              </span>
            </div>
          </button>
        ))}
      </div>
      
      {selectedCourseId && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            正在显示特定课程的评价。点击"全部评价"查看该教师的所有评价。
          </p>
        </div>
      )}
    </div>
  )
}

// 投票按钮组件
function VoteButtons({ reviewId, upvotes, downvotes }: { reviewId: string, upvotes: number, downvotes: number }) {
  const [votes, setVotes] = useState({ upvotes, downvotes })
  const [voting, setVoting] = useState(false)

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (voting) return
    
    setVoting(true)
    try {
      const response = await fetch('/api/reviews/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId, vote_type: voteType })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVotes({ upvotes: data.upvotes, downvotes: data.downvotes })
        } else {
          console.error('投票失败:', data.error)
        }
      }
    } catch (error) {
      console.error('投票失败:', error)
    } finally {
      setVoting(false)
    }
  }

  const agreeCount = votes.upvotes - votes.downvotes

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleVote('upvote')}
        disabled={voting}
        className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      </button>
      
      <button
        onClick={() => handleVote('downvote')}
        disabled={voting}
        className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
      </button>

      <div className="flex items-center gap-1 text-sm text-gray-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>{agreeCount}人同意</span>
      </div>
    </div>
  )
}

// 单个评价组件
function ReviewItem({ 
  review, 
  selectedCourseId, 
  courseTags 
}: { 
  review: Review, 
  selectedCourseId?: string,
  courseTags: CourseTagCount[]
}) {
  // 过滤课程评价（如果有选中的课程）
  const filteredCourseReviews = selectedCourseId 
    ? review.course_reviews?.filter(cr => cr.course_id === selectedCourseId) || []
    : review.course_reviews || []

  // 根据course_id查找课程名的函数
  const getCourseNameById = (courseId: string) => {
    const course = courseTags.find(tag => tag.id === courseId)
    return course?.course_name || '未知课程'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* 总体评价 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <SimpleStarRating rating={review.rating} />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {review.does_roll_call ? (
                <>
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>会点名</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>不点名</span>
                </>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
        </div>
        
        {review.comment && (
          <p className="text-gray-800 leading-relaxed mb-3">{review.comment}</p>
        )}
      </div>

      {/* 课程评价 */}
      {filteredCourseReviews.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">课程评价：</h4>
          <div className="space-y-3">
            {filteredCourseReviews.map((courseReview) => (
              <div key={courseReview.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <SimpleStarRating rating={courseReview.course_rating} />
                  <span className="text-sm font-medium text-gray-700">
                    {getCourseNameById(courseReview.course_id)}
                  </span>
                </div>
                {courseReview.course_comment && (
                  <p className="text-sm text-gray-600">{courseReview.course_comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 投票按钮 */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
        <VoteButtons 
          reviewId={review.id} 
          upvotes={review.upvotes} 
          downvotes={review.downvotes} 
        />
        
        <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          举报
        </button>
      </div>
    </div>
  )
}

export default function ReviewsList({ allReviews, teacherId, selectedCourseId: initialSelectedCourseId, courseTags = [] }: ReviewsListProps) {
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(initialSelectedCourseId)
  const reviewsPerPage = 10

  // 前端筛选逻辑
  const filteredReviews = useMemo(() => {
    if (!selectedCourseId) {
      return allReviews
    }

    // 筛选包含指定课程评价的评价
    return allReviews.filter(review => {
      return review.course_reviews?.some(cr => cr.course_id === selectedCourseId)
    })
  }, [allReviews, selectedCourseId])

  // 排序逻辑
  const sortedReviews = useMemo(() => {
    const reviews = [...filteredReviews]
    
    switch (sortBy) {
      case 'recent':
        return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'helpful':
        return reviews.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      case 'rating_high':
        return reviews.sort((a, b) => b.rating - a.rating)
      case 'rating_low':
        return reviews.sort((a, b) => a.rating - b.rating)
      default:
        return reviews
    }
  }, [filteredReviews, sortBy])

  // 分页逻辑
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage)
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage
    return sortedReviews.slice(startIndex, startIndex + reviewsPerPage)
  }, [sortedReviews, currentPage, reviewsPerPage])

  // 当筛选条件改变时重置到第一页
  useMemo(() => {
    setCurrentPage(1)
  }, [selectedCourseId, sortBy])

  // 处理筛选变化
  const handleFilterChange = (courseId?: string) => {
    setSelectedCourseId(courseId)
    setCurrentPage(1)
  }

  if (filteredReviews.length === 0) {
    return (
      <>
        {/* 课程筛选组件 */}
        <CourseFilter 
          courseTags={courseTags}
          selectedCourseId={selectedCourseId}
          onFilterChange={handleFilterChange}
        />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价</h3>
            <p className="text-gray-500 mb-6">
              {selectedCourseId ? '该课程暂无评价' : '这位教师暂无评价'}
            </p>
            <a
              href={`/submit-review?teacher_id=${teacherId}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              成为第一个评价的人
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* 课程筛选组件 */}
      <CourseFilter 
        courseTags={courseTags}
        selectedCourseId={selectedCourseId}
        onFilterChange={handleFilterChange}
      />
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          学生评价 ({filteredReviews.length})
          {selectedCourseId && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              - 已筛选特定课程
            </span>
          )}
        </h2>
        
        {/* 排序选择 */}
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white"
        >
          <option value="recent">最新评价</option>
          <option value="helpful">最有帮助</option>
          <option value="rating_high">评分最高</option>
          <option value="rating_low">评分最低</option>
        </select>
      </div>
      
      {/* 评价列表 */}
      <div className="space-y-4">
        {paginatedReviews.map((review) => (
          <ReviewItem 
            key={review.id} 
            review={review} 
            selectedCourseId={selectedCourseId}
            courseTags={courseTags}
          />
        ))}
      </div>
      
      {/* 分页组件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}
      
      {/* 分页信息 */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-500">
          显示第 {((currentPage - 1) * reviewsPerPage) + 1} - {Math.min(currentPage * reviewsPerPage, filteredReviews.length)} 条，
          共 {filteredReviews.length} 条评价
        </div>
      )}
    </div>
  )
} 