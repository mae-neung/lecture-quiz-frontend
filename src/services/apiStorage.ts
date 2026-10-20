import { API_BASE_URL } from './api'

export function resolveApiStorageNamespace(explicit: string | undefined, proxyTarget: string | undefined, baseUrl: string): string {
  return explicit?.trim() || proxyTarget?.trim() || baseUrl
}

export const API_STORAGE_NAMESPACE = resolveApiStorageNamespace(
  import.meta.env.VITE_API_STORAGE_NAMESPACE,
  import.meta.env.VITE_API_PROXY_TARGET,
  API_BASE_URL,
)

export function apiSessionKey(namespace = API_STORAGE_NAMESPACE): string {
  return `lecture-quiz-api-user-id.${encodeURIComponent(namespace)}`
}

export function apiLibraryScope(userId: string, namespace = API_STORAGE_NAMESPACE): string {
  return `${encodeURIComponent(namespace)}:${encodeURIComponent(userId)}`
}
