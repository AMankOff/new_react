import React, { useState, useEffect } from 'react';
import {history} from "../../../browserHistory"
import "./index.css"
import {getUrlParam} from "../../../untils/untilsFn"
import {List,Icon,Card,Table,Breadcrumb } from "antd";
import { getShopBrandDetail } from "../../../service/api"

const ShopBrandDetail=()=>{
    const [isLoading,setIsLoading]=useState(false);
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [childShow,setChildShow]=useState(false);  //是否显示子菜单  默认不显示
    useEffect(()=>{
        // 获取数据
        const _id=getUrlParam("brand_id");
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await getShopBrandDetail({
                params:{
                    brand_id:_id
                }
            }).then((response) => {
                if (response.res) {
                //    console.log(response);
                    let resData = response.data;
                    if(resData.child.length!==0){
                        const childs=resData.child;
                        let i=0;
                        setChildShow(true);
                        const result=childs.map((item)=>{
                            item._init= ++i;
                            return item;
                        })
                        resData.child=result;
                    }
                    return resData;
                }
            });
            setIsLoading(false);
            setDataSource(dataSources);
        };  // 获取数据 
        getTableData();
        
    },[]);

    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
        },
        {
          title: '品牌ID',
          dataIndex: 'id',
          key:'id'
        },
        {
          title: '品牌名称',
          dataIndex: 'title',
          key:'title'
        },
        {
            title: '品牌logo',
            dataIndex: 'logo',
            render:((img_src)=>{
                return (
                    <>
                        <img src={img_src} className="shop_img" alt=""/>
                    </>
                )
            })
          },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key:'created_at'
          },
      ];  // 表格 标头

    
    const title=(
        <>
            <Breadcrumb>
                <Breadcrumb.Item onClick={()=> history.goBack()} className="pointer">
                <Icon type="menu" />
                <span>品牌管理</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>品牌详情</Breadcrumb.Item>
            </Breadcrumb>
        </>
    );
    const subTitle=(
        <>
            <Breadcrumb>
                <Breadcrumb.Item>子品牌详情</Breadcrumb.Item>
            </Breadcrumb>
        </>
    );
    return (
        <Card
            title={title}
            footer={null}
            loading={isLoading}
            bordered={false}
        >
            <List className="bb">
                <List.Item className="list_model">
                    <span className="list_label">品牌名称:</span>
                    <span>{dataSource.title}</span>
                </List.Item>
                <List.Item className={!!dataSource.logo?"list_model":"hide"}>
                    <span className="list_label">品牌logo:</span>
                    <span><img src={dataSource.logo} className="list_img" alt=""/></span>
                </List.Item>
                <List.Item className="list_model">
                    <span className="list_label">创建时间:</span>
                    <span>{dataSource.created_at}</span>
                </List.Item>
            </List>
            <Card title={subTitle} className={childShow?"":"hide"} bodyStyle={{margin:0,padding:0}}>
                <Table 
                    columns={columnsData} 
                    dataSource={dataSource.child} 
                    pagination={{defaultCurrent:1,pageSize:20}}
                    bordered
                    rowKey={record=>record.id}
                    >
                </Table>
            </Card>
        </Card>
    )

}

export default ShopBrandDetail