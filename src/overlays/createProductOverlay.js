import {Overlay} from '../core/overlay';
import {ProductModel} from '../models/productModel';

export class CreateProductOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/createProductOverlay.html';
        var overlayTitle = 'Create Products';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.processes = options.processes;
        this.projectId = options.projectId;
        this.nonGradeExpressions = options.nonGradeExpressions;
        this.units = options.units;
        this.createdProducts = [];
        this.productModel = new ProductModel({projectId: this.projectId});
    }

    onDomLoaded() {
        this.processes.forEach(process=> {
            var $tr = $('<tr class="selectionTableRow"></tr>');
            var $tdProcess = $('<td></td>');
            $tdProcess.append('<input style="margin-right:5px;" class="processNameCheckbox" type="checkbox" value="' + process.id + '"/><span class="processName">' + process.name + '</span>');
            var $tdUnit = $('<td></td>');
            $tdUnit.append(this.getUnitList());
            $tr.append($tdProcess);
            $tr.append($tdUnit);
            this.$el.find('#selectionTable').append($tr);
        });
        this.bindEvents();
    }

    createNewProduct(options) {
        var promise = new Promise((resolve, reject)=> {
            var newProduct = {};
            newProduct['name'] = options.productName;
            newProduct['modelId'] = options.modelId;
            newProduct['unitType'] = options.unitType;
            newProduct['unitId'] = options.unitId;
            this.productModel.add({
                dataObject: newProduct,
                success: data => {
                    this.createdProducts.push(data);
                    resolve(data);
                },
                error: function (error) {
                    reject(error);
                }
            });
        });
        return promise;
    }

    getUnitList() {
        var $select = $('<select class="form-control associatedUnit"></select>');
        this.nonGradeExpressions.forEach(nonGradeExpression=> {
            var $option = $('<option data-unittype="2" data-unitid="' + nonGradeExpression.id + '">' + nonGradeExpression.name + '</option>');
            $select.append($option);
        });
        this.units.forEach(unit=> {
            var $option = $('<option data-unittype="1" data-unitid="' + unit.id + '">' + unit.name + '</option>');
            $select.append($option);
        });
        return $select;
    }

    bindEvents() {
        this.$el.find('.btn-close').click((e) => {
            this.trigger('closed');
        });
        this.$el.find('.btn-submit').click((e) => {
            this.handleSubmit(e);
        });
    }

    handleSubmit(e) {
        var createNewProductPromises = [];
        var $allRows = this.$el.find('.selectionTableRow');
        var productType = this.$el.find('#name').val();
        if (!productType) {
            alert('Product name cannot be empty');
            return;
        }
        $allRows.each((index, element)=> {
            var $processCheckbox = $(element).find('.processNameCheckbox');
            if ($processCheckbox.is(':checked')) {
                var $processName = $(element).find('.processName');
                var $associatedUnit = $(element).find('.associatedUnit option:selected');
                var processName = $processName.html();
                var productName = processName + '_' + productType;
                var processId = $processCheckbox.val();
                var unitType = $associatedUnit.data('unittype');
                var unitId = $associatedUnit.data('unitid');
                createNewProductPromises.push(this.createNewProduct({
                    productName: productName,
                    modelId: processId,
                    unitType: unitType,
                    unitId: unitId
                }));
                console.log('create product for process Id: ' + $processCheckbox.val() + ' process name: ' + $processName.html() + ' product name: ' + $processName.html() + '_' + productType);
            }
            Promise.all(createNewProductPromises).then(values=> {
                this.trigger('submitted', this.createdProducts);
            }).catch(error=> {
                alert(error.message);
                this.close();
            });
        });
    }
}
