import React, { Component } from 'react';
import { Route, Redirect, Switch} from "react-router-dom";
import "./index.css";
import MerchantList from "./index"
import AllocationRecord from "./allocationRecord"
import MerchantDetail from "./detail"
import DistributiveGoods from './distributiveGoods'
import MerchantRecharge from "./recharge"
export default class MerchantManage extends Component {
  render() {
    return (
      <div style={{background:"#fff",height:"100%"}}>
        <Switch>
          <Route path='/merchantList' exact component={MerchantList}/>
          <Route path='/merchantList/allocationRecord' component={AllocationRecord}/>
          <Route path='/merchantList/detail' component={MerchantDetail}/>
          <Route path='/merchantList/recharge' component={MerchantRecharge}/>
          <Route path='/merchantList/distributiveGoods' component={DistributiveGoods}/>
          <Redirect to='/merchantList' />
        </Switch>
      </div>
    )
  }
}