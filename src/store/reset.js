const RESET_ACTION_TYPE = '@@RESET'

function resetReducerCreator (reducer, resetState){
    return (state, action) => {
        if (action.type === RESET_ACTION_TYPE) {
            return resetState
        } else {
            return reducer(state, action)
        }
    }
} 

const reset = (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer)
    const reset = (resetReducer, resetState) => {
        const newReducer = resetReducerCreator(resetReducer, resetState)
        store.replaceReducer(newReducer)
        store.dispatch({
            type: RESET_ACTION_TYPE
        })
    }
    return {
        ...store,
        reset
    }
}

export default reset
