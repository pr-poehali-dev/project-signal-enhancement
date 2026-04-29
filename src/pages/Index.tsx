import { StarField } from "@/components/StarField"
import { ChevronDown } from "lucide-react"
import { ContactForm } from "@/components/ContactForm"
import { OccultOverlay } from "@/components/OccultOverlay"
import { useState, useEffect, useRef, useMemo } from "react"
import { cn } from "@/lib/utils"
import Icon from "@/components/ui/icon"
import SparkleButton from "@/components/SparkleButton"
import { ReviewsCarousel } from "@/components/ReviewsCarousel"

const ARCANA = [
  {
    number: "I",
    name: "Маг",
    subtitle: "Аркан воли",
    symbol: "☿",
    quote: ["«Маг не ждёт — он ", "берёт то, что его.»"],
    text: "Первый аркан — абсолютный контроль над реальностью через знание. Я вижу инструменты на столе: руны, огонь, слово. Я знаю, какой из них сломает чужую программу.",
  },
  {
    number: "II",
    name: "Верховная Жрица",
    subtitle: "Аркан тайны",
    symbol: "☽",
    quote: ["«То, что скрыто от глаз, ", "открывается взгляду изнутри.»"],
    text: "Жрица хранит то, что нельзя увидеть напрямую. Именно здесь — моя область: считывание скрытых пластов, невидимых связей и того, о чём молчат даже близкие.",
  },
  {
    number: "VII",
    name: "Колесница",
    subtitle: "Аркан пути",
    symbol: "⊕",
    quote: ["«Колесница не останавливается перед препятствием — ", "она проходит сквозь него.»"],
    text: "Седьмой аркан — символ воли, контроля и движения вперёд вопреки хаосу. Именно с этой энергией я веду каждое расследование: ни один туман лжи не останавливает поиск истины.",
  },
  {
    number: "VIII",
    name: "Справедливость",
    subtitle: "Аркан истины",
    symbol: "⚖",
    quote: ["«Весы не лгут — ", "они лишь обнажают то, что есть.»"],
    text: "Восьмой аркан — меч, который режет иллюзии. Я не выношу приговоров. Я показываю реальное соотношение сил в ваших отношениях — и вы сами решаете, что делать с этим знанием.",
  },
  {
    number: "XII",
    name: "Повешенный",
    subtitle: "Аркан паузы",
    symbol: "∇",
    quote: ["«Тот, кто видит мир перевёрнутым, ", "видит его настоящим.»"],
    text: "Двенадцатый аркан — взгляд с изнанки. Когда всё кажется остановившимся и безвыходным — именно тогда открываются скрытые ходы. Я нахожу их.",
  },
  {
    number: "XIII",
    name: "Смерть",
    subtitle: "Аркан трансформации",
    symbol: "⌖",
    quote: ["«Смерть не забирает — ", "она освобождает от лишнего.»"],
    text: "Тринадцатый аркан пугает лишь тех, кто не понимает его сути. Смерть — это конец того, что держало вас в ловушке. Я помогаю этому завершению произойти чисто и необратимо.",
  },
  {
    number: "XV",
    name: "Дьявол",
    subtitle: "Аркан цепей",
    symbol: "♄",
    quote: ["«Цепи держат лишь тех, ", "кто не видит замка.»"],
    text: "Пятнадцатый аркан — зеркало привязанностей и зависимостей. Энергетические паразиты, токсичные узы, чужие программы в голове — я нахожу их источник и показываю замок.",
  },
  {
    number: "XVIII",
    name: "Луна",
    subtitle: "Аркан иллюзий",
    symbol: "☾",
    quote: ["«Луна не освещает путь — ", "она показывает, что путей много.»"],
    text: "Восемнадцатый аркан — царство обманов и скрытых страхов. Там, где вы видите тупик, я вижу несколько выходов. Там, где вы видите любовь — иногда вижу сценарий.",
  },
]

