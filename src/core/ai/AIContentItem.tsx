import {EditorGlyph} from "../../icons";
import {Avatar, Typography} from "antd";
import AIIcon from "./AIIcon";
import HtmlPreviewPanel from "../editor/html-preview-panel";
import {CSSProperties, forwardRef, useEffect, useState} from "react";
import {AIProviderType, EditorUser} from "../../type";
import {markdownToHtmlSyncWithCallback} from "../../editor/utils/marked-utils";
import {getEditorRes} from "../../editor/lang/editor-lang";

const {Paragraph} = Typography;

export type AIContent = {
    role: "user" | "assistant" | "";
    content: string;
    thinking: boolean;
};

type AIContentItemProps = {
    content: AIContent;
    aiProvider: AIProviderType;
    style?: CSSProperties;
    onRenderSuccess?: () => void;
    user?: EditorUser;
    dark: boolean;
};

const AIContentItem = forwardRef<HTMLDivElement, AIContentItemProps>(
    ({content, aiProvider, style, onRenderSuccess, user, dark}, ref) => {
        const getUserInfo = (): EditorUser => {
            if (user) {
                return user;
            }
            return {
                nickname: "editor",
                avatarUrl: "",
            };
        };

        const [html, setHtml] = useState<string>("");

        const renderMd = () => {
            if (content.role === "assistant") {
                markdownToHtmlSyncWithCallback(content.content, (x) => {
                    setHtml(x);
                    setTimeout(() => {
                        if (onRenderSuccess) {
                            onRenderSuccess();
                        }
                    }, 100);
                });
            } else {
                if (onRenderSuccess) {
                    onRenderSuccess();
                }
            }
        };

        useEffect(() => {
            renderMd();
        }, []);

        useEffect(() => {
            renderMd();
        }, [content.content]);

        if (content.role === "user") {
            return (
                <div
                    ref={ref}
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "end",
                        flexFlow: "column",
                        alignItems: "end",
                        ...style,
                    }}
                >
                    <div style={{paddingBottom: 12, float: "right"}}>
                        <Avatar
                            src={getUserInfo().avatarUrl}
                            icon={getUserInfo().avatarUrl.length === 0 ? <EditorGlyph name="user"/> : <></>}
                        />
                        <span style={{paddingLeft: getUserInfo()?.nickname.length > 0 ? 8 : 0}}>
                            {getUserInfo().nickname}
                        </span>
                    </div>
                    <div style={{maxWidth: "90%"}}>
                        <span>{content.content}</span>
                    </div>
                </div>
            );
        }

        const getAIReplyContent = () => {
            return (
                <>
                    {content.content.length === 0 ?
                        <span style={{paddingRight: 8}}>{getEditorRes("ai").thinking}</span> : <>
                            <HtmlPreviewPanel dark={dark} htmlContent={html} style={{maxWidth: "90%"}}/>
                            <Paragraph copyable={{text: content.content, icon: [<EditorGlyph name="copy"/>, <EditorGlyph name="check" selected/>]}} style={{paddingTop: 8}}/>
                        </>}
                    {content.thinking && <EditorGlyph name="loading"/>}
                </>
            );
        };

        return (
            <div style={{...style}} ref={ref}>
                <div style={{paddingBottom: 12}}>
                    <Avatar icon={<AIIcon name={aiProvider}/>} style={{height: 34, width: 34}}/>
                    <span style={{paddingLeft: 8}}>{getEditorRes("ai").ai}</span>
                </div>
                {getAIReplyContent()}
            </div>
        );
    }
);

export default AIContentItem;
