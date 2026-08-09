import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Sparkles, Send, Paperclip, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Account, PaymentMethod } from '../types'

interface ChatMsg {
  role: 'user' | 'assistant'
  text: string
}

interface Props {
  accounts: Account[]
  context: Record<string, unknown>
  onTransactionAdded: () => void
}

const MAX_FILE_BYTES = 3 * 1024 * 1024 // 3MB (con base64 queda bajo el límite de la function)

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AiChat({ accounts, context, onTransactionAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [sending, setSending] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertOne = async (item: {
    kind: string
    amount: number
    description?: string
    payment_method?: string
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return supabase.from('transactions').insert({
      user_id: user?.id,
      account_id: accounts[0]?.id,
      kind: item.kind === 'ingreso' ? 'ingreso' : 'gasto',
      amount: Number(item.amount) || 0,
      description: item.description || null,
      payment_method: (item.payment_method as PaymentMethod) || 'transferencia_qr',
      occurred_at: new Date().toISOString(),
    })
  }

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if ((!text && !file) || sending) return

    setMessages((m) => [
      ...m,
      { role: 'user', text: text || `📎 ${file?.name}` },
    ])
    setSending(true)
    setInput('')
    const attached = file
    setFile(null)

    try {
      let fileBase64: string | undefined
      if (attached) {
        if (attached.size > MAX_FILE_BYTES) {
          setMessages((m) => [
            ...m,
            { role: 'assistant', text: 'Ese archivo pesa más de 3MB, probá con uno más chico.' },
          ])
          setSending(false)
          return
        }
        fileBase64 = await fileToBase64(attached)
      }

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context,
          fileBase64,
          fileMimeType: attached?.type,
        }),
      })
      const data = await res.json()

      if (data.action === 'add_transaction' && accounts[0]) {
        const { error } = await insertOne(data)
        if (error) {
          setMessages((m) => [...m, { role: 'assistant', text: `No pude cargarlo: ${error.message}` }])
        } else {
          setMessages((m) => [
            ...m,
            {
              role: 'assistant',
              text: `✅ Cargado: ${data.description ?? 'movimiento'} · $${Number(
                data.amount
              ).toLocaleString('es-AR')}`,
            },
          ])
          onTransactionAdded()
        }
      } else if (data.action === 'add_multiple_transactions' && accounts[0]) {
        const items = Array.isArray(data.items) ? data.items : []
        let ok = 0
        for (const item of items) {
          const { error } = await insertOne(item)
          if (!error) ok++
        }
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text:
              ok > 0
                ? `✅ ${data.summary ?? `Cargué ${ok} movimiento(s) del archivo.`}`
                : 'No pude extraer movimientos claros de ese archivo.',
          },
        ])
        if (ok > 0) onTransactionAdded()
      } else if (data.action === 'answer' || data.action === 'clarify') {
        setMessages((m) => [...m, { role: 'assistant', text: data.text ?? '¿Podés repetirlo?' }])
      } else {
        setMessages((m) => [
          ...m,
          { role: 'assistant', text: data.error ?? 'No pude procesar eso.' },
        ])
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'No pude conectarme. Probá de nuevo en un rato.' },
      ])
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-40 flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-xs font-bold text-bg shadow-glow transition hover:-translate-y-0.5 sm:bottom-5"
      >
        <Sparkles className="h-4 w-4" /> Cargar hablando
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 right-5 z-40 flex h-[440px] w-[320px] flex-col rounded-2xl border border-bg-border bg-bg-surface shadow-pop sm:bottom-5">
      <div className="flex items-center justify-between border-b border-bg-border px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Sparkles className="h-3.5 w-3.5 text-ambar" /> Asistente
        </p>
        <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-[11px] leading-relaxed text-white/30">
            Escribí algo como "súper 15 mil en efectivo", preguntá "¿cuánto
            gasté este mes?", o adjuntá el PDF/foto de un resumen de tarjeta
            con el clip de acá abajo.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
              m.role === 'user' ? 'ml-auto bg-brand text-bg' : 'bg-bg text-white/80'
            }`}
          >
            {m.text}
          </div>
        ))}
        {sending && <p className="text-[10px] text-white/30">Pensando…</p>}
      </div>

      {file && (
        <div className="mx-3 mb-1 flex items-center justify-between rounded-xl bg-bg px-3 py-2">
          <span className="truncate text-[11px] text-white/60">📎 {file.name}</span>
          <button onClick={() => setFile(null)} className="text-white/30 hover:text-gasto">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={send} className="flex items-center gap-2 border-t border-bg-border p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-bg text-white/50 transition hover:text-white"
          title="Adjuntar resumen (PDF o foto)"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí acá…"
          className="min-w-0 flex-1 rounded-xl border border-bg-border bg-bg px-3 py-2 text-xs text-white outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={sending || (!input.trim() && !file)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-bg transition hover:brightness-110 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  )
}
