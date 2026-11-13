import type { ReactElement } from 'react'

// Cada ícone recebe a cor principal (a) e a cor de destaque (b)
const desenhos = {
  // Categorias: duas cores (a = principal, b = destaque dourado)
  abrigo: (a: string, b: string) => (
    <>
      <path d="M12 2.5 22 10.6V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V10.6Z" fill={a} />
      <path d="M9.5 22v-5.5a2.5 2.5 0 0 1 5 0V22Z" fill={b} />
    </>
  ),
  refeicao: (a: string, b: string) => (
    <>
      <circle cx="12" cy="6.5" r="3.2" fill={b} />
      <path d="M2 11h20a10 9 0 0 1-20 0Z" fill={a} />
      <rect x="6" y="19.5" width="12" height="2.8" rx="1.4" fill={a} />
    </>
  ),
  juridico: (a: string, b: string) => (
    <>
      <rect x="10.9" y="3" width="2.2" height="16.5" rx="1.1" fill={a} />
      <rect x="6" y="19" width="12" height="3" rx="1.5" fill={a} />
      <rect x="3" y="6" width="18" height="2.4" rx="1.2" fill={a} />
      <path d="M8.6 13H1.4a3.6 3.6 0 0 0 7.2 0Z" fill={b} />
      <path d="M22.6 13h-7.2a3.6 3.6 0 0 0 7.2 0Z" fill={b} />
    </>
  ),
  saude: (a: string, b: string) => (
    <>
      <rect x="8.5" y="2.5" width="7" height="19" rx="2.5" fill={a} />
      <rect x="2.5" y="8.5" width="19" height="7" rx="2.5" fill={a} />
      <circle cx="12" cy="12" r="2.3" fill={b} />
    </>
  ),
  cras: (a: string, b: string) => (
    <>
      <circle cx="16.5" cy="6.5" r="3.5" fill={b} />
      <path d="M10 21.5a6.5 7 0 0 1 13 0Z" fill={b} />
      <circle cx="8" cy="6.5" r="3.5" fill={a} />
      <path d="M1 21.5a7 7.5 0 0 1 14 0Z" fill={a} />
    </>
  ),
  documentos: (a: string, b: string) => (
    <>
      <path d="M5 2h9.5L20 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill={a} />
      <rect x="6.5" y="11" width="10" height="2.2" rx="1.1" fill={b} />
      <rect x="6.5" y="15.5" width="6.5" height="2.2" rx="1.1" fill={b} />
    </>
  ),

  // Ações: uma cor só, para funcionar dentro dos botões
  telefone: (a: string) => (
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      fill={a}
    />
  ),
  local: (a: string) => (
    <path
      fillRule="evenodd"
      d="M12 1.5A8.5 8.5 0 0 0 3.5 10c0 6 8.5 12.5 8.5 12.5S20.5 16 20.5 10A8.5 8.5 0 0 0 12 1.5Zm0 11.6a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z"
      fill={a}
    />
  ),
  rota: (a: string) => (
    <path d="M21.5 2.5 2.5 10.6l8.2 2.7 2.7 8.2Z" fill={a} stroke={a} strokeWidth={1.6} strokeLinejoin="round" />
  ),
  relogio: (a: string) => (
    <path
      fillRule="evenodd"
      d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm1.2 5a1.2 1.2 0 0 0-2.4 0V12c0 .4.2.8.6 1l3.6 2.4a1.2 1.2 0 0 0 1.3-2l-3.1-2Z"
      fill={a}
    />
  ),
  busca: (a: string) => (
    <>
      <circle cx="10.5" cy="10.5" r="7" stroke={a} strokeWidth={3} />
      <path d="m16 16 5.5 5.5" stroke={a} strokeWidth={3.2} strokeLinecap="round" />
    </>
  ),
  localizar: (a: string) => (
    <>
      <circle cx="12" cy="12" r="7.5" stroke={a} strokeWidth={2.6} />
      <circle cx="12" cy="12" r="3.2" fill={a} />
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" stroke={a} strokeWidth={2.6} strokeLinecap="round" />
    </>
  ),
  lista: (a: string) => (
    <>
      <rect x="2" y="4" width="20" height="4" rx="2" fill={a} />
      <rect x="2" y="10" width="20" height="4" rx="2" fill={a} />
      <rect x="2" y="16" width="13" height="4" rx="2" fill={a} />
    </>
  ),
  mapa: (a: string, b: string) => (
    <>
      <path d="M2 5.5 8.5 3l7 2.5L22 3v15.5L15.5 21l-7-2.5L2 21Z" fill={a} />
      <path d="M8.5 3v15.5M15.5 5.5V21" stroke={b} strokeWidth={1.6} />
    </>
  ),
  voltar: (a: string) => (
    <path d="M20 12H5M11 5l-7 7 7 7" stroke={a} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
  ),
  denunciar: (a: string) => (
    <>
      <path d="M3.6 2.5h1.6V22H3.6a.8.8 0 0 1-.8-.8V3.3a.8.8 0 0 1 .8-.8Z" fill={a} />
      <path d="M6 3.5c4-2 7 2 11 0 1.4-.7 3 0 3 0v10s-1.6-.7-3 0c-4 2-7-2-11 0Z" fill={a} />
    </>
  ),
  confirmar: (a: string) => (
    <path d="M4 12.5 9.5 18 20 6.5" stroke={a} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  ),

  // Selo do elo
  elo: (a: string) => (
    <>
      <rect x="3.2" y="11.6" width="11.6" height="6.8" rx="3.4" transform="rotate(-45 9 15)" stroke={a} strokeWidth={2.4} />
      <rect x="9.2" y="5.6" width="11.6" height="6.8" rx="3.4" transform="rotate(-45 15 9)" stroke={a} strokeWidth={2.4} />
    </>
  ),
  eloAberto: (a: string) => (
    <>
      <rect x="3.2" y="11.6" width="11.6" height="6.8" rx="3.4" transform="rotate(-45 9 15)" stroke={a} strokeWidth={2.4} />
      <path d="M15.6 4.6l1.2-1.2a3.4 3.4 0 0 1 4.8 4.8l-1.2 1.2" stroke={a} strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),

  // Cabeçalho
  usuario: (a: string, b: string) => (
    <>
      <circle cx="12" cy="7" r="4.5" fill={b} />
      <path d="M3 22a9 8.5 0 0 1 18 0Z" fill={a} />
    </>
  ),
  mais: (a: string) => (
    <path d="M12 6v12M6 12h12" stroke={a} strokeWidth={3.2} strokeLinecap="round" />
  ),
  // Três linhas de larguras diferentes, menos "ícone padrão" que o hambúrguer igual
  menu: (a: string, b: string) => (
    <>
      <path d="M4 6.5h16M4 12h16" stroke={a} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M4 17.5h10" stroke={b} strokeWidth={2.6} strokeLinecap="round" />
    </>
  ),
  fechar: (a: string) => (
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke={a} strokeWidth={2.6} strokeLinecap="round" />
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