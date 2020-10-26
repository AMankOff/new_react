import React, { useState, useEffect, useCallback} from 'react'
import { Descriptions, Modal, List, Button, Steps, Spin } from "antd";
import { getDistributionProgress} from "../../../service/api";
import { debounce } from "../../../untils/untilsFn";
const { Step } = Steps;

// 发货进度
const DeliveryProgressManage=({visible,data, merchantName, hideFn})=>{
   const [progressData,setProgressData]=useState([]);
   const [isLoadingShow,setIsLoadingShow]=useState(false);  // loading 加载
   const [cur,setCur]=useState();  // 当前进度
   const [status,setStatus]=useState(0); // 当前状态

   // 获取进度数据
   useEffect(()=>{
        const getData=async()=>{
            await getDistributionProgress({
                params:{
                    distribute_id:data.distribute_id,
                }
            }).then((response) => {
                if (response.res) {
                    let resData = response.data;
                    setIsLoadingShow(false);
                    setProgressData(resData);
                    setStatus(resData.status);
                    // 待处理、预采中、预采失败、补发待处理
                    if(resData.status===0 || resData.status===5 || resData.status===7 || resData.status===8){ // 流程状态  预采中，发货中，发货成功/失败
                        setCur(0);
                    // 发货中、预采成功、采购完成待发货
                    }else if(resData.status===1 || resData.status===4 || resData.status===6){
                        setCur(1);
                    // 发货成功、发货失败
                    }else if(resData.status===2 || resData.status===3){
                        setCur(3);
                    }
                }
            });
        }
        if(data.id){
            setIsLoadingShow(true);
            setCur();
            getData();
        }
   },[data])

   // 刷新进度数据
   const getNewProgress=useCallback(
        debounce(()=>{
            setIsLoadingShow(true);
            getDistributionProgress({
                params:{
                    distribute_id:data.distribute_id,
                }
            }).then((response) => {
                if (response.res) {
                    let resData = response.data;
                    setIsLoadingShow(false);
                    setProgressData(resData);
                    setStatus(resData.status);
                    // 待处理、预采中、预采失败
                    if(resData.status===0 || resData.status===5 || resData.status===7 || resData.status===8){ // 流程状态  预采中，发货中，发货成功/失败
                        setCur(0);
                    // 发货中、预采成功、采购完成待发货
                    }else if(resData.status===1 || resData.status===4 || resData.status===6){
                        setCur(1);
                    // 发货成功、发货失败
                    }else if(resData.status===2 || resData.status===3){
                        setCur(3);
                    }
                }
            });
        }, 200),
        [data]
    );

   return (
       <Modal
            title="发货进度"
            visible={visible}
            footer={null}
            onCancel={()=>hideFn()}
            bodyStyle={{paddingBottom:"40px"}}
       >
        <Spin spinning={isLoadingShow}>
            <List split={false}>
                <List.Item className="flex-r c333 fw700">
                    <span className="tr mr10 w90">商户名称:</span>
                    <span className="flex1">{progressData.shop_name}</span>
                </List.Item>
                <List.Item className="flex-r c333 fw700">
                    <span className="tr mr10 w90">商品名称:</span>
                    <span className="flex1">{progressData.goods_title}</span>
                </List.Item>
                <List.Item className="flex-r c333 fw700">
                    <span className="tr mr10 w90">需发货数量:</span>
                    <span className="flex1">{progressData.num}</span>
                </List.Item>
            </List>
            <Steps current={cur} labelPlacement="vertical" size="small">
                <Step title={status!==7?"预采中":"预采失败"}  status={status===7?'error':''}/>
                <Step title="发货中" />
                <Step title={status!==3?"发货成功":"发货失败"} status={status===3?'error':''}/>
            </Steps>
            <div style={{marginTop:"10px"}}>
            <Descriptions bordered size="small" style={{ width: '70%', textAlign:'center', display:'inline-block' }}>
                <Descriptions.Item label="预采进度" span={3}>
                    {"已采"+progressData.progress+"%"}
                    { 
                         progressData.quantity!=='0'?
                        "，剩余"+progressData.quantity+"张":''
                    }
                </Descriptions.Item>
                <Descriptions.Item label="发货进度">{progressData.delivery_num+'/'+progressData.num}</Descriptions.Item>
            </Descriptions>
            <Button onClick={getNewProgress} type="primary" style={{ position:'relative', bottom:'12px', right:'-10px'}}>刷新</Button>
            </div>
            
            {
                status===3|| status===7?
                <div className="cf00 fs14">失败原因：{progressData.err_messaage}</div>:<></>
            }
        </Spin>
       </Modal>
   )
}

export default DeliveryProgressManage