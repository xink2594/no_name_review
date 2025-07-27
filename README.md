# 教师匿名评价系统

[![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

一个现代化的教师匿名评价系统，为学生提供安全、匿名的教师评价平台，支持多维度评价和智能防滥用机制。

## ✨ 核心特性

- 🔒 **完全匿名** - 无需注册登录，保护学生隐私
- ⭐ **精确评分** - 支持0.5分精度的星级评分系统
- 📚 **多维评价** - 整体评价 + 课程评价的双重维度
- 🛡️ **智能防滥用** - 设备指纹技术防止恶意刷评价
- 📱 **响应式设计** - 完美支持手机、平板和桌面设备
- 🔍 **智能搜索** - 支持按姓名、学院筛选，多种排序方式
- 🚀 **现代技术栈** - Next.js 15 + React 19 + TypeScript + Supabase

## 🖼️ 系统预览

### 主要页面
- **首页**: 教师搜索和筛选，美观的网站介绍
- **教师详情页**: 完整的教师信息、评价统计和相关课程
- **评价提交页**: 4步骤评价流程，支持半星评分
- **评价列表**: 可按课程筛选的评价展示，支持投票功能

### 核心功能
- **教师搜索**: 模糊搜索 + 学院筛选 + 多种排序
- **评价系统**: 0.5-5.0分精度 + 点名标记 + 课程评价
- **投票机制**: 赞同/不同意 + 净同意数显示
- **分享功能**: 原生分享API + 链接复制
- **防滥用**: 5分钟冷却时间 + 设备指纹识别

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- npm 或 yarn
- Supabase 账户

### 安装与运行

1. **克隆项目**
```bash
git clone <repository-url>
cd no_name_review
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **环境配置**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **数据库设置**

在Supabase中执行以下SQL文件：
```bash
# 1. 创建基础表结构
# 执行 init.sql

# 2. 创建数据库函数
# 执行 supabase/migrations/simplified_handle_submit_review.sql

# 3. 更新评分精度支持（如果需要）
# 执行 supabase/migrations/update_rating_precision.sql
```

5. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 文档

### 开发文档
- 📘 [API 文档](./docs/API_DOCUMENTATION.md) - 完整的API接口说明
- 📗 [系统功能文档](./docs/SYSTEM_DOCUMENTATION.md) - 详细的功能说明和使用指南

### 数据库文档
- 📊 [数据库设计](./init.sql) - 完整的数据库表结构
- 🔄 [数据库迁移](./supabase/migrations/) - 数据库更新脚本

## 🏗️ 技术架构

### 前端技术栈
```
Next.js 15.4.2        # React全栈框架
React 19.1.0           # UI库
TypeScript 5.0         # 类型安全
Tailwind CSS 4.0       # 样式框架
```

### 后端技术栈
```
Supabase              # BaaS平台
PostgreSQL            # 数据库
Next.js API Routes    # API层
Row Level Security    # 数据安全
```

### 项目结构
```
no_name_review/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API路由
│   │   ├── teachers/       # 教师页面
│   │   └── submit-review/  # 评价提交
│   ├── components/         # React组件
│   ├── lib/               # 工具函数
│   └── types/             # TypeScript类型
├── docs/                  # 文档
├── supabase/             # 数据库相关
└── public/               # 静态资源
```

## 🎯 主要功能

### 1. 教师搜索与筛选
- **模糊搜索**: 按教师姓名搜索
- **学院筛选**: 按学院筛选教师
- **智能排序**: 姓名/评分/评价数排序
- **自动搜索**: 筛选条件改变时自动执行搜索

### 2. 教师信息展示
- **基本信息**: 姓名、学院、职称
- **评价统计**: 平均评分、评价数、点名率
- **课程关联**: 相关课程标签及热度
- **响应式布局**: 适配各种屏幕尺寸

### 3. 评价提交系统
- **4步骤流程**: 总体评价 → 课程标签 → 文本评价 → 课程评价
- **半星评分**: 0.5分精度的星级评分
- **课程评价**: 针对特定课程的详细评价
- **防重复提交**: 5分钟冷却时间限制

### 4. 评价查看与互动
- **多种排序**: 最新/最有帮助/评分排序
- **课程筛选**: 按特定课程筛选评价
- **投票系统**: 赞同/不同意机制
- **净同意数**: 显示评价的认可度

## 🔒 安全与隐私

### 匿名性保护
- **无用户系统**: 完全匿名，无需注册
- **IP哈希化**: 只存储IP的哈希值
- **设备指纹**: 仅用于防滥用，不追踪用户

### 防滥用机制
- **设备识别**: 多维度设备指纹技术
- **时间限制**: 同一教师5分钟评价间隔
- **客户端记录**: localStorage存储提交历史

### 数据安全
- **行级安全**: Supabase RLS保护数据
- **输入验证**: 前后端双重数据验证
- **SQL防护**: 参数化查询防止注入

## 📊 数据模型

### 核心表结构
```sql
teachers                    # 教师信息
├── id (UUID)              # 主键
├── name                   # 姓名
├── department            # 学院
├── avg_rating            # 平均评分
└── review_count          # 评价数量

reviews                    # 评价信息
├── id (UUID)             # 主键
├── teacher_id            # 教师ID
├── rating (NUMERIC)      # 评分(0.5-5.0)
├── does_roll_call        # 是否点名
└── comment               # 评价内容

course_reviews            # 课程评价
├── review_id             # 评价ID
├── course_id             # 课程ID
├── course_rating         # 课程评分
└── course_comment        # 课程评价
```

## 🛠️ 开发指南

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建生产版本
npm run build
```

### 环境变量
```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 应用配置
NEXT_PUBLIC_SITE_URL=
```

### 数据库设置
1. 在Supabase中创建新项目
2. 执行 `init.sql` 创建表结构
3. 执行数据库函数文件
4. 配置Row Level Security策略

## 🚀 部署

### Vercel部署（推荐）
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署和域名配置

### 其他平台
- **Netlify**: 支持Next.js静态导出
- **自托管**: Docker容器化部署
- **云平台**: AWS/GCP/Azure等

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint配置
- 编写清晰的提交信息
- 添加必要的测试

## 📝 版本历史

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- 🔒 完整的匿名评价系统
- ⭐ 0.5分精度评分支持
- 🛡️ 智能防滥用机制
- 📱 响应式设计
- 🔍 搜索和筛选功能

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React全栈框架
- [Supabase](https://supabase.com/) - 开源Firebase替代方案
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [React](https://reactjs.org/) - 用户界面库

## 📞 支持与反馈

- 🐛 [Bug报告](https://github.com/your-repo/issues)
- 💡 [功能建议](https://github.com/your-repo/issues)
- 📧 [邮件联系](mailto:your-email@example.com)
- 📖 [文档反馈](https://github.com/your-repo/discussions)

---

**开发团队**: 教师评价系统开发组  
**技术支持**: 参见文档或提交Issue

