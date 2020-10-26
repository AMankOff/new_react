export const setStorageItem = (key, val) => {
    localStorage.setItem(key, val)
    return true
}

export const getStorageItem = key => {
    return localStorage.getItem(key)
}

export const clearStorageItem = key => {
    localStorage.removeItem(key)
}

export const clearStorage = () => {
    localStorage.clear()
}

// session storage 
export const setSessionStorageItem = (key, val) => {
    sessionStorage.setItem(key, val)
    return true
}

export const getSessionStorageItem = key => {
    return sessionStorage.getItem(key)
}

export const clearSessionStorageItem = key => {
    sessionStorage.removeItem(key)
}

export const clearSessionStorage = () => {
    sessionStorage.clear()
}