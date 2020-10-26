import { request } from './request'
import { message } from 'antd';
import { history } from '../../browserHistory'

const errControl = (resData, errHandle = true) => {
    if (errHandle && !resData.res) {
        if (resData.message.code === 403 || resData.message.code === 401) {
            history.replace('/login')
        } else {
            message.error(resData.message.mes)
        }
    }
    return resData
}

const reqDataInit = {
    params: {},
    errHandle: true
}

// 登录
export const login = async (reqData = reqDataInit) => {
    const resData = await request('api/login', reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 登出
export const logOut = async (reqData = reqDataInit) => {
    const resData = await request('api/logout', reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取登录验证码
export const getLoginCode = async (reqData = reqDataInit) => {
    const resData = await request('api/captcha', reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 验证是否登录
export const checkLogin = async (reqData = reqDataInit) => {
    const resData = await request('api/profile', reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取店铺列表
export const getShopList = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/list', reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 新建店铺
export const addShop = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/add', reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 店铺详情
export const getShopInfo = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/info', reqData.params)
    return errControl(resData, reqData.errHandle)
}

export const editShopInfo = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/edit', reqData.params)
    return errControl(resData, reqData.errHandle)
}


// 获取类目列表
export const getShopClassList = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/getClassifyList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 添加类目数据
export const addShopClass = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/addClassify',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 修改类目数据
export const editShopClass = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/updateClassify',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 修改类目状态
export const editShopClassStatus = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/updateClassifyStatus',reqData.params)
    return errControl(resData, reqData.errHandle)
}


// 获取品牌列表
export const getShopBrandList = async (reqData = reqDataInit) => {
    const resData = await request('api/brand/getBrandList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 添加品牌数据
export const addShopBrand = async (reqData = reqDataInit) => {
    const resData = await request('api/brand/addBrand',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 修改品牌数据
export const editShopBrand = async (reqData = reqDataInit) => {
    const resData = await request('api/brand/updateBrand',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 删除品牌数据
export const delShopBrand = async (reqData = reqDataInit) => {
    const resData = await request('api/brand/delBrand',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取品牌详情
export const getShopBrandDetail = async (reqData = reqDataInit) => {
    const resData = await request('api/brand/getBrandInfo',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取积分购品牌列表
export const getJFGBrandList = async (reqData = reqDataInit) => {
    const resData = await request('api/brand/getJfgBrandList',reqData.params)
    return errControl(resData, reqData.errHandle)
}


// 获取账户列表
export const getAdminList = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/account',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 新建账户
export const addAdmin = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/account/add',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 编辑账户
export const editAdmin = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/account/edit',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 禁用/启用账户
export const editAdminStatus = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/account/status',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取角色信息
export const getRoleInfo = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/role/info',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 编辑角色
export const editRole = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/role/edit',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 新建角色
export const addRole = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/role/add',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 角色列表
export const getRoleList = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/role',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 角色权限
export const getRoleAuth = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/role/permission',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 角色授权
export const setRoleAuth = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/role/authority',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 角色无分页列表
export const selectRole = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/role/selectRole',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 权限树
export const getAuthTree = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/permission',reqData.params)
    return errControl(resData, reqData.errHandle)
}


// 获取品牌SPU
export const getShopSpuList = async (reqData = reqDataInit) => {
    const resData = await request('api/spu/getSpuList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 添加品牌SPU
export const addShopSpu = async (reqData = reqDataInit) => {
    const resData = await request('api/spu/addSpu',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 修改品牌SPU
export const editShopSpu = async (reqData = reqDataInit) => {
    const resData = await request('api/spu/updateSpu',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 删除品牌SPU
export const delShopSpu = async (reqData = reqDataInit) => {
    const resData = await request('api/spu/delSpu',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 根据类目ID 获取品牌列表
export const getBrandListByClassifyId = async (reqData = reqDataInit) => {
    const resData = await request('api/brand/getBrandListByClassifyId',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 根据品牌ID 获取SPU列表
export const getSPUListByBrandId = async (reqData = reqDataInit) => {
    const resData = await request('api/spu/getSpuListByBrandId',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取品牌列表  无分页
export const selectBrandList = async (reqData = reqDataInit) => {
    const resData = await request('api/brand/selectBrandList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 根据品牌ID 获取积分购商品列表
export const getJfgGoodsList = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/getJfgGoodsList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 根据品牌ID SPUID 获取商品列表
export const getGoodsListByBrandIdSPU = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/getGoodsListByBrand',reqData.params)
    return errControl(resData, reqData.errHandle)
}


// 获取商品列表
export const getShopGoodsList = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/getGoodsList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 添加商品
export const addShopGoods = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/addGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取商品详情
export const getGoodsInfo = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/getGoodsInfo',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取商品库存
export const getGoodsStockNum = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/getGoodsStockNum',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 修改商品信息
export const editShopGoods = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/updateGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 删除商品
export const delShopGoods = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/delGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 库存导出
export const exportGoodsLog = async (reqData = reqDataInit) => {
    const resData = await request('api/goodsexport/addExportGoodsLog',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取商户列表
export const merchantList = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/listPage',reqData.params)
    return errControl(resData, reqData.errHandle)
}


// 商户余额
export const getBanlance = async (reqData = reqDataInit) => {
    const resData = await request('api/recharge/getBalance',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 商户充值
export const recharge = async (reqData = reqDataInit) => {
    const resData = await request('api/recharge/recharge',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 商户商品分配记录  下单模式
export const getShopGoodsLog = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/getShopGoodsLog',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 商户分配商品列表  提货模式
export const getPickShopGoodsLog = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/getPickShopGoodsLog',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 商户分配商品详情 
export const getOrderDistributeInfo = async (reqData = reqDataInit) => {
    const resData = await request('api/orders/getOrderDistributeInfo',reqData.params)
    return errControl(resData, reqData.errHandle)
}

//分配订单补发
export const getDistributionReissue = async (reqData = reqDataInit) => {
    const resData = await request('api/orders/reissue',reqData.params)
    return errControl(resData, reqData.errHandle)
}

//分配进度
export const getDistributionProgress = async (reqData = reqDataInit) => {
    const resData = await request('api/orders/getDeliveryProgress',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 商户待审核列表
export const getShopAuditList = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/audit/list',reqData.params)
    return errControl(resData, reqData.errHandle)
}
// 审核商户
export const auditMerchant = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/audit',reqData.params)
    return errControl(resData, reqData.errHandle)
}
// 审核商户详情
export const auditMerchantInfo = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/audit/info',reqData.params)
    return errControl(resData, reqData.errHandle)
}


//获取充值记录列表
export const getRechargeList = async (reqData = reqDataInit) => {
    const resData = await request('api/recharge/getRechargeList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 充值记录统计
export const RechargeStatistic = async (reqData = reqDataInit) => {
    const resData = await request('api/recharge/statistic',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 商户分配商品 下单模式
export const distributiveShopGoods = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/addShopGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}
// 商户分配商品 提货模式
export const distributiveSubmitShopOrder = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/submitShopOrder',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 商户分配商品列表
export const distributiveShopGoodsList = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/distributionGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 供应商管理列表
export const getProvider = async (reqData = reqDataInit) => {
    const resData = await request('api/provider',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 新增供应商
export const setProviderAdd = async (reqData = reqDataInit) => {
    const resData = await request('api/provider/add',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 修改供应商
export const setProviderEdit = async (reqData = reqDataInit) => {
    const resData = await request('api/provider/edit',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 供应商与商品关联
export const addProviderGoods = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/addProviderGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 供应商下的商品
export const getProviderGoodsList = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/getProviderGoodsList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 供应商下的商品的状态  上架/下架
export const updateProviderGoodsStatus = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/updateProviderGoodsStatus',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 左侧菜单
export const layoutMenu = async (reqData = reqDataInit) => {
    const resData = await request('api/layout/menu',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 当前用户权限
export const adminAuth = async (reqData = reqDataInit) => {
    const resData = await request('api/permission',reqData.params)
    return errControl(resData, reqData.errHandle)
}
//供应商列表  无分页，无查询条件
export const providerListNoPage = async (reqData = reqDataInit) => {
    const resData = await request('api/provider/list',reqData.params)
    return errControl(resData, reqData.errHandle)
}

//库存列表
export const getStockList = async (reqData = reqDataInit) => {
    const resData = await request('api/goodsstock/getStockList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

//库存统计
export const getStockStatistical = async (reqData = reqDataInit) => {
    const resData = await request('api/goodsstock/getStockStatistical',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 同步登录信息
export const codeLogin = async (reqData = reqDataInit) => {
    const resData = await request('api/autoLogin',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 切换到中央库存
export const getAuthorityCode = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/login/getCode',reqData.params, 'GET')
    return errControl(resData, reqData.errHandle)
}

// 获取节点列表
export const getPermissionList = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/permission/getPermissionList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 增加节点
export const addPermission = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/permission/addPermission',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 编辑节点
export const editPermission = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/permission/editPermission',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 节点排序
export const sortPermission = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/permission/sortPermission',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 节点禁用
export const disablePermission = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/permission/disablePermission',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 选择商户
export const selectShop = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/selectShop',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 选择商户
export const selectGoods = async (reqData = reqDataInit) => {
    const resData = await request('api/goods/selectGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 分配记录统计
export const getDistributeList = async (reqData = reqDataInit) => {
    const resData = await request('api/orders/getDistributeList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 操作人列表
export const getAccountList = async (reqData = reqDataInit) => {
    const resData = await request('api/auth/account/selectAccount',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 记账列表
export const getOfflineOrderList = async (reqData = reqDataInit) => {
    const resData = await request('api/orders/getOfflineOrderList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 删除记账记录
export const delOfflineOrder = async (reqData = reqDataInit) => {
    const resData = await request('api/orders/delOfflineOrder',reqData.params)
    return errControl(resData, reqData.errHandle)
}


// -商品售卖排行列表
export const getGoodsSoldRankingList = async (reqData = reqDataInit) => {
    const resData = await request('api/goodsstatistic/getGoodsSoldRankingList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 昨日统计
export const getYesterdayTotalStatistic = async (reqData = reqDataInit) => {
    const resData = await request('api/goodsstatistic/getYesterdayTotalStatistic',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 营收统计-获取营收统计查询列表
export const getTotalStatisticList = async (reqData = reqDataInit) => {
    const resData = await request('api/goodsstatistic/getTotalStatisticList',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 营收统计-获取营收统计查询列表【时间对比】
export const getTotalStatisticCompareList = async (reqData = reqDataInit) => {
    const resData = await request('api/goodsstatistic/getTotalStatisticCompareList',reqData.params)
    return errControl(resData, reqData.errHandle)
}


// 营收统计-统计列表结果导出为Excel
export const exportStatisticExcel = async (reqData = reqDataInit) => {
    const resData = await request('api/goodsstatistic/exportStatisticExcel',reqData.params)
    if (resData.toString() !== "[object Blob]")  {
        return errControl(resData, reqData.errHandle)
    }
    return resData
}

// 接口模式分配商品
export const addShopInterfaceGoods = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/addShopInterfaceGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 获取接口配置参数
export const getShopInterfaceConfigInfo = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/getShopInterfaceConfigInfo',reqData.params)
    return errControl(resData, reqData.errHandle)
}

// 添加/修改 接口拿货配置
export const addShopInterfaceConfig = async (reqData = reqDataInit) => {
    const resData = await request('api/shop/addShopInterfaceConfig',reqData.params)
    return errControl(resData, reqData.errHandle)
}

//接口模式商品列表
export const getShopInterfaceGoodsList = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/getShopInterfaceGoodsList',reqData.params)
    return errControl(resData, reqData.errHandle)
}


//接口模式分配详情
export const getDistributionInfo = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/getDistributionInfo',reqData.params)
    return errControl(resData, reqData.errHandle)
}


//接口模式分配修改
export const editDistributionGoods = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/editDistributionGoods',reqData.params)
    return errControl(resData, reqData.errHandle)
}

//接口模式修改记录
export const getDistributionLog = async (reqData = reqDataInit) => {
    const resData = await request('api/shopgoods/getDistributionLog',reqData.params)
    return errControl(resData, reqData.errHandle)
}

//接口订单列表
export const interfaceGetOrderList = async (reqData = reqDataInit) => {
    const resData = await request('api/interface/getOrderList',reqData.params)
    return errControl(resData, reqData.errHandle)
}
