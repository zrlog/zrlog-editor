### editor 维护记录

### 2.1.33

- Choose a longer fence when inserting code containing backticks.
- Preserve nested fences, literal math, and URLs inside code during Markdown preprocessing and link previews.
- Publish `@zrlog/editor` to npmjs with shared runtime peer dependencies and a standalone `markdown` entry.
- Validate the npm tarball and publish through a manual GitHub Actions workflow.

### 2.1.32

- Add a standalone Markdown bundle for GraalJS/Polyglot without browser globals.
- Share code highlighting, CJK strong handling, and KaTeX rendering with the editor.
- Publish a versioned Markdown min.js alongside the editor package.

#### dependency upgraded

- marked (to 2020 version)

#### 1.5.1

- Fix render error in spa mode
- Use svg font
- Remove fullscreen listen (use screenfull.js)
- Add copy html preview
- Add video upload

#### 1.5.2

- revoke unwatch

#### 1.5.3

- add eye icon
- remove watch border light

### 1.5.6

- update katex path

### 1.5.7

- ant dialog instance javascript build dialog

### 1.5.8

- fix mobile click error

### 2.0

> remove editormd

- base `antd ui` + `codemirror` + `marked`

### 2.1

- ai editor add stream rsponse
