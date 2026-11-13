export type Horario = {
  dia_semana: number // 0 = domingo ... 6 = sábado
  abre: string // "HH:MM"
  fecha: string // "HH:MM"
}

export type Momento = {
  dia: number // 0 = domingo ... 6 = sábado
  minutos: number // minutos desde a meia-noite
}

const NOMES_DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const SIGLAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Dia e hora em Brasília, independente do fuso do servidor
export function momentoEmSaoPaulo(data = new Date()): Momento {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(data)

  const parte = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '0'
  return {
    dia: SIGLAS_EN.indexOf(parte('weekday')),
    minutos: Number(parte('hour')) * 60 + Number(parte('minute')),
  }
}

function paraMinutos(hora: string) {
  const [h = '0', m = '0'] = hora.split(':')
  return Number(h) * 60 + Number(m)
}

// "11:00" vira "11h" e "11:30" vira "11h30"
export function formatarHora(hora: string) {
  const [h = '0', m = '00'] = hora.split(':')
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}

// Intervalo que atravessa a meia-noite, como 22:00 às 06:00
const viraODia = (h: Horario) => paraMinutos(h.fecha) <= paraMinutos(h.abre)

// Devolve o intervalo aberto agora, ou undefined se estiver fechado
export function intervaloAberto(horarios: Horario[], agora: Momento) {
  const ontem = (agora.dia + 6) % 7

  return horarios.find((h) => {
    const abre = paraMinutos(h.abre)
    const fecha = paraMinutos(h.fecha)

    if (h.dia_semana === agora.dia) {
      return viraODia(h) ? agora.minutos >= abre : agora.minutos >= abre && agora.minutos < fecha
    }
    // Intervalo de ontem que ainda não acabou
    return h.dia_semana === ontem && viraODia(h) && agora.minutos < fecha
  })
}

// Texto curto para o card: "fecha às 14h", "abre amanhã às 8h"...
export function descreverHorarioHoje(horarios: Horario[], agora: Momento) {
  const aberto = intervaloAberto(horarios, agora)
  if (aberto && paraMinutos(aberto.abre) === 0 && paraMinutos(aberto.fecha) >= 23 * 60 + 59) {
    return 'atendimento 24 horas'
  }
  if (aberto) return `fecha às ${formatarHora(aberto.fecha)}`

  const ordenar = (lista: Horario[]) => [...lista].sort((a, b) => paraMinutos(a.abre) - paraMinutos(b.abre))

  const maisTardeHoje = ordenar(horarios.filter((h) => h.dia_semana === agora.dia && paraMinutos(h.abre) > agora.minutos))[0]
  if (maisTardeHoje) return `abre hoje às ${formatarHora(maisTardeHoje.abre)}`

  for (let distancia = 1; distancia <= 7; distancia++) {
    const dia = (agora.dia + distancia) % 7
    const proximo = ordenar(horarios.filter((h) => h.dia_semana === dia))[0]
    if (proximo) {
      const quando = distancia === 1 ? 'amanhã' : NOMES_DIAS[dia]
      return `abre ${quando} às ${formatarHora(proximo.abre)}`
    }
  }

  return 'horário não informado'
}
