type EventCallback = (...args: any[]) => void;

export class Events {
  private callbacks: Record<string, EventCallback[][]> = {};

  on(name: string, callback: EventCallback, order = 1): this {
    if (!this.callbacks[name]) {
      this.callbacks[name] = [];
    }
    if (!this.callbacks[name][order]) {
      this.callbacks[name][order] = [];
    }
    this.callbacks[name][order].push(callback);
    return this;
  }

  off(name: string, callback?: EventCallback): this {
    const orders = this.callbacks[name];
    if (!orders) return this;

    if (typeof callback === 'function') {
      for (const orderKey in orders) {
        const list = orders[orderKey];
        if (!list) continue;
        const idx = list.indexOf(callback);
        if (idx !== -1) list.splice(idx, 1);
      }
    } else {
      delete this.callbacks[name];
    }
    return this;
  }

  trigger(name: string, args: any[] = []): this {
    const orders = this.callbacks[name];
    if (!orders) return this;

    for (const orderKey in orders) {
      const list = orders[orderKey];
      if (!list) continue;
      for (let i = 0; i < list.length; i++) {
        list[i].apply(this, args);
      }
    }
    return this;
  }
}

