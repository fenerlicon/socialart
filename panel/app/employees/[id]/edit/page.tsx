import { EmployeeEditPage } from '@/features/employees/components/employee-edit-page'

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

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  return <EmployeeEditPage id={params.id} />
}
