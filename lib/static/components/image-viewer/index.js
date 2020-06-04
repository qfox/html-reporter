import React, {Component} from 'react';
import Modal from '../modals/modal';
import Header from './header';
import ImageState from './image-state';

import './style.css';

export default class ImageViewer extends Component {
    render() {
        const {onClose} = this.props;

        return (
            <Modal className="image-viewer">
                <Header onClose={onClose} />
                <ImageState />
            </Modal>
        );
    }
}
