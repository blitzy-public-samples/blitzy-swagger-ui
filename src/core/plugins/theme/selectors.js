/**
 * Selectors for the theme plugin state slice.
 *
 * These selectors read from the Immutable.js Map scoped to the `theme`
 * namespace by the Swagger UI plugin system.  They are injected into
 * components as `themeSelectors.currentTheme()` and
 * `themeSelectors.isDarkMode()`.
 *
 * Pattern references:
 *   - src/core/plugins/configs/selectors.js  (state.getIn / state.get)
 *   - src/core/plugins/layout/selectors.js   (state.get with default)
 */

/**
 * Returns the raw theme preference stored in state.
 *
 * @param  {Immutable.Map} state – theme namespace slice
 * @return {string} One of 'light', 'dark', or 'auto'. Defaults to 'light'
 *                  when the value has not been set.
 */
export const currentTheme = (state) => state.get("currentTheme", "light")

/**
 * Computes whether the UI should currently render in dark mode.
 *
 * Resolution logic:
 *   - 'dark'  → true
 *   - 'light' → false
 *   - 'auto'  → defers to the operating system's `prefers-color-scheme`
 *               media query via `window.matchMedia`.
 *
 * The `matchMedia` access is wrapped in a try/catch so that the selector
 * is safe to call in server-side rendering (SSR) environments where
 * `window` is not available.  In that case it falls back to `false`
 * (light mode).
 *
 * @param  {Immutable.Map} state – theme namespace slice
 * @return {boolean} `true` when the UI should display in dark mode.
 */
export const isDarkMode = (state) => {
  const theme = state.get("currentTheme", "light")

  if (theme === "dark") {
    return true
  }

  if (theme === "auto") {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    } catch (_) {
      // SSR or environments without window/matchMedia – default to light
      return false
    }
  }

  // 'light' or any unrecognised value
  return false
}
