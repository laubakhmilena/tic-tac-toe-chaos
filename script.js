"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const SAVE_KEY = "ticTacToeChaosSave";
const LEGACY_KEY = "ticTacToeState";
const SAVE_VERSION = 5;
const WIN3 = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

const THEMES = [
  { id:"classic", name:"Классика", cover:"assets/themes/classic.webp", symbols:["✕","◯"], requirement:"Открыта сразу" },
  { id:"sun-moon", name:"Солнце и Луна", cover:"assets/themes/sun-moon.webp", symbols:["☀️","🌙"], requirement:"Сыграйте 3 завершённых матча" },
  { id:"cloud-star", name:"Облако и Звезда", cover:"assets/themes/cloud-star.webp", symbols:["☁️","⭐"], requirement:"Одержите первую победу над компьютером" },
  { id:"cat-yarn", name:"Котик и Клубок", cover:"assets/themes/cat-yarn.webp", symbols:["🐱","🧶"], requirement:"Одержите 3 победы над компьютером" },
  { id:"coffee-donut", name:"Кофе и Пончик", cover:"assets/themes/coffee-donut.webp", symbols:["☕","🍩"], requirement:"Победите компьютер 5 раз" },
  { id:"fire-water", name:"Огонь и Вода", cover:"assets/themes/fire-water.webp", symbols:["🔥","💧"], requirement:"Серия из 3 побед в «Исчезающих»" },
  { id:"space", name:"Космос", cover:"assets/themes/space.webp", symbols:["🔮","💎"], requirement:"Победите в «Стратегических»" },
  { id:"forest", name:"Лес", cover:"assets/themes/forest.webp", symbols:["🍃","🌿"], requirement:"Победите в «Бесконечных»" }
];

const MODES = {
  classic: { title:"Классические", description:"Знакомая игра на поле 3×3. Соберите три символа в ряд.", hint:"3 в ряд для победы", art:"assets/modes/classic-mode-icon.png" },
  strategic: { title:"Стратегические", description:"Побеждайте на малых полях и соберите три победы в ряд на большом.", hint:"Клетка хода определяет следующее малое поле", art:"assets/modes/strategic-mode-icon.png" },
  infinite: { title:"Бесконечные", description:"Перемещайте поле, меняйте масштаб и соберите пять символов подряд.", hint:"5 подряд для победы", art:"assets/modes/infinite-mode-icon.png" },
  disappearing: { title:"Исчезающие", description:"У каждого игрока остаются только три знака: четвёртый удаляет самый старый.", hint:"4-й знак удаляет 1-й", art:"assets/modes/disappearing-mode-icon.png" }
};

const PET_FOODS = [
  { id:"fish", name:"Рыбка", points:1, art:"assets/pet/food-fish.png" },
  { id:"milk", name:"Молоко", points:1, art:"assets/pet/food-milk.png" },
  { id:"cookie", name:"Печенье", points:2, art:"assets/pet/food-cookie.png" },
  { id:"cake", name:"Торт", points:3, art:"assets/pet/food-cake.png" }
];
const PET_ACCESSORIES = [
  { id:"bow", name:"Красный бантик", art:"assets/pet/accessory-bow.png" },
  { id:"bowl", name:"Розовая миска", art:"assets/pet/accessory-bowl.png" },
  { id:"yarn", name:"Клубок", art:"assets/pet/accessory-yarn.png" },
  { id:"pillow", name:"Мягкая подушка", art:"assets/pet/accessory-pillow.png" },
  { id:"crown", name:"Золотая корона", art:"assets/pet/accessory-crown.png" },
  { id:"glasses", name:"Очки", art:"assets/pet/accessory-glasses.png" },
  { id:"collar", name:"Волшебный ошейник", art:"assets/pet/accessory-collar.png" },
  { id:"cosmic-bed", name:"Космическая лежанка", art:"assets/pet/accessory-cosmic-bed.png" }
];
const PET_QUESTS = [
  { id:"matches", text:"Сыграйте 3 матча", target:3 },
  { id:"bot-win", text:"Победите компьютер 1 раз", target:1 },
  { id:"two-modes", text:"Сыграйте в двух разных режимах", target:2 },
  { id:"disappearing-win", text:"Победите в режиме «Исчезающие»", target:1 },
  { id:"strategic-finish", text:"Закончите стратегический матч", target:1 },
  { id:"infinite-win", text:"Соберите пять подряд в бесконечном режиме", target:1 }
];

const RULES = {
  classic: ["Ходите по очереди на поле 3×3.","Соберите три своих символа по горизонтали, вертикали или диагонали.","Заполненное поле без линии — ничья."],
  disappearing: ["У каждого игрока может быть только 3 знака.","Когда ставится 4-й знак, самый старый исчезает.","Следите за полупрозрачным знаком."],
  strategic: ["Большое поле состоит из 9 малых полей.","Клетка вашего хода определяет следующее поле соперника.","Выиграйте 3 малых поля в ряд."],
  infinite: ["Перемещайте поле пальцем или мышью.","Используйте масштаб и центрирование.","Соберите 5 символов подряд."]
};

function blankStats() { return { played:0, wins:0, losses:0, draws:0 }; }
function defaultSave() {
  return {
    saveVersion:SAVE_VERSION, selectedTheme:"classic", unlockedThemes:["classic"], shownThemeUnlocks:[],
    totalGamesPlayed:0, totalWinsAgainstBot:0, totalLossesAgainstBot:0, totalDraws:0,
    lastSelectedMode:"classic", lastOpponentType:"bot",
    difficultyByMode:{ classic:"medium", strategic:"medium", infinite:"medium", disappearing:"medium" },
    opponentByMode:{ classic:"bot", strategic:"bot", infinite:"bot", disappearing:"bot" },
    soundEnabled:true, musicEnabled:true, vibrationEnabled:true,
    classicStats:blankStats(), strategicStats:blankStats(), infiniteStats:blankStats(), disappearingStats:blankStats(),
    disappearingCurrentStreak:0, disappearingBestStreak:0,
    strategicTutorialCompleted:false, infiniteTutorialCompleted:false, disappearingTutorialCompleted:false,
    unfinished:{ strategic:null, infinite:null },
    petEnabled:true, petFriendshipPoints:0, petFriendshipLevel:1,
    petFoodInventory:{ fish:0, milk:0, cookie:0, cake:0 },
    unlockedPetAccessories:[], selectedPetAccessory:null, unopenedPetChest:false,
    lastPetDailyGiftDate:"", petDailyQuest:null,
    petDailyQuestProgress:{ matches:0, botWins:0, modes:[], disappearingWins:0, strategicMatches:0, infiniteWins:0 },
    petDailyQuestDate:"", petDailyQuestCompleted:false,
    petRewardedAdsToday:0, petRewardedAdsDate:"", petFirstPettingSessionClaimed:false,
    petMood:"normal"
  };
}

function safeObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
function loadSave() {
  const base = defaultSave();
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (_) { raw = null; }
  if (!raw) {
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
      if (legacy) {
        const oldTheme = String(legacy.theme || legacy.selectedTheme || "");
        if (THEMES.some(t => t.id === oldTheme)) base.selectedTheme = oldTheme;
      }
    } catch (_) { /* A damaged legacy save is intentionally ignored. */ }
    return base;
  }
  const merged = { ...base, ...safeObject(raw) };
  merged.difficultyByMode = { ...base.difficultyByMode, ...safeObject(raw.difficultyByMode) };
  merged.opponentByMode = { ...base.opponentByMode, ...safeObject(raw.opponentByMode) };
  merged.unfinished = { ...base.unfinished, ...safeObject(raw.unfinished) };
  merged.petFoodInventory = { ...base.petFoodInventory, ...safeObject(raw.petFoodInventory) };
  merged.petDailyQuestProgress = { ...base.petDailyQuestProgress, ...safeObject(raw.petDailyQuestProgress) };
  merged.petDailyQuestProgress.modes = Array.isArray(merged.petDailyQuestProgress.modes) ? [...new Set(merged.petDailyQuestProgress.modes.filter(id => id in MODES))] : [];
  for (const key of ["classicStats","strategicStats","infiniteStats","disappearingStats"]) merged[key] = { ...blankStats(), ...safeObject(raw[key]) };
  merged.unlockedThemes = [...new Set(["classic",...(Array.isArray(raw.unlockedThemes) ? raw.unlockedThemes : [])])].filter(id => THEMES.some(t => t.id === id));
  merged.shownThemeUnlocks = Array.isArray(raw.shownThemeUnlocks) ? raw.shownThemeUnlocks.filter(id => THEMES.some(t => t.id === id)) : [];
  merged.unlockedPetAccessories = Array.isArray(raw.unlockedPetAccessories) ? [...new Set(raw.unlockedPetAccessories)].filter(id => PET_ACCESSORIES.some(a => a.id === id)) : [];
  if (!PET_ACCESSORIES.some(a => a.id === merged.selectedPetAccessory) || !merged.unlockedPetAccessories.includes(merged.selectedPetAccessory)) merged.selectedPetAccessory = null;
  if (!THEMES.some(t => t.id === merged.selectedTheme) || !merged.unlockedThemes.includes(merged.selectedTheme)) merged.selectedTheme = "classic";
  merged.petFriendshipPoints = Math.max(0, Math.min(9, Number(merged.petFriendshipPoints) || 0));
  merged.petFriendshipLevel = Math.max(1, Number(merged.petFriendshipLevel) || 1);
  merged.petRewardedAdsToday = Math.max(0, Math.min(3, Number(merged.petRewardedAdsToday) || 0));
  merged.petFirstPettingSessionClaimed = false;
  merged.saveVersion = SAVE_VERSION;
  return merged;
}

