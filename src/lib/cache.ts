// Caché liviano en localStorage: pinta al instante con lo último visto,
// mientras los datos frescos llegan de Supabase en segundo plano.
// No reemplaza a Supabase como fuente de verdad, es solo para que la
// primera pintura no dependa de la latencia de red.

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`enquegasto:cache:${key}`)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setCached<T>(key: string, value: T) {
  try {
    localStorage.setItem(`enquegasto:cache:${key}`, JSON.stringify(value))
  } catch {
    // localStorage lleno o no disponible (modo privado): no pasa nada,
    // simplemente no cacheamos.
  }
}
