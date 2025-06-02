import { useState } from 'react'
import { toast } from 'sonner'
import { approveApplication, rejectApplication } from '../actions'
import type { Application } from '../types'

export function useApplicationManagement() {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!selectedApp) return

    setLoading(true)
    try {
      await approveApplication(selectedApp.id)
      toast.success('申請を承認しました')
      setShowApproveDialog(false)
    } catch (error) {
      toast.error('承認に失敗しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim()) {
      toast.error('却下理由を入力してください')
      return
    }

    setLoading(true)
    try {
      await rejectApplication(selectedApp.id, rejectReason)
      toast.success('申請を却下しました')
      setShowRejectDialog(false)
      setRejectReason('')
    } catch (error) {
      toast.error('却下に失敗しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const openDetailDialog = (app: Application) => {
    setSelectedApp(app)
    setShowDetailDialog(true)
  }

  const openApproveDialog = (app: Application) => {
    setSelectedApp(app)
    setShowApproveDialog(true)
  }

  const openRejectDialog = (app: Application) => {
    setSelectedApp(app)
    setShowRejectDialog(true)
  }

  return {
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
  }
}