'use strict';

import {get} from 'lodash';
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import StateError from './state-error';
import StateSuccess from './state-success';
import StateFail from './state-fail';
import ControlButton from '../controls/control-button';
import ImageViewer from '../image-viewer';
import {isAcceptable} from '../../modules/utils';
import {isSuccessStatus, isFailStatus, isErroredStatus, isUpdatedStatus, isIdleStatus} from '../../../common-utils';

class State extends Component {
    static propTypes = {
        state: PropTypes.shape({
            status: PropTypes.string,
            expectedImg: PropTypes.object,
            actualImg: PropTypes.object,
            diffImg: PropTypes.object
        }),
        suitePath: PropTypes.array,
        browserId: PropTypes.string,
        image: PropTypes.bool,
        error: PropTypes.object,
        gui: PropTypes.bool,
        scaleImages: PropTypes.bool,
        expand: PropTypes.string,
        acceptHandler: PropTypes.func,
        findSameDiffsHandler: PropTypes.func,
        toggleHandler: PropTypes.func
    }

    constructor(props) {
        super(props);
        const {state: {stateName}, toggleHandler} = this.props;

        toggleHandler({stateName, opened: this._shouldBeOpened()});
        this.state = {
            modalOpen: false,
            opened: stateName ? this.props.state.opened : true,
            isModalOpen: false
        };
    }

    toggleModal = () => {
        this.setState(state => ({isModalOpen: !state.isModalOpen}));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.closeIds === this.props.closeIds || !this.state.opened) {
            return;
        }

        const {suitePath, browserId, state: {stateName}, toggleHandler} = this.props;
        const fullTitle = suitePath.concat([browserId, stateName]).join(' ');
        const opened = !nextProps.closeIds.includes(fullTitle);

        if (opened !== this.state.opened) {
            toggleHandler({stateName, opened});
            this.setState({opened});
        }
    }

    _shouldBeOpened() {
        const {expand} = this.props;
        const {status} = this.props.state;

        if ((expand === 'errors' || expand === 'retries') && (isFailStatus(status) || isErroredStatus(status))) {
            return true;
        } else if (expand === 'all') {
            return true;
        }

        return false;
    }

    _drawControlButtons() {
        if (!this.props.gui) {
            return null;
        }

        const {state, state: {stateName}, acceptHandler, findSameDiffsHandler} = this.props;
        const isAcceptDisabled = !isAcceptable(state);
        const isFindSameDiffDisabled = !isFailStatus(state.status);

        return (
            <div className="state-controls">
                <ControlButton
                    label="✔ Accept"
                    isSuiteControl={true}
                    isDisabled={isAcceptDisabled}
                    handler={() => acceptHandler(stateName)}
                />
                <ControlButton
                    label="🔍 Find same diffs"
                    isSuiteControl={true}
                    isDisabled={isFindSameDiffDisabled}
                    handler={() => {
                        findSameDiffsHandler(stateName);
                        this.setState({modalOpen: true});
                    }}
                />
                <ControlButton
                    label={<img src="./../../arrows-inside.svg" />}
                    isSuiteControl={true}
                    isDisabled={isAcceptDisabled}
                    extendClassNames="button_sideblock"
                    handler={() => this.toggleModal()}
                />
            </div>
        );
    }

    _toggleState = () => {
        const {state: {stateName, opened}, toggleHandler} = this.props;

        toggleHandler({stateName, opened: !opened});
        this.setState({opened: !this.state.opened});
    }

    _getStateTitle(stateName, status) {
        const className = classNames(
            'state-title',
            {'state-title_collapsed': !this.state.opened},
            `state-title_${status}`
        );

        return stateName
            ? <div className={className} onClick={this._toggleState}>{stateName}</div>
            : null;
    }

    _getErrorPattern(error) {
        return this.props.config.errorPatterns.find(({regexp}) => error.message.match(regexp));
    }

    render() {
        const {status, expectedImg, actualImg, diffImg, stateName, diffClusters} = this.props.state;
        const {image, error, errorDetails} = this.props;
        let elem = null;

        if (!this.state.opened) {
            return (
                <Fragment>
                    <hr className="tab__separator" />
                    {this._getStateTitle(stateName, status)}
                </Fragment>
            );
        }

        if (isErroredStatus(status)) {
            elem = <StateError image={Boolean(image)} actualImg={actualImg} error={error} errorPattern={this._getErrorPattern(error)} errorDetails={errorDetails}/>;
        } else if (isSuccessStatus(status) || isUpdatedStatus(status) || (isIdleStatus(status) && get(expectedImg, 'path'))) {
            elem = <StateSuccess status={status} expectedImg={expectedImg} />;
        } else if (isFailStatus(status)) {
            elem = error
                ? <StateError image={Boolean(image)} actualImg={actualImg} error={error} errorPattern={this._getErrorPattern(error)} errorDetails={errorDetails}/>
                : <StateFail expectedImg={expectedImg} actualImg={actualImg} diffImg={diffImg} diffClusters={diffClusters}/>;
        }

        const className = classNames(
            'image-box__container',
            {'image-box__container_scale': this.props.scaleImages}
        );

        console.log('this.state.isModalOpen:', this.state.isModalOpen);

        return (
            <Fragment>
                <hr className="tab__separator"/>
                {this._getStateTitle(stateName, status)}
                {this._drawControlButtons()}
                {elem ? <div className={className}>{elem}</div> : null}
                {this.state.isModalOpen &&
                    <ImageViewer onClose={this.toggleModal} />
                }
            </Fragment>
        );
    }
}

export default connect(
    ({reporter: {gui, view: {expand, scaleImages}, closeIds, config}}) => ({gui, expand, scaleImages, closeIds, config})
)(State);
