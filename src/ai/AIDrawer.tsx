import Core from "../core/ai/AIDrawer";
import {withDefaultIcons} from "../defaults/with-default-icons";
import ai from "../defaults/aiDrawer";
import brands from "../defaults/brands";
export * from "../core/ai/AIDrawer";
const Compatible = withDefaultIcons(Core, { ...ai }, brands);
export default Compatible;
