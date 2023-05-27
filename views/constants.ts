// 插件名
export const PACKAGE_NAME = 'poi-plugin-atk-calc';

// 舰队种类，阵型，航向
export const fleetTypes: readonly string[] = ['single_fleet', 'carrier_combined_fleet', 'surface_combined_fleet', 'transport_combined_fleet'];
export const enemyFleetTypes: readonly string[] = ['single_fleet', 'combined_fleet'];
export const formations: readonly string[] = ['line_ahead', 'double_line', 'diamond', 'echelon', 'line_abreast', 'vanguard'];
export const combinedFormations: readonly string[] = ['cruising_formation_1', 'cruising_formation_2', 'cruising_formation_3', 'cruising_formation_4'];
export const engagements: readonly string[] = ['parallel', 'head_on', 'crossing_t_adv', 'crossing_t_da'];
export const enemyTypes: readonly string[] = ['anti_surface', 'anti_surface_armor', 'anti_landbase_artillery', 'anti_landbase_isolated_island', 'anti_landbase_habour_summer',
  'anti_landbase_supply_depot', 'anti_landbase_soft_skin', 'anti_landbase_anchorage_vacances', 'anti_landbase_dock', 'anti_landbase_supply_depot_iii_vacances',
  'anti_pt'];

// 阵型补正
export const ECHELON_6V12 = 0.6;
export const VANGUARD_TOP = 0.5;

// 舰种
export const shipTypeCV: readonly number[] = [7, 11, 18];                 // 軽空母, 正規空母, 装甲空母
export const shipTypeSS: readonly number[] = [13, 14];                    // 潜水艦, 潜水空母
export const shipTypeBB: readonly number[] = [8, 9, 10];                  // 巡洋戦艦, 戦艦, 航空戦艦
export const shipTypeLikeCV: readonly number[] = [352, 460, 717, 900];    // 速吸，山汐丸
export const shipTypeNightZuiun: readonly number[] = [3, 6, 10, 16];      // 軽巡, 航巡, 航戦, 水母
export const shipTypeCLex: readonly number[] = [3, 4, 21];                // 軽巡, 雷巡 , 練巡

// 细分舰种
export const shipItalianCA: readonly number[] = [358, 448, 496, 361, 449];              // 意重巡
export const shipZuiunAttack: readonly number[] = [553, 554];                           // 伊势型改二
export const shipBig7: readonly number[] = [601, 1496, 913, 918, 571, 576, 80, 275, 541, 81, 276, 573];     // Big Seven

// 装备类
// api_type[2]: 艦上爆撃機、艦上攻撃機、噴式戦闘爆撃機
export const etAircraftShelling: readonly number[] = [7, 8, 57];
// 爆撃機: api_type[2]: 艦上爆撃機、噴式戦闘爆撃機
export const etBomber: readonly number[] = [7, 57];
// id: 後期型潜水艦魚雷：後期型艦首魚雷(6門) 熟練、後期型53cm艦首魚雷(8門)、21inch艦首魚雷発射管6門(後期型)、潜水艦後部魚雷発射管4門(後期型)、後期型艦首魚雷(4門) 熟練
export const etSSNewTorpedo: readonly number[] = [213, 214, 383, 441, 443, 457, 461];
// api_type[2]: 水上机
export const etSeaplane: readonly number[] = [10, 11];
// id: 瑞雲系
export const etZuinun: readonly number[] = [26, 79, 80, 81, 207, 237, 322, 323, 490];
// id: 彗星(六三四空)系
export const etSuisei634: readonly number[] = [291, 292, 319];
// id: 二重測距儀系
export const etRadarYamato: readonly number[] = [142, 460];
// api_type[2]: 噴式機
export const etJet: readonly number[] = [56, 57, 58, 59];

// 船只损伤
export const damagedStatus: readonly string[] = ['healthy', 'slightly', 'moderately', 'heavily', 'sunken'];

// 攻击类型
const attackModes = ['day_shelling', 'day_aircraft', 'torpedo', 'night', 'asw', 'night_aircraft', 'night_swordfish', 'no_attack'] as const;
export type TattackMode = typeof attackModes[number];

