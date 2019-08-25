export default class {
    initialize(terminal, api) {
        this._terminal = terminal;
        this._api = api;
    }
    
    get commandName() {
        throw new TypeError('commandName needs to be implemented by derivatives');
    }
    
    execute() {
        return this._execute();
    }

    _execute() {
        throw new TypeError('_execute needs to be implemented by derivatives');
    }
}
