import {sameRatio} from '../js/mathUtils.js';
import {sameRatioGame} from '../js/games/sameRatio.js';
import {fakeRatioGame} from '../js/games/fakeRatio.js';
import {memoryRatioGame} from '../js/games/memoryRatio.js';
import {missingRatioGame} from '../js/games/missingRatio.js';
import {ratioChainGame} from '../js/games/ratioChain.js';

for(const level of ['easy','normal','hard'])for(let i=0;i<300;i++){
  const same=sameRatioGame.newQuestion(level);
  if(same.choices.filter(x=>sameRatio(...same.shown,...x.pair)).length!==1)throw Error('sameRatio');
  const fake=fakeRatioGame.newQuestion(level);
  if(fake.cards.filter(x=>x.fake).length!==1)throw Error('fakeRatio');
  const memory=memoryRatioGame.newQuestion(level),groups=new Map();memory.cards.forEach(x=>groups.set(x.pair,(groups.get(x.pair)||0)+1));if([...groups.values()].some(n=>n!==2))throw Error('memoryRatio');
  const missing=missingRatioGame.newQuestion(level);if(!sameRatio(...missing.values))throw Error('missingRatio');
  const chain=ratioChainGame.newQuestion(level),before=JSON.stringify(chain.options);ratioChainGame.render(chain);if(JSON.stringify(chain.options)!==before)throw Error('ratioChain');
}
console.log('generator checks passed');
