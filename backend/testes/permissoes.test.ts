import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'

process.env.DATABASE_URL ??= 'postgresql://teste:teste@localhost:1/teste'
process.env.FRONTEND_URL ??= 'http://localhost:5173'
process.env.NOMINATIM_USER_AGENT ??= 'pontelo-testes'
process.env.JWT_SECRET ??= 'segredo-de-teste-com-mais-de-32-caracteres'
process.env.REFRESH_TOKEN_SECRET ??= 'outro-segredo-de-teste-com-mais-de-32-caracteres'

let app: FastifyInstance
let tokenColaborador: string
let tokenVencido: string

const ID = '00000000-0000-4000-8000-000000000000'

beforeAll(async () => {
  const { construirApp } = await import('../src/app.js')
  app = await construirApp({ registrarLogs: false })
  await app.ready()
  tokenColaborador = app.jwt.sign({ sub: ID, papel: 'colaborador' }, { expiresIn: '15m' })
  tokenVencido = app.jwt.sign({ sub: ID, papel: 'moderador', iat: 1_000_000 }, { expiresIn: '15m' })
})

afterAll(() => app.close())

const pedir = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, token?: string, payload?: object) =>
  app.inject({ method, url: `/api/v1${url}`, payload, headers: token ? { authorization: `Bearer ${token}` } : {} })

const rotasDaModeracao = [
  ['GET', '/moderacao/servicos', undefined],
  ['POST', `/moderacao/servicos/${ID}/decisao`, { decisao: 'publicar' }],
  ['GET', '/moderacao/denuncias', undefined],
  ['PATCH', `/moderacao/denuncias/${ID}`, { status: 'resolvida' }],
] as const

describe('rotas da moderação', () => {
  it.each(rotasDaModeracao)('%s %s exige login (401)', async (metodo, url, corpo) => {
    const resposta = await pedir(metodo, url, undefined, corpo)
    expect(resposta.statusCode).toBe(401)
    expect(resposta.json().erro.codigo).toBe('NAO_AUTENTICADO')
  })

  it.each(rotasDaModeracao)('%s %s barra colaborador (403)', async (metodo, url, corpo) => {
    const resposta = await pedir(metodo, url, tokenColaborador, corpo)
    expect(resposta.statusCode).toBe(403)
    expect(resposta.json().erro.codigo).toBe('SEM_PERMISSAO')
  })

  it('recusa token vencido, mesmo de moderador', async () => {
    const resposta = await pedir('GET', '/moderacao/servicos', tokenVencido)
    expect(resposta.statusCode).toBe(401)
  })

  it('recusa token assinado com outro segredo', async () => {
    const falso =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ4IiwicGFwZWwiOiJtb2RlcmFkb3IifQ.assinatura-invalida'
    const resposta = await pedir('GET', '/moderacao/servicos', falso)
    expect(resposta.statusCode).toBe(401)
  })
})

describe('rotas de quem está logado', () => {
  const sugestao = {
    nome: 'Teste', categoria: 'saude', descricao: 'Descrição de teste', endereco: 'Rua A, 1',
    cidade: 'São Paulo', uf: 'SP', horarios: [],
  }

  it.each([
    ['POST', '/servicos', sugestao],
    ['POST', `/servicos/${ID}/confirmacoes`, undefined],
    ['GET', '/me', undefined],
    ['GET', '/me/dados', undefined],
    ['DELETE', '/me', { senha: 'qualquer' }],
  ] as const)('%s %s exige login (401)', async (metodo, url, corpo) => {
    const resposta = await pedir(metodo, url, undefined, corpo)
    expect(resposta.statusCode).toBe(401)
  })
})
