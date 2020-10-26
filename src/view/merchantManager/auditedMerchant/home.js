import React, { Component } from 'react';
import { Route, Redirect, Switch} from "react-router-dom";
import "./index.css";
import AuditedMerchantList from "./index"
import AuditedMerchantDetail from "./detail"
export default class AuduitedMerchant extends Component {
  render() {
    return (
      <div style={{background:"#fff",height:"100%"}}>
        <Switch>
          <Route path='/auduitedMerchant' exact component={AuditedMerchantList}/>
          <Route path='/auduitedMerchant/detail' component={AuditedMerchantDetail}/>
          <Redirect to='/auduitedMerchant' />
        </Switch>
      </div>
    )
  }
}