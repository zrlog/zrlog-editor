import Core from "../core/editor/paste-upload";
import {withDefaultIcons} from "../defaults/with-default-icons";
import paste from "../defaults/paste";
export * from "../core/editor/paste-upload";
const Compatible = withDefaultIcons(Core, { ...paste });
export default Compatible;
