import React from 'react';
import "./index.css";
import {Form,Input,Modal,Radio,message } from "antd";
import { setProviderAdd,setProviderEdit} from "../../service/api"

const UpdataAddForm = ({form,visible,data,modalType,handleHide,getData}) => {
    const { getFieldDecorator } = form;
    let info,title;
    if(modalType==='edit'){
        title="修改供应商";
        info=data;
    }else{
        title="新增供应商";
        info={
            name:'',
            discount:'',
            ticket_type:0,
            tax:''
        }
    }
    // 提交数据
    const handleOk=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
            //  console.log('Received values of form: ', values);
              if(!!data.id){  // 修改
                await setProviderEdit({
                    params:{
                        id:data.id,
                        name:values.name,
                        discount:values.discount,
                        ticket_type:values.ticket_type,
                        tax:values.tax
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("修改成功！");
                        getData();
                        handleHide();
                        form.resetFields();
                    }
                })
              }else{  // 新增
                await setProviderAdd({
                    params:values
                }).then((response)=>{
                    if(response.res){
                        message.success("新增成功！");
                        getData();
                        handleHide();
                        form.resetFields();
                    }
                })
              }
              
            }
        });
        
    }
    
    // 隐藏模态框
    const handleCancel=(e)=>{
        e.preventDefault();
        form.resetFields();
        handleHide();
    }

    // 检测数值范围
    // const checkNum=(rule,value,callback)=>{
    //     if(value>0 && value<=100){
    //         callback()
    //     }else{
    //         callback('数值范围在0-100之间!'); 
    //     }
    // }
     //表单布局
     const formItemLayout={
        labelCol:{span:6},
        wrapperCol:{span:12}
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
            <Form {...formItemLayout} className="">
                <Form.Item label="供应商名称" className="shop_form_item">
                {getFieldDecorator('name', {
                    initialValue: info.name,
                    rules: [
                        { required: true, message: '请输入供应商名称!' },
                        { max:20, message:'类目名称不能超过20个字'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入供应商名称"
                    />,
                )}
                </Form.Item>
                <Form.Item label="折扣" className="shop_form_item">
                {getFieldDecorator('discount', {
                    initialValue: info.discount,
                    rules: [
                        { required: true, message: '折扣不能为空!' },
                        { pattern: /^[\d.]*$/, message: '折扣只能是数值!' },
                        { pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d{0,4})?$/, message: '折扣保留4位小数!' },
                        // { validator: checkNum },
                    ],
                    validateFirst:true
                })(
                    <Input
                    type="text"
                    placeholder="请输入折扣"
                    suffix="%"
                    />,
                )}
                </Form.Item>
                <Form.Item label="发票类型" className="shop_form_item">
                {getFieldDecorator('ticket_type', {
                    initialValue:info.ticket_type,
                    rules: [{ required: true, message: '' }],
                })(
                    <Radio.Group>
                        <Radio value={0}>无发票</Radio>
                        <Radio value={2}>普通发票</Radio>
                        <Radio value={1}>增值税</Radio>
                        <Radio value={3}>增值税专用票</Radio>
                    </Radio.Group>,
                )}
            </Form.Item>
            <Form.Item label="税率" className="shop_form_item">
                {getFieldDecorator('tax', {
                    initialValue: info.tax,
                    rules: [
                        { required: true, message: '税率不能为空!' },
                        { pattern: /^[\d.]*$/, message: '税率只能是数值!' },
                        { pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d{0,2})?$/, message: '税率保留两位小数!' },
                        // { validator: checkNum, message: '' },
                    ],
                    validateFirst:true
                })(
                    <Input
                    step={0.01}
                    placeholder="请输入税率"
                    suffix="%"
                    className="shop_select_w"
                    />,
                )}
                </Form.Item>
        </Form>
      </Modal>
      </div>
    )
}
// 查询数据
const UpdataAdd=Form.create({name:'updataAddform'})(UpdataAddForm);
export default UpdataAdd