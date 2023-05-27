import { damagedStatus } from "../constants";

export interface IdamagedStatus {
  typeID: number;
  typeName: string;
};

export const getDamagedStatus = (nowhp: number, maxhp: number) => {
  if (nowhp > 0) {
    const ratio = (maxhp - nowhp) / maxhp;
    return ratio * 4;
  } else {
    return 99;
  }
};
// return {typeID: ratio * 4, typeName: damagedStatus[Math.floor(ratio * 4)]};
// return {typeID: 99, typeName: damagedStatus[4]};
