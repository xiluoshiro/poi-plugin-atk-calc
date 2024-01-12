import { IfleetState, Iship, IshipState, IslotState, ItypeCI } from "../types";
import { getDamagedStatus } from "./ships";
import {
  TattackMode, TdaytimeCITypes, TnightCITypes, VANGUARD_TOP, antilandbaseDB, etAircraftShelling, etBomber, etSSNewTorpedo, etSeaplane, etSuisei634,
  etZuinun, nightAircraft, nightAircraftB, nightCV, nightOfficials, nightShellingCV, nightSwordfish, nightSwordfishCV, shipTypeCV, shipTypeLikeCV,
  shipTypeNightZuiun, shipTypeSS, shipZuiunAttack
} from "../constants";
import {
  capDamage, getAPShellBonus, getBalloonBonus, getCombinedBonus, getConfigGunBonus, getCriticalBonus, getDamagedBonus, getEngagementBonus, getFormationBonus,
  getImprovementFP, getNightAircraftBonus, getNightSwordfishBonus, getNightTouchBonus
} from "./bonus";
import { getSpecialAttacks } from "./special-attacks";
import { checkAntiLandbaseFPAfter, checkAntiLandbaseFPBefore } from "./anti-landbase";
import { checkAntiPTFP } from "./anti-pt";

// 检查攻击模式
const checkAttackType = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[], attackMode: TattackMode, isAntiLandbase: boolean) => {
  switch (attackMode) {
    case 'night':
      return checkNightAttack(fleetState, shipState, slotsArray);
    case 'day_shelling':
      return checkDayAttack(shipState, slotsArray, isAntiLandbase);
    default:
      return attackMode;
  }
};

// 检查昼间攻击
const checkDayAttack = (shipState: IshipState, slotsArray: IslotState[], isAntiLandbase: boolean) => {
  const { shipDamaged, shipConstInfo, shipInfo } = shipState;
  const stype = shipConstInfo.api_stype;

  // SS对陆
  if (shipTypeSS.includes(stype)) {
    const isAmphibiousTanks = slotsArray.some(slot => {
      const { constInfo } = slot;
      const types = constInfo.api_type || {};
      return types[2] === 46;                           // 特型内火艇
    });
    if (!(isAntiLandbase && isAmphibiousTanks)) {
      return 'no_attack';
    }
  }
  // 非CV、速吸、山汐丸
  if (!(shipTypeCV.includes(stype)) && !(shipTypeLikeCV.includes(shipInfo.api_ship_id))) {
    return 'day_shelling';
  }
  // 大破 / 非装母中破
  const noAttack = shipDamaged && (stype === 18 ? shipDamaged >= 3 : shipDamaged >= 2);
  if (noAttack) {
    return 'no_attack';
  }
  // 飞机搭载
  const aircraftArray = slotsArray.filter(slot => {
    const { constInfo, carrying } = slot;
    const types = constInfo.api_type || {};
    return etAircraftShelling.includes(types[2]) && carrying > 0;
  });
  if (aircraftArray.length === 0) {
    return shipTypeCV.includes(stype) ? 'no_attack' : 'day_shelling';
  }
  // 对陆舰爆
  if (isAntiLandbase) {
    const bomber = aircraftArray.filter(air => etBomber.includes(air.constInfo.api_type[2])).length;
    const antiLandbaseDB = aircraftArray.filter(air => antilandbaseDB.includes(air.info.api_slotitem_id)).length;
    if (bomber > 0 && antiLandbaseDB === 0) return 'no_attack';
  }
  return 'day_aircraft';
};


