import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Botao, BotaoLink } from '../componentes/Botao'
import Campo, { AreaTexto } from '../componentes/Campo'
import ExigeConta from '../componentes/ExigeConta'
import Icone from '../componentes/Icone'
import { categorias } from '../dados/categorias'
import { cores } from '../estilos/cores'
import { ErroApi, sugerirServico } from '../servicos/api'
import type { Categoria, Horario, NovaSugestao } from '../servicos/tipos'

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

const DIAS = [
  { dia: 1, nome: 'Segunda' }, { dia: 2, nome: 'Terça' }, { dia: 3, nome: 'Quarta' },
  { dia: 4, nome: 'Quinta' }, { dia: 5, nome: 'Sexta' }, { dia: 6, nome: 'Sábado' }, { dia: 0, nome: 'Domingo' },
]

type HorarioDia = { aberto: boolean; abre: string; fecha: string }
type Dados = Omit<NovaSugestao, 'categoria' | 'horarios'> & { categoria: Categoria | '' }
type Erros = Partial<Record<keyof NovaSugestao, string>>

const inicial: Dados = {
  nome: '', categoria: '', descricao: '', endereco: '', cidade: '', uf: '', cep: '',
  telefone: '', documentos_exigidos: '', endereco_restrito: false,
}

const horariosIniciais = (): Record<number, HorarioDia> =>
  Object.fromEntries(DIAS.map(({ dia }) => [dia, { aberto: false, abre: '08:00', fecha: '17:00' }]))

function validar(d: Dados, horarios: Record<number, HorarioDia>): Erros {
  const erros: Erros = {}
  if (d.nome.trim().length < 3) erros.nome = 'Informe o nome do serviço.'
  if (!d.categoria) erros.categoria = 'Escolha uma categoria.'
  if (d.descricao.trim().length < 10) erros.descricao = 'Conte em uma frase o que o serviço oferece.'
  if (d.endereco.trim().length < 5) erros.endereco = 'Informe rua e número.'
  if (d.cidade.trim().length < 2) erros.cidade = 'Informe a cidade.'
  if (!d.uf) erros.uf = 'Escolha o estado.'
  const cep = d.cep.replace(/\D/g, '')
  if (cep && cep.length !== 8) erros.cep = 'O CEP tem 8 números.'
  if (d.telefone.trim() && !/^[\d\s()+-]{8,30}$/.test(d.telefone.trim())) erros.telefone = 'Use só números, espaços, parênteses e traço.'
  if (Object.values(horarios).some((h) => h.aberto && (!h.abre || !h.fecha || h.abre === h.fecha))) {
    erros.horarios = 'Confira os horários: abertura e fechamento precisam ser diferentes.'
  }
  return erros
}

function errosDaApi(erro: Error): Erros {
  if (!(erro instanceof ErroApi)) return {}
  if (erro.codigo === 'ENDERECO_NAO_ENCONTRADO') return { endereco: erro.message }
  if (erro.codigo === 'HORARIOS_SOBREPOSTOS') return { horarios: erro.message }
  if (erro.codigo !== 'VALIDACAO_FALHOU') return {}
  return Object.fromEntries(erro.detalhes.map((d) => [d.campo.split('.')[0], d.problema]))
}

export default function Sugerir() {
  return (
    <ExigeConta motivo="Para sugerir um serviço você precisa de uma conta. Assim a moderação consegue tirar dúvidas e evitar abusos.">
      {() => <FormularioSugestao />}
    </ExigeConta>
  )
}

