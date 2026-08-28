'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Brand, Employee } from '@/types/domain'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { usePrincipal } from '@/lib/permissions/panel-authority'
import { getStoredIdeas, createIdea, updateIdea, toggleVoteIdea, deleteIdea, type Idea } from '@/lib/storage/local-ideas-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Lightbulb,
  Plus,
  ThumbsUp,
  Briefcase,
  Archive,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Sparkles,
  Trash2,
} from 'lucide-react'

export function IdeasPage() {
  const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()
  
  // Data States
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [activeEmployeeId, setActiveEmployeeId] = useState<string>('')

  // Form States for New/Edit Idea
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Sosyal Medya')
  const [brandId, setBrandId] = useState('')
  const [impact, setImpact] = useState<'low' | 'medium' | 'high'>('medium')

  // Filter States
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterBrand, setFilterBrand] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterImpact, setFilterImpact] = useState('all')
  const [sortByVotes, setSortByVotes] = useState(false)

  useEffect(() => {
    async function loadData() {
      const storedIdeas = await getStoredIdeas()
      setIdeas(storedIdeas)
      const storedBrands = await getStoredBrands()
      setBrands(storedBrands)
      const emps = await getStoredEmployees()
      setEmployees(emps)
      
      if (contextActiveEmployee) {
        setActiveEmployeeId(contextActiveEmployee.id)
      } else {
        const activeId = getActiveEmployeeId()
        if (activeId) {
          setActiveEmployeeId(activeId)
        } else if (emps.length > 0) {
          setActiveEmployeeId(emps[0].id)
        }
      }
    }
    loadData()
  }, [contextActiveEmployee])

  const activeEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    return employees.find((e) => e.id === activeEmployeeId)
  }, [contextActiveEmployee, employees, activeEmployeeId])

  const getBrandName = (id: string) => {
    return brands.find((b) => b.id === id)?.name || 'Genel'
  }

  const getEmployeeName = (id: string) => {
    return employees.find((e) => e.id === id)?.fullName || 'Bilinmeyen'
  }

  const getEmployeeAvatar = (id: string) => {
    return employees.find((e) => e.id === id)?.avatarUrl || ''
  }

  // KPIs
  const kpis = useMemo(() => {
    const total = ideas.length
    const pending = ideas.filter((i) => i.status === 'pending').length
    const converted = ideas.filter((i) => i.status === 'converted').length
    
    let topIdea = null
    if (ideas.length > 0) {
      topIdea = [...ideas].sort((a, b) => b.votes - a.votes)[0]
    }
    
    return {
      total,
      pending,
      converted,
      mostVoted: topIdea ? `${topIdea.votes} Oy (${topIdea.title.slice(0, 15)}...)` : '0 Oy',
    }
  }, [ideas])

  // Filters logic
  const filteredIdeas = useMemo(() => {
    let result = ideas.filter((idea) => {
      if (filterCategory !== 'all' && idea.category !== filterCategory) return false
      if (filterBrand !== 'all' && idea.brandId !== filterBrand) return false
      if (filterStatus !== 'all' && idea.status !== filterStatus) return false
      if (filterImpact !== 'all' && idea.impact !== filterImpact) return false
      return true
    })
    if (sortByVotes) result = [...result].sort((a, b) => b.votes - a.votes)
    return result
  }, [ideas, filterCategory, filterBrand, filterStatus, filterImpact, sortByVotes])

  const handleKpiClick = (type: 'all' | 'pending' | 'converted' | 'top') => {
    setSortByVotes(false)
    if (type === 'all') {
      setFilterStatus('all')
    } else if (type === 'pending') {
      setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')
    } else if (type === 'converted') {
      setFilterStatus(filterStatus === 'converted' ? 'all' : 'converted')
    } else if (type === 'top') {
      setFilterStatus('all')
      setSortByVotes((prev) => !prev)
    }
  }

  // Actions
  const handleVote = async (id: string) => {
    if (!activeEmployeeId) return
    const updated = await toggleVoteIdea(id, activeEmployeeId)
    if (updated) {
      const storedIdeas = await getStoredIdeas()
      setIdeas(storedIdeas)
      toast.success('Oyunuz kaydedildi.')
    }
  }

  const handleOpenCreateModal = () => {
    setEditingIdeaId(null)
    setTitle('')
    setDescription('')
    setCategory('Sosyal Medya')
    setBrandId(brands[0]?.id || '')
    setImpact('medium')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (idea: Idea) => {
    setEditingIdeaId(idea.id)
    setTitle(idea.title)
    setDescription(idea.description)
    setCategory(idea.category)
    setBrandId(idea.brandId)
    setImpact(idea.impact)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Lütfen başlık ve açıklama alanlarını doldurun.')
      return
    }

    if (editingIdeaId) {
      await updateIdea(editingIdeaId, {
        title,
        description,
        category,
        brandId,
        impact,
      })
      toast.success('Fikir güncellendi.')
    } else {
      await createIdea({
        title,
        description,
        category,
        brandId,
        creatorId: activeEmployeeId,
        impact,
      })
      toast.success('Yeni fikriniz başarıyla oluşturuldu!')
    }

    const storedIdeas = await getStoredIdeas()
    setIdeas(storedIdeas)
    setIsModalOpen(false)
  }

  const handleArchive = async (id: string) => {
    await updateIdea(id, { status: 'archived' })
    const storedIdeas = await getStoredIdeas()
    setIdeas(storedIdeas)
    toast.success('Fikir arşivlendi.')
  }

  const handleConvertToTask = async (id: string) => {
    await updateIdea(id, { status: 'converted' })
    const storedIdeas = await getStoredIdeas()
    setIdeas(storedIdeas)
    toast.info('İş Akışına Dönüştürüldü', {
      description: 'Fikir başarıyla operasyon taslağına dönüştürüldü. İş akışı oluşturma sonraki fazlarda entegre edilecektir.',
    })
  }

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteIdea(id)
      const storedIdeas = await getStoredIdeas()
      setIdeas(storedIdeas)
      toast.success('Fikir başarıyla silindi.')
    } catch (err: any) {
      toast.error('Fikir silinemedi', { description: err.message })
    }
  }

  const isManagerOrAdmin = useMemo(() => {
    if (!activeEmployee) return false
    return (
      activeEmployee.rolePackageId === 'operasyon-yonetimi' ||
      activeEmployee.rolePackageId === 'kreatif-yonetim' ||
      activeEmployee.teamIds.includes('merkezi-operasyon') ||
      activeEmployee.permissionOverrides['system.admin'] === true
    )
  }, [activeEmployee])

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lightbulb className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Fikir Merkezi</h1>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            Ekibinizin ürettiği tüm fikirleri görün, oylayın, tartışın ve iş akışlarına dönüştürün.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Fikir Paylaş
        </Button>
      </div>

      {/* KPI Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={() => handleKpiClick('all')}
          className={cn(
            'rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md transition-all cursor-pointer select-none',
            filterStatus === 'all' && !sortByVotes
              ? 'border-amber-500/40 ring-1 ring-amber-500/20 bg-amber-500/[0.03]'
              : 'hover:border-neutral-700'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Toplam Fikir</span>
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Ekip tarafından sunulan öneriler</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleKpiClick('pending')}
          className={cn(
            'rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md transition-all cursor-pointer select-none',
            filterStatus === 'pending'
              ? 'border-blue-500/40 ring-1 ring-blue-500/20 bg-blue-500/[0.03]'
              : 'hover:border-neutral-700'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bekleyen Değerlendirme</span>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{kpis.pending}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Karar bekleyen fikir havuzu</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleKpiClick('converted')}
          className={cn(
            'rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md transition-all cursor-pointer select-none',
            filterStatus === 'converted'
              ? 'border-purple-500/40 ring-1 ring-purple-500/20 bg-purple-500/[0.03]'
              : 'hover:border-neutral-700'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Göreve Dönüşen</span>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{kpis.converted}</div>
            <p className="text-[9px] text-muted-foreground mt-1">İş akışına dönüştürülen fikirler</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleKpiClick('top')}
          className={cn(
            'rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md transition-all cursor-pointer select-none',
            sortByVotes
              ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 bg-emerald-500/[0.03]'
              : 'hover:border-neutral-700'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">En Çok Oy Alan</span>
            <ThumbsUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-400 truncate max-w-full">{kpis.mostVoted}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Ekibin en çok beğendiği öneri</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreleme Paneli */}
      <div className="rounded-2xl border border-neutral-900 bg-card/15 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mr-2">
          <Filter className="h-4 w-4" /> Filtrele:
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-8 rounded-lg bg-neutral-900 border border-neutral-850 px-2.5 text-xs text-neutral-200"
        >
          <option value="all">Tüm Kategoriler</option>
          <option value="Sosyal Medya">Sosyal Medya</option>
          <option value="Video/Kurgu">Video/Kurgu</option>
          <option value="Grafik Tasarım">Grafik Tasarım</option>
          <option value="Kampanya">Kampanya</option>
        </select>

        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="h-8 rounded-lg bg-neutral-900 border border-neutral-850 px-2.5 text-xs text-neutral-200"
        >
          <option value="all">Tüm Markalar</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-8 rounded-lg bg-neutral-900 border border-neutral-850 px-2.5 text-xs text-neutral-200"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Değerlendirmede</option>
          <option value="converted">Göreve Dönüştü</option>
          <option value="archived">Arşivlendi</option>
        </select>

        <select
          value={filterImpact}
          onChange={(e) => setFilterImpact(e.target.value)}
          className="h-8 rounded-lg bg-neutral-900 border border-neutral-850 px-2.5 text-xs text-neutral-200"
        >
          <option value="all">Tüm Etki Seviyeleri</option>
          <option value="high">Yüksek Etki</option>
          <option value="medium">Orta Etki</option>
          <option value="low">Düşük Etki</option>
        </select>
      </div>

      {/* Fikir Kartları Izgarası */}
      {filteredIdeas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredIdeas.map((idea) => {
            const hasVoted = idea.votedEmployeeIds.includes(activeEmployeeId)
            const isCreator = idea.creatorId === activeEmployeeId
            const canEdit = isCreator

            return (
              <div
                key={idea.id}
                className="rounded-2xl border border-neutral-900 bg-card/25 p-5 flex flex-col justify-between gap-4 hover:border-neutral-800 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className="bg-neutral-900 text-neutral-300 border border-neutral-850 text-[8px] font-bold py-0">
                          {idea.category}
                        </Badge>
                        <Badge className="bg-purple-950/20 text-purple-400 border border-purple-500/25 text-[8px] font-bold py-0">
                          {getBrandName(idea.brandId)}
                        </Badge>
                        <Badge
                          className={`text-[8px] font-bold py-0 ${
                            idea.impact === 'high'
                              ? 'bg-red-950/20 text-red-400 border border-red-500/20'
                              : idea.impact === 'medium'
                              ? 'bg-amber-950/20 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {idea.impact === 'high' ? 'Yüksek Etki' : idea.impact === 'medium' ? 'Orta Etki' : 'Düşük Etki'}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold text-foreground mt-1.5">{idea.title}</h3>
                    </div>
                    
                    <Badge
                      className={`text-[8px] font-bold py-0.5 rounded-lg ${
                        idea.status === 'converted'
                          ? 'bg-purple-600 text-white'
                          : idea.status === 'archived'
                          ? 'bg-neutral-800 text-neutral-400'
                          : 'bg-amber-600/20 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {idea.status === 'converted' ? 'İş Yapıldı' : idea.status === 'archived' ? 'Arşiv' : 'Karar Bekliyor'}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{idea.description}</p>
                </div>

                <div className="border-t border-neutral-900/60 pt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] mt-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-purple-600/20 border border-purple-500/25 flex items-center justify-center text-[8px] font-bold text-purple-400">
                      {getEmployeeName(idea.creatorId).slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-neutral-400 font-semibold">{getEmployeeName(idea.creatorId)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Oy Verme Butonu */}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleVote(idea.id)}
                      className={`h-7 px-2.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 border transition-all ${
                        hasVoted
                          ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
                          : 'border-neutral-850 hover:bg-neutral-900 text-neutral-400 hover:text-foreground'
                      }`}
                    >
                      <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'fill-current' : ''}`} />
                      {idea.votes} Oy
                    </Button>

                    {/* Aksiyon Butonları */}
                    {canEdit && idea.status === 'pending' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditModal(idea)}
                        className="h-7 w-7 rounded-lg hover:bg-neutral-900 border border-neutral-850 text-neutral-400"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    {/* Fikri Geri Al / Sil (Sahibine veya Yöneticiye açık) */}
                    {(isManagerOrAdmin || isCreator) && idea.status === 'pending' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="h-7 w-7 rounded-lg hover:bg-red-500/10 hover:text-red-500 border border-neutral-850 text-neutral-400 transition-colors"
                        title={isCreator ? "Fikrimi Geri Al / Sil" : "Fikri Sil"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    {/* Sadece Yöneticilere Özel Aksiyonlar (Arşivle / Göreve Dönüştür) */}
                    {isManagerOrAdmin && idea.status === 'pending' && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleArchive(idea.id)}
                          className="h-7 w-7 rounded-lg hover:bg-amber-500/10 hover:text-amber-400 border border-neutral-850 text-neutral-400 transition-colors"
                          title="Fikri Arşivle"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleConvertToTask(idea.id)}
                          className="h-7 px-2.5 rounded-lg text-[9px] font-bold hover:bg-neutral-900 border border-purple-500/20 text-purple-400"
                        >
                          <Briefcase className="h-3.5 w-3.5 mr-1" />
                          Göreve Dönüştür
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-900 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
          Filtrelere uygun fikir bulunamadı. İlk fikri siz ekleyin!
        </div>
      )}

      {/* Yeni Fikir / Düzenleme Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg rounded-2xl border bg-neutral-900 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              {editingIdeaId ? 'Fikri Düzenle' : 'Yeni Fikir Paylaş'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Fikir Başlığı</Label>
                <Input
                  id="title"
                  placeholder="Fikrinize çekici bir başlık yazın..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Fikir Detayı / Açıklama</Label>
                <textarea
                  id="desc"
                  rows={4}
                  placeholder="Fikrinizi, amacını ve nasıl yapılacağını detaylıca açıklayın..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Kategori</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 text-xs text-neutral-200"
                  >
                    <option value="Sosyal Medya">Sosyal Medya</option>
                    <option value="Video/Kurgu">Video/Kurgu</option>
                    <option value="Grafik Tasarım">Grafik Tasarım</option>
                    <option value="Kampanya">Kampanya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brand">İlişkili Marka</Label>
                  <select
                    id="brand"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="h-9 w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 text-xs text-neutral-200"
                  >
                    <option value="">Genel / Marka Yok</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tahmini Etki Potansiyeli</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setImpact(level)}
                      className={`h-8 rounded-xl text-xs font-semibold border capitalize transition-all ${
                        impact === level
                          ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                          : 'bg-neutral-950/40 border-neutral-850 text-neutral-400 hover:text-foreground'
                      }`}
                    >
                      {level === 'low' ? 'Düşük' : level === 'medium' ? 'Orta' : 'Yüksek'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 text-xs rounded-xl font-semibold border-neutral-850"
                >
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md"
                >
                  {editingIdeaId ? 'Kaydet' : 'Yayınla'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
