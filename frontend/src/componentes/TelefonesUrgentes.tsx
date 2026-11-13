import { telefonesEmergencia } from '../dados/telefones'

export default function TelefonesUrgentes() {
  return (
    <div className="mt-6 border-t border-nevoa pt-5">
      <h3 className="text-lg">Se for urgente, ligue:</h3>
      <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
        {telefonesEmergencia.map((t) => (
          <li key={t.numero}>
            <a href={`tel:${t.numero}`} className="inline-flex min-h-11 items-center gap-2 hover:underline">
              <span className="font-titulo text-xl font-extrabold text-azul">{t.numero}</span>
              {t.nome}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}