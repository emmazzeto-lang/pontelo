import { useSyncExternalStore } from 'react'

export type Usuario = {
  id: string
  nome: string
  email: string
  papel: 'colaborador' | 'organizacao' | 'moderador'
}

export type EstadoSessao =
  | { status: 'carregando'; usuario: null }
  | { status: 'anonimo'; usuario: null }
  | { status: 'logado'; usuario: Usuario }

let estado: EstadoSessao = { status: 'carregando', usuario: null }
let tokenAcesso: string | null = null
const ouvintes = new Set<() => void>()

function avisar() {
  ouvintes.forEach((ouvinte) => ouvinte())
}

export function obterToken() {
  return tokenAcesso
}

export function guardarSessao(usuario: Usuario, token: string) {
  tokenAcesso = token
  estado = { status: 'logado', usuario }
  avisar()
}

export function limparSessao() {
  tokenAcesso = null
  estado = { status: 'anonimo', usuario: null }
  avisar()
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

export function useSessao() {
  return useSyncExternalStore(assinar, () => estado)
}
