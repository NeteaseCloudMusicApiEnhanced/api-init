import { API_CONFIG, getRandomUserAgent } from './config.js';
import { weapi, linuxapi, eapi } from './crypto.js';

// API路由配置，包含路径和加密方式
const API_ROUTES = {
  login_cellphone: {
    url: '/weapi/login/cellphone',
    crypto: 'weapi'
  },
  user_cloud: {
    url: '/weapi/v1/cloud/get',
    crypto: 'weapi'
  },
  // 用户信息
  user_account: {
    url: '/api/v1/user/account',
    crypto: 'weapi'
  },
  user_subcount: {
    url: '/weapi/subcount',
    crypto: 'weapi'
  },
  user_level: {
    url: '/weapi/user/level',
    crypto: 'weapi'
  },
  user_detail: {
    url: '/weapi/v1/user/detail/:uid',
    crypto: 'weapi'
  },
  user_playlist: {
    url: '/weapi/user/playlist',
    crypto: 'weapi'
  },
  // 搜索接口
  search: {
    url: '/weapi/search/get',
    crypto: 'weapi'
  },
  search_suggest: {
    url: '/weapi/search/suggest/web',
    crypto: 'weapi'
  },
  search_default: {
    url: '/weapi/search/default',
    crypto: 'weapi'
  },
  // 歌曲接口
  song_url: {
    url: '/api/song/enhance/player/url',
    crypto: 'weapi'
  },
  song_detail: {
    url: '/weapi/v3/song/detail',
    crypto: 'weapi'
  },
  song_lyric: {
    url: '/weapi/song/lyric',
    crypto: 'weapi'
  }
};

// 加密参数的函数
async function encryptParams(params, method) {
  switch (method) {
    case 'weapi':
      return await weapi(params);
    case 'linuxapi':
      return await linuxapi(params);
    case 'eapi':
      return await eapi(params.url, params);
    default:
      return params;
  }
}

// 发起API请求的函数
async function request(url, options) {
  const response = await fetch(url, options);
  
  // 获取所有cookie
  const cookies = response.headers.getAll('set-cookie');
  const cookieStr = cookies ? cookies.join('; ') : null;
  
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = await response.text();
  }

  return {
    status: response.status,
    body: data,
    cookie: cookieStr
  };
}

// 创建API方法
function createApiMethod(path, config) {
  return async function(params = {}) {
    // 处理URL中的参数
    let url = API_CONFIG.BASE_URL + path.replace(/\/:([^\/]+)/g, (match, param) => {
      const value = params[param];
      delete params[param];
      return '/' + value;
    });

    // 加密参数
    const encryptedData = await encryptParams(params, config.crypto);
    
    // 构建请求选项
    const options = {
      method: 'POST',
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': getRandomUserAgent()
      },
      body: new URLSearchParams(encryptedData).toString()
    };

    // 添加cookie（如果存在）
    if (params.cookie) {
      options.headers.Cookie = params.cookie;
    }

    return request(url, options);
  };
}

// 导出所有API方法
export const api = Object.entries(API_ROUTES).reduce((acc, [name, config]) => {
  acc[name] = createApiMethod(config.url, config);
  return acc;
}, {});