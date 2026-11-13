import { z } from 'zod'

const esquema = z.object({
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  NOMINATIM_USER_AGENT: z.string().min(1),
  PORTA: z.coerce.number().int().default(3000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter pelo menos 32 caracteres'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET precisa ter pelo menos 32 caracteres'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORTA: z.coerce.number().int().default(1025),
  SMTP_USUARIO: z.string().optional(),
  SMTP_SENHA: z.string().optional(),
  SMTP_REMETENTE: z.string().default('Pontelo <alerta@pontelo.test>'),
})

const variaveis = esquema.parse(process.env)

export const config = {
  ...variaveis,
  COOKIE_SEGURO: variaveis.FRONTEND_URL.startsWith('https://'),
}
