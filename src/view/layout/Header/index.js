import React from 'react'
import { useSelector, useDispatch} from 'react-redux'
import { Layout, Icon, Modal, Dropdown, Menu } from 'antd';
import { useHistory } from 'react-router-dom'
import { ToggleSiderCollapsed } from '../../../store/actionsFuncs'
import { logOut, getAuthorityCode } from '../../../service/api'
import { depositoryHost } from '../../../config'
import AuthButton from '../../../components/AuthButton'

const { confirm } = Modal;
const { Header } = Layout;

const headerStyle = {
    backgroundColor: '#252B20',
    color: '#D5D5D5',
    height: 46,
    paddingLeft: 20
}

const LayoutHeader = () => {
    const dispatch = useDispatch()
    let collapsed = useSelector(state => state.siderCollapsed)
    let adminInfo = useSelector(state => state.adminInfo)
    const history  = useHistory()
    const toggle = () => {
        dispatch(ToggleSiderCollapsed())
    }
    const logOutHandle = () => {
        logOut().then(res => {
            if (res.res) {
                history.replace('/login')
            }
        })
    }
    const goSupAdmin = () => {
        getAuthorityCode().then(response => {
            if (response.res) {
                window.location.href = `${depositoryHost}/authLogin?code=${response.data.code}`
            }
        })
    }
    const logOutConfirm = () => {
        confirm({
            title: '确定要退出当前账户?',
            cancelText: '取消',
            okText: '确定',
            onOk: logOutHandle
        })
    }
    const menu = (
        <Menu>
          <Menu.Item onClick={logOutConfirm} >
            <Icon type="logout" />
            <span>退出账号</span>
          </Menu.Item>
        </Menu>
      );
    return (
        <Header className="bgfff flex-r under-line jc-b ai-c" style={headerStyle} >
            <div className="fs20 mr20">
                Sup采购平台管理
                <Icon
                    type={collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={toggle}
                    style={{fontSize: 14, marginLeft: 20}}
                />
            </div>
           <div className="flex-r ai-c fs14">
                <AuthButton authid="auth_login_code">
                    <Icon type="control" /><span onClick={goSupAdmin} style={{marginLeft: 6, cursor: 'pointer'}} className="fs14" >切换SUP中央库存管理系统</span>
                </AuthButton>
                <span className="ml16 mr16">|</span>
                <Dropdown overlay={menu}>
                    <span> {`${adminInfo.real_name} - ${adminInfo.mobile}`}</span> 
                </Dropdown>
           </div>
        </Header>
    )
}

export default LayoutHeader
