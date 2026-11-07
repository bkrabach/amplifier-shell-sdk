import {defineModule, useShellComponent, type ComponentHost} from '@amplifier/shell-sdk';

// Authors may provide their host's concrete React type without adding a runtime dependency.
interface HostReact {createElement(tag: string, props: null, text: string): object;}
export const factory = defineModule(({React}: {React: HostReact}) => function Status({host}: {host: ComponentHost}) {
  const snapshot = useShellComponent(React, host);
  return React.createElement('span', null, snapshot.slot);
});

declare const host: ComponentHost;
declare const React: HostReact;
const component: ({host}: {host: ComponentHost}) => object = factory({React});
component({host});
host.dispatch('panel.open', {panel: 'settings'});
const unsubscribe: () => void = host.subscribe(() => {});
unsubscribe();

// These checks fail if the public declarations silently become untyped.
// @ts-expect-error Unsupported commands still need a deliberate host API change.
host.dispatch('invented.command', {});
// @ts-expect-error A component cannot mutate its snapshot's selected conversation.
host.getSnapshot().selectedSessionId = 'other';
// @ts-expect-error A module factory is a function.
defineModule(42);
// @ts-expect-error The inferred factory retains its author's React requirement.
factory({React: {}});
