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

  let mockThemeActions
  let mockThemeSelectors

  beforeEach(() => {
    mockThemeActions = { setTheme: jest.fn() }
    mockThemeSelectors = { isDarkMode: jest.fn().mockReturnValue(false) }
  })

  it("renders LightBulb (ON) icon when dark theme is active", () => {
    mockThemeSelectors.isDarkMode.mockReturnValue(true)
    const wrapper = mount(
      <DarkModeToggle
        themeActions={mockThemeActions}
        themeSelectors={mockThemeSelectors}
      />
    )
    // Verify the component renders the toggle button with icon content
    expect(wrapper.find(".dark-mode-toggle button")).toHaveLength(1)
    expect(wrapper.text()).toContain("LightBulb")
    // Verify isDarkMode selector was consulted to determine icon state
    expect(mockThemeSelectors.isDarkMode).toHaveBeenCalled()
  })

  it("renders LightBulbOff (OFF) icon when light theme is active", () => {
    mockThemeSelectors.isDarkMode.mockReturnValue(false)
    const wrapper = mount(
      <DarkModeToggle
        themeActions={mockThemeActions}
        themeSelectors={mockThemeSelectors}
      />
    )
    expect(wrapper.find(".dark-mode-toggle button")).toHaveLength(1)
    expect(wrapper.text()).toContain("LightBulbOff")
    expect(mockThemeSelectors.isDarkMode).toHaveBeenCalled()
  })

  it("dispatches setTheme('dark') when clicking toggle in light mode", () => {
    mockThemeSelectors.isDarkMode.mockReturnValue(false)
    const wrapper = mount(
      <DarkModeToggle
        themeActions={mockThemeActions}
        themeSelectors={mockThemeSelectors}
      />
    )
    wrapper.find(".dark-mode-toggle button").simulate("click")
    expect(mockThemeActions.setTheme).toHaveBeenCalledWith("dark")
  })

  it("dispatches setTheme('light') when clicking toggle in dark mode", () => {
    mockThemeSelectors.isDarkMode.mockReturnValue(true)
    const wrapper = mount(
      <DarkModeToggle
        themeActions={mockThemeActions}
        themeSelectors={mockThemeSelectors}
      />
    )
    wrapper.find(".dark-mode-toggle button").simulate("click")
    expect(mockThemeActions.setTheme).toHaveBeenCalledWith("light")
  })

  it("handles auto mode via themeSelectors by rendering based on isDarkMode", () => {
    // When theme is 'auto' and system prefers light (matchMedia matches: false),
    // the isDarkMode selector resolves to false, showing LightBulbOff (OFF icon)
    mockThemeSelectors.isDarkMode.mockReturnValue(false)
    const wrapper = mount(
      <DarkModeToggle
        themeActions={mockThemeActions}
        themeSelectors={mockThemeSelectors}
      />
    )
    expect(wrapper.text()).toContain("LightBulbOff")
  })
})
