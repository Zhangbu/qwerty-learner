# Vercel 访问保护（共享密码版）

该项目已接入最小改动的访问控制：

- 登录页：/login
- 登录接口：/api/auth/login
- 会话接口：/api/auth/session
- 登出接口：/api/auth/logout
- 前端路由守卫：未登录时自动跳转登录页

## 1. 在 Vercel 配置环境变量

在 Project Settings -> Environment Variables 添加以下变量：

- ACCESS_PASSWORD：访问密码（给受邀用户）
- ACCESS_COOKIE_NAME：建议 ql_access
- ACCESS_COOKIE_TOKEN：至少 32 位随机字符串

建议三个环境（Production/Preview/Development）都配置。

## 2. 部署

按你当前流程重新部署即可。

## 3. 验证

1. 打开站点任意页面，应跳转到 /login。
2. 输入错误密码，提示失败。
3. 输入正确密码，进入原目标页面。
4. 清空站点 Cookie 后，再访问页面会重新要求登录。

## 4. 方案边界

这是共享密码门，适合少量固定用户。

- 优点：免费、改动小、可快速上线
- 限制：不是独立账号体系，密码泄露后需手动更换

后续如果要升级到每个用户独立权限，可迁移到 Auth.js + 邮箱白名单。
