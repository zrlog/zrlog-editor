import {EditorGlyph} from "../../icons";
import {Drawer, Grid, Space} from "antd";
import {FunctionComponent, ReactNode, useEffect, useRef, useState} from "react";
import {AIProviderType, EditorUser} from "../../type";
import AIIcon from "./AIIcon";
import {AIContent} from "./AIContentItem";
import {Content} from "antd/es/layout/layout";
import AIChatContentPanel from "./AIChatContentPanel";
import {getEditorRes} from "../../editor/lang/editor-lang";
import {AxiosInstance} from "axios";
import AIInput from "./AIInput";
import {AIStateCache, getAIStateCacheKey} from "../../ai/AIStateCache";

type AIDrawerProps = {
    input?: string;
    sessionId?: number;
    apiUri?: string;
    hide?: boolean;
    aiMessages?: AIContent[];
    onAiMessagesChange?: (messages: AIContent[]) => void;
    axiosInstance?: AxiosInstance;
    dark?: boolean;
    user?: EditorUser;

    aiProvider: AIProviderType;
    children?: ReactNode;
    open?: boolean;
    onClose?: () => void;
    getContainer?: () => HTMLElement;
    subject?: string;
    defaultWidth?: number | "large" | "default";
    bodyPadding?: number;
    bodyOverflow?: "hidden" | "auto";
    onSizeChange?: (size: number) => void;
    stateCache?: AIStateCache;
};

type AIDrawerState = {
    open: boolean;
    contents: AIContent[];
};

const cacheKey = "aiDrawerOpen";

export const getAiDrawerOpen = (): boolean => {
    return window[cacheKey] === true;
}

export const resolveDrawerWidth = (width?: number | "default" | "large") => {
    if (typeof width === "number") {
        return width;
    }
    if (width === "default") {
        return 378;
    }
    return "large";
};

const isDrawerWidth = (width: unknown): width is number | "default" | "large" => {
    return typeof width === "number" || width === "default" || width === "large";
};

const DRAWER_WIDTH_STATE_KEY = "drawerWidth";

const AIDrawer: FunctionComponent<AIDrawerProps> = ({
                                                       sessionId,
                                                       input,
                                                       onClose,
                                                       getContainer,
                                                       apiUri,
                                                       hide,
                                                       aiProvider,
                                                       subject,
                                                       aiMessages = [],
                                                       onAiMessagesChange = () => {
                                                           //ignore
                                                       },
                                                       axiosInstance,
                                                       defaultWidth,
                                                       dark = false,
                                                       user,
                                                       onSizeChange,
                                                       children,
                                                       open,
                                                       bodyPadding,
                                                       bodyOverflow = "hidden",
                                                       stateCache,
                                                   }) => {
    const legacyMode = children === undefined;
    const getDrawerWidthFromCache = () => {
        if (!stateCache) {
            return resolveDrawerWidth(defaultWidth);
        }
        const cachedWidth = stateCache.read(getAIStateCacheKey(stateCache, DRAWER_WIDTH_STATE_KEY));
        if (isDrawerWidth(cachedWidth)) {
            return resolveDrawerWidth(cachedWidth);
        }
        return resolveDrawerWidth(defaultWidth);
    };
    const [size, setSize] = useState<string | number>(getDrawerWidthFromCache);
    const [state, setState] = useState<AIDrawerState>({
        open: open !== undefined ? open : !hide,
        contents: aiMessages
    });
    const screens = Grid.useBreakpoint();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                open: open !== undefined ? open : !hide,
            };
        });
    }, [hide, open]);

    useEffect(() => {
        setSize(getDrawerWidthFromCache());
    }, [defaultWidth, stateCache?.key]);

    useEffect(() => {
        window[cacheKey] = state.open;
    }, [state.open]);

    const close = () => {
        setState((prevState) => {
            return {
                ...prevState,
                open: false,
            };
        });
        onClose?.();
    };

    const renderLegacyContent = () => (
        <Content>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    overflow: "auto",
                    width: "100%",
                }}
            >
                {state.open &&
                    <div style={{display: "flex", width: "100%", flexDirection: "column", alignItems: "center"}}>
                        <AIChatContentPanel user={user} dark={dark} contents={state.contents}
                                            aiProvider={aiProvider}/>
                        <div ref={messagesEndRef} style={{height: 2}}/>
                    </div>
                }
                {input !== undefined && apiUri !== undefined && (
                    <AIInput aiMessages={state.contents} onAiMessagesChange={(messages) => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                contents: messages,
                            }
                        })
                        onAiMessagesChange?.(messages)
                    }} axiosInstance={axiosInstance} defaultInput={input} apiUri={apiUri} sessionId={sessionId}/>
                )}
                {state.contents.length > 0 && (
                    <span style={{position: "absolute", bottom: 6, fontSize: 12}}>
                        <EditorGlyph name="info" style={{paddingRight: 4}}/> {getEditorRes("ai").contentTips}
                    </span>
                )}
            </div>
        </Content>
    );

    return (
        <Drawer
            title={
                <Space>
                    <AIIcon name={aiProvider}/>
                    <span>{getEditorRes("ai").ai}</span>
                    <span>{subject && subject.length > 0 ? `[ ${subject} ]` : ""}</span>
                </Space>
            }
            resizable={
                screens.sm
                    ? {
                        onResize: (nextWidth) => {
                            const nextSize = nextWidth <= 378 ? "default" : nextWidth;
                            if (nextWidth <= 378) {
                                setSize("default");
                            } else {
                                setSize(nextWidth);
                            }
                            if (stateCache) {
                                stateCache.write(getAIStateCacheKey(stateCache, DRAWER_WIDTH_STATE_KEY), nextSize);
                            }
                            onSizeChange?.(nextWidth);
                        },
                    }
                    : false
            }
            placement="right"
            size={screens.sm ? size as number : "100%"}
            closable={{placement: "end"}}
            keyboard={true}
            autoFocus={false}
            onClose={close}
            styles={{
                header: {
                    padding: 12,
                },
                body: {
                    padding: bodyPadding === undefined ? (legacyMode ? 12 : 0) : bodyPadding,
                    overflow: bodyOverflow,
                    overflowX: "hidden",
                },
            }}
            open={state.open}
            getContainer={getContainer}
        >
            {children ?? renderLegacyContent()}
        </Drawer>
    );
};

export default AIDrawer;
