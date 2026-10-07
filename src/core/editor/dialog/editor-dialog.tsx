import {useEditorMessage} from "../../../icons/message";
import {FunctionComponent, useState} from "react";
import {Modal} from "antd";
import MarkdownHelp from "./markdown-help";
import TableBody from "./table-body";
import CodeBody from "../../../editor/dialog/code-body";
import {DialogType, UploadConfig} from "../../../editor/editor.types";
import UploadBody from "./upload-body";
import LinkBody from "../../../editor/dialog/link-body";

type EditorDialogProps = {
    title: string;
    type: DialogType;
    onOk?: (mdStr: string) => void;
    onClose?: () => void;
    getContainer?: () => HTMLElement;
    dark?: boolean;
    uploadConfig: UploadConfig;
};

type EditorDialogState = {
    value: string;
};

const EditorDialog: FunctionComponent<EditorDialogProps> = ({
                                                                title,
                                                                type,
                                                                onOk,
                                                                onClose,
                                                                getContainer,
                                                                dark,
                                                                uploadConfig
                                                            }) => {
    const [state, setState] = useState<EditorDialogState>({
        value: "",
    });

    const [messageApi, contextHolder] = useEditorMessage({maxCount: 3, getContainer: getContainer});

    const getBody = () => {
        if (type === "help") {
            return <MarkdownHelp dark={dark ? dark : false}/>;
        }
        if (type === "code") {
            return (
                <CodeBody
                    getContainer={getContainer}
                    onChange={(v) => {
                        setState(() => {
                            return {
                                value: v,
                            };
                        });
                    }}
                />
            );
        }
        if (type === "table") {
            return (
                <TableBody
                    onChange={(e) => {
                        setState(() => {
                            return {
                                value: e,
                            };
                        });
                    }}
                />
            );
        }
        if (type === "link") {
            return (
                <LinkBody
                    onChange={(value) => {
                        setState({value: value});
                    }}
                />
            );
        }
        return (
            <UploadBody
                uploadConfig={uploadConfig}
                type={type}
                onChange={(value) => {
                    setState({value: value});
                }}
            />
        );
    };

    return (
        <Modal
            open={true}
            width={{
                xs: "90%",
                sm: "80%",
                md: "70%",
                lg: "60%",
                xl: "50%",
                xxl: "40%",
            }}
            getContainer={getContainer}
            title={title}
            onOk={() => {
                if (type === "help") {
                    if (onClose) {
                        onClose();
                    }
                    return;
                }
                if (onOk) {
                    if (type === "table" || type === "code") {
                        if (state.value === "") {
                            messageApi.error("内容不能为空");
                            return;
                        }
                        onOk(state.value);
                        return;
                    } else {
                        if (state.value === "") {
                            messageApi.error("地址不能为空");
                            return;
                        }
                        onOk(state.value);
                    }
                }
            }}
            onCancel={() => {
                if (onClose) {
                    onClose();
                }
            }}
        >
            {contextHolder}
            {getBody()}
        </Modal>
    );
};

export default EditorDialog;
