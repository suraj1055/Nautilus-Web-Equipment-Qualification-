import React, { Fragment } from 'react';
import Header from './common/header-component/header';
import Sidebar from './common/sidebar-component/sidebar';
import '../assets/custom-stylesheet/header_style.css';
import './App.css';
import Loader from './common/loader';
import 'react-toastify/dist/ReactToastify.css';
import TonnageOptimization from "./TonnageOptimization/TonnageOptimization";



const App = () => {
  return (
    <div className="app-container">
      <TonnageOptimization />
    </div>
  );
};

export default App;
