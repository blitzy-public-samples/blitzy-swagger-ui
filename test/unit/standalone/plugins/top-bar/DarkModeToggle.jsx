/**
 * @prettier
 */
import React from "react"
import { mount } from "enzyme"
import DarkModeToggle from "standalone/plugins/top-bar/components/DarkModeToggle"

jest.mock("standalone/plugins/top-bar/assets/lightbulb.svg", () => () => (
  <div>LightBulb</div>
))
jest.mock("standalone/plugins/top-bar/assets/lightbulb-off.svg", () => () => (
  <div>LightBulbOff</div>
))

describe("DarkModeToggle Component", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  beforeEach(() => {
    document.documentElement.classList.remove("dark-mode")
  })

  describe("with theme plugin props (config-driven mode)", () => {
    it("reads isDarkMode from themeSelectors", () => {
      const themeSelectors = {
        currentTheme: jest.fn(() => "dark"),
        isDarkMode: jest.fn(() => true),
      }
      const themeActions = {
        setTheme: jest.fn(),
      }

      const wrapper = mount(
        <DarkModeToggle
          themeSelectors={themeSelectors}
          themeActions={themeActions}
        />
      )

      expect(themeSelectors.isDarkMode).toHaveBeenCalled()
      // Should render the LightBulb (on) icon when dark mode is active
      expect(wrapper.find(".dark-mode-toggle button").exists()).toBe(true)
    })

    it("dispatches setTheme('light') when toggling from dark mode", () => {
      const themeSelectors = {
        currentTheme: jest.fn(() => "dark"),
        isDarkMode: jest.fn(() => true),
      }
      const themeActions = {
        setTheme: jest.fn(),
      }

      const wrapper = mount(
        <DarkModeToggle
          themeSelectors={themeSelectors}
          themeActions={themeActions}
        />
      )

      wrapper.find(".dark-mode-toggle button").simulate("click")
      expect(themeActions.setTheme).toHaveBeenCalledWith("light")
    })

    it("dispatches setTheme('dark') when toggling from light mode", () => {
      const themeSelectors = {
        currentTheme: jest.fn(() => "light"),
        isDarkMode: jest.fn(() => false),
      }
      const themeActions = {
        setTheme: jest.fn(),
      }

      const wrapper = mount(
        <DarkModeToggle
          themeSelectors={themeSelectors}
          themeActions={themeActions}
        />
      )

      wrapper.find(".dark-mode-toggle button").simulate("click")
      expect(themeActions.setTheme).toHaveBeenCalledWith("dark")
    })

    it("dispatches setTheme('light') when toggling from auto-dark mode", () => {
      const themeSelectors = {
        currentTheme: jest.fn(() => "auto"),
        isDarkMode: jest.fn(() => true),
      }
      const themeActions = {
        setTheme: jest.fn(),
      }

      const wrapper = mount(
        <DarkModeToggle
          themeSelectors={themeSelectors}
          themeActions={themeActions}
        />
      )

      wrapper.find(".dark-mode-toggle button").simulate("click")
      expect(themeActions.setTheme).toHaveBeenCalledWith("light")
    })
  })

  describe("without theme plugin props (fallback mode)", () => {
    it("toggles the dark class on the html element when no themeActions provided", () => {
      const wrapper = mount(<DarkModeToggle />)
      const htmlElement = document.documentElement

      expect(htmlElement.classList.contains("dark-mode")).toBe(false)

      wrapper.find(".dark-mode-toggle button").simulate("click")

      expect(htmlElement.classList.contains("dark-mode")).toBe(true)

      wrapper.find(".dark-mode-toggle button").simulate("click")

      expect(htmlElement.classList.contains("dark-mode")).toBe(false)
    })
  })

  describe("rendering", () => {
    it("renders a button inside a dark-mode-toggle div", () => {
      const wrapper = mount(<DarkModeToggle />)
      expect(wrapper.find(".dark-mode-toggle").exists()).toBe(true)
      expect(wrapper.find(".dark-mode-toggle button").exists()).toBe(true)
    })
  })
})
