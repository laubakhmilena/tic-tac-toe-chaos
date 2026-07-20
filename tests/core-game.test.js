"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const classNames = new Set();
const element = {
  innerHTML:"", textContent:"", src:"", alt:"", hidden:false, disabled:false,
  dataset:{}, style:{ width:"", setProperty(){} }, offsetWidth:1, scrollTop:0,
  classList:{ add(...names){names.forEach(n=>classNames.add(n));}, remove(...names){names.forEach(n=>classNames.delete(n));}, toggle(name,on){on?classNames.add(name):classNames.delete(name);}, contains(name){return classNames.has(name);} },
  setAttribute(){}, getAttribute(){return null;}, hasAttribute(){return false;}, addEventListener(){}, focus(){},
  querySelector(){return element;}, querySelectorAll(){return[];},
  getContext(){return{};}, getBoundingClientRect(){return{width:400,height:400,left:0,top:0,right:400,bottom:400};}
};
const storage = new Map();
const localStorage = { getItem:k=>storage.has(k)?storage.get(k):null, setItem:(k,v)=>storage.set(k,String(v)), removeItem:k=>storage.delete(k), clear:()=>storage.clear() };
const document = { querySelector:()=>element, querySelectorAll:()=>[], documentElement:element, body:element, hidden:false, addEventListener(){} };
const context = {
  console, document, localStorage, location:{hostname:""}, navigator:{}, performance:{now:()=>0},
  setTimeout:()=>0, clearTimeout(){}, requestAnimationFrame:fn=>{fn();return 0;}, cancelAnimationFrame(){},
  ResizeObserver:class{observe(){}}, devicePixelRatio:1, addEventListener(){}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,"..","script.js"),"utf8"),context,{filename:"script.js"});
const run = code => vm.runInContext(code,context);
function reset(){ storage.clear(); run('save=defaultSave();game=null;selectedMode="classic";setupOpponent="friend";setupDifficulty="medium";botThinking=false;inputLocked=false;sdk=null;save.soundEnabled=false;save.musicEnabled=false;save.vibrationEnabled=false;'); }

const tests=[];
function test(name,fn){tests.push([name,fn]);}

test("classic game starts with an empty 3x3 board",()=>{reset();const g=run('createGame("classic","friend","medium")');assert.equal(g.board.length,9);assert.ok(g.board.every(v=>v===""));assert.equal(g.turn,"X");});
test("all eight classic winning lines are recognized",()=>{reset();const lines=run('WIN3.map(line=>line.slice())');for(const line of lines){const board=Array(9).fill("");line.forEach(i=>board[i]="X");context.boardForTest=board;const result=run('check3(boardForTest)');assert.equal(result.winner,"X");assert.deepEqual([...result.line],[...line]);}});
test("non-winning classic board returns null",()=>{reset();context.boardForTest=["X","O","X","O","X","O","O","X",""];assert.equal(run('check3(boardForTest)'),null);});
test("hard bot takes an immediate winning move",()=>{reset();run('game=createGame("classic","bot","hard");game.board=["O","O","","X","X","","","",""]');assert.equal(run('chooseClassicBot()'),2);});
test("medium bot blocks an immediate player win",()=>{reset();run('game=createGame("classic","bot","medium");game.board=["X","X","","O","","","","",""]');assert.equal(run('chooseClassicBot()'),2);});
test("disappearing game initializes independent queues",()=>{reset();const g=run('createGame("disappearing","friend","medium")');assert.deepEqual([...g.queues.X],[]);assert.deepEqual([...g.queues.O],[]);assert.notEqual(g.queues.X,g.queues.O);});
test("strategic valid moves obey the active mini-board",()=>{reset();run('game=createGame("strategic","friend","medium");game.activeMini=4');const moves=run('strategicValidMoves()');assert.equal(moves.length,9);assert.ok(moves.every(([mini])=>mini===4));});
test("valid strategic save passes validation and malformed save fails",()=>{reset();run('game=createGame("strategic","friend","medium");var strategicSave=serializeCurrentGame()');assert.equal(run('validateUnfinished(strategicSave,"strategic")'),true);run('strategicSave.boards[0]=["X"]');assert.equal(run('validateUnfinished(strategicSave,"strategic")'),false);});
test("infinite mode detects horizontal, vertical and diagonal lines of five",()=>{reset();for(const entries of [
  [[0,0],[1,0],[2,0],[3,0],[4,0]],
  [[0,0],[0,1],[0,2],[0,3],[0,4]],
  [[0,0],[1,1],[2,2],[3,3],[4,4]],
  [[0,0],[1,-1],[2,-2],[3,-3],[4,-4]]
]){context.entriesForTest=entries;const length=run('var m=new Map(entriesForTest.map(p=>[`${p[0]},${p[1]}`,"X"]));infiniteWinAt(entriesForTest[2][0],entriesForTest[2][1],"X",m)?.length||0');assert.equal(length,5);}});
test("infinite candidates start at origin and never include occupied cells",()=>{reset();run('game=createGame("infinite","friend","medium")');assert.deepEqual([...run('infiniteCandidates()[0]')],[0,0]);run('game.moves.set("0,0","X")');const candidates=run('infiniteCandidates()');assert.ok(candidates.length>0);assert.ok(!candidates.some(([x,y])=>x===0&&y===0));});
test("infinite bot chooses its immediate winning move",()=>{reset();run('game=createGame("infinite","bot","hard");for(let x=0;x<4;x++)game.moves.set(`${x},0`,"O")');const move=run('chooseInfiniteBot()');assert.ok((move[0]===-1||move[0]===4)&&move[1]===0);});
test("infinite save is rejected after the 1200-move cap",()=>{reset();run('game=createGame("infinite","friend","medium");for(let i=0;i<1201;i++)game.moves.set(`${i},0`,i%2?"O":"X")');assert.equal(run('serializeCurrentGame()'),null);});
test("strategic restore creates independent board arrays",()=>{reset();run('game=createGame("strategic","friend","medium");game.boards[0][0]="X";var savedStrategic=serializeCurrentGame();var restoredStrategic=restoreGame(savedStrategic);restoredStrategic.boards[0][0]="O"');assert.equal(run('savedStrategic.boards[0][0]'),"X");});

let passed=0;
for(const [name,fn] of tests){try{fn();passed++;console.log(`PASS ${name}`);}catch(error){console.error(`FAIL ${name}`);throw error;}}
console.log(`\n${passed}/${tests.length} tests passed`);
