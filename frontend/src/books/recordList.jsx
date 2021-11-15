import React, { useEffect, useState } from "react";
import {
  useHistory,
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";

import Table from "react-bootstrap/Table";
import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";

// Displays All Records or specific by reader
export function RecordsList(props) {
  const reader = props.match.params.reader;
  const [recordsList, setRecordsList] = useState();
  const history = useHistory();
  const baseURL = '../server/api/records';
  const status = props.match.params.status;
  const dispatch = useDispatch();
  let url = `../server/api/${reader}/records`;
  
  function displayList(filter){     
    if (recordsList && recordsList.length){
      return recordsList.map((record)=>{
        var deadline_issue = new Date(record.issue_date)
        var classVar = "";
        deadline_issue.setDate(deadline_issue.getDate() + record.issue_period_weeks * 7)
        deadline_issue = deadline_issue.toString()
        
        if(!localStorage.getItem('isStaff') && localStorage.getItem('name')){
          if (new Date() > new Date(deadline_issue) && !record.return_date){
            dispatch(createNotification([`You have missed deadline for returning book "${record.book.title}". Please return it`, 'warning']));
            classVar = "text-danger";
          }
          else if (new Date(deadline_issue).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) && !record.return_date){
            dispatch(createNotification([`Deadline for issued book "${record.book.title}" is today. Please return it`, 'warning']));
            classVar = "text-warning";
          }
          if (record.fine > 0 && record.fine_status !== 'paid'){
            dispatch(createNotification([`You have pending fine for late returning "${record.book.title}". Please pay it`, 'error']));
            classVar = "bg-warning";  
          }
        }

        return(         
          <tr class={classVar}>
            <td><NavLink to={'/recordsList/' + record.reader} >{record.reader}</NavLink></td>
            <td className='title'>{record.book.title}</td>
            <td><img style={{width: 175, height: 175}} className='tc br3' alt='none' src={ record.book.cover } /></td>
            <td>{new Date(record.issue_date).toString()}</td>
            <td className='deadline'>{deadline_issue}</td>
            {record.return_date &&
              <td className='return'>{new Date(record.return_date).toString()}</td>
            }
            {!record.return_date &&
              <td className='notReturn'>Not Returned</td>
            }
            <td>{record.fine}</td>
            <td className='fine-status'>{record.fine_status}</td>
            {localStorage.getItem('isStaff') && !record.return_date && (
            <p>
              <button
                class="btn btn-rounded btn-brown"
                style={{fontSize: '13px'}}
                onClick={() => {
                  var date =new Date();
                  date = date.toLocaleString('en-US', {timeZone : 'Asia/Karachi'});
                  date = new Date(date)
                  axios
                  .patch(`server/api/record/${record.id}/return-book`,
                    {'return_date': date},
                    )
                  .then(res => {
                    dispatch(createNotification([`Book '${record.book.title}' Successfully Returned For User '${record.reader}'. See Record List to return book.`, 'success']));
                    history.push('/');
                    history.goBack(); 
                  })
                  .catch((error) => {
                    dispatch(createNotification([error.message, 'error']))
                  })
                }}
              >
                <i class="fas fa-redo pr-2" aria-hidden="true"></i>
                Return Book
              </button>
            </p>
            )}
            {localStorage.getItem('isStaff') && record.fine>0 && record.fine_status==='pending' && (
            <p>
              <button
                className='btn far fa-money-bill-alt'
                onClick={() => {
                  axios
                  .patch(`server/api/record/${record.id}/pay-fine`,
                    {'fine_status': 'paid'},
                    )
                  .then(res => {
                    dispatch(createNotification([`Fine for Book '${record.book.title}' Successfully Paid For User '${record.reader}'.`, 'success']));
                    history.push('/');
                    history.goBack(); 
                  })
                  .catch((error) => {
                    dispatch(createNotification([error.message, 'error']))
                  })
                }}
              >
                Pay Fine
              </button>
              
            </p>
            )}
          </tr>            
        )
    })}
  }

  function filter (event) {
    let item = event.target.value;
    var titles;
    if (item==='overdue'){
      titles = document.getElementsByClassName("deadline");
      for (var i=0 ; i<titles.length ;  i++){
        if (new Date(titles[i].textContent)< new Date() && titles[i].nextSibling.className === 'notReturn'){
          titles[i].parentElement.style.display = ""
        }
        else
          titles[i].parentElement.style.display = "none"  
      }
    }
    else if (item==='pending'){
      titles = document.getElementsByClassName("deadline");
      for (var i=0 ; i<titles.length ;  i++){
        if (titles[i].nextSibling.className === 'return'){
          titles[i].parentElement.style.display = "none"
        }
        else
          titles[i].parentElement.style.display = ""  
      }
    }
    else if (item==='returned'){
      titles = document.getElementsByClassName("deadline");
      for (var i=0 ; i<titles.length ;  i++){
        if (titles[i].nextSibling.className === 'notReturn'){
          titles[i].parentElement.style.display = "none"
        }
        else
          titles[i].parentElement.style.display = ""  
      }  
    }
    else if (item==='fine-pending'){
      titles = document.getElementsByClassName("fine-status");
      for (var i=0 ; i<titles.length ;  i++){
        if (titles[i].textContent !== 'pending'){
          titles[i].parentElement.style.display = "none"
        }
        else
          titles[i].parentElement.style.display = ""  
      }  
    }
    else if (item==='fine-paid'){
      titles = document.getElementsByClassName("fine-status");
      for (var i=0 ; i<titles.length ;  i++){
        if (titles[i].textContent !== 'paid'){
          titles[i].parentElement.style.display = "none"
        }
        else
          titles[i].parentElement.style.display = ""  
      } 
    }
    else if (item==='All'){
      titles = document.getElementsByTagName("tr");
      for (var i=0 ; i<titles.length ;  i++){
          titles[i].style.display = ""  
      } 
    }
  }

  useEffect(() => {
    if (!reader || reader==='All'){
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
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))
  }, [reader])
  
  return (
    <div class='bookList'>
      <h1>{reader} Records List</h1>
      <select class="form-select" onChange={filter.bind(this)} id="filter" aria-label="Default select example">
        <option value="All" selected>All</option>
        <option value='fine-pending'>Fine Pending</option>
        <option value='fine-paid'>Fine Paid</option>
        <option value='overdue'>Books Overdue</option>
        <option value='pending'>Books Pending</option>
        <option value='returned'>Books Returned</option>
      </select>
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
              <th>Fine Status</th>
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
  