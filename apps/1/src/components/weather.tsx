'use client'

import { cn } from '@a/ui'
import { format, isWithinInterval } from 'date-fns'
import { Cloud, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { WeatherAtLocation } from '~/ai/tools/get-weather'

const n = (num: number): number => Math.ceil(num)

interface WeatherProps {
  weatherAtLocation: WeatherAtLocation
}
const Weather = ({ weatherAtLocation }: WeatherProps) => {
  const currentHigh = Math.max(...weatherAtLocation.hourly.temperature_2m.slice(0, 24)),
    currentLow = Math.min(...weatherAtLocation.hourly.temperature_2m.slice(0, 24)),
    isDay = isWithinInterval(new Date(weatherAtLocation.current.time), {
      end: new Date(weatherAtLocation.daily.sunset[0] ?? ''),
      start: new Date(weatherAtLocation.daily.sunrise[0] ?? '')
    }),
    [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(globalThis.innerWidth < 768)
    }

    handleResize()
    globalThis.addEventListener('resize', handleResize)

    return () => globalThis.removeEventListener('resize', handleResize)
  }, [])

  const hoursToShow = isMobile ? 5 : 10,
    currentTimeIndex = weatherAtLocation.hourly.time.findIndex(
      time => new Date(time) >= new Date(weatherAtLocation.current.time)
    ),
    displayTimes = weatherAtLocation.hourly.time.slice(currentTimeIndex, currentTimeIndex + hoursToShow),
    displayTemperatures = weatherAtLocation.hourly.temperature_2m.slice(currentTimeIndex, currentTimeIndex + hoursToShow),
    location =
      weatherAtLocation.cityName ?? `${weatherAtLocation.latitude.toFixed(1)}°, ${weatherAtLocation.longitude.toFixed(1)}°`

  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl p-4 shadow-lg backdrop-blur-sm',
        {
          'bg-linear-to-br from-sky-400 via-blue-500 to-blue-600': isDay
        },
        {
          'bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900': !isDay
        }
      )}>
      <div className='absolute inset-0 bg-white/10 backdrop-blur-sm' />

      <div className='relative z-10'>
        <div className='mb-2 flex items-center justify-between'>
          <div className='text-xs font-medium text-white/80'>{location}</div>
          <div className='text-xs text-white/60'>{format(new Date(weatherAtLocation.current.time), 'MMM d, h:mm a')}</div>
        </div>

        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={cn('text-white/90', {
                'text-blue-200': !isDay,
                'text-yellow-200': isDay
              })}>
              {isDay ? <Sun size={32} /> : <Moon size={32} />}
            </div>
            <div className='text-3xl font-light text-white'>
              {n(weatherAtLocation.current.temperature_2m)}
              <span className='text-lg text-white/80'>{weatherAtLocation.current_units.temperature_2m}</span>
            </div>
          </div>

          <div className='text-right'>
            <div className='text-xs font-medium text-white/90'>H: {n(currentHigh)}°</div>
            <div className='text-xs text-white/70'>L: {n(currentLow)}°</div>
          </div>
        </div>

        <div className='rounded-xl bg-white/10 p-3 backdrop-blur-sm'>
          <div className='mb-2 text-xs font-medium text-white/80'>Hourly Forecast</div>
          <div className='flex justify-between gap-1'>
            {displayTimes.map((time, index) => {
              const hourTime = new Date(time),
                isCurrentHour = hourTime.getHours() === new Date().getHours()

              return (
                <div
                  className={cn('flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-1 py-1.5', {
                    'bg-white/20': isCurrentHour
                  })}
                  key={time}>
                  <div className='text-xs font-medium text-white/70'>{index === 0 ? 'Now' : format(hourTime, 'ha')}</div>

                  <div
                    className={cn('text-white/60', {
                      'text-blue-200': !isDay,
                      'text-yellow-200': isDay
                    })}>
                    <Cloud size={16} />
                  </div>

                  <div className='text-xs font-medium text-white'>{n(displayTemperatures[index] ?? 0)}°</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className='mt-2 flex justify-between text-xs text-white/60'>
          <div>Sunrise: {format(new Date(weatherAtLocation.daily.sunrise[0] ?? ''), 'h:mm a')}</div>
          <div>Sunset: {format(new Date(weatherAtLocation.daily.sunset[0] ?? ''), 'h:mm a')}</div>
        </div>
      </div>
    </div>
  )
}

export default Weather
