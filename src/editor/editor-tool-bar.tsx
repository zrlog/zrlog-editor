import Core from "../core/editor/editor-tool-bar";
import {withDefaultIcons} from "../defaults/with-default-icons";
import toolbar from "../defaults/toolbar";
import dialog from "../defaults/dialog";
export * from "../core/editor/editor-tool-bar";
const Compatible = withDefaultIcons(Core, { ...toolbar, ...dialog });
export default Compatible;
