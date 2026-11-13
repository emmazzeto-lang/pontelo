import { describe, expect, it } from 'vitest'
import { descreverHorarioHoje, formatarHora, intervaloAberto, momentoEmSaoPaulo, type Horario } from '../src/servicos/horarios.js'

const SEGUNDA = 1
const as = (hora: number, minuto = 0) => hora * 60 + minuto

const almoco: Horario[] = [1, 2, 3, 4, 5].map((dia_semana) => ({ dia_semana, abre: '11:00', fecha: '14:00' }))

describe('intervaloAberto', () => {
  it('está aberto dentro do horário', () => {
    expect(intervaloAberto(almoco, { dia: SEGUNDA, minutos: as(12) })).toBeDefined()
  })

  it('está fechado no minuto exato em que fecha', () => {
    expect(intervaloAberto(almoco, { dia: SEGUNDA, minutos: as(14) })).toBeUndefined()
  })

  it('entende horário que atravessa a meia-noite', () => {
    const noturno: Horario[] = [{ dia_semana: SEGUNDA, abre: '22:00', fecha: '06:00' }]
    expect(intervaloAberto(noturno, { dia: SEGUNDA, minutos: as(23) })).toBeDefined()
    expect(intervaloAberto(noturno, { dia: 2, minutos: as(5) })).toBeDefined()
    expect(intervaloAberto(noturno, { dia: 2, minutos: as(7) })).toBeUndefined()
  })
})

describe('descreverHorarioHoje', () => {
  it('diz quando fecha se estiver aberto', () => {
    expect(descreverHorarioHoje(almoco, { dia: SEGUNDA, minutos: as(12) })).toBe('fecha às 14h')
  })

  it('diz se ainda abre hoje', () => {
    expect(descreverHorarioHoje(almoco, { dia: SEGUNDA, minutos: as(9) })).toBe('abre hoje às 11h')
  })

  it('diz se abre amanhã', () => {
    expect(descreverHorarioHoje(almoco, { dia: SEGUNDA, minutos: as(15) })).toBe('abre amanhã às 11h')
  })

  it('pula o fim de semana', () => {
    const sabado = 6
    expect(descreverHorarioHoje(almoco, { dia: sabado, minutos: as(10) })).toBe('abre segunda às 11h')
  })

  it('reconhece atendimento 24 horas', () => {
    const sempre: Horario[] = [0, 1, 2, 3, 4, 5, 6].map((dia_semana) => ({ dia_semana, abre: '00:00', fecha: '23:59' }))
    expect(descreverHorarioHoje(sempre, { dia: SEGUNDA, minutos: as(3) })).toBe('atendimento 24 horas')
  })

  it('avisa quando não há horário', () => {
    expect(descreverHorarioHoje([], { dia: SEGUNDA, minutos: as(10) })).toBe('horário não informado')
  })
})

describe('formatarHora e momentoEmSaoPaulo', () => {
  it('formata horas cheias e quebradas', () => {
    expect(formatarHora('08:00')).toBe('8h')
    expect(formatarHora('11:30')).toBe('11h30')
  })

  it('converte para o horário de Brasília', () => {
    // 15:00 UTC de uma segunda-feira = 12:00 em São Paulo
    expect(momentoEmSaoPaulo(new Date('2026-11-16T15:00:00Z'))).toEqual({ dia: SEGUNDA, minutos: as(12) })
  })
})
