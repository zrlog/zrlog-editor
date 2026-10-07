// Physical CommonJS shims support TypeScript node resolution and older CRA/Jest resolvers.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ts = require('typescript');
// Keep ES modules for browser tree shaking and CommonJS for older test resolvers.
function commonJS(directory) {
    for (const file of fs.readdirSync(directory, {withFileTypes: true})) {
        if (file.name === 'cjs' || file.name === 'markdown') continue;
        const full = path.join(directory, file.name);
        if (file.isDirectory()) { commonJS(full); continue; }
        if (!file.name.endsWith('.js')) continue;
        const target = path.join(root, 'dist/cjs', path.relative(path.join(root, 'dist'), full));
        fs.mkdirSync(path.dirname(target), {recursive: true});
        fs.writeFileSync(target, ts.transpileModule(fs.readFileSync(full, 'utf8'), {compilerOptions: {
            target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
        }}).outputText);
    }
}
commonJS(path.join(root, 'dist'));
// Pure Markdown modules are also referenced by the browser editor's CJS adapters.
for (const file of ['index.js', 'code-renderer.js', 'fenced-code.js']) {
    const target = path.join(root, 'dist/cjs/markdown', file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, ts.transpileModule(fs.readFileSync(path.join(root, 'dist/markdown', file), 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, esModuleInterop: true},
    }).outputText);
}
for (const name of ['icons', 'core']) {
    const target = name === 'core' ? 'dist/core/index' : 'dist/icons';
    fs.writeFileSync(path.join(root, name + '.js'), `module.exports = require('./${target.replace('dist/', 'dist/cjs/')}.js');\n`);
    fs.writeFileSync(path.join(root, name + '.d.ts'), `export * from './${target}';\n${name === 'core' ? `export {default} from './${target}';\n` : ''}`);
}
for (const directory of ['core', 'brands', 'default-icons']) {
    function walk(dir) {
        for (const file of fs.readdirSync(dir, {withFileTypes: true})) {
            const full = path.join(dir, file.name);
            if (file.isDirectory()) { walk(full); continue; }
            if (!file.name.endsWith('.js')) continue;
            const relative = path.relative(path.join(root, 'dist'), full);
            const shim = path.join(root, relative);
            fs.mkdirSync(path.dirname(shim), {recursive: true});
            const target = path.relative(path.dirname(shim), full).replaceAll(path.sep, '/').replace(/\.js$/, '');
            const imports = `export * from '${target}';\nexport {default} from '${target}';\n`;
            fs.writeFileSync(shim, `module.exports = require('${target.replace('dist/', 'dist/cjs/')}.js');\n`);
            fs.writeFileSync(shim.replace(/\.js$/, '.d.ts'), imports);
        }
    }
    walk(path.join(root, 'dist', directory));
}
