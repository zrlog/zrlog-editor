import styled, {css} from "styled-components";
import { CSSProperties, forwardRef, PropsWithChildren } from "react";
import {getTextColor} from "../editor-helpers";

const lightCss = `
    .markdown-body strong {
        font-weight: 700;
    }

    .markdown-body h1 {
        margin: 0.67rem 0;
    }

    .markdown-body img {
        border: 0;
    }

    .markdown-body hr {
        box-sizing: content-box;
        height: 0;
    }

    .markdown-body input {
        color: inherit;
        margin: 0;
        line-height: normal;
    }

    .markdown-body html input[disabled] {
        cursor: default;
    }

    .markdown-body input[type="checkbox"] {
        box-sizing: border-box;
        padding: 0;
    }

    .markdown-body * {
        box-sizing: border-box;
    }

    .markdown-body a {
        text-decoration: none;
    }

    .markdown-body a:active,
    .markdown-body a:hover {
        outline: 0;
        text-decoration: underline;
    }

    .markdown-body hr {
        margin: 12px 0;
        overflow: hidden;
        border: 0;
        border-bottom: 1px solid #ddd;
    }

    .markdown-body h1,
    .markdown-body h2 {
        padding-bottom: 0.3rem;
        border-bottom: 1px solid #eee;
    }

    .markdown-body blockquote {
        margin: 0;
    }

    .markdown-body ol ol,
    .markdown-body ul ol {
        list-style-type: lower-roman;
    }

    .markdown-body ol ol ol,
    .markdown-body ol ul ol,
    .markdown-body ul ol ol,
    .markdown-body ul ul ol {
        list-style-type: lower-alpha;
    }

    .markdown-body dd {
        margin-left: 0;
    }

    .markdown-body > :first-child {
        margin-top: 0 !important;
    }

    .markdown-body > :last-child {
        margin-bottom: 0 !important;
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
        position: relative;
        margin-top: 1rem;
        margin-bottom: 1rem;
        font-weight: 700;
        line-height: 1.4;
    }

    .markdown-body h1 {
        font-size: 2.25rem;
        line-height: 1.2;
    }

    .markdown-body h2 {
        font-size: 1.75rem;
        line-height: 1.225;
    }

    .markdown-body h3 {
        font-size: 1.5rem;
        line-height: 1.43;
    }

    .markdown-body h4 {
        font-size: 1.25rem;
    }

    .markdown-body h5 {
        font-size: 1rem;
    }

    .markdown-body h6 {
        font-size: 1rem;
        color: #777;
    }

    .markdown-body blockquote,
    .markdown-body dl,
    .markdown-body ol,
    .markdown-body p,
    .markdown-body pre,
    .markdown-body table,
    .markdown-body ul {
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .markdown-body ol,
    .markdown-body ul {
        padding-left: 2rem;
    }

    .markdown-body ol ol,
    .markdown-body ol ul,
    .markdown-body ul ol,
    .markdown-body ul ul {
        margin-top: 0;
        margin-bottom: 0;
    }

    .markdown-body li > p {
        margin-top: 1rem;
    }

    .markdown-body dl {
        padding: 0;
    }

    .markdown-body dl dt {
        padding: 0;
        margin-top: 1rem;
        font-size: 1rem;
        font-style: italic;
        font-weight: 700;
    }

    .markdown-body dl dd {
        padding: 0 1rem;
        margin-bottom: 1rem;
    }

    .markdown-body blockquote {
        padding: 0 12px;
        color: #777;
        border-left: 4px solid #ddd;
    }

    .markdown-body blockquote > :first-child {
        margin-top: 0;
    }

    .markdown-body blockquote > :last-child {
        margin-bottom: 0;
    }

    .markdown-body table {
        border-collapse: collapse;
        border-spacing: 0;
        display: block;
        width: 100%;
        overflow: auto;
        word-break: normal;
    }

    .markdown-body table th {
        font-weight: 700;
    }

    .markdown-body table td,
    .markdown-body table th {
        padding: 6px 13px;
        border: 1px solid #ddd;
    }

    .markdown-body table tr {
        background-color: #fff;
        border-top: 1px solid #ccc;
    }

    .markdown-body table tr:nth-child(2n) {
        background-color: #f8f8f8;
    }

    .markdown-body img {
        max-width: 100%;
        box-sizing: border-box;
    }

    .markdown-body code {
        padding: 0 0.25rem;
        margin: 0;
        border-radius: 8px;
    }

    .markdown-body p > code {
        background-color: #f6f6f6;
        color: #777;
        border-radius: 4px;
    }

    .markdown-body pre > code {
        font-size: 12px;
        word-break: normal;
        white-space: pre;
        border: 0;
    }

    .markdown-body kbd {
        display: inline-block;
        padding: 3px 5px;
        line-height: 10px;
        color: #555;
        vertical-align: middle;
        background-color: #fcfcfc;
        border: 1px solid #ccc;
        border-bottom-color: #bbb;
        border-radius: 8px;
        box-shadow: inset 0 -1px 0 #bbb;
    }

    .markdown-body .task-list-item input {
        float: left;
        margin: 0.3rem 0 0.25rem -1.6rem;
        vertical-align: middle;
    }

    .markdown-body .highlight pre,
    .markdown-body pre {
        line-height: 1.6;
        font-size: 85%;
        border-radius: 8px;
    }

    .markdown-body .katex-display {
        display: inline-block;
    }

    .code-block-wrapper {
        position: relative;
    }

    .code-block-wrapper .copy-button {
        position: absolute;
        top: 4px;
        right: 4px;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 10;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 4px;
        padding: 2px;
        line-height: 0;
    }

    .code-block-wrapper:hover .copy-button {
        opacity: 1;
    }
`;

const darkCss = css`
    .markdown-body table th {
        border: 1px solid rgba(198, 198, 198, 0.5);
    }

    .markdown-body table td {
        border: 1px solid rgba(198, 198, 198, 0.5);
    }

    .markdown-body table tr {
        background-color: #212529 !important;
        border-top: 1px solid rgba(198, 198, 198, 0.5);
    }

    .markdown-body table tr:nth-child(2n) {
        background-color: #212529 !important;
    }

    .code-block-wrapper .copy-button {
        background: rgba(0, 0, 0, 0.5);
    }
`;

const PreviewSurface = styled.div<{$dark: boolean}>`
    ${lightCss}
    ${({$dark}) => $dark && darkCss}
`;

type StyledPreviewProps = PropsWithChildren & {
    dark: boolean;
    style?: CSSProperties;
};

const StyledPreview = forwardRef<HTMLDivElement, StyledPreviewProps>(({ dark, style, children, ...rest }, ref) => {
    const darkStyle = dark
        ? {
              color: getTextColor(dark),
          }
        : {};

    return (
        <PreviewSurface $dark={dark} ref={ref} style={{...darkStyle, ...style}} {...rest}>
            {children}
        </PreviewSurface>
    );
});

export default StyledPreview;
