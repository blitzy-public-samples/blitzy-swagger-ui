/**
 * @prettier
 */

const STORAGE_KEY = "swagger-ui-theme"
const VALID_THEMES = ["light", "dark", "auto"]

/**
 * afterLoad lifecycle hook for the theme plugin.
 *
 * Runs once during System initialization to bootstrap theme state.
 * Reads the 'theme' configuration value, checks localStorage for a
 * user-persisted preference, resolves 'auto' mode via matchMedia,
 * applies the dark-mode CSS class synchronously before first render,
 * dispatches the initial setTheme action to establish Redux state,
 * and attaches a media query change listener for runtime auto-mode
 * updates when the system color scheme preference changes.
 *
 * Execution order is critical — the CSS class is applied to
 * document.documentElement BEFORE the Redux dispatch to prevent
 * a flash of light content when theme is 'dark' or resolved as
 * dark via 'auto' (per AAP 0.7.5 performance constraint).
 *
 * @param {Object} system - The Swagger UI system bag providing access
 *   to getConfigs(), themeActions, and other plugin-injected APIs
 */
const afterLoad = (system) => {
  // Step 1: Read configured theme from SwaggerUI config options
  // Follows the pattern from auth/index.js afterLoad accessing system properties
  const configTheme = system.getConfigs().theme || "light"

  // Step 2: Check localStorage for a user-persisted theme preference
  // The key 'swagger-ui-theme' follows project naming convention (AAP 0.7.7)
  let effectiveTheme = configTheme
  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    if (storedTheme && VALID_THEMES.includes(storedTheme)) {
      effectiveTheme = storedTheme
    }
  } catch (e) {
    // localStorage unavailable (SSR, restricted environment, or privacy mode)
    // Fall through to use configTheme value
  }

  // Guard against invalid theme values from config or corrupted localStorage
  if (!VALID_THEMES.includes(effectiveTheme)) {
    effectiveTheme = "light"
  }

  // Step 3: Resolve 'auto' mode to determine the actual display theme
  // Uses the prefers-color-scheme media query to match OS-level preference
  let resolvedTheme = effectiveTheme
  if (effectiveTheme === "auto") {
    try {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches
      resolvedTheme = prefersDark ? "dark" : "light"
    } catch (e) {
      // matchMedia unavailable (SSR) — fall back to light
      resolvedTheme = "light"
    }
  }

  // Step 4: Apply the dark-mode CSS class SYNCHRONOUSLY before dispatching
  // This prevents a flash of light content when theme is 'dark' or resolved
  // as dark via 'auto'. The class must be on <html> before React renders.
  try {
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark-mode")
    } else {
      document.documentElement.classList.remove("dark-mode")
    }
  } catch (e) {
    // document unavailable (SSR) — skip DOM manipulation
  }

  // Step 5: Dispatch initial theme action to establish Redux state
  // effectiveTheme preserves the user's raw choice ('light', 'dark', or 'auto')
  // so 'auto' mode is maintained in state for the media query listener
  system.themeActions.setTheme(effectiveTheme)

  // Step 6: Attach media query change listener only when in 'auto' mode
  // This responds to runtime changes in the OS color scheme preference
  if (effectiveTheme === "auto") {
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", (e) => {
        // Update DOM class immediately based on new system preference
        try {
          if (e.matches) {
            document.documentElement.classList.add("dark-mode")
          } else {
            document.documentElement.classList.remove("dark-mode")
          }
        } catch (domError) {
          // document unavailable — skip DOM manipulation
        }
        // Re-dispatch 'auto' to trigger state re-resolution in selectors
        system.themeActions.setTheme("auto")
      })
    } catch (e) {
      // matchMedia unavailable (SSR) — no listener to attach
    }
  }
}

export default afterLoad
