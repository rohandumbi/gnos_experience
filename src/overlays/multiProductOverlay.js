import {Overlay} from '../core/overlay';
export class MultiProductOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/multiProductOverlay'
        var mergedOptions = $.extend(options, {contentUrl: contentUrl});
        super(mergedOptions);
    }

    onDomLoaded() {
        console.log('My DOM loaded');
    }
}
