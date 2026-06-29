# 🗺️ 城市独处地图

发现和分享每个城市适合独处、发呆、旅行的好地方。

## 技术栈

- **前端**: React 19 + Vite + TailwindCSS + shadcn/ui
- **后端**: Node.js + Express + TypeScript + Prisma
- **数据库**: PostgreSQL + Redis
- **地图**: MapLibre GL JS (开源免费)

## 快速开始

```bash
# 1. 启动数据库
docker compose up -d

# 2. 启动后端
cd server
npm install
npx prisma migrate dev
npm run dev

# 3. 启动前端
cd client
npm install
npm run dev
```
