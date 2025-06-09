import type { User } from '@supabase/supabase-js'
import type { CallProduct } from '@/features/creator-calls/types'

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
  phone: undefined,
  phone_confirmed_at: undefined,
  confirmed_at: '2025-01-01T00:00:00Z',
  last_sign_in_at: '2025-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  is_anonymous: false,
  aud: 'authenticated',
  role: 'authenticated',
}

export const mockCallProduct: CallProduct = {
  id: 'test-product-id',
  creator_id: 'test-creator-id',
  type: 'queue',
  title: 'Test Call Product',
  description: 'A test call product for testing',
  price: 1000,
  duration: 30,
  recording_enabled: false,
  status: 'active',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  slot_date: '2025-06-10',
  start_time: '14:00:00',
  end_time: '15:00:00',
  start_at: '2025-06-10T05:00:00Z',
  end_at: '2025-06-10T06:00:00Z',
  max_participants: 10,
  remaining_slots: 5,
}

export const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  display_name: 'Test User',
  avatar_url: undefined,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockCreatorApplication = {
  id: 'test-application-id',
  user_id: 'test-user-id',
  display_name: 'Test Creator',
  bio: 'A test creator bio',
  experience: 'Test experience',
  motivation: 'Test motivation',
  social_links: { twitter: '@testcreator' },
  profile_image_url: undefined,
  status: 'approved' as const,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockQueueParticipant = {
  id: 'test-participant-id',
  plan_id: 'test-product-id',
  user_id: 'test-user-id',
  position: 1,
  status: 'waiting' as const,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockCallRoom = {
  id: 'test-room-id',
  creator_id: 'test-creator-id',
  participant_id: 'test-user-id',
  daily_room_url: 'https://test.daily.co/test-room',
  status: 'active' as const,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

// Helper functions for creating test data
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  ...mockUser,
  ...overrides,
})

export const createMockCallProduct = (overrides: Partial<CallProduct> = {}): CallProduct => ({
  ...mockCallProduct,
  ...overrides,
})

export const createMockProfile = (overrides = {}) => ({
  ...mockProfile,
  ...overrides,
})

export const createMockCreatorApplication = (overrides = {}) => ({
  ...mockCreatorApplication,
  ...overrides,
})