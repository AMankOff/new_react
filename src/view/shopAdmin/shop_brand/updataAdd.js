import React, { useState, useEffect } from 'react';
import "./index.css";
import {Form,Input,Icon,Modal,message, Upload} from "antd";
import { addShopBrand,editShopBrand} from "../../../service/api"

// 上传图片
const UploadButton = ({ loading, imgUrl }) => {
 //   console.log(imgUrl);
    const btnStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '128px',
        height: '128px',
        backgroundColor: '#fafafa',
        border: '1px dashed #d9d9d9',
        borderRadius: '4px'
    }
    const iconStyle = {
        fontSize: '30px',
        marginBottom: '10px'
    }

    return (
        <div style={btnStyle}>
            {imgUrl ? 
                <img src={imgUrl} alt="avatar" style={{ width: '100%', height: '100%'}} /> :
                <div style={btnStyle}>
                    <Icon type={loading ? 'loading' : 'plus'} style={iconStyle} />
                    <div>点击上传图片</div>
                </div>
            }
      </div>
    )
}

// 子模块
const UpdataAddFormChild = ({form,visible,data,modalType,handleHide,getData,shopClassData,jfgBrandData}) => {
    let title, brand_title,brand_logo_img;  // 配置： 标题，是否可选,类别是否必选  积分购是否显示
    if(modalType==='edit'){
        title="修改子品牌";  // 模态框标题
        brand_title=data.title;  // 商品标题
        brand_logo_img=data.logo; // logo url
    }else{
        title="新增子品牌";
        brand_title='';
        brand_logo_img='';
    }
    const { getFieldDecorator } = form;
    const [brand_logo,setBrandLogo]=useState();
    const [uploading, setUploading] = useState(false);
    useEffect(()=>{
        setBrandLogo(brand_logo_img);
    },[visible,brand_logo_img])

    // 新增/修改
    const handleOk=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
              if(!!data.parent_id){  // 修改
                await editShopBrand({
                    params:{
                        title:values.title,
                        brand_id: data.id,
                        logo:values.logo
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("修改成功！");
                        handleHide();
                        form.resetFields();
                        getData();
                    }
                })
              }else{  // 新增
                await addShopBrand({
                    params:{
                        title:values.title,
                        logo:values.logo,
                        parent_id:data.id,
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("新增成功！");
                        handleHide();
                        form.resetFields();
                        getData();
                    }
                })
              }
            }
        });
        
    }
    
    // 隐藏模态框
    const handleCancel=(e)=>{
        e.preventDefault();
        form.resetFields();
        handleHide();
    }

    const uploadChange = info => {
        if (info.file.status === 'uploading') {
            setUploading(true)
            return;
        }
        if (info.file.status === 'done') {
            if (info.file.response.res) {
                setUploading(false);
                form.setFieldsValue({"logo":info.file.response.data.path});
                setBrandLogo(info.file.response.data.src)
            }
        }
    }
    const beforeUpload = file => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'  || file.type === 'image/jpg';
        if (!isJpgOrPng) {
          message.error('只能上传 JPG/PNG 的文件!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('图片文件大小不能超过 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }

    //表单布局
    const formItemLayout={
        labelCol:{span:6},
        wrapperCol:{span:8}
    }
    const formPictureClass={
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
    }

    return (
        <div>
        <Modal
            title={title}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确认"
            cancelText="取消"
        >
            <Form {...formItemLayout} className="" autoComplete="off">
                <Form.Item label="品牌名称" className="editbrand_form_item">
                {getFieldDecorator('title', {
                    initialValue: brand_title,
                    rules: [
                        { required: true, message: '请输入品牌名称!' },
                        { max:20, message:'品牌名称不能超过20个字'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入品牌名称"
                    />,
                )}
                </Form.Item>
                <Form.Item label="上传图片" {...formPictureClass}>
                {getFieldDecorator('logo', {
                    initialValue: brand_logo_img,
                    rules:[
                        {required: true, message: '请上传商品Logo'}
                    ]
                })(
                    <>
                        <div>
                            请上传大小不超过 2M 的图片，支持.jpg .png 格式。
                        </div>
                        <Upload
                            accept=".jpg, .jpeg, .png"
                            action="/api/uploadImg"
                            name="file"
                            showUploadList={false}
                            onChange={uploadChange}
                            beforeUpload={beforeUpload}
                        >
                            <UploadButton loading={uploading} imgUrl={!!brand_logo?brand_logo:brand_logo_img}/>
                        </Upload>
                    </>
                )}
                </Form.Item>
        </Form>
      </Modal>
      </div>
    )
}
// 查询数据
const UpdataAddChild=Form.create({name:'updataAddBrandform'})(UpdataAddFormChild);

// 父模块
const UpdataAddForm = ({form,visible,data,modalType,handleHide,getData,shopClassData,jfgBrandData}) => {
//    console.log(data);
    let title,brand_logo_img,brand_title;  // 配置： 标题，是否可选,类别是否必选  积分购列表展示 默认展示
    if(!!data.id){
        title="修改品牌";  // 模态框 标题
        brand_logo_img=data.logo;  // 默认图片
        brand_title=data.title; // 品牌名称
    }else{
        title="新增品牌";
        brand_logo_img='';
        brand_title='';
    }
    const [brand_logo,setBrandLogo]=useState();  
    const { getFieldDecorator } = form;
    const [uploading, setUploading] = useState(false);
    useEffect(()=>{
        setBrandLogo(brand_logo_img);
    },[visible,brand_logo_img])
    // 新增/修改
    const handleOk=(e)=>{
        e.preventDefault();
        form.validateFields(async(err, values) => {
            if (!err) {
              const _logo=!!values.logo?values.logo:0;
              if(!!data.id){  // 修改
                await editShopBrand({
                    params:{
                        brand_id: data.id,
                        title:values.title,
                        logo:_logo
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("修改成功！");
                        handleHide();
                        form.resetFields();
                        getData();
                    }
                })
              }else{  // 新增
                await addShopBrand({
                    params:{
                        title:values.title,
                        logo:_logo,
                        parent_id:0,
                    }
                }).then((response)=>{
                    if(response.res){
                        message.success("新增成功！");
                        handleHide();
                        form.resetFields();
                        getData();
                    }
                })
              }
              
            }
        });
        
    }
    
    // 隐藏模态框
    const handleCancel=(e)=>{
        e.preventDefault();
        form.resetFields();
        handleHide();
    }


    const uploadChange = info => {
        if (info.file.status === 'uploading') {
            setUploading(true)
            return;
        }
        if (info.file.status === 'done') {
            if (info.file.response.res) {
                setUploading(false)
                form.setFieldsValue({"logo":info.file.response.data.path});
                setBrandLogo(info.file.response.data.src);
            }
        }
    }
    const beforeUpload = file => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'  || file.type === 'image/jpg';
        if (!isJpgOrPng) {
          message.error('只能上传 JPG/PNG 的文件!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('图片文件大小不能超过 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }

    //表单布局
    const formItemLayout={
        labelCol:{span:6},
        wrapperCol:{span:8}
    }
    const formPictureClass={
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
    }

    return (
        <div>
        <Modal
            title={title}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确认"
            cancelText="取消"
        >
            <Form {...formItemLayout} className="" >
                <Form.Item label="品牌名称" className="editbrand_form_item" autoComplete="off">
                {getFieldDecorator('title', {
                    initialValue: brand_title,
                    rules: [
                        { required: true, message: '请输入品牌名称!' },
                        { max:20, message:'品牌名称不能超过20个字'}
                    ],
                })(
                    <Input
                    type="text"
                    placeholder="请输入品牌名称"
                    />,
                )}
                </Form.Item>
                <Form.Item label="上传图片" {...formPictureClass}>
                {getFieldDecorator('logo', {
                    initialValue: brand_logo_img,
                    rules:[{required: true, message: '请上传商品Logo'}]
                })(
                    <>
                        <div>
                            请上传大小不超过 2M 的图片，支持.jpg .png 格式。
                        </div>
                        <Upload
                            accept=".jpg, .jpeg, .png"
                            action="/api/uploadImg"
                            name="file"
                            showUploadList={false}
                            onChange={uploadChange}
                            beforeUpload={beforeUpload}
                        >
                            {
                                <UploadButton loading={uploading} imgUrl={!!brand_logo?brand_logo:brand_logo_img}/>
                            }
                            
                        </Upload>
                    </>
                )}
                </Form.Item>
                
        </Form>
      </Modal>
      </div>
    )
}
// 查询数据
const UpdataAddOrign=Form.create({name:'updataAddBrandform'})(UpdataAddForm);

const UpdataAdd=({visible,data,modalType,handleHide,getData,shopClassData})=>{
   // console.log(data);
    let parent=data.parent_id?data.parent_id:0;
    if(!!data.parent_id){  // 子品牌修改
        parent=data.parent_id;
    }else if(data.parent_id===0 && modalType==='add'){  //新建子品牌
        parent=1;  // 自定义 非0
    }else if(data.parent_id===0 && modalType==='edit'){  // 父品牌 修改
        parent=data.parent_id;
    }else{  // 父品牌新建
        parent=0;
    }
    return (
        <>
        {
            parent === 0?<UpdataAddOrign visible={visible} modalType={modalType} data={data} handleHide={handleHide} getData={getData} shopClassData={shopClassData} />:<UpdataAddChild visible={visible} modalType={modalType} data={data} handleHide={handleHide} getData={getData} shopClassData={shopClassData} />
        }
        </>
    )
}

export default UpdataAdd