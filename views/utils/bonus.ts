import { IshipState, IslotState, ItypeCI } from "../types";
import {
  TattackMode, improvementBonus, improvementBonusRecheck, fighterBomber, secondaryGunB, secondaryGunC,
  depthCharge, nightAircraft, nightAircraftA, nightSwordfish, ECHELON_6V12, VANGUARD_TOP, shipTypeCLex,
  lightSingleGunCL, lightTwinGunCL, shipItalianCA, THRESHOLD_DAY_SHELLING, THRESHOLD_NIGHT, THRESHOLD_TORPEDO,
  THRESHOLD_DEFAULT, daytimeCVCITypes, etAircraftCritical, etHayabushiS20
} from "../constants";

// 联合舰队补正
interface IcombinedBonus {
  x: number;    // 第一舰队
  y: number;    // 第二舰队
}
export const getCombinedBonus = (fleetType: string, enemyFleetType: string, fleetNum: number) => {
  const enemyCombined = enemyFleetType === 'combined_fleet';
  let res: IcombinedBonus = { x: 0, y: 0 };
  switch (fleetType) {
    case 'single_fleet':
      return enemyCombined ? 5 : 0;
    case 'carrier_combined_fleet':
      res = enemyCombined ? { x: 2, y: -5 } : { x: 2, y: 10 };
      break;
    case 'surface_combined_fleet':
      res = enemyCombined ? { x: 2, y: -5 } : { x: 10, y: -5 };
      break;
    case 'transport_combined_fleet':
      res = enemyCombined ? { x: -5, y: -5 } : { x: -5, y: 10 };
      break;
  }

  switch (fleetNum) {
    case 1:
      return res.x;
    case 2:
      return res.y;
    default:
      return 0;
  }
};

// 航向补正
interface IengagementBonus {
  [engagement: string]: number
}
const engagementBonus: IengagementBonus = {
  'parallel': 1,
  'head_on': 0.8,
  'crossing_t_adv': 1.2,
  'crossing_t_da': 0.6
};
export const getEngagementBonus = (engagement: string) => {
  return engagementBonus[engagement];
};

// 阵型补正
interface IformationBonus {
  [formation: string]: number;
}
const formationBonus: IformationBonus = {
  'line_ahead': 1,
  'double_line': 0.8,
  'diamond': 0.7,
  'echelon': 0.75,
  'line_abreast': 0.6,
  'vanguard': 1,
  'cruising_formation_1': 0.8,
  'cruising_formation_2': 1,
  'cruising_formation_3': 0.7,
  'cruising_formation_4': 1.1
};
export const getFormationBonus = (formation: string, isVanguardTop: boolean, isCombined: boolean) => {
  let bonus = formationBonus[formation];

  switch (formation) {
    case 'echelon':
      // 梯形 6 v 12
      bonus = isCombined ? ECHELON_6V12 : bonus;
      break;
    case 'vanguard':
      bonus = isVanguardTop ? VANGUARD_TOP : bonus;
      break;
    default:
      break;
  }

  return bonus;
};

// 损伤补正
export const getDamagedBonus = (damagedStatus: number) => {
  const damageType = damagedStatus;
  if (damageType < 2) {
    return 1;
  } else if (damageType < 3) {
    return 0.7;
  } else {
    return 0.4;
  }
};


// 改修补正
export const getImprovementFP = (slotsArray: IslotState[], attackMode: TattackMode) => {
  let bonus = 0;

  slotsArray.map(slot => {
    const level = slot.info.api_level;
    const equipConst = slot.constInfo.api_type || {};
    const equipType = equipConst[2];
    const equipId = slot.info.api_slotitem_id;
    let bonusType = improvementBonus[equipType] || {};

    switch (equipType) {
      case 4:
        // 副砲(分類B C)
        if (secondaryGunB.includes(equipId)) {
          bonusType = improvementBonusRecheck[401] || {};
        } else if (secondaryGunC.includes(equipId)) {
          bonusType = improvementBonusRecheck[402] || {};
        }
        break;
      case 7:
        // 爆戦
        if (fighterBomber.includes(equipId)) {
          bonusType = improvementBonusRecheck[701] || {};
        }
        break;
      case 15:
        // 増加爆雷
        if (depthCharge.includes(equipId)) {
          bonusType = improvementBonusRecheck[1501] || {};
        };
        break;
      case 25:
        // 回転翼機 (対潜値>10)
        if (slot.constInfo.api_tais > 10) {
          bonusType = improvementBonusRecheck[2501] || {};
        }
        break;
      case 26:
        // 三式指揮連絡機(対潜)
        if (slot.info.api_slotitem_id === 451) {
          bonusType = improvementBonusRecheck[2601] || {};
        }
        break;
      default:
        break;
    }
    const bonusAttackType = bonusType[attackMode] || {};

    switch (bonusAttackType.formula) {
      case 'sqrt':
        bonus += Math.sqrt(level) * bonusAttackType.factor;
        break;
      case 'multi':
        bonus += level * bonusAttackType.factor;
        break;
      default:
        break;
    }
  })
  return bonus;
}

