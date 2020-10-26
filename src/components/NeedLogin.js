import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom"
import { setLoginStatus, setAdminInfo } from '../store/actionsFuncs'
import { checkLogin } from '../service/api'

const needLogin = component => {
    const Component = component
    const NeedLogin = props => {
        let loginStatus = useSelector(state => state.loginStatus)
        let dispatch = useDispatch()
        let history = useHistory();
        useEffect(() => {
            // dispatch(setLoginStatus(true))
            checkLogin({
                params: {},
                errHandle: false
            })
            .then(response => {
                if (response.res) {
                    dispatch(setLoginStatus(true))
                    dispatch(setAdminInfo(response.data))
                } else {
                    history.replace('/login')
                }
            })
        }, [dispatch, history])
        if (loginStatus) {
            return <Component {...props}/>
        }
        return <div></div>
    }
    return NeedLogin
}

export default needLogin
