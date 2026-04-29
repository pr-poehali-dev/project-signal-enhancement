import { useState, useEffect } from "react"
import Icon from "@/components/ui/icon"

const MODERATE_URL = "https://functions.poehali.dev/f9041334-aa44-475f-9cf6-e5f6f20092ac"

interface Review {
  id: number
  author: string
  text: string
  stars: number
  status: string
  created_at: string
}

export default function Moderation() {
  const [token, setToken] = useState("")
  const [inputToken, setInputToken] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = async (t: string, status: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${MODERATE_URL}?status=${status}`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.status === 401) {
        setError("Неверный пароль")
        setToken("")
        setLoading(false)
        return
      }
      const raw = await res.text()
      let parsed: { reviews?: Review[] }
      try {
        const first = JSON.parse(raw)
        parsed = typeof first === "string" ? JSON.parse(first) : first
      } catch {
        parsed = {}
      }
      setReviews(parsed.reviews || [])
    } catch (e) {
      setError("Ошибка загрузки: " + String(e))
    }
    setLoading(false)
  }

  const login = () => {
    if (!inputToken.trim()) return
    setToken(inputToken.trim())
    load(inputToken.trim(), tab)
  }

  useEffect(() => {
    if (token) load(token, tab)
  }, [tab])

  const act = async (id: number, action: "approve" | "reject") => {
    const res = await fetch(MODERATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const tabStyle = (t: string) => ({
    padding: "8px 20px",
    fontSize: "12px",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    fontWeight: 300,
    borderRadius: "2px",
    cursor: "pointer",
    transition: "all 0.2s",
    background: tab === t ? "rgba(200,160,80,0.15)" : "transparent",
    border: tab === t ? "1px solid rgba(200,160,80,0.35)" : "1px solid rgba(160,170,185,0.1)",
    color: tab === t ? "hsl(42,65%,62%)" : "hsl(210,15%,45%)",
  })

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "hsl(220,12%,6%)" }}
      >
        <div
          className="rounded-sm p-10 w-full max-w-sm"
          style={{
            background: "rgba(18,20,26,0.9)",
            border: "1px solid rgba(200,160,80,0.15)",
            boxShadow: "0 8px 60px rgba(0,0,0,0.5)",
          }}
        >
          <h1
            className="text-3xl font-light text-white text-center mb-8"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Модерация <span className="gold-text">отзывов</span>
          </h1>
          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}
          <input
            type="password"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Введите пароль"
            className="w-full bg-transparent text-white text-sm font-light outline-none placeholder:text-[hsl(210,15%,30%)] py-2 px-3 rounded-sm mb-4"
            style={{ border: "1px solid rgba(160,170,185,0.15)" }}
          />
          <button
            onClick={login}
            className="w-full py-3 text-sm font-light tracking-[0.2em] uppercase rounded-sm transition-all"
            style={{
              background: "rgba(200,160,80,0.12)",
              border: "1px solid rgba(200,160,80,0.3)",
              color: "hsl(42,65%,62%)",
            }}
          >
            Войти
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "hsl(220,12%,6%)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1
            className="text-3xl font-light text-white"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Модерация <span className="gold-text">отзывов</span>
          </h1>
          <button
            onClick={() => { setToken(""); setReviews([]) }}
            className="text-xs text-[hsl(210,15%,40%)] hover:text-white transition-colors tracking-widest uppercase"
          >
            Выйти
          </button>
        </div>

        <div className="flex gap-3 mb-8">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
              {t === "pending" ? "На проверке" : t === "approved" ? "Одобрены" : "Отклонены"}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-center text-[hsl(210,15%,40%)] text-sm py-12">Загрузка...</p>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-center text-[hsl(210,15%,35%)] text-sm py-12 font-light">
            Отзывов нет
          </p>
        )}

        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-sm p-6"
              style={{
                background: "rgba(18,20,26,0.7)",
                border: "1px solid rgba(160,170,185,0.1)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(200,160,80,0.1)", border: "1px solid rgba(200,160,80,0.2)" }}
                    >
                      <span style={{ color: "hsl(42,65%,62%)", fontFamily: "var(--font-cormorant)", fontSize: "14px" }}>
                        {r.author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-light">{r.author}</p>
                      <div className="flex items-center gap-2">
                        <span style={{ color: "hsl(38,80%,55%)", fontSize: "11px" }}>
                          {"★".repeat(r.stars)}
                        </span>
                        <span className="text-[hsl(210,15%,35%)] text-xs">{r.created_at?.slice(0, 10)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[hsl(210,15%,60%)] text-sm font-light leading-relaxed">{r.text}</p>
                </div>

                {tab === "pending" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => act(r.id, "approve")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs tracking-wider transition-all"
                      style={{
                        background: "rgba(80,180,100,0.1)",
                        border: "1px solid rgba(80,180,100,0.3)",
                        color: "hsl(135,40%,55%)",
                      }}
                    >
                      <Icon name="Check" size={13} />
                      Одобрить
                    </button>
                    <button
                      onClick={() => act(r.id, "reject")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs tracking-wider transition-all"
                      style={{
                        background: "rgba(200,60,60,0.08)",
                        border: "1px solid rgba(200,60,60,0.25)",
                        color: "hsl(0,50%,55%)",
                      }}
                    >
                      <Icon name="X" size={13} />
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}