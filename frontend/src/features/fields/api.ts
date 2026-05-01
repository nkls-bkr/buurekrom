import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/http'

interface GeoJsonPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

interface CreateFieldRequest {
  name: string
  geometry: GeoJsonPolygon
}

export interface FieldResponse {
  id: number
  name: string
  geometry: GeoJsonPolygon
}

const FIELDS_KEY = ['fields'] as const

async function fetchFields(): Promise<FieldResponse[]> {
  return apiFetch<FieldResponse[]>('/fields')
}

async function createField(request: CreateFieldRequest): Promise<FieldResponse> {
  return apiFetch<FieldResponse>('/fields', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

async function deleteFields(ids: readonly number[]): Promise<void> {
  await Promise.all(
    ids.map((id) => apiFetch<void>(`/fields/${id}`, { method: 'DELETE' })),
  )
}

export function useFields() {
  return useQuery({ queryKey: FIELDS_KEY, queryFn: fetchFields })
}

export function useCreateFieldMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createField,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FIELDS_KEY }),
  })
}

export function useDeleteFieldsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFields,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FIELDS_KEY }),
  })
}
