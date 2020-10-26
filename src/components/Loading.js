import React, {useState} from 'react'
import { Icon } from 'antd';

const Loading = ({loading = false, children, className}) => {
    const styleIcon =  {
        position: 'absolute',
        left: 0,
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height:  '100%',
        background: 'hsla(0,0%,100%,.9)',
        fontSize: '30px',
        color: '#1890ff',
        zIndex: 99999
    }
    return (
        <div className={className} style={{position: 'relative'}}>
            {
                loading && (<div style={styleIcon}><Icon type="loading" /></div>)
            }
            {children}
        </div>
    )
}

export default Loading
