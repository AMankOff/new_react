import React, { useState, useEffect } from 'react'
import {history} from "../../browserHistory"
import FadeIn from '../../components/FadeIn'
import GetEmpty from '../../components/getEmpty'   // 设置数据为空 展示
import "./index.css";
import Correlation from "./correlation"
import {getUrlParam} from "../../untils/untilsFn"
import { cache, resetCache } from '../../components/CacheData'
import {Table,Button,Icon,Card,message,Modal,Breadcrumb} from "antd";
import { getProviderGoodsList,updateProviderGoodsStatus} from "../../service/api"
const {confirm}=Modal;


const cacheDataKey="supplierGoodsParams";  // 默认传参KEY
const refreshData=resetCache(cacheDataKey);
let initListParams={
    page:1,  // 请求页码
    per_page:20 // 默认
}


// 获取数据列表展示
const GetListData=({cacheData, setCache})=>{
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [isLoading,setIsLoading]=useState(true); //加载
    const Empty_description='暂无数据'; // 空数据 文案描述
    const [isShow,setIsShow]=useState(false);  // 提交订单模态框  默认隐藏
    const _id=getUrlParam("provider_id");
    const per_page=20;  // 默认  请求每页参数
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
                const dataSources= await getProviderGoodsList({
                    params:{
                        provider_id:_id,
                        ...cacheData
                    }
                }).then((response) => {
                    if (response.res) {
                        let resData = response.data;
                        setCountData(resData);
                        const resultData=resData.list;
                        if(resultData.length!==0){
                            let i=0;
                            const init=(resData.current_page-1)*per_page;
                            let result=resultData.map((item)=>{
                                item._init= (++i)+init;
                                return item;
                            })
                            return result;
                        }else{
                            return [];
                        }
                        
                    }
                });
                setIsLoading(false);
                setDataSource(dataSources);
        };  // 获取数据 
        getTableData();
    },[cacheData,_id]);


    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
        },
        {
          title: 'ID',
          dataIndex: 'id',
          key:'id'
        },
        {
          title: '商品名称',
          dataIndex: 'goods_title'
        },
        {
            title: '状态',
            dataIndex: 'status',
            render:(item=>{
                return (
                    <>
                        {item===0?"上架":"下架"}
                    </>
                )
            })
          },
          {
            title: 'SPU名称',
            dataIndex: 'spu_title',
            
          },
        {
            title: '品牌名称',
            dataIndex: 'brand_title',
          },
          {
            title: '创建时间',
            dataIndex: 'created_at',
          },
          {
            title: '操作',
            key:'act',
            render:((row)=>{
                    return (
                        <>
                            <button onClick={()=>changeStatus(row)} className="shop_linkbtn-class color_00f">{row.status===0?"下架":"上架"}</button>
                        </>
                    )
            })
            
          }
      ];  // 表格 标头

     //关联商品
     const getData= async()=>{
        refreshData(); 
    }
    
     // 改变状态
     const changeStatus=(row)=>{
        const _key=row.id;
        const status=row.status===0?1:0;
        confirm({
            content: '确认是否更改商品状态?',
            okText:"确认",
            cancelText:"取消",
            onOk:async()=>{
                await updateProviderGoodsStatus({
                    params: {
                        provider_goods_id:_key,
                        status:status
                    }
                }).then((response)=>{
                    if (response.res) {
                        message.success("更改成功！");
                        setCache({...cacheData});  // 缓存查询数据
                    }
                })// 请求状态
                
            },
            onCancel() {},
          });
    }
    
    
      // 页码请求
    const pageChange=(page,pageSize)=>{
        setCache({...cacheData,page});
    }


    // 调用关联商品
    const correlationFn=()=>{
        setIsShow(true);
    }

    const title=(
        <>
            <Breadcrumb>
                <Breadcrumb.Item onClick={()=> history.goBack()} className="pointer">
                <span>供应商管理</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>关联商品信息</Breadcrumb.Item>
            </Breadcrumb>
        </>
    );
    const extra=(
        <span>
        <Button type="primary" onClick={()=>correlationFn()}>
            <Icon type="plus"/>
            关联商品
        </Button>
        </span>
    )
    return (
        <>
            <Card title={title} bodyStyle={{margin:0,padding:0}} headStyle={{border:"none"}} bordered={false} extra={extra}>
                <div className="shop_table_model">
                <GetEmpty descriptions={Empty_description} >
                <Table 
                    columns={columnsData} 
                    dataSource={dataSource} 
                    pagination={{defaultCurrent:1, current:countData.current_page,total:countData.total,pageSize:initListParams.per_page,onChange:pageChange}}
                    bordered
                    rowKey={record=>record.id}
                    loading={isLoading}
                />
                </GetEmpty>
                <Correlation visible={isShow} data={{"provider_id":_id}} handleHide={()=>setIsShow(false)} getData={()=>getData()} />
                </div>
            </Card>
        </>
    )
}

const SupplierGoods = ({cacheData, setCache}) => {
    
    return (
        <FadeIn>
            <GetListData cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}
export default cache(cacheDataKey, initListParams, SupplierGoods)