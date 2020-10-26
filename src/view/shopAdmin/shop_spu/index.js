import React, { useState, useEffect, useReducer } from 'react'
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../../components/AuthButton'
import UpdataAdd from "./updataAdd"
import "./index.css";
import {Form,Input,Table,Button,Icon,Card,message,Modal} from "antd";
import { getShopSpuList,delShopSpu,getShopClassList,selectBrandList} from "../../../service/api"
const {confirm}=Modal;


//默认传参
let initListParams={
    title:'',  // 品牌名称
    page:1,  // 请求页码
    per_page:20 // 默认
}

const listParamsReducer=(state,action)=>{
    switch (action.type) {
        case 'search':  // 表单搜索
            return {page: 1,per_page:20, ...action.searchInfo}
        case 'page':   // 分页处理
            return {...state, page: action.page}
        case 'reload':  // 当前刷新
            return {...state}
        case 'reset':
            return {...action.searchInfo}
        default:
            return state
    }
}

// 获取数据列表展示
const GetListData=({ form, info =  initListParams})=>{
    const { getFieldDecorator } = form;
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [isLoading,setIsLoading]=useState(true); //加载
    const [modalType,setModalType]=useState(); // 模态框状态  新增/修改
    const Empty_description='暂无数据'; // 空数据 文案描述
    const [isShow,setIsShow]=useState(false);  // 模态框  默认隐藏
    const [rowData,setRowData]=useState(false);  //默认 类别id  新增/修改
    const [shopClassData,setShopClassData]=useState([]);  // 商品类目列表
    const [shopBrandData,setShopBrandData]=useState([]);  // 未分页品牌列表
    let [listParams, listParamsDispatch] = useReducer(listParamsReducer, initListParams) // 请求参数
    const per_page=20;  // 默认  请求每页参数
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await getShopSpuList({
                params:listParams
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
    },[listParams]);
    

    // 获取类目列表
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
        // 获取未分页品牌列表
        const getSelectShopBrand=async()=>{
            await selectBrandList({
                params:{}
            }).then((response)=>{
                if(response.res){
                    const result=response.data.list;
                    setShopBrandData(result);
                }
            })
        }
        getSelectShopBrand();
    },[])
   
    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
        },
        {
          title: 'SPU ID',
          dataIndex: 'id'
        },
        {
          title: 'SPU名称',
          dataIndex: 'title'
        },
        {
          title: '品牌名称',
          dataIndex: 'brand_title'
        },
        {
          title: '商品数量',
          dataIndex: 'goods_num'
        },
        {
            title: '中央库存品牌',
            dataIndex: 'jfg_brand_name'
        },
        {
            title: '创建时间',
            dataIndex: 'created_at'
          },
          {
            title: '操作',
            key:'act',
            render:((row)=>{
                    return (
                        <>
                            <AuthButton authid="goods_spu_update">
                            <button onClick={()=>detailAddFn(row,'edit')} className="shop_linkbtn-class color_00f">修改</button>
                            </AuthButton>
                            <AuthButton authid="goods_spu_del">
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
            listParamsDispatch({
                type: 'reset',
                searchInfo: initListParams
            }) 
        }else{
            listParamsDispatch({
                type: 'reload',
                searchInfo: initListParams
            })
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
                await delShopSpu({
                    params: {
                        spu_id: _id,
                    }
                }).then((response)=>{
                    if (response.res) {
                        message.success("删除成功！");
                        getData('add');  // 获取数据
                    }
                })// 请求状态
                
            },
            onCancel() {},
          });
        
    }  

    
    // 新增/修改品牌
    const detailAddFn=(row,type)=>{
     //   e.preventDefault();
        setModalType(type);
        setIsShow(true); //模态框展示
        setRowData(row);  // 选中行数据
    }



    // 页码请求
    const pageChange=(page,pageSize)=>{
        listParamsDispatch({
            type: 'page',
            page: page
        })
    }

    // 查询数据
    const handleSubmit=(e)=>{
        e.preventDefault();
        form.validateFields((err, values) => {    
            listParamsDispatch({
                type: 'search',
                searchInfo: values
            })
        })
        
    }
    //重置查询数据
    const handleReset = (e) => {
        e.preventDefault();
        form.resetFields();
        listParamsDispatch({
            type: 'reset',
            searchInfo: initListParams
        }) 
        
    };
    const extra=(
        <span>
        <AuthButton authid="goods_spu_add">
            <Button type="primary" onClick={()=>detailAddFn(false,'add')}>
                <Icon type="plus"/>
                新建SPU
            </Button>
        </AuthButton>
        </span>
    )
    return (
        <div>
            <Form layout="inline" name="shopSPUFrom" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                    <Form.Item label="SPU名称" className="shop_form_item" >
                    {getFieldDecorator('title', {
                    })(
                        <Input
                        type="text"
                        placeholder="请输入SPU名称"
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
                    pagination={{ current:countData.current_page,total:countData.total,pageSize:initListParams.per_page,onChange:pageChange}}
                    bordered
                    rowKey={record=>record.id}
                    loading={isLoading}
                />
                <UpdataAdd visible={isShow} data={rowData} modalType={modalType} shopClassData={shopClassData} shopBrandData={shopBrandData} handleHide={()=>setIsShow(false)} getData={()=>getData()} />
                </GetEmpty>
                </div>
            </Card>
        </div>
    )
}

const ShopSPUFormTable=Form.create({name:'shopSPUFrom'})(GetListData);
const ShopSpu = () => {
    
    return (
        <FadeIn>
            <ShopSPUFormTable/>
        </FadeIn> 
        
    )
}
export default ShopSpu