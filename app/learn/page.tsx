"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Award, ChevronRight, Leaf, Satellite, TrendingUp, GraduationCap, Loader2, Trophy, Target, ArrowRight, Brain, Play, Clock } from 'lucide-react'
import Link from "next/link"

interface LearningModule {
  id: string
  title: string
  description: string
  duration: string
  xp: number
  completed: boolean
  progress?: number
  content?: {
    sections: Array<{
      title: string
      content: string
      interactive?: any
    }>
    resources?: Array<{
      title: string
      url: string
    }>
  }
}

interface UserProgress {
  level: number
  currentXP: number
  totalXP: number
  nextLevel: string
  achievements: Array<{
    id: string
    title: string
    description: string
    date: string
  }>
  completedModules: string[]
  currentModule?: string
  streakDays: number
  totalStudyTime: number
}

export default function LearnPage() {
  const [modules, setModules] = useState<LearningModule[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLearningData()
  }, [])

  const fetchLearningData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [progressResponse, modulesResponse] = await Promise.all([
        fetch('/api/learning-hub?action=progress'),
        fetch('/api/learning-hub?action=modules')
      ])

      const progressData = await progressResponse.json()
      const modulesData = await modulesResponse.json()

      if (modulesData.success) {
        setModules(modulesData.data.modules || [])
      }

      if (progressData.success) {
        setUserProgress(progressData.data)
        setData(progressData.data)
        console.log('Learning Hub loaded successfully!')
      }
    } catch (error) {
      console.error('Failed to load learning data:', error)
      setError('Failed to load learning data')
    } finally {
      setLoading(false)
    }
  }

  const startModule = async (moduleId: string) => {
    try {
      const response = await fetch('/api/learning-hub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start-module',
          moduleId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log('Module started successfully!')
        fetchLearningData() // Refresh data after starting module
      }
    } catch (error) {
      console.error('Failed to start module:', error)
      setError('Failed to start module')
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Learning Hub...</p>
          <p className="text-xs text-muted-foreground mt-2">Connecting to server-side backend...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500">
            <Trophy className="h-12 w-12 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold">Unable to Load Learning Hub</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => { setError(null); fetchLearningData(); }} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (data) {
    const progressPercentage = data.totalXP > 0 ? (data.currentXP / data.totalXP) * 100 : 0

    return (
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Learning Hub</h1>
            <Badge variant="secondary" className="ml-auto">
              🚀 Server-Side Backend Active
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Comprehensive learning system with server-side data management and caching
          </p>
        </div>

        {/* User Progress Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Level {data.level} Farmer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress to Level {data.level + 1}: {data.nextLevel}</span>
                  <span className="text-muted-foreground">{data.currentXP} / {data.totalXP} XP</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-chart-3" />
                  <span className="text-muted-foreground">{data.achievements.length} Achievements</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-chart-2" />
                  <span className="text-muted-foreground">{data.completedModules.length} Modules Done</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-chart-1" />
                  <span className="text-muted-foreground">{data.streakDays} Day Streak</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Backend API Performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Learning Hub API</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Module management and progress</li>
                  <li>• Interactive assessments</li>
                  <li>• Achievement system</li>
                  <li>• Leaderboards and analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Server-side optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Cache Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Redis-based caching</li>
                  <li>• TTL-based invalidation</li>
                  <li>• Category-specific cache</li>
                  <li>• Performance optimization</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/learn/modules">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
                    <BookOpen className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Learning Modules</CardTitle>
                    <CardDescription>NASA dataset lessons</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Interactive courses on satellite data interpretation and application
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/learn/assessments">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/20">
                    <Award className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Assessments</CardTitle>
                    <CardDescription>Test your knowledge</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Evaluate your understanding with practical challenges
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/learn/progress">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/20">
                    <Trophy className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Progression</CardTitle>
                    <CardDescription>Track your growth</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View your level progression from Novice to Master Navigator
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Available Learning Modules */}
        {modules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Available Learning Modules</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.slice(0, 6).map((module) => {
                const isCompleted = data?.completedModules?.includes(module.id) || false
                const moduleProgress = isCompleted ? 100 : (module.progress || 0)
                
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{module.title}</CardTitle>
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {module.xp} XP
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {module.duration} • {module.xp} XP
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                      {moduleProgress > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{moduleProgress}%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${moduleProgress}%` }} />
                          </div>
                        </div>
                      )}
                      <Button 
                        className="w-full" 
                        variant={isCompleted ? "secondary" : "default"}
                        onClick={() => startModule(module.id)}
                      >
                        {isCompleted ? (
                          <>
                            <Award className="h-4 w-4 mr-2" />
                            Review Module
                          </>
                        ) : moduleProgress > 0 ? (
                          <>
                            Continue Learning
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Start Learning
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {modules.length > 6 && (
              <div className="text-center">
                <Link href="/learn/modules">
                  <Button variant="outline">
                    View All {modules.length} Modules
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // If no data from API yet, show basic interface with available modules
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Hub</h1>
        </div>
        <p className="text-gray-600">Master sustainable farming with NASA satellite data and advanced agricultural techniques</p>
      </div>

      {/* Progress Overview */}
      {userProgress && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Level {userProgress.level || 1} - {userProgress.nextLevel || 'Learning'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userProgress.currentXP || 0}</div>
                  <div className="text-sm text-gray-600">Experience Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userProgress.streakDays || 0}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Array.isArray(userProgress.completedModules) ? userProgress.completedModules.length : userProgress.completedModules || 0}</div>
                  <div className="text-sm text-gray-600">Modules Completed</div>
                </div>
              </div>
              {userProgress.totalXP && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to next level</span>
                    <span>{userProgress.currentXP} / {userProgress.totalXP} XP</span>
                  </div>
                  <Progress 
                    value={(userProgress.currentXP / userProgress.totalXP) * 100}
                    className="h-2"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Available Modules */}
      {modules.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">All Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module: LearningModule) => {
              const isCompleted = data?.completedModules?.includes(module.id) || module.completed
              const moduleProgress = isCompleted ? 100 : (module.progress || 0)
              
              return (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {module.xp} XP
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{module.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Module Stats */}
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{module.duration}</span>
                        <span>{module.xp} XP Reward</span>
                      </div>

                      {/* Progress Bar */}
                      {moduleProgress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{moduleProgress}%</span>
                          </div>
                          <Progress value={moduleProgress} className="h-2" />
                        </div>
                      )}

                      {/* Content Sections Preview */}
                      {module.content?.sections && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {module.content.sections.length} sections
                          </Badge>
                          {module.content.resources && (
                            <Badge variant="outline" className="text-xs">
                              +{module.content.resources.length} resources
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button 
                        onClick={() => startModule(module.id)}
                        className="w-full"
                        variant={isCompleted ? "secondary" : "default"}
                      >
                        {isCompleted ? (
                          <>
                            <Award className="h-4 w-4 mr-2" />
                            Review Module
                          </>
                        ) : moduleProgress > 0 ? (
                          <>
                            Continue Learning
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Start Learning
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* No modules state */}
      {modules.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No modules available</h3>
          <p className="text-gray-600">
            Learning modules are currently being loaded from the server.
          </p>
          <Button onClick={fetchLearningData} variant="outline" className="mt-4">
            Refresh
          </Button>
        </div>
      )}
    </div>
  )
}