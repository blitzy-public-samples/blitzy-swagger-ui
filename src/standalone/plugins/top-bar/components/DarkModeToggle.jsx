/**
 * @prettier
 */
import React, { Component } from "react"
import PropTypes from "prop-types"

import LightBulb from "../assets/lightbulb.svg"
import LightBulbOff from "../assets/lightbulb-off.svg"

class DarkModeToggle extends Component {
  render() {
    const { themeSelectors, themeActions } = this.props
    const isDarkMode = themeSelectors?.isDarkMode?.() ?? false

    return (
      <div className="dark-mode-toggle">
        <button
          onClick={() => {
            if (themeActions) {
              themeActions.setTheme(isDarkMode ? "light" : "dark")
            } else {
              document.documentElement.classList.toggle("dark-mode")
            }
          }}
        >
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

export default DarkModeToggle
