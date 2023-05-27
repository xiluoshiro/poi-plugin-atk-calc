import { TattackMode, etRadarYamato, shipBig7, shipTypeBB, shipTypeCV, shipTypeSS } from "../constants";
import { IfleetState, IshipState, IslotState, ItypeCI } from "../types";

interface IshipsTouch {
  [shipID: number]: {
    ship2: number[],
    ratio?: {
      [shipID: number]: number[]
    }
  };
}
interface IshipsTouch3 {
  [shipID: number]: {
    ship2: number,
    ship3: number,
    ratio?: number[]
  }[];
}

export const getSpecialAttacks = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[], rawAttackMode: TattackMode) => {
  const specialAttacks = [];
  if (rawAttackMode === 'night') {
    specialAttacks.push(...checkNightSpecialAttacks(fleetState, shipState));
  }
  specialAttacks.push(...checkNelsonTouch(fleetState, shipState));
  specialAttacks.push(...checkNagatoIITouch(fleetState, shipState, slotsArray));
  specialAttacks.push(...checkColoradoTouch(fleetState, shipState, slotsArray));
  specialAttacks.push(...checkYamatoIITouch3(fleetState, shipState, slotsArray));
  specialAttacks.push(...checkYamatoIITouch2(fleetState, shipState, slotsArray));

  return specialAttacks;
};

const checkNightSpecialAttacks = (fleetState: IfleetState, shipState: IshipState) => {
  let specAtkArr: ItypeCI[] = [];

  specAtkArr.push(...checkKongoIICTouch(fleetState, shipState));

  return specAtkArr;
};

// 金刚摸：僚艦夜戦突撃
const shipKongoIIC = [591, 592, 593, 954];
const shipsKongoIITouch: IshipsTouch = {
  591: { ship2: [592, 151, 593, 954, 364, 439] },    // 金剛改二丙：比叡改二丙、榛名改二/乙/丙、Warspite
  592: { ship2: [591, 152] },                        // 比叡改二丙：金剛改二丙、霧島改二
  593: { ship2: [591, 592] },                        // 榛名改二乙：金剛改二丙、比叡改二丙
  954: { ship2: [591, 592] }                         // 榛名改二丙：金剛改二丙、比叡改二丙
};
const checkKongoIICTouch = (fleetState: IfleetState, shipState: IshipState): ItypeCI[] => {
  const { isCombined, fleetNum, formation, engagement } = fleetState;
  const { shipsType, shipsDamaged, shipsID, shipNum } = shipState;

  const shipsLoc = [1, 2];                                                          // 发动舰位置
  const shipsNoSS = shipsType.filter(type => !shipTypeSS.includes(type)).length;    // 非SS水上舰
  let isShipHealthy = shipsDamaged[0] < 2 && shipsDamaged[1] < 2;                   // 1 2号舰非中破
  const isCombinedSecond = isCombined ? fleetNum === 2 : true;                      // 联合二队
  const isFormation = ['line_ahead', 'echelon', 'cruising_formation_2', 'cruising_formation_4'].includes(formation);    // 单纵、梯形、二阵、四阵
  const isTouch = shipsLoc.includes(shipNum) && shipsNoSS >= 5 &&                   // 发动位，水上舰>=5
    shipKongoIIC.includes(shipsID[0]) &&                                            // 旗舰
    shipsKongoIITouch[shipsID[0]].ship2.includes(shipsID[1]) &&                     // 二号舰
    isShipHealthy && isCombinedSecond && isFormation;                               // 损伤、阵型、联合

  if (isTouch) {
    let ratio = 2.4;
    switch (engagement) {
      case 'crossing_t_adv':
        ratio *= 1.25;
        break;
      case 'crossing_t_da':
        ratio *= 0.8;
        break;
      default:
        break;
    }
    return [{ type: 'special_attack_kongo_iic', ratio }];
  }
  return [];
};

