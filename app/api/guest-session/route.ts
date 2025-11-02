/**
 * Guest Session Management API
 * Handles guest user sessions, preferences, and progress tracking
 */

import { NextRequest, NextResponse } from 'next/server'

// Guest session storage (in production, use Redis or database)
const guestSessions = new Map<string, any>()
const SESSION_DURATION = 4 * 60 * 60 * 1000 // 4 hours

// Default guest profile
const DEFAULT_GUEST_PROFILE = {
  name: 'Guest Farmer',
  level: 1,
  xp: 0,
  preferences: {
    theme: 'dark',
    units: 'metric',
    language: 'en',
    notifications: true,
    autoSave: true
  },
  progress: {
    completedModules: [],
    currentModule: null,
    achievements: [],
    streakDays: 0,
    totalStudyTime: 0,
    lastActive: new Date().toISOString()
  },
  farmData: {
    selectedLocation: { lat: 40.7128, lng: -74.0060, name: 'Demo Farm' },
    preferredCrops: ['corn', 'soybeans'],
    farmingExperience: 'beginner',
    interests: ['sustainable-farming', 'precision-agriculture']
  },
  session: {
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    pageViews: [],
    interactionCount: 0
  }
}

// Generate unique guest session ID
function generateGuestSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Check if session is valid
function isValidSession(sessionData: any): boolean {
  if (!sessionData) return false
  const now = Date.now()
  const sessionStart = new Date(sessionData.session.startTime).getTime()
  return (now - sessionStart) < SESSION_DURATION
}

// Update session activity
function updateSessionActivity(sessionId: string, activity: string): void {
  const session = guestSessions.get(sessionId)
  if (session) {
    session.session.lastActivity = new Date().toISOString()
    session.session.interactionCount += 1
    session.session.pageViews.push({
      page: activity,
      timestamp: new Date().toISOString()
    })
    guestSessions.set(sessionId, session)
  }
}

// Clean expired sessions
function cleanExpiredSessions(): void {
  const now = Date.now()
  for (const [sessionId, sessionData] of guestSessions) {
    const sessionStart = new Date(sessionData.session.startTime).getTime()
    if ((now - sessionStart) > SESSION_DURATION) {
      guestSessions.delete(sessionId)
      console.log(`🗑️ Cleaned expired session: ${sessionId}`)
    }
  }
}

