import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
import { PrismaClient } from '../src/generated/prisma/client.js'

const { DATABASE_URL, SEED_EMAIL_MODERADOR, SEED_SENHA_MODERADOR } = process.env
if (!DATABASE_URL || !SEED_EMAIL_MODERADOR || !SEED_SENHA_MODERADOR) {
  throw new Error('Defina DATABASE_URL, SEED_EMAIL_MODERADOR e SEED_SENHA_MODERADOR no .env')
}

const banco = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) })

type Intervalo = [dias: number[], abre: string, fecha: string]
const UTEIS = [1, 2, 3, 4, 5]
const TODOS = [0, 1, 2, 3, 4, 5, 6]

type Exemplo = {
  nome: string
  categoria: string
  descricao: string
  endereco: string
  cep: string | null
  lat: number
  lng: number
  telefone: string | null
  documentos: string | null
  conferidoHaDias: number | null
  horarios: Intervalo[]
  restrito?: boolean
}

const exemplos: Exemplo[] = [
  { nome: 'Cozinha Comunitária Esperança', categoria: 'refeitorio', descricao: 'Almoço gratuito preparado por voluntários, sem necessidade de cadastro.', endereco: 'Rua das Flores, 120 · Centro', cep: '01000000', lat: -23.556, lng: -46.639, telefone: '1133330000', documentos: null, conferidoHaDias: 12, horarios: [[UTEIS, '11:00', '14:00'], [[6], '11:00', '13:00']] },
  { nome: 'Refeitório Solidário São José', categoria: 'refeitorio', descricao: 'Refeições gratuitas no almoço. Atende também famílias com crianças.', endereco: 'Av. Brasil, 845 · Bela Vista', cep: '01310000', lat: -23.561, lng: -46.645, telefone: '1133331111', documentos: null, conferidoHaDias: 3, horarios: [[UTEIS, '11:30', '15:00']] },
  { nome: 'Banco de Alimentos Mãos Unidas', categoria: 'refeitorio', descricao: 'Entrega de cestas de alimentos para famílias da região.', endereco: 'Rua Ipiranga, 33 · República', cep: '01040000', lat: -23.544, lng: -46.642, telefone: null, documentos: 'Um documento com foto e comprovante de endereço, se tiver.', conferidoHaDias: 125, horarios: [[UTEIS, '08:00', '12:00']] },
  { nome: 'Casa de Acolhida Novo Caminho', categoria: 'abrigo', descricao: 'Acolhimento noturno para adultos, com banho e cama.', endereco: 'Rua da Paz, 410 · Luz', cep: '01100000', lat: -23.535, lng: -46.636, telefone: '1133332222', documentos: null, conferidoHaDias: 20, horarios: [[TODOS, '17:00', '07:00']] },
  { nome: 'Defensoria Comunitária do Centro', categoria: 'juridico', descricao: 'Orientação jurídica gratuita para quem não pode pagar advogado.', endereco: 'Rua Direita, 77 · Sé', cep: '01002000', lat: -23.549, lng: -46.633, telefone: '1133333333', documentos: 'RG e CPF. Sem documentos, a equipe orienta como conseguir.', conferidoHaDias: 45, horarios: [[UTEIS, '09:00', '16:00']] },
  { nome: 'Unidade Básica de Saúde Vila Nova', categoria: 'saude', descricao: 'Consultas, vacinação e atendimento básico de saúde pelo SUS.', endereco: 'Rua Augusta, 900 · Consolação', cep: '01305000', lat: -23.552, lng: -46.65, telefone: '1133334444', documentos: 'Cartão do SUS, se tiver. Ninguém deixa de ser atendido por não ter.', conferidoHaDias: 6, horarios: [[UTEIS, '07:00', '17:00']] },
  { nome: 'CRAS Região Central', categoria: 'cras', descricao: 'Orientação sobre benefícios sociais e acompanhamento de famílias.', endereco: 'Av. Rio Branco, 1500 · Campos Elíseos', cep: '01206000', lat: -23.531, lng: -46.645, telefone: '1133335555', documentos: 'CPF e comprovante de endereço, se tiver.', conferidoHaDias: 30, horarios: [[UTEIS, '08:00', '16:00']] },
  { nome: 'Posto de Documentos Cidadão', categoria: 'documentos', descricao: 'Emissão de RG, CPF, carteira de trabalho e segunda via.', endereco: 'Rua Vergueiro, 2000 · Vila Mariana', cep: '04101000', lat: -23.583, lng: -46.637, telefone: null, documentos: 'Certidão de nascimento ou casamento.', conferidoHaDias: 100, horarios: [[UTEIS, '09:00', '16:00']] },
  { nome: 'Cozinha Solidária Vila Esperança', categoria: 'refeitorio', descricao: 'Cozinha comunitária com almoço gratuito de segunda a sexta.', endereco: 'Rua do Bosque, 58 · Barra Funda', cep: '01139000', lat: -23.525, lng: -46.667, telefone: '1133336666', documentos: null, conferidoHaDias: 15, horarios: [[UTEIS, '11:00', '13:00']] },
  { nome: 'Casa Abrigo para Mulheres', categoria: 'abrigo', descricao: 'Acolhimento sigiloso para mulheres em situação de violência e seus filhos. Ligue para combinar o atendimento.', endereco: 'Endereço sigiloso (exemplo)', cep: null, lat: -23.558, lng: -46.628, telefone: '1133337777', documentos: null, conferidoHaDias: 8, horarios: [[TODOS, '00:00', '23:59']], restrito: true },
]

