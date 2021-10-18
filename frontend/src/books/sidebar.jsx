import React from 'react';

import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';

import { NavLink, useHistory } from 'react-router-dom';

import axios from "../auth/axiosConfig";
import { logout, useAuth } from "../auth";


export function Sidebar (props) {
  const [logged] = useAuth();
  const isStaff = localStorage.getItem('isStaff');
  const history = useHistory();
  
  function serverLogout() {
    axios
    .get('server/api/logout')
    .then(() =>{
      logout();
      props.createNotification('Logged Out', 'success');
      localStorage.setItem('isStaff', '');
      localStorage.setItem('name', '')
      localStorage.setItem('id', '')
      props.refresh();
      history.push('/login');
      history.replace('/');
      }); 
  }

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
              {isStaff &&
              <CDBSidebarMenuItem icon="table">Add Book</CDBSidebarMenuItem>
              }
            </NavLink>
            
            <NavLink exact to={"/requestsList/All"} activeClassName="activeClicked">
              {isStaff &&
                <CDBSidebarMenuItem icon="table">Issue Requests</CDBSidebarMenuItem>
              }
            </NavLink>
            
            <NavLink exact to="/recordsList" activeClassName="activeClicked">
              {isStaff &&
                <CDBSidebarMenuItem icon="table">Issue Records</CDBSidebarMenuItem>
              }
            </NavLink>

            <NavLink exact to="/usersList" activeClassName="activeClicked">
              {isStaff && 
                <CDBSidebarMenuItem icon="user">Users List</CDBSidebarMenuItem>
              }
            </NavLink>
            
            <NavLink exact to={`/userDetails/${localStorage.getItem('id')}`} activeClassName="activeClicked">
              {!isStaff && logged && 
                <CDBSidebarMenuItem icon="user">Profile</CDBSidebarMenuItem>
              }
            </NavLink>
            
            <NavLink exact to="/analysis" activeClassName="activeClicked">
              {isStaff && 
                <CDBSidebarMenuItem icon="chart-line">
                  Analytics
                </CDBSidebarMenuItem>
              }
            </NavLink> 

            <NavLink exact to={`/requestsList/${localStorage.getItem('name')}`} activeClassName="activeClicked">
              {!isStaff && logged &&
                <CDBSidebarMenuItem icon="table">My Issue Requests</CDBSidebarMenuItem>
              }
            </NavLink>
            
            <NavLink exact to={`/recordsList/${localStorage.getItem('name')}`} activeClassName="activeClicked">
              {!isStaff && logged &&
              <CDBSidebarMenuItem icon="table">My Issue Records</CDBSidebarMenuItem>
              }
            </NavLink>
            
            <NavLink exact to="/login" activeClassName="activeClicked">
              {!logged &&
                <CDBSidebarMenuItem icon="exclamation-circle">
                  Login/Signup
                </CDBSidebarMenuItem>
              }
            </NavLink>
            
            <p>
            {logged &&
              <CDBSidebarMenuItem icon="exclamation-circle" onClick={() => serverLogout()}>
                Logout
              </CDBSidebarMenuItem>
            }</p>
            
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
 