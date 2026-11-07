# Amplifier shell SDK

`@amplifier/shell-sdk` contains dependency-free helpers and TypeScript declarations
for independently authored navigation, Canvas renderers and shell components.
Package version `1.0.0` describes the existing host interface `apiVersion: "1.0"`.
It does not version the application or declare compatibility with future APIs.

This is an independent repository candidate extracted from Unified; see
[the exact source and history](ORIGIN.json). Repository/registry publication has
not happened yet. Host contracts remain with Unified.

Run `npm test` from this repository to produce and qualify
`dist/amplifier-shell-sdk-1.0.0.tgz`. The check installs that tarball outside the
checkout and builds the example shipped inside it. Temporary dependencies are
removed automatically. Node.js 22 and npm are the contributor baseline.

Install a qualified tarball in a component project:

```sh
npm install /path/to/amplifier-shell-sdk-1.0.0.tgz
```

The package includes `examples/shell-controls`. Copy that directory to begin a
separate component, then follow its README. The SDK does not require a Unified
checkout or another React installation. The package's public host API remains
`1.0`; its own package releases can advance independently.

Import the package by name and accept React from the host:

```js
import {defineModule, useShellComponent} from '@amplifier/shell-sdk';

export default defineModule(({React}) => function Component({host}) {
  const snapshot = useShellComponent(React, host);
  return React.createElement('span', null, snapshot.slot);
});
```

Bundle the SDK into a single browser ESM artifact. Do not bundle another React,
import private Unified modules, or substitute a local conversation store for
the host snapshot. `useNavigation` and `useCanvas` subscribe to their respective
host interfaces in the same way. The included declarations describe each host.

The host owns manifest compatibility, capability discovery, validation and
activation. A successful build is not acceptance: discover the installed schema,
stage the manifest and artifact, validate, preview/apply and verify in the target
client. Native extensions run as trusted same-origin code; this SDK is not an
isolation boundary. Keep dirty-edit, generation, recovery and action-receipt
semantics intact.

See the [component contract](https://github.com/microsoft/amplifier-unified/blob/main/docs/shell/components.md),
[navigation and renderer contracts](https://github.com/microsoft/amplifier-unified/blob/main/docs/shell/README.md),
and [standalone controls example](examples/shell-controls/README.md).
Those host contracts remain canonical; the SDK does not duplicate their validator.

## Release and distribution

`npm test` emits the package, a checksum, and its build-input receipt. A tag named
`v<package version>` runs the same checks on Linux, macOS and Windows; only after
those checks pass does the release job publish the Linux-produced tarball to
GitHub. Keep `RELEASE_NOTES.md` current before tagging. npm registry publication
is separate until namespace ownership is established.

Unified should consume an exact released tarball and checksum, then qualify its
host contract before updating its packaged default. The SDK may release without
changing that default. In-repository source copies in Unified become generated
artifact contents at cutover, with this repository as the sole editing owner.
A successful package build does not establish host acceptance.
