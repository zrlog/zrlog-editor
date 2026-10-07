import {useEditorMessage} from "../../../icons/message";
import {EditorGlyph} from "../../../icons";
import {Input} from "antd";
import BaseDragger from "../../../editor/common/BaseDragger";
import {DialogType, UploadConfig} from "../../../editor/editor.types";
import {FunctionComponent, useEffect, useState} from "react";
import {getEditorRes} from "../../../editor/lang/editor-lang";

type EditorDialogState = {
    value: string;
    desc: string;
    uploading: boolean;
};

type UploadBodyProps = {
    type: DialogType;
    onChange: (value: string) => void;
    uploadConfig: UploadConfig;
};

function generateVideoEmbed(url: string) {
    // YouTube 处理
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }

    // B站处理
    const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[0-9A-Za-z]+)/);
    if (bilibiliMatch) {
        const bvid = bilibiliMatch[1];
        return `<iframe src="//player.bilibili.com/player.html?bvid=${bvid}&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
    }

    // 默认 <video> 标签
    return `<video controls width="560" src="${url}">您的浏览器不支持 video 标签。</video>`;
}

const UploadBody: FunctionComponent<UploadBodyProps> = ({type, onChange, uploadConfig}) => {
    const [state, setState] = useState<EditorDialogState>({value: "", desc: "", uploading: false});

    const [messageApi, contextHolder] = useEditorMessage({maxCount: 3});

    const getAccept = () => {
        if (type === "image") {
            return "image/*";
        }
        if (type === "video") {
            return "video/*";
        }
        return "";
    };

    useEffect(() => {
        if (state.value === "") {
            return;
        }
        if (type === "video") {
            onChange(generateVideoEmbed(state.value));
            return;
        }
        if (type === "file") {
            onChange("[" + (state.desc !== "" ? state.desc : "file") + "](" + state.value + ")");
            return;
        }
        onChange("![" + state.desc + "](" + state.value + ")");
    }, [state]);

    return (
        <div style={{display: "flex", flexFlow: "column", gap: 12}}>
            {contextHolder}
            <div style={{display: "flex", justifyContent: "flex-start", gap: 12, alignItems: "center"}}>
                <div style={{display: "flex"}}>{getEditorRes("address")}</div>
                <Input
                    style={{minHeight: 36, flex: 1, width: "100%", display: "flex"}}
                    value={state.value}
                    onChange={(e) => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                value: e.target.value,
                            };
                        });
                    }}
                />
                <BaseDragger
                    accept={getAccept()}
                    uploadConfig={uploadConfig}
                    style={{flex: "100%", minWidth: 96, padding: 0, display: "flex", alignItems: "center"}}
                    height={36}
                    type={type}
                    disabled={state.uploading}
                    onError={(e) => {
                        messageApi.error(e.message);
                        setState((prevState) => {
                            return {
                                ...prevState,
                                uploading: false,
                            };
                        });
                    }}
                    onSuccess={(e) => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                value: e.data.url,
                                uploading: false,
                            };
                        });
                    }}
                    onProgress={() => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                uploading: true,
                            };
                        });
                    }}
                >
                    {state.uploading && <EditorGlyph name="loading" style={{marginRight: 8}}/>}
                    {state.uploading ? getEditorRes("uploading") : getEditorRes("localUpload")}
                </BaseDragger>
            </div>

            <div style={{display: "flex", justifyContent: "flex-start", gap: 12, alignItems: "center"}}>
                <div style={{display: "flex"}}>{getEditorRes("desc")}</div>
                <Input
                    style={{minHeight: 36, flex: 1, width: "100%", display: "flex"}}
                    value={state.desc}
                    onChange={(e) => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                desc: e.target.value,
                            };
                        });
                    }}
                ></Input>
                <div style={{minWidth: 96}}></div>
            </div>
        </div>
    );
};

export default UploadBody;
