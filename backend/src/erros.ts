// Erro de negócio no formato da documentação (seção 7):
// { "erro": { "codigo": "...", "mensagem": "..." } }
export class ErroApi extends Error {
  status: number
  codigo: string

  constructor(status: number, codigo: string, mensagem: string) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
    this.codigo = codigo
  }
}
