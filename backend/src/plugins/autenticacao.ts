import type { FastifyRequest } from 'fastify'
import { ErroApi } from '../erros.js'
import type { papel_usuario } from '../generated/prisma/client.js'

// O que vai dentro do token de acesso (e fica em pedido.user depois de conferido)
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; papel: papel_usuario }
    user: { sub: string; papel: papel_usuario }
  }
}

// preHandler: só deixa passar quem mandou "Authorization: Bearer <token>" válido e dentro do prazo
export async function autenticar(pedido: FastifyRequest) {
  try {
    await pedido.jwtVerify()
  } catch {
    throw new ErroApi(401, 'NAO_AUTENTICADO', 'Entre na sua conta para continuar.')
  }
}

// preHandler para rotas de um papel específico, como a moderação (Dia 3)
export function exigirPapel(...papeis: papel_usuario[]) {
  return async (pedido: FastifyRequest) => {
    await autenticar(pedido)
    if (!papeis.includes(pedido.user.papel)) {
      throw new ErroApi(403, 'SEM_PERMISSAO', 'Sua conta não tem permissão para isso.')
    }
  }
}
