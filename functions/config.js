// API相关配置
export const API_CONFIG = {
  // 基础URL
  BASE_URL: 'http://music.163.com',
  
  // 加密类型
  CRYPTO_TYPES: {
    weapi: 'weapi',
    linuxapi: 'linuxapi',
    eapi: 'eapi'
  },
  
  // 用户代理
  USER_AGENTS: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ],
  
  // 默认请求头
  DEFAULT_HEADERS: {
    'Accept': '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Connection': 'keep-alive'
  }
};

// 随机获取用户代理
export function getRandomUserAgent() {
  const agents = API_CONFIG.USER_AGENTS;
  return agents[Math.floor(Math.random() * agents.length)];
}

// 解析cookie字符串
export function parseCookie(cookieStr) {
  if (!cookieStr) return {};
  return cookieStr.split(';')
    .map(pair => pair.trim().split('='))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

// 生成随机字符串
export function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 添加更多工具函数...