'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import type { Creator, CreatorSearchParams, CreatorSearchResult } from '../types'

export async function searchCreators(params: CreatorSearchParams): Promise<CreatorSearchResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    let query = supabase
      .from('creator_applications')
      .select(`
        user_id,
        display_name,
        bio,
        category,
        portfolio_url,
        social_twitter,
        social_instagram,
        social_youtube,
        pricing_plan,
        follower_count,
        created_at,
        last_call_created_at,
        profiles!creator_applications_user_id_fkey(email)
      `, { count: 'exact' })
      .eq('status', 'approved')

    // 名前での検索
    if (params.query) {
      query = query.ilike('display_name', `%${params.query}%`)
    }

    // カテゴリーでのフィルタ
    if (params.category) {
      query = query.eq('category', params.category)
    }

    // ソート機能
    const sortBy = params.sortBy || 'created_at'
    const sortOrder = params.sortOrder || 'desc'
    
    switch (sortBy) {
      case 'followers':
        query = query.order('follower_count', { ascending: sortOrder === 'asc' })
        break
      case 'created_at':
        query = query.order('created_at', { ascending: sortOrder === 'asc' })
        break
      case 'last_call':
        query = query.order('last_call_created_at', { ascending: sortOrder === 'asc', nullsFirst: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // ページネーション
    const limit = params.limit || 12
    const page = params.page || 1
    const offset = (page - 1) * limit
    
    query = query.range(offset, offset + limit - 1)

    const { data: applications, error, count } = await query

    if (error) {
      console.error('Creator search error:', error)
      return { 
        creators: [], 
        total: 0, 
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false,
        error: 'クリエイターの検索に失敗しました' 
      }
    }

    if (!applications) {
      return { 
        creators: [], 
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false
      }
    }

    // Creator型に変換
    const creators: Creator[] = applications.map(app => ({
      id: app.user_id,
      display_name: app.display_name,
      bio: app.bio,
      category: app.category,
      portfolio_url: app.portfolio_url,
      social_twitter: app.social_twitter,
      social_instagram: app.social_instagram,
      social_youtube: app.social_youtube,
      pricing_plan: app.pricing_plan,
      follower_count: app.follower_count || 0,
      created_at: app.created_at,
      last_call_created_at: app.last_call_created_at,
      profiles: Array.isArray(app.profiles) ? app.profiles[0] || null : app.profiles
    }))

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      creators,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

  } catch (error) {
    console.error('Search creators error:', error)
    return {
      creators: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      error: 'クリエイターの検索に失敗しました'
    }
  }
}

export async function getPopularCreators(): Promise<{
  creators: Creator[]
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: applications, error } = await supabase
      .from('creator_applications')
      .select(`
        user_id,
        display_name,
        bio,
        category,
        portfolio_url,
        social_twitter,
        social_instagram,
        social_youtube,
        pricing_plan,
        follower_count,
        created_at,
        last_call_created_at,
        profiles!creator_applications_user_id_fkey(email)
      `)
      .eq('status', 'approved')
      .order('follower_count', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Popular creators error:', error)
      return { creators: [], error: '人気クリエイターの取得に失敗しました' }
    }

    if (!applications) {
      return { creators: [] }
    }

    const creators: Creator[] = applications.map(app => ({
      id: app.user_id,
      display_name: app.display_name,
      bio: app.bio,
      category: app.category,
      portfolio_url: app.portfolio_url,
      social_twitter: app.social_twitter,
      social_instagram: app.social_instagram,
      social_youtube: app.social_youtube,
      pricing_plan: app.pricing_plan,
      follower_count: app.follower_count || 0,
      created_at: app.created_at,
      last_call_created_at: app.last_call_created_at,
      profiles: Array.isArray(app.profiles) ? app.profiles[0] || null : app.profiles
    }))

    return { creators }

  } catch (error) {
    console.error('Get popular creators error:', error)
    return {
      creators: [],
      error: '人気クリエイターの取得に失敗しました'
    }
  }
}