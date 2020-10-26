import React, { Component } from 'react';
import { Route, Redirect, Switch} from "react-router-dom";
import "./index.css";
import SupplierList from "./index"
import SupplierGoods from "./supplierGoods"
export default class SupplierManage extends Component {
  render() {
    return (
      <div style={{background:"#fff",height:"100%"}}>
        <Switch>
          <Route path='/supplierManage' exact component={SupplierList}/>
          <Route path='/supplierManage/supplierGoods' component={SupplierGoods}/>
          <Redirect to='/supplierManage' />
        </Switch>
      </div>
    )
  }
}