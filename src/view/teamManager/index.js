import React, { useState, useEffect, useReducer, useCallback } from 'react'
import { Input, Table, Button, Popconfirm, Form, Select, Modal, message } from 'antd';
import { getAdminList, addAdmin, editAdmin, editAdminStatus, selectRole } from '../../service/api'
import AuthButton from '../../components/AuthButton'

const { Option } = Select

// 获取列表
const getOptions=(arr)=>{
    const opt=arr.map(item=>{
        return (
            <Option value={item.id} key={item.id}>{item.name}</Option>
        )
    })
    return opt;
}

// 搜索组件
const SearchCpm = ({form, search}) => {
    const { getFieldDecorator } = form
    const submitHandle = e => {
        e.preventDefault();
        form.validateFields((err, values) => {
            if (!err) {
                search(values)
            }
        });
    }
    return (
        <Form
            layout="inline"
            onSubmit={submitHandle}
            style={{height: 60}}
            autoComplete="off"
        >
            <Form.Item label="手机号:">
                {getFieldDecorator('mobile', {
                    validateTrigger: 'onBlur',
                    initialValue: '',
                    rules: [
                        { pattern: /^(13|14|15|17|18|16|19)[0-9]{9}$/, message: '请填写正确手机号' }
                    ],
                })(
                    <Input
                        placeholder="输入手机号搜索"
                        allowClear
                        maxLength={11}
                    />
                )}
            </Form.Item>
            <Form.Item label="状态:">
                {getFieldDecorator('status', {
                    initialValue: ''
                })(
                    <Select style={{width:150}}>
                        <Option value="">全部</Option>
                        <Option value="1">启用</Option>
                        <Option value="0">禁用</Option>
                    </Select>
                )}
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    搜索
                </Button>
            </Form.Item>
        </Form>
    )
}
const TableSearch = Form.create({ name: 'table_search' })(SearchCpm)
// 编辑组件
const Admin = ({ visible, toggleVisible, form, type='add', info, onOK, roleList}) => {
    const { getFieldDecorator } = form;
    const handleOk  = () => {
        form.validateFields((err, values) => {
            if (err) {
                return false
            }
            onOK({...values, id: info.id})
        })
    }
    const cannelHandle = () => {
        toggleVisible()
    }
    useEffect(() => {
        if (!visible) {
            form.resetFields()
        }
    }, [visible,form])
    return (
        <Modal
            title={type === 'add'? '新建账户信息': '修改账户信息'}
            visible={visible}
            onOk={handleOk}
            okText="确认"
            cancelText="取消"
            onCancel={cannelHandle}
            maskClosable={false}
        >
            <Form
                labelCol={{ span: 6 }}
                wrapperCol={{span: 14, offset: 2 }}
                autoComplete="off"
            >
                <Form.Item label="名称:">
                    {getFieldDecorator('real_name', {
                        initialValue: info.real_name,
                        rules: [
                            { required: true, message: '请输入账户名称' },
                        ],
                    })(
                        <Input
                            placeholder="请输入账户名称"
                            maxLength={20}
                        />
                    )}
                </Form.Item>
                <Form.Item label="手机号:">
                    {getFieldDecorator('mobile', {
                        initialValue: info.mobile,
                        validateTrigger: 'onBlur',
                        rules: [
                            { required: true, message: '请输入账户登录手机号' },
                            { pattern: /^(13|14|15|17|18|16|19)[0-9]{9}$/, message: '请填写正确手机号' }
                        ],
                    })(
                        <Input
                            placeholder="请输入账户登录手机号"
                            maxLength={11}
                            disabled={type !== 'add'}
                        />
                    )}
                </Form.Item>
                {/* <Form.Item label="账户状态:">
                    {getFieldDecorator('status', {
                        initialValue: info.status,
                        rules: [{ required: true}],
                    })(
                        <Radio.Group >
                            <Radio value="1">启用</Radio>
                            <Radio value="0">禁用</Radio>
                        </Radio.Group>
                    )}
                </Form.Item> */}
                <Form.Item label="邮箱:">
                    {getFieldDecorator('email', {
                        initialValue: info.email,
                        maxLength: 11,
                        validateTrigger: 'onBlur',
                        rules: [
                            { required: true, message: '请输入账户邮箱' },
                            { pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: '请填写正确的邮箱地址' }
                        ],
                    })(
                        <Input
                            placeholder="请输入账户邮箱"
                            maxLength={30}
                        />
                    )}
                </Form.Item>
                    <Form.Item label="角色:">
                    {getFieldDecorator('role_id', {
                        initialValue: info.role_id,
                        maxLength: 11,
                        validateTrigger: 'onBlur',
                        rules: [
                            { required: true, message: '请选择角色' },
                        ],
                    })(
                        <Select
                            placeholder="请选择角色"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            <Option value={0}>暂不选择</Option>
                            {
                                getOptions(roleList)
                            }
                        </Select>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    )
}
const AdminInfo = Form.create({ name: 'admin_info' })(Admin)

// 组件初始值、方法
const initAdminInfo = {
    id: '',
    real_name: '',
    // status: '1',
    mobile: '',
    email: ''
}
const initListParams = {
    page: 1,
    mobile: '',
    status: ''
}
const listParamsReducer = (state, action) => {
    switch (action.type) {
        case 'search':
            return {page: 1, ...action.searchInfo}
        case 'page': 
            return {...state, page: action.page}
        default:
            return state
    }
}
// 页面组件
const TeamManager  = () => {
    let [tableLoading, setTableLoading] = useState(true)
    let [adminInfovisible, setAdminInfoVisible] = useState(false)
    let [adminInfoType, setAdminInfoType] = useState('add')
    let [adminInfo, setAdminInfo] = useState(initAdminInfo)
    let [role,setRole]=useState([]);
//    let [page, setPage] = useState(1)
    let [tableData, setTableData] = useState([])
    let [pagination, setPagination] = useState({
        total: 0,
        pageSize: 20,
    })
    let [listParams, listParamsDispatch] = useReducer(listParamsReducer, initListParams)
    //  测试数据
    // 用户启用状态事件
    const stateHandle  = (id, state) => {
        setTableLoading(true)
        editAdminStatus({
            params: {
                id, 
                status: state === '0'? '1': '0'
            }
        }).then(response => {
            getAdminListHandle()
        })
    }
    // 编辑组件 visible
    const toggleAdminInfoVisible = () => {
        setAdminInfoVisible(preVisible => !preVisible)
    }
    // 搜索事件
    const searchHandle = values => {
        listParamsDispatch({
            type: 'search',
            searchInfo: values
        })
    }
    // 新建账户
    const addAdminHandle = () => {
        setAdminInfoVisible(true)
        setAdminInfoType('add')
        setAdminInfo(initAdminInfo)
    }
    // 编辑账户
    const editAdminInfo = info => {
        setAdminInfoVisible(true)
        setAdminInfoType('edit')
        setAdminInfo(info)
    }
    // table 配置
    const columns = [
        {
            title: '序号',
            dataIndex: 'count',
        },
        {
          title: '账户',
          dataIndex: 'mobile',
        },
        {
          title: '姓名',
          dataIndex: 'real_name',
        },
        {
          title: '邮箱地址',
          dataIndex: 'email',
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
        },
        {
            title: '状态',
            dataIndex: 'status',
            render: (text) => {
                return text === '1'? <span className="c333">正常</span>:  <span className="c999">禁用</span>
            }
        },
        {
            title: '操作',
            key: 'handle',
            render: (text, record, ) => {
                const stateToText = record.status === '1'? '禁用': '启用'
                return (
                    <div>
                        <AuthButton authid="auth_account_status">
                            <Popconfirm
                                title={`确定要${stateToText}此用户`}
                                onConfirm={()=>{stateHandle(record.id, record.status)}}
                                okText="是"
                                cancelText="否"
                            >
                                <Button type="primary" ghost>{stateToText}</Button>   
                            </Popconfirm>
                        </AuthButton>
                        <AuthButton authid="auth_account_edit">
                            <Button type="primary" ghost className="ml20" onClick={() => {editAdminInfo(record)}}>修改</Button> 
                        </AuthButton>
                    </div>
                )
            }
        }
    ];
    // 获取列表
    const getAdminListHandle = useCallback(() => {
        setTableLoading(true)
        getAdminList({
            params: listParams
        }).then(response => {
            if (!response.res) {
                return false
            } 
            const resData = response.data
            setTableData(resData.list.map((val, i) => {
                return {...val, 
                    count: (resData.current_page - 1) * 20 + (i + 1)
                }
            }))
            setPagination(pre => {
                return Object.assign(pre, {
                    total: resData.total,
                    current: resData.current_page
                })
            })
            setTableLoading(false)
        })
    }, [listParams])
    // 换页事件
    const pageChange = pagination => {
        listParamsDispatch({
            type: 'page',
            page: pagination.current
        })
    }
    // 编辑组件 确认 事件
    const adminInfoOK = async info => {
        toggleAdminInfoVisible()
        setTableLoading(true)
        if (adminInfoType === 'add') {
            await addAdmin({params: info})
            listParamsDispatch({
                type: 'search',
                searchInfo: {
                    mobile: '',
                    status: ''
                }
            })
        } else {
            const response = await editAdmin({params: info})
            if (response.res) {
                message.success('修改成功')
            }
            getAdminListHandle()
        }
    }

    // 获取角色列表
    useEffect(()=>{
        const getRole = async() => {
            setTableLoading(true)
            await selectRole({
                params: {}
            }).then(response => {
                if (!response.res) {
                    return false
                } 
                setRole(response.data.list);
            })
        }
        getRole();
    },[])

    //  获取数据 依赖列表请求参数
    useEffect(() => {
        getAdminListHandle()
    }, [listParams, getAdminListHandle])

    return (
        <div className="w h pt20 pl20 pr20 bgfff">
            <div className="flex-r pr30 jc-b">
                <TableSearch search={searchHandle} /> 
                <AuthButton authid="auth_account_add">
                    <Button type="primary" onClick={addAdminHandle} >新建用户</Button>
                </AuthButton>
            </div>
            <Table 
                className="mt20" 
                dataSource={tableData} 
                columns={columns} 
                pagination={pagination}
                rowKey={record => record.id}
                loading={tableLoading}
                onChange={pageChange}
                locale={{emptyText: '暂无数据'}}
            />
            <AdminInfo visible={adminInfovisible} toggleVisible={toggleAdminInfoVisible} type={adminInfoType} info={adminInfo} onOK={adminInfoOK} roleList={role}/>
        </div>
    )
}

export default TeamManager
