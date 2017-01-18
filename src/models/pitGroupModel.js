export class PitGroupModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            pitGroups:[
                {
                    name: "group 1",
                    modelId: 1,
                    pits: [
                        {
                            name: "pit 1",
                            id: 1,
                            expressionId: 1,
                            expressionName: "uranus_ore",
                            filter:""

                        },
                        {
                            name: "pit 2",
                            id: 2,
                            expressionId: 2,
                            expressionName: "saturn_ore",
                            filter:""

                        }
                    ]
                },
                {
                    name: "group 2",
                    modelId: 5,
                    pits: [
                        {
                            name: "pit 3",
                            id: 3,
                            expressionId: 3,
                            expressionName: "mars_ore",
                            filter:""

                        },
                        {
                            name: "pit 4",
                            id: 4,
                            expressionId: 4,
                            expressionName: "hg_ore",
                            filter:""

                        },
                        {
                            name: "pit 5",
                            id: 5,
                            expressionId: 5,
                            expressionName: "lg_ore",
                            filter:""

                        }
                    ],
                    products: []
                }
            ]
        };
    }
}
