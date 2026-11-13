import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// O .env fica na raiz do projeto, um nível acima do backend
config({ path: '../.env', quiet: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
