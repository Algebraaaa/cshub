# Supabase 接入步骤

5 分钟完成账号体系 + 跨设备进度同步。

## 1. 创建项目

1. 打开 https://supabase.com → Sign in（GitHub 一键登录）
2. New project → 取个名（比如 `cshub`），选最近的区域，设置数据库密码（随便存好）
3. 等 2 分钟初始化完成

## 2. 跑建表 SQL

1. 项目左侧栏 → **SQL Editor** → New query
2. 把 [`schema.sql`](./schema.sql) 全部内容粘进去 → **Run**
3. 看到 "Success. No rows returned" 即可

## 3. 开 OAuth 登录

1. 左侧栏 → **Authentication** → **Providers**
2. 启用 **Google**（按官方说明在 Google Cloud Console 创建 OAuth Client → 把 Client ID/Secret 填进来）
3. 启用 **GitHub**（在 GitHub → Settings → Developer settings → OAuth Apps 创建一个）
4. **Authentication → URL Configuration**：把 Site URL 设成 `http://localhost:5173`，再加上你的部署域名

只想先试一下？只开 GitHub 最快，5 分钟搞定。

## 4. 填环境变量

1. 左侧栏 → **Project Settings** → **API**
2. 复制 `Project URL` 和 `anon public` key
3. 在 `algo-viz/` 目录下创建 `.env.local`：

```
VITE_SUPABASE_URL=https://<你的项目>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

4. 重启 `npm run dev`

## 5. 验证

- TopBar 右上角应出现「登录」按钮
- 点击 → 选 GitHub → 授权 → 头像出现
- 标记几个算法已学完 → 换浏览器登录同账号 → 进度同步过来
- 退出登录 → 本地仍可正常用（localStorage 兜底）

## 没配置会怎样

`.env.local` 不存在或为空时，前端检测到无凭证，自动以**单机模式**运行：所有进度仍存 localStorage，TopBar 不会出现登录按钮，控制台输出一行轻提示。**所有原有功能不受影响**。
