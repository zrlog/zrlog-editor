import Core from "../core/ai/AIInput";
import {withDefaultIcons} from "../defaults/with-default-icons";
import ai from "../defaults/aiInput";
export * from "../core/ai/AIInput";
const Compatible = withDefaultIcons(Core, { ...ai });
export default Compatible;
