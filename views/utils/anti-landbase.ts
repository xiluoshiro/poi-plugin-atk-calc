import { TattackMode, antilandbaseDB, etJet, etSeaplane, shipTypeCV, shipTypeSS } from "../constants";
import { IshipState, IslotState } from "../types";

export const checkAntiLandbaseFPBefore = (attackPower: number, shipState: IshipState, slotsArray: IslotState[], attackMode: TattackMode, rawAttackMode: TattackMode) => {
  let bonusFP = checkALBShipType(attackPower, shipState);
  if (attackMode !== 'night_aircraft') {
    bonusFP = checkBonusLB(bonusFP, shipState, slotsArray, rawAttackMode, false);
  }
  return bonusFP;
};
export const checkAntiLandbaseFPAfter = (attackPower: number, shipState: IshipState, slotsArray: IslotState[], attackMode: TattackMode, rawAttackMode: TattackMode) => {
  let bonusFP = attackPower;
  bonusFP = checkBonusLB(bonusFP, shipState, slotsArray, rawAttackMode, true);
  return bonusFP;
};

// 史实舰种补正
const checkALBShipType = (attackPower: number, shipState: IshipState) => {
  let bonusFP = attackPower;
  const { enemyType, shipConstInfo, shipInfo } = shipState;
  const stype = shipConstInfo.api_stype;
  const enemy = enemyType || '';

  // SS舰种补正
  if (shipTypeSS.includes(stype)) {
    bonusFP += 30;
  }
  // 轻型舰 炮台补正
  if (enemy === 'anti_landbase_artillery' && [2, 3].includes(stype)) {
    bonusFP *= 1.4;
  }
  // 特定舰补正：赤城、飛龍、蒼龍
  if (enemy === 'anti_landbase_habour_summer' && [83, 27, 594, 599, 91, 196, 280, 90, 197, 279].includes(shipInfo.api_ship_id)) {
    bonusFP *= 1.25;
  }

  return bonusFP;
}

