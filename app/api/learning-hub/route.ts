/**
 * Learning Hub Backend API
 * Server-side data management for educational content with caching
 */

import { NextRequest, NextResponse } from 'next/server'
import { NASA_API_KEY } from '@/lib/nasa-api'

// In-memory cache for learning data (in production, use Redis)
const learningCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Learning modules data structure
const LEARNING_MODULES = {
  beginner: [
    {
      id: 'intro-nasa-data',
      title: 'Introduction to NASA Agricultural Data',
      description: 'Learn about satellite imagery, NDVI, and soil moisture data',
      duration: '15 min',
      xp: 100,
      completed: false,
      content: {
        sections: [
          {
            title: 'What is NASA Earth Observation?',
            content: 'NASA satellites continuously monitor Earth to provide critical data for agriculture...',
            interactive: {
              type: 'quiz',
              questions: [
                {
                  question: 'What does NDVI measure?',
                  options: ['Soil moisture', 'Vegetation health', 'Temperature', 'Rainfall'],
                  correct: 1
                }
              ]
            }
          },
          {
            title: 'MODIS and Landsat Satellites',
            content: 'These satellites provide different types of agricultural data...',
            interactive: {
              type: 'simulation',
              scenario: 'crop-monitoring'
            }
          }
        ],
        resources: [
          { title: 'NASA Earthdata Guide', url: 'https://earthdata.nasa.gov/' },
          { title: 'MODIS Data Products', url: 'https://modis.gsfc.nasa.gov/' }
        ]
      }
    },
    {
      id: 'soil-moisture-basics',
      title: 'Understanding Soil Moisture with SMAP',
      description: 'Master soil moisture interpretation for crop management',
      duration: '20 min',
      xp: 150,
      completed: false,
      content: {
        sections: [
          {
            title: 'SMAP Mission Overview',
            content: 'The Soil Moisture Active Passive (SMAP) mission provides global soil moisture data...',
            interactive: {
              type: 'data-analysis',
              dataset: 'smap-sample'
            }
          }
        ]
      }
    },
    {
      id: 'ndvi-vegetation',
      title: 'Vegetation Health Monitoring with NDVI',
      description: 'Learn to interpret NDVI data for crop health assessment',
      duration: '25 min',
      xp: 200,
      completed: false
    }
  ],
  intermediate: [
    {
      id: 'weather-patterns',
      title: 'Weather Pattern Analysis with GPM',
      description: 'Use precipitation data for farm planning',
      duration: '30 min',
      xp: 250,
      completed: false
    },
    {
      id: 'crop-yield-prediction',
      title: 'AI-Powered Yield Prediction',
      description: 'Combine satellite data with machine learning',
      duration: '45 min',
      xp: 300,
      completed: false
    }
  ],
  advanced: [
    {
      id: 'climate-adaptation',
      title: 'Climate Change Adaptation Strategies',
      description: 'Long-term agricultural planning with climate data',
      duration: '60 min',
      xp: 500,
      completed: false
    }
  ]
}

// User progress tracking
const USER_PROGRESS = {
  level: 2,
  currentXP: 1240,
  totalXP: 2000,
  nextLevel: 'Sustainability Expert',
  achievements: [
    { id: 'first-module', title: 'First Steps', description: 'Completed your first learning module', date: '2024-10-01' },
    { id: 'nasa-expert', title: 'NASA Data Expert', description: 'Mastered NASA satellite data interpretation', date: '2024-10-03' },
    { id: 'soil-specialist', title: 'Soil Specialist', description: 'Completed all soil moisture modules', date: '2024-10-04' }
  ],
  completedModules: ['intro-nasa-data', 'soil-moisture-basics'],
  currentModule: 'ndvi-vegetation',
  streakDays: 7,
  totalStudyTime: 180 // minutes
}

// Interactive assessments
const ASSESSMENTS = [
  {
    id: 'nasa-data-fundamentals',
    title: 'NASA Data Fundamentals',
    description: 'Test your knowledge of satellite data basics',
    questions: 15,
    timeLimit: 20, // minutes
    difficulty: 'beginner',
    xpReward: 300,
    questions_data: [
      {
        id: 1,
        question: 'Which NASA satellite provides soil moisture data?',
        options: ['MODIS', 'SMAP', 'Landsat', 'VIIRS'],
        correct: 1,
        explanation: 'SMAP (Soil Moisture Active Passive) is specifically designed to measure soil moisture.'
      },
      {
        id: 2,
        question: 'What does NDVI stand for?',
        options: ['Normalized Difference Vegetation Index', 'NASA Data Verification Index', 'Natural Diversity Vegetation Indicator', 'Normalized Digital Vegetation Interface'],
        correct: 0,
        explanation: 'NDVI measures vegetation health by comparing red and near-infrared light reflection.'
      }
    ]
  }
]

// Get cached data or fetch new
function getCachedData(key: string): any | null {
  const cached = learningCache.get(key)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  return null
}

