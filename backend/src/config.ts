import { z } from 'zod'

// Confere as variáveis de ambiente ao iniciar: se faltar alguma, o servidor nem sobe
const esquema = z.object({
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  NOMINATIM_USER_AGENT: z.string().min(1),
  PORTA: z.coerce.number().int().default(3000),
})

export const config = esquema.parse(process.env)
