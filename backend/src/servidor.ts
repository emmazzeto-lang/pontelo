import { construirApp } from './app.js'
import { config } from './config.js'

const app = await construirApp()
await app.listen({ port: config.PORTA, host: '0.0.0.0' })
