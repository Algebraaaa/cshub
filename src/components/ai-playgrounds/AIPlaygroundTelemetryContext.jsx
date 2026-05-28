import { createContext, useContext } from 'react'

const AIPlaygroundTelemetryContext = createContext(null)

export function AIPlaygroundTelemetryProvider({ onSnapshotChange, children }) {
  return (
    <AIPlaygroundTelemetryContext.Provider value={onSnapshotChange || null}>
      {children}
    </AIPlaygroundTelemetryContext.Provider>
  )
}

export function useAIPlaygroundTelemetry() {
  return useContext(AIPlaygroundTelemetryContext)
}
