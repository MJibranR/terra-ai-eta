/**
 * Enhanced Agricultural Data API Route
 * Combines NASA real-time data with Microsoft Planetary Computer high-resolution datasets
 * Provides comprehensive agricultural intelligence for farming simulation
 */

import { NextRequest, NextResponse } from 'next/server'
import { enhancedAgriculturalDataFetcher } from '@/lib/enhanced-agricultural-data-fetcher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { longitude, latitude, analysisType = 'comprehensive' } = body

    // Validate coordinates
    if (!longitude || !latitude) {
      return NextResponse.json(
        { error: 'Longitude and latitude are required' },
        { status: 400 }
      )
    }

    console.log(`🌍 Enhanced agricultural data request for: ${latitude}°N, ${longitude}°W`)
    console.log(`📊 Analysis type: ${analysisType}`)

    let response: any

    switch (analysisType) {
      case 'comprehensive':
        response = await enhancedAgriculturalDataFetcher.fetchEnhancedAgriculturalData(longitude, latitude)
        break
        
      case 'high-resolution':
        response = await enhancedAgriculturalDataFetcher.getUltraHighResCropAnalysis(longitude, latitude)
        break
        
      case 'crop-specific':
        const cropType = body.cropType
        response = await enhancedAgriculturalDataFetcher.getCropSpecificInsights(longitude, latitude, cropType)
        break
        
      case 'decision-support':
        const currentActions = body.currentActions || []
        response = await enhancedAgriculturalDataFetcher.getFarmingDecisionSupport(longitude, latitude, currentActions)
        break
        
      default:
        response = await enhancedAgriculturalDataFetcher.fetchEnhancedAgriculturalData(longitude, latitude)
    }

    // Add API metadata
    const enhancedResponse = {
      ...response,
      api: {
        version: '2.0',
        provider: 'NASA + Microsoft Planetary Computer',
        capabilities: [
          'Real-time NASA satellite data',
          'High-resolution Sentinel-2 imagery (10m)',
          'USDA crop classification',
          'Enhanced weather integration',
          'Precision agriculture insights',
          'Multi-source data fusion'
        ],
        dataQuality: {
          spatial: '10m to 1km resolution',
          temporal: 'Real-time to 5-day updates',
          accuracy: response.fusion?.confidenceLevel || 0.85
        }
      },
      gameIntegration: {
        ready: true,
        features: {
          ultraHighResolution: true,
          cropIdentification: !!response.microsoft?.cropType,
          precisionAgriculture: true,
          realTimeDecisions: true
        }
      }
    }

    console.log(`✅ Enhanced agricultural data delivered - Confidence: ${(response.fusion?.confidenceLevel || 0.85) * 100}%`)

    return NextResponse.json(enhancedResponse)

  } catch (error) {
    console.error('❌ Enhanced agricultural data API error:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch enhanced agricultural data',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallback: {
        nasa: {
          ndvi: 0.45,
          soilMoisture: 0.25,
          precipitation: 0.5,
          temperature: 22
        },
        microsoft: {
          highResNDVI: 0.48,
          resolution: '10m (simulated)',
          dataQuality: 75
        },
        fusion: {
          combinedNDVI: 0.46,
          confidenceLevel: 0.6,
          recommendations: ['Using fallback data due to API issues']
        }
      },
      api: {
        status: 'degraded',
        provider: 'Fallback simulation'
      }
    }, { status: 200 }) // Return 200 with fallback data instead of error
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests with query parameters
  const { searchParams } = new URL(request.url)
  const longitude = parseFloat(searchParams.get('longitude') || '0')
  const latitude = parseFloat(searchParams.get('latitude') || '0')
  const analysisType = searchParams.get('analysisType') || 'comprehensive'

  // Convert to POST request format
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ longitude, latitude, analysisType })
  })

  return POST(postRequest)
}