// 检查夜间攻击
const checkNightAttack = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[]) => {
  const { isCombined, fleetNum } = fleetState;
  const { shipInfo, shipConstInfo, shipDamaged } = shipState;
  const shipId = shipInfo.api_ship_id;

  // 大破
  if (shipDamaged >= 3) {
    return 'no_attack';
  }
  // 联合一队
  if (isCombined && fleetNum === 1) {
    return 'no_attack';
  }
  // 非CV
  if (!shipTypeCV.includes(shipConstInfo.api_stype)) {
    return 'night';
  }

  // 夜間航空攻撃：装母 / 非中破
  if (shipConstInfo.api_stype === 18 || shipDamaged < 2) {
    // 飞机搭载
    const aircraftArray = slotsArray.filter(slot => {
      const { info, carrying } = slot;
      return nightAircraft.includes(info.api_slotitem_id) && carrying > 0;
    });

    if (aircraftArray.length === 0) {
      return 'no_attack';
    }
    // 夜母
    if (nightCV.includes(shipId)) {
      return 'night_aircraft';
    }
    // 夜間作戦航空要員
    const equipsID = slotsArray.map(slot => slot.info.api_slotitem_id);
    let flag = false;
    nightOfficials.forEach(n => flag = flag || equipsID.includes(n));
    if (flag) {
      return 'night_aircraft';
    }
    // Swordfish
    flag = false;
    nightSwordfish.forEach(n => flag = flag || equipsID.includes(n));
    if (nightSwordfishCV.includes(shipId) && flag) {
      return 'night_swordfish';
    }
  }

  // 夜間砲撃空母
  if (nightShellingCV.includes(shipId)) {
    return 'night';
  }

  return 'no_attack';
};

// 空母炮击
const checkAircraftFP = (attackPower: number, shipInfo: Iship, slotsArray: IslotState[], isAntiLandbase: boolean) => {
  let bombing = 0;
  let torpedo = shipInfo.api_raisou[0];
  slotsArray.forEach(slot => {
    bombing += slot.constInfo.api_baku;
    // torpedo += slot.constInfo.api_raig;
  });

  if (isAntiLandbase) {
    torpedo = 0;
    slotsArray.forEach(slot => {
      const types = slot.constInfo.api_type || {};
      // 非对陆、喷气机
      if (etBomber.includes(types[2]) && !antilandbaseDB.includes(slot.info.api_slotitem_id)) {
        bombing -= slot.constInfo.api_baku;
      }
    })
  }

  const aircraftFP = attackPower + torpedo + Math.floor(bombing * 1.3) + 15;
  return Math.floor(aircraftFP * 1.5) + 25;
}

// 炮击基础攻击力
const checkBaseFP = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[], attackMode: TattackMode, isAntiLandbase: boolean) => {
  const { fleetType, enemyFleetType, fleetNum, fleetEquip } = fleetState;
  const { shipInfo } = shipState;
  const { nightTouch } = fleetEquip!;


  const firepower = shipInfo.api_karyoku[0];
  const torpedo = isAntiLandbase ? 0 : shipInfo.api_raisou[0];
  const improvementFP = getImprovementFP(slotsArray, attackMode);
  const combinedBonus = getCombinedBonus(fleetType, enemyFleetType, fleetNum);
  const nightTouchBonus = getNightTouchBonus(nightTouch!);

  switch (attackMode) {
    case 'day_shelling':
    case 'day_aircraft':
      return firepower + improvementFP + combinedBonus + 5;
    case 'night':
      return firepower + torpedo + improvementFP + nightTouchBonus;
    case 'night_aircraft':
      return nightTouchBonus + getNightAircraftBonus(slotsArray, firepower + torpedo, isAntiLandbase);
    case 'night_swordfish':
      return nightTouchBonus + getNightSwordfishBonus(slotsArray, firepower + torpedo, isAntiLandbase);
    default:
      return 0;
  }
};

interface IciType {
  [type: string]: number;
}
/*
 * 夜战CI
 *
 * m: main gun, s: secondary gun, t: torpedo, r: surface radar, st: ss torpedo, sr: ss radar,
 * sl: skilled lookouts, tsl: torpedo sl, nz: night zuiun, d: drum
 */
