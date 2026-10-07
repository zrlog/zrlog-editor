const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {execFileSync} = require("node:child_process");
const {createRequire} = require("node:module");
const {test} = require("node:test");
const webpack = require("webpack");

test("npm tarball supports editor consumers and standalone Markdown rendering", async (t) => {
    const root = path.resolve(__dirname, "..");
    fs.mkdirSync(path.join(root, ".tmp"), {recursive: true});
    const directory = fs.mkdtempSync(path.join(root, ".tmp/package-test-"));
    t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
    fs.writeFileSync(path.join(directory, "package.json"), JSON.stringify({name: "editor-package-consumer", private: true}));
    // Use the already tested build; prepack is exercised by npm run pack in CI.
    const [packed] = JSON.parse(execFileSync("npm", [
        "pack", "--ignore-scripts", "--json", "--pack-destination", directory,
    ], {cwd: root, encoding: "utf8", env: {...process.env, npm_config_cache: path.join(directory, ".npm")}}));
    const files = new Set(packed.files.map(file => file.path));
    for (const file of ["LICENSE", "README.md", "markdown.js", "markdown.d.ts",
        "dist/editor/marked-editor.js", "dist/editor/marked-editor.d.ts",
        "dist/editor/index.js", "dist/editor/editor.types.d.ts", "dist/ai/AIButton.js",
        "dist/type.d.ts", "dist/markdown/zrlog-markdown.umd.js", "core.js", "icons.d.ts",
        "dist/core/editor/index.js", "dist/icons/context.js", "brands/qwen.js", "default-icons/bold.js"]) {
        assert.ok(files.has(file), `Missing ${file}`);
    }
    for (const file of files) {
        assert.doesNotMatch(file, /^(?:src|build|public|artifacts|shell|tests|node_modules|\.github|\.tmp)\//);
        assert.doesNotMatch(file, /^dist\/(?:src|pages)\//);
    }
    execFileSync("tar", ["-xzf", path.join(directory, packed.filename), "-C", directory]);
    const packageDir = path.join(directory, "package");
    const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
    assert.equal(manifest.name, "@zrlog/editor");
    for (const dependency of ["react", "react-dom", "antd", "react-router-dom", "styled-components"]) {
        assert.ok(manifest.peerDependencies[dependency], `Missing peer ${dependency}`);
        assert.equal(manifest.dependencies[dependency], undefined);
    }
    for (const dependency of ["@craco/craco", "react-scripts", "typescript", "node"]) {
        assert.equal(manifest.dependencies[dependency], undefined);
    }
    assert.ok(fs.readFileSync(path.join(packageDir, "dist/editor/editor-version.js"), "utf8")
        .includes(JSON.stringify(manifest.version)), "Editor version must match the npm version");

    fs.mkdirSync(path.join(directory, "node_modules/@zrlog"), {recursive: true});
    fs.symlinkSync(packageDir, path.join(directory, "node_modules/@zrlog/editor"), "dir");
    fs.symlinkSync(packageDir, path.join(directory, "node_modules/@editor"), "dir");
    const requireConsumer = createRequire(path.join(directory, "consumer.cjs"));
    assert.equal(requireConsumer.resolve("@zrlog/editor"), path.join(packageDir, manifest.main));
    const {EditorIconProvider} = requireConsumer("@zrlog/editor/icons");
    assert.equal(typeof EditorIconProvider, "function", "CommonJS icon provider entry");
    assert.equal(typeof requireConsumer("@zrlog/editor/brands/qwen").default, "function");
    const iconModules = Object.keys(require.cache).filter(file => file.startsWith(packageDir));
    assert.ok(!iconModules.some(file => /\/dist\/cjs\/(?:defaults|default-icons|editor\/icons)\//.test(file)));
    assert.ok(!iconModules.some(file => /\/brands\/(?:openai|deepseek|gemini)\.js$/.test(file)));
    const {markdownToHtml} = requireConsumer("@zrlog/editor/markdown");
    assert.equal(markdownToHtml("# Package"), "<h1>Package</h1>\n");
    assert.ok(markdownToHtml("$x^2$").includes("katex-html"));
    // Node ESM consumers use the same subpath without loading the browser editor.
    assert.equal(execFileSync(process.execPath, ["--input-type=module", "-e",
        "import {markdownToHtml} from '@zrlog/editor/markdown'; process.stdout.write(markdownToHtml('# ESM'));",
    ], {cwd: directory, encoding: "utf8"}), "<h1>ESM</h1>\n");

    const consumer = path.join(directory, "consumer.tsx");
    fs.writeFileSync(consumer, `
import {MarkedEditor, EditorMode, type ZrLogEditorProps} from '@zrlog/editor';
import {markdownToHtml} from '@zrlog/editor/markdown';
import CoreEditor from '@zrlog/editor/core';
import CorePreview from '@zrlog/editor/core/editor/html-preview-panel';
import {EditorIconProvider, type EditorIconMap} from '@zrlog/editor/icons';
import Qwen from '@zrlog/editor/brands/qwen';
import Bold from '@zrlog/editor/default-icons/bold';
import LegacyEditor from '@editor/dist/editor';
import AIButton from '@editor/dist/ai/AIButton';
import type {EditorUser} from '@editor/dist/type';
const props: ZrLogEditorProps = {
    value: '# Package', height: '400px', fullscreen: false, previewContent: '',
    onChange: ({value}) => markdownToHtml(value),
    config: {dark: false, lang: 'zh_CN', preview: true, mode: EditorMode.MARKDOWN,
        uploadConfig: {buildUploadUrl: () => '/upload', formName: 'file', axiosInstance: null!}},
};
export const icons = {bold: Bold} satisfies Partial<EditorIconMap>;
export const core = <EditorIconProvider icons={icons} brands={{QWEN: Qwen}}><CoreEditor {...props}/><CorePreview dark={false} htmlContent=""/></EditorIconProvider>;
export const editor = <MarkedEditor {...props} />;
export const legacyEditor = <LegacyEditor {...props} />;
export const user: EditorUser = {nickname: 'ZrLog', avatarUrl: ''};
export {AIButton};
`);
    execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"),
        "--noEmit", "--strict", "--skipLibCheck", "--esModuleInterop", "--target", "ES2020",
        "--module", "esnext", "--moduleResolution", "node", "--jsx", "react-jsx", consumer,
    ], {cwd: directory, stdio: "pipe"});

    const entry = path.join(directory, "browser.js");
    fs.writeFileSync(entry, `
import {MarkedEditor} from '@zrlog/editor';
import {markdownToHtml} from '@zrlog/editor/markdown';
import LegacyEditor from '@editor/dist/editor';
import AIButton from '@editor/dist/ai/AIButton';
window.packageSmoke = {MarkedEditor, LegacyEditor, AIButton, markdownToHtml};
`);
    const compiler = webpack({
        mode: "production",
        entry,
        output: {path: path.join(directory, "browser"), filename: "bundle.js"},
        devtool: false,
        performance: {hints: false},
        optimization: {minimize: false},
        module: {rules: [{test: /\.css$/, use: [require.resolve("style-loader"), require.resolve("css-loader")]}]},
    });
    try {
        const stats = await new Promise((resolve, reject) => compiler.run((error, stats) => error ? reject(error) : resolve(stats)));
        assert.equal(stats.hasErrors(), false, stats.toString({all: false, errors: true}));
    } finally {
        await new Promise((resolve, reject) => compiler.close(error => error ? reject(error) : resolve()));
    }
    // Runtime icon overrides alone do not remove static fallback imports. Verify the
    // real package graph for core consumers independently of the legacy build.
    const coreEntry = path.join(directory, "core.js");
    fs.writeFileSync(coreEntry, `
export {default as Editor} from '@zrlog/editor/core';
export {default as Preview} from '@zrlog/editor/core/editor/html-preview-panel';
export {default as AIContentItem} from '@zrlog/editor/core/ai/AIContentItem';
export {EditorIconProvider} from '@zrlog/editor/icons';
`);
    const coreCompiler = webpack({
        mode: "production", entry: coreEntry,
        output: {path: path.join(directory, "core-browser"), filename: "core.js", library: {type: "commonjs2"}},
        devtool: false, performance: {hints: false}, optimization: {minimize: false},
        module: {rules: [{test: /\.css$/, use: [require.resolve("style-loader"), require.resolve("css-loader")]}]},
    });
    try {
        const stats = await new Promise((resolve, reject) => coreCompiler.run((error, stats) => error ? reject(error) : resolve(stats)));
        assert.equal(stats.hasErrors(), false, stats.toString({all: false, errors: true}));
        const resources = [...stats.compilation.modules].map(m => m.resource).filter(Boolean);
        const packageModules = resources.filter(file => file.startsWith(packageDir));
        assert.ok(packageModules.some(file => file.endsWith("/dist/core/editor/index.js")));
        const fallbacks = packageModules.filter(file => /\/dist\/(?:defaults|default-icons|brands|editor\/icons|ai\/icons)\//.test(file));
        assert.deepEqual(fallbacks, [], "Core must have no editor fallback glyph assets");
        assert.ok(!packageModules.some(file => /\/dist\/editor\/(index|editor-tool-bar|html-preview-panel)\.js$/.test(file)));
    } finally {
        await new Promise((resolve, reject) => coreCompiler.close(error => error ? reject(error) : resolve()));
    }

});
