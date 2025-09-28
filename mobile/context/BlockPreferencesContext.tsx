import React from "react"

type ToggleKey = "youtubeShorts" | "instagramReels" | "tiktok" | "socialMediaGeneral"

type ToggleState = Record<ToggleKey, boolean>

type BlockPreferencesContextValue = {
  toggles: ToggleState
  setToggle: (key: ToggleKey, value: boolean) => void
  reset: () => void
}

const defaultToggles: ToggleState = {
  youtubeShorts: false,
  instagramReels: false,
  tiktok: false,
  socialMediaGeneral: false,
}

const BlockPreferencesContext = React.createContext<BlockPreferencesContextValue>({
  toggles: defaultToggles,
  setToggle: () => {},
  reset: () => {},
})

function reducer(state: ToggleState, action: { type: "set"; key: ToggleKey; value: boolean } | { type: "reset" }) {
  if (action.type === "reset") {
    return defaultToggles
  }

  return {
    ...state,
    [action.key]: action.value,
  }
}

function BlockPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, defaultToggles)

  const setToggle = React.useCallback((key: ToggleKey, value: boolean) => {
    dispatch({ type: "set", key, value })
  }, [])

  const reset = React.useCallback(() => {
    dispatch({ type: "reset" })
  }, [])

  const value = React.useMemo(
    () => ({
      toggles: state,
      setToggle,
      reset,
    }),
    [state, setToggle, reset],
  )

  return (
    <BlockPreferencesContext.Provider value={value}>
      {children}
    </BlockPreferencesContext.Provider>
  )
}

function useBlockPreferences() {
  return React.useContext(BlockPreferencesContext)
}

export {
  BlockPreferencesProvider,
  useBlockPreferences,
  defaultToggles,
}

export type { ToggleKey, ToggleState }
