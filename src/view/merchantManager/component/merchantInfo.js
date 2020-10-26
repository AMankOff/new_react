import React ,{ useState }from 'react';
import {List,Modal, Statistic } from "antd";

// 图片放大
const ImageMagnify=({visible,source,handleClose})=>{
    return (
        <Modal visible={visible} footer={null} onCancel={handleClose} closable={false} bodyStyle={{padding:0}}>
          <img alt="example" style={{ width: '100%' }} src={source} />
        </Modal>
    )
}


// 个人
const IdentityInfo=(Info)=>{
    const dataSource=Info.dataSource;
    const [visible,setVisible]=useState(false);
    const [source,setSource]=useState("");
    // 图片放大
    const openImagesMangy=(e)=>{
        setVisible(true);
        setSource(e.currentTarget.src);
    }
    
    return (
        <>
        <List.Item className={!!dataSource.identity_card_facade_photo?"list_model":"hide"}>
            <span className="list_label">身份证正面照片:</span>
            <span><img src={dataSource.identity_card_facade_photo} className="list_img" alt="" onClick={openImagesMangy}/></span>
        </List.Item>
        <List.Item className={!!dataSource.identity_card_back_photo?"list_model":"hide"}>
            <span className="list_label">身份证反面照片:</span>
            <span><img src={dataSource.identity_card_back_photo} className="list_img" alt="" onClick={openImagesMangy}/></span>
        </List.Item>
        <List.Item className={!!dataSource.identity_card?"list_model":"hide"}>
            <span className="list_label">身份证号码:</span>
            <span>{dataSource.identity_card}</span>
        </List.Item>
        <List.Item className={!!dataSource.contact?"list_model":"hide"}>
            <span className="list_label">联系人:</span>
            <span>{dataSource.contact}</span>
        </List.Item>
        <List.Item className={!!dataSource.phone?"list_model":"hide"}>
            <span className="list_label">联系电话:</span>
            <span>{dataSource.phone}</span>
        </List.Item>
        <List.Item className={!!dataSource.address?"list_model":"hide"}>
            <span className="list_label">联系地址:</span>
            <span>{dataSource.address}</span>
        </List.Item>
        <ImageMagnify visible={visible} source={source} handleClose={()=>setVisible(false)}/>
        </>
    )
}

// 企业
const BusinessInfo=(BusinessInfo)=>{
    
    const dataSource=BusinessInfo.dataSource;
    const [visible,setVisible]=useState(false);
    const [source,setSource]=useState("");
    // 图片放大
    const openImagesMangy=(e)=>{
        setVisible(true);
        setSource(e.currentTarget.src);
    }
    return (
        <>
        <List.Item className={!!dataSource.contact?"list_model":"hide"}>
            <span className="list_label">联系人:</span>
            <span>{dataSource.contact}</span>
        </List.Item>
        <List.Item className={!!dataSource.phone?"list_model":"hide"}>
            <span className="list_label">联系电话:</span>
            <span>{dataSource.phone}</span>
        </List.Item>
        <List.Item className={!!dataSource.company_name?"list_model":"hide"}>
            <span className="list_label">公司名称:</span>
            <span>{dataSource.company_name}</span>
        </List.Item>
        <List.Item className={!!dataSource.company_address?"list_model":"hide"}>
            <span className="list_label">公司地址:</span>
            <span>{dataSource.company_address}</span>
        </List.Item>
        <List.Item className={!!dataSource.business_photo?"list_model":"hide"}>
            <span className="list_label">营业执照:</span>
            <span><img src={dataSource.business_photo} className="list_img" alt="" onClick={openImagesMangy}/></span>
        </List.Item>
        <List.Item className={!!dataSource.business_license?"list_model":"hide"}>
            <span className="list_label">统一社会信用代码:</span>
            <span>{dataSource.business_license}</span>
        </List.Item>
        <List.Item className={!!dataSource.tax_register_num?"list_model":"hide"}>
            <span className="list_label">税务登记证编号:</span>
            <span>{dataSource.tax_register_num}</span>
        </List.Item>
        <List.Item className={!!dataSource.organization_num?"list_model":"hide"}>
            <span className="list_label">企业组织机构编号:</span>
            <span>{dataSource.organization_num}</span>
        </List.Item>
        <ImageMagnify visible={visible} source={source} handleClose={()=>setVisible(false)}/>
        </>
    )
}


// 商户详情
const MerchantInfo=({dataSource})=>{
    if(dataSource.length===0){
        return false;
    }
     // 获取商户状态
     const getMerchantType=(index)=>{
        const typeArr=["未认证","待审核","认证成功","认证失败"];
        return typeArr[index];
    }

    return (
        <>
                <List.Item>店铺信息</List.Item>
                <List.Item className="list_model">
                    <span className="list_label">商户名称:</span>
                    <span>{dataSource.shop.name}</span>
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">商户类型:</span>
                    <span>{dataSource.shop.type===1?"个人":"企业"}</span>
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">商户角色:</span>
                    <span>{dataSource.shop.role===1?"进货商":"供货商"}</span>
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">商户余额:</span>
                    <Statistic style={{display: 'inline-block'}} value={dataSource.shop.balance} precision={2} valueStyle={{fontSize: 16, color: 'rgba(0, 0, 0, 0.65)'}} />
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">商户状态:</span>
                    <span>{getMerchantType(dataSource.shop.status)}</span>
                </List.Item>
                <List.Item className={!!dataSource.shop.remark?"list_model":"hide"}>
                    <span className="list_label">备注信息:</span>
                    <span>{dataSource.shop.remark}</span>
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">注册账号:</span>
                    <span>{dataSource.merchant.mobile}</span>
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">注册时间:</span>
                    <span>{dataSource.shop.created_at}</span>
                </List.Item>
                <List.Item className={dataSource.authenticate.length!==0?"list_model":"hide"}>认证信息</List.Item>
                {
                    dataSource.shop.type===1?<IdentityInfo dataSource={dataSource.authenticate}/>:<BusinessInfo dataSource={dataSource.authenticate}/>
                }
                <List.Item className={!!dataSource.traffic.main_business || dataSource.traffic.major_industries_name ?"list_model":"hide"}>主营信息</List.Item>
                <List.Item className={!!dataSource.traffic.main_business?"list_model":"hide"}>
                    <span className="list_label">主营业务:</span>
                    <span>{dataSource.traffic.main_business}</span>
                </List.Item>
                <List.Item className={!!dataSource.traffic.major_industries_name?"list_model":"hide"}>
                    <span className="list_label">主要行业:</span>
                    <span>{dataSource.traffic.major_industries_name}</span>
                </List.Item>
                <List.Item className="list_model">基本信息</List.Item>
                <List.Item className="list_model">
                    <span className="list_label">所属账号:</span>
                    <span>{dataSource.merchant.mobile}</span>
                </List.Item>
                <List.Item className={!!dataSource.merchant.full_address?"list_model":"hide"}>
                    <span className="list_label">详细地址:</span>
                    <span>{dataSource.merchant.full_address}</span>
                </List.Item>
                <List.Item className={!!dataSource.merchant.email?"list_model":"hide"}>
                    <span className="list_label">电子邮箱:</span>
                    <span>{dataSource.merchant.email}</span>
                </List.Item>
                <List.Item className={!!dataSource.merchant.qq?"list_model":"hide"}>
                    <span className="list_label">QQ:</span>
                    <span>{dataSource.merchant.qq}</span>
                </List.Item>
        </>
    )
}


export default MerchantInfo