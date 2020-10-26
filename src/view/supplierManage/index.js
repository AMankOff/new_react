import React, { useState, useEffect } from 'react'
import {history} from "../../browserHistory"
import FadeIn from '../../components/FadeIn'
import GetEmpty from '../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../components/AuthButton'
import "./index.css";
import UpdataAdd from "./updataAdd"
import { cache, resetCache } from '../../components/CacheData'
import {Form,Input,Table,Button,Icon,Card} from "antd";
import { getProvider} from "../../service/api"


const cacheDataKey="supplierParams";  // 默认传参KEY
const refreshData=resetCache(cacheDataKey);
let initListParams={
    name:'',  // 品牌名称
    page:1,  // 请求页码
    per_page:20 // 默认
}


// 获取数据列表展示
const GetListData=({ cacheData, setCache, form})=>{
    const { getFieldDecorator } = form;
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [isLoading,setIsLoading]=useState(true); //加载
    const Empty_description='暂无数据'; // 空数据 文案描述
    const [modalType,setModalType]=useState(); // 模态框状态  新增/修改
    const [isShow,setIsShow]=useState(false);  // 提交订单模态框  默认隐藏
    const [rowData,setRowData]=useState(false);  //默认 类别id  新增/修改
    const per_page=20;  // 默认  请求每页参数
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await getProvider({
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
          title: 'ID',
          dataIndex: 'id',
          key:'id'
        },
        {
          title: '供应商名称',
          dataIndex: 'name'
        },
        {
            title: '折扣',
            dataIndex: 'discount',
            render:((item)=>{
                return (
                    <>
                        {item+"%"}
                    </>
                )
            })
          },
          {
            title: '发票类型',
            dataIndex: 'ticket_type',
            render:((index)=>{
                const typeTitle=["无发票","增值税","普通发票","增值税专用票"];
                return (
                    <>
                        {typeTitle[index]}
                    </>
                )
            })
          },
        {
            title: '税率',
            dataIndex: 'tax',
            render:((item)=>{
                return (
                    <>
                        {item+"%"}
                    </>
                )
            })
          },
          {
            title: '操作人',
            dataIndex: 'admin_real_name',
          },
          {
            title: '操作',
            key:'act',
            render:((row)=>{
                    return (
                        <>
                            <AuthButton authid="provider_index_edit">
                            <button onClick={()=>updataAddFn(row,'edit')} className="shop_linkbtn-class color_00f">修改</button>
                            </AuthButton>
                            <AuthButton authid="goods_goods_distributiongoods">
                            <button onClick={()=>history.push('/supplierManage/supplierGoods?provider_id='+row.id)} className="shop_linkbtn-class color_00f">关联商品</button>
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
            setCache({...cacheData});  // 缓存查询数据
        }
    }
    
     // 新增/修改品牌
     const updataAddFn=(row,type)=>{
        setModalType(type);
        setIsShow(true); //模态框展示
        setRowData(row);  // 选中行数据
    }
    
    
      // 页码请求
    const pageChange=(page,pageSize)=>{
        setCache({...cacheData,page});
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
        <AuthButton authid="provider_index_add">
            <Button type="primary" onClick={()=>updataAddFn(false,'add')}>
                <Icon type="plus"/>
                新建供应商
            </Button>
        </AuthButton>
        </span>
    )
    return (
        <div>
             
            <Form layout="inline" name="" onSubmit={handleSubmit} onReset={handleReset}>
                    <Form.Item label="供应商名称" className="shop_form_item">
                    {getFieldDecorator('name', {
                        initialValue:cacheData.name,
                    })(
                        <Input
                        type="text"
                        placeholder="请输入供应商名称"
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
                </GetEmpty>
                <UpdataAdd visible={isShow} data={rowData} modalType={modalType} handleHide={()=>setIsShow(false)} getData={()=>getData()} />
                </div>
            </Card>
        </div>
    )
}

const SupplierListFormTable=Form.create({name:''})(GetListData);
const SupplierList = ({cacheData, setCache}) => {
    
    return (
        <FadeIn>
                <SupplierListFormTable cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}
export default cache(cacheDataKey, initListParams, SupplierList)