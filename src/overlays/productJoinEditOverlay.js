import {Overlay} from '../core/overlay';
export class ProductJoinEditOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/productJoinEditOverlay.html';
        var overlayTitle = 'Edit Product Join';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.productJoin = options.productJoin;
        this.products = options.products;
    }

    onDomLoaded() {
        this.$el.find('#name').val(this.productJoin.name);
        var productList = '';
        this.products.forEach((product)=> {
            var isPresent = false;
            this.productJoin.productList.forEach((containedProductName)=> {
                if (product.name === containedProductName) {
                    isPresent = true;
                }
            });
            if (isPresent) {
                productList += '<div class="checkbox"><label><input type="checkbox" checked="checked" value="' + product.name + '">' + product.name + '</label></div>'
            } else {
                productList += '<div class="checkbox"><label><input type="checkbox" value="' + product.name + '">' + product.name + '</label></div>'
            }
        });
        this.$el.find('#productList').html(productList)
        this.bindEvents();
    }

    bindEvents() {
        this.$el.find('.btn-close').click((e) => {
            this.trigger('closed');
        });
        this.$el.find('.btn-submit').click((e) => {
            this.updateProductJoin(e);
        });
    }

    updateProductJoin(e) {
        console.log('To edit product join: ' + this.productJoin);
        this.trigger('submitted');
    }
}