const nightCIType: IciType = {
  normal_attack: 1,
  double_attack: 1.2,
  m_m_m: 2,
  m_m_s: 1.75,
  t_t: 1.5,
  m_t: 1.3,
  dd_m_t_r: 1.3,
  dd_t_sl_r: 1.2,
  dd_t_t_tsl: 1.5,
  dd_t_d_tsl: 1.3,
  m_m_nz: 1.24,
  ss_st_sr: 1.75,
  ss_st_st: 1.6
};
const checkNightCI = (shipState: IshipState, slotsArray: IslotState[], isAntiLandbase: boolean): ItypeCI[] => {
  const { shipConstInfo } = shipState;
  const shipType = shipConstInfo.api_stype;


  let mainGun = 0, secondaryGun = 0, torpedo = 0, surfaceRadar = 0, skilledLookouts = 0, d2Gun = 0, d3Gun = 0,
    torpedoSL = 0, drum = 0, ssNewTorpedo = 0, ssRadar = 0, nightZuiun = 0;
  slotsArray.forEach(slot => {
    const { constInfo, info } = slot;
    const types = constInfo.api_type || {};

    if (types[1] === 1) mainGun++;                                        // 主砲
    if (types[1] === 2) secondaryGun++;                                   // 副砲
    if (types[1] === 3) torpedo++;                                        // 魚雷
    if (types[1] === 8 && constInfo.api_saku >= 5) surfaceRadar++;        // 水上電探
    if (types[2] === 39) skilledLookouts++;                               // 見張員
    if (info.api_slotitem_id === 267) d2Gun++;                            // 12.7cm連装砲D型改二
    if (info.api_slotitem_id === 366) d3Gun++;                            // 12.7cm連装砲D型改三
    if (info.api_slotitem_id === 412) torpedoSL++;                        // 水雷戦隊 熟練見張員
    if (info.api_slotitem_id === 75) drum++;                              // ドラム缶
    if (etSSNewTorpedo.includes(info.api_slotitem_id)) ssNewTorpedo++;    // 後期型潜水艦魚雷
    if (types[2] === 51) ssRadar++;                                       // 潜水艦搭載電探
    if (types[3] === 51) nightZuiun++;                                    // 夜間瑞雲
  })
  const dGun = d2Gun + d3Gun;

  if (isAntiLandbase) {
    torpedo = 0;
    ssNewTorpedo = 0;
  }

  const nightCI: TnightCITypes[] = [];
  if (mainGun >= 3) nightCI.push('m_m_m');
  if (mainGun >= 2 && secondaryGun >= 1) nightCI.push('m_m_s');
  if (torpedo >= 2) nightCI.push('t_t');
  if (mainGun >= 1 && torpedo >= 1) nightCI.push('m_t');
  if (mainGun + secondaryGun === 2) nightCI.push('double_attack');

  // 潜水艦CI
  if (shipTypeSS.includes(shipType)) {
    if (ssNewTorpedo >= 1 && ssRadar >= 1) nightCI.push('ss_st_sr');
    if (ssNewTorpedo >= 2) nightCI.push('ss_st_st');
  }

  nightCI.sort((a, b) => nightCIType[b] - nightCIType[a]);
  const maxNightCI: TnightCITypes[] = ['normal_attack'];
  if (nightCI.length > 0) maxNightCI.unshift(nightCI[0]);
  const nightCIArr: ItypeCI[] = maxNightCI.map(ci => {
    return { type: ci, ratio: nightCIType[ci] };
  });

  // 駆逐艦CI
  const ddMultiCI: ItypeCI[] = [];
  if (shipType === 2) {
    let dGunRatio = 1;
    if (dGun === 1) {
      dGunRatio *= 1.25
    } else if (dGun >= 2) {
      dGunRatio *= 1.4;
    }
    if (d3Gun >= 1) {
      dGunRatio *= 1.05;
    } else if (d3Gun >= 2) {
      dGunRatio *= 1.1;
    };
    if (mainGun >= 1 && torpedo >= 1 && surfaceRadar >= 1) ddMultiCI.push({ type: 'dd_m_t_r', ratio: nightCIType['dd_m_t_r'] * dGunRatio });
    if (torpedo >= 1 && surfaceRadar >= 1 && skilledLookouts >= 1) ddMultiCI.push({ type: 'dd_t_sl_r', ratio: nightCIType['dd_t_sl_r'] * dGunRatio });

    if (torpedo >= 2 && torpedoSL >= 1) ddMultiCI.push({ type: 'dd_t_t_tsl', ratio: nightCIType['dd_t_t_tsl'] });
    if (torpedo >= 1 && torpedoSL >= 1 && drum >= 1) ddMultiCI.push({ type: 'dd_t_d_tsl', ratio: nightCIType['dd_t_d_tsl'] });
  };
  nightCIArr.unshift(...ddMultiCI);

  // 夜間瑞雲CI
  if (shipTypeNightZuiun.includes(shipType) && mainGun >= 2) {
    if (nightZuiun >= 1) nightCIArr.unshift({ type: 'm_m_nz', ratio: nightCIType['m_m_nz'] });
    if (nightZuiun >= 1 && surfaceRadar >= 1) nightCIArr.unshift({ type: 'm_m_nz', ratio: nightCIType['m_m_nz'] + 0.04 });
    if (nightZuiun >= 2) nightCIArr.unshift({ type: 'm_m_nz', ratio: nightCIType['m_m_nz'] + 0.04 });
    if (nightZuiun >= 2 && surfaceRadar >= 1) nightCIArr.unshift({ type: 'm_m_nz', ratio: nightCIType['m_m_nz'] + 0.12 });
  }

  return nightCIArr;
};