// Nelson Touch
const shipNelsonClass = [571, 576];
const checkNelsonTouch = (fleetState: IfleetState, shipState: IshipState): ItypeCI[] => {
  const { isCombined, fleetNum, formation, engagement } = fleetState;
  const { shipsType, shipsDamaged, shipsID, shipNum } = shipState;

  const shipsLoc = [1, 3, 5];                                                         // 发动舰位置
  const shipsNoSS = shipsType.filter(type => !shipTypeSS.includes(type)).length;      // 非SS水上舰
  let isShipHealthy = shipsDamaged[0] < 2;                                            // 发动舰非中破
  const isCombinedFirst = isCombined ? fleetNum === 1 : true;                         // 联合一队
  const isFormation = ['double_line', 'cruising_formation_2'].includes(formation);    // 复纵、二阵
  const isTouch = shipsLoc.includes(shipNum) && shipsNoSS >= 6 &&                     // 发动位，水上舰>=6
    shipNelsonClass.includes(shipsID[0]) &&                                           // 旗舰
    !(shipTypeCV.includes(shipsType[2]) || shipTypeSS.includes(shipsType[2])) &&      // 3, 5号舰非CV, SS
    !(shipTypeCV.includes(shipsType[4]) || shipTypeSS.includes(shipsType[4])) &&
    isShipHealthy && isCombinedFirst && isFormation;                                  // 损伤、阵型、联合

  if (isTouch) {
    let ratio = 2;
    switch (engagement) {
      case 'crossing_t_da':
        ratio *= 1.25;
        break;
      default:
        break;
    }
    return [{ type: 'special_attack_nelson', ratio }];
  }
  return [];
};

// 长门摸：一斉射かッ…胸が熱いな！ / 長門、いい？ いくわよ！ 主砲一斉射ッ！
const shipNagatoII = [541, 573];
const ratioNagatoII = [1.4, 1.2];
const shipsNagatoIITouch: IshipsTouch = {
  541: {                    // 長門改二
    ship2: [573, 276, 571, 576],
    ratio: {
      573: [1.2, 1.4],      // 陸奥改二
      276: [1.15, 1.35],    // 陸奥改
      571: [1.1, 1.25],     // Nelson
      576: [1.1, 1.25],     // Nelson改
    }
  },
  573: {                    // 陸奥改二
    ship2: [541, 275],
    ratio: {
      541: [1.2, 1.4],      // 長門改二
      275: [1.15, 1.35],    // 長門改
    }
  },
};
const checkNagatoIITouch = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[]): ItypeCI[] => {
  const { isCombined, fleetNum, formation } = fleetState;
  const { shipsType, shipsDamaged, shipsID, shipNum } = shipState;

  const shipsLoc = [1, 2];                                                            // 发动舰位置
  const shipsNoSS = shipsType.filter(type => !shipTypeSS.includes(type)).length;      // 非SS水上舰
  let isShipHealthy = shipsDamaged[0] < 2 && shipsDamaged[1] < 3;                     // 1号舰非中破，2号非大破
  const isCombinedFirst = isCombined ? fleetNum === 1 : true;                         // 联合一队
  const isFormation = ['echelon', 'cruising_formation_2'].includes(formation);        // 梯形、二阵
  const isTouch = shipsLoc.includes(shipNum) && shipsNoSS >= 6 &&                     // 发动位，水上舰>=6
    shipNagatoII.includes(shipsID[0]) &&                                              // 旗舰
    shipTypeBB.includes(shipsType[1]) &&                                              // 2号舰BB
    isShipHealthy && isFormation && isCombinedFirst;                                  // 损伤、阵型、联合

  if (isTouch) {
    let ratio = ratioNagatoII[shipNum - 1];
    const shipBonus = shipsNagatoIITouch[shipsID[0]];
    if (shipBonus.ship2.includes(shipsID[1]) && shipBonus.ratio) {
      ratio *= shipBonus.ratio[shipsID[1]][shipNum - 1];
    }

    let surfaceRadar = 0, apShell = 0;
    slotsArray.forEach(slot => {
      const { constInfo } = slot;
      const types = constInfo.api_type || {};

      if (types[1] === 8 && constInfo.api_saku >= 5) surfaceRadar++;    // 水上電探
      if (types[2] === 19) apShell++;                                   // 対艦強化弾
    });
    if (surfaceRadar > 0) ratio *= 1.15;
    if (apShell > 0) ratio *= 1.35;

    return [{ type: 'special_attack_nagato', ratio }];
  }
  return [];
};

