export class PitModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            pits:[
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

                },
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

                },
                {
                    name: "pit 6",
                    id: 6,
                    expressionId: 6,
                    expressionName: "ore",
                    filter:""

                },
                {
                    name: "pit 7",
                    id: 7,
                    expressionId: 7,
                    expressionName: "ore",
                    filter:""

                },
                {
                    name: "pit 8",
                    id: 8,
                    expressionId: 8,
                    expressionName: "hg_ore",
                    filter:""

                },
                {
                    name: "pit 9",
                    id: 9,
                    expressionId: 9,
                    expressionName: "hg_ore",
                    filter:""

                }
            ]
        };
    }
}