// Set data in cache
function setCachedData(key: string, data: any): void {
  learningCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// Generate dynamic learning content
async function generateDynamicContent(moduleId: string, userLevel: number): Promise<any> {
  const cacheKey = `dynamic-${moduleId}-${userLevel}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  // Simulate AI-generated personalized content
  const dynamicContent = {
    personalizedTips: [
      `Based on your level ${userLevel}, focus on practical applications of ${moduleId}`,
      'Try the interactive simulation to reinforce your learning',
      'Connect this knowledge to your previous completed modules'
    ],
    recommendedNext: LEARNING_MODULES.intermediate.slice(0, 2),
    practicalExercises: [
      {
        title: 'Analyze Real Farm Data',
        description: 'Use actual NASA satellite data to assess a farm in Iowa',
        estimatedTime: '15 min',
        difficulty: userLevel <= 2 ? 'guided' : 'independent'
      }
    ]
  }

  setCachedData(cacheKey, dynamicContent)
  return dynamicContent
}

// API Route Handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const moduleId = searchParams.get('moduleId')
  const userId = searchParams.get('userId') || 'guest'

  console.log(`📚 Learning Hub API: ${action}`)

  try {
    switch (action) {
      case 'modules':
        const level = searchParams.get('level') || 'all'
        let modules = level === 'all' ? 
          [...LEARNING_MODULES.beginner, ...LEARNING_MODULES.intermediate, ...LEARNING_MODULES.advanced] :
          LEARNING_MODULES[level as keyof typeof LEARNING_MODULES] || []

        return NextResponse.json({
          success: true,
          data: {
            modules,
            totalModules: modules.length,
            categories: Object.keys(LEARNING_MODULES)
          },
          cache: { cached: false, timestamp: new Date().toISOString() }
        })

      case 'progress':
        return NextResponse.json({
          success: true,
          data: USER_PROGRESS,
          cache: { cached: false, timestamp: new Date().toISOString() }
        })

      case 'module-content':
        if (!moduleId) {
          return NextResponse.json({ error: 'Module ID required' }, { status: 400 })
        }

        // Find module across all levels
        let foundModule = null
        for (const levelModules of Object.values(LEARNING_MODULES)) {
          foundModule = levelModules.find(m => m.id === moduleId)
          if (foundModule) break
        }

        if (!foundModule) {
          return NextResponse.json({ error: 'Module not found' }, { status: 404 })
        }

        // Generate dynamic content
        const dynamicContent = await generateDynamicContent(moduleId, USER_PROGRESS.level)

        return NextResponse.json({
          success: true,
          data: {
            module: foundModule,
            dynamic: dynamicContent,
            userProgress: {
              completed: USER_PROGRESS.completedModules.includes(moduleId),
              currentXP: USER_PROGRESS.currentXP
            }
          }
        })

      case 'assessments':
        return NextResponse.json({
          success: true,
          data: {
            assessments: ASSESSMENTS,
            userCompletedAssessments: ['nasa-data-fundamentals'] // Mock data
          }
        })

      case 'achievement-unlock':
        const achievementId = searchParams.get('achievementId')
        if (!achievementId) {
          return NextResponse.json({ error: 'Achievement ID required' }, { status: 400 })
        }

        // Mock achievement unlock
        const newAchievement = {
          id: achievementId,
          title: 'Learning Achievement',
          description: 'Unlocked through dedicated learning',
          date: new Date().toISOString().split('T')[0],
          xpBonus: 50
        }

        return NextResponse.json({
          success: true,
          data: {
            achievement: newAchievement,
            newXP: USER_PROGRESS.currentXP + 50
          }
        })

      case 'leaderboard':
        const mockLeaderboard = [
          { rank: 1, name: 'NASA Explorer', xp: 5420, level: 'Sustainability Expert' },
          { rank: 2, name: 'Farm Innovator', xp: 4890, level: 'Sustainability Expert' },
          { rank: 3, name: 'You', xp: USER_PROGRESS.currentXP, level: 'Farm Analyst' },
          { rank: 4, name: 'Earth Observer', xp: 1180, level: 'Farm Analyst' },
          { rank: 5, name: 'Crop Master', xp: 980, level: 'Farm Analyst' }
        ]

        return NextResponse.json({
          success: true,
          data: {
            leaderboard: mockLeaderboard,
            userRank: 3,
            totalUsers: 1247
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Learning Hub API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning data', details: String(error) },
      { status: 500 }
    )
  }
}

// POST for user progress updates
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const body = await request.json()

    switch (action) {
      case 'complete-module':
        const { moduleId, score: moduleScore, timeSpent } = body
        
        // Update user progress (in production, save to database)
        if (!USER_PROGRESS.completedModules.includes(moduleId)) {
          USER_PROGRESS.completedModules.push(moduleId)
          USER_PROGRESS.currentXP += 150 // XP for completion
          USER_PROGRESS.totalStudyTime += timeSpent || 15
        }

        return NextResponse.json({
          success: true,
          data: {
            newXP: USER_PROGRESS.currentXP,
            unlockedAchievements: moduleScore > 80 ? ['high-achiever'] : []
          }
        })

      case 'submit-assessment':
        const { assessmentId, answers } = body
        
        // Calculate score (simplified)
        const assessment = ASSESSMENTS.find(a => a.id === assessmentId)
        let correctAnswers = 0
        
        if (assessment) {
          answers.forEach((answer: number, index: number) => {
            if (assessment.questions_data[index]?.correct === answer) {
              correctAnswers++
            }
          })
        }

        const score = Math.round((correctAnswers / (assessment?.questions_data.length || 1)) * 100)
        const xpEarned = score > 70 ? (assessment?.xpReward || 0) : Math.floor((assessment?.xpReward || 0) * 0.5)

        USER_PROGRESS.currentXP += xpEarned

        return NextResponse.json({
          success: true,
          data: {
            score,
            correctAnswers,
            totalQuestions: assessment?.questions_data.length || 0,
            xpEarned,
            newTotalXP: USER_PROGRESS.currentXP,
            passed: score >= 70
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid POST action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Learning Hub POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    )
  }
}