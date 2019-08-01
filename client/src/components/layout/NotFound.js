import React, {Fragment } from 'react'

const NotFound = () => {
    return (
        <Fragment>
            <h1 className="x-large text-primary">
            <i className="fas fa-exclamation-triangle"></i>
            PAGE NOT FOUND</h1>
            <p className="large"> Sorry, this page does not exist.</p>
        </Fragment>
    )
}

export default NotFound
