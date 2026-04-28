import { useRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import Icon from "@/components/ui/icon"

const REVIEWS = [
  {
    author: "Анастасия",
    date: "24 февр.",
    text: "Майя, лучшая 🔥 Благодарю за помощь 🙏🙏🙏. Отличный таролог 💋🤍.",
    stars: 5,
  },
  {
    author: "Анастасия",
    date: "20 февр.",
    text: "Маюша – самая талантливая и чуткая в мире! Настоящий профессионал своего дела. К Майи уже несколько лет, и каждый раз убеждаюсь в её даре, данном свыше. Каждый раз и абсолютно каждое слово — в точку, в самое сердце!",
    stars: 5,
  },
  {
    author: "Светлана",
    date: "18 апр.",
    text: "Майя как волшебная палочка, поможет с любой ситуацией и разъяснит все последствия. Благодарю, что пошла мне на встречу 🥰😌",
    stars: 5,
  },
  {
    author: "Анастасия",
    date: "5 апр.",
    text: "Майя, спасибо за помощь. По-другому и не скажешь.. очень ценно.",
    stars: 5,
  },
  {
    author: "Марина",
    date: "24 марта",
    text: "Сегодня было наше знакомство с Майей, хочу сказать, что я сильно удивлена. Настолько всё спокойно расказала, и открыла глаза на явные вещи, на которые я никогда бы внимания не обратила. Всё ясно и понятно объяснила, растолковала все значения карт. Спасибо огромное!!! Очень рекомендую, как специалиста!!!",
    stars: 5,
  },
  {
    author: "Мария",
    date: "17 июня",
    text: "Майя, спасибо Вам за расклад! Описание человека прямо в точку. Вы даёте также и хорошие советы, заставляет задуматься о наболевшем и помогает решить сложные ситуации.",
    stars: 5,
  },
  {
    author: "Ольга",
    date: "26 апр.",
    text: "Была сегодня на сеансе про финансовые блоки и узнала много интересного и про себя и про свой потенциал.",
    stars: 5,
  },
  {
    author: "Елена",
    date: "22 апр.",
    text: "Майя, спасибо Вам огромное, вы увидели всю картину происходящего, как будто прожили её вместе со мной. Ничего лишнего, все по факту, все было изложено доступно 👍😊",
    stars: 5,
  },
  {
    author: "Диана",
    date: "5 марта",
    text: "Хороший эксперт своего дела, рекомендую!",
    stars: 5,
  },
  {
    author: "Екатерина",
    date: "3 марта",
    text: "Спасибо большое за помощь, всё в точку 🙏",
    stars: 5,
  },
  {
    author: "Станислава",
    date: "1 марта",
    text: "Это самый лучший таролог, работаем с ней уже не первый год. Благодаря Майе у меня наладилась работа и личная жизнь. Всегда готова помочь и по полочкам разложить ситуацию так, как она есть на самом деле, раскрывая подводные камни.",
    stars: 5,
  },
]

interface Props {
  reviewsSectionRef: React.RefObject<HTMLElement>
  isReviewsVisible: boolean
}

export function ReviewsCarousel({ reviewsSectionRef, isReviewsVisible }: Props) {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const total = REVIEWS.length

  const go = useCallback((idx: number, dir: "left" | "right") => {
    if (isAnimating) return
    setDirection(dir)
    setIsAnimating(true)
    setTimeout(() => {
      setCurrent((idx + total) % total)
      setIsAnimating(false)
    }, 380)
  }, [isAnimating, total])

  const prev = () => go(current - 1, "left")
  const next = () => go(current + 1, "right")

  useEffect(() => {
    autoRef.current = setTimeout(() => go(current + 1, "right"), 5000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [current, go])

  const review = REVIEWS[current]
  const prevIdx = (current - 1 + total) % total
  const nextIdx = (current + 1) % total

  return (
    <section
      ref={reviewsSectionRef as React.RefObject<HTMLElement>}
      className="py-24 noise-texture relative overflow-hidden"
      style={{ background: "hsl(220,10%,8%)" }}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "max-w-4xl mx-auto transition-all duration-1000 ease-out",
            isReviewsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          <h2
            className="text-3xl md:text-4xl font-light text-white text-center mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            <span className="text-shimmer">Свидетельства</span>
          </h2>
          <p className="text-center text-xs tracking-[0.4em] text-[hsl(210,15%,40%)] uppercase font-light mb-14">
            Реальные отзывы
          </p>

          {/* Карусель */}
          <div className="relative flex items-center gap-4">

            {/* Кнопка назад */}
            <button
              onClick={prev}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ border: "1px solid rgba(160,170,185,0.15)", background: "rgba(18,20,26,0.6)", color: "hsl(210,15%,50%)" }}
              aria-label="Предыдущий"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>

            {/* Превью предыдущего */}
            <div
              className="hidden md:flex flex-col justify-between rounded-sm p-5 flex-shrink-0 cursor-pointer transition-all duration-300 hover:opacity-60"
              style={{ width: "160px", minHeight: "160px", background: "rgba(18,20,26,0.5)", border: "1px solid rgba(160,170,185,0.06)", opacity: 0.35 }}
              onClick={prev}
            >
              <div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: "hsl(38,80%,55%)", fontSize: "10px" }}>★</span>
                  ))}
                </div>
                <p className="text-[hsl(210,15%,55%)] text-xs leading-relaxed font-light line-clamp-4">{REVIEWS[prevIdx].text}</p>
              </div>
              <p className="text-[hsl(210,15%,40%)] text-xs mt-3 font-light">— {REVIEWS[prevIdx].author}</p>
            </div>

            {/* Главная карточка */}
            <div className="flex-1 relative" style={{ minHeight: "220px" }}>
              <div
                key={current}
                className="glass-panel rounded-sm p-8 flex flex-col justify-between w-full"
                style={{
                  borderColor: "rgba(200,160,80,0.15)",
                  boxShadow: "0 4px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(200,160,80,0.08)",
                  animation: isAnimating
                    ? direction === "right"
                      ? "slideOutLeft 0.38s ease forwards"
                      : "slideOutRight 0.38s ease forwards"
                    : "slideIn 0.38s ease forwards",
                }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(200,160,80,0.12)", border: "1px solid rgba(200,160,80,0.2)" }}
                    >
                      <span style={{ fontFamily: "var(--font-cormorant)", color: "hsl(42,65%,62%)", fontSize: "16px" }}>
                        {review.author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-light text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>{review.author}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: review.stars }).map((_, i) => (
                          <span key={i} style={{ color: "hsl(38,80%,55%)", fontSize: "11px" }}>★</span>
                        ))}
                        <span className="text-[hsl(210,15%,35%)] text-xs ml-1 font-light">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <Icon name="Quote" size={16} className="mb-3" style={{ color: "hsl(42,70%,55%)", opacity: 0.5 }} />
                  <p className="text-[hsl(210,15%,65%)] text-sm leading-relaxed font-light italic">{review.text}</p>
                </div>
              </div>
            </div>

            {/* Превью следующего */}
            <div
              className="hidden md:flex flex-col justify-between rounded-sm p-5 flex-shrink-0 cursor-pointer transition-all duration-300 hover:opacity-60"
              style={{ width: "160px", minHeight: "160px", background: "rgba(18,20,26,0.5)", border: "1px solid rgba(160,170,185,0.06)", opacity: 0.35 }}
              onClick={next}
            >
              <div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: "hsl(38,80%,55%)", fontSize: "10px" }}>★</span>
                  ))}
                </div>
                <p className="text-[hsl(210,15%,55%)] text-xs leading-relaxed font-light line-clamp-4">{REVIEWS[nextIdx].text}</p>
              </div>
              <p className="text-[hsl(210,15%,40%)] text-xs mt-3 font-light">— {REVIEWS[nextIdx].author}</p>
            </div>

            {/* Кнопка вперёд */}
            <button
              onClick={next}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ border: "1px solid rgba(160,170,185,0.15)", background: "rgba(18,20,26,0.6)", color: "hsl(210,15%,50%)" }}
              aria-label="Следующий"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>

          {/* Точки-навигация */}
          <div className="flex justify-center gap-2 mt-8">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > current ? "right" : "left")}
                className="transition-all duration-300"
                style={{
                  width: i === current ? "24px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: i === current ? "hsl(42,65%,58%)" : "rgba(160,170,185,0.2)",
                  border: "none",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          {/* Счётчик */}
          <p className="text-center text-[hsl(210,15%,30%)] text-xs font-light mt-4 tracking-widest">
            {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-30px); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(30px); }
        }
      `}</style>
    </section>
  )
}
