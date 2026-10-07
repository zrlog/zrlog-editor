import {message} from "antd";
import {isValidElement, useMemo} from "react";
import type {ReactNode} from "react";
import type {MessageInstance, ArgsProps, ConfigOptions} from "antd/es/message/interface";
import {EditorGlyph} from "./context";

// Preserve Ant Design overloads, explicit icons, callbacks and thenable close handles.
export function useEditorMessage(config?: ConfigOptions): ReturnType<typeof message.useMessage> {
    const [api, holder] = message.useMessage(config);
    const themed = useMemo(() => {
        const result: MessageInstance = {...api};
        for (const type of ["success", "error", "info", "warning", "loading"] as const) {
            result[type] = (content, ...rest) => {
                const args: ArgsProps = content && typeof content === "object" && !isValidElement(content) && "content" in content
                    ? content : {content: content as ReactNode};
                return api[type]({...args, icon: args.icon === undefined ? <EditorGlyph name={type}/> : args.icon}, ...rest);
            };
        }
        result.open = (args) => api.open({...args,
            icon: args.icon === undefined ? <EditorGlyph name={args.type ?? "info"}/> : args.icon});
        return result;
    }, [api]);
    return [themed, holder];
}
