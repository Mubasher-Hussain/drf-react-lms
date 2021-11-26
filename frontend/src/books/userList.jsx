import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import SearchField from 'react-search-field';

import axios from "../auth/axiosConfig";

import Table from "react-bootstrap/Table";
import Pagination from "@mui/material/Pagination"
import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";

// Displays All Users or specific by author
export function UsersList() {
  const [usersList, setUsersList] = useState();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalCount, setCount] = useState(10);
  const [ordering, setOrdering] = useState('');
  
  const handleChange = (event, value) => {
    setPage(value);
  };

  const url = '../server/api/users';
  const dispatch = useDispatch();
  function displayList(){     
    if (usersList && usersList.length){
      return usersList.map((user)=>{
        return(         
          <tr>
            <td>{user.id}</td>
            <td className='title'><NavLink to={'/userDetails/' + user.id} >{user.username}</NavLink></td>
            <td>{user.email}</td>
            <td>{user.is_active ? "Yes" : "No"}</td>
            <td>{new Date(user.date_joined).toString()}</td>
            <td>
              <span className="badge"><NavLink to={'/dashboard/' + user.username} >Analysis</NavLink></span>
              <span className="badge"><NavLink to={'/recordsList/' + user.username} >Records</NavLink></span>
              <span className="badge"><NavLink to={'/requestsList/' + user.username} >Requests</NavLink></span>
            </td>
          </tr>            
        )
    })}
  }

  function filter (item) {
    setCount(1)
    setSearch(item)
  }

  function switchOrdering(item){
    if (item.includes('-'))
      setOrdering(item.replace('-', ''))
    else
      setOrdering('-' + item)
  }

  function orderBy(item){
    if (ordering.includes(item))
      switchOrdering(ordering);
    else
      setOrdering(item);
  }
  
  useEffect(() => {  
    axios
    .get(url, {params: {page: page, search: search, ordering: ordering}})
    .then(res => {
      setCount(res.data.total_pages);
      setUsersList(res.data.results);
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))  
  }, [page, search, ordering])
  
  return (
    <div className='bookList'>
      <h1>Users List</h1>
      <SearchField 
        placeholder='e.g field1 field2 field3'
        onChange={filter}
      />
      <hr/>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={() => orderBy('id')}>ID</th>
              <th onClick={() => orderBy('username')}>Username</th>
              <th onClick={() => orderBy('email')}>Email</th>
              <th onClick={() => orderBy('is_active')}>Is Active</th>
              <th onClick={() => orderBy('date_joined')}>Joining Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayList()}
          </tbody>
        </Table>
        <Pagination count={totalCount} page={page} color="primary" onChange={handleChange}/>
    </div>
  )
}
  