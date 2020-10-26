import React, { useState, useEffect, useCallback } from 'react'
import {history} from "../../../browserHistory"
import FadeIn from '../../../components/FadeIn'
import GetEmpty from '../../../components/getEmpty'   // 设置数据为空 展示
import AuthButton from '../../../components/AuthButton'
import "./index.css";
import { cache, resetCache } from '../../../components/CacheData'
import {Form,Input,Table,Button,Icon,Card,Select, Statistic, Modal, Spin, Radio, Descriptions, message } from "antd";
import { merchantList, getShopInterfaceConfigInfo, addShopInterfaceConfig} from "../../../service/api"
const {Option}=Select;


const cacheDataKey="merchantListParam";  // 默认传参KEY
const refreshData = resetCache(cacheDataKey);
let initListParams={
    name:'',  // 商户名称
    mobile:'',  // 所属账号
    status:'2', // 商户状态
    type:'', // 类型
    page:1,  // 请求页码
    per_page:20 // 默认
}


const NetPickup = ({visible, shopInfo, toggleVisible, form}) => {
    const [spinning, setSpinning] = useState(false)
    const [config, setConfig] = useState({})

    const {getFieldDecorator, validateFields, resetFields} = form

    const getConfigInfo = useCallback(() => {
        setSpinning(true)
        getShopInterfaceConfigInfo({
            params: {
                shop_id: shopInfo.id
            }
        }).then(response => {
            if (response.res) {
                setSpinning(false)
                setConfig(response.data)
                resetFields()
            }
        })
    }, [shopInfo, resetFields])

    const onOk = useCallback(() => {
        validateFields((err, values) => {
            if (err) {
                return false
            }
            addShopInterfaceConfig({
                params: {
                    ...values,
                    shop_id: shopInfo.id
                }
            }).then(response => {
                if (!response.res) {
                    return false 
                }
                if (config.shop_code) {
                    message.success('修改成功')
                    toggleVisible()
                } else {
                    getConfigInfo()
                }
            })
        })
        
    }, [config, validateFields, getConfigInfo, toggleVisible, shopInfo])
    
    useEffect(() => {
        if(visible) {
            getConfigInfo()
        } else {
            setConfig({shop_code: ''})
        }
    }, [getConfigInfo, visible])
    return (
       
            <Modal
                title="商户参数配置"
                visible={visible}
                onOk={onOk}
                onCancel={toggleVisible}
                okText={config.shop_code? '修改': '生成参数'}
            >
                 <Spin spinning={spinning}>
                     <Form 
                        className="w"
                        autoComplete="off"
                        labelCol={{span: 4}}
                        wrapperCol={{span: 14}}
                    >
                        <Form.Item label="商户名称" className="w" style={{marginBottom: 0}} >{shopInfo.name}</Form.Item>
                        <Form.Item label="商户号" className="w" style={{marginBottom: 0}} >{config.shop_no}</Form.Item>
                        <Form.Item label="IP白名单" className="w"  style={{marginBottom: 0}} extra="多个IP用逗号分隔">
                            {getFieldDecorator('white_ip', {
                                initialValue: config.white_ip,
                                rules:[
                                    { required: true, message: '请输入IP白名单'  }
                                ]
                            })(
                                <Input
                                type="text"
                                placeholder="0.0.0.0"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="状态" className="w" style={{marginBottom: 0}} >
                            {getFieldDecorator('status', {
                                initialValue: config.status,
                                rules:[
                                    { required: true, message: '请选择状态'  }
                                ]
                            })(
                                <Radio.Group >
                                    <Radio value={0}>正常</Radio>
                                    <Radio value={1}>禁用</Radio>
                                </Radio.Group>
                            )}
                        </Form.Item>
                     </Form>
                     {
                         config.shop_code && <Descriptions 
                            size="small"
                            bordered
                            className="mt20"
                            title={<span className="fs14" >参数信息：</span>}
                        >
                            <Descriptions.Item label="商户标识" span={3} >{config.shop_code}</Descriptions.Item>
                            <Descriptions.Item label="des key" span={3}>{config.key}</Descriptions.Item>
                            <Descriptions.Item label="des iv" span={3}>{config.iv}</Descriptions.Item>
                            <Descriptions.Item label="secret Key" span={3}>{config.secret_key}</Descriptions.Item>
                        </Descriptions> 
                     }
                    
                 </Spin>
            </Modal>
    )
}

const NetPickupModal = Form.create({name:'NetPickupModal'})(NetPickup);

// 获取数据列表展示
const GetListData=({cacheData, setCache, form})=>{
    //console.log(paramsData);
    const { getFieldDecorator } = form;
    const [countData,setCountData]=useState([]);  // 全部数据
    const [dataSource,setDataSource]=useState([]);  // 列表数据
    const [isLoading,setIsLoading]=useState(true); //加载
    const [netPickupModalVisible, setNetPickupModalVisible] = useState(false)
    const [netPickupShopInfo, setNetPickupShopInfo] = useState(false)
    const Empty_description='暂无数据'; // 空数据 文案描述
    const per_page=20;  // 默认  请求每页参数
    useEffect(()=>{
        // 获取数据
        const getTableData=async()=>{ 
            setIsLoading(true);
            const dataSources= await merchantList({
                params:cacheData
            }).then((response) => {
                if (response.res) {
                    let resData = response.data;
                    setCountData(resData);
                    const resultData=resData.list;
                    if(resultData.length!==0){
                        let i=0;
                        const init=(resData.current_page-1)*per_page;
                        let result=resultData.map((item)=>{
                            item._init= (++i)+init;
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
    },[cacheData]);

    // 接口发货配置

    const toggleNetPickupModalVisible = useCallback(() => {
        setNetPickupModalVisible(pre => !pre)
    }, [])

    const netPickupConfig = useCallback(row => {
        toggleNetPickupModalVisible()
        setNetPickupShopInfo(row)
    }, [toggleNetPickupModalVisible])
    
    const columnsData = [
        {
          title: '序号',
          dataIndex: '_init',
          width: 80,
          fixed: 'left'
        },
        {
          title: '商户ID',
          dataIndex: 'id',
          key:'id',
          width: 80,
          fixed: 'left'
        },
        {
          title: '商户名称',
          dataIndex: 'name',
          width: 160,
          fixed: 'left',
        },
        {
            title: '商户类型',
            dataIndex: 'type',
            width: 100,
            render:((type)=>{
                return type===1?"个人":"企业"
            })
        },
        {
            title: '商户角色',
            dataIndex: 'role',
            width: 100,
            render:((role)=>{
                return role===1?"进货商":"供货商"
            })
        },
        {
            title: '商户余额',
            dataIndex: 'balance',
            width: 160,
            render:((balance)=>{
                return (
                    <Statistic
                    title=""
                    value={balance}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
                )
            })
        },
        {
            title: '商户状态',
            dataIndex: 'status',
            width: 100,
            render:((status)=>{
                const arr=["未认证","待审核","认证成功","认证失败"];
                return arr[status]
            })
        },
        {
            title: '是否分配商品',
            width: 130,
            render:((row)=>{
                    return (
                        <>
                            <span>{row.allocate_good===1?"是":"否"}</span>
                        </>
                    )
            })
        },
        {
            title: '所属账号',
            dataIndex: 'mobile',
            width: 130,
        },
        {
            title: '创建时间',
            // width: 180,
            dataIndex: 'created_at',
            key:'created_at'
        },
        {
            title: '操作',
            width: 270,
            fixed: 'right',
            key:'act',
            render:((row)=>{
                    return (  
                        <>
                            <AuthButton authid="shop_audit_info">
                                <button onClick={()=>detailFn(row,'detail')} className="shop_linkbtn-class color_00f">查看</button>
                            </AuthButton>
                            {
                                row.status === 2 && <>
                                    <AuthButton authid="recharge_recharge_recharge">
                                        <button onClick={()=>detailFn(row,'recharge')} className="shop_linkbtn-class color_00f">充值</button>
                                    </AuthButton>
                                    <AuthButton authid="goods_shopgoods_add">
                                        <button onClick={()=>detailFn(row,'distribution')} className="shop_linkbtn-class color_00f">分配商品</button>
                                    </AuthButton>
                                    <AuthButton authid="shop_interface_add">
                                        <button onClick={() => netPickupConfig(row)} className="shop_linkbtn-class color_00f mt10">配置参数</button>
                                    </AuthButton>
                                </>
                            }
                            {
                                row.allocate_good === 1 &&<AuthButton authid="goods_shopgoods_list">
                                    <button onClick={()=>detailFn(row,'record')} className="shop_linkbtn-class color_00f">分配记录</button>
                                </AuthButton>
                            }
                            
                        </>
                    )
            })
            
          }
      ];  // 表格 标头
    
   
    //  查看、充值、分配商品、分配记录
    const detailFn=(row,type)=>{
        //detail、recharge、distribution、record
        if(type==='detail'){  // 商户详情
            history.push('/merchantList/detail?merchant_id='+row.merchant_id+"&shop_id="+row.id+"&type="+row.type);
        }else if(type==='recharge'){  //商户充值记录
            history.push('/merchantList/recharge?id='+row.id);
        }else if(type==='distribution'){  // 分配商品
            history.push('/merchantList/distributiveGoods?id='+row.id+'&title='+encodeURIComponent(encodeURIComponent(row.name)));
        }else if(type==='record'){  // 分配记录
            history.push(`/merchantList/allocationRecord?id=${row.id}&merchantName=${row.name}`);
        }
    }
   

    // 页码请求
    const pageChange=(page,pageSize)=>{
        setCache({...cacheData,page});
    }

    // 查询数据
    const handleSubmit=(e)=>{
        e.preventDefault();
        form.validateFields((err, values) => {
            if(!err){
                setCache({...cacheData, ...values,page:1});    
            } 
        })
        
    }
    //重置查询数据
    const handleReset = (e) => {
        e.preventDefault();
        form.resetFields();
        refreshData(); 
    };
    return (
        <div className="w h flex-c p16">
            <Form layout="inline" name="From" onSubmit={handleSubmit} onReset={handleReset} autoComplete="off">
                    <Form.Item label="商户名称" className="shop_form_item">
                    {getFieldDecorator('name', {
                        initialValue:cacheData.name,
                        rules:[ {max:20, message:"商户名称不能超过20个字"}]
                    })(
                        <Input
                        type="text"
                        placeholder="请输入商户名称"
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="所属账号" className="shop_form_item">
                    {getFieldDecorator('mobile', {
                        initialValue:cacheData.mobile,
                        rules:[{ pattern: /^(13|14|15|17|18|16|19)[0-9]{9}$/, message: '请填写完整账号!' }]
                    })(
                        <Input
                        type="text"
                        placeholder="请输入所属账号"
                        />
                    )}
                    </Form.Item>
                    <Form.Item label="商户状态" className="shop_form_item">
                    {getFieldDecorator('status', {
                        initialValue:cacheData.status
                    })(
                        <Select className="shop_select_w">
                            <Option value='0'>未认证</Option>
                            <Option value='1'>待审核</Option>
                            <Option value='2'>认证成功</Option>
                            <Option value='3'>认证失败</Option>
                        </Select>
                    )}
                    </Form.Item>
                    <Form.Item label="商户类型" className="shop_form_item">
                    {getFieldDecorator('type', {
                        initialValue:cacheData.type
                    })(
                        <Select className="shop_select_w">
                            <Option value='1'>个人</Option>
                            <Option value='2'>企业</Option>
                        </Select>
                    )}
                    </Form.Item>
                    <Form.Item className="shop_form_item">
                        <Button type="primary" htmlType="submit">
                            <Icon type="search"/>
                            查询
                        </Button>
                        <Button type="default" htmlType="reset" className="shop_form_reset">
                            重置
                        </Button>
                    </Form.Item>
                </Form>
            <Card 
                className='w flex1 mt16' 
                bodyStyle={{margin:0,padding:0, height: '100%'}} 
                // headStyle={{border:"none"}} 
                bordered={false}
                
            >
                <div className=" h">
                    <GetEmpty descriptions={Empty_description} className="h" >
                        <Table 
                            columns={columnsData} 
                            dataSource={dataSource} 
                            pagination={{ current:countData.current_page,total:countData.total,pageSize:20,onChange:pageChange}}
                            bordered
                            rowKey={record=>record.id}
                            loading={isLoading}
                            scroll={{ x: 1500 }}
                        />
                    </GetEmpty>
                </div>
            </Card>
            <NetPickupModal 
                visible={netPickupModalVisible} 
                toggleVisible={toggleNetPickupModalVisible}
                shopInfo={netPickupShopInfo}
            />
        </div>
    )
}

const MerchantListFormTable=Form.create({name:'From'})(GetListData);
const MerchantList = ({cacheData, setCache}) => {
    
    return (
        <FadeIn>
                <MerchantListFormTable cacheData={cacheData} setCache={setCache}/>
        </FadeIn> 
        
    )
}
export default cache(cacheDataKey, initListParams, MerchantList)