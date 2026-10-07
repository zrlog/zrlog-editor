import Core from "../../core/editor/dialog/upload-body";
import {withDefaultIcons} from "../../defaults/with-default-icons";
import upload from "../../defaults/upload";
export * from "../../core/editor/dialog/upload-body";
const Compatible = withDefaultIcons(Core, { ...upload });
export default Compatible;