// Run cleanup every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sessionId = searchParams.get('sessionId')

  console.log(`👤 Guest Session API: ${action}`)

  try {
    switch (action) {
      case 'create-session':
        const guestName = searchParams.get('name') || 'Guest Farmer'
        const newSessionId = generateGuestSessionId()
        
        const newGuestProfile = {
          ...DEFAULT_GUEST_PROFILE,
          name: guestName,
          sessionId: newSessionId
        }

        guestSessions.set(newSessionId, newGuestProfile)

        return NextResponse.json({
          success: true,
          data: {
            sessionId: newSessionId,
            profile: newGuestProfile,
            expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
          }
        })

      case 'get-session':
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
        }

        const sessionData = guestSessions.get(sessionId)
        if (!sessionData || !isValidSession(sessionData)) {
          return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
        }

        updateSessionActivity(sessionId, 'session-check')

        return NextResponse.json({
          success: true,
          data: sessionData,
          meta: { 
            timeRemaining: SESSION_DURATION - (Date.now() - new Date(sessionData.session.startTime).getTime()),
            totalSessions: guestSessions.size
          }
        })

      case 'session-stats':
        const stats = {
          activeSessions: guestSessions.size,
          totalInteractions: Array.from(guestSessions.values()).reduce((sum, session) => sum + session.session.interactionCount, 0),
          averageSessionTime: '42 minutes', // Mock data
          popularPages: [
            { page: '/farm', visits: 1247 },
            { page: '/learn', visits: 892 },
            { page: '/nasa-demo', visits: 634 }
          ],
          userEngagement: {
            highActivity: Array.from(guestSessions.values()).filter(s => s.session.interactionCount > 20).length,
            mediumActivity: Array.from(guestSessions.values()).filter(s => s.session.interactionCount > 10 && s.session.interactionCount <= 20).length,
            lowActivity: Array.from(guestSessions.values()).filter(s => s.session.interactionCount <= 10).length
          }
        }

        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'popular-content':
        const popularContent = {
          mostViewedPages: [
            { path: '/farm', title: 'Farm Dashboard', views: 1247, avgTime: '5:32' },
            { path: '/learn', title: 'Learning Hub', views: 892, avgTime: '8:15' },
            { path: '/nasa-demo', title: 'NASA Demo', views: 634, avgTime: '3:22' },
            { path: '/nasa-farm-challenge', title: 'Farm Challenge', views: 445, avgTime: '12:08' }
          ],
          mostCompletedModules: [
            { id: 'intro-nasa-data', title: 'NASA Data Intro', completions: 156 },
            { id: 'soil-moisture-basics', title: 'Soil Moisture', completions: 98 },
            { id: 'ndvi-vegetation', title: 'NDVI Analysis', completions: 73 }
          ],
          preferredCrops: [
            { crop: 'corn', selections: 423 },
            { crop: 'soybeans', selections: 312 },
            { crop: 'wheat', selections: 287 }
          ]
        }

        return NextResponse.json({
          success: true,
          data: popularContent
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Guest Session API Error:', error)
    return NextResponse.json(
      { error: 'Failed to manage guest session', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sessionId = searchParams.get('sessionId')

  try {
    const body = await request.json()

    if (!sessionId && action !== 'analytics-event') {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const sessionData = sessionId ? guestSessions.get(sessionId) : null
    if (sessionId && (!sessionData || !isValidSession(sessionData))) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    switch (action) {
      case 'update-preferences':
        const { preferences } = body
        
        if (sessionData) {
          sessionData.preferences = { ...sessionData.preferences, ...preferences }
          sessionData.session.lastActivity = new Date().toISOString()
          guestSessions.set(sessionId!, sessionData)
        }

        return NextResponse.json({
          success: true,
          data: { updatedPreferences: sessionData?.preferences }
        })

      case 'update-progress':
        const { moduleId, xpGained, achievement } = body
        
        if (sessionData) {
          if (moduleId && !sessionData.progress.completedModules.includes(moduleId)) {
            sessionData.progress.completedModules.push(moduleId)
          }
          
          if (xpGained) {
            sessionData.xp += xpGained
          }
          
          if (achievement) {
            sessionData.progress.achievements.push({
              id: achievement,
              unlockedAt: new Date().toISOString()
            })
          }

          sessionData.session.lastActivity = new Date().toISOString()
          guestSessions.set(sessionId!, sessionData)
        }

        return NextResponse.json({
          success: true,
          data: { 
            newXP: sessionData?.xp,
            newAchievements: sessionData?.progress.achievements
          }
        })

      case 'update-farm-location':
        const { lat, lng, name } = body
        
        if (sessionData) {
          sessionData.farmData.selectedLocation = { lat, lng, name }
          sessionData.session.lastActivity = new Date().toISOString()
          guestSessions.set(sessionId!, sessionData)
          
          updateSessionActivity(sessionId!, `location-update-${name}`)
        }

        return NextResponse.json({
          success: true,
          data: { updatedLocation: sessionData?.farmData.selectedLocation }
        })

      case 'track-interaction':
        const { page: interactionPage, action: interactionAction, data: interactionData } = body
        
        if (sessionData) {
          updateSessionActivity(sessionId!, `${interactionPage}-${interactionAction}`)
          
          // Track specific interaction
          sessionData.session.interactions = sessionData.session.interactions || []
          sessionData.session.interactions.push({
            page: interactionPage,
            action: interactionAction,
            data: interactionData,
            timestamp: new Date().toISOString()
          })
          
          guestSessions.set(sessionId!, sessionData)
        }

        return NextResponse.json({
          success: true,
          data: { tracked: true }
        })

      case 'extend-session':
        if (sessionData) {
          // Extend session by updating start time
          sessionData.session.startTime = new Date().toISOString()
          guestSessions.set(sessionId!, sessionData)
        }

        return NextResponse.json({
          success: true,
          data: { 
            extended: true,
            newExpiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
          }
        })

      case 'analytics-event':
        // Track anonymous analytics events
        const { event, page: eventPage, data } = body
        
        console.log(`📊 Analytics Event: ${event} on ${eventPage}`, data)
        
        // In production, send to analytics service
        return NextResponse.json({
          success: true,
          data: { eventTracked: true }
        })

      default:
        return NextResponse.json({ error: 'Invalid POST action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Guest Session POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'end-session':
        if (sessionId && guestSessions.has(sessionId)) {
          guestSessions.delete(sessionId)
          return NextResponse.json({
            success: true,
            data: { sessionEnded: true }
          })
        }
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })

      case 'cleanup-sessions':
        cleanExpiredSessions()
        return NextResponse.json({
          success: true,
          data: { 
            remainingSessions: guestSessions.size,
            cleanupCompleted: true
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid DELETE action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Guest Session DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete session', details: String(error) },
      { status: 500 }
    )
  }
}