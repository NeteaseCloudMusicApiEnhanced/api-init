import { server } from '@neteaseapireborn/api'

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname + url.search;

  // 创建一个模拟的 http.IncomingMessage 对象
  const mockReq = {
    url: path,
    method: request.method,
    headers: Object.fromEntries(request.headers),
  };

  // 创建一个模拟的 http.ServerResponse 对象
  let responseBody = '';
  let responseHeaders = new Headers();
  let statusCode = 200;

  const mockRes = {
    setHeader(name, value) {
      responseHeaders.set(name, value);
    },
    writeHead(code, headers) {
      statusCode = code;
      if (headers) {
        Object.entries(headers).forEach(([name, value]) => {
          responseHeaders.set(name, value);
        });
      }
    },
    write(chunk) {
      responseBody += chunk;
    },
    end(chunk) {
      if (chunk) {
        responseBody += chunk;
      }
    }
  };

  // 处理请求
  await new Promise((resolve) => {
    server(mockReq, mockRes, resolve);
  });

  // 返回响应
  return new Response(responseBody, {
    status: statusCode,
    headers: responseHeaders,
  });
}