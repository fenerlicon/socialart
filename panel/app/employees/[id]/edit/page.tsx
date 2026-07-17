import { EmployeeEditPage } from '@/features/employees/components/employee-edit-page'

export function generateStaticParams() {
  return [{ id: 'temp' }]
}

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  return <EmployeeEditPage id={params.id} />
}
