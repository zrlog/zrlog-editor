# Semantic icon injection

The editor owns semantic icon names and interaction state. Hosts supply React icon
components and optional AI brand components through `EditorIconProvider`. The editor
does not depend on frontend-common, theme identifiers or a particular external icon set.

Implementation and compatibility contract:

1. Keep the existing root and `dist/editor` / `dist/ai` entry points working with their
   existing default graphics. Compatibility wrappers add defaults without replacing
   icons supplied by an outer provider. The implementation lives in `core`; imports
   from `@zrlog/editor/core` and `@zrlog/editor/core/*` have no editor default glyphs.
2. `@zrlog/editor/icons` exports the provider, semantic glyph component and types only.
   Partial providers inherit surrounding slots; a missing required glyph is an explicit
   integration error. Icon components receive selected, size, color/style and motion
   props. Brand components are configured independently.
3. Cover toolbar, selection toolbar, insert dialogs, AI controls, messages and preview
   copy actions. Providers follow React tree/portal boundaries. Theme changes must not
   remount editor state or clear content, selection or active dialogs.
4. Preserve the standalone Markdown renderer and existing editing/upload/AI protocols.
   Browser preview copy controls use portals so they inherit host context and unmount
   with their preview, rather than creating detached React roots.
5. Admin imports core entry points, supplies shared icon slots at its UI root and loads
   formatting slots with its editor adapter. Shared UI supplies only individual SVG
   modules; no runtime import of the entire icon library or global glyph catalogue.
6. Verify both legacy and core consumer builds against the real tarball, including
   absence of editor fallback assets in the core module graph, independent instances,
   portal/theme updates, copy callbacks, selected states and host production build.

Publish the npm package and verify registry availability before upgrading consumer lockfiles.

## Host integration

For example, a preview needs only the copy and completion slots:

```tsx
import Preview from '@zrlog/editor/core/editor/html-preview-panel';
import {EditorIconProvider} from '@zrlog/editor/icons';
import CopyIcon from 'your-icons/copy';
import CheckIcon from 'your-icons/check';

const icons = {copy: CopyIcon, check: CheckIcon};

<EditorIconProvider icons={icons}>
  <Preview htmlContent={html} dark={dark}/>
</EditorIconProvider>
```

The full editor is the default export of `@zrlog/editor/core`. Core AI components
are available at `@zrlog/editor/core/ai/AIButton`, `AIContentItem`, `AIIcon`, etc.
Use `EditorIconMap` to type a complete host map, or `Partial<EditorIconMap>` for
nested feature providers. Define component adapters and maps outside render so
changing the active theme updates props/context without replacing component types.
`size` and `color` are also reflected in `style`, so a host icon can simply forward
`style`, `selected` and `spin`. `loading` defaults to `spin: true`; the supplied
component owns its animation and reduced-motion behavior.

| Feature | Slots |
| --- | --- |
| Formatting | `bold`, `strikethrough`, `italic`, `quote`, `heading2`, `heading3`, `heading4`, `unorderedList`, `orderedList`, `horizontalRule` |
| Insert/actions | `link`, `image`, `video`, `attachment`, `code`, `table`, `copyHtml`, `preview`, `previewOff`, `help`, `upload` |
| Table alignment | `alignLeft`, `alignCenter`, `alignRight` |
| Preview/AI | `copy`, `check`, `user`, `send`, `settings` |
| Controls/feedback | `close`, `clear`, `up`, `down`, `loading`, `info`, `success`, `error`, `warning` |

Preview-enabled and table alignment state is passed as `selected`. Formatting
buttons currently insert Markdown and do not infer active formatting from the cursor.
Control slots are applied through a scoped Ant Design ConfigProvider, preserving
surrounding control options; message hooks preserve callbacks and thenable handles.
Use a provider close to the editor if its icons should not affect other controls.

AI brands are an independent `brands` map keyed by `AIProviderType`. Omitted brands
fall back to `settings`. Optional existing brand graphics are individually exported
from `@zrlog/editor/brands/openai`, `/deepseek`, `/qwen`, `/gemini`. Individual legacy
semantic graphics are exported from `@zrlog/editor/default-icons/<slot>`; importing
one does not import a catalogue. No frontend-common dependency is introduced here.
Root and historical deep component imports add only their feature's defaults, with
outer host overrides taking priority. The old imperative `hydrateReactComponents`
helper remains for compatibility; use the core Preview component to inherit React
context and automatic cleanup.

## Validation and release

`npm test` checks partial/sibling providers, missing slots, default compatibility,
copy contents and selected state, portal cleanup, dark-mode DOM preservation,
table state, stable message APIs, standalone Markdown, and actual tarball TypeScript
and webpack consumers. The core package graph is asserted to exclude editor default
and brand assets. Ant Design's own implementation dependencies are outside that
assertion. The icon/brand entry shims support older CRA/Jest module resolution.

Release version: **2.2.0**. Confirm publication on npmjs before upgrading consumers. Admin uses its own
`AdminEditorIconProvider` plus an `AdminEditor` formatting adapter; its exact registry
dependency and lock must be upgraded after publication, together with UI 0.2.0.