let save = loadSave();
let currentScreen = "home";
let selectedMode = save.lastSelectedMode in MODES ? save.lastSelectedMode : "classic";
let setupOpponent = save.opponentByMode[selectedMode] || "bot";
let setupDifficulty = save.difficultyByMode[selectedMode] || "medium";
let game = null;
let sessionScore = { X:0, O:0, draws:0 };
let botTimer = 0;
let botThinking = false;
let inputLocked = false;
let pendingUnlocks = [];
let toastTimer = 0;
let audioContext = null;
let musicNodes = null;
let sdk = null;
let adPaused = false;
let completedSinceAd = 0;
let selectedPetFood = "fish";
let petIdleTimer = 0;
let petHeartTimer = 0;

const screens = {
  home:$("#homeScreen"), modes:$("#modesScreen"), setup:$("#setupScreen"), game:$("#gameScreen"), pet:$("#petScreen")
};
const themeCarousel = $("#themeCarousel");
const modalLayer = $("#modalLayer");
const modal = $("#modal");
const boardHost = $("#boardHost");
const canvas = $("#infiniteCanvas");
const ctx = canvas.getContext("2d");

function persist() {
  save.saveVersion = SAVE_VERSION;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) { showToast("Не удалось сохранить прогресс"); }
}

function selectedTheme() { return THEMES.find(t => t.id === save.selectedTheme) || THEMES[0]; }
function themeProgress(id) {
  if (id === "sun-moon") return { label:`Матчи: ${Math.min(save.totalGamesPlayed,3)} из 3`, value:Math.min(save.totalGamesPlayed/3,1) };
  if (id === "cloud-star") return { label:`Победы: ${Math.min(save.totalWinsAgainstBot,1)} из 1`, value:Math.min(save.totalWinsAgainstBot,1) };
  if (id === "cat-yarn") return { label:`Победы: ${Math.min(save.totalWinsAgainstBot,3)} из 3`, value:Math.min(save.totalWinsAgainstBot/3,1) };
  if (id === "coffee-donut") return { label:`Победы: ${Math.min(save.totalWinsAgainstBot,5)} из 5`, value:Math.min(save.totalWinsAgainstBot/5,1) };
  if (id === "fire-water") return { label:`Серия: ${Math.min(save.disappearingBestStreak,3)} из 3`, value:Math.min(save.disappearingBestStreak/3,1) };
  if (id === "space") return { label:`Победы: ${Math.min(save.strategicStats.wins,1)} из 1`, value:Math.min(save.strategicStats.wins,1) };
  if (id === "forest") return { label:`Победы: ${Math.min(save.infiniteStats.wins,1)} из 1`, value:Math.min(save.infiniteStats.wins,1) };
  return { label:"Открыта", value:1 };
}

function evaluateUnlocks() {
  const before = new Set(save.unlockedThemes);
  const eligible = [
    ["sun-moon", save.totalGamesPlayed >= 3], ["cloud-star", save.totalWinsAgainstBot >= 1], ["cat-yarn", save.totalWinsAgainstBot >= 3],
    ["coffee-donut", save.totalWinsAgainstBot >= 5], ["fire-water", save.disappearingBestStreak >= 3],
    ["space", save.strategicStats.wins >= 1], ["forest", save.infiniteStats.wins >= 1]
  ];
  for (const [id, ok] of eligible) if (ok && !before.has(id)) save.unlockedThemes.push(id);
  const unlocked = save.unlockedThemes.filter(id => !before.has(id));
  if (unlocked.length) { pendingUnlocks.push(...unlocked.filter(id => !pendingUnlocks.includes(id))); persist(); renderThemes(); }
  return unlocked;
}

function renderThemes() {
  themeCarousel.innerHTML = THEMES.map(theme => {
    const unlocked = save.unlockedThemes.includes(theme.id);
    const active = save.selectedTheme === theme.id;
    const progress = themeProgress(theme.id);
    return `<button class="theme-card${active ? " is-active" : ""}${unlocked ? "" : " is-locked"}" type="button" data-theme="${theme.id}" aria-label="${theme.name}${unlocked ? "" : ", закрыта"}" aria-pressed="${active}">
      <img class="theme-cover" src="${theme.cover}" alt="${theme.name}" loading="${active ? "eager" : "lazy"}">
      <span class="theme-state"><img src="assets/icons/${active ? "check" : unlocked ? "unlock" : "lock"}.png" alt=""></span>
      <span class="theme-name">${theme.name}${unlocked ? "" : `<small>${progress.label}</small>`}</span>
    </button>`;
  }).join("");
  renderThemeChips();
}

function renderThemeChips() {
  const theme = selectedTheme();
  const html = `<img src="${theme.cover}" alt=""><span>${theme.name}</span>`;
  $("#modeThemeChip").innerHTML = html;
  $("#setupThemeChip").innerHTML = html;
  document.documentElement.style.setProperty("--p1", theme.id === "classic" ? "#159bf0" : "#7660f3");
  document.documentElement.style.setProperty("--p2", theme.id === "classic" ? "#ff5f8f" : "#ff6fa7");
}

function selectTheme(id) {
  if (!save.unlockedThemes.includes(id)) { showLockedTheme(id); return; }
  save.selectedTheme = id; persist(); renderThemes(); playSound("click");
  $(`[data-theme="${id}"]`)?.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
}

function showLockedTheme(id) {
  const theme = THEMES.find(t => t.id === id); const progress = themeProgress(id);
  openModal(`<img class="modal-hero" src="${theme.cover}" alt="${theme.name}"><h2 id="modalTitle">${theme.name}</h2><p>${theme.requirement}</p><div class="progress-bar"><span style="width:${progress.value*100}%"></span></div><p><b>${progress.label}</b></p><div class="modal-actions"><button class="primary-btn" data-modal="close">Понятно</button></div>`);
}

function showScreen(name) {
  if (!screens[name] || currentScreen === name) return;
  inputLocked = true;
  Object.entries(screens).forEach(([key, el]) => el.classList.toggle("is-active", key === name));
  currentScreen = name;
  setTimeout(() => { inputLocked = false; screens[name].scrollTop = 0; if (name === "game" && game) renderGame(); }, 180);
  if (name === "modes") renderThemeChips();
  if (name === "pet") { renderPet(); resetPetIdleTimer(); }
  else clearTimeout(petIdleTimer);
  if (name === "home") renderHomePet();
  if (name !== "game") stopGameplay();
  playSound("click");
}

function localDateKey(date = new Date()) {
  const y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,"0"), d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function stableDateIndex(key, count) { return [...key].reduce((sum,char)=>sum+char.charCodeAt(0),0) % count; }
