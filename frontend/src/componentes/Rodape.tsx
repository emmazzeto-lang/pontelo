import { Link } from 'react-router'
import Logo from './Logo'
import { URL_GEOJSON } from '../servicos/api'

// "externo": arquivo da API (não é página do site), então usa <a> em vez de <Link>
type LinkRodape = { para: string; texto: string; externo?: boolean }

const colunas: { titulo: string; links: LinkRodape[] }[] = [
  {
    titulo: 'Plataforma',
    links: [
      { para: '/servicos', texto: 'Buscar serviços' },
      { para: '/sugerir', texto: 'Sugerir serviço' },
      { para: '/organizacoes', texto: 'Para organizações' },
    ],
  },
  {
    titulo: 'Dados',
    links: [
      { para: '/dados-abertos', texto: 'API pública' },
      { para: URL_GEOJSON, texto: 'Baixar GeoJSON', externo: true },
    ],
  },
  {
    titulo: 'Transparência',
    links: [
      { para: '/privacidade', texto: 'Política de privacidade' },
      { para: '/minha-conta', texto: 'Baixar ou excluir meus dados' },
      { para: '/como-funciona', texto: 'Como conferimos os dados' },
    ],
  },
]

export default function Rodape() {
  return (
    <footer className="bg-marinho text-white">
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo claro />
            <p className="mt-4 text-nevoa">
              Uma ponte construída com elos porque ninguém precisa caminhar sozinho.
            </p>
          </div>

          {colunas.map((coluna) => (
            <div key={coluna.titulo}>
              <h2 className="font-titulo text-base font-bold text-dourado">{coluna.titulo}</h2>
              <ul className="mt-3 space-y-2.5">
                {coluna.links.map((link) => (
                  <li key={link.texto}>
                    {link.externo ? (
                      <a href={link.para} className="hover:underline">{link.texto}</a>
                    ) : (
                      <Link to={link.para} className="hover:underline">{link.texto}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-white/15 pt-6 text-sm text-nevoa">
          © 2026 Pontelo · Projeto acadêmico · SAMU 192 · Disque 100 · Ligue 180 · CVV 188
        </p>
      </div>
    </footer>
  )
}