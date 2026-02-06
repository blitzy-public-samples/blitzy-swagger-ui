/**
 * @prettier
 */

import { SET_THEME } from "./actions"

/**
 * Immutable reducer for the theme plugin state slice.
 *
 * Handles the SET_THEME action by storing the resolved theme string
 * ('light', 'dark', or 'auto') in the Immutable.js Map state under
 * the 'currentTheme' key.
 *
 * Follows the identical reducer pattern from
 * src/core/plugins/configs/reducers.js using computed property keys
 * from imported action constants.
 *
 * The initial state for the theme slice is automatically an empty
 * Immutable.Map (the system.js createReducer function initializes
 * with fromJS(Map()) if no initial state is specified).
 */
export default {
  [SET_THEME]: (state, action) => state.set("currentTheme", action.payload),
}
