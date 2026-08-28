'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useMemo, type ReactNode } from 'react'
import type { Employee } from '@/types/domain'
import { getStoredEmployees, getActiveEmployeeId, setActiveEmployeeId, resolveOperationalEmployee } from '@/lib/storage/local-employee-store'
import { resolveEffectivePermissions } from '@/lib/permissions/resolve-permissions'
import { resolvePanelAuthority, WorkspaceAuthContext, ANONYMOUS_PRINCIPAL, type PanelPrincipal } from '@/lib/permissions/panel-authority'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Menu, X, ChevronRight, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkspaceLayoutProps {
  children: ReactNode
}

function isPublicAuthRoute(path: string | null): boolean {
  if (!path) return true
  const clean = path.replace(/\/+$/, '')
  return clean === '/login' || clean === '/admin-login' || clean.endsWith('/login') || clean.endsWith('/admin-login') || clean.includes('login')
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [principal, setPrincipal] = useState<PanelPrincipal>(ANONYMOUS_PRINCIPAL)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('')
  const [serverEmployee, setServerEmployee] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  const isAuthPage = isPublicAuthRoute(pathname)

  useEffect(() => {
    async function loadData() {
      if (isAuthPage) {
        setIsLoadingAuth(false)
        return
      }

      try {
        // GÜVENLİK KORUMASI: Next.js paneli doğrudan girişlerde sunucu oturumunu (/api/auth-me) doğrulamak zorundadır!
        const res = await fetch('/api/auth-me', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('UNAUTHENTICATED')
        }

        const authData = await res.json()
        if (!authData || !authData.authenticated) {
          throw new Error('UNAUTHENTICATED')
        }

        // Eğer kullanıcının geçici şifresi varsa (/mustChangePassword), panel içeriği açılamaz; şifre değişimine yönlendirilir
        if (authData.mustChangePassword) {
          setActiveEmployeeId('')
          setCurrentEmployeeId('')
          setServerEmployee(null)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('social-art-base:active-employee-id')
            window.localStorage.removeItem('social-art-base:credentials')
            window.localStorage.removeItem('ajans_user')
            window.localStorage.removeItem('socialart_user')
          }
          setIsLoadingAuth(false)
          router.replace('/login')
          return
        }

        if (authData.principalType === 'admin' || authData.isAdmin) {
          const adminId = String(authData.admin?.id || 'admin')
          const adminName = authData.admin?.displayName || 'Sistem Yöneticisi'
          const adminUsername = authData.admin?.username || 'admin'

          setPrincipal({
            principalType: 'admin',
            isDedicatedAdmin: true,
            adminId,
            employeeId: null,
            authResolved: true,
          })

          setServerEmployee({
            id: adminId,
            fullName: adminName,
            email: adminUsername,
            title: 'Sistem Yöneticisi',
            rolePackageId: 'operasyon-yonetimi',
            teamIds: ['merkezi-operasyon'],
            permissionOverrides: {
              'system.admin': true,
              'employees.manage': true,
              'employees.view': true,
              'team.manage': true,
              'operations.view': true,
              'brand.manage': true,
              'settings.manage': true,
            },
          })

          const list = await getStoredEmployees()
          setEmployees(list)
          setCurrentEmployeeId(adminId)
          setActiveEmployeeId(adminId)

          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('social-art-base:credentials')
            const userObj = {
              id: adminId,
              name: adminName,
              role: 'Sistem Yöneticisi',
              email: adminUsername,
              class: 'A-Class',
              permissions: 'all',
              can_add_client: true,
              isAdmin: true,
              principalType: 'admin',
            }
            window.localStorage.setItem('ajans_user', JSON.stringify(userObj))
            window.localStorage.setItem('socialart_user', JSON.stringify(userObj))
          }
        } else if (authData.employee) {
          const authenticatedEmployeeId = String(authData.employee.id)

          setPrincipal({
            principalType: 'employee',
            isDedicatedAdmin: false,
            adminId: null,
            employeeId: authenticatedEmployeeId,
            authResolved: true,
          })

          setServerEmployee(authData.employee)

          const list = await getStoredEmployees()
          setEmployees(list)

          const operationalEmp = resolveOperationalEmployee(authenticatedEmployeeId, list)
          if (operationalEmp) {
            setCurrentEmployeeId(operationalEmp.id)
            setActiveEmployeeId(operationalEmp.id)
          } else {
            setCurrentEmployeeId(authenticatedEmployeeId)
            setActiveEmployeeId(authenticatedEmployeeId)
          }

          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('social-art-base:credentials')
            const userObj = {
              id: authData.employee.id,
              name: authData.employee.fullName,
              role: authData.employee.title || 'Ekip Üyesi',
              email: authData.employee.email,
              class: 'A-Class',
              permissions: 'all',
              can_add_client: true,
            }
            window.localStorage.setItem('ajans_user', JSON.stringify(userObj))
            window.localStorage.setItem('socialart_user', JSON.stringify(userObj))
          }
        } else {
          throw new Error('UNAUTHENTICATED')
        }

        // Her ayın 5'ine kadar oluşturulmayan dönemlerin otomatik marka şablonuyla başlatılması kontrolü
        try {
          const { autoApplyCycles } = await import('@/lib/operations/auto-apply-cycles')
          await autoApplyCycles()
        } catch (err) {
          console.warn('Auto-apply cycles notice:', err)
        }

        // Günlük raporu girmeyen çalışanları tespit edip "Eksik Rapor" olarak işleme kontrolü
        try {
          const { checkAndGenerateMissingReports } = await import('@/lib/operations/check-missing-reports')
          await checkAndGenerateMissingReports()
        } catch (err) {
          console.warn('Check missing reports notice:', err)
        }
      } catch (err) {
        // Oturumu doğrulanmayan kullanıcı asla panelde tutulamaz
        setPrincipal(ANONYMOUS_PRINCIPAL)
        setActiveEmployeeId('')
        setCurrentEmployeeId('')
        setServerEmployee(null)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('social-art-base:active-employee-id')
          window.localStorage.removeItem('social-art-base:credentials')
          window.localStorage.removeItem('ajans_user')
          window.localStorage.removeItem('socialart_user')
        }
        router.replace('/login')
      } finally {
        setIsLoadingAuth(false)
      }
    }
    loadData()
  }, [pathname, router])

  const activeEmployee = useMemo<Employee | undefined>(() => {
    if (!serverEmployee) return undefined

    const operationalEmp = resolveOperationalEmployee(serverEmployee.id, employees)

    return {
      id: operationalEmp ? operationalEmp.id : String(serverEmployee.id),
      db1EmployeeId: String(serverEmployee.id),
      fullName: serverEmployee.fullName,
      email: serverEmployee.email || (operationalEmp ? operationalEmp.email : ''),
      title: serverEmployee.title || (operationalEmp ? operationalEmp.title : 'Ekip Üyesi'),
      rolePackageId: serverEmployee.rolePackageId || (operationalEmp ? operationalEmp.rolePackageId : null),
      teamIds: operationalEmp?.teamIds?.length ? operationalEmp.teamIds : (serverEmployee.teamIds || []),
      employmentType: operationalEmp?.employmentType || serverEmployee.employmentType || null,
      permissionOverrides: serverEmployee.permissionOverrides || (operationalEmp ? operationalEmp.permissionOverrides : {}),
      employeeStatus: 'active',
      workLocationStatus: operationalEmp ? operationalEmp.workLocationStatus : (serverEmployee.workLocationStatus || 'office'),
      avatarUrl: operationalEmp?.avatarUrl || undefined,
      hasAdvancedCalendarAccess: operationalEmp?.hasAdvancedCalendarAccess || false,
      createdAt: operationalEmp?.createdAt || new Date().toISOString(),
      updatedAt: operationalEmp?.updatedAt || new Date().toISOString(),
    } as Employee
  }, [employees, serverEmployee])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth-logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      console.warn('Logout network error:', e)
    }

    setActiveEmployeeId('')
    setCurrentEmployeeId('')
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('social-art-base:active-employee-id')
      window.localStorage.removeItem('social-art-base:credentials')
      window.localStorage.removeItem('ajans_user')
      window.localStorage.removeItem('socialart_user')
    }
    toast.success('Çıkış Yapıldı', {
      description: 'Oturumunuz güvenli bir şekilde kapatıldı.',
    })
    router.push('/login')
  }

  const roleMenuItems = useMemo(() => {
    if (!activeEmployee && !principal.isDedicatedAdmin) return []

    const hasPermission = (key: string) => resolvePanelAuthority(principal, activeEmployee, key)

    const menuItems: { label: string; icon: string; href: string; isPlaceholder?: boolean }[] = [
      { label: 'Ana Panel', icon: '🏠', href: '/dashboard' },
    ]

    // Operations
    if (hasPermission('operations.view')) {
      menuItems.push({ label: 'Operasyonlar', icon: '⚡', href: '/operations' })
    }

    // Tasks (Görevler)
    if (hasPermission('task.manage') && activeEmployee?.rolePackageId !== 'kreatif-direktor' && activeEmployee?.rolePackageId !== 'kreatif-yonetim') {
      menuItems.push({ label: 'Görevler', icon: '✅', href: '/tasks' })
    }

    // Benim İşlerim
    menuItems.push({ label: 'Benim İşlerim', icon: '📝', href: '/my-work' })

    // Kişisel To-Do List
    menuItems.push({ label: 'To-Do List', icon: '📌', href: '/todo' })

    // Takvim (Calendar)
    const canAccessCalendar =
      activeEmployee?.hasAdvancedCalendarAccess === true ||
      hasPermission('calendar.view') ||
      hasPermission('calendar.manage') ||
      activeEmployee?.rolePackageId === 'operasyon-yonetimi' ||
      activeEmployee?.rolePackageId === 'kreatif-direktor' ||
      activeEmployee?.rolePackageId === 'kreatif-yonetim' ||
      activeEmployee?.permissionOverrides?.['calendar.view'] === true ||
      activeEmployee?.permissionOverrides?.['calendar.manage'] === true

    if (canAccessCalendar) {
      menuItems.push({ label: 'Takvim', icon: '📅', href: '/calendar' })
    }

    // Brands (Markalar)
    if (hasPermission('brand.manage')) {
      menuItems.push({ label: 'Markalar', icon: '🏢', href: '/brands' })
    }

    // Team (Ekip)
    if (
      hasPermission('team.manage') ||
      hasPermission('employees.manage') ||
      hasPermission('employees.view') ||
      hasPermission('system.admin')
    ) {
      menuItems.push({ label: 'Ekip Üyeleri', icon: '👥', href: '/employees' })
    }

    // Onay Merkezi
    if (hasPermission('approval.review')) {
      menuItems.push({ label: 'Onay Merkezi', icon: '✔', href: '/approvals' })
    }

    // CRM
    if (hasPermission('crm.view')) {
      menuItems.push({ label: 'CRM', icon: '📞', href: '/admin/crm' })
    }

    // KPI
    if (hasPermission('kpi.evaluate') && activeEmployee?.rolePackageId !== 'kreatif-yonetim' && activeEmployee?.rolePackageId !== 'kreatif-direktor') {
      menuItems.push({ label: 'KPI Değerlendirme', icon: '📈', href: '/kpi' })
    }
    if (hasPermission('kpi.view') && activeEmployee?.rolePackageId !== 'operasyon-yonetimi' && activeEmployee?.rolePackageId !== 'kreatif-yonetim' && activeEmployee?.rolePackageId !== 'kreatif-direktor') {
      menuItems.push({ label: 'Performans Karnem', icon: '🏅', href: '/my-kpi' })
    }

    // Tüm Raporlar (if reports.manage)
    if (hasPermission('reports.manage') && activeEmployee?.rolePackageId !== 'kreatif-direktor' && activeEmployee?.rolePackageId !== 'kreatif-yonetim') {
      menuItems.push({ label: 'Tüm Raporlar', icon: '📊', href: '/reports' })
    }

    // Ödeme Talepleri
    menuItems.push({ label: 'Ödeme Talepleri', icon: '💳', href: '/payments' })

    // Sistem Ayarları
    if (hasPermission('settings.manage')) {
      menuItems.push({ label: 'Sistem Ayarları', icon: '⚙', href: '/settings' })
    }

    return menuItems
  }, [activeEmployee, principal])

  const sharedMenuItems = useMemo(() => {
    if (!activeEmployee && !principal.isDedicatedAdmin) return []
    const list: { label: string; icon: string; href: string; isPlaceholder?: boolean }[] = [
      { label: 'DRİVE', icon: '📂', href: '/drive' },
      { label: 'Fikir Merkezi', icon: '💡', href: '/ideas' },
    ]

    // Standard Raporlar (if reports.manage is NOT present)
    if (!resolvePanelAuthority(principal, activeEmployee, 'reports.manage') && activeEmployee?.rolePackageId !== 'kreatif-direktor' && activeEmployee?.rolePackageId !== 'kreatif-yonetim') {
      list.push({ label: 'Raporlar', icon: '📊', href: '/reports' })
    }

    list.push({ label: 'Bildirimler', icon: '🔔', href: '/notifications' })
    list.push({ label: 'Profil', icon: '👤', href: '/profile' })
    list.push({ label: 'Çıkış Yap', icon: '🚪', href: '#logout' })

    return list
  }, [activeEmployee, principal])

  const handleMenuClick = (item: { label: string; href: string; isPlaceholder?: boolean }) => {
    setIsMobileMenuOpen(false)
    if (item.href === '#logout') {
      handleLogout()
    } else if (item.href === '/admin/crm' || item.href === '/crm') {
      if (typeof window !== 'undefined') {
        const host = window.location.hostname
        const port = window.location.port
        if (port === '3000' || port === '5173') {
          window.location.href = `${window.location.protocol}//${host}:5173/admin/crm`
        } else {
          window.location.href = '/admin/crm'
        }
      }
    } else if (item.isPlaceholder) {
      toast.info('Geliştirme Aşamasında', {
        description: `"${item.label}" alt sayfası MVP kapsamında şimdilik aktifleştirilmemiştir.`,
      })
    } else {
      router.push(item.href)
    }
  }

  // Breadcrumb mapping
  const breadcrumbs = useMemo(() => {
    const segments = [{ label: 'Social Art Base', href: '/dashboard' }]
    
    if (pathname === '/dashboard') {
      segments.push({ label: 'Çalışma Alanı', href: '/dashboard' })
    } else if (pathname === '/my-work') {
      segments.push({ label: 'Benim İşlerim', href: '/my-work' })
    } else if (pathname === '/todo') {
      segments.push({ label: 'To-Do List', href: '/todo' })
    } else if (pathname === '/approvals') {
      segments.push({ label: 'Onay Merkezi', href: '/approvals' })
    } else if (pathname === '/notifications') {
      segments.push({ label: 'Bildirimler', href: '/notifications' })
    } else if (pathname === '/operations') {
      segments.push({ label: 'Operasyonlar', href: '/operations' })
    } else if (pathname === '/ideas') {
      segments.push({ label: 'Fikir Merkezi', href: '/ideas' })
    } else if (pathname === '/calendar') {
      segments.push({ label: 'Takvim', href: '/calendar' })
    } else if (pathname === '/reports') {
      segments.push({ label: 'Raporlar', href: '/reports' })
    } else if (pathname === '/profile') {
      segments.push({ label: 'Profilim', href: '/profile' })
    } else if (pathname === '/brands') {
      segments.push({ label: 'Markalar', href: '/brands' })
    } else if (pathname?.startsWith('/brands/new')) {
      segments.push({ label: 'Markalar', href: '/brands' }, { label: 'Yeni Marka', href: '/brands/new' })
    } else if (pathname?.startsWith('/brands/')) {
      segments.push({ label: 'Markalar', href: '/brands' }, { label: 'Marka Detayı', href: pathname })
    } else if (pathname === '/employees') {
      segments.push({ label: 'Ekip Üyeleri', href: '/employees' })
    } else if (pathname?.startsWith('/employees/new')) {
      segments.push({ label: 'Ekip Üyeleri', href: '/employees' }, { label: 'Yeni Çalışan', href: '/employees/new' })
    } else if (pathname?.startsWith('/employees/')) {
      segments.push({ label: 'Ekip Üyeleri', href: '/employees' }, { label: 'Profil Detayı', href: pathname })
    } else if (pathname === '/settings') {
      segments.push({ label: 'Sistem Ayarları', href: '/settings' })
    }

    return segments
  }, [pathname])

  if (isAuthPage) {
    return <div className="animate-in fade-in duration-300">{children}</div>
  }

  if (isLoadingAuth || !currentEmployeeId || !activeEmployee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-400 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="text-xs font-semibold tracking-wider">Yetki ve Oturum Doğrulanıyor...</span>
      </div>
    )
  }

  return (
    <WorkspaceAuthContext.Provider
      value={{
        principal,
        activeEmployee: activeEmployee || null,
        serverEmployee,
        isLoadingAuth,
      }}
    >
      <div className="flex min-h-screen w-full bg-gradient-to-br from-[#09090b] via-[#111115] to-[#1a112d] text-neutral-100 antialiased">
      {/* 1. Masaüstü Sidebar */}
      <aside className="w-64 border-r border-neutral-900/60 bg-neutral-950/20 backdrop-blur-md hidden lg:flex flex-col justify-between shrink-0 p-5 min-h-screen sticky top-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 pb-2 border-b border-neutral-900/40">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-650 flex items-center justify-center font-black text-white text-xs shadow-md">
              SA
            </div>
            <div className="leading-none">
              <span className="font-extrabold text-sm tracking-tight block">Social Art</span>
              <span className="text-[9px] text-muted-foreground font-bold tracking-widest block uppercase">Base Workspace</span>
            </div>
          </div>

          {/* Menü Listesi */}
          <nav className="space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-2 block mb-1">Workspace Menüsü</span>
              {roleMenuItems.map((item, idx) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleMenuClick(item)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 focus:outline-none text-left',
                      isActive
                        ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-neutral-900/50 border border-transparent'
                    )}
                  >
                    <span className="text-sm shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-1 pt-2 border-t border-neutral-900/40">
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-2 block mb-1">Ortak</span>
              {sharedMenuItems.map((item, idx) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleMenuClick(item)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 focus:outline-none text-left',
                      isActive
                        ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-neutral-900/50 border border-transparent'
                    )}
                  >
                    <span className="text-sm shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

      </aside>

      {/* 2. Mobil Topbar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b border-neutral-900/60 bg-neutral-950/20 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-650 flex items-center justify-center font-black text-white text-xs">
              SA
            </div>
            <span className="font-extrabold text-xs tracking-tight">Social Art Base</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 rounded-lg border border-neutral-800 bg-card/25"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobil Yan Menü Çekmecesi */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-[#09090b] z-[9999] p-6 space-y-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Menü</span>
                <nav className="space-y-1">
                  {roleMenuItems.map((item, idx) => {
                    const isActive = pathname === item.href
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleMenuClick(item)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left border border-transparent',
                          isActive
                            ? 'bg-purple-600/10 text-purple-400 border-purple-500/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-neutral-900/50'
                        )}
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div className="space-y-1 pt-3 border-t border-neutral-900/40">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Ortak</span>
                <nav className="space-y-1">
                  {sharedMenuItems.map((item, idx) => {
                    const isActive = pathname === item.href
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleMenuClick(item)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left border border-transparent',
                          isActive
                            ? 'bg-purple-600/10 text-purple-400 border-purple-500/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-neutral-900/50'
                        )}
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

          </div>
        )}

        {/* 3. Ana İçerik ve Breadcrumbs */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Breadcrumb Satırı */}
          {breadcrumbs.length > 1 && (
            <nav className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground tracking-wide uppercase">
              {breadcrumbs.map((seg, idx) => {
                const isLast = idx === breadcrumbs.length - 1
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="h-3 w-3 text-neutral-600 shrink-0" />}
                    {isLast ? (
                      <span className="text-purple-400">{seg.label}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => router.push(seg.href)}
                        className="hover:text-foreground transition-colors"
                      >
                        {seg.label}
                      </button>
                    )}
                  </div>
                )
              })}
            </nav>
          )}

          {/* Sayfa İçeriği */}
          <div className="animate-in fade-in duration-300">{children}</div>
        </main>
      </div>
    </div>
    </WorkspaceAuthContext.Provider>
  )
}
