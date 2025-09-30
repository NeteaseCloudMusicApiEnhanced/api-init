import { api } from './api.js';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\//, ''); // 移除开头的斜杠

  // 处理OPTIONS请求（CORS预检）
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cookie',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // 检查API方法是否存在
  const apiMethod = api[path];
  if (!apiMethod) {
    return new Response(JSON.stringify({
      code: 404,
      message: `API method '${path}' not found`
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // 获取请求参数
    const params = request.method === 'POST' && request.headers.get('content-type')?.includes('application/json')
      ? await request.json()
      : Object.fromEntries(url.searchParams);

    // 添加cookie到参数中（如果存在）
    const cookie = request.headers.get('cookie');
    if (cookie) {
      params.cookie = cookie;
    }

    // 调用API方法
    const result = await apiMethod(params);

    // 返回结果
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cookie',
        ...(result.cookie ? { 'Set-Cookie': result.cookie } : {})
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      code: 500,
      message: 'Internal server error',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}