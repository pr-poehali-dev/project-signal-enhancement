import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Rocket, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type FieldErrors = {
  name?: string
  email?: string
  message?: string
}

export function ContactForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Once visible, no need to observe anymore
          if (formRef.current) {
            observer.unobserve(formRef.current)
          }
        }
      },
      {
        // Start animation when form is 10% visible
        threshold: 0.1,
      },
    )

    if (formRef.current) {
      observer.observe(formRef.current)
    }

    return () => {
      if (formRef.current) {
        observer.unobserve(formRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    // Clear server error when user makes any changes
    if (serverError) {
      setServerError(null)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Введите ваше имя"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Введите корректный email"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Введите сообщение"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setServerError(null)

    // Simulate form submission (since we don't have server action in Vite)
    setTimeout(() => {
      toast({
        title: "Сообщение отправлено!",
        description: "Спасибо за обращение. Мы свяжемся с вами в ближайшее время.",
        duration: 2000,
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      })

      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div
      ref={formRef}
      className={cn(
        "mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      )}
    >
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Ошибка</span>
          </div>
          <p className="mt-1 ml-6">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center justify-between">
            Ваше имя
            {errors.name && (
              <span className="text-xs font-normal text-red-500 flex items-center">
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
            className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <span id="name-error" className="sr-only">
              {errors.name}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center justify-between">
            Ваш email
            {errors.email && (
              <span className="text-xs font-normal text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.email}
              </span>
            )}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <span id="email-error" className="sr-only">
              {errors.email}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон (необязательно)</Label>
          <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="flex items-center justify-between">
            Сообщение
            {errors.message && (
              <span className="text-xs font-normal text-red-500 flex items-center">
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
            placeholder="Напишите ваше сообщение..."
            className={cn("min-h-[120px]", errors.message && "border-red-500 focus-visible:ring-red-500")}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && (
            <span id="message-error" className="sr-only">
              {errors.message}
            </span>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Rocket className="mr-2 h-4 w-4" />
          {isSubmitting ? "Отправка..." : "Отправить"}
        </Button>
      </form>
    </div>
  )
}
