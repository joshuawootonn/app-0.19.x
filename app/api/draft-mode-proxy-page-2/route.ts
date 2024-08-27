import { cookies, draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { MakeswiftDraftData } from '@makeswift/runtime/dist/types/next/draft-mode'

export const MAKESWIFT_DRAFT_MODE_DATA_COOKIE = 'x-makeswift-draft-data'
export async function GET(request: NextRequest) {
  draftMode().enable()

  const proxyRequest = new NextRequest('http://localhost:3001/page-2', { headers: request.headers })
  const draftModeData: MakeswiftDraftData = {
    makeswift: true,
    siteVersion: 'Working',
  }
  const draftModeCookie = cookies().get('__prerender_bypass')
  if (draftModeCookie) {
    proxyRequest.cookies.set(draftModeCookie)
    proxyRequest.cookies.set(MAKESWIFT_DRAFT_MODE_DATA_COOKIE, JSON.stringify(draftModeData))
  }

  draftMode().disable()

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
