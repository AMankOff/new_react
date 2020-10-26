import React ,{useState,useEffect}from 'react';
import "./index.css";
import {Form,Input,Modal,message,Select,Cascader} from "antd";
import { addShopSpu,editShopSpu,getJFGBrandList} from "../../../service/api"

const {Option}=Select;

 // 获取列表数据
 const getOptions=(arr)=>{
 //   console.log(arr);
    const opt=arr.map(item=>{
        return (
            <Option value={item.id} key={item.id} type={item.type} title={item.title?item.title:item.name}>{item.title?item.title:item.name}</Option>
        )
    })
    return opt;
}


// 新增模块
const AddForm = ({form,visible,handleHide,getData,shopClassData,shopBrandData,jfgBrandData}) => {
    const title="新增SPU";
    const { getFieldDecorator } = form;
 //   const [classify_id,setClassifyId]=useState();
//    const [brandList,setBrandList]=useState([]);
    
    // useEffect(()=>{
    //     setClassifyId();
    // //    setBrandList();
    // },[visible]);

    // 获取品牌列表
    // useEffect(()=>{
    //     if(!!classify_id){
    //         const getBrandList=async()=>{
    //             await getBrandListByClassifyId({
    //                 params:{
    //                     classify_id:classify_id
    //                 }
    //             }).then((response)=>{
    //                 if(response.res){
    //                     const result=response.data.list;
    //                     setBrandList(result);
    //                 }
    //             })
    //         }
    //         getBrandList();
    //     }
    // },[classify_id]);
    
    // 新增
    const handleOk=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
            //    console.log('Received values of form: ', values);
                const brandL=values.brand_id;
                const brand_id=brandL[brandL.length-1];
                await addShopSpu({
                    params:{
                        title:values.title,
                        brand_id:brand_id,
                        classify_id:values.classify_id,
                        jfg_brand_id:values.jfg_brand_id,
                        jfg_type:values.jfg_type,
                        jfg_brand_name:values.jfg_brand_name
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("新增成功！");
                        handleHide();
                        form.resetFields();
                        getData();
                    }
                })
            }
        });
        
    }
    
    // 隐藏模态框
    const handleCancel=(e)=>{
        e.preventDefault();
        form.resetFields();
        handleHide();
    }

     // 更改品牌类目
    //  const changeShopClass=(value,option)=>{
    //     setClassifyId(value);
    // }

    // 积分购状态
    const changejfgBrandType=(value,option)=>{
        const type=option.props.type;
        const title=option.props.title;
        form.setFieldsValue({"jfg_type":type});
        form.setFieldsValue({"jfg_brand_name":title});
    }

    //表单布局
    const formItemLayout={
        labelCol:{span:8},
        wrapperCol:{span:10}
    }
    
    return (
        <div>
        <Modal
            title={title}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确认"
            cancelText="取消"
        >
            <Form {...formItemLayout} className="" name="AddSPUform" >
                <Form.Item label="SPU名称" className="editbrand_form_item" autoComplete="off">
                {getFieldDecorator('title', {
                    rules: [
                        { required: true, message: '请输入SPU名称!' },
                        { max:20, message:'SPU名称不能超过20个字'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入SPU名称"
                    />
                )}
                </Form.Item>
                <Form.Item label="选择商品类目" className="editbrand_form_item" >
                {getFieldDecorator('classify_id', {
                    rules: [{ required: true, message: '请选择商品类目!' }],
                })(
                    <Select className="" placeholder="请选择商品类目">{getOptions(shopClassData)}</Select>
                )}
                </Form.Item>
                <Form.Item label="选择商品品牌" className="editbrand_form_item" >
                {getFieldDecorator('brand_id', {
                    rules: [{ required: true, message: '请选择商品品牌!' }],
                })(
                    <Cascader
                        fieldNames={{ label: 'title', value: 'id', children: 'child' }}
                        options={shopBrandData}
                        placeholder="请选择商品品牌"
                    />
                )}
                </Form.Item>
                <Form.Item label="选择中央库存品牌" className="editbrand_form_item">
                {getFieldDecorator('jfg_brand_id', {
                    rules: [{ required: true, message: '中央库存品牌必填' }],
                })(
                    <Select 
                        className=""
                        placeholder="请选择中央库存品牌"
                        onChange={changejfgBrandType}
                        showSearch
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {getOptions(jfgBrandData)}
                    </Select>,
                )}
                </Form.Item>
                <Form.Item label="中央库存品牌名称" className="editbrand_form_item hide">
                {getFieldDecorator('jfg_brand_name', {
                    rules: [{ required: true, message: '' }],
                })(
                    <Input type="text" />,
                )}
                </Form.Item>
                <Form.Item label="中央库存品牌类型" className="editbrand_form_item hide">
                {getFieldDecorator('jfg_type', {
                    rules: [{ required: true, message: '' }],
                })(
                    <Input type="text" />,
                )}
                </Form.Item>
        </Form>
      </Modal>
      </div>
    )
}

// 查询数据
const AddOrign=Form.create({name:'AddSPUform'})(AddForm);

// 修改模块
const UpdataForm = ({form,visible,data,shopClassData,handleHide,getData}) => {
//    console.log(data);
    const title="修改SPU";  // 模态框 标题
    const sup_title=data.title; // SPU名称
    const classify_id=data.classify_id ; //类目名称
    const brand_id=data.brand_title; // 品牌名称  
   
    const { getFieldDecorator } = form;

    
    // 修改
    const handleOk=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
        //      console.log('Received values of form: ', values);
                await editShopSpu({
                    params:{
                        spu_id: data.id,
                        title:values.title,
                        classify_id:values.classify_id,
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("修改成功！");
                        handleHide();
                        form.resetFields();
                        getData();
                    }
                })
            }
        });
        
    }
    
    // 隐藏模态框
    const handleCancel=(e)=>{
        e.preventDefault();
        form.resetFields();
        handleHide();
    }


    //表单布局
    const formItemLayout={
        labelCol:{span:6},
        wrapperCol:{span:8}
    }


    return (
        <div>
        <Modal
            title={title}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确认"
            cancelText="取消"
        >
            <Form {...formItemLayout} className="" autoComplete="off">
                <Form.Item label="SPU名称" className="editbrand_form_item" >
                {getFieldDecorator('title', {
                    initialValue: sup_title,
                    rules: [
                        { required: true, message: '请输入SPU名称!' },
                        { max:20, message:'SPU名称不能超过20个字'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入SPU名称"
                    />
                )}
                </Form.Item>
                <Form.Item label="选择商品类目" className="editbrand_form_item" >
                {getFieldDecorator('classify_id', {
                    initialValue: classify_id,
                    rules: [{ required: true, message: '请选择商品类目!' }],
                })(
                    <Select className="" placeholder="请选择商品类目">{getOptions(shopClassData)}</Select>
                )}
                </Form.Item>
                <Form.Item label="选择商品品牌" className="editbrand_form_item" >
                {getFieldDecorator('brand_id', {
                    initialValue: brand_id,
                    rules: [{ required: true, message: '请选择商品品牌!' }],
                })(
                    <Input type="text" disabled/>
                )}
                </Form.Item>
        </Form>
      </Modal>
      </div>
    )
}
// 查询数据
const UpdataOrign=Form.create({name:'updataSPUform'})(UpdataForm);

const UpdataAdd=({visible,data,modalType,handleHide,getData,shopClassData,shopBrandData})=>{
    const [jfgBrandData,setJFGBrandData]=useState([]);  // 积分购商品类目列表
    useEffect(()=>{
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
    return (
        <>
            {modalType==='edit'?<UpdataOrign visible={visible} data={data} handleHide={handleHide} shopClassData={shopClassData} getData={getData} />:<AddOrign visible={visible} handleHide={handleHide} getData={getData} shopClassData={shopClassData} shopBrandData={shopBrandData} jfgBrandData={jfgBrandData}/>}
            
        </>
    )
}

export default UpdataAdd