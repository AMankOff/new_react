import React, { useEffect } from 'react'
import {combineReducers} from 'redux'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import store from '../store'
const dispatch = store.dispatch
const cacheReducer = (cacheKey, init) => (state = init, action) => {
    switch (action.type) {
        case `set${cacheKey}`:
            return action.info
        case `reset${cacheKey}`:
            const initType =  Object.prototype.toString(init).match(/[A-Z]{1}[a-z]+/)[0]
            if (initType === 'Array') {
                return [...init]
            } 
            if (initType === 'Object') {
                return {...init}
            } 
            return  init
        default:
            return state
    }
}

let actionArr = {}
let actionSetings = {}

const actionCache = (key) => {
    actionArr[key] = actionArr[key] === undefined? '': actionArr[key]
    actionSetings[key] = actionSetings[key] === undefined? {
        get() {
            return actionArr[key]
        },
        set(value) {
            actionArr[key] = value
        }
    }: actionSetings[key]
    return  actionSetings[key]
}

export const cache = (cacheKey, init, Component) => (props) => {
    let cacheData = useSelector(state => state[cacheKey] || init)
    const history = useHistory()
    let actionControl = actionCache(cacheKey)
    const setCache = info => {
        dispatch({
            type: `set${cacheKey}`,
            info
        })
    }
    const routerAction = history.action

    if (actionControl.get() !== routerAction && routerAction === 'PUSH') {
        setCache(init)
        cacheData = init
    }
    actionControl.set(routerAction)
    useEffect(() => {
        const state = store.getState()
        if (!state[cacheKey]) {
            const newReducer = cacheReducer(cacheKey, init)
            store.reset(combineReducers({
                ...store._app,
                [cacheKey]: newReducer
            }), {
                ...state,
                [cacheKey]: init
            })
            store._app = {
                ...store._app,
                [cacheKey]: newReducer
            }
        }
        return function resetPageaction () {
            if (routerAction === 'PUSH') {
                actionControl.set('')
            }
        }
    }, [routerAction, actionControl])
    return <Component cacheData={cacheData} setCache={setCache} {...props} />
}

export const resetCache = key => () => {
    dispatch({
        type: `reset${key}`
    })
}

