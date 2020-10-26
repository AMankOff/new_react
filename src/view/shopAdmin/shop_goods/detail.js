import React, { useState, useEffect } from 'react';
import {history} from "../../../browserHistory"
import "./index.css";
import {getUrlParam} from "../../../untils/untilsFn"
import {List,Icon,Card,Breadcrumb } from "antd";
import { getGoodsInfo} from "../../../service/api"

const ShopBrandDetail=()=>{
    const _id=getUrlParam("id");
    const [info,setInfo]=useState({});
    const [loading,setLoading]=useState(false);
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setLoading(true);
            await getGoodsInfo({
                params:{
                    goods_id: _id
                }
            }).then((response)=>{
                if(response.res){
                    const result=response.data;
                    setLoading(false);
                    setInfo(result);
                }
            })
        };  // 获取数据 
        getTableData();
    },[_id]);

    // // 获取供应商列表
    const getSuppList=(list)=>{
        const data=list.map(item=>item.name+'; ');
        return data
    }

    const title=(
        <>
            <Breadcrumb>
                <Breadcrumb.Item onClick={()=> history.goBack()} className="pointer">
                <Icon type="menu" />
                <span>商品管理</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>商品详情</Breadcrumb.Item>
            </Breadcrumb>
        </>
    );
    return (
        <Card
            title={title}
            footer={null}
            loading={loading}
            bordered={false}
        >
            <List>
                <List.Item className="list_model">
                    <span className="list_label">商品名称:</span>
                    <span>{info.title}</span>
                </List.Item>
                <List.Item className={!!info.classify_title?"list_model":"hide"}>
                    <span className="list_label">商品类目:</span>
                    <span>{info.classify_title} </span>
                </List.Item>
                <List.Item className={!!info.brand_title?"list_model":"hide"}>
                    <span className="list_label">商品品牌:</span>
                    <span>{info.brand_title}</span>
                </List.Item>
                <List.Item className={!!info.spu_title?"list_model":"hide"}>
                    <span className="list_label">商品SPU:</span>
                    <span>{info.spu_title}</span>
                </List.Item>
                <List.Item className={!!info.jfg_goods_name?"list_model":"hide"}>
                    <span className="list_label">关联中央库存商品:</span>
                    <span>{info.jfg_goods_name}</span>
                </List.Item>
                <List.Item className={!!info.provider_list && info.provider_list.length!==0?"list_model":"hide"}>
                    <span className="list_label">供应商信息:</span>
                    <span>{!!info.provider_list && getSuppList(info.provider_list)}</span>
                </List.Item>
                <List.Item className={!!info.price?"list_model":"hide"}>
                    <span className="list_label">商品面值:</span>
                    <span>{info.price}</span>
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">商品状态:</span>
                    <span>{info.status===1?"下架":"上架"}</span>
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">创建时间:</span>
                    <span>{info.created_at}</span>
                </List.Item>
                <List.Item className={!!info.updated_at?"list_model":"hide"}>
                    <span className="list_label">修改时间:</span>
                    <span>{info.updated_at}</span>
                </List.Item>
                {/* <List.Item className={!!info.admin_id?"list_model":"hide"}>
                    <span className="list_label">操作人:</span>
                    <span>{info.admin_id}</span>
                </List.Item> */}
                <List.Item className={!!info.describe?"list_model":"hide"}>
                    <span className="list_label">商品说明:</span>
                    <span>{info.describe}</span>
                </List.Item>
            </List>
        </Card>
    )

}

export default ShopBrandDetail