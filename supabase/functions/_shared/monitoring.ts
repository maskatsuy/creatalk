// 監視・アラート用のユーティリティ

export interface ExecutionLog {
  timestamp: string
  function_name: string
  status: 'success' | 'error'
  duration_ms: number
  expired_count: number
  error_message?: string
}

export async function logExecution(
  supabase: any,
  log: ExecutionLog
) {
  try {
    await supabase
      .from('function_execution_logs')
      .insert(log)
  } catch (error) {
    console.error('Failed to log execution:', error)
  }
}

export async function sendSlackAlert(
  webhook_url: string,
  message: string
) {
  try {
    await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Creatalk Alert: ${message}`,
        channel: '#alerts'
      })
    })
  } catch (error) {
    console.error('Failed to send Slack alert:', error)
  }
}

export async function healthCheck(supabase: any) {
  // データベース接続確認
  const { data, error } = await supabase
    .from('call_products')
    .select('count')
    .limit(1)
    
  if (error) {
    throw new Error(`Database health check failed: ${error.message}`)
  }
  
  return { healthy: true, timestamp: new Date().toISOString() }
}