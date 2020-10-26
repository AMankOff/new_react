import React, { useState, useEffect } from 'react'
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../../components/AuthButton'
import UpdataAdd from "./updata_add"
import "./index.css";
import {Table,Button,Icon,Card, message} from "antd";
import { getShopClassList,editShopClassStatus} from "../../../service/api"





// 获取数据列表展示
const GetListData=()=>{
    let [dataSource,setDataSource]=useState([]);  // 列表数据
    let [isLoading,setIsLoading]=useState(true); //加载
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            const dataSources= await getShopClassList({
                params:{
                    type:1
                }
            }).then((response) => {
                if (response.res) {
                    let resData = response.data
                    const resultData=resData.list;
                    if(resultData.length!==0){
                        let i=0;
                        let result=resultData.map((item)=>{
                            item._init= ++i;
                            return item;
                        })
                        return result;
                    }else{
                        return [];
                    }
                    
                }
            });
            setIsLoading(false);
            setDataSource(dataSources);
        };  // 获取数据 
        getTableData();
    },[])
    const Empty_description='当前无数据'; // 空数据 文案描述
    let [isShow,setIsShow]=useState(false);  // 提交订单模态框  默认隐藏
    let [rowData,setRowData]=useState(false);  //默认 类别id  新增/修改
   
    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
        },
        {
          title: '类目ID',
          dataIndex: 'id',
          key:'id'
        },
        {
          title: '类目名称',
          dataIndex: 'title',
          key:'title'
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key:'created_at'
          },
          {
            title: '类目状态',
            key:'status',
            render:((row)=>
                <>
                <div>{row.status?"停用":"启用"}</div>
                </>
            )
          },
          {
            title: '操作',
            key:'act',
            render:((row)=>{
                return (
                    <>
                        <AuthButton authid="goods_classify_updatestatus">
                        <button onClick={()=>changeStatus(row)} className="shop_linkbtn-class color_00f">{row.status?"启用":"停用"}</button>
                        </AuthButton>
                        <AuthButton authid="goods_classify_update">
                        <button onClick={()=>detailAddFn(row)} className="shop_linkbtn-class color_00f">修改</button>
                        </AuthButton>
                    </>
                )
            })
            
          }
      ];  // 表格 标头
    //获取列表数据
    const getData= async ()=>{
        setIsLoading(true);
        let data= await getShopClassList({
            params:{
                type:1
            }
        }).then((response) => {
            if (response.res) {
                let resData = response.data
                const resultData=resData.list;
                if(resultData.length!==0){
                    let i=0;
                    let result=resultData.map((item)=>{
                        item._init= ++i;
                        return item;
                    })
                    return result;
                }else{
                    return [];
                }
            }
        });
        setIsLoading(false);
        setDataSource(data);
    }
    // 改变类目状态
    const changeStatus=async(data)=>{
        const _id=data.id;
        const _type=data.status?0:1;  // 0 启用 1停用
        await editShopClassStatus({
            params: {
                classify_id: _id,
                status: _type,
            }
        }).then((response)=>{
            if (response.res) {
                message.success("修改状态成功！");
            }
        })// 请求状态
        getData();  // 获取数据
    }  

    
    // 新增/修改类目
    const detailAddFn=(row)=>{
     //   e.preventDefault();
        setIsShow(true); //模态框展示
        setRowData(row);
    //    console.log(row);
    }
    const extra=(
        <span>
        <AuthButton authid="goods_classify_add">
            <Button type="primary" onClick={()=>detailAddFn(false)}>
                <Icon type="plus"/>
                新建类目
            </Button>
        </AuthButton>
        </span>
    )
    return (
        <div>
            <Card bodyStyle={{margin:0,padding:0}} headStyle={{border:"none"}} bordered={false} extra={extra}>
                <div className="shop_table_model">
                <GetEmpty descriptions={Empty_description} >
                <Table 
                    columns={columnsData} 
                    dataSource={dataSource} 
                    pagination={false}
                    bordered
                    rowKey={record=>record.id}
                    loading={isLoading}
                />
                <UpdataAdd visible={isShow} data={rowData} handleHide={()=>setIsShow(false)} getData={()=>getData()} />
                </GetEmpty>
                </div>
            </Card>
        </div>
    )
}
const ShopClasses = () => {
    
    return (
        <FadeIn>
            <GetListData/>
        </FadeIn> 
        
    )
}
export default ShopClasses