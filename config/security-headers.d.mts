export const CSP_DIRECTIVES: Record<string, string[]>
export const CSP: string
export const CSP_META: string
export const SECURITY_HEADERS: Array<[string, string]>
export const SW_HEADERS: Array<[string, string]>
export function vercelConfig(): {
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>
}
