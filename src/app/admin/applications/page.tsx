import { getCreatorApplications, ApplicationsList } from '@/features/admin-applications'

export default async function AdminApplicationsPage() {
  const applications = await getCreatorApplications()

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">クリエイター申請一覧</h2>
      <ApplicationsList applications={applications} />
    </div>
  )
}