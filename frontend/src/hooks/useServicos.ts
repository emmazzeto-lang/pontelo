import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarServicos, obterServico, type ParametrosBusca } from '../servicos/api'

export function useServicos(parametros: ParametrosBusca) {
  return useQuery({
    queryKey: ['servicos', parametros],
    queryFn: () => listarServicos(parametros),
    placeholderData: keepPreviousData,
  })
}

export function useServico(id: string) {
  return useQuery({
    queryKey: ['servico', id],
    queryFn: () => obterServico(id),
  })
}