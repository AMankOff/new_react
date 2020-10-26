import React from 'react'
import {ConfigProvider,Empty} from "antd"

const GetEmpty = ({descriptions,children }) => {
    let dst=descriptions?descriptions:"暂无数据";
    const customizeRenderEmpty = () => (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{
            height: 60,
            }}
            description={
            <>
                <span dangerouslySetInnerHTML = {{ __html: dst}}></span>
            </>
            }
        >
        </Empty>
      );
    return (
        <ConfigProvider renderEmpty={customizeRenderEmpty}>
        {
            children
        }
        </ConfigProvider>
    )
}

export default GetEmpty