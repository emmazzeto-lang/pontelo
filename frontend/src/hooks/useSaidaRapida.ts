import { useEffect } from 'react'

// Página neutra para onde a pessoa vai ao sair
const ENDERECO_NEUTRO = 'https://www.google.com/search?q=previsao+do+tempo'

export function sairRapido() {
  try {
    sessionStorage.clear()
  } catch {
    // navegador bloqueou o acesso; sai mesmo assim
  }
  // replace (e não href) para o botão "voltar" não trazer a pessoa de volta
  window.location.replace(ENDERECO_NEUTRO)
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