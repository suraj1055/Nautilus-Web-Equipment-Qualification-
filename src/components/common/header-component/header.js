import React, { useState, Fragment } from 'react';
import { AlignLeft } from 'react-feather';
import '../../../assets/custom-stylesheet/header_style.css';
import { connect } from 'react-redux';

const Header = ({ headerTitle }) => {

  const [sidebar, setSidebar] = useState(false);

  const openCloseSidebar = () => {

    if (sidebar) {

      setSidebar(!sidebar)
      document.querySelector(".page-main-header").classList.remove('open');
      document.querySelector(".page-sidebar").classList.remove('open');

    } else {

      setSidebar(!sidebar)
      document.querySelector(".page-main-header").classList.add('open');
      document.querySelector(".page-sidebar").classList.add('open');

    }

  }

  return (
    <Fragment>
      <div className="page-main-header">
        <div className="main-header-right row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          
          <div className="d-flex" style={{ flex: '1', justifyContent: 'center', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#fff', fontSize: '17px', fontWeight: '500' }}>
              {headerTitle || 'Equipment Qualification'}
            </h4>
          </div>

          <div style={{ flex: '0 0 auto', width: '50px' }}>
            {/* Placeholder for balance */}
          </div>
        </div>
      </div>
    </Fragment>
  )
};

const mapStateToProps = state => ({
  headerTitle: state.header.title
})

export default connect(mapStateToProps)(Header);
