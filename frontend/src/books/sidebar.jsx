import React from 'react';
import {  useSelector, useDispatch } from 'react-redux';
import {  changeName, createNotification } from '../reduxStore/appSlice'

import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';

import { NavLink, useHistory } from 'react-router-dom';

import axios from "../auth/axiosConfig";
import { logout, useAuth } from "../auth";
import "bootstrap/dist/css/bootstrap.min.css"


export function Sidebar (props) {
  const [logged] = useAuth();
  const isStaff = localStorage.getItem('isStaff');
  const history = useHistory();
  const dispatch = useDispatch();
  function serverLogout() {
    axios
    .post('server/api/logout/', {"refresh_token": localStorage.getItem("refresh_token")})
    .finally(() =>{
      logout();
      dispatch(createNotification(['Logged Out', 'success']));
      localStorage.removeItem('isStaff');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('name')
      localStorage.removeItem('id')
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      axios.defaults.headers['Authorization'] = null;
      dispatch(changeName());
      history.push('/login');
      history.push('/');
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
            {localStorage.getItem('name')}
            {!localStorage.getItem('name') && 'Sidebar'}
          </a>
        </CDBSidebarHeader>

        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <NavLink exact to="/home" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="columns">Home</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/dashboard" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="chart-line">Dashboard</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/booksList/All" activeClassName="activeClicked">
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
            
            <NavLink exact to="/recordsList/All" activeClassName="activeClicked">
              {isStaff &&
                <CDBSidebarMenuItem icon="table">Issued Records</CDBSidebarMenuItem>
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
            
            <NavLink exact to="/addStaff" activeClassName="activeClicked">
              {localStorage.getItem('isAdmin') &&
                <CDBSidebarMenuItem icon="exclamation-circle">
                  Add Staff
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
      </CDBSidebar>
    </div>
  );
};
