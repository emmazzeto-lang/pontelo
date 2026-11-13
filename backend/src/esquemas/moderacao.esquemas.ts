import { z } from 'zod'
import { slugsCategoria } from './servicos.esquemas.js'

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato HH:MM')

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null)

export const horario = z
  .object({ dia_semana: z.number().int().min(0).max(6), abre: hora, fecha: hora })
  .refine((h) => h.abre !== h.fecha, { message: 'Abertura e fechamento não podem ser iguais', path: ['fecha'] })

export const novoServico = z.object({
  nome: z.string().trim().min(3, 'Informe o nome do serviço.').max(120),
  categoria: z.enum(slugsCategoria, { error: 'Escolha uma categoria.' }),
  descricao: z.string().trim().min(10, 'Conte em uma frase o que o serviço oferece.').max(1000),
  endereco: z.string().trim().min(5, 'Informe rua e número.').max(200),
  cidade: z.string().trim().min(2, 'Informe a cidade.').max(100),
  uf: z.enum(UFS, { error: 'Escolha o estado.' }),
  cep: z
    .string()
    .optional()
    .transform((v) => v?.replace(/\D/g, '') || null)
    .refine((v) => v === null || v.length === 8, 'O CEP tem 8 números.'),
  telefone: textoOpcional(30).refine((v) => v === null || /^[\d\s()+-]{8,30}$/.test(v), 'Telefone inválido.'),
  documentos_exigidos: textoOpcional(500),
  endereco_restrito: z.boolean().default(false).describe('Abrigo sigiloso: o endereço não aparece em público'),
  horarios: z.array(horario).max(21),
})

export const servicoCriado = z.object({
  dados: z.object({ id: z.string(), status: z.literal('pendente') }),
})

export const filtroFila = z.object({
  status: z.enum(['pendente', 'publicado', 'rejeitado', 'arquivado']).default('pendente'),
})

export const servicoModeracao = z.object({
  id: z.string(),
  nome: z.string(),
  categoria: z.string(),
  descricao: z.string().nullable(),
  endereco: z.string(),
  endereco_restrito: z.boolean(),
  cidade: z.string(),
  uf: z.string(),
  cep: z.string().nullable(),
  telefone: z.string().nullable(),
  documentos_exigidos: z.string().nullable(),
  status: z.string(),
  criado_em: z.string(),
  localizacao: z.object({ lat: z.number(), lng: z.number() }),
  horarios: z.array(z.object({ dia_semana: z.number(), abre: z.string(), fecha: z.string() })),
  denuncias_abertas: z.number(),
})

export const filaServicos = z.object({ dados: z.array(servicoModeracao) })

export const decisao = z.object({
  decisao: z.enum(['publicar', 'rejeitar', 'arquivar']),
  motivo: z.string().trim().max(500).optional(),
})

export const resultadoDecisao = z.object({
  dados: z.object({ id: z.string(), status: z.string() }),
})

export const filtroDenuncias = z.object({
  status: z.enum(['aberta', 'em_analise', 'resolvida', 'descartada']).default('aberta'),
})

export const denunciaModeracao = z.object({
  id: z.string(),
  motivo: z.string(),
  descricao: z.string().nullable(),
  status: z.string(),
  criado_em: z.string(),
  servico: z.object({ id: z.string(), nome: z.string(), status: z.string() }),
})

export const listaDenuncias = z.object({ dados: z.array(denunciaModeracao) })

export const idDenuncia = z.object({ id: z.uuid() })

export const mudancaDenuncia = z.object({
  status: z.enum(['em_analise', 'resolvida', 'descartada']),
})

export const denunciaAtualizada = z.object({
  dados: z.object({ id: z.string(), status: z.string() }),
})
