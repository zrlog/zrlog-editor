import {useEditorMessage} from "../../icons/message";
import CodeMirror, {EditorSelection, EditorState, EditorView, ViewUpdate} from "@uiw/react-codemirror";
import {FunctionComponent, useCallback, useMemo, useRef, useState} from "react";
import {ZrLogEditorProps} from "../../editor/editor.types";
import {StyledEditor} from "../../editor/styles/styled-editor";
import EditorToolBar from "./editor-tool-bar";
import {languages} from "@codemirror/language-data";
import {markdown} from "@codemirror/lang-markdown";

import PasteUpload from "./paste-upload";
import ScrollSync from "../../editor/scroll-sync";
import HtmlPreviewPanel from "./html-preview-panel";
import {markdownToHtml} from "../../editor/utils/marked-utils";
import SelectionToolbar from "./editor-selection-tool-bar";
import {copyToClipboard} from "../../editor/utils/editor-utils";
import {getEditorRes, setEditorLang} from "../../editor/lang/editor-lang";
import {Divider} from "antd";
import {yaml} from "@codemirror/lang-yaml";


type MarkdownEditorState = {
    initValue: string;
    previewContent: string;
    preview: boolean;
    imageUploading: boolean;
};

type SelectionToolbarState = {
    visible: boolean;
    top: number;
    left: number;
    text: string;
};

export const insertTextAtCursor = (text: string, cursorPosition: number, view?: EditorView | null) => {
    if (!view) return;

    const pos = view.state.selection.main.head; // 当前光标位置

    view.dispatch({
        changes: {from: pos, insert: text},
        selection: EditorSelection.cursor(pos + cursorPosition),
        scrollIntoView: true,
    });
    view.focus(); // 确保光标可见
};

