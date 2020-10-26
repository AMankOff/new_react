import React, { useState, useEffect, useCallback } from 'react'
import {history} from "../../../browserHistory"
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../../components/AuthButton'
import ExportCards from "./exportCards"
import "./index.css";
import { cache, resetCache } from '../../../components/CacheData'
import {Form,Input,Table,Button,Icon,Card,DatePicker,Select, Statistic } from "antd";
import { getShopGoodsList} from "../../../service/api"
const {Option}=Select;


const cacheDataKey="shopGoodsParam";  // 默认传参KEY
const refreshData=resetCache(cacheDataKey);
let initListParams={
    title:'',  // 商品名称
    goods_id:'', //商品ID
    status: undefined , //商品状态
    begin_date:null, //开始时间
    end_date:null, //结束时间
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
    const [isShow,setIsShow]=useState(false);  // 模态框  默认隐藏
    const [rowData,setRowData]=useState(false);  //默认 类别id  新增/修改
    const [startValue,setStartValue]=useState(null);  // 开始时间
    const [endValue,setEndValue]=useState(null);  // 结束时间
    const per_page=20;  // 默认  请求每页参数
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await getShopGoodsList({
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
          width: 70,
          fixed: 'left'
        },
        {
          title: '商品ID',
          dataIndex: 'id',
          width: 80,
          fixed: 'left'
        },
        {
          title: '商品名称',
          key:'goods_name',
          width: 150,
          fixed: 'left',
          render:((row)=>{
              return (
                  <>
                    <AuthButton authid="goods_goods_getgoodsinfo">
                    <span className="pointer" onClick={()=>history.push('/shopGoods/detail?id='+row.id)}>{row.title}</span>
                    </AuthButton>
                  </>
              )
          })
        },
        {
            title: '类目名称',
            dataIndex: 'classify_title',
            width: 120,
        },
        {
          title: '品牌名称',
          dataIndex: 'brand_title',
          width: 120,
        },
        {
            title: 'SPU名称',
            dataIndex: 'spu_title',
            width: 120,
        },
        {
            title: '商品面值',
            dataIndex: 'price',
            width: 110,
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
            title: '中央库存商品',
            dataIndex: 'jfg_goods_name',
        },
        {
            title: '商品状态',
            dataIndex: 'status',
            width: 90,
            render:((item)=>{
                return (
                    <span>{item===0?'上架':'下架'}</span>
                )
            })
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            width: 170,
        },
        {
            title: '操作',
            key:'act',
            width: 150,
            fixed: 'right',
            render:((row)=>{
                    return (
                        <>
                            <AuthButton authid="goods_goods_update">
                            <button onClick={()=>detailAddFn(row,'edit')} className="shop_linkbtn-class color_00f">修改</button>
                            </AuthButton>
                            {/* <button onClick={()=>delFn(row)} className="shop_linkbtn-class color_00f">删除</button> */}
                             {
                                row.status===0?
                                <AuthButton authid="orders_goods_export">
                                <button onClick={()=>exportCards(row,'edit')} className="shop_linkbtn-class color_00f">导出卡密</button>
                                </AuthButton>
                                :''
                            }
                            {/*<AuthButton authid={34}>
                            <button onClick={()=>manageCards(row)} className="shop_linkbtn-class color_00f">管理库存</button>
                            </AuthButton> */}
                        </>
                    )
            })
            
          }
      ];  // 表格 标头

    //修改/新建 刷新列表
    const getData= async()=>{
        if(modalType==='add'){
            refreshData(); 
        }else{
            setCache({...cacheData});  // 缓存查询数据
        }
    }
    // 新增/修改品牌
    const detailAddFn=(row,type)=>{
        if(type==='add'){
            history.push('/shopGoods/AddUpdata');
        }else {
            history.push('/shopGoods/editUpdata?id='+row.id);
        }
    }
    // 导出卡密
    const exportCards=(row)=>{
        setModalType('edit');
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
            if(!!values['begin_date']){
                values.begin_date=values['begin_date'].format('YYYY-MM-DD');
            }
            if(!!values['end_date']){
                values.end_date=values['end_date'].format('YYYY-MM-DD');
            }
            if(!err){
                setCache({...cacheData, ...values,page:1}); 
            }   
        })
        
    }
    //重置查询数据
    const handleReset = (e) => {
        e.preventDefault();
        form.resetFields();
        refreshData();
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

    const extra=(
        <span>
        <AuthButton authid="goods_goods_add">
            <Button type="primary" onClick={()=>detailAddFn(false,'add')}>
                <Icon type="plus"/>
                新建商品
            </Button>
        </AuthButton>
        </span>
    )

    const exportCardsHideHandle = useCallback(() => {
        setIsShow(false);
        // setCache({...cacheData});
    }, [])
    return (
        <div className="w h flex-c p16">
            <Form layout="inline" name="shopGoodsFrom" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                    <Form.Item label="商品名称" className="shop_form_item" >
                    {getFieldDecorator('title', {
                        initialValue:cacheData.title,
                    })(
                        <Input
                        type="text"
                        placeholder="请输入商品名称"
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="商品ID" className="shop_form_item">
                    {getFieldDecorator('goods_id', {
                        initialValue:cacheData.goods_id,
                        rules:[{ pattern: /^[\d]*$/, message: '请填写数字!' }]
                    })(
                        <Input
                        type="text"
                        placeholder="请输入商品ID"
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="商品状态" className="shop_form_item">
                    {getFieldDecorator('status', {
                        initialValue:cacheData.status,
                    })(
                        <Select className="shop_select_w">
                            <Option value='0'>上架</Option>
                            <Option value='1'>下架</Option>
                        </Select>
                    )}
                    </Form.Item>
                    <Form.Item label="上架时间" className="shop_form_item">
                    {getFieldDecorator('begin_date', {
                        initialValue:cacheData.begin_date,
                         rules: [],
                    })(<DatePicker 
                        disabledDate={disabledStartDate}
                        placeholder="开始时间" 
                        onChange={onStartChange}
                        />)}
                    </Form.Item>
                    <Form.Item label="" className="shop_form_item">
                    {getFieldDecorator('end_date', {
                        initialValue:cacheData.end_date,
                        rules: [],
                    })(
                        <DatePicker
                        disabledDate={disabledEndDate}
                        placeholder="结束时间"
                        onChange={onEndChange}
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
            <Card 
                bodyStyle={{margin:0,padding:0, flex: 1}} 
                headStyle={{border:"none"}} 
                bordered={false} 
                extra={extra}
                className="flex1 flex-c"
            >
                
                <div className="h">
                    <GetEmpty descriptions={Empty_description} className="h" >
                        <Table 
                            columns={columnsData} 
                            dataSource={dataSource} 
                            pagination={{ current:countData.current_page,total:countData.total,pageSize:20,onChange:pageChange}}
                            bordered
                            rowKey={record=>record.id}
                            loading={isLoading}
                            scroll={{ x: 1400 }}
                        />
                        <ExportCards 
                            visible={isShow} 
                            data={rowData} 
                            handleHide={exportCardsHideHandle} 
                            getData={()=>getData()}
                        />
                    </GetEmpty>
                </div>
            </Card>
        </div>
    )
}

const ShopGoodsFormTable=Form.create({name:'shopGoodsFrom'})(GetListData);
const ShopGoods = ({cacheData, setCache}) => {
    return (
        <FadeIn>
            <ShopGoodsFormTable cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}

export default cache(cacheDataKey, initListParams, ShopGoods)