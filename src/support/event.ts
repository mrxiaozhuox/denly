type Callback = (event: DeventResult) => any;

interface DeOptions {
  single?: boolean;
  timing?: number;
}

interface DeventResult {
  name: string;
}

export class DEvent {
  private events: Map<string, {
    callback: Callback;
    options: DeOptions;
  }> = new Map();

  public timingTask: Map<string, number> = new Map();

  public registerEvent(
    name: string,
    callback: Callback,
    options?: DeOptions,
  ): DEvent {
    if (options == null) {
      options = {
        single: false,
      };
    }

    if (options.timing) {
      this.timingTask.set(name, options.timing);
    }

    this.events.set(name, {
      callback,
      options,
    });

    return this;
  }

  public triggerEvent(name: string): any {
    let eve = this.events.get(name);
    if (eve) {
      // call the event callback
      let result = eve.callback({
        name: name,
      });

      if (eve.options.single) this.events.delete(name);

      return result;
    }
    return null;
  }

  public timingEvent(
    name: string,
    callback: Callback,
    interval: number,
  ): DEvent {
    this.registerEvent(name, callback, { single: false, timing: interval });
    return this;
  }

  public timingTaskListner(): DEvent {
    let stepStat: Map<string, number> = new Map();

    setInterval(() => {
      this.timingTask.forEach((value, key) => {
        // less than one second counts as one second
        if (value < 1000) return this.triggerEvent(key);

        // console.log(stepStat.get(key));

        let step = stepStat.get(key);
        if (step) {
          if (value <= (step * 1000)) {
            stepStat.set(key, 0);
            this.triggerEvent(key);
          } else {
            stepStat.set(key, step + 1);
          }
        } else {
          stepStat.set(key, 1);
        }
      });
    }, 1000);

    return this;
  }
}

export let Event = new DEvent().timingTaskListner();
