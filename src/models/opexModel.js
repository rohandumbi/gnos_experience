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
                    processName: "uranus_hg_ore",
                    processId: 1,
                    expressionName: "expression 1",
                    expressionId: 1,
                    inUse: true,
                    isRevenue: false,
                    values: [
                        {year: 2020, value: 4},
                        {year: 2021, value: 4},
                        {year: 2022, value: 4},
                        {year: 2023, value: 4},
                        {year: 2024, value: 4},
                        {year: 2025, value: 4},
                        {year: 2026, value: 4},
                        {year: 2027, value: 4},
                        {year: 2028, value: 4},
                        {year: 2029, value: 4}
                    ]

                },
                {
                    id: 2,
                    processName: "uranus_lg_ore",
                    processId: 2,
                    expressionName: "expression 2",
                    expressionId: 2,
                    inUse: true,
                    isRevenue: false,
                    values: [
                        {year: 2020, value: 5},
                        {year: 2021, value: 5},
                        {year: 2022, value: 5},
                        {year: 2023, value: 5},
                        {year: 2024, value: 5},
                        {year: 2025, value: 5},
                        {year: 2026, value: 5},
                        {year: 2027, value: 5},
                        {year: 2028, value: 5},
                        {year: 2029, value: 5}
                    ]

                }
            ]
        };
    }
}