// 夜母: Saratoga Mk.II、赤城改二戊、加賀改二戊、龍鳳改二戊
export const nightCV = [545, 599, 610, 883];
// 夜間作戦航空要員
export const nightOfficials = [258, 259];
// 夜間Swordfish空母: Ark Royal
export const nightSwordfishCV = [393, 515];
// 夜間Swordfish: Swordfish、Swordfish Mk.II(熟練)、Swordfish Mk.III(熟練)
export const nightSwordfish = [242, 243, 244];
// 夜間砲撃空母: Graf Zeppelin、Saratoga(未改造)、加賀改二護、大鷹型改二
export const nightShellingCV = [353, 432, 433, 646, 529, 536, 889];
// 夜偵: 九八式水上偵察機(夜偵)、零式水上偵察機11型乙改(夜偵)、Loire 130M
export const nightSeaplane = [102, 469, 471];
// 夜戦・夜攻
export const nightFighter = [254, 255, 338, 339, 473];
export const nightTorpedoBomber = [257, 344, 345, 373, 374, 389];
export const nightAircraftA = [...nightFighter, ...nightTorpedoBomber];
// SF系・岩井爆戦・光電管彗星
export const nightAircraftB = [...nightSwordfish, 154, 320];
// 夜間飛行機
export const nightAircraft = [...nightAircraftA, ...nightAircraftB];

// 対陸艦爆: 彗星一二、九九二二、南山、F4U、FM2、SB2C、Ju87C
export const antilandbaseDB = [319, 320, 391, 392, 148, 233, 474, 277, 420, 421, 64, 305, 306];
// 軽量単装砲：14cm単装砲、15.2cm単装砲
export const lightSingleGunCL = [4, 11];
// 軽量連装砲：14cm連装砲、14cm連装砲改、15.2cm連装砲、15.2cm連装砲改、15.2cm連装砲改二、6inch 連装速射砲 Mk.XXI、Bofors15.2cm連装砲 Model1930
// 、Bofors 15cm連装速射砲 Mk.9 Model 1938、Bofors 15cm連装速射砲 Mk.9改＋単装速射砲 Mk.10改 Model 1938
export const lightTwinGunCL = [119, 310, 65, 139, 407, 359, 303, 360, 361];

