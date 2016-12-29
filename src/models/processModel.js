export class ProcessModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            processes:[
                {
                    name: "process1",
                    processes: [
                        {
                            name: "process11",
                            processes: []
                        },
                        {
                            name: "process12",
                            processes: []
                        },
                        {
                            name: "process13",
                            processes: []
                        }
                    ],
                    products: []
                },
                {
                    name: "process2",
                    processes: [
                        {
                            name: "process21",
                            processes: []
                        },
                        {
                            name: "process22",
                            processes: []
                        },
                        {
                            name: "process23",
                            processes: []
                        }
                    ],
                    products: []
                },
                {
                    name: "process3",
                    processes: [
                        {
                            name: "process31",
                            processes: []
                        },
                        {
                            name: "process32",
                            processes: []
                        }
                    ],
                    products: []
                }
            ]
        };
    }
}
