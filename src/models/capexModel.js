export class CapexModel {
    constructor(properties) {
        this.properties = properties;
        this.id = this.properties.id;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            id: 1,
            name: "capex 1",
            capexInstances:[
                {
                    name: "instance 1",
                    id: 1,
                    groupName: 'process 1',
                    groupType: 1,
                    capex: 10000,
                    expansionCapacity: 200000

                },
                {
                    name: "instance 2",
                    id: 2,
                    groupName: 'process join',
                    groupType: 2,
                    capex: 20000,
                    expansionCapacity: 300000

                },
                {
                    name: "instance 3",
                    id: 3,
                    groupName: 'pit 1',
                    groupType: 3,
                    capex: 30000,
                    expansionCapacity: 400000

                },
                {
                    name: "instance 4",
                    id: 4,
                    groupName: 'pit group',
                    groupType: 4,
                    capex: 40000,
                    expansionCapacity: 500000
                }
            ]
        };
    }
}
