import React, { useState, useEffect, useCallback } from 'react'
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import "./index.css"
import { cache, resetCache } from '../../../components/CacheData'
import {Form,Input,Table,Button,Icon,Card,DatePicker,List, Statistic, Select } from "antd";
import { getRechargeList,RechargeStatistic, selectShop, getAccountList} from "../../../service/api"
import { debounce } from '../../../untils/untilsFn'
import moment from 'moment'
const { Option } = Select

const cacheDataKey="merchantChargeRecordParams";  // 默认传参KEY
const refreshData=resetCache(cacheDataKey);

const initListParams={
    operator_id: undefined, // 操作人
    name: undefined, // 商户名称
    name_id: '', // 商户名称
    shop_id:'', // 商户id
    start_time:null, //开始时间
    end_time:null, //结束时间
    page:1,  // 请求页码
    per_page:20 // 默认
}

// 获取数据列表展示
const GetListData=({cacheData, setCache,form})=>{
    const { getFieldDecorator } = form;
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [isLoading,setIsLoading]=useState(true); //加载
    const Empty_description='暂无数据'; // 空数据 文案描述
    const [banlanceInfo,setBanlanceInfo]=useState({name:'',price:''});  // 商户余额
    // const [isShow,setIsShow]=useState(false);  // 是否显示模态框
    const [startValue,setStartValue]=useState(null);  // 开始时间
    const [endValue,setEndValue]=useState(null);  // 结束时间
    const [shopList,setShopList]=useState([]);  // 店铺选择             
    const [shopSelectId,setShopSelectId]=useState('');  // 结束时间z                 
    const per_page=20;  // 默认  请求每页参数
    const [operatorList, setOperatorList] = useState([])

    useEffect(() => {
        getAccountList().then(response => {
            if (response.res) {
                setOperatorList(response.data.list)
            }
        })
    }, [])

    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await getRechargeList({
                params: {
                    ...cacheData,
                    shop_id: cacheData.name_id || cacheData.shop_id
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

        const banlanceInfo=async()=>{
            await RechargeStatistic({
                params: {
                    ...cacheData,
                    shop_id: cacheData.name_id || cacheData.shop_id
                }
            }).then((response) => {
                if (response.res) {
                    let resData = response.data;
                    setBanlanceInfo(resData);
                }
            });
        }
        banlanceInfo();
    },[cacheData]);
    
   
    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
        },
        {
            title: '充值ID',
            dataIndex: 'id'
        },
        {
            title: '商户名称',
            dataIndex: 'name'
        },
        {
            title: '商户ID',
            dataIndex: 'shop_id'
        },
        {
            title: '充值金额',
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
            title: '充值时间',
            dataIndex: 'created_at',
        },
        {
            title: '充值类型',
            dataIndex: 'distribution_type',
            render:((item)=>{
                return (
                    <>{item===1?"下单模式":"提货模式"}</>
                )
            })
        },
        {
            title: '操作人',
            dataIndex: 'real_name',
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
        //    console.log(values);
            if(!!values['start_time']){
                values.start_time=values['start_time'].format('YYYY-MM-DD');
            }
            if(!!values['end_time']){
                values.end_time=values['end_time'].format('YYYY-MM-DD');
            }
            if(!err){
                setCache({
                    ...cacheData, 
                    ...values,
                    page: 1,
                    name_id: shopSelectId   
                });      
            }
        })
        
    }
    //重置查询数据
    const handleReset = (e) => {
        e.preventDefault();
        form.resetFields();
        setShopSelectId('')
        refreshData();
        setStartValue(null)
        setEndValue(null)
    };


    /*******日期选择 ***/
   const onStartChange=(value)=>{
        setStartValue(value);
   }
   const onEndChange=(value)=>{
        setEndValue(value);
   }
   const disabledStartDate = startValue => {
        if (!startValue || !endValue) {
        return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    };
    const disabledEndDate = endValue => {
        if (!endValue || !startValue) {
        return false;
        }
        return endValue.valueOf() < startValue.valueOf();
    };
    const handleSeach = useCallback(debounce((value) => {
        if (value) {
            selectShop({
                params: {
                    name: value
                }
            }).then(response => {
                if (response.res) {
                    setShopList(response.data.list)
                } else {
                    setShopList([])
                }
            })
        } else {
            setShopList([])
        }
    }, 200), [])
    const shopSeacth = value => {
        handleSeach(value)
    }
    const shopSelect = value => {
        let shopSelectId = ''
        shopList.forEach(shop => {
            if (shop.name === value) {
                shopSelectId = shop.id
            }
        })
        setShopSelectId(shopSelectId)
    }
    return (
       
            <Card bodyStyle={{margin:0,padding:0}} headStyle={{border:"none"}} bordered={false}>
                <List grid={{ gutter: 24, column: 2 }}>
                    <List.Item className="list_label_item">
                    <span >商户总数:</span>
                    <span>{banlanceInfo.shop_total}</span>
                    </List.Item>
                    <List.Item className="list_label_item ">
                        <div className="flex-r ai-c h">
                            <p className="pr10 h">商户充值总金额:</p>
                            <Statistic title="" value={banlanceInfo.recharge_total} precision={2} fontSize={18} />
                        </div>
                    </List.Item>
                </List>
                <Form layout="inline" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                    <Form.Item label="商户名称" className="shop_form_item">
                    {getFieldDecorator('name', {
                        initialValue:cacheData.name,
                    })(
                        <Select
                            showSearch
                            placeholder="请输入商户搜索"
                            showArrow={false}
                            notFoundContent="未搜索到商户"
                            filterOption={false}
                            style={{width: 300}}
                            onSearch={shopSeacth}
                            onChange={shopSelect}
                        >
                            {
                                shopList.map(shop => <Option value={shop.name} key={shop.id}>{shop.name}</Option>)
                            }
                        </Select>
                    )}
                    </Form.Item>
                    <Form.Item label="商户ID" className="shop_form_item">
                    {getFieldDecorator('shop_id', {
                        initialValue:cacheData.shop_id,
                        rules:[{ pattern: /^[\d]*$/, message: '请填写数字!' }]
                    })(
                        <Input
                        type="text"
                        placeholder="请输入商户ID"
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="充值时间" className="shop_form_item">
                    {getFieldDecorator('start_time', {
                        initialValue: cacheData.start_time? moment(cacheData.start_time): null ,
                        rules: [],
                    })(<DatePicker 
                        disabledDate={disabledStartDate}
                        placeholder="开始时间" 
                        onChange={onStartChange}
                        />)}
                    </Form.Item>
                    <Form.Item label="" className="shop_form_item">
                    {getFieldDecorator('end_time', {
                        initialValue: cacheData.end_time? moment(cacheData.end_time): null,
                        rules: [],
                    })(
                        <DatePicker
                        disabledDate={disabledEndDate}
                        placeholder="结束时间"
                        onChange={onEndChange}
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="操作人" className="shop_form_item">
                    {getFieldDecorator('operator_id', {
                        initialValue: cacheData.operator_id
                    })(
                        <Select style={{width: 140}} placeholder="选择操作人">
                            {
                                operatorList.map(operator => <Option key={operator.id} value={operator.id} >{operator.real_name}</Option>)
                            }
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
                <div className="shop_table_model" >
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
    
    )
}
const RechargeRecord=Form.create({name:""})(GetListData);

const MerchantRechargeRecord = ({cacheData, setCache}) => {
    return (
        <FadeIn>
            <RechargeRecord cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}

export default cache(cacheDataKey, initListParams, MerchantRechargeRecord)