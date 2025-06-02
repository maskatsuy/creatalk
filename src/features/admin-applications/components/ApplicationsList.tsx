'use client'

import { ApplicationsTable } from './ApplicationsTable'
import { ApplicationDetailDialog } from './ApplicationDetailDialog'
import { ApprovalDialog } from './ApprovalDialog'
import { RejectionDialog } from './RejectionDialog'
import { useApplicationManagement } from '../hooks/useApplicationManagement'
import type { ApplicationsListProps } from '../types'

export function ApplicationsList({ applications }: ApplicationsListProps) {
  const {
    selectedApp,
    showDetailDialog,
    showRejectDialog,
    showApproveDialog,
    rejectReason,
    loading,
    setShowDetailDialog,
    setShowRejectDialog,
    setShowApproveDialog,
    setRejectReason,
    setSelectedApp,
    handleApprove,
    handleReject,
    openDetailDialog,
    openApproveDialog,
    openRejectDialog
  } = useApplicationManagement()

  return (
    <>
      <ApplicationsTable
        applications={applications}
        loading={loading}
        onViewDetail={openDetailDialog}
        onApprove={openApproveDialog}
        onReject={openRejectDialog}
      />

      <ApplicationDetailDialog
        open={showDetailDialog}
        onOpenChange={(open) => {
          setShowDetailDialog(open)
          if (!open) setSelectedApp(null)
        }}
        application={selectedApp}
      />

      <ApprovalDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        application={selectedApp}
        onApprove={handleApprove}
        loading={loading}
      />

      <RejectionDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        application={selectedApp}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        onReject={handleReject}
        loading={loading}
      />
    </>
  )
}