import {createContext, useContext, useMemo} from "react";
import type {ComponentType, CSSProperties, PropsWithChildren} from "react";
import {ConfigProvider} from "antd";
import type {AIProviderType} from "../type";

export type EditorIconName =
    | "bold" | "strikethrough" | "italic" | "quote" | "heading2" | "heading3" | "heading4"
    | "unorderedList" | "orderedList" | "horizontalRule" | "link" | "image" | "video"
    | "attachment" | "code" | "table" | "copyHtml" | "preview" | "previewOff" | "help"
    | "upload" | "alignLeft" | "alignCenter" | "alignRight" | "loading" | "user" | "info"
    | "send" | "settings" | "copy" | "check" | "close" | "clear" | "up" | "down"
    | "success" | "error" | "warning";
export type EditorIconProps = {
    selected?: boolean;
    size?: number | string;
    color?: string;
    style?: CSSProperties;
    className?: string;
    spin?: boolean;
};
export type EditorIconComponent = ComponentType<EditorIconProps>;
export type EditorIconMap = Record<EditorIconName, EditorIconComponent>;
export type EditorBrandMap = Partial<Record<AIProviderType, EditorIconComponent>>;
export type EditorIconProviderProps = PropsWithChildren<{
    icons?: Partial<EditorIconMap>;
    brands?: EditorBrandMap;
}>;
const empty = {};
const IconContext = createContext<{icons: Partial<EditorIconMap>; brands: EditorBrandMap}>({icons: empty, brands: empty});
export const useEditorIcons = () => useContext(IconContext);

/** Partial nested providers override individual slots without losing surrounding icons. */
export function EditorIconProvider({icons = empty, brands = empty, children}: EditorIconProviderProps) {
    const parent = useEditorIcons();
    const config = useContext(ConfigProvider.ConfigContext);
    const value = useMemo(() => ({icons: {...parent.icons, ...icons}, brands: {...parent.brands, ...brands}}), [parent, icons, brands]);
    const glyph = (name: EditorIconName, selected = false) => value.icons[name] ? <EditorGlyph name={name} selected={selected}/> : undefined;
    const close = glyph("close");
    const loading = glyph("loading");
    return <IconContext.Provider value={value}>
        <ConfigProvider
            button={{...config.button, ...(loading ? {loadingIcon: loading} : {})}}
            modal={{...config.modal, ...(close ? {closeIcon: close} : {})}}
            drawer={{...config.drawer, ...(close ? {closeIcon: close} : {})}}
            select={{...config.select,
                ...(value.icons.down ? {suffixIcon: glyph("down")} : {}),
                ...(value.icons.check ? {menuItemSelectedIcon: glyph("check", true)} : {}),
                ...(value.icons.clear ? {clearIcon: glyph("clear")} : {}),
                ...(close ? {removeIcon: close} : {})}}
        >{children}</ConfigProvider>
    </IconContext.Provider>;
}

/** Missing slots fail at their point of use; core never imports a hidden fallback set. */
export function EditorGlyph({name, size, color, style, spin = name === "loading", ...props}: EditorIconProps & {name: EditorIconName}) {
    const Icon = useEditorIcons().icons[name];
    if (!Icon) throw new Error(`Missing editor icon "${name}". Configure EditorIconProvider or use the default editor entry.`);
    return <span data-editor-icon={name} data-selected={props.selected || undefined}
        style={{display: "inline-flex", verticalAlign: "-0.125em", lineHeight: 0}}>
        <Icon {...props} size={size} color={color} spin={spin}
            style={{...(size !== undefined ? {fontSize: size} : {}), ...(color ? {color} : {}), ...style}}/>
    </span>;
}
