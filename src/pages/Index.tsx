import { StarField } from "@/components/StarField"
import { ChevronDown } from "lucide-react"
import { ContactForm } from "@/components/ContactForm"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

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

  const heroStyle = {
    height: initialHeight ? `${initialHeight}px` : "100vh",
  }

  return (
    <div className="min-h-screen bg-[hsl(220,10%,6%)] scratch-overlay">
      {/* БЛОК 1 — HERO */}
      <section className="relative w-full overflow-hidden noise-texture" style={heroStyle}>
        <div className="absolute top-6 right-6 z-10 flex space-x-3">
          <Button
            onClick={scrollToContact}
            variant="outline"
            size="sm"
            className="bg-transparent text-[hsl(210,15%,75%)] border-[rgba(160,170,185,0.3)] hover:bg-[rgba(160,170,185,0.08)] hover:text-white hover:border-[rgba(160,170,185,0.5)] transition-all tracking-widest text-xs uppercase font-light"
          >
            Записаться
          </Button>
        </div>

        <div className="absolute inset-0" style={warpSpeedStyle}>
          <StarField blurAmount={blurAmount} />
        </div>

        {/* Fog overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(8,10,14,0.3) 0%, rgba(8,10,14,0.75) 60%, rgba(8,10,14,0.97) 100%)",
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

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div
              className="glass-panel px-8 py-10 rounded-sm inline-block w-full"
              style={{ borderColor: "rgba(160,170,185,0.1)" }}
            >
              <p className="text-xs tracking-[0.4em] text-[hsl(210,15%,50%)] uppercase mb-6 font-light">
                Оккультный следователь · 11 лет практики
              </p>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight mb-6"
                style={{ fontFamily: "var(--font-cormorant)", letterSpacing: "0.04em" }}
              >
                Тайное
                <br />
                <span className="text-[hsl(210,15%,65%)]">становится явным.</span>
              </h1>
              <p className="text-sm md:text-base text-[hsl(210,15%,60%)] font-light max-w-xl mx-auto leading-relaxed mb-8 tracking-wide">
                Жёсткая оккультная диагностика отношений. Я не вытираю слёзы — я срываю маски,
                разоблачаю ложь и показываю истинные мотивы партнёра.
              </p>
              <Button
                onClick={scrollToContact}
                variant="outline"
                className="bg-transparent text-[hsl(210,15%,75%)] border-[rgba(160,170,185,0.4)] hover:bg-[rgba(160,170,185,0.08)] hover:text-white hover:border-[rgba(160,170,185,0.7)] transition-all tracking-[0.2em] text-xs uppercase font-light px-8 py-5"
              >
                Узнать скрытую правду
              </Button>
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
      </section>

      {/* БЛОК 2 — БОЛЬ */}
      <section className="py-24 noise-texture" style={{ background: "hsl(220,10%,7%)" }}>
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
                className="text-3xl md:text-4xl font-light text-white mb-8 leading-tight"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Ваша интуиция не врёт.
              </h2>
              <p className="text-[hsl(210,15%,60%)] leading-relaxed font-light text-sm md:text-base">
                Когда отношения рушатся без видимых причин. Когда вместо любви — ледяной холод, агрессия или паранойя,
                а доказательств нет. Когда вы чувствуете: что-то не так, но никто вам не верит.
              </p>
              <div className="mt-8 h-px w-16 mx-auto" style={{ background: "rgba(160,170,185,0.2)" }} />
              <p className="mt-8 text-[hsl(210,15%,55%)] leading-relaxed font-light text-sm md:text-base">
                Я знаю, почему вы здесь. Вы устали от лжи и сладких сказок психологов.
                <br className="hidden md:block" />
                Вам нужен тонкий хирург — не утешитель.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* БЛОК 3 — ОБО МНЕ */}
      <section ref={aboutSectionRef} id="about" className="py-24 noise-texture" style={{ background: "hsl(220,10%,6%)" }}>
        <div className="container mx-auto px-4">
          <div
            ref={aboutContentRef}
            className={cn(
              "max-w-4xl mx-auto transition-all duration-1000 ease-out",
              isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
          >
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 rounded-sm overflow-hidden" style={{ border: "1px solid rgba(160,170,185,0.12)" }}>
                <img
                  src="https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/935e2cbe-511f-44e5-ae79-46e0d2853120.jpg"
                  alt="Майя"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="space-y-5 text-center md:text-left">
                <p className="text-xs tracking-[0.4em] text-[hsl(210,15%,45%)] uppercase font-light">
                  Следователь по оккультным делам
                </p>
                <h2
                  className="text-3xl md:text-4xl font-light text-white leading-tight"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Я — Майя.
                  <br />
                  <span className="text-[hsl(210,15%,60%)]">Одиннадцать лет практики.</span>
                </h2>
                <div className="space-y-4 max-w-xl">
                  <p className="text-[hsl(210,15%,58%)] font-light text-sm leading-relaxed">
                    Я работаю на стыке глубинной магии, ясновидения и психоанализа. Там, где другие видят «просто кризис»,
                    я вижу механику тонкого плана.
                  </p>
                  <p className="text-[hsl(210,15%,58%)] font-light text-sm leading-relaxed">
                    Я сканирую пространство и вытаскиваю на свет то, что от вас скрывают: двойное дно, тайные связи,
                    чужое вмешательство в вашу жизнь. Для меня не существует тайн.
                  </p>
                </div>
                <Button
                  onClick={scrollToContact}
                  variant="outline"
                  size="sm"
                  className="bg-transparent text-[hsl(210,15%,65%)] border-[rgba(160,170,185,0.3)] hover:bg-[rgba(160,170,185,0.06)] hover:text-white hover:border-[rgba(160,170,185,0.5)] transition-all tracking-[0.2em] text-xs uppercase font-light mt-2"
                >
                  Записаться на диагностику
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* БЛОК 4 — УСЛУГИ */}
      <section ref={servicesSectionRef} id="services" className="py-24 noise-texture" style={{ background: "hsl(220,10%,8%)" }}>
        <div className="container mx-auto px-4">
          <h2
            ref={servicesTitleRef}
            className={cn(
              "mb-4 text-center font-light text-white transition-all duration-1000 ease-out",
              isServicesTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Инструменты и услуги
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  label: "Диагностика",
                  title: "Глубинные оккультные расклады",
                  text: "Детальный рентген вашей реальности. Бескомпромиссные предсказания, выявление лжи, измен и скрытых мотивов партнёра.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/0845f2fa-213b-43c5-b9ff-c1d077c2b72d.png",
                  imgPosition: "object-center",
                },
                {
                  label: "Очищение",
                  title: "Программные свечи",
                  text: "Индивидуальное создание восковых программ для выжигания негатива, разрушения чужих привязанностей и очищения пространства.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/a685067d-1621-4b41-9a59-832bedf1ea0a.jpg",
                  imgPosition: "object-center",
                },
                {
                  label: "Защита",
                  title: "Рунические ставы",
                  text: "Жёсткая северная магия для взлома ситуаций, постановки глухой защиты и изменения вероятностей под вашу задачу.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/b4616f2b-746d-466a-8225-00f8e52dcfe2.png",
                  imgPosition: "object-center",
                },
                {
                  label: "Эксклюзив",
                  title: "Артефакты с подселением",
                  text: "Работа по индивидуальным заказам. Создание проводников и защитников с подселением сущностей для сложных задач.",
                  img: "https://cdn.poehali.dev/projects/44014c99-af9e-42e1-a582-41ff8ba05223/bucket/54c7f87e-9f90-4050-a24c-5437d4e58a59.jpg",
                  imgPosition: "object-bottom",
                },
              ].map((service) => (
                <div
                  key={service.title}
                  className="glass-panel rounded-sm overflow-hidden transition-all duration-300 hover:border-[rgba(160,170,185,0.22)] group"
                  style={{ borderColor: "rgba(160,170,185,0.08)" }}
                >
                  {/* Фото */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={service.img}
                      alt={service.title}
                      className={`w-full h-full object-cover ${service.imgPosition} transition-transform duration-700 group-hover:scale-105`}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to bottom, rgba(8,10,14,0.1) 0%, rgba(8,10,14,0.75) 100%)",
                      }}
                    />
                    <p className="absolute bottom-4 left-5 text-xs tracking-[0.35em] text-[hsl(210,15%,55%)] uppercase font-light">
                      {service.label}
                    </p>
                  </div>
                  {/* Текст */}
                  <div className="p-6">
                    <h3
                      className="text-xl font-light text-white mb-3 leading-tight"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {service.title}
                    </h3>
                    <p className="text-[hsl(210,15%,52%)] text-sm leading-relaxed font-light">{service.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* БЛОК 5 — КАК РАБОТАЮ */}
      <section className="py-24 noise-texture" style={{ background: "hsl(220,10%,6%)" }}>
        <div className="container mx-auto px-4">
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
                  className="glass-panel rounded-sm p-7 flex gap-6 items-start"
                  style={{ borderColor: "rgba(160,170,185,0.08)" }}
                >
                  <span
                    className="text-3xl font-light text-[hsl(210,15%,25%)] flex-shrink-0 leading-none mt-1"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <h3
                      className="text-lg font-light text-white mb-2"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[hsl(210,15%,52%)] text-sm leading-relaxed font-light">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* БЛОК 6 — ОТЗЫВЫ */}
      <section className="py-24 noise-texture" style={{ background: "hsl(220,10%,8%)" }}>
        <div className="container mx-auto px-4">
          <div
            ref={reviewsSectionRef}
            className={cn(
              "max-w-4xl mx-auto transition-all duration-1000 ease-out",
              isReviewsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
          >
            <h2
              className="text-3xl md:text-4xl font-light text-white text-center mb-4"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Свидетельства
            </h2>
            <p className="text-center text-xs tracking-[0.4em] text-[hsl(210,15%,40%)] uppercase font-light mb-14">
              Реальные истории
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  text: "Муж изменился за неделю. Стал чужим, агрессивным, глаза стеклянные. Психологи говорили про кризис семи лет. Майя на первой аудиосессии описала женщину и нашла подклад. Мы провели отжиг программными свечами. Через месяц он рыдал, стоя на коленях, словно очнулся от комы. Жёстко, страшно — но это спасло мне жизнь.",
                  author: "Анна",
                  age: "34 года",
                },
                {
                  text: "Я не спала месяцами, меня мучила паранойя. Майя провела расклад и раскрыла такие подробности, о которых никто не знал. Оказалось, человек годами вёл двойную жизнь и высасывал из меня ресурсы. Майя дала мне рунический став на разрыв каналов. Меня трясло три дня — потом наступила кристальная тишина и свобода. Это не гадание. Это хирургия.",
                  author: "Елена",
                  age: "41 год",
                },
              ].map((review) => (
                <div
                  key={review.author}
                  className="glass-panel rounded-sm p-8 flex flex-col justify-between"
                  style={{ borderColor: "rgba(160,170,185,0.08)" }}
                >
                  <div>
                    <Icon name="Quote" size={20} className="text-[hsl(210,15%,30%)] mb-5" />
                    <p className="text-[hsl(210,15%,60%)] text-sm leading-relaxed font-light italic">{review.text}</p>
                  </div>
                  <div className="mt-7 pt-5" style={{ borderTop: "1px solid rgba(160,170,185,0.08)" }}>
                    <p className="text-[hsl(210,15%,55%)] text-xs tracking-widest uppercase font-light">
                      — {review.author}, {review.age}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* БЛОК 7 — ЗАПИСЬ */}
      <section ref={contactSectionRef} id="contact" className="py-24 noise-texture" style={{ background: "hsl(220,10%,6%)" }}>
        <div className="container mx-auto px-4">
          <h2
            ref={headingRef}
            className={cn(
              "mb-4 text-center font-light text-white transition-all duration-1000 ease-out",
              isHeadingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Я работаю не со всеми.
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
    </div>
  )
}