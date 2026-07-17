'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredEmployees, setActiveEmployeeId } from '@/lib/storage/local-employee-store'
import type { Employee } from '@/types/domain'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ShieldCheck, User, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadEmployees() {
      try {
        const list = await getStoredEmployees()
        
        // Auto-heal usernames & passwords for seeded employees in Supabase if missing
        let hasUpdates = false
        const updatedList = await Promise.all(
          list.map(async (emp) => {
            if (!emp.username || !emp.password) {
              let username = ''
              let password = '123'
              
              const emailLower = emp.email.toLowerCase()
              if (emp.id === 'emp-celal' || emailLower.includes('celal') || emailLower.includes('hello')) {
                username = 'celal'
              } else if (emailLower.includes('ercan')) {
                username = 'ercan'
              } else if (emailLower.includes('furkan')) {
                username = 'furkan'
              } else if (emailLower.includes('betul')) {
                username = 'betul'
              } else if (emailLower.includes('tugba')) {
                username = 'tugba'
              } else {
                username = emp.fullName.split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
              }
              
              if (username) {
                const updatedEmp = {
                  ...emp,
                  username,
                  password,
                }
                const { EmployeeRepository } = await import('@/lib/repositories/EmployeeRepository')
                await EmployeeRepository.save(updatedEmp)
                hasUpdates = true
                return updatedEmp
              }
            }
            return emp
          })
        )

        console.log("Loaded employees from DB:", list.map(emp => ({
          fullName: emp.fullName,
          username: emp.username,
          password: emp.password
        })))
        setEmployees(hasUpdates ? updatedList : list)
      } catch (err) {
        console.error('Failed to load employees:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadEmployees()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim() || !passwordInput.trim()) return

    console.log("Login Attempt Debug:", {
      enteredUsername: usernameInput.trim().toLowerCase(),
      enteredPassword: passwordInput.trim(),
      loadedEmployees: employees.map(emp => ({
        id: emp.id,
        fullName: emp.fullName,
        email: emp.email,
        username: emp.username,
        password: emp.password
      }))
    })

    const target = employees.find(
      (emp) =>
        emp.username?.toLowerCase() === usernameInput.trim().toLowerCase() &&
        emp.password === passwordInput.trim()
    )

    if (target) {
      setActiveEmployeeId(target.id)
      toast.success('Giriş Başarılı', {
        description: `Hoş geldiniz, ${target.fullName}!`,
      })
      router.push('/dashboard')
    } else {
      toast.error('Giriş Başarısız', {
        description: 'Hatalı kullanıcı adı veya şifre girdiniz.',
      })
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
          <p className="text-xs text-muted-foreground">Devam etmek için hesabınıza giriş yapın</p>
        </div>

        {/* Card Panel */}
        <div className="rounded-3xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-xl p-6 shadow-2xl space-y-6">
          {/* Username & Password Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Kullanıcı Adı</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Kullanıcı adınızı girin..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="pl-9 h-10 text-xs bg-neutral-950/20 border-neutral-850"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  type="password"
                  placeholder="Şifrenizi girin..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="pl-9 h-10 text-xs bg-neutral-950/20 border-neutral-850"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 flex items-center justify-center gap-1.5 transition-all"
            >
              <LogIn className="h-4 w-4" /> Giriş Yap
            </Button>
          </form>




        </div>

        {/* Footer Info */}
        <p className="text-center text-[10px] text-neutral-500">
          Social Art Base © {new Date().getFullYear()} • Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  )
}
