import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router'
import Icone, { type NomeIcone } from './Icone'

type Variante = 'acao' | 'primario' | 'suave' | 'confirmar' | 'claro'
type Tamanho = 'md' | 'lg'

type Estilo = {
  variante?: Variante
  tamanho?: Tamanho
  larguraTotal?: boolean
  icone?: NomeIcone
}

const cores: Record<Variante, string> = {
  acao: 'bg-dourado text-marinho hover:bg-dourado-hover active:bg-dourado-escuro',
  primario: 'bg-azul text-white hover:bg-azul-hover active:bg-marinho',
  suave: 'bg-azul-claro text-marinho hover:bg-nevoa',
  confirmar: 'bg-verde-claro text-verificado hover:brightness-95',
  claro: 'bg-white text-marinho hover:bg-azul-claro',
}

const tamanhos: Record<Tamanho, string> = {
  md: 'min-h-12 gap-2 px-5 text-base',
  lg: 'min-h-14 gap-2.5 px-7 text-lg',
}

function montarClasses({ variante = 'primario', tamanho = 'md', larguraTotal = false }: Estilo, extra = '') {
  return [
    'inline-flex items-center justify-center rounded-[14px] font-titulo font-extrabold transition-colors',
    'disabled:pointer-events-none disabled:opacity-45',
    cores[variante],
    tamanhos[tamanho],
    larguraTotal ? 'w-full' : '',
    extra,
  ].join(' ')
}

function Conteudo({ icone, tamanho, children }: Estilo & { children: ReactNode }) {
  return (
    <>
      {icone && <Icone nome={icone} tamanho={tamanho === 'lg' ? 22 : 20} />}
      {children}
    </>
  )
}

// Para ações na própria página (enviar, confirmar...)
type BotaoProps = Estilo & ComponentProps<'button'>

export function Botao({ variante, tamanho, larguraTotal, icone, className, children, type = 'button', ...resto }: BotaoProps) {
  return (
    <button type={type} className={montarClasses({ variante, tamanho, larguraTotal }, className)} {...resto}>
      <Conteudo icone={icone} tamanho={tamanho}>{children}</Conteudo>
    </button>
  )
}

// Para navegar: "para" (página do site) ou "href" (telefone, mapa, site externo)
type BotaoLinkProps = Estilo & {
  children: ReactNode
  className?: string
  novaAba?: boolean
  // Só para "para": dados que a próxima página recebe sem aparecer no endereço
  estado?: unknown
} & ({ para: string; href?: undefined } | { href: string; para?: undefined })

export function BotaoLink(props: BotaoLinkProps) {
  const { variante, tamanho, larguraTotal, icone, className, children, novaAba, estado } = props
  const classes = montarClasses({ variante, tamanho, larguraTotal }, className)
  const conteudo = <Conteudo icone={icone} tamanho={tamanho}>{children}</Conteudo>

  if (props.para !== undefined) {
    return <Link to={props.para} state={estado} className={classes}>{conteudo}</Link>
  }

  return (
    <a
      href={props.href}
      className={classes}
      {...(novaAba && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {conteudo}
    </a>
  )
}