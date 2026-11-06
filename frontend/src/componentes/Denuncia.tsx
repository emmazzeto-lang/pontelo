import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import Icone from './Icone'
import { Botao } from './Botao'
import { cores } from '../estilos/cores'

const motivos = [
  'O serviço fechou',
  'O telefone está errado',
  'O endereço está errado',
  'O horário está errado',
  'Outro problema',
]

export default function Denuncia() {
  const [aberto, setAberto] = useState(false)
  const [enviado, setEnviado] = useState(false)

  if (enviado) return <AvisoEnviado />

  return (
    <div>
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-erro underline underline-offset-4"
      >
        <Icone nome="denunciar" tamanho={16} cor={cores.erro} />
        Denunciar informação errada
      </button>

      {aberto && <FormularioDenuncia aoEnviar={() => setEnviado(true)} />}
    </div>
  )
}

function FormularioDenuncia({ aoEnviar }: { aoEnviar: () => void }) {
  const idDetalhes = useId()
  const idErro = useId()
  const [motivo, setMotivo] = useState('')
  const [detalhes, setDetalhes] = useState('')
  const [erro, setErro] = useState('')

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!motivo) {
      setErro('Escolha o que está errado.')
      return
    }
    // Etapa 8: POST /servicos/{id}/denuncias
    aoEnviar()
  }

  return (
    <form onSubmit={enviar} noValidate className="mt-3 grid gap-4 rounded-2xl border border-nevoa bg-white p-5">
      <fieldset aria-describedby={erro ? idErro : undefined}>
        <legend className="font-semibold">O que está errado?</legend>
        <div className="mt-1">
          {motivos.map((m) => (
            <label key={m} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                name="motivo"
                value={m}
                checked={motivo === m}
                onChange={() => {
                  setMotivo(m)
                  setErro('')
                }}
                className="size-5 accent-azul"
              />
              {m}
            </label>
          ))}
        </div>
        {erro && (
          <p id={idErro} role="alert" className="mt-1 text-sm font-medium text-erro">
            {erro}
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor={idDetalhes} className="font-semibold">
          Quer explicar melhor? (opcional)
        </label>
        <textarea
          id={idDetalhes}
          rows={3}
          maxLength={500}
          autoComplete="off"
          value={detalhes}
          onChange={(e) => setDetalhes(e.target.value)}
          className="mt-1.5 w-full rounded-xl border-[1.5px] border-ardosia bg-white p-3"
        />
        <p className="mt-1 text-sm text-ardosia">
          Sua denúncia é anônima. Não escreva seu nome, telefone ou dados de outras pessoas.
        </p>
      </div>

      <Botao type="submit" className="justify-self-start">Enviar denúncia</Botao>
    </form>
  )
}

function AvisoEnviado() {
  const titulo = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    titulo.current?.focus()
  }, [])

  return (
    <div role="status" className="rounded-2xl bg-azul-claro p-5">
      <p ref={titulo} tabIndex={-1} className="font-semibold">Obrigado por avisar.</p>
      <p className="mt-1 text-ardosia">Nossa moderação vai conferir essa informação.</p>
    </div>
  )
}