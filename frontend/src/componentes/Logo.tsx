import { Link } from 'react-router'

type Props = { claro?: boolean }

export default function Logo({ claro = false }: Props) {
  return (
    <Link to="/" aria-label="Pontelo, página inicial" className="inline-flex shrink-0 items-center gap-2.5">
      <img src="/simbolo.png" alt="" width={56} height={38} className="h-[38px] w-auto max-[379px]:h-8" />
      <span aria-hidden="true" className="font-titulo text-[28px] font-extrabold tracking-[-0.02em] max-[379px]:text-2xl">
        {claro ? (
          <span className="text-white">Pontelo</span>
        ) : (
          <>
            <span className="text-marinho">Pont</span>
            <span className="text-dourado">e</span>
            <span className="text-dourado-escuro">lo</span>
          </>
        )}
      </span>
    </Link>
  )
}