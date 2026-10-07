import Core from "../core/editor/html-preview-panel";
import {withDefaultIcons} from "../defaults/with-default-icons";
import preview from "../defaults/preview";
export * from "../core/editor/html-preview-panel";
const Compatible = withDefaultIcons(Core, { ...preview });
export default Compatible;
