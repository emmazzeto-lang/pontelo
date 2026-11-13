import type { ReactNode } from 'react'

type Props = {
  titulo: string
  resumo: string
  children: ReactNode
}

// Moldura das páginas institucionais: coluna de leitura confortável (cerca de 70 caracteres por linha)
export default function PaginaTexto({ titulo, resumo, children }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <h1 className="text-[clamp(2rem,4.5vw,3rem)] tracking-[-0.02em]">{titulo}</h1>
      <p className="mt-4 text-lg text-ardosia md:text-xl">{resumo}</p>
      <div className="mt-10">{children}</div>
    </article>
  )
}

// Um bloco com título dentro da página
export function Topico({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-t border-nevoa py-7">
      <h2 className="text-2xl">{titulo}</h2>
      <div className="mt-3 grid gap-3 text-[17px] leading-relaxed">{children}</div>
    </section>
  )
}
