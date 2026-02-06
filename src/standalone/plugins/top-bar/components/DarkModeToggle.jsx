/**
 * @prettier
 */
import React, { Component } from "react"
import PropTypes from "prop-types"

import LightBulb from "../assets/lightbulb.svg"
import LightBulbOff from "../assets/lightbulb-off.svg"

/**
 * DarkModeToggle — toggles the UI between light and dark mode.
 *
 * Reads the current theme state from the core theme plugin via
 * themeSelectors and dispatches theme changes via themeActions.
 * This replaces the previous internal state management with
 * config-driven theme state from the theme plugin, ensuring
 * synchronization with the 'theme' configuration parameter,
 * localStorage persistence, and system preference detection.
 */
class DarkModeToggle extends Component {
  constructor(props) {
    super(props)
    this.toggleIsDarkMode = this.toggleIsDarkMode.bind(this)
  }

  toggleIsDarkMode() {
    const { themeActions, themeSelectors } = this.props
    if (themeActions && themeSelectors) {
      const currentTheme = themeSelectors.currentTheme()
      const isDark = themeSelectors.isDarkMode()
      // Toggle between light and dark; if currently 'auto', resolve to the
      // opposite of whatever the auto mode resolved to
      const newTheme = isDark ? "light" : "dark"
      themeActions.setTheme(newTheme)
    } else {
      // Fallback for environments where the theme plugin is not available
      // (e.g., standalone builds without the core theme plugin registered).
      // Maintains backward compatibility with the original toggle behavior.
      document.documentElement.classList.toggle("dark-mode")
    }
  }

  render() {
    const { themeSelectors } = this.props
    // Derive isDarkMode from theme plugin selectors when available,
    // otherwise fall back to checking the DOM class directly
    let isDarkMode = false
    if (themeSelectors) {
      isDarkMode = themeSelectors.isDarkMode()
    } else {
      try {
        isDarkMode = document.documentElement.classList.contains("dark-mode")
      } catch (e) {
        // SSR safety
      }
    }

    return (
      <div className="dark-mode-toggle">
        <button onClick={this.toggleIsDarkMode}>
          {!isDarkMode ? (
            <LightBulbOff height="24" />
          ) : (
            <LightBulb height="24" />
          )}
        </button>
      </div>
    )
  }
}

DarkModeToggle.propTypes = {
  themeActions: PropTypes.object,
  themeSelectors: PropTypes.object,
}

DarkModeToggle.defaultProps = {
  themeActions: null,
  themeSelectors: null,
}

export default DarkModeToggle
