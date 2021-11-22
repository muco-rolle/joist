export class PropChange<T = any> {
  constructor(public key: string | symbol, public newValue: T, public oldValue?: T) {}
}

export type PropChanges = Record<string | symbol, PropChange>;

export interface OnPropChanges {
  onPropChanges(changes: PropChanges): void;
}

export function readPropertyDefs(c: any): Record<string | symbol, {}> {
  return c.properties || c.prototype.properties || {};
}

const PROPERTY_KEY = 'properties';

export function property() {
  return function (target: any, key: string) {
    target[PROPERTY_KEY] = target[PROPERTY_KEY] || {};
    target[PROPERTY_KEY][key] = {};
  };
}

export function propChanges() {
  return <T extends new (...args: any[]) => HTMLElement>(CustomElement: T) => {
    const defs = readPropertyDefs(CustomElement);

    Object.defineProperty(CustomElement.prototype, '__$$propChanges', {
      value: new Map(),
      enumerable: false,
    });

    for (let def in defs) {
      Object.defineProperty(CustomElement.prototype, def, {
        set(val: any) {
          Reflect.set(this, `__$$${def}`, val);

          definePropChange.call(this, new PropChange(def, val));
        },
        get() {
          return Reflect.get(this, `__$$${def}`);
        },
        enumerable: false,
      });
    }

    return CustomElement;
  };
}

export interface PropChangeBase {
  __$$propChanges: Map<string | symbol, PropChange>;
  __$$propChange: Promise<void> | null;

  onPropChanges?: (changes: PropChanges) => void;
}

function definePropChange(this: PropChangeBase, propChange: PropChange): Promise<void> {
  this.__$$propChanges.set(propChange.key, propChange);

  if (!this.__$$propChange) {
    // If there is no previous change defined set it up
    this.__$$propChange = Promise.resolve().then(() => {
      // run onPropChanges here. This makes sure we capture all changes
      if (this.onPropChanges) {
        this.onPropChanges(Object.fromEntries(this.__$$propChanges));
      }

      // reset for next time
      this.__$$propChanges.clear();
      this.__$$propChange = null;
    });
  }

  return this.__$$propChange;
}
