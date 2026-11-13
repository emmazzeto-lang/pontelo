import { useEffect } from 'react'
import { ENDERECO_CALCULADORA, modoDiscretoAtivo } from '../discreto/preferencias'
import { sairSemEsperar } from '../servicos/api'

// Página neutra para onde a pessoa vai ao sair
const ENDERECO_NEUTRO = 'https://www.google.com/search?q=previsao+do+tempo'

export function sairRapido() {
  // Encerra a conta neste aparelho: quem abrir o site depois não entra logado como a pessoa
  sairSemEsperar()
  try {
    sessionStorage.clear()
  } catch {
    // navegador bloqueou o acesso; sai mesmo assim
  }
  // replace (e não href) para o botão "voltar" não trazer a pessoa de volta.
  // Com o modo discreto ativo, volta para a calculadora; senão, para uma página neutra.
  window.location.replace(modoDiscretoAtivo() ? ENDERECO_CALCULADORA : ENDERECO_NEUTRO)
}

// Atalho: tecla Esc em qualquer página
export function useAtalhoSaidaRapida() {
  useEffect(() => {
    function aoApertarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') sairRapido()
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [])
}