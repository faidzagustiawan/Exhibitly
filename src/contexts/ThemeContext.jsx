import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  
  // Initialize dan apply theme saat mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    
    // Apply immediately
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(initialTheme)
    setTheme(initialTheme)
    
    console.log('Initial theme:', initialTheme)
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    
    // Remove both classes first
    document.documentElement.classList.remove('light', 'dark')
    // Add new theme class
    document.documentElement.classList.add(newTheme)
    
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    console.log('Theme toggled to:', newTheme)
    console.log('HTML classes:', document.documentElement.className)
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}