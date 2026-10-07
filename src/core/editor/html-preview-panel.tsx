import {highlightDark} from "../../editor/highlight/styled-highlight-dark";
import {highlightDefault} from "../../editor/highlight/styled-highlight-default";
import {useLayoutEffect, useRef, useState} from "react";
import type {CSSProperties, MutableRefObject} from "react";
import {createPortal} from "react-dom";
import {Typography} from "antd";
import styled from "styled-components";
import "katex/dist/katex.min.css";
import StyledPreview from "../../editor/styles/styled-preview";
import {getEditorRes} from "../../editor/lang/editor-lang";
import {EditorGlyph} from "../../icons";

export type EditorPreviewProps = {
    htmlContent: string;
    editable?: boolean;
    previewRef?: MutableRefObject<HTMLDivElement | null>;
    onContentChange?: (str: string) => void;
    style?: CSSProperties;
    dark: boolean;
};
const Highlight = styled.div<{$dark: boolean}>`${({$dark}) => $dark ? highlightDark : highlightDefault}`;
type CopyHost = {element: HTMLDivElement; code: string};

// Own each HTML document separately so portals unmount before its DOM is replaced.
function PreviewDocument({htmlContent, dark, editable, onContentChange}: EditorPreviewProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [copies, setCopies] = useState<CopyHost[]>([]);
    useLayoutEffect(() => {
        const container = ref.current!;
        container.innerHTML = htmlContent;
        const hosts: CopyHost[] = [];
        container.querySelectorAll<HTMLElement>(".code-block-wrapper").forEach(block => {
            if (!block.dataset.code) return;
            let code: string;
            try { code = decodeURIComponent(block.dataset.code); } catch { code = block.dataset.code; }
            delete block.dataset.code;
            const element = document.createElement("div");
            element.className = "copy-button";
            element.contentEditable = "false";
            block.appendChild(element);
            hosts.push({element, code});
        });
        setCopies(hosts);
        // React owns the portals; it removes their event handlers/state on unmount.
    }, [htmlContent]);
    return <>
        <Highlight ref={ref} $dark={dark} contentEditable={editable} suppressContentEditableWarning
            className="markdown-body" style={{outline: "none", boxShadow: "none"}}
            onInput={() => {if (ref.current) onContentChange?.(ref.current.innerHTML);}}/>
        {copies.map(({element, code}, index) => createPortal(
            <Typography.Paragraph style={{margin: 0}} copyable={{text: code,
                icon: [<EditorGlyph name="copy"/>, <EditorGlyph name="check" selected/>],
                tooltips: [getEditorRes("copy"), getEditorRes("copied")],
            }}/>, element, String(index)))}
    </>;
}

export default function HtmlPreviewPanel(props: EditorPreviewProps) {
    const [document, setDocument] = useState<{
        source: string; initialHtml: string; revision: number; lastInput?: string;
    }>({source: props.htmlContent, initialHtml: props.htmlContent, revision: 0});
    if (props.htmlContent !== document.source) {
        // A controlled editable preview may echo its own input back. Keep that DOM
        // and caret; only externally replaced documents need new portal hosts.
        const echo = props.editable && props.htmlContent === document.lastInput;
        setDocument({source: props.htmlContent,
            initialHtml: echo ? document.initialHtml : props.htmlContent,
            revision: document.revision + (echo ? 0 : 1),
            lastInput: echo ? document.lastInput : undefined});
    }
    return <StyledPreview dark={props.dark} ref={props.previewRef}
        style={{lineHeight: 1.4, overflowY: "auto", wordBreak: "break-word", boxSizing: "border-box", ...props.style}}>
        <PreviewDocument {...props} key={document.revision} htmlContent={document.initialHtml}
            onContentChange={html => {
                setDocument(previous => ({...previous, lastInput: html}));
                props.onContentChange?.(html);
            }}/>
    </StyledPreview>;
}
