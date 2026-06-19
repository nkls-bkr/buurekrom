import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/http.ts";

export interface MetaResponse {
  stage: string;
}

const META_QUERY_KEY = ["meta"] as const;

async function fetchMeta(): Promise<MetaResponse> {
  return apiFetch<MetaResponse>("/public/meta");
}

export function useMeta() {
  return useQuery({
    queryKey: META_QUERY_KEY,
    queryFn: fetchMeta,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
