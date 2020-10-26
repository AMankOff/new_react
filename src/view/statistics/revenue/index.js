import React, { useEffect, useState, useCallback, useReducer, useMemo } from 'react'
import ReactEcharts from 'echarts-for-react';
import { Row, Col, Statistic, Icon, Popover, Radio, Select, DatePicker, Table, Button, Modal, Empty, Spin } from 'antd'
import styles from './index.module.css'
import { getGoodsSoldRankingList, getYesterdayTotalStatistic, getTotalStatisticList, getTotalStatisticCompareList, exportStatisticExcel } from '../../../service/api'
import { formatNumber, blobToFlie } from '../../../untils/untilsFn'
import moment from 'moment'

const { Option } = Select
const { RangePicker } = DatePicker

const lg = 992
const tableLg = 1238 + 16

const yestodyDetail = (
    <div className="p16">
        <p>1. 销售额 = 销售量 × 销售价格</p>
        <p>2. 成本额 = 商品成本</p>
        <p>3. 毛利额 = 销售额 - 成本额</p>
        <p>4. 毛利率 = 毛利 / 销售额 × 100%</p>
        <p>5. 环比计算公式：(今天 - 昨天) / 昨天 × 100%</p>
    </div>
)

const tagArr = [
    {
        label: '销售额',
        value: 'sold_price'
    },
    {
        label: '毛利额',
        value: 'profit_price'
    },
    {
        label: '毛利率',
        value: 'profit_ratio'
    },
    {
        label: '成本额',
        value: 'cost_price'
    }
]

const columns = [
    {
        title: '日期',
        dataIndex: 'sold_date',
    },
    {
        title: '销售额',
        dataIndex: 'sold_price',
        render(value) {
            return  <Statistic value={value} precision={2} valueStyle={{fontSize: 14}}/>
        }
    },
    {
        title: '毛利额',
        dataIndex: 'profit_price',
        render(value) {
            return  <Statistic value={value} precision={2} valueStyle={{fontSize: 14}}/>
        }
    },
    {
        title: '毛利率',
        dataIndex: 'profit_ratio',
        width: 80,
        render(value) {
            return  formatNumber(value)
        }
    },
    {
        title: '成本额',
        dataIndex: 'cost_price',
        render(value) {
            return  <Statistic value={value} precision={2} valueStyle={{fontSize: 14}}/>
        }
    },
    {
        title: '销售数量',
        dataIndex: 'sold_num',
        render(value) {
            return  <Statistic value={value} valueStyle={{fontSize: 14}}/>
        }
    },
]

