export class ProcessModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            processes:[
                {
                    name: "model 1",
                    modelId: 1,
                    processes: [
                        {
                            name: "model 2",
                            modelId: 2,
                            processes: []
                        },
                        {
                            name: "model 3",
                            modelId: 3,
                            processes: []
                        },
                        {
                            name: "model 4",
                            modelId: 4,
                            processes: []
                        }
                    ],
                    products: []
                },
                {
                    name: "model 5",
                    modelId: 5,
                    processes: [
                        {
                            name: "model 6",
                            modelId: 6,
                            processes: []
                        },
                        {
                            name: "model 7",
                            modelId: 7,
                            processes: []
                        },
                        {
                            name: "model 8",
                            modelId: 8,
                            processes: []
                        }
                    ],
                    products: []
                },
                {
                    name: "model 9",
                    modelId: 9,
                    processes: [
                        {
                            name: "model 10",
                            modelId: 10,
                            processes: []
                        },
                        {
                            name: "model 11",
                            modelId: 11,
                            processes: []
                        }
                    ],
                    products: []
                }
            ]
        };
    }
}
