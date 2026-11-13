import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Botao } from '../componentes/Botao'
import Campo from '../componentes/Campo'
import { cadastrar, ErroApi } from '../servicos/api'
import PaginaConta from '../componentes/PaginaConta'
import { destinoDepoisDoLogin, mensagemDeFalha } from '../utils/conta'

type Erros = Partial<Record<'nome' | 'email' | 'senha' | 'aceite_privacidade', string>>

// As mesmas regras da API, conferidas antes de enviar para a pessoa não esperar à toa
function validar(nome: string, email: string, senha: string, aceite: boolean): Erros {
  const erros: Erros = {}
  if (nome.trim().length < 2) erros.nome = 'Informe seu nome ou um apelido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) erros.email = 'Informe um e-mail válido.'
  if (senha.length < 8) erros.senha = 'A senha precisa ter pelo menos 8 caracteres.'
  if (!aceite) erros.aceite_privacidade = 'É preciso aceitar a política de privacidade.'
  return erros
}

// Erros por campo que vieram da API (VALIDACAO_FALHOU)
function errosDaApi(erro: Error | null): Erros {
  if (erro instanceof ErroApi && erro.codigo === 'EMAIL_EM_USO') return { email: erro.message }
  if (!(erro instanceof ErroApi) || erro.codigo !== 'VALIDACAO_FALHOU') return {}
  return Object.fromEntries(erro.detalhes.map((d) => [d.campo, d.problema]))
}

export default function CriarConta() {
  const navegar = useNavigate()
  const { state } = useLocation()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [aceite, setAceite] = useState(false)
  const [erros, setErros] = useState<Erros>({})

  const envio = useMutation({
    mutationFn: () => cadastrar(nome.trim(), email.trim(), senha),
    onSuccess: () => navegar(destinoDepoisDoLogin(state), { replace: true }),
    onError: (falha) => setErros(errosDaApi(falha)),
  })

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const encontrados = validar(nome, email, senha, aceite)
    setErros(encontrados)
    if (Object.keys(encontrados).length === 0) envio.mutate()
  }

  const temErroDeCampo = Object.keys(erros).length > 0
  const erroGeral = envio.isError && !temErroDeCampo ? mensagemDeFalha(envio.error) : ''

  return (
    <PaginaConta
      titulo="Criar conta"
      subtitulo="Com uma conta você confirma que um serviço ainda funciona e sugere novos lugares."
    >
      <form onSubmit={enviar} noValidate className="grid gap-4">
        <Campo
          rotulo="Nome ou apelido"
          dica="Não aparece para outras pessoas."
          autoComplete="nickname"
          maxLength={80}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          erro={erros.nome}
        />
        <Campo
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          erro={erros.email}
        />
        <div>
          <Campo
            rotulo="Senha"
            dica="Pelo menos 8 caracteres."
            type={mostrarSenha ? 'text' : 'password'}
            autoComplete="new-password"
            maxLength={128}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            erro={erros.senha}
          />
          <label className="mt-1 flex min-h-11 items-center gap-3 text-ardosia">
            <input
              type="checkbox"
              checked={mostrarSenha}
              onChange={(e) => setMostrarSenha(e.target.checked)}
              className="size-5 accent-azul"
            />
            Mostrar senha
          </label>
        </div>

        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={aceite}
              onChange={(e) => setAceite(e.target.checked)}
              aria-invalid={erros.aceite_privacidade ? true : undefined}
              className="mt-0.5 size-5 shrink-0 accent-azul"
            />
            <span>
              Li e aceito a{' '}
              <Link to="/privacidade" target="_blank" className="font-semibold text-azul underline underline-offset-4">
                política de privacidade
              </Link>
              . Usamos seu e-mail só para você entrar na conta.
            </span>
          </label>
          {erros.aceite_privacidade && (
            <p className="mt-1 text-sm font-medium text-erro">{erros.aceite_privacidade}</p>
          )}
        </div>

        <div role="alert">
          {temErroDeCampo && <p className="font-medium text-erro">Confira os campos marcados acima.</p>}
          {erroGeral && <p className="font-medium text-erro">{erroGeral}</p>}
        </div>

        <Botao type="submit" tamanho="lg" larguraTotal disabled={envio.isPending}>
          {envio.isPending ? 'Criando conta…' : 'Criar conta'}
        </Botao>
      </form>

      <p className="mt-6 text-ardosia">
        Já tem conta?{' '}
        <Link to="/entrar" state={state} className="font-semibold text-azul underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </PaginaConta>
  )
}
