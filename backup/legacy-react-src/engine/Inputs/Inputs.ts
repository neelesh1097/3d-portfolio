import normalizeWheel from 'normalize-wheel';
import { Events } from '../Events';

export interface InputAction {
  name: string;
  categories: string[];
  active: boolean;
  value: any;
  activeKeys: Set<string>;
}

export class Inputs {
  static MODE_MOUSEKEYBOARD = 1;
  static MODE_GAMEPAD = 2;
  static MODE_TOUCH = 3;

  mode = Inputs.MODE_MOUSEKEYBOARD;
  events = new Events();
  actions = new Map<string, InputAction>();
  filters = new Set<string>(['wandering']);

  pointer = {
    down: false,
    delta: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    previous: { x: 0, y: 0 },
  };

  private keyToActions = new Map<string, string[]>();
  private virtualState: Record<string, boolean> = {};
  private gamepadState = {
    axes: [0, 0, 0, 0],
    buttons: new Map<number, boolean>(),
  };

  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;
  private onWheel: (e: WheelEvent) => void;
  private onPointerDown: (e: PointerEvent) => void;
  private onPointerMove: (e: PointerEvent) => void;
  private onPointerUp: () => void;
  private onBlur: () => void;

  constructor(private canvas: HTMLElement) {
    this.addDefaultActions();

    this.onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        if (!this.filters.has('modal')) {
          e.preventDefault();
        }
      }

