import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { categorias } from '../dados/categorias'
import type { Busca, Categoria, Local } from '../servicos/tipos'
import { cores } from '../estilos/cores'
import Chip from './Chip'
import Icone from './Icone'
import { Botao } from './Botao'

type Props = { categoriaInicial?: Categoria | null }

export default function CaixaBusca({ categoriaInicial = null }: Props) {
  const navegar = useNavigate()
  const idCampo = useId()
  const idErro = useId()

  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState<Categoria | null>(categoriaInicial)
  const [erro, setErro] = useState('')
  const [localizando, setLocalizando] = useState(false)

  function irParaResultados(local: Local) {
    const busca: Busca = { local, categoria }
    // A busca vai no "state" da navegação, não no endereço (veja a explicação abaixo)
    navegar('/servicos', { state: busca })
  }

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const limpo = texto.trim()
    if (limpo.length < 3) {
      setErro('Digite seu CEP ou o nome da sua cidade.')
      return
    }
    setErro('')
    irParaResultados({ tipo: 'texto', texto: limpo })
  }

  function usarLocalizacao() {
    if (!('geolocation' in navigator)) {
      setErro('Seu navegador não permite usar a localização. Digite o CEP ou a cidade.')
      return
    }
    setErro('')
    setLocalizando(true)
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLocalizando(false)
        irParaResultados({ tipo: 'gps', lat: posicao.coords.latitude, lng: posicao.coords.longitude })
      },
      (falha) => {
        setLocalizando(false)
        setErro(
          falha.code === falha.PERMISSION_DENIED
            ? 'Você não permitiu o uso da localização. Digite o CEP ou a cidade.'
            : 'Não conseguimos achar sua localização. Digite o CEP ou a cidade.',
        )
      },
      { timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <form
      onSubmit={aoEnviar}
      noValidate
      className="grid gap-4 rounded-[20px] border border-nevoa bg-white p-4 shadow-[0_12px_32px_rgb(19_54_93/0.10)] sm:p-6"
    >
      <label htmlFor={idCampo} className="text-[15px] font-semibold">
        Onde você está?
      </label>

      <div className="-mt-2 flex flex-col gap-2.5 sm:flex-row">
        <div
          className={`flex min-h-12 flex-1 items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-4 focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-dourado ${
            erro ? 'border-erro' : 'border-ardosia'
          }`}
        >
          <Icone nome="local" tamanho={20} cor={cores.ardosia} />
          <input
            id={idCampo}
            type="text"
            autoComplete="off"
            placeholder="CEP ou cidade"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? idErro : undefined}
            className="w-full bg-transparent text-base outline-none placeholder:text-ardosia"
          />
        </div>
        <Botao variante="suave" icone="localizar" onClick={usarLocalizacao} disabled={localizando}>
          {localizando ? 'Localizando…' : 'Usar minha localização'}
        </Botao>
      </div>

      {erro && (
        <p id={idErro} role="alert" className="-mt-2 text-sm font-medium text-erro">
          {erro}
        </p>
      )}

      <fieldset>
        <legend className="text-[15px] font-semibold">Que tipo de ajuda você procura?</legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
  {categorias.map((c) => {
    const ativa = categoria === c.slug
    return (
      <Chip key={c.slug} ativo={ativa} icone={c.icone} aoClicar={() => setCategoria(ativa ? null : c.slug)}>
        {c.nomeCurto}
      </Chip>
    )
  })}
</div>
      </fieldset>

      <Botao type="submit" variante="acao" tamanho="lg" icone="busca" larguraTotal>
        Buscar serviços
      </Botao>
    </form>
  )
}