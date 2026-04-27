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
  opacity: number
  targetOpacity: number
  size: number
  speed: number
  drift: number
  phase: number
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
      particles.current = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        opacity: 0,
        targetOpacity: Math.random() * 0.12 + 0.04,
        size: Math.random() * 14 + 10,
        speed: Math.random() * 0.15 + 0.05,
        drift: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.008

      particles.current.forEach((p) => {
        const pulse = Math.sin(t + p.phase) * 0.5 + 0.5
        const alpha = p.targetOpacity * pulse

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = "hsl(210,15%,75%)"
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
          p.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
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
