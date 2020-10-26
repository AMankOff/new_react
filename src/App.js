import React from 'react';
import { Provider } from 'react-redux'
import { Router, Route, Switch} from 'react-router-dom'
import { history } from './browserHistory'
import { reWriteToFixed } from './untils/untilsFn'
import './App.css';
import './antd.css';

import Layout from './view/layout'
import Login from './view/login';
// 同步登录信息
import AuthLogin from './view/authLogin'

import store from './store'
// 重写toFixed
reWriteToFixed()

const App = () => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/authLogin" component={AuthLogin}/>
          <Route path="/" component={Layout}/>
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
