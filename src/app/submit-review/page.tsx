'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Teacher, CourseTagCount } from '@/types/review'

// 防重复提交工具函数
const SUBMIT_COOLDOWN = 300000 // 5分钟冷却时间（测试期间）
const STORAGE_KEY = 'teacher_review_submissions'

interface SubmissionRecord {
  teacherId: string
  timestamp: number
  fingerprint: string
}

// 生成设备指纹
function generateDeviceFingerprint(): string {
  try {
    // 确保在浏览器环境中
    if (typeof window === 'undefined') {
      return 'server-side'
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    let canvasFingerprint = ''
    
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint canvas', 2, 2)
      canvasFingerprint = canvas.toDataURL().slice(-20)
    }
    
    const fingerprint = [
      navigator.userAgent || '',
      navigator.language || '',
      screen.width || 0,
      screen.height || 0,
      new Date().getTimezoneOffset() || 0,
      canvasFingerprint,
      navigator.platform || '',
      navigator.cookieEnabled ? '1' : '0'
    ].join('|')
    
    // 简单哈希
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    const result = hash.toString(36)
    console.log('生成设备指纹:', result.slice(0, 10) + '...')
    return result
  } catch (error) {
    console.error('生成设备指纹失败:', error)
    return 'fallback-' + Date.now().toString(36)
  }
}

// 检查是否允许提交
function canSubmitReview(teacherId: string): { allowed: boolean; remainingTime?: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const submissions: SubmissionRecord[] = stored ? JSON.parse(stored) : []
    const currentFingerprint = generateDeviceFingerprint()
    const now = Date.now()
    
    console.log('防重复提交检查:', {
      teacherId,
      currentFingerprint,
      storedSubmissions: submissions.length,
      cooldownMs: SUBMIT_COOLDOWN
    })
    
    // 清理过期记录
    const validSubmissions = submissions.filter(sub => {
      const isValid = now - sub.timestamp < SUBMIT_COOLDOWN
      if (!isValid) {
        console.log('清理过期记录:', sub)
      }
      return isValid
    })
    
    // 检查是否有相同教师和设备的最近提交
    const recentSubmission = validSubmissions.find(sub => 
      sub.teacherId === teacherId && sub.fingerprint === currentFingerprint
    )
    
    if (recentSubmission) {
      const remainingTime = SUBMIT_COOLDOWN - (now - recentSubmission.timestamp)
      console.log('发现重复提交:', {
        submission: recentSubmission,
        remainingTime,
        remainingMinutes: Math.ceil(remainingTime / 60000)
      })
      return { allowed: false, remainingTime }
    }
    
    // 更新存储
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validSubmissions))
    console.log('允许提交')
    return { allowed: true }
  } catch (error) {
    console.error('检查提交权限失败:', error)
    return { allowed: true } // 发生错误时允许提交
  }
}

// 记录提交
function recordSubmission(teacherId: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage不可用，无法记录提交')
      return
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    const submissions: SubmissionRecord[] = stored ? JSON.parse(stored) : []
    const currentFingerprint = generateDeviceFingerprint()
    const now = Date.now()
    
    // 添加新记录
    const newRecord = {
      teacherId,
      timestamp: now,
      fingerprint: currentFingerprint
    }
    
    submissions.push(newRecord)
    
    console.log('记录新提交:', {
      teacherId,
      提交时间: new Date(now).toLocaleString(),
      设备指纹: currentFingerprint,
      冷却结束时间: new Date(now + SUBMIT_COOLDOWN).toLocaleString()
    })
    
    // 清理过期记录
    const validSubmissions = submissions.filter(sub => now - sub.timestamp < SUBMIT_COOLDOWN)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validSubmissions))
    console.log('当前有效提交记录数:', validSubmissions.length)
  } catch (error) {
    console.error('记录提交失败:', error)
  }
}

