import { lazy } from 'react'
import { Routes, Route } from 'react-router'
import Layout from './componentes/Layout'
import Inicio from './paginas/Inicio'

// A página inicial vem junto; as outras só são baixadas quando alguém abre (deixa o primeiro carregamento leve)
const Resultados = lazy(() => import('./paginas/Resultados'))
const DetalheServico = lazy(() => import('./paginas/DetalheServico'))
const Entrar = lazy(() => import('./paginas/Entrar'))
const CriarConta = lazy(() => import('./paginas/CriarConta'))
const MinhaConta = lazy(() => import('./paginas/MinhaConta'))
const Sugerir = lazy(() => import('./paginas/Sugerir'))
const Moderacao = lazy(() => import('./paginas/Moderacao'))
const ComoFunciona = lazy(() => import('./paginas/ComoFunciona'))
const Organizacoes = lazy(() => import('./paginas/Organizacoes'))
const DadosAbertos = lazy(() => import('./paginas/DadosAbertos'))
const Privacidade = lazy(() => import('./paginas/Privacidade'))
const ModoDiscreto = lazy(() => import('./paginas/ModoDiscreto'))
const ConfirmarContato = lazy(() => import('./paginas/Contato').then((m) => ({ default: m.ConfirmarContato })))
const SairComoContato = lazy(() => import('./paginas/Contato').then((m) => ({ default: m.SairComoContato })))
const NaoEncontrada = lazy(() => import('./paginas/NaoEncontrada'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="servicos" element={<Resultados />} />
        <Route path="servicos/:id" element={<DetalheServico />} />
        <Route path="entrar" element={<Entrar />} />
        <Route path="criar-conta" element={<CriarConta />} />
        <Route path="minha-conta" element={<MinhaConta />} />
        <Route path="sugerir" element={<Sugerir />} />
        <Route path="moderacao" element={<Moderacao />} />
        <Route path="como-funciona" element={<ComoFunciona />} />
        <Route path="organizacoes" element={<Organizacoes />} />
        <Route path="dados-abertos" element={<DadosAbertos />} />
        <Route path="privacidade" element={<Privacidade />} />
        <Route path="modo-discreto" element={<ModoDiscreto />} />
        <Route path="contato/confirmar" element={<ConfirmarContato />} />
        <Route path="contato/sair" element={<SairComoContato />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}
