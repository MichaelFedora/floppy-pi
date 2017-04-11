import * as rpio from 'rpio';
import { Floppy } from './floppy';

rpio.init({ gpiomem: true, mapping: 'physical' });

const floppy: Floppy[] = [
    new Floppy(7, 11),
    new Floppy(21, 23),
];

function main() {

    floppy[0].play(17);
    floppy[1].play(5);

    setTimeout(() => {
        floppy.forEach(f => f.stop());
        process.exit();
    }, 5000);
}

Promise.all(floppy.map(f => f.init())).then(() => {
    main();
}, (e) => {
    console.error('Error initializing:', e);
    process.exit();
});