// 统计组件
const StatisticCard = ({date, value, momValue, title, valueType='number', momTitle='日'}) => {
    return (
        <div>
            <div className="c666">
                <span>{date}</span>
                <span className="ml8">{title}</span>
            </div>
            <Statistic 
                value={value} 
                prefix={valueType === 'number'? <span style={{fontSize: 14}}>￥</span>: ''} 
                precision={2} 
                className="mt8 mb16"
                suffix={valueType === 'ratio'? '%': ''} 
            />
            {
                !!momValue? <div className="flex-r ai-c" >
                    <span className="c666">{title}_{momTitle}环比</span>
                    <span className="ml8 c222">{momValue}%</span>
                    {momValue > 0 &&  <Icon type={'caret-up'} style={{color: '#E94646'}} className="ml8 fs16" />}
                    {Number(momValue) === 0 &&  <Icon type={'minus'} style={{color: '#666666'}} className="ml8 fs16" />}
                    {momValue < 0 &&  <Icon type={'caret-down'} style={{color: '#42C96D'}} className="ml8 fs16" />}
                </div>: <div className={styles.noneHeight}></div>
            }
        </div>
    )
}
// 排行组件
const GoodsRank = ({params, style, className}) => {
    const [rankList, setRankList] = useState([])
    const [rankListLoading, setRankListLoading] = useState(false)
    const [allRankList, setAllRankList] = useState([])
    const [allRankListLoading, setAllRankListLoading] = useState(false)
    const [allRankVisible, setAllRankVisible] = useState(false)
    const toggleAllRankVisible = useCallback(() => {
        setAllRankVisible(pre => !pre)
    }, [])
    const showAllRank = useCallback(() => {
        toggleAllRankVisible()
    }, [toggleAllRankVisible])
    useEffect(() => {
        if (params.reqTrigger) {
            setRankListLoading(true)
            getGoodsSoldRankingList({
                params: {
                    ...params,
                    page: 1,
                    per_page: 5
                }
            })
            .then(response => {
                setRankListLoading(false)
                if(response.res) {
                    setRankList(response.data.list)
                }
            })
        }
    }, [params])
    useEffect(() => {
        if (allRankVisible) {
            setAllRankListLoading(true)
            getGoodsSoldRankingList({
                params: {
                    ...params,
                    page: -1,
                }
            })
            .then(response => {
                setAllRankListLoading(false)
                if(response.res) {
                    setAllRankList(response.data.list)
                }
            })
        }
    }, [allRankVisible, params])
    return (
        <div style={style} className={className}>
            <div className="flex-r jc-b ai-c">
                <span className="fw700 fs14">售卖最高商品TOP5</span>
                <Button type="link" icon="bar-chart" onClick={showAllRank}>更多排行</Button>
            </div>
            <Spin spinning={rankListLoading}>
            {
                rankList.length > 0? <ul className="mt16">
                        {rankList.map((item, index) => (
                            <li className="flex-r mb16"  key={item.goods_id + index + '' + Math.random()}>
                                <div className="mr10">
                                    <span className={ (index > 2? styles.bgddd: styles.bg666) + ` ${styles.rankIndex}`} >{index + 1}</span>
                                </div>
                                <div className="flex1 flex-r jc-b ai-s">
                                    <div style={{width: 120}}>{item.goods_title}</div>
                                    <div>{formatNumber(item.sold_price)}</div>
                                </div>
                            </li>
                            )
                        )}
                    </ul>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
            </Spin>
            <Modal
               title="售卖商品排行" 
               visible={allRankVisible}
               width="640px"
               bodyStyle={{maxHeight: 440, overflowX : 'hidden', overflowY: 'auto'}}
               onOk={toggleAllRankVisible}
               onCancel={toggleAllRankVisible}
               okText="确认"
            >
                 <Spin spinning={allRankListLoading}>
                {
                   allRankList.length > 0?<ul>
                        {
                            allRankList.map((item, index) => (
                                <li className="flex-r mb16"  key={item.goods_id}>
                                    <div className="mr10">
                                        <span className={ (index > 2? styles.bgddd: styles.bg666) + ` ${styles.rankIndex}`} >{index + 1}</span>
                                    </div>
                                    <div className="flex1 flex-r jc-b ai-s">
                                        <div>{item.goods_title}</div>
                                        <div>{formatNumber(item.sold_price)}</div>
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                   : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
                </Spin>
            </Modal>
        </div>
    )
}

const optionViewInitParams = {
    time_type: '3',
    reqTrigger: true,
    date: []
}

const optionViewReducer = (state, action) => {
  switch (action.type) {
    case 'setTimeType':
        return {
            ...state,
            time_type: action.timeType,
            reqTrigger: true
        }
    case 'setDate':
        return {
            time_type: '-1',
            date: action.date,
            reqTrigger: true
        }
    case 'setReqDate': 
        return {
            ...state,
            date: action.date,
            reqTrigger: false
        }
    default:
        return state
  }
}

const timeViewInitParams = {
    time_type: '3',
    compare_time_type: '7',
    date: [],
    compareDate: [],
    reqTrigger: true
}

const timeViewReducer = (state, action) => {
  switch (action.type) {
    case 'setTimeType':
        return {
            ...state,
            time_type: action.timeType,
            reqTrigger: action.timeType !== '-1'
        }
    case 'setCompareTimeType':
        return {
            ...state,
            compare_time_type: action.compareTimeType,
            reqTrigger: action.compareTimeType !== '-1'
        }
    case 'setDate':
        return {
            ...state,
            date: action.date,
            reqTrigger: true
        }
    case 'setCompareDate':
        return {
            ...state,
            compareDate: action.compareDate,
            reqTrigger: true
        }
    case 'setReqDate': 
        return {
            ...state,
            date: action.date,
            compareDate: action.compareDate,
            reqTrigger: false
        }
    default:
        return state
  }
}

const Revenue = () => {
    const [compareType, setCompareType] = useState('option')                                                            // 图标类型
    const [optionViewSelectValue, setOptionViewSelectValue] = useState(['销售额', '毛利额'])                             // 指标对比选项
    const [dateViewSelectValue, setDateViewSelectValue] = useState('sold_price')                                        // 时间对比选项
    const [tableData, setTableData] = useState([])                                                                      // 详细数据
    const [optionViewParams, dispatchOptionViewParams] = useReducer(optionViewReducer, optionViewInitParams)            // 指标对比参数
    const [timeViewParams, dispatchTimeViewParams] = useReducer(timeViewReducer, timeViewInitParams)                    // 时间对比参数

    const [yesterdayTotalStatistic, setYesterdayTotalStatistic] = useState({})                                          // 昨日数据
    const [searchStatistic, setSearchStatistic] = useState({})                                                          // 搜索数据详情
    const [chartLoading, setChartLoading ] = useState(false)                                                            
    const [exporting, setExporting ] = useState(false)
    const [optionLineOption, setOptionLineOption] = useState({                                                          // 指标对比 chart 默认参数
        grid: {
            bottom: 80,
            left: 70,
            right: '10%',
            top: 16,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            }
        },
        legend: {
            data: ['销售额', '毛利额', '毛利率', '成本额'],
            bottom: 10,
            selected: {
                '销售额': true,
                '毛利额': true,
                '毛利率': false,
                '成本额': false,
            },
            show: true,
            selectedMode: false
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: []
            }
        ],
        yAxis: [
            {
                name: '',
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter(value) {
                        if (Math.abs(value) > 10000) {
                            return  value / 10000 + '万元'
                        }
                        return value
                    }
                },
            },
            {
                name: '',
                // nameLocation: 'start',
                type: 'value',
                // inverse: true
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter(value) {
                        return value + '%'
                    }
                },
            }
        ],
        series: []
    })
    const [compareData, setCompareData] = useState(null)                                                                // 时间对比数据
    const [timeLineOption, setTimeLineOption] = useState({                                                              // 时间对比 chart 默认参数
        grid: {
            bottom: 80,
            left: 70,
            right: '10%',
            top: 16,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            }
        },
        legend: {
            data: [],
            bottom: 10,
            show: true,
            selectedMode: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: []
            }
        ],
        yAxis: [
            {
                name: '',
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter(value) {
                        return value / 10000 + '万元'
                    }
                },
            },
        ],
        series: []
    })

    const viewWidth = document.body.clientWidth     //屏幕宽度
    // 对比类型
    const compareTypeChange = useCallback((e) => {
        setCompareType(e.target.value)
    }, [])
    // 搜索数据环比类型文案
    const momTitle = useMemo(() => {
        const momTitles = ['', '日', '周', '月']
        return momTitles[optionViewParams.time_type]
    }, [optionViewParams])
    // 数据更新时间
    const dataUpdateTime = useMemo(() => {
        if(optionViewParams.time_type === '1') {
            return moment().format('YYYY-MM-DD HH:mm')
        }else {
            return moment().format('YYYY-MM-DD')
        }
    }, [optionViewParams])
    // 指标对比选项选择 chart 更新
    const selectOptionViewLegend = useCallback(value => {
        let value2select = {
            '销售额': false,
            '毛利额': false,
            '毛利率': false,
            '成本额': false,
        }
        value.forEach(item => {
            value2select[item] = true
        })
        setOptionLineOption(pre => {
            return {
                ...pre,
                legend: {
                    ...pre.legend,
                    selected: value2select
                }
            }
        })
    }, [])

    const optionViewSelectChange = useCallback((val) => {
        setOptionViewSelectValue(val)
        selectOptionViewLegend(val)
    }, [selectOptionViewLegend])

    const dateViewSelectChange = useCallback((val) => {
        setDateViewSelectValue(val)
    }, [])

    const timeOriginDateTypeSelectChange = useCallback((value) => {
        dispatchTimeViewParams({
            type: 'setTimeType',
            timeType: value
        })
    }, [])

    const timeCompareDateTypeSelectChange = useCallback((value) => {
        dispatchTimeViewParams({
            type: 'setCompareTimeType',
            compareTimeType: value
        })
    }, [])

    const timeViewPickerChange = useCallback((date) => {
        dispatchTimeViewParams({
            type: 'setDate',
            date
        })
    }, [])
    const timeViewComparePickerChange = useCallback((date) => {
        dispatchTimeViewParams({
            type: 'setCompareDate',
            compareDate: date
        })
    }, [])
    const optionViewPickerChange = useCallback((date) => {
        if (date.length === 0) {
            dispatchOptionViewParams({
                type: 'setTimeType',
                timeType: '3'
            })
        } else {
            dispatchOptionViewParams({
                type: 'setDate',
                date
            })
        }
    }, []) 
    const optionViewTimeTypeChange = useCallback((e) => {
        dispatchOptionViewParams({
            type: 'setTimeType',
            timeType: e.target.value
        })
    }, [])
    // 指标对比、排行数据参数
    const goodsRankParams = useMemo(() => {
        return  {
            time_type: optionViewParams.time_type,
            reqTrigger: optionViewParams.reqTrigger,
            begin_time: optionViewParams.date[0] ? optionViewParams.date[0].format('YYYY-MM-DD'): '',
            end_time: optionViewParams.date[1] ? optionViewParams.date[1].format('YYYY-MM-DD'): ''
        }
    }, [optionViewParams]) 
    // 时间对比参数
    const timeCompareParams = useMemo(() => {
        return  {
            time_type: timeViewParams.time_type,
            begin_time: timeViewParams.date[0] ? timeViewParams.date[0].format('YYYY-MM-DD'): '',
            end_time: timeViewParams.date[1] ? timeViewParams.date[1].format('YYYY-MM-DD'): '',
            compare_time_type: timeViewParams.compare_time_type,
            compare_begin_time: timeViewParams.compareDate[0]? timeViewParams.compareDate[0].format('YYYY-MM-DD'): '',
            compare_end_time: timeViewParams.compareDate[1]? timeViewParams.compareDate[1].format('YYYY-MM-DD'): '',
            reqTrigger: timeViewParams.reqTrigger,
        }
    }, [timeViewParams]) 

    const disableDate = useCallback(current => {
        return current > moment()
    }, [])

    const exportTable = useCallback(() => {
        setExporting(true)
        exportStatisticExcel({
            params: goodsRankParams
        }).then(response => {
            setExporting(false)
            const fileName = `${tableData[0].sold_date}至${tableData[tableData.length - 1].sold_date}`
            if (response.toString() === "[object Blob]") {
                blobToFlie(response, fileName, 'xlsx');
                return true;
              }
              return false;
        })
    }, [goodsRankParams, tableData])
    // 指标对比 chart 更新数据
    const drowOptionChart = useCallback((optionData) => {
        let xAxisData = []                      // x轴数据
        let soldPriceArrData = []               // 销售额
        let costPriceArrData = []               // 成本额
        let profitdPriceArrData = []            // 毛利额
        let profitRatioArrData = []             // 毛利率
        let series = [
            {
                name: '销售额',
                type: 'line',
                animation: true,
                areaStyle: {
                    color: '#FFF2E0'
                },
                lineStyle: {
                    width: 1
                },
                itemStyle: {
                    color: "#FFA82F"
                },
                data: soldPriceArrData,
                smooth: true
            },
            {
                name: '成本额',
                type: 'line',
                animation: true,
                areaStyle: {
                    color: '#FCE4E4'
                },
                lineStyle: {
                    width: 1
                },
                itemStyle: {
                    color: "#E94646"
                },
                data: costPriceArrData,
                smooth: true
            },
            {
                name: '毛利额',
                type: 'line',
                animation: true,
                areaStyle: {
                    color: '#E3F7E9'
                },
                lineStyle: {
                    width: 1
                },
                itemStyle: {
                    color: "#42C96D"
                },
                data: profitdPriceArrData,
                smooth: true
            },
            {
                name: '毛利率',
                type: 'line',
                yAxisIndex: 1,
                animation: true,
                areaStyle: {
                    color: '#D9F3FC'
                },
                lineStyle: {
                    width: 1
                },
                itemStyle: {
                    color: "#007AFF"
                },
                data: profitRatioArrData,
                smooth: true
            }
        ]
        optionData.forEach(item => {
            xAxisData.push(item.sold_date)
            soldPriceArrData.push(Number(item.sold_price).toFixed(2))
            costPriceArrData.push(Number(item.cost_price).toFixed(2))
            profitdPriceArrData.push(Number(item.profit_price).toFixed(2))
            profitRatioArrData.push(Number(item.profit_ratio).toFixed(2))
        })
        setOptionLineOption(pre => {
            return {
                ...pre,
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: xAxisData
                    }
                ],
                series
            }
        })
    }, [])
    // 昨日数据
    useEffect(() => {
        getYesterdayTotalStatistic().then(response => {
            if(response.res) {
                setYesterdayTotalStatistic(response.data)
            }
        })
    }, [])
    // 指标对比数据请求
    useEffect(() => {
        if (goodsRankParams.reqTrigger) {
            setChartLoading(true)
            getTotalStatisticList({
                params: goodsRankParams
            }).then(response => {
                if(!response.res) {
                    return false
                }
                const resData = response.data
                const resDataList = resData.list
                const startDate = resDataList[0].sold_date
                if (goodsRankParams.time_type !== '-1') {
                    dispatchOptionViewParams({
                        type: 'setReqDate',
                        date: [moment(startDate), moment()]
                    })
                }
                setTableData(resDataList)
                setSearchStatistic(resData.mom_list)
                drowOptionChart(resDataList)
                setChartLoading(false)
            })
        }
    }, [goodsRankParams, drowOptionChart])
    // 时间对比数据请求
    useEffect(() => {
        const getTimeViewData = () => {
            const {reqTrigger} = timeCompareParams
            if (!reqTrigger) {
                return false
            }
            setChartLoading(true)
            getTotalStatisticCompareList({
                params: timeCompareParams
            }).then(response => {
                if(!response.res) {
                    return false
                }
                const compareData = response.data
                const originList = compareData.list
                const compareList = compareData.compare_list
                const originDate = [moment(originList[0].sold_date), moment(originList[originList.length - 1].sold_date)]
                const compareDate = [moment(compareList[0].sold_date), moment(compareList[compareList.length - 1].sold_date)]
                dispatchTimeViewParams({
                    type: 'setReqDate',
                    date: originDate,
                    compareDate
                })
                
                setCompareData(compareData)
                setChartLoading(false)
            })
        }
        if (compareType === 'date') {
            getTimeViewData()
        }
        
    }, [timeCompareParams, compareType])
    // 时间对比 chart 更新
    useEffect(() => {
        if (compareData){
            const compareTypeContent = {
                sold_price: '销售额',
                profit_price: '毛利额',
                profit_ratio: '毛利率',
                cost_price: '成本额',
            }
            const originList =  compareData.list
            const compareList =  compareData.compare_list
            const originListLength = originList.length
            const compareListLength = compareList.length
            let xAxisData = []                                                                  // x轴数据
            const xAxisDataFrom = originListLength >= compareListLength? originList: compareList
            xAxisDataFrom.forEach(item => {
                xAxisData.push(item.sold_date)
            })
            const originName = `${originList[0].sold_date} 至 ${originList[originListLength - 1].sold_date}`
            const compareName = `${compareList[0].sold_date} 至 ${compareList[compareListLength - 1].sold_date}`

            const series = [
                {
                    name: originName,
                    type: 'line',
                    animation: true,
                    areaStyle: {
                        color: '#E3F7E9'
                    },
                    lineStyle: {
                        width: 1
                    },
                    itemStyle: {
                        color: "#42C96D"
                    },
                    smooth: true,
                    data: originList.map(item => {
                        return {
                            name: item.sold_date,
                            value: item[dateViewSelectValue],
                        }
                    })
                },
                {
                    name: compareName,
                    type: 'line',
                    animation: true,
                    areaStyle: {
                        color: '#D9F3FC'
                    },
                    lineStyle: {
                        width: 1
                    },
                    itemStyle: {
                        color: "#007AFF"
                    },
                    data: compareList.map(item => {
                        return {
                            name: item.sold_date,
                            value: item[dateViewSelectValue],
                        }
                    }),
                    smooth: true
                },
            ]
            const legend =  {
                data: [originName, compareName],
                bottom: 10,
                selected: {
                    [originName]: true,
                    [compareName]: true,
                },
                show: true,
                selectedMode: true
            }
            const tooltip = {
                trigger: 'axis',
                axisPointer: {
                    type: 'none',
                    animation: false,
                },
                formatter(params) {
                    const title = compareTypeContent[dateViewSelectValue]
                    let content = ''
                    params.forEach(item => {
                        content += `<p>${item.marker}${item.data.name}: ${formatNumber(item.data.value)}</p>`
                    })

                    return `<p>${title}</p>${content}`
                    
                }
            }
            const yAxis = {
                name: '',
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter(value) {
                        
                        if (dateViewSelectValue === 'profit_ratio') {
                            return value + '%'
                        } else {
                            if (Math.abs(value) > 10000) {
                                return  value / 10000 + '万元'
                            }
                            return value
                        }
                    }
                }
            }
            setTimeLineOption(pre => {
                return {
                    ...pre,
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: xAxisData,
                        }
                    ],
                    legend,
                    series,
                    tooltip,
                    yAxis
                }
            })
        }
    },[compareData, dateViewSelectValue])

    // 指标对比 UI
    const optionView = (
        <div className="flex-r  jc-b pb16 flex-w">
            <Select
                mode="multiple"
                style={{ width: 200 }}
                className="mt16"
                placeholder="选择指标"
                value={optionViewSelectValue}
                onChange={optionViewSelectChange}
            >
                {tagArr.map(item => <Option value={item.label} key={item.label} >{item.label}</Option>)}
            </Select>
            <div
                 className="mt16"
            >
                <Radio.Group value={optionViewParams.time_type} onChange={optionViewTimeTypeChange} >
                    <Radio.Button value="1">本日</Radio.Button>
                    <Radio.Button value="2">本周</Radio.Button>
                    <Radio.Button value="3">本月</Radio.Button>
                    <Radio.Button value="4">本年</Radio.Button>
                </Radio.Group>
                <RangePicker 
                    className="ml8" 
                    style={{width: 240}} 
                    value={optionViewParams.date} 
                    onChange={optionViewPickerChange} 
                    disabledDate={disableDate} 
                    allowClear={false}
                />
            </div>
        </div>
    )
    // 时间对比 UI
    const dateView =  (
        <div className=" flex-r jc-b flex-w" >
            <Select
                style={{ width: 200}}
                className="mt16"
                value={dateViewSelectValue}
                onChange={dateViewSelectChange}
            >
                {tagArr.map(item => <Option value={item.value} key={item.value} >{item.label}</Option>)}
            </Select>
            <div className="flex-r ai-c flex-w mb16" >
                <div  className="mt16" >
                    <Select
                        style={{ width: 160}}
                        value={timeViewParams.time_type}
                        onChange={timeOriginDateTypeSelectChange}
                    >
                        <Option value={'3'} >本月</Option>
                        <Option value={'7'}>最近30天</Option>
                        <Option value={'-1'}>自定义</Option>
                    </Select>
                     <RangePicker 
                        className="ml8" 
                        style={{width: 240}} 
                        value={timeViewParams.date} 
                        onChange={timeViewPickerChange} 
                        disabledDate={disableDate} 
                        disabled={timeViewParams.time_type !== '-1'}
                        allowClear={false}
                    />
                </div>
                <span className="ml8 mr8 mt16" >对比</span>
                <div  className="mt16">
                    <Select
                        style={{ width: 160 }}
                        value={timeViewParams.compare_time_type}
                        onChange={timeCompareDateTypeSelectChange}
                    >
                        <Option value={'8'} >该时间段前14天</Option>
                        <Option value={'7'}>该时间段前30天</Option>
                        <Option value={'-1'}>自定义</Option>
                    </Select>
                    <RangePicker 
                        className="ml8" 
                        style={{width: 240}} 
                        value={timeViewParams.compareDate} 
                        onChange={timeViewComparePickerChange} 
                        disabledDate={disableDate} 
                        disabled={timeViewParams.compare_time_type !== '-1'}
                        allowClear={false}
                    />
                </div>
            </div>
        </div>
    )

    return (
        <section className="w h" >
            <Spin spinning={!yesterdayTotalStatistic.sold_date} >
                <div className="bgfff p16 bd4">
                    <div>
                        <span className="fw700 fs14">昨日数据概况</span>
                        <Popover content={yestodyDetail} placement="right" >
                            <Icon type="info-circle" className="ml8" />
                        </Popover>
                    </div>
                    <Row className={`${styles.mt25} fs12`} >
                        <Col md={8} lg={6} style={{height: 132}} >
                            <StatisticCard  
                                date={yesterdayTotalStatistic.sold_date} title="销售额" 
                                momValue={yesterdayTotalStatistic.sold_price_mom} 
                                value={yesterdayTotalStatistic.sold_price} 
                            />
                            <div className="flex-r mt8 ai-c">
                                <span>销售总面值</span>
                                <Statistic value={yesterdayTotalStatistic.count_price} prefix="￥" precision={2} valueStyle={{fontSize: 12, color: '#222'}} className="ml8"/>
                            </div>
                        </Col>
                        <Col md={8} lg={6} style={{height: 132}} >
                            <div className={`${styles.colBorder} pl16`}>
                                <StatisticCard  
                                    date={yesterdayTotalStatistic.sold_date} 
                                    title="毛利额" 
                                    momValue={yesterdayTotalStatistic.profit_price_mom} 
                                    value={yesterdayTotalStatistic.profit_price}
                                    
                                />
                            </div>
                        </Col>
                        <Col md={8} lg={6} style={{height: 132}} >
                            <div className={`${styles.colBorder} pl16`}>
                                <StatisticCard  
                                    date={yesterdayTotalStatistic.sold_date} 
                                    title="毛利率" 
                                    momValue={yesterdayTotalStatistic.profit_ratio_mom} 
                                    value={yesterdayTotalStatistic.profit_ratio}
                                    valueType="ratio" 
                                />
                            </div>
                        </Col>
                        <Col md={8} lg={6} className={ viewWidth > lg ? `pl16 ${styles.colBorder}`: styles.mt25} >
                            <StatisticCard  
                                date={yesterdayTotalStatistic.sold_date} 
                                title="成本额" 
                                momValue={yesterdayTotalStatistic.cost_price_mom} 
                                value={yesterdayTotalStatistic.cost_price} 
                            />
                        </Col>
                    </Row>
                </div>
            </Spin>
            <Spin spinning={chartLoading}>
            <div className="bgfff pt16 pl16 pr16 bd4 mt16">
                <div>
                    <span className="fw700 fs14">数据概况</span>
                    {
                        compareType === 'option' &&  <span className={`fs12 ${styles.c98} ml8`} >数据更新至 {dataUpdateTime}</span>
                    }
                </div>
                <Radio.Group 
                    value={compareType} 
                    buttonStyle="solid" 
                    className={`${styles.mt25}`}
                    onChange={compareTypeChange}
                >
                    <Radio.Button value="option">指标对比</Radio.Button>
                    <Radio.Button value="date" >时间对比</Radio.Button>
                </Radio.Group>
                {
                    compareType === 'option' && <Row className={`mt16 fs12`} >
                        <Col md={8} lg={6} style={{height: 132}} >
                            <StatisticCard  
                                date={searchStatistic.sold_date} title="销售额" 
                                momValue={searchStatistic.sold_price_mom} 
                                value={searchStatistic.sold_price} 
                                momTitle={momTitle}
                            />
                            <div className="flex-r mt8 ai-c">
                                <span>销售总面值</span>
                                <Statistic value={searchStatistic.count_price} prefix="￥" precision={2} valueStyle={{fontSize: 12, color: '#222'}} className="ml8"/>
                            </div>
                        </Col>
                        <Col md={8} lg={6} style={{height: 132}} >
                            <div className={`${styles.colBorder} pl16`}>
                                <StatisticCard  
                                    date={searchStatistic.sold_date} 
                                    title="毛利额" 
                                    momValue={searchStatistic.profit_price_mom} 
                                    value={searchStatistic.profit_price}
                                    momTitle={momTitle}
                                />
                            </div>
                        </Col>
                        <Col md={8} lg={6} style={{height: 132}} >
                            <div className={`${styles.colBorder} pl16`}>
                                <StatisticCard  
                                    date={searchStatistic.sold_date} 
                                    title="毛利率" 
                                    momValue={searchStatistic.profit_ratio_mom} 
                                    value={searchStatistic.profit_ratio}
                                    valueType="ratio" 
                                    momTitle={momTitle}
                                />
                            </div>
                        </Col>
                        <Col md={8} lg={6} className={ viewWidth > lg ? `pl16 ${styles.colBorder}`: styles.mt25} >
                            <StatisticCard  
                                date={searchStatistic.sold_date} 
                                title="成本额" 
                                momValue={searchStatistic.cost_price_mom} 
                                value={searchStatistic.cost_price} 
                                momTitle={momTitle}
                            />
                        </Col>
                    </Row>
                }
                {
                    compareType === 'option'? optionView: dateView
                }
                <div className="w">
                    <ReactEcharts 
                        style={{width: '100%', height: 320}} 
                        option={compareType === 'option'? optionLineOption: timeLineOption}
                        notMerge={true}
                    />
                </div>
            </div>
            </Spin>
            <div 
                className=" flex-r flex-w pt16"
            >
                <div 
                    className={`flex1 ${styles.tableMin} bgfff bd4 p16 mb16`}
                >
                    <div className="flex-r jc-b ai-c">
                        <span className="fw700 fs14">数据明细</span>
                        <Button type="link" icon="download" onClick={exportTable} loading={exporting}>导出表格</Button>
                    </div>
                    <Table
                        dataSource={tableData} 
                        columns={columns} 
                        rowKey={() => Math.random() + ''}
                        bordered
                        pagination={false}
                        className="mt16"
                        scroll={ {y: 216 }}
                        loading={chartLoading}
                    />;
                </div>
                <GoodsRank style={{width: 310}} className={`bgfff bd4 p16 mb16 ${viewWidth > tableLg && 'ml16'}`} params={goodsRankParams} />
            </div>
        </section>
        
    )
}

export default Revenue
