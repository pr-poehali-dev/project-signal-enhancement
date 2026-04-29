import { useState, useEffect } from "react"
import Icon from "@/components/ui/icon"

interface NavMenuProps {
  onScrollTo: (section: "about" | "reviews" | "services" | "arcana" | "contact") => void
}

export function NavMenu({ onScrollTo }: NavMenuProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const links = [
    { label: "Обо мне", section: "about" as const },
    { label: "Инструменты", section: "services" as const },
    { label: "Знак для тебя", section: "arcana" as const },
    { label: "Отзывы", section: "reviews" as const },
    { label: "Запись", section: "contact" as const },
  ]

  const handleClick = (section: typeof links[number]["section"]) => {
    onScrollTo(section)
    setMenuOpen(false)
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(6,8,12,0.92)" : "rgba(6,8,12,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(200,160,80,0.12)",
        boxShadow: scrolled ? "0 2px 40px rgba(0,0,0,0.4)" : "none",
        transform: "translateZ(0)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Логотип */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-light transition-opacity hover:opacity-70"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "20px",
              letterSpacing: "0.08em",
              color: "hsl(42,65%,68%)",
              textShadow: "0 0 18px rgba(220,185,120,0.5)",
            }}
          >
            Майя
          </button>

          {/* Десктоп-меню */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <button
                key={l.section}
                onClick={() => handleClick(l.section)}
                className="text-xs font-light tracking-[0.2em] uppercase transition-all duration-200 relative group"
                style={{ color: "hsl(210,20%,72%)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "hsl(42,75%,72%)"
                  e.currentTarget.style.textShadow = "0 0 12px rgba(220,185,120,0.6)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "hsl(210,20%,72%)"
                  e.currentTarget.style.textShadow = "none"
                }}
              >
                {l.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                  style={{ background: "hsl(42,65%,58%)", boxShadow: "0 0 6px rgba(220,185,120,0.6)" }}
                />
              </button>
            ))}
          </div>

          {/* Мобильный бургер */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Меню"
            style={{ color: "hsl(42,65%,62%)" }}
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {menuOpen && (
        <div
          className="md:hidden py-5 px-6 flex flex-col gap-3"
          style={{
            background: "rgba(6,8,12,0.97)",
            borderTop: "1px solid rgba(200,160,80,0.12)",
          }}
        >
          {links.map((l) => (
            <button
              key={l.section}
              onClick={() => handleClick(l.section)}
              className="text-left text-sm font-light tracking-[0.25em] uppercase py-2.5 transition-colors border-b"
              style={{
                color: "hsl(210,20%,70%)",
                borderColor: "rgba(160,170,185,0.06)",
                fontFamily: "inherit",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
