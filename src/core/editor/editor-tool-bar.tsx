import {EditorGlyph} from "../../icons";
import {CSSProperties, FunctionComponent, useState} from "react";
import {EditorDialogState, UploadConfig} from "../../editor/editor.types";
import EditorDialog from "./dialog/editor-dialog";
import EditorIcon from "../../editor/editor-icon";
import Spin from "antd/es/spin";
import {getEditorRes} from "../../editor/lang/editor-lang";
import {AxiosInstance} from "axios";
import {Divider} from "antd";

type EditorToolBarProps = {
    onChange: (val: string, cursorPosition: number) => void;
    onCopy?: () => void;
    preview: boolean;
    onEditorModeChange: (preview: boolean) => void;
    imageUploading?: boolean;
    dark: boolean;
    axiosInstance?: AxiosInstance;
    uploadConfig: UploadConfig
};

type EditorToolBarDividerProps = {
    style?: CSSProperties;
}

export const EditorToolBarDivider: FunctionComponent<EditorToolBarDividerProps> = ({style}) => {
    return (
        <Divider
            vertical={true} style={{height: "1em", margin: 0, ...style}}/>
    );
};

const EditorToolBar: FunctionComponent<EditorToolBarProps> = ({
                                                                  onChange,
                                                                  onCopy,
                                                                  preview,
                                                                  onEditorModeChange,
                                                                  imageUploading,
                                                                  uploadConfig
                                                              }) => {
    const [dialogState, setDialogState] = useState<EditorDialogState>({
        open: false,
        title: "",
        type: "image",
    });

    return (
        <>
            {dialogState.open && (
                <EditorDialog
                    uploadConfig={uploadConfig}
                    title={dialogState.title}
                    type={dialogState.type}
                    onOk={(mdStr) => {
                        setDialogState({
                            title: "",
                            type: "image",
                            open: false,
                        });
                        onChange(mdStr, mdStr.length);
                    }}
                    onClose={() => {
                        setDialogState({
                            title: "",
                            type: "image",
                            open: false,
                        });
                    }}
                />
            )}
            <div
                style={{
                    display: "flex",
                    paddingRight: 8,
                    flexWrap: "wrap",
                    paddingLeft: 8,
                    alignItems: "center",
                    maxHeight: 79,
                    overflowY: "auto",
                }}
            >
                <EditorIcon
                    onClick={() => {
                        onChange("****", 2);
                    }}
                >
                    <EditorGlyph name="bold"/>
                </EditorIcon>
                <EditorIcon
                    onClick={() => {
                        onChange("~~~~", 2);
                    }}
                >
                    <EditorGlyph name="strikethrough"/>
                </EditorIcon>
                <EditorIcon
                    onClick={() => {
                        onChange("**", 1);
                    }}
                >
                    <EditorGlyph name="italic"/>
                </EditorIcon>
                <EditorIcon
                    onClick={() => {
                        onChange("> ", 2);
                    }}
                >
                    <EditorGlyph name="quote"/>
                </EditorIcon>
                <EditorToolBarDivider/>
                <EditorIcon
                    onClick={() => {
                        onChange("## ", 3);
                    }}
                >
                    <EditorGlyph name="heading2"/>
                </EditorIcon>
                <EditorIcon
                    onClick={() => {
                        onChange("### ", 4);
                    }}
                >
                    <EditorGlyph name="heading3"/>
                </EditorIcon>
                <EditorIcon
                    onClick={() => {
                        onChange("#### ", 5);
                    }}
                >
                    <EditorGlyph name="heading4"/>
                </EditorIcon>
                <EditorToolBarDivider/>
                <EditorIcon
                    onClick={() => {
                        onChange("- ", 2);
                    }}
                >
                    <EditorGlyph name="unorderedList"/>
                </EditorIcon>
                <EditorIcon
                    onClick={() => {
                        onChange("1. ", 3);
                    }}
                >
                    <EditorGlyph name="orderedList"/>
                </EditorIcon>
                <EditorIcon
                    onClick={() => {
                        const mdStr = "\n------------\n\n ";
                        onChange(mdStr, mdStr.length);
                    }}
                >
                    <EditorGlyph name="horizontalRule"/>
                </EditorIcon>
                <EditorToolBarDivider/>
                <EditorIcon
                    title={getEditorRes("addLink")}
                    onClick={() => {
                        setDialogState({
                            open: true,
                            title: getEditorRes("addLink"),
                            type: "link",
                        });
                    }}
                >
                    <EditorGlyph name="link"/>
                </EditorIcon>
                <Spin spinning={imageUploading} indicator={<EditorGlyph name="upload"/>}>
                    <EditorIcon
                        title={getEditorRes("addImage")}
                        onClick={() => {
                            setDialogState({
                                open: true,
                                title: getEditorRes("addImage"),
                                type: "image",
                            });
                        }}
                    >
                        <EditorGlyph name="image"/>
                    </EditorIcon>
                </Spin>

                <EditorIcon
                    title={getEditorRes("addVideo")}
                    onClick={() => {
                        setDialogState({
                            open: true,
                            title: getEditorRes("addVideo"),
                            type: "video",
                        });
                    }}
                >
                    <EditorGlyph name="video"/>
                </EditorIcon>
                <EditorIcon
                    title={getEditorRes("addFile")}
                    onClick={() => {
                        setDialogState({
                            open: true,
                            title: getEditorRes("addFile"),
                            type: "file",
                        });
                    }}
                >
                    <EditorGlyph name="attachment"/>
                </EditorIcon>
                <EditorToolBarDivider/>
                <EditorIcon
                    title={getEditorRes("addCode")}
                    onClick={() => {
                        setDialogState({
                            open: true,
                            title: getEditorRes("addCode"),
                            type: "code",
                        });
                    }}
                >
                    <EditorGlyph name="code"/>
                </EditorIcon>
                <EditorIcon
                    title={getEditorRes("addTable")}
                    onClick={() => {
                        setDialogState({
                            open: true,
                            title: getEditorRes("addTable"),
                            type: "table",
                        });
                    }}
                >
                    <EditorGlyph name="table"/>
                </EditorIcon>
                <EditorIcon title={getEditorRes("copPreviewHtmlToClipboard")} onClick={onCopy}>
                    <EditorGlyph name="copyHtml"/>
                </EditorIcon>
                {preview ? (
                    <EditorIcon
                        title={getEditorRes("closePreview")}
                        key={preview + ""}
                        onClick={() => {
                            onEditorModeChange(false);
                        }}
                    >
                        <EditorGlyph name="previewOff" selected={preview}/>
                    </EditorIcon>
                ) : (
                    <EditorIcon
                        title={getEditorRes("openPreview")}
                        key={preview + ""}
                        onClick={() => {
                            onEditorModeChange(true);
                        }}
                    >
                        <EditorGlyph name="preview" selected={preview}/>
                    </EditorIcon>
                )}
                <EditorToolBarDivider/>
                <EditorIcon
                    title={getEditorRes("help")}
                    onClick={() => {
                        setDialogState({
                            open: true,
                            title: getEditorRes("help"),
                            type: "help",
                        });
                    }}
                >
                    <EditorGlyph name="help"/>
                </EditorIcon>
            </div>
            <Divider style={{padding: 0, margin: 0}}/>
        </>
    );
};

export default EditorToolBar;
