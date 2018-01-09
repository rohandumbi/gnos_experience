import {Overlay} from '../core/overlay';
export class CreateProductOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/createProductOverlay.html';
        var overlayTitle = 'Create Products';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.processes = options.processes;
        this.projectId = options.projectId;
        this.units = options.units;
    }

    onDomLoaded() {
        this.processes.forEach(process=> {
            var $tr = $('<tr class="selectionTableRow"></tr>');
            var $tdProcess = $('<td></td>');
            $tdProcess.append('<span><input style="margin-right:5px;" class="processName" type="checkbox" value="' + process.id + '">' + process.name + '</span>');
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
                success: function (data) {
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
        this.units.forEach(unit=> {
            var $option = $('<option data-unittype="' + unit.type + '" data-unitname="' + unit.name + '">' + unit.name + '</option>');
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
        var $allRows = this.$el.find('.selectionTableRow');
        $allRows.each((index, element)=> {
            var $processCheckbox = $(element).find('.processName');
            if ($processCheckbox.is(':checked')) {
                console.log('create product for process Id: ' + $processCheckbox.val());
            }
        });
    }
}
