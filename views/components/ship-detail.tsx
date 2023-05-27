import React, { useState } from "react";
import { connect } from 'react-redux';
import { useTranslation } from "react-i18next";
import { HTMLSelect } from '@blueprintjs/core';
import styled from 'styled-components';
import { PACKAGE_NAME, enemyTypes } from "../constants";
import { IconstEquips, Iequips, IfleetState, IshipState, Istate, ItypeCI } from "../types";
import { calcCombat } from "../utils/battle";

const Wrapper = styled.div`
  display: flex;
  fix-direction: column;
`;

const ShipCardRight = styled.div`
  margin-top: 1.5rem;
  min-width: 120px;
`;

const ShipCardDetail = styled.div`
  font-size: 14px;
`;

const ShipDetail = connect((state: Istate) => {
  return {
    infoEquips: state.info.equips || {},
    constEquips: state.const.$equips || {}
  };
})(({ fleetState, shipState, infoEquips, constEquips }:
  { fleetState: IfleetState, shipState: IshipState, infoEquips: Iequips, constEquips: IconstEquips }) => {

  const { t } = useTranslation(PACKAGE_NAME);
  const transOptions = (array: readonly string[]) => array.map(e => {
    return { label: t(e), value: e };
  });

  const [enemyType, setEnemyType] = useState(enemyTypes[0]);
  shipState.enemyType = enemyType;

  const { shipInfo } = shipState;

  const slots = [...shipInfo.api_slot] || {};
  slots.push(shipInfo.api_slot_ex);
  const slotsArray = slots.map((slot, index) => {
    const equipInfo = infoEquips[slot] || {};
    const equipConstInfo = constEquips[equipInfo.api_slotitem_id] || {};
    return {
      equipId: slot,
      carrying: shipInfo.api_onslot[index] || 0,
      info: equipInfo,
      constInfo: equipConstInfo
    };
  }).filter(slot => slot.equipId > 0);

  const makeTypeCIArr = (arr: ItypeCI[]) =>
    arr.map(typ => `${t(typ.type)}${typ.attackPower ? ('(' + typ.attackPower + '/' + typ.criticalAP + ')') : ''}`);

  const dayCombat = calcCombat(fleetState, shipState, slotsArray, 'day_shelling');
  const nightCombat = calcCombat(fleetState, shipState, slotsArray, 'night');

  return (
    <Wrapper>
      <ShipCardRight>
        <HTMLSelect
          options={transOptions(enemyTypes)}
          onChange={event => setEnemyType(event.target.value)}
        />
      </ShipCardRight>
      <ShipCardDetail>
        <div>
          {t('day_combat')}:
          <HTMLSelect
            iconProps={{ style: { display: 'none' } }}
            options={makeTypeCIArr(dayCombat)}
            minimal
          />
        </div>
        <div>
          {t('night_combat')}:
          <HTMLSelect
            iconProps={{ style: { display: 'none' } }}
            options={makeTypeCIArr(nightCombat)}
            minimal
          />
        </div>
      </ShipCardDetail>
    </Wrapper>
  );
});

export default ShipDetail;
