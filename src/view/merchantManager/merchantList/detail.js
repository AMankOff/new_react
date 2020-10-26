import React, { useState, useEffect } from 'react';
import { history} from "../../../browserHistory"
import "./index.css"
import { getUrlParam} from "../../../untils/untilsFn"
import MerchantInfo from "../component/merchantInfo"
import { List,Icon,Card,Breadcrumb} from "antd";
import { auditMerchantInfo} from "../../../service/api"

// 商户详情
const ShopBrandDetail=()=>{
    
    const [isLoading,setIsLoading]=useState(false);
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    useEffect(()=>{
        // 获取数据
        const merchant_id=getUrlParam("merchant_id");
        const shop_id=getUrlParam("shop_id");
        const type=getUrlParam("type");
        // const _merchantStatus=getUrlParam("merchantStatus") || null;
        const params={
            merchant_id:merchant_id,
            shop_id:shop_id,
            type:type
        }
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
        //    console.log(dataSources);
        };  // 获取数据 
        getTableData();
    },[]);
    
    const title=(
        <>
            <Breadcrumb>
                <Breadcrumb.Item onClick={()=> history.goBack()} className="pointer">
                <Icon type="menu" />
                <span>商户管理</span>
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
            <List className="bb">
                <MerchantInfo dataSource={dataSource}/>
            </List>
            
        </Card>
    )

}


export default ShopBrandDetail