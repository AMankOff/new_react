import React, { useState, useEffect } from 'react'
import {history} from "../../../browserHistory"
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../../components/AuthButton'
import UpdataAdd from "./updataAdd"
import "./index.css";
import { cache, resetCache } from '../../../components/CacheData'
import {Form,Input,Table,Button,Icon,Card,message,Modal} from "antd";
import { getShopBrandList,delShopBrand,getShopClassList} from "../../../service/api"
const {confirm}=Modal;

const cacheDataKey="shopBrandParam";  // 默认传参KEY
const refreshData=resetCache(cacheDataKey);  // reset数据
// 默认传参
let initListParams={
    title:'',  // 品牌名称
    page:1,  // 请求页码
    per_page:20 // 默认
}


// 获取数据列表展示
const GetListData=({cacheData, setCache, form})=>{
    const { getFieldDecorator } = form;
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [isLoading,setIsLoading]=useState(true); //加载
    const [modalType,setModalType]=useState(); // 模态框状态  新增/修改
    const Empty_description='暂无数据'; // 空数据 文案描述
    const [isShow,setIsShow]=useState(false);  // 提交订单模态框  默认隐藏
    const [rowData,setRowData]=useState(false);  //默认 类别id  新增/修改
    const [shopClassData,setShopClassData]=useState([]);  // 商品类目列表
    const per_page=20;  // 默认  请求每页参数
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);  // 数据加载loading 
        //    setCache(listParams);  // 缓存查询数据
            const dataSources= await getShopBrandList({
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
    

    // 获取积分购列表、类目列表
    useEffect(()=>{
       // 获取类目列表
        const shopClass=async()=>{
            await getShopClassList({
                params:{
                    type:2
                }
            }).then((response)=>{
                if(response.res){
                    const result=response.data.list;
                    setShopClassData(result);
                }
            })
        }
        shopClass();
    },[])    

    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
        },
        {
          title: '品牌ID',
          dataIndex: 'id',
          key:'id'
        },
        {
          title: '品牌名称',
          dataIndex: 'title',
          key:'title'
        },
        {
            title: '品牌logo',
            key:'logo',
            render:((row)=>{
                if(!!row.logo){
                    return (
                        <img src={row.logo} className="shop_img" key={row.id} alt=""/>
                    )
                }else{
                    return (
                        <span key={row.id}>暂未配置</span>
                    )
                }
                
            })
          },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key:'created_at'
          },
          {
            title: '操作',
            key:'act',
            render:((row)=>{
                return (
                    <>
                        <AuthButton authid="goods_brand_getbrandinfo">
                        <button onClick={()=>brandDetail(row)} className="shop_linkbtn-class color_00f">详情</button>
                        </AuthButton>
                        <AuthButton authid="goods_brand_update">
                        <button onClick={()=>detailAddFn(row,'edit')} className="shop_linkbtn-class color_00f">修改</button>
                        </AuthButton>
                        {
                            row.parent_id===0?
                            <AuthButton authid="goods_brand_add">
                            <button onClick={()=>detailAddFn(row,'add')} className="shop_linkbtn-class color_00f">新增子品牌</button>
                            </AuthButton>
                            :""
                        }
                        <AuthButton authid="goods_brand_del">
                        <button onClick={()=>delFn(row)} className="shop_linkbtn-class color_00f">删除</button>
                        </AuthButton>
                    </>
                )
            })
            
          }
      ];  // 表格 标头
    //修改/新建 刷新列表
    const getData= async()=>{
        if(modalType==='add'){
            form.resetFields();
            refreshData();
        }else{
            setCache({...cacheData}); 
        }
    }
    

    // 删除品牌
    const delFn=(data)=>{
        const _id=data.id;
        confirm({
            content: '确认是否删除?',
            okText:"确认",
            cancelText:"取消",
            onOk:async()=>{
                await delShopBrand({
                    params: {
                        brand_id: _id,
                    }
                }).then((response)=>{
                    if (response.res) {
                        message.success("删除成功！");
                        refreshData();
                    }
                })// 请求状态
            },
            onCancel() {},
          });
        
    }  

    
    // 新增/修改品牌
    const detailAddFn=(row,type)=>{
        setModalType(type);
        setIsShow(true); //模态框展示
        setRowData(row);  // 选中行数据
    }

    // 品牌详情
    const brandDetail=(row)=>{
        history.push('/shopBrand/detail?brand_id='+row.id);
    }

    // 页码请求
    const pageChange=(page,pageSize)=>{
        setCache({...cacheData, page}); 
    }

    // 查询数据
    const handleSubmit=(e)=>{
        e.preventDefault();
        form.validateFields((err, values) => {
            setCache({...cacheData, ...values,page:1});     
        })
        
    }
    //重置查询数据
    const handleReset = (e) => {
        e.preventDefault();
        form.resetFields();
        refreshData();
    };
    const extra=(
        <span>
        <AuthButton authid="goods_brand_add">
            <Button type="primary" onClick={()=>detailAddFn(false,'add')}>
                <Icon type="plus"/>
                新建品牌
            </Button>
        </AuthButton>
        </span>
    )
    return (
        <div>
            <Form layout="inline" name="shopBrandFromT" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                    <Form.Item label="品牌名称" className="shop_form_item">
                    {getFieldDecorator('title', {
                        initialValue:cacheData.title,
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
                <UpdataAdd visible={isShow} data={rowData} modalType={modalType} shopClassData={shopClassData} handleHide={()=>setIsShow(false)} getData={()=>getData()} />
                </GetEmpty>
                </div>
            </Card>
        </div>
    )
}

const ShopBrandFormTable=Form.create({name:'shopBrandFromT'})(GetListData);
const ShopBrand = ({cacheData, setCache}) => {
    
    return (
        <FadeIn>
            <ShopBrandFormTable cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}
export default cache(cacheDataKey, initListParams, ShopBrand)