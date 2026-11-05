import Icone from './Icone'
import { diasDesde, tempoDecorrido, PRAZO_CONFERENCIA_DIAS } from '../utils/formatar'

type Props = { ultimaVerificacao: string | null }

export default function SeloConfianca({ ultimaVerificacao }: Props) {
  const dias = ultimaVerificacao ? diasDesde(ultimaVerificacao) : null
  const conferido = dias !== null && dias <= PRAZO_CONFERENCIA_DIAS

  let texto = 'Ainda não conferido'
  if (dias !== null) {
    texto = conferido ? `Conferido ${tempoDecorrido(dias)}` : `Sem conferência ${tempoDecorrido(dias)}`
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${conferido ? 'text-verificado' : 'text-a-confirmar'}`}>
      <Icone nome={conferido ? 'elo' : 'eloAberto'} tamanho={18} />
      {texto}
    </span>
  )
}