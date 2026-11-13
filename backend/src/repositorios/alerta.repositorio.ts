import { banco } from '../plugins/banco.js'

export async function marcarConfirmado(emailHash: string) {
  await banco.contatos_alerta.upsert({
    where: { email_hash: emailHash },
    create: { email_hash: emailHash },
    update: {},
  })
}

export async function remover(emailHash: string) {
  await banco.contatos_alerta.deleteMany({ where: { email_hash: emailHash } })
}

export async function confirmados(hashes: string[]) {
  const linhas = await banco.contatos_alerta.findMany({ where: { email_hash: { in: hashes } }, select: { email_hash: true } })
  return new Set(linhas.map((l) => l.email_hash))
}
