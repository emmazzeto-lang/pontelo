import { createHmac, timingSafeEqual } from 'node:crypto'
import { config } from '../config.js'
import { ErroApi } from '../erros.js'
import { enviarEmail, escaparHtml } from '../plugins/email.js'
import * as repositorio from '../repositorios/alerta.repositorio.js'

const segredo = (finalidade: string) => createHmac('sha256', config.REFRESH_TOKEN_SECRET).update(finalidade).digest()

const hashEmail = (email: string) => createHmac('sha256', segredo('contato-alerta')).update(email).digest('hex')

type Finalidade = 'confirmar' | 'sair'

function assinar(email: string, finalidade: Finalidade, validadeDias: number) {
  const dados = Buffer.from(JSON.stringify({ email, finalidade, expira: Date.now() + validadeDias * 86_400_000 })).toString('base64url')
  const assinatura = createHmac('sha256', segredo('token-contato')).update(dados).digest('base64url')
  return `${dados}.${assinatura}`
}

function conferir(token: string, finalidade: Finalidade) {
  const invalido = () => new ErroApi(400, 'LINK_INVALIDO', 'Este link não é válido ou já venceu.')
  const [dados, assinatura] = token.split('.')
  if (!dados || !assinatura) throw invalido()

  const esperada = createHmac('sha256', segredo('token-contato')).update(dados).digest()
  const recebida = Buffer.from(assinatura, 'base64url')
  if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) throw invalido()

  let conteudo: { email: string; finalidade: string; expira: number }
  try {
    conteudo = JSON.parse(Buffer.from(dados, 'base64url').toString())
  } catch {
    throw invalido()
  }
  if (conteudo.finalidade !== finalidade || conteudo.expira < Date.now()) throw invalido()
  return conteudo.email
}

const linkSair = (email: string) => `${config.FRONTEND_URL}/contato/sair#${assinar(email, 'sair', 365)}`

const rodape = (email: string) => ({
  texto: `\n\nNão quer mais receber alertas de ninguém pelo Pontelo? ${linkSair(email)}`,
  html: `<p style="margin-top:32px;font-size:13px;color:#4a5a6e">Não quer mais receber alertas de ninguém pelo Pontelo? <a href="${linkSair(email)}">Parar de receber</a></p>`,
})

export async function convidar(email: string, apelido: string) {
  const link = `${config.FRONTEND_URL}/contato/confirmar#${assinar(email, 'confirmar', 7)}`
  const nome = escaparHtml(apelido)
  const fim = rodape(email)

  try {
    await enviarEmail({
      para: email,
      assunto: `${apelido} quer ter você como contato de confiança`,
      texto:
        `${apelido} escolheu você como contato de confiança no Pontelo.\n\n` +
        `Se um dia ${apelido} estiver em perigo, poderá enviar um pedido de ajuda discreto, com a localização, para este e-mail.\n\n` +
        `Para aceitar, abra: ${link}\n\nSe você não conhece ${apelido}, ignore este e-mail.` +
        fim.texto,
      html:
        `<p><strong>${nome}</strong> escolheu você como contato de confiança no Pontelo.</p>` +
        `<p>Se um dia ${nome} estiver em perigo, poderá enviar um pedido de ajuda discreto, com a localização, para este e-mail.</p>` +
        `<p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#1f5f94;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold">Aceitar ser contato de confiança</a></p>` +
        `<p>Se você não conhece ${nome}, ignore este e-mail.</p>` +
        fim.html,
    })
  } catch {
    throw new ErroApi(502, 'EMAIL_NAO_ENVIADO', 'Não conseguimos enviar o convite agora. Tente de novo em alguns minutos.')
  }
}

export async function confirmar(token: string) {
  await repositorio.marcarConfirmado(hashEmail(conferir(token, 'confirmar')))
}

export async function sair(token: string) {
  await repositorio.remover(hashEmail(conferir(token, 'sair')))
}

