import type {CSSProperties} from "react";
import {EditorGlyph, useEditorIcons} from "../../icons";
import type {AIProviderType} from "../../type";
export type AIIconProps = { name?: AIProviderType; style?: CSSProperties };
export default function AIIcon({name, style}: AIIconProps) {
    const {brands} = useEditorIcons();
    const Brand = name ? brands[name] : undefined;
    return Brand ? <Brand style={style}/> : <EditorGlyph name="settings" style={style}/>;
}