      this.mode = Inputs.MODE_MOUSEKEYBOARD;
      this.start(`Keyboard.${e.code}`);
      this.start(`Keyboard.${e.key}`);
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      this.end(`Keyboard.${e.code}`);
      this.end(`Keyboard.${e.key}`);
    };

    this.onWheel = (e: WheelEvent) => {
      if (this.filters.has('modal')) return;
      const normalized = normalizeWheel(e);
      this.start('Wheel.roll', normalized.spinY, false);
      this.end('Wheel.roll');
    };

    this.onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        this.mode = Inputs.MODE_TOUCH;
      } else {
        this.mode = Inputs.MODE_MOUSEKEYBOARD;
      }
      this.pointer.down = true;
      this.pointer.current.x = e.clientX;
      this.pointer.current.y = e.clientY;
      this.pointer.previous.x = e.clientX;
      this.pointer.previous.y = e.clientY;
      this.start('Pointer.any', { x: e.clientX, y: e.clientY });
    };

    this.onPointerMove = (e: PointerEvent) => {
      this.pointer.current.x = e.clientX;
      this.pointer.current.y = e.clientY;
      if (this.pointer.down) {
        this.pointer.delta.x += e.clientX - this.pointer.previous.x;
        this.pointer.delta.y += e.clientY - this.pointer.previous.y;
      }
      this.pointer.previous.x = e.clientX;
      this.pointer.previous.y = e.clientY;
    };

    this.onPointerUp = () => {
      this.pointer.down = false;
      this.end('Pointer.any', { x: this.pointer.current.x, y: this.pointer.current.y });
    };

    this.onBlur = () => {
      this.releaseAll();
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('wheel', this.onWheel, { passive: true });
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('blur', this.onBlur);
  }

  private addDefaultActions(): void {
    this.addActions([
      {
        name: 'forward',
        categories: ['wandering'],
        keys: ['Keyboard.ArrowUp', 'Keyboard.KeyW', 'Virtual.forward'],
      },
      {
        name: 'backward',
        categories: ['wandering'],
        keys: ['Keyboard.ArrowDown', 'Keyboard.KeyS', 'Virtual.backward'],
      },
      {
        name: 'left',
        categories: ['wandering'],
        keys: ['Keyboard.ArrowLeft', 'Keyboard.KeyA', 'Virtual.left'],
      },
      {
        name: 'right',
        categories: ['wandering'],
        keys: ['Keyboard.ArrowRight', 'Keyboard.KeyD', 'Virtual.right'],
      },
      {
        name: 'boost',
        categories: ['wandering'],
        keys: ['Keyboard.ShiftLeft', 'Keyboard.ShiftRight', 'Virtual.boost'],
      },
      {
        name: 'brake',
        categories: ['wandering'],
        keys: ['Virtual.handbrake'],
      },
      {
        name: 'jump',
        categories: ['wandering'],
        keys: ['Keyboard.Space', 'Virtual.jump'],
      },
      {
        name: 'respawn',
        categories: ['wandering'],
        keys: ['Keyboard.KeyR'],
      },
      {
        name: 'honk',
        categories: ['wandering'],
        keys: ['Keyboard.KeyH'],
      },
      {
        name: 'interact',
        categories: ['wandering'],
        keys: ['Keyboard.KeyE', 'Keyboard.Enter'],
      },
      {
        name: 'zoom',
        categories: ['wandering'],
        keys: ['Wheel.roll'],
      },
      {
        name: 'viewDrag',
        categories: ['wandering'],
        keys: ['Pointer.any'],
      },
    ]);
  }

  addActions(specs: Array<{ name: string; categories: string[]; keys: string[] }>): void {
    for (const spec of specs) {
      const action: InputAction = {
        name: spec.name,
        categories: spec.categories,
        active: false,
        value: null,
        activeKeys: new Set<string>(),
      };
      this.actions.set(spec.name, action);

      for (const key of spec.keys) {
        const list = this.keyToActions.get(key) || [];
        if (!list.includes(spec.name)) list.push(spec.name);
        this.keyToActions.set(key, list);
      }
    }
  }

  setVirtualControls(controls: Record<string, boolean>): void {
    for (const key of Object.keys(controls)) {
      const prev = !!this.virtualState[key];
      const next = !!controls[key];
      if (prev !== next) {
        this.virtualState[key] = next;
        if (next) {
          this.mode = Inputs.MODE_TOUCH;
          this.start(`Virtual.${key}`);
        } else {
          this.end(`Virtual.${key}`);
        }
      }
    }
  }

  setModalPaused(paused: boolean): void {
    this.filters.clear();
    if (paused) {
      this.filters.add('modal');
      this.releaseAll();
    } else {
      this.filters.add('wandering');
    }
  }

  private isActionAllowed(action: InputAction): boolean {
    if (action.categories.length === 0) return true;
    for (const cat of action.categories) {
      if (this.filters.has(cat)) return true;
    }
    return false;
  }

  start(key: string, value: any = true, triggerChange = false): void {
    const names = this.keyToActions.get(key);
    if (!names) return;

    for (const name of names) {
      const action = this.actions.get(name);
      if (!action || !this.isActionAllowed(action)) continue;

      const wasActive = action.active;
      action.activeKeys.add(key);
      action.active = true;
      action.value = value;

      if (!wasActive) {
        this.events.trigger(name, [action]);
        this.events.trigger('actionStart', [action]);
      } else if (triggerChange) {
        this.events.trigger(name, [action]);
      }
    }
  }

  end(key: string, value: any = false): void {
    const names = this.keyToActions.get(key);
    if (!names) return;

    for (const name of names) {
      const action = this.actions.get(name);
      if (!action) continue;

      action.activeKeys.delete(key);
      if (action.activeKeys.size === 0 && action.active) {
        action.active = false;
        action.value = value;
        this.events.trigger(name, [action]);
        this.events.trigger('actionEnd', [action]);
      }
    }
  }

  releaseAll(): void {
    this.actions.forEach((action) => {
      if (action.active) {
        action.activeKeys.clear();
        action.active = false;
        action.value = false;
        this.events.trigger(action.name, [action]);
      }
    });
    this.pointer.down = false;
    this.pointer.delta.x = 0;
    this.pointer.delta.y = 0;
  }

  update(): void {
    this.pollGamepad();
  }

  endFrame(): void {
    this.pointer.delta.x = 0;
    this.pointer.delta.y = 0;
  }

  private pollGamepad(): void {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const gp = pads?.[0];
    if (!gp) return;

    const btnMap: Array<[number, string]> = [
      [7, 'Virtual.forward'],
      [6, 'Virtual.backward'],
      [0, 'Virtual.jump'],
      [1, 'Virtual.boost'],
      [2, 'Keyboard.KeyE'],
    ];

    for (const [idx, key] of btnMap) {
      const pressed = !!gp.buttons[idx]?.pressed;
      const prev = !!this.gamepadState.buttons.get(idx);
      if (pressed !== prev) {
        this.gamepadState.buttons.set(idx, pressed);
        if (pressed) {
          this.mode = Inputs.MODE_GAMEPAD;
          this.start(key);
        } else {
          this.end(key);
        }
      }
    }

    const ax = gp.axes[0] || 0;
    const leftActive = ax < -0.25;
    const rightActive = ax > 0.25;
    if (leftActive !== this.gamepadState.axes[0] < -0.25) {
      if (leftActive) this.start('Virtual.left');
      else this.end('Virtual.left');
    }
    if (rightActive !== this.gamepadState.axes[0] > 0.25) {
      if (rightActive) this.start('Virtual.right');
      else this.end('Virtual.right');
    }
    this.gamepadState.axes[0] = ax;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('blur', this.onBlur);
  }
}

