import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'

const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_API_URL = 'https://api.daily.co/v1'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // ユーザー認証
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomName, userName, isOwner } = await request.json()

    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 })
    }

    // Daily.coのミーティングトークンを生成
    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName || user.email?.split('@')[0] || 'ユーザー',
          is_owner: isOwner || false,
          // ユーザーの権限設定
          enable_screenshare: true,
          enable_recording: false,
          start_video_off: false,
          start_audio_off: false
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Daily.co API error:', error)
      return NextResponse.json(
        { error: 'Failed to create meeting token' },
        { status: response.status }
      )
    }

    const { token } = await response.json()
    
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error creating meeting token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}