// 星级评分组件
function StarRating({ 
  rating, 
  onChange, 
  size = 'normal',
  readonly = false 
}: { 
  rating: number
  onChange?: (rating: number) => void
  size?: 'normal' | 'small'
  readonly?: boolean
}) {
  const starSize = size === 'small' ? 'w-5 h-5' : 'w-8 h-8'
  const [hoverRating, setHoverRating] = useState(0)
  
  const handleStarClick = (starIndex: number, isHalf: boolean) => {
    if (readonly || !onChange) return
    const newRating = isHalf ? starIndex - 0.5 : starIndex
    onChange(newRating)
  }

  const handleStarHover = (starIndex: number, isHalf: boolean) => {
    if (readonly) return
    const newRating = isHalf ? starIndex - 0.5 : starIndex
    setHoverRating(newRating)
  }

  const displayRating = hoverRating || rating
  
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFullStar = displayRating >= starIndex
        const isHalfStar = displayRating >= starIndex - 0.5 && displayRating < starIndex
        
        return (
          <div key={starIndex} className="relative">
            <button
              type="button"
              disabled={readonly}
              className={`${starSize} transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
              onMouseEnter={() => handleStarHover(starIndex, false)}
              onClick={() => handleStarClick(starIndex, false)}
            >
              <svg 
                fill={isFullStar ? '#FBBF24' : '#D1D5DB'} 
                viewBox="0 0 20 20"
                className="transition-colors"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            
            {/* 半星按钮 */}
            {!readonly && (
              <button
                type="button"
                className="absolute inset-0 w-1/2 z-10"
                onMouseEnter={() => handleStarHover(starIndex, true)}
                onClick={() => handleStarClick(starIndex, true)}
              />
            )}
            
            {/* 半星显示 */}
            {isHalfStar && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <svg 
                  fill="#FBBF24" 
                  viewBox="0 0 20 20"
                  className={`${starSize} transition-colors`}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
        )
      })}
      <span className="ml-2 text-sm text-gray-600">{rating}分</span>
    </div>
  )
}

// 课程标签选择组件
function CourseTagSelector({
  courseTags,
  selectedTags,
  onTagsChange,
  onNewTag
}: {
  courseTags: CourseTagCount[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onNewTag: (tagName: string) => void
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagName))
    } else {
      onTagsChange([...selectedTags, tagName])
    }
  }

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      onNewTag(newTagName.trim())
      onTagsChange([...selectedTags, newTagName.trim()])
      setNewTagName('')
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {courseTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleTagToggle(tag.course_name)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTags.includes(tag.course_name)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tag.course_name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              selectedTags.includes(tag.course_name)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {tag.count}
            </span>
          </button>
        ))}
      </div>

      {/* 添加新课程标签 */}
      {showAddForm ? (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="输入课程名称"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
          />
          <button
            type="button"
            onClick={handleAddNewTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            添加
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(false)
              setNewTagName('')
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加新课程
        </button>
      )}
    </div>
  )
}

function SubmitReviewForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const teacherId = searchParams.get('teacher_id')

  // 状态管理
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 表单数据
  const [formData, setFormData] = useState({
    rating: 0,
    does_roll_call: false,
    comment: '',
    selectedCourses: [] as string[],
    enableCourseReviews: true,
    courseReviews: {} as Record<string, { rating: number; comment: string }>
  })

  // 调试信息状态
  const [debugInfo, setDebugInfo] = useState<{
    fingerprint: string
    submissions: SubmissionRecord[]
    canSubmit: boolean
    remainingTime?: number
  } | null>(null)

  // 更新调试信息
  const updateDebugInfo = () => {
    if (!teacherId) return
    
    try {
      const fingerprint = generateDeviceFingerprint()
      const stored = localStorage.getItem(STORAGE_KEY)
      const submissions: SubmissionRecord[] = stored ? JSON.parse(stored) : []
      const submitCheck = canSubmitReview(teacherId)
      
      setDebugInfo({
        fingerprint,
        submissions: submissions.filter(sub => sub.teacherId === teacherId),
        canSubmit: submitCheck.allowed,
        remainingTime: submitCheck.remainingTime
      })
    } catch (error) {
      console.error('更新调试信息失败:', error)
    }
  }

  // 初始化时更新调试信息
  useEffect(() => {
    if (teacherId) {
      updateDebugInfo()
      // 每5秒更新一次调试信息
      const interval = setInterval(updateDebugInfo, 5000)
      return () => clearInterval(interval)
    }
  }, [teacherId])

  // 获取教师信息
  useEffect(() => {
    if (!teacherId) {
      router.push('/')
      return
    }

    const fetchTeacher = async () => {
      try {
        const response = await fetch(`/api/teachers/${teacherId}`)
        const data = await response.json()
        if (data.success) {
          setTeacher(data.teacher)
        } else {
          throw new Error('获取教师信息失败')
        }
      } catch (error) {
        console.error('获取教师信息失败:', error)
        alert('获取教师信息失败，请重试')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [teacherId, router])

  // 处理课程选择变化
  const handleCourseSelectionChange = (courses: string[]) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: courses,
      // 为新选择的课程添加默认评价数据
      courseReviews: {
        ...prev.courseReviews,
        ...courses.reduce((acc, course) => {
          if (!prev.courseReviews[course]) {
            acc[course] = { rating: 0, comment: '' }
          }
          return acc
        }, {} as Record<string, { rating: number; comment: string }>)
      }
    }))
  }

  // 添加新课程标签
  const handleNewTag = (tagName: string) => {
    // 这里暂时只是本地添加，实际提交时会通过API创建
    console.log('添加新课程标签:', tagName)
  }

  // 更新课程评价
  const updateCourseReview = (courseName: string, field: 'rating' | 'comment', value: number | string) => {
    setFormData(prev => ({
      ...prev,
      courseReviews: {
        ...prev.courseReviews,
        [courseName]: {
          ...prev.courseReviews[courseName],
          [field]: value
        }
      }
    }))
  }

  // 提交评价
  const handleSubmit = async () => {
    // 防重复提交检查
    console.log('开始提交检查，教师ID:', teacherId)
    const submitCheck = canSubmitReview(teacherId!)
    console.log('提交检查结果:', submitCheck)
    
    if (!submitCheck.allowed) {
      const remainingSeconds = Math.ceil((submitCheck.remainingTime || 0) / 1000)
      const remainingMinutes = Math.ceil(remainingSeconds / 60)
      alert(`请稍后再试，您需要等待 ${remainingSeconds} 秒（约 ${remainingMinutes} 分钟）后才能再次评价该教师`)
      return
    }

    // 表单验证
    if (formData.rating === 0) {
      alert('请选择整体评分')
      return
    }

    setSubmitting(true)
    try {
      const submitData = {
        teacher_id: teacherId,
        rating: formData.rating,
        does_roll_call: formData.does_roll_call,
        comment: formData.comment,
        course_reviews: formData.enableCourseReviews && formData.selectedCourses.length > 0
          ? formData.selectedCourses
              .filter(course => formData.courseReviews[course]?.rating > 0)
              .map(course => ({
                type: 'name',
                course_name: course,
                course_rating: formData.courseReviews[course].rating,
                course_comment: formData.courseReviews[course].comment
              }))
          : []
      }

      const response = await fetch('/api/submit-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()
      if (result.success) {
        // 记录成功提交
        recordSubmission(teacherId!)
        alert('评价提交成功！')
        router.push(`/teachers/${teacherId}`)
      } else {
        throw new Error(result.error || '提交失败')
      }
    } catch (error) {
      console.error('提交评价失败:', error)
      alert('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">教师信息不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">评价教师</h1>
              <p className="text-gray-600 mt-1">请如实填写您对该教师的评价</p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
              <p className="text-sm text-gray-600">{teacher.department}</p>
              {teacher.title && (
                <p className="text-sm text-gray-600">{teacher.title}</p>
              )}
            </div>
          </div>
        </div>

        {/* 评价表单 */}
        <div className="space-y-6">
          {/* 步骤1: 教师总体评价 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              1. 教师总体评价 <span className="text-red-500">*</span>
            </h2>
            
            <div className="space-y-6">
              {/* 综合评分 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  综合评分 <span className="text-red-500">*</span>
                </label>
                <StarRating
                  rating={formData.rating}
                  onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                />
              </div>

              {/* 点名行为 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  该教师是否点名？ <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="roll_call"
                      checked={formData.does_roll_call === true}
                      onChange={() => setFormData(prev => ({ ...prev, does_roll_call: true }))}
                      className="mr-2"
                    />
                    是，会点名
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="roll_call"
                      checked={formData.does_roll_call === false}
                      onChange={() => setFormData(prev => ({ ...prev, does_roll_call: false }))}
                      className="mr-2"
                    />
                    否，不点名
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 步骤2: 关联课程标签 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              2. 关联课程标签 <span className="text-gray-500">(选填)</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              选择您评价的具体课程，可以帮助其他学生更好地了解该教师在不同课程中的表现
            </p>
            
            <CourseTagSelector
              courseTags={teacher.course_tags || []}
              selectedTags={formData.selectedCourses}
              onTagsChange={handleCourseSelectionChange}
              onNewTag={handleNewTag}
            />
          </div>

          {/* 步骤3: 教师文本评价 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              3. 教师文本评价 <span className="text-gray-500">(选填)</span>
            </h2>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="请分享您对该教师的具体评价，如教学方式、课程难度、作业情况等..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              请文明用语，客观公正地评价教师
            </p>
          </div>

          {/* 步骤4: 单独课程评价 */}
          {formData.selectedCourses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  4. 单独课程评价 <span className="text-gray-500">(选填)</span>
                </h2>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.enableCourseReviews}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableCourseReviews: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">启用课程评价</span>
                </label>
              </div>

              {formData.enableCourseReviews && (
                <div className="space-y-6">
                  {formData.selectedCourses.map((courseName) => (
                    <div key={courseName} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">{courseName}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            课程评分
                          </label>
                          <StarRating
                            rating={formData.courseReviews[courseName]?.rating || 0}
                            onChange={(rating) => updateCourseReview(courseName, 'rating', rating)}
                            size="small"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            课程评价
                          </label>
                          <textarea
                            value={formData.courseReviews[courseName]?.comment || ''}
                            onChange={(e) => updateCourseReview(courseName, 'comment', e.target.value)}
                            placeholder={`请评价该教师在《${courseName}》课程中的表现...`}
                            className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 调试面板 */}
          {debugInfo && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">防重复提交状态</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p><strong>设备指纹:</strong> {debugInfo.fingerprint}</p>
                  <p><strong>提交状态:</strong> 
                    <span className={debugInfo.canSubmit ? 'text-green-600' : 'text-red-600'}>
                      {debugInfo.canSubmit ? ' ✓ 允许提交' : ' ✗ 限制中'}
                    </span>
                  </p>
                  {debugInfo.remainingTime && (
                    <p><strong>剩余冷却:</strong> {Math.ceil(debugInfo.remainingTime / 1000)}秒</p>
                  )}
                </div>
                <div>
                  <p><strong>该教师提交记录:</strong> {debugInfo.submissions.length}条</p>
                  {debugInfo.submissions.length > 0 && (
                    <div className="mt-1">
                      {debugInfo.submissions.map((sub, index) => (
                        <p key={index} className="text-gray-600">
                          {new Date(sub.timestamp).toLocaleString()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={updateDebugInfo}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                刷新状态
              </button>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || formData.rating === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '提交中...' : '提交评价'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SubmitReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <SubmitReviewForm />
    </Suspense>
  )
} 