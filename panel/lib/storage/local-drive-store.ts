import type { BrandDriveLinks } from '@/types/domain'

const STORAGE_KEY = 'social-art-drive-links'

export async function getDriveLinks(): Promise<BrandDriveLinks[]> {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function getDriveLinksByBrand(brandId: string): Promise<BrandDriveLinks | undefined> {
  const all = await getDriveLinks()
  return all.find(x => x.brandId === brandId)
}

export async function saveDriveLinks(links: BrandDriveLinks): Promise<BrandDriveLinks[]> {
  const all = await getDriveLinks()
  const idx = all.findIndex(x => x.brandId === links.brandId)
  if (idx !== -1) {
    all[idx] = links
  } else {
    all.push(links)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return all
}
