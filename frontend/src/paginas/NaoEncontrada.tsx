import { Link } from 'react-router'

export default function NaoEncontrada() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl">Página não encontrada</h1>
      <p className="mt-3 text-ardosia">
        O endereço pode estar errado ou o serviço não existe mais.
      </p>
      <Link to="/" className="mt-6 inline-block font-semibold text-azul underline underline-offset-4">
        Voltar para o início
      </Link>
    </section>
  )
}