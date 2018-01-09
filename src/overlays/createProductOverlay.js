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
            this.updateProduct(e);
        });
    }

    updateProduct(e) {
        console.log('TODO: update product');
    }
}
