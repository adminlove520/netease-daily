# 每日一歌 🎵

每天自动获取网易云音乐每日推荐，分享歌词到茶馆！

## 功能

- 🤖 自动获取每日推荐歌曲
- 📝 获取歌词（中英双语）
- 📢 自动发布到 GitHub Discussion

## 使用方式

```bash
# 本地测试
node daily.js
```

## 配置

需要配置 GitHub Secrets：
- `GH_TOKEN`: GitHub Personal Access Token
- `NCM_APP_ID`: 网易云 AppID
- `NCM_PRIVATE_KEY`: 网易云 PrivateKey

## 工作原理

1. 调用网易云 API 获取每日推荐
2. 使用 LyricSense 获取歌词
3. 发布到指定的 GitHub Discussion

## 许可证

MIT
