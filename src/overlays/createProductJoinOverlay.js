import {Overlay} from '../core/overlay';
import {ProductJoinModel} from '../models/productJoinModel';
export class CreateProductJoinOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/createProductJoinOverlay.html';
        var overlayTitle = 'Create Product Join';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.products = options.products;
        this.projectId = options.projectId;
        this.productJoinModel = new ProductJoinModel({projectId: options.projectId});
    }

    onDomLoaded() {
        var productList = '';
        this.products.forEach((product)=> {
            productList += '<div class="checkbox"><label><input class="productName" type="checkbox" value="' + product.name + '">' + product.name + '</label></div>'
        });
        this.$el.find('#productList').html(productList)
        this.bindEvents();
    }

    bindEvents() {
        this.$el.find('.btn-close').click((e) => {
            this.trigger('closed');
        });
        this.$el.find('.btn-submit').click((e) => {
            this.createProductJoin(e);
        });
    }

    createProductJoin(e) {
        this.producJointName = this.$el.find('#name').val().trim();
        if (!this.producJointName) {
            this.$el.find('.form-name').addClass('has-error has-feedback');
            return;
        }
        var childProducts = [];
        this.$el.find('#productList .productName:checked').each(function (event) {
            childProducts.push($(this).val());
        });
        this.addProductsToJoin(childProducts).then(productJoin=> {
            this.trigger('submitted', productJoin);
        }).catch(message=> {
            this.close();
            alert(message);
        });
    }

    addProductsToJoin(addedProducts) {
        return new Promise((resolve, reject)=> {
            if (!addedProducts || addedProducts.length === 0) {
                reject('No products selected');
            }
            var numberOfProductsAdded = 0;
            addedProducts.forEach(addedProduct => {
                var updatedProductJoin = {}
                updatedProductJoin['name'] = this.producJointName;
                updatedProductJoin['childType'] = 1;
                updatedProductJoin['child'] = addedProduct;
                this.productJoinModel.add({
                    dataObject: updatedProductJoin,
                    success: (data)=> {
                        numberOfProductsAdded++;
                        if (numberOfProductsAdded === addedProducts.length) {
                            data.productList = addedProducts;
                            resolve(data);
                        }
                    },
                    error: (error)=> {
                        reject(error.message);
                    }
                });
            });
        });
    }
}
