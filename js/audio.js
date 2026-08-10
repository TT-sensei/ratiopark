import {read,write} from './storage.js';
let ctx;
const context=()=>ctx??=new (window.AudioContext||window.webkitAudioContext)();
export const soundOn=()=>read().sound===true;
export const toggleSound=()=>{const d=read();d.sound=!d.sound;write(d);return d.sound};
export const unlockAudio=()=>{if(soundOn()&&context().state==='suspended')context().resume()};
const note=(frequency,time=.12,type='sine',volume=.035,delay=0)=>{if(!soundOn())return;unlockAudio();const c=context(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(frequency,t);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+time);o.connect(g).connect(c.destination);o.start(t);o.stop(t+time)};
export const sounds={count:n=>note(n==='START!'?740:440,.06,'sine',.018),correct:()=>note(740,.12,'sine',.035),wrong:()=>note(190,.13,'triangle',.025),near:()=>{note(440,.08,'sine',.025);note(590,.1,'sine',.025,.07)},combo:n=>{if(n===5){note(660,.12,'square',.025);note(880,.14,'square',.025,.09)}if(n===10){note(660,.12,'square',.03);note(880,.12,'square',.03,.09);note(1100,.18,'square',.03,.18)}},best:()=>{note(523,.12,'sine',.03);note(659,.12,'sine',.03,.12);note(784,.22,'sine',.03,.24)}};
