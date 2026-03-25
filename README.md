# 每日一歌 🎵

每天自动获取网易云音乐每日推荐，分享歌词到茶馆！

## 功能

- 🤖 自动获取每日推荐歌曲（需要登录）
- 📝 获取歌词（中英双语）
- 📢 自动发布到 GitHub Discussion

## 本地使用

### 1. 安装依赖

```bash
pip3 install cryptography requests
```

### 2. 登录网易云（获取 Cookie）

```bash
# 发送验证码
python3 scripts/netease_client.py send_captcha <手机号>

# 验证码登录
python3 scripts/netease_client.py login <手机号> <验证码>
```

登录后 Cookie 自动保存到 `secrets/netease_cookies.json`

### 3. 配置 GitHub Secrets

需要配置以下 Secrets：
| Secret | 说明 |
|--------|------|
| `GH_TOKEN` | GitHub Personal Access Token |
| `NCM_COOKIE` | 登录后的 Cookie（从 `secrets/netease_cookies.json` 获取） |

### 4. 运行

```bash
# 本地测试
python3 scripts/netease_client.py daily
```

## GitHub Workflow

每天自动运行，推送到 Discussion #133

### 配置 Secrets

1. 登录后获取 Cookie：
```bash
cat secrets/netease_cookies.json
```

2. 将内容配置到 GitHub Secrets:
- `NCM_COOKIE`: 上面获取的 Cookie 内容

## 工作原理

1. 读取 NCM_COOKIE 环境变量
2. 调用网易云 API 获取每日推荐
3. 使用 LyricSense 获取歌词
4. 发布到指定的 GitHub Discussion

## 许可证

MIT
