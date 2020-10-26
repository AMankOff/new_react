import React, { useState, useCallback, useEffect } from 'react'
import { Form, Select, Button, DatePicker, Modal, Table, Icon, Descriptions, Statistic, message, Row, Col, Upload } from 'antd'
import FadeIn from '../../components/FadeIn'
import { selectGoods, getOfflineOrderList, delOfflineOrder } from '../../service/api'
import { debounce } from '../../untils/untilsFn'
import AuthButton from '../../components/AuthButton'
import { uploadRequest, Encrypt3Des } from '../../service/api/request'
import { getStorageItem, setStorageItem } from '../../untils/storage'
import { version, os } from '../../config'

const { Option } = Select
const { confirm } = Modal;

const tokenName = 'Authorization'
const tokenVal = `Bearer ${getStorageItem('token') || ''}`
const uploadOtherData = Encrypt3Des(JSON.stringify({
    type: 0,
    version,
    os
}))
const Cashbook = ({ form }) => {
    const { getFieldDecorator } = form
    let [goodsList, setGoodsList] = useState([])
    let [sumPrice, setSumPrice] = useState(0)
    let [sumDecrPrice, setSumDecrPrice] = useState(0)
    let [distributeList, setDistributeList] = useState([])
    let [isLoading, setIsLoading] = useState(false)
    let [distributeTotal, setDistributeTotal] = useState(0)
    const [startValue,setStartValue]=useState(null);  // 开始时间
    const [endValue,setEndValue]=useState(null);  // 结束时间
    const [uploading,setUploading]=useState(false);  // 结束时间
    let [reqParams, setReqParams] = useState({
        goods_id: '',
        start_time: '',
        end_time: '',
        page: 1
    })

    const goodsSeacth = useCallback(debounce((value) => {
        if (value) {
            selectGoods({
                params: {
                    title: value,
                    type: 0
                }
            }).then(response => {
                if (response.res) {
                    setGoodsList(response.data.list)
                } else {
                    setGoodsList([])
                }
            })
        } else {
            setGoodsList([])
        }
    }, 200), [])
    const handleSubmit = e => {
        e.preventDefault();
        let { shop_id, goods_id, start_time, end_time, distribute_type, operator_id} = form.getFieldsValue()
        start_time = start_time? start_time.format('YYYY-MM-DD'): ''
        end_time = end_time? end_time.format('YYYY-MM-DD'): ''
        setReqParams({
            shop_id,
            goods_id,
            start_time,
            end_time,
            distribute_type,
            page: 1,
            operator_id
        })
    }
    const handleReset = (e) => {
        e.preventDefault();
        form.resetFields();
        setReqParams({
            goods_id: '',
            start_time: '',
            end_time: '',
            page: 1
        })
        setStartValue(null)
        setEndValue(null)
    }
    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
          width: 90,
          fixed: 'left',
        },
        {
            title: '销售日期',
            dataIndex: 'sales_date',
            width: 110,
             fixed: 'left',
        },
        {
            title: '商品名称',
            dataIndex: 'goods_title',
            width: 100,
            fixed: 'left',
        },
        {
            title: '商品面值(元)',
            width: 130,
            dataIndex: 'goods_price',
            render:((price)=>{
                return (
                    <Statistic
                    title=""
                    value={price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '销售数量',
            dataIndex: 'num',
            width: 100,
            render:((num)=>{
                return (
                    <Statistic
                    title=""
                    value={num}
                    valueStyle={{ fontSize: 16 }}
                    precision={0}
                  />
                )
            })
        },
        {
            title: '销售折扣(%)',
            dataIndex: 'discount',
            width: 120,
        },
        {
            title: '销售总面值(元)',
            dataIndex: 'count_price',
            width: 130,
            render:((count_price)=>{
                return (
                    <Statistic
                    title=""
                    value={count_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '销售总价(元)',
            dataIndex: 'count_decr_price',
            width: 120,
            render:((count_decr_price)=>{
                return (
                    <Statistic
                    title=""
                    value={count_decr_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '成本(元)',
            dataIndex: 'count_cost_price',
            width: 100,
            render:((count_cost_price)=>{
                return (
                    <Statistic
                    title=""
                    value={count_cost_price}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '客户名称',
            width: 100,
            dataIndex: 'merchant_name'
        },
        {
            title: '操作人',
            dataIndex:'real_name'
        },
        {
            title: '操作时间',
            dataIndex: 'updated_at',
            width: 170,
        },
        
        {
            title: '操作',
            width: 80,
            fixed: 'right',
            render:((row)=>{
                return (
                    <AuthButton authid="order_distribute_info">
                        <button onClick={()=>deleteOrder(row)} className="btn-class">删除</button>
                    </AuthButton>
                )
            })
        }
      ];  // 表格 标头
    // 页码请求
    const pageChange= page => {
        setReqParams({...reqParams, page});
    }
    const deleteOrder= row => {
        confirm({
            title: `确定要删除 “${row.goods_title}” 的记录吗？`,
            okText: '确认删除',
            cancelText: '取消',
            onOk() {
                delOfflineOrder({
                    params: {
                        order_id: row.id
                    }
                }).then(response => {
                    if(response.res) {
                        message.success('删除成功');
                        getOrderList()
                    }
                })
            }
        })
    }
    /*******日期选择 ***/
   const onStartChange=(value)=>{
        setStartValue(value);
    }
    const onEndChange=(value)=>{
        setEndValue(value);
    }
    const disabledStartDate = startValue => {
        if (!startValue || !endValue) {
        return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    };
    const disabledEndDate = endValue => {
        if (!endValue || !startValue) {
        return false;
        }
        return endValue.valueOf() < startValue.valueOf();
    };

    const getOrderList = useCallback(() => {
        setIsLoading(true)
        getOfflineOrderList({
            params: reqParams
        }).then(response => {
            if(!response.res) {
                return false
            }
            const repData = response.data
            const currentPage = repData.current_page
            setIsLoading(false)
            // 只在第一页刷新统计数据
            if (currentPage === 1) {
                setSumDecrPrice(repData.sum_decr_price)
                setSumPrice(repData.sum_price)
            }
            setDistributeList(repData.list.map((item, i) => {
                return {
                    ...item,
                    _init: (currentPage - 1) * 20 + i + 1
                }
            }))
            setDistributeTotal(repData.total)
        })
    }, [reqParams])

    const beforeUploadHandle = useCallback((file) => {
        if (file.size / 1024 / 1024 > 1) {
            message.error('文件不能大于1M')
        }
    }, [])

    const uploadChange = e => {
        setUploading(true)
        const file = e.file
        const status = file.status
        if(status !== 'done') {
            return false
        }
        // 判断是否刷新 token
        const token = e.file.xhr.getResponseHeader('authorization');
        if (token) {
            setStorageItem('token', token.split(' ')[1])
        }
        const response = file.response
        const res = response.res
        const resMsg = response.message
        const originFileObj = file.originFileObj
        
        if (res)  {
            message.success('记录导入成功')
            setReqParams({
                goods_id: '',
                start_time: '',
                end_time: '',
                page: 1
            })
            setUploading(false)
            return false
        } else {
            if(!res && resMsg.code === 7702) {
                confirm({
                    title: `${resMsg.mes}, 确认要添加为新商品吗？`,
                    okText: '确认添加',
                    cancelText: '取消',
                    onOk() {
                        uploadRequest(
                            'api/orders/importOrder',
                            {
                                type: 1,
                            },
                            originFileObj
                        ).then(response => {
                            setUploading(false)
                            if(response.res) {
                                message.success('记录导入成功');
                                setReqParams({
                                    goods_id: '',
                                    start_time: '',
                                    end_time: '',
                                    page: 1
                                })
                            }else {
                                message.error(response.message.mes);
                            }
                        })
                    },
                    onCancel() {
                        setUploading(false)
                    }
                })
            } else {
                setUploading(false)
                message.error(resMsg.mes)
            }
        }
    }
    
    useEffect(() => {
        getOrderList()
    }, [reqParams, getOrderList])
    return (
        <FadeIn>
            <section className="p16 bgfff flex-c h">
                <Form layout="inline" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                    <Form.Item label="商品名称">
                        {getFieldDecorator('goods_id', {
                        })(
                            <Select
                                showSearch
                                placeholder="请输入商品搜索"
                                showArrow={false}
                                notFoundContent="未搜索到商品"
                                filterOption={false}
                                style={{width: 300}}
                                onSearch={goodsSeacth}
                                allowClear
                            >
                                {
                                    goodsList.map(goods => <Option value={goods.id} key={goods.id}>{goods.title}</Option>)
                                }
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label="销售时间" >
                            {getFieldDecorator('start_time', {
                            })(<DatePicker 
                                placeholder="开始时间"
                                disabledDate={disabledStartDate}
                                onChange={onStartChange}
                            />)}
                        </Form.Item>
                        <Form.Item label="" >
                        {getFieldDecorator('end_time', {
                        })(
                            <DatePicker
                                disabledDate={disabledEndDate}
                                placeholder="结束时间"
                                onChange={onEndChange}
                            />
                        )}
                    </Form.Item>
                    <Form.Item >
                        <Button type="primary" htmlType="submit">
                            <Icon type="search"/>
                            查询
                        </Button>
                        <Button type="default" htmlType="reset" className="ml20">
                            重置
                        </Button>
                    </Form.Item>
                </Form>
                <Descriptions title="" className="mt20">
                    <Descriptions.Item label="销售总面值">
                        <Statistic  value={sumPrice} precision={2} />
                    </Descriptions.Item>
                    <Descriptions.Item label="销售总价">
                        <Statistic  value={sumDecrPrice} precision={2} />
                    </Descriptions.Item>
                </Descriptions>
                <Row justify="end" type="flex">
                    <Col className="flex-r">
                        <Upload
                            accept=".xlsx"
                            action="/api/orders/importOrder"
                            name="file"
                            headers={{
                                [tokenName]: tokenVal
                            }}
                            data={{param: uploadOtherData}}
                            showUploadList={false}
                            onChange={uploadChange}
                            beforeUpload={beforeUploadHandle}
                            disabled={uploading}
                        >
                            <Button icon="upload" loading={uploading}>导入记录</Button>
                        </Upload> 
                        <a className="ml20" href="/template.xlsx" download="模板.xlsx">
                            <Button icon="download">下载模板</Button>
                        </a>
                    </Col>
                </Row>
                <div className="flex1 mt20" >
                    <Table 
                        columns={columnsData} 
                        dataSource={distributeList} 
                        pagination={{ current:reqParams.page, total: distributeTotal,pageSize:20,onChange:pageChange}}
                        bordered
                        rowKey={record=>record.id}
                        loading={isLoading}
                        className="h"
                        locale={
                            {emptyText: '暂无数据'}
                        }
                        scroll={{ x: 1500 }}
                    />
                </div>
                
                 {/* <ShowSupplierManage visible={detailShow} data={detailInfo} hideFn={hideDetail}/> */}
            </section>
        </FadeIn>
    )
}

export default Form.create({name:"cashbook"})(Cashbook)