function petMoodImage(mood=save.petMood) { return `assets/pet/cat-${["normal","happy","supportive","sleeping"].includes(mood)?mood:"normal"}.png`; }
function setPetMood(mood, message="") {
  save.petMood = mood;
  if (currentScreen === "pet") {
    $("#petCharacter").src = petMoodImage(mood);
    if (message) $("#petReaction").textContent = message;
  }
  renderHomePet();
}
function addPetPoints(amount) {
  if (!save.petEnabled || amount <= 0) return false;
  let points=(Number(save.petFriendshipPoints)||0)+amount, leveled=false;
  while(points>=10){points-=10;save.petFriendshipLevel++;save.unopenedPetChest=true;leveled=true;}
  save.petFriendshipPoints=Math.max(0,Math.min(9,points));
  if(leveled)setPetMood("happy","Сундук заботы готов!");
  persist(); renderHomePet(); if(currentScreen==="pet")renderPet();
  return leveled;
}
function renderHomePet() {
  const image=$("#petHomeImage"), label=$("#petHomeGift"); if(!image||!label)return;
  image.src=petMoodImage();
  label.textContent=save.unopenedPetChest?"🎁 Сундук заботы готов":`До подарка: ${10-save.petFriendshipPoints} ${10-save.petFriendshipPoints===1?"лапка":"лапок"}`;
}
function questProgressValue() {
  const quest=PET_QUESTS.find(q=>q.id===save.petDailyQuest)||PET_QUESTS[0], p=save.petDailyQuestProgress;
  const values={matches:p.matches,"bot-win":p.botWins,"two-modes":p.modes.length,"disappearing-win":p.disappearingWins,"strategic-finish":p.strategicMatches,"infinite-win":p.infiniteWins};
  return {quest,current:Math.min(Number(values[quest.id])||0,quest.target)};
}
function questProgressLabel(quest,current){
  if(quest.id==="matches")return `Матчи: ${current} из ${quest.target}`;
  if(quest.id==="two-modes")return `Режимы: ${current} из ${quest.target}`;
  return `Выполнено: ${current} из ${quest.target}`;
}
function ensurePetDay(showGift=true) {
  const today=localDateKey();
  if(save.petDailyQuestDate!==today){
    save.petDailyQuestDate=today; save.petDailyQuest=PET_QUESTS[stableDateIndex(today,PET_QUESTS.length)].id;
    save.petDailyQuestProgress={matches:0,botWins:0,modes:[],disappearingWins:0,strategicMatches:0,infiniteWins:0};
    save.petDailyQuestCompleted=false;
  }
  if(save.petRewardedAdsDate!==today){save.petRewardedAdsDate=today;save.petRewardedAdsToday=0;}
  if(save.lastPetDailyGiftDate!==today){
    save.lastPetDailyGiftDate=today;
    const food=PET_FOODS[stableDateIndex(`${today}-gift`,PET_FOODS.length)];
    save.petFoodInventory[food.id]=(save.petFoodInventory[food.id]||0)+1;
    addPetPoints(2); persist();
    if(showGift)setTimeout(()=>openModal(`<img class="modal-hero" src="assets/pet/cat-happy.png" alt="Кошечка Хаос"><h2 id="modalTitle">Кошечка нашла подарок!</h2><p>${food.name}: +1 · Дружба: +2 лапки</p><div class="modal-actions"><button class="primary-btn" data-modal="close">Спасибо!</button></div>`),120);
  }
  persist();
}
function renderPet() {
  ensurePetDay(false);
  $("#petCharacter").src=petMoodImage();
  const moodMessages={normal:"Я всегда рядом!",happy:"Ура! Ты победил!",supportive:"Ничего, попробуем ещё раз!",sleeping:"Мур-р-р…"};
  $("#petReaction").textContent=moodMessages[save.petMood]||moodMessages.normal;
  const preview=$("#petAccessoryPreview"), selectedAccessory=PET_ACCESSORIES.find(a=>a.id===save.selectedPetAccessory);
  preview.hidden=!selectedAccessory; if(selectedAccessory){preview.src=selectedAccessory.art;preview.dataset.accessory=selectedAccessory.id;}
  $("#petLevel").textContent=`Уровень дружбы: ${save.petFriendshipLevel}`;
  $("#petPointsLabel").textContent=`Лапки: ${save.petFriendshipPoints} из 10`;
  $("#petProgressBar").style.width=`${save.petFriendshipPoints*10}%`;
  $("#petChestButton").disabled=!save.unopenedPetChest;
  $("#petChestImage").src=save.unopenedPetChest?"assets/pet/chest-closed.png":"assets/pet/chest-open.png";
  $("#petChestLabel").textContent=save.unopenedPetChest?"Открыть Сундук заботы":"Сундук заботы пока не готов";
  const {quest,current}=questProgressValue();
  $("#petQuestText").textContent=save.petDailyQuestCompleted?"Задание выполнено — награда получена":quest.text;
  $("#petQuestLabel").textContent=questProgressLabel(quest,current);
  $("#petQuestProgress").style.width=`${Math.min(1,current/quest.target)*100}%`;
  $("#petFoodGrid").innerHTML=PET_FOODS.map(food=>`<button class="pet-food${selectedPetFood===food.id?" is-selected":""}" type="button" data-pet-food="${food.id}" aria-pressed="${selectedPetFood===food.id}"><img src="${food.art}" alt=""><span>${food.name}</span><small>${save.petFoodInventory[food.id]||0} шт. · +${food.points}</small></button>`).join("");
  $("#petAccessories").innerHTML=PET_ACCESSORIES.map(item=>{const unlocked=save.unlockedPetAccessories.includes(item.id),selected=save.selectedPetAccessory===item.id;return `<button class="pet-accessory${unlocked?"":" is-locked"}${selected?" is-selected":""}" type="button" data-pet-accessory="${item.id}" aria-label="${item.name}${unlocked?"":" — откройте сундук заботы"}" aria-pressed="${selected}"><img src="${item.art}" alt=""><span>${item.name}</span>${unlocked?"":`<img class="pet-lock" src="assets/icons/lock.png" alt="Закрыто">`}</button>`;}).join("");
  const rewarded=$("#petRewardedButton"); rewarded.hidden=!sdk?.adv?.showRewardedVideo; rewarded.disabled=save.petRewardedAdsToday>=3;
  if(!rewarded.hidden)rewarded.textContent=save.petRewardedAdsToday>=3?"Лимит лакомств на сегодня исчерпан":"Получить печенье: +2 лапки";
  renderHomePet();
}
function petAnimateHeart(message) {
  const heart=$("#petHeart"); clearTimeout(petHeartTimer); heart.classList.remove("is-visible"); void heart.offsetWidth; heart.classList.add("is-visible");
  petHeartTimer=setTimeout(()=>heart.classList.remove("is-visible"),800); if(message)$("#petReaction").textContent=message;
}
function resetPetIdleTimer(){clearTimeout(petIdleTimer);if(currentScreen!=="pet")return;petIdleTimer=setTimeout(()=>{setPetMood("sleeping","Мур-р-р…");persist();},45000);}
function feedPet(){const food=PET_FOODS.find(f=>f.id===selectedPetFood)||PET_FOODS[0];if((save.petFoodInventory[food.id]||0)<1){showToast(`${food.name}: запас пуст`);return;}save.petFoodInventory[food.id]--;addPetPoints(food.points);setPetMood("happy");playSound("win");vibrate(25);persist();renderPet();$("#petReaction").textContent="Мур! Спасибо за угощение!";petAnimateHeart();resetPetIdleTimer();}
function petPet(){const first=!save.petFirstPettingSessionClaimed;if(first){save.petFirstPettingSessionClaimed=true;addPetPoints(1);}setPetMood("happy");playSound("click");vibrate(18);persist();renderPet();$("#petReaction").textContent=first?"Мур-р! +1 лапка дружбы":"Мур-р-р!";petAnimateHeart();resetPetIdleTimer();}
function openPetChest(){if(!save.unopenedPetChest)return;save.unopenedPetChest=false;const next=PET_ACCESSORIES.find(a=>!save.unlockedPetAccessories.includes(a.id));let rewardText;if(next){save.unlockedPetAccessories.push(next.id);rewardText=next.name;}else{save.petFoodInventory.cookie=(save.petFoodInventory.cookie||0)+1;addPetPoints(2);rewardText="Праздничное печенье и +2 лапки";}setPetMood("happy","Ура! Новый подарок!");persist();renderPet();openModal(`<img class="modal-hero" src="assets/pet/chest-open.png" alt="Открытый сундук"><h2 id="modalTitle">Сундук заботы открыт!</h2><p>${rewardText}</p><div class="modal-actions"><button class="primary-btn" data-modal="close">Здорово!</button></div>`);}
function selectPetAccessory(id){if(!save.unlockedPetAccessories.includes(id)){showToast("Откройте Сундук заботы");return;}save.selectedPetAccessory=save.selectedPetAccessory===id?null:id;persist();renderPet();}
function updatePetQuestAfterGame(result) {
  ensurePetDay(false);const p=save.petDailyQuestProgress;p.matches++;if(!p.modes.includes(game.mode))p.modes.push(game.mode);
  if(game.opponent==="bot"&&result==="X")p.botWins++;
  const humanWin=result==="X"||(game.opponent==="friend"&&result==="O");
  if(game.mode==="disappearing"&&humanWin)p.disappearingWins++;
  if(game.mode==="strategic")p.strategicMatches++;
  if(game.mode==="infinite"&&humanWin)p.infiniteWins++;
  const {quest,current}=questProgressValue();
  if(!save.petDailyQuestCompleted&&current>=quest.target){save.petDailyQuestCompleted=true;const food=PET_FOODS[stableDateIndex(`${localDateKey()}-quest`,PET_FOODS.length)];save.petFoodInventory[food.id]=(save.petFoodInventory[food.id]||0)+1;addPetPoints(3);showToast(`Задание дня выполнено: ${food.name} и +3 лапки`);}persist();
}
function petMatchPoints(opponent,result){return opponent==="friend"?1:result==="X"?3:(result==="draw"||result==="long"?2:1);}
function awardPetMatch(result){addPetPoints(petMatchPoints(game.opponent,result));if(game.opponent==="bot"&&result==="O")setPetMood("supportive","Ничего, попробуем ещё раз!");else if(result==="X"||(game.opponent==="friend"&&result==="O"))setPetMood("happy","Ура! Ты победил!");else setPetMood("normal","Отличная партия!");updatePetQuestAfterGame(result);}
function claimRewardedTreat(){ensurePetDay(false);if(save.petRewardedAdsToday>=3){showToast("Лимит на сегодня исчерпан");return;}if(!sdk?.adv?.showRewardedVideo){showToast("Видео сейчас недоступно");return;}let rewarded=false;adPaused=true;stopGameplay();sdk.adv.showRewardedVideo({callbacks:{onRewarded:()=>{if(rewarded)return;rewarded=true;save.petRewardedAdsToday++;save.petFoodInventory.cookie=(save.petFoodInventory.cookie||0)+1;addPetPoints(2);persist();renderPet();showToast("Печенье получено: +2 лапки");},onClose:()=>{adPaused=false;if(!rewarded)showToast("Награда выдаётся после полного просмотра");},onError:()=>{adPaused=false;showToast("Видео недоступно — прогресс сохранён");}}});}

