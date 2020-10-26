import React, { useState, useEffect, useCallback } from "react";
import { Collapse, Icon, Button, Modal, Form, Input, Select, Radio } from "antd";
import {
  getPermissionList,
  addPermission,
  editPermission,
  sortPermission,
  disablePermission,
} from "../../service/api";

const { Panel } = Collapse;
const { Option } = Select;

const genExtra = (
  node,
  position,
  positionHandle,
  editHandle,
  disableHandle,
  positon
) => {
  const disable = node.status;
  const positionEvent = (event) => {
    event.stopPropagation();
    positionHandle(node, positon);
  };
  const edit = (event) => {
    event.stopPropagation();
    editHandle(node, positon);
  };
  const disableEvent = (event) => {
    event.stopPropagation();
    disableHandle(node, 0);
  };
  const undisableEvent = (event) => {
    event.stopPropagation();
    disableHandle(node, 1);
  };
  return (
    <>
      {position && <Icon type="up" className="mr20" onClick={positionEvent} />}
      {!position && disable === 0 && (
        <Icon type="eye" className="mr20" onClick={disableEvent} />
      )}
      {!position && disable === 1 && (
        <Icon type="eye-invisible" className="mr20" onClick={undisableEvent} />
      )}
      {!position && <Icon type="edit" onClick={edit} />}
    </>
  );
};

const mapTree = (
  treeData,
  positionStatus,
  positionHandle,
  editHandle,
  disableHandle,
  parentPositon = []
) => {
  return (
    <div className="w">
      <Collapse>
        {treeData.map((treeNode, index) => {
          const positon = [...parentPositon, index];
          if (treeNode.son) {
            return (
              <Panel
                key={treeNode.id}
                header={treeNode.display_name}
                extra={genExtra(
                  treeNode,
                  positionStatus,
                  positionHandle,
                  editHandle,
                  disableHandle,
                  positon
                )}
              >
                {mapTree(
                  treeNode.son,
                  positionStatus,
                  positionHandle,
                  editHandle,
                  disableHandle,
                  positon
                )}
              </Panel>
            );
          } else {
            return (
              <Panel
                key={treeNode.id}
                header={treeNode.display_name}
                extra={genExtra(
                  treeNode,
                  positionStatus,
                  positionHandle,
                  editHandle,
                  disableHandle,
                  positon
                )}
              >
                <p>路由标识： {treeNode.route}</p>
              </Panel>
            );
          }
        })}
      </Collapse>
    </div>
  );
};

const getNodeSort = (tree) => {
  let IdSortArr = [];
  const mapNode = (tree) => {
    tree.forEach((val, index) => {
      IdSortArr.push({
        permission_id: val.id,
        sort: index,
      });
      if (val.son && val.son.length > 1) {
        mapNode(val.son);
      }
    });
  };
  mapNode(tree);
  return IdSortArr
};

const initNodeInfo = {
  id: '',
  type: 1,
  firstNode: '',
  secondNode: '',
  thirdNode: '',
  ico: '',
  nodeName: '',
  display_name: '',
  description: '',
  route: '',
  path: '',
  parent_id: 0
}

