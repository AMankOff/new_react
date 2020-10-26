
export const config = [
    {
        title: '账户中心',
        icon: 'team',
        path: '/team',
    },
    {
        title: '权限管理',
        icon: 'cluster',
        path: '/auth'
    },
    {
        title: '中央库存',
        icon: 'bank',
        list: [
            {
                path: '/shopclasses',
                title: '商品类目',
            },
            {
                path: '/shopBrand',
                title: '品牌管理',
            },
            {
                path: '/shopSpu',
                title: 'spu管理',
            },
            {
                path: '/shopGoods',
                title: '商品管理',
            },
            {
                path: '/shopCard',
                title: '卡密管理',
            }
        ]
    },
    {
        title: '商户管理',
        icon: 'shopping-cart',
        list: [
            {
                path: '/merchantList',
                title: '商户列表',
            },
            {
                path: '/rechargeRecord',
                title: '商户充值',
            },
            {
                path: '/auduitedMerchant',
                title: '商户审核',
            }
        ]
    },
    {
        title: '供应商管理',
        icon: 'shopping-cart',
        path: '/supplierManage',
    }
]