function renderSetup() {
  const mode = MODES[selectedMode];
  $("#setupTitle").textContent = mode.title;
  $("#setupDescription").textContent = mode.description;
  $("#setupArt").src = mode.art;
  $("#setupArt").alt = mode.title;
  setupOpponent = save.opponentByMode[selectedMode] || save.lastOpponentType || "bot";
  setupDifficulty = save.difficultyByMode[selectedMode] || "medium";
  $$('[data-opponent]').forEach(btn => btn.classList.toggle("is-selected", btn.dataset.opponent === setupOpponent));
  $$('[data-difficulty]').forEach(btn => btn.classList.toggle("is-selected", btn.dataset.difficulty === setupDifficulty));
  $("#difficultyGroup").hidden = setupOpponent === "friend";
  renderThemeChips();
}

function chooseMode(mode) {
  if (!(mode in MODES)) return;
  selectedMode = mode; save.lastSelectedMode = mode; persist(); renderSetup(); showScreen("setup");
}

function startFromSetup() {
  save.lastSelectedMode = selectedMode; save.lastOpponentType = setupOpponent;
  save.opponentByMode[selectedMode] = setupOpponent; save.difficultyByMode[selectedMode] = setupDifficulty; persist();
  sessionScore = { X:0, O:0, draws:0 };
  const saved = save.unfinished[selectedMode];
  if ((selectedMode === "strategic" || selectedMode === "infinite") && validateUnfinished(saved, selectedMode)) {
    openModal(`<h2 id="modalTitle">Продолжить партию?</h2><p>Найдена незавершённая партия в режиме «${MODES[selectedMode].title}».</p><div class="modal-actions two"><button class="secondary-btn" data-resume="fresh">Начать заново</button><button class="primary-btn" data-resume="continue">Продолжить</button></div>`, { dismissible:false });
    return;
  }
  launchMatch(false);
}

function validateUnfinished(data, mode) {
  if (!data || data.mode !== mode || data.finished) return false;
  if (mode === "strategic") return Array.isArray(data.boards) && data.boards.length === 9 && data.boards.every(b => Array.isArray(b) && b.length === 9 && b.every(v => ["","X","O"].includes(v))) && Array.isArray(data.miniStatus) && data.miniStatus.length === 9 && data.miniStatus.every(v => ["","X","O","D"].includes(v));
  if (mode === "infinite") return Array.isArray(data.moves) && data.moves.length > 0 && data.moves.length <= 1200 && data.moves.every(pair => Array.isArray(pair) && pair.length === 2 && /^-?\d+,-?\d+$/.test(pair[0]) && ["X","O"].includes(pair[1]));
  return false;
}

function launchMatch(resume) {
  closeModal(); clearTimeout(botTimer); botThinking = false; inputLocked = false;
  if (resume) { game = restoreGame(save.unfinished[selectedMode]); setupOpponent = game.opponent; setupDifficulty = game.difficulty; }
  else game = createGame(selectedMode, setupOpponent, setupDifficulty);
  $("#gameScreen").classList.toggle("is-infinite", selectedMode === "infinite");
  $("#gameTitle").textContent = MODES[selectedMode].title;
  $("#modeHint").textContent = MODES[selectedMode].hint;
  showScreen("game"); renderGame(); startGameplay();
  const tutorialKey = `${selectedMode}TutorialCompleted`;
  if (selectedMode !== "classic" && !save[tutorialKey]) {
    save[tutorialKey] = true; persist(); setTimeout(() => showRules(selectedMode), 220);
  } else if (game.turn === "O" && game.opponent === "bot") scheduleBot();
}

function createGame(mode, opponent, difficulty) {
  const common = { mode, opponent, difficulty, turn:"X", finished:false, moveCount:0, winningLine:null, result:null };
  if (mode === "classic") return { ...common, board:Array(9).fill("") };
  if (mode === "disappearing") return { ...common, board:Array(9).fill(""), queues:{ X:[], O:[] } };
  if (mode === "strategic") return { ...common, boards:Array.from({length:9},()=>Array(9).fill("")), miniStatus:Array(9).fill(""), activeMini:null, winningMinis:null };
  return { ...common, moves:new Map(), zoom:1, offsetX:null, offsetY:null, lastMove:null, winCoords:null, saveCapped:false };
}

function restoreGame(data) {
  if (data.mode === "strategic") return { ...data, boards:data.boards.map(b => [...b]), miniStatus:[...data.miniStatus], winningMinis:null, result:null };
  const restored = { ...data, moves:new Map(data.moves), winCoords:null, result:null };
  restored.offsetX = Number.isFinite(data.offsetX) ? data.offsetX : null;
  restored.offsetY = Number.isFinite(data.offsetY) ? data.offsetY : null;
  return restored;
}

function serializeCurrentGame() {
  if (!game || game.finished) return null;
  if (game.mode === "strategic") return { mode:game.mode, opponent:game.opponent, difficulty:game.difficulty, turn:game.turn, finished:false, moveCount:game.moveCount, boards:game.boards, miniStatus:game.miniStatus, activeMini:game.activeMini };
  if (game.mode === "infinite" && game.moves.size <= 1200) return { mode:game.mode, opponent:game.opponent, difficulty:game.difficulty, turn:game.turn, finished:false, moveCount:game.moveCount, moves:[...game.moves], zoom:game.zoom, offsetX:game.offsetX, offsetY:game.offsetY, lastMove:game.lastMove };
  return null;
}

function saveUnfinished() {
  if (!game || (game.mode !== "strategic" && game.mode !== "infinite")) return;
  const serialized = serializeCurrentGame();
  save.unfinished[game.mode] = serialized;
  if (game.mode === "infinite" && !serialized && !game.finished && !game.saveCapped) { game.saveCapped = true; showToast("Достигнут лимит сохранения этой партии"); }
  persist();
}

function currentSymbols() { return { X:selectedTheme().symbols[0], O:selectedTheme().symbols[1] }; }
function symbolFor(player) { return currentSymbols()[player]; }
function check3(board) { for (const line of WIN3) if (board[line[0]] && board[line[0]] === board[line[1]] && board[line[0]] === board[line[2]]) return { winner:board[line[0]], line }; return null; }

function renderGame() {
  if (!game) return;
  renderScore(); renderTurn();
  if (game.mode === "classic" || game.mode === "disappearing") renderClassicLike();
  else if (game.mode === "strategic") renderStrategic();
  else { boardHost.innerHTML = ""; requestAnimationFrame(() => { resizeCanvas(); drawInfinite(); }); }
}

function renderScore() {
  const symbols = currentSymbols();
  const left = game.opponent === "bot" ? "Вы" : "Игрок 1";
  const right = game.opponent === "bot" ? "Компьютер" : "Игрок 2";
  let extraLabel = "Ничьи", extraValue = sessionScore.draws;
  if (game.mode === "disappearing") { extraLabel = "Серия"; extraValue = save.disappearingCurrentStreak; }
  $("#scoreStrip").innerHTML = `<div class="score-pill${game.turn === "X" ? " is-turn" : ""}"><span class="token-mini">${symbols.X}</span><span>${left}: ${sessionScore.X}</span></div><div class="score-pill"><span>${extraLabel}: ${extraValue}</span></div><div class="score-pill${game.turn === "O" ? " is-turn" : ""}"><span>${right}: ${sessionScore.O}</span><span class="token-mini">${symbols.O}</span></div>`;
}

