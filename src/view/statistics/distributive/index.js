import React, { useState, useCallback, useEffect } from "react";
import {
  Form,
  Select,
  Button,
  DatePicker,
  Modal,
  Table,
  Icon,
  Descriptions,
  Statistic,
} from "antd";
import FadeIn from "../../../components/FadeIn";
import {
  selectShop,
  selectGoods,
  getDistributeList,
  getOrderDistributeInfo,
  getAccountList,
} from "../../../service/api";
import { debounce } from "../../../untils/untilsFn";
import GetEmpty from "../../../components/getEmpty";
import AuthButton from "../../../components/AuthButton";

const { Option } = Select;
const distributeType = [
  {
    type: "",
    title: "全部",
  },
  {
    type: "0",
    title: "下单模式",
  },
  {
    type: "1",
    title: "提货模式",
  },
];

const ShowSupplierManage = ({ visible, data, hideFn }) => {
  const [detailData, setDetailData] = useState([]);
  const Empty_description_info = "暂无数据";
  const [isLoadingShow, setIsLoadingShow] = useState(false);
  useEffect(() => {
    const getData = async () => {
      if (data.id) {
        setIsLoadingShow(true);
        await getOrderDistributeInfo({
          params: {
            associated_id: data.associated_id,
            type: data.type,
          },
        }).then((response) => {
          if (response.res) {
            let resData = response.data.list;
            setIsLoadingShow(false);
            setDetailData(resData);
          }
        });
      }
    }; // 获取数据
    getData();
  }, [data]);

  const columnsDetail = [
    {
      title: "主体",
      dataIndex: "company_name",
      render: (item) => {
        return (
          <>
            <div className="ellipsis_more" title={item}>
              {item}
            </div>
          </>
        );
      },
    },
    {
      title: "供应商",
      dataIndex: "provider_name",
      render: (item) => {
        return (
          <>
            <div className="ellipsis_more" title={item}>
              {item}
            </div>
          </>
        );
      },
    },
    {
      title: "分配数量",
      dataIndex: "num",
    },
    {
      title: "分配总面值",
      dataIndex: "count_price",
      render: (count_price) => {
        return (
          <Statistic
            title=""
            value={count_price}
            valueStyle={{ fontSize: 16 }}
            precision={2}
          />
        );
      },
    },
  ];

  return (
    <Modal
      title="查看详情"
      visible={visible}
      footer={null}
      onCancel={() => hideFn()}
    >
      <GetEmpty descriptions={Empty_description_info}>
        <Table
          rowKey={(record) => record.id}
          dataSource={detailData}
          columns={columnsDetail}
          bordered={true}
          loading={isLoadingShow}
          pagination={false}
        />
      </GetEmpty>
    </Modal>
  );
};

