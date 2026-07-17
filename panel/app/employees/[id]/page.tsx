import EmployeeDetailClient from './EmployeeDetailClient'

export async function generateStaticParams() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase.from('employees').select('id')
    const ids = (data || []).map((row: { id: string }) => ({ id: row.id }))
    return [{ id: 'temp' }, ...ids]
  } catch {
    return [{ id: 'temp' }]
  }
}

export default function EmployeeDetailPage() {
  return <EmployeeDetailClient />
}