function renderTurn() {
  const text = game.finished ? "Партия завершена" : botThinking ? "Компьютер думает" : game.opponent === "bot" && game.turn === "X" ? `Ваш ход: ${symbolFor("X")}` : `Ход: ${symbolFor(game.turn)}`;
  $("#turnChip").textContent = text;
  $("#gameScreen").classList.toggle("is-thinking", botThinking);
}

function renderClassicLike() {
  const oldest = game.mode === "disappearing" ? { X:game.queues.X.length === 3 ? game.queues.X[0] : -1, O:game.queues.O.length === 3 ? game.queues.O[0] : -1 } : { X:-1,O:-1 };
  boardHost.innerHTML = `<div class="classic-board" role="grid" aria-label="Поле ${MODES[game.mode].title}">${game.board.map((value,index) => {
    const classes = ["game-cell",value ? "has-token" : "",game.winningLine?.includes(index) ? "is-winning" : "",oldest[value] === index ? "is-oldest" : ""].filter(Boolean).join(" ");
    const disabled = value || game.finished || botThinking || inputLocked;
    return `<button class="${classes}" type="button" data-cell="${index}" data-player="${value}" ${disabled ? "disabled" : ""} aria-label="Клетка ${index+1}${value ? `, ${value}` : ""}">${value ? `<span class="token">${symbolFor(value)}</span>` : ""}</button>`;
  }).join("")}</div>`;
}

function renderStrategic() {
  const freeChoice = game.activeMini === null;
  boardHost.innerHTML = `<div class="strategic-board" role="grid" aria-label="Стратегическое поле из девяти малых полей">${game.boards.map((board,mini) => {
    const status = game.miniStatus[mini]; const active = !status && (freeChoice || game.activeMini === mini);
    const miniClasses = ["mini-board", active ? "is-active" : (!status ? "is-inactive" : ""), game.winningMinis?.includes(mini) ? "is-winning" : ""].filter(Boolean).join(" ");
    let cells = board.map((value,cell) => `<button class="mini-cell" type="button" data-mini="${mini}" data-mini-cell="${cell}" data-player="${value}" ${(!active || value || game.finished || botThinking || inputLocked) ? "disabled" : ""} aria-label="Малое поле ${mini+1}, клетка ${cell+1}">${value ? symbolFor(value) : ""}</button>`).join("");
    if (status) cells += `<div class="mini-owner ${status === "X" ? "x" : status === "O" ? "o" : "draw"}">${status === "D" ? "•" : symbolFor(status)}</div>`;
    return `<div class="${miniClasses}" data-mini-board="${mini}">${cells}</div>`;
  }).join("")}</div>`;
}

function makeClassicMove(index) {
  if (!game || !["classic","disappearing"].includes(game.mode) || game.board[index] || game.finished || botThinking || inputLocked) return invalidTap();
  const player = game.turn;
  if (game.mode === "disappearing" && game.queues[player].length >= 3) {
    const oldest = game.queues[player].shift(); inputLocked = true;
    const el = $(`[data-cell="${oldest}"]`); el?.classList.add("is-removing");
    setTimeout(() => { game.board[oldest] = ""; placeClassicToken(index, player); inputLocked = false; }, 250);
  } else placeClassicToken(index, player);
}

function placeClassicToken(index, player) {
  game.board[index] = player; game.moveCount++;
  if (game.mode === "disappearing") game.queues[player].push(index);
  playSound(player === "X" ? "move1" : "move2"); vibrate(18);
  const win = check3(game.board);
  if (win) { game.winningLine = win.line; renderGame(); finishGame(win.winner); return; }
  if (game.mode === "classic" && game.board.every(Boolean)) { renderGame(); finishGame("draw"); return; }
  if (game.mode === "disappearing" && game.moveCount >= 60) { renderGame(); finishGame("long"); return; }
  game.turn = player === "X" ? "O" : "X"; renderGame(); if (game.turn === "O" && game.opponent === "bot") scheduleBot();
}

function validClassicMoves() { return game.board.map((v,i) => v ? -1 : i).filter(i => i >= 0); }
function immediateMove(board, player) {
  for (let i=0;i<board.length;i++) if (!board[i]) { board[i]=player; const win=check3(board); board[i]=""; if (win) return i; }
  return -1;
}

function minimax(board, maximizing) {
  const result = check3(board); if (result) return result.winner === "O" ? 10 : -10;
  if (board.every(Boolean)) return 0;
  let best = maximizing ? -Infinity : Infinity;
  for (let i=0;i<9;i++) if (!board[i]) { board[i]=maximizing ? "O" : "X"; const score=minimax(board,!maximizing); board[i]=""; best=maximizing ? Math.max(best,score) : Math.min(best,score); }
  return best;
}

function chooseClassicBot() {
  const valid = validClassicMoves(); if (!valid.length) return -1;
  const win = immediateMove(game.board,"O"); if (win >= 0) return win;
  if (game.difficulty === "easy" && Math.random() < .72) return valid[Math.floor(Math.random()*valid.length)];
  const block = immediateMove(game.board,"X"); if (block >= 0) return block;
  if (game.mode === "disappearing") {
    const preferred = [4,0,2,6,8,1,3,5,7].filter(i => !game.board[i]);
    return preferred[Math.floor(Math.random()*Math.min(preferred.length,game.difficulty === "hard" ? 3 : 6))] ?? valid[0];
  }
  if (game.difficulty === "medium") return game.board[4] ? valid[Math.floor(Math.random()*valid.length)] : 4;
  let best=-Infinity, moves=[];
  for (const i of valid) { game.board[i]="O"; const score=minimax(game.board,false); game.board[i]=""; if (score>best) {best=score;moves=[i];} else if(score===best)moves.push(i); }
  return moves[Math.floor(Math.random()*moves.length)];
}

function makeStrategicMove(mini, cell) {
  if (!game || game.mode !== "strategic" || game.finished || botThinking || inputLocked || game.miniStatus[mini] || game.boards[mini][cell] || (game.activeMini !== null && game.activeMini !== mini)) return invalidTap();
  const player = game.turn; game.boards[mini][cell] = player; game.moveCount++;
  playSound(player === "X" ? "move1" : "move2"); vibrate(16);
  const localWin = check3(game.boards[mini]);
  if (localWin) game.miniStatus[mini] = player;
  else if (game.boards[mini].every(Boolean)) game.miniStatus[mini] = "D";
  const meta = game.miniStatus.map(v => v === "D" ? "" : v); const globalWin = check3(meta);
  if (globalWin) { game.winningMinis = globalWin.line; renderGame(); finishGame(player); return; }
  if (game.miniStatus.every(Boolean)) { renderGame(); finishGame("draw"); return; }
  game.activeMini = game.miniStatus[cell] ? null : cell;
  game.turn = player === "X" ? "O" : "X"; saveUnfinished(); renderGame();
  if (game.turn === "O" && game.opponent === "bot") scheduleBot();
}

function strategicValidMoves() {
  const minis = game.activeMini !== null && !game.miniStatus[game.activeMini] ? [game.activeMini] : game.miniStatus.map((v,i)=>v ? -1 : i).filter(i=>i>=0);
  const out=[]; for (const mini of minis) for (let cell=0;cell<9;cell++) if (!game.boards[mini][cell]) out.push([mini,cell]); return out;
}

function chooseStrategicBot() {
  const valid=strategicValidMoves(); if(!valid.length)return null;
  let best=-Infinity, choices=[];
  for (const [mini,cell] of valid) {
    let score=Math.random(); const board=game.boards[mini];
    board[cell]="O"; const local=check3(board); board[cell]="";
    if(local) { score+=100; const meta=game.miniStatus.map(v=>v==="D"?"":v); meta[mini]="O"; if(check3(meta))score+=10000; }
    board[cell]="X"; if(check3(board))score+=game.difficulty==="hard"?85:45; board[cell]="";
    if(cell===4)score+=12; if([0,2,6,8].includes(cell))score+=5;
    if(game.miniStatus[cell])score+=8; else if(game.difficulty==="hard")score-=game.boards[cell].filter(v=>v==="X").length*3;
    if(game.difficulty==="easy" && Math.random()<.75)score=Math.random()*30;
    if(score>best){best=score;choices=[[mini,cell]];}else if(score===best)choices.push([mini,cell]);
  }
  return choices[Math.floor(Math.random()*choices.length)];
}

