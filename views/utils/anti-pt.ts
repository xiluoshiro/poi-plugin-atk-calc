import { TattackMode, etJet, etSeaplane } from "../constants";
import { IslotState } from "../types";

export const checkAntiPTFP = (attackPower: number, slotsArray: IslotState[], rawAttackMode: TattackMode) => {
  let smallGun = 0, secondaryGun = 0, machineGun = 0, skilledLookouts = 0, seaplane = 0,
    bomber = 0, jet = 0, craftArmed = 0, craftAB = 0, craftArmedStar = 0;
  slotsArray.forEach(slot => {
    const { constInfo, info } = slot;
    const types = constInfo.api_type || {};

    if (types[2] === 1) smallGun++;                 // 小口径主砲
    if (types[2] === 4) secondaryGun++;             // 副砲
    if (types[2] === 21) machineGun++;              // 対空機銃
    if (types[2] === 39) skilledLookouts++;         // 水上艦要員
    if (etSeaplane.includes(types[2])) seaplane++;  // 水上機
    if (types[2] === 7) bomber++;                   // 艦上爆撃機
    if (etJet.includes(types[2])) jet++;            // 噴式機
    if (info.api_slotitem_id === 408) {             // 装甲艇(AB艇)
      craftAB++;
      craftArmedStar += info.api_level;
    }
    if (info.api_slotitem_id === 409) {             // 武装大発
      craftArmed++;
      craftArmedStar += info.api_level;
    }
  })

  let bonusFP = attackPower * 0.3 + Math.sqrt(attackPower) + 10;
  if (rawAttackMode === 'night') bonusFP *= 0.6;

  if (rawAttackMode !== 'torpedo') {
    if (smallGun >= 1) bonusFP *= 1.5;
    if (smallGun >= 2) bonusFP *= 1.4;
    if (secondaryGun >= 1) bonusFP *= 0.3;
    if (machineGun >= 1) bonusFP *= 1.2;
    if (machineGun >= 2) bonusFP *= 1.2;
    if (skilledLookouts >= 1) bonusFP *= 1.1;
    if (seaplane >= 1) bonusFP *= 1.2;
    if (bomber >= 1) bonusFP *= 1.4;
    if (bomber >= 2) bonusFP *= 1.3;
    if (jet >= 1) bonusFP *= 1.4;
    if (jet >= 2) bonusFP *= 1.3;
    if (craftArmed + craftAB >= 1) bonusFP *= 1.2;
    if (craftArmed + craftAB >= 2) bonusFP *= 1.1;
    if (craftArmedStar > 0) bonusFP *= (1 + craftArmedStar / 50);
  }

  return bonusFP;
}