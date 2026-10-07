import Core from "../../core/editor/dialog/markdown-help";
import {withDefaultIcons} from "../../defaults/with-default-icons";
import preview from "../../defaults/preview";
export * from "../../core/editor/dialog/markdown-help";
const Compatible = withDefaultIcons(Core, { ...preview });
export default Compatible;
