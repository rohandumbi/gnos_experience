export class WelcomeViewModel {
    constructor(properties) {
        this.properties = properties;
    }

    fetch() {
        // do some AJAX calls and return data
        return {message: 'GNOS!!! New Age Mining'};
    }
}
