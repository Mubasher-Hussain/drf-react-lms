import React, { useEffect, useState } from "react";
import {
  useHistory,
  useLocation,
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";

import Table from "react-bootstrap/Table";
// Displays All Records or specific by reader
export function RecordsList(props) {
  const reader = props.match.params.reader;
  const [recordsList, setRecordsList] = useState();
  const history = useHistory();
  const location = useLocation();
  const baseURL = 'server/api/records';
  const status = props.match.params.status;
  let url = `server/api/${reader}/records`;
  
  function displayList(){
      
    if (recordsList && recordsList.length){
      return recordsList.map((record)=>{
        return(         
          <div class="col-md-12">
            <p style={{ textAlign: 'left' }}>Reader: <NavLink to={'/recordsList/' + record.reader} >{record.reader}</NavLink></p>
            <p style={{ textAlign: 'left' }}>Book: {record.book.title}</p>
            <p style={{ textAlign: 'left' }}>Fine: {record.fine}</p>
            <div style={{textAlign: "left"}}>
              <span class="badge" tyle={{float: 'left'}}>Issue Date: {record.issue_date}</span>
              <div class="pull-right">
                <span class="label label-default">Return Date: {record.return_date ? record.return_date : 'Not Returned'}</span>
              </div>         
            </div>
            <hr/>
          </div>            
        )
    })}
  }

  function displayList(filter){     
    if (recordsList && recordsList.length){
      return recordsList.map((record)=>{
        return(         
          <tr>
            <td><NavLink to={'/recordsList/' + record.reader} >{record.reader}</NavLink></td>
            <td className='title'>{record.book.title}</td>
            <td><img style={{width: 175, height: 175}} className='tc br3' alt='none' src={ record.book.cover } /></td>
            <td>{new Date(record.issue_date).toString()}</td>
            {record.return_date &&
              <td>{new Date(record.return_date).toString()}</td>
            }
            {!record.return_date &&
              <td>Not Returned</td>
            }
            <td>{record.fine}</td>
            {localStorage.getItem('isStaff') && !record.return_date && (
            <p>
              <button
                className='btn'
                onClick={() => {
                  var date =new Date();
                  date = date.toLocaleString('en-US', {timeZone : 'Asia/Karachi'});
                  date = new Date(date)
                  axios
                  .patch(`server/api/record/${record.id}/return-book`,
                    {'return_date': date},
                    )
                  .then(res => {
                    props.createNotification(`Book '${record.book.title}' Successfully Returned For User '${record.reader}'. See Record List to return book.`, 'success');
                    history.push('/');
                    history.goBack(); 
                  })
                  .catch((error) => {
                    props.createNotification(error.message, 'error')
                  })
                }}
              >
                Return Book
              </button>
            </p>
            )}
          </tr>            
        )
    })}
  }

  function fetchRecord(command){
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
      setRecordsList(res.data);
    })
    .catch( (error) => props.createNotification(error.message, 'error'))
  }, [reader, status])
  
  return (
    <div class='bookList'>
      <h1>{reader} Records List</h1>
      <hr/>
      <Table striped bordered hover>
          <thead>
            <tr>
              <th>Reader</th>
              <th>Book Title</th>
              <th>Book Cover</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Fine</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayList()}
          </tbody>
        </Table>
    </div>
  )
}
  