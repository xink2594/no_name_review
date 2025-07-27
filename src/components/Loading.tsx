interface LoadingProps {
  text?: string
  className?: string
}

export default function Loading({ text = '加载中...', className = '' }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    </div>
  )
}

// 页面级别的加载组件
export function PageLoading({ text = '正在加载页面...' }: LoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{text}</h3>
        <p className="text-gray-500">请稍候...</p>
      </div>
    </div>
  )
} 