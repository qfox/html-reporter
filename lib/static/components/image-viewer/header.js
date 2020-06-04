import React from 'react';

import ControlButton from '../controls/control-button';
import SwitcherRetry from '../section/switcher-retry';

export default function Header({onClose}) {
    return (
        <header className="image-viewer__header container">
            <div className="state-controls">
                <ControlButton
                    label="▼"
                    handler={() => {}}
                />
                <ControlButton
                    label="▲"
                    handler={() => {}}
                />
                <ControlButton
                    label="✔ Accept"
                    isSuiteControl={true}
                    handler={() => {}}
                    // isDisabled={isAcceptDisabled}
                    // handler={() => acceptHandler(stateName)}
                />
                <SwitcherRetry onChange={() => {}} retryIndex={0} testResults={[{status: 'fail'}, {status: 'error'}]} />
                <ControlButton
                    label={<img src="./../../arrows-inside.svg" />}
                    isSuiteControl={true}
                    isDisabled={false}
                    extendClassNames="button_sideblock"
                    handler={() => onClose()}
                />
            </div>
            header
        </header>
    );
}