// 阈值前补正
const MultiBonusBeforeCap = {
  aaShell: [{ artillery: 1, isolated_island: 1.75, habour_summer: 1.75, soft_skin: 2.5 }],
  apShell: [{ artillery: 1.85, isolated_island: 1, habour_summer: 1.3, soft_skin: 1 }],
  rocketWG: [{ artillery: 1.6, isolated_island: 1.4, habour_summer: 1.4, soft_skin: 1.3 },
  { artillery: 1.7, isolated_island: 1.5, habour_summer: 1.2, soft_skin: 1.4 }],
  rocketType4: [{ artillery: 1.5, isolated_island: 1.3, habour_summer: 1.25, soft_skin: 1.25 },
  { artillery: 1.8, isolated_island: 1.65, habour_summer: 1.4, soft_skin: 1.5 }],
  aswMortarsType2: [{ artillery: 1.3, isolated_island: 1.2, habour_summer: 1.1, soft_skin: 1.2 },
  { artillery: 1.5, isolated_island: 1.4, habour_summer: 1.15, soft_skin: 1.3 }],
  seaplane: [{ artillery: 1.5, isolated_island: 1, habour_summer: 1.3, soft_skin: 1.2 }],
  bomber: [{ artillery: 1.5, isolated_island: 1.4, habour_summer: 1.3, soft_skin: 1 },
  { artillery: 2, isolated_island: 1.75, habour_summer: 1.2, soft_skin: 1 }],
  landingCraftAll: [{ artillery: 1.8, isolated_island: 1.8, habour_summer: 1.7, soft_skin: 1.4 }],
  craftEx: [{ artillery: 1.15, isolated_island: 1.15, habour_summer: 1.2, soft_skin: 1.15 }],
  craftType89: [{ artillery: 1.5, isolated_island: 1.2, habour_summer: 1.6, soft_skin: 1.5 },
  { artillery: 1.4, isolated_island: 1.4, habour_summer: 1.5, soft_skin: 1.3 }],
  craftArmed: [{ artillery: 1.3, isolated_island: 1.3, habour_summer: 1.5, soft_skin: 1.1 },
  { artillery: 1.2, isolated_island: 1.1, habour_summer: 1.1, soft_skin: 1.1 }],
  m4a1dd: [{ artillery: 2, isolated_island: 1.8, habour_summer: 2, soft_skin: 1.1 }],
  amphibiousTanksType2: [{ artillery: 2.4, isolated_island: 2.4, habour_summer: 2.8, soft_skin: 1.5 },
  { artillery: 1.35, isolated_island: 1.35, habour_summer: 1.5, soft_skin: 1.2 }],
};
const PlusBonusBeforeCap = {
  rocketWG: [75, 110, 140, 160],
  rocketType4: [55, 115, 160, 190],
  rocketType4CD: [80, 170, 230, 260],
  aswMortarsType2: [30, 55, 75, 90],
  aswMortarsType2CD: [60, 110, 150, 180],
}
// 阈值后补正
const MultiBonusAfterCap = {
  aaShell: [{ supply_depot: 1, anchorage_vacances: 1.45, dock: 1.3 }],
  rocketWG: [{ supply_depot: 1.25, anchorage_vacances: 1.2, dock: 1.1 },
  { supply_depot: 1.3, anchorage_vacances: 1.3, dock: 1.2 }],
  rocketType4: [{ supply_depot: 1.2, anchorage_vacances: 1.15, dock: 1.1 },     // 船渠：可能不准
  { supply_depot: 1.4, anchorage_vacances: 1.4, dock: 1.3 }],
  aswMortarsType2: [{ supply_depot: 1.15, anchorage_vacances: 1.1, dock: 1 },   // 船渠：缺乏
  { supply_depot: 1.2, anchorage_vacances: 1.2, dock: 1 }],                     // 迫击炮集中>=2 对泊地不准
  seaplane: [{ supply_depot: 1, anchorage_vacances: 1, dock: 1.1 }],
  bomber: [{ supply_depot: 1, anchorage_vacances: 1.4, dock: 1.1 },
  { supply_depot: 1, anchorage_vacances: 1.75, dock: 1.1 }],                    // 船渠：缺乏喷气
  landingCraftAll: [{ supply_depot: 1.7, anchorage_vacances: 1.4, dock: 1.1 }],
  craftEx: [{ supply_depot: 1.2, anchorage_vacances: 1.15, dock: 1.1 }],        // 船渠：可能不准
  craftType89: [{ supply_depot: 1.3, anchorage_vacances: 1.2, dock: 1.15 },
  { supply_depot: 1.6, anchorage_vacances: 1.4, dock: 1.15 }],
  craftArmed: [{ supply_depot: 1.5, anchorage_vacances: 1.2, dock: 1.1 },
  { supply_depot: 1.1, anchorage_vacances: 1.1, dock: 1.1 }],                   // AB艇>=2 缺乏船渠
  m4a1dd: [{ supply_depot: 1.2, anchorage_vacances: 1.8, dock: 1.1 }],
  craftEx11th: [{ supply_depot: 1, anchorage_vacances: 1, dock: 1.4 }],
  amphibiousTanksType2: [{ supply_depot: 1.7, anchorage_vacances: 2.4, dock: 1.2 },
  { supply_depot: 1.5, anchorage_vacances: 1.35, dock: 1.2 }],
};
const checkBonusLB = (attackPower: number, shipState: IshipState, slotsArray: IslotState[], rawAttackMode: TattackMode, isCap: boolean) => {
  let bonusFP = attackPower;
  const { enemyType, shipConstInfo } = shipState;
  const stype = shipConstInfo.api_stype;
  const enemyBefore = enemyType ? checkLandbaseTypeBefore(enemyType) : '';
  const enemyAfter = enemyType ? checkLandbaseTypeAfter(enemyType) : '';

  let aaShell = 0, apShell = 0, rocketWG = 0, rocketType4 = 0, aswMortarsType2 = 0, seaplane = 0, bomber = 0;
  let landingCraftAll = 0, landingCraftStar = 0, craftEx = 0, craftType89 = 0, craftExType1 = 0, craftExType97 = 0;
  let craftExType97Kai = 0, craftPanzerIINAF = 0, craftArmed = 0, craftAB = 0, m4a1dd = 0, amphibiousTanksAll = 0;
  let craftEx11th = 0, craftExPanzerIIINAF = 0, rocketType4CD = 0, aswMortarsType2CD = 0, amphibiousTanksType2 = 0;
  let amphibiousTanksStar = 0, craft = 0, jet = 0, craftExPanzerIIIJ = 0;

  slotsArray.forEach(slot => {
    const types = slot.constInfo.api_type || {};
    const eqid = slot.info.api_slotitem_id || -1;

    // 装备
    if (types[2] === 18) aaShell++;                   // 対空強化弾
    if (types[2] === 19) apShell++;                   // 対艦強化弾
    if (etSeaplane.includes(types[2])) seaplane++;    // 水上機
    if (types[2] === 7 && !(!isCap && shipTypeCV.includes(stype) && !antilandbaseDB.includes(eqid))) bomber++;  // 艦上爆撃機
    if (types[2] === 24) {                            // 上陸用舟艇
      landingCraftAll++;
      landingCraftStar += slot.info.api_level;
    }
    if (types[2] === 46) {                            // 特型内火艇
      amphibiousTanksAll++;
      amphibiousTanksStar += slot.info.api_level;
    }
    if (etJet.includes(types[2])) jet++;              // 噴式機
    switch (eqid) {
      case 68:    // 大発動艇
        craft++;
        break;
      case 126:   // WG42(Wurfgerät 42)
        rocketWG++;
        break;
      case 166:   // 大発動艇(八九式中戦車&陸戦隊)
        craftType89++;
        break;
      case 167:   // 特二式内火艇
        amphibiousTanksType2++;
        break;
      case 193:   // 特大発動艇
        craftEx++;
        break;
      case 230:   // 特大発動艇+戦車第11連隊
        craftEx11th++;
        break;
      case 346:   // 二式12cm迫撃砲改
        aswMortarsType2++;
        break;
      case 347:   // 二式12cm迫撃砲改 集中配備
        aswMortarsType2CD++;
        break;
      case 348:   // 艦載型 四式20cm対地噴進砲
        rocketType4++;
        break;
      case 349:   // 四式20cm対地噴進砲 集中配備
        rocketType4CD++;
        break;
      case 355:   // M4A1 DD
        m4a1dd++;
        break;
      case 408:   // 装甲艇(AB艇)
        craftAB++;
        break;
      case 409:   // 武装大発
        craftArmed++;
        break;
      case 436:   // 大発動艇(II号戦車/北アフリカ仕様)
        craftPanzerIINAF++;
        break;
      case 449:   // 特大発動艇+一式砲戦車
        craftExType1++;
        break;
      case 482:   // 特大発動艇(III号戦車/北アフリカ仕様)
        craftExPanzerIIINAF++;
        break;
      case 494:   // 特大発動艇+チハ
        craftExType97++;
        break;
      case 495:   // 特大発動艇+チハ改
        craftExType97Kai++;
        break;
      case 514:   // 特大発動艇+III号戦車J型
        craftExPanzerIIIJ++;
        break;
      default:
        break;

    }
  })
  const craftBonus = 1 + (landingCraftStar / landingCraftAll) / 50;
  const tankBonus = 1 + (amphibiousTanksStar / amphibiousTanksAll) / 30;

  // 阈值前乘算补正
  if (!isCap) {
    if (enemyBefore) {
      if (aaShell >= 1) bonusFP *= MultiBonusBeforeCap.aaShell[0][enemyBefore];
      if (apShell >= 1) bonusFP *= MultiBonusBeforeCap.apShell[0][enemyBefore];
      if (rocketWG >= 1) bonusFP *= MultiBonusBeforeCap.rocketWG[0][enemyBefore];
      if (rocketWG >= 2) bonusFP *= MultiBonusBeforeCap.rocketWG[1][enemyBefore];
      if (rocketType4 + rocketType4CD >= 1) bonusFP *= MultiBonusBeforeCap.rocketType4[0][enemyBefore];
      if (rocketType4 + rocketType4CD >= 2) bonusFP *= MultiBonusBeforeCap.rocketType4[1][enemyBefore];
      if (aswMortarsType2 + aswMortarsType2CD >= 1) bonusFP *= MultiBonusBeforeCap.aswMortarsType2[0][enemyBefore];
      if (aswMortarsType2 + aswMortarsType2CD >= 2) bonusFP *= MultiBonusBeforeCap.aswMortarsType2[1][enemyBefore];
      if (seaplane >= 1) bonusFP *= MultiBonusBeforeCap.seaplane[0][enemyBefore];
      if (bomber >= 1) bonusFP *= MultiBonusBeforeCap.bomber[0][enemyBefore];
      if (bomber >= 2) bonusFP *= MultiBonusBeforeCap.bomber[1][enemyBefore];
      if (landingCraftAll >= 1) {
        bonusFP *= craftBonus * MultiBonusBeforeCap.landingCraftAll[0][enemyBefore];
      }
      if (craftEx + craftExPanzerIIINAF + craftExPanzerIIIJ >= 1) bonusFP *= MultiBonusBeforeCap.craftEx[0][enemyBefore];
      if (craftType89 + craftExType1 + craftExPanzerIIINAF + craftExPanzerIIIJ >= 1) bonusFP *= MultiBonusBeforeCap.craftType89[0][enemyBefore];
      if (craftType89 + craftExType1 + craftExType97 + craftExType97Kai + craftExPanzerIIINAF + craftExPanzerIIIJ >= 2) bonusFP *= MultiBonusBeforeCap.craftType89[1][enemyBefore];
      if (craftPanzerIINAF >= 1) bonusFP *= MultiBonusBeforeCap.craftType89[0][enemyBefore];
      if (craftPanzerIINAF >= 2) bonusFP *= MultiBonusBeforeCap.craftType89[1][enemyBefore];
      if (rawAttackMode === 'day_shelling' && (craftArmed + craftAB >= 1)) bonusFP *= MultiBonusBeforeCap.craftArmed[0][enemyBefore];
      if (rawAttackMode === 'day_shelling' && (craftArmed + craftAB >= 2)) bonusFP *= MultiBonusBeforeCap.craftArmed[1][enemyBefore];
      if (m4a1dd + craftExType97Kai + craftExPanzerIIIJ >= 1) bonusFP *= MultiBonusBeforeCap.m4a1dd[0][enemyBefore];
      if (amphibiousTanksType2 >= 1) {
        bonusFP *= tankBonus * MultiBonusBeforeCap.amphibiousTanksType2[0][enemyBefore];
        if (amphibiousTanksType2 >= 2) {
          bonusFP *= MultiBonusBeforeCap.amphibiousTanksType2[1][enemyBefore];
        }
      }
    }

    // 特殊登陆艇补正
    if (craftEx11th + craftExType1 + craftExPanzerIIINAF + craftExPanzerIIIJ >= 1) bonusFP = bonusFP * 1.8 + 25;
    if (m4a1dd >= 1) bonusFP = bonusFP * 1.4 + 35;
    if (craftExType1 >= 1) bonusFP = bonusFP * 1.3 + 42;
    if (craftExType97 >= 1) bonusFP = bonusFP * 1.4 + 28;
    if (craftExType97Kai >= 1) bonusFP = bonusFP * 1.5 + 33;

    // 登陆艇/内火艇套装补正
    const typeA = craftArmed;
    const typeB = craftAB;
    const typeC = craft + craftEx + craftPanzerIINAF + craftExType1;
    const typeD = craftEx11th + craftExPanzerIIINAF + amphibiousTanksType2 + craftExType97 + craftExType97Kai + craftExPanzerIIIJ;    // 假设3j是D分组
    // bug: (A=2且B=0) 或 (A=0且B=2)时，无套装补正
    if (!(typeA === 2 && typeB === 0) && !(typeA === 0 && typeB === 2)) {
      if ((typeA + typeB === 1) && (typeC + typeD >= 1)) {
        bonusFP = bonusFP * 1.2 + 10;
      } else if (typeA >= 1 && typeB >= 1 && typeC === 1 && typeD === 0) {
        bonusFP = bonusFP * 1.3 + 15;
      } else if (typeA >= 1 && typeB >= 1 && typeC === 0 && typeD === 1) {
        bonusFP = bonusFP * 1.4 + 25;
      } else if (typeA >= 1 && typeB >= 1 && (typeC + typeD >= 2)) {
        bonusFP = bonusFP * 1.5 + 25;
      }
    }

    // 加算补正
    if (rocketWG >= 1) bonusFP += PlusBonusBeforeCap.rocketWG[Math.max(rocketWG - 1, 3)];
    if (rocketType4 >= 1) bonusFP += PlusBonusBeforeCap.rocketType4[Math.max(rocketType4 - 1, 3)];
    if (rocketType4CD >= 1) bonusFP += PlusBonusBeforeCap.rocketType4CD[Math.max(rocketType4CD - 1, 3)];
    if (aswMortarsType2 >= 1) bonusFP += PlusBonusBeforeCap.aswMortarsType2[Math.max(aswMortarsType2 - 1, 3)];
    if (aswMortarsType2CD >= 1) bonusFP += PlusBonusBeforeCap.aswMortarsType2CD[Math.max(aswMortarsType2CD - 1, 3)];
  } else {
    // 阈值后补正
    if (enemyAfter) {
      if (aaShell >= 1) bonusFP *= MultiBonusAfterCap.aaShell[0][enemyAfter];
      if (rocketWG >= 1) bonusFP *= MultiBonusAfterCap.rocketWG[0][enemyAfter];
      if (rocketWG >= 2) bonusFP *= MultiBonusAfterCap.rocketWG[1][enemyAfter];
      if (rocketType4 + rocketType4CD >= 1) bonusFP *= MultiBonusAfterCap.rocketType4[0][enemyAfter];
      if (rocketType4 + rocketType4CD >= 2) bonusFP *= MultiBonusAfterCap.rocketType4[1][enemyAfter];
      if (aswMortarsType2 + aswMortarsType2CD >= 1) bonusFP *= MultiBonusAfterCap.aswMortarsType2[0][enemyAfter];
      if (aswMortarsType2 + aswMortarsType2CD >= 2) bonusFP *= MultiBonusAfterCap.aswMortarsType2[1][enemyAfter];
      if (bomber >= 1 || jet >= 1) bonusFP *= MultiBonusAfterCap.bomber[0][enemyAfter];
      if (bomber >= 2 || jet >= 1) bonusFP *= MultiBonusAfterCap.bomber[1][enemyAfter];
      if (landingCraftAll >= 1) {
        bonusFP *= craftBonus * MultiBonusAfterCap.landingCraftAll[0][enemyAfter];
      }
      if (craftEx + craftExPanzerIIINAF + craftExPanzerIIIJ >= 1) bonusFP *= MultiBonusAfterCap.craftEx[0][enemyAfter];
      if (craftType89 + craftExType1 + craftExPanzerIIINAF + craftExPanzerIIIJ >= 1) bonusFP *= craftBonus * MultiBonusAfterCap.craftType89[0][enemyAfter];
      if (craftType89 + craftExType1 + craftExType97 + craftExType97Kai + craftExPanzerIIINAF + craftExPanzerIIIJ >= 2) bonusFP *= MultiBonusAfterCap.craftType89[1][enemyAfter];
      if (craftPanzerIINAF >= 1) bonusFP *= craftBonus * MultiBonusAfterCap.craftType89[0][enemyAfter];
      if (craftPanzerIINAF >= 2) bonusFP *= MultiBonusAfterCap.craftType89[1][enemyAfter];
      if (craftArmed + craftAB >= 1) bonusFP *= MultiBonusAfterCap.craftArmed[0][enemyAfter];
      if (craftArmed + craftAB >= 2) bonusFP *= MultiBonusAfterCap.craftArmed[1][enemyAfter];
      if (m4a1dd + craftExType97Kai + craftExPanzerIIIJ >= 1) bonusFP *= MultiBonusAfterCap.m4a1dd[0][enemyAfter];
      if (craftEx11th + craftExPanzerIIINAF + craftExType1 + craftExPanzerIIIJ >= 1) bonusFP *= MultiBonusAfterCap.craftEx11th[0][enemyAfter];
      if (amphibiousTanksType2 >= 1) bonusFP *= tankBonus * MultiBonusAfterCap.amphibiousTanksType2[0][enemyAfter];
      if (amphibiousTanksType2 >= 2) bonusFP *= MultiBonusAfterCap.amphibiousTanksType2[1][enemyAfter];
    }
  }

  return bonusFP;
};

// 陆基类型阈值前
const checkLandbaseTypeBefore = (enemyType: string) => {
  if (enemyType === 'anti_landbase_artillery') {
    return 'artillery';
  } else if (enemyType === 'anti_landbase_isolated_island') {
    return 'isolated_island';
  } else if (enemyType === 'anti_landbase_habour_summer') {
    return 'habour_summer';
  } else if (enemyType === 'anti_landbase_supply_depot' || enemyType === 'anti_landbase_soft_skin') {
    return 'soft_skin';
  } else {
    return '';
  }
};

// 陆基类型阈值后
const checkLandbaseTypeAfter = (enemyType: string) => {
  if (enemyType === 'anti_landbase_supply_depot' || enemyType === 'anti_landbase_supply_depot_iii_vacances') {
    return 'supply_depot';
  } else if (enemyType === 'anti_landbase_anchorage_vacances') {
    return 'anchorage_vacances';
  } else if (enemyType === 'anti_landbase_dock') {
    return 'dock';
  } else {
    return '';
  }
};
