/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/prefer-destructuring, max-statements */
/** biome-ignore-all lint/nursery/useDestructuring: x */
import { tool } from 'ai'
import { z } from 'zod'

interface LatLon {
  latitude: number
  longitude: number
}

interface WeatherAtLocation {
  cityName?: string
  current: {
    interval: number
    temperature_2m: number
    time: string
  }
  current_units: {
    interval: string
    temperature_2m: string
    time: string
  }
  daily: {
    sunrise: string[]
    sunset: string[]
    time: string[]
  }
  daily_units: {
    sunrise: string
    sunset: string
    time: string
  }
  elevation: number
  generationtime_ms: number
  hourly: {
    temperature_2m: number[]
    time: string[]
  }
  hourly_units: {
    temperature_2m: string
    time: string
  }
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  utc_offset_seconds: number
}
const geocodeCity = async (city: string): Promise<LatLon | null> => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      )

      if (!response.ok) return null

      const data = await response.json()

      if (!data.results || data.results.length === 0) return null

      const result = data.results[0]
      return {
        latitude: result.latitude,
        longitude: result.longitude
      }
    } catch {
      return null
    }
  },
  getWeather = tool({
    description: 'Get the current weather at a location. You can provide either coordinates or a city name.',
    execute: async input => {
      let latitude: number, longitude: number

      if (input.city) {
        const coords = await geocodeCity(input.city)
        if (!coords)
          return {
            error: `Could not find coordinates for "${input.city}". Please check the city name.`
          }

        latitude = coords.latitude
        longitude = coords.longitude
      } else if (input.latitude !== undefined && input.longitude !== undefined) {
        latitude = input.latitude
        longitude = input.longitude
      } else
        return {
          error: 'Please provide either a city name or both latitude and longitude coordinates.'
        }

      const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
        ),
        weatherData = await response.json()

      if ('city' in input) weatherData.cityName = input.city

      return weatherData as WeatherAtLocation
    },
    inputSchema: z.object({
      city: z.string().describe("City name (e.g., 'San Francisco', 'New York', 'London')").optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }),
    needsApproval: true
  })

export type { WeatherAtLocation }
export default getWeather
