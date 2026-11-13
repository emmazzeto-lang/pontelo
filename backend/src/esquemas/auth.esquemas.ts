import { z } from 'zod'

// E-mail sempre em minúsculas e sem espaços, para "Ana@x.com" e "ana@x.com " serem a mesma conta
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email('Informe um e-mail válido.'))

export const registro = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome.').max(80),
  email,
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.').max(128),
  // LGPD: a conta só é criada com o aceite explícito da política de privacidade
  aceite_privacidade: z.literal(true, { error: 'É preciso aceitar a política de privacidade.' }),
})

export const login = z.object({
  email: z.string().trim().toLowerCase().max(254),
  senha: z.string().min(1, 'Informe a senha.').max(128),
})

export const usuario = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string(),
  papel: z.enum(['colaborador', 'organizacao', 'moderador']),
})

export const sessao = z.object({
  dados: z.object({
    usuario,
    token_acesso: z.string().describe('JWT para o cabeçalho Authorization: Bearer. Vale 15 minutos.'),
  }),
})

export const perfil = z.object({ dados: usuario })

export const confirmacao = z.object({
  dados: z.object({ ultima_verificacao_em: z.string() }),
})
