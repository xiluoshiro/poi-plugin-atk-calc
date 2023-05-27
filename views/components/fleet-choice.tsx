import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { map } from 'lodash';
import { Button, ButtonGroup, ControlGroup, HTMLSelect, Tag } from '@blueprintjs/core';
import ShipView from './ship-view';
import { Istate, Ifleet } from '../types';
import { PACKAGE_NAME, formations, engagements, fleetTypes, enemyFleetTypes, combinedFormations } from '../constants';

const FleetChoice = connect((state: Istate) => {
  return {
    infoFleets: state.info.fleets || {}
  };
})(({ infoFleets }: { infoFleets: Ifleet[] }) => {
  const { t } = useTranslation(PACKAGE_NAME);

  const [fleetNum, setFleetNum] = useState(1);                                // 当前选中舰队，1-based
  const [fleetType, setFleetType] = useState(fleetTypes[0]);                  // 舰队类型
  const [enemyFleetType, setEnemyFleetType] = useState(enemyFleetTypes[0]);   // 敌舰队类型
  const [formation, setFormation] = useState(formations[0]);                  // 阵型
  const [engagement, setEngagement] = useState(engagements[0]);               // 航向

  const transOptions = (array: readonly string[]) => array.map(e => {
    return { label: t(e), value: e };
  });

  const isCombined = fleetType !== 'single_fleet';
  // 第3 4舰队不能选择联合
  const fleetTypeArray = fleetNum <= 2 ? fleetTypes : ['single_fleet'];
  const formationArray = (fleetNum <= 2 && fleetType !== 'single_fleet') ? combinedFormations : formations;

  return (
    <div>
      <ButtonGroup fill>
        {map(infoFleets, fleet => (
          <Button
            intent={fleet.api_mission[0] > 0 ? 'primary' : 'success'}   // 是否远征中
            text={fleet.api_name}
            onClick={() => {
              // 第3 4舰队不能选择联合，转为单舰队
              setFleetNum(fleet.api_id);
              if (fleet.api_id > 2 && isCombined) {
                setFleetType('single_fleet');
                setFormation('line_ahead');
              }
            }}
            active={fleet.api_id == fleetNum}
            fill
          />
        ))}
      </ButtonGroup>

      <ControlGroup fill style={{ marginTop: '5px', marginBottom: '5px', height: '40px', lineHeight: '40px', fontSize: '14px' }} >
        {t('Fleet_type') + ': '}&nbsp;
        <HTMLSelect
          iconProps={{ style: { paddingTop: '6px' } }}
          options={transOptions(fleetTypeArray)}
          onChange={event => {
            // 更改舰队时，同步更改阵型选择
            const value = event.target.value;
            if (value === 'single_fleet') {
              setFormation('line_ahead');
            } else if (fleetType === 'single_fleet') {
              setFormation(combinedFormations[0]);
            }
            setFleetType(value);
          }}
          disabled={fleetNum > 2}
        />

        &nbsp;{t('Enemy_fleet_type') + ': '}&nbsp;
        <HTMLSelect
          iconProps={{ style: { paddingTop: '6px' } }}
          options={transOptions(enemyFleetTypes)}
          onChange={event => setEnemyFleetType(event.target.value)}
        />

        &nbsp;{t('Formation') + ': '}&nbsp;
        <HTMLSelect
          iconProps={{ style: { paddingTop: '6px' } }}
          options={transOptions(formationArray)}
          onChange={event => setFormation(event.target.value)}
        />

        &nbsp;{t('Engagement') + ': '}&nbsp;
        <HTMLSelect
          iconProps={{ style: { paddingTop: '6px' } }}
          options={transOptions(engagements)}
          onChange={event => setEngagement(event.target.value)}
        />
      </ControlGroup>

      <ShipView
        fleetState={{
          ships: infoFleets[fleetNum - 1].api_ship.filter(e => e !== -1),
          formation,
          engagement,
          fleetNum,
          fleetType,
          isCombined,
          enemyFleetType
        }}
      />
    </div>
  );
});

export default FleetChoice;
