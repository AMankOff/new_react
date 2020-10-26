import React, { useState, useEffect } from 'react'
import {history} from "../../../browserHistory"
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../../components/AuthButton'
import "./index.css";
import { cache, resetCache } from '../../../components/CacheData'
import {Form,Input,Table,Button,Icon,Card,Select} from "antd";
import { getShopAuditList} from "../../../service/api"
const {Option}=Select;



const cacheDataKey="auduitedMerchantParam";  // 默认传参KEY
const refreshData=resetCache(cacheDataKey);
let initListParams={
    name:'',  // 名称
    type:'', //类型
    page:1,  // 请求页码
    per_page:20 // 默认
}



// 获取数据列表展示
const GetListData=({cacheData, setCache, form})=>{
//    console.log(form);
    const { getFieldDecorator } = form;
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [isLoading,setIsLoading]=useState(true); //加载
    const Empty_description='暂无数据'; // 空数据 文案描述
    const per_page=20;  // 默认  请求每页参数
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await getShopAuditList({
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
          title: '商户ID',
          dataIndex: 'id',
          key:'id'
        },
        {
          title: '商户名称',
          dataIndex: 'name',
        },
        {
            title: '商户类型',
            dataIndex: 'type',
            render:(item=>{
                return(
                    <>
                        {item===1?"个人":"企业"}
                    </>
                )
            })
        },
        {
          title: '商户角色',
          dataIndex: 'role',
          render:(item=>{
            return(
                <>
                    {item===1?"进货商":"供货商"}
                </>
            )
        })
        },
        {
            title: '商户状态',
            dataIndex: 'status',
            render:(item=>{
                const typeArr=["未认证","待审核","认证成功","认证失败"];
                const statusText=typeArr[item];
                return(
                    <>
                        { statusText }
                    </>
                )
            })
        },
        {
            title: '所属账号',
            dataIndex: 'mobile'
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
                            <AuthButton authid="shop_audit">
                            <button onClick={()=>history.push('/auduitedMerchant/detail?merchant_id='+row.merchant_id+"&shop_id="+row.id+"&type="+row.type)} className="shop_linkbtn-class color_00f">审核</button>
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
            setCache({...cacheData, ...values,page:1});       
        })
        
    }
    //重置查询数据
    const handleReset = (e) => {
        e.preventDefault();
        form.resetFields();
        refreshData(); 
    };

    return (
        <div>
            <Form layout="inline" name="From" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                    <Form.Item label="商户名称" className="shop_form_item">
                    {getFieldDecorator('name', {
                        initialValue:cacheData.name,
                        rules:[ {max:20, message:"商户名称不能超过20个字"}]
                    })(
                        <Input
                        type="text"
                        placeholder="请输入商户名称"
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="商户类型" className="shop_form_item">
                    {getFieldDecorator('type', {
                        initialValue:cacheData.type
                    })(
                        <Select className="shop_select_w">
                            <Option value='1'>个人</Option>
                            <Option value='2'>企业</Option>
                        </Select>
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
            <Card bodyStyle={{margin:0,padding:0}} headStyle={{border:"none"}} bordered={false}>
                <div className="shop_table_model">
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
        </div>
    )
}

const AuditedMerFormTable=Form.create()(GetListData);
const AuditedMerchantList = ({cacheData, setCache}) => {

    return ( 

        <FadeIn>
                <AuditedMerFormTable cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}
export default cache(cacheDataKey, initListParams, AuditedMerchantList)