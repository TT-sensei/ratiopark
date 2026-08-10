import {record,recordAttempt} from './storage.js';
const multiplier=c=>c>=10?2:c>=8?1.8:c>=5?1.5:c>=3?1.2:1;
export class GameEngine{
  constructor({game,level,onRender,onEnd}){Object.assign(this,{game,level,onRender,onEnd,score:0,wrong:0,combo:0,maxCombo:0,locked:false,active:false,time:60});this._correct=0;Object.defineProperty(this,'correct',{get:()=>this._correct,set:()=>{}});}
  async countdown(){for(const n of ['3','2','1','START!']){this.onRender({phase:'countdown',word:n});await new Promise(r=>setTimeout(r,n==='START!'?500:650));}}
  async start(){await this.countdown();this.active=true;this.onRender({phase:'start'});this.timer=setInterval(()=>{if(!this.active)return;this.time--;this.onRender({phase:'tick'});if(this.time<=0)this.end()},1000);}
  submit({result,bonus=0,weakness,questionType='general',target='',reducedBonus=false}={}){if(!this.active||this.locked)return false;this.locked=true;if(result==='near'){this.onRender({phase:'answer',near:true});return true}const ok=result==='correct';recordAttempt({game:this.game,level:this.level,questionType,target,correct:ok});if(ok){this._correct++;this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);const points=Math.round((reducedBonus?75:100)*multiplier(this.combo))+bonus;this.score+=points;this.onRender({phase:'answer',ok:true,points,combo:this.combo});return true}this.wrong++;this.combo=0;this.lastWeakness=weakness||this.lastWeakness;this.onRender({phase:'answer',ok:false});return true;}
  answer(ok,options={}){return this.submit({result:options.near?'near':ok?'correct':'wrong',...options})}
  unlock(){this.locked=false;}
  hit({bonus=0}={}){return this.submit({result:'correct',bonus});}
  miss(weakness){return this.submit({result:'wrong',weakness});}
  end(){if(!this.active)return;this.active=false;clearInterval(this.timer);const saved=record({game:this.game,level:this.level,score:this.score,correct:this.correct,wrong:this.wrong,maxCombo:this.maxCombo,weakness:this.lastWeakness});this.onEnd({...this,saved});}
  stop(){this.active=false;clearInterval(this.timer);}
}
