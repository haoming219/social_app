# LinkWave / Social App

一个全栈社交应用（React 前端 + Express/MongoDB 后端），包含登录注册、信息流、关注关系、个人资料编辑、发帖/评论/点赞与图片上传等功能。

An end-to-end social app (React frontend + Express/MongoDB backend) featuring authentication, feed, following, profile editing, posts/comments/likes, and image uploads.

---

## 主要功能特性 (Key Features)

- **账号体系 (Auth)**: 注册/登录/退出，Cookie 会话；支持 Google 登录（Firebase Auth）。
- **信息流 (Feed)**: 拉取自己 + 关注用户的帖子，支持按作者/内容搜索与分页展示。
- **发帖 (Posting)**: 发布图文帖子；图片上传到 Cloudinary 后把 URL 保存到后端。
- **互动 (Engagement)**: 点赞/取消点赞；评论的新增/编辑/删除。
- **关注 (Following)**: 关注/取关用户，并在侧边栏展示关注列表与状态。
- **个人资料 (Profile)**: 编辑签名（headline）、邮箱、电话、邮编、生日、密码；更新头像（Cloudinary）。

---

## 技术栈说明 (Tech Stack)

### 前端 (Frontend)

- **React 18** + **React Router v6**
- **Bootstrap 5**（样式与布局）
- **Axios**（API 请求，`withCredentials` 发送 Cookie）
- **Firebase Auth**（Google 登录）
- **Cloudinary**（前端直传图片）

### 后端 (Backend)

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **bcryptjs**（密码哈希）
- **cookie-parser / cors / body-parser**
- **Jasmine + Supertest**（测试）

---

## 项目结构 (Project Structure)

> 以当前仓库实际目录为准（部分为简化说明）。

```
.
├─ src/
│  ├─ backend/                  # 后端独立 Node 项目（有自己的 package.json）
│  │  ├─ index.js               # 后端入口（端口、CORS、MongoDB 连接、路由挂载）
│  │  └─ src/
│  │     ├─ auth.js             # /register /login /logout /password + isLoggedIn
│  │     ├─ articles.js         # 帖子/评论/点赞相关 API
│  │     ├─ profile.js          # headline/email/phone/zipcode/dob/avatar API
│  │     └─ following.js        # 关注列表/关注/取关 API
│  ├─ landing/                  # 登录/注册页
│  ├─ main/                     # 主页面：信息流、关注侧栏、发帖弹窗、个人资料组件
│  ├─ profile/                  # 单独的 profile 页面路由组件（/profile）
│  ├─ config.js                 # 前端 API BASE_URL
│  └─ firebaseConfig.js         # Firebase 初始化（Google 登录）
├─ public/
├─ package.json                 # 前端依赖与脚本（CRA）
└─ README.md
```

---

## 安装步骤 (Installation)

### 环境要求 (Prerequisites)

- **Node.js 18+**（推荐）
- **npm**（或 yarn/pnpm，但本仓库已包含 `package-lock.json`）
- **MongoDB**（本地或 Atlas）

### 1) 安装前端依赖 (Install frontend deps)

```bash
cd D:\social_app
npm install
```

### 2) 安装后端依赖 (Install backend deps)

```bash
cd D:\social_app\src\backend
npm install
```

---

## 启动与使用 (Run & Use)

### A. 本地开发启动（推荐）(Local development)

#### 1) 启动后端 (Start backend)

```bash
cd D:\social_app\src\backend
npm start
```

默认监听 `http://localhost:4000`（也可通过环境变量 `PORT` 修改）。

#### 2) 配置前端请求地址 (Set frontend API base url)

编辑 `src/config.js`：

- 本地开发建议：
  - `export const BASE_URL = 'http://localhost:4000'`
- 生产环境可指向你的部署地址（例如 Heroku）

#### 3) 启动前端 (Start frontend)

```bash
cd D:\social_app
npm start
```

打开 `http://localhost:3000`。

---

### B. 生产构建 (Production build)

```bash
cd D:\social_app
npm run build
```

前端部署可以参考 Create React App 官方文档：  
[CRA Deployment](https://create-react-app.dev/docs/deployment/)

---

## 使用示例 (Examples)

### 1) Web 使用流程 (Typical user flow)

- 打开首页 `/`：账号密码登录，或点击 **Continue with Google**
- 没账号可去 `/register` 注册
- 登录后进入 `/main`：
  - 编辑签名（状态）
  - 关注/取关好友
  - 发布帖子（可附带图片）
  - 点赞、发表评论
- 进入 Profile：
  - 更新头像、邮箱、电话、邮编、生日、密码

### 2) API 示例（curl）(API examples with curl)

> 后端使用 Cookie 会话。下面示例用 `cookie.txt` 保存会话 Cookie。

#### 注册 (Register)

```bash
curl -i -c cookie.txt -X POST http://localhost:4000/register ^
  -H "Content-Type: application/json" ^
  -d "{\"accountName\":\"alice\",\"displayName\":\"Alice\",\"email\":\"alice@example.com\",\"phone\":\"123-456-7890\",\"dob\":\"2000-01-01\",\"zipcode\":\"77005\",\"password\":\"123456\"}"
```

#### 登录 (Login)

```bash
curl -i -c cookie.txt -X POST http://localhost:4000/login ^
  -H "Content-Type: application/json" ^
  -d "{\"accountName\":\"alice\",\"password\":\"123456\"}"
```

#### 获取自己的 headline（需要登录）(Get headline; auth required)

```bash
curl -i -b cookie.txt http://localhost:4000/profile/headline
```

#### 获取信息流帖子（自己 + 关注用户）(Get feed articles)

```bash
curl -i -b cookie.txt "http://localhost:4000/articles/articles?followers=bob,charlie"
```

---

## 配置说明 (Configuration)

### 前端配置 (Frontend)

- **API 地址**: `src/config.js`
  - `BASE_URL`：前端请求后端的根地址
- **Firebase（Google 登录）**: `src/firebaseConfig.js`
  - 如果你要使用自己的 Firebase 项目，请替换该文件中的配置，并在 Firebase 控制台启用 Google Provider

### 后端配置 (Backend)

后端入口 `src/backend/index.js` 中包含：

- **端口**: `PORT`（默认 `4000`）
- **CORS**: 当前写死了允许的前端域名（生产域名），本地开发需要把 `origin` 调整为 `http://localhost:3000`
- **MongoDB**: 当前 `MONGO_URI` 在代码里写死（包含账号信息）

> 安全提示 (Security note)：建议把 `MONGO_URI`、允许的 `CORS_ORIGIN` 等敏感配置移动到环境变量（例如 `.env`），并避免将数据库凭据提交到仓库。

### Cookie/会话注意事项 (Cookie/session notes)

- 后端使用内存 `sessionMap` 保存 session：**服务重启会导致所有会话失效**。
- Cookie 配置里 `secure: true` + `sameSite: 'None'` 更适合 HTTPS 场景；纯本地 HTTP 下可能导致浏览器不携带 Cookie，需要你在本地开发时调整对应设置。

---

## 常用脚本 (Scripts)

### 前端 (Frontend)

```bash
npm start
npm test
npm run build
```

### 后端 (Backend)

```bash
cd src/backend
npm start
npm test
```

---

## 相关链接 (Links)

- Create React App: `https://github.com/facebook/create-react-app`
- React Router: `https://reactrouter.com/`
- Firebase Auth: `https://firebase.google.com/docs/auth`
- Cloudinary Upload API: `https://cloudinary.com/documentation/image_upload_api_reference`

