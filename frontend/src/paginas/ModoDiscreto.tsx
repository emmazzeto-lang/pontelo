import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Botao, BotaoLink } from '../componentes/Botao'
import Campo from '../componentes/Campo'
import Icone from '../componentes/Icone'
import { convidarContato, enviarAlerta, FalhaAlerta, situacaoDosContatos } from '../discreto/alerta'
import {
  apagarPreferencias,
  ENDERECO_CALCULADORA,
  lerPreferencias,
  lerRascunho,
  salvarPreferencias,
  salvarRascunho,
  type Contato,
  type Preferencias,
} from '../discreto/preferencias'
import { cores } from '../estilos/cores'

const MAX_CONTATOS = 3
const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const codigoValido = (codigo: string) => /^\d{4,8}$/.test(codigo)

export default function ModoDiscreto() {
  const salvas = lerPreferencias()
  const rascunho = salvas ?? lerRascunho()
  const [apelido, setApelido] = useState(rascunho?.apelido ?? '')
  const [contatos, setContatos] = useState<Contato[]>(rascunho?.contatos ?? [])

  useEffect(() => {
    if (apelido || contatos.length > 0) salvarRascunho({ apelido, contatos })
  }, [apelido, contatos])
  const [codigoAbrir, setCodigoAbrir] = useState(salvas?.codigoAbrir ?? '')
  const [codigoSocorro, setCodigoSocorro] = useState(salvas?.codigoSocorro ?? '')
  const [ativo, setAtivo] = useState(salvas !== null)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [salvo, setSalvo] = useState(false)

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const encontrados: Record<string, string> = {}
    if (!apelido.trim()) encontrados.apelido = 'Informe como seus contatos conhecem você.'
    if (contatos.length === 0) encontrados.contatos = 'Adicione pelo menos um contato de confiança.'
    if (!codigoValido(codigoAbrir)) encontrados.codigoAbrir = 'Use de 4 a 8 números.'
    if (!codigoValido(codigoSocorro)) encontrados.codigoSocorro = 'Use de 4 a 8 números.'
    if (codigoAbrir && codigoAbrir === codigoSocorro) encontrados.codigoSocorro = 'Precisa ser diferente do código para abrir.'
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const preferencias: Preferencias = { apelido: apelido.trim(), contatos, codigoAbrir, codigoSocorro }
    salvarPreferencias(preferencias)
    setAtivo(true)
    setSalvo(true)
  }

  function desativar() {
    apagarPreferencias()
    setApelido('')
    setContatos([])
    setCodigoAbrir('')
    setCodigoSocorro('')
    setAtivo(false)
    setSalvo(false)
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <h1 className="text-[clamp(2rem,4.5vw,3rem)] tracking-[-0.02em]">Modo discreto</h1>
      <p className="mt-4 text-lg text-ardosia md:text-xl">
        Instale no celular uma calculadora que funciona de verdade. Com um código secreto, ela envia um pedido de
        ajuda com a sua localização para pessoas de confiança, sem que ninguém perceba.
      </p>

      <div role="note" className="mt-6 flex gap-3 rounded-2xl border-[1.5px] border-erro/30 bg-white p-5">
        <Icone nome="telefone" tamanho={22} cor={cores.erro} className="mt-0.5 shrink-0" />
        <p>
          <strong>Não substitui o 190.</strong> O alerta depende de internet e de alguém ler o e-mail. Em perigo
          imediato, se puder, ligue <a href="tel:190" className="font-semibold text-erro underline">190</a>. Para
          violência contra a mulher, <a href="tel:180" className="font-semibold text-erro underline">180</a>.
        </p>
      </div>

      <ComoFunciona />

      <form onSubmit={salvar} noValidate className="mt-4 grid gap-10">
        <Passo numero={1} titulo="Como seus contatos conhecem você">
          <Campo
            rotulo="Nome ou apelido"
            dica="Aparece no e-mail de alerta. Use o nome que seus contatos reconhecem."
            autoComplete="off"
            maxLength={40}
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            erro={erros.apelido}
          />
        </Passo>

        <Passo numero={2} titulo="Contatos de confiança">
          <p className="text-ardosia">
            Até {MAX_CONTATOS} pessoas. Cada uma recebe um e-mail e precisa aceitar antes de poder receber alertas.
            Os contatos ficam guardados só neste celular.
          </p>
          <ListaContatos apelido={apelido.trim()} contatos={contatos} aoMudar={setContatos} />
          {erros.contatos && <p className="text-sm font-medium text-erro">{erros.contatos}</p>}
        </Passo>

        <Passo numero={3} titulo="Códigos secretos">
          <p className="text-ardosia">
            Na calculadora, digite o código e aperte <kbd className="rounded border border-nevoa px-1.5">=</kbd>.
            Evite datas de aniversário e números óbvios como 1234.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Código para abrir o Pontelo" inputMode="numeric" autoComplete="off" maxLength={8}
              value={codigoAbrir} onChange={(e) => setCodigoAbrir(e.target.value.replace(/\D/g, ''))} erro={erros.codigoAbrir} />
            <Campo rotulo="Código de socorro" inputMode="numeric" autoComplete="off" maxLength={8}
              value={codigoSocorro} onChange={(e) => setCodigoSocorro(e.target.value.replace(/\D/g, ''))} erro={erros.codigoSocorro}
              dica="Envia o alerta. A tela continua igual; se aparecer “Erro”, o envio falhou." />
          </div>
        </Passo>

        <Passo numero={4} titulo="Localização">
          <PermissaoLocalizacao />
        </Passo>

        <div className="grid gap-3">
          <Botao type="submit" tamanho="lg" className="justify-self-start">
            {ativo ? 'Salvar alterações' : 'Ativar modo discreto'}
          </Botao>
          <div role="status">
            {salvo && <p className="font-semibold text-verificado">Pronto! O modo discreto está ativo neste celular.</p>}
          </div>
        </div>
      </form>

      {ativo && (
        <>
          <Teste />
          <Instalar />
          <section className="mt-10 border-t border-nevoa pt-6">
            <h2 className="text-xl">Desativar</h2>
            <p className="mt-2 text-ardosia">Apaga os contatos e os códigos deste celular. A calculadora volta a ser só uma calculadora.</p>
            <button type="button" onClick={desativar} className="mt-3 min-h-11 font-semibold text-erro underline underline-offset-4">
              Desativar modo discreto
            </button>
          </section>
        </>
      )}
    </article>
  )
}

