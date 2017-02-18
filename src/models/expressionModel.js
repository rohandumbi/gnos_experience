export class ExpressionModel {
    constructor(properties) {
        this.properties = properties;
        this.projectId = properties.projectId;
    }

    fetch(options) {
        // do some AJAX calls and return data
        this.url = "http://localhost:4567/project/" + this.projectId + "/expressions";
        $.ajax({
            url: this.url,
            type: 'GET',
            success: function (data) {
                options.success(JSON.parse(data));
            },
            error: function (data) {
                options.error(JSON.parse(data));
            }
        });
        /*return {
            expressions: [
                {
                    name: "uranus_ore",
                    id: 1,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "model='uranus' and bin>=30"

                },
                {
                    name: "saturn_ore",
                    id: 2,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "model='saturn' and bin>=30"

                },
                {
                    name: "mars_ore",
                    id: 3,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "model='mars' and bin>=30"

                },
                {
                    name: "hg_ore",
                    id: 4,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "bin>=60"

                },
                {
                    name: "lg_ore",
                    id: 5,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "bin>=30 and bin<60"

                },
                {
                    name: "ore",
                    id: 5,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "bin>=30"

                },
                {
                    name: "lump_rev",
                    id: 6,
                    is_grade: false,
                    expr_value: "s_l_fe_u",
                    filter: ""

                },
                {
                    name: "fines_rev",
                    id: 7,
                    is_grade: false,
                    expr_value: "s_f_fe_u",
                    filter: ""

                },
                {
                    name: "waste",
                    id: 8,
                    is_grade: false,
                    expr_value: "t_t_wt",
                    filter: "bin<30"

                },
                {
                    name: "sft_wt",
                    id: 9,
                    is_grade: false,
                    expr_value: "s_f_t + s_f_h2o_t",
                    filter: ""

                },
                {
                    name: "slt_wt",
                    id: 10,
                    is_grade: false,
                    expr_value: "s_l_t + s_f_h2o_t",
                    filter: "bin<30"

                },
                {
                    name: "fines_fe_d",
                    id: 11,
                    is_grade: true,
                    expr_value: "s_f_fe_u / s_f_t",
                    filter: "bin<30"

                }
            ]
         };*/
    }
}
