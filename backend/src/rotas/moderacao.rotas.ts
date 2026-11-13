import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import * as esquemas from '../esquemas/moderacao.esquemas.js'
import { erroResposta, idServico } from '../esquemas/servicos.esquemas.js'
import { exigirPapel } from '../plugins/autenticacao.js'
import * as moderacao from '../servicos/moderacao.servico.js'

const erros = { 401: erroResposta, 403: erroResposta }
const docs = { tags: ['Moderação'], security: [{ bearer: [] }] }

// Só quem tem papel "moderador" passa daqui
export const rotasModeracao: FastifyPluginAsyncZod = async (app) => {
  app.addHook('preHandler', exigirPapel('moderador'))

  app.get(
    '/moderacao/servicos',
    {
      schema: {
        ...docs,
        summary: 'Fila de serviços por status (padrão: pendentes, do mais antigo ao mais novo)',
        querystring: esquemas.filtroFila,
        response: { 200: esquemas.filaServicos, ...erros },
      },
    },
    async (pedido) => moderacao.fila(pedido.query.status),
  )

  app.post(
    '/moderacao/servicos/:id/decisao',
    {
      schema: {
        ...docs,
        summary: 'Publica, rejeita ou arquiva um serviço',
        params: idServico,
        body: esquemas.decisao,
        response: { 200: esquemas.resultadoDecisao, 404: erroResposta, 409: erroResposta, ...erros },
      },
    },
    async (pedido) => moderacao.decidir(pedido.params.id, pedido.body.decisao, pedido.user.sub, pedido.body.motivo),
  )

  app.get(
    '/moderacao/denuncias',
    {
      schema: {
        ...docs,
        summary: 'Denúncias por status (padrão: abertas)',
        querystring: esquemas.filtroDenuncias,
        response: { 200: esquemas.listaDenuncias, ...erros },
      },
    },
    async (pedido) => moderacao.denuncias(pedido.query.status),
  )

  app.patch(
    '/moderacao/denuncias/:id',
    {
      schema: {
        ...docs,
        summary: 'Muda o status de uma denúncia',
        params: esquemas.idDenuncia,
        body: esquemas.mudancaDenuncia,
        response: { 200: esquemas.denunciaAtualizada, 404: erroResposta, ...erros },
      },
    },
    async (pedido) => moderacao.mudarDenuncia(pedido.params.id, pedido.body.status, pedido.user.sub),
  )
}