function Passo({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-nevoa pt-6">
      <h2 className="flex items-center gap-3 text-xl">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-marinho font-titulo text-base font-extrabold text-white">
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function ComoFunciona() {
  const itens = [
    'Parece e funciona como uma calculadora comum, com nome e ícone de calculadora.',
    'Código de socorro + “=”: envia por e-mail a sua localização e orientações para seus contatos.',
    'Código para abrir + “=”: abre o Pontelo para buscar abrigo e atendimento.',
    'A “Saída rápida” do Pontelo volta para a calculadora.',
    'O Pontelo não guarda quem pediu ajuda, a localização nem os seus contatos.',
  ]
  return (
    <section className="mt-10">
      <h2 className="text-2xl">Como funciona</h2>
      <ul className="mt-4 grid gap-2">
        {itens.map((item) => (
          <li key={item} className="flex gap-3">
            <Icone nome="confirmar" tamanho={20} cor={cores.verificado} className="mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function ListaContatos({ apelido, contatos, aoMudar }: { apelido: string; contatos: Contato[]; aoMudar: (c: Contato[]) => void }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const emails = contatos.map((c) => c.email)

  const situacao = useQuery({
    queryKey: ['contatos-alerta', emails],
    queryFn: () => situacaoDosContatos(emails),
    enabled: emails.length > 0,
    staleTime: 0,
  })
  const confirmado = (e: string) => situacao.data?.find((s) => s.email === e)?.confirmado

  const convite = useMutation({
    mutationFn: (contato: Contato) => convidarContato(contato.email, apelido),
  })

  function adicionar() {
    const limpo = email.trim().toLowerCase()
    if (!apelido) return setErro('Preencha primeiro o seu nome ou apelido (passo 1): ele vai no convite.')
    if (!nome.trim()) return setErro('Informe o nome do contato.')
    if (!emailValido(limpo)) return setErro('Informe um e-mail válido.')
    if (emails.includes(limpo)) return setErro('Esse contato já está na lista.')
    setErro('')
    const novo = { nome: nome.trim(), email: limpo }
    aoMudar([...contatos, novo])
    convite.mutate(novo)
    setNome('')
    setEmail('')
  }

  return (
    <div className="grid gap-4">
      {contatos.length > 0 && (
        <ul className="grid gap-2">
          {contatos.map((c) => (
            <li key={c.email} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-nevoa bg-white p-3">
              <span className="min-w-0">
                <span className="block font-semibold">{c.nome}</span>
                <span className="block break-all text-sm text-ardosia">{c.email}</span>
              </span>
              <span className="flex flex-wrap items-center gap-2">
                {confirmado(c.email) ? (
                  <span className="rounded-full bg-verde-claro px-2.5 py-1 text-sm font-semibold text-verificado">Confirmado</span>
                ) : (
                  <>
                    <span className="rounded-full bg-azul-claro px-2.5 py-1 text-sm text-ardosia">Aguardando aceite</span>
                    <button type="button" disabled={!apelido || convite.isPending} onClick={() => convite.mutate(c)}
                      className="min-h-11 px-1 text-sm font-semibold text-azul underline underline-offset-4 disabled:opacity-45">
                      Reenviar convite
                    </button>
                  </>
                )}
                <button type="button" onClick={() => aoMudar(contatos.filter((x) => x.email !== c.email))}
                  className="min-h-11 px-1 text-sm font-medium text-ardosia underline underline-offset-4">
                  Remover
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {emails.length > 0 && (
        <button type="button" onClick={() => void situacao.refetch()} className="justify-self-start font-semibold text-azul underline underline-offset-4">
          {situacao.isFetching ? 'Conferindo…' : 'Conferir quem já aceitou'}
        </button>
      )}

      {contatos.length < MAX_CONTATOS && (
        <div className="grid gap-3 rounded-2xl bg-azul-claro p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
          <Campo rotulo="Nome do contato" autoComplete="off" maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} />
          <Campo rotulo="E-mail do contato" type="email" inputMode="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Botao variante="primario" onClick={adicionar}>Adicionar</Botao>
        </div>
      )}

      <div role="status">
        {erro && <p className="text-sm font-medium text-erro">{erro}</p>}
        {convite.isSuccess && <p className="text-sm text-verificado">Convite enviado. Peça para a pessoa abrir o e-mail e aceitar.</p>}
        {convite.isError && <p className="text-sm font-medium text-erro">{convite.error.message}</p>}
      </div>
    </div>
  )
}

type EstadoPermissao = 'granted' | 'denied' | 'prompt' | 'indisponivel'

function PermissaoLocalizacao() {
  const [permissao, setPermissao] = useState<EstadoPermissao>(() =>
    'geolocation' in navigator ? 'prompt' : 'indisponivel',
  )

  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((p) => {
        setPermissao(p.state)
        p.onchange = () => setPermissao(p.state)
      })
      .catch(() => undefined)
  }, [])

  function pedir() {
    navigator.geolocation.getCurrentPosition(
      () => setPermissao('granted'),
      () => setPermissao('denied'),
    )
  }

  if (permissao === 'granted') {
    return <p className="font-semibold text-verificado">Localização permitida. Ela vai junto no alerta.</p>
  }

  return (
    <div className="grid gap-3">
      <p className="text-ardosia">
        Permita agora, com calma. Na hora do alerta a calculadora não vai pedir permissão nem mostrar nada na tela.
        Sem permissão, o alerta é enviado mesmo assim, só que sem a localização.
      </p>
      {permissao === 'denied' && (
        <p className="font-medium text-erro">
          A localização está bloqueada para este site. Libere nas configurações do navegador (ícone ao lado do endereço).
        </p>
      )}
      {permissao === 'indisponivel' ? (
        <p className="font-medium text-erro">Este navegador não oferece localização.</p>
      ) : (
        <Botao variante="suave" icone="localizar" className="justify-self-start" onClick={pedir}>
          Permitir localização
        </Botao>
      )}
    </div>
  )
}

function Teste() {
  const teste = useMutation({
    mutationFn: async () => {
      const p = lerPreferencias()
      if (!p) throw new FalhaAlerta('SEM_CONFIGURACAO', 'Salve a configuração primeiro.')
      return enviarAlerta({ apelido: p.apelido, contatos: p.contatos.map((c) => c.email), teste: true })
    },
  })

  return (
    <section className="mt-10 border-t border-nevoa pt-6">
      <h2 className="text-xl">Testar</h2>
      <p className="mt-2 text-ardosia">
        Envia um alerta marcado como TESTE para os contatos que já aceitaram. Combine com eles antes, para ninguém se assustar.
      </p>
      <Botao variante="suave" className="mt-3" disabled={teste.isPending} onClick={() => teste.mutate()}>
        {teste.isPending ? 'Enviando…' : 'Enviar alerta de teste'}
      </Botao>
      <div role="status">
        {teste.isSuccess && (
          <p className="mt-2 font-semibold text-verificado">
            Teste enviado para {teste.data.dados.enviados} contato{teste.data.dados.enviados === 1 ? '' : 's'}.
          </p>
        )}
        {teste.isError && <p className="mt-2 font-medium text-erro">{teste.error.message}</p>}
      </div>
    </section>
  )
}

function Instalar() {
  return (
    <section className="mt-10 border-t border-nevoa pt-6">
      <h2 className="text-xl">Instalar a calculadora</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6">
        <li>Toque em “Abrir a calculadora” abaixo.</li>
        <li>
          <strong>Android (Chrome):</strong> toque no menu <span aria-hidden="true">⋮</span> e em “Instalar app” ou
          “Adicionar à tela inicial”.
        </li>
        <li>
          <strong>iPhone (Safari):</strong> toque em Compartilhar e em “Adicionar à Tela de Início”.
        </li>
        <li>Na tela inicial vai aparecer só “Calculadora”. Teste os dois códigos.</li>
        <li>Por fim, apague este site do histórico do navegador, ou use uma aba anônima da próxima vez.</li>
      </ol>
      <BotaoLink href={ENDERECO_CALCULADORA} className="mt-4">Abrir a calculadora</BotaoLink>
    </section>
  )
}
