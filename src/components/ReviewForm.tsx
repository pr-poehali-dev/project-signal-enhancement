import { useState } from "react"
import Icon from "@/components/ui/icon"

const SUBMIT_URL = "https://functions.poehali.dev/9662e45a-0005-4327-abc9-e95636dd6e19"

export function ReviewForm() {
  const [author, setAuthor] = useState("")
  const [text, setText] = useState("")
  const [stars, setStars] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

  const submit = async () => {
    if (!author.trim() || !text.trim()) return
    setStatus("sending")
    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim(), text: text.trim(), stars }),
      })
      if (res.ok) {
        setStatus("success")
        setAuthor("")
        setText("")
        setStars(5)
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <div
      className="rounded-sm p-8 max-w-xl mx-auto"
      style={{
        background: "rgba(18,20,26,0.7)",
        border: "1px solid rgba(200,160,80,0.15)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.3)",
      }}
    >
      <h3
        className="text-2xl font-light text-white mb-6 text-center"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        Оставить <span className="gold-text">отзыв</span>
      </h3>

      {status === "success" ? (
        <div className="text-center py-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(200,160,80,0.12)", border: "1px solid rgba(200,160,80,0.3)" }}
          >
            <Icon name="Check" size={24} style={{ color: "hsl(42,65%,62%)" }} />
          </div>
          <p className="text-white font-light text-lg mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
            Спасибо за отзыв!
          </p>
          <p className="text-[hsl(210,15%,50%)] text-sm font-light">
            Он появится на сайте после проверки
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-6 text-xs text-[hsl(210,15%,40%)] hover:text-[hsl(42,65%,62%)] transition-colors"
          >
            Написать ещё один
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-[hsl(210,15%,40%)] mb-2 font-light">
              Ваше имя
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Как вас зовут?"
              maxLength={80}
              className="w-full bg-transparent text-white text-sm font-light outline-none placeholder:text-[hsl(210,15%,30%)] py-2 px-3 rounded-sm transition-all"
              style={{ border: "1px solid rgba(160,170,185,0.15)", fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(200,160,80,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(160,170,185,0.15)")}
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-[hsl(210,15%,40%)] mb-2 font-light">
              Оценка
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-2xl transition-transform hover:scale-110"
                  style={{ color: s <= (hovered || stars) ? "hsl(38,80%,55%)" : "hsl(210,15%,25%)" }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-[hsl(210,15%,40%)] mb-2 font-light">
              Ваш отзыв
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Поделитесь впечатлениями..."
              rows={4}
              maxLength={1000}
              className="w-full bg-transparent text-white text-sm font-light outline-none placeholder:text-[hsl(210,15%,30%)] py-2 px-3 rounded-sm resize-none transition-all"
              style={{ border: "1px solid rgba(160,170,185,0.15)", fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(200,160,80,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(160,170,185,0.15)")}
            />
          </div>

          {status === "error" && (
            <p className="text-red-400 text-xs text-center">
              Что-то пошло не так. Попробуйте ещё раз.
            </p>
          )}

          <button
            onClick={submit}
            disabled={status === "sending" || !author.trim() || !text.trim()}
            className="w-full py-3 text-sm font-light tracking-[0.2em] uppercase transition-all duration-300 rounded-sm disabled:opacity-40"
            style={{
              background: "rgba(200,160,80,0.12)",
              border: "1px solid rgba(200,160,80,0.3)",
              color: "hsl(42,65%,62%)",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "rgba(200,160,80,0.2)"
                e.currentTarget.style.borderColor = "rgba(200,160,80,0.5)"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(200,160,80,0.12)"
              e.currentTarget.style.borderColor = "rgba(200,160,80,0.3)"
            }}
          >
            {status === "sending" ? "Отправляем..." : "Отправить отзыв"}
          </button>
          <p className="text-center text-xs text-[hsl(210,15%,30%)] font-light">
            Отзыв появится после проверки
          </p>
        </div>
      )}
    </div>
  )
}
