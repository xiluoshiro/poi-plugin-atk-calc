import { TattackType } from "./constants";
import { IdamagedStatus } from "./utils/ships";

// store
export interface Istate {
  readonly info: Iinfo;
  readonly const: Iconst
}

export interface Iinfo {
  readonly fleets: Ifleet[];
  readonly ships: Iships;
  readonly equips: Iequips;
}

export interface Ifleet {
  readonly api_name: string;
  readonly api_id: number;
  readonly api_mission: number[];
  readonly api_ship: number[];
}

export interface Iships {
  readonly [ship_id: number]: Iship;
}

export interface Iship {
  readonly api_ship_id: number;
  readonly api_lv: number;
  readonly api_karyoku: number[];
  readonly api_slot: number[];
  readonly api_nowhp: number;
  readonly api_maxhp: number;
  readonly api_onslot: number[];
  readonly api_slot_ex: number;
  readonly api_raisou: number[];
}

export interface Iequips {
  readonly [equip_id: number]: Iequip;
}

export interface Iequip {
  readonly api_slotitem_id: number;
  readonly api_level: number;
  readonly api_alv?: number;
}

export interface Iconst {
  readonly $ships: IconstShips;
  readonly $shipTypes: IconstShipTypes;
  readonly $equips: IconstEquips;
}

export interface IconstShips {
  readonly [ship_id: number]: IconstShip;
}

export interface IconstShip {
  readonly api_name: string;
  readonly api_stype: number;
}

export interface IconstShipTypes {
  readonly [type_id: number]: IconstShipType;
}

export interface IconstShipType {
  readonly api_name: string;
}

export interface IconstEquips {
  readonly [equip_id: number]: IconstEquip;
}

export interface IconstEquip {
  readonly api_name: string;
  readonly api_type: number[];
  readonly api_tais: number;
  readonly api_houm: number;     // 命中 または 対爆
  readonly api_houg: number;     // 火力
  readonly api_raig: number;     // 雷装
  readonly api_baku: number;     // 爆装
  readonly api_saku: number;     // 索敵
}

// props
export interface IfleetState {
  ships: number[];
  formation: string;
  engagement: string;
  fleetNum: number;
  fleetType: string;
  enemyFleetType: string;
  isCombined: boolean;
  nightTouch?: number;
}

export interface IshipState {
  shipInfo: Iship;
  shipConstInfo: IconstShip;
  shipsType: number[];
  shipsDamaged: number[];
  shipsID: number[];
  shipNum: number;
  enemyType?: string;
  shipDamaged: number;
}

export interface IslotState {
  equipId: number;
  carrying: number;
  info: Iequip;
  constInfo: IconstEquip;
};

export interface IattackState {
  attackType: string;
  attackPower: number;
}

export interface ItypeCI {
  type: TattackType;
  ratio?: number;
  attackPower?: number;
  critical?: number;
  criticalAP?: number;
}
