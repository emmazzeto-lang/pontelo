import { Link, NavLink } from 'react-router'
import Logo from './Logo'
import Icone from './Icone'
import BotaoSaidaRapida from './BotaoSaidaRapida'
import { cores } from '../estilos/cores'

const links = [
  { para: '/servicos', texto: 'Buscar serviços' },
  { para: '/como-funciona', texto: 'Como funciona' },
  { para: '/organizacoes', texto: 'Para organizações' },
  { para: '/dados-abertos', texto: 'Dados abertos' },
]

export default function Cabecalho() {
  return (
    <header className="border-b border-nevoa bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-4 py-3 md:py-4">
        <Logo />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex gap-8">
            {links.map((link) => (
              <li key={link.para}>
                <NavLink
                  to={link.para}
                  className={({ isActive }) =>
                    isActive
                      ? 'font-semibold text-azul underline decoration-2 underline-offset-8'
                      : 'font-medium text-marinho hover:text-azul'
                  }
                >
                  {link.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/entrar" className="inline-flex min-h-11 items-center gap-2 rounded-[10px] px-3 font-semibold hover:bg-azul-claro">
            <Icone nome="usuario" tamanho={20} cor={cores.marinho} destaque={cores.douradoEscuro} />
            Entrar
          </Link>
          <Link
            to="/sugerir"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-azul pl-3 pr-5 font-titulo font-extrabold text-white transition hover:bg-azul-hover"
          >
            <span className="grid size-6 place-items-center rounded-full bg-dourado">
              <Icone nome="mais" tamanho={15} cor={cores.marinho} />
            </span>
            Sugerir serviço
          </Link>
        </div>

        <div className="md:hidden">
          <BotaoSaidaRapida compacto />
        </div>
      </div>
    </header>
  )
}