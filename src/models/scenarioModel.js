export class ScenarioModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            name: "scenario 1",
            id: 1,
            startYear: 2020,
            timePeriod: 10,
            discountFactor: .9

        }
    }
}
