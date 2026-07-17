'use client'

import { useParams } from 'next/navigation'
import { EmployeeEditPage } from '@/features/employees/components/employee-edit-page'

export default function EditEmployeePage() {
  const params = useParams()
  const id = params.id as string

  return <EmployeeEditPage id={id} />
}
