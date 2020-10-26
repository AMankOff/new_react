import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Form,
  Select,
  Button,
  DatePicker,
  Table,
  Icon,
  Descriptions,
  Statistic,
  Input
} from "antd";
import FadeIn from "../../../../../components/FadeIn";
import {
  selectShop,
  selectGoods,
  interfaceGetOrderList
} from "../../../../../service/api";
import { debounce } from "../../../../../untils/untilsFn";
const { Option } = Select;
const distributeType = [
  {
    type: "-1",
    title: "全部",
  },
  {
    type: "0",
    title: "处理中",
  },
  {
    type: "1",
    title: "发货成功",
  },
  {
    type: "2",
    title: "发货失败",
  },
  {
    type: "3",
    title: "超时订单",
  }
];

const InterfaceOrderList = ({ form }) => {
  const { getFieldDecorator } = form;
  let [shopList, setShopList] = useState([]);
  let [goodsList, setGoodsList] = useState([]);
  let [sumPrice, setSumPrice] = useState(0);
  let [sumDecrPrice, setSumDecrPrice] = useState(0);
  let [distributeList, setDistributeList] = useState([]);
  let [isLoading, setIsLoading] = useState(false);
  let [distributeTotal, setDistributeTotal] = useState(0);
  const [startValue, setStartValue] = useState(null); // 开始时间
  const [endValue, setEndValue] = useState(null); // 结束时间
  let [reqParams, setReqParams] = useState({
    shop_id: '',
    goods_id: '',
    begin_date: '',
    end_date: '',
    status: '-1',
    phone: '',
    page: 1,
  });
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
  const handleSubmit = useCallback(e => {
    e.preventDefault();
    form.validateFields((err, values) => {
        if (err) {
            return false
        }
        let {
            shop_id,
            goods_id,
            begin_date,
            end_date,
            status,
            phone
          } = values
          begin_date = begin_date ? begin_date.format("YYYY-MM-DD") : "";
        end_date = end_date ? end_date.format("YYYY-MM-DD") : "";
        setReqParams({
        shop_id,
        goods_id,
        begin_date,
        end_date,
        status,
        page: 1,
        phone
        });
    })
  }, [form]);
  const handleReset = useCallback((e) => {
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
  }, [form]) ;
  const columnsData = useMemo(() => {
    return [
        {
          title: "订单号",
          dataIndex: "serial_no",
          width: 180,
          fixed: "left",
        },
        {
          title: "用户手机号",
          dataIndex: "phone",
          fixed: "left",
          width: 150,
        },
        {
          title: "商户名称",
          dataIndex: "shop_name",
          fixed: "left",
          width: 150,
        },
        {
          title: "商品名称",
          dataIndex: "goods_title",
          fixed: "left",
          width: 150,
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
          title: "数量",
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
          title: "品牌",
          dataIndex: "brand_title",
        },
        {
          title: "发货状态",
          width: 100,
          dataIndex: "status",
          render: (status) => {
            // const arr = [ '', "发货成功", '发货失败', "处理中"];
            const arr = [ '处理中', "发货成功", '发货失败', "超时订单"];
            return arr[status];
          },
        },
        {
          title: "下单时间",
          dataIndex: "created_at",
          width: 180
        },
        {
          title: "订单金额",
          dataIndex: "count_decr_price",
          width: 100,
          render: (count_decr_price) => {
            return (
              <Statistic
                title=""
                value={count_decr_price}
                valueStyle={{ fontSize: 16 }}
                precision={2}
              />
            );
          }
        }
      ]; 
  }, []) // 表格 标头
  // 页码请求
  const pageChange = useCallback(page => {
    setReqParams({ ...reqParams, page });
  }, [reqParams]) 
  /*******日期选择 ***/
  const onStartChange = useCallback((value) => {
    setStartValue(value);
  }, [])
  const onEndChange = useCallback((value) => {
    setEndValue(value);
  }, [])
  const disabledStartDate = useCallback((startValue) => {
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }, [endValue]) 
  const disabledEndDate = useCallback((endValue) => {
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() < startValue.valueOf();
  }, [startValue])
  useEffect(() => {
    setIsLoading(true);
    interfaceGetOrderList({
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
          <Descriptions.Item label="订单总面值">
            <Statistic value={sumPrice} precision={2} />
          </Descriptions.Item>
          <Descriptions.Item label="订单总金额">
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
            <Form.Item label="用户手机号">
              {getFieldDecorator(
                "phone",
                {
                    validateTrigger: 'onBlur',
                    initialValue: '',
                    rules: [
                        { pattern: /^(13|14|15|17|18|16|19)[0-9]{9}$/, message: '请填写正确手机号' }
                    ],
                }
              )(
                <Input placeholder="请输入用户手机号搜索" />
              )}
            </Form.Item>
            <Form.Item label="发货状态">
              {getFieldDecorator("status", {
                initialValue: "-1",
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
            <Form.Item label="商品名称">
                {getFieldDecorator(
                    "goods_id",
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
            <Form.Item label="订单时间">
              {getFieldDecorator(
                "begin_date",
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
                "end_date",
                {}
              )(
                <DatePicker
                  disabledDate={disabledEndDate}
                  placeholder="结束时间"
                  onChange={onEndChange}
                />
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
            scroll={{ x: 1400 }}
          />
        </div>
      </section>
    </FadeIn>
  );
};

export default Form.create({ name: "interfaceOrderList" })(InterfaceOrderList);
