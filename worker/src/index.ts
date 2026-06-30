import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS — allow any origin
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', proxy: 'cloudflare-worker' })
})

// Proxy all /api/* requests to Vercel backend
app.all('/api/*', async (c) => {
  const vercelUrl = c.env.VERCEL_API_URL || 'https://city-solitude.vercel.app'
  const targetUrl = `${vercelUrl}${c.req.path}`

  // Build proxied request
  const proxyHeaders = new Headers(c.req.raw.headers)
  proxyHeaders.delete('host')
  proxyHeaders.set('x-forwarded-for', c.req.header('cf-connecting-ip') || '')

  const method = c.req.method
  let body: BodyInit | null = null
  if (!['GET', 'HEAD'].includes(method)) {
    body = await c.req.raw.clone().arrayBuffer()
  }

  const response = await fetch(targetUrl, {
    method,
    headers: proxyHeaders,
    body,
  })

  // Build response, copying headers
  const respHeaders = new Headers(response.headers)
  respHeaders.set('Access-Control-Allow-Origin', '*')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: respHeaders,
  })
})

export default app
