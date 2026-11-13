import { z } from 'zod'

// Confere as variáveis de ambiente ao iniciar: se faltar alguma, o servidor nem sobe
const esquema = z.object({
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  NOMINATIM_USER_AGENT: z.string().min(1),
  PORTA: z.coerce.number().int().default(3000),
  // Segredos longos e aleatórios: quem souber o JWT_SECRET consegue se passar por qualquer pessoa
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter pelo menos 32 caracteres'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET precisa ter pelo menos 32 caracteres'),
})

const variaveis = esquema.parse(process.env)

export const config = {
  ...variaveis,
  // Cookie "Secure" só viaja em HTTPS. Em produção o site é HTTPS; em localhost o navegador aceita os dois.
  COOKIE_SEGURO: variaveis.FRONTEND_URL.startsWith('https://'),
}
