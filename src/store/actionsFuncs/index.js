import { 
    LOGIN_STATUS, 
    SET_ADMIN_INFO, 
    SET_CONTENT_TITLE,
    TOGGLE_SIDER_COLLAPSED,
    SET_ADMIN_AUTH_LIST,
    ADD_PAGE_BREADCRUMB,
    REFRESH_PAGE_BREADCRUMB
} from '../actionTypes'

import { getSessionStorageItem, setSessionStorageItem } from '../../untils/storage'


export const setLoginStatus = status => {
    return {
        type: LOGIN_STATUS,
        info: status
    }
}

export const setAdminInfo = adminInfo => {
    return {
        type: SET_ADMIN_INFO,
        info: adminInfo
    }
}

export const setContentTitle = title => {
    return {
        type: SET_CONTENT_TITLE,
        info: title
    }
}

export const ToggleSiderCollapsed = () => {
    return {
        type: TOGGLE_SIDER_COLLAPSED
    }
}

export const setAdminAuthList = (authList) => {
    return {
        type: SET_ADMIN_AUTH_LIST,
        info: authList
    }
}

export const addPageBreadcrumb = breadcrumb => {
    const pageBreadcrumbs = JSON.parse(getSessionStorageItem('pageBreadcrumbs'))
    pageBreadcrumbs.push(breadcrumb)
    setSessionStorageItem('pageBreadcrumbs', JSON.stringify(pageBreadcrumbs))
    return {
        type: ADD_PAGE_BREADCRUMB,
        breadcrumb
    }
}

export const refreshPageBreadcrumb = breadcrumbs => {
    setSessionStorageItem('pageBreadcrumbs', JSON.stringify(breadcrumbs))
    return {
        type: REFRESH_PAGE_BREADCRUMB,
        breadcrumbs
    }
}
