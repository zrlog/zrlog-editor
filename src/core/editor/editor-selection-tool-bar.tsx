import {EditorGlyph} from "../../icons";
import React from "react";
import EditorIcon from "../../editor/editor-icon";
import AIIcon from "../ai/AIIcon";
import AIButton from "../ai/AIButton";
import {getBgColor} from "../../editor/editor-helpers";
import {EditorToolBarDivider} from "./editor-tool-bar";
import {AIConfig} from "../../editor/editor.types";
import {AxiosInstance} from "axios";

export interface SelectionToolbarProps {
    visible: boolean;
    top: number;
    left: number;
    onBold: () => void;
    onItalic: () => void;
    onStrikethrough: () => void;
    selectedText: string;
    getContainer?: () => HTMLElement;
    dark: boolean;
    aiConfig?: AIConfig;
    onAi?: () => void;
    axiosInstance?: AxiosInstance;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
                                                                      visible,
                                                                      top,
                                                                      left,
                                                                      onBold,
                                                                      onStrikethrough,
                                                                      selectedText,
                                                                      onItalic,
                                                                      getContainer,
                                                                      dark,
                                                                      aiConfig,
                                                                      onAi,
                                                                      axiosInstance

                                                                  }) => {
    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                top,
                left,
                padding: 4,
                borderRadius: 4,
                display: "flex",
                gap: 8,
                zIndex: 1,
                alignItems: "center",
                background: getBgColor(dark),
            }}
            // 避免点击时让编辑器失焦 / 选区消失
            onMouseDown={(e) => e.preventDefault()}
        >
            <EditorIcon onClick={onBold}>
                <EditorGlyph name="bold"/>
            </EditorIcon>
            <EditorIcon onClick={onStrikethrough}>
                <EditorGlyph name="strikethrough"/>
            </EditorIcon>
            <EditorIcon onClick={onItalic}>
                <EditorGlyph name="italic"/>
            </EditorIcon>
            <EditorToolBarDivider style={{height: "1.5em"}}/>
            {aiConfig && <AIButton
                drawerWidth={aiConfig.drawerWidth}
                stateCache={aiConfig.stateCache}
                dark={dark}
                axiosInstance={axiosInstance}
                input={selectedText}
                onSizeChange={aiConfig.onSizeChange}
                subject={aiConfig.subject}
                sessionId={aiConfig.sessionId}
                apiUri={aiConfig.aiApiUri}
                configUrl={aiConfig.configUrl}
                aiProvider={aiConfig.aiProvider}
                getContainer={getContainer}
                user={aiConfig.user}
                aiMessages={aiConfig.aiMessages}
                onAiMessagesChange={aiConfig.onAiMessagesChange}
                messages={aiConfig.messages}
                contentMaxWidth={aiConfig.contentMaxWidth}
                renderMessage={aiConfig.renderMessage}
                footer={aiConfig.renderFooter?.({selectedText})}
                overlays={aiConfig.overlays}
                onOpen={() => {
                    if (onAi) {
                        onAi();
                    }
                }}
            >
                <EditorIcon>
                    <AIIcon name={aiConfig.aiProvider}/>
                </EditorIcon>
            </AIButton>}
        </div>
    );
};

export default SelectionToolbar;
