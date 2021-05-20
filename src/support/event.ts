type Callback = (event: DeventResult) => any;

interface DeOptions {
    single?: boolean;
    timing?: number;
}

interface DeventResult {
    name: string;
}

export interface EventList {
    normal: {
        [key: string]: {
            frequency: number
            single: boolean
        }
    },
    timing: {
        [key: string]: {
            frequency: number,
            timing: number
        }
    }
}

export class DEvent {

    /**
     * Events storage map
     * @var
     */
    private events: Map<string, {
        callback: Callback;
        options: DeOptions;
        frequency: number;
    }> = new Map();

    /**
     * Timing event storage map
     * @var
     */
    private timingTask: Map<string, number> = new Map();

    /**
     * Reigster a base event
     * @param name 
     * @param callback 
     * @param options 
     * @returns DEvent
     */
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
            frequency: 0,
        });

        return this;
    }

    /**
     * Trigger a event
     * @param name 
     * @returns returned value
     */
    public triggerEvent(name: string): any {

        let eve = this.events.get(name);

        if (eve) {
            // call the event callback
            let result = eve.callback({
                name: name,
            });

            if (eve.options.single) {
                this.events.delete(name);
            } else {
                // frequency number ++
                eve.frequency += 1;
                this.events.set(name, eve);
            }

            return result;
        }
        return null;
    }

    /**
     * Register a timing event
     * @param name 
     * @param callback 
     * @param interval 
     * @returns DEvent
     */
    public timingEvent(
        name: string,
        callback: Callback,
        interval: number,
    ): DEvent {
        this.registerEvent(name, callback, { single: false, timing: interval });
        return this;
    }

    /**
     * Timing Task listener
     * @returns DEvent
     * @Internal
     */
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

    /**
     * Get all events in the program
     * @description Carrying "@" are internal events, dont delete it! 
     * @returns { normal: Object, timing: Object }
     */
    public eventList() {

        let result: EventList = {
            normal: { /** normal event */ },
            timing: { /** timing event */ },
        };

        this.events.forEach((value, key) => {
            if (value.options.timing) {
                result.timing[key] = {
                    frequency: value.frequency,
                    timing: value.options.timing
                };
            } else {
                result.normal[key] = {
                    frequency: value.frequency,
                    single: (value.options.single != null)
                }
            }
        });

        return result;
    }
}

export let Event = new DEvent().timingTaskListner();