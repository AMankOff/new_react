import React, { Component } from 'react';
import { Route, Redirect, Switch} from "react-router-dom";
import "./index.css";
import ShopBrandHome from "./index"
import ShopBrandDetail from "./detail"
export default class ShopBrandManage extends Component {
  render() {
    return (
      <div style={{background:"#fff",height:"100%"}}>
        <Switch>
          <Route path='/shopBrand' exact component={ShopBrandHome}/>
          <Route path='/shopBrand/detail' component={ShopBrandDetail}/>
          <Redirect to='/shopBrand' />
        </Switch>
      </div>
    )
  }
}