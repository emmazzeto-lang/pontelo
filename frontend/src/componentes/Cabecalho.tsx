import { useId, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import Logo from './Logo'
import Icone from './Icone'
import BotaoSaidaRapida from './BotaoSaidaRapida'
import { cores } from '../estilos/cores'
import { sair } from '../servicos/api'
import { useSessao } from '../servicos/sessao'

const links = [
  { para: '/servicos', texto: 'Buscar serviços' },
  { para: '/como-funciona', texto: 'Como funciona' },
  { para: '/organizacoes', texto: 'Para organizações' },
  { para: '/dados-abertos', texto: 'Dados abertos' },
]

const classeLinkAtivo = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'font-semibold text-azul underline decoration-2 underline-offset-8' : 'font-medium text-marinho hover:text-azul'

export default function Cabecalho() {
  const idMenu = useId()
  const { pathname } = useLocation()
  // Guarda em qual página o menu foi aberto: ao trocar de página, ele conta como fechado sozinho
  const [abertoEm, setAbertoEm] = useState<string | null>(null)
  const menuAberto = abertoEm === pathname

  return (
    <header className="border-b border-nevoa bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Logo />

        {/* Telas grandes: tudo à vista */}
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex gap-8">
            {links.map((link) => (
              <li key={link.para}>
                <NavLink to={link.para} className={classeLinkAtivo}>{link.texto}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Conta />
            <BotaoSugerir />
          </div>

          <div className="md:hidden">
            <BotaoSaidaRapida compacto />
          </div>

          {/* Telas menores: os links ficam no menu */}
          <button
            type="button"
            aria-expanded={menuAberto}
            aria-controls={idMenu}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setAbertoEm(menuAberto ? null : pathname)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-nevoa px-2.5 font-semibold hover:bg-azul-claro lg:hidden"
          >
            <Icone nome={menuAberto ? 'fechar' : 'menu'} tamanho={20} cor={cores.marinho} destaque={cores.douradoEscuro} />
            {/* Em celulares bem estreitos fica só o ícone (o aria-label dá o nome para leitores de tela) */}
            <span aria-hidden="true" className="max-[379px]:hidden">{menuAberto ? 'Fechar' : 'Menu'}</span>
          </button>
        </div>
      </div>

      {menuAberto && <MenuCompacto id={idMenu} />}
    </header>
  )
}

function BotaoSugerir({ larguraTotal = false }: { larguraTotal?: boolean }) {
  return (
    <Link
      to="/sugerir"
      className={`inline-flex min-h-12 items-center gap-2.5 rounded-full bg-azul pl-3 pr-5 font-titulo font-extrabold text-white transition hover:bg-azul-hover ${larguraTotal ? 'w-full justify-center' : ''}`}
    >
      <span className="grid size-6 place-items-center rounded-full bg-dourado">
        <Icone nome="mais" tamanho={15} cor={cores.marinho} />
      </span>
      Sugerir serviço
    </Link>
  )
}

// Menu de celular e tablet: links do site e, abaixo, a conta
function MenuCompacto({ id }: { id: string }) {
  const sessao = useSessao()
  const { pathname } = useLocation()
  const item = 'flex min-h-13 items-center border-b border-nevoa text-lg'

  return (
    <div id={id} className="border-t border-nevoa bg-white lg:hidden">
      <nav aria-label="Menu" className="mx-auto max-w-[1200px] px-4 pb-6">
        <ul>
          {links.map((link) => (
            <li key={link.para}>
              <NavLink to={link.para} className={(estado) => `${item} ${classeLinkAtivo(estado)}`}>
                {link.texto}
              </NavLink>
            </li>
          ))}
          {sessao.status === 'logado' && sessao.usuario.papel === 'moderador' && (
            <li>
              <NavLink to="/moderacao" className={(estado) => `${item} ${classeLinkAtivo(estado)}`}>Moderação</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/privacidade" className={(estado) => `${item} ${classeLinkAtivo(estado)}`}>Privacidade</NavLink>
          </li>
        </ul>

        {/* No tablet a conta já aparece no topo; aqui só no celular */}
        <div className="mt-5 grid gap-3 md:hidden">
          {sessao.status === 'logado' ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link to="/minha-conta" className="inline-flex min-h-11 items-center gap-2 font-semibold">
                <Icone nome="usuario" tamanho={20} cor={cores.marinho} destaque={cores.douradoEscuro} />
                {sessao.usuario.nome.split(' ')[0]} · Minha conta
              </Link>
              <button type="button" onClick={() => void sair()} className="min-h-11 px-2 font-medium text-ardosia underline underline-offset-4">
                Sair da conta
              </button>
            </div>
          ) : (
            <Link
              to="/entrar"
              state={{ de: pathname }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-marinho font-semibold"
            >
              <Icone nome="usuario" tamanho={20} cor={cores.marinho} destaque={cores.douradoEscuro} />
              Entrar
            </Link>
          )}
          <BotaoSugerir larguraTotal />
        </div>
      </nav>
    </div>
  )
}

// "Entrar" para quem não está logado; primeiro nome (leva para Minha conta) e "Sair" para quem está
function Conta() {
  const sessao = useSessao()
  const { pathname } = useLocation()

  if (sessao.status === 'logado') {
    const primeiroNome = sessao.usuario.nome.split(' ')[0]
    return (
      <div className="flex items-center gap-1">
        {sessao.usuario.papel === 'moderador' && (
          <NavLink
            to="/moderacao"
            className={({ isActive }) =>
              `hidden min-h-11 items-center rounded-[10px] px-3 font-semibold hover:bg-azul-claro lg:inline-flex ${isActive ? 'text-azul underline decoration-2 underline-offset-8' : ''}`
            }
          >
            Moderação
          </NavLink>
        )}
        <Link
          to="/minha-conta"
          title="Minha conta"
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] px-2 font-semibold hover:bg-azul-claro"
        >
          <Icone nome="usuario" tamanho={20} cor={cores.marinho} destaque={cores.douradoEscuro} />
          {primeiroNome}
        </Link>
        <button
          type="button"
          onClick={() => void sair()}
          className="inline-flex min-h-11 items-center rounded-[10px] px-3 font-medium text-ardosia underline-offset-4 hover:bg-azul-claro hover:underline"
        >
          Sair
        </button>
      </div>
    )
  }

  // Enquanto confere a sessão, guarda o espaço para o cabeçalho não "pular"
  return (
    <Link
      to="/entrar"
      // Volta para esta página depois de entrar
      state={{ de: pathname }}
      aria-hidden={sessao.status === 'carregando' || undefined}
      tabIndex={sessao.status === 'carregando' ? -1 : undefined}
      className={`inline-flex min-h-11 items-center gap-2 rounded-[10px] px-3 font-semibold hover:bg-azul-claro ${sessao.status === 'carregando' ? 'invisible' : ''}`}
    >
      <Icone nome="usuario" tamanho={20} cor={cores.marinho} destaque={cores.douradoEscuro} />
      Entrar
    </Link>
  )
}
