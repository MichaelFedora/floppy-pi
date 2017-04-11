import * as rpio from 'rpio';
import { times, until } from 'async';

export class Floppy {

    private static Max: number = 80;

    private note = 0;

    inited = false;

    dir = false;
    index = 0; // step-index
    stepPin: number;
    dirPin: number;

    constructor(dirPin: number, stepPin: number) {
        this.dirPin = dirPin;
        this.stepPin = stepPin;

        rpio.open(this.dirPin, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.stepPin, rpio.OUTPUT, rpio.LOW);
    }

    flipDir(): void {
        this.dir = !this.dir;
        rpio.write(this.dirPin, this.dir ? rpio.HIGH : rpio.LOW);
    }

    init(): Promise<void> {
        return new Promise<void>((reject, resolve) => {
            times(Floppy.Max * 2, (n, next) => {

                rpio.write(this.stepPin, rpio.HIGH);
                rpio.write(this.stepPin, rpio.LOW);

                if(n % 80 == 0) this.flipDir();

                next(null);

            }, (err) => {
                if(err) reject();
                else {
                    this.inited = true;
                    resolve();
                }
            });
        });
    }

    step(): void {
        if(++this.index > Floppy.Max) this.flipDir();
        rpio.write(this.stepPin, rpio.HIGH);
        rpio.write(this.stepPin, rpio.LOW);
    }

    private playPromise: Promise<void> = null;
    play(note: number): Promise<void> {
        this.note = note;
        if(!this.playPromise) {
            this.playPromise = new Promise<void>((resolve, reject) => {
                until(() => this.note == 0, (cb) => {
                    this.step();
                    setTimeout(cb(), this.note);
                }, (err) => {
                    if(err) reject(err);
                    else resolve();
                });
            });
        }
        return this.playPromise;
    }

    stop(): void {
        this.note = 0;
    }

}