// 夜侦补正
export const getNightTouchBonus = (nightTouch: number) => {
  switch (nightTouch) {
    case 1:
      return 5;
    case 2:
      return 7;
    default:
      return 0;
  }
}

// 夜母搭载补正
export const getNightAircraftBonus = (slotsArray: IslotState[], attack: number, isAntiLandbase: boolean) => {
  // 补正数
  let a = 0;
  let b = 0;
  slotsArray.forEach(slot => {
    const equipInfo = slot.constInfo;
    if (!nightAircraft.includes(slot.info.api_slotitem_id) || slot.carrying === 0) {
      // 非夜间机 或 搭载0：没有减蓝字      [BUG]
      attack -= equipInfo.api_houg + equipInfo.api_raig;
      a = 0;
      b = 0;
    } else {
      if (nightAircraftA.includes(slot.info.api_slotitem_id)) {
        a = 3;
        b = 0.45;
      } else {
        a = 0;
        b = 0.3;
      }
      attack += a * slot.carrying +
        b * (equipInfo.api_houg + equipInfo.api_raig + equipInfo.api_baku + equipInfo.api_tais) * Math.sqrt(slot.carrying) +
        Math.sqrt(slot.info.api_level);
      // 对陆
      if (isAntiLandbase) {
        attack = attack - equipInfo.api_raig + equipInfo.api_baku;
      }
    }
  })
  return attack;
};

// 夜间剑鱼补正
export const getNightSwordfishBonus = (slotsArray: IslotState[], attack: number, isAntiLandbase: boolean) => {
  slotsArray.forEach(slot => {
    const equipInfo = slot.constInfo;
    if (nightSwordfish.includes(slot.info.api_slotitem_id) || slot.carrying === 0) {
      // 非剑鱼 或 搭载0：没有减蓝字      [BUG]
      attack -= equipInfo.api_houg + equipInfo.api_raig;
    } else {
      attack += equipInfo.api_houg + equipInfo.api_raig + Math.sqrt(slot.carrying);
      // 对陆
      if (isAntiLandbase) {
        attack = attack - equipInfo.api_raig + equipInfo.api_baku;
      }
    }
  })
  return attack;
};

export const getConfigGunBonus = (shipState: IshipState, slotsArray: IslotState[]) => {
  const { shipNum, shipsType, shipInfo } = shipState;
  const shipType = shipsType[shipNum - 1];
  const shipID = shipInfo.api_ship_id;

  let bonus = 0;
  bonus += getCLLightGunBonus(shipType, slotsArray);
  bonus += getItalianCAGunBonus(shipID, slotsArray);

  return bonus;
};

// 轻巡轻量炮补正
const getCLLightGunBonus = (shipType: number, slotsArray: IslotState[]) => {
  if (!shipTypeCLex.includes(shipType)) return 0;

  const lightSingleGun = slotsArray.filter(slot => lightSingleGunCL.includes(slot.info.api_slotitem_id)).length;  // 軽量単装砲
  const lightTwinGun = slotsArray.filter(slot => lightTwinGunCL.includes(slot.info.api_slotitem_id)).length;      // 軽量連装砲

  return Math.sqrt(lightSingleGun) + 2 * Math.sqrt(lightTwinGun);
};

// 意重适重炮补正
const getItalianCAGunBonus = (shipID: number, slotsArray: IslotState[]) => {
  if (!shipItalianCA.includes(shipID)) return 0;

  const italianGun = slotsArray.filter(slot => slot.info.api_slotitem_id === 162).length;                         // 203mm／53 連装砲

  return Math.sqrt(italianGun);
};

// 阈值补正
export const capDamage = (damage: number, attackMode: TattackMode) => {
  let threshold = 0;
  switch (attackMode) {
    case 'day_shelling':
      threshold = THRESHOLD_DAY_SHELLING;
      break;
    case 'night':
      threshold = THRESHOLD_NIGHT;
      break;
    case 'torpedo':
      threshold = THRESHOLD_TORPEDO;
      break;
    default:
      threshold = THRESHOLD_DEFAULT;
      break;
  }
  return damage > threshold ? (threshold + Math.sqrt(damage - threshold)) : damage;
}

