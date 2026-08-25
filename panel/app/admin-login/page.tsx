'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ShieldCheck, User, Lock, LogIn } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/auth-me', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          if (data && data.authenticated && (data.principalType === 'admin' || data.isAdmin)) {
            router.replace('/dashboard')
            return
          }
        }
      } catch (err) {
        // Network errors ignored on mount
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [router])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanUser = usernameInput.trim()
    const cleanPass = passwordInput.trim()

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Kullanıcı adı ve şifre gereklidir.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth-admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        const errText =
          response.status === 429
            ? 'Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.'
            : response.status === 401
            ? 'Geçersiz yönetici kimlik bilgileri.'
            : data.error || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'

        setErrorMessage(errText)
        toast.error('Giriş Başarısız', { description: errText })
        setIsSubmitting(false)
        return
      }

      toast.success('Yönetici Girişi Başarılı', {
        description: `Hoş geldiniz, ${data.admin?.displayName || 'Sistem Yöneticisi'}.`,
      })

      // Compatibility token sync
      if (typeof window !== 'undefined') {
        const adminObj = {
          id: data.admin?.id,
          name: data.admin?.displayName || 'Sistem Yöneticisi',
          role: 'Sistem Yöneticisi',
          email: data.admin?.username,
          class: 'A-Class',
          permissions: 'all',
          can_add_client: true,
          isAdmin: true,
          principalType: 'admin',
        }
        window.localStorage.setItem('ajans_user', JSON.stringify(adminObj))
        window.localStorage.setItem('socialart_user', JSON.stringify(adminObj))
      }

      router.replace('/dashboard')
    } catch (err: any) {
      const errText = err?.message || 'Sunucuya bağlanırken bir hata oluştu.'
      setErrorMessage(errText)
      toast.error('Bağlantı Hatası', { description: errText })
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-sm font-medium">Yönetici oturumu kontrol ediliyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans text-slate-100 selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-slate-800/80 bg-slate-950/40 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Yönetici Paneli Girişi</h1>
            <p className="mt-1 text-xs text-slate-400">Dedicated Administrative Principal Authentication</p>
          </div>

          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Yönetici Kullanıcı Adı
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="text"
                    required
                    autoComplete="username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="admin"
                    className="border-slate-800 bg-slate-950/60 pl-9 text-slate-200 placeholder:text-slate-600 focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="border-slate-800 bg-slate-950/60 pl-9 text-slate-200 placeholder:text-slate-600 focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 focus-visible:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Giriş Yapılıyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Yönetici Olarak Giriş Yap</span>
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

