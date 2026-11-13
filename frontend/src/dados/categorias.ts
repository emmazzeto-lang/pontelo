import type { NomeIcone } from '../componentes/Icone'
import type { Categoria } from '../servicos/tipos'

export type InfoCategoria = {
  slug: Categoria
  nome: string
  nomeCurto: string
  icone: NomeIcone
  descricao: string
}

export const categorias: InfoCategoria[] = [
  { slug: 'abrigo', nome: 'Abrigo', nomeCurto: 'Abrigo', icone: 'abrigo', descricao: 'Lugar seguro para dormir e se proteger, por uma noite ou mais.' },
  { slug: 'refeitorio', nome: 'Refeição', nomeCurto: 'Refeição', icone: 'refeicao', descricao: 'Refeitórios, cozinhas comunitárias e bancos de alimentos.' },
  { slug: 'juridico', nome: 'Atendimento jurídico', nomeCurto: 'Jurídico', icone: 'juridico', descricao: 'Defensoria pública e orientação gratuita sobre seus direitos.' },
  { slug: 'saude', nome: 'Saúde e vacinação', nomeCurto: 'Saúde', icone: 'saude', descricao: 'Unidades básicas de saúde, vacinação e atendimento gratuito.' },
  { slug: 'cras', nome: 'CRAS', nomeCurto: 'CRAS', icone: 'cras', descricao: 'Centro de Referência de Assistência Social: benefícios e acompanhamento.' },
  { slug: 'documentos', nome: 'Documentos', nomeCurto: 'Documentos', icone: 'documentos', descricao: 'Tirar RG, CPF, carteira de trabalho e segunda via.' },
]

export const categoriaPorSlug = Object.fromEntries(
  categorias.map((c) => [c.slug, c]),
) as Record<Categoria, InfoCategoria>