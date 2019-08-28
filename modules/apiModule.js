import Module from './module';

async function wrapApi(promise) {
    try {
        return await promise;
    } catch (err) {
        if (!err.content) {
            throw err;
        } else if (err.content.text) {
            throw `Error ${err.response.status}: ${err.content.text}.`;
        } else {
            throw `Error ${err.response.status}`;
        }
    }
}

export default class extends Module {
    get commandName() {
        throw new TypeError('commandName needs to be implemented by derivatives');
    }

    execute() {
        return wrapApi(this._execute());
    }
}
