const assert = require('node:assert/strict');
const fs = require('node:fs');
const {test} = require('node:test');
const ts = require('typescript');
const {JSDOM} = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'https://editor.test/'});
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'SVGElement', 'ShadowRoot', 'Node', 'MutationObserver', 'getComputedStyle']) {
    Object.defineProperty(global, name, {value: dom.window[name], configurable: true});
}
window.matchMedia = () => ({matches: false, addListener() {}, removeListener() {}});
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = clearTimeout;
global.IS_REACT_ACT_ENVIRONMENT = true;
const originalJS = require.extensions['.js'];
// Exercise real source components with real React and Ant Design. Only compilation is adapted.
for (const ext of ['.tsx', '.ts']) require.extensions[ext] = (module, file) => {
    module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {
        target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    }}).outputText, file);
};
require.extensions['.js'] = (module, file) => {
    if (file.includes('/node_modules/antd/es/')) {
        return module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {
            target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
        }}).outputText, file);
    }
    originalJS(module, file);
};
require.extensions['.css'] = () => {};
const React = require('react');
const {act} = React;
const {createRoot} = require('react-dom/client');
const {renderToStaticMarkup} = require('react-dom/server');
const {ConfigProvider} = require('antd');
const {EditorIconProvider, EditorGlyph} = require('../src/icons.ts');
const Preview = require('../src/core/editor/html-preview-panel.tsx').default;
const LegacyPreview = require('../src/editor/html-preview-panel.tsx').default;
const TableBody = require('../src/core/editor/dialog/table-body.tsx').default;
const {useEditorMessage} = require('../src/icons/message.tsx');
const h = React.createElement;
const glyph = name => props => h('i', {'data-test-icon': name, 'data-chosen': !!props.selected,
    'data-spin': !!props.spin, style: props.style});
const alpha = glyph('alpha'), beta = glyph('beta');
const host = icons => h(EditorIconProvider, {icons}, h(EditorGlyph, {name: 'copy', selected: true, size: 23, color: 'red'}));
function mount(t) {
    const container = document.createElement('div'); document.body.appendChild(container);
    const root = createRoot(container);
    t.after(() => {act(() => root.unmount()); container.remove();});
    return {container, render: content => act(() => root.render(content))};
}

test('nested partial overrides and sibling providers isolate icons and forward state/style', () => {
    const result = renderToStaticMarkup(h(React.Fragment, null,
        h(EditorIconProvider, {icons: {copy: alpha, check: alpha}},
            h(EditorIconProvider, {icons: {copy: beta}},
                h(EditorGlyph, {name: 'copy', selected: true, size: 23, color: 'red'}),
                h(EditorGlyph, {name: 'check'}))), host({copy: alpha})));
    assert.match(result, /data-test-icon="beta"[^>]*data-chosen="true"[^>]*font-size:23px;color:red/);
    assert.equal((result.match(/data-test-icon="alpha"/g) || []).length, 2);
    assert.throws(() => renderToStaticMarkup(h(EditorGlyph, {name: 'bold'})), /Missing editor icon "bold"/);
});

test('legacy entry supplies copy defaults and honors partial host overrides', t => {
    const {container, render} = mount(t);
    render(h(EditorIconProvider, {icons: {copy: beta}}, h(LegacyPreview, {
        htmlContent: '<div class="code-block-wrapper" data-code="legacy"><pre>legacy</pre></div>', dark: false,
    })));
    assert.ok(container.querySelector('[data-test-icon="beta"]'));
    render(h(LegacyPreview, {htmlContent: '<div class="code-block-wrapper" data-code="default"><pre>default</pre></div>', dark: false}));
    assert.ok(container.querySelector('[data-editor-icon="copy"] svg'));
});

