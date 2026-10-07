import {EditorGlyph} from "../../icons";
import AIDrawer, {getAiDrawerOpen} from "./AIDrawer";
import {Link} from "react-router-dom";
import {AIProviderType, EditorUser} from "../../type";
import {
    CSSProperties,
    FunctionComponent,
    MutableRefObject,
    PropsWithChildren,
    ReactNode,
    RefObject,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import Popconfirm from "antd/es/popconfirm";
import AIContentItem, {AIContent} from "./AIContentItem";
import {getEditorRes} from "../../editor/lang/editor-lang";
import {AxiosInstance} from "axios";
import {Button, theme} from "antd";
import AIIcon from "./AIIcon";
import {AIStateCache, getAIStateCacheKey} from "../../ai/AIStateCache";

export type {AIStateCache} from "../../ai/AIStateCache";

export type AIButtonRenderMessageOptions = {
    content: AIContent;
    index: number;
    defaultNode: ReactNode;
};

type AIButtonProps = PropsWithChildren & {
    input?: string;
    sessionId?: number;
    apiUri?: string;
    onClose?: () => void;
    onOpen?: () => void;
    aiProvider?: AIProviderType;
    getContainer?: () => HTMLElement;
    subject?: string;
    aiMessages?: AIContent[];
    onAiMessagesChange?: (messages: AIContent[]) => void;
    configUrl?: string;
    dark: boolean;
    user?: EditorUser;
    drawerWidth?: number | "default" | "large";
    axiosInstance?: AxiosInstance;
    onSizeChange?: (newSize: number) => void;

    messages?: AIContent[];
    onOpenChange?: (open: boolean) => void;
    onContentScroll?: () => void;
    contentScrollRef?: RefObject<HTMLDivElement>;
    contentEndRef?: RefObject<HTMLDivElement>;
    contentMaxWidth?: number;
    stateCache?: AIStateCache;
    disabled?: boolean;
    triggerClassName?: string;
    triggerLabel?: ReactNode;
    triggerStyle?: CSSProperties;
    triggerTitle?: string;
    renderMessage?: (options: AIButtonRenderMessageOptions) => ReactNode;
    footer?: ReactNode;
    overlays?: ReactNode;
    open?: boolean;
};

const DEFAULT_CONTENT_MAX_WIDTH = 768;
const SCROLL_TOP_STATE_KEY = "scrollTop";

type PendingScrollRestore = {
    key: string;
    value: unknown;
    attempts: number;
};

export const getAIButtonDrawerOpen = getAiDrawerOpen;

const AIButton: FunctionComponent<AIButtonProps> = ({
                                                        input,
                                                        subject,
                                                        aiProvider,
                                                        sessionId,
                                                        getContainer,
                                                        children,
                                                        onClose,
                                                        onOpen,
                                                        aiMessages,
                                                        onAiMessagesChange,
                                                        configUrl,
                                                        dark,
                                                        user,
                                                        apiUri,
                                                        drawerWidth,
                                                        axiosInstance,
                                                        onSizeChange,
                                                        messages,
                                                        onOpenChange,
                                                        onContentScroll,
                                                        contentScrollRef,
                                                        contentEndRef,
                                                        contentMaxWidth = DEFAULT_CONTENT_MAX_WIDTH,
                                                        stateCache,
                                                        disabled,
                                                        triggerClassName,
                                                        triggerLabel,
                                                        triggerStyle,
                                                        triggerTitle,
                                                        renderMessage,
                                                        footer,
                                                        overlays,
                                                        open: controlledOpen,
                                                    }) => {
    const needConfig = (aiProvider as string) === "" || aiProvider === null || aiProvider === undefined;
    const [aiOpen, setAiOpen] = useState<boolean>(false);
    const [contentScrollElementRevision, setContentScrollElementRevision] = useState(0);
    const {token} = theme.useToken();
    const extensibleMode = messages !== undefined || renderMessage !== undefined || footer !== undefined;
    const realOpen = controlledOpen === undefined ? aiOpen : controlledOpen;
    const internalContentScrollRef = useRef<HTMLDivElement | null>(null);
    const internalContentEndRef = useRef<HTMLDivElement | null>(null);
    const restoredScrollCacheKeyRef = useRef<string>();
    const scrollWriteFrameRef = useRef<number>();
    const scrollRestoreTimerRef = useRef<number>();
    const pendingScrollRestoreRef = useRef<PendingScrollRestore>();
    const restoringScrollRef = useRef(false);
    const lastMessageLengthRef = useRef(0);

    const changeOpen = (nextOpen: boolean) => {
        if (controlledOpen === undefined) {
            setAiOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
        if (nextOpen) {
            onOpen?.();
        } else {
            onClose?.();
        }
    };

    const close = () => {
        saveScrollTop(true);
        changeOpen(false);
    };

    const setContentScrollElement = useCallback((el: HTMLDivElement | null) => {
        internalContentScrollRef.current = el;
        if (contentScrollRef) {
            (contentScrollRef as MutableRefObject<HTMLDivElement | null>).current = el;
        }
        if (el) {
            setContentScrollElementRevision((prevState) => prevState + 1);
        }
    }, [contentScrollRef]);

    const setContentEndElement = useCallback((el: HTMLDivElement | null) => {
        internalContentEndRef.current = el;
        if (contentEndRef) {
            (contentEndRef as MutableRefObject<HTMLDivElement | null>).current = el;
        }
    }, [contentEndRef]);

    const saveScrollTop = (immediate = false) => {
        const scrollElement = internalContentScrollRef.current;
        if (!scrollElement || !stateCache || restoringScrollRef.current || pendingScrollRestoreRef.current) {
            onContentScroll?.();
            return;
        }
        if (scrollWriteFrameRef.current) {
            cancelAnimationFrame(scrollWriteFrameRef.current);
        }
        const writeScrollTop = () => {
            stateCache.write(getAIStateCacheKey(stateCache, SCROLL_TOP_STATE_KEY), scrollElement.scrollTop);
            scrollWriteFrameRef.current = undefined;
        };
        if (immediate) {
            writeScrollTop();
            onContentScroll?.();
            return;
        }
        scrollWriteFrameRef.current = requestAnimationFrame(() => {
            writeScrollTop();
        });
        onContentScroll?.();
    };

    const restoreScroll = (scrollElement: HTMLDivElement, pendingRestore: PendingScrollRestore) => {
        const cachedScrollTop = pendingRestore.value;
        restoringScrollRef.current = true;
        if (typeof cachedScrollTop === "number") {
            const maxScrollTop = Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);
            scrollElement.scrollTop = Math.min(cachedScrollTop, maxScrollTop);
            pendingRestore.attempts += 1;
            if (cachedScrollTop <= maxScrollTop || cachedScrollTop === 0 || (maxScrollTop > 0 && pendingRestore.attempts >= 3)) {
                pendingScrollRestoreRef.current = undefined;
            }
        } else {
            scrollElement.scrollTop = scrollElement.scrollHeight;
            if (scrollElement.scrollHeight > scrollElement.clientHeight || (messages ?? []).length > 0) {
                pendingScrollRestoreRef.current = undefined;
            }
        }
        window.setTimeout(() => {
            restoringScrollRef.current = false;
        }, 0);
        if (pendingScrollRestoreRef.current === pendingRestore && pendingRestore.attempts < 12) {
            if (scrollRestoreTimerRef.current) {
                clearTimeout(scrollRestoreTimerRef.current);
            }
            scrollRestoreTimerRef.current = window.setTimeout(() => {
                const latestScrollElement = internalContentScrollRef.current;
                if (latestScrollElement) {
                    restoreScroll(latestScrollElement, pendingRestore);
                }
            }, 120);
        }
    };

    useEffect(() => {
        if (!realOpen || !stateCache) {
            restoredScrollCacheKeyRef.current = undefined;
            pendingScrollRestoreRef.current = undefined;
            return;
        }
        const scrollElement = internalContentScrollRef.current;
        if (!scrollElement) {
            return;
        }
        const scrollCacheKey = getAIStateCacheKey(stateCache, SCROLL_TOP_STATE_KEY);
        if (restoredScrollCacheKeyRef.current !== scrollCacheKey) {
            restoredScrollCacheKeyRef.current = scrollCacheKey;
            pendingScrollRestoreRef.current = {
                key: scrollCacheKey,
                value: stateCache.read(scrollCacheKey),
                attempts: 0,
            };
            lastMessageLengthRef.current = (messages ?? []).length;
        }
        if (pendingScrollRestoreRef.current?.key === scrollCacheKey) {
            const pendingRestore = pendingScrollRestoreRef.current;
            requestAnimationFrame(() => restoreScroll(scrollElement, pendingRestore));
            if (scrollRestoreTimerRef.current) {
                clearTimeout(scrollRestoreTimerRef.current);
            }
            scrollRestoreTimerRef.current = window.setTimeout(() => restoreScroll(scrollElement, pendingRestore), 120);
        } else if ((messages ?? []).length > lastMessageLengthRef.current) {
            internalContentEndRef.current?.scrollIntoView({block: "end"});
        }
        lastMessageLengthRef.current = (messages ?? []).length;
    }, [messages, realOpen, stateCache, contentScrollElementRevision]);

    useEffect(() => {
        return () => {
            if (scrollWriteFrameRef.current) {
                cancelAnimationFrame(scrollWriteFrameRef.current);
            }
            if (scrollRestoreTimerRef.current) {
                clearTimeout(scrollRestoreTimerRef.current);
            }
        };
    }, []);

    const renderDefaultMessage = (content: AIContent) => (
        <AIContentItem content={content} aiProvider={aiProvider as AIProviderType} user={user} dark={dark}/>
    );

    const renderExtensibleDrawer = () => (
        <AIDrawer
            dark={dark}
            aiProvider={aiProvider as AIProviderType}
            open={realOpen}
            subject={subject}
            onClose={close}
            user={user}
            defaultWidth={drawerWidth}
            getContainer={getContainer}
            onSizeChange={onSizeChange}
            stateCache={stateCache}
        >
            <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
                <div
                    ref={setContentScrollElement}
                    style={{flex: 1, overflowY: "auto", padding: 12}}
                    onScroll={() => saveScrollTop()}
                >
                    <div style={{maxWidth: contentMaxWidth, margin: "0 auto", width: "100%"}}>
                        {(messages ?? []).map((content, index) => {
                            const defaultNode = renderDefaultMessage(content);
                            return (
                                <div key={index} style={{paddingBottom: 12}}>
                                    {renderMessage ? renderMessage({content, index, defaultNode}) : defaultNode}
                                </div>
                            );
                        })}
                        <div ref={setContentEndElement}/>
                    </div>
                </div>
                {footer && (
                    <div
                        style={{
                            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                            padding: 12,
                        }}
                    >
                        <div style={{maxWidth: contentMaxWidth, margin: "0 auto", width: "100%"}}>{footer}</div>
                    </div>
                )}
            </div>
            {overlays}
        </AIDrawer>
    );

    const renderTrigger = () => {
        if (children) {
            return (
                <div
                    onClick={() => {
                        if (needConfig) {
                            return;
                        }
                        changeOpen(true);
                    }}
                >
                    {children}
                </div>
            );
        }
        return (
            <Button
                className={triggerClassName}
                type={"primary"}
                icon={<AIIcon name={aiProvider}/>}
                disabled={disabled}
                style={triggerStyle}
                title={triggerTitle}
                onClick={() => {
                    if (needConfig) {
                        return;
                    }
                    changeOpen(true);
                }}
            >
                {triggerLabel}
            </Button>
        );
    };

    return (
        <>
            {!needConfig && (extensibleMode ? (
                renderExtensibleDrawer()
            ) : (
                <AIDrawer
                    dark={dark}
                    aiProvider={aiProvider as AIProviderType}
                    hide={!aiOpen}
                    apiUri={apiUri}
                    input={input}
                    subject={subject}
                    sessionId={sessionId}
                    onClose={() => changeOpen(false)}
                    user={user}
                    defaultWidth={drawerWidth}
                    onAiMessagesChange={onAiMessagesChange}
                    aiMessages={aiMessages}
                    getContainer={getContainer}
                    axiosInstance={axiosInstance}
                    onSizeChange={onSizeChange}
                    stateCache={stateCache}
                />
            ))}
            <Popconfirm icon={<EditorGlyph name="warning"/>}
                disabled={!needConfig}
                title={getEditorRes("ai").askConfig}
                getPopupContainer={getContainer}
                getTooltipContainer={getContainer}
                okText={<Link to={configUrl ? configUrl : "#miss"}>{getEditorRes("setting")}</Link>}
            >
                {renderTrigger()}
            </Popconfirm>
        </>
    );
};

export default AIButton;