const Editor: FunctionComponent<ZrLogEditorProps> = ({
                                                         height,
                                                         value,
                                                         onChange,
                                                         previewContent,
                                                         loadSuccess,
                                                         getContainer,
                                                         placeholder,
                                                         config,
                                                         axiosInstance,
                                                     }) => {

    const [state, setState] = useState<MarkdownEditorState>({
        initValue: value ? value : "",
        //默认开启
        preview: config.preview,
        previewContent: previewContent,
        imageUploading: false,
    });

    const [toolbar, setToolbar] = useState<SelectionToolbarState>({
        visible: false,
        top: 0,
        left: 0,
        text: "",
    });

    const getSelectedText = (view: EditorView) => {
        const {from, to} = view.state.selection.main;
        if (from === to) return "";
        return view.state.doc.sliceString(from, to);
    };

    const updateToolbarPosition = useCallback((view: EditorView) => {
        const state = view.state;
        const {from, to} = state.selection.main;

        if (from === to) {
            setToolbar((prev) => ({...prev, visible: false}));
            return;
        }

        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        if (!start || !end) {
            setToolbar((prev) => ({...prev, visible: false}));
            return;
        }

        const middleX = (start.left + end.right) / 2;
        const top = Math.min(start.top, end.top) - 48; // 上方 40px

        setToolbar({
            visible: true,
            top,
            left: middleX,
            text: getSelectedText(view),
        });
    }, []);

    const [guttersWidth, setGuttersWidth] = useState<number>(27);

    const editorRef = useRef<EditorView | null>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const renderSeqRef = useRef(0);
    const linkPreviewAbortRef = useRef<AbortController | null>(null);

    const [messageApi, contextHolder] = useEditorMessage({maxCount: 3, getContainer: getContainer});


    const doCopy = async () => {
        copyToClipboard('<div class="markdown-body" style="padding:0">' + state.previewContent + "</div>");
        messageApi.info(getEditorRes("copPreviewHtmlToClipboardSuccess"));
    };

    const onViewChange = () => {
        if (editorRef.current && editorRef.current.dom) {
            const gutters = editorRef.current.dom.querySelector(".cm-gutters-before") as HTMLElement;
            if (gutters) {
                const newWidth = gutters.offsetWidth;
                if (guttersWidth == newWidth) {
                    return;
                }
                setGuttersWidth(gutters.offsetWidth);
            }
        }
    };

    const handleUpdate = useCallback(
        (vu: ViewUpdate) => {
            // 选区变化 或 文本变化时重新计算
            if (vu.selectionSet || vu.docChanged) {
                updateToolbarPosition(vu.view);
            }
        },
        [updateToolbarPosition]
    );

    // 通用封装：用 wrap 函数处理选中内容
    const wrapSelection = useCallback(
        (wrap: (text: string) => string) => {
            const view = editorRef.current;
            if (!view) return;

            const state = view.state;
            const {from, to} = state.selection.main;
            if (from === to) return;

            const selectedText = getSelectedText(view);

            view.dispatch({
                changes: {
                    from,
                    to,
                    insert: wrap(selectedText),
                },
            });

            // 改完之后再更新一次位置（选区仍然存在）
            updateToolbarPosition(view);
        },
        [updateToolbarPosition]
    );

    const handleBold = () => {
        wrapSelection((text: string) => `**${text}**`);
    };

    const handleStrikethrough = () => {
        wrapSelection((text: string) => `~${text}~`);
    };

    const handleItalic = () => {
        wrapSelection((text: string) => `*${text}*`);
    };

    if (config.lang) {
        setEditorLang(config.lang);
    } else {
        setEditorLang("zh_CN");
    }

    const extensions = useMemo(() => {
        const extArr = [];
        if (config.lang) {
            setEditorLang(config.lang);
        }
        if (config.mode === "YML") {
            extArr.push(yaml() as never);
        } else {
            extArr.push(markdown({codeLanguages: languages}) as never);
        }
        extArr.push(EditorView.lineWrapping as never);
        // 中文翻译对象
        extArr.push(EditorState.phrases.of(getEditorRes("findDialog")) as never);
        return extArr;
    }, [config.lang]);

    const clearSelection = () => {
        const view = editorRef.current;
        if (!view) return;

        /*// 你想让光标停在 from 还是 to 都行
        const cursorPos = sel.to; // 或 sel.from

        view.dispatch({
            selection: EditorSelection.cursor(cursorPos),
        });*/
        view.state.replaceSelection("");

        // 顺便关掉浮动 toolbar
        //setToolbar((prev) => ({ ...prev, visible: false }));
    };

    const disableStatusBar = config.disableStatusBar ?? config.disableStatistics;

    return (
        <StyledEditor mainColor={config.colorPrimary ? config.colorPrimary : ""} dark={config.dark}
                      style={{paddingBottom: disableStatusBar ? 0 : 30}}>
            {editorRef.current && (
                <PasteUpload
                    uploadConfig={config.uploadConfig}
                    onUploading={() => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                imageUploading: true,
                            };
                        });
                    }}
                    getContainer={getContainer}
                    onUploadFailure={() => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                imageUploading: false,
                            };
                        });
                    }}
                    onUploadSuccess={(imgUrl) => {
                        const content = "![](" + imgUrl + ")\n";
                        insertTextAtCursor(content, content.length, editorRef.current);
                        setState((prevState) => {
                            return {
                                ...prevState,
                                imageUploading: false,
                            };
                        });
                    }}
                    pasteView={editorRef.current.contentDOM as HTMLElement}
                />
            )}
            <div className={config.dark ? "editor-dark" : "editor-light"} style={{overflow: "hidden"}}>
                {contextHolder}
                {!config.disableToolbar && <EditorToolBar
                    uploadConfig={config.uploadConfig}
                    axiosInstance={axiosInstance}
                    dark={config.dark}
                    imageUploading={state.imageUploading}
                    onChange={(mdStr, cursorPosition) => {
                        insertTextAtCursor(mdStr, cursorPosition, editorRef.current);
                    }}
                    onCopy={async () => {
                        await doCopy();
                    }}
                    onEditorModeChange={(preview) => {
                        setState((prevState) => {
                            if (config.onPreviewChange) {
                                config.onPreviewChange(preview)
                            }
                            return {
                                ...prevState,
                                preview: preview,
                            };
                        });
                    }}
                    preview={state.preview}
                />
                }
                <div style={{height: height, display: "flex", width: "100%"}}>
                    {!config.disableToolbar && <SelectionToolbar
                        axiosInstance={axiosInstance}
                        dark={config.dark}
                        visible={toolbar.visible}
                        top={toolbar.top}
                        left={toolbar.left}
                        onBold={handleBold}
                        onStrikethrough={handleStrikethrough}
                        onItalic={handleItalic}
                        selectedText={toolbar.text}
                        getContainer={getContainer}
                        onAi={() => {
                            clearSelection();
                        }}
                        aiConfig={config.aiConfig}
                    />
                    }
                    <CodeMirror
                        basicSetup={{searchKeymap: true}}
                        placeholder={placeholder}
                        value={state.initValue}
                        height={height}
                        width={"100%"}
                        onUpdate={(viewUpdate) => {
                            if (viewUpdate.viewportChanged) {
                                onViewChange();
                            }
                            handleUpdate(viewUpdate);
                        }}
                        theme={config.dark ? "dark" : "light"}
                        extensions={extensions}
                        onCreateEditor={(view) => {
                            editorRef.current = view;
                            if (loadSuccess) {
                                loadSuccess(view);
                            }
                            onViewChange();
                        }}
                        onChange={async (value) => {
                            linkPreviewAbortRef.current?.abort();
                            const abortController = new AbortController();
                            linkPreviewAbortRef.current = abortController;
                            const renderSeq = renderSeqRef.current + 1;
                            renderSeqRef.current = renderSeq;
                            const html = await markdownToHtml(value, {
                                linkPreview: config.linkPreview,
                                axiosInstance,
                                abortSignal: abortController.signal,
                            });
                            if (abortController.signal.aborted || renderSeq !== renderSeqRef.current) {
                                return;
                            }
                            //console.info(html + "=..");

                            const changeValues = {
                                previewContent: html,
                                value: value,
                            };
                            setState((prevState) => {
                                return {
                                    ...prevState,
                                    ...changeValues,
                                };
                            });
                            onChange(changeValues);
                        }}
                        style={{
                            minWidth: state.preview ? `calc((50% + ${guttersWidth / 2}px)` : "100%",
                            width: state.preview ? `calc((50% + ${guttersWidth / 2}px)` : "100%",
                            overflow: "auto",
                        }}
                    />
                    {state.preview && <>
                        <Divider vertical={true}
                                 style={{padding: 0, margin: 0, height: "100%", overflow: "hidden"}}/>
                        <HtmlPreviewPanel
                            dark={config.dark}
                            previewRef={previewRef}
                            style={{
                                display: state.preview ? "block" : "none",
                                minWidth: `calc((100% - ${guttersWidth}px) / 2)`,
                                width: `calc((100% - ${guttersWidth}px) / 2)`,
                                paddingTop: 4,
                                paddingBottom: 4,
                                paddingRight: 2,
                                paddingLeft: 5,
                            }}
                            htmlContent={state.previewContent}
                        />
                    </>}

                </div>
            </div>
            {editorRef.current && previewRef.current && editorRef.current.scrollDOM && (
                <ScrollSync mdKey={state.previewContent} editorRef={editorRef} previewRef={previewRef}/>
            )}
        </StyledEditor>
    );
};

export default Editor;
