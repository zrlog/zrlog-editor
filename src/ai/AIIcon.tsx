import Core from "../core/ai/AIIcon";
import {withDefaultIcons} from "../defaults/with-default-icons";
import aiIcon from "../defaults/aiIcon";
import brands from "../defaults/brands";
export * from "../core/ai/AIIcon";
const Compatible = withDefaultIcons(Core, { ...aiIcon }, brands);
export default Compatible;
