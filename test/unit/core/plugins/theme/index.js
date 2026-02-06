/**
 * @prettier
 */

/**
 * Comprehensive Jest unit test suite for the core theme plugin.
 *
 * Tests validate the complete plugin contract:
 *   - Plugin factory registration (statePlugins.theme with actions, reducers,
 *     selectors, and afterLoad lifecycle hook)
 *   - SET_THEME action constant ('theme_set_theme')
 *   - setTheme thunk action creator (value validation, localStorage persistence,
 *     matchMedia auto-resolution, DOM class toggling, dispatched action shape)
 *   - Immutable.js reducer (Map state.set('currentTheme', payload))
 *   - currentTheme selector (defaults to 'light')
 *   - isDarkMode selector (resolves 'auto' via matchMedia)
 *   - afterLoad lifecycle hook (config read, localStorage check, auto-resolution,
 *     initial dispatch, media query change listener attachment)
 *   - Invalid theme value fallback to 'light'
 *
 * Test conventions follow:
 *   - test/unit/core/plugins/configs/actions.js (thunk/system mock pattern)
 *   - test/unit/core/plugins/oas3/reducers.js (Immutable fromJS state setup)
 *   - test/unit/core/plugins/auth/selectors.js (selector testing pattern)
 *   - test/unit/standalone/plugins/top-bar/DarkModeToggle.jsx (matchMedia mock)
 *   - test/unit/core/plugins/spec/reducer.js (computed key reducer access)
 */

import { fromJS } from "immutable"
import ThemePlugin from "core/plugins/theme"
import { SET_THEME, setTheme } from "core/plugins/theme/actions"
import reducers from "core/plugins/theme/reducers"
import { currentTheme, isDarkMode } from "core/plugins/theme/selectors"
import afterLoad from "core/plugins/theme/after-load"

