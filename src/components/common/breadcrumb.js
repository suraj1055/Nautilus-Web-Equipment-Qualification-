import React, { Fragment } from 'react';
import { useHistory } from 'react-router-dom';

const Breadcrumb = props => {

    const history = useHistory()

    return (
        <Fragment>
            <div className="d-flex">
                <div>
                    <span className="BreadCrum" onClick={() => history.push('/dashboard/mold')} style={{ fontSize: '18px', color: 'blue' }}> Molds </span>
                </div>
                <div>
                    <span className="BreadCrum" style={{ fontSize: '20px' }}> {">"} </span>
                </div>
                <div>
                    <span className="BreadCrum" style={{ fontSize: '18px' }}> Sessions </span>
                </div>
            </div>
        </Fragment>
    )
}

export default Breadcrumb
