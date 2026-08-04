import { EmployeeEditPage } from '@/features/employees/components/employee-edit-page'

export async function generateStaticParams() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU'
    const supabase = createClient(url, key)
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
