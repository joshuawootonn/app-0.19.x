import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const proxyRequest = new NextRequest('http://localhost:3001/page-2')

  const proxyResponse = await fetch(proxyRequest)

  const response = new NextResponse(proxyResponse.body, {
    headers: proxyResponse.headers,
    status: proxyResponse.status,
  })

  // `fetch` automatically decompresses the response, but the response headers will keep the
  // `content-encoding` and `content-length` headers. This will cause decoding issues if the client
  // attempts to decompress the response again. To prevent this, we remove these headers.
  //
  // See https://github.com/nodejs/undici/issues/2514.
  if (response.headers.has('content-encoding')) {
    response.headers.delete('content-encoding')
    response.headers.delete('content-length')
  }

  return response
}
