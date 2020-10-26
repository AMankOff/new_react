import React,{useEffect}from 'react'
import { Layout, ConfigProvider } from 'antd';
import needLogin from '../../components/NeedLogin'
import {useDispatch } from 'react-redux'
import { setAdminAuthList } from "../../store/actionsFuncs"
import { adminAuth } from '../../service/api'

import LayoutHeader from './Header'
import LayoutSideBar from './SiderBar'
import LayoutContent from './Content'

import zh_CN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn')

const Index = props => {
    const dispatch = useDispatch()
    useEffect(() => {
        adminAuth().then(response => {
            if (response.res) {
                dispatch(setAdminAuthList(response.data.list))
            }
        })
    }, [dispatch])
    return (
        <ConfigProvider locale={zh_CN}>
            <Layout 
                className="w h"
            >
                <LayoutHeader />
                <Layout>
                    <LayoutSideBar/>
                    <LayoutContent />
                </Layout>
            </Layout>
        </ConfigProvider>
    )
}
export default needLogin(Index)
