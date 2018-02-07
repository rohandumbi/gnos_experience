import {Overlay} from '../core/overlay';
export class MultiProductOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/multiProductOverlay.html';
        var overlayTitle = 'Create Multiple Products';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
    }

    onDomLoaded() {
        console.log('My DOM loaded');
    }
}
