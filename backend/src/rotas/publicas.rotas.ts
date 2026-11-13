import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import * as esquemas from '../esquemas/servicos.esquemas.js'
import { listarCategorias } from '../repositorios/servicos.repositorio.js'
import { geocodificar } from '../servicos/geocodificacao.servico.js'
import * as servicos from '../servicos/servicos.servico.js'

export const rotasPublicas: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/categorias',
    {
      schema: {
        tags: ['Leitura pública'],
        summary: 'Lista as categorias',
        response: { 200: esquemas.listaCategorias },
      },
    },
    async () => ({ dados: await listarCategorias() }),
  )

  app.get(
    '/servicos',
    {
      schema: {
        tags: ['Leitura pública'],
        summary: 'Serviços publicados perto de um ponto, do mais próximo ao mais distante',
        querystring: esquemas.buscaServicos,
        response: { 200: esquemas.listaServicos, 400: esquemas.erroResposta },
      },
    },
    async (pedido) => servicos.listarProximos(pedido.query),
  )

  app.get(
    '/servicos/:id',
    {
      schema: {
        tags: ['Leitura pública'],
        summary: 'Detalhes de um serviço, com horários e selo de confiança',
        params: esquemas.idServico,
        response: { 200: esquemas.detalheServico, 404: esquemas.erroResposta },
      },
    },
    async (pedido) => servicos.detalhar(pedido.params.id),
  )

  app.get(
    '/geocodificar',
    {
      schema: {
        tags: ['Leitura pública'],
        summary: 'Converte CEP ou endereço em latitude e longitude, com cache',
        querystring: esquemas.buscaGeocodificacao,
        response: { 200: esquemas.coordenadas, 404: esquemas.erroResposta },
      },
    },
    async (pedido) => geocodificar(pedido.query),
  )

  app.post(
    '/servicos/:id/denuncias',
    {
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
      schema: {
        tags: ['Leitura pública'],
        summary: 'Reporta informação errada ou serviço fechado (anônimo)',
        params: esquemas.idServico,
        body: esquemas.novaDenuncia,
        response: { 201: z.object({ dados: z.object({ recebida: z.boolean() }) }), 404: esquemas.erroResposta },
      },
    },
    async (pedido, resposta) => {
      await servicos.denunciar(pedido.params.id, pedido.body.motivo, pedido.body.descricao)
      return resposta.status(201).send({ dados: { recebida: true } })
    },
  )

  app.get(
    '/dados/servicos.geojson',
    {
      schema: {
        tags: ['Dados abertos'],
        summary: 'Todos os serviços publicados em GeoJSON (sem os de endereço sigiloso)',
      },
    },
    async (_pedido, resposta) => {
      resposta
        .type('application/geo+json; charset=utf-8')
        .header('Access-Control-Allow-Origin', '*')
        .header('Cache-Control', 'public, max-age=3600')
      return servicos.exportarGeoJson()
    },
  )
}
