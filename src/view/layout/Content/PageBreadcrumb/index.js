import React, { useEffect, useState, useCallback } from 'react'
import {Breadcrumb} from 'antd'
import styles from './index.module.css'
import { useHistory } from 'react-router-dom'

const pageBreadcrumbConfig = {
    '/index': [], 
    '/team': ['账户中心'],
    '/auth': ['角色管理'],
    '/authEdit': ['权限管理'],
    '/shopclasses': ['商品类目'],
    '/shopBrand': ['品牌管理'],
    '/shopSpu': ['SPU管理'],
    '/shopGoods': ['商品管理'],
    '/shopCard': ['卡密管理'],
    '/merchantList': ['商户列表'],
    '/auduitedMerchant': ['商户审核'],
    '/rechargeRecord': ['充值记录'],
    '/sendGoods': ['商户列表', '分配商品', '分配'],
    '/editInterfaceGoods': ['商户列表', '分配记录', '修改分配'],
    '/interfaceOrderList': ['订单记录'],
    '/supplierManage': ['供应商管理'],
    '/cashbook': ['记账管理'],
    '/distributiveStat': ['发货统计'],
    '/revenue': ['营收统计'],
    '/shopBrand/detai': ['品牌管理', '品牌详情'],
    '/shopGoods/AddUpdata': ['商品管理', '新增商品'],
    '/shopGoods/editUpdata': ['商品管理', '修改商品'],
    '/merchantList/detail': ['商户列表', '商户详情'],
    '/merchantList/recharge': ['商户列表', '商户充值'],
    '/merchantList/distributiveGoods': ['商户列表', '分配商品'],
    '/merchantList/allocationRecord': ['商户列表', '分配记录'],
    '/auduitedMerchant/detail': ['商户审核', '商户详情'],
}

const PageBreadcrumb = () => {
    const history = useHistory()
    const [breadcrumbs, setBreadcrumbs] = useState([])

    const itemClick = useCallback(index => {
        const currentBreadcrumbLength = breadcrumbs.length - 1
        const step = index - currentBreadcrumbLength
        if (step !== 0) {
            history.go(step)
        }
    }, [history, breadcrumbs])

    useEffect(() => {
        history.listen(route => {
            const configKey = route.pathname 
            setBreadcrumbs(pageBreadcrumbConfig[configKey])
        })
        const configKey = history.location.pathname 
        setBreadcrumbs(pageBreadcrumbConfig[configKey])
    }, [history])

    return (
        <div className={`${styles.container} w bgfff pl16`}>
            <Breadcrumb className="h flex-r ai-c">
                {
                    breadcrumbs.map((item, index) => <Breadcrumb.Item 
                        key={item} 
                        className={`fs12 ${index === breadcrumbs.length - 1? 'c222': 'c666'} ${styles.item} `} 
                        onClick={() => {itemClick(index)}}
                    >{item}
                    </Breadcrumb.Item>)
                }
            </Breadcrumb>
        </div>
    )
}

export default PageBreadcrumb
