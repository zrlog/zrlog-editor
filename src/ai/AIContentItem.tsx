import Core from "../core/ai/AIContentItem";
import {withDefaultIcons} from "../defaults/with-default-icons";
import ai from "../defaults/aiContent";
import brands from "../defaults/brands";
export * from "../core/ai/AIContentItem";
const Compatible = withDefaultIcons(Core, { ...ai }, brands);
export default Compatible;
