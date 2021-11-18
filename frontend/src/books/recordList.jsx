import React, { useState, useMemo } from "react";
import {
  useHistory,
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";

import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";

import {TableContainer} from './'
import { Container } from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"

// Displays All Records or specific by reader
export function RecordsList(props) {
  const reader = props.match.params.reader;
  const [recordsList, setRecordsList] = useState([]);
  const [loading, setLoading] = useState(false)
  const [totalCount, setCount] = useState(10);
  const [totalPageCount, setTotalPageCount] = useState(0);
  
  const history = useHistory();
  const baseURL = '../server/api/records';
  const status = props.match.params.status;
  const dispatch = useDispatch();
  let url = `../server/api/${reader}/records`;
  const columns = useMemo(
    () => [
      {
        Header: "Reader",
        accessor: "reader",
        Filter: false,
        Cell: (props) => {
          return(
            <NavLink to={'/recordsList/' + props.row.original.reader} >{props.row.original.reader}</NavLink>
            );
          }
      },
      {
        Header: "Title",
        accessor: "book.title",
        Filter: false,
        Cell: (props) => {
          return(
          <NavLink to={`/bookDetails/${props.row.original.book.id}`}>{props.row.original.book.title}</NavLink>);
          }
      },
      {
        Header: "Cover",
        accessor: "book.cover",
        Filter: false,
        Cell: (props) => {
          return(
            <img style={{width: 175, height: 175}} className='tc br3' alt='No Pic found' src={ props.row.original.book.cover } />
            );
          }
      },
      {
        Header: "Issue Date",
        accessor: "issue_date",
        Filter: false,
        Cell: (props) => {
          
          return(
            <p>
            {new Date(props.row.original.issue_date).toString().substring(0,24)}
            </p>
            );
          }
      },
      {
        Header: "Deadline",
        accessor: "deadline",
        Filter: false,
        Cell: (props) => {
          var deadline_issue = new Date(props.row.original.issue_date)
        deadline_issue.setDate(deadline_issue.getDate() + props.row.original.issue_period_weeks * 7)
        deadline_issue = deadline_issue.toString().substring(0,24)
          return(
            <p>
            {deadline_issue}
            </p>
            );
          }
      },
      
      {
        Header: "Return Date",
        accessor: "return_date",
        Filter: false,
        Cell: (props) => {
          return(
            <div>
            {props.row.original.return_date &&
              <p className='return'>{new Date(props.row.original.return_date).toString().substring(0,24)}</p>
            }
            {!props.row.original.return_date &&
              <p className='notReturn'>Not Returned</p>
            }
            </div>
            );
          }
      },
      {
        Header: "Fine",
        accessor: "fine",
        Filter: false,
      },
      {
        Header: "Fine Status",
        accessor: "fine_status",
        Filter: false,
      },
      {
        Header: "Actions",
        accessor: "actions",
        Filter: false,
        Cell: (props) => {
          let record = props.row.original
          return(
            <div>
            {localStorage.getItem('isStaff') && !record.return_date && (
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
            
            )}
            {localStorage.getItem('isStaff') && record.fine>0 && record.fine_status==='pending' && (
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
              
            )}
            </div>
            );
          }
      },
    ],
    []
  )

  function fetchData({pageSize, pageIndex, sortBy, globalFilter}){
    setLoading(true)
    let ordering ;
    if (sortBy[0]){
      ordering = sortBy[0].desc ? '-': '';
      if(sortBy[0].id=='reader')
        ordering += 'reader__username'
      else
        ordering += sortBy[0].id
      ordering = ordering.replace('.', '__')
    }
    if (!reader || reader==='All'){
      url = baseURL;
    }
    if (status){
      url += `/${status}`
    }
    axios
    .get(url, {params: {page: pageIndex+1, search: globalFilter, ordering: ordering, page_size: pageSize}})
    .then(res => {
      setCount(res.data.total_pages);
      setRecordsList(res.data.results);
      setTotalPageCount(res.data.count)
      setLoading(false)
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))
  }

  return (
    <div class='bookList'>
      <h1>{reader} Records List</h1>
      <hr/>
      <Container>
        <TableContainer
          columns={columns}
          data={recordsList}
          fetchData={fetchData}
          loading={loading}
          pageCount={totalCount}
          totalPageCount={totalPageCount}
          filter_user={reader}
          filter_category={status}
        />
      </Container>
    </div>
  )
}
  