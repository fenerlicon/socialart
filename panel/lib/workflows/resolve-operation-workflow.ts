import type { OperationPlanItem } from '@/types/domain'
import { OPERATION_TEMPLATES } from '@/features/workflows/data/operation-template-seeds'

/**
 * Bir operasyon plan kalemi (OperationPlanItem) için en uygun workflowTemplateId'yi çözer.
 * Kalemin başlığına (title) ve tipine (type) göre eşleştirme yapar.
 */
export function resolveOperationWorkflow(item: Partial<OperationPlanItem>): string | undefined {
  if (!item.title) return undefined

  const titleLower = item.title.toLowerCase().trim()

  // 1. Doğrudan veya kelime bazlı eşleştirme
  if (titleLower.includes('reel')) {
    return 'reel-workflow'
  }
  if (titleLower.includes('story') || titleLower.includes('hikaye')) {
    return 'story-workflow'
  }
  if (titleLower.includes('post') || titleLower.includes('gönderi')) {
    return 'post-workflow'
  }
  if (titleLower.includes('google')) {
    return 'google-ads-workflow'
  }
  if (titleLower.includes('meta') || titleLower.includes('facebook') || titleLower.includes('instagram reklam') || titleLower.includes('reklam')) {
    return 'meta-reklam-workflow'
  }
  if (titleLower.includes('seo')) {
    return 'seo-workflow'
  }

  // 2. Şablon listesi üzerinden arama
  const matchedTemplate = OPERATION_TEMPLATES.find((t) => {
    const templateNameLower = t.title.toLowerCase()
    return titleLower.includes(templateNameLower) || templateNameLower.includes(titleLower)
  })

  if (matchedTemplate) {
    return matchedTemplate.workflowTemplateId
  }

  // 3. Tip bazlı geri çekilme (fallback)
  if (item.type === 'content') {
    return 'post-workflow'
  }
  if (item.type === 'advertising') {
    return 'meta-reklam-workflow'
  }
  if (item.type === 'analysis') {
    return 'seo-workflow'
  }

  return undefined
}
