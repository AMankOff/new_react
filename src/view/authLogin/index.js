import React, { useEffect } from 'react'
import { queryParse } from '../../browserHistory/index'
import { useLocation, useHistory } from "react-router-dom"
import { codeLogin } from '../../service/api/index'
import { setStorageItem } from '../../untils/storage'

const AuthLogin  = () => {
    const location = useLocation()
    const history = useHistory()
    const anthCode = encodeURIComponent(queryParse(location).code || '') 
    useEffect(() => {
        codeLogin({
            params:{
                code: anthCode
            }
        }).then(response => {
            if (response.res) {
                setStorageItem('token', response.data.token)
                history.replace('/index')
            } else {
                history.replace('/login')
            }
        })
    }, [anthCode, history])
    return <></>
}

export default AuthLogin
