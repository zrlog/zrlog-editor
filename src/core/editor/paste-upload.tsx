import {useEditorMessage} from "../../icons/message";
import {FunctionComponent, useEffect} from "react";
import {UploadConfig} from "../../editor/editor.types";

type PasteUploadProps = {
    onUploadSuccess: (imgUrl: string) => void;
    onUploading?: () => void;
    onUploadFailure?: () => void;
    getContainer?: () => HTMLElement;
    pasteView?: HTMLElement;
    uploadConfig: UploadConfig
};

const PasteUpload: FunctionComponent<PasteUploadProps> = ({
                                                              onUploadSuccess,
                                                              pasteView,
                                                              onUploading,
                                                              onUploadFailure,
                                                              getContainer,
                                                              uploadConfig,
                                                          }) => {

    const [messageApi, contextHolder] = useEditorMessage({maxCount: 3, getContainer: getContainer});

    const getFileExt = (filename: string, defaultExt: string) => {
        if (!filename.includes(".")) {
            return defaultExt;
        }
        let ext = filename.substring(filename.lastIndexOf(".") + 1);
        if (ext.trim().length === 0) {
            ext = defaultExt;
        }
        return ext;
    };

    const uploadFile = async (file: File): Promise<string> => {
        const index = Math.random().toString(10).substr(2, 5) + "-" + Math.random().toString(36).substr(2);
        const fileName = index + "." + getFileExt(file.name, "jpg");
        const formData = new FormData();
        formData.append(uploadConfig.formName ? uploadConfig.formName : "imgFile", file, fileName);
        try {
            const {data} = await uploadConfig.axiosInstance.post(uploadConfig.buildUploadUrl("image"), formData);
            const url = data.data.url;
            if (url.startsWith("/") && uploadConfig.tryAppendBackendServerUrl) {
                return uploadConfig.tryAppendBackendServerUrl(data.data.url.substring(1));
            }
            return url;
        } catch (e) {
            //@ts-ignore
            messageApi.error(e.message);
        }
        return "";
    };

    const doUpload = async (e: ClipboardEvent) => {
        const items = await window.navigator.clipboard.read();
        const imgFiles: File[] = [];
        console.info(items);
        for (const item of items) {
            for (const type of item.types) {
                if (type.startsWith('image/')) {
                    // getType 返回的是 Blob 对象
                    const blob = await item.getType(type);
                    // 将 Blob 转换为 File 对象（如果你的后端或逻辑需要 File）
                    const file = new File([blob], `clipboard-image.${type.split('/')[1]}`, {
                        type: type
                    });

                    imgFiles.push(file);
                }
            }
        }
        if (imgFiles.length > 0) {
            // 取消默认的粘贴操作
            e.preventDefault();
            if (onUploading) {
                onUploading();
            }
            const data = await Promise.all(
                imgFiles.map(async (e) => {
                    // 上传文件
                    return await uploadFile(e);
                })
            );
            data.forEach((e) => {
                if (e.length === 0) {
                    if (onUploadFailure) {
                        onUploadFailure();
                    }
                } else {
                    onUploadSuccess(e);
                }
            });
        }
    };

    const doHandler = () => {
        if (pasteView) {
            pasteView.addEventListener("paste", doUpload);
        }
    };

    useEffect(() => {
        doHandler();

        return () => {
            pasteView?.removeEventListener("paste", doUpload);
        };
    }, []);

    return <>
        {contextHolder}
    </>;
};

export default PasteUpload;
