export class ScenarioCollection {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            scenarios:[
                {
                    name: "scenario 1",
                    id: 1,
                    startYear: 2020,
                    timePeriod: 10,
                    discountFactor: .9

                },
                {
                    name: "scenario 2",
                    id: 2,
                    startYear: 2015,
                    timePeriod: 9,
                    discountFactor: .8

                },
                {
                    name: "scenario 3",
                    id: 3,
                    startYear: 2016,
                    timePeriod: 8,
                    discountFactor: .7

                },
                {
                    name: "scenario 4",
                    id: 4,
                    startYear: 2015,
                    timePeriod: 10,
                    discountFactor: .9

                },
                {
                    name: "scenario 5",
                    id: 5,
                    startYear: 2014,
                    timePeriod: 9,
                    discountFactor: .8

                },
                {
                    name: "scenario 6",
                    id: 6,
                    startYear: 2016,
                    timePeriod: 8,
                    discountFactor: .7

                },
                {
                    name: "scenario 7",
                    id: 7,
                    startYear: 2015,
                    timePeriod: 10,
                    discountFactor: .9

                },
                {
                    name: "scenario 8",
                    id: 8,
                    startYear: 2014,
                    timePeriod: 9,
                    discountFactor: .8

                }
            ]
        };
    }
}
