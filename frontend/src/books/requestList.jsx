import React, { useEffect, useState } from "react";
import {
  useHistory,
  useLocation,
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";
import SearchField from 'react-search-field';

import Table from "react-bootstrap/Table";
import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";
import Pagination from "@mui/material/Pagination"

// Displays All Requests or specific by reader
export function RequestsList(props) {
  const reader = props.match.params.reader;
  const [requestsList, setRequestsList] = useState();
  const [page, setPage] = useState(1);
  const [totalCount, setCount] = useState(10);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('');

  const handleChange = (event, value) => {
    setPage(value);
  };

  const history = useHistory();
  const location = useLocation();
  const baseURL = '../server/api/requests';
  const status = props.match.params.status;
  const dispatch = useDispatch()
  let url = `../server/api/${reader}/requests`;

  function displayList(filter){     
    if (requestsList && requestsList.length){
      return requestsList.map((request)=>{
        return(         
          <tr>
            <td><NavLink to={'/requestsList/' + request.reader} >{request.reader}</NavLink></td>
            <td className='title'>{request.book.title}</td>
            <td><img style={{width: 175, height: 175}} className='tc br3' alt='none' src={ request.book.cover } /></td>
            <td >{request.book.quantity}</td>
            <td >{request.issue_period_weeks} week</td>
            <td>{request.status}</td>
            {localStorage.getItem('isStaff') && (request.status==='pending') && (
            <td>
              <p>
                <button
                  className='btn'
                  onClick={() => 
                    axios
                    .post(`server/api/records/create`, {'reader': request.reader, 'book': request.book.title, 'issue_period_weeks': request.issue_period_weeks})
                    .then(res => {
                      dispatch(createNotification([`Book '${request.book.title}' Successfully Issued For User '${request.reader}'. See Record List to return book.`, 'success']));
                      history.push('/');
                      history.goBack(); 
                    })
                    .catch((error) => {
                      dispatch(createNotification([error.message+'. Book is currently unavailable right now', 'error']))
                    })
                  }
                >
                  Accept
                </button>
                <button
                className='btn'
                onClick={() => 
                  axios
                  .patch(`server/api/request/${request.id}/edit`, {'status': 'rejected'})
                  .then(res => {
                    dispatch(createNotification([`Issue Request for book '${request.book.title}' by User '${request.reader}' Rejected`, 'success']));
                    history.push('/')
                    history.goBack(); 
                  })
                  .catch((error) => {
                    dispatch(createNotification([error.message, 'error']))
                  })
                }>
                  Reject
                </button>
              </p>
            </td>
            )}
          </tr>            
        )
    })}
  }

  function filter2(event){
    let command = event.target.value ;
    setPage(1);
    if(!status){
      if (command!=='All')
        history.push(`${location.pathname}/${command}`);
    }
    else if(status!==command){
      if(command!=='All')
        history.push(`./${command}`);
      else
        history.push(`../${reader}`);  
    }
  }

  function filter(item){
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
    if (!reader || reader==='All'){
      url = baseURL;
    }
    if (status){
      url += `/${status}`
    }
    axios
    .get(url, {params: {page: page, search: search, ordering: ordering}})
    .then(res => {
      setCount(res.data.total_pages);
      setRequestsList(res.data.results);
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))
  }, [reader, page, status, search, ordering])
  
  return (
    <div class='bookList'>
      <h1>{reader} Requests List</h1>
      <SearchField 
        placeholder='e.g field1 field2 field3'
        onChange={filter}
      />
      <select class="form-select" onChange={filter2.bind(this)} id="filter" aria-label="Default select example">
        <option value="All" selected>All</option>
        <option value="pending">Pending</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>
      <hr/>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => orderBy('reader__username')}>Reader</th>
            <th onClick={() => orderBy('book__title')}>Book Title</th>
            <th>Book Cover</th>
            <th onClick={() => orderBy('book__quantity')}>Book Qty</th>
            <th onClick={() => orderBy('issue_period_weeks')}>Requested Issue Period</th>
            <th onClick={() => orderBy('status')}>Status</th>
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
  