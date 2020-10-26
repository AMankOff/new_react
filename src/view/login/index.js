import React, { useState } from 'react'
import { Form, Icon, Input, Button, Row, Col } from 'antd';
import GetCode from '../../components/GetCode'
import { useHistory } from 'react-router-dom'
import styles from './index.module.css'
import centerImg from './images/login.png'
import { login as loginReq } from '../../service/api'
import { setStorageItem } from '../../untils/storage'

const Login = ({ form }) => {
    const { getFieldDecorator } = form;
    let [phoneVal, setPhoneVal] = useState('')
    let history = useHistory()
    const handleSubmit = (e) => {
        e.preventDefault();
        form.validateFields((err, values) => {
            if (!err) {
                loginReq({
                    params: {
                        mobile: values.phone,
                        captcha: values.code
                    }
                })
                .then((response) => {
                    let resData = response.data
                    if (response.res) {
                        setStorageItem('token', resData.token)
                        history.replace('/index')
                    }
                })
            }
        })
    }
    const checkPhone = (rule, value, callback) => {
        const phoneReg = /^(13|14|15|17|18|16|19)[0-9]{9}$/
        if (!phoneReg.test(value)) {
            callback('请输入正确的手机号')
        } else {
            callback()
        }
    }
    const phoneChange = e => {
        setPhoneVal(e.currentTarget.value) 
    }
    return (
        <div className="w h center bgf5">
            <Row className={styles.contianer + ' bgfff'} >
                <Col span={12}>
                    <img src={centerImg} alt="" className="w "/>
                </Col>
                <Col span={12} className="pt40">
                    <Form onSubmit={handleSubmit} className={"flex1 flex-c ai-c pt40 " + styles.inContianer} autoComplete="off">
                        <div className="fs48 pt40 mt40 mb40">
                            考拉Sup
                        </div>
                        <Form.Item  className="w pt20">
                            {getFieldDecorator('phone', {
                                validateTrigger: "onBlur",
                                rules: [
                                    { required: true, validator: checkPhone, message: '请输入正确的手机号' },
                                ],
                            })(
                                <Input
                                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="请输入手机号"
                                    size="large"
                                    maxLength={11}
                                    onChange={phoneChange}
                                />,
                            )}
                        </Form.Item>
                        <div className="flex-r w">
                            <Form.Item  className="flex1">
                                {getFieldDecorator('code', {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        { required: true, message: '请输入验证码' },
                                        { pattern: /[0-9]{6}/, message: '请输入验正确的数字验证码' },
                                    ]
                                })(
                                    <Input
                                        prefix={<Icon type="message" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        placeholder="请输入验证码"
                                        size="large"
                                        maxLength={6}
                                    />,
                                )}
                            </Form.Item>
                            <div className={styles.time}>
                                <GetCode phone={phoneVal} />
                            </div>
                        </div>
                        
                        <Form.Item className="w">
                            <Button type="primary" htmlType="submit" className={'w mt40 ' + styles.h50 }>
                                登录
                            </Button>
                        </Form.Item>
                    </Form>  
                </Col>
            </Row>              
        </div>
    )
}

export default Form.create({ name: 'login' })(Login);
