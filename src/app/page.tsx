'use client'
export const runtime = 'edge';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Teacher, TeacherSearchResponse, DepartmentResponse } from '@/types/review'

// 教师卡片组件
function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <Link href={`/teachers/${teacher.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{teacher.name}</h3>
            {/* 学院和职称纵向排列 - 固定高度区域 */}
            <div className="space-y-1 text-sm text-gray-600 h-12 flex flex-col justify-start">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{teacher.department}</span>
              </div>
              {teacher.title ? (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{teacher.title}</span>
                </div>
              ) : (
                <div className="h-5"></div> // 占位符，保持高度一致
              )}
            </div>
          </div>
          
          {/* 评分显示 - 固定宽度避免被挤压 */}
          <div className="text-right flex-shrink-0 w-20">
            <div className="flex items-center justify-end gap-1 mb-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{teacher.avg_rating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">{teacher.review_count} 条评价</div>
          </div>
        </div>

        {/* 课程标签 - 自动填充剩余空间 */}
        <div className="flex-1 flex items-end">
          {teacher.course_tags && teacher.course_tags.length > 0 ? (
            <div className="flex flex-wrap gap-1 w-full">
              {teacher.course_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                >
                  {tag.course_name}
                </span>
              ))}
              {teacher.course_tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{teacher.course_tags.length - 3} 门课程
                </span>
              )}
            </div>
          ) : (
            <div className="w-full h-6"></div> // 占位符，保持高度一致
          )}
        </div>
      </div>
    </Link>
  )
}

// 搜索和筛选栏组件
function SearchFilters({
  searchTerm,
  selectedDepartment,
  sortBy,
  departments,
  onSearchChange,
  onDepartmentChange,
  onSortChange,
  onSearch
}: {
  searchTerm: string
  selectedDepartment: string
  sortBy: string
  departments: string[]
  onSearchChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onSortChange: (value: string) => void
  onSearch: () => void
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 搜索框 - 占据更多空间 */}
        <div className="lg:col-span-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            搜索教师
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              placeholder="输入教师姓名..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 学院筛选 */}
        <div className="lg:col-span-3">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            学院筛选
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部学院</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* 排序选择 */}
        <div className="lg:col-span-2">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            排序方式
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">按姓名排序</option>
            <option value="rating">按评分排序</option>
            <option value="review_count">按评价数排序</option>
          </select>
        </div>

        {/* 搜索按钮 */}
        <div className="lg:col-span-1 lg:flex lg:items-end">
          <button
            onClick={onSearch}
            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            搜索
          </button>
        </div>
      </div>
    </div>
  )
}

// 网站介绍组件
function WebsiteIntroduction({ onStartSearch }: { onStartSearch: () => void }) {
  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12">
        {/* 主标题和副标题 */}
        <div className="mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            欢迎使用教师评价系统
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            为学生提供真实、匿名的教师评价平台，帮助您做出更好的选课决策
          </p>
        </div>

        {/* 特色功能 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">完全匿名</h3>
            <p className="text-gray-600">
              无需注册登录，保护您的隐私，让您可以自由表达真实想法
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">多维评价</h3>
            <p className="text-gray-600">
              支持整体评价和课程评价，全方位了解教师教学情况
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">智能搜索</h3>
            <p className="text-gray-600">
              支持按姓名、学院筛选，多种排序方式，快速找到目标教师
            </p>
          </div>
        </div>

        {/* 开始使用按钮 */}
        <div className="space-y-4">
          <button
            onClick={onStartSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            开始搜索教师
          </button>
          <p className="text-sm text-gray-500">
            点击上方按钮开始使用，或直接在搜索框中输入教师姓名
          </p>
        </div>
      </div>
    </div>
  )
}

// 分页组件
function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange
}: {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一页
      </button>
      
      <div className="flex space-x-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pageNumber = i + 1
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === pageNumber
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNumber}
            </button>
          )
        })}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一页
      </button>
    </div>
  )
}

export default function HomePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [hasSearched, setHasSearched] = useState(false) // 新增：跟踪是否已搜索
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // 获取学院列表
  useEffect(() => {
    fetchDepartments()
  }, [])

  // 移除初始搜索，改为监听筛选和排序变化时自动搜索
  useEffect(() => {
    if (hasSearched) {
      searchTeachers(1)
    }
  }, [selectedDepartment, sortBy]) // 当筛选或排序改变时自动搜索

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      const data: DepartmentResponse = await response.json()
      
      if (data.success) {
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('获取学院列表失败:', error)
    }
  }

  const searchTeachers = async (page = 1) => {
    setLoading(true)
    setHasSearched(true) // 标记已进行搜索
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pagination.pageSize.toString(),
        sort_by: sortBy
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      if (selectedDepartment) {
        params.append('department', selectedDepartment)
      }

      const response = await fetch(`/api/teachers?${params}`)
      const data: TeacherSearchResponse = await response.json()
      
      if (data.success) {
        setTeachers(data.teachers)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('搜索教师失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    searchTeachers(1)
  }

  const handleStartSearch = () => {
    searchTeachers(1)
  }

  const handlePageChange = (page: number) => {
    searchTeachers(page)
  }

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">教师评价系统</h1>
            <p className="text-gray-600">搜索和查看教师评价，帮助您做出更好的选课决策</p>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选 */}
        <SearchFilters
          searchTerm={searchTerm}
          selectedDepartment={selectedDepartment}
          sortBy={sortBy}
          departments={departments}
          onSearchChange={setSearchTerm}
          onDepartmentChange={handleDepartmentChange}
          onSortChange={handleSortChange}
          onSearch={handleSearch}
        />

        {/* 根据是否已搜索显示不同内容 */}
        {!hasSearched ? (
          // 显示网站介绍
          <WebsiteIntroduction onStartSearch={handleStartSearch} />
        ) : (
          // 显示搜索结果
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  {loading ? '搜索中...' : `找到 ${pagination.totalCount} 位教师`}
                </div>
              </div>

              {/* 教师列表 */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">搜索中...</p>
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无搜索结果</h3>
                  <p className="text-gray-600">试试调整搜索条件或筛选项</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
              )}
            </div>

            {/* 分页 */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
