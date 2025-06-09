import axios from 'axios'

export interface DailyRoom {
  id: string
  name: string
  url: string
  created_at: string
  config: {
    max_participants: number
    enable_recording: boolean
    enable_chat: boolean
    enable_screenshare: boolean
    enable_video_processing_ui: boolean
    eject_at_room_exp: boolean
    exp: number
  }
}

export interface DailyParticipant {
  id: string
  user_id: string
  user_name: string
  joined_at: string
  duration: number
  session_id: string
}

export interface CreateRoomOptions {
  name?: string
  privacy?: 'public' | 'private'
  properties?: {
    max_participants?: number
    enable_recording?: boolean
    enable_chat?: boolean
    enable_screenshare?: boolean
    enable_video_processing_ui?: boolean
    eject_at_room_exp?: boolean
    enable_prejoin_ui?: boolean
    exp?: number // Unix timestamp
    lang?: 'ja' | 'en'
    // Additional UI controls
    enable_pip_ui?: boolean
    enable_dialin_ui?: boolean
    enable_dialout_ui?: boolean
    enable_hand_raising?: boolean
    enable_people_ui?: boolean
    enable_emoji_reactions?: boolean
    enable_breakout_rooms?: boolean
  }
}

class DailyService {
  private apiKey: string
  private apiUrl: string
  private domain: string

  constructor() {
    this.apiKey = process.env.DAILY_API_KEY || ''
    this.apiUrl = 'https://api.daily.co/v1'
    this.domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || ''

    if (!this.apiKey) {
      console.error('DAILY_API_KEY environment variable is not set')
      throw new Error('Daily.co API key is required')
    }
    if (!this.domain) {
      console.error('NEXT_PUBLIC_DAILY_DOMAIN environment variable is not set')
      throw new Error('Daily.co domain is required')
    }
    
    console.log('Daily.co service initialized:', {
      domain: this.domain,
      hasApiKey: !!this.apiKey
    })
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Create a new Daily.co room
   */
  async createRoom(options: CreateRoomOptions = {}): Promise<DailyRoom> {
    try {
      const roomName = options.name || `room-${Date.now()}`
      
      const payload = {
        name: roomName,
        privacy: options.privacy || 'public',
        properties: {
          max_participants: options.properties?.max_participants || 2,
          enable_recording: options.properties?.enable_recording || false,
          enable_chat: options.properties?.enable_chat !== undefined ? options.properties.enable_chat : false,
          enable_screenshare: options.properties?.enable_screenshare !== undefined ? options.properties.enable_screenshare : false,
          eject_at_room_exp: options.properties?.eject_at_room_exp !== undefined ? options.properties.eject_at_room_exp : false,
          enable_prejoin_ui: options.properties?.enable_prejoin_ui !== undefined ? options.properties.enable_prejoin_ui : false,
          exp: options.properties?.exp || Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          lang: options.properties?.lang || 'ja'
        }
      }

      const response = await axios.post(
        `${this.apiUrl}/rooms`,
        payload,
        { headers: this.headers }
      )

      return {
        ...response.data,
        url: `https://${this.domain}.daily.co/${roomName}`
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Daily.co API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        })
        throw new Error(`Daily.co API Error: ${error.response?.status} ${error.response?.statusText}`)
      } else {
        console.error('Error creating Daily.co room:', error)
        throw new Error('Failed to create video room')
      }
    }
  }

  /**
   * Delete a Daily.co room
   */
  async deleteRoom(roomName: string): Promise<void> {
    try {
      await axios.delete(
        `${this.apiUrl}/rooms/${roomName}`,
        { headers: this.headers }
      )
    } catch (error) {
      console.error('Error deleting Daily.co room:', error)
      throw new Error('Failed to delete video room')
    }
  }

  /**
   * Get room details
   */
  async getRoom(roomName: string): Promise<DailyRoom> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/rooms/${roomName}`,
        { headers: this.headers }
      )

      return {
        ...response.data,
        url: `https://${this.domain}.daily.co/${roomName}`
      }
    } catch (error) {
      console.error('Error getting Daily.co room:', error)
      throw new Error('Failed to get video room')
    }
  }

  /**
   * Create a meeting token for participant authentication
   */
  async createMeetingToken(roomName: string, options: {
    user_id?: string
    user_name?: string
    is_owner?: boolean
    exp?: number
  } = {}): Promise<string> {
    try {
      const payload = {
        properties: {
          room_name: roomName,
          user_id: options.user_id,
          user_name: options.user_name,
          is_owner: options.is_owner || false,
          exp: options.exp || Math.floor(Date.now() / 1000) + 3600, // 1 hour
        }
      }

      const response = await axios.post(
        `${this.apiUrl}/meeting-tokens`,
        payload,
        { headers: this.headers }
      )

      return response.data.token
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Daily.co Meeting Token API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          roomName,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        })
        throw new Error(`Daily.co Token API Error: ${error.response?.status} ${error.response?.statusText}`)
      } else {
        console.error('Error creating meeting token:', error)
        throw new Error('Failed to create meeting token')
      }
    }
  }

  /**
   * Get active participants in a room
   */
  async getParticipants(roomName: string): Promise<DailyParticipant[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/rooms/${roomName}/participants`,
        { headers: this.headers }
      )

      return response.data.data || []
    } catch (error) {
      console.error('Error getting participants:', error)
      throw new Error('Failed to get participants')
    }
  }

  /**
   * Start recording
   */
  async startRecording(roomName: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/rooms/${roomName}/recordings`,
        {},
        { headers: this.headers }
      )
    } catch (error) {
      console.error('Error starting recording:', error)
      throw new Error('Failed to start recording')
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(roomName: string): Promise<void> {
    try {
      await axios.delete(
        `${this.apiUrl}/rooms/${roomName}/recordings`,
        { headers: this.headers }
      )
    } catch (error) {
      console.error('Error stopping recording:', error)
      throw new Error('Failed to stop recording')
    }
  }

  /**
   * Get recording links
   */
  async getRecordings(roomName: string): Promise<unknown[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/recordings?room_name=${roomName}`,
        { headers: this.headers }
      )

      return response.data.data || []
    } catch (error) {
      console.error('Error getting recordings:', error)
      throw new Error('Failed to get recordings')
    }
  }
}

// Export singleton instance
export const dailyService = new DailyService()