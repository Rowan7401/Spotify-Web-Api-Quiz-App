export function createStore(initialState) {
    let state = { ...initialState };

    return {
        getState() {
            return state;
        },
        update(updater) {
            state = updater(state);
            return state;
        }
    };
}
