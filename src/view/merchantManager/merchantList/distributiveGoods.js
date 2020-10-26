import React, { useState, useEffect } from 'react'
import {history} from "../../../browserHistory"
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../../components/AuthButton'
import {getUrlParam} from "../../../untils/untilsFn"
import { cache, resetCache } from '../../../components/CacheData'
import "./index.css";
import {Form,Input,Table,Button,Icon,Card,Breadcrumb, Statistic } from "antd";
import { distributiveShopGoodsList} from "../../../service/api"
import { Link } from 'react-router-dom'

const cacheDataKey="distributiveParams";  // 默认传参KEY
const refreshData=resetCache(cacheDataKey);

let initListParams={
    title:'',  // 商品名称
    brand_title:'', // 品牌名称
    page:1,  // 请求页码
    per_page:20 // 默认
}


// 获取数据列表展示
const GetListData=({cacheData, setCache, form})=>{
    //console.log(paramsData);
    const { getFieldDecorator } = form;
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [isLoading,setIsLoading]=useState(true); //加载
    const Empty_description='暂无数据'; // 空数据 文案描述
    const per_page=20;  // 默认  请求每页参数
    const _id=getUrlParam("id");
    const _title=decodeURI(getUrlParam("title"));
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await distributiveShopGoodsList({
                params:cacheData
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
    },[cacheData]);
    
   
    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
        },
        {
          title: '商品ID',
          dataIndex: 'id',
          key:'id'
        },
        {
          title: '商品名称',
          dataIndex:'title'
        },
        {
          title: '品牌名称',
          dataIndex: 'brand_title',
          key:'brand_title'
        },
        {
            title: '商品面值',
            dataIndex: 'price',
            key:'price',
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
            title: '操作',
            key:'act',
            dataIndex: 'id',
            render:((id)=>{
                    return (
                        <>
                            <AuthButton authid="goods_shopgoods_add">
                                <Link to={`/sendGoods?goodsId=${id}&shopName=${_title}&shopId=${_id}`} className="shop_linkbtn color_00f">分配</Link>
                            </AuthButton>
                        </>
                    )
            })
            
          }
      ];  // 表格 标头


    // 页码请求
    const pageChange=(page,pageSize)=>{
        setCache({...cacheData,page});
    }

    // 查询数据
    const handleSubmit=(e)=>{
        e.preventDefault();
        form.validateFields((err, values) => {
            setCache({...cacheData,...values,page:1});     
        })
        
    }
    //重置查询数据
    const handleReset = (e) => {
        e.preventDefault();
        form.resetFields();
        refreshData();   
    };

    const title=(
        <>
            <Breadcrumb>
                <Breadcrumb.Item onClick={()=> history.goBack()} className="pointer">
                <span>商户列表</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>分配商品</Breadcrumb.Item>
                <Breadcrumb.Item>{_title}</Breadcrumb.Item>
            </Breadcrumb>
        </>
    );

    const extra=(
        <span>
        <AuthButton authid="goods_shopgoods_list">
        <Button type="primary" onClick={()=>history.push(`/merchantList/allocationRecord?id=${_id}&merchantName=${_title}`)}>
            分配商品记录
        </Button>
        </AuthButton>
        </span>
    )
    return (
        <div>
            <Card bodyStyle={{margin:0,padding:0}} title={title} bordered={false} headStyle={{border:"none"}}>
                <Form layout="inline" name="shopGoodsFrom" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                        <Form.Item label="商品名称" className="shop_form_item">
                        {getFieldDecorator('title', {
                            initialValue:cacheData.title
                        })(
                            <Input
                            type="text"
                            placeholder="请输入商品名称"
                            />
                        )}
                        </Form.Item>
                        <Form.Item label="品牌名称" className="shop_form_item">
                        {getFieldDecorator('brand_title', {
                            initialValue:cacheData.brand_title
                        })(
                            <Input
                            type="text"
                            placeholder="请输入品牌名称"
                            />
                        )}
                        </Form.Item>
                        <Form.Item className="shop_form_item">
                            <Button type="primary" htmlType="submit">
                                <Icon type="search"/>
                                查询
                            </Button>
                            <Button type="default" htmlType="reset" className="shop_form_reset">
                                重置
                            </Button>
                        </Form.Item>
                </Form>
                <Card bodyStyle={{margin:0,padding:0}} headStyle={{border:"none"}} bordered={false} extra={extra}>
                    <div className="ml15 mr15">
                    <GetEmpty descriptions={Empty_description} >
                    <Table 
                        columns={columnsData} 
                        dataSource={dataSource} 
                        pagination={{ current:countData.current_page,total:countData.total,pageSize:20,onChange:pageChange}}
                        bordered
                        rowKey={record=>record.id}
                        loading={isLoading}
                    />
                    </GetEmpty>
                    </div>
                </Card>
            </Card>
        </div>
    )
}

const DistributiveGoodsFormTable=Form.create({name:'shopGoodsFrom'})(GetListData);
const DistributiveGoods = ({cacheData, setCache}) => {
    
    return (
        <FadeIn>
            <DistributiveGoodsFormTable cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}
export default cache(cacheDataKey, initListParams, DistributiveGoods)