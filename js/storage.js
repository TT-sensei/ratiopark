const KEY='ratioPark.v1';
const fresh=()=>({best:{},plays:0,correct:0,wrong:0,maxCombo:0,weaknesses:{},sound:false});
export const read=()=>{try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY))}}catch{return fresh()}};
export const write=data=>localStorage.setItem(KEY,JSON.stringify(data));
export const best=(game,level)=>read().best?.[game]?.[level]||0;
export const record=({game,level,score,correct,wrong,maxCombo,weakness})=>{const d=read();const old=d.best?.[game]?.[level]||0;d.best[game]??={};d.best[game][level]=Math.max(old,score);d.plays++;d.correct+=correct;d.wrong+=wrong;d.maxCombo=Math.max(d.maxCombo,maxCombo);if(weakness&&wrong)d.weaknesses[weakness]=(d.weaknesses[weakness]||0)+wrong;write(d);return{old,isNew:score>old,best:d.best[game][level]}};
export const reset=()=>{localStorage.removeItem(KEY)};
