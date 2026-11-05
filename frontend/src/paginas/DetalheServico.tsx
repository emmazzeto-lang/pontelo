import { useParams } from 'react-router'

export default function DetalheServico() {
  const { id } = useParams()

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl">Serviço {id}</h1>
    </section>
  )
}