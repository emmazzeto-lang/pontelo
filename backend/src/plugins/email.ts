import nodemailer from 'nodemailer'
import { config } from '../config.js'

const transporte = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORTA,
  secure: config.SMTP_PORTA === 465,
  ...(config.SMTP_USUARIO && { auth: { user: config.SMTP_USUARIO, pass: config.SMTP_SENHA } }),
})

export type Email = { para: string; assunto: string; texto: string; html: string }

export async function enviarEmail(email: Email) {
  await transporte.sendMail({
    from: config.SMTP_REMETENTE,
    to: email.para,
    subject: email.assunto,
    text: email.texto,
    html: email.html,
  })
}

export function escaparHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
