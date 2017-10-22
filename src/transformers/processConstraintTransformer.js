export class ProcessConstraintTransformer {
    constructor() {
        this.ID_IDENTIFIER = 'id';
        this.EXPRESSION_IDENTIFIER = 'coefficient_name';
        this.EXPRESSION_TYPE_IDENTIFIER = 'coefficientType';
        this.INUSE_IDENTIFIER = 'inUse';
        this.GROUP_IDENTIFIER = 'selector_name';
        this.GROUP_TYPE_IDENTIFIER = 'selectionType';
        this.MAX_MIN_IDENTIFIER = 'isMax';
        this.CONSTRAINT_DATA_IDENTIFIER = 'constraintData';
    }

    transformToExcelRow(constraintObject) {
        var excelRow = constraintObject[this.ID_IDENTIFIER] + ','
            + constraintObject[this.EXPRESSION_TYPE_IDENTIFIER] + ','
            + constraintObject[this.EXPRESSION_IDENTIFIER] + ','
            + constraintObject[this.INUSE_IDENTIFIER] + ','
            + constraintObject[this.GROUP_TYPE_IDENTIFIER] + ','
            + constraintObject[this.GROUP_IDENTIFIER] + ','
            + constraintObject[this.MAX_MIN_IDENTIFIER];

        for (var property in constraintObject[this.CONSTRAINT_DATA_IDENTIFIER]) {
            if (constraintObject[this.CONSTRAINT_DATA_IDENTIFIER].hasOwnProperty(property)) {
                excelRow += ',' + constraintObject[this.CONSTRAINT_DATA_IDENTIFIER][property];
            }
        }
        return excelRow;
    }

    transformToConstraintObject() {

    }
}
