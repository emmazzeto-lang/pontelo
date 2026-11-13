import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Botao } from '../componentes/Botao'
import PaginaTexto, { Topico } from '../componentes/PaginaTexto'
import { confirmarContato, sairComoContato } from '../discreto/alerta'

// Páginas abertas pelos links do e-mail que o CONTATO de confiança recebe.
// O token vem depois do "#": essa parte do endereço não é enviada a servidor nenhum.
// Há um botão (em vez de confirmar sozinho ao abrir) porque alguns e-mails abrem os links
// automaticamente para checar vírus, e isso não pode valer como aceite.

const tokenDoEndereco = () => window.location.hash.slice(1)

export function ConfirmarContato() {
  const [token] = useState(tokenDoEndereco)
  const aceite = useMutation({ mutationFn: () => confirmarContato(token) })

  if (aceite.isSuccess) {
    return (
      <PaginaTexto titulo="Obrigado por aceitar" resumo="Agora você é um contato de confiança. Se essa pessoa pedir ajuda, você recebe um e-mail com a localização dela.">
        <OQueFazer />
      </PaginaTexto>
    )
  }

  return (
    <PaginaTexto
      titulo="Aceitar ser contato de confiança"
      resumo="Alguém que confia em você quer poder pedir ajuda de forma discreta, numa situação de perigo. O pedido chega por e-mail, com a localização."
    >
      <Topico titulo="Antes de aceitar">
        <p>Fique de olho no seu e-mail. Se puder, ative as notificações do aplicativo de e-mail no celular.</p>
        <p>Você pode deixar de receber os alertas quando quiser, pelo link no fim de cada e-mail.</p>
      </Topico>
      <Botao tamanho="lg" disabled={!token || aceite.isPending} onClick={() => aceite.mutate()}>
        {aceite.isPending ? 'Confirmando…' : 'Aceito ser contato de confiança'}
      </Botao>
      <div role="status">
        {(!token || aceite.isError) && (
          <p className="mt-3 font-medium text-erro">
            {aceite.error?.message ?? 'Este link está incompleto. Abra de novo pelo e-mail.'}
          </p>
        )}
      </div>
    </PaginaTexto>
  )
}

export function SairComoContato() {
  const [token] = useState(tokenDoEndereco)
  const saida = useMutation({ mutationFn: () => sairComoContato(token) })

  return (
    <PaginaTexto
      titulo={saida.isSuccess ? 'Pronto' : 'Parar de receber alertas'}
      resumo={
        saida.isSuccess
          ? 'Você não vai mais receber alertas pelo Pontelo neste e-mail.'
          : 'Se confirmar, este e-mail deixa de receber pedidos de ajuda de qualquer pessoa pelo Pontelo.'
      }
    >
      {!saida.isSuccess && (
        <Botao variante="suave" disabled={!token || saida.isPending} onClick={() => saida.mutate()}>
          {saida.isPending ? 'Enviando…' : 'Parar de receber alertas'}
        </Botao>
      )}
      <div role="status">
        {saida.isError && <p className="mt-3 font-medium text-erro">{saida.error.message}</p>}
      </div>
    </PaginaTexto>
  )
}

function OQueFazer() {
  return (
    <Topico titulo="Se um alerta chegar">
      <ul className="list-disc space-y-1 pl-6">
        <li>Abra o link do mapa para ver onde a pessoa está.</li>
        <li>
          Evite ligar de volta: quem estiver por perto pode ouvir. Prefira uma mensagem neutra, como “tudo certo para
          amanhã?”.
        </li>
        <li>
          Se achar que há perigo agora, ligue <a href="tel:190" className="font-semibold text-azul underline">190</a> e
          informe a localização.
        </li>
        <li>
          Em caso de violência contra a mulher, a Central de Atendimento é o{' '}
          <a href="tel:180" className="font-semibold text-azul underline">180</a>.
        </li>
      </ul>
    </Topico>
  )
}
