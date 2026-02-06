/**
 * @prettier
 */

import * as actions from "./actions"
import * as selectors from "./selectors"
import reducers from "./reducers"
import afterLoad from "./after-load"

/**
 * Theme plugin entry point.
 *
 * Factory function returning the plugin descriptor with
 * statePlugins.theme namespace containing actions, reducers,
 * selectors, and afterLoad lifecycle hook.
 *
 * This is the sole integration point that registers the theme
 * state slice with the Swagger UI plugin system, enabling
 * programmatic dark mode configuration via the 'theme' config
 * parameter ('light', 'dark', 'auto').
 *
 * Follows the identical pattern used by:
 *   - src/core/plugins/configs/index.js (statePlugins structure)
 *   - src/core/plugins/syntax-highlighting/index.js (afterLoad hook)
 *   - src/core/plugins/versions/index.js (arrow function factory)
 */
const ThemePlugin = () => ({
  afterLoad,
  statePlugins: {
    theme: {
      actions,
      reducers,
      selectors,
    },
  },
})

export default ThemePlugin
