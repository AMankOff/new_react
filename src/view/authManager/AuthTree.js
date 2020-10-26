import React, { useState, useEffect } from 'react'
import { Tree, Spin } from 'antd';
import { getAuthTree } from '../../service/api'

const { TreeNode } = Tree;

const getChildrenKeys = node => {
    let childrenKeys = []
    let keys  = []
    if (node.son && node.son.length > 0) {
        node.son.forEach(val => {
            childrenKeys.push(val.id)
            if (val.son && val.son.length > 0) {
                keys = [...keys, ...getChildrenKeys(val)]
            } 
        })
    }
    return [...childrenKeys, ...keys]
}

const getKeysNode = (treeNode, pos) => {
    const posArr = pos.split('-').slice(1)
    let keysNode = [treeNode]
    posArr.forEach((val, index) => {
        if (index === 0) {
            keysNode.push(keysNode[index][val])
        } else {
            keysNode.push(keysNode[index].son[val])
        }
    })
    return keysNode.slice(1)
}

// const addArrayToTarget = (current, target) => {
//     const targetArr = [...target]
//     current.forEach(val => {
//         if (target.indexOf(val) === -1) {
//             targetArr.push(val)
//         }
//     })
//     return targetArr
// }

const removeElementFromTarget = (element, Target) => {
    const index = Target.indexOf(element)
    if (index !== -1) {
        Target.splice(index, 1)
    }
}

// const hasSameValue = (current, target) => {
//     let flag = false
//     current.forEach(val => {
//         if (target.includes(val)) {
//             flag = true
//         }
//     })
//     return flag
// }

const computeCheckedKeys = (treeData, pre, e) =>{
    const keysNode = getKeysNode(treeData, e.node.props.pos)
    const keysNodeLength = keysNode.length
    const currentNode = keysNode[keysNodeLength - 1]
    const childrenKeys = getChildrenKeys(currentNode)
    
    if (e.checked) {
        const parentKeys = e.node.props.parentKeys
        const addKeys = [...parentKeys, ...childrenKeys]
        const newCheckedKeys = new Set([...pre, ...addKeys, currentNode.id]) 
        return [...newCheckedKeys]
    } else {
        let newCheckedKeys= [...pre]
        removeElementFromTarget(currentNode.id, newCheckedKeys)
        // for (let index = keysNodeLength - 2; index >= 0 ; index--) {
        //     const ele = keysNode[index];
        //     const eleChildrenKeys =  ele.son.map(val => val.id)
        //     if (hasSameValue(eleChildrenKeys, newCheckedKeys)) {
        //         break
        //     } else {
        //         removeElementFromTarget(ele.id, newCheckedKeys)
        //     }
        // }
        childrenKeys.forEach(val => {
            removeElementFromTarget(val, newCheckedKeys)
        })
        return newCheckedKeys
    }
}

const mapTreeNode = (treeData, parentSign = []) => {
    return treeData.map((treeNode, index) => {
        const parentKeys = [...parentSign, treeNode.id]
        if (treeNode.son) {
            return  (
                <TreeNode key={treeNode.id} title={treeNode.display_name} parentKeys={parentSign}> 
                    {mapTreeNode(treeNode.son, parentKeys)}
                </TreeNode>
            )
        } else {
            return <TreeNode key={treeNode.id} title={treeNode.display_name} parentKeys={parentSign} />
        }
    })
}

const AuthTree = ({checkedKeys, onCheck}) => {
    let [treeData, setTreeData] = useState([])
    let [spinning, setSpinning] = useState(true)
    const onTreeCheck = (checkedKeysE, e) => {
        const newCheckedKeys = computeCheckedKeys(treeData, checkedKeys, e)
        onCheck(newCheckedKeys)
    }
    useEffect(() => {
        getAuthTree().then(response => {
            if (response.res) {
                setTreeData(response.data.list)
                setSpinning(false)
            }
        })
    }, [])
    return (
        <Spin spinning={spinning}>
            <Tree
                checkable
                blockNode
                checkedKeys={checkedKeys}
                onCheck={onTreeCheck}
                checkStrictly={true}
            >
                {mapTreeNode(treeData)}
            </Tree>
        </Spin>  
    )
}

export default AuthTree
