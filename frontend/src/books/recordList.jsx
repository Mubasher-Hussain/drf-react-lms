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
  
  function displayList(filter){     
    if (recordsList && recordsList.length){
      return recordsList.map((record)=>{
        var deadline_issue = new Date(record.issue_date)
        var classVar = "";
        deadline_issue.setDate(deadline_issue.getDate() + record.issue_period_weeks * 7)
        deadline_issue = deadline_issue.toString()
        
        if(!localStorage.getItem('isStaff')){
          if (new Date() > new Date(deadline_issue) && !record.return_date){
            props.createNotification(`You have missed deadline for returning book "${record.book.title}". Please return it`, 'warning');
            classVar = "text-danger";
          }
          else if (new Date(deadline_issue).setHours(0,0,0,0) == new Date().setHours(0,0,0,0) && !record.return_date){
            props.createNotification(`Deadline for issued book "${record.book.title}" is today. Please return it`, 'warning');
            classVar = "text-warning";
          }
          if (record.fine > 0){
            props.createNotification(`You have pending fine for late returning "${record.book.title}". Please pay it`, 'warning');
            classVar = "bg-warning";  
          }
        }

        return(         
          <tr class={classVar}>
            <td><NavLink to={'/recordsList/' + record.reader} >{record.reader}</NavLink></td>
            <td className='title'>{record.book.title}</td>
            <td><img style={{width: 175, height: 175}} className='tc br3' alt='none' src={ record.book.cover } /></td>
            <td>{new Date(record.issue_date).toString()}</td>
            <td>{deadline_issue}</td>
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
  }, [reader])
  
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
              <th>Deadline</th>
              <th>Returned Date</th>
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
  