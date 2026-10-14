// messages.ts
export const editorLang = {
    zh_CN: {
        addVideo: "添加视频",
        addImage: "添加图片",
        addFile: "添加文件",
        addLink: "添加链接",
        addTable: "添加表格",
        addCode: "添加代码块",
        help: "帮助",
        justNow: "刚刚",
        xMinutesAgo: "分钟前",
        xHourAgo: "小时前",
        currentDraft: "当前为草稿",
        update: "更新于",
        lang: "语言",
        desc: "描述",
        address: "地址",
        col: "列",
        row: "行",
        right: "右",
        left: "左",
        center: "中",
        algin: "对齐",
        words: "字",
        findDialog: {
            Find: "查找",
            Replace: "替换",
            next: "下一个",
            previous: "上一个",
            replace: "替换",
            "replace all": "全部替换",
            "match case": "区分大小写",
            regexp: "正则表达式",
            "by word": "整词匹配",
            close: "关闭",
            all: "全部",
            "No matches": "没有匹配项",
            "replaced X matches": "替换了 $X 条匹配项",
        },
        wordsCount: "字数",
        linesCount: "行数",
        copy: "复制",
        copied: "已复制",
        copPreviewHtmlToClipboardSuccess: "预览 HTML 已复制到剪贴板",
        copPreviewHtmlToClipboard: "复制预览 HTML 到剪贴板",
        closePreview: "关闭实时预览",
        openPreview: "打开实时预览",
        offlineArticleEditing: "离线编辑",
        uploading: "上传中",
        localUpload: "本地上传",
        setting: "设置",
        ai: {
            askConfig: "请先完成 AI 助手设置",
            thinking: "思考中",
            ai: "AI 助手",
            inputTips: "询问任何问题",
            contentTips: "AI 也可能会犯错。请核查重要信息。",
            title: "我们先从哪里开始呢？"
        },

    },
    en_US: {
        addVideo: "Add video",
        addImage: "Add image",
        addFile: "Add file",
        addLink: "Add link",
        addTable: "Add table",
        addCode: "Add code block",
        help: "Help",
        justNow: "Just now",
        xMinutesAgo: " minutes ago",
        xHourAgo: " hours ago",
        currentDraft: "Draft",
        update: "Updated",
        lang: "Language",
        desc: "Description",
        address: "Address",
        col: "Columns",
        row: "Rows",
        right: "Right",
        left: "Left",
        center: "Center",
        algin: "Alignment",
        findDialog: {},
        wordsCount: "Words",
        linesCount: "Lines",
        copy: "Copy",
        copied: "Copied",
        copPreviewHtmlToClipboard: "Copy preview HTML to clipboard",
        copPreviewHtmlToClipboardSuccess: "Preview HTML copied to clipboard",
        closePreview: "Close live preview",
        openPreview: "Open live preview",
        offlineArticleEditing: "Editing offline",
        uploading: "Uploading",
        localUpload: "Upload from device",
        setting: "Settings",
        ai: {
            ai: "AI assistant",
            askConfig: "Configure the AI assistant first",
            thinking: "Thinking",
            inputTips: "Ask a question",
            contentTips: "AI can make mistakes. Check important info.",
            title: "Where should we begin?"
        }

    },
} as const;

export type Locale = keyof typeof editorLang; // "en" | "zh"
export type MessageKey = keyof typeof editorLang["en_US"];
let editorCurrentLang: Locale = "zh_CN";

export const setEditorLang = (lang: Locale) => {
    editorCurrentLang = lang;
};

export function getEditorRes<K extends MessageKey>(key: K): typeof editorLang[Locale][K] {
    return editorLang[editorCurrentLang][key];
}
