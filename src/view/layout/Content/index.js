import React, { Suspense, useEffect } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Layout, Icon } from 'antd';
import PageBreadcrumb from './PageBreadcrumb'

const TeamManager = React.lazy(() => import('../../teamManager'))
const AuthManager = React.lazy(() => import('../../authManager'))
const StoreIndex = React.lazy(() => import('../../center/index'))
const AuthEdit = React.lazy(() => import('../../authManager/authEdit'))
// 中央库存
const ShopClasses = React.lazy(() => import('../../shopAdmin/shop_classes'))
const ShopBrandManage = React.lazy(() => import('../../shopAdmin/shop_brand/home'))
const ShopGoods = React.lazy(() => import('../../shopAdmin/shop_goods/home'))
const ShopSpu = React.lazy(() => import('../../shopAdmin/shop_spu'))
const ShopCard = React.lazy(() => import('../../shopAdmin/shop_card'))

// 商户管理
const MerchantList = React.lazy(() => import('../../merchantManager/merchantList/home'))
const AuduitedMerchant = React.lazy(() => import('../../merchantManager/auditedMerchant/home'))
const RechargeRecord = React.lazy(() => import('../../merchantManager/rechargeRecord'))
const SendGoods = React.lazy(() => import('../../merchantManager/merchantList/sendGoods'))
const InterfaceOrderList = React.lazy(() => import('../../merchantManager/merchantList/interfaceOrder/orderList'))
const Cashbook = React.lazy(() => import('../../cashbook'))

// 供应商管理
const SupplierManage = React.lazy(() => import('../../supplierManage/home'))

// 分配记录统计
const Distributive = React.lazy(() => import('../../statistics/distributive'))
const Revenue = React.lazy(() => import('../../statistics/revenue'))
const EditInterFaceGoods = React.lazy(() => import('../../merchantManager/merchantList/editInterFaceGoods'))


const { Content } = Layout;

const Loading = () => {
    return (
        <div className="w h center mask">
            <Icon type="loading" className="loading" />
        </div>
    )
}

const LayoutContent = () => {
    // const [contentTitle, setContentTitle] = useState('');
    const renderHandle = (props, title, component) => {
        const Component = component
        // setContentTitle(title)
        return <Component {...props} />
    }
    useEffect(() => {
        // history.listen(e => [
        //     console.log(e)
        // ])
    }, [])
    return (
        <Content className="flex-c">
            {
                // contentTitle && <PageHeader
                //     style={{
                //         background: '#fff',
                //         border: '1px solid rgb(235, 237, 240)',
                //     }}
                //     title={contentTitle}
                // />
            }
            <PageBreadcrumb />
            <div className="flex1 bgf5 conent-container">
                <Suspense fallback={<Loading />}> 
                    <Switch>
                        <Redirect exact from="/" to={`/index`}/>
                        <Route path="/index"  render={(props) => renderHandle(props, '', StoreIndex )}/>
                        <Route path="/team" render={(props) => renderHandle(props, '账户中心', TeamManager)}/>
                        <Route path="/auth" render={(props) => renderHandle(props, '角色管理', AuthManager)}/>
                        <Route path="/authEdit" render={(props) => renderHandle(props, '权限管理', AuthEdit)}/>
                        
                        <Route path="/shopClasses" render={(props) => renderHandle(props, '商品类目',ShopClasses )}/>
                        <Route path="/shopBrand" render={(props) => renderHandle(props, '品牌管理',ShopBrandManage )}/>
                        <Route path="/shopSpu" render={(props) => renderHandle(props, 'SPU管理',ShopSpu )}/>
                        <Route path="/shopGoods" render={(props) => renderHandle(props, '商品管理',ShopGoods )}/>
                        <Route path="/shopCard" render={(props) => renderHandle(props, '卡密管理',ShopCard )}/>
                       
                        <Route path="/merchantList" render={(props) => renderHandle(props, '商户管理',MerchantList )}/>
                        <Route path="/auduitedMerchant" render={(props) => renderHandle(props, '商户审核',AuduitedMerchant )}/>
                        <Route path="/rechargeRecord" render={(props) => renderHandle(props, '充值记录',RechargeRecord )}/>
                        <Route path="/sendGoods" render={(props) => renderHandle(props, '分配商品',SendGoods )}/>
                        <Route path="/editInterFaceGoods" render={(props) => renderHandle(props, '修改分配', EditInterFaceGoods )}/>
                        <Route path="/interfaceOrderList" render={(props) => renderHandle(props, '订单记录', InterfaceOrderList )}/>
                        <Route path="/supplierManage" render={(props) => renderHandle(props, '供应商管理',SupplierManage )}/>

                        <Route path="/cashbook" render={(props) => renderHandle(props, '记账管理',Cashbook )}/>
                        {/* 统计 */}
                        <Route path="/distributiveStat" render={(props) => renderHandle(props, '发货统计', Distributive )}/>
                        <Route path="/revenue" render={(props) => renderHandle(props, '营收统计', Revenue )}/>
                    </Switch>
                </Suspense>
            </div>
        </Content>
    )
}

export default LayoutContent
