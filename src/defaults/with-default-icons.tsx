import {forwardRef} from "react";
import type {ComponentPropsWithoutRef, ComponentType, ElementRef} from "react";
import {EditorIconProvider, useEditorIcons} from "../icons";
import type {EditorIconMap, EditorBrandMap} from "../icons";

// Compatibility defaults sit below host overrides. All implementation state lives in Core.
export function withDefaultIcons<C extends ComponentType<any>>(
    Core: C, defaults: Partial<EditorIconMap>, brands?: EditorBrandMap,
) {
    const Compatible = forwardRef<ElementRef<C>, ComponentPropsWithoutRef<C>>((props, ref) => {
        const parent = useEditorIcons();
        const Component = Core as ComponentType<any>;
        return <EditorIconProvider icons={{...defaults, ...parent.icons}} brands={{...brands, ...parent.brands}}>
            <Component {...props} {...(ref ? {ref} : {})}/>
        </EditorIconProvider>;
    });
    Compatible.displayName = `WithEditorIcons(${Core.displayName || Core.name || "Component"})`;
    return Compatible;
}
