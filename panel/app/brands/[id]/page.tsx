import BrandDetailClient from './BrandDetailClient'

export function generateStaticParams() {
  return [{ id: 'temp' }]
}

export default function BrandDetailPage() {
  return <BrandDetailClient />
}
