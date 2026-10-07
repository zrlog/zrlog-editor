import {Fa7SolidImage as Icon} from "../editor/icons/Fa7SolidImage";
import type {EditorIconProps} from "../icons";
export default function DefaultIcon({style, className, spin}: EditorIconProps) {
    return <Icon style={style} className={[className, spin ? "anticon-spin" : ""].filter(Boolean).join(" ")}/>;
}
