import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import SearchField from 'react-search-field';

import axios from "../auth/axiosConfig";

import Table from "react-bootstrap/Table";

// Displays All Users or specific by author
export function UsersList() {
  const [usersList, setUsersList] = useState();
  const url = 'server/api/users';

  function displayList(filter){     
    if (usersList && usersList.length){
      return usersList.map((user)=>{
        return(         
          <tr>
            <td>{user.id}</td>
            <td className='title'><NavLink to={'/userDetails/' + user.id} >{user.username}</NavLink></td>
            <td>{user.email}</td>
            <td>{user.date_joined}</td>
            <td>
              <span class="badge"><NavLink to={'/recordsList/' + user.username} >Records</NavLink></span>
              <span class="badge"><NavLink to={'/requestsList/' + user.username} >Requests</NavLink></span>
            </td>
          </tr>            
        )
    })}
  }

  function search (item) {
    var users = document.getElementsByTagName("h2");
    for (var i=0 ; i<users.length ;  i++){
      if (!users[i].textContent.match(item)){
        users[i].parentElement.style.display = "none"
      }
      else
        users[i].parentElement.style.display = "block"  
    }
  }
  
  useEffect(() => {  
    axios
    .get(url)
    .then(res => {
      setUsersList(res.data);
    })
    .catch( (error) => alert(error))  
  }, [])
  
  return (
    <div class='bookList'>
      <SearchField 
        placeholder='Search By Username'
        onChange={search}
      />
      <h1>Users List</h1>
      <hr/>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Joining Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayList()}
          </tbody>
        </Table>
    </div>
  )
}
  