test('preview portals retain DOM and copied state across theme changes, and clean up on new HTML', async t => {
    const {container, render} = mount(t);
    let copied;
    navigator.clipboard = {writeText: async text => {copied = text;}};
    const html = '<div class="code-block-wrapper" data-code="line%201%0Aline%202"><pre>line 1\nline 2</pre></div>';
    const content = (Icon, dark, htmlContent = html) => h(EditorIconProvider, {icons: {copy: Icon, check: Icon}},
        h(Preview, {htmlContent, dark}));
    render(content(alpha, false));
    const markdown = container.querySelector('.markdown-body');
    const copyHost = container.querySelector('.copy-button');
    await act(async () => {container.querySelector('.ant-typography-copy').click();});
    assert.equal(copied, 'line 1\nline 2');
    assert.ok(container.querySelector('[data-editor-icon="check"] [data-chosen="true"]'));
    render(content(beta, true));
    assert.ok(container.querySelector('.markdown-body') === markdown, 'preview DOM must remain mounted');
    assert.ok(container.querySelector('.copy-button') === copyHost, 'copy portal host must remain mounted');
    assert.ok(container.querySelector('[data-editor-icon="check"] [data-test-icon="beta"]'));
    render(content(beta, true, '<p>replacement</p>'));
    assert.equal(container.querySelector('.copy-button'), null);
    assert.equal(copyHost.childElementCount, 0);
});

test('table alignment selected state follows real radio changes and preserves inputs on provider changes', t => {
    const {container, render} = mount(t);
    const make = Icon => h(EditorIconProvider, {icons: Object.fromEntries(['alignLeft','alignCenter','alignRight','up','down'].map(n => [n, Icon]))},
        h(TableBody, {onChange: () => {}}));
    render(make(alpha));
    act(() => container.querySelector('input[value="center"]').click());
    assert.ok(container.querySelector('[data-editor-icon="alignCenter"] [data-chosen="true"]'));
    assert.equal(container.querySelector('[data-editor-icon="alignLeft"] [data-chosen="true"]'), null);
    const field = container.querySelector('input[role="spinbutton"]');
    render(make(beta));
    assert.ok(container.querySelector('input[role="spinbutton"]') === field);
    assert.ok(container.querySelector('input[value="center"]').checked);
});

test('message hooks retain API identity and themed content after provider updates', async t => {
    const {render} = mount(t);
    let api, first;
    function Messages() {const [message, holder] = useEditorMessage(); api = message; return holder;}
    const make = Icon => h(ConfigProvider, {theme: {token: {motion: false}}},
        h(EditorIconProvider, {icons: {success: Icon}}, h(Messages)));
    render(make(alpha)); first = api;
    await act(async () => {api.success({content: 'saved', duration: 0, key: 'test'});});
    assert.ok(document.querySelector('[data-editor-icon="success"] [data-test-icon="alpha"]'));
    render(make(beta)); assert.equal(first, api);
    assert.ok(document.querySelector('[data-editor-icon="success"] [data-test-icon="beta"]'));
    act(() => api.destroy());
});

test('AI brands are configured independently and absent brands use the semantic fallback', () => {
    const AIIcon = require('../src/core/ai/AIIcon.tsx').default;
    const markup = renderToStaticMarkup(h(EditorIconProvider, {icons: {settings: beta}, brands: {OPEN_AI: alpha}},
        h(AIIcon, {name: 'OPEN_AI', style: {fontSize: 20}}),
        h(AIIcon, {name: 'QWEN'}), h(AIIcon)));
    assert.equal((markup.match(/data-test-icon="alpha"/g) || []).length, 1);
    assert.equal((markup.match(/data-test-icon="beta"/g) || []).length, 2);
    assert.match(markup, /font-size:20px/);
});


test('controlled editable previews keep their DOM and caret when the host echoes input', t => {
    const {container, render} = mount(t);
    function ControlledPreview() {
        const [html, setHtml] = React.useState('<p>before</p>');
        return h(Preview, {htmlContent: html, onContentChange: setHtml, editable: true, dark: false});
    }
    render(h(ControlledPreview));
    const content = container.querySelector('.markdown-body');
    content.firstChild.textContent = 'after';
    const selection = document.getSelection();
    selection.collapse(content.firstChild.firstChild, 3);
    act(() => content.dispatchEvent(new window.Event('input', {bubbles: true})));
    assert.ok(container.querySelector('.markdown-body') === content, 'input echo must not replace editable DOM');
    assert.equal(content.textContent, 'after');
    assert.equal(selection.anchorOffset, 3);
});