function resizeCanvas() {
  if (!game || game.mode !== "infinite") return;
  const rect=canvas.getBoundingClientRect(); const dpr=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}
  if(game.offsetX===null){game.offsetX=rect.width/2-26;game.offsetY=rect.height/2-26;}
}

function drawInfinite() {
  if (!game || game.mode !== "infinite") return;
  resizeCanvas(); const rect=canvas.getBoundingClientRect(); const dpr=Math.min(devicePixelRatio||1,2); const cell=52*game.zoom;
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,rect.width,rect.height);
  const bg=ctx.createLinearGradient(0,0,rect.width,rect.height); bg.addColorStop(0,"#f9fbff");bg.addColorStop(1,"#e4e9ff");ctx.fillStyle=bg;ctx.fillRect(0,0,rect.width,rect.height);
  const startX=Math.floor(-game.offsetX/cell)-1,endX=Math.ceil((rect.width-game.offsetX)/cell)+1,startY=Math.floor(-game.offsetY/cell)-1,endY=Math.ceil((rect.height-game.offsetY)/cell)+1;
  ctx.lineWidth=1;ctx.strokeStyle="rgba(92,101,190,.22)";ctx.beginPath();
  for(let x=startX;x<=endX;x++){const px=game.offsetX+x*cell;ctx.moveTo(px,0);ctx.lineTo(px,rect.height);}for(let y=startY;y<=endY;y++){const py=game.offsetY+y*cell;ctx.moveTo(0,py);ctx.lineTo(rect.width,py);}ctx.stroke();
  if(game.winCoords?.length){const a=game.winCoords[0],b=game.winCoords[game.winCoords.length-1];ctx.strokeStyle="#ffd43b";ctx.lineWidth=Math.max(7,cell*.13);ctx.lineCap="round";ctx.shadowColor="#ffcc24";ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(game.offsetX+(a[0]+.5)*cell,game.offsetY+(a[1]+.5)*cell);ctx.lineTo(game.offsetX+(b[0]+.5)*cell,game.offsetY+(b[1]+.5)*cell);ctx.stroke();ctx.shadowBlur=0;}
  const symbols=currentSymbols();ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`900 ${Math.max(20,cell*.65)}px "Segoe UI Emoji",sans-serif`;
  for(const [key,player] of game.moves){const [x,y]=key.split(",").map(Number);const px=game.offsetX+(x+.5)*cell,py=game.offsetY+(y+.5)*cell;if(px<-cell||py<-cell||px>rect.width+cell||py>rect.height+cell)continue;ctx.fillStyle=player==="X"?"#158fdf":"#f35b8c";ctx.shadowColor=player==="X"?"rgba(24,155,240,.35)":"rgba(255,85,143,.35)";ctx.shadowBlur=8;ctx.fillText(symbols[player],px,py);}
  ctx.shadowBlur=0;
}

function infiniteCoordsAt(clientX,clientY){const rect=canvas.getBoundingClientRect(),cell=52*game.zoom;return [Math.floor((clientX-rect.left-game.offsetX)/cell),Math.floor((clientY-rect.top-game.offsetY)/cell)];}
function infiniteWinAt(x,y,player,moves=game.moves){
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){const line=[[x,y]];for(const sign of [-1,1])for(let n=1;n<8;n++){const p=[x+dx*n*sign,y+dy*n*sign];if(moves.get(`${p[0]},${p[1]}`)!==player)break;if(sign<0)line.unshift(p);else line.push(p);}if(line.length>=5)return line;}
  return null;
}

function makeInfiniteMove(x,y) {
  if (!game || game.mode!=="infinite" || game.finished || botThinking || inputLocked) return invalidTap();
  const key=`${x},${y}`;if(game.moves.has(key))return invalidTap();const player=game.turn;game.moves.set(key,player);game.lastMove=[x,y];game.moveCount++;playSound(player==="X"?"move1":"move2");vibrate(16);
  const win=infiniteWinAt(x,y,player);if(win){game.winCoords=win;centerInfiniteOn(win[Math.floor(win.length/2)]);drawInfinite();finishGame(player);return;}
  game.turn=player==="X"?"O":"X";saveUnfinished();renderGame();if(game.turn==="O"&&game.opponent==="bot")scheduleBot();
}

function infiniteCandidates() {
  if(!game.moves.size)return [[0,0]];const set=new Set();for(const key of game.moves.keys()){const [x,y]=key.split(",").map(Number);for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){if(!dx&&!dy)continue;const k=`${x+dx},${y+dy}`;if(!game.moves.has(k))set.add(k);}}return [...set].slice(0,900).map(k=>k.split(",").map(Number));
}

function linePotential(x,y,player) { let score=0;const temp=new Map(game.moves);temp.set(`${x},${y}`,player);for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let count=1,open=0;for(const sign of [-1,1]){let n=1;for(;n<5;n++){const value=temp.get(`${x+dx*n*sign},${y+dy*n*sign}`);if(value===player)count++;else{if(!value)open++;break;}}}score+=count*count*8+open*2;}return score;}
function chooseInfiniteBot(){const candidates=infiniteCandidates();if(!candidates.length)return null;for(const p of candidates){game.moves.set(`${p[0]},${p[1]}`,"O");const win=infiniteWinAt(p[0],p[1],"O");game.moves.delete(`${p[0]},${p[1]}`);if(win)return p;}if(game.difficulty!=="easy")for(const p of candidates){game.moves.set(`${p[0]},${p[1]}`,"X");const win=infiniteWinAt(p[0],p[1],"X");game.moves.delete(`${p[0]},${p[1]}`);if(win)return p;}if(game.difficulty==="easy")return candidates[Math.floor(Math.random()*candidates.length)];let best=-Infinity,choice=candidates[0];for(const p of candidates){const score=linePotential(p[0],p[1],"O")+(game.difficulty==="hard"?linePotential(p[0],p[1],"X")*.8:0)+Math.random()*3;if(score>best){best=score;choice=p;}}return choice;}

function scheduleBot(){clearTimeout(botTimer);if(!game||game.finished||game.opponent!=="bot"||game.turn!=="O"||document.hidden||adPaused)return;botThinking=true;renderGame();botTimer=setTimeout(()=>{if(!game||game.finished||game.turn!=="O"||adPaused){botThinking=false;renderGame();return;}botThinking=false;if(game.mode==="classic"||game.mode==="disappearing"){const move=chooseClassicBot();if(move>=0)makeClassicMove(move);}else if(game.mode==="strategic"){const move=chooseStrategicBot();if(move)makeStrategicMove(move[0],move[1]);}else{const move=chooseInfiniteBot();if(move)makeInfiniteMove(move[0],move[1]);}},280+Math.random()*180);}

function finishGame(result){if(!game||game.finished)return;game.finished=true;game.result=result;botThinking=false;clearTimeout(botTimer);if(game.mode==="strategic"||game.mode==="infinite"){save.unfinished[game.mode]=null;}
  const stats=save[`${game.mode}Stats`];stats.played++;save.totalGamesPlayed++;
  if(result==="draw"||result==="long"){sessionScore.draws++;stats.draws++;save.totalDraws++;}
  else{sessionScore[result]++;if(result==="X")stats.wins++;else stats.losses++;if(game.opponent==="bot"){if(result==="X"){save.totalWinsAgainstBot++;if(game.mode==="disappearing"){save.disappearingCurrentStreak++;save.disappearingBestStreak=Math.max(save.disappearingBestStreak,save.disappearingCurrentStreak);}}else{save.totalLossesAgainstBot++;if(game.mode==="disappearing")save.disappearingCurrentStreak=0;}}}
  completedSinceAd++;awardPetMatch(result);evaluateUnlocks();persist();renderGame();playSound(result==="X"||game.opponent==="friend"?"win":result==="O"?"lose":"draw");if(result!=="draw"&&result!=="long")vibrate([40,35,70]);setTimeout(showResult,420);
}