async function principal() {
  const email = SEED_EMAIL_MODERADOR!.toLowerCase()
  const moderador =
    (await banco.usuarios.findFirst({ where: { email } })) ??
    (await banco.usuarios.create({
      data: { nome: 'Moderação Pontelo', email, senha_hash: await argon2.hash(SEED_SENHA_MODERADOR!), papel: 'moderador' },
    }))

  await banco.servicos.deleteMany({ where: { criado_por: moderador.id } })

  const categorias = new Map((await banco.categorias.findMany()).map((c) => [c.slug, c.id]))

  for (const e of exemplos) {
    const categoriaId = categorias.get(e.categoria)
    if (!categoriaId) throw new Error(`Categoria inexistente: ${e.categoria}`)

    const [criado] = await banco.$queryRaw<{ id: string }[]>`
      INSERT INTO servicos (nome, descricao, categoria_id, endereco, endereco_restrito, cidade, uf, cep,
                            localizacao, telefone, documentos_exigidos, status, ultima_verificacao_em, criado_por)
      VALUES (${e.nome}, ${e.descricao}, ${categoriaId}, ${e.endereco}, ${e.restrito ?? false}, 'São Paulo', 'SP', ${e.cep},
              ST_SetSRID(ST_MakePoint(${e.lng}, ${e.lat}), 4326)::geography, ${e.telefone}, ${e.documentos}, 'publicado',
              ${e.conferidoHaDias === null ? null : new Date(Date.now() - e.conferidoHaDias * 86_400_000)},
              ${moderador.id}::uuid)
      RETURNING id`
    if (!criado) throw new Error('Falha ao criar serviço')

    await banco.horarios_funcionamento.createMany({
      data: e.horarios.flatMap(([dias, abre, fecha]) =>
        dias.map((dia_semana) => ({
          servico_id: criado.id,
          dia_semana,
          abre: new Date(`1970-01-01T${abre}:00Z`),
          fecha: new Date(`1970-01-01T${fecha}:00Z`),
        })),
      ),
    })
  }

  console.log(`Pronto: ${exemplos.length} serviços de exemplo e o usuário moderador ${email}.`)
}

await principal()
await banco.$disconnect()