// 科罗拉多摸: Colorado
const shipColoradoClass = [601, 1496, 913, 918];
const ratioColorado = [1.5, 1.3, 1.3];
const ratioBig7 = [1, 1.15, 1.17];
const checkColoradoTouch = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[]): ItypeCI[] => {
  const { isCombined, fleetNum, formation } = fleetState;
  const { shipsType, shipsDamaged, shipsID, shipNum, shipInfo } = shipState;

  const shipsLoc = [1, 2, 3];                                                             // 发动舰位置
  const shipsNoSS = shipsType.filter(type => !shipTypeSS.includes(type)).length;          // 非SS水上舰
  let isShipHealthy = shipsDamaged[0] < 2 && shipsDamaged[1] < 3 && shipsDamaged[2] < 3;  // 1号舰非中破，2 3号非大破
  const isCombinedFirst = isCombined ? fleetNum === 1 : true;                             // 联合一队
  const isFormation = ['echelon', 'cruising_formation_2'].includes(formation);            // 梯形、二阵
  const isTouch = shipsLoc.includes(shipNum) && shipsNoSS >= 6 &&                         // 发动位，水上舰>=6
    shipColoradoClass.includes(shipsID[0]) &&                                             // 旗舰
    shipTypeBB.includes(shipsType[1]) && shipTypeBB.includes(shipsType[2]) &&             // 2, 3号舰BB
    isShipHealthy && isFormation && isCombinedFirst;                                      // 损伤、阵型、联合

  if (isTouch) {
    let ratio = ratioColorado[shipNum - 1];
    if (shipBig7.includes(shipInfo.api_ship_id)) {
      ratio *= ratioBig7[shipNum - 1];
    }

    let surfaceRadar = 0, apShell = 0, radarSGNew = 0;
    slotsArray.forEach(slot => {
      const { constInfo, info } = slot;
      const types = constInfo.api_type || {};

      if (types[1] === 8 && constInfo.api_saku >= 5) surfaceRadar++;    // 水上電探
      if (types[2] === 19) apShell++;                                   // 対艦強化弾
      if (info.api_slotitem_id === 456) radarSGNew++;                   // SG レーダー(後期型)
    });
    if (surfaceRadar > 0) ratio *= 1.15;
    if (apShell > 0) ratio *= 1.35;
    if (radarSGNew > 0) ratio *= 1.15;

    return [{ type: 'special_attack_colorado', ratio }];
  }
  return [];
};