/*
 * 夜襲CI
 *
 * nf: night fighter, ntb: night torpedo bomber, np: night plane, ps: phototube suisei
 */
const nightAircraftCITYpe = {
  normal_attack: 1,
  nf_nf_ntb: 1.25,
  nf_ntb: 1.2,
  n_ps: 1.2,
  nf_np_np: 1.18
};
const checkNightAircraftCI = (slotsArray: IslotState[]): ItypeCI[] => {

  let nightFighter = 0, nightTB = 0, phototubeSuisei = 0, nightPlane = 0;
  const nightCIArr: ItypeCI[] = [];

  slotsArray.forEach(slot => {
    const { carrying, constInfo, info } = slot;
    const types = constInfo.api_type || {};

    if (carrying > 0) {
      if (types[3] === 45) nightFighter++;                                // 夜間戦闘機
      if (types[3] === 46) nightTB++;                                     // 夜間攻撃機
      if (info.api_slotitem_id === 320) phototubeSuisei++;                // 彗星一二型(三一号光電管爆弾搭載機)
      if (nightAircraftB.includes(info.api_slotitem_id)) nightPlane++;    // 夜間飛行機
    }
  })

  if (nightFighter >= 2 && nightTB >= 1) {
    nightCIArr.push({ type: 'nf_nf_ntb', ratio: nightAircraftCITYpe['nf_nf_ntb'] });
  } else if (nightFighter >= 1 && nightTB >= 1) {
    nightCIArr.push({ type: 'nf_ntb', ratio: nightAircraftCITYpe['nf_ntb'] });
  } else if ((nightFighter + nightTB >= 1) && phototubeSuisei >= 1){
    nightCIArr.push({ type: 'n_ps', ratio: nightAircraftCITYpe['n_ps'] });
  } else if (nightFighter >= 1 && nightPlane >= 2) {
    nightCIArr.push({ type: 'nf_np_np', ratio: nightAircraftCITYpe['nf_np_np'] });
  }

  nightCIArr.push({ type: 'normal_attack', ratio: nightAircraftCITYpe['normal_attack'] })
  return nightCIArr;
};