function RandomArcanSection() {
  const [visible, setVisible] = useState(false)
  const [symbolVisible, setSymbolVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const arcana = useMemo(() => ARCANA[Math.floor(Math.random() * ARCANA.length)], [])

  // Блёстки на символ
  const symbolCanvasRef = useRef<HTMLCanvasElement>(null)
  const symbolSparklesRef = useRef<{id:number;x:number;y:number;vx:number;vy:number;size:number;opacity:number;color:string;life:number;maxLife:number}[]>([])
  const symbolRafRef = useRef<number | null>(null)
  const symbolActiveRef = useRef(false)
  const symbolIdRef = useRef(0)
  const SYMBOL_COLORS = ["rgba(180,210,255,0.95)","rgba(140,185,255,0.9)","rgba(200,225,255,0.85)","rgba(220,180,100,0.9)","rgba(255,220,140,0.85)","rgba(255,255,255,0.9)"]

  const spawnSymbolSparkles = (x: number, y: number) => {
    const count = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.7 + Math.random() * 1.6
      const maxLife = 40 + Math.random() * 30
      symbolSparklesRef.current.push({ id: symbolIdRef.current++, x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 0.4, size: 1.5 + Math.random()*2.5, opacity: 1, color: SYMBOL_COLORS[Math.floor(Math.random()*SYMBOL_COLORS.length)], life: 0, maxLife })
    }
  }

  const symbolLoop = () => {
    const canvas = symbolCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    symbolSparklesRef.current = symbolSparklesRef.current.filter(s => s.life < s.maxLife)
    for (const s of symbolSparklesRef.current) {
      s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.life++; s.opacity = 1 - s.life / s.maxLife
      ctx.save(); ctx.globalAlpha = s.opacity; ctx.fillStyle = s.color; ctx.shadowColor = s.color; ctx.shadowBlur = 6
      ctx.beginPath()
      const r = s.size
      for (let i = 0; i < 4; i++) {
        const a = (i/4)*Math.PI*2
        const ox = s.x + Math.cos(a)*r, oy = s.y + Math.sin(a)*r
        const ix = s.x + Math.cos(a+Math.PI/4)*(r*0.35), iy = s.y + Math.sin(a+Math.PI/4)*(r*0.35)
        if (i===0) ctx.moveTo(ox,oy); else ctx.lineTo(ox,oy); ctx.lineTo(ix,iy)
      }
      ctx.closePath(); ctx.fill(); ctx.restore()
    }
    if (symbolSparklesRef.current.length > 0 || symbolActiveRef.current) {
      symbolRafRef.current = requestAnimationFrame(symbolLoop)
    } else { symbolRafRef.current = null }
  }

  const handleSymbolMouseMove = (e: React.MouseEvent) => {
    const canvas = symbolCanvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (Math.random() < 0.5) spawnSymbolSparkles(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleSymbolEnter = (e: React.MouseEvent) => {
    symbolActiveRef.current = true
    const canvas = symbolCanvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    spawnSymbolSparkles(e.clientX - rect.left, e.clientY - rect.top)
    if (!symbolRafRef.current) symbolRafRef.current = requestAnimationFrame(symbolLoop)
  }

  const handleSymbolLeave = () => { symbolActiveRef.current = false }

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Сначала появляется секция
          setTimeout(() => setVisible(true), 80)
          // Потом с задержкой — символ с эффектом проявления
          setTimeout(() => setSymbolVisible(true), 400)
          obs.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-16 noise-texture relative overflow-hidden"
      style={{ background: "hsl(220,10%,7%)" }}
    >
      <OccultOverlay density={8} />
      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div
          className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}
        >
          {/* Карточка аркана */}
          <div
            className="flex-shrink-0 glass-panel rounded-sm flex flex-col items-center justify-center gap-3 px-8 py-10 relative overflow-hidden accent-glow animate-glow-border"
            style={{ minWidth: "140px" }}
          >
            {/* Вспышка при появлении символа */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, rgba(160,200,255,0.12) 0%, transparent 70%)",
                opacity: symbolVisible ? 0 : 1,
                transition: "opacity 1.2s ease",
                pointerEvents: "none",
              }}
            />
            <div
              className="relative"
              style={{ cursor: "default" }}
              onMouseMove={handleSymbolMouseMove}
              onMouseEnter={handleSymbolEnter}
              onMouseLeave={handleSymbolLeave}
            >
              <canvas
                ref={symbolCanvasRef}
                width={120}
                height={120}
                className="pointer-events-none absolute"
                style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10 }}
              />
              <span
                className={`text-5xl leading-none select-none ${symbolVisible ? "animate-float" : ""}`}
                style={{
                  fontFamily: "serif",
                  color: "hsl(42,65%,65%)",
                  textShadow: symbolVisible
                    ? "0 0 28px rgba(200,160,80,0.4), 0 0 8px rgba(200,160,80,0.2)"
                    : "0 0 60px rgba(200,160,80,0.9), 0 0 20px rgba(220,180,100,0.6)",
                  filter: symbolVisible
                    ? "drop-shadow(0 0 10px rgba(200,160,80,0.3))"
                    : "drop-shadow(0 0 24px rgba(200,160,80,0.8)) brightness(1.8)",
                  opacity: symbolVisible ? 1 : 0,
                  transform: symbolVisible ? "scale(1)" : "scale(0.6)",
                  transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1), text-shadow 1s ease, filter 1s ease",
                  display: "block",
                }}
              >
                {arcana.symbol}
              </span>
            </div>
            <div
              className="text-center"
              style={{
                opacity: symbolVisible ? 1 : 0,
                transition: "opacity 0.6s ease 0.3s",
              }}
            >
              <p className="text-white font-light text-base mb-0.5" style={{ fontFamily: "var(--font-cormorant)" }}>
                {arcana.name}
              </p>
              <p className="text-xs tracking-[0.3em] text-[hsl(210,15%,35%)] uppercase font-light">
                {arcana.number}
              </p>
            </div>
          </div>

          {/* Текст */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(16px)",
              transition: "opacity 1s ease 0.25s, transform 1s ease 0.25s",
            }}
          >
            <p className="text-xs tracking-[0.4em] text-[hsl(210,15%,40%)] uppercase font-light mb-4">
              {arcana.subtitle}
            </p>
            <blockquote
              className="text-xl md:text-2xl font-light text-white leading-relaxed mb-5"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {arcana.quote[0]}
              <span className="text-[hsl(210,15%,60%)]">{arcana.quote[1]}</span>
            </blockquote>
            <p className="text-[hsl(210,15%,50%)] font-light text-sm leading-relaxed">
              {arcana.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

const NAV_LINKS = [
  { section: "about" as const, label: "Обо мне" },
  { section: "services" as const, label: "Инструменты" },
  { section: "arcana" as const, label: "Знак для тебя" },
  { section: "reviews" as const, label: "Отзывы" },
  { section: "contact" as const, label: "Запись" },
]

type NavSection = "about" | "services" | "arcana" | "reviews" | "contact"

function HeroNav({
  onScrollTo,
  onHome,
  activeSection,
}: {
  onScrollTo: (s: NavSection) => void
  onHome: () => void
  activeSection: NavSection | null
}) {
  const [open, setOpen] = useState(false)

  const handle = (s: NavSection) => {
    setOpen(false)
    onScrollTo(s)
  }

  const handleHome = () => {
    setOpen(false)
    onHome()
  }

  const btnStyle = (s: NavSection | "home") => {
    const isActive = s === "home" ? activeSection === null : activeSection === s
    return {
      color: isActive ? "hsl(42,80%,68%)" : "hsl(210,20%,68%)",
      textShadow: isActive ? "0 0 14px rgba(220,185,120,0.8)" : "none",
    }
  }

  const NavBtn = ({ s, label }: { s: NavSection; label: string }) => (
    <button
      onClick={() => handle(s)}
      className="text-xs font-light tracking-[0.22em] uppercase relative group transition-all duration-200"
      style={btnStyle(s)}
      onMouseEnter={(e) => {
        if (activeSection !== s) {
          e.currentTarget.style.color = "hsl(42,75%,72%)"
          e.currentTarget.style.textShadow = "0 0 12px rgba(220,185,120,0.7)"
        }
      }}
      onMouseLeave={(e) => {
        const st = btnStyle(s)
        e.currentTarget.style.color = st.color
        e.currentTarget.style.textShadow = st.textShadow
      }}
    >
      {label}
      {activeSection === s && (
        <span className="absolute -bottom-1 left-0 w-full h-px" style={{ background: "hsl(42,65%,58%)", boxShadow: "0 0 6px rgba(220,185,120,0.6)" }} />
      )}
      {activeSection !== s && (
        <span className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: "hsl(42,65%,58%)", boxShadow: "0 0 6px rgba(220,185,120,0.6)" }} />
      )}
    </button>
  )

  const runeLeft = <span className="select-none flex-shrink-0 mr-6" style={{ color: "hsl(42,50%,38%)", fontSize: "16px", opacity: 0.6, letterSpacing: "5px", textShadow: "0 0 10px rgba(200,160,80,0.35)" }}>ᚠ᛫ᚢ᛫ᚦ᛫ᚨ</span>
  const runeRight = <span className="select-none flex-shrink-0 ml-6" style={{ color: "hsl(42,50%,38%)", fontSize: "16px", opacity: 0.6, letterSpacing: "5px", textShadow: "0 0 10px rgba(200,160,80,0.35)" }}>ᚱ᛫ᚲ᛫ᚷ᛫ᚹ</span>

  return (
    <>
      {/* Десктоп */}
      <div
        className="absolute top-0 left-0 right-0 z-20 hidden md:flex items-center justify-center px-6 py-4"
        style={{ borderBottom: "1px solid rgba(200,160,80,0.1)" }}
      >
        {runeLeft}
        <div className="flex items-center gap-6">
          {/* Главная */}
          <button
            onClick={handleHome}
            className="text-xs font-light tracking-[0.22em] uppercase relative group transition-all duration-200"
            style={btnStyle("home")}
            onMouseEnter={(e) => {
              if (activeSection !== null) {
                e.currentTarget.style.color = "hsl(42,75%,72%)"
                e.currentTarget.style.textShadow = "0 0 12px rgba(220,185,120,0.7)"
              }
            }}
            onMouseLeave={(e) => {
              const st = btnStyle("home")
              e.currentTarget.style.color = st.color
              e.currentTarget.style.textShadow = st.textShadow
            }}
          >
            Главная
            {activeSection === null && (
              <span className="absolute -bottom-1 left-0 w-full h-px" style={{ background: "hsl(42,65%,58%)", boxShadow: "0 0 6px rgba(220,185,120,0.6)" }} />
            )}
            {activeSection !== null && (
              <span className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: "hsl(42,65%,58%)", boxShadow: "0 0 6px rgba(220,185,120,0.6)" }} />
            )}
          </button>

          <span style={{ color: "rgba(200,160,80,0.2)", fontSize: "10px" }}>✦</span>

          {NAV_LINKS.map(({ section, label }, i) => (
            <span key={section} className="flex items-center gap-6">
              <NavBtn s={section} label={label} />
              {i < NAV_LINKS.length - 1 && <span style={{ color: "rgba(200,160,80,0.2)", fontSize: "10px" }}>✦</span>}
            </span>
          ))}

          <span style={{ color: "rgba(200,160,80,0.2)", fontSize: "10px" }}>✦</span>

          {/* Записаться */}
          <a
            href="https://dikidi.net/926132"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-light tracking-[0.22em] uppercase px-4 py-1.5 rounded-sm transition-all duration-200"
            style={{
              color: "hsl(42,75%,68%)",
              border: "1px solid rgba(200,160,80,0.35)",
              background: "rgba(200,160,80,0.08)",
              textShadow: "0 0 10px rgba(220,185,120,0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(200,160,80,0.18)"
              e.currentTarget.style.borderColor = "rgba(200,160,80,0.6)"
              e.currentTarget.style.textShadow = "0 0 14px rgba(220,185,120,0.8)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(200,160,80,0.08)"
              e.currentTarget.style.borderColor = "rgba(200,160,80,0.35)"
              e.currentTarget.style.textShadow = "0 0 10px rgba(220,185,120,0.4)"
            }}
          >
            Записаться
          </a>
        </div>
        {runeRight}
      </div>

      {/* Мобильный бургер */}
      <div
        className="absolute top-0 left-0 right-0 z-20 md:hidden flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(200,160,80,0.1)" }}
      >
        <span className="select-none text-sm" style={{ color: "hsl(42,50%,38%)", opacity: 0.6, letterSpacing: "3px", textShadow: "0 0 8px rgba(200,160,80,0.3)" }}>
          ᚠ᛫ᚢ
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center w-9 h-9 rounded-sm transition-all"
          style={{ color: "hsl(42,65%,60%)", border: "1px solid rgba(200,160,80,0.2)", background: "rgba(8,10,14,0.5)" }}
          aria-label="Меню"
        >
          <Icon name={open ? "X" : "Menu"} size={18} />
        </button>
      </div>

      {/* Мобильное выпадающее меню */}
      {open && (
        <div
          className="absolute top-[48px] left-0 right-0 z-30 md:hidden flex flex-col py-2"
          style={{ background: "rgba(6,8,12,0.97)", borderBottom: "1px solid rgba(200,160,80,0.15)", backdropFilter: "blur(20px)" }}
        >
          <button
            onClick={handleHome}
            className="text-left px-6 py-3 text-sm font-light tracking-[0.2em] uppercase transition-colors"
            style={{
              color: activeSection === null ? "hsl(42,80%,68%)" : "hsl(210,20%,65%)",
              borderBottom: "1px solid rgba(160,170,185,0.05)",
              textShadow: activeSection === null ? "0 0 12px rgba(220,185,120,0.6)" : "none",
            }}
          >
            Главная
          </button>
          {NAV_LINKS.map(({ section, label }) => (
            <button
              key={section}
              onClick={() => handle(section)}
              className="text-left px-6 py-3 text-sm font-light tracking-[0.2em] uppercase transition-colors"
              style={{
                color: activeSection === section ? "hsl(42,80%,68%)" : "hsl(210,20%,65%)",
                borderBottom: "1px solid rgba(160,170,185,0.05)",
                textShadow: activeSection === section ? "0 0 12px rgba(220,185,120,0.6)" : "none",
              }}
            >
              {label}
            </button>
          ))}
          <a
            href="https://dikidi.net/926132"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mx-6 my-3 py-3 text-center text-sm font-light tracking-[0.2em] uppercase rounded-sm"
            style={{
              color: "hsl(42,75%,68%)",
              border: "1px solid rgba(200,160,80,0.35)",
              background: "rgba(200,160,80,0.1)",
            }}
          >
            Записаться
          </a>
        </div>
      )}
    </>
  )
}

