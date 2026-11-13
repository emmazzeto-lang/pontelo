import type { ReactNode } from 'react'

// Moldura comum das páginas de conta: coluna estreita e centralizada
export default function PaginaConta({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-md px-4 py-10 md:py-16">
      <h1 className="text-[clamp(1.875rem,4vw,2.5rem)]">{titulo}</h1>
      {subtitulo && <p className="mt-2 text-ardosia">{subtitulo}</p>}
      <div className="mt-8">{children}</div>
    </section>
  )
}
