import {Overlay} from '../core/overlay';
import {ProductJoinModel} from '../models/productJoinModel';
export class EditProductJoinOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/editProductJoinOverlay.html';
        var overlayTitle = 'Edit Product Join';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.productJoin = options.productJoin;
        this.products = options.products;
        this.projectId = options.projectId;
        this.productJoinModel = new ProductJoinModel({projectId: options.projectId});
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
                productList += '<div class="checkbox"><label><input class="productName" type="checkbox" checked="checked" value="' + product.name + '">' + product.name + '</label></div>'
            } else {
                productList += '<div class="checkbox"><label><input class="productName" type="checkbox" value="' + product.name + '">' + product.name + '</label></div>'
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
        this.$el.find("#searchInput").on("keyup", (e)=> {
            var value = $(e.currentTarget).val().toLowerCase();
            this.$el.find("#productList div.checkbox").filter((index, element)=> {
                $(element).toggle($(element).find('.productName').val().toLowerCase().indexOf(value) > -1)
            });
        });
    }

    updateProductJoin(e) {
        console.log('To edit product join: ' + this.productJoin);
        var existingProductList = this.productJoin.productList;
        var editedProductList = [];
        this.$el.find('#productList .productName:checked').each(function (event) {
            editedProductList.push($(this).val());
        });
        var _ = require('underscore');
        let addedProducts = _.difference(editedProductList, existingProductList);
        let removedProducts = _.difference(existingProductList, editedProductList);
        var addProductsToJoinPromise = this.addProductsToJoin(addedProducts);
        var removeProductsFromJoinPromise = this.removeProductsFromJoin(removedProducts);
        Promise.all([addProductsToJoinPromise, removeProductsFromJoinPromise])
            .then(()=> {
                this.trigger('submitted', {addedProducts: addedProducts, removedProducts: removedProducts});
            })
            .catch(reason=> {
                alert(reason);
                this.close();
            });
    }

    addProductsToJoin(addedProducts) {
        return new Promise((resolve, reject)=> {
            var numberOfProductsToAdd = addedProducts.length;
            if (numberOfProductsToAdd === 0) {
                resolve();
            }
            var numberOfProductsAdded = 0;
            addedProducts.forEach(addedProduct => {
                var updatedProductJoin = {}
                updatedProductJoin['name'] = this.productJoin.name;
                updatedProductJoin['childType'] = 1;
                updatedProductJoin['child'] = addedProduct;
                this.productJoinModel.add({
                    dataObject: updatedProductJoin,
                    success: (data)=> {
                        numberOfProductsAdded++;
                        this.productJoin.productList.push(addedProduct);
                        if (numberOfProductsAdded === numberOfProductsToAdd) {
                            resolve();
                        }
                    },
                    error: (error)=> {
                        reject(error.message);
                    }
                });
            });
        });
    }

    removeProductsFromJoin(removedProducts) {
        return new Promise((resolve, reject)=> {
            var numberOfProductsToDelete = removedProducts.length;
            if (numberOfProductsToDelete === 0) {
                resolve();
            }
            var numberOfProductsDeleted = 0;
            removedProducts.forEach(removedProduct => {
                this.productJoinModel.delete({
                    url: 'http://localhost:4567/project/' + this.projectId + '/productjoins/' + this.productJoin.name + '/product',
                    id: removedProduct,
                    success: (data)=> {
                        numberOfProductsDeleted++;
                        this.productJoin.productList.splice(this.productJoin.productList.indexOf(removedProduct), 1);
                        if (numberOfProductsDeleted === numberOfProductsToDelete) {
                            resolve();
                        }
                    },
                    error: (error)=> {
                        reject(error.message);
                    }
                });
            })
        });
    }
}
