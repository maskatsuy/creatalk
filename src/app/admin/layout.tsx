import { checkIsAdmin } from '@/features/admin-applications'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkIsAdmin()

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">管理画面</h1>
        <p className="text-muted-foreground mt-2">
          クリエイターの申請管理やユーザー管理を行います
        </p>
      </div>
      {children}
    </div>
  )
}