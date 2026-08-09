// Vercel Serverless Function: crea una preferencia de pago en Mercado Pago
// para donaciones. El access token vive solo acá (variable de entorno
// MP_ACCESS_TOKEN en Vercel, SIN prefijo VITE_), nunca en el navegador.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    res.status(500).json({
      error: 'Falta configurar MP_ACCESS_TOKEN en las variables de entorno de Vercel.',
    })
    return
  }

  const amount = Number((req.body || {}).amount)
  if (!amount || amount <= 0 || amount > 1000000) {
    res.status(400).json({ error: 'Importe inválido' })
    return
  }

  const siteUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.SITE_URL || 'https://quegasto.app'

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: 'Donación a En qué gasto?',
            quantity: 1,
            unit_price: amount,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${siteUrl}/app/configuracion?donacion=exito`,
          failure: `${siteUrl}/app/configuracion?donacion=error`,
          pending: `${siteUrl}/app/configuracion?donacion=pendiente`,
        },
        auto_return: 'approved',
      }),
    })

    if (!mpRes.ok) {
      const errText = await mpRes.text()
      res.status(502).json({ error: 'Error de Mercado Pago', detail: errText })
      return
    }

    const data = await mpRes.json()
    res.status(200).json({ init_point: data.init_point })
  } catch (err) {
    res.status(500).json({ error: 'Error inesperado', detail: String(err) })
  }
}