function resultPresentation(){const result=game.result;if(result==="long")return{title:"Партия затянулась",text:"60 ходов без победы. Серия сохранена.",primary:"Сыграть ещё раз"};if(result==="draw")return{title:"Ничья",text:"Силы оказались равны.",primary:"Сыграть ещё раз"};if(game.opponent==="friend")return{title:"Победа!",text:`Игрок ${symbolFor(result)} собрал победную линию.`,primary:"Следующий матч"};if(result==="X")return{title:"Победа!",text:"Отличная партия — компьютер побеждён.",primary:"Следующий матч"};return{title:"Поражение",text:"Компьютер оказался сильнее. Время для реванша!",primary:"Реванш"};}
function showResult(){const p=resultPresentation(),stats=save[`${game.mode}Stats`];openModal(`<img class="confetti" src="assets/effects/${game.result==="X"||game.opponent==="friend"?"confetti-burst":"sparkle-cluster"}.png" alt=""><img class="modal-hero" src="${game.result==="X"||game.opponent==="friend"?"assets/decorations/trophy.png":"assets/avatars/robot.png"}" alt=""><h2 id="modalTitle">${p.title}</h2><p>${p.text}</p><div class="result-stats"><div class="result-stat">Победы<b>${stats.wins}</b></div><div class="result-stat">Серия<b>${save.disappearingCurrentStreak}</b></div><div class="result-stat">Рекорд<b>${save.disappearingBestStreak}</b></div></div>${nextThemeProgressHtml()}<div class="modal-actions"><button class="primary-btn" data-result="next">${p.primary}</button><button class="secondary-btn" data-result="restart">Заново</button><button class="secondary-btn" data-result="menu">В меню</button></div>`,{dismissible:false});}
function nextThemeProgressHtml(){const next=THEMES.find(t=>!save.unlockedThemes.includes(t.id));if(!next)return"";const p=themeProgress(next.id);return`<p style="margin-bottom:4px">До темы «${next.name}»</p><div class="progress-bar"><span style="width:${p.value*100}%"></span></div><p style="margin-top:4px;font-size:12px">${p.label}</p>`;}

function afterResult(action){const done=()=>{if(action==="menu"){closeModal();showScreen("modes");maybeShowAd();}else{closeModal();game=createGame(selectedMode,setupOpponent,setupDifficulty);renderGame();startGameplay();if(game.turn==="O"&&game.opponent==="bot")scheduleBot();}};showUnlockSequence(done);}
function showUnlockSequence(done){const id=pendingUnlocks.shift();if(!id){done();return;}const theme=THEMES.find(t=>t.id===id);save.shownThemeUnlocks.push(id);persist();playSound("unlock");openModal(`<img class="confetti" src="assets/effects/confetti-burst.png" alt=""><h2 id="modalTitle">Новая тема открыта!</h2><div class="unlock-card"><img src="${theme.cover}" alt="${theme.name}"><h3>${theme.name}</h3><p>${theme.symbols.join("  против  ")}</p></div><div class="modal-actions two"><button class="secondary-btn" data-unlock="continue">Продолжить</button><button class="primary-btn" data-unlock="use" data-theme-id="${id}">Использовать</button></div>`,{dismissible:false});modal.dataset.unlockDone="pending";modal._unlockDone=()=>showUnlockSequence(done);}

function restartCurrent(confirm=false){if(!game)return;const restart=()=>{closeModal();if(game.mode==="strategic"||game.mode==="infinite")save.unfinished[game.mode]=null;game=createGame(selectedMode,setupOpponent,setupDifficulty);persist();renderGame();if(game.turn==="O"&&game.opponent==="bot")scheduleBot();};if(confirm&&!game.finished&&game.moveCount>0)openModal(`<h2 id="modalTitle">Начать заново?</h2><p>Текущий ход партии будет потерян.</p><div class="modal-actions two"><button class="secondary-btn" data-modal="close">Отмена</button><button class="primary-btn" data-confirm-restart>Заново</button></div>`);else restart();modal._restart=restart;}
function requestLeave(target="modes"){if(!game||game.finished||game.moveCount===0){showScreen(target);return;}saveUnfinished();openModal(`<h2 id="modalTitle">Выйти из партии?</h2><p>${game.mode==="strategic"||game.mode==="infinite"?"Партия сохранена — её можно продолжить позже.":"Текущая партия будет завершена без результата."}</p><div class="modal-actions two"><button class="secondary-btn" data-modal="close">Остаться</button><button class="primary-btn" data-leave="${target}">Выйти</button></div>`);}

function showRules(mode=selectedMode){const steps=RULES[mode]||RULES.classic;openModal(`<img class="modal-hero" src="${MODES[mode].art}" alt=""><h2 id="modalTitle">${MODES[mode].title}</h2><ol class="rules-steps">${steps.map(s=>`<li>${s}</li>`).join("")}</ol><div class="modal-actions"><button class="primary-btn" data-modal="close">Понятно</button></div>`);}
function showSettings(){openModal(`<h2 id="modalTitle">Настройки</h2><div class="setting-list"><div class="setting-row"><span>Музыка</span><button class="switch" type="button" role="switch" data-setting="musicEnabled" aria-checked="${save.musicEnabled}" aria-label="Музыка"></button></div><div class="setting-row"><span>Звуки</span><button class="switch" type="button" role="switch" data-setting="soundEnabled" aria-checked="${save.soundEnabled}" aria-label="Звуки"></button></div><div class="setting-row"><span>Вибрация</span><button class="switch" type="button" role="switch" data-setting="vibrationEnabled" aria-checked="${save.vibrationEnabled}" aria-label="Вибрация"></button></div></div><div class="modal-actions"><button class="secondary-btn" data-action-modal="rules">Правила текущего режима</button><button class="secondary-btn" data-action-modal="reset">Сбросить прогресс</button><button class="primary-btn" data-modal="close">Готово</button></div>`);}
function confirmReset(){openModal(`<h2 id="modalTitle">Удалить прогресс?</h2><p>Удалить весь прогресс и открытые темы?</p><div class="modal-actions two"><button class="secondary-btn" data-action-modal="settings">Отмена</button><button class="primary-btn" data-reset-confirm>Удалить</button></div>`,{dismissible:false});}

function openModal(html, options={}){modal.innerHTML=html;modalLayer.classList.add("is-open");modalLayer.setAttribute("aria-hidden","false");modalLayer.dataset.dismissible=options.dismissible===false?"false":"true";stopGameplay();setTimeout(()=>$("button",modal)?.focus(),20);}
function closeModal(){modalLayer.classList.remove("is-open");modalLayer.setAttribute("aria-hidden","true");modal.innerHTML="";if(currentScreen==="game"&&!adPaused){startGameplay();if(game?.turn==="O"&&game.opponent==="bot"&&!game.finished)scheduleBot();}}
function showToast(message){clearTimeout(toastTimer);const toast=$("#toast");toast.textContent=message;toast.classList.add("is-visible");toastTimer=setTimeout(()=>toast.classList.remove("is-visible"),2200);}
function invalidTap(){playSound("error");vibrate(25);}

function ensureAudio(){if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==="suspended")audioContext.resume().catch(()=>{});if(save.musicEnabled&&!document.hidden&&!adPaused)startMusic();}
function playSound(kind){if(!save.soundEnabled||document.hidden||adPaused)return;try{ensureAudio();const now=audioContext.currentTime;const osc=audioContext.createOscillator(),gain=audioContext.createGain();const tones={click:[330,.035,"sine"],move1:[520,.08,"sine"],move2:[390,.08,"triangle"],win:[740,.28,"sine"],lose:[180,.3,"sawtooth"],draw:[300,.16,"triangle"],unlock:[880,.34,"sine"],error:[120,.06,"square"]};const [freq,dur,type]=tones[kind]||tones.click;osc.type=type;osc.frequency.setValueAtTime(freq,now);if(kind==="win"||kind==="unlock")osc.frequency.exponentialRampToValueAtTime(freq*1.7,now+dur);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.08,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+dur);osc.connect(gain).connect(audioContext.destination);osc.start(now);osc.stop(now+dur+.02);}catch(_){/* Audio is optional. */}}
function startMusic(){if(musicNodes||!audioContext||!save.musicEnabled||document.hidden||adPaused)return;const gain=audioContext.createGain();gain.gain.value=.008;const a=audioContext.createOscillator(),b=audioContext.createOscillator();a.type="sine";b.type="sine";a.frequency.value=110;b.frequency.value=164.81;a.connect(gain);b.connect(gain);gain.connect(audioContext.destination);a.start();b.start();musicNodes={a,b,gain};}
function stopMusic(){if(!musicNodes)return;try{musicNodes.a.stop();musicNodes.b.stop();}catch(_){}musicNodes=null;}
function vibrate(pattern){if(save.vibrationEnabled&&navigator.vibrate)navigator.vibrate(pattern);}
function startGameplay(){if(adPaused)return;try{sdk?.features?.GameplayAPI?.start?.();}catch(_){}if(save.musicEnabled&&!document.hidden){ensureAudio();startMusic();}}
function stopGameplay(){try{sdk?.features?.GameplayAPI?.stop?.();}catch(_){}stopMusic();}

async function initYandex(){const isPlatform=/yandex|yagame|games/i.test(location.hostname);if(!isPlatform&&!window.YaGames)return;try{if(!window.YaGames)await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="/sdk.js";s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});sdk=await window.YaGames.init();sdk.features?.LoadingAPI?.ready?.();}catch(_){sdk=null;}}
function maybeShowAd(){if(!sdk?.adv?.showFullscreenAdv||completedSinceAd<3||adPaused)return;completedSinceAd=0;adPaused=true;stopGameplay();clearTimeout(botTimer);sdk.adv.showFullscreenAdv({callbacks:{onClose:()=>{adPaused=false;if(currentScreen==="game")startGameplay();},onError:()=>{adPaused=false;if(currentScreen==="game")startGameplay();}}});}

