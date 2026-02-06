/**
 * @prettier
 */
import { fromJS } from "immutable"
import {
  SET_THEME,
  setTheme,
} from "../../../../../src/core/plugins/theme/actions"
import reducers from "../../../../../src/core/plugins/theme/reducers"
import {
  currentTheme,
  isDarkMode,
} from "../../../../../src/core/plugins/theme/selectors"
import afterLoad from "../../../../../src/core/plugins/theme/after-load"

describe("theme plugin", () => {
  // ===== Actions =====
  describe("actions", () => {
    describe("SET_THEME constant", () => {
      it("should be defined", () => {
        expect(SET_THEME).toBeDefined()
      })

      it("should be a string", () => {
        expect(typeof SET_THEME).toBe("string")
      })

      it("should follow namespace_action naming convention", () => {
        expect(SET_THEME).toBe("theme_set_theme")
      })
    })

    describe("setTheme action creator", () => {
      beforeEach(() => {
        document.documentElement.classList.remove("dark-mode")
        jest.restoreAllMocks()
      })

      it("should be a function", () => {
        expect(typeof setTheme).toBe("function")
      })

      it("should return a thunk function", () => {
        const thunk = setTheme("dark")
        expect(typeof thunk).toBe("function")
      })

      it("should return an action with SET_THEME type", () => {
        const action = setTheme("dark")()
        expect(action.type).toBe(SET_THEME)
        expect(action.payload).toBe("dark")
      })

      it("should persist theme to localStorage", () => {
        const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem")
        setTheme("dark")()
        expect(setItemSpy).toHaveBeenCalledWith("swagger-ui-theme", "dark")
      })

      it("should add dark-mode class when theme is dark", () => {
        setTheme("dark")()
        expect(document.documentElement.classList.contains("dark-mode")).toBe(
          true
        )
      })

      it("should remove dark-mode class when theme is light", () => {
        document.documentElement.classList.add("dark-mode")
        setTheme("light")()
        expect(document.documentElement.classList.contains("dark-mode")).toBe(
          false
        )
      })

      it("should default to light for invalid theme values", () => {
        const action = setTheme("invalid")()
        expect(action.payload).toBe("light")
      })

      it("should handle localStorage errors gracefully", () => {
        jest
          .spyOn(window.localStorage.__proto__, "setItem")
          .mockImplementation(() => {
            throw new Error("QuotaExceededError")
          })
        // Should not throw
        const action = setTheme("dark")()
        expect(action.type).toBe(SET_THEME)
      })
    })
  })

  // ===== Reducers =====
  describe("reducers", () => {
    it("should have a handler for SET_THEME", () => {
      expect(reducers[SET_THEME]).toBeDefined()
      expect(typeof reducers[SET_THEME]).toBe("function")
    })

    it("should set currentTheme in state", () => {
      const state = fromJS({})
      const action = { type: SET_THEME, payload: "dark" }
      const newState = reducers[SET_THEME](state, action)
      expect(newState.get("currentTheme")).toBe("dark")
    })

    it("should overwrite existing theme value", () => {
      const state = fromJS({ currentTheme: "dark" })
      const action = { type: SET_THEME, payload: "light" }
      const newState = reducers[SET_THEME](state, action)
      expect(newState.get("currentTheme")).toBe("light")
    })

    it("should store auto as the theme value", () => {
      const state = fromJS({})
      const action = { type: SET_THEME, payload: "auto" }
      const newState = reducers[SET_THEME](state, action)
      expect(newState.get("currentTheme")).toBe("auto")
    })
  })

  // ===== Selectors =====
  describe("selectors", () => {
    describe("currentTheme", () => {
      it("should return the current theme from state", () => {
        const state = fromJS({ currentTheme: "dark" })
        expect(currentTheme(state)).toBe("dark")
      })

      it("should default to light when not set", () => {
        const state = fromJS({})
        expect(currentTheme(state)).toBe("light")
      })

      it("should return auto when stored", () => {
        const state = fromJS({ currentTheme: "auto" })
        expect(currentTheme(state)).toBe("auto")
      })
    })

    describe("isDarkMode", () => {
      it("should return true when theme is dark", () => {
        const state = fromJS({ currentTheme: "dark" })
        expect(isDarkMode(state)).toBe(true)
      })

      it("should return false when theme is light", () => {
        const state = fromJS({ currentTheme: "light" })
        expect(isDarkMode(state)).toBe(false)
      })

      it("should return false when theme is not set", () => {
        const state = fromJS({})
        expect(isDarkMode(state)).toBe(false)
      })

      it("should resolve auto based on matchMedia", () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
          matches: true,
          media: query,
        }))
        const state = fromJS({ currentTheme: "auto" })
        expect(isDarkMode(state)).toBe(true)
      })

      it("should resolve auto to false when system prefers light", () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
        }))
        const state = fromJS({ currentTheme: "auto" })
        expect(isDarkMode(state)).toBe(false)
      })
    })
  })

  // ===== afterLoad =====
  describe("afterLoad", () => {
    beforeEach(() => {
      document.documentElement.classList.remove("dark-mode")
      jest.restoreAllMocks()
    })

    it("should be a function", () => {
      expect(typeof afterLoad).toBe("function")
    })

    it("should read theme from getConfigs", () => {
      const system = {
        getConfigs: jest.fn(() => ({ theme: "light" })),
        themeActions: { setTheme: jest.fn() },
      }
      afterLoad(system)
      expect(system.getConfigs).toHaveBeenCalled()
    })

    it("should dispatch setTheme with config theme value", () => {
      jest.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue(null)
      const system = {
        getConfigs: jest.fn(() => ({ theme: "dark" })),
        themeActions: { setTheme: jest.fn() },
      }
      afterLoad(system)
      expect(system.themeActions.setTheme).toHaveBeenCalledWith("dark")
    })

    it("should apply dark-mode class for dark theme", () => {
      jest.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue(null)
      const system = {
        getConfigs: jest.fn(() => ({ theme: "dark" })),
        themeActions: { setTheme: jest.fn() },
      }
      afterLoad(system)
      expect(document.documentElement.classList.contains("dark-mode")).toBe(
        true
      )
    })

    it("should use localStorage override over config", () => {
      jest
        .spyOn(window.localStorage.__proto__, "getItem")
        .mockReturnValue("dark")
      const system = {
        getConfigs: jest.fn(() => ({ theme: "light" })),
        themeActions: { setTheme: jest.fn() },
      }
      afterLoad(system)
      expect(system.themeActions.setTheme).toHaveBeenCalledWith("dark")
    })
  })
})
