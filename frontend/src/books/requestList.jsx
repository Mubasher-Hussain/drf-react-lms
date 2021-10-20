import React, { useEffect, useState } from "react";
import {
  useHistory,
  useLocation,
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";

import Table from "react-bootstrap/Table";
// Displays All Requests or specific by reader
export function RequestsList(props) {
  const reader = props.match.params.reader;
  const [requestsList, setRequestsList] = useState();
  const history = useHistory();
  const location = useLocation();
  const baseURL = '../server/api/requests';
  const status = props.match.params.status;
  let url = `../server/api/${reader}/requests`;

  function displayList(filter){     
    if (requestsList && requestsList.length){
      return requestsList.map((request)=>{
        return(         
          <tr>
            <td><NavLink to={'/requestsList/' + request.reader} >{request.reader}</NavLink></td>
            <td className='title'>{request.book.title}</td>
            <td><img style={{width: 175, height: 175}} className='tc br3' alt='none' src={ request.book.cover } /></td>
            <td >{request.issue_period_weeks} week</td>
            <td>{request.status}</td>
            {localStorage.getItem('isStaff') && (request.status=='pending') && (
            <td>
              <p>
                <button
                  className='btn'
                  onClick={() => 
                    axios
                    .post(`server/api/records/create`, {'reader': request.reader, 'book': request.book.title, 'issue_period_weeks': request.issue_period_weeks})
                    .then(res => {
                      props.createNotification(`Book '${request.book.title}' Successfully Issued For User '${request.reader}'. See Record List to return book.`, 'success');
                      history.push('/');
                      history.goBack(); 
                    })
                    .catch((error) => {
                      props.createNotification(error.message, 'error')
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
                    props.createNotification(`Issue Request for book '${request.book}' by User '${request.reader}' Rejected`, 'success');
                    history.push('/')
                    history.goBack(); 
                  })
                  .catch((error) => {
                    props.createNotification(error.message, 'error')
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

  function fetchRequest(command){
    if(!status){
      history.push(`${location.pathname}/${command}`);
    }
    else if(status!=command){
      history.push(`./${command}`)
    }
  }

  useEffect(() => {
    if (!reader || reader=='All'){
      url = baseURL;
    }
    if (status){
      url += `/${status}`
    }
    axios
    .get(url)
    .then(res => {
      setRequestsList(res.data);
    })
    .catch( (error) => props.createNotification(error.message, 'error'))  
  }, [reader, status])
  
  return (
    <div class='bookList'>
      <h1>{reader} Requests List</h1>
      <button 
        class="btn"
        onClick={() => fetchRequest('pending') }
      >
        Pending
      </button>
      <button 
        class="btn"
        onClick={() => fetchRequest('accepted') }
      >
        Accepted
      </button>
      <button 
        class="btn"
        onClick={() => fetchRequest('rejected') }
      >
        Rejected
      </button>
      <hr/>
      <Table striped bordered hover>
          <thead>
            <tr>
              <th>Reader</th>
              <th>Book Title</th>
              <th>Book Cover</th>
              <th>Requested Issue Period</th>
              <th>Status</th>
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
  