import React, { useState, useEffect, useRef } from 'react';
import "./index.css";
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import {Form,Input,Modal,message,InputNumber,Alert,Button,Table, Row, Col, Statistic } from "antd";
import { getGoodsStockNum,exportGoodsLog} from "../../../service/api"
import { convertCurrency } from "../../../untils/untilsFn";

const checkTotalPrice = (rule, value, callback) => {
    if (Number(value) <= 0) {
        callback("销售总价不能为 0")
    }
    callback()
}

// 导出模块
const ExportCardsForm = ({form,visible,data,handleHide,getData}) => {
    const title="导出卡密";  // 模态框 标题
    const { getFieldDecorator } = form;
    const num=0;  // 导出数量默认0
    const phone=''; //手机号
    const [stockNum,setStockNum]=useState();
    const [isLoading,setIsLoading]=useState(false);
    const [dataArr,setDataArr]=useState([]);  // 商品的供应商列表数据
    const [isListLoading,setIsListLoading]=useState(true);  // 加载
    const Emptydescription="暂无数据";
    const [selectedRowKey,setSelectedRowKeys]=useState([]);  //选中的供应列表id
    const [selectedRow,setSelectedRow]=useState([]);  //选中的供应列表数据
    const [inputStatus,setInputStatus]=useState(false);  // 商品数量 是否禁用  默认false 
    const [priceForchinese, setPriceForchinese] = useState('零元');
    const [inputPrice, setInputPrice] = useState(0);

    const [isCheckCount, setIsCheckCount]=useState(true); // 判断是否校验总金额和总数量 默认校验

    // form 引起 effect 刷新
    const formRef = useRef(null)
    formRef.current = form


    useEffect(()=>{
        const form = formRef.current;
        if(!!data.id){
            const getGoodsNum=async()=>{
                setStockNum('--');
                setIsListLoading(true);
                setDataArr([]);
                setInputStatus(false);
                setSelectedRow([]);
                setSelectedRowKeys([]);
                await getGoodsStockNum({
                    params:{
                        goods_id:data.id
                    }
                }).then((response)=>{
                    if(response.res){
                        setIsListLoading(false);
                        const result=response.data;
                        setStockNum(result.total_num);
                        const listData=result.list;
                        // 初始化校验
                        listData.forEach(item=>{ // 判断 列表中是否需要校验 
                            if(!item.is_check_store){
                                setIsCheckCount(false);  // 禁止校验
                            }
                        })
                        listData.forEach(item=>{item.price=0; item.soldNum=0; });
                        setDataArr(listData);
                        if (result.total_num === 0) {
                            message.error('商品库存不足');
                            handleHide();
                        }
                    }else{
                        handleHide();
                        form.resetFields();
                    }
                })
            }
            getGoodsNum();
        } 
    },[data, handleHide, formRef]);

    useEffect(() => {
        if (visible) {
            setInputPrice(0)
            setPriceForchinese('零元')
        }
    }, [visible])

     // 表格表头
     const columnsList=[
        {
          title: '主体',
          dataIndex: 'company_name',
          render:((item)=>{
              return (
                  <>
                    <div className="ellipsis_more" title={item}>{item}</div>
                  </>
              )
          })
        },
        {
          title: '供应商',
          dataIndex:'provider_name',
          render:((item)=>{
            return (
                <>
                  <div className="ellipsis_more" title={item}>{item}</div>
                </>
            )
        })
        },
        {
            title: '剩余面值（元）',
            dataIndex: 'balance',
        },
        {
            title: '库存数量',
            dataIndex: 'num',
        },
        {
            title: '导出数量',
            key:'id',
            width:135,
            render:((row)=>{
                let label_params='export_num'+row.id;
                return (
                    <>
                    <Form.Item label="" className="editproveprice_form_item">
                    {getFieldDecorator(label_params, {
                        initialValue: row.soldNum,
                        rules: [
                            { required: true, message: '请填写导出数量!' },
                            { pattern: /^[\d]*$/, message: '请输入正整数!' },
                            // { max:Number(row.num), type:'number', message:"导出数量不能超过库存数量"},
                            { validator:(rule,value,callback)=>{
                                    const index=selectedRow.findIndex(item=>item.id===row.id);
                                    if(index!==-1 && value===0){
                                        callback("数量不能为0");
                                    }else if(Number(row.num)<value && isCheckCount){
                                        callback("导出数量不能超过库存数量");
                                    }else{
                                        callback();
                                    }
                                }
                            }
                        ],
                        validateFirst:true
                    })(
                        <InputNumber
                        step={0}
                        placeholder="请填写导出数量"
                        className="w120"
                        onChange={(value)=>changeNumber(value,row)}
                        allowClear
                        />
                    )}
                    </Form.Item>
                    </>
                )
            })
        },
    ]
    
    // 改变分配总价
    const changeNumber=(value,row)=>{
        const index=dataArr.findIndex(item=>item.id===row.id);
        dataArr[index].soldNum=value;
        let total=0;
        selectedRow.forEach(item=>{
            if(item.id===row.id){
                item.soldNum=value;
            }
            total+=Number(item.soldNum);
        })
        form.setFieldsValue({"num":total});
    }

    // 改变表格选中项
    const changeSelectedRow=(selectedRowKeys,selectedRows)=>{
        // console.log(isCheckCount);
        if(selectedRowKeys.length===0){
            setInputStatus(false);
        }else{
            setInputStatus(true);
        }
        // 校验是否 校验数量
        const data=selectedRows.length===0? dataArr : selectedRows;
        setIsCheckCount(true); // 默认需要校验
        data.forEach(item=>{ // 判断 列表中是否需要校验 
            if(!item.is_check_store){
                setIsCheckCount(false);  // 禁止校验
            }
        })
        setSelectedRowKeys(selectedRowKeys);
        setSelectedRow(selectedRows);
        let total=0;
        selectedRows.forEach(item=>{
            total+=Number(item.soldNum);
        })
        form.setFieldsValue({"num":total});
    }
    // 导出卡密
    const handleOk=(e)=>{
    //    e.preventDefault();
        form.validateFields(async(err, values) => {
            console.log(err);
            if (!err) {
                setIsLoading(true);
                let typeStatus=selectedRow.length===0?1:0;
                let rowD=selectedRow.map(item=>{return {id:item.id, num:item.soldNum}});
                if (typeStatus === 1) {
                    rowD = dataArr.map(item => {
                        return  {
                            id: item.id,
                            price: -1,
                            num: -1
                        }
                    })
                }
                await exportGoodsLog({
                    params:{
                        goods_id: data.id,
                        num:values.num,
                        mobile:values.mobile,
                        type:typeStatus,
                        data:rowD,
                        count_decr_price: values.decrPrice
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("提示：提货码已发至您输入的手机号，请注意查收!");
                        handleHide();
                        form.resetFields();
                        getData();
                    }
                    setIsLoading(false);
                    
                })
            }
        });
        
    }


     // 检测库存数量
     const checkStockNum=(rule,value,callback)=>{
        if(value>stockNum && isCheckCount){
            callback('数量不能高于剩余库存总数!');
        }else{
            callback()
        }
    }
    
    // 隐藏模态框
    const handleCancel=(e)=>{
        e.preventDefault();
        form.resetFields();
        setInputStatus(false);
        setSelectedRow([]);
        setSelectedRowKeys([]);
        dataArr.forEach(item=>item.soldNum=0)
        handleHide();
    }

    // 显示选中的行
    const getSelectD=(record, selected)=>{
        if(!selected){
            let formName='export_num'+record.id;
            form.setFieldsValue({[formName]:0});
            const index=dataArr.findIndex(item=>item.id===record.id);
            dataArr[index].soldNum=0;
        }
    }

    // 显示全选的行
    const getSelectAllD=(selected,selectedRows,changeRows)=>{
        if(!selected){
            let formName='';
            changeRows.forEach(item => {
                formName='export_num'+item.id;
                form.setFieldsValue({[formName]:0});
                const index=dataArr.findIndex(row=>row.id===item.id);
                dataArr[index].soldNum=0;
            });
        }
    }


    //表单布局
    const formItemLayout={
        labelCol:{span:8},
        wrapperCol:{span:12}
    }

    // 销售总价
    const decrPriceChange = (value) => {
        if (value) {
          setInputPrice(value);
          setPriceForchinese(convertCurrency(value))
        } else {
          setInputPrice(0);
          setPriceForchinese('零元')
        }
    };


    return (
        <div>
        <Modal
            title={title}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            width={650}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                  取消
                </Button>,
                <Button key="submit" type="primary" loading={isLoading} onClick={handleOk}>
                  确认
                </Button>,
            ]}
        >
            <Alert message="请仔细填写手机号，该手机号用于查收文件提取码" type="info" showIcon />
            <Form {...formItemLayout} className="exportCardsform mt20" autoComplete="off">
                <Form.Item label="商品名称" className="editbrand_form_item">
                {getFieldDecorator('goods_name', {
                    initialValue: data.title,
                    rules: [],
                })(
                    <Input
                    type="text"
                    disabled
                    />
                )}
                </Form.Item>
                <Form.Item label="手机号" className="editbrand_form_item">
                {getFieldDecorator('mobile', {
                    initialValue: phone,
                    rules: [
                        { required: true, message: '请输入手机号!' },
                        { pattern:/^(13|14|15|17|18|16|19)[0-9]{9}$/, message:'请输入正确的手机号'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入手机号"
                    max={11}
                    />
                )}
                </Form.Item>
                <Form.Item label="剩余库存总数" className="editbrand_form_item" >
                {getFieldDecorator('count', {
                    initialValue: stockNum,
                })(
                    <Input type="text" disabled/>
                )}
                </Form.Item>
                <GetEmpty descriptions={Emptydescription} >
                    <Table 
                        columns={columnsList} 
                        dataSource={dataArr} 
                        bordered
                        size="small"
                        pagination={false}
                        rowKey={record=>record.id}
                        loading={isListLoading}
                        rowSelection={{
                            hideDefaultSelections:true,
                            selectedRowKeys:selectedRowKey,
                            onChange:changeSelectedRow,
                            onSelect:getSelectD,
                            hideSelectAll:true,
                            onSelectAll:getSelectAllD
                            }}
                        scroll={{x:false,y:'240px'}}
                        bodyStyle={{margin:0}}
                        style={{marginBottom:'4px'}}
                    />
                    </GetEmpty>
                    <div className="fs14">如不选择列表，则默认随机发货</div>
                <Form.Item label="导出数量" className="editbrand_form_item" >
                {getFieldDecorator('num', {
                    initialValue: num,
                    rules: [
                        { required: true, message: '数量不能为空!' },
                        { min:1, type:'number', message: '数量不能小于1!' },
                        { pattern: /^[\d]*$/, message: '请输入正整数!' },
                        { validator: checkStockNum, message: '数量不能高于剩余库存总数!' }
                    ],
                    validateFirst:true
                })(
                    <InputNumber min={0}  disabled={inputStatus} style={{width:"100%"}}/>
                )}
                </Form.Item>
                <Form.Item label="销售总价" className="editbrand_form_item" >
                {getFieldDecorator('decrPrice', {
                    validateFirst:true,
                    rules: [
                        { required: true, message: '销售总价不能为空!' },
                        { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '请输入正确价格!' },
                        { validator: checkTotalPrice, message: '销售总价不能为 0' }
                    ],
                })(
                    <InputNumber min={0} style={{width:"100%"}} onChange={decrPriceChange}/>
                )}
                </Form.Item>
                <Row>
                <Col span={12} offset={8}>
                    <Statistic
                        title=""
                        value={inputPrice}
                        valueStyle={{ fontSize: 16 }}
                        precision={2}
                    />
                    <p className="mt10 fw700">{priceForchinese}</p>
                </Col>
                </Row>
        </Form>
      </Modal>
      </div>
    )
}
// 查询数据
const ExportCardsOrign=Form.create({name:'exportCardsform'})(ExportCardsForm);

const ExportCards=({visible,data,handleHide,getData})=>{
    return (
        <>
            <ExportCardsOrign visible={visible} data={data} handleHide={handleHide} getData={getData}/>
        </>
    )
}

export default ExportCards