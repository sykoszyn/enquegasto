// Netlify Function: proxy hacia la API gratuita de Google Gemini.
// La API key vive solo acá (variable de entorno GEMINI_API_KEY en Netlify,
// SIN el prefijo VITE_), nunca llega al navegador del usuario.

const SYSTEM_PROMPT = `Sos el asistente de "En qué gasto?", una app de finanzas
personales en español rioplatense (Argentina). El usuario te escribe en
lenguaje natural para cargar un gasto/ingreso o para preguntar sobre su
resumen del mes. Tenés que responder SIEMPRE con un JSON válido, sin texto
extra antes ni después, con esta forma exacta:

Si el mensaje describe algo para cargar (ej. "super 15 mil en efectivo",
"me pagaron 200000 de sueldo"):
{"action":"add_transaction","kind":"gasto|ingreso","amount":<numero>,"description":"<texto corto>","payment_method":"efectivo|debito|credito|transferencia_qr"}

Si el mensaje es una pregunta sobre el resumen que te paso como contexto:
{"action":"answer","text":"<respuesta corta y clara, en español rioplatense>"}

Si no entendés el mensaje o falta el importe:
{"action":"clarify","text":"<qué te falta saber, en una frase corta>"}

Nunca inventes categorías: dejá category en null si no está clara. El campo
payment_method, si no se menciona un medio de pago, usá "transferencia_qr"
por defecto.`

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          'Falta configurar GEMINI_API_KEY en las variables de entorno de Netlify.',
      }),
    }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body inválido' }) }
  }

  const { message, context } = payload
  if (!message || typeof message !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Falta el mensaje' }) }
  }

  const prompt = `Contexto del usuario (resumen del mes actual, en JSON): ${JSON.stringify(
    context ?? {}
  )}\n\nMensaje del usuario: "${message}"`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Error de la API de Gemini', detail: errText }),
      }
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = { action: 'clarify', text: 'No te entendí bien, ¿podés reformularlo?' }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error inesperado', detail: String(err) }),
    }
  }
}
