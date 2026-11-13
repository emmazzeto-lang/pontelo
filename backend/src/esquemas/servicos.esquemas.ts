import { z } from 'zod'

// Os mesmos esquemas validam a entrada E geram a documentação do Swagger em /docs

export const slugsCategoria = ['abrigo', 'refeitorio', 'juridico', 'saude', 'cras', 'documentos'] as const

export const erroResposta = z.object({
  erro: z.object({
    codigo: z.string(),
    mensagem: z.string(),
    detalhes: z.array(z.object({ campo: z.string(), problema: z.string() })).optional(),
  }),
})

export const buscaServicos = z.object({
  lat: z.coerce.number().min(-90).max(90).describe('Latitude de quem busca'),
  lng: z.coerce.number().min(-180).max(180).describe('Longitude de quem busca'),
  raio: z.coerce.number().int().min(100).max(50000).default(3000).describe('Raio em metros'),
  categoria: z.enum(slugsCategoria).optional(),
  aberto_agora: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true')
    .describe('Só serviços abertos agora'),
})

export const idServico = z.object({ id: z.uuid() })

const localizacao = z.object({ lat: z.number(), lng: z.number() }).nullable()

const servicoResumo = z.object({
  id: z.string(),
  nome: z.string(),
  categoria: z.string(),
  distancia_m: z.number().nullable(),
  aberto_agora: z.boolean(),
  horario_hoje: z.string(),
  endereco: z.string().nullable().describe('null quando o endereço é restrito'),
  endereco_restrito: z.boolean(),
  cidade: z.string(),
  uf: z.string(),
  telefone: z.string().nullable(),
  ultima_verificacao_em: z.string().nullable(),
  localizacao: localizacao.describe('null quando o endereço é restrito'),
})

export const listaServicos = z.object({
  dados: z.array(servicoResumo),
  pagina: z.number(),
  total: z.number(),
})

export const detalheServico = z.object({
  dados: servicoResumo.extend({
    descricao: z.string(),
    cep: z.string().nullable(),
    documentos_exigidos: z.string().nullable(),
    horarios: z.array(z.object({ dia_semana: z.number(), abre: z.string(), fecha: z.string() })),
  }),
})

export const novaDenuncia = z.object({
  motivo: z.enum([
    'O serviço fechou',
    'O telefone está errado',
    'O endereço está errado',
    'O horário está errado',
    'Outro problema',
  ]),
  descricao: z.string().max(500).optional(),
})

export const buscaGeocodificacao = z
  .object({
    cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve ter 8 números').optional(),
    q: z.string().trim().min(3).max(200).optional(),
  })
  .refine((v) => v.cep || v.q, { message: 'Informe cep ou q' })

export const coordenadas = z.object({ lat: z.number(), lng: z.number() })

export const listaCategorias = z.object({
  dados: z.array(z.object({ slug: z.string(), nome: z.string() })),
})
