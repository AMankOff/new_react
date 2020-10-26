import { createBrowserHistory } from 'history'
import { parse } from 'qs'

export const history =  createBrowserHistory();

export const queryParse = (location) => {
    return parse(location.search.slice(1))
}
