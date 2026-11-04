const owners = new WeakMap<Element, Map<string, object>>();

function release(
  keys: Set<string>,
  ownership: { attributes: Map<string, object>; owner: object; prefix?: string },
  remove: (name: string) => void,
) {
  const { attributes, owner, prefix = '' } = ownership;
  for (const name of keys)
    if (attributes.get(`${prefix}${name}`) === owner) {
      remove(name);
      attributes.delete(`${prefix}${name}`);
    }
  keys.clear();
}

/** Ownership is claimed even for an unchanged value; stale cleanup cannot erase a successor's signals. */
export function ownSignals(element: HTMLElement) {
  const owner = {};
  const claimed = new Set<string>();
  const properties = new Set<string>();
  const attributes = owners.get(element) ?? new Map<string, object>();
  owners.set(element, attributes);
  return {
    property(name: string, value: string) {
      attributes.set(`style:${name}`, owner);
      properties.add(name);
      if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
    },
    attribute(name: string, value: string) {
      attributes.set(name, owner);
      claimed.add(name);
      if (element.getAttribute(name) !== value) element.setAttribute(name, value);
    },
    dispose() {
      release(claimed, { attributes, owner }, (name) => element.removeAttribute(name));
      release(properties, { attributes, owner, prefix: 'style:' }, (name) => element.style.removeProperty(name));
    },
  };
}
