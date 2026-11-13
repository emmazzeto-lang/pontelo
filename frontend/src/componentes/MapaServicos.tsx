import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../estilos/mapa.css'
import { marcadorPorCategoria } from './marcadores'
import SeloConfianca from './SeloConfianca'
import { BotaoLink } from './Botao'
import { categoriaPorSlug } from '../dados/categorias'
import { cores } from '../estilos/cores'
import { formatarDistancia, linkDeRota } from '../utils/formatar'
import type { Local, Servico } from '../servicos/tipos'

type ServicoNoMapa = Omit<Servico, 'distancia_m'> & { distancia_m: number | null }
type ComPosicao = ServicoNoMapa & { localizacao: { lat: number; lng: number } }

type Props = {
  servicos: ServicoNoMapa[]
  local?: Local
}

export default function MapaServicos({ servicos, local }: Props) {
  const noMapa = useMemo(() => servicos.filter((s): s is ComPosicao => s.localizacao !== null), [servicos])
  const protegidos = servicos.length - noMapa.length
  const primeiro = noMapa[0]

  if (!primeiro) {
    return (
      <div className="grid min-h-80 place-items-center rounded-2xl border border-nevoa bg-white p-6 text-center text-ardosia">
        Os serviços desta busca têm endereço protegido e não aparecem no mapa. Veja a lista para ligar.
      </div>
    )
  }

  return (
    <>
      {protegidos > 0 && (
        <p className="mb-3 text-sm text-ardosia">
          {protegidos === 1 ? '1 serviço tem' : `${protegidos} serviços têm`} endereço protegido e não aparece
          {protegidos === 1 ? '' : 'm'} no mapa. Veja a lista para ligar.
        </p>
      )}
      <div className="isolate h-[60vh] min-h-[420px] overflow-hidden rounded-2xl border border-nevoa">
        <MapContainer
          center={[primeiro.localizacao.lat, primeiro.localizacao.lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <EnquadrarServicos servicos={noMapa} />

          {local?.tipo === 'gps' && (
            <CircleMarker
              center={[local.lat, local.lng]}
              radius={9}
              pathOptions={{ color: cores.branco, weight: 3, fillColor: cores.azul, fillOpacity: 1 }}
            >
              <Tooltip>Você está aqui</Tooltip>
            </CircleMarker>
          )}

          {noMapa.map((s) => (
            <Marker
              key={s.id}
              position={[s.localizacao.lat, s.localizacao.lng]}
              icon={marcadorPorCategoria[s.categoria]}
              title={s.nome}
            >
              <Popup minWidth={240} maxWidth={280}>
                <BalaoServico servico={s} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  )
}

function EnquadrarServicos({ servicos }: { servicos: ComPosicao[] }) {
  const mapa = useMap()

  useEffect(() => {
    const pontos = servicos.map((s): [number, number] => [s.localizacao.lat, s.localizacao.lng])
    mapa.fitBounds(L.latLngBounds(pontos), { padding: [48, 48], maxZoom: 15 })
  }, [mapa, servicos])

  return null
}

function BalaoServico({ servico }: { servico: ComPosicao }) {
  const { lat, lng } = servico.localizacao
  const categoria = categoriaPorSlug[servico.categoria].nome

  return (
    <div className="grid gap-2">
      <h3 className="text-base font-bold leading-tight">
        <Link to={`/servicos/${servico.id}`} className="text-marinho hover:underline">
          {servico.nome}
        </Link>
      </h3>
      <div className="text-sm text-ardosia">
        {servico.distancia_m === null ? categoria : `${categoria} · ${formatarDistancia(servico.distancia_m)} de você`}
      </div>
      <SeloConfianca ultimaVerificacao={servico.ultima_verificacao_em} />
      <div className={`text-sm font-medium ${servico.aberto_agora ? 'text-verificado' : 'text-ardosia'}`}>
        {servico.aberto_agora ? 'Aberto agora' : 'Fechado'} · {servico.horario_hoje}
      </div>
      <div className="mt-1 grid gap-2">
        {servico.telefone && (
          <BotaoLink href={`tel:${servico.telefone}`} icone="telefone" larguraTotal>
            Ligar
          </BotaoLink>
        )}
        <BotaoLink href={linkDeRota(lat, lng)} novaAba variante="suave" icone="rota" larguraTotal>
          Como chegar
        </BotaoLink>
      </div>
    </div>
  )
}
