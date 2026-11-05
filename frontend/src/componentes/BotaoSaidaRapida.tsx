import { sairRapido } from '../hooks/useSaidaRapida'

type Props = { compacto?: boolean }

export default function BotaoSaidaRapida({ compacto = false }: Props) {
  return (
    <button
      type="button"
      onClick={sairRapido}
      aria-label="Saída rápida: sai do site agora. Atalho: tecla Esc"
      className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-erro px-3.5 font-titulo text-sm font-extrabold text-white transition hover:brightness-110"
    >
      {compacto ? 'Sair' : 'Saída rápida'}
      {!compacto && (
        <kbd className="rounded-[5px] border border-white/60 px-1.5 font-texto text-[11px] font-bold">
          Esc
        </kbd>
      )}
    </button>
  )
}