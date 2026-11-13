import { useId, type ComponentProps } from 'react'

type Props = Omit<ComponentProps<'input'>, 'id'> & {
  rotulo: string
  dica?: string
  erro?: string
}

export function AreaTexto({
  rotulo,
  dica,
  erro,
  className = '',
  ...area
}: Omit<ComponentProps<'textarea'>, 'id'> & { rotulo: string; dica?: string; erro?: string }) {
  const id = useId()
  const descricao = [dica && `${id}-dica`, erro && `${id}-erro`].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="font-semibold">
        {rotulo}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao}
        className={`mt-1.5 block w-full rounded-xl border-[1.5px] bg-white p-3 ${erro ? 'border-erro' : 'border-ardosia'}`}
        {...area}
      />
      {dica && <p id={`${id}-dica`} className="mt-1 text-sm text-ardosia">{dica}</p>}
      {erro && <p id={`${id}-erro`} className="mt-1 text-sm font-medium text-erro">{erro}</p>}
    </div>
  )
}

export default function Campo({ rotulo, dica, erro, className = '', ...input }: Props) {
  const id = useId()
  const idDica = `${id}-dica`
  const idErro = `${id}-erro`
  const descricao = [dica && idDica, erro && idErro].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="font-semibold">
        {rotulo}
      </label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao}
        className={`mt-1.5 block min-h-12 w-full rounded-xl border-[1.5px] bg-white px-3 ${erro ? 'border-erro' : 'border-ardosia'}`}
        {...input}
      />
      {dica && (
        <p id={idDica} className="mt-1 text-sm text-ardosia">
          {dica}
        </p>
      )}
      {erro && (
        <p id={idErro} className="mt-1 text-sm font-medium text-erro">
          {erro}
        </p>
      )}
    </div>
  )
}
