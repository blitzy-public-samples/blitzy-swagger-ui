/**
 * @prettier
 */
import React, { Component } from "react"
import PropTypes from "prop-types"

import LightBulb from "../assets/lightbulb.svg"
import LightBulbOff from "../assets/lightbulb-off.svg"

class DarkModeToggle extends Component {
  constructor(props) {
    super(props)
    this.toggleTheme = this.toggleTheme.bind(this)
  }

  toggleTheme() {
    const { themeActions, themeSelectors } = this.props
    const isDarkMode = themeSelectors?.isDarkMode?.() ?? false

    if (themeActions) {
      themeActions.setTheme(isDarkMode ? "light" : "dark")
    } else {
      document.documentElement.classList.toggle("dark-mode")
    }
  }

  render() {
    const { themeSelectors } = this.props
    const isDarkMode = themeSelectors?.isDarkMode?.() ?? false

    return (
      <div className="dark-mode-toggle">
        <button onClick={this.toggleTheme}>
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
