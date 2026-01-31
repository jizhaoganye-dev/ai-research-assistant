'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getSettings } from '@/lib/storage'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const settings = getSettings()
    setThemeState(settings.theme)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setResolvedTheme(systemDark ? 'dark' : 'light')
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateResolvedTheme)
    
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
  }, [theme, mounted])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    if (resolvedTheme === 'light') {
      root.classList.add('light-theme')
      root.style.setProperty('--foreground-rgb', '15, 23, 42')
      root.style.setProperty('--background-start-rgb', '241, 245, 249')
      root.style.setProperty('--background-end-rgb', '226, 232, 240')
    } else {
      root.classList.remove('light-theme')
      root.style.setProperty('--foreground-rgb', '255, 255, 255')
      root.style.setProperty('--background-start-rgb', '15, 23, 42')
      root.style.setProperty('--background-end-rgb', '2, 6, 23')
    }
  }, [resolvedTheme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
