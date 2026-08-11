'use client'

import { useEffect, useState, useMemo } from 'react'
import { getActiveEmployeeId, getStoredEmployees } from '@/lib/repositories/EmployeeRepository'
import { Employee } from '@/features/employees/types/employee-types'
import { PersonalTodo, TodoPriority, TodoCategory } from '../types/todo-types'
import { TodoRepository } from '@/lib/repositories/TodoRepository'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCheck,
  Tag,
  AlertCircle,
  BookOpen,
  Filter
} from 'lucide-react'

const PRIORITY_CONFIG: Record<TodoPriority, { label: string; bg: string; text: string; border: string }> = {
  high: { label: '🔥 Yüksek / Acil', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  medium: { label: '⚡ Normal', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  low: { label: '🌱 Düşük', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' }
}

const CATEGORY_CONFIG: Record<TodoCategory, { label: string; icon: string; bg: string; text: string }> = {
  meeting: { label: '🤝 Toplantı', icon: '🤝', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  ad_campaign: { label: '📢 Reklam & Kampanya', icon: '📢', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  presentation: { label: '📊 Sunum & Rapor', icon: '📊', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  personal_note: { label: '💡 Kişisel Not', icon: '💡', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  general: { label: '📝 Genel İş', icon: '📝', bg: 'bg-slate-500/10', text: 'text-slate-400' }
}

export function TodoPage() {
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [todos, setTodos] = useState<PersonalTodo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Form State
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'high'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Form Inputs
  const [quickTitle, setQuickTitle] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newPriority, setNewPriority] = useState<TodoPriority>('medium')
  const [newCategory, setNewCategory] = useState<TodoCategory>('general')
  const [showAddModal, setShowAddModal] = useState(false)

  // Editing State
  const [editingTodo, setEditingTodo] = useState<PersonalTodo | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const employees = await getStoredEmployees()
        const activeId = getActiveEmployeeId()
        const current = employees.find((e) => e.id === activeId) || employees[0] || null
        setActiveEmployee(current)

        if (current) {
          const userTodos = await TodoRepository.getTodos(current.id)
          setTodos(userTodos)
        }
      } catch (err) {
        console.error('Todo initial load error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // Save changes wrapper
  const persistTodos = async (updatedList: PersonalTodo[]) => {
    setTodos(updatedList)
    if (activeEmployee) {
      await TodoRepository.saveTodos(activeEmployee.id, updatedList)
    }
  }

  // Handle Quick Add
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim() || !activeEmployee) return

    const newTodo: PersonalTodo = {
      id: `todo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId: activeEmployee.id,
      title: quickTitle.trim(),
      priority: 'medium',
      category: 'general',
      isCompleted: false,
      createdAt: new Date().toISOString()
    }

    const updated = [newTodo, ...todos]
    await persistTodos(updated)
    setQuickTitle('')
    toast.success('Yapılacak iş eklendi! ✨')
  }

  // Handle Full Form Add
  const handleFullAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !activeEmployee) return

    const newTodo: PersonalTodo = {
      id: `todo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId: activeEmployee.id,
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      dueDate: newDueDate || undefined,
      priority: newPriority,
      category: newCategory,
      isCompleted: false,
      createdAt: new Date().toISOString()
    }

    const updated = [newTodo, ...todos]
    await persistTodos(updated)

    // Reset Form
    setNewTitle('')
    setNewNotes('')
    setNewDueDate('')
    setNewPriority('medium')
    setNewCategory('general')
    setShowAddModal(false)

    toast.success('Yeni yapılacak iş listenize eklendi! 📌')
  }

  // Toggle Complete
  const toggleComplete = async (id: string) => {
    const updated = todos.map((t) => {
      if (t.id === id) {
        const nextState = !t.isCompleted
        return {
          ...t,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined
        }
      }
      return t
    })

    const target = todos.find(t => t.id === id)
    await persistTodos(updated)

    if (target) {
      if (!target.isCompleted) {
        toast.success(`" ${target.title} " tamamlandı! 🎉`)
      } else {
        toast.info(`" ${target.title} " tekrar bekleyenlere alındı.`)
      }
    }
  }

  // Delete Todo
  const handleDelete = async (id: string) => {
    const updated = todos.filter((t) => t.id !== id)
    setTodos(updated)
    if (activeEmployee) {
      await TodoRepository.deleteTodo(activeEmployee.id, id, updated)
    }
    toast.success('Görev silindi.')
  }

  // Save Edited Todo
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTodo) return

    const updated = todos.map((t) => (t.id === editingTodo.id ? editingTodo : t))
    await persistTodos(updated)
    setEditingTodo(null)
    toast.success('Görev güncellendi! ✏️')
  }

  // Clear Completed
  const handleClearCompleted = async () => {
    const activeOnly = todos.filter((t) => !t.isCompleted)
    await persistTodos(activeOnly)
    toast.success('Tamamlanan görevler temizlendi!')
  }

  // Filtered Todos
  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      // Tab filter
      if (activeTab === 'pending' && t.isCompleted) return false
      if (activeTab === 'completed' && !t.isCompleted) return false
      if (activeTab === 'high' && t.priority !== 'high') return false

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const titleMatch = t.title.toLowerCase().includes(q)
        const notesMatch = (t.notes || '').toLowerCase().includes(q)
        if (!titleMatch && !notesMatch) return false
      }

      return true
    })
  }, [todos, activeTab, selectedCategory, searchQuery])

  // Stats
  const totalCount = todos.length
  const completedCount = todos.filter((t) => t.isCompleted).length
  const pendingCount = totalCount - completedCount
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Kişisel To-Do listesi yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* --- HERO / MOTTO BANNER --- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Kişisel Not & İş Takip Defteri
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Söz Uçar, Yazı Kalır.</span>
              <BookOpen className="w-8 h-8 text-indigo-400 hidden sm:inline-block" />
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Toplantı notlarınızı, gün içi yapılması gereken reklam ve sunum işlerinizi veya aklınıza gelen herhangi bir fikri buraya serbestçe not alabilirsiniz.
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Gizlilik Güvencesi:</strong> Bu liste sadece <u>{activeEmployee?.name || 'Size'}</u> özeldir. Diğer ekip üyeleri göremez.
              </span>
            </div>
          </div>

          {/* Quick Stat Pill Box */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[220px]">
            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Tamamlanma Oranı</span>
                <span className="text-indigo-400 font-bold">{completionPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>{pendingCount} Bekliyor</span>
                <span className="text-emerald-400">{completedCount} Bitti</span>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Detaylı Görev / Not Ekle
            </button>
          </div>
        </div>
      </div>

      {/* --- QUICK INPUT FORM --- */}
      <form onSubmit={handleQuickAdd} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Aklına bir şey mi geldi? 'MioCasa toplantısı hazırlığı', 'X reklamını aç' vb. yazıp Enter'a bas..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-3.5 pl-4 pr-28 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="absolute right-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Hızlı Ekle
          </button>
        </div>
      </form>

      {/* --- STAT METRIC CARDS --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-slate-400 font-medium">Tüm Görevler</p>
          <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeTab === 'pending'
              ? 'bg-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Bekleyenler
          </p>
          <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
        </div>

        <div
          onClick={() => setActiveTab('completed')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeTab === 'completed'
              ? 'bg-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Tamamlananlar
          </p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{completedCount}</p>
        </div>

        <div
          onClick={() => setActiveTab('high')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeTab === 'high'
              ? 'bg-slate-900 border-red-500/50 shadow-md ring-1 ring-red-500/20'
              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Acil / Yüksek
          </p>
          <p className="text-2xl font-black text-red-400 mt-1">
            {todos.filter((t) => t.priority === 'high' && !t.isCompleted).length}
          </p>
        </div>
      </div>

      {/* --- FILTER & SEARCH TOOLBAR --- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Tümü ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Bekleyenler ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Tamamlananlar ({completedCount})
          </button>
          <button
            onClick={() => setActiveTab('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'high' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🔥 Acil / Yüksek
          </button>
        </div>

        {/* Category & Search Controls */}
        <div className="flex items-center gap-2">
          {/* Category dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="meeting">🤝 Toplantı</option>
              <option value="ad_campaign">📢 Reklam & Kampanya</option>
              <option value="presentation">📊 Sunum & Rapor</option>
              <option value="personal_note">💡 Kişisel Not</option>
              <option value="general">📝 Genel İş</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ara..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              title="Tamamlananları Temizle"
              className="text-xs text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all border border-slate-800 hover:border-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* --- TODO LIST ITEMS --- */}
      <div className="space-y-2.5">
        {filteredTodos.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              {searchQuery ? 'Aramaya Uygun Görev Bulunamadı' : 'Listeniz Boş'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchQuery
                ? 'Farklı bir kelime aramayı deneyin.'
                : 'Yeni bir kişisel iş veya not ekleyerek listenizi doldurmaya başlayabilirsiniz.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                İlk Görevinizi Ekleyin
              </button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const prio = PRIORITY_CONFIG[todo.priority]
            const cat = CATEGORY_CONFIG[todo.category]

            return (
              <div
                key={todo.id}
                className={`group relative flex items-start justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${
                  todo.isCompleted
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5'
                }`}
              >
                {/* Left side: Checkbox & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleComplete(todo.id)}
                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors flex-shrink-0"
                  >
                    {todo.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold transition-all ${
                          todo.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {todo.title}
                      </h4>

                      {/* Priority Tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prio.bg} ${prio.text} ${prio.border}`}>
                        {prio.label}
                      </span>

                      {/* Category Tag */}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                        {cat.label}
                      </span>
                    </div>

                    {/* Notes Detail */}
                    {todo.notes && (
                      <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 mt-1">
                        {todo.notes}
                      </p>
                    )}

                    {/* Meta info bar */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                      {todo.dueDate && (
                        <span className="flex items-center gap-1 text-indigo-400 font-medium">
                          <Calendar className="w-3 h-3" />
                          {todo.dueDate}
                        </span>
                      )}
                      <span>
                        Eklenme: {new Date(todo.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                      </span>
                      {todo.completedAt && (
                        <span className="text-emerald-400">
                          Tamamlandı: {new Date(todo.completedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingTodo(todo)}
                    title="Düzenle"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    title="Sil"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* --- ADD DETAILED TODO MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Detaylı Kişisel Görev / Not Ekle
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFullAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Görev / Not Başlığı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: MioCasa toplantısı veya X markasına reklam açılacak"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Özel Notlar & Hatırlatmalar (İsteğe Bağlı)
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Aklınıza gelen detaylar, Zoom linki veya sunum maddeleri..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hedef Zaman / Son Tarih
                  </label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="Örn: Bugün 15:00 veya Yarın"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Öncelik Seviyesi
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="high">🔥 Yüksek / Acil</option>
                    <option value="medium">⚡ Normal</option>
                    <option value="low">🌱 Düşük</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TodoCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="general">📝 Genel İş</option>
                  <option value="meeting">🤝 Toplantı</option>
                  <option value="ad_campaign">📢 Reklam & Kampanya</option>
                  <option value="presentation">📊 Sunum & Rapor</option>
                  <option value="personal_note">💡 Kişisel Not</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  Görev Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT TODO MODAL --- */}
      {editingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Görevi Düzenle</h3>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Başlık</label>
                <input
                  type="text"
                  required
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notlar</label>
                <textarea
                  rows={3}
                  value={editingTodo.notes || ''}
                  onChange={(e) => setEditingTodo({ ...editingTodo, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Hedef Tarih</label>
                  <input
                    type="text"
                    value={editingTodo.dueDate || ''}
                    onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Öncelik</label>
                  <select
                    value={editingTodo.priority}
                    onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value as TodoPriority })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="high">🔥 Yüksek / Acil</option>
                    <option value="medium">⚡ Normal</option>
                    <option value="low">🌱 Düşük</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
