// Cliente para dolarapi.com — cotizaciones públicas del dólar en Argentina,
// sin necesidad de API key. https://dolarapi.com/docs/argentina/

export interface DolarRate {
  compra: number
  venta: number
  casa: string
  nombre: string
  moneda: string
  fechaActualizacion: string
}

async function fetchRate(casa: 'oficial' | 'cripto'): Promise<DolarRate | null> {
  try {
    const res = await fetch(`https://dolarapi.com/v1/dolares/${casa}`)
    if (!res.ok) return null
    return (await res.json()) as DolarRate
  } catch {
    return null
  }
}

export async function fetchDolarRates() {
  const [oficial, cripto] = await Promise.all([fetchRate('oficial'), fetchRate('cripto')])
  return { oficial, cripto }
}
