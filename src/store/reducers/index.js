
import { LOGIN_STATUS, 
    SET_ADMIN_INFO, 
    SET_CONTENT_TITLE,
    TOGGLE_SIDER_COLLAPSED,
    SET_ADMIN_AUTH_LIST,
    ADD_PAGE_BREADCRUMB,
    REFRESH_PAGE_BREADCRUMB
} from '../actionTypes'

import {getSessionStorageItem} from '../../untils/storage'

const loginStatus = (state = false, action) => {
    switch (action.type) {
        case LOGIN_STATUS:
          return action.info
        default:
          return state
      }
}

const adminInfo = (state = {
    id: 0,
    mobile: '',
    email: '',
    real_name: '',
    status: 1,
    created_at: '',
    updated_at: ''
}, action) => {
    switch (action.type) {
        case SET_ADMIN_INFO:
          return action.info
        default:
          return state
      }
}

const contentTitle = (state = '', action) => {
    switch (action.type) {
        case SET_CONTENT_TITLE:
          return action.info
        default:
          return state
    }
}

const siderCollapsed = (state = false, action) => {
    switch (action.type) {
        case TOGGLE_SIDER_COLLAPSED:
          return !state
        default:
          return state
    }
}

const adminAuthList = (state = [], action) => {
  switch (action.type) {
    case SET_ADMIN_AUTH_LIST:
      return action.info
    default:
      return state
  }
}


const currentPageBreadcrumbs = getSessionStorageItem('pageBreadcrumbs')
const initPageBreadcrumb = currentPageBreadcrumbs || []
const pageBreadcrumb = (state = initPageBreadcrumb, action) => {
  switch (action.type) {
    case ADD_PAGE_BREADCRUMB:
      return [...state, action.breadcrumb]
    case REFRESH_PAGE_BREADCRUMB:
      return action.breadcrumb
    default:
      return state
  }
}

const app = {
    loginStatus,
    adminInfo,
    contentTitle,
    siderCollapsed,
    adminAuthList,
    pageBreadcrumb
}

export default app
