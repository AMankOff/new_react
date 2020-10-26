import React, { useState, useEffect, useRef } from 'react';
import "./index.css";
import {Form,Select,Cascader, Input} from "antd";

import {selectBrandList,getShopClassList,getJFGBrandList,getSPUListByBrandId,getJfgGoodsList,getGoodsListByBrandIdSPU} from "../../service/api"

const {Option}=Select;

 // 获取列表数据
const getOptions=(arr)=>{
    //    console.log(arr);
       const opt=arr.map(item=>{
           return (
               <Option value={item.id} key={item.id} title={item.title || item.name} price={item.price || 0}>{item.title || item.name}</Option>
           )
       })
       return opt;
}


// 新增模块
const ShopCasaOrign = ({form,isShow,shopClassData,shopBrandData,jfgBrandData,source}) => {
//       console.log(shopBrandData);
    const { getFieldDecorator } = form;
    // const [classify_id,setClassifyId]=useState();
    const [spuList,setSPUList]=useState([]);
    const [brand_id,setBrandId]=useState();
    const [spu_id,setSPUID]=useState();
    const [jfgGoodsList,setJFGGoodsList]=useState([]);
    const [goodsList,setGoodsList]=useState([]);
    const [RULES,SetRULES]=useState([]);
    // 解决 form 每次刷新引起 被依赖的 effect 执行
    const formRef = useRef(null)
    formRef.current = form
    
    useEffect(()=>{
        // setClassifyId();  // 类目
        if(!!source){
            SetRULES([])
        }else{
            SetRULES([{ required: true, message: '请选择积分购商品!' }])
        }
        setBrandId('');
        setSPUID('');
        setSPUList([{value:'',title:'',id:''}]); //SPU
        setJFGGoodsList([{value:'',name:'',id:''}]); // 积分购
        setGoodsList([{value:'',title:'',id:''}]); // 商品
    },[isShow,source]);

     // 通过品牌列表获取spu 列表及积分购列表
     useEffect(()=>{
    //    console.log(form);
        const form = formRef.current
        if(!!brand_id){
            const getSPUList=async()=>{
                await getSPUListByBrandId({
                    params:{
                        brand_id:brand_id
                    }
                }).then((response)=>{
                    if(response.res){
                        let result=response.data.list;
                        if(result.length===0){
                            result=[{"id":'-1',"name":""}];
                        }
                        form.setFieldsValue({"jfg_goods_id":''});
                        form.setFieldsValue({"jfg_goods_name":''});
                        form.setFieldsValue({"price":''});
                        setJFGGoodsList([{value:'',name:'',id:0}]);  // 中央库存商品
                        setSPUList(result);
                    }
                })
            }
            getSPUList();
        }
        if(!!spu_id){
            const getJFGGoodsList=async()=>{
                await getJfgGoodsList({
                    params:{
                        spu_id:spu_id
                    }
                }).then((response)=>{
                    if(response.res){
                        let result=response.data.list;
                        if(result.length===0){
                            result=[{"id":'',"name":""}];
                        }
                        setJFGGoodsList(result);
                    }
                })
            }
            getJFGGoodsList();
        }
    },[brand_id,spu_id, formRef]); 

    // 获取商品列表
    useEffect(()=>{
        if(!!spu_id && !!brand_id && !!source){
            const getGoodsListByBrandId=async()=>{
                await getGoodsListByBrandIdSPU({
                    params:{
                        brand_id:brand_id,
                        spu_id: spu_id
                    }
                }).then((response)=>{
                    if(response.res){
                        const result=response.data.list;
                        setGoodsList(result);
                    }
                })
            }
            getGoodsListByBrandId();
        }
    },[brand_id,spu_id,source])   
    
    
     // 更改类目
     //const changeShopClass=(value,option)=>{
        //setClassifyId(value);
        // setSPUList([]);  // 设置Spu 列表为空
        // setJFGGoodsList([]);  // 设置积分购商品为空
        // setGoodsList([]);  //设置商品列表为空
        // form.setFieldsValue({"spu_id":''});
        // form.setFieldsValue({"jfg_goods_id":''});
        // const goods_valus=!source?0:'';
        // form.setFieldsValue({"goods_id":goods_valus});
    //}

    // 获得品牌ID
    const changeShopBrand=(value,option)=>{
        const brandL=value;
        const brand_id=brandL[value.length-1];
        setBrandId(brand_id);
        setGoodsList([]);  //设置商品列表为空
        setSPUID(0);
        form.setFieldsValue({"spu_id":''});
        form.setFieldsValue({"jfg_goods_id":''});
        form.setFieldsValue({"jfg_goods_name":''});
        form.setFieldsValue({"price":''});
        if(!!source){
            form.setFieldsValue({"goods_id":''});
        }
        
    }

    // 获得SPUid
    const changeSPUID=(value,option)=>{
        setSPUID(value);
        if(!!source){
            form.setFieldsValue({"goods_id":''});
        }
    }

    // 获取积分购商品
    const changeJFGGoods=(value,option)=>{
        // console.log(option);
        const goods_name=option.props.title;
        const goods_price=option.props.price;
        form.setFieldsValue({"jfg_goods_name":goods_name});
        form.setFieldsValue({"price":goods_price});
    }


    return (
        <div>
                {/* <Form.Item label="选择商品类目" className="editbrand_form_item" >
                {getFieldDecorator('classify_id', {
                    rules: [{ required: true, message: '请选择商品类目!' }],
                })(
                    <Select className="" placeholder="请选择商品类目" onChange={changeShopClass}>{getOptions(shopClassData)}</Select>
                )}
                </Form.Item> */}
                <Form.Item label="选择商品品牌" className="editbrand_form_item" >
                {getFieldDecorator('brand_id', {
                    initialValue: brand_id,
                    rules: [{ required: true, message: '请选择商品品牌!' }],
                })(
                    <Cascader
                        fieldNames={{ label: 'title', value: 'id', children: 'child' }}
                        options={shopBrandData}
                        onChange={changeShopBrand}
                        placeholder="请选择商品品牌"
                    />
                )}
                </Form.Item>
                <Form.Item label="选择SPU" className="editbrand_form_item" >
                {getFieldDecorator('spu_id', {
                    rules: [{ required: true, message: '请选择商品SPU!' }],
                })(
                    <Select 
                    className="" 
                    onChange={changeSPUID} 
                    placeholder="请选择商品SPU"
                    showSearch
                    filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    >{ getOptions(spuList) }</Select>
                )}
                </Form.Item>
                {
                    !!source?'':<Form.Item label="选择中央库存商品" className={"editbrand_form_item"} >
                                {getFieldDecorator('jfg_goods_id', {
                                    rules: RULES,
                                })(
                                    <Select 
                                    className="" 
                                    onChange={changeJFGGoods}
                                    placeholder="请选择中央库存商品"
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    >{ getOptions(jfgGoodsList) }</Select>
                                )}
                                </Form.Item>
                }
                {
                    !!source?'':<Form.Item label="选择中央库存商品" className="hide" >
                                    {getFieldDecorator('jfg_goods_name', {
                                        rules: RULES,
                                    })(
                                        <Input type="text" />
                                    )}
                                </Form.Item>
                }
                {
                    !!source?<Form.Item label="选择商品" className={"editbrand_form_item"} >
                    {getFieldDecorator('goods_id', {
                        rules: [{ required: true, message: '请选择商品!' }],
                    })(
                        <Select 
                        className="" 
                        placeholder="请选择商品"
                        showSearch
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        >{ getOptions(goodsList) }</Select>
                    )}
                    </Form.Item>:''
                }
                
      </div>
    )
}

const ShopCascade=({form,isShow,source=true})=>{
    const [shopClassData,setShopClassData]=useState([]);  // 商品类目列表
    const [shopBrandData,setShopBrandData]=useState([]);  // 未分页品牌列表
    const [jfgBrandData,setJFGBrandData]=useState([]);  // 积分购商品类目列表
     // 获取积分购列表、类目列表
     useEffect(()=>{
        // 获取类目列表
        const shopClass=async()=>{
            await getShopClassList({
                params:{
                    type:2    // 1: 所有  2：可用类目
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

        // 积分购品牌列表
        const jfgBrand=async()=>{
            await getJFGBrandList({
                params:{}
            }).then((response)=>{
                if(response.res){
                    const result=response.data.list;
                    setJFGBrandData(result);
                }
            })
        }
        jfgBrand();
    },[])
    return(
        <ShopCasaOrign form={form} isShow={isShow} shopClassData={shopClassData} shopBrandData={shopBrandData} jfgBrandData={jfgBrandData} source={source}/>
    ) 
}

export default ShopCascade