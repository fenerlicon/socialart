import EmployeeDetailClient from './EmployeeDetailClient'

export function generateStaticParams() {
  return [{ id: 'temp' }]
}

export default function EmployeeDetailPage() {
  return <EmployeeDetailClient />
}
