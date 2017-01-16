export class ProcessModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            processes:[
                {
                    name: "uranus_cf",
                    modelId: 1,
                    processes: [
                        {
                            name: "uranus_lg",
                            modelId: 2,
                            processes: []
                        },
                        {
                            name: "uranus_hg",
                            modelId: 3,
                            processes: []
                        }
                    ],
                    products: []
                },
                {
                    name: "saturn_cf",
                    modelId: 5,
                    processes: [
                        {
                            name: "saturn_lg",
                            modelId: 6,
                            processes: []
                        },
                        {
                            name: "saturn_hg",
                            modelId: 7,
                            processes: []
                        }
                    ],
                    products: []
                },
                {
                    name: "mars_cf",
                    modelId: 9,
                    processes: [
                        {
                            name: "mars_hg",
                            modelId: 10,
                            processes: []
                        },
                        {
                            name: "mars_lg",
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
