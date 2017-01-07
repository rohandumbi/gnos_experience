export class BenchConstraintModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            benchConstraints:[
                {
                    pitName: "Default",
                    inUse: true,
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
                    pitName: "b1p12",
                    inUse: true,
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

                }
            ]
        };
    }
}
