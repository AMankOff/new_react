import React, {useEffect, useState } from 'react'
import { CSSTransition } from 'react-transition-group';

const FadeIn = ({ children }) => {
    let [inProp, setInProp] = useState(false)
    useEffect(() => {
        setInProp(true)
    }, [])
    return (
        <CSSTransition timeout={200} classNames="route-transiton" in={inProp}>
            {
                children
            }
        </CSSTransition>
    )
}

export default FadeIn
