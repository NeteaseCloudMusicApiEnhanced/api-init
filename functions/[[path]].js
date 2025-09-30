import express from 'express'
import { server } from '@neteaseapireborn/api'

const app = express()

// 中间件：处理请求体
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 使用 @neteaseapireborn/api 的路由
app.use('/', (req, res, next) => {
  server(req, res, next)
})

export async function onRequest(context) {
  const { request } = context;
  
  // 将 fetch Request 转换为 Express 格式
  const expressReq = {
    method: request.method,
    url: new URL(request.url).pathname,
    headers: Object.fromEntries(request.headers),
    query: Object.fromEntries(new URL(request.url).searchParams),
    body: request.headers.get('content-type')?.includes('application/json') 
      ? await request.json().catch(() => ({}))
      : await request.text().catch(() => ''),
  };

  return new Promise((resolve) => {
    let chunks = [];
    
    // 模拟 Express Response
    const expressRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      set: function(field, val) {
        if (this.headers === undefined) this.headers = {};
        this.headers[field.toLowerCase()] = val;
        return this;
      },
      write: function(chunk) {
        chunks.push(Buffer.from(chunk));
      },
      end: function(chunk) {
        if (chunk) chunks.push(Buffer.from(chunk));
        const body = Buffer.concat(chunks).toString('utf8');
        resolve(new Response(body, {
          status: this.statusCode || 200,
          headers: this.headers || {},
        }));
      }
    };

    // 处理请求
    app(expressReq, expressRes);
  });
}