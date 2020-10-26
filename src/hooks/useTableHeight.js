import {useState, useEffect, useRef} from 'react'

const useTableHeight = () => {
    const tableRef = useRef({current: {clientHeight: 0}})
    const [tableHeight, setTableHeight] = useState(200)
    useEffect(() => {
        setTableHeight(tableRef.current.clientHeight - 120)
    }, [])
    return [tableRef, tableHeight]
}

export default useTableHeight
