// Chamadas à API do modo discreto. Arquivo pequeno e separado do api.ts de propósito:
// a calculadora importa só isto, para continuar leve e sem nenhum texto do Pontelo no código dela.

const URL_API = import.meta.env.VITE_API_URL
const usarExemplos = import.meta.env.VITE_USAR_EXEMPLOS === 'true'

export class FalhaAlerta extends Error {
  codigo: string
  constructor(codigo: string, mensagem: string) {
    super(mensagem)
    this.codigo = codigo
  }
}

async function enviar<T>(caminho: string, corpo: unknown): Promise<T> {
  if (usarExemplos) {
    await new Promise((r) => setTimeout(r, 500))
    return { dados: { ok: true, enviados: 1 } } as T
  }

  let resposta: Response
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      // O alerta precisa sair mesmo que a página seja fechada logo depois
      keepalive: true,
    })
  } catch {
    throw new FalhaAlerta('SEM_CONEXAO', 'Sem conexão com a internet.')
  }
  const json = (await resposta.json().catch(() => null)) as { erro?: { codigo: string; mensagem: string } } | null
  if (!resposta.ok) throw new FalhaAlerta(json?.erro?.codigo ?? 'ERRO', json?.erro?.mensagem ?? 'Algo deu errado.')
  return json as T
}

export const convidarContato = (email: string, apelido: string) => enviar('/alerta/contatos/convite', { email, apelido })

export async function situacaoDosContatos(emails: string[]) {
  if (usarExemplos) return emails.map((email) => ({ email, confirmado: false }))
  const r = await enviar<{ dados: { email: string; confirmado: boolean }[] }>('/alerta/contatos/situacao', { emails })
  return r.dados
}

export const confirmarContato = (token: string) => enviar('/alerta/contatos/confirmar', { token })
export const sairComoContato = (token: string) => enviar('/alerta/contatos/sair', { token })

export type Localizacao = { lat: number; lng: number; precisao_m: number }

// Pega a localização SÓ se a pessoa já deu permissão antes (na configuração).
// Assim a calculadora nunca mostra uma janela "permitir localização?", que chamaria atenção.
export async function localizacaoSilenciosa(): Promise<Localizacao | undefined> {
  try {
    const permissao = await navigator.permissions?.query({ name: 'geolocation' })
    if (permissao && permissao.state !== 'granted') return undefined
  } catch {
    // navegador sem a API de permissões: tenta mesmo assim
  }
  return new Promise((resolver) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolver({ lat: p.coords.latitude, lng: p.coords.longitude, precisao_m: p.coords.accuracy }),
      () => resolver(undefined),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    )
  })
}

type Alerta = { apelido: string; contatos: string[]; teste?: boolean }

// Tenta algumas vezes antes de desistir: sinal fraco é comum justamente na hora do aperto
export async function enviarAlerta({ apelido, contatos, teste = false }: Alerta) {
  const localizacao = await localizacaoSilenciosa()
  let ultimaFalha: unknown
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      return await enviar<{ dados: { enviados: number } }>('/alerta', { apelido, contatos, localizacao, teste })
    } catch (falha) {
      ultimaFalha = falha
      // Erro que repetir não resolve (ex.: nenhum contato confirmou): para na hora
      if (falha instanceof FalhaAlerta && falha.codigo !== 'SEM_CONEXAO' && falha.codigo !== 'ALERTA_NAO_ENVIADO') break
      await new Promise((r) => setTimeout(r, 4000))
    }
  }
  throw ultimaFalha
}
