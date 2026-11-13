import { useCallback, useEffect, useState } from 'react'
import { enviarAlerta } from '../discreto/alerta'
import { lerPreferencias } from '../discreto/preferencias'
import * as conta from './conta'

type Tecla = { rotulo: string; acao: () => void; tipo?: 'operador' | 'funcao' | 'igual'; largura?: 2; nome?: string }

export default function Calculadora() {
  const [estado, setEstado] = useState<conta.Estado>(conta.inicial)

  const pedirSocorro = useCallback(async () => {
    const preferencias = lerPreferencias()
    if (!preferencias) return
    try {
      await enviarAlerta({ apelido: preferencias.apelido, contatos: preferencias.contatos.map((c) => c.email) })
    } catch {
      setEstado(conta.mostrarErro)
    }
  }, [])

  const apertarIgual = useCallback(() => {
    const preferencias = lerPreferencias()
    const codigo = conta.codigoDigitado(estado)

    if (preferencias && codigo === preferencias.codigoAbrir) {
      window.location.assign('/')
      return
    }
    if (preferencias && codigo === preferencias.codigoSocorro) {
      setEstado(conta.igual)
      void pedirSocorro()
      return
    }
    setEstado(conta.igual)
  }, [estado, pedirSocorro])

  useEffect(() => {
    const operadores: Record<string, conta.Operador> = { '+': '+', '-': '−', '*': '×', x: '×', '/': '÷' }
    function aoTeclar(evento: KeyboardEvent) {
      const t = evento.key
      if (/^\d$/.test(t)) setEstado((e) => conta.digito(e, t))
      else if (t === ',' || t === '.') setEstado(conta.virgula)
      else if (operadores[t]) setEstado((e) => conta.operador(e, operadores[t]!))
      else if (t === 'Enter' || t === '=') { evento.preventDefault(); apertarIgual() }
      else if (t === 'Backspace') setEstado(conta.apagarUm)
      else if (t === 'Escape' || t === 'Delete') setEstado(conta.inicial)
      else if (t === '%') setEstado(conta.porcentagem)
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [apertarIgual])

  const num = (d: string): Tecla => ({ rotulo: d, acao: () => setEstado((e) => conta.digito(e, d)) })
  const op = (o: conta.Operador, nome: string): Tecla => ({ rotulo: o, nome, tipo: 'operador', acao: () => setEstado((e) => conta.operador(e, o)) })

  const teclas: Tecla[] = [
    { rotulo: 'C', nome: 'Limpar', tipo: 'funcao', acao: () => setEstado(conta.inicial) },
    { rotulo: '±', nome: 'Inverter sinal', tipo: 'funcao', acao: () => setEstado(conta.inverterSinal) },
    { rotulo: '%', nome: 'Porcentagem', tipo: 'funcao', acao: () => setEstado(conta.porcentagem) },
    op('÷', 'Dividir'),
    num('7'), num('8'), num('9'), op('×', 'Multiplicar'),
    num('4'), num('5'), num('6'), op('−', 'Subtrair'),
    num('1'), num('2'), num('3'), op('+', 'Somar'),
    { ...num('0'), largura: 2 },
    { rotulo: ',', nome: 'Vírgula', acao: () => setEstado(conta.virgula) },
    { rotulo: '=', nome: 'Igual', tipo: 'igual', acao: apertarIgual },
  ]

  const tamanhoFonte = estado.visor.length > 9 ? 'visor visor--pequeno' : 'visor'

  return (
    <main className="calculadora">
      <output className={tamanhoFonte} aria-live="polite">
        {estado.visor}
      </output>
      <div className="teclado">
        {teclas.map((t) => (
          <button
            key={t.rotulo}
            type="button"
            aria-label={t.nome}
            onClick={t.acao}
            className={['tecla', t.tipo && `tecla--${t.tipo}`, t.largura && 'tecla--larga'].filter(Boolean).join(' ')}
          >
            {t.rotulo}
          </button>
        ))}
      </div>
    </main>
  )
}
