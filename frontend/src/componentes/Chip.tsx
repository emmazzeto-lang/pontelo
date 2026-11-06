import type { ReactNode } from 'react'
import Icone, { type NomeIcone } from './Icone'
import { cores } from '../estilos/cores'

type Props = {
  ativo: boolean
  aoClicar: () => void
  icone?: NomeIcone
  children: ReactNode
}

export default function Chip({ ativo, aoClicar, icone, children }: Props) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={aoClicar}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] px-4 text-[15px] font-medium transition-colors ${
        ativo ? 'border-marinho bg-marinho text-white' : 'border-nevoa bg-white hover:border-azul'
      }`}
    >
      {icone && (
        <Icone
          nome={icone}
          tamanho={18}
          cor={ativo ? cores.branco : cores.marinho}
          destaque={ativo ? cores.dourado : cores.douradoEscuro}
        />
      )}
      {children}
    </button>
  )
}