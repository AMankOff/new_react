import React, { useState, useEffect } from 'react';
import "./index.css";
import {history} from "../../../browserHistory"
import {Form,Input,Radio,message,Card,Button,InputNumber } from "antd"
import { resetCache } from '../../../components/CacheData'
import ShopCascade from "../../../components/shopCascade/shopCascade"
import { addShopGoods,editShopGoods,getGoodsInfo} from "../../../service/api"

const { TextArea } = Input;


const cacheDataKey="shopGoodsParam";  // 默认传参KEY

// 新增模块
const AddForm = ({form}) => {
    const title="新增商品";
    const { getFieldDecorator } = form;
//    console.log(resetCache);
    // 新增
    const handleSubmit=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
            //  console.log('Received values of form: ', values);
              const brandL=values.brand_id;
              const brand_id=brandL[brandL.length-1];
            //  console.log(values,brand_id);
                await addShopGoods({
                    params:{
                        title: values.title,
                        brand_id: brand_id,
                        describe: values.describe,
                        status: values.status,
                        spu_id: values.spu_id,
                        jfg_goods_id: values.jfg_goods_id,
                        jfg_goods_name: values.jfg_goods_name,
                        price: values.price,
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("新增成功！");
                        resetCache(cacheDataKey)();
                        history.goBack();
                    }
                })
            }
        });
        
    }
    

    //表单布局
    const formItemLayout={
        labelCol:{span:3},
        wrapperCol:{span:6}
    }


    return (
        <div>
        <Card
            title={title}
        >
            <Form {...formItemLayout} className="" onSubmit={handleSubmit} autoComplete="off">
                <Form.Item label="商品名称" className="editbrand_form_item">
                {getFieldDecorator('title', {
                    rules: [
                        { required: true, message: '请输入商品名称!' },
                        { max:20, message:'商品名称不能超过20个字'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入商品名称"
                    />
                )}
                </Form.Item>
                {/* 类目选择 */}
                <ShopCascade  form={form} isShow={true} source={false}/>
                <Form.Item label="商品面值" className="editbrand_form_item">
                {getFieldDecorator('price', {
                    rules: [
                        { required: true, message: '商品面值不能为空!' },
                    ],
                })(
                    <InputNumber
                    step={0.01}
                    placeholder="商品面值"
                    className="shop_select_w"
                    disabled
                    />
                )}
                </Form.Item>
                <Form.Item label="商品状态" className="editbrand_form_item">
                {getFieldDecorator('status', {
                    initialValue: 0,
                    rules: [
                        { required: true, message: '请选择商品状态!' },
                    ],
                })(
                    <Radio.Group>
                        <Radio value={0}>上架</Radio>
                        <Radio value={1}>下架</Radio>
                    </Radio.Group>
                )}
                </Form.Item>
                <Form.Item label="商品说明" className="editbrand_form_item">
                {getFieldDecorator('describe', {
                    rules: [
                        { max: 500, message: '商品说明不能超过500字!' },
                    ],
                })(
                    <TextArea placeholder="请填写商品说明" allowClear={false} autoSize={{minRows:5, maxRows:10}}/>
                )}
                </Form.Item>
                <Form.Item className="shop_form_item">
                        <Button type="primary" htmlType="submit" className="shop_form_reset">
                            提交
                        </Button>
                        <Button type="default" onClick={()=>history.goBack()} className="shop_form_reset">
                            返回
                        </Button>
                </Form.Item>
        </Form>
      </Card>
      </div>
    )
}

// 查询数据
const AddOrign=Form.create({name:'AddSPUform'})(AddForm);

// 修改模块
const UpdataForm = ({form,data}) => {
    const title="修改商品";  // 模态框 标题
    const { getFieldDecorator } = form;
    const [info,setInfo]=useState({});
    
    useEffect(()=>{
       if(!!data.id){
            const detail=async()=>{
                await getGoodsInfo({
                    params:{
                        goods_id: data.id
                    }
                }).then((response)=>{
                    if(response.res){
                        const result=response.data;
                        setInfo(result);
                    }
                })
            }
            detail();
       }
    },[data]);

    
    // 修改
    const handleSubmit=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
            //  console.log('Received values of form: ', values);
                await editShopGoods({
                    params:{
                        goods_id: data.id,
                        title:values.title,
                        status:values.status,
                        describe:values.describe
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("修改成功！");
                        history.goBack();
                    }
                })
            }
        });
        
    }
    
 


    //表单布局
    const formItemLayout={
        labelCol:{span:3},
        wrapperCol:{span:6}
    }


    return (
        <div>
        <Card
            title={title}
        >
            <Form {...formItemLayout} className="" onSubmit={handleSubmit} autoComplete="off">
                <Form.Item label="商品名称" className="editbrand_form_item">
                {getFieldDecorator('title', {
                    initialValue: info.title,
                    rules: [
                        { required: true, message: '请输入商品名称!' },
                        { max:20, message:'商品名称不能超过20个字'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入商品名称"
                    />
                )}
                </Form.Item>
                <Form.Item label="商品状态" className="editbrand_form_item">
                {getFieldDecorator('status', {
                    initialValue: info.status,
                    rules: [
                        { required: true, message: '请选择商品状态!' },
                    ],
                })(
                    <Radio.Group>
                        <Radio value={0}>上架</Radio>
                        <Radio value={1}>下架</Radio>
                    </Radio.Group>
                )}
                </Form.Item>
                <Form.Item label="商品说明" className="editbrand_form_item">
                {getFieldDecorator('describe', {
                    initialValue: info.describe,
                    rules: [
                        { max: 500, message: '商品说明不能超过500字!' },
                    ],
                })(
                    <TextArea placeholder="请填写商品说明" allowClear autoSize={{minRows:3, maxRows:6}}/>
                )}
                </Form.Item>
                <Form.Item className="shop_form_item">
                        <Button type="primary" htmlType="submit" className="shop_form_reset">
                            修改
                        </Button>
                        <Button type="default" onClick={()=>history.goBack()} className="shop_form_reset">
                            返回
                        </Button>
                </Form.Item>
        </Form>
      </Card>
      </div>
    )
}
// 查询数据
const UpdataOrign=Form.create({name:'updataSPUform'})(UpdataForm);

const getUrlParam=(name)=>{
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
const UpdataAdd=()=>{
    const _id=getUrlParam("id");
    return (
        <>
            {!!_id?<UpdataOrign data={{"id":_id}} />:<AddOrign />}
            
        </>
    )
}

export default UpdataAdd