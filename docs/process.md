# LightERP 开发任务列表

> 创建日期: 2026-04-05

## 后端项目 (已完成 ✅)

项目位置: `.worktrees/backend/`
Git分支: feature/backend

**启动步骤:**
```bash
# 1. 执行 SQL 创建数据库
mysql -u root -p < docs/database.sql

# 2. 修改 application.yml 数据库连接配置
# 编辑 .worktrees/backend/src/main/resources/application.yml

# 3. 启动后端服务
cd .worktrees/backend && mvn spring-boot:run
```

---

## 前端项目 (已完成 ✅)

项目位置: `frontend/`

### 已完成页面
- [x] 项目初始化 (React 18 + TypeScript + Vite + Ant Design 5)
- [x] 登录页面
- [x] 主布局 (MainLayout + 侧边栏菜单)
- [x] 可视化/仪表盘页面
- [x] 出库发票页面 (列表 + 创建模态框)
- [x] 货款录入页面
- [x] 罚款录入页面
- [x] 查询页面 (发票/汇款/罚款/出库产品/对账)
- [x] 后台管理页面 (用户/客户/产品/单价)

### 启动命令
```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

---

## 完整API接口列表

### 鉴权模块
- POST /api/v1/auth/login - 用户登录
- POST /api/v1/auth/register - 用户注册
- GET /api/v1/auth/current - 获取当前用户
- POST /api/v1/auth/logout - 用户退出

### 后台管理
- /admin/user/* - 用户管理 (CRUD)
- /admin/customer/* - 客户管理 (CRUD)
- /admin/product/* - 产品管理 (CRUD)
- /admin/price/* - 客户产品单价管理 (CRUD)

### 业务模块
- /sale/invoice/* - 出库发票管理
- /payment/* - 货款管理
- /penalty/* - 罚款管理
- /query/* - 查询模块
- /stats/* - 可视化统计
- /common/* - 通用接口
- /export/* - Excel导出

---

## Git 提交记录

**后端 (feature/backend 分支):**
- 15fd8bd feat: 完成项目骨架搭建和基础CRUD
- bac434d feat: 完成所有业务模块控制器开发
- d056af8 feat: 添加发票编辑功能和Excel导出功能

**前端 (frontend 目录):**
- 0c8308c feat: 初始化 React + TypeScript + Vite 前端项目

---

## 当前进度

| 模块 | 状态 |
|------|------|
| 后端 API | 100% ✅ |
| 前端页面 | 95% ✅ |

**项目完成度: ~98%**