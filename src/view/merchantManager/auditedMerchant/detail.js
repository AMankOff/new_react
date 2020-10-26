import React, { useState, useEffect } from 'react';
import {history} from "../../../browserHistory"
import "./index.css"
import {getUrlParam} from "../../../untils/untilsFn"
import MerchantInfo from "../component/merchantInfo"
import {List,Icon,Card,Radio,Breadcrumb,Form,Input,Button,message } from "antd";
import { auditMerchantInfo,auditMerchant} from "../../../service/api"

const { TextArea } = Input;


// 审核状态
const MerchantStatus=({form})=>{
    const { getFieldDecorator } = form;
    const [remarkShow,setRemarkShow]=useState(false);
    const [RULES,setRULES]=useState([]);
    const merchant_id=getUrlParam("merchant_id");
    const shop_id=getUrlParam("shop_id");
    //审核状态判断
    const changeStatus=(e)=>{
    //    console.log(e);  // 1 通过  2不通过
        if(e.target.value===1){
            setRemarkShow(false);
            setRULES([])
        }else{
            setRemarkShow(true);
            setRULES([
                { required: true, message: '未通过原因必填!' },
                { max: 100, message: '未通过原因不能超过100个字!' }
            ])
        }
    }

    // 提交
    const handleSubmit=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
            //    console.log('Received values of form: ', values);
                await auditMerchant({
                    params:{
                        merchant_id:merchant_id,
                        shop_id:shop_id,
                        status:values.status,
                        remark:values.remark,
                    }
                }).then((resolve)=>{
                    if(resolve.res){
                        message.success("提交成功！");
                        history.goBack();
                    }
                })
                
            }
        })
    }

    //表单布局
    // const formItemLayout={
    //     labelCol:{span:2},
    //     wrapperCol:{span:6}
    // }
    return (
        <>
            <Form layout="inline" name="From" onSubmit={handleSubmit} autoComplete="off">
                <List.Item className="list_model">
                    <Form.Item label="审核结果" style={{marginBottom:0}} >
                    {getFieldDecorator('status', {
                        initialValue:1,
                        rules:[{ required: true, message: '审核结果必填!' }]
                    })(
                        <Radio.Group onChange={changeStatus}>
                            <Radio value={1}>通过</Radio>
                            <Radio value={2}>不通过</Radio>
                        </Radio.Group>
                    )}
                    </Form.Item>
                </List.Item>
                    <Form.Item label="未通过原因" className={remarkShow?"shop_form_item":"hide"}>
                    {getFieldDecorator('remark', {
                        initialValue:'',
                        rules:RULES
                    })(
                        <TextArea
                            placeholder="请填写未通过原因"
                            autoSize={{ minRows: 4, maxRows: 6 }}
                            className="w450"
                        />
                    )}
                    </Form.Item>
                    <List.Item className="list_model">
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="shop_form_reset">
                            提交
                        </Button>
                    </Form.Item>
                    </List.Item>
            </Form>
        </>
    )
}

const MerchantStatusForm=Form.create()(MerchantStatus);

// 商户详情
const MerchantAuditDetail=()=>{
    const [isLoading,setIsLoading]=useState(false);
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    useEffect(()=>{
        const merchant_id=getUrlParam("merchant_id");
        const shop_id=getUrlParam("shop_id");
        const type=getUrlParam("type");
        const params = {
            merchant_id:merchant_id,
            shop_id:shop_id,
            type:type
        }
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await auditMerchantInfo({
                params:params
            }).then((response) => {
                if (response.res) {
                    let resData = response.data;
                    return resData;
                }
            });
            setIsLoading(false);
            setDataSource(dataSources);
        };  // 获取数据 
        getTableData();
    },[]);

    const title=(
        <>
            <Breadcrumb>
                <Breadcrumb.Item onClick={()=> history.goBack()} className="pointer">
                <Icon type="menu" />
                <span>商户审核</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>商户详情</Breadcrumb.Item>
            </Breadcrumb>
        </>
    );
    return (
        <Card
            title={title}
            footer={null}
            loading={isLoading}
        >
            <List>
                <MerchantInfo dataSource={dataSource}/>
                <MerchantStatusForm />
            </List>
            
        </Card>
    )

}


export default MerchantAuditDetail