export async function situacao(emails: string[]) {
  const confirmados = await repositorio.confirmados(emails.map(hashEmail))
  return emails.map((email) => ({ email, confirmado: confirmados.has(hashEmail(email)) }))
}

type PedidoAlerta = {
  apelido: string
  contatos: string[]
  localizacao?: { lat: number; lng: number; precisao_m?: number | undefined } | undefined
  teste: boolean
}

const horaEmSaoPaulo = () =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date())

function montarAlerta(p: PedidoAlerta, email: string) {
  const nome = escaparHtml(p.apelido)
  const quando = horaEmSaoPaulo()
  const fim = rodape(email)
  const prefixo = p.teste ? '[TESTE] ' : ''

  const local = p.localizacao
  const mapa = local && `https://www.google.com/maps?q=${local.lat.toFixed(6)},${local.lng.toFixed(6)}`
  const precisao = local?.precisao_m ? ` (precisão de cerca de ${Math.round(local.precisao_m)} m)` : ''

  const aviso = p.teste
    ? 'Isto é só um TESTE do modo discreto. Está tudo bem, não é preciso fazer nada.'
    : `${p.apelido} acionou um pedido de ajuda e pode estar em perigo.`

  const orientacoes = [
    'Evite ligar de volta: quem estiver por perto pode ouvir. Prefira uma mensagem neutra, como "tudo certo para amanhã?".',
    'Se achar que há perigo agora, ligue 190 (Polícia Militar) e informe a localização acima.',
    'Em caso de violência contra a mulher, a Central de Atendimento é o 180.',
  ]

  return {
    para: email,
    assunto: `${prefixo}${p.teste ? `Teste do alerta de ${p.apelido}` : `URGENTE: ${p.apelido} pediu ajuda`}`,
    texto:
      `${prefixo}${aviso}\n\nEnviado em ${quando}.\n\n` +
      (mapa ? `Localização${precisao}: ${mapa}\n\n` : 'A localização não pôde ser obtida.\n\n') +
      (p.teste ? '' : `O que fazer:\n- ${orientacoes.join('\n- ')}`) +
      fim.texto,
    html:
      `<p style="font-size:18px"><strong>${prefixo}${escaparHtml(aviso)}</strong></p>` +
      `<p>Enviado em ${quando}.</p>` +
      (mapa
        ? `<p><a href="${mapa}" style="display:inline-block;padding:12px 20px;background:#b3261e;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold">Ver localização no mapa</a><br><span style="font-size:13px;color:#4a5a6e">${escaparHtml(precisao.trim())}</span></p>`
        : '<p>A localização não pôde ser obtida.</p>') +
      (p.teste ? '' : `<p><strong>O que fazer</strong></p><ul>${orientacoes.map((o) => `<li>${escaparHtml(o)}</li>`).join('')}</ul>`) +
      `<p style="font-size:13px;color:#4a5a6e">Alerta enviado pelo modo discreto do Pontelo a pedido de ${nome}.</p>` +
      fim.html,
  }
}

export async function enviarAlerta(p: PedidoAlerta) {
  const confirmados = await repositorio.confirmados(p.contatos.map(hashEmail))
  const destinatarios = p.contatos.filter((email) => confirmados.has(hashEmail(email)))

  if (destinatarios.length === 0) {
    throw new ErroApi(422, 'SEM_CONTATOS_CONFIRMADOS', 'Nenhum contato confirmou ainda. Peça para abrirem o e-mail de convite.')
  }

  const resultados = await Promise.allSettled(destinatarios.map((email) => enviarEmail(montarAlerta(p, email))))
  const enviados = resultados.filter((r) => r.status === 'fulfilled').length

  if (enviados === 0) {
    throw new ErroApi(502, 'ALERTA_NAO_ENVIADO', 'Não conseguimos enviar o alerta agora. Ligue 190 se puder.')
  }
  return { dados: { enviados } }
}
