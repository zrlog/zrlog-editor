import {Marked} from "marked";
import katex from "katex";
import {createCodeRenderer, DiagramMode} from "./code-renderer";
import {splitFencedCodeSegments} from "./fenced-code";

export type MarkdownRenderOptions = {
    /** Keep diagram source as code by default; browser adapters can request placeholders. */
    diagrams?: DiagramMode;
};

// Dedicated instances keep editor/global marked configuration out of server rendering.
const codeParser = new Marked({gfm: true, breaks: true, async: false, renderer: createCodeRenderer("code")});
const placeholderParser = new Marked({gfm: true, breaks: true, async: false, renderer: createCodeRenderer("placeholder")});

type MarkdownMathToken = {
    placeholder: string;
    expression: string;
    displayMode: boolean;
};

const inlineCodePattern = /(`+)([\s\S]*?)\1/g;
const texBlockPattern = /\$\$([\s\S]+?)\$\$/g;
const texInlinePattern = /(?<!\$)\$(.+?)\$(?!\$)/g;
const cjkStrongBoundaryMarker = "<!--zrlog-cjk-strong-->";
const cjkCharRange = "\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF\\u3040-\\u30FF\\uAC00-\\uD7AF";

const escapeRegexCharClass = (value: string) => value.replace(/[\\\]\-^]/g, "\\$&");
const cjkStrongBoundaryPunctuationClass = escapeRegexCharClass("'\"\u201c\u201d\u2018\u2019\u300c\u300d\u300e\u300f\uff08\uff09()\u300a\u300b\u3008\u3009\u3010\u3011[]{}\uff0c\u3002\uff01\uff1f\uff1b\uff1a\u3001,.!?;:");
const cjkStrongOpenBoundaryPattern = new RegExp(`([${cjkCharRange}])\\*\\*(?=[${cjkStrongBoundaryPunctuationClass}])`, "g");
const cjkStrongCloseBoundaryPattern = new RegExp(`([${cjkStrongBoundaryPunctuationClass}])\\*\\*(?=[${cjkCharRange}])`, "g");

const transformOutsideInlineCode = (markdownValue: string, transform: (value: string) => string) => {
    let output = "";
    let lastIndex = 0;
    markdownValue.replace(inlineCodePattern, (match: string, _ticks: string, _code: string, offset: number) => {
        output += transform(markdownValue.slice(lastIndex, offset));
        output += match;
        lastIndex = offset + match.length;
        return match;
    });
    return output + transform(markdownValue.slice(lastIndex));
};

const transformOutsideMarkdownCode = (markdownValue: string, transform: (value: string) => string) => {
    return splitFencedCodeSegments(markdownValue)
        .map((segment) => segment.locked ? segment.value : transformOutsideInlineCode(segment.value, transform))
        .join("");
};

const escapeMathSource = (value: string) => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

const createMathPlaceholder = (expression: string, displayMode: boolean, tokens: MarkdownMathToken[]) => {
    const attrName = displayMode ? "data-zrlog-math-block" : "data-zrlog-math-inline";
    const tagName = displayMode ? "div" : "span";
    const placeholder = `<${tagName} ${attrName}="${tokens.length}"></${tagName}>`;
    tokens.push({placeholder, expression, displayMode});
    return placeholder;
};

const extractMarkdownMath = (markdownValue: string) => {
    const tokens: MarkdownMathToken[] = [];
    const markdown = transformOutsideMarkdownCode(markdownValue, (value) => {
        const withBlockMath = value.replace(texBlockPattern, (_match, expression: string) => {
            return createMathPlaceholder(expression, true, tokens);
        });
        return withBlockMath.replace(texInlinePattern, (_match, expression: string) => {
            return createMathPlaceholder(expression, false, tokens);
        });
    });
    return {markdown, tokens};
};

const renderMathToken = (token: MarkdownMathToken) => {
    try {
        return katex.renderToString(token.expression, {
            displayMode: token.displayMode,
            throwOnError: false,
            output: "html",
        });
    } catch (e) {
        const source = token.displayMode ? `$$${token.expression}$$` : `$${token.expression}$`;
        return escapeMathSource(source);
    }
};

const restoreMarkdownMath = (html: string, tokens: MarkdownMathToken[]) => {
    return tokens.reduce((value, token) => {
        return value.split(token.placeholder).join(renderMathToken(token));
    }, html);
};

const addCjkStrongBoundaryMarkers = (markdownValue: string) => {
    return transformOutsideMarkdownCode(markdownValue, (value) => {
        return value
            .replace(cjkStrongOpenBoundaryPattern, `$1${cjkStrongBoundaryMarker}**`)
            .replace(cjkStrongCloseBoundaryPattern, `$1**${cjkStrongBoundaryMarker}`);
    });
};

/** Render synchronously without DOM, timers, network access, or Node.js globals. */
export const markdownToHtml = (markdownValue: string | null | undefined, options?: MarkdownRenderOptions): string => {
    const mathResult = extractMarkdownMath(markdownValue ?? "");
    const markdown = addCjkStrongBoundaryMarkers(mathResult.markdown);
    const parser = options?.diagrams === "placeholder" ? placeholderParser : codeParser;
    const html = parser.parse(markdown, {async: false});
    return restoreMarkdownMath(html, mathResult.tokens).split(cjkStrongBoundaryMarker).join("");
};
