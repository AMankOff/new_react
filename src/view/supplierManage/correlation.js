import React from 'react';
import "./index.css";
import {Form,Modal,message } from "antd";
import ShopCascade from "../../components/shopCascade/shopCascade"
import { addProviderGoods} from "../../service/api"



const CorrelationForm = ({form,visible,data,handleHide,getData}) => {
    const title="关联商品";
    // 提交数据
    const handleOk=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
                await addProviderGoods({
                    params:{
                        goods_id:values.goods_id,
                        provider_id:data.provider_id
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("关联成功！");
                        getData();
                        handleHide();
                        form.resetFields();
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
        wrapperCol:{span:12}
    }

    return (
        <Modal
            title={title}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确认"
            cancelText="取消"
        >
        <Form {...formItemLayout} className="">
            <ShopCascade form={form} isShow={visible}/>
        </Form>
      </Modal>
    )
}
// 查询数据
const Correlation=Form.create({})(CorrelationForm);
export default Correlation