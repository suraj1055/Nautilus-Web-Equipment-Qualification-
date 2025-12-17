import React, { Fragment } from 'react';
import Header from './common/header-component/header';
import Sidebar from './common/sidebar-component/sidebar';
import '../assets/custom-stylesheet/header_style.css';
import './App.css';
import Loader from './common/loader';
import 'react-toastify/dist/ReactToastify.css';

const App = (props) => {
    return (
        <Fragment>
            <Loader />
            <div className="page-wrapper">
                <div className="page-body-wrapper sidebar-icon">
                    <Header />
                    <Sidebar />
                    <div className="page-body">
                        {props.children}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default App;
