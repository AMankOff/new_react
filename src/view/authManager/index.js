import React, { useState, useEffect, useReducer, useCallback } from 'react'
import { Input, Table, Button, Form, Modal, Spin } from 'antd';
import AuthTree from './AuthTree'
import { editRole, addRole, getRoleList, getRoleAuth, setRoleAuth } from '../../service/api'
import AuthButton from '../../components/AuthButton'

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
            <Form.Item label="名称">
                {getFieldDecorator('name', {
                    validateTrigger: 'onBlur',
                    initialValue: '',
                })(
                    <Input
                        placeholder="输入名称搜索"
                        allowClear
                    />
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
const Role = ({ visible, toggleVisible, form, type='add', info, onOK}) => {
    const { getFieldDecorator } = form;
    const handleOk  = () => {
        form.validateFields((err, values) => {
            if (err) {
                return false
            }
            onOK({...values, id: info.id}).then(((res) => {
                if (res) {
                    form.resetFields()
                }
            }))
        })
    }
    const cannelHandle = () => {
        toggleVisible()
        form.resetFields()
    }
    return (
        <Modal
            title={type === 'add'? '新建角色': '修改角色信息'}
            visible={visible}
            onOk={handleOk}
            okText="确认"
            cancelText="取消"
            onCancel={cannelHandle}
        >
            <Form
                labelCol={{ span: 6 }}
                wrapperCol={{span: 14, offset: 2 }}
                autoComplete="off"
            >
                <Form.Item label="名称:">
                    {getFieldDecorator('name', {
                        initialValue: info.name,
                        rules: [
                            { required: true, message: '请输入角色名称' },
                            { max: 20, message: '名称长度不超过20个字'}
                        ],
                    })(
                        <Input
                            placeholder="请输入角色名称"
                        />
                    )}
                </Form.Item>
                <Form.Item label="描述">
                    {getFieldDecorator('description', {
                        initialValue: info.description,
                    })(
                        <Input
                            placeholder="请输入角色说明"
                            maxLength={50}
                        />
                    )}
                </Form.Item>
            </Form>
        </Modal>
    )
}
const RoleInfo = Form.create({ name: 'Role_info' })(Role)

// 权限配置组件
const AuthInfo = ({ visible, toggleVisible, info}) => {
    let [checkedKeys, setCheckedKeys] = useState([])
    let [spinning, setSpinning] = useState(true)
    const handleOk = () => {
        setRoleAuth({
            params: {
                id: info.id,
                permission_id: checkedKeys
            }
        }).then(response => {
            if (response.res) {
                toggleVisible()
            }
        })
    }
    const authTreeCheck = checkedKeys => {
        setCheckedKeys(checkedKeys)
    }
    useEffect(() => {
        if (info.id && visible) {
            setSpinning(true)
            getRoleAuth({
                params: {
                    id: info.id
                }
            }).then(response => {
                if (response.res) {
                    setCheckedKeys(response.data.list)
                    setSpinning(false)
                }
            })
        }
    }, [info, visible])
    return (
        <Modal
            title={'配置角色权限'}
            visible={visible}
            onOk={handleOk}
            okText="确认"
            cancelText="取消"
            onCancel={toggleVisible}
            bodyStyle={{height:300, overflowX: 'hidden', overflowY: 'auto'}}
        >
            <Spin spinning={spinning}>
                <AuthTree checkedKeys={checkedKeys} onCheck={authTreeCheck} />
            </Spin>
        </Modal> 
    )
}

// 组件初始值、方法
const initRoleInfo = {
    id: '',
    name: '',
    description: '',
}
const initListParams = {
    page: 1,
    name: ''
}

// const 

const listParamsReducer = (state, action) => {
    switch (action.type) {
        case 'search':
            return {...state, page: 1, ...action.searchInfo}
        case 'page': 
            return {...state, page: action.page}
        case 'reset': 
        return {...initListParams}
        default:
            return state
    }
}
// 页面组件
const AuthManager  = () => {
    let [tableLoading, setTableLoading] = useState(true)
    let [roleInfovisible, setRoleInfoVisible] = useState(false)
    let [roleAuthvisible, setRoleAuthVisible] = useState(false)
    let [roleInfoType, setRoleInfoType] = useState('add')
    let [roleInfo, setRoleInfo] = useState(initRoleInfo)
    // let [page, setPage] = useState(1)
    let [tableData, setTableData] = useState([])
    let [pagination, setPagination] = useState({
        total: 0,
        hideOnSinglePage: true,
        pageSize: 20,
    })
    let [listParams, listParamsDispatch] = useReducer(listParamsReducer, initListParams)
    // 编辑组件 visible
    const toggleRoleInfoVisible = () => {
        setRoleInfoVisible(preVisible => !preVisible)
    }
    // 权限组件 visible
    const toggleRoleAuthVisible = () => {
        setRoleAuthVisible(preVisible => !preVisible)
    }
    const searchHandle = values => {
        listParamsDispatch({
            type: 'search',
            searchInfo: values
        })
    }
    // 新建账户
    const addRoleHandle = () => {
        setRoleInfoVisible(true)
        setRoleInfoType('add')
        setRoleInfo(initRoleInfo)
    }
    // 编辑账户
    const editRoleInfo = info => {
        setRoleInfoVisible(true)
        setRoleInfoType('edit')
        setRoleInfo(info)
    }
    const editRoleAuth = info => {
        setRoleAuthVisible(true)
        setRoleInfo(info)
    }
    // table 配置
    const columns = [
        {
            title: '序号',
            dataIndex: 'count',
        },
        {
          title: '名称',
          dataIndex: 'name',
        },
        {
          title: '描述',
          dataIndex: 'description',
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
        },
        {
            title: '操作',
            key: 'handle',
            render: (text, record, ) => {
                return (
                    <>
                        <AuthButton authid="auth_role_edit">
                            <Button type="primary" ghost onClick={() => {editRoleInfo(record)}}>修改</Button> 
                        </AuthButton>
                        <AuthButton authid="auth_role_authority">
                            <Button type="primary" ghost className="ml20" onClick={() => {editRoleAuth(record)}}>配置权限</Button> 
                        </AuthButton>
                    </>
                )   
            }
        }
    ];
    // 获取列表
    const getRoleListHanlde = useCallback(() => {
        setTableLoading(true)
        getRoleList({
            params: listParams
        }).then(response => {
            if (!response.res) {
                return false
            } 
            const resData = response.data
            const currentPage = resData.current_page
            setTableData(resData.list.map((val, index) => {
                return {...val,
                    count: (currentPage - 1) * 20 + (index + 1)
                }
            }))
            setPagination(pre => {
                return Object.assign(pre, {
                    total: resData.total,
                    current: currentPage
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
    const roleInfoOK = async info => {
        let response = {}
        setTableLoading(true)
        if (roleInfoType === 'add') {
            response = await addRole({params: info})
            if (response.res) {
                toggleRoleInfoVisible()
                listParamsDispatch({
                    type: 'reset',
                })
            }
        } else {
            response = await editRole({params: info})
            if (response.res) {
                toggleRoleInfoVisible()
                getRoleListHanlde()
            }
        }
        setTableLoading(false)
        return response.res
    }
    //  获取数据 依赖列表请求参数
    useEffect(() => {
        getRoleListHanlde()
    }, [listParams, getRoleListHanlde])

    return (
        <div className="w h pt20 pl20 pr20 bgfff">
            <div className="flex-r pr30 jc-b">
                <TableSearch search={searchHandle} /> 
                <div>
                    <AuthButton authid="auth_role_add">
                        <Button type="primary" onClick={addRoleHandle} >新建角色</Button>
                    </AuthButton>
                </div>
            </div>
            <Table 
                className="mt20" 
                dataSource={tableData} 
                columns={columns} 
                pagination={pagination}
                rowKey={record => record.id}
                loading={tableLoading}
                onChange={pageChange}
            />
            <RoleInfo visible={roleInfovisible} toggleVisible={toggleRoleInfoVisible} type={roleInfoType} info={roleInfo} onOK={roleInfoOK} />
            <AuthInfo visible={roleAuthvisible} toggleVisible={toggleRoleAuthVisible} info={roleInfo}/>
        </div>
    )
}

export default AuthManager
