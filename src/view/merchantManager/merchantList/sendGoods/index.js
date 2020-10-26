import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Form, Input, Table, Button, message, Radio, Alert, List, Statistic, Row, Col, Popover, Modal, Skeleton  } from "antd";
import { distributiveShopGoods, getGoodsStockNum, distributiveSubmitShopOrder, addShopInterfaceGoods } from "../../../../service/api"
import { useLocation, useHistory } from 'react-router-dom';
import { queryParse } from '../../../../browserHistory'
import FadeIn from '../../../../components/FadeIn'
import styles from './index.module.css'

const { confirm } = Modal;

const priceRegExp = /^(([\d]{1}\d*)|(0{1}))(\.\d{0,2})?$/
const numRegExp = /^\d*$/

const checkGreaterThan0 = (rule, value, callback) => {
    if (Number(value) <= 0) {
        callback("不能小于 0")
    }
    callback()
}

const SendGoods = ({ form }) => {
    const { getFieldDecorator } = form;
    
    const location = useLocation()
    const history  = useHistory()
    const [stockNum, setStockNum] = useState(0);  // 总库存数
    const [stockPrice, setStockPrice] = useState(); // 总余额数
    const [goodsName, setGoodsName] = useState(''); // 商品名称
    const [goodsPrice, setGoodsPrice] = useState(''); // 商品面值

    const [dataArr, setDataArr] = useState([]);  // 商品的供应商列表数据
    const [isListLoading, setIsListLoading] = useState(true);  // 加载
    const [selectedRowKey, setSelectedRowKeys] = useState([]);  //选中的供应列表id
    const [inputStatus, setInputStatus] = useState(false);  // 商品总面值 是否禁用  默认false 

    const [isCheckCount, setIsCheckCount]=useState(true); // 判断是否校验总金额和总数量 默认校验

    const {shopName, goodsId, shopId} = queryParse(location) // 商户名称 商品ID 商户ID
    let [sendType, setSendType] = useState(2)
    let [sendDetail, setSendDetail] = useState([])
    let [totalPrice, setTotalPrice] = useState('')
    let [totalNum, setTotalNum] = useState('')
    let [discount, setDiscout] = useState(0)
    let [salePrice, setSalePrice] = useState(0)
    let [unitPrice, setUnitPrice] = useState(0)
    // 解决 form 每次刷新引起 被依赖的 effect 执行
    const formRef = useRef(null)
    formRef.current = form


    const selectSendType = e => {
        setSendType(e.target.value)
    }
    const changeSelectedRow = (selectedRowKeys,selectedRows) => {
        const data=selectedRows.length===0? dataArr : selectedRows;
        setIsCheckCount(true); // 默认需要校验
        data.forEach(item=>{ // 判断 列表中是否需要校验 
            if(!item.is_check_store){
                setIsCheckCount(false);  // 禁止校验
            }
        })
        setSelectedRowKeys(selectedRowKeys);
    }
    const checkInputInfo = useCallback((price, num, index, record) => {
        let copySendDetail = [...sendDetail]
        const targetInfo = copySendDetail[index]
        let priceErrMsg = '分配面值有误'
        let numErrMsg = '分配数量有误'
        let isMore=false;
        if(!!record.is_check_store){ // 判断 是否支持余额查询 false 不再校验 金额和数量的大小
            isMore = Number(price) > Number(record.balance)
        }
        // const isMore = Number(price) > Number(record.balance)
        const isPeiceRight = priceRegExp.test(price)
        const isNumRight = numRegExp.test(num)
        if (isPeiceRight && isMore) {
            priceErrMsg = '分配面值大于库存剩余面值'
        }
        if (isNumRight && isMore) {
            numErrMsg = '分配数量大于库存剩余数量'
        }
        const isPriceErr = (price !== null && price !== '' && !isPeiceRight) || isMore
        const isNumErr = (num !== null && num !== '' && !isNumRight) || isMore

        const updateInfo = {
            id: targetInfo.id,
            price: price,
            num: num,
            priceErrMsg,
            isPriceErr,
            numErrMsg,
            isNumErr
        }
        copySendDetail[index] = updateInfo
        setSendDetail(copySendDetail)
    }, [sendDetail])
    // 改变分配面值
    const changePrice = useCallback((price, index, record) => {
        // console.log(record);
        const num = price / goodsPrice ? price / goodsPrice : ''
        checkInputInfo(price, num, index, record)
    }, [checkInputInfo, goodsPrice])

    // 改变分配数量
    const changeSendGoodsNum = useCallback((num, index, record) => {
        const price = num * goodsPrice ? num * goodsPrice : ''
        checkInputInfo(price, num, index, record)
    }, [checkInputInfo, goodsPrice]) 

    // 输入总面值
    const totalPriceChange = e => {
        const totalPrice = e.currentTarget.value
        if (priceRegExp.test(totalPrice)) {
            setTotalPrice(totalPrice)
            if (sendType === 2) {
                form.setFieldsValue({ "num": totalPrice / goodsPrice });
            }
            setTotalNum(totalPrice / goodsPrice)
        }
    }
    const totalNumChange = e => {
        const totalNum = e.currentTarget.value
        const totalPrice = totalNum * goodsPrice
        if (numRegExp.test(totalNum)) {
            setTotalNum(totalNum)
            setTotalPrice(totalPrice)
            form.setFieldsValue({ "price": totalPrice });
        }
    }

    const discoutChange = e => {
        const discount = e.currentTarget.value
        const decrPrice = goodsPrice * discount
        if (priceRegExp.test(discount)) {
            setDiscout(discount)
        }
        if (sendType === 3 && decrPrice) {
            form.setFieldsValue({ "decr_price": (decrPrice / 100).toFixed(2)});
        }
        if (sendType === 3 && !decrPrice) {
            form.setFieldsValue({ "decr_price": ''});
        }
    }

    const soldPriceChange  = useCallback(e => {
        const form = formRef.current
        const soldPrice = e.currentTarget.value
        const discount = soldPrice / goodsPrice
        if (discount) {
            form.setFieldsValue({ "discount": (discount * 100).toFixed(2)});
        } else {
            form.setFieldsValue({ "discount": ''});
        }
    }, [formRef, goodsPrice])

    // 检测总金额
    const checkTotalPrice = (rule, value, callback) => {
        if (Number(value) > Number(stockPrice) && isCheckCount) {
            callback("分配面值大于库存剩余面值")
        } 
        if (Number(value) <= 0) {
            callback("分配面值不能为 0")
        }
        if (!numRegExp.test(value / goodsPrice) && sendType === 1) {
            callback("当前输入不能分配整数数量的商品")
        }
        callback()
    }

    // 检测总数量
    const checkTotalNum = (rule, value, callback) => {
        if (Number(value) > Number(stockNum) && isCheckCount) {
            callback("分配面值大于库存剩余数量")
        } else {
            callback()
        }
    }

    const goBack = useCallback(() => {
        history.goBack()
    }, [history]) 
    // 非接口模式
    const sendOutSubmit = useCallback(values => {
        const rowParam = sendDetail.filter(goods => selectedRowKey.includes(goods.id))
        const type = rowParam.length === 0 ? 1 : 0;
        let isRowParamErr = false
        rowParam.forEach(row => {isRowParamErr = row.isNumErr || row.isPriceErr})
        if (isRowParamErr) {
            return false
        }
        let reqRow = dataArr.filter(item => item.num > 0).map(item => {
            return {
                id: item.id,
                price: -1,
                num: -1
            }
        })
        if (type === 0) {
            reqRow = rowParam.map(item => {
                return {
                    id: item.id,
                    price: item.price,
                    num: item.num
                }
            })
        }

        let content = (
                <List split={false}>
                    <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10 w120">商户名称:</span>
                        <span className="flex1">{shopName}</span>
                    </List.Item>
                    <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10 w120">商品名称:</span>
                        <span className="flex1">{goodsName}</span>
                    </List.Item>
                    <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10 w120">商品总面值:</span>
                        <span className="flex1"><Statistic value={totalPrice} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix="元" /></span>
                    </List.Item>
                    <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10 w120">商品销售总价:</span>
                        <span className="flex1"><Statistic value={salePrice} precision={4} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix="元" /></span>
                    </List.Item>
                    {
                        sendType === 2 && <List.Item className="flex-r c333 fw700">
                            <span className="tr mr10 w120">实际扣款金额为:</span>
                            <span className="flex1"><Statistic value={salePrice} precision={2} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} formatter={value => Number(value).toFixed(2)} suffix="元" /></span>
                        </List.Item>
                    }
                    <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10 w120">采购数量:</span>
                        <span className="flex1"><Statistic value={totalNum} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix="张" /></span>
                    </List.Item>
                    {
                        sendType === 1 && <List.Item className="flex-r c333 fw700">
                            <span className="tr mr10 w120">采购单价:</span>
                            <span className="flex1"><Statistic value={unitPrice} precision={4} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix="元" /></span>
                        </List.Item>
                    }
                </List>
        )
        confirm({
            title: "确认分配该商品?",
            content: content,
            okText: "确定",
            cancelText: '取消',
            onOk() {
                if (sendType === 2) {  // 提货模式
                    return distributiveSubmitShopOrder({
                        params: {
                            shop_id: shopId,
                            goods_id: goodsId,
                            num: values.num,
                            count_decr_price: salePrice,
                            count_price: values.price,
                            discount: values.discount,
                            type: type,
                            data: reqRow,
                            real_decr_price: Number(salePrice).toFixed(2)
                        }
                    }).then((response) => {
                        if (response.res) {
                            message.success("分配成功！");
                            history.goBack()
                        }
                    })
                } else {
                    return distributiveShopGoods({  // 下单模式
                        params: {
                            shop_id: shopId,
                            goods_id: goodsId,
                            stock_num: totalNum,
                            count_decr_price: salePrice,
                            discount: values.discount,
                            decr_price: unitPrice,
                            data: reqRow,
                            type: type
                        }
                    }).then((response) => {
                        if (response.res) {
                            message.success("分配成功！");
                            history.goBack()
                        }
                    })
                }
            },
            onCancel() { },
        })
    }, [dataArr, goodsId, goodsName, history, salePrice, selectedRowKey, sendDetail, sendType, shopId, shopName, totalNum, totalPrice, unitPrice])

    const requestSubmit = useCallback(values => {
        if (selectedRowKey.length === 0) {
            message.error('请勾选供应商')
            return false
        }
        const sendGoodsDetail = dataArr.filter(goods => selectedRowKey.includes(goods.id)).map(item => {
            return {
                id: item.id,
                sort: 0
            }
        })
        let content = (
            <List split={false}>
                <List.Item className="flex-r c333 fw700">
                    <span className="tr mr10 w120">商户名称:</span>
                    <span className="flex1">{shopName}</span>
                </List.Item>
                <List.Item className="flex-r c333 fw700">
                    <span className="tr mr10 w120">商品名称:</span>
                    <span className="flex1">{goodsName}</span>
                </List.Item>
                <List.Item className="flex-r c333 fw700">
                    <span className="tr mr10 w120">商品面值:</span>
                    <span className="flex1"><Statistic value={goodsPrice} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix="元" /></span>
                </List.Item>
                <List.Item className="flex-r c333 fw700">
                    <span className="tr mr10 w120">商品编码:</span>
                    <span className="flex1">{values.goods_code}</span>
                </List.Item>
                <List.Item className="flex-r c333 fw700">
                        <span className="tr mr10 w120">商品单价:</span>
                        <span className="flex1"><Statistic value={values.decr_price} precision={2} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} formatter={value => Number(value).toFixed(2)} suffix="元" /></span>
                    </List.Item>
                <List.Item className="flex-r c333 fw700">
                    <span className="tr mr10 w120">售卖折扣:</span>
                    <span className="flex1"><Statistic value={values.discount} precision={2} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix="%" /></span>
                </List.Item>
            </List>
    )
    confirm({
        title: "确认分配该商品?",
        content: content,
        okText: "确定",
        cancelText: '取消',
        onOk() {
            return addShopInterfaceGoods({
                params: {
                    ...values,
                    shop_id: shopId,
                    goods_id: goodsId,
                    data: sendGoodsDetail
                }
            }).then((response) => {
                if (response.res) {
                    message.success("分配成功！");
                    goBack()
                }
            })
        },
        onCancel() { },
    })
        
    }, [selectedRowKey, goodsId, shopId, dataArr, goBack, shopName, goodsName, goodsPrice])

    const submitHandle = () => {
        form.validateFields((err, values) => {
            if (err) {
                return false
            }
            if (sendType === 3) {
                requestSubmit(values)
            } else {
                sendOutSubmit(values)
            }
        })
    }

    const columnsList = useMemo(() => {
        return sendType !== 3? [
            {
                title: '主体',
                dataIndex: 'company_name',
                render: ((item) => {
                    return <div className="ellipsis_more" title={item}>{item}</div>
                })
            },
            {
                title: '供应商',
                dataIndex: 'provider_name',
                render: ((item) => {
                    return <div className="ellipsis_more" title={item}>{item}</div>
                })
            },
            {
                title: '库存数量',
                dataIndex: 'num',
                render: num => <Statistic value={num} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} />
            },
            {
                title: '剩余面值（元）',
                dataIndex: 'balance',
                render: balance => <Statistic value={balance} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} />
            },
            {
                title: '分配面值（元）',
                width: 160,
                dataIndex: 'id',
                render: ((id, record, index) => {
                    const { price, priceErrMsg, isPriceErr } = sendDetail[index]
                    return (
                        <Popover
                            content={<Alert message={priceErrMsg} type="error" />}
                            visible={isPriceErr}
                        >
                            <Input
                                type="text"
                                className="w"
                                placeholder="请输入分配面值"
                                value={price}
                                onChange={(e) => changePrice(e.currentTarget.value, index, record)}
                            />
                        </Popover>
                    )
                })
            },
            {
                title: '分配数量',
                width: 160,
                render: ((id, record, index) => {
                    const { num, numErrMsg, isNumErr } = sendDetail[index]
                    return (
                        <Popover
                            content={<Alert message={numErrMsg} type="error" />}
                            visible={isNumErr}
                        >
                            <Input
                                type="text"
                                className="w"
                                value={num}
                                placeholder="请输入分配数量"
                                onChange={(e) => changeSendGoodsNum(e.currentTarget.value, index, record)}
                            />
                        </Popover>
                    )
                })
            },
    ]: [
        {
            title: '主体',
            dataIndex: 'company_name',
            render: ((item) => {
                return <div className="ellipsis_more" title={item}>{item}</div>
            })
        },
        {
            title: '供应商',
            dataIndex: 'provider_name',
            render: ((item) => {
                return <div className="ellipsis_more" title={item}>{item}</div>
            })
        },
        {
            title: '库存数量',
            dataIndex: 'num',
            render: num => <Statistic value={num} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} />
        },
        {
            title: '剩余面值（元）',
            dataIndex: 'balance',
            render: balance => <Statistic value={balance} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} />
        }
    ]
    }, [sendType, sendDetail, changePrice, changeSendGoodsNum]) 
    
    const tableData = useMemo(() => {
        if (sendType === 3) {
            return dataArr
        } else {
            return dataArr.filter(item => item.num > 0)
        }
    }, [sendType, dataArr])

    useEffect(() => {
        getGoodsStockNum({
            params: {
                goods_id: goodsId,
                type: 2
            }
        }).then(response => {
            if (response.res) {
                const repData = response.data
                const listData = repData.list;
                const sendDetail = listData.filter(item => item.num > 0).map(item => {
                    return {
                        id: item.id,
                        price: '',
                        num: '',
                        priceErrMsg: '',
                        numErrMsg: '',
                        isPriceErr: false,
                        isNumErr: false
                    }
                });
                // 初始化校验
                listData.forEach(item=>{ // 判断 列表中是否需要校验 
                    if(!item.is_check_store){
                        setIsCheckCount(false);  // 禁止校验
                    }
                })
                setStockNum(repData.total_num);
                setStockPrice(repData.total_balance);
                setSendDetail(sendDetail);
                setDataArr(listData);
                setGoodsName(repData.title);
                setGoodsPrice(repData.price);
                setIsListLoading(false)
            }
        })
    }, [goodsId])

    useEffect(() => {
        if (sendType !== 3) {
            let totalPrice = 0
            let totalNum = 0
            const form = formRef.current
            const hasNumSelectedRowKey = tableData.filter(item => selectedRowKey.includes(item.id))
            if (hasNumSelectedRowKey.length > 0) {
                const filterSendDetail = sendDetail.filter(goods => selectedRowKey.includes(goods.id))
                filterSendDetail.forEach(value => {
                    totalPrice = totalPrice + Number(value.price)
                    totalNum = totalNum + Number(value.num)
                })
                setInputStatus(true)
                setTotalPrice(totalPrice)
                setTotalNum(totalNum)
            } else {
                totalPrice = ''
                totalNum = ''
                setInputStatus(false)
            }
            if (sendType === 2) {
                
                form.setFieldsValue({
                    num: totalNum,
                    price: totalPrice
                });
            } else if (sendType === 1) {
                form.setFieldsValue({
                    price: totalPrice
                });
            }
        }                           
    }, [selectedRowKey, sendDetail, sendType, formRef, tableData])

    useEffect(() => {
        if (discount && totalPrice) {
            const salePrice = ((Number(totalPrice) * 10000) * (Number(discount) * 100)) / (10000 * 100 * 100)
            const unitPrice = (Number(goodsPrice) * 10000) * (Number(discount) * 100) / (10000 * 100 * 100)
            setSalePrice(salePrice)
            setUnitPrice(unitPrice)
        } else {
            setSalePrice(0)
            setUnitPrice(0)
        }
    }, [totalPrice, discount, goodsPrice])
    // 切换类型时 同步数量数据
    useEffect(() => {
        if (totalNum && sendType === 2) {
            const form = formRef.current
            form.setFieldsValue({
                num: totalNum,
            });
        }
    }, [sendType, totalNum, formRef])
    
    return (
        <FadeIn>
            <section className="w h bgf5">
                <div className={`w h bgfff border4 pl32 pt20 ${styles.container}`}>
                    <Row type="flex">
                        <Col style={{ width: 82 }} className="tr mr16" >商户名称</Col>
                        <Col>{shopName}</Col>
                    </Row>
                    <Row type="flex" className="mt20">
                        <Col style={{ width: 82 }} className="tr mr16" >分配模式</Col>
                        <Col>
                            <Radio.Group onChange={selectSendType} value={sendType}>
                                <Radio value={2}>提货模式</Radio>
                                <Radio value={1}>下单模式</Radio>
                                <Radio value={3}>接口模式</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                    <Skeleton active loading={isListLoading} >
                        <div className={`${styles.goodInfo} mt20 flex-r ai-c`}>
                            <div style={{ width: 82 }} className="tr mr16">商品名称</div>
                            <div className="mr40">{goodsName}</div>
                            <div className="mr16">商品面值</div>
                            <div className="mr40">
                                <Statistic value={goodsPrice} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix={ <span style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} >元</span>} />
                            </div>
                            <div className="mr16">剩余库存 / 总面值</div>
                            <div className="mr40 flex-r ai-c"><Statistic value={stockNum} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix={ <span style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} >张</span>} className="mr10" /> / <Statistic className="ml10" value={stockPrice} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix={ <span style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} >元</span>} /></div>
                            {
                                sendType !==3 && stockNum === 0 && <div style={{color: '#ffa39e'}} >当前商品库存为 0 ，不能分配</div>
                            }
                        </div>
                    </Skeleton>
                    <Table
                        columns={columnsList}
                        dataSource={tableData}
                        bordered
                        size="small"
                        pagination={false}
                        rowKey={record => record.id}
                        loading={isListLoading}
                        rowSelection={{
                            selectedRowKeys: selectedRowKey,
                            onChange: changeSelectedRow,
                        }}
                        bodyStyle={{ margin: 0 }}
                        style={{ marginTop: 20 }}
                        scroll={{ y: 240 }}
                        locale={{emptyText: '暂无数据'}}
                    />
                    {
                        sendType !== 3 && <div style={{fontSize: 12, color: '#989898', marginTop: 8}} >*如不选择列表则默认随机发货</div>
                    }
                    <Form
                        className="send-goods-form mt20"
                        autoComplete="off"
                        labelCol={{ span: 1 }}
                        wrapperCol={{ span: 12 }}
                    >
                        {
                            sendType !== 3 && <Form.Item label="商品总面值" colon={false}>
                                {getFieldDecorator('price', {
                                    initialValue: '',
                                    rules: [
                                        { required: true, message: '请填写总面值!' },
                                        { pattern: /^[\d]*$/, message: '请输入数值' },
                                        { validator: checkTotalPrice }
                                    ],
                                    validateFirst: true
                                })(
                                    <Input
                                        type="text"
                                        placeholder="请输入商品总面值"
                                        className={styles.formInput}
                                        disabled={inputStatus}
                                        onChange={totalPriceChange}
                                    />
                                )}
                            </Form.Item>
                        }
                        {
                            sendType === 2 && <Form.Item label="采购数量" colon={false}>
                                {getFieldDecorator('num', {
                                    initialValue: '',
                                    rules: [
                                        { required: true, message: '请填写总数量!' },
                                        { pattern: /^[\d]*$/, message: '数量应为整数，请确认商品总面值!' },
                                        { validator: checkTotalNum }

                                    ],
                                    validateFirst: true
                                })(
                                    <Input
                                        type="text"
                                        placeholder="请输入采购数量"
                                        className={styles.formInput}
                                        disabled={inputStatus}
                                        onChange={totalNumChange}
                                    />
                                )}
                            </Form.Item>
                        }
                        <Form.Item label="折扣" colon={false}>
                            {getFieldDecorator('discount', {
                                initialValue: '',
                                rules: [
                                    { required: true, message: '折扣不能为空!' },
                                    { pattern: /^[\d.]*$/, message: '折扣只能是正数值!' },
                                    { pattern: /^(([\d]{1}\d*)|(0{1}))(\.\d{0,2})?$/, message: '请输入数值并保留2位小数!' },
                                    { validator: checkGreaterThan0 }
                                ],
                                validateFirst: true
                            })(
                                <Input
                                    type="text"
                                    placeholder="请输入折扣"
                                    className={styles.formInput}
                                    suffix="%"
                                    onChange={discoutChange}
                                />,
                            )}
                        </Form.Item>
                        {
                            sendType === 3 && <Form.Item label="售卖单价" colon={false}>
                                {getFieldDecorator('decr_price', {
                                    initialValue: '',
                                    rules: [
                                        { required: true, message: '请填写售卖单价!' },
                                        { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '请填写正确售卖单价!' },
                                        { validator: checkGreaterThan0 }
                                    ],
                                    validateFirst: true
                                })(
                                    <Input
                                        type="text"
                                        placeholder="请输入售卖单价"
                                        className={styles.formInput}
                                        onChange={soldPriceChange}
                                    />
                                )}
                            </Form.Item>
                        }
                        {
                            sendType === 3 && <Form.Item label="商品编码" colon={false} extra="支持输入大小写字母、数字、下划线和斜杠，例如“JDEK100”">
                                {getFieldDecorator('goods_code', {
                                    initialValue: '',
                                    rules: [
                                        { required: true, message: '请填写商品编码!' },
                                        // { pattern: /^[A-Za-z0-9]+$/, message: '商品编码为字母和数字组合' },

                                    ],
                                    validateFirst: true
                                })(
                                    <Input
                                        type="text"
                                        placeholder="请输入商品编码"
                                        className={styles.formInput}
                                    />
                                )}
                            </Form.Item>
                        }
                        {
                            sendType !== 3 && <div className={`${styles.totalSalePrice} flex-r ai-c`}>
                                <div className={styles.totalSalePriceLabel}>销售总价</div>
                                <div className="mr40"><Statistic value={salePrice} precision={4} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix={<span style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}}>元</span>} /></div>
                                {
                                    sendType === 2 ? <>
                                        <div className="mr16 " >提示:</div>
                                        <div className="flex-r ai-c"> 实际扣款金额为 <Statistic value={salePrice} precision={2} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} formatter={value => Number(value).toFixed(2)} style={{marginRight: 6, marginLeft: 6}} suffix={<span style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}}>元</span>}  /> (按四舍五入规则计算)</div>
                                    </> : <>
                                            <div className="mr16" >采购数量 </div>
                                            <div className="mr40">
                                                <Statistic value={totalNum} precision={0} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} /> 
                                            </div>
                                            <div className="mr16" >采购单价 </div>
                                            <div><Statistic value={unitPrice} precision={4} valueStyle={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}} suffix={<span style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.65)'}}>元</span>} /></div>
                                        </>
                                }
                            </div>
                        }
                        
                        {
                            salePrice > 0 && sendType !== 3 && <Row type="flex" style={{ marginTop: 8 }}>
                                <Col style={{ width: 82 }} className="tr mr16" ></Col>
                                <Col>
                                    <Alert message="商品销售总价=商品总面值*折扣" type="warning" showIcon />
                                </Col>
                            </Row>
                        }

                        <Row type="flex" style={{ marginTop: 20 }}>
                            <Col style={{ width: 82 }} className="tr mr16" ></Col>
                            <Col>
                                <Button onClick={goBack}>取消</Button>
                                <Button type="primary" style={{ marginLeft: 8 }} onClick={submitHandle} disabled={sendType !== 3 && stockNum === 0} >确定</Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </section>
        </FadeIn>
    )
}
export default Form.create({ name: 'sendGoodsForm' })(SendGoods);