function FormularioSugestao() {
  const [dados, setDados] = useState<Dados>(inicial)
  const [horarios, setHorarios] = useState(horariosIniciais)
  const [erros, setErros] = useState<Erros>({})

  const envio = useMutation({
    mutationFn: (sugestao: NovaSugestao) => sugerirServico(sugestao),
    onError: (falha) => setErros(errosDaApi(falha)),
  })

  const limparErro = (campo: keyof Erros) =>
    setErros((atual) => {
      if (!(campo in atual)) return atual
      const resto = { ...atual }
      delete resto[campo]
      return resto
    })

  const mudar = <K extends keyof Dados>(campo: K, valor: Dados[K]) => {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    limparErro(campo)
  }
  const mudarDia = (dia: number, mudanca: Partial<HorarioDia>) => {
    setHorarios((atual) => ({ ...atual, [dia]: { ...atual[dia]!, ...mudanca } }))
    limparErro('horarios')
  }

  function copiarSegunda() {
    const segunda = horarios[1]!
    setHorarios((atual) => ({ ...atual, 2: { ...segunda }, 3: { ...segunda }, 4: { ...segunda }, 5: { ...segunda } }))
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const encontrados = validar(dados, horarios)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0 || !dados.categoria) return

    envio.mutate({
      ...dados,
      categoria: dados.categoria,
      cep: dados.cep.replace(/\D/g, ''),
      horarios: DIAS.filter(({ dia }) => horarios[dia]!.aberto).map(({ dia }): Horario => ({
        dia_semana: dia,
        abre: horarios[dia]!.abre,
        fecha: horarios[dia]!.fecha,
      })),
    })
  }

  if (envio.isSuccess) {
    return (
      <Recebido
        aoSugerirOutro={() => {
          setDados(inicial)
          setHorarios(horariosIniciais())
          envio.reset()
        }}
      />
    )
  }

  const temErroDeCampo = Object.keys(erros).length > 0
  const erroGeral =
    envio.isError && !temErroDeCampo
      ? envio.error instanceof ErroApi && envio.error.status === 429
        ? 'Muitas sugestões seguidas. Espere um pouco e tente de novo.'
        : envio.error instanceof ErroApi && envio.error.codigo === 'SEM_CONEXAO'
          ? 'Sem internet. Confira a conexão e tente de novo.'
          : 'Não conseguimos enviar agora. Tente de novo em alguns minutos.'
      : ''

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="text-[clamp(1.875rem,4vw,2.75rem)]">Sugerir serviço</h1>
      <p className="mt-2 max-w-2xl text-lg text-ardosia">
        Conhece um lugar que atende de graça? Conte para nós. A moderação confere antes de aparecer no mapa.
      </p>

      <form onSubmit={enviar} noValidate className="mt-8 grid gap-10">
        <Bloco titulo="Sobre o serviço">
          <Campo rotulo="Nome do serviço" value={dados.nome} maxLength={120} autoComplete="off"
            onChange={(e) => mudar('nome', e.target.value)} erro={erros.nome} />

          <fieldset aria-describedby={erros.categoria ? 'erro-categoria' : undefined}>
            <legend className="font-semibold">Categoria</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {categorias.map((c) => (
                <label
                  key={c.slug}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-azul ${
                    dados.categoria === c.slug ? 'border-marinho bg-azul-claro' : 'border-nevoa bg-white hover:border-azul'
                  }`}
                >
                  <input type="radio" name="categoria" value={c.slug} checked={dados.categoria === c.slug}
                    onChange={() => mudar('categoria', c.slug)} className="sr-only" />
                  <Icone nome={c.icone} tamanho={20} cor={cores.marinho} destaque={cores.douradoEscuro} />
                  <span className="font-medium">{c.nome}</span>
                </label>
              ))}
            </div>
            {erros.categoria && <p id="erro-categoria" className="mt-1 text-sm font-medium text-erro">{erros.categoria}</p>}
          </fieldset>

          <AreaTexto rotulo="O que o serviço oferece" dica="Ex.: almoço gratuito de segunda a sexta, sem cadastro."
            maxLength={1000} value={dados.descricao} onChange={(e) => mudar('descricao', e.target.value)} erro={erros.descricao} />
        </Bloco>

        <Bloco titulo="Onde fica">
          <Campo rotulo="Endereço" dica="Rua e número, como na fachada." autoComplete="off" maxLength={200}
            value={dados.endereco} onChange={(e) => mudar('endereco', e.target.value)} erro={erros.endereco} />
          <div className="grid gap-4 sm:grid-cols-[1fr_120px_160px]">
            <Campo rotulo="Cidade" autoComplete="off" maxLength={100} value={dados.cidade}
              onChange={(e) => mudar('cidade', e.target.value)} erro={erros.cidade} />
            <div>
              <label htmlFor="uf" className="font-semibold">Estado</label>
              <select id="uf" value={dados.uf} onChange={(e) => mudar('uf', e.target.value)}
                aria-invalid={erros.uf ? true : undefined}
                className={`mt-1.5 block min-h-12 w-full rounded-xl border-[1.5px] bg-white px-3 ${erros.uf ? 'border-erro' : 'border-ardosia'}`}>
                <option value="">—</option>
                {UFS.map((uf) => <option key={uf}>{uf}</option>)}
              </select>
              {erros.uf && <p className="mt-1 text-sm font-medium text-erro">{erros.uf}</p>}
            </div>
            <Campo rotulo="CEP (opcional)" inputMode="numeric" autoComplete="off" maxLength={9} value={dados.cep}
              onChange={(e) => mudar('cep', e.target.value)} erro={erros.cep} />
          </div>

          <label className="flex items-start gap-3 rounded-xl bg-azul-claro p-4">
            <input type="checkbox" checked={dados.endereco_restrito}
              onChange={(e) => mudar('endereco_restrito', e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-azul" />
            <span>
              <span className="font-semibold">Endereço sigiloso</span>
              <span className="mt-0.5 block text-ardosia">
                Para abrigos de quem sofre violência. O endereço não aparece no site nem no mapa, só a cidade e o telefone.
              </span>
            </span>
          </label>
        </Bloco>

        <Bloco titulo="Contato e documentos">
          <Campo rotulo="Telefone (opcional)" type="tel" inputMode="tel" autoComplete="off" maxLength={30}
            value={dados.telefone} onChange={(e) => mudar('telefone', e.target.value)} erro={erros.telefone} />
          <AreaTexto rotulo="Documentos exigidos (opcional)" dica="Deixe em branco se não pedem nada." maxLength={500} rows={2}
            value={dados.documentos_exigidos} onChange={(e) => mudar('documentos_exigidos', e.target.value)} />
        </Bloco>

        <Bloco titulo="Horários">
          <p className="-mt-2 text-ardosia">Marque os dias em que abre. Se não souber, pode deixar em branco.</p>
          <ul className="grid gap-1">
            {DIAS.map(({ dia, nome }) => {
              const h = horarios[dia]!
              return (
                <li key={dia} className="grid min-h-12 grid-cols-[130px_1fr] items-center gap-3 sm:grid-cols-[150px_1fr]">
                  <label className="flex items-center gap-3 font-medium">
                    <input type="checkbox" checked={h.aberto} onChange={(e) => mudarDia(dia, { aberto: e.target.checked })}
                      className="size-5 accent-azul" />
                    {nome}
                  </label>
                  {h.aberto ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <input type="time" aria-label={`${nome}: abre às`} value={h.abre}
                        onChange={(e) => mudarDia(dia, { abre: e.target.value })}
                        className="min-h-11 rounded-lg border-[1.5px] border-ardosia bg-white px-2" />
                      <span className="text-ardosia">às</span>
                      <input type="time" aria-label={`${nome}: fecha às`} value={h.fecha}
                        onChange={(e) => mudarDia(dia, { fecha: e.target.value })}
                        className="min-h-11 rounded-lg border-[1.5px] border-ardosia bg-white px-2" />
                    </span>
                  ) : (
                    <span className="text-ardosia">Fechado</span>
                  )}
                </li>
              )
            })}
          </ul>
          {horarios[1]!.aberto && (
            <button type="button" onClick={copiarSegunda}
              className="justify-self-start font-semibold text-azul underline underline-offset-4">
              Usar o horário de segunda em todos os dias úteis
            </button>
          )}
          {erros.horarios && <p className="text-sm font-medium text-erro">{erros.horarios}</p>}
        </Bloco>

        <div className="grid gap-3">
          <div role="alert">
            {temErroDeCampo && <p className="font-medium text-erro">Confira os campos marcados acima.</p>}
            {erroGeral && <p className="font-medium text-erro">{erroGeral}</p>}
          </div>
          <Botao type="submit" variante="acao" tamanho="lg" icone="mais" className="justify-self-start" disabled={envio.isPending}>
            {envio.isPending ? 'Enviando…' : 'Enviar sugestão'}
          </Botao>
          <p className="text-sm text-ardosia">
            Vamos procurar o endereço no mapa ao enviar. Isso pode levar alguns segundos.
          </p>
        </div>
      </form>
    </div>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-nevoa pt-6">
      <h2 className="text-xl">{titulo}</h2>
      {children}
    </section>
  )
}

function Recebido({ aoSugerirOutro }: { aoSugerirOutro: () => void }) {
  const titulo = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    titulo.current?.focus()
  }, [])

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <div role="status" className="rounded-2xl bg-verde-claro p-6 md:p-8">
        <h1 ref={titulo} tabIndex={-1} className="text-[clamp(1.75rem,4vw,2.25rem)] text-verificado">
          Recebemos sua sugestão
        </h1>
        <p className="mt-2 text-lg">
          Obrigado! A moderação vai conferir as informações. Quando o serviço for aprovado, ele aparece na busca e no mapa.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Botao variante="suave" onClick={aoSugerirOutro}>Sugerir outro serviço</Botao>
        <BotaoLink para="/" variante="claro">Voltar para o início</BotaoLink>
      </div>
      <p className="mt-6 text-ardosia">
        Viu algo errado em um serviço que já está no site? Abra a página dele e use{' '}
        <Link to="/servicos" className="font-semibold text-azul underline underline-offset-4">Denunciar informação errada</Link>.
      </p>
    </div>
  )
}
