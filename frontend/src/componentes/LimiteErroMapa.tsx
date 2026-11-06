import { Component, type ReactNode } from 'react'
import { Botao } from './Botao'

type Props = {
  aoVoltarParaLista: () => void
  children: ReactNode
}

type Estado = { falhou: boolean }

export default class LimiteErroMapa extends Component<Props, Estado> {
  state: Estado = { falhou: false }

  static getDerivedStateFromError(): Estado {
    return { falhou: true }
  }

  render() {
    if (!this.state.falhou) return this.props.children

    return (
      <div className="grid min-h-80 place-items-center rounded-2xl border border-nevoa bg-white p-6 text-center">
        <div>
          <h2 className="text-2xl">Não foi possível carregar o mapa</h2>
          <p className="mb-4 mt-2 text-ardosia">
            Sua conexão pode estar fraca. A lista tem as mesmas informações.
          </p>
          <Botao onClick={this.props.aoVoltarParaLista}>Ver a lista</Botao>
        </div>
      </div>
    )
  }
}