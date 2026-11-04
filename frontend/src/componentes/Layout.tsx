import { Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-marinho text-white px-4 py-3">
        Cabeçalho (Etapa 2)
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}