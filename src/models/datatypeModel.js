export class DatatypeModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {
            fields: [
                {
                    name: 'block',
                    datatype: 'Group By(Text)',
                    weightedunit: ''
                },
                {
                    name: 'model',
                    datatype: 'Group By(Text)',
                    weightedunit: ''
                },
                {
                    name: 'pit_name',
                    datatype: 'Group By(Text)',
                    weightedunit: ''
                },
                {
                    name: 'bench_rl',
                    datatype: 'Group By(Text)',
                    weightedunit: ''
                },
                {
                    name: 'bin',
                    datatype: 'Group By(Numeric)',
                    weightedunit: ''
                },
                {
                    name: 't_t',
                    datatype: 'Unit',
                    weightedunit: ''
                },
                {
                    name: 't_fe',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_al',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_si',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_p',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_mn',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_loi',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_s',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_h20_t',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_loi',
                    datatype: 'Grade',
                    weightedunit: 't_t'
                },
                {
                    name: 't_vol',
                    datatype: 'Unit',
                    weightedunit: ''
                },
                {
                    name: 'r_f_t',
                    datatype: 'Unit',
                    weightedunit: ''
                }
            ]
        };
    }
}
