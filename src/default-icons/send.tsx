import Icon from "@ant-design/icons/lib/icons/ArrowUpOutlined";
import type {EditorIconProps} from "../icons";
export default function DefaultIcon({style, className, spin}: EditorIconProps) {
    return <Icon style={style} className={[className, spin ? "anticon-spin" : ""].filter(Boolean).join(" ")}/>;
}
