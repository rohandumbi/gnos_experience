export class FixedCostModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            fixedCosts:[
                {
                    name: "Ore mining cost",
                    costHead: 0,
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
                    name: "Waste mining cost",
                    costHead: 1,
                    values: [
                        {year: 2016, value: 10},
                        {year: 2016, value: 9},
                        {year: 2016, value: 8},
                        {year: 2016, value: 7},
                        {year: 2016, value: 6},
                        {year: 2016, value: 5},
                        {year: 2016, value: 4},
                        {year: 2016, value: 3},
                        {year: 2016, value: 2},
                        {year: 2016, value: 1}
                    ]

                },
                {
                    name: "Stockpile cost",
                    costHead: 2,
                    values: [
                        {year: 2016, value: 1},
                        {year: 2016, value: 2},
                        {year: 2016, value: 3},
                        {year: 2016, value: 4},
                        {year: 2016, value: 5},
                        {year: 2016, value: 6},
                        {year: 2016, value: 7},
                        {year: 2016, value: 8},
                        {year: 2016, value: 9},
                        {year: 2016, value: 10}
                    ]

                },
                {
                    name: "Stockpile reclaiming cost",
                    costHead: 3,
                    values: [
                        {year: 2016, value: 1},
                        {year: 2016, value: 2},
                        {year: 2016, value: 3},
                        {year: 2016, value: 4},
                        {year: 2016, value: 5},
                        {year: 2016, value: 6},
                        {year: 2016, value: 7},
                        {year: 2016, value: 8},
                        {year: 2016, value: 9},
                        {year: 2016, value: 10}
                    ]

                },
                {
                    name: "Truck hour cost",
                    costHead: 4,
                    values: [
                        {year: 2016, value: 10},
                        {year: 2016, value: 9},
                        {year: 2016, value: 8},
                        {year: 2016, value: 7},
                        {year: 2016, value: 6},
                        {year: 2016, value: 5},
                        {year: 2016, value: 4},
                        {year: 2016, value: 3},
                        {year: 2016, value: 2},
                        {year: 2016, value: 1}
                    ]

                }
            ]
        };
    }
}