describe("theme plugin", () => {
  /**
   * Global matchMedia mock setup following the exact pattern from
   * test/unit/standalone/plugins/top-bar/DarkModeToggle.jsx lines 17-29.
   *
   * Sets writable:true so individual tests can override with specific
   * matches values for auto-mode resolution testing.
   */
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

  afterEach(() => {
    // Restore all spied methods (localStorage spies, classList spies, etc.)
    jest.restoreAllMocks()

    // Remove dark-mode class from documentElement to ensure clean slate
    document.documentElement.classList.remove("dark-mode")

    // Reset matchMedia mock to default (matches: false) between tests
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })

  // =========================================================================
  // Section 1: Plugin factory registration tests
  // =========================================================================
  describe("plugin factory registration", () => {
    it("should return a plugin descriptor with statePlugins.theme namespace", () => {
      const plugin = ThemePlugin()

      expect(plugin).toBeDefined()
      expect(plugin.statePlugins).toBeDefined()
      expect(plugin.statePlugins.theme).toBeDefined()
    })

    it("should have actions, reducers, and selectors in theme namespace", () => {
      const plugin = ThemePlugin()
      const themeNamespace = plugin.statePlugins.theme

      expect(themeNamespace.actions).toBeDefined()
      expect(themeNamespace.reducers).toBeDefined()
      expect(themeNamespace.selectors).toBeDefined()
    })

    it("should have an afterLoad lifecycle hook", () => {
      const plugin = ThemePlugin()

      expect(plugin.afterLoad).toBeDefined()
      expect(typeof plugin.afterLoad).toBe("function")
    })
  })

  // =========================================================================
  // Section 2: Action constant and setTheme thunk tests
  // =========================================================================
  describe("actions", () => {
    describe("SET_THEME constant", () => {
      it("should equal 'theme_set_theme' following namespace_action convention", () => {
        // Matches naming pattern: configs_update, configs_toggle, layout_show, etc.
        expect(SET_THEME).toBe("theme_set_theme")
      })
    })

    describe("setTheme thunk action creator", () => {
      // Mock system object following config test pattern from
      // test/unit/core/plugins/configs/actions.js
      const system = {}

      it("should return { type: SET_THEME, payload: 'dark' } for dark theme", () => {
        const result = setTheme("dark")(system)

        expect(result).toEqual({ type: SET_THEME, payload: "dark" })
      })

      it("should return { type: SET_THEME, payload: 'light' } for light theme", () => {
        const result = setTheme("light")(system)

        expect(result).toEqual({ type: SET_THEME, payload: "light" })
      })

      it("should return { type: SET_THEME, payload: 'auto' } for auto theme — preserving user preference, not resolved value", () => {
        // Mock matchMedia to return matches:true (system prefers dark)
        window.matchMedia = jest.fn().mockImplementation((query) => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))

        const result = setTheme("auto")(system)

        // Payload stores the USER's preference 'auto', not the resolved 'dark'
        expect(result).toEqual({ type: SET_THEME, payload: "auto" })
      })

      it("should persist theme to localStorage under 'swagger-ui-theme' key", () => {
        const setItemSpy = jest.spyOn(
          Object.getPrototypeOf(window.localStorage),
          "setItem"
        )

        setTheme("dark")(system)

        expect(setItemSpy).toHaveBeenCalledWith("swagger-ui-theme", "dark")
      })

      it("should add 'dark-mode' class to documentElement when theme is dark", () => {
        const addSpy = jest.spyOn(document.documentElement.classList, "add")

        setTheme("dark")(system)

        expect(addSpy).toHaveBeenCalledWith("dark-mode")
      })

      it("should remove 'dark-mode' class from documentElement when theme is light", () => {
        // Pre-set dark-mode class to verify removal
        document.documentElement.classList.add("dark-mode")
        const removeSpy = jest.spyOn(
          document.documentElement.classList,
          "remove"
        )

        setTheme("light")(system)

        expect(removeSpy).toHaveBeenCalledWith("dark-mode")
      })

      it("should add 'dark-mode' class when auto resolves to dark via matchMedia", () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))

        setTheme("auto")(system)

        expect(document.documentElement.classList.contains("dark-mode")).toBe(
          true
        )
      })

      it("should remove 'dark-mode' class when auto resolves to light via matchMedia", () => {
        // Pre-set dark-mode class to verify removal
        document.documentElement.classList.add("dark-mode")

        window.matchMedia = jest.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))

        setTheme("auto")(system)

        expect(document.documentElement.classList.contains("dark-mode")).toBe(
          false
        )
      })

      it("should fallback to 'light' for invalid theme values and remove dark-mode class", () => {
        // Pre-set dark-mode to confirm it gets removed
        document.documentElement.classList.add("dark-mode")

        const result = setTheme("invalid-value")(system)

        expect(result.payload).toBe("light")
        expect(document.documentElement.classList.contains("dark-mode")).toBe(
          false
        )
      })

      it("should handle localStorage errors gracefully without throwing", () => {
        jest
          .spyOn(Object.getPrototypeOf(window.localStorage), "setItem")
          .mockImplementation(() => {
            throw new Error("QuotaExceededError")
          })

        // Should not throw; action should still return correctly
        const result = setTheme("dark")(system)

        expect(result).toEqual({ type: SET_THEME, payload: "dark" })
      })
    })
  })

  // =========================================================================
  // Section 3: SET_THEME reducer tests
  // =========================================================================
  describe("reducers", () => {
    // Access reducer via computed key pattern from
    // test/unit/core/plugins/spec/reducer.js line 9
    const setThemeReducer = reducers["theme_set_theme"]

    it("should have a handler function for SET_THEME", () => {
      expect(setThemeReducer).toBeDefined()
      expect(typeof setThemeReducer).toBe("function")
    })

    it("should set currentTheme to 'dark' from empty state", () => {
      // Immutable fromJS state setup pattern from oas3/reducers.js
      const state = fromJS({})
      const result = setThemeReducer(state, { payload: "dark" })

      expect(result.get("currentTheme")).toBe("dark")
    })

    it("should set currentTheme to 'light' from empty state", () => {
      const state = fromJS({})
      const result = setThemeReducer(state, { payload: "light" })

      expect(result.get("currentTheme")).toBe("light")
    })

    it("should overwrite existing currentTheme value", () => {
      const state = fromJS({ currentTheme: "light" })
      const result = setThemeReducer(state, { payload: "dark" })

      expect(result.get("currentTheme")).toBe("dark")
    })

    it("should store 'auto' as the currentTheme value", () => {
      const state = fromJS({})
      const result = setThemeReducer(state, { payload: "auto" })

      expect(result.get("currentTheme")).toBe("auto")
    })
  })

  // =========================================================================
  // Section 4: Selector tests
  // =========================================================================
  describe("selectors", () => {
    describe("currentTheme", () => {
      it("should return the stored theme value", () => {
        const state = fromJS({ currentTheme: "dark" })

        expect(currentTheme(state)).toBe("dark")
      })

      it("should default to 'light' when state is empty", () => {
        const state = fromJS({})

        expect(currentTheme(state)).toBe("light")
      })

      it("should return 'auto' when stored as auto", () => {
        const state = fromJS({ currentTheme: "auto" })

        expect(currentTheme(state)).toBe("auto")
      })
    })

    describe("isDarkMode", () => {
      it("should return true when currentTheme is 'dark'", () => {
        const state = fromJS({ currentTheme: "dark" })

        expect(isDarkMode(state)).toBe(true)
      })

      it("should return false when currentTheme is 'light'", () => {
        const state = fromJS({ currentTheme: "light" })

        expect(isDarkMode(state)).toBe(false)
      })

      it("should resolve 'auto' to true when system prefers dark via matchMedia", () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
          matches: true,
          media: query,
        }))
        const state = fromJS({ currentTheme: "auto" })

        expect(isDarkMode(state)).toBe(true)
      })

      it("should resolve 'auto' to false when system prefers light via matchMedia", () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
        }))
        const state = fromJS({ currentTheme: "auto" })

        expect(isDarkMode(state)).toBe(false)
      })

      it("should return false when state is empty (defaults to light)", () => {
        const state = fromJS({})

        expect(isDarkMode(state)).toBe(false)
      })
    })
  })

  // =========================================================================
  // Section 5: afterLoad lifecycle hook tests
  // =========================================================================
  describe("afterLoad lifecycle hook", () => {
    it("should read theme from system.getConfigs()", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue(null)

      const system = {
        getConfigs: jest.fn(() => ({ theme: "light" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      expect(system.getConfigs).toHaveBeenCalled()
    })

    it("should dispatch setTheme with the configured theme value", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue(null)

      const system = {
        getConfigs: jest.fn(() => ({ theme: "dark" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      expect(system.themeActions.setTheme).toHaveBeenCalledWith("dark")
    })

    it("should apply dark-mode class to documentElement for dark theme", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue(null)

      const system = {
        getConfigs: jest.fn(() => ({ theme: "dark" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      expect(document.documentElement.classList.contains("dark-mode")).toBe(
        true
      )
    })

    it("should use localStorage override when it takes precedence over config", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue("dark")

      const system = {
        getConfigs: jest.fn(() => ({ theme: "light" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      // localStorage value 'dark' overrides config 'light'
      expect(system.themeActions.setTheme).toHaveBeenCalledWith("dark")
    })

    it("should resolve auto mode and add dark-mode class when system prefers dark", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue(null)

      const addEventListenerMock = jest.fn()
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      const system = {
        getConfigs: jest.fn(() => ({ theme: "auto" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      expect(document.documentElement.classList.contains("dark-mode")).toBe(
        true
      )
    })

    it("should attach media query change listener when theme is 'auto'", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue(null)

      const addEventListenerMock = jest.fn()
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      const system = {
        getConfigs: jest.fn(() => ({ theme: "auto" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      expect(addEventListenerMock).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      )
    })

    it("should NOT attach media query change listener for non-auto modes", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue(null)

      const addEventListenerMock = jest.fn()
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      const system = {
        getConfigs: jest.fn(() => ({ theme: "dark" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      // For 'dark' theme, matchMedia is never called, so no listener attached
      expect(addEventListenerMock).not.toHaveBeenCalled()
    })

    it("should default to 'light' when no config theme is set", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue(null)

      const system = {
        getConfigs: jest.fn(() => ({})),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      expect(system.themeActions.setTheme).toHaveBeenCalledWith("light")
    })

    it("should ignore invalid localStorage values and use config theme", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue("invalid-stored-value")

      const system = {
        getConfigs: jest.fn(() => ({ theme: "dark" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      // Invalid localStorage value is rejected; falls through to config theme 'dark'
      expect(system.themeActions.setTheme).toHaveBeenCalledWith("dark")
    })

    it("should handle localStorage errors gracefully during read", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockImplementation(() => {
          throw new Error("SecurityError")
        })

      const system = {
        getConfigs: jest.fn(() => ({ theme: "dark" })),
        themeActions: { setTheme: jest.fn() },
      }

      // Should not throw
      afterLoad(system)

      // Falls back to config theme value
      expect(system.themeActions.setTheme).toHaveBeenCalledWith("dark")
    })

    it("should invoke media query change callback to update DOM and re-dispatch on system preference change", () => {
      jest
        .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
        .mockReturnValue(null)

      let capturedChangeHandler = null
      const addEventListenerMock = jest
        .fn()
        .mockImplementation((event, handler) => {
          if (event === "change") {
            capturedChangeHandler = handler
          }
        })
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      const system = {
        getConfigs: jest.fn(() => ({ theme: "auto" })),
        themeActions: { setTheme: jest.fn() },
      }

      afterLoad(system)

      // Verify a change handler was captured
      expect(capturedChangeHandler).not.toBeNull()

      // Simulate system switching to dark mode
      capturedChangeHandler({ matches: true })

      expect(document.documentElement.classList.contains("dark-mode")).toBe(
        true
      )
      // Re-dispatches 'auto' to trigger state re-resolution in selectors
      expect(system.themeActions.setTheme).toHaveBeenLastCalledWith("auto")

      // Simulate system switching back to light mode
      capturedChangeHandler({ matches: false })

      expect(document.documentElement.classList.contains("dark-mode")).toBe(
        false
      )
    })
  })
})
