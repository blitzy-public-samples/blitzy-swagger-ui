/**
 * @prettier
 */

/**
 * Theme plugin action constants and action creators.
 *
 * Exports SET_THEME action type and setTheme thunk action creator.
 * The setTheme thunk validates the theme value, persists to localStorage,
 * resolves 'auto' via matchMedia, applies the DOM class, and dispatches
 * the action to the Redux store.
 *
 * Follows the action creator patterns from:
 *   - src/core/plugins/configs/actions.js (thunk pattern)
 *   - src/core/plugins/layout/actions.js (constant naming)
 */

// Action type constant — follows <namespace>_<action> naming convention
export const SET_THEME = "theme_set_theme"

// Valid theme values for validation
const VALID_THEMES = ["light", "dark", "auto"]

// localStorage key for persisting theme preference (AAP section 0.7.7)
const STORAGE_KEY = "swagger-ui-theme"

/**
 * setTheme — Thunk action creator for changing the active theme.
 *
 * Accepts a theme value ('light', 'dark', or 'auto') and returns a thunk
 * that receives the system bag. The thunk:
 *   1. Validates the theme value (defaults to 'light' if invalid)
 *   2. Persists the choice to localStorage
 *   3. Resolves 'auto' to the effective display theme via matchMedia
 *   4. Applies or removes the 'dark-mode' CSS class on <html>
 *   5. Dispatches SET_THEME with the user's chosen theme as payload
 *
 * The payload preserves the user's original choice (including 'auto') so
 * that the media query listener in after-load.js can continue to react
 * to system preference changes.
 *
 * @param {string} themeValue - One of 'light', 'dark', or 'auto'
 * @returns {Function} Thunk function receiving the system bag
 */
export const setTheme = (themeValue) => () => {
  // Validate themeValue — default to 'light' if invalid
  const validatedTheme = VALID_THEMES.indexOf(themeValue) !== -1
    ? themeValue
    : "light"

  // Persist theme preference to localStorage
  try {
    window.localStorage.setItem(STORAGE_KEY, validatedTheme)
  } catch (e) {
    // localStorage may be unavailable in some environments (e.g., iframe
    // sandboxing, private browsing restrictions, or SSR). Silently ignore
    // the error — the theme will still apply for the current session.
  }

  // Resolve the effective display theme for DOM class application
  let resolvedTheme = validatedTheme

  if (validatedTheme === "auto") {
    try {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      resolvedTheme = prefersDark ? "dark" : "light"
    } catch (e) {
      // matchMedia may be unavailable in non-browser environments.
      // Default to light theme when detection is not possible.
      resolvedTheme = "light"
    }
  }

  // Apply or remove the 'dark-mode' CSS class on document.documentElement.
  // This mirrors the existing DarkModeToggle.jsx DOM manipulation pattern:
  //   document.documentElement.classList.add("dark-mode")
  //   document.documentElement.classList.remove("dark-mode")
  try {
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark-mode")
    } else {
      document.documentElement.classList.remove("dark-mode")
    }
  } catch (e) {
    // document may be unavailable in non-browser environments (e.g., SSR).
    // Silently ignore — the Redux state will still update correctly.
  }

  // Dispatch the Redux action with the user's chosen theme (not resolved).
  // Storing the original value (including 'auto') preserves the user's
  // intent so that the media query change listener can continue to
  // dynamically resolve the effective theme.
  return {
    type: SET_THEME,
    payload: validatedTheme,
  }
}
