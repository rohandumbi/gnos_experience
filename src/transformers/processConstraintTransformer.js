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
        var excelRow = constraintObject[this.ID_IDENTIFIER] + '\t'
            + constraintObject[this.EXPRESSION_TYPE_IDENTIFIER] + '\t'
            + constraintObject[this.EXPRESSION_IDENTIFIER] + '\t'
            + constraintObject[this.INUSE_IDENTIFIER] + '\t'
            + constraintObject[this.GROUP_TYPE_IDENTIFIER] + '\t'
            + constraintObject[this.GROUP_IDENTIFIER] + '\t'
            + constraintObject[this.MAX_MIN_IDENTIFIER];

        for (var property in constraintObject[this.CONSTRAINT_DATA_IDENTIFIER]) {
            if (constraintObject[this.CONSTRAINT_DATA_IDENTIFIER].hasOwnProperty(property)) {
                excelRow += '\t' + constraintObject[this.CONSTRAINT_DATA_IDENTIFIER][property];
            }
        }
        return excelRow;
    }

    transformToConstraintObject() {

    }
}