const Distributive = ({ form }) => {
  const { getFieldDecorator } = form;
  let [shopList, setShopList] = useState([]);
  let [goodsList, setGoodsList] = useState([]);
  let [sumPrice, setSumPrice] = useState(0);
  let [sumDecrPrice, setSumDecrPrice] = useState(0);
  let [distributeList, setDistributeList] = useState([]);
  let [isLoading, setIsLoading] = useState(false);
  let [detailShow, setDetailShow] = useState(false);
  let [detailInfo, setDetailInfo] = useState({});
  let [distributeTotal, setDistributeTotal] = useState(0);
  const [startValue, setStartValue] = useState(null); // 开始时间
  const [endValue, setEndValue] = useState(null); // 结束时间
  let [reqParams, setReqParams] = useState({
    shop_id: "",
    goods_id: "",
    start_time: "",
    end_time: "",
    distribute_type: "",
    page: 1,
  });
  const [operatorList, setOperatorList] = useState([]);
  const shopSeacth = useCallback(
    debounce((value) => {
      if (value) {
        selectShop({
          params: {
            name: value,
          },
        }).then((response) => {
          if (response.res) {
            setShopList(response.data.list);
          } else {
            setShopList([]);
          }
        });
      } else {
        setShopList([]);
      }
    }, 200),
    []
  );
  const goodsSeacth = useCallback(
    debounce((value) => {
      if (value) {
        selectGoods({
          params: {
            title: value,
          },
        }).then((response) => {
          if (response.res) {
            setGoodsList(response.data.list);
          } else {
            setGoodsList([]);
          }
        });
      } else {
        setGoodsList([]);
      }
    }, 200),
    []
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    let {
      shop_id,
      goods_id,
      start_time,
      end_time,
      distribute_type,
      operator_id,
    } = form.getFieldsValue();
    start_time = start_time ? start_time.format("YYYY-MM-DD") : "";
    end_time = end_time ? end_time.format("YYYY-MM-DD") : "";
    setReqParams({
      shop_id,
      goods_id,
      start_time,
      end_time,
      distribute_type,
      page: 1,
      operator_id,
    });
  };
  const handleReset = (e) => {
    e.preventDefault();
    form.resetFields();
    setReqParams({
      shop_id: "",
      goods_id: "",
      start_time: "",
      end_time: "",
      distribute_type: "",
      page: 1,
    });
    setStartValue(null);
    setEndValue(null);
  };
  const columnsData = [
    {
      title: "序号",
      dataIndex: "_init",
      width: 70,
      fixed: "left",
    },
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      fixed: "left",
    },
    {
      title: "商户名称",
      dataIndex: "shop_name",
      fixed: "left",
      width: 200,
    },
    {
      title: "商品名称",
      dataIndex: "goods_title",
      fixed: "left",
      width: 200,
    },
    {
      title: "商品面值",
      dataIndex: "price",
      width: 100,
      render: (price) => {
        return (
          <Statistic
            title=""
            value={price}
            valueStyle={{ fontSize: 16 }}
            precision={2}
          />
        );
      },
    },
    {
      title: "分配数量",
      dataIndex: "num",
      width: 100,
      render: (num) => {
        return (
          <Statistic
            title=""
            value={num}
            valueStyle={{ fontSize: 16 }}
            precision={0}
          />
        );
      },
    },
    {
      title: "商品总面值(元)",
      dataIndex: "count_price",
      width: 170,
      render: (count_price) => {
        return (
          <Statistic
            title=""
            value={count_price}
            valueStyle={{ fontSize: 16 }}
            precision={2}
          />
        );
      },
    },
    {
      title: "折扣(%)",
      dataIndex: "discount",
      width: 100,
    },
    {
      title: "商品销售总价(元)",
      width: 170,
      dataIndex: "count_decr_price",
      render: (count_decr_price) => {
        return (
          <Statistic
            title=""
            value={count_decr_price}
            valueStyle={{ fontSize: 16 }}
            precision={2}
          />
        );
      },
    },
    

    {
      title: "分配时间",
      dataIndex: "created_at",
      width: 180,
    },
    {
      title: "分配模式",
      dataIndex: "type",
      width: 100,
      render: (type) => {
        const arr = ["下单模式", "提货模式"];
        return arr[type];
      },
    },
    {
      title: "发货状态",
      dataIndex: "status",
      width: 100,
      render: (item) => {
        // const arr = ["未发货", "发货中", "发货完成", "发货失败", '采购完成待发货'];
        const arr=["待处理","发货中","发货成功", "发货失败", '采购完成待发货','预采中','预采成功','预采失败','补发待处理'];
        return arr[item];
      },
    },
    {
      title: "操作人",
      dataIndex: "real_name",
      // width: 100,
    },
    {
      title: "操作",
      fixed: "right",
      width: 120,
      render: (row) => {
        return (
          <AuthButton authid="order_distribute_info">
            <button onClick={() => detailFn(row)} className="btn-class">
              查看详情
            </button>
          </AuthButton>
        );
      },
    },
  ]; // 表格 标头
  // 页码请求
  const pageChange = (page) => {
    setReqParams({ ...reqParams, page });
  };
  const detailFn = (row) => {
    setDetailShow(true);
    setDetailInfo(row);
  };
  const hideDetail = () => {
    setDetailShow(false);
  };
  /*******日期选择 ***/
  const onStartChange = (value) => {
    setStartValue(value);
  };
  const onEndChange = (value) => {
    setEndValue(value);
  };
  const disabledStartDate = (startValue) => {
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };
  const disabledEndDate = (endValue) => {
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() < startValue.valueOf();
  };

  useEffect(() => {
    getAccountList().then((response) => {
      if (response.res) {
        setOperatorList(response.data.list);
      }
    });
  }, []);
  useEffect(() => {
    setIsLoading(true);
    getDistributeList({
      params: reqParams,
    }).then((response) => {
      if (!response.res) {
        return false;
      }
      const repData = response.data;
      const currentPage = repData.current_page;
      setIsLoading(false);
      // 只在第一页刷新统计数据
      if (currentPage === 1) {
        setSumDecrPrice(repData.sum_decr_price);
        setSumPrice(repData.sum_price);
      }
      setDistributeList(
        repData.list.map((item, i) => {
          return {
            ...item,
            _init: (currentPage - 1) * 20 + i + 1,
          };
        })
      );
      setDistributeTotal(repData.total);
    });
  }, [reqParams]);
  return (
    <FadeIn>
      <section className="p16 bgfff flex-c h">
        <Descriptions title="">
          <Descriptions.Item label="商品总面值">
            <Statistic value={sumPrice} precision={2} />
          </Descriptions.Item>
          <Descriptions.Item label="商品销售总价">
            <Statistic value={sumDecrPrice} precision={2} />
          </Descriptions.Item>
        </Descriptions>
        <Form
          layout="inline"
          onSubmit={handleSubmit}
          onReset={handleReset}
          autoComplete="off"
        >
          <div>
            <Form.Item label="商户名称">
              {getFieldDecorator(
                "shop_id",
                {}
              )(
                <Select
                  showSearch
                  placeholder="请输入商户搜索"
                  showArrow={false}
                  notFoundContent="未搜索到商户"
                  filterOption={false}
                  style={{ width: 300 }}
                  onSearch={shopSeacth}
                  allowClear
                >
                  {shopList.map((shop) => (
                    <Option value={shop.id} key={shop.id}>
                      {shop.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="商品名称">
              {getFieldDecorator(
                "goods_id",
                {}
              )(
                <Select
                  showSearch
                  placeholder="请输入商品搜索"
                  showArrow={false}
                  notFoundContent="未搜索到商品"
                  filterOption={false}
                  style={{ width: 300 }}
                  onSearch={goodsSeacth}
                  allowClear
                >
                  {goodsList.map((goods) => (
                    <Option value={goods.id} key={goods.id}>
                      {goods.title}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="分配模式">
              {getFieldDecorator("distribute_type", {
                initialValue: "",
              })(
                <Select style={{ width: 100 }}>
                  {distributeType.map((item) => (
                    <Option value={item.type} key={item.type}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </div>
          <div>
            <Form.Item label="分配时间">
              {getFieldDecorator(
                "start_time",
                {}
              )(
                <DatePicker
                  placeholder="开始时间"
                  disabledDate={disabledStartDate}
                  onChange={onStartChange}
                />
              )}
            </Form.Item>
            <Form.Item label="">
              {getFieldDecorator(
                "end_time",
                {}
              )(
                <DatePicker
                  disabledDate={disabledEndDate}
                  placeholder="结束时间"
                  onChange={onEndChange}
                />
              )}
            </Form.Item>
            <Form.Item label="操作人">
              {getFieldDecorator(
                "operator_id",
                {}
              )(
                <Select style={{ width: 140 }} placeholder="选择操作人">
                  {operatorList.map((operator) => (
                    <Option key={operator.id} value={operator.id}>
                      {operator.real_name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                <Icon type="search" />
                查询
              </Button>
              <Button type="default" htmlType="reset" className="ml20">
                重置
              </Button>
            </Form.Item>
          </div>
        </Form>
        <div
          className="flex1 mt20"
        >
          <Table
            columns={columnsData}
            dataSource={distributeList}
            pagination={{
              current: reqParams.page,
              total: distributeTotal,
              pageSize: 20,
              onChange: pageChange,
            }}
            className="h"
            bordered
            rowKey={(record) => record.id}
            loading={isLoading}
            locale={{ emptyText: "暂无数据" }}
            scroll={{ x: 1800 }}
          />
        </div>
        
        <ShowSupplierManage
          visible={detailShow}
          data={detailInfo}
          hideFn={hideDetail}
        />
      </section>
    </FadeIn>
  );
};

export default Form.create({ name: "distributive" })(Distributive);
