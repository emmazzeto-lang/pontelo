import { telefonesEmergencia } from '../dados/telefones'
import BotaoSaidaRapida from './BotaoSaidaRapida'

export default function BarraEmergencia() {
  return (
    <div className="hidden bg-marinho text-white md:block">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-4 py-2">
        <div className="flex items-center gap-7 text-sm">
          <p className="font-semibold">Precisa de ajuda agora?</p>
          <ul className="flex flex-wrap gap-x-7 gap-y-1">
            {telefonesEmergencia.map((t) => (
              <li key={t.numero}>
                <a href={`tel:${t.numero}`} className="inline-flex items-baseline gap-1.5 hover:underline">
                  <span className="font-titulo text-[15px] font-extrabold text-dourado">{t.numero}</span>
                  {t.nome}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <BotaoSaidaRapida />
      </div>
    </div>
  )
}