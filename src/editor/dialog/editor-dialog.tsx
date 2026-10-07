import Core from "../../core/editor/dialog/editor-dialog";
import {withDefaultIcons} from "../../defaults/with-default-icons";
import dialog from "../../defaults/dialog";
export * from "../../core/editor/dialog/editor-dialog";
const Compatible = withDefaultIcons(Core, { ...dialog });
export default Compatible;
