import type { ReactElement } from 'react'

// Cada ícone recebe a cor principal (a) e a cor de destaque (b)
const desenhos = {
  usuario: (a: string, b: string) => (
    <>
      <circle cx="12" cy="7" r="4.5" fill={b} />
      <path d="M3 22a9 8.5 0 0 1 18 0Z" fill={a} />
    </>
  ),
  mais: (a: string) => (
    <path d="M12 6v12M6 12h12" stroke={a} strokeWidth={3.2} strokeLinecap="round" />
  ),
} satisfies Record<string, (a: string, b: string) => ReactElement>

export type NomeIcone = keyof typeof desenhos

type Props = {
  nome: NomeIcone
  tamanho?: number
  cor?: string
  destaque?: string
  className?: string
}

export default function Icone({ nome, tamanho = 24, cor = 'currentColor', destaque, className }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {desenhos[nome](cor, destaque ?? cor)}
    </svg>
  )
}