export class RequiredFieldModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            fields: [
                {
                    name: 'block',
                    source: 'block',
                },
                {
                    name: 'x-centroid',
                    source: 'x-centroid',
                },
                {
                    name: 'y-centroid',
                    source: 'y-centroid',
                },
                {
                    name: 'x-length',
                    source: 'x-length',
                },
                {
                    name: 'y-length',
                    source: 'y-length',
                },
                {
                    name: 'bench_height',
                    source: 'bench_height',
                },
                {
                    name: 'pit_name',
                    source: 'pit_name',
                },
                {
                    name: 'bench_rl',
                    source: 'bench_rl'
                },
                {
                    name: 'bin',
                    source: 'bin'
                },
                {
                    name: 'quantity',
                    source: 'quantity'
                }
            ]
        };
    }
}
