import React, { Component } from 'react'
import { Select } from 'antd';
import { getAccountList } from '../service/api'

const { Option } = Select;

class SupOperator extends Component {
    constructor(props) {
        super(props)
        this.state = {
            operatorList: []
        }
    }
    componentDidMount() {
        getAccountList().then(response => {
            if (response.res) {
                this.setState({
                    operatorList: response.data.list
                })
            }
        })
    }

    render(){
        return <Select style={{width: 140}} placeholder="选择操作人">
            {
                this.state.operatorList.map(operator => <Option key={operator.id} value={operator.id} >{operator.real_name}</Option>)
            }
        </Select>
    }
    
}

export default SupOperator
