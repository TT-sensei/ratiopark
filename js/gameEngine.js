import {record} from './storage.js';
const multiplier=c=>c>=10?2:c>=8?1.8:c>=5?1.5:c>=3?1.2:1;
export class GameEngine{
  constructor({game,level,onRender,onEnd}){Object.assign(this,{game,level,onRender,onEnd,score:0,correct:0,wrong:0,combo:0,maxCombo:0,locked:false,active:false,time:60});}
  async countdown(){for(const n of ['3','2','1','START!']){this.onRender({phase:'countdown',word:n});await new Promise(r=>setTimeout(r,n==='START!'?500:650));}}
  async start(){await this.countdown();this.active=true;this.onRender({phase:'start'});this.timer=setInterval(()=>{if(!this.active)return;this.time--;this.onRender({phase:'tick'});if(this.time<=0)this.end()},1000);}
  answer(ok,{near=false,bonus=0,weakness}={}){if(!this.active||this.locked)return false;this.locked=true;if(ok){if(!near){this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);this.score+=Math.round(100*multiplier(this.combo))+bonus;}}else{this.wrong++;this.combo=0;this.lastWeakness=weakness||this.lastWeakness;}this.onRender({phase:'answer',ok,near});return true;}
  unlock(){this.locked=false;}
  hit({bonus=0}={}){this.correct++;this.answer(true,{bonus});}
  miss(weakness){this.answer(false,{weakness});}
  end(){if(!this.active)return;this.active=false;clearInterval(this.timer);const saved=record({game:this.game,level:this.level,score:this.score,correct:this.correct,wrong:this.wrong,maxCombo:this.maxCombo,weakness:this.lastWeakness});this.onEnd({...this,saved});}
  stop(){this.active=false;clearInterval(this.timer);}
}
