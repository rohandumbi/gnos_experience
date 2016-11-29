export class AllFieldsModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            fields: [
                {
                    name: 'block'
                },
                {
                    name: 'x-centroid'
                },
                {
                    name: 'y-centroid'
                },
                {
                    name: 'x-length'
                },
                {
                    name: 'y-length'
                },
                {
                    name: 'bench_height'
                },
                {
                    name: 'pit_name'
                },
                {
                    name: 'bench_rl'
                },
                {
                    name: 'bin'
                },
                {
                    name: 'quantity'
                }
            ]
        };
    }
}
