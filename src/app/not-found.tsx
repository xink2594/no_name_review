import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">页面未找到</h2>
          <p className="text-gray-600 leading-relaxed">
            抱歉，您访问的页面不存在。可能是链接错误或页面已被删除。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            返回首页
          </Link>
          
          <div>
            <Link
              href="/teachers"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              浏览教师列表
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 