import React, { useState, useEffect } from 'react'
import { Layout, Menu, Icon, } from 'antd'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { layoutMenu } from '../../../service/api'
import FadeIn from '../../../components/FadeIn'

// import { config } from './config'

const { Sider } = Layout
const { SubMenu, Item } = Menu;

const LayoutSideBar = () => {
   
    const location = useLocation();
    const locationPath = location.pathname;
    let [selectedKeys, setSelectedKey]=useState([]);
    let [menuList, setMenuList]=useState([]);
    // 获取左侧菜单
    useEffect(() => {
        layoutMenu().then(response => {
            if (response.res) {
                setMenuList(response.data.list)
            }
        })
    }, [])
    // console.log(menuList);

    useEffect(()=>{
        const getSelectedKey=(list)=>{
            list.map(item=>{
                if(!!item.son){
                    getSelectedKey(item.son);
                }else{
                    let listPath=item.path;
                    if(locationPath.indexOf(listPath) === 0){
                        const key=item.id.toString();
                        setSelectedKey(key);
                    }
                }
                return item
            })
        }
        getSelectedKey(menuList);

    },[locationPath,menuList])
    
    let collapsed = useSelector(state => state.siderCollapsed)
    const itemMap = list => {
        return list.map(item => {
            if (item.son) {
                return (
                    <SubMenu
                        key={ item.id }
                        title={
                            <span>
                                {item.ico &&  <Icon type={item.ico} />}
                                <span>{ item.display_name }</span>
                            </span>
                        }
                    >
                        {itemMap(item.son)}
                    </SubMenu>
                )
            } else {
                return (
                    <Item key={ item.id} display={item.display_name}>
                        <Link to={item.path}>
                            {item.ico &&  <Icon type={ item.ico } />}
                            <span className="" >{item.display_name}</span>
                        </Link>
                    </Item>
                )
            }
        })
    }

    return (
        <FadeIn>
            <Sider className="bgfff"
                collapsible
                collapsed={collapsed}
                trigger={null}
            >
            <Menu
                mode="inline"
                defaultSelectedKeys={['/index']}
                selectedKeys={[selectedKeys]}
                className="h"
            >
                {itemMap(menuList)}
            </Menu>
            </Sider>
        </FadeIn>
    );
}

export default LayoutSideBar