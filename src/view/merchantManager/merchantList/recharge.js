import React, { useState, useEffect } from "react";
import { history } from "../../../browserHistory";
import FadeIn from "../../../components/FadeIn";
import GetEmpty from "../../../components/getEmpty"; // 设置数据为空 展示
import "./index.css";
import { cache, resetCache } from "../../../components/CacheData";
import { getUrlParam, convertCurrency} from "../../../untils/untilsFn";
import {
  Form,
  Table,
  Button,
  Icon,
  Card,
  message,
  Modal,
  Breadcrumb,
  InputNumber,
  Radio,
  Statistic,
  Col,
  Row,
  Descriptions
} from "antd";
import { getRechargeList, getBanlance, recharge } from "../../../service/api";

const cacheDataKey = "merchantChargeParams"; // 默认传参KEY
const refreshData = resetCache(cacheDataKey);

const initListParams = {
  page: 1, // 请求页码
  per_page: 20, // 默认
};

// 商户充值
const RechargeForm = ({ form, isShow, getRecord, handleHide, merchant }) => {
  const { getFieldDecorator } = form;
  const [isLoading, setIsLoading] = useState(false);
  const [inputPrice, setInputPrice] = useState(0);
  const [priceForchinese, setPriceForchinese] = useState('零元');
  const title = "商户充值";

  // 商户充值
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFields(async (err, values) => {
      const _id = getUrlParam("id");
      if (!err) {
         const rechargeInfo = () =>  (
           <Descriptions title="" bordered column ={1} size="small" style={{marginTop: 20, marginRight: 38}}>
              <Descriptions.Item label="商户名称">{merchant}</Descriptions.Item>
              <Descriptions.Item label="充值金额">
                <Statistic
                    title=""
                    value={inputPrice}
                    valueStyle={{ fontSize: 16 }}
                    precision={2}
                  />
              </Descriptions.Item>
              <Descriptions.Item label="金额大写">
                {priceForchinese}
              </Descriptions.Item>
          </Descriptions>
        )
        const okHandle = () => {
          return new Promise((resolve, reject) => {
            recharge({
              params: {
                price: values.price,
                shop_id: _id,
                distribution_type: values.distribution_type,
              },
            }).then((response) => {
              if (response.res) {
                message.success("充值成功");
                form.resetFields();
                setInputPrice(0)
                getRecord(); // 刷新数据
                resolve()
              } else {
                reject()
              }
            }); 
          })
        }
        Modal.confirm({
          title: '商户充值确认:',
          content: rechargeInfo(),
          width: 600,
          icon: 'no',
          okText: '确认充值',
          cancelText: '取消',
          onOk: okHandle
        })
        
      }
    });
  };

  // 检测数据
  const checkValue = (rule, value, callback) => {
    //    console.log(value, typeof value);
    if (value > 0 || value < 0) {
      callback();
    } else {
      callback("金额有误!");
    }
  };

  // 充值取消
  const handleCancel = () => {
    form.resetFields();
    setIsLoading(false);
    handleHide(); // 刷新数据
    setInputPrice(0)
    setInputPrice(0)
    setPriceForchinese('零元')
  };

  const inputPriceChange = (value) => {

    if (value) {
      setInputPrice(value);
      setPriceForchinese(convertCurrency(value))
    } else {
      setInputPrice(0);
      setPriceForchinese('零元')
    }
  };

  //表单布局
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
  };
  return (
    <Modal
      title={title}
      visible={isShow}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="充值"
      cancelText="取消"
      footer={null}
    >
      <Form {...formItemLayout} name="From" autoComplete="off">
        <Form.Item label="商户名称" className="fw700">
          {merchant}
        </Form.Item>
        <Form.Item label="充值金额" className="">
          {getFieldDecorator("price", {
            rules: [
              { required: true, message: "充值金额不能为空!" },
              {
                pattern: /^(([\d-]{1}\d*)|(0{1}))(\.\d{0,2})?$/,
                message: "金额为数字并保留2位小数!",
              },
              { validator: checkValue },
            ],
            validateFirst: true,
          })(
              <InputNumber
                type="text"
                placeholder="请输入充值金额"
                allowClear
                className="shop_select_w mr10"
                step={0.01}
                onChange={inputPriceChange}
              />
              
          )}
          
        </Form.Item>
        <Row>
          <Col span={18} offset={6}>
            <Statistic
                  title=""
                  value={inputPrice}
                  valueStyle={{ fontSize: 16 }}
                  precision={2}
            />
            <p className="mt10 fw700">{priceForchinese}</p>
          </Col>
        </Row>
        
        <Form.Item label="充值类型" className="">
          {getFieldDecorator("distribution_type", {
            initialValue: 2,
            rules: [{ required: true, message: "充值类型必选!" }],
          })(
            <Radio.Group>
              <Radio value={2}>提货模式</Radio>
              <Radio value={1}>下单模式</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <div className="fs12 c999 pl30">
          <div className="pl10">
            ① 选择提货模式，分配商品后在采购端直接显示可提货的金额和数量；
          </div>
          <div className="pl10">
            ② 选择下单模式，分配商品后在采购端会显示商户余额；
          </div>
        </div>
      </Form>
      <div className="mt20 MODEL_BTN">
        <Button
          type="primary"
          onClick={handleSubmit}
          className="ml20"
          loading={isLoading}
        >
          充值
        </Button>
        <Button type="default" onClick={handleCancel}>
          取消
        </Button>
      </div>
    </Modal>
  );
};
const MerchantRechargeFormTable = Form.create({ name: "From" })(RechargeForm);

// 获取数据列表展示
const GetListData = ({ cacheData, setCache }) => {
  const [countData, setCountData] = useState([]); // 全部数据
  const [dataSource, setDataSource] = useState([]); // 列表数据
  const [isLoading, setIsLoading] = useState(true); //加载
  const Empty_description = "暂无数据"; // 空数据 文案描述
  const [banlanceInfo, setBanlanceInfo] = useState({ name: "", price: "" }); // 商户余额
  const [isShow, setIsShow] = useState(false); // 是否显示模态框
  const _KEY = getUrlParam("id");
  const per_page = 20; // 默认  请求每页参数

  useEffect(() => {
    // 获取数据
    const getTableData = async () => {
      setIsLoading(true);
      const dataSources = await getRechargeList({
        params: {
          shop_id: _KEY,
          ...cacheData,
        },
      }).then((response) => {
        if (response.res) {
          let resData = response.data;
          setCountData(resData);
          const resultData = resData.list;
          if (resultData.length !== 0) {
            let i = 0;
            const init = (resData.current_page - 1) * per_page;
            let result = resultData.map((item) => {
              item._init = ++i + init;
              return item;
            });
            return result;
          } else {
            return [];
          }
        }
      });
      setIsLoading(false);
      setDataSource(dataSources);
    }; // 获取数据
    getTableData();

    const banlanceInfo = async () => {
      await getBanlance({
        params: {
          shop_id: _KEY,
        },
      }).then((response) => {
        if (response.res) {
          let resData = response.data;
          setBanlanceInfo(resData);
        }
      });
    };
    banlanceInfo();
  }, [cacheData, _KEY]);

  const columnsData = [
    {
      title: "序号",
      dataIndex: "_init",
    },
    {
      title: "充值金额",
      dataIndex: "price",
      render: (price) => {
        return (
          <Statistic title="" value={price} valueStyle={{ fontSize: 16 }} precision={2} />
        );
      },
    },
    {
      title: "充值时间",
      dataIndex: "created_at",
    },
    {
      title: "充值类型",
      dataIndex: "distribution_type",
      render: (item) => {
        return <>{item === 1 ? "下单模式" : "提货模式"}</>;
      },
    },
    {
      title: "操作人",
      dataIndex: "real_name",
    },
  ]; // 表格 标头

  // 商户充值
  const MerchantRecharge = () => {
    setIsShow(true);
  };

  // 商户充值隐藏
  const MerchantRechargeHide = () => {
    setIsShow(false);
  };

  // 页码请求
  const pageChange = (page, pageSize) => {
    setCache({ ...cacheData, page });
  };

  // 查询数据
  const handleGetRecord = (values = {}) => {
    setIsShow(false);
    refreshData();
  };
  const title = (
    <>
      <Breadcrumb>
        <Breadcrumb.Item onClick={() => history.goBack()} className="pointer">
          <Icon type="menu" />
          <span>商户管理</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>商户充值信息</Breadcrumb.Item>
      </Breadcrumb>
    </>
  );

  return (
    <div>
      <Card
        bodyStyle={{ margin: 0, padding: 0 }}
        title={title}
        headStyle={{ border: "none" }}
        bordered={false}
      >
        {/* <List grid={{ gutter: 24, column: 2 }}>
                    <List.Item className="list_label_item">
                    <span >商户名称:</span>
                    <span>{banlanceInfo.name}</span>
                    </List.Item>
                    <List.Item className="list_label_item flex-r">

                    <span >商户现有余额:</span>
                    <span>￥{banlanceInfo.price}</span>
                    <Statistic title="商户现有余额:" value={banlanceInfo.price} />
                    <div>
                        <span className="ml20"><Button type="primary" onClick={()=>MerchantRecharge()}>充值</Button></span>
                    </div>
                    </List.Item>
                </List> */}
        <div className="flex-r fs18 pl20">
          <div className="flex1 ">
            <span>商户名称:</span>
            <span>{banlanceInfo.name}</span>
          </div>
          <div className="flex1 flex-r ai-c">
            <div className="mr20" style={{ paddingTop: 6 }}>
              商户现有余额:
            </div>
            <Statistic title="" value={banlanceInfo.price} precision={2} />
            <div>
              <span className="ml20">
                <Button type="primary" onClick={() => MerchantRecharge()}>
                  充值
                </Button>
              </span>
            </div>
          </div>
        </div>
        <div className="shop_table_model">
          <GetEmpty descriptions={Empty_description}>
            <Table
              columns={columnsData}
              dataSource={dataSource}
              pagination={{
                current: countData.current_page,
                total: countData.total,
                pageSize: 20,
                onChange: pageChange,
              }}
              bordered
              rowKey={(record) => record.id}
              loading={isLoading}
            />
          </GetEmpty>
          <MerchantRechargeFormTable
            isShow={isShow}
            getRecord={handleGetRecord}
            handleHide={MerchantRechargeHide}
            merchant={banlanceInfo.name}
          />
        </div>
      </Card>
    </div>
  );
};

const MerchantRecharge = ({ cacheData, setCache }) => {
  return (
    <FadeIn>
      <GetListData cacheData={cacheData} setCache={setCache} />
    </FadeIn>
  );
};

export default cache(cacheDataKey, initListParams, MerchantRecharge);
