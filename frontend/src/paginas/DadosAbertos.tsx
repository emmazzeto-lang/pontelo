import { BotaoLink } from '../componentes/Botao'
import PaginaTexto, { Topico } from '../componentes/PaginaTexto'
import { URL_DOCUMENTACAO, URL_GEOJSON } from '../servicos/api'

const link = 'font-semibold text-azul underline underline-offset-4'

const rotas = [
  ['GET /categorias', 'as categorias de serviço'],
  ['GET /servicos?lat=&lng=&raio=', 'serviços perto de um ponto, do mais próximo ao mais distante'],
  ['GET /servicos/{id}', 'detalhes de um serviço, com horários'],
  ['GET /dados/servicos.geojson', 'todos os serviços publicados, em GeoJSON'],
]

export default function DadosAbertos() {
  return (
    <PaginaTexto
      titulo="Dados abertos"
      resumo="Os serviços do Pontelo podem ser usados por pesquisadores, prefeituras e outros projetos, por exemplo para ver onde falta atendimento."
    >
      <Topico titulo="Baixar tudo de uma vez">
        <p>
          O arquivo GeoJSON abre direto em programas de mapa como QGIS, uMap e geojson.io. Ele traz todos os serviços
          publicados, com categoria, endereço, telefone e data da última conferência.
        </p>
        <div>
          <BotaoLink href={URL_GEOJSON} icone="mapa">Baixar GeoJSON</BotaoLink>
        </div>
        <p className="text-ardosia">
          Serviços com endereço sigiloso, como abrigos para quem sofre violência, ficam de fora do arquivo.
        </p>
      </Topico>

      <Topico titulo="API pública">
        <p>Leitura livre, sem cadastro, em JSON:</p>
        <ul className="grid gap-2">
          {rotas.map(([rota, descricao]) => (
            <li key={rota}>
              <code className="rounded bg-azul-claro px-1.5 py-0.5 text-[15px] text-marinho">{rota}</code>
              <span className="text-ardosia"> {descricao}</span>
            </li>
          ))}
        </ul>
        <p>
          A documentação completa, com exemplos que dá para testar no navegador, está em{' '}
          <a href={URL_DOCUMENTACAO} target="_blank" rel="noopener noreferrer" className={link}>
            documentação da API
          </a>
          . Há um limite de 100 pedidos por minuto por endereço de internet.
        </p>
      </Topico>

      <Topico titulo="Como citar">
        <p>
          Use os dados à vontade, citando o Pontelo como fonte. As coordenadas vêm do OpenStreetMap
          (© colaboradores do OpenStreetMap, licença ODbL).
        </p>
      </Topico>
    </PaginaTexto>
  )
}