function centerInfiniteOn(coord=game.lastMove){if(!game||game.mode!=="infinite")return;const rect=canvas.getBoundingClientRect(),cell=52*game.zoom;const p=coord||[0,0];game.offsetX=rect.width/2-(p[0]+.5)*cell;game.offsetY=rect.height/2-(p[1]+.5)*cell;drawInfinite();}
function zoomInfinite(factor){if(!game||game.mode!=="infinite")return;const rect=canvas.getBoundingClientRect(),cx=rect.width/2,cy=rect.height/2,old=52*game.zoom;const worldX=(cx-game.offsetX)/old,worldY=(cy-game.offsetY)/old;game.zoom=Math.max(.55,Math.min(1.85,game.zoom*factor));const next=52*game.zoom;game.offsetX=cx-worldX*next;game.offsetY=cy-worldY*next;drawInfinite();}

let canvasPointer=null;
canvas.addEventListener("pointerdown",e=>{if(!game||game.mode!=="infinite"||game.finished||botThinking)return;canvas.setPointerCapture(e.pointerId);canvasPointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,offsetX:game.offsetX,offsetY:game.offsetY,moved:false};});
canvas.addEventListener("pointermove",e=>{if(!canvasPointer||canvasPointer.id!==e.pointerId)return;const dx=e.clientX-canvasPointer.startX,dy=e.clientY-canvasPointer.startY;if(Math.hypot(dx,dy)>7)canvasPointer.moved=true;if(canvasPointer.moved){game.offsetX=canvasPointer.offsetX+dx;game.offsetY=canvasPointer.offsetY+dy;drawInfinite();}});
canvas.addEventListener("pointerup",e=>{if(!canvasPointer||canvasPointer.id!==e.pointerId)return;const wasDrag=canvasPointer.moved;canvasPointer=null;if(!wasDrag){const [x,y]=infiniteCoordsAt(e.clientX,e.clientY);makeInfiniteMove(x,y);}});
canvas.addEventListener("pointercancel",()=>{canvasPointer=null;});
canvas.addEventListener("wheel",e=>{if(!game||game.mode!=="infinite")return;e.preventDefault();zoomInfinite(e.deltaY<0?1.12:.89);},{passive:false});
new ResizeObserver(()=>{if(game?.mode==="infinite")requestAnimationFrame(()=>{resizeCanvas();drawInfinite();});}).observe(canvas);

document.addEventListener("click",event=>{const button=event.target.closest("button");if(!button||button.disabled)return;ensureAudio();
  if(button.id==="playBtn"){showScreen("modes");return;}
  if(button.dataset.theme){selectTheme(button.dataset.theme);return;}
  if(button.dataset.mode){chooseMode(button.dataset.mode);return;}
  if(button.dataset.opponent){setupOpponent=button.dataset.opponent;$$('[data-opponent]').forEach(b=>b.classList.toggle("is-selected",b===button));$("#difficultyGroup").hidden=setupOpponent==="friend";return;}
  if(button.dataset.difficulty){setupDifficulty=button.dataset.difficulty;$$('[data-difficulty]').forEach(b=>b.classList.toggle("is-selected",b===button));return;}
  if(button.id==="startMatchBtn"){startFromSetup();return;}
  if(button.dataset.nav){showScreen(button.dataset.nav);return;}
  if(button.dataset.petFood){selectedPetFood=button.dataset.petFood;renderPet();resetPetIdleTimer();return;}
  if(button.dataset.petAccessory){selectPetAccessory(button.dataset.petAccessory);resetPetIdleTimer();return;}
  if(button.dataset.petAction){if(button.dataset.petAction==="feed")feedPet();else if(button.dataset.petAction==="pet")petPet();else if(button.dataset.petAction==="chest")openPetChest();else if(button.dataset.petAction==="rewarded")claimRewardedTreat();return;}
  if(button.dataset.cell!==undefined){makeClassicMove(Number(button.dataset.cell));return;}
  if(button.dataset.mini!==undefined){makeStrategicMove(Number(button.dataset.mini),Number(button.dataset.miniCell));return;}
  if(button.dataset.canvas){if(button.dataset.canvas==="zoom-in")zoomInfinite(1.14);else if(button.dataset.canvas==="zoom-out")zoomInfinite(.87);else centerInfiniteOn();return;}
  if(button.dataset.setting){save[button.dataset.setting]=!save[button.dataset.setting];button.setAttribute("aria-checked",String(save[button.dataset.setting]));persist();if(button.dataset.setting==="musicEnabled"){if(save.musicEnabled)startMusic();else stopMusic();}playSound("click");return;}
  if(button.dataset.modal==="close"){closeModal();return;}
  if(button.dataset.resume){if(button.dataset.resume==="fresh")save.unfinished[selectedMode]=null;persist();launchMatch(button.dataset.resume==="continue");return;}
  if(button.dataset.result){afterResult(button.dataset.result==="menu"?"menu":"next");return;}
  if(button.dataset.unlock){if(button.dataset.unlock==="use"){save.selectedTheme=button.dataset.themeId;persist();renderThemes();}const done=modal._unlockDone;done?.();return;}
  if(button.hasAttribute("data-confirm-restart")){modal._restart?.();return;}
  if(button.dataset.leave){closeModal();showScreen(button.dataset.leave);return;}
  if(button.hasAttribute("data-reset-confirm")){localStorage.removeItem(SAVE_KEY);save=defaultSave();persist();pendingUnlocks=[];renderThemes();closeModal();showScreen("home");showToast("Прогресс удалён");return;}
  if(button.dataset.actionModal==="rules"){showRules(currentScreen==="game"?game.mode:selectedMode);return;}
  if(button.dataset.actionModal==="reset"){confirmReset();return;}
  if(button.dataset.actionModal==="settings"){showSettings();return;}
  const action=button.dataset.action;if(action==="settings")showSettings();else if(action==="leave-game")requestLeave("setup");else if(action==="restart")restartCurrent(true);else if(action==="rules")showRules(game.mode);else if(action==="menu")requestLeave("modes");
});

modalLayer.addEventListener("click",event=>{if(event.target.classList.contains("modal-backdrop")&&modalLayer.dataset.dismissible!=="false")closeModal();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"){if(modalLayer.classList.contains("is-open")&&modalLayer.dataset.dismissible!=="false")closeModal();else if(currentScreen==="game")requestLeave("setup");else if(currentScreen==="setup")showScreen("modes");else if(currentScreen==="modes"||currentScreen==="pet")showScreen("home");}});
document.addEventListener("visibilitychange",()=>{if(document.hidden){clearTimeout(botTimer);stopGameplay();}else{if(currentScreen==="game"&&!modalLayer.classList.contains("is-open")){startGameplay();if(game?.turn==="O"&&game.opponent==="bot"&&!game.finished)scheduleBot();}}});
window.addEventListener("beforeunload",()=>{saveUnfinished();persist();});
let resizeFrame=0;function handleViewportChange(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(game?.mode==="infinite"){resizeCanvas();drawInfinite();}if(currentScreen==="pet")renderPet();});}
window.addEventListener("resize",handleViewportChange,{passive:true});
window.addEventListener("orientationchange",handleViewportChange,{passive:true});

function initCarouselDrag(){let drag=null,suppressUntil=0;themeCarousel.addEventListener("pointerdown",e=>{drag={id:e.pointerId,x:e.clientX,scroll:themeCarousel.scrollLeft,moved:false};themeCarousel.setPointerCapture(e.pointerId);});themeCarousel.addEventListener("pointermove",e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>6)drag.moved=true;if(drag.moved)themeCarousel.scrollLeft=drag.scroll-dx;});themeCarousel.addEventListener("pointerup",()=>{if(drag?.moved)suppressUntil=performance.now()+120;drag=null;});themeCarousel.addEventListener("click",e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopPropagation();}},true);}

pendingUnlocks.push(...save.unlockedThemes.filter(id => id!=="classic" && !save.shownThemeUnlocks.includes(id)));
renderThemes();renderSetup();renderHomePet();initCarouselDrag();evaluateUnlocks();ensurePetDay(true);persist();initYandex().then(()=>{if(currentScreen==="pet")renderPet();});
requestAnimationFrame(()=>{document.body.dataset.ready="true";if(window.YaGames&&sdk?.features?.LoadingAPI) sdk.features.LoadingAPI.ready();});
