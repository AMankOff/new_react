import React from 'react'
import {Result, Icon} from 'antd'

const CenterIdex = ({cacheData, setCache}) => {
    return (
        <div className="w h fs36 flex-r jc-c pt40 bgfff">
            <Result
                icon={<Icon type="smile" theme="twoTone" />}
                title="Great, we have done all the operations!"
            />
        </div>
    )
}

export default CenterIdex