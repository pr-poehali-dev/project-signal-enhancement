import { useEffect, useRef } from "react"

const ELDER_FUTHARK = [
  "ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ","ᛇ","ᛈ","ᛉ","ᛊ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛜ","ᛞ","ᛟ",
]

const TAROT_ARCANA = [
  "🜁","🜂","🜃","🜄","☽","☾","⊕","⊗","✦","✧","⋆","∴","∵","⌖","⍟","⎊","⎋","⌘","⍋","⍦",
]

const SYMBOLS = [...ELDER_FUTHARK, ...TAROT_ARCANA]

interface Particle {
  x: number
  y: number
  symbol: string
  targetOpacity: number
  size: number
  speed: number
  drift: number
  phase: number
  glintPhase: number
  glintSpeed: number
  isRune: boolean
}

interface OccultOverlayProps {
  density?: number
  className?: string
}

export function OccultOverlay({ density = 18, className = "" }: OccultOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
      initParticles()
    }

    const initParticles = () => {
      particles.current = Array.from({ length: density }, (_, i) => {
        const isRune = i < Math.floor(density * 0.65)
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          symbol: isRune
            ? ELDER_FUTHARK[Math.floor(Math.random() * ELDER_FUTHARK.length)]
            : TAROT_ARCANA[Math.floor(Math.random() * TAROT_ARCANA.length)],
          targetOpacity: Math.random() * 0.14 + 0.05,
          size: Math.random() * 16 + 10,
          speed: Math.random() * 0.18 + 0.04,
          drift: (Math.random() - 0.5) * 0.25,
          phase: Math.random() * Math.PI * 2,
          glintPhase: Math.random() * Math.PI * 2,
          glintSpeed: Math.random() * 0.04 + 0.01,
          isRune,
        }
      })
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.008

      particles.current.forEach((p) => {
        // Медленное мерцание базовой прозрачности
        const pulse = Math.sin(t + p.phase) * 0.5 + 0.5
        const baseAlpha = p.targetOpacity * pulse

        // Glint — быстрая вспышка яркости для рун
        p.glintPhase += p.glintSpeed
        const glint = p.isRune
          ? Math.pow(Math.max(0, Math.sin(p.glintPhase)), 8) // острый пик
          : 0

        const alpha = Math.min(1, baseAlpha + glint * 0.55)

        ctx.save()
        ctx.globalAlpha = alpha

        if (p.isRune && glint > 0.1) {
          // Сверкающая руна: серебряный с голубым оттенком + свечение
          const glintStr = Math.floor(glint * 255)
          ctx.fillStyle = `rgb(${180 + glintStr * 0.3}, ${185 + glintStr * 0.3}, ${200 + glintStr * 0.22})`

          // Halo-свечение
          if (glint > 0.4) {
            ctx.shadowColor = `rgba(180, 210, 255, ${glint * 0.6})`
            ctx.shadowBlur = 8 + glint * 14
          }
        } else {
          ctx.fillStyle = "hsl(210,15%,70%)"
          ctx.shadowBlur = 0
        }

        ctx.font = `${p.size}px serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(p.symbol, p.x, p.y)
        ctx.restore()

        p.y -= p.speed
        p.x += p.drift

        if (p.y < -30) {
          p.y = canvas.height + 30
          p.x = Math.random() * canvas.width
          p.symbol = p.isRune
            ? ELDER_FUTHARK[Math.floor(Math.random() * ELDER_FUTHARK.length)]
            : TAROT_ARCANA[Math.floor(Math.random() * TAROT_ARCANA.length)]
          p.glintPhase = Math.random() * Math.PI * 2
        }
        if (p.x < -30) p.x = canvas.width + 30
        if (p.x > canvas.width + 30) p.x = -30
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [density])

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 1 }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