// 彻甲弹补正
export const getAPShellBonus = (slotsArray: IslotState[]) => {
  const mainGun = slotsArray.filter(slot => slot.constInfo.api_type[1] === 1).length;           // 主砲
  const secondaryGun = slotsArray.filter(slot => slot.constInfo.api_type[1] === 2).length;      // 副砲
  const radar = slotsArray.filter(slot => slot.constInfo.api_type[1] === 8).length;             // 水上電探
  const apShell = slotsArray.filter(slot => slot.constInfo.api_type[2] === 19).length;          // 対艦強化弾

  if (mainGun > 0) {
    if (secondaryGun > 0 && apShell > 0) {
      return 1.15;
    } else if (apShell > 0) {
      return radar > 0 ? 1.1 : 1.08;
    }
  }
  return 1;
}

// 气球补正
export const getBalloonBonus = (balloon: number) => {
  if (balloon == 1) {
    return 1.02;
  } else if (balloon == 2) {
    return 1.04;
  } else if (balloon >= 3) {
    return 1.06;
  } else {
    return 1;                 // should not happen
  }
}

/*
 * 暴击补正：推算 内部熟练度          [BUG]
 *
 * p=参与机平均内部熟练度，y=暴击补正
 * y = 1, (p < 50)
 * y = 1 + (p - 50)/1000, (50 <= p <= 116)
 * y = 1.066 + 0.03, (116 < p < 119)
 * y = 1.066 + 0.04 (119 <= p <= 120)
 * 
 * z = y + 0.1 * (p / 100)^2        含队长机时，此式可能有误
 */
const criticalMode = ['day_aircraft', 'night_swordfish', 'night_aircraft'];
// alv 反推内部熟练度
const proficiencyInner = (alv: number) => {
  if (alv == 0) return 5;
  return alv * 15 + 2;
};
// 定数C
const paramC = (alv: number) => {
  if (alv < 6) {
    return alv;
  } else if (alv == 6) {
    return 7;
  } else {
    return 10;
  }
};
// 类型转换
const airType = (type: number) => {
  switch (type) {
    case 6:
      return 'f';
    case 7:
      return 'b';
    case 8:
      return 'a';
    default:
      return 'undefined';
  }
};
// 暴击补正y
const paramY = (paramP: number) => {
  if (paramP < 50) {
    return 1;
  } else if (paramP <= 116) {
    return 1 + (paramP - 50) / 1000;
  } else if (paramP <= 119) {
    return 1.066 + 0.03;
  } else {
    return 1.066 + 0.04;
  }
};
// 队长机补正z
const paramZ = (paramP: number) => {
  return 0.1 * Math.pow(paramP / 100, 2);
};
export const getCriticalBonus = (slotsArray: IslotState[], attackMode: TattackMode, attackType: ItypeCI) => {
  const ratio = 1.5;
  if (!criticalMode.includes(attackMode) || slotsArray.length === 0) return ratio;

  if (!(<readonly string[]>daytimeCVCITypes).includes(attackType.type)) {
    // 非战爆CI
    let airRatio = 1;
    slotsArray.filter(slot => slot.carrying > 0 && slot.info.api_alv).forEach((slot, index) => {
      let airBonus = 0;
      const alv = slot.info.api_alv || 0;
      // 艦上攻撃機(艦攻)、艦上爆撃機(艦爆)、噴式戦闘爆撃機(噴式機)、水上爆撃機(水爆)、陸上攻撃機(陸攻)、大型飛行艇(二式大艇等)
      if (etAircraftCritical.includes(slot.constInfo.api_type[2])) {
        airBonus = Math.floor(Math.sqrt(proficiencyInner(alv)) + paramC(alv)) / 200;
      }
      // 一式戦 隼II型改(20戦隊)/隼III型改(熟練/20戦隊)
      if (etHayabushiS20.includes(slot.info.api_slotitem_id)) {
        airBonus = Math.floor(Math.sqrt(proficiencyInner(alv)) + paramC(alv)) / 250;
      }
      airRatio += index === 0 ? airBonus * 2 : airBonus;
    });
    return ratio * airRatio;
  } else {
    const firstAir = slotsArray[0].constInfo.api_type[2];
    const isFirst = attackType.type.includes(airType(firstAir));

    let profic = 0;
    let count = 0;
    slotsArray.forEach((slot, index) => {
      if (slot.carrying > 0 && slot.info.api_alv) {
        const isCalc = (index === 1 && attackType.type === 'f_b_a') || etAircraftCritical.includes(slot.constInfo.api_type[2]);
        if (isCalc) {
          profic += proficiencyInner(slot.info.api_alv);
          count++;
        }
      }
    });
    const averProficiency = profic / count;
    const y = paramY(averProficiency);
    if (isFirst) {
      return (y + paramZ(averProficiency)) * ratio;
    } else {
      return y * ratio;
    }
  }
};
