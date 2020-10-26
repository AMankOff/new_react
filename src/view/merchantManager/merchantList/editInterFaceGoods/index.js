import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Form, Input, Table, Button, message, Radio, List, Statistic, Row, Col, Modal, Skeleton  } from "antd";
import { getGoodsStockNum, getDistributionInfo, editDistributionGoods } from "../../../../service/api"
import { useLocation, useHistory } from 'react-router-dom';
import { queryParse } from '../../../../browserHistory'
import FadeIn from '../../../../components/FadeIn'
import styles from './index.module.css'

const { confirm } = Modal;

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
    const [initInfo, setInitInfo] = useState({});  //选中的供应列表id

    const {shopName, goodsId, id} = queryParse(location) // 商户名称 商品ID 商户ID
    // 解决 form 每次刷新引起 被依赖的 effect 执行
    const formRef = useRef(null)
    formRef.current = form

    const changeSelectedRow = (selectedRowKeys) => {
        setSelectedRowKeys(selectedRowKeys);
    }
    const discoutChange = e => {
        const discount = e.currentTarget.value
        const decrPrice = goodsPrice * discount
        if (decrPrice) {
            form.setFieldsValue({ "decr_price": (decrPrice / 100).toFixed(2)});
        }else {
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

    const goBack = useCallback(() => {
        history.goBack()
    }, [history]) 

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
            return editDistributionGoods({
                params: {
                    ...values,
                    shop_interface_goods_id: id,
                    data: sendGoodsDetail
                }
            }).then((response) => {
                if (response.res) {
                    message.success("修改成功！");
                    goBack()
                }
            })
        }
    })
    }, [selectedRowKey, id, dataArr, goBack, shopName, goodsName, goodsPrice])

    const submitHandle = () => {
        form.validateFields((err, values) => {
            if (err) {
                return false
            }
            requestSubmit(values)
        })
    }

    const columnsList = useMemo(() => {
        return  [
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
    }, []) 

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
                setStockNum(repData.total_num);
                setStockPrice(repData.total_balance);
                setDataArr(listData);
                setGoodsName(repData.title);
                setGoodsPrice(repData.price);
                setIsListLoading(false)
            }
        })
        getDistributionInfo({
            params: {
                shop_interface_goods_id: id 
            }
        }).then(response => {
            if(response.res) {
                const resData = response.data
                setInitInfo({
                    discount: resData.discount,
                    decr_price: Number(resData.decr_price).toFixed(2) ,
                    goods_code: resData.goods_code
                })
                setSelectedRowKeys(resData.selected_ids)
            }
        })
    }, [goodsId, id])
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
                            <Radio.Group  value={3}>
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
                        </div>
                    </Skeleton>
                    <Table
                        columns={columnsList}
                        dataSource={dataArr}
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
                    <Form
                        className="send-goods-form mt20"
                        autoComplete="off"
                        labelCol={{ span: 1 }}
                        wrapperCol={{ span: 12 }}
                    >
                        
                       
                        <Form.Item label="折扣" colon={false}>
                            {getFieldDecorator('discount', {
                                initialValue: initInfo.discount,
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
                        <Form.Item label="售卖单价" colon={false}>
                            {getFieldDecorator('decr_price', {
                                initialValue: initInfo.decr_price,
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
                        <Form.Item label="商品编码" colon={false} >
                            {getFieldDecorator('goods_code', {
                                initialValue: initInfo.goods_code,
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
                                    disabled
                                />
                            )}
                        </Form.Item>
                        <Row type="flex" style={{ marginTop: 20 }}>
                            <Col style={{ width: 82 }} className="tr mr16" ></Col>
                            <Col>
                                <Button onClick={goBack}>取消</Button>
                                <Button type="primary" style={{ marginLeft: 8 }} onClick={submitHandle} >确定</Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </section>
        </FadeIn>
    )
}
export default Form.create({ name: 'sendGoodsForm' })(SendGoods);
