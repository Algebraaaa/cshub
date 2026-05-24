import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { AchievementsProvider } from './contexts/AchievementsContext'

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <AchievementsProvider>
            {children}
          </AchievementsProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
