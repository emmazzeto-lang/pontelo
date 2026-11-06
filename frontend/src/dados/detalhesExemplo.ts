import { servicosExemplo } from './servicosExemplo'
import type { Horario, ServicoDetalhe } from '../servicos/tipos'

function deSegundaASexta(abre: string, fecha: string): Horario[] {
  return [1, 2, 3, 4, 5].map((dia_semana) => ({ dia_semana, abre, fecha }))
}

const sabado = (abre: string, fecha: string): Horario => ({ dia_semana: 6, abre, fecha })

type Extras = Pick<ServicoDetalhe, 'descricao' | 'cep' | 'documentos_exigidos' | 'horarios'>

const extras: Record<string, Extras> = {
  '1': { descricao: 'Almoço gratuito preparado por voluntários, sem necessidade de cadastro.', cep: '01000000', documentos_exigidos: null, horarios: [...deSegundaASexta('11:00', '14:00'), sabado('11:00', '13:00')] },
  '2': { descricao: 'Refeições gratuitas no almoço. Atende também famílias com crianças.', cep: '01310000', documentos_exigidos: null, horarios: deSegundaASexta('11:30', '15:00') },
  '3': { descricao: 'Entrega de cestas de alimentos para famílias da região.', cep: '01040000', documentos_exigidos: 'Um documento com foto e comprovante de endereço, se tiver.', horarios: deSegundaASexta('08:00', '12:00') },
  '4': { descricao: 'Acolhimento noturno para adultos, com banho e cama.', cep: '01100000', documentos_exigidos: null, horarios: [0, 1, 2, 3, 4, 5, 6].map((dia_semana) => ({ dia_semana, abre: '17:00', fecha: '22:00' })) },
  '5': { descricao: 'Orientação jurídica gratuita para quem não pode pagar advogado.', cep: '01002000', documentos_exigidos: 'RG e CPF. Sem documentos, a equipe orienta como conseguir.', horarios: deSegundaASexta('09:00', '16:00') },
  '6': { descricao: 'Consultas, vacinação e atendimento básico de saúde pelo SUS.', cep: '01305000', documentos_exigidos: 'Cartão do SUS, se tiver. Ninguém deixa de ser atendido por não ter.', horarios: deSegundaASexta('07:00', '17:00') },
  '7': { descricao: 'Orientação sobre benefícios sociais e acompanhamento de famílias.', cep: '01206000', documentos_exigidos: 'CPF e comprovante de endereço, se tiver.', horarios: deSegundaASexta('08:00', '16:00') },
  '8': { descricao: 'Emissão de RG, CPF, carteira de trabalho e segunda via.', cep: '04101000', documentos_exigidos: 'Certidão de nascimento ou casamento.', horarios: deSegundaASexta('09:00', '16:00') },
  '9': { descricao: 'Cozinha comunitária com almoço gratuito de segunda a sexta.', cep: '01139000', documentos_exigidos: null, horarios: deSegundaASexta('11:00', '13:00') },
}

// Na Etapa 8, isso será trocado por GET /servicos/{id}
export function buscarDetalheExemplo(id: string): ServicoDetalhe | null {
  const servico = servicosExemplo.find((s) => s.id === id)
  if (!servico) return null
  return { ...servico, ...extras[id], cidade: 'São Paulo', uf: 'SP' }
}