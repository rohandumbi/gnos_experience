export class OpexModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            opex:[
                {
                    id: 1,
                    processName: "model 1",
                    processId: 1,
                    expressionName: "expression 1",
                    expressionId: 1,
                    inUse: true,
                    isRevenue: true,
                    values: [
                        {year: 2016, value: 1},
                        {year: 2017, value: 2},
                        {year: 2018, value: 3},
                        {year: 2019, value: 4},
                        {year: 2020, value: 5},
                        {year: 2021, value: 6},
                        {year: 2022, value: 7},
                        {year: 2023, value: 8},
                        {year: 2024, value: 9},
                        {year: 2025, value: 10}
                    ]

                },
                {
                    id: 2,
                    processName: "model 2",
                    processId: 2,
                    expressionName: "expression 2",
                    expressionId: 2,
                    inUse: true,
                    isRevenue: false,
                    values: [
                        {year: 2016, value: 10},
                        {year: 2017, value: 9},
                        {year: 2018, value: 8},
                        {year: 2019, value: 7},
                        {year: 2020, value: 6},
                        {year: 2021, value: 5},
                        {year: 2022, value: 4},
                        {year: 2023, value: 3},
                        {year: 2024, value: 2},
                        {year: 2025, value: 1}
                    ]

                }
            ]
        };
    }
}