// 大和摸: 大和、突撃します！二番艦も続いてください！ / 第一戦隊、突撃！主砲、全力斉射ッ！
const shipYamatoIIClass = [911, 916, 546];
const shipsYamatoIITouch3: IshipsTouch3 = {
  911: [                                                  // 大和改二
    { ship2: 546, ship3: 541, ratio: [1.1, 1.21, 1] },    // 武蔵改二、長門改二
    { ship2: 546, ship3: 573, ratio: [1.1, 1.21, 1] },    // 武蔵改二、陸奥改二
    { ship2: 541, ship3: 573, ratio: [1.1, 1.1, 1] },     // 長門改二、陸奥改二
    { ship2: 573, ship3: 541, ratio: [1.1, 1.1, 1] },
    { ship2: 553, ship3: 554, ratio: [1.1, 1.05, 1] },    // 伊勢改二、日向改二
    { ship2: 554, ship3: 553, ratio: [1.1, 1.05, 1] },
    { ship2: 411, ship3: 412 },                           // 扶桑改二、山城改二
    { ship2: 412, ship3: 411 },
    { ship2: 591, ship3: 592 },                           // 金剛改二丙、比叡改二丙
    { ship2: 592, ship3: 591 },
    { ship2: 591, ship3: 593 },                           // 金剛改二丙、榛名改二乙
    { ship2: 593, ship3: 591 },
    { ship2: 591, ship3: 954 },                           // 金剛改二丙、榛名改二丙
    { ship2: 954, ship3: 591 },
    { ship2: 446, ship3: 447 },                           // Italia、Roma改
    { ship2: 447, ship3: 446 },
    { ship2: 364, ship3: 576 },                           // Warspite改、Nelson改
    { ship2: 576, ship3: 364 },
    { ship2: 659, ship3: 697 },                           // Washington改、South Dakota改
    { ship2: 697, ship3: 659 },
    { ship2: 1496, ship3: 918 },                          // Colorado改、Maryland改
    { ship2: 918, ship3: 1496 },
  ],
  916: [                                                  // 大和改二重
    { ship2: 546, ship3: 541, ratio: [1.1, 1.21, 1] },    // 武蔵改二、長門改二
    { ship2: 546, ship3: 573, ratio: [1.1, 1.21, 1] },    // 武蔵改二、陸奥改二
    { ship2: 541, ship3: 573, ratio: [1.1, 1.1, 1] },     // 長門改二、陸奥改二
    { ship2: 573, ship3: 541, ratio: [1.1, 1.1, 1] },
    { ship2: 553, ship3: 554, ratio: [1.1, 1.05, 1] },    // 伊勢改二、日向改二
    { ship2: 554, ship3: 553, ratio: [1.1, 1.05, 1] },
    { ship2: 411, ship3: 412 },                           // 扶桑改二、山城改二
    { ship2: 412, ship3: 411 },
    { ship2: 591, ship3: 592 },                           // 金剛改二丙、比叡改二丙
    { ship2: 592, ship3: 591 },
    { ship2: 591, ship3: 593 },                           // 金剛改二丙、榛名改二乙
    { ship2: 593, ship3: 591 },
    { ship2: 591, ship3: 954 },                           // 金剛改二丙、榛名改二丙
    { ship2: 954, ship3: 591 },
    { ship2: 446, ship3: 447 },                           // Italia、Roma改
    { ship2: 447, ship3: 446 },
    { ship2: 364, ship3: 576 },                           // Warspite改、Nelson改
    { ship2: 576, ship3: 364 },
    { ship2: 659, ship3: 697 },                           // Washington改、South Dakota改
    { ship2: 697, ship3: 659 },
    { ship2: 1496, ship3: 918 },                          // Colorado改、Maryland改
    { ship2: 918, ship3: 1496 },
  ],
};
const ratioYamatoII3 = [1.5, 1.5, 1.65];
const checkYamatoIITouch3 = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[]): ItypeCI[] => {
  const { isCombined, fleetNum, formation } = fleetState;
  const { shipsType, shipsDamaged, shipsID, shipNum } = shipState;

  const shipsLoc = [1, 2, 3];                                                             // 发动舰位置
  const shipsNoSS = shipsType.filter(type => !shipTypeSS.includes(type)).length;          // 非SS水上舰
  let isShipHealthy = shipsDamaged[0] < 2 && shipsDamaged[1] < 2 && shipsDamaged[2] < 2;  // 1 2 3号舰非中破
  const isCombinedFirst = isCombined ? fleetNum === 1 : true;                             // 联合一队
  const isFormation = ['echelon', 'cruising_formation_4'].includes(formation);            // 梯形、四阵
  const shipsArr = shipsYamatoIITouch3[shipsID[0]];                                       // 2 3号舰是否合法
  const shipAttack = shipsArr ? shipsArr.findIndex(ships => ships.ship2 === shipsID[1] && ships.ship3 === shipsID[2]) : -1;
  const isTouch = shipsLoc.includes(shipNum) && shipsNoSS >= 6 &&                         // 发动位，水上舰>=6
    shipYamatoIIClass.includes(shipsID[0]) &&                                             // 旗舰
    (shipAttack > -1) &&                                                                  // 2 3号舰
    isShipHealthy && isFormation && isCombinedFirst;                                      // 损伤、阵型、联合

    if (isTouch) {
      let ratio = ratioYamatoII3[shipNum - 1];
      const shipArr = shipsYamatoIITouch3[shipsID[0]][shipAttack];
      if (shipArr && shipArr.ratio) {
        ratio *= shipArr.ratio[shipNum - 1];
      }

      let surfaceRadar = 0, apShell = 0, radarYamato = 0;
      slotsArray.forEach(slot => {
        const { constInfo, info } = slot;
        const types = constInfo.api_type || {};

        if (types[1] === 8 && constInfo.api_saku >= 5) surfaceRadar++;    // 水上電探
        if (types[2] === 19) apShell++;                                   // 対艦強化弾
        if (etRadarYamato.includes(info.api_slotitem_id)) radarYamato++;  // 二重測距儀系
      });
      if (surfaceRadar > 0) ratio *= 1.15;
      if (apShell > 0) ratio *= 1.35;
      if (radarYamato > 0) ratio *= 1.1;

      return [{ type: 'special_attack_yamato_3', ratio }];
    }
    return [];
};
const shipsYamatoIITouch2: IshipsTouch = {
  911: {                            // 大和改二
    ship2: [546, 360, 178, 392],    // 武蔵改二、Iowa改、Bismarck drei、Richelieu改
    ratio: {
      546: [1.1, 1.2],              // 武蔵改二
    }
  },
  916: {                            // 大和改二重
    ship2: [546, 360, 178, 392],    // 武蔵改二、Iowa改、Bismarck drei、Richelieu改
    ratio: {
      546: [1.1, 1.2],              // 武蔵改二
    }
  },
  546: {                            // 武蔵改二
    ship2: [911, 916],              // 大和改二、大和改二重
    ratio: {
      911: [1.1, 1.2],              // 大和改二
      916: [1.1, 1.25],             // 大和改二重
    }
  },
};
const ratioYamatoII2 = [1.4, 1.55];
const checkYamatoIITouch2 = (fleetState: IfleetState, shipState: IshipState, slotsArray: IslotState[]): ItypeCI[] => {
  const { isCombined, fleetNum, formation } = fleetState;
  const { shipsType, shipsDamaged, shipsID, shipNum } = shipState;

  const shipsLoc = [1, 2];                                                                // 发动舰位置
  const shipsNoSS = shipsType.filter(type => !shipTypeSS.includes(type)).length;          // 非SS水上舰
  let isShipHealthy = shipsDamaged[0] < 2 && shipsDamaged[1] < 2;                         // 1 2号舰非中破
  const isCombinedFirst = isCombined ? fleetNum === 1 : true;                             // 联合一队
  const isFormation = ['echelon', 'cruising_formation_4'].includes(formation);            // 梯形、四阵
  const isTouch = shipsLoc.includes(shipNum) && shipsNoSS >= 6 &&                         // 发动位，水上舰>=6
    shipYamatoIIClass.includes(shipsID[0]) &&                                             // 旗舰
    shipsYamatoIITouch2[shipsID[0]].ship2.includes(shipsID[1]) &&                         // 2号舰
    isShipHealthy && isFormation && isCombinedFirst;                                      // 损伤、阵型、联合

    if (isTouch) {
      let ratio = ratioYamatoII2[shipNum - 1];
      const shipRatioArr = shipsYamatoIITouch2[shipsID[0]].ratio;
      if (shipRatioArr && shipRatioArr[shipsID[1]]) {
        ratio *= shipRatioArr[shipsID[1]][shipNum - 1];
      }

      let surfaceRadar = 0, apShell = 0, radarYamato = 0;
      slotsArray.forEach(slot => {
        const { constInfo, info } = slot;
        const types = constInfo.api_type || {};

        if (types[1] === 8 && constInfo.api_saku >= 5) surfaceRadar++;    // 水上電探
        if (types[2] === 19) apShell++;                                   // 対艦強化弾
        if (etRadarYamato.includes(info.api_slotitem_id)) radarYamato++;  // 二重測距儀系
      });
      if (surfaceRadar > 0) ratio *= 1.15;
      if (apShell > 0) ratio *= 1.35;
      if (radarYamato > 0) ratio *= 1.1;

      return [{ type: 'special_attack_yamato_2', ratio }];
    }
    return [];
};
