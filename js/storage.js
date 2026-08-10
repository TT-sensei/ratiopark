const KEY='ratioPark.v1';
const fresh=()=>({best:{},plays:0,correct:0,wrong:0,maxCombo:0,weaknesses:{},sound:false});
export const read=()=>{try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY))}}catch{return fresh()}};
export const write=data=>localStorage.setItem(KEY,JSON.stringify(data));
export const best=(game,level)=>read().best?.[game]?.[level]||0;
export const record=({game,level,score,correct,wrong,maxCombo})=>{const d=read();const old=d.best?.[game]?.[level]||0;d.best[game]??={};d.best[game][level]=Math.max(old,score);d.plays++;d.correct+=correct;d.wrong+=wrong;d.maxCombo=Math.max(d.maxCombo,maxCombo);write(d);return{old,isNew:score>old,best:d.best[game][level]}};
export const recordAttempt=({game,level,questionType='general',target='',correct})=>{const d=read();const key=`${game}:${level}:${questionType}`;const item=d.weaknesses[key]||{wrong:0,right:0,target};item.target=target||item.target;if(correct)item.right++;else item.wrong++;d.weaknesses[key]=item;write(d)};
export const growthTip=()=>{const d=read();const entries=Object.entries(d.weaknesses).map(([key,v])=>({key,...(typeof v==='number'?{wrong:v,right:0}:v)})).filter(x=>x.wrong>x.right);if(!entries.length)return 'いろいろな比にチャレンジしてみよう！';const top=entries.sort((a,b)=>(b.wrong-b.right)-(a.wrong-a.right))[0];if(top.key.includes('decimal'))return '小数の比をもう少し！';if(top.key.includes('reduction'))return '約分をもう少し！';if(top.key.includes('compare'))return '比の値くらべをもう少し！';return '同じ比をもう少し！'};
export const reset=()=>{localStorage.removeItem(KEY)};
