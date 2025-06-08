# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint

# Supabase (use cloud instance only - no local setup)
supabase login
supabase link --project-ref <your-project-ref>
supabase migration list
supabase db push
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router (using async cookies/headers APIs)
- **Database & Auth**: Supabase Cloud with RLS policies
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Video Calls**: Daily.co API
- **Payments**: Stripe (test mode)

### Key Architectural Patterns

1. **Data Operations**: Always use Server Actions (`use server`) instead of API routes, except for webhooks
2. **Authentication**: 
   - Server Components: Use `await cookies()` for auth checks
   - Client Components: Use AuthProvider and useAuth hook
3. **Supabase Client Usage**:
   - Server-side: Always create new client instance per request
   - Client-side: Use singleton from `@/lib/supabase-client`
4. **Form Handling**: Server Actions with proper error handling and user feedback

### Directory Structure
- `src/app/`: Next.js pages and route groups
- `src/actions/`: Server Actions (preferred over API routes)
- `src/components/`: React components (ui/, auth/, call/, creator/, layout/)
- `src/lib/`: Utilities and Supabase client setup
- `src/types/`: TypeScript definitions including database types

### Important Notes

1. **Next.js 15**: Remember that `cookies()` and `headers()` are now async - always use `await`
2. **Supabase RLS**: All database tables have Row Level Security policies
3. **Import Paths**: Use `@/` alias for src imports
4. **Component Naming**: PascalCase for components, kebab-case for files
5. **Error Handling**: Always wrap Server Actions in try-catch blocks
6. **Real-time Updates**: Use Supabase Realtime for status changes

### Call Product System
Two types of products:
- **Queue System**: Time slots with creator-managed breaks
- **Fixed Slots**: Specific time bookings

Video calls include: video/audio controls, screen sharing, chat (fan chat-only mode), and optional recording.

## Component Architecture Guidelines

### Device Preview Component Pattern
The device preview functionality has been refactored following these principles:

1. **Separation of Concerns**:
   - `VideoPreview`: Handles video display and permission states
   - `MediaControls`: Manages video/audio toggle buttons
   - `AudioLevelIndicator`: Visual audio level feedback
   - `AudioRecorder`: Audio recording and playback for testing
   - `DeviceSelector`: Device selection dropdowns

2. **Custom Hooks Pattern**:
   - `useMediaDevices`: Device enumeration and selection state
   - `useMediaStream`: Stream lifecycle management
   - `useAudioLevel`: Real-time audio level monitoring
   - `useAudioRecorder`: Recording functionality

3. **Performance Optimization**:
   - Use `useCallback` for event handlers to prevent unnecessary re-renders
   - Avoid `eslint-disable` comments by properly managing dependencies
   - Use `useRef` for initialization flags instead of empty dependency arrays

4. **Error Handling**:
   - Specific error messages based on `DOMException` types
   - User-friendly error notifications with actionable guidance

### Best Practices
1. **Avoid eslint-disable**: Always prefer proper dependency management over disabling rules
2. **Component Size**: Keep components under 200 lines by extracting logic into hooks
3. **Type Safety**: Define interfaces for all props and state
4. **Cleanup**: Always cleanup streams, intervals, and event listeners