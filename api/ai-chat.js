// Vercel Serverless Function: proxy hacia la API gratuita de Google Gemini.
// La API key vive solo acá (variable de entorno GEMINI_API_KEY en Vercel,
// SIN el prefijo VITE_), nunca llega al navegador del usuario.

const SYSTEM_PROMPT = `Sos el asistente de "En qué gasto?", una app de finanzas
personales en español rioplatense (Argentina). El usuario te escribe en
lenguaje natural para cargar un gasto/ingreso, para preguntar sobre su
resumen del mes, o te adjunta un PDF/foto de un resumen de tarjeta de
crédito o extracto bancario para que extraigas los movimientos. Tenés que
responder SIEMPRE con un JSON válido, sin texto extra antes ni después, con
alguna de estas formas exactas:

1) Si el mensaje describe UN solo movimiento para cargar (ej. "super 15 mil
en efectivo", "me pagaron 200000 de sueldo"):
{"action":"add_transaction","kind":"gasto|ingreso","amount":<numero>,"description":"<texto corto>","payment_method":"efectivo|debito|credito|transferencia_qr"}

2) Si te adjuntaron un archivo (resumen de tarjeta o extracto) con VARIOS
movimientos, extraé cada línea de compra/gasto/ingreso que puedas identificar
con claridad (ignorá totales, subtotales, intereses, IVA y textos legales) y
devolvé:
{"action":"add_multiple_transactions","items":[{"kind":"gasto|ingreso","amount":<numero>,"description":"<comercio o concepto>","payment_method":"credito"}],"summary":"<una frase corta con cuántos movimientos encontraste y el total>"}
No inventes movimientos que no estén en el documento. Si el documento no es
legible o no tiene movimientos claros, usá la acción "clarify" explicando eso.

3) Si el mensaje es una pregunta sobre el resumen que te paso como contexto:
{"action":"answer","text":"<respuesta corta y clara, en español rioplatense>"}

4) Si no entendés el mensaje, falta el importe, o el archivo no se pudo leer:
{"action":"clarify","text":"<qué te falta saber, en una frase corta>"}

Nunca inventes categorías: no incluyas ese campo. El campo payment_method, si
no se menciona o no se puede inferir un medio de pago, usá
"transferencia_qr" por defecto (excepto en resúmenes de tarjeta, ahí usá
"credito").`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({
      error: 'Falta configurar GEMINI_API_KEY en las variables de entorno de Vercel.',
    })
    return
  }

  const { message, context, fileBase64, fileMimeType } = req.body || {}

  if ((!message || typeof message !== 'string') && !fileBase64) {
    res.status(400).json({ error: 'Falta el mensaje o el archivo' })
    return
  }

  const prompt = `Contexto del usuario (resumen del mes actual, en JSON): ${JSON.stringify(
    context ?? {}
  )}\n\nMensaje del usuario: "${message ?? ''}"${
    fileBase64 ? '\n\n(el usuario adjuntó un archivo, analizalo según la instrucción 2)' : ''
  }`

  const parts = [{ text: prompt }]
  if (fileBase64 && fileMimeType) {
    parts.push({
      inline_data: {
        mime_type: fileMimeType,
        data: fileBase64,
      },
    })
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      res.status(502).json({ error: 'Error de la API de Gemini', detail: errText })
      return
    }

    const data = await geminiRes.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = { action: 'clarify', text: 'No te entendí bien, ¿podés reformularlo?' }
    }

    res.status(200).json(parsed)
  } catch (err) {
    res.status(500).json({ error: 'Error inesperado', detail: String(err) })
  }
}
