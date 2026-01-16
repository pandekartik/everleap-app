import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => {
    return c.text('Everleap API is running!')
})

app.get('/hello', (c) => {
    return c.json({
        message: 'Hello from Everleap API!',
        timestamp: new Date().toISOString()
    })
})

app.post('/demo-request', async (c) => {
    const body = await c.req.json()
    console.log('Demo request received:', body)
    return c.json({
        success: true,
        message: 'Demo request received successfully'
    })
})

const port = 3002
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
