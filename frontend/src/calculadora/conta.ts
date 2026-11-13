// Lógica da calculadora, separada da tela para poder ser testada.
// Funciona como uma calculadora de bolso: cada operação é feita na hora em que se aperta o próximo operador.

export type Operador = '+' | '−' | '×' | '÷'

export type Estado = {
  visor: string // o que aparece na tela, com vírgula decimal
  acumulado: number | null
  operador: Operador | null
  comecarNovoNumero: boolean
  // Números digitados desde o último operador, "=" ou "C". É aqui que os códigos secretos são reconhecidos.
  digitado: string
}

export const inicial: Estado = { visor: '0', acumulado: null, operador: null, comecarNovoNumero: true, digitado: '' }

const MAX_DIGITOS = 12
const ERRO = 'Erro'

const paraNumero = (visor: string) => Number(visor.replace(',', '.'))

export function formatar(numero: number) {
  if (!Number.isFinite(numero) || Math.abs(numero) >= 1e12) return ERRO
  // Arredonda para não mostrar 0,30000000000000004
  return String(Number(numero.toPrecision(10))).replace('.', ',')
}

function calcular(a: number, b: number, operador: Operador) {
  switch (operador) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? Number.NaN : a / b
  }
}

export function digito(e: Estado, d: string): Estado {
  if (e.visor === ERRO) e = inicial
  if (e.comecarNovoNumero) return { ...e, visor: d, comecarNovoNumero: false, digitado: e.digitado + d }
  if (e.visor.replace(/\D/g, '').length >= MAX_DIGITOS) return e
  return { ...e, visor: e.visor === '0' ? d : e.visor + d, digitado: e.digitado + d }
}

export function virgula(e: Estado): Estado {
  if (e.visor === ERRO) e = inicial
  if (e.comecarNovoNumero) return { ...e, visor: '0,', comecarNovoNumero: false }
  return e.visor.includes(',') ? e : { ...e, visor: e.visor + ',' }
}

export function operador(e: Estado, op: Operador): Estado {
  if (e.visor === ERRO) return e
  const atual = paraNumero(e.visor)
  // Trocar de operador sem digitar número novo só troca o operador
  if (e.operador && e.comecarNovoNumero) return { ...e, operador: op, digitado: '' }
  const resultado = e.operador && e.acumulado !== null ? calcular(e.acumulado, atual, e.operador) : atual
  const visor = formatar(resultado)
  return { visor, acumulado: visor === ERRO ? null : resultado, operador: visor === ERRO ? null : op, comecarNovoNumero: true, digitado: '' }
}

export function igual(e: Estado): Estado {
  if (e.visor === ERRO || !e.operador || e.acumulado === null) return { ...e, comecarNovoNumero: true, digitado: '' }
  const visor = formatar(calcular(e.acumulado, paraNumero(e.visor), e.operador))
  return { visor, acumulado: null, operador: null, comecarNovoNumero: true, digitado: '' }
}

export function porcentagem(e: Estado): Estado {
  if (e.visor === ERRO) return e
  return { ...e, visor: formatar(paraNumero(e.visor) / 100), comecarNovoNumero: true }
}

export function inverterSinal(e: Estado): Estado {
  if (e.visor === ERRO || e.visor === '0') return e
  return { ...e, visor: e.visor.startsWith('-') ? e.visor.slice(1) : `-${e.visor}` }
}

export function apagarUm(e: Estado): Estado {
  if (e.visor === ERRO || e.comecarNovoNumero) return e
  const visor = e.visor.length <= 1 || (e.visor.length === 2 && e.visor.startsWith('-')) ? '0' : e.visor.slice(0, -1)
  return { ...e, visor, digitado: e.digitado.slice(0, -1) }
}

// Ao apertar "=": foi digitado um código secreto, sozinho, sem conta pendente?
export function codigoDigitado(e: Estado) {
  return e.operador === null && e.digitado.length > 0 ? e.digitado : null
}

export const mostrarErro = (): Estado => ({ ...inicial, visor: ERRO })
