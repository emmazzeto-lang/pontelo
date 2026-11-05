const UM_DIA_MS = 24 * 60 * 60 * 1000

// Regra do selo (seção 6 da documentação): conferido se foi há até 90 dias
export const PRAZO_CONFERENCIA_DIAS = 90

export function diasDesde(dataIso: string, agora = new Date()) {
  return Math.floor((agora.getTime() - new Date(dataIso).getTime()) / UM_DIA_MS)
}

export function tempoDecorrido(dias: number) {
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'há 1 dia'
  if (dias < 30) return `há ${dias} dias`
  const meses = Math.floor(dias / 30)
  return meses === 1 ? 'há 1 mês' : `há ${meses} meses`
}

export function formatarDistancia(metros: number) {
  if (metros < 1000) return `${Math.round(metros / 10) * 10} m`
  const km = (metros / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  return `${km} km`
}