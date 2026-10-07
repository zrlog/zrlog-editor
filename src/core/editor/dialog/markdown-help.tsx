import {marked} from "marked";
import HtmlPreviewPanel from "../html-preview-panel";
import StyledPreview from "../../../editor/styles/styled-preview";
import {FunctionComponent} from "react";
import {theme} from "antd";
import {editorVersion} from "../../../editor/editor-version";

const helpMd = `
### Markdown语法教程 (Markdown syntax tutorial)

- [Markdown Syntax](http://daringfireball.net/projects/markdown/syntax/ "Markdown Syntax")
- [Mastering Markdown](https://guides.github.com/features/mastering-markdown/ "Mastering Markdown")
- [Markdown Basics](https://help.github.com/articles/markdown-basics/ "Markdown Basics")
- [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/ "GitHub Flavored Markdown")
- [Markdown 语法说明（简体中文）](http://www.markdown.cn/ "Markdown 语法说明（简体中文）")
- [Markdown 語法說明（繁體中文）](http://markdown.tw/ "Markdown 語法說明（繁體中文）")

### 流程图参考 (Flowchart reference)

[http://adrai.github.io/flowchart.js/](http://adrai.github.io/flowchart.js/)

### 时序图参考 (SequenceDiagram reference)

[http://bramp.github.io/js-sequence-diagrams/](http://bramp.github.io/js-sequence-diagrams/)

### TeX/LaTeX reference

[http://meta.wikimedia.org/wiki/Help:Formula](http://meta.wikimedia.org/wiki/Help:Formula)
`;

type MarkdownHelpProps = {
    dark: boolean;
}

const MarkdownHelp: FunctionComponent<MarkdownHelpProps> = ({dark}) => {
    const {token} = theme.useToken();
    const helpHtml = marked(helpMd);
    return (
        <StyledPreview dark={dark} style={{borderRadius: 8}}>
            <HtmlPreviewPanel dark={dark} htmlContent={helpHtml as string}/>
            <div style={{
                borderTop: `${token.colorBorderSecondary} solid 1px`,
                color: token.colorTextTertiary,
                fontSize: 12,
                marginTop: 8,
                padding: "8px 12px 4px",
                textAlign: "right",
            }}>
                ZrLog Editor {editorVersion}
            </div>
        </StyledPreview>
    );
};

export default MarkdownHelp;
