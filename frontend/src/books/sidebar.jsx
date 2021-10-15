import React from 'react';

import {

  CDBSidebar,

  CDBSidebarContent,

  CDBSidebarFooter,

  CDBSidebarHeader,

  CDBSidebarMenu,

  CDBSidebarMenuItem,

} from 'cdbreact';

import { NavLink } from 'react-router-dom';



export const Sidebar = () => {

  return (

    <div

      style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}

    >

      <CDBSidebar textColor="#fff" backgroundColor="#333">

        <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>

          <a

            href="/"

            className="text-decoration-none"

            style={{ color: 'inherit' }}

          >

            Sidebar

          </a>

        </CDBSidebarHeader>

 

        <CDBSidebarContent className="sidebar-content">

          <CDBSidebarMenu>

            <NavLink exact to="/" activeClassName="activeClicked">

              <CDBSidebarMenuItem icon="columns">Dashboard</CDBSidebarMenuItem>

            </NavLink>

            <NavLink exact to="/booksList" activeClassName="activeClicked">

              <CDBSidebarMenuItem icon="table">Books List</CDBSidebarMenuItem>

            </NavLink>
            <NavLink exact to="/createBook" activeClassName="activeClicked">

              <CDBSidebarMenuItem icon="table">Add Book</CDBSidebarMenuItem>

            </NavLink>
            
            <NavLink exact to="/requestsList/All" activeClassName="activeClicked">

              <CDBSidebarMenuItem icon="table">Issue Requests</CDBSidebarMenuItem>

            </NavLink>
            <NavLink exact to="/recordsList" activeClassName="activeClicked">

              <CDBSidebarMenuItem icon="table">Issue Records</CDBSidebarMenuItem>

            </NavLink>
            <NavLink exact to="/usersList" activeClassName="activeClicked">

              <CDBSidebarMenuItem icon="user">Users</CDBSidebarMenuItem>

            </NavLink>

            <NavLink exact to="/analysis" activeClassName="activeClicked">

              <CDBSidebarMenuItem icon="chart-line">

                Analytics

              </CDBSidebarMenuItem>

            </NavLink>

 

            <NavLink

              exact

              to="/login"

              
              activeClassName="activeClicked"

            >

              <CDBSidebarMenuItem icon="exclamation-circle">

                Login/Signup

              </CDBSidebarMenuItem>

            </NavLink>

          </CDBSidebarMenu>

        </CDBSidebarContent>

 

        <CDBSidebarFooter style={{ textAlign: 'center' }}>

          <div

            style={{

              padding: '20px 5px',

            }}

          >

            Sidebar Footer

          </div>

        </CDBSidebarFooter>

      </CDBSidebar>

    </div>

  );

};

 