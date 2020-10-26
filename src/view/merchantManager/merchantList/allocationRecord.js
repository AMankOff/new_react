import React, { useState, useEffect, useCallback} from 'react'
import {history, queryParse} from "../../../browserHistory"
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../../components/AuthButton'
import DeliveryProgress from '../component/deliveryProgress'
import "./index.css";
import {getUrlParam} from "../../../untils/untilsFn"
import { cache } from '../../../components/CacheData'
import {Table, Card, Breadcrumb, Tabs, Modal, Statistic, List, message } from "antd";
import { getShopGoodsLog,getPickShopGoodsLog,getOrderDistributeInfo, getShopInterfaceGoodsList, getDistributionLog, getDistributionReissue } from "../../../service/api"
const { TabPane } = Tabs;
const { confirm } = Modal;
// 分配详情
const ShowSupplierManage=({visible,data,hideFn})=>{
   const [detailData,setDetailData]=useState([]);
   const Empty_description_info="暂无数据";
   const [isLoadingShow,setIsLoadingShow]=useState(false);
   useEffect(()=>{
    const getData=async()=>{ 
        if(data.id){
            setIsLoadingShow(true);
            await getOrderDistributeInfo({
                params:{
                    associated_id:data.id,
                    type:data.type
                }
            }).then((response) => {
                if (response.res) {
                    let resData = response.data.list;
                    setIsLoadingShow(false);
                    setDetailData(resData);
                }
            });
        }
    };  // 获取数据 
    getData();
   },[data])

   const columnsDetail = [
        {
            title: '主体',
            dataIndex: 'company_name',
            render:((item)=>{
                return (
                    <>
                      <div className="ellipsis_more" title={item}>{item}</div>
                    </>
                )
            })
        },
        {
            title: '供应商',
            dataIndex: 'provider_name',
            render:((item)=>{
                return (
                    <>
                      <div className="ellipsis_more" title={item}>{item}</div>
                    </>
                )
            })
        },
        {
            title: '分配数量',
            dataIndex: 'num'
        },
        {
            title: '分配总面值',
            dataIndex: 'count_price',
            render:((count_price)=>{
                return (
                    <Statistic
                    title=""
                    value={count_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        }
    ];

   return (
       <Modal
            title="查看详情"
            visible={visible}
            footer={null}
            onCancel={()=>hideFn()}
       >
           <GetEmpty descriptions={Empty_description_info}>
           <Table
                rowKey={record=>record.id}
                dataSource={detailData}
                columns={columnsDetail}
                bordered={true}
                loading={isLoadingShow}
                pagination={false}
           />
            </GetEmpty>
       </Modal>
   )
}

// 接口模式分配记录

const InterfaceGoodsHandleLog = ({ logId, visible, toggleVisible }) => {
    const [detailData,setDetailData]=useState([]);
    const [isLoadingShow,setIsLoadingShow]=useState(false);
    useEffect(()=>{
        if(logId){
            setIsLoadingShow(true);
            getDistributionLog({
                params:{
                    shop_interface_goods_id: logId
                }
            }).then((response) => {
                if (response.res) {
                    let resData = response.data.list;
                    setIsLoadingShow(false);
                    setDetailData(resData);
                }
            });
        }
    },[logId])

    const columnsDetail = [
            {
                title: '商品名称',
                dataIndex: 'goods_title',
            },
            {
                title: '折扣（%）',
                dataIndex: 'discount',
                
            },
            {
                title: '售卖价（元）',
                dataIndex: 'decr_price',
                render:(item => <Statistic
                    title=""
                    value={item}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                />
                )
            },
            {
                title: '主体名称',
                width: 200,
                render(row) {
                    const list = row.provicer_info
                    const lng = list.length - 1
                    return list.map((item, index) => index < lng?`${item.company_name}, `: item.company_name)
                }
            },
            {
                title: '供应商名称',
                width: 200,
                dataIndex:'provicer_info',
                render(list) {
                    const lng = list.length - 1
                    return list.map((item, index) => index < lng?`${item.provider_name}, `: item.provider_name)
                }
            },
            {
                title: '修改时间',
                dataIndex: 'updated_at'
            },
            {
                title: '操作人',
                dataIndex: 'real_name'
            },
        ];

    return (
        <Modal
                title="查看修改记录"
                visible={visible}
                footer={null}
                width={1100}
                onCancel={toggleVisible}
        >
            <Table
                    rowKey={record=>record.id}
                    dataSource={detailData}
                    columns={columnsDetail}
                    bordered={true}
                    loading={isLoadingShow}
                    pagination={false}
            />
        </Modal>
    )
}

const cacheDataKey="allocationParams";  // 默认传参KEY
//const refreshData=resetCache(cacheDataKey);

let initListParams={
    activeKEY: '2',
    page: 1,  // 请求页码
    per_page: 20 // 默认
}


// 获取数据列表展示
const GetListData=({cacheData, setCache})=>{
    const activeKEY = cacheData.activeKEY
    const location = useLocation()
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据  下单模式
    const [pickDataSource,setPickDataSource]=useState([]);  // 列表数据  提货模式
    const [netDataSource,setNetDataSource]=useState([]);  // 列表数据  提货模式
    // const [activeKEY,setActiveKEY]=useState('2');  // 默认Tabs KEY 1:下单 2:提货
    const [isLoading,setIsLoading]=useState(true); //加载
    const Empty_description='暂无数据'; // 空数据 文案描述
    const _id=getUrlParam("id");
    const merchantName = queryParse(location).merchantName;
    const per_page=20;  // 默认  请求每页参数
    const [isShow,setIsShow]=useState(false);  // 详情信息 模态框 隐藏
    const [isProgressShow,setIsProgressShow]=useState(false);  // 发货进度 模态框 隐藏
    const [rowData,setRowData]=useState([]);  // 详情 列表数据 数据一致 但为了减少 接口请求，特此分开赋值
    const [rowDataP,setRowDataP]=useState([]);  // 发货进度 列表数据
    const [totalPrice,setTotalPrice]=useState(0);  // 商品总面值
    const [totalDecrPrice,setTotalDecrPrice]=useState(0);  // 商品总售价
    const [interfaceGoodsHandleLogVisible, setInterfaceGoodsHandleLogVisible] = useState(false);  // 接口分配 visible
    const [interfaceGoodsHandleLogId, setInterfaceGoodsHandleLogId] = useState('');  // 接口分配 visible

    
    // 设置总额  --MK

    const setTotalInfo =  useCallback((totalPrice, totalDecrPrice) => {
        setTotalPrice(totalPrice)
        setTotalDecrPrice(totalDecrPrice)
    }, [])

    useEffect(()=>{
        const getAllTableData = async() => {
            let response = {}
            const params = {
                shop_id:_id,
                ...cacheData
            }
            setIsLoading(true);
            switch (activeKEY) {
                case '1':
                    response = await getShopGoodsLog({params})
                    break;
                case '2':
                    response = await getPickShopGoodsLog({params})
                    break;
                case '3':
                    response = await getShopInterfaceGoodsList({params})
                    break;
                default:
                    break;
            }
            if (!response.res) {
                return false
            }
            const resData = response.data
            const currentPage = resData.current_page
            const resDataList = resData.list.map((item, index) => {
                return {
                    ...item,
                    _init: (currentPage - 1) * per_page + index + 1
                }
            })
            switch (activeKEY) {
                case '1':
                    setDataSource(resDataList);
                    break;
                case '2':
                    setPickDataSource(resDataList);
                    break;
                case '3':
                    setNetDataSource(resDataList)
                    break;
                default:
                    break;
            }
            if (currentPage === 1) {
                setTotalInfo(resData.sum_price, resData.sum_decr_price)
            }
            setCountData(resData);
            setIsLoading(false);
        }
        getAllTableData()
        
    },[cacheData, _id, activeKEY, setTotalInfo]);
    
    // 下单模式
    const buyColumnsData = [
        {
          title: '序号',
          width: 80,
          fixed: 'left',
          dataIndex: '_init',
          
        },
        {
            title: 'ID',
            width: 80,
          fixed: 'left',
            dataIndex: 'id'
        },
        {
            title: '品牌名称',
            width: 100,
            fixed: 'left',
            dataIndex: 'brand_title'
        },
        {
            title: '商品名称',
            width: 100,
            fixed: 'left',
            dataIndex: 'goods_title'
        },
        {
            title: '商品面值',
            width: 130,
            dataIndex: 'price',
            render:((price)=>{
                return (
                    <Statistic
                    title=""
                    value={price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '分配数量',
            width: 100,
            dataIndex: 'stock_num',
            render:((stock_num)=>{
                return (
                    <Statistic
                    title=""
                    value={stock_num}
                    valueStyle={{ fontSize: 16 }}
                  />
                )
            })
        },
        {
            title: '商品总面值(元)',
            dataIndex: 'count_price',
            width: 130,
            render:((count_price)=>{
                return (
                    <Statistic
                    title=""
                    value={count_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '折扣(%)',
            width: 100,
            dataIndex: 'discount'
        },
        {
            title: '商品销售总价(元)',
            width: 160,
            dataIndex: 'count_decr_price',
            render:((count_decr_price)=>{
                return (
                    <Statistic
                    title=""
                    value={count_decr_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '采购单价(元)',
            width: 130,
            dataIndex: 'decr_price'
        },
        {
            title: '分配状态',
            dataIndex: 'status',
            width: 100,
            render:((item)=>{
                const arr=["待处理","发货中","发货成功", "发货失败", '采购完成待发货','预采中','预采成功','预采失败','补发待处理'];
                return arr[item];
            })
        },
        {
            title: '分配时间',
            width: 170,
            dataIndex: 'created_at'
        },
        {
            title: '操作人',
            dataIndex:'real_name'
        },
        {
            title: '操作',
            width: 120,
            fixed: 'right',
            render:((row)=>{
                return (
                    <>
                    <AuthButton authid="order_distribute_info">
                    <button onClick={()=>detailFn(row)} className="shop_linkbtn-class color_00f">查看详情</button>
                    </AuthButton>
                    <AuthButton authid="order_distribute_progress">
                    <button onClick={()=>showProgressFn(row)} className="shop_linkbtn-class color_00f">发货进度</button>
                    </AuthButton>
                    {
                        row.status===7 || row.status===3?
                        <AuthButton authid="order_distribute_reissue">
                            <button onClick={()=>showResendFn(row)} className="shop_linkbtn-class color_00f">补发</button>
                        </AuthButton>:""
                    }
                    </>
                )     
            })
        }
      ];  // 表格 标头
    
    // 提货模式
    const getColumnsData = [
        {
          title: '序号',
          width: 80,
          fixed: 'left',
          dataIndex: '_init',
        },
        {
            title: 'ID',
            width: 80,
            fixed: 'left',
            dataIndex: 'id'
        },
        {
            title: '品牌名称',
            dataIndex: 'brand_title',
            width: 100,
            fixed: 'left',
        },
        {
            title: '商品名称',
            dataIndex: 'goods_title',
            width: 100,
            fixed: 'left',
        },
        {
            title: '商品面值(元)',
            width: 130,
            dataIndex: 'price',
            render:((price)=>{
                return (
                    <Statistic
                    title=""
                    value={price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '分配数量',
            width: 100,
            dataIndex: 'num',
            render:((num)=>{
                return (
                    <Statistic
                    title=""
                    value={num}
                    valueStyle={{ fontSize: 16 }}
                  />
                )
            })
        },
        {
            title: '商品总面值(元)',
            width: 130,
            dataIndex: 'count_price',
            render:((count_price)=>{
                return (
                    <Statistic
                    title=""
                    value={count_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '折扣(%)',
            width: 100,
            dataIndex: 'discount'
        },
        {
            title: '商品销售总价(元)',
            width: 160,
            dataIndex: 'count_decr_price',
            render:((count_decr_price)=>{
                return (
                    <Statistic
                    title=""
                    value={count_decr_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '分配时间',
            width: 180,
            dataIndex: 'created_at'
        },
        {
            title: '发货状态',
            width: 100,
            dataIndex: 'distribution_status',
            render:((item)=>{
                // const arr=["未发货","发货中","发货成功", "发货失败", '采购完成待发货'];
                const arr=["待处理","发货中","发货成功", "发货失败", '采购完成待发货','预采中','预采成功','预采失败','补发待处理'];
                return arr[item];
            })
        },
        {
            title: '提货状态',
            width: 100,
            dataIndex: 'status',
            render:((item)=>{
                const arr=["未提货","未提货","已提货"];
                return arr[item];
            })
        },
        {
            title: '操作人',
            dataIndex:'real_name'
        },
        {
            title: '操作',
            width: 120,
            fixed: 'right',
            render:((row)=>{
                return (
                    <>
                    <AuthButton authid="order_distribute_info">
                    <button onClick={()=>detailFn(row)} className="shop_linkbtn-class color_00f">查看详情</button>
                    </AuthButton>
                    <AuthButton authid="order_distribute_progress">
                    <button onClick={()=>showProgressFn(row)} className="shop_linkbtn-class color_00f">发货进度</button>
                    </AuthButton>
                    {
                        row.distribution_status===7 || row.distribution_status===3?
                        <AuthButton authid="order_distribute_reissue">
                            <button onClick={()=>showResendFn(row)} className="shop_linkbtn-class color_00f">补发</button>
                        </AuthButton>:""
                    }
                    </>
                )
            })
        }
      ];  // 表格 标头
    // 接口模式
    const netColumnsData = [
        {
            title: '序号',
            width: 80,
            fixed: 'left',
            dataIndex: '_init',
        },
        {
            title: '商品编码',
            width: 100,
            fixed: 'left',
            dataIndex: 'goods_code',
        },
        {
            title: '品牌名称',
            dataIndex: 'brand_title',
            width: 100,
            fixed: 'left',
        },
        {
            title: '商品名称',
            dataIndex: 'goods_title',
            width: 150,
            fixed: 'left',
        },
        {
            title: '商品面值(元)',
            width: 130,
            dataIndex: 'price',
            render:((price)=>{
                return (
                    <Statistic
                    title=""
                    value={price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '折扣(%)',
            width: 100,
            dataIndex: 'discount'
        },
        {
            title: '售卖单价(元)',
            width: 160,
            dataIndex: 'decr_price',
            render:((decr_price)=>{
                return (
                    <Statistic
                    title=""
                    value={decr_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '供应商名称',
            width: 160,
            dataIndex:'provider_list',
            render(list) {
                const lng = list.length - 1
                return list.map((item, index) => index < lng?`${item.provider_name}, `: item.provider_name)
            }
        },
        {
            title: '主体名称',
            width: 160,
            render(row) {
                const list = row.provider_list
                const lng = list.length - 1
                return list.map((item, index) => index < lng?`${item.company_name}, `: item.company_name)
            }
        },
        {
            title: '分配时间',
            width: 180,
            dataIndex:'created_at'
        },
        {
            title: '操作人',
            dataIndex:'real_name'
        },
        {
            title: '操作',
            width: 180,
            fixed: 'right',
            render:((row)=>{
                return (
                    <AuthButton authid="order_distribute_info">
                        <Link to={`/editInterfaceGoods?id=${row.id}&goodsId=${row.goods_id}&shopName=${merchantName}`}>
                            <button className="shop_linkbtn-class color_00f">修改</button>
                        </Link>
                        <button onClick={()=>showInterfaceGoodsLog(row)} className="shop_linkbtn-class color_00f">查看修改记录</button>
                    </AuthButton>
                )
            })
        }
    ]

    // 查看 详情
    const detailFn=(row)=>{
        setIsShow(true);
        setRowData({...row,type:activeKEY==='1'?0:1});
    }

    // 发货进度 显示
    const showProgressFn=(row)=>{
        setIsProgressShow(true);
        setRowDataP({...row,type:activeKEY==='1'?0:1});
    }

    // 补发功能
    const showResendFn=(row)=>{
        let reissueNum=0;
        if(cacheData.activeKEY==='2'){
            reissueNum=Number(row.num)-Number(row.delivery_num);
        }else{
            reissueNum=Number(row.stock_num)-Number(row.delivery_num);
        }
        
        let content = (
            <>
                <div className="cf00 fs14">请确认已补充充足的库存！</div>
                <List split={false} className="mt10">
                    <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10">商户名称:</span>
                        <span className="flex1">{merchantName}</span>
                    </List.Item>
                    <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10">商品名称:</span>
                        <span className="flex1">{row.goods_title}</span>
                    </List.Item>
                    <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10">补发数量:</span>
                        <span className="flex1"><Statistic value={reissueNum} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 1)'}} suffix="张" /></span>
                    </List.Item>
                </List> 
            </>        
        )
        confirm({
            title: "确认补发该商品?",
            content: content,
            okText: "确定",
            cancelText: '取消',
            onOk() {
                getDistributionReissue({
                    params:{
                        distribute_id:row.distribute_id,
                    }
                }).then((response) => {
                    if (response.res) {
                        message.success('操作成功！');
                        setCache({...cacheData});  // 重新刷新页面
                    }
                });
                
            },
            onCancel() { },
        })
    }
   
    const showInterfaceGoodsLog = useCallback(info => {
        setInterfaceGoodsHandleLogId(info.id)
        toggleInterfaceGoodsHandleLogVisible()
    }, []) 

    // 页码请求
    const pageChange=(page)=>{
        setCache({...cacheData,page});
    }
    const tabChange = key => {
        setCache({
            activeKEY: key,
            page: 1,  // 请求页码
            per_page: 20 // 默认
        })
    }

    // 关闭 进度 模态框
    const hideDeliveryModel=()=>{
        setIsProgressShow(false);
        setCache({...cacheData});
    }

    const toggleInterfaceGoodsHandleLogVisible = () => {
        setInterfaceGoodsHandleLogVisible(pre => !pre)
    }

    const title=(
        <>
            <Breadcrumb>
                <Breadcrumb.Item onClick={()=> history.goBack()} className="pointer">
                <span>返回上一页</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>商品分配记录信息</Breadcrumb.Item>
            </Breadcrumb>
        </>
    );
    return (
            <Card 
                bodyStyle={{padding:16, flex: 1}} 
                title={title} 
                headStyle={{border:"none"}} 
                bordered={false}
                className="w h flex-c"
            >
                <div className="h flex-c">
                    <div className={`mt20 flex-r ai-c mb20`}>
                        <div className="tr mr16">商户名称:</div>
                        <div className="mr40">{merchantName}</div>
                        <div className="mr16">商品总面值:</div>
                        <div className="mr40">
                            <Statistic value={totalPrice} precision={2} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} />
                        </div>
                        <div className="mr16">商品销售总价:</div>
                        <div className="mr40 flex-r"><Statistic value={totalDecrPrice} precision={2} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} /></div>
                    </div>
                    <Tabs 
                        type="card" 
                        onChange={tabChange}
                        activeKey={activeKEY}
                        className="flex1 flex-c order-tab"
                    >
                        <TabPane tab="提货模式" key="2" className="h">
                            <GetEmpty descriptions={Empty_description} >
                                <div className="h">
                                    <Table 
                                        columns={getColumnsData} 
                                        dataSource={pickDataSource} 
                                        pagination={{ current:countData.current_page,total:countData.total,pageSize:20,onChange:pageChange}}
                                        bordered
                                        rowKey={record=>record.id}
                                        loading={isLoading}
                                        scroll={{ x: 1600 }}
                                    />
                                </div>
                            </GetEmpty>
                        </TabPane>
                        <TabPane tab="下单模式" key="1"  className="h">
                            <GetEmpty descriptions={Empty_description} >
                                <div className="h" >
                                    <Table 
                                        columns={buyColumnsData} 
                                        dataSource={dataSource} 
                                        pagination={{ current:countData.current_page,total:countData.total,pageSize:20,onChange:pageChange}}
                                        bordered
                                        rowKey={record=>record.id}
                                        loading={isLoading}
                                        scroll={{ x: 1600 }}
                                    />
                                </div>
                            </GetEmpty>
                        </TabPane>
                        <TabPane tab="接口模式" key="3"  className="h">
                            <Table 
                                columns={netColumnsData} 
                                dataSource={netDataSource} 
                                pagination={{ current:countData.current_page,total:countData.total,pageSize:20,onChange:pageChange}}
                                bordered
                                rowKey={record=>record.id}
                                loading={isLoading}
                                scroll={{ x: 1600 }}
                            />
                        </TabPane>
                    </Tabs>
                <ShowSupplierManage visible={isShow} data={rowData} hideFn={()=>setIsShow(false)}/>
                <InterfaceGoodsHandleLog  visible={interfaceGoodsHandleLogVisible} logId={interfaceGoodsHandleLogId} toggleVisible={toggleInterfaceGoodsHandleLogVisible} />
                <DeliveryProgress visible={isProgressShow} data={rowDataP} merchantName={merchantName} hideFn={hideDeliveryModel}/>
                </div>
            </Card>
    )
}




const MerchantGoodsList = ({cacheData, setCache}) => {
    return (
        <FadeIn>
            <GetListData cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}
export default cache(cacheDataKey, initListParams, MerchantGoodsList)