// 改修补正：230514
export const improvementBonus = {
  1: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },         // 小口径主砲
  2: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },         // 中口径主砲
  3: { day_shelling: { formula: 'sqrt', factor: 1.5 }, night: { formula: 'sqrt', factor: 1 } },       // 大口径主砲
  4: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },         // 副砲 recheck
  5: { torpedo: { formula: 'sqrt', factor: 1.2 }, night: { formula: 'sqrt', factor: 1 } },            // 魚雷
  7: { day_shelling: { formula: 'multi', factor: 0.2 }, asw: { formula: 'multi', factor: 0.2 } },     // 艦上爆撃機 recheck
  8: { day_shelling: { formula: 'multi', factor: 0.2 }, asw: { formula: 'multi', factor: 0.2 } },     // 艦上攻撃機
  14: { day_shelling: { formula: 'sqrt', factor: 0.75 }, asw: { formula: 'sqrt', factor: 1 } },       // ソナー
  15: { day_shelling: { formula: 'sqrt', factor: 0.75 }, asw: { formula: 'sqrt', factor: 1 } },       // 爆雷投射機 recheck
  // 16: 増設バルジ?
  18: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 対空強化弾
  19: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 対艦強化弾
  // 20: VT信管?
  21: { day_shelling: { formula: 'sqrt', factor: 1 }, torpedo: { formula: 'sqrt', factor: 1.2 } },    // 対空機銃
  22: { night: { formula: 'sqrt', factor: 1 } },                                                    // 特殊潜航艇
  24: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 上陸用舟艇
  25: { asw: { formula: 'multi', factor: 0.2 } },                                                   // オートジャイロ recheck
  26: { asw: { formula: 'multi', factor: 0.2 } },                                                   // 対潜哨戒機 recheck
  29: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 探照灯
  32: { day_shelling: { formula: 'sqrt', factor: 1 }, torpedo: { formula: 'multi', factor: 0.2 }, night: { formula: 'multi', factor: 0.2 } },   // 潜水艦魚雷
  34: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 司令部施設
  35: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 航空要員
  36: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 高射装置
  37: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 対地装備
  // 38: 大口径主砲(II)?
  39: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 水上艦要員
  40: { day_shelling: { formula: 'sqrt', factor: 0.75 }, asw: { formula: 'sqrt', factor: 1 } },       // 大型ソナー
  42: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 大型探照灯
  46: { day_shelling: { formula: 'sqrt', factor: 1 }, night: { formula: 'sqrt', factor: 1 } },        // 特型内火艇
} as IimprovementBonus;
// recheck
export const improvementBonusRecheck = {
  401: { day_shelling: { formula: 'multi', factor: 0.2 }, night: { formula: 'multi', factor: 0.2 } }, // 副砲(分類B)
  402: { day_shelling: { formula: 'multi', factor: 0.3 }, night: { formula: 'multi', factor: 0.3 } }, // 副砲(分類C)
  // 701: 爆戦
  1501: { asw: { formula: 'sqrt', factor: 1 } },                                                    // 増加爆雷
  2501: { asw: { formula: 'multi', factor: 0.3 } },                                                 // 回転翼機 (対潜値>10)
  2601: { asw: { formula: 'multi', factor: 0.3 } },                                                 // 三式指揮連絡機(対潜)
} as IimprovementBonus;
// 副砲(分類B): 12.7cm連装高角砲、8cm高角砲、10cm連装高角砲(砲架)、8cm高角砲改＋増設機銃、10cm連装高角砲改＋増設機銃、10cm連装高角砲群 集中配備
export const secondaryGunB = [10, 66, 71, 220, 275, 464];
// 副砲(分類C): 15.5cm三連装副砲、15.5cm三連装副砲改、15.2cm三連装砲、15.5cm三連装副砲改二、5inch連装砲(副砲配置)集中配備
export const secondaryGunC = [12, 234, 247, 463, 467];
// 爆戦: 零式艦戦62型(爆戦)、零戦62型(爆戦/岩井隊)、零式艦戦63型(爆戦)、零式艦戦64型(複座KMX搭載機)、零式艦戦64型(熟練爆戦)
export const fighterBomber = [60, 154, 219, 447, 487];
// 増加爆雷: 九五式爆雷、二式爆雷、対潜短魚雷(試作初期型)、Hedgehog(初期型)、二式爆雷改二
export const depthCharge = [226, 227, 378, 439, 488];

interface IimprovementBonus {
  [index: number]: {
    [mode: string]: { formula: string; factor: number; }
  };
}

// 攻击类型
const commonCITypes = ['normal_attack', 'double_attack', 'no_attack'] as const;
const nightCITypes = ['m_m_m', 'm_m_s', 't_t', 'm_t',
  'dd_m_t_r', 'dd_t_sl_r', 'dd_t_t_tsl', 'dd_t_d_tsl', 'm_m_nz', 'ss_st_sr', 'ss_st_st'] as const;
const nightAircraftCITYpes = ['nf_nf_ntb', 'nf_ntb', 'n_ps', 'nf_np_np'] as const;
const daytimeCITypes = ['m_m_ap', 'm_s_ap', 'm_s_r', 'm_s', 'm_suisei', 'm_zuiun'] as const;
export const daytimeCVCITypes = ['f_b_a', 'b_b_a', 'b_a'] as const;
const specialAttackTypes = ['special_attack_kongo_iic', 'special_attack_nelson', 'special_attack_nagato',
  'special_attack_colorado', 'special_attack_yamato_2', 'special_attack_yamato_3'] as const;

type TcommonTypes = typeof commonCITypes[number];
export type TnightCITypes = typeof nightCITypes[number] | TcommonTypes;
export type TnightAircraftCITYpes = typeof nightAircraftCITYpes[number] | TcommonTypes;
export type TdaytimeCVCITypes = typeof daytimeCVCITypes[number] | TcommonTypes;
export type TdaytimeCITypes = typeof daytimeCITypes[number] | TdaytimeCVCITypes | TcommonTypes;
export type TspecialAttackTypes = typeof specialAttackTypes[number]
export type TattackType = TnightCITypes | TnightAircraftCITYpes | TdaytimeCITypes | TspecialAttackTypes;

// 阈值
export const THRESHOLD_DAY_SHELLING = 220;
export const THRESHOLD_TORPEDO = 180;
export const THRESHOLD_NIGHT = 360;
export const THRESHOLD_DEFAULT = 170;
