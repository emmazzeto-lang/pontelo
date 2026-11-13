import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { z } from 'zod'
import { config } from './config.js'
import { ErroApi } from './erros.js'
import { rotasAlerta } from './rotas/alerta.rotas.js'
import { rotasAuth } from './rotas/auth.rotas.js'
import { rotasColaboracao } from './rotas/colaboracao.rotas.js'
import { rotasModeracao } from './rotas/moderacao.rotas.js'
import { rotasPublicas } from './rotas/publicas.rotas.js'

z.config(z.locales.pt())

export async function construirApp({ registrarLogs = true } = {}) {
  const app = Fastify({
    logger: {
      level: registrarLogs ? 'info' : 'silent',
      // Omite a query string dos logs para não registrar coordenadas ou CEP
      serializers: {
        req: (pedido) => ({ method: pedido.method, url: pedido.url.split('?')[0] }),
      },
    },
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, { origin: config.FRONTEND_URL, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] })
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  await app.register(cookie)
  await app.register(jwt, { secret: config.JWT_SECRET })

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'API do Pontelo',
        description: 'Serviços públicos e gratuitos perto de você. Leitura pública; escrita exige login.',
        version: '1.0.0',
      },
      components: {
        securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      },
    },
    transform: jsonSchemaTransform,
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  app.setErrorHandler((erro, pedido, resposta) => {
    if (erro instanceof ErroApi) {
      return resposta.status(erro.status).send({ erro: { codigo: erro.codigo, mensagem: erro.message } })
    }

    if (hasZodFastifySchemaValidationErrors(erro)) {
      return resposta.status(400).send({
        erro: {
          codigo: 'VALIDACAO_FALHOU',
          mensagem: 'Algum dado enviado está inválido.',
          detalhes: erro.validation.map((v) => ({
            campo: v.instancePath.replace(/^\//, '').replaceAll('/', '.'),
            problema: v.message ?? 'inválido',
          })),
        },
      })
    }

    const status = (erro as { statusCode?: number }).statusCode
    if (status === 429) {
      return resposta.status(429).send({
        erro: { codigo: 'LIMITE_EXCEDIDO', mensagem: 'Muitas requisições. Espere um pouco e tente de novo.' },
      })
    }

    pedido.log.error(erro)
    return resposta.status(500).send({ erro: { codigo: 'ERRO_INTERNO', mensagem: 'Algo deu errado no servidor.' } })
  })

  app.setNotFoundHandler((_pedido, resposta) =>
    resposta.status(404).send({ erro: { codigo: 'ROTA_NAO_ENCONTRADA', mensagem: 'Rota não encontrada.' } }),
  )

  await app.register(rotasPublicas, { prefix: '/api/v1' })
  await app.register(rotasAuth, { prefix: '/api/v1' })
  await app.register(rotasColaboracao, { prefix: '/api/v1' })
  await app.register(rotasModeracao, { prefix: '/api/v1' })
  await app.register(rotasAlerta, { prefix: '/api/v1' })

  return app
}