const AuthEdit = ({form}) => {
  let [authTree, setAuthTree] = useState([]);
  let [positionStatus, setPositionStatus] = useState(false);
  let [secondNodes, setSecondNodes] = useState([]);
  // let [thirdNodes, setThirdNodes] = useState([]);
  let [nodeInfo, setNodeInfo] = useState(initNodeInfo);
  let [editType, setEditType] = useState('add');
  const { getFieldDecorator } = form
  const btnContent = ["调整顺序", "保存调整"];
  const positionToggle = () => {
    if (!positionStatus) {
      setPositionStatus((pre) => !pre);
    } else {
      const sortParams = getNodeSort(authTree);
      sortPermission({
        params: {
          param: sortParams,
        },
      }).then((response) => {
        if (response.res) {
          setPositionStatus((pre) => !pre);
          getPermission();
        }
      });
    }
  };
  const positionHandle = useCallback(
    (node, positon) => {
      const nodeIndex = positon[positon.length - 1];
      const copyAuthTree = JSON.parse(JSON.stringify(authTree));
      let sortNode = copyAuthTree;
      for (let index = 0; index < positon.length - 1; index++) {
        const element = positon[index];
        sortNode = sortNode[element].son;
      }
      if (nodeIndex > 0) {
        sortNode.splice(nodeIndex, 1);
        sortNode.splice(nodeIndex - 1, 0, node);
        setAuthTree(copyAuthTree);
      }
    },
    [authTree]
  );
  const getPermission = useCallback(() => {
    getPermissionList().then((response) => {
      if (response.res) {
        setAuthTree(response.data.list);
      }
    });
  }, []);
  const editHandle = useCallback((node) => {
    const { name } = node
    setNodeInfo({...node, 
      nodeName: name
    })
    setEditType('edit')
    form.resetFields()
  }, [form]);
  const disableHandle = useCallback((node) => {
    const status = node.status;
    const statusContents = ["禁用", "启用"];
    Modal.confirm({
      title: `确定要${statusContents[status]}此节点吗？`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => {
        disablePermission({
          params: {
            permission_id: node.id,
            status: status ? 0 : 1,
          },
        }).then((response) => {
          if (response.res) {
            getPermission();
          }
        });
      },
    });
  }, [getPermission]);
  const firstNodeChange = id => {
    const selectNode = authTree.filter(val => val.id === id)[0]
    const secondNodes = selectNode.son? selectNode.son: []
    setSecondNodes(secondNodes)
  }
  const secondNodeChange = id => {
    // const selectNode = secondNodes.filter(val => val.id === id)[0]
    // const thirdNodes = selectNode.son? selectNode.son: []
    // setThirdNodes(thirdNodes)
  }
  const resetNodeInfo = () => {
    setNodeInfo(initNodeInfo)
    setEditType('add')
    form.resetFields()
  }
  const onSubmit = async(e) => {
      e.preventDefault();
      const values = form.getFieldsValue()
      let parent_id = values.secondNode || values.firstNode
      parent_id = parent_id || nodeInfo.parent_id
      const name = values.nodeName
      let response = ''
      if (editType === 'add'){
        response = await addPermission({
          params: {
              ...values,
              parent_id,
              name,
          }
        })
      } else {
        response = await editPermission({
          params: {
              ...values,
              permission_id: nodeInfo.id,
              parent_id,
              name,
          }
        })
      }
      if (response.res) {
        getPermission()
        resetNodeInfo()
      }
  }
  
  useEffect(() => {
    getPermission();
  }, [getPermission]);
  return (
    <section className="p20 flex-r bgfff">
      <div className="pr30" style={{ width: 500 }}>
        <div className="fs18 c000 mb20">权限信息：</div>
        <div className="mb10 tr">
          <Button type="link" onClick={positionToggle}>
            {btnContent[positionStatus ? 1 : 0]}
          </Button>
        </div>
        {mapTree(
          authTree,
          positionStatus,
          positionHandle,
          editHandle,
          disableHandle
        )}
      </div>
      <div className="flex2 pl30">
        <div className="fs18 c000 mb20">权限编辑：
          <Button onClick={resetNodeInfo}>
            新建节点
          </Button>
        </div>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 6 }}
          layout="horizontal"
          initivalues={nodeInfo}
          onSubmit={onSubmit}
          autoComplete="off"
        >
          <Form.Item label="节点类型">
            {getFieldDecorator('type', {
              initialValue: nodeInfo.type
            })(
              <Radio.Group>
              <Radio.Button value={2}>操作</Radio.Button>
              <Radio.Button value={1}>页面</Radio.Button>
            </Radio.Group>
            )}  
          </Form.Item>
          <Form.Item label="一级节点" name="firstNode">
          {getFieldDecorator('firstNode', {
            initialValue: nodeInfo.firstNode
          })(
              <Select onSelect={firstNodeChange}>
                {authTree.map(val => <Option value={val.id} key={val.id}>{val.display_name}</Option>)}
            </Select>
          )} 
          </Form.Item>
          <Form.Item label="二级节点" name="secondNode">
          {getFieldDecorator('secondNode', {
            initialValue: nodeInfo.secondNode
          })(
              <Select onSelect={secondNodeChange}>
                {secondNodes.map(val => <Option value={val.id} key={val.id}>{val.display_name}</Option>)}
            </Select>
          )} 
          
          </Form.Item>
          {/* <Form.Item label="三级节点" name="thirdNode">
          {getFieldDecorator('thirdNode', {
            initialValue: nodeInfo.thirdNode
          })(
              <Select>
              {thirdNodes.map(val => <Option value={val.id} key={val.id}>{val.display_name}</Option>)}
          </Select> 
          )} 
          </Form.Item> */}
          <Form.Item label="图标" name="ico" >
          {getFieldDecorator('ico', {
            initialValue: nodeInfo.ico
          })(
               <Input />
          )}
          </Form.Item>
          <Form.Item label="Name"  name="nodeName" >
          {getFieldDecorator('nodeName', {
            initialValue: nodeInfo.nodeName
          })(
               <Input />
          )}
          </Form.Item>
          <Form.Item label="显示名称"  name="display_name" >
          {getFieldDecorator('display_name', {
            initialValue: nodeInfo.display_name
          })(
               <Input />
          )}
          </Form.Item>
          <Form.Item label="描述"  name="description" >
          {getFieldDecorator('description', {
            initialValue: nodeInfo.description
          })(
               <Input />
          )}
          </Form.Item>
          <Form.Item label="路由"  name="route" >
          {getFieldDecorator('route', {
            initialValue: nodeInfo.route
          })(
               <Input />
          )}
          </Form.Item>
          <Form.Item label="path"  name="path" >
          {getFieldDecorator('path', {
            initialValue: nodeInfo.path
          })(
               <Input />
          )}
          </Form.Item>
          <Form.Item wrapperCol={{ span: 6, offset: 4 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button onClick={resetNodeInfo} className="ml30">
              重置
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
};

export default Form.create({ name: 'AuthEdit' })(AuthEdit);
