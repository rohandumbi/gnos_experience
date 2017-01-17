export class CapexCollection {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            capexCollection:[
                {
                    name: "capex 1",
                    id: 1,
                    scenario_id: 1

                },
                {
                    name: "capex 2",
                    id: 2,
                    scenario_id: 1

                },
                {
                    name: "capex 3",
                    id: 3,
                    scenario_id: 1

                }
            ]
        };
    }
}
