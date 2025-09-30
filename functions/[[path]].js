export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 从请求中获取必要的参数
  const params = Object.fromEntries(url.searchParams);
  const body = request.headers.get('content-type')?.includes('application/json')
    ? await request.json().catch(() => ({}))
    : {};

  // 这里我们可以直接返回一个简单的API响应
  // TODO: 实现具体的API逻辑
  return new Response(JSON.stringify({
    code: 200,
    data: {
      ...params,
      ...body
    },
    message: "API is not fully implemented in EdgeOne Pages yet"
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
  });
}