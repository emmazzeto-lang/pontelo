import { useEffect } from 'react'
import { ENDERECO_CALCULADORA, modoDiscretoAtivo } from '../discreto/preferencias'
import { sairSemEsperar } from '../servicos/api'

const ENDERECO_NEUTRO = 'https://www.google.com/search?q=previsao+do+tempo'

export function sairRapido() {
  sairSemEsperar()
  try {
    sessionStorage.clear()
  } catch {
    // Ignorado quando o sessionStorage está bloqueado
  }
  window.location.replace(modoDiscretoAtivo() ? ENDERECO_CALCULADORA : ENDERECO_NEUTRO)
}

export function useAtalhoSaidaRapida() {
  useEffect(() => {
    function aoApertarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') sairRapido()
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [])
}