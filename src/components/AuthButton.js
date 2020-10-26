import React from 'react'
import { useSelector } from 'react-redux'

const AuthButton = ({authid, children}) => {
    const adminAuthList = useSelector(state => state.adminAuthList)
    const hasCurrentAuthen = adminAuthList.indexOf(authid) !== -1
    return hasCurrentAuthen && <>
        {children}
    </>
}

export default AuthButton
