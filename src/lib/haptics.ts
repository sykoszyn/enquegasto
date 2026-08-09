/** Vibración corta al confirmar una acción, si el dispositivo lo soporta. */
export function hapticSuccess() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(35)
    } catch {
      // algunos navegadores tiran error si se llama sin interacción del usuario; no pasa nada
    }
  }
}
