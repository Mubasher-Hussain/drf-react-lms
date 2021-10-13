import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import SearchField from 'react-search-field';

import axios from "../auth/axiosConfig";


// Displays All Users or specific by author
export function UsersList() {
  const [usersList, setUsersList] = useState();
  const url = 'server/api/users';

  function displayList(){     
    if (usersList && usersList.length){
      return usersList.map((user)=>{
        return(         
          <div class="col-md-12">
            <h2><NavLink to={'/userDetails/' + user.id} >{user.username}</NavLink></h2>
            <div style={{textAlign: "left"}}>
              <span class="badge"><NavLink to={'/recordsList/' + user.username} >Records</NavLink></span>
              <span class="badge"><NavLink to={'/requestsList/' + user.username} >Requests</NavLink></span>
            </div>    
            <hr/>
          </div>            
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
        <div class='container'>
          { displayList() }
        </div>
    </div>
  )
}
  