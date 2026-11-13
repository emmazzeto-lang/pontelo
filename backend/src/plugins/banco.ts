import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { config } from '../config.js'

// Uma conexão só para o servidor inteiro
export const banco = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.DATABASE_URL }),
})
