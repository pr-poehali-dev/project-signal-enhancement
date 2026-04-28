import type React from "react"
import { useState, useEffect, useRef } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type FieldErrors = {
  name?: string
  messenger?: string
  message?: string
}

export function ContactForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    messenger: "",
    message: "",
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (formRef.current) observer.unobserve(formRef.current)
        }
      },
      { threshold: 0.1 },
    )
    if (formRef.current) observer.observe(formRef.current)
    return () => {
      if (formRef.current) observer.unobserve(formRef.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {}
    if (!formData.name.trim()) newErrors.name = "Введите ваше имя"
    if (!formData.messenger.trim()) newErrors.messenger = "Укажите мессенджер для связи"
    if (!formData.message.trim()) newErrors.message = "Опишите ситуацию"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    setTimeout(() => {
      toast({
        title: "Заявка принята.",
        description: "Я свяжусь с вами в течение суток.",
        duration: 3000,
      })
      setFormData({ name: "", messenger: "", message: "" })
      setIsSubmitting(false)
    }, 1000)
  }

  const inputClass =
    "bg-[rgba(15,17,21,0.6)] border-[rgba(160,170,185,0.12)] text-[hsl(210,15%,80%)] placeholder:text-[hsl(210,15%,30%)] focus-visible:ring-[rgba(160,170,185,0.3)] focus-visible:border-[rgba(160,170,185,0.3)] rounded-sm font-light text-sm"

  return (
    <div
      ref={formRef}
      className={cn(
        "mx-auto max-w-md transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      )}
    >
      <div
        className="glass-panel rounded-sm p-8"
        style={{ borderColor: "rgba(160,170,185,0.1)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="flex items-center justify-between text-[hsl(210,15%,50%)] text-xs tracking-widest uppercase font-light"
            >
              Ваше имя
              {errors.name && (
                <span className="text-xs font-normal text-[hsl(0,50%,55%)] flex items-center normal-case tracking-normal">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.name}
                </span>
              )}
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Как вас зовут"
              className={cn(inputClass, errors.name && "border-[hsl(0,50%,35%)]")}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="messenger"
              className="flex items-center justify-between text-[hsl(210,15%,50%)] text-xs tracking-widest uppercase font-light"
            >
              Мессенджер
              {errors.messenger && (
                <span className="text-xs font-normal text-[hsl(0,50%,55%)] flex items-center normal-case tracking-normal">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.messenger}
                </span>
              )}
            </Label>
            <Input
              id="messenger"
              name="messenger"
              value={formData.messenger}
              onChange={handleChange}
              placeholder="Telegram или WhatsApp (ник или номер)"
              className={cn(inputClass, errors.messenger && "border-[hsl(0,50%,35%)]")}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="flex items-center justify-between text-[hsl(210,15%,50%)] text-xs tracking-widest uppercase font-light"
            >
              Ваша ситуация
              {errors.message && (
                <span className="text-xs font-normal text-[hsl(0,50%,55%)] flex items-center normal-case tracking-normal">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.message}
                </span>
              )}
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Кратко опишите, что происходит. Чем точнее — тем глубже я смогу войти в ситуацию."
              className={cn(
                inputClass,
                "min-h-[120px]",
                errors.message && "border-[hsl(0,50%,35%)]",
              )}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold w-full justify-center py-4"
            style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
          >
            {isSubmitting ? "Отправка..." : "Записаться на диагностику"}
          </button>
        </form>
      </div>
    </div>
  )
}