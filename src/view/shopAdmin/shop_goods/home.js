import React, { Component } from 'react';
import { Route, Redirect, Switch} from "react-router-dom";
import "./index.css";
import ShopGoodsHome from "./index"
import ShopGoodsDetail from "./detail"
import ShopGoodsAdd from "./updataAdd"
import ShopGoodsCard from "../shop_card"
export default class ShopBrandManage extends Component {
  render() {
    return (
      <div style={{background:"#fff",height:"100%"}}>
        <Switch>
          <Route path='/shopGoods' exact component={ShopGoodsHome}/>
          <Route path='/shopGoods/AddUpdata' exact component={ShopGoodsAdd}/>
          <Route path='/shopGoods/editUpdata' exact component={ShopGoodsAdd}/>
          <Route path='/shopGoods/detail' component={ShopGoodsDetail}/>
          <Route path='/shopGoods/card' component={ShopGoodsCard}/>
          <Redirect to='/shopGoods' />
        </Switch>
      </div>
    )
  }
}