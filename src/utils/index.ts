export async function wrapApi<T>(promise: Promise<T>): Promise<T> {
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
