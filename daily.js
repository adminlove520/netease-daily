#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');

// 环境变量
const APP_ID = process.env.NCM_APP_ID || '';
const PRIVATE_KEY = process.env.NCM_PRIVATE_KEY || '';

// GitHub 配置
const GH_TOKEN = process.env.GH_TOKEN || '';
const DISCUSSION_ID = process.env.DISCUSSION_ID || 'D_kwDORQmU5s4Ak6Wg'; // #133 小溪每日分享-音乐

// 设备信息
const device = {
  channel: process.env.NCM_CHANNEL || 'iotapitest',
  deviceId: process.env.NCM_DEVICE_ID || 'daily-bot',
  deviceType: process.env.NCM_DEVICE_TYPE || 'openapi',
  os: process.env.NCM_OS || 'openapi',
  brand: process.env.NCM_BRAND || 'iotapitest',
  model: 'daily-bot',
  osVer: '1.0.0',
  appVer: '1.0.0',
  clientIp: '127.0.0.1'
};

// 生成签名
function generateSign(params) {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(sortedParams);
  return signer.sign(PRIVATE_KEY, 'base64');
}

// 调用 API
function callApi(path, bizContent) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).slice(-6);
    
    const params = {
      appId: APP_ID,
      appSecret: APP_ID, // 用 AppID 当 appSecret
      signType: 'RSA_SHA256',
      timestamp: timestamp,
      bizContent: JSON.stringify(bizContent),
      device: JSON.stringify(device),
      nonce: nonce
    };
    
    params.sign = generateSign(params);
    
    const url = new URL(`https://openapi.music.163.com${path}`);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://music.163.com/'
      }
    };
    
    const postData = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 获取每日推荐
async function getDailyRecommend() {
  try {
    const result = await callApi('/openapi/music/basic/recommend/songlist/get/v2', {
      // 参数根据实际 API 调整
    });
    return result;
  } catch (e) {
    console.error('获取每日推荐失败:', e.message);
    return null;
  }
}

// 获取歌词
async function getLyrics(songName, artist) {
  try {
    // 使用 lyricsense 或其他歌词 API
    const { execSync } = require('child_process');
    const result = execSync(`lyricsense "${songName} ${artist}"`, { encoding: 'utf8' });
    return result;
  } catch (e) {
    console.error('获取歌词失败:', e.message);
    return null;
  }
}

// 发到 GitHub Discussion
async function postToDiscussion(content) {
  const query = `
    mutation {
      addDiscussionComment(input: {
        discussionId: "${DISCUSSION_ID}",
        body: ${JSON.stringify(content)}
      }) {
        comment {
          id
        }
      }
    }
  `;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify({ query }));
    req.end();
  });
}

// 主函数
async function main() {
  console.log('=== 每日一歌 ===\n');
  
  // 1. 获取每日推荐
  console.log('1. 获取每日推荐...');
  const recommend = await getDailyRecommend();
  console.log('推荐结果:', JSON.stringify(recommend, null, 2));
  
  if (!recommend || recommend.code !== 200) {
    console.log('获取推荐失败，尝试搜索功能...');
    // 备用方案：使用搜索 API
  }
  
  // 2. 如果没有每日推荐，使用搜索
  console.log('\n2. 使用搜索作为备用...');
  
  // 3. 发到 Discussion
  console.log('\n3. 发布到 GitHub Discussion...');
  const content = `## 🎵 每日歌曲推荐

> 测试消息 - 正在配置中...

---
🤖 自动生成`;
  
  // const result = await postToDiscussion(content);
  // console.log('发布结果:', result);
  console.log('(跳过发布，仅测试)');
  
  console.log('\n完成！');
}

main().catch(console.error);