// 昼战CI
const daytimeCIType: IciType = {
  normal_attack: 1,
  double_attack: 1.2,
  m_m_ap: 1.5,
  m_s_ap: 1.3,
  m_s_r: 1.2,
  m_s: 1.1,
  m_suisei: 1.3,
  m_zuiun: 1.35,
  f_b_a: 1.25,
  b_b_a: 1.2,
  b_a: 1.15
}
const checkDaytimeCI = (shipState: IshipState, slotsArray: IslotState[], attackMode: TattackMode, isAntiLandbase: boolean): ItypeCI[] => {
  const { shipDamaged, shipInfo } = shipState;
  if (shipDamaged && shipDamaged >= 3) return [{ type: 'normal_attack', ratio: daytimeCIType['normal_attack'] }];              // 大破

  let seaplane = 0, mainGun = 0, secondaryGun = 0, radar = 0, apShell = 0, zuiun = 0, suisei634 = 0,
    fighter = 0, diveBomber = 0, torpedoBomber = 0;
  slotsArray.forEach(slot => {
    const { carrying, constInfo, info } = slot;
    const types = constInfo.api_type || {};

    if (etSeaplane.includes(types[2])) seaplane++;                    // 水上機
    if (types[1] === 1) mainGun++;                                    // 主砲
    if (types[1] === 2) secondaryGun++;                               // 副砲
    if (types[1] === 8) radar++;                                      // 電探
    if (types[2] === 19) apShell++;                                   // 対艦強化弾

    if (carrying > 0) {
      if (etZuinun.includes(info.api_slotitem_id)) zuiun++;           // 瑞雲系
      if (etSuisei634.includes(info.api_slotitem_id)) suisei634++;    // 彗星(六三四空)系

      if (types[2] === 6) fighter++;                                  // 艦上戦闘機
      if (types[2] === 7) diveBomber++;                               // 艦上爆撃機
      if (types[2] === 8) torpedoBomber++;                            // 艦上攻撃機
    }
  })

  const dayCI: TdaytimeCITypes[] = [];
  // 立体攻撃
  if (shipZuiunAttack.includes(shipInfo.api_ship_id)) {
    if (mainGun >= 1 && zuiun >= 2) dayCI.push('m_zuiun');
    if (mainGun >= 1 && suisei634 >= 2) dayCI.push('m_suisei');
  }

  // 弾着観測射撃
  if (seaplane > 0) {
    if (mainGun >= 2 && apShell >= 1) dayCI.push('m_m_ap');
    if (mainGun >= 1 && secondaryGun >= 1 && apShell >= 1) dayCI.push('m_s_ap');
    if (mainGun >= 1 && secondaryGun >= 1 && radar >= 1) dayCI.push('m_s_r');
    if (mainGun >= 1 && secondaryGun >= 1) dayCI.push('m_s');
    if (mainGun >= 2) dayCI.push('double_attack');
  }

  // 戦爆連合
  if (attackMode === 'day_aircraft' && !isAntiLandbase) {
    if (fighter >= 1 && diveBomber >= 1 && torpedoBomber >= 1) dayCI.push('f_b_a');
    if (diveBomber >= 2 && torpedoBomber >= 1) dayCI.push('b_b_a');
    if (diveBomber >= 1 && torpedoBomber >= 1) dayCI.push('b_a');
  }
  dayCI.push('normal_attack');
  return dayCI.map(typ => { return { type: typ, ratio: daytimeCIType[typ] } });
};

