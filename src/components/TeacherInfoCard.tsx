'use client'

import { Teacher } from '@/types/review'
import { useState } from 'react'

interface TeacherInfoCardProps {
  teacher: Teacher
}

// 星级评分组件
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFullStar = rating >= starIndex
        const isHalfStar = rating >= starIndex - 0.5 && rating < starIndex
        
        return (
          <div key={starIndex} className="relative w-5 h-5">
            {/* 背景星星 */}
            <svg className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            
            {/* 完整星星 */}
            {isFullStar && (
              <svg className="absolute inset-0 w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
            
            {/* 半星 */}
            {isHalfStar && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TeacherInfoCard({ teacher }: TeacherInfoCardProps) {
  const [showAllTags, setShowAllTags] = useState(false)
  
  // 显示的课程标签数量
  const displayTags = showAllTags ? teacher.course_tags : teacher.course_tags?.slice(0, 5)
  const hasMoreTags = teacher.course_tags && teacher.course_tags.length > 5

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 教师基本信息 - 重新设计布局 */}
      <div className="flex items-start justify-between mb-6">
        {/* 左侧信息 */}
        <div className="flex-1 min-w-0 mr-4">
          {/* 教师姓名 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{teacher.name}</h1>
          
          {/* 院系和职称 - 纵向排列 */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{teacher.department}</span>
            </div>
            {teacher.title && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{teacher.title}</span>
              </div>
            )}
          </div>

          {/* 点名率信息 */}
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4a2 2 0 002 2h2a2 2 0 002-2v-4m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2v6a2 2 0 01-2 2" />
            </svg>
            <span className="text-sm">
              {Math.round(teacher.roll_call_percentage)}%的人认为会点名
            </span>
          </div>
        </div>
        
        {/* 右上角评分信息 */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center justify-end mb-2">
            <StarRating rating={teacher.avg_rating} />
          </div>
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {teacher.review_count}人进行了评价
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${teacher.name} - 教师评价`,
                text: `查看${teacher.name}（${teacher.department}）的学生评价。平均评分：${teacher.avg_rating}分，${teacher.review_count}条评价。`,
                url: window.location.href
              }).catch(console.error)
            } else {
              // 复制链接到剪贴板
              navigator.clipboard.writeText(window.location.href).then(() => {
                alert('链接已复制到剪贴板')
              }).catch(() => {
                alert('分享失败，请手动复制地址栏链接')
              })
            }
          }}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          分享
        </button>
        <a
          href={`/submit-review?teacher_id=${teacher.id}`}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          写评价
        </a>
      </div>

      {/* 课程标签 */}
      {teacher.course_tags && teacher.course_tags.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">相关课程</h3>
            {hasMoreTags && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showAllTags ? '收起' : `查看全部 ${teacher.course_tags.length} 个`}
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {displayTags?.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <span>{tag.course_name}</span>
                <span className="bg-blue-200 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                  {tag.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 