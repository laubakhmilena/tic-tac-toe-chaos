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
  setAttribute(){}, getAttribute(){return null;}, addEventListener(){}, focus(){},
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
const today = run("localDateKey()");
function reset() {
  storage.clear();
  run(`save=defaultSave();currentScreen="home";selectedPetFood="fish";pendingUnlocks=[];sdk=null;save.soundEnabled=false;save.musicEnabled=false;save.vibrationEnabled=false;save.lastPetDailyGiftDate="${today}";save.petDailyQuestDate="${today}";save.petDailyQuest="matches";save.petRewardedAdsDate="${today}";`);
}

const tests = [];
function test(name, fn){tests.push([name,fn]);}

test("new save opens only Classic",()=>{reset();assert.deepEqual([...run("save.unlockedThemes")],["classic"]);assert.equal(run("save.selectedTheme"),"classic");});
test("existing unlocked themes survive migration",()=>{reset();storage.set("ticTacToeChaosSave",JSON.stringify({saveVersion:3,selectedTheme:"sun-moon",unlockedThemes:["classic","sun-moon"],totalGamesPlayed:2}));const migrated=run("loadSave()");assert.ok(migrated.unlockedThemes.includes("sun-moon"));assert.equal(migrated.selectedTheme,"sun-moon");});
test("invalid selected theme migrates to Classic",()=>{reset();storage.set("ticTacToeChaosSave",JSON.stringify({selectedTheme:"missing",unlockedThemes:["classic","missing"]}));assert.equal(run("loadSave().selectedTheme"),"classic");});
test("old saves receive safe pet defaults",()=>{reset();storage.set("ticTacToeChaosSave",JSON.stringify({saveVersion:3,selectedTheme:"classic",unlockedThemes:["classic"]}));const migrated=run("loadSave()");assert.equal(migrated.petFriendshipPoints,0);assert.equal(migrated.petFriendshipLevel,1);assert.deepEqual([...migrated.unlockedPetAccessories],[]);assert.equal(migrated.selectedPetAccessory,null);});
test("theme achievement thresholds are correct",()=>{reset();run("save.totalGamesPlayed=3;save.totalWinsAgainstBot=3;save.disappearingBestStreak=3;save.strategicStats.wins=1;save.infiniteStats.wins=1;evaluateUnlocks()");assert.deepEqual(new Set(run("save.unlockedThemes")),new Set(["classic","sun-moon","cloud-star","cat-yarn","fire-water","space","forest"]));assert.ok(!run("save.unlockedThemes").includes("coffee-donut"));run("save.totalWinsAgainstBot=5;evaluateUnlocks()");assert.ok(run("save.unlockedThemes").includes("coffee-donut"));});
test("match rewards map to 3, 2, 1 and friend 1",()=>{assert.equal(run('petMatchPoints("bot","X")'),3);assert.equal(run('petMatchPoints("bot","draw")'),2);assert.equal(run('petMatchPoints("bot","O")'),1);assert.equal(run('petMatchPoints("friend","X")'),1);});
test("loss never reduces friendship and sets supportive mood",()=>{reset();run(`save.petDailyQuestDate="${today}";save.lastPetDailyGiftDate="${today}";save.petRewardedAdsDate="${today}";save.petDailyQuest="matches";game={mode:"classic",opponent:"bot"};awardPetMatch("O")`);assert.equal(run("save.petFriendshipPoints"),1);assert.equal(run("save.petMood"),"supportive");});
test("friend match grants exactly one paw",()=>{reset();run(`save.petDailyQuestDate="${today}";save.lastPetDailyGiftDate="${today}";save.petDailyQuest="matches";game={mode:"classic",opponent:"friend"};awardPetMatch("X")`);assert.equal(run("save.petFriendshipPoints"),1);});
test("ten paws increase level and create a chest",()=>{reset();run("save.petFriendshipPoints=9;addPetPoints(1)");assert.equal(run("save.petFriendshipLevel"),2);assert.equal(run("save.petFriendshipPoints"),0);assert.equal(run("save.unopenedPetChest"),true);});
test("chests unlock sequential accessories without duplicates",()=>{reset();run("save.petFriendshipPoints=9;addPetPoints(1);openPetChest();save.petFriendshipPoints=9;addPetPoints(1);openPetChest()");const ids=[...run("save.unlockedPetAccessories")];assert.deepEqual(ids,["bow","bowl"]);assert.equal(new Set(ids).size,ids.length);});
test("completed accessory sequence yields treat and two paws",()=>{reset();const before=run("save.petFoodInventory.cookie");run("save.unlockedPetAccessories=PET_ACCESSORIES.map(a=>a.id);save.unopenedPetChest=true;openPetChest()");assert.equal(run("save.petFoodInventory.cookie")-before,1);assert.equal(run("save.petFriendshipPoints"),2);});
test("feeding consumes food and adds its paws",()=>{reset();run("save.petFoodInventory.cake=1;selectedPetFood='cake';feedPet()");assert.equal(run("save.petFoodInventory.cake"),0);assert.equal(run("save.petFriendshipPoints"),3);});
test("only first petting in a session grants a paw",()=>{reset();run("petPet();petPet()");assert.equal(run("save.petFriendshipPoints"),1);assert.equal(run("save.petFirstPettingSessionClaimed"),true);});
test("daily gift is granted once per date",()=>{reset();run("save.lastPetDailyGiftDate='';ensurePetDay(false)");const once={points:run("save.petFriendshipPoints"),food:run("Object.values(save.petFoodInventory).reduce((a,b)=>a+b,0)")};run("ensurePetDay(false)");assert.equal(run("save.petFriendshipPoints"),once.points);assert.equal(run("Object.values(save.petFoodInventory).reduce((a,b)=>a+b,0)"),once.food);assert.equal(once.points,2);assert.equal(once.food,1);});
test("daily quest persists on same date",()=>{reset();run("save.petDailyQuestDate='';ensurePetDay(false)");const id=run("save.petDailyQuest");run("ensurePetDay(false)");assert.equal(run("save.petDailyQuest"),id);});
test("daily quest reward is paid once",()=>{reset();run(`save.petDailyQuestDate="${today}";save.lastPetDailyGiftDate="${today}";save.petDailyQuest="matches";save.petDailyQuestProgress.matches=2;game={mode:"classic",opponent:"bot"};updatePetQuestAfterGame("O")`);const once={points:run("save.petFriendshipPoints"),food:run("Object.values(save.petFoodInventory).reduce((a,b)=>a+b,0)")};run("updatePetQuestAfterGame('O')");assert.equal(run("save.petFriendshipPoints"),once.points);assert.equal(run("Object.values(save.petFoodInventory).reduce((a,b)=>a+b,0)"),once.food);assert.equal(run("save.petDailyQuestCompleted"),true);});
test("rewarded ad error gives no reward",()=>{reset();run(`save.petDailyQuestDate="${today}";save.lastPetDailyGiftDate="${today}";save.petRewardedAdsDate="${today}";sdk={adv:{showRewardedVideo:({callbacks})=>callbacks.onError()}};claimRewardedTreat()`);assert.equal(run("save.petFriendshipPoints"),0);assert.equal(run("save.petFoodInventory.cookie"),0);});
test("rewarded ads stop after three rewards",()=>{reset();run(`save.petDailyQuestDate="${today}";save.lastPetDailyGiftDate="${today}";save.petRewardedAdsDate="${today}";sdk={adv:{showRewardedVideo:({callbacks})=>{callbacks.onRewarded();callbacks.onClose()}}};claimRewardedTreat();claimRewardedTreat();claimRewardedTreat();claimRewardedTreat()`);assert.equal(run("save.petRewardedAdsToday"),3);assert.equal(run("save.petFoodInventory.cookie"),3);assert.equal(run("save.petFriendshipPoints"),6);});
test("infinite camera and zoom survive save restoration",()=>{reset();run("game=createGame('infinite','friend','medium');game.moves.set('2,-3','X');game.zoom=1.42;game.offsetX=123;game.offsetY=-45;var cameraSave=serializeCurrentGame();var cameraRestored=restoreGame(cameraSave)");assert.equal(run("cameraRestored.zoom"),1.42);assert.equal(run("cameraRestored.offsetX"),123);assert.equal(run("cameraRestored.offsetY"),-45);assert.equal(run("cameraRestored.moves.get('2,-3')"),"X");});

let passed=0;
for(const [name,fn] of tests){try{fn();passed++;console.log(`PASS ${name}`);}catch(error){console.error(`FAIL ${name}`);throw error;}}
console.log(`\n${passed}/${tests.length} tests passed`);
