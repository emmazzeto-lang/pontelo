import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { BotaoLink } from './Botao'
import PaginaConta from './PaginaConta'
import { useSessao, type Usuario } from '../servicos/sessao'

type Props = {
  // Texto para quem ainda não entrou: por que precisa de conta aqui
  motivo: string
  // Se informado, só quem tem esse papel vê o conteúdo
  papel?: Usuario['papel']
  children: (usuario: Usuario) => ReactNode
}

// Mostra o conteúdo só para quem está logado (e com o papel certo); senão, explica e leva para o login
export default function ExigeConta({ motivo, papel, children }: Props) {
  const sessao = useSessao()
  const { pathname } = useLocation()

  if (sessao.status === 'carregando') {
    return (
      <div className="conteudo py-10">
        <p role="status" className="text-ardosia">Carregando…</p>
      </div>
    )
  }

  if (sessao.status === 'anonimo') {
    return (
      <PaginaConta titulo="Entre para continuar" subtitulo={motivo}>
        <BotaoLink para="/entrar" estado={{ de: pathname }} tamanho="lg" larguraTotal>
          Entrar
        </BotaoLink>
        <p className="mt-6 text-ardosia">
          Ainda não tem conta?{' '}
          <Link to="/criar-conta" state={{ de: pathname }} className="font-semibold text-azul underline underline-offset-4">
            Criar conta
          </Link>
        </p>
      </PaginaConta>
    )
  }

  if (papel && sessao.usuario.papel !== papel) {
    return (
      <PaginaConta titulo="Área restrita" subtitulo="Sua conta não tem acesso a esta página.">
        <Link to="/" className="font-semibold text-azul underline underline-offset-4">
          Voltar para o início
        </Link>
      </PaginaConta>
    )
  }

  return children(sessao.usuario)
}
