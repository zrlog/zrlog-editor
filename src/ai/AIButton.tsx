import Core from "../core/ai/AIButton";
import {withDefaultIcons} from "../defaults/with-default-icons";
import ai from "../defaults/ai";
import brands from "../defaults/brands";
export * from "../core/ai/AIButton";
const Compatible = withDefaultIcons(Core, { ...ai }, brands);
export default Compatible;
