import React, { useState, useEffect} from 'react'
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import {getUrlParam} from "../../../untils/untilsFn"
import "./index.css";
import { cache, resetCache } from '../../../components/CacheData'
import {Form,Input,Table,Button,Icon,Card,Select, List} from "antd";
import { getStockList,providerListNoPage,getStockStatistical} from "../../../service/api"
const {Option}=Select;


const cacheDataKey="shopCardParam";  // 默认传参KEY
const refreshData=resetCache(cacheDataKey);
let initListParams={
    package_num:'',  // 卡号
    package_pass:'', //卡密
    status:'', // 状态
    goods_title:'', //商品名称
    provider_id:'', // 供应商名称
    page:1,  // 请求页码
    per_page:20 // 默认
}

 // 遍历商户列表
 const getOptions=(arr)=>{
    const opt=arr.map(item=>{
        return (
            <Option value={item.id} key={item.id}>{item.name}</Option>
        )
    })
    return opt;
}

// 获取数据列表展示
const GetListData=({ cacheData, setCache, form})=>{
    //console.log(paramsData);
    
    const { getFieldDecorator } = form;
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [provideList,setProvideList]=useState([]); //供应商列表
    const [stockStatist,setStockStatist]=useState([]); // 库存统计
    const [isLoading,setIsLoading]=useState(true); //加载
    const [stockLoading,setStockLoading]=useState(true); // 加载
    const Empty_description='暂无数据'; // 空数据 文案描述
    const per_page=20;  // 默认  请求每页参数
    const _goodsId=getUrlParam('goods_id') || '';  // 商品ID
    const [columnStyle,setColumnStyle]=useState();
    //供应商列表查询
    useEffect(()=>{
        // 供应商
        const getProvideL=async()=>{
            await providerListNoPage({
                params:{}
            }).then((resolve)=>{
                if(resolve.res){
                    setProvideList(resolve.data.list);
                }
            })
        }

        const getStock=async()=>{
            // 统计数据
            await getStockStatistical({
                params:{
                    goods_id:_goodsId
                }
            }).then((resolve)=>{
                if(resolve.res){
                    setStockStatist(resolve.data);
                    setStockLoading(false);
                }
            })
        }
        getProvideL();
        getStock();
    },[_goodsId])

    // 列表查询
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await getStockList({
                params:{
                    goods_id:_goodsId,
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
            if(cacheData.status==='0'){
                setColumnStyle('hide');
            }else{
                setColumnStyle('');
            }
            setIsLoading(false);
            setDataSource(dataSources);
        };  // 获取数据 
        getTableData();
    },[cacheData,_goodsId]);
    
   
    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
        },
        {
          title: 'ID',
          dataIndex: 'id'
        },
        {
          title: '卡号',
          dataIndex:'package_num'
        },
        {
            title: '卡密',
            dataIndex:'package_pass'
          },
        {
            title: '面值',
            dataIndex: 'price'
        },
        {
          title: '品牌名称',
          dataIndex: 'brand_title'
        },
        {
            title: '商品名称',
            dataIndex: 'goods_title'
        },
        {
            title: '供应商名称',
            dataIndex: 'provider_name',
        },
        {
            title: '入库时间',
            dataIndex: 'created_at'
        },
        {
            title: '出库时间',
            dataIndex: 'updated_at',
            className:columnStyle
        },
        {
            title: '截止有效期',
            dataIndex: 'end_time'
        },
        {
            title: '操作人',
            dataIndex: 'admin_name'
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
            if(!err){
                setCache({...cacheData, ...values, page:1});   
            }
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
            <Card title="库存统计" bordered className="cardMT" loading={stockLoading}>
                <List grid={{ gutter: 6, column: 3 }}>
                    <List.Item >
                    <span className="list_label">库存总金额:</span>
                    <span className="fs18">¥{stockStatist.count_price}</span>
                    </List.Item>
                    <List.Item >
                    <span className="list_label">已售金额:</span>
                    <span className="fs18">¥{stockStatist.sold_price}</span>
                    </List.Item>
                    <List.Item >
                    <span className="list_label">剩余库存金额:</span>
                    <span className="fs18">¥{stockStatist.surplus_price}</span>
                    </List.Item>
                    <List.Item >
                    <span className="list_label">总库存数量:</span>
                    <span className="fs18">{stockStatist.count_num}</span>
                    </List.Item>
                    <List.Item >
                    <span className="list_label">已售库存:</span>
                    <span className="fs18">{stockStatist.sold_num}</span>
                    </List.Item>
                    <List.Item >
                    <span className="list_label">剩余库存数量:</span>
                    <span className="fs18">{stockStatist.surplus_num}</span>
                    </List.Item>
                </List>
            </Card>
            <Form layout="inline" name="ShopCardFrom" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                    <Form.Item label="卡号" className="shop_form_item">
                    {getFieldDecorator('package_num', {
                        initialValue:cacheData.package_num,
                        rules:[]
                    })(
                        <Input
                        type="text"
                        placeholder="请输入卡号"
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="卡密" className="shop_form_item">
                    {getFieldDecorator('package_pass', {
                        initialValue:cacheData.package_pass,
                        
                    })(
                        <Input
                        type="text"
                        placeholder="请输入卡密"
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="卡密状态" className="shop_form_item">
                    {getFieldDecorator('status', {
                        initialValue:cacheData.status,
                    })(
                        <Select className="shop_select_w" placeholder="请选择卡密状态">
                            <Option value='0'>未售</Option>
                            <Option value='1'>已售</Option>
                        </Select>
                    )}
                    </Form.Item>
                    <Form.Item label="商品名称" className={_goodsId!==''?"hide":"shop_form_item"}>
                    {getFieldDecorator('goods_title', {
                        initialValue:cacheData.goods_title,
                         rules: [],
                    })(<Input
                        type="text"
                        placeholder="请输入商品名称"
                        />)}
                    </Form.Item>
                    <Form.Item label="供应商名称" className="shop_form_item">
                    {getFieldDecorator('provider_id', {
                        initialValue:cacheData.provider_id,
                        rules: [],
                    })(<Select placeholder="请选择供应商" className="shop_select_w">
                        {getOptions(provideList)}
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

const ShopCardFormTable=Form.create({name:'ShopCardFrom'})(GetListData);
const ShopCard = ({cacheData, setCache}) => {
    return (
        <FadeIn>
            <ShopCardFormTable cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}
export default cache(cacheDataKey, initListParams, ShopCard)