export default function Index() {
  const [isHeadingVisible, setIsHeadingVisible] = useState(false)
  const [isAboutVisible, setIsAboutVisible] = useState(false)
  const [isPainVisible, setIsPainVisible] = useState(false)
  const [isServicesVisible, setIsServicesVisible] = useState(false)
  const [isServicesTitleVisible, setIsServicesTitleVisible] = useState(false)
  const [isProcessVisible, setIsProcessVisible] = useState(false)
  const [isReviewsVisible, setIsReviewsVisible] = useState(false)
  const [blurAmount, setBlurAmount] = useState(0)
  const [initialHeight, setInitialHeight] = useState(0)
  const [activeSection, setActiveSection] = useState<"about" | "services" | "arcana" | "reviews" | "contact" | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const aboutSectionRef = useRef<HTMLElement>(null)
  const aboutContentRef = useRef<HTMLDivElement>(null)
  const painContentRef = useRef<HTMLDivElement>(null)
  const servicesSectionRef = useRef<HTMLElement>(null)
  const servicesContentRef = useRef<HTMLDivElement>(null)
  const servicesTitleRef = useRef<HTMLHeadingElement>(null)
  const processSectionRef = useRef<HTMLDivElement>(null)
  const reviewsSectionRef = useRef<HTMLDivElement>(null)
  const contactSectionRef = useRef<HTMLElement>(null)
  const arcanaSectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    if (initialHeight === 0) {
      setInitialHeight(window.innerHeight)
    }
  }, [initialHeight])

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const maxBlur = 8
          const triggerHeight = initialHeight * 1.2
          const newBlurAmount = Math.min(maxBlur, (scrollRef.current / triggerHeight) * maxBlur)
          setBlurAmount(newBlurAmount)
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [initialHeight])

  useEffect(() => {
    const makeObserver = (setter: (v: boolean) => void, ref: React.RefObject<Element | null>) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true)
            if (ref.current) obs.unobserve(ref.current)
          }
        },
        { threshold: 0.1 },
      )
      if (ref.current) obs.observe(ref.current)
      return obs
    }

    const observers = [
      makeObserver(setIsHeadingVisible, headingRef),
      makeObserver(setIsAboutVisible, aboutContentRef),
      makeObserver(setIsPainVisible, painContentRef),
      makeObserver(setIsServicesVisible, servicesContentRef),
      makeObserver(setIsServicesTitleVisible, servicesTitleRef),
      makeObserver(setIsProcessVisible, processSectionRef),
      makeObserver(setIsReviewsVisible, reviewsSectionRef),
    ]

    return () => {
      observers.forEach((obs) => obs.disconnect())
    }
  }, [])

  const scaleFactor = 1 + blurAmount / 16
  const warpSpeedStyle = {
    transform: `scale(${scaleFactor})`,
    transition: "transform 0.2s ease-out",
  }

  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const scrollToContact = () => {
    contactSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleNavScrollTo = (section: "about" | "reviews" | "services" | "arcana" | "contact") => {
    setActiveSection(section)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavHome = () => {
    setActiveSection(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const heroStyle = {
    height: initialHeight ? `${initialHeight}px` : "100vh",
  }

  return (
    <div className="min-h-screen bg-[hsl(220,10%,6%)] scratch-overlay">
      {/* БЛОК 1 — HERO */}
      <section className="relative w-full overflow-hidden noise-texture" style={heroStyle}>

        <div className="absolute inset-0" style={warpSpeedStyle}>
          <StarField blurAmount={blurAmount} />
        </div>

        {/* Фото Майи с огнём — правый край */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage: "url(https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/b2ac8fe6-4e44-4679-9561-ad43458669da.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "right center",
            opacity: 0.18,
            filter: "grayscale(40%) contrast(1.1)",
          }}
        />

        {/* Fog overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 30% 50%, rgba(8,10,14,0.1) 0%, rgba(8,10,14,0.85) 70%, rgba(8,10,14,0.98) 100%)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* Навигация внутри hero — не фиксированная */}
        <HeroNav onScrollTo={handleNavScrollTo} onHome={handleNavHome} activeSection={activeSection} />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div
              className="glass-panel px-8 py-10 rounded-sm inline-block w-full"
              style={{ borderColor: "rgba(160,170,185,0.1)" }}
            >
              <p className="text-xs tracking-[0.4em] text-[hsl(210,15%,50%)] uppercase mb-6 font-light animate-flicker">
                Оккультный следователь · 11 лет практики
              </p>
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight mb-6"
                style={{ fontFamily: "var(--font-cormorant)", letterSpacing: "0.04em" }}
              >
                Тайное
                <br />
                <span className="text-shimmer">становится явным.</span>
              </h1>
              <p className="text-sm md:text-base text-[hsl(210,15%,60%)] font-light max-w-xl mx-auto leading-relaxed mb-8 tracking-wide">
                Жёсткая оккультная диагностика отношений. Я не вытираю слёзы — я срываю маски,
                разоблачаю ложь и показываю истинные мотивы партнёра.
              </p>
              <SparkleButton href="https://dikidi.net/926132" target="_blank" rel="noopener noreferrer" className="btn-gold">
                Записаться на диагностику
              </SparkleButton>
            </div>
          </div>

          <div
            className="absolute bottom-10 animate-bounce cursor-pointer opacity-40 hover:opacity-70 transition-opacity"
            onClick={scrollToAbout}
            role="button"
            aria-label="Листать вниз"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") scrollToAbout() }}
          >
            <ChevronDown className="h-6 w-6 text-[hsl(210,15%,65%)]" />
          </div>
        </div>
        <OccultOverlay density={22} />
      </section>

      {/* БЛОК 2 — БОЛЬ (только на главной) */}
      {activeSection === null && (
      <section className="py-24 noise-texture relative overflow-hidden" style={{ background: "hsl(220,10%,7%)" }}>
        <OccultOverlay density={12} />
        <div className="container mx-auto px-4">
          <div
            ref={painContentRef}
            className={cn(
              "max-w-2xl mx-auto text-center transition-all duration-1000 ease-out",
              isPainVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
          >
            <div className="glass-panel rounded-sm p-10 md:p-14" style={{ borderColor: "rgba(160,170,185,0.08)" }}>
              <p className="text-xs tracking-[0.4em] text-[hsl(210,15%,45%)] uppercase mb-6 font-light">
                Вы не сошли с ума
              </p>
              <h2
                className="text-4xl md:text-5xl font-light text-white mb-8 leading-tight"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Ваша интуиция <span className="gold-text">не врёт.</span>
              </h2>
              <p className="text-[hsl(210,15%,60%)] leading-relaxed font-light text-sm md:text-base">
                Когда отношения рушатся без видимых причин. Когда вместо любви — ледяной холод, агрессия или паранойя,
                а доказательств нет. Когда вы чувствуете: что-то не так, но никто вам не верит.
              </p>
              <div className="gold-line-animated" style={{ width: "60px", margin: "2rem auto" }} />
              <p className="text-[hsl(210,15%,55%)] leading-relaxed font-light text-sm md:text-base">
                Я знаю, почему вы здесь. Вы устали от лжи и сладких сказок психологов.
                <br className="hidden md:block" />
                Вам нужен тонкий хирург — не утешитель.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* БЛОК 3 — ОБО МНЕ */}
      {(activeSection === null || activeSection === "about") && (
      <section ref={aboutSectionRef} id="about" className="py-24 noise-texture" style={{ background: "hsl(220,10%,6%)" }}>
        <div className="container mx-auto px-4">
          <div
            ref={aboutContentRef}
            className={cn(
              "max-w-4xl mx-auto transition-all duration-1000 ease-out",
              isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
          >
            <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-12">

              {/* Фото Майи — слева */}
              <div className="flex-shrink-0 w-full md:w-72 rounded-sm overflow-hidden self-stretch" style={{ minHeight: "460px", border: "1px solid rgba(160,170,185,0.12)" }}>
                <img
                  src="https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/935e2cbe-511f-44e5-ae79-46e0d2853120.jpg"
                  alt="Майя"
                  className="w-full h-full object-cover object-top"
                  style={{ minHeight: "460px" }}
                />
              </div>

              {/* Текст */}
              <div className="space-y-5 text-center md:text-left md:pt-2 flex-1">
                <p className="text-xs tracking-[0.4em] text-[hsl(210,15%,45%)] uppercase font-light">
                  Следователь по оккультным делам
                </p>
                <h2
                  className="text-4xl md:text-5xl font-light text-white leading-tight"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Я — <span className="gold-text">Майя.</span>
                  <br />
                  <span className="moon-text" style={{ opacity: 0.75 }}>Одиннадцать лет практики.</span>
                </h2>
                <div className="space-y-4">
                  <p className="text-[hsl(210,15%,58%)] font-light text-sm leading-relaxed">
                    Я работаю на стыке глубинной магии, ясновидения и психоанализа. Там, где другие видят «просто кризис»,
                    я вижу механику тонкого плана.
                  </p>
                  <p className="text-[hsl(210,15%,58%)] font-light text-sm leading-relaxed">
                    Я сканирую пространство и вытаскиваю на свет то, что от вас скрывают: двойное дно, тайные связи,
                    чужое вмешательство в вашу жизнь. Для меня не существует тайн.
                  </p>
                  <p className="text-[hsl(210,15%,58%)] font-light text-sm leading-relaxed">
                    Я не раздаю пустых утешений, а использую проявленную мне информацию как скальпель — чтобы хирургически точно устранить корень проблемы.
                  </p>
                  <p className="text-[hsl(210,15%,65%)] font-light text-sm leading-relaxed" style={{ borderLeft: "2px solid hsl(42,65%,55%)", paddingLeft: "12px" }}>
                    Со мной вы возвращаете себе абсолютный контроль над своей судьбой, отношениями и бизнесом.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-2 justify-center md:justify-start">
                  <SparkleButton href="https://dikidi.net/926132" target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ padding: "10px 22px" }}>
                    <Icon name="CalendarCheck" size={13} />
                    Записаться
                  </SparkleButton>
                  <SparkleButton href="https://max.ru/u/f9LHodD0cOJ6ZZlQj0UscdLQ-24d096fz401XbP1kL4IvDZwlSnhba3Xum4" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <Icon name="ExternalLink" size={13} />
                    MAX
                  </SparkleButton>
                  <SparkleButton href="https://t.me/tarolog666" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <Icon name="Send" size={13} />
                    TG
                  </SparkleButton>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
      )}

      {/* БЛОК 4 — УСЛУГИ */}
      {(activeSection === null || activeSection === "services") && (
      <section ref={servicesSectionRef} id="services" className="py-24 noise-texture relative overflow-hidden" style={{ background: "hsl(220,10%,8%)" }}>
        <OccultOverlay density={16} />
        <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
          <h2
            ref={servicesTitleRef}
            className={cn(
              "mb-4 text-center font-light text-white transition-all duration-1000 ease-out",
              isServicesTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2.4rem, 6vw, 3.8rem)" }}
          >
            Инструменты <span className="gold-text">и услуги</span>
          </h2>
          <p
            className={cn(
              "text-center text-xs tracking-[0.4em] text-[hsl(210,15%,40%)] uppercase font-light mb-16 transition-all duration-1000 ease-out",
              isServicesTitleVisible ? "opacity-100" : "opacity-0",
            )}
          >
            Арсенал тонкого плана
          </p>
          <div
            ref={servicesContentRef}
            className={cn(
              "max-w-5xl mx-auto transition-all duration-1000 ease-out",
              isServicesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
          >
            {/* Верхний ряд — 2 широкие карточки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {[
                {
                  label: "Диагностика",
                  title: "Глубинные оккультные расклады",
                  text: "Детальный рентген вашей реальности. Бескомпромиссные предсказания, выявление лжи, измен и скрытых мотивов партнёра.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/0845f2fa-213b-43c5-b9ff-c1d077c2b72d.png",
                  imgStyle: { objectPosition: "center 30%" },
                },
                {
                  label: "Очищение",
                  title: "Программные свечи",
                  text: "Индивидуальное создание восковых программ для выжигания негатива, разрушения чужих привязанностей и очищения пространства.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/e5579b48-368d-42fd-bc46-77e78062a796.jpg",
                  imgStyle: { objectPosition: "center 60%" },
                },
              ].map((s) => (
                <div key={s.title} className="glass-panel rounded-sm overflow-hidden group transition-all duration-300 hover:border-[rgba(200,160,80,0.25)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(200,160,80,0.1)]" style={{ borderColor: "rgba(160,170,185,0.08)" }}>
                  <div className="relative h-56 overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={s.imgStyle} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,10,14,0.05) 0%, rgba(8,10,14,0.72) 100%)" }} />
                    <p className="absolute bottom-4 left-5 text-xs tracking-[0.35em] text-[hsl(210,15%,55%)] uppercase font-light">{s.label}</p>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-light text-white mb-3 leading-tight" style={{ fontFamily: "var(--font-cormorant)" }}>{s.title}</h3>
                    <p className="text-[hsl(210,15%,52%)] text-sm leading-relaxed font-light">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Нижний ряд — 3 равные карточки */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  label: "Защита",
                  title: "Рунические ставы",
                  text: "Жёсткая северная магия для взлома ситуаций, постановки глухой защиты и изменения вероятностей под вашу задачу.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/b4616f2b-746d-466a-8225-00f8e52dcfe2.png",
                  imgStyle: { objectPosition: "center 40%" },
                },
                {
                  label: "Эксклюзив",
                  title: "Артефакты с подселением",
                  text: "Создание проводников и защитников с подселением сущностей. Работа по индивидуальным заказам.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/54c7f87e-9f90-4050-a24c-5437d4e58a59.jpg",
                  imgStyle: { objectPosition: "center 60%" },
                },
                {
                  label: "Свечные программы",
                  title: "Ритуал на природе",
                  text: "Живые обряды вне стен — у воды, огня, под открытым небом. Усиление в несколько раз против кабинетной работы.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/a685067d-1621-4b41-9a59-832bedf1ea0a.jpg",
                  imgStyle: { objectPosition: "center 35%" },
                },
              ].map((s) => (
                <div key={s.title} className="glass-panel rounded-sm overflow-hidden group transition-all duration-300 hover:border-[rgba(200,160,80,0.25)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(200,160,80,0.1)]" style={{ borderColor: "rgba(160,170,185,0.08)" }}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={s.imgStyle} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,10,14,0.05) 0%, rgba(8,10,14,0.72) 100%)" }} />
                    <p className="absolute bottom-4 left-5 text-xs tracking-[0.35em] text-[hsl(210,15%,55%)] uppercase font-light">{s.label}</p>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-light text-white mb-3 leading-tight" style={{ fontFamily: "var(--font-cormorant)" }}>{s.title}</h3>
                    <p className="text-[hsl(210,15%,52%)] text-sm leading-relaxed font-light">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* АРКАН — случайный при каждом заходе */}
      {(activeSection === null || activeSection === "arcana") && (
      <section ref={arcanaSectionRef}>
        <RandomArcanSection />
      </section>
      )}

      {/* БЛОК 5 — КАК РАБОТАЮ (только на главной) */}
      {activeSection === null && (
      <section className="py-24 noise-texture relative overflow-hidden" style={{ background: "hsl(220,10%,6%)" }}>
        {/* Кукла-стражница — по центру, крупно, эффектно */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          zIndex: 1,
          pointerEvents: "none",
        }}>
          <img
            src="https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/80678793-f404-4ad1-8285-764c2ce780c0.png"
            alt=""
            style={{
              height: "80%",
              transform: "translateX(20%)",
              width: "auto",
              maxWidth: "none",
              objectFit: "contain",
              filter: "contrast(1.18) brightness(1.15) saturate(1.2) drop-shadow(0 0 40px rgba(180,100,80,0.25)) drop-shadow(0 0 80px rgba(100,80,60,0.15))",
              opacity: 0.92,
            }}
          />
        </div>
        {/* Виньетка по краям чтоб плашки читались */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 80% at 50% 50%, transparent 30%, hsl(220,10%,6%) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }} />
        <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
          <div
            ref={processSectionRef}
            className={cn(
              "max-w-3xl mx-auto transition-all duration-1000 ease-out",
              isProcessVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
          >
            <h2
              className="text-3xl md:text-4xl font-light text-white text-center mb-4"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Формат работы
            </h2>
            <p className="text-center text-xs tracking-[0.4em] text-[hsl(210,15%,40%)] uppercase font-light mb-14">
              Алгоритм расследования
            </p>

            <div className="space-y-5">
              {[
                {
                  step: "01",
                  title: "Диагностика и расследование",
                  text: "Раскрываю тайны, нахожу корень проблемы: наводки, ссоры, некротические привязки, энергетический вампиризм. Называю вещи своими именами.",
                },
                {
                  step: "02",
                  title: "Разработка стратегии",
                  text: "Подбираю ритуальные инструменты — руны, свечи, артефакты — для устранения чужих программ, разрыва привязанностей и возврата контроля.",
                },
                {
                  step: "03",
                  title: "Формат и стоимость",
                  text: "Аудио- или видеосвязь онлайн. Я предпочитаю аудиоформат — запись останется у вас. От\u00a04\u00a0850\u00a0₽ за сеанс. Доступны разовые вскрытия и серийное ведение до результата.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="group flex gap-6 items-start rounded-sm p-7 transition-all duration-400"
                  style={{
                    background: "linear-gradient(to right, rgba(18,20,26,0.92) 0%, rgba(18,20,26,0.85) 55%, rgba(18,20,26,0.0) 100%)",
                    border: "none",
                    backdropFilter: "blur(0px)",
                    transition: "background 0.4s ease, backdrop-filter 0.4s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(to right, rgba(8,10,18,0.97) 0%, rgba(8,10,18,0.93) 60%, rgba(8,10,18,0.0) 100%)"
                    ;(e.currentTarget as HTMLDivElement).style.backdropFilter = "blur(12px)"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(to right, rgba(18,20,26,0.92) 0%, rgba(18,20,26,0.85) 55%, rgba(18,20,26,0.0) 100%)"
                    ;(e.currentTarget as HTMLDivElement).style.backdropFilter = "blur(0px)"
                  }}
                >
                  <span
                    className="text-3xl font-light flex-shrink-0 leading-none mt-1 transition-all duration-400 group-hover:opacity-100"
                    style={{ fontFamily: "var(--font-cormorant)", color: "hsl(42,70%,55%)", opacity: 0.6 }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <h3
                      className="text-lg font-light mb-2 transition-all duration-400 group-hover:text-white"
                      style={{ fontFamily: "var(--font-cormorant)", color: "hsl(210,15%,80%)", textShadow: "none" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textShadow = "0 0 20px rgba(200,160,80,0.4)" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textShadow = "none" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[hsl(210,15%,52%)] text-sm leading-relaxed font-light transition-colors duration-400 group-hover:text-[hsl(210,15%,68%)]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* БЛОК 6 — ОТЗЫВЫ */}
      {(activeSection === null || activeSection === "reviews") && (
        <ReviewsCarousel reviewsSectionRef={reviewsSectionRef} isReviewsVisible={isReviewsVisible} />
      )}

      {/* БЛОК 7 — ЗАПИСЬ */}
      {(activeSection === null || activeSection === "contact") && (
      <section ref={contactSectionRef} id="contact" className="py-24 noise-texture relative overflow-hidden" style={{ background: "hsl(220,10%,6%)" }}>
        {/* Фоновое изображение */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/d2554c52-ce29-4ff2-908b-acc0643dfba4.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
            filter: "grayscale(30%) sepia(20%)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, hsl(220,10%,6%) 0%, transparent 25%, transparent 75%, hsl(220,10%,6%) 100%)" }} />
        <OccultOverlay density={14} />
        <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
          <h2
            ref={headingRef}
            className={cn(
              "mb-4 text-center font-light text-white transition-all duration-1000 ease-out",
              isHeadingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Я работаю <span className="gold-text">не со всеми.</span>
          </h2>
          <p
            className={cn(
              "text-center text-[hsl(210,15%,50%)] font-light text-sm max-w-lg mx-auto mb-14 leading-relaxed transition-all duration-1000 ease-out",
              isHeadingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
          >
            Мне не нужны те, кто ищет волшебную таблетку или хочет, чтобы его погладили по головке.
            Если вы готовы принять правду — оставляйте заявку.
          </p>
          <ContactForm />
        </div>
      </section>
      )}

      {/* ФУТЕР */}
      <footer className="py-12 noise-texture" style={{ background: "hsl(220,10%,5%)", borderTop: "1px solid rgba(160,170,185,0.07)" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              {/* Левая часть — имя и подпись */}
              <div className="text-center md:text-left">
                <p className="font-light text-lg mb-1 text-shimmer" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Майя
                </p>
                <p className="text-xs tracking-[0.35em] text-[hsl(210,15%,38%)] uppercase font-light">
                  Оккультный следователь
                </p>
              </div>

              {/* Центр — кнопка записи */}
              <SparkleButton href="https://dikidi.net/926132" target="_blank" rel="noopener noreferrer" className="btn-gold">
                <Icon name="CalendarCheck" size={14} />
                Записаться онлайн
              </SparkleButton>

              {/* Правая часть — контакты */}
              <div className="flex flex-col gap-3 items-center md:items-end">
                <a
                  href="https://max.ru/u/f9LHodD0cOJ6ZZlQj0UscdLQ-24d096fz401XbP1kL4IvDZwlSnhba3Xum4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[hsl(210,15%,65%)] hover:text-white transition-colors text-sm font-light"
                >
                  <Icon name="ExternalLink" size={14} />
                  MAX
                </a>
                <a
                  href="https://t.me/tarolog666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[hsl(210,15%,50%)] hover:text-white transition-colors text-sm font-light"
                >
                  <Icon name="Send" size={14} />
                  @tarolog666
                </a>
                <a
                  href="tel:+79082221022"
                  className="flex items-center gap-2 text-[hsl(210,15%,50%)] hover:text-white transition-colors text-sm font-light"
                >
                  <Icon name="Phone" size={14} />
                  +7 908 222 10 22
                </a>
              </div>
            </div>

            <div className="mt-10 pt-6 text-center" style={{ borderTop: "1px solid rgba(160,170,185,0.06)" }}>
              <p className="text-[hsl(210,15%,28%)] text-xs font-light tracking-wider">
                © 2025 Майя · Оккультный следователь · Все права защищены
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}