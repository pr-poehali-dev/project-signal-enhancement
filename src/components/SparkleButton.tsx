import { useRef, useCallback, ReactNode } from "react"

interface Sparkle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

const COLORS = [
  "rgba(180, 210, 255, 0.95)",
  "rgba(140, 185, 255, 0.9)",
  "rgba(200, 225, 255, 0.85)",
  "rgba(160, 200, 255, 0.9)",
  "rgba(220, 235, 255, 0.8)",
  "rgba(120, 170, 240, 0.95)",
  "rgba(200, 215, 255, 1)",
  "rgba(255, 255, 255, 0.9)",
]

interface Props {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  href?: string
  target?: string
  rel?: string
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  onClick?: () => void
}

export default function SparkleButton({ children, className, style, href, target, rel, type, disabled, onClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparklesRef = useRef<Sparkle[]>([])
  const rafRef = useRef<number | null>(null)
  const activeRef = useRef(false)
  const idRef = useRef(0)

  const spawnSparkles = useCallback((x: number, y: number) => {
    const count = 4 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.8 + Math.random() * 1.8
      const maxLife = 40 + Math.random() * 30
      sparklesRef.current.push({
        id: idRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 1.5 + Math.random() * 2.5,
        opacity: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife,
      })
    }
  }, [])

  const loop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    sparklesRef.current = sparklesRef.current.filter((s) => s.life < s.maxLife)

    for (const s of sparklesRef.current) {
      s.x += s.vx
      s.y += s.vy
      s.vy += 0.04
      s.life++
      s.opacity = 1 - s.life / s.maxLife

      ctx.save()
      ctx.globalAlpha = s.opacity
      ctx.fillStyle = s.color
      ctx.shadowColor = s.color
      ctx.shadowBlur = 6

      // Рисуем звёздочку-блёстку
      ctx.beginPath()
      const r = s.size
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2
        const outerX = s.x + Math.cos(angle) * r
        const outerY = s.y + Math.sin(angle) * r
        const innerX = s.x + Math.cos(angle + Math.PI / 4) * (r * 0.35)
        const innerY = s.y + Math.sin(angle + Math.PI / 4) * (r * 0.35)
        if (i === 0) ctx.moveTo(outerX, outerY)
        else ctx.lineTo(outerX, outerY)
        ctx.lineTo(innerX, innerY)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    if (sparklesRef.current.length > 0 || activeRef.current) {
      rafRef.current = requestAnimationFrame(loop)
    } else {
      rafRef.current = null
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (Math.random() < 0.5) spawnSparkles(x, y)
  }, [spawnSparkles])

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    activeRef.current = true
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    spawnSparkles(e.clientX - rect.left, e.clientY - rect.top)
    if (!rafRef.current) rafRef.current = requestAnimationFrame(loop)
  }, [spawnSparkles, loop])

  const handleMouseLeave = useCallback(() => {
    activeRef.current = false
  }, [])

  const inner = (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="pointer-events-none absolute inset-0 w-full h-full"
        style={{ zIndex: 10, overflow: "visible" }}
      />
      {href ? (
        <a href={href} target={target} rel={rel} className={className} style={style}>
          {children}
        </a>
      ) : (
        <button type={type ?? "button"} disabled={disabled} className={className} style={style} onClick={onClick}>
          {children}
        </button>
      )}
    </div>
  )

  return inner
}
