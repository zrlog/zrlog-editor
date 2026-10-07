import Core from "../core/editor/editor-selection-tool-bar";
import {withDefaultIcons} from "../defaults/with-default-icons";
import selection from "../defaults/selection";
import ai from "../defaults/ai";
import brands from "../defaults/brands";
export * from "../core/editor/editor-selection-tool-bar";
const Compatible = withDefaultIcons(Core, { ...selection, ...ai }, brands);
export {Compatible as SelectionToolbar};
export default Compatible;
