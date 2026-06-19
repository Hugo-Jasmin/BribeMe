<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:local-command-safety -->
# Local command safety

Never run broad recursive searches over `node_modules`, especially against minified or bundled packages. The following command pattern is forbidden in this repository:

```sh
rg -n "module\.register\(|registerHooks|register\(" node_modules/next node_modules/tsx node_modules/eslint-config-next node_modules/@babel node_modules/typescript
```

If dependency internals must be inspected, target one small file with `sed`, `node -p`, or a bounded command that cannot dump bundled source maps or minified package contents.
<!-- END:local-command-safety -->