export const calcCombat = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[], attackMode: TattackMode): ItypeCI[] => {
  const { formation, ships, isCombined, engagement } = fleetState;
  const { shipInfo, enemyType, shipNum } = shipState;
  const rawAttackMode = attackMode;

  shipState.shipDamaged = getDamagedStatus(shipInfo.api_nowhp, shipInfo.api_maxhp);
  const isAntiLandbase = enemyType ? enemyType.slice(0, 'anti_landbase'.length) === 'anti_landbase' : false;
  const isArmor = enemyType ? !['anti_surface', 'anti_landbase_dock', 'anti_pt'].includes(enemyType) : false;
  let attackTypeArr: ItypeCI[] = [];

  // 检查攻击类型
  attackMode = checkAttackType(fleetState, shipState, slotsArray, attackMode, isAntiLandbase);
  if (attackMode === 'no_attack') {
    return [{ type: 'no_attack' }];
  }

  // 炮击基础攻击力
  let attackPower = checkBaseFP(fleetState, shipState, slotsArray, attackMode, isAntiLandbase);

  // 阈值前对陆
  attackPower = isAntiLandbase ? checkAntiLandbaseFPBefore(attackPower, shipState, slotsArray, attackMode, rawAttackMode) : attackPower;

  // 空母炮击
  if (attackMode === 'day_aircraft') {
    attackPower = checkAircraftFP(attackPower, shipInfo, slotsArray, isAntiLandbase);
  }

  // 阈值前其他补正
  const isVanguardTop = shipNum <= ships.length / 2;
  if (rawAttackMode !== 'night') {
    attackPower *= getEngagementBonus(engagement);                                                // 航向
    attackPower *= getFormationBonus(formation, isVanguardTop, isCombined);                       // 阵型
  } else {
    if (formation === 'vanguard' && isVanguardTop) {                                              // 夜战警戒
      attackPower *= VANGUARD_TOP;
    }
  }
  if (shipState.shipDamaged) attackPower *= getDamagedBonus(shipState.shipDamaged);               // 损伤

  // 夜战CI
  if ((rawAttackMode === 'night')) {
    attackTypeArr.push(...getSpecialAttacks(fleetState, shipState, slotsArray, rawAttackMode));   // 舰娘特殊攻击
    if (attackMode !== 'night_aircraft') {
      attackTypeArr.push(...checkNightCI(shipState, slotsArray, isAntiLandbase));
    } else {
      attackTypeArr.push(...checkNightAircraftCI(slotsArray));
    }
    attackTypeArr.forEach(atkType => atkType.ratio ? atkType.attackPower = atkType.ratio * attackPower : false);
  }

  // 适重炮补正
  const configGunBonus = getConfigGunBonus(shipState, slotsArray);
  attackTypeArr.forEach(atkType => atkType.attackPower ? atkType.attackPower += configGunBonus : false);
  attackPower += configGunBonus;

  // 阈值补正
  attackTypeArr.forEach(atkType => atkType.attackPower ? atkType.attackPower = capDamage(atkType.attackPower, rawAttackMode) : false);
  attackPower = capDamage(attackPower, rawAttackMode);

  // 昼战特殊攻击
  if (rawAttackMode === 'day_shelling') {
    attackTypeArr.push(...getSpecialAttacks(fleetState, shipState, slotsArray, rawAttackMode));   // 舰娘特殊攻击
    attackTypeArr.push(...checkDaytimeCI(shipState, slotsArray, attackMode, isAntiLandbase));
    attackTypeArr.forEach(atkType => atkType.ratio ? atkType.attackPower = atkType.ratio * Math.floor(attackPower) : false);
  }
  
  // 潜水舰特殊攻击？
  
  // 以下位置理论上无需使用 attackPower，todo: 后续将前面 CI 选择部分优化，防止取分支情况

  // 彻甲弹补正
  if (isArmor) {
    attackTypeArr.forEach(atkType => atkType.attackPower ? atkType.attackPower = getAPShellBonus(slotsArray) * atkType.attackPower : false);
  }
  attackTypeArr.forEach(atkType => atkType.attackPower ? atkType.attackPower = Math.floor(atkType.attackPower) : false);

  // 阈值后对陆, PT补正
  attackTypeArr.forEach(atkType => {
    if (atkType.attackPower) {
      atkType.attackPower = checkAntiLandbaseFPAfter(atkType.attackPower, shipState, slotsArray, attackMode, rawAttackMode);
      atkType.attackPower = enemyType === 'anti_pt' ? checkAntiPTFP(atkType.attackPower, slotsArray, rawAttackMode) : atkType.attackPower;
    }
  });

  // 气球补正
  attackTypeArr.forEach(atkType => {
    if (atkType.attackPower && isAntiLandbase) {
      const { balloon } = fleetState.fleetEquip!;
      atkType.attackPower *= getBalloonBonus(balloon)
    }
  });

  // todo: 海域倍卡补正

  // 暴击补正、取整
  attackTypeArr.forEach(atkType => {
    const atp = atkType.attackPower || 0;
    atkType.critical = getCriticalBonus(slotsArray, attackMode, atkType);
    atkType.criticalAP = Math.floor(atp * atkType.critical);
    atkType.attackPower = Math.floor(atp);
  })

  return attackTypeArr;
}
