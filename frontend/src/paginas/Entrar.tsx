import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Botao } from '../componentes/Botao'
import Campo from '../componentes/Campo'
import PaginaConta from '../componentes/PaginaConta'
import { entrar } from '../servicos/api'
import { useSessao } from '../servicos/sessao'
import { destinoDepoisDoLogin, mensagemDeFalha } from '../utils/conta'

export default function Entrar() {
  const navegar = useNavigate()
  const { state } = useLocation()
  const sessao = useSessao()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [faltando, setFaltando] = useState(false)

  const envio = useMutation({
    mutationFn: () => entrar(email.trim(), senha),
    onSuccess: () => navegar(destinoDepoisDoLogin(state), { replace: true }),
  })

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!email.trim() || !senha) {
      setFaltando(true)
      return
    }
    setFaltando(false)
    envio.mutate()
  }

  if (sessao.status === 'logado' && !envio.isSuccess) {
    return (
      <PaginaConta titulo="Você já entrou">
        <p className="text-ardosia">Você está usando a conta de {sessao.usuario.nome}.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-azul underline underline-offset-4">
          Voltar para o início
        </Link>
      </PaginaConta>
    )
  }

  const erro = faltando ? 'Preencha o e-mail e a senha.' : envio.isError ? mensagemDeFalha(envio.error) : ''

  return (
    <PaginaConta
      titulo="Entrar"
      subtitulo="Para confirmar e sugerir serviços. Para buscar ajuda, você não precisa de conta."
    >
      <form onSubmit={enviar} noValidate className="grid gap-4">
        <Campo
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <div role="alert">{erro && <p className="font-medium text-erro">{erro}</p>}</div>

        <Botao type="submit" tamanho="lg" larguraTotal disabled={envio.isPending}>
          {envio.isPending ? 'Entrando…' : 'Entrar'}
        </Botao>
      </form>

      <p className="mt-6 text-ardosia">
        Ainda não tem conta?{' '}
        <Link to="/criar-conta" state={state} className="font-semibold text-azul underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </PaginaConta>
  )
}
