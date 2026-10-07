import Core from "../core/ai/AIChatContentPanel";
import {withDefaultIcons} from "../defaults/with-default-icons";
import ai from "../defaults/aiContent";
import brands from "../defaults/brands";
export * from "../core/ai/AIChatContentPanel";
const Compatible = withDefaultIcons(Core, { ...ai }, brands);
export default Compatible;
