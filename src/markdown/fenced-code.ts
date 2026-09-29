import {Lexer} from "marked";

export type MarkdownSegment = {
    value: string;
    locked: boolean;
};

const matchFencedCode = (source: string): string | undefined => {
    const rule = Lexer.rules.block.gfm.fences;
    const match = rule.exec(source);
    if (match) {
        return match[0];
    }
    // Fences inside list items may have more indentation than a top-level block.
    // Apply the same grammar after deindenting, then map its span back to the source.
    const indent = /^ {4,}(?=[`~])/.exec(source)?.[0];
    if (!indent) {
        return undefined;
    }
    let removed = 0;
    const prefixes: {offset: number; length: number}[] = [];
    const deindented = source.replace(new RegExp(`^ {1,${indent.length}}`, "gm"), (prefix, offset) => {
        prefixes.push({offset: offset - removed, length: prefix.length});
        removed += prefix.length;
        return "";
    });
    const nested = rule.exec(deindented);
    if (!nested) {
        return undefined;
    }
    const length = nested[0].length;
    const prefixLength = prefixes.reduce((total, prefix) => total + (prefix.offset < length ? prefix.length : 0), 0);
    return source.slice(0, length + prefixLength);
};

/** Use the renderer's fence grammar so preprocessing cannot end a code block early. */
export const splitFencedCodeSegments = (markdownValue: string): MarkdownSegment[] => {
    // Marked normalizes line endings before tokenizing too.
    const source = markdownValue.replace(/\r\n|\r/g, "\n");
    const segments: MarkdownSegment[] = [];
    let position = 0;
    let plainStart = 0;
    while (position < source.length) {
        const code = matchFencedCode(source.slice(position));
        if (code) {
            if (position > plainStart) {
                segments.push({value: source.slice(plainStart, position), locked: false});
            }
            segments.push({value: code, locked: true});
            position += code.length;
            plainStart = position;
        } else {
            const newline = source.indexOf("\n", position);
            position = newline === -1 ? source.length : newline + 1;
        }
    }
    if (plainStart < source.length) {
        segments.push({value: source.slice(plainStart), locked: false});
    }
    return segments;
};

export const createFencedCodeBlock = (code: string, language: string): string => {
    const longestRun = (code.match(/`+/g) || []).reduce((length, run) => Math.max(length, run.length), 0);
    const fence = "`".repeat(Math.max(3, longestRun + 1));
    return `${fence}${language}\n${code}\n${fence}\n`;
};
