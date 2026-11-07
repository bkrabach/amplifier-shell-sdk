# Contributor guidance

This repository owns the small public shell SDK and its authoring example.
The host owns validation, capabilities, action receipts, state and recovery;
follow its [contracts](https://github.com/microsoft/amplifier-unified/tree/main/docs/shell).
Do not introduce another validator or bundle React. Keep the runtime dependency-free.

Run `npm test` to pack and install the artifact outside this checkout, then build
the example shipped in that artifact. The disposable installation is reaped.
Changes to interface or example behavior also need a focused Unified DTU journey.
Record exact source/artifact identity and distinguish that acceptance from a build.

Keep API compatibility explicit. Simplicity means coherent ownership and usable
interfaces, not fewer lines or forced complexity scores. Project diagnostics are
advisory; no new per-edit or per-delegation approval workflow belongs here.

`ORIGIN.json` retains source/history pointers. Generated `dist/` and npm installs
are disposable; preserve qualified release bytes and recoverable source commits.
