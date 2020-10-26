import { createStore, compose, combineReducers } from 'redux'
import app from './reducers'
import reset from './reset'

const initReducer = combineReducers(app)
const store = createStore(initReducer, compose(reset))
store._app = app

export default store
