import React, { Fragment } from "react";
import { MENUITEMS } from "../../../components/common/sidebar-component/menu";
import { Link } from "react-router-dom";
import logo from "../../../assets/images/Naut8.jpg";

const Sidebar = (props) => {
  
  const toggletNavActive = (item) => {
    if (!item.active) {
      MENUITEMS.forEach((a) => {
        if (MENUITEMS.includes(item)) a.active = false;
      });
    }
    item.active = !item.active;
  };

  return (
    <Fragment>
      <div className="page-sidebar">
        <div className="main-header-left d-none d-lg-block">
          <div className="text-center">
            {/* <h3 style={{ color: '#fff' }}> NAUTILUS </h3> */}

            <img src={logo} className="b-light" />
          </div>
        </div>
        <div className="sidebar custom-scrollbar">
          <ul
            className="sidebar-menu"
            id="myDIV"
            // style={{ width: '300px' }}
          >
            {MENUITEMS.map((menuItem, i) => (
              <li className={`${menuItem.active ? "active" : ""}`} key={i}>
                {menuItem.sidebartitle ? (
                  <div className="sidebar-title">
                    {menuItem.sidebartitle}
                    <span>{props.t(menuItem.title)}</span>
                  </div>
                ) : (
                  ""
                )}

                {menuItem.type === "sub" ? (
                  <a
                    className="sidebar-header"
                    href="#javascript"
                    onClick={() => toggletNavActive(menuItem)}
                    title={menuItem.title}
                  >
                    {/* <menuItem.icon /> */}
                    <img
                      src={menuItem.icon}
                      alt={`${menuItem.title} Icon`}
                      className="menu-icon"
                      style={{ width: "25px", height: "25px" }}
                    />
                    {/* <span>{props.t(menuItem.title)}</span> */}
                  </a>
                ) : (
                  ""
                )}

                {menuItem.type === "link" ? (
                  <Link
                    to={`${menuItem.path}`}
                    className={`sidebar-header ${
                      menuItem.active ? "active" : ""
                    }`}
                    onClick={() => toggletNavActive(menuItem)}
                    title={menuItem.title}
                  >
                    {/* <menuItem.icon /> */}
                    <img
                      src={menuItem.icon}
                      alt={`${menuItem.title} Icon`}
                      className="menu-icon"
                      style={{ width: "30px", height: "30px" }}
                    />
                    {/* <span>{props.t(menuItem.title)}</span> */}
                    {/* {menuItem.children ?
                                                <i className="fa fa-angle-right pull-right"></i> : ''} */}
                  </Link>
                ) : (
                  ""
                )}
              </li>
            ))}

            {/* {
                            MENUITEMS.map((menuItem, i) =>
                                <li className={`${menuItem.active ? 'active' : ''}`} key={i}>

                                    {(menuItem.sidebartitle) ?
                                        <div className="sidebar-title">{menuItem.sidebartitle}</div>
                                        : ''}

                                    {(menuItem.type === 'sub') ?
                                        <a className="sidebar-header" href="#javascript" onClick={() => toggletNavActive(menuItem)}>
                                            <menuItem.icon />
                                            <span>{props.t(menuItem.title)}</span>
                                        </a>
                                        : ''}

                                    {(menuItem.type === 'link') ?
                                        <Link
                                            to={`${menuItem.path}`}
                                            className={`sidebar-header ${menuItem.active ? 'active' : ''}`}

                                            onClick={() => toggletNavActive(menuItem)}
                                        >
                                            <menuItem.icon /><span>{props.t(menuItem.title)}</span>
                                            {menuItem.children ?
                                                <i className="fa fa-angle-right pull-right"></i> : ''}
                                        </Link>
                                        : ''}

                                    {menuItem.children ?
                                        <ul
                                            className={`sidebar-submenu ${menuItem.active ? 'menu-open' : ''}`}
                                            style={menuItem.active ? { opacity: 1, transition: 'opacity 500ms ease-in' } : {}}
                                        >
                                            {menuItem.children.map((childrenItem, index) =>
                                                <li key={index} className={childrenItem.children ? childrenItem.active ? 'active' : '' : ''}>
                                                    {(childrenItem.type === 'sub') ?
                                                        <a href="#javascript" onClick={() => toggletNavActive(childrenItem)} >
                                                            <i className="fa fa-circle"></i>{props.t(childrenItem.title)} <i className="fa fa-angle-right pull-right"></i></a>
                                                        : ''}

                                                    {(childrenItem.type === 'link') ?
                                                        <Link
                                                            to={`${process.env.PUBLIC_URL}${childrenItem.path}`}
                                                            className={childrenItem.active ? 'active' : ''}
                                                            onClick={() => toggletNavActive(childrenItem)}
                                                        >
                                                            <i className="fa fa-circle"></i>{props.t(childrenItem.title)} </Link>
                                                        : ''}
                                                    {childrenItem.children ?
                                                        <ul className={`sidebar-submenu ${childrenItem.active ? 'menu-open' : 'active'}`}>
                                                            {childrenItem.children.map((childrenSubItem, key) =>
                                                                <li className={childrenSubItem.active ? 'active' : ''} key={key}>
                                                                    {(childrenSubItem.type === 'link') ?
                                                                        <Link
                                                                            to={`${process.env.PUBLIC_URL}${childrenSubItem.path}`}
                                                                            className={childrenSubItem.active ? 'active' : ''}
                                                                            onClick={() => toggletNavActive(childrenSubItem)}
                                                                        >
                                                                            <i  className="fa fa-circle"></i>{props.t(childrenSubItem.title)}</Link>
                                                                        : ''}
                                                                </li>

                                                            )}
                                                        

                                                        </ul>
                                                        : ''}
                                                </li>
                                            )}
                                        </ul>
                                        : ''}

                                </li>
                            )
                        } */}
          </ul>
        </div>
      </div>
    </Fragment>
  );
};

export default Sidebar
