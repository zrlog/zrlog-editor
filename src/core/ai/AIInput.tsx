import {useEditorMessage} from "../../icons/message";
import {EditorGlyph} from "../../icons";
import Title from "antd/es/typography/Title";
import {getEditorRes} from "../../editor/lang/editor-lang";
import {Button} from "antd";
import {FunctionComponent, useEffect, useRef, useState} from "react";
import {AIContent} from "./AIContentItem";
import {getAiDrawerOpen} from "./AIDrawer";
import {AxiosInstance} from "axios";
import TextArea from "antd/es/input/TextArea";

type AIInputProps = {
    aiMessages: AIContent[];
    onAiMessagesChange: (messages: AIContent[]) => void;
    axiosInstance?: AxiosInstance;
    defaultInput: string;
    apiUri: string
    getContainer?: () => HTMLElement;
    sessionId?: number;
}

type AIInputState = {
    input: string;
    sending: boolean;
};

const AIInput: FunctionComponent<AIInputProps> = ({
                                                      aiMessages,
                                                      onAiMessagesChange,
                                                      axiosInstance,
                                                      defaultInput,
                                                      apiUri,
                                                      getContainer,
                                                      sessionId
                                                  }) => {

    const enterBtnRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
    const [state, setState] = useState<AIInputState>({
        input: defaultInput,
        sending: false,
    });
    const [messageApi, contextHolder] = useEditorMessage({maxCount: 3, getContainer: getContainer});


    const onSubmit = async () => {
        const baseContents = [...aiMessages];
        const userMsg: AIContent = {
            role: "user",
            content: state.input,
            thinking: false,
        };
        const aiReplyContent: AIContent = {
            role: "assistant",
            content: "",
            thinking: true,
        };

        // 立即更新父组件，显示用户消息和 AI 思考中状态
        const initialContents = [...baseContents, userMsg, aiReplyContent];
        onAiMessagesChange(initialContents);
        setState(prev => ({...prev, sending: true}));

        if (axiosInstance) {
            let timer: any = null;
            let currentContent = "";

            try {
                // 节流通知父组件，每 100ms 一次
                timer = setInterval(() => {
                    aiReplyContent.content = currentContent;
                    const contents = [...baseContents, userMsg, aiReplyContent];
                    setState((prevState) => {
                        return {
                            ...prevState,
                            contents: contents,
                        }
                    })
                    onAiMessagesChange(contents);
                }, 100);

                let error = false;

                const response = await axiosInstance.post(
                    apiUri + "?id=" + (sessionId ? sessionId : 0) + `&input=${encodeURIComponent(state.input)}`,
                    null,
                    {
                        adapter: 'xhr',
                        headers: {
                            accept: "text/event-stream"
                        },
                        responseType: 'text',
                        onDownloadProgress: (progressEvent: any) => {
                            const responseText: string = progressEvent.event?.target?.responseText || progressEvent.event?.currentTarget?.responseText || "";
                            if (!responseText) return;

                            if (responseText.startsWith("{")) {
                                try {
                                    const errorData = JSON.parse(responseText);
                                    if (errorData.error) {
                                        //messageApi.error(errorData.message || "AI service error");
                                    }
                                } catch (_) {
                                    //ts-ignore
                                }
                                error = true;
                                return;
                            }

                            const messages = responseText.split("\n\n");

                            const completeMessages = messages.slice(0, -1);

                            let rebuilt = "";
                            for (const msg of completeMessages) {
                                const trimmed = msg.trim();
                                if (trimmed.startsWith("data: ")) {
                                    try {
                                        const chunk = JSON.parse(trimmed.substring(6));
                                        rebuilt += chunk.content || "";
                                    } catch (_) {
                                        rebuilt += trimmed.substring(6);
                                    }
                                }
                            }
                            currentContent = rebuilt;
                        }
                    }
                );

                if (timer) clearInterval(timer);

                if (error) {
                    const data = response.data;
                    const jsonData = JSON.parse(data);
                    setState(prev => ({...prev, sending: false}));
                    messageApi.error({content: jsonData.message})
                    return;
                }

                aiReplyContent.thinking = false;
                aiReplyContent.content = currentContent;
                const finalContents: AIContent[] = [...baseContents, userMsg, aiReplyContent];
                setState(prev => ({...prev, sending: false, input: "", contents: finalContents}));
                if (onAiMessagesChange) {
                    onAiMessagesChange(finalContents);
                }

            } catch (e: any) {
                if (timer) clearInterval(timer);
                messageApi.error("Request failed");
                setState(prev => ({...prev, sending: false}));
                // 发生错误时，移除刚才添加的消息（恢复到 baseContents）
                if (onAiMessagesChange) {
                    onAiMessagesChange(baseContents);
                }
            }
        }
    }


    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                input: defaultInput,
            };
        });
    }, [defaultInput]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (
                (isMac && event.metaKey && event.key === "Enter") ||
                (!isMac && event.ctrlKey && event.key === "Enter")
            ) {
                if (enterBtnRef.current && getAiDrawerOpen()) {
                    enterBtnRef.current.click();
                }
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    return <div
        style={{
            position: "absolute",
            width: "80%",
            maxWidth: 768,
            bottom: aiMessages.length == 0 ? "45%" : 32,
            justifyContent: "center",
        }}
    >
        {contextHolder}
        {aiMessages.length === 0 && (
            <Title level={3} style={{textAlign: "center", lineHeight: 2}}>
                {getEditorRes("ai").title}
            </Title>
        )}
        <TextArea
            size={"large"}
            disabled={state.sending}
            value={state.input}
            style={{minHeight: 48, maxHeight: 72, resize: "none"}}
            placeholder={getEditorRes("ai").inputTips}
            onChange={(e) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        input: e.target.value,
                    };
                });
            }}
        />
        <Button
            ref={enterBtnRef}
            htmlType={"submit"}
            size={"large"}
            type={"dashed"}
            disabled={state.input.length === 0}
            style={{
                position: "absolute",
                right: 1,
                bottom: 1,
                border: "none",
                boxShadow: "none",
                background: "inherit",
            }}
            loading={state.sending}
            onClick={async () => {
                await onSubmit();
            }}
        >
            {!state.sending && <EditorGlyph name="send"/>}
        </Button>
    </div>
}

export default AIInput;