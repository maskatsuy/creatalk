import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCreatorCallProducts } from './products'
import { createServerClientWithCookies } from '@/lib/supabase-server'

// Mock the modules
vi.mock('@/lib/supabase-server')
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({})),
}))

describe('getCreatorCallProducts', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn(),
        limit: vi.fn(),
      }
      return mockQuery
    }),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createServerClientWithCookies).mockReturnValue(mockSupabase as ReturnType<typeof createServerClientWithCookies>)
  })

  it('should return error when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const result = await getCreatorCallProducts()

    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1)
  })

  it('should call supabase with correct parameters', async () => {
    const mockUser = { id: 'user-123' }
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    // Mock both queries that the function makes
    const mockProductQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      }),
    }

    const mockBookingQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }

    // Return different mocks for different table calls
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'call_products') return mockProductQuery
      if (table === 'call_bookings') return mockBookingQuery
      return mockProductQuery
    })

    const result = await getCreatorCallProducts()

    expect(result.error).toBeUndefined()
    expect(mockSupabase.from).toHaveBeenCalledWith('call_products')
    expect(result.products).toEqual([])
  })

  it('should handle database errors', async () => {
    const mockUser = { id: 'user-123' }
    const mockError = new Error('Database error')

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    }

    mockSupabase.from.mockReturnValue(mockQuery)

    const result = await getCreatorCallProducts()

    expect(result.error).toBeDefined()
  })
})