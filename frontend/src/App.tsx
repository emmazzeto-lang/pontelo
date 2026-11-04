import { Routes, Route } from 'react-router'
import Layout from './componentes/Layout'
import Inicio from './paginas/Inicio'
import Resultados from './paginas/Resultados'
import DetalheServico from './paginas/DetalheServico'
import NaoEncontrada from './paginas/NaoEncontrada'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="servicos" element={<Resultados />} />
        <Route path="servicos/:id" element={<DetalheServico />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}