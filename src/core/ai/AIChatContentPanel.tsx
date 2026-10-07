import AIContentItem, {AIContent} from "./AIContentItem";
import {FunctionComponent, useRef} from "react";
import {AIProviderType, EditorUser} from "../../type";

type AIChatContentPanelProps = {
    contents: AIContent[];
    aiProvider: AIProviderType;
    dark: boolean;
    user?: EditorUser
};

const AIChatContentPanel: FunctionComponent<AIChatContentPanelProps> = ({contents, aiProvider, dark, user}) => {
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollToItem = (id: string) => {
        const el = itemRefs.current[id];
        if (el) {
            el.scrollIntoView({behavior: "smooth", block: "end"});
        }
    };

    if (contents.length === 0) {
        return <></>;
    }

    return (
        <div
            style={{
                maxHeight: "calc(100vh - 168px)",
                maxWidth: 768,
                width: "100%"
            }}
        >
            {contents.map((e, idx) => {
                return (
                    <AIContentItem
                        dark={dark}
                        key={idx}
                        user={user}
                        onRenderSuccess={() => {
                            scrollToItem(contents.length - 1 + "");
                        }}
                        ref={(el) => (itemRefs.current[idx + ""] = el)}
                        content={e}
                        aiProvider={aiProvider}
                        style={{paddingTop: 8, paddingBottom: 8}}
                    />
                );
            })}
        </div>
    );
};

export default AIChatContentPanel;
