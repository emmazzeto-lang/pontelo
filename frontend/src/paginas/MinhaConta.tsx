import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Botao } from '../componentes/Botao'
import Campo from '../componentes/Campo'
import ExigeConta from '../componentes/ExigeConta'
import { baixarMeusDados, ErroApi, excluirConta, sair } from '../servicos/api'
import type { Usuario } from '../servicos/sessao'

const NOMES_PAPEL: Record<Usuario['papel'], string> = {
  colaborador: 'Colaborador',
  organizacao: 'Organização',
  moderador: 'Moderação',
}

export default function MinhaConta() {
  return (
    <ExigeConta motivo="Entre para ver, baixar ou excluir os dados da sua conta.">
      {(usuario) => <Painel usuario={usuario} />}
    </ExigeConta>
  )
}

function Painel({ usuario }: { usuario: Usuario }) {
  const navegar = useNavigate()
  const download = useMutation({ mutationFn: baixarMeusDados })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <h1 className="text-[clamp(1.875rem,4vw,2.5rem)]">Minha conta</h1>

      <dl className="mt-6 grid gap-x-6 gap-y-2 rounded-2xl border border-nevoa bg-white p-5 sm:grid-cols-[max-content_1fr]">
        <dt className="font-semibold">Nome</dt>
        <dd>{usuario.nome}</dd>
        <dt className="font-semibold">E-mail</dt>
        <dd className="break-all">{usuario.email}</dd>
        <dt className="font-semibold">Tipo de conta</dt>
        <dd>{NOMES_PAPEL[usuario.papel]}</dd>
      </dl>

      <section className="mt-10 border-t border-nevoa pt-6">
        <h2 className="text-xl">Seus dados</h2>
        <p className="mt-2 text-ardosia">
          Baixe um arquivo com tudo o que o Pontelo guarda sobre você: conta, serviços sugeridos e confirmações.
        </p>
        <Botao variante="suave" className="mt-4" disabled={download.isPending} onClick={() => download.mutate()}>
          {download.isPending ? 'Preparando…' : 'Baixar meus dados'}
        </Botao>
        <div role="status">
          {download.isError && <p className="mt-2 font-medium text-erro">Não conseguimos gerar o arquivo agora. Tente de novo.</p>}
        </div>
      </section>

      <section className="mt-10 border-t border-nevoa pt-6">
        <h2 className="text-xl">Sair</h2>
        <Botao variante="claro" className="mt-3 border border-nevoa" onClick={() => void sair().then(() => navegar('/'))}>
          Sair da conta
        </Botao>
      </section>

      <ExcluirConta />

      <p className="mt-10 text-sm text-ardosia">
        Saiba como tratamos seus dados na{' '}
        <Link to="/privacidade" className="font-semibold text-azul underline underline-offset-4">política de privacidade</Link>.
      </p>
    </div>
  )
}

function ExcluirConta() {
  const navegar = useNavigate()
  const [aberto, setAberto] = useState(false)
  const [senha, setSenha] = useState('')

  const exclusao = useMutation({
    mutationFn: () => excluirConta(senha),
    onSuccess: () => navegar('/', { replace: true }),
  })

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (senha) exclusao.mutate()
  }

  const erro = !exclusao.isError
    ? ''
    : exclusao.error instanceof ErroApi && exclusao.error.codigo === 'SENHA_INCORRETA'
      ? 'Senha incorreta.'
      : exclusao.error instanceof ErroApi && exclusao.error.status === 429
        ? 'Muitas tentativas. Espere alguns minutos.'
        : 'Não conseguimos excluir agora. Tente de novo.'

  return (
    <section className="mt-10 border-t border-nevoa pt-6">
      <h2 className="text-xl">Excluir conta</h2>
      <p className="mt-2 text-ardosia">
        Seu nome, e-mail e senha são apagados e você sai de todos os aparelhos. Os serviços que você sugeriu continuam
        no mapa, sem ligação com você. Não dá para desfazer.
      </p>

      {aberto ? (
        <form onSubmit={enviar} noValidate className="mt-4 grid gap-3 rounded-2xl border-[1.5px] border-erro/40 bg-white p-5">
          <Campo
            rotulo="Digite sua senha para confirmar"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            erro={erro || undefined}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!senha || exclusao.isPending}
              className="inline-flex min-h-12 items-center rounded-[14px] bg-erro px-5 font-titulo font-extrabold text-white transition hover:brightness-110 disabled:opacity-45"
            >
              {exclusao.isPending ? 'Excluindo…' : 'Excluir minha conta'}
            </button>
            <Botao variante="suave" onClick={() => { setAberto(false); setSenha('') }}>Cancelar</Botao>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="mt-3 inline-flex min-h-11 items-center font-semibold text-erro underline underline-offset-4"
        >
          Quero excluir minha conta
        </button>
      )}
    </section>
  )
}
