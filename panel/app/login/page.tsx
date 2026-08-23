'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ShieldCheck, User, Lock, LogIn, KeyRound, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [identifierInput, setIdentifierInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Forced First-Login Password Change State
  const [isForcedPasswordChange, setIsForcedPasswordChange] = useState(false)
  const [tempLoginPassword, setTempLoginPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
          if (data && data.authenticated && data.employee) {
            if (data.mustChangePassword) {
              // Active session requires password change, but temp password is not in memory after refresh.
              // Clear session safely so user can re-login with temporary password and complete change.
              await fetch('/api/auth-logout', {
                method: 'POST',
                credentials: 'include',
              })
              if (typeof window !== 'undefined') {
                window.localStorage.removeItem('social-art-base:active-employee-id')
                window.localStorage.removeItem('social-art-base:credentials')
                window.localStorage.removeItem('ajans_user')
                window.localStorage.removeItem('socialart_user')
              }
            } else {
              // Reconstruct presentation compatibility context
              const emp = data.employee
              setActiveEmployeeId(emp.id)
              if (typeof window !== 'undefined') {
                window.localStorage.removeItem('social-art-base:credentials')
                const userObj = {
                  id: emp.id,
                  name: emp.fullName,
                  role: emp.title || 'Ekip Üyesi',
                  email: emp.email,
                  class: 'A-Class',
                  permissions: 'all',
                  can_add_client: true,
                }
                window.localStorage.setItem('ajans_user', JSON.stringify(userObj))
                window.localStorage.setItem('socialart_user', JSON.stringify(userObj))
              }
              router.replace('/dashboard')
              return
            }
          }
        }
      } catch (err) {
        // Network errors or offline on mount are ignored
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanUser = identifierInput.trim()
    const cleanPass = passwordInput.trim()

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Kullanıcı adı ve şifre gereklidir.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: cleanUser, password: cleanPass }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Kullanıcı adı veya şifre hatalı.')
        setIsSubmitting(false)
        return
      }

      // Purge any legacy plaintext credentials in localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('social-art-base:credentials')
      }

      if (data.mustChangePassword) {
        // Hold temp password in memory ONLY for the upcoming change-password request
        setTempLoginPassword(cleanPass)
        setIsForcedPasswordChange(true)
        setIsSubmitting(false)
        return
      }

      // Reconstruct presentation compatibility context
      const emp = data.employee
      setActiveEmployeeId(emp.id)
      if (typeof window !== 'undefined') {
        const userObj = {
          id: emp.id,
          name: emp.fullName,
          role: emp.title || 'Ekip Üyesi',
          email: emp.email,
          class: 'A-Class',
          permissions: 'all',
          can_add_client: true,
        }
        window.localStorage.setItem('ajans_user', JSON.stringify(userObj))
        window.localStorage.setItem('socialart_user', JSON.stringify(userObj))
      }

      toast.success('Giriş Başarılı', {
        description: `Hoş geldiniz, ${emp.fullName}!`,
      })
      router.push('/dashboard')
    } catch (err) {
      console.error('Login Error:', err)
      setErrorMessage('Giriş yapılırken bir bağlantı hatası oluştu.')
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!newPassword || newPassword.length < 12) {
      setErrorMessage('Yeni şifre en az 12 karakter olmalıdır.')
      return
    }

    if (newPassword.length > 128) {
      setErrorMessage('Yeni şifre en fazla 128 karakter olabilir.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Yeni şifreler eşleşmiyor.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: tempLoginPassword,
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Şifre değiştirme başarısız oldu. Lütfen tekrar deneyin.')
        setIsSubmitting(false)
        return
      }

      // Clear all password variables from memory
      setTempLoginPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsForcedPasswordChange(false)
      setPasswordInput('')
      setSuccessMessage('Şifreniz güncellendi. Yeni şifrenizle tekrar giriş yapabilirsiniz.')
      toast.success('Şifre Güncellendi', {
        description: 'Yeni şifrenizle giriş yapabilirsiniz.',
      })
      setIsSubmitting(false)
    } catch (err) {
      console.error('Change Password Error:', err)
      setErrorMessage('Şifre değiştirilirken bir bağlantı hatası oluştu.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 relative overflow-hidden px-4">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-650 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-500/10">
            SA
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Social Art Base</h2>
          <p className="text-xs text-muted-foreground">
            {isForcedPasswordChange
              ? 'İlk giriş için lütfen yeni kalıcı şifrenizi belirleyin'
              : 'Devam etmek için hesabınıza giriş yapın'}
          </p>
        </div>

        {/* Card Panel */}
        <div className="rounded-3xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-xl p-6 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-medium text-center">
              {successMessage}
            </div>
          )}

          {isForcedPasswordChange ? (
            /* Forced First-Login Password Change Form */
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-300 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-purple-400" />
                <span>Geçici şifreniz doğrulandı. Lütfen kalıcı şifrenizi oluşturun.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">
                  Yeni Şifre (En az 12 karakter)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    type="password"
                    placeholder="Yeni güçlü şifreniz..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 h-10 text-xs bg-neutral-950/20 border-neutral-800 text-white placeholder:text-neutral-600"
                    required
                    minLength={12}
                    maxLength={128}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">
                  Yeni Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    type="password"
                    placeholder="Yeni şifrenizi tekrar girin..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 h-10 text-xs bg-neutral-950/20 border-neutral-800 text-white placeholder:text-neutral-600"
                    required
                    minLength={12}
                    maxLength={128}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 flex items-center justify-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" /> Şifreyi Kaydet ve Tamamla
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Username & Password Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">
                  Kullanıcı Adı, Ad Soyad veya E-Posta
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    placeholder="Kullanıcı adı, isim veya e-posta..."
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    className="pl-9 h-10 text-xs bg-neutral-950/20 border-neutral-800 text-white placeholder:text-neutral-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    type="password"
                    placeholder="Şifrenizi girin..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="pl-9 h-10 text-xs bg-neutral-950/20 border-neutral-800 text-white placeholder:text-neutral-600"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 flex items-center justify-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Giriş Yap
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-center text-[10px] text-neutral-500">
          Social Art Base © {new Date().getFullYear()} • Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  )
}
