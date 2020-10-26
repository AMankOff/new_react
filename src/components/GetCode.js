import React, {useState, useEffect, useRef} from 'react'
import { Button, message } from 'antd'
import { getLoginCode } from '../service/api'

const GetCode = ({phone, url, time = 60}) => {
    const btnContents = ['获取验证码', '重新获取']
    let [btnStatus, setBtnStatus] = useState(0)
    let [btnDisable, setBtnDisable] = useState(false)
    let [timeCount, setTimeCount] = useState(time)
    let [loading, setLoading] = useState(false)
    let timerRef = useRef()
    let btnContent = `${btnContents[btnStatus]} ${timeCount === 0 || timeCount === time? '': '( '+ timeCount +' )'}`
    if ( loading ) {
        btnContent = ''
    }
    let timeCounter = null
    const timeCounterStart = () => {
        setTimeCount(timeCount - 1)
        timerRef.current = timeCounter = setInterval(() => {
            setTimeCount(timeCount => {
                if (timeCount === 0) {
                    clearInterval(timeCounter)
                    setBtnDisable(false)
                    return time
                }
                return timeCount - 1
            })
        }, 1000)
    }
    const btnClick = () => {
        const phoneReg = /^(13|14|15|17|18|16|19)[0-9]{9}$/
        if (!phoneReg.test(phone)) {
            message.error('请输入正确的手机号')
            return 
        }
        setLoading(true)
        getLoginCode({
            params: {
                mobile: phone
            }
        }).then(response => {
            setLoading(false)
            if (response.res) {
                setBtnDisable(true)
                setBtnStatus(1)
                timeCounterStart()
            }
        })
    }
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current)
        }
    }, [])
    return (
            <Button 
                disabled={btnDisable} 
                type="primary" 
                ghost
                onClick={btnClick}
                loading={loading}
                className="w h"
                >
                {btnContent}
            </Button>
    )
}

export default GetCode
