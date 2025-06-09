import { describe, it, expect, vi } from 'vitest'
import { cn, formatDateTime } from './utils'

describe('cn utility', () => {
  it('should combine class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })
})

describe('formatDateTime', () => {
  it('should format today\'s date correctly', () => {
    // Use a fixed date for testing
    const mockDate = new Date('2025-06-09T10:00:00Z')
    vi.setSystemTime(mockDate)
    
    const testDate = '2025-06-09T14:30:00Z'
    const result = formatDateTime(testDate)
    
    expect(result).toMatch(/今日/)
    expect(result).toMatch(/\d{2}:\d{2}〜/)
  })

  it('should format tomorrow\'s date correctly', () => {
    const mockDate = new Date('2025-06-09T10:00:00Z')
    vi.setSystemTime(mockDate)
    
    const testDate = '2025-06-10T14:30:00Z'
    const result = formatDateTime(testDate)
    
    expect(result).toMatch(/明日/)
    expect(result).toMatch(/\d{2}:\d{2}〜/)
  })

  it('should format other dates with MM/dd format', () => {
    const mockDate = new Date('2025-06-09T10:00:00Z')
    vi.setSystemTime(mockDate)
    
    const testDate = '2025-06-15T14:30:00Z'
    const result = formatDateTime(testDate)
    
    expect(result).toMatch(/06\/15/)
    expect(result).toMatch(/\d{2}:\d{2}〜/)
  })

  it('should handle invalid dates gracefully', () => {
    const result = formatDateTime('invalid-date')
    // The function should still return a string, even with NaN values
    expect(typeof result).toBe('string')
  })
})