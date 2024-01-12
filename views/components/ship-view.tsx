import React from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import styled from 'styled-components';
import ShipDetail from './ship-detail';
import { Istate, Iships, IconstShips, IconstShipTypes, IfleetState, Iequips, IconstEquips } from '../types';
import { getDamagedStatus } from '../utils/ships';

const ShipCard = styled.div`
  margin-top: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const ShipCardLeft = styled.div`
  width: 120px;
`;
const ShipState = styled.div`
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ShipName = styled.div`
  font-size: 20px;
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const HR = styled.hr`
  display: block;
  margin: 0;
  padding: 0;
`;

const ShipView = connect((state: Istate) => {
  return {
    infoShips: state.info.ships || {},
    constShips: state.const.$ships || {},
    constShipTypes: state.const.$shipTypes || {},
    infoEquips: state.info.equips || {},
    constEquips: state.const.$equips || {}
  };
})(({ fleetState, infoShips, constShips, constShipTypes, infoEquips, constEquips }:
  { fleetState: IfleetState, infoShips: Iships, constShips: IconstShips, constShipTypes: IconstShipTypes, infoEquips: Iequips, constEquips: IconstEquips }) => {
    
  const { ships } = fleetState;

  const shipsInfo = ships.map(ship => infoShips[ship]) || {};
  const shipsType = ships.map(ship => {                               // 船只类型
    const shipInfo = infoShips[ship] || {};
    const ship_id = shipInfo.api_ship_id;

    const shipConstInfo = constShips[ship_id] || {};
    return shipConstInfo.api_stype;
  }) || {};
  const shipsDamaged = ships.map(ship => {                            // 船只损伤
    const shipInfo = infoShips[ship] || {};
    return getDamagedStatus(shipInfo.api_nowhp, shipInfo.api_maxhp);
  }) || {};
  const shipsID = ships.map(ship => {                                 // 船只ID
    const shipInfo = infoShips[ship] || {};
    return shipInfo.api_ship_id;
  });

  // 舰队内有效装备
  let nightTouch = -1;
  let balloon = 0;
  shipsInfo.forEach(ship => {
    const slots = [...ship.api_slot];
    slots.push(ship.api_slot_ex);
    slots.forEach(slot => {
      const equipInfo = infoEquips[slot] || {};
      const equipConstInfo = constEquips[equipInfo.api_slotitem_id] || {};
      const types = equipConstInfo.api_type || {};
      if (types[3] === 50) {                                          // 夜侦
        if (equipConstInfo.api_houm) {
          nightTouch = Math.max(nightTouch, equipConstInfo.api_houm);
        }
      }
      if (equipInfo.api_slotitem_id == 513) {                         // 阻塞気球
          balloon++;
      }
    })
  })
  const fleetEquip = {nightTouch, balloon};
  
  return (
    <div>
      {map(ships, (_, index) => {
        
        const shipInfo = shipsInfo[index];
        const shipConstInfo = constShips[shipInfo.api_ship_id] || {};
        const shipType = constShipTypes[shipsType[index]] || {};

        return (
          <>
            <HR />
            <ShipCard>
              <ShipCardLeft>
                <ShipState>Lv.{shipInfo.api_lv} {shipType.api_name}</ShipState>
                <ShipName>{shipConstInfo.api_name}</ShipName>
              </ShipCardLeft>
              <ShipDetail
                fleetState={{...fleetState, fleetEquip}}
                shipState={{
                  shipInfo,
                  shipConstInfo,
                  shipDamaged: getDamagedStatus(shipInfo.api_nowhp, shipInfo.api_maxhp),
                  shipsType,
                  shipsDamaged,
                  shipsID,
                  shipNum: index + 1
                }}
                />
            </ShipCard>
          </>
        );
      })}
      <div>

      </div>
    </div>
  );
});

export default ShipView;
