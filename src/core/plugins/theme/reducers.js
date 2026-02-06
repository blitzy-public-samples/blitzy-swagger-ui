/**
 * @prettier
 */

import { SET_THEME } from "./actions"

/**
 * Immutable reducer map for the theme plugin state slice.
 *
 * Handles the SET_THEME action by storing the theme value in the
 * Immutable.js Map state under the 'currentTheme' key. The stored
 * value is the user's chosen theme string ('light', 'dark', or 'auto')
 * as dispatched by the setTheme action creator in actions.js.
 *
 * Pattern reference: src/core/plugins/configs/reducers.js
 *   - Uses computed property keys from imported action constants
 *   - Each handler is a pure (state, action) => newState function
 *   - Uses Immutable.js Map .set() for single scalar value storage
 *     (as opposed to .merge(fromJS(...)) used for object payloads)
 *
 * The initial state for the theme slice is an empty Immutable.Map,
 * automatically created by system.js createReducer when no explicit
 * initial state is provided.
 *
 * Only one action type is handled. Any other actions dispatched to
 * this namespace are ignored per the established reducer map pattern
 * used across all Swagger UI core plugins.
 */
export default {
  [SET_THEME]: (state, action) => state.set("currentTheme", action.payload),
}
