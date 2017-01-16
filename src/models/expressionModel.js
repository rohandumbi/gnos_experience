export class ExpressionModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            expressions: [
                {
                    name: "expression 1",
                    id: 1,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "bin>60"

                },
                {
                    name: "expression 2",
                    id: 2,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "bin>60"

                },
                {
                    name: "expression 3",
                    id: 3,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "bin>60"

                },
                {
                    name: "expression 4",
                    id: 4,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: ""

                },
                {
                    name: "expression 5",
                    id: 5,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: ""

                },
                {
                    name: "expression 6",
                    id: 5,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: ""

                },
                {
                    name: "expression 7",
                    id: 6,
                    is_grade: false,
                    expr_value: "s_l_fe_u",
                    filter: ""

                },
                {
                    name: "expression 8",
                    id: 7,
                    is_grade: false,
                    expr_value: "s_f_fe_u",
                    filter: ""

                },
                {
                    name: "expression 9",
                    id: 8,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: ""

                },
                {
                    name: "expression 10",
                    id: 9,
                    is_grade: false,
                    expr_value: "s_f_t + s_f_h2o_t",
                    filter: ""

                },
                {
                    name: "expression 11",
                    id: 10,
                    is_grade: false,
                    expr_value: "s_l_t + s_f_h2o_t",
                    filter: "bin<30"

                },
                {
                    name: "expression 12",
                    id: 11,
                    is_grade: true,
                    expr_value: "s_f_fe_u / s_f_t",
                    filter: "bin<30"

                }
            ]
        };
    }
}
