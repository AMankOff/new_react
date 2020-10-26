import React from 'react';
import "./index.css";
import {Form,Input,Modal,Radio,message } from "antd";
import { addShopClass,editShopClass} from "../../../service/api"

const UpdataAddForm = ({form,visible,data,handleHide,getData}) => {
//    console.log(form,visible,data,handleHide,getData);
    const title=!!data.id?"修改类目":"新增类目";
    const { getFieldDecorator } = form;
    const disabled_status=!!data.id? true:false;
    const class_type=!!data.id? data.status : 0;  // 0 启用 1 停用
//    console.log(class_type);
    const class_name=data.title || '';
    // 确定订单
    const handleOk=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
            //  console.log('Received values of form: ', values);
              if(!!data.id){  // 修改
                await editShopClass({
                    params:{
                        title:values.title,
                        classify_id:data.id,
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
                await addShopClass({
                    params:{
                        title:values.title,
                        status:values.status,
                      
                    }
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

     //表单布局
     const formItemLayout={
        labelCol:{span:6},
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
            <Form className="" {...formItemLayout} autoComplete="off">
                <Form.Item label="类目名称" className="shop_form_item">
                {getFieldDecorator('title', {
                    initialValue: class_name,
                    rules: [
                        { required: true, message: '请输入类目名称!' },
                        { max:10, message:'类目名称不能超过10个字'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入类目名称"
                    />,
                )}
                </Form.Item>
                <Form.Item label="类目状态" className="shop_form_item">
                {getFieldDecorator('status', {
                    initialValue: class_type,
                    rules: [{ required: true, message: '' }],
                })(
                    <Radio.Group disabled={disabled_status}>
                        <Radio value={0}>启用</Radio>
                        <Radio value={1}>停用</Radio>
                    </Radio.Group>,
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