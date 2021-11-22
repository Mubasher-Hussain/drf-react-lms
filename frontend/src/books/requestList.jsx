import React, { useEffect, useState, useMemo } from "react";
import {
  useHistory,
  useLocation,
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";

import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";
import {TableContainer} from './'
import { Container } from "reactstrap"
import {SelectColumnFilter} from "./selectFilter"
import "bootstrap/dist/css/bootstrap.min.css"


// Displays All Requests or specific by reader
export function RequestsList(props) {
  const reader = props.match.params.reader;
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(false)
  const [totalCount, setCount] = useState(10);
  const [totalPageCount, setTotalPageCount] = useState(0);
  
  const history = useHistory();
  const baseURL = '../server/api/requests';
  const dispatch = useDispatch()
  let url = `../server/api/${reader}/requests`;

  const columns = useMemo(
    () => [
      {
        Header: "Reader",
        accessor: "reader",
        Filter: false,
        Cell: (props) => {
          return(
            <NavLink to={'/requestsList/' + props.row.original.reader} >{props.row.original.reader}</NavLink>
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
        Filter: false,
        accessor: "book.cover",
        Cell: (props) => {
          return(
            <img style={{width: 175, height: 175}} className='tc br3' alt='No Pic found' src={ props.row.original.book.cover } />
            );
          }
      },
      {
        Header: "Quantity",
        Filter: false,
        accessor: "book.quantity",
      },
      {
        Header: "Issue Period",
        Filter: false,
        accessor: "issue_period_weeks",
      },
      
      {
        Header: "Status",
        accessor: "status",
        Filter: SelectColumnFilter,
        filter: 'includes',
        disableSortBy: true,
      },
      {
        Header: "Actions",
        Filter: false,
        accessor: "actions",
        Cell: (props) => {
          let request = props.row.original
          return(
            <div>
            {localStorage.getItem('isStaff') && (request.status==='pending') && (
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
            )}
            </div>
            );
          }
      },
    ],
    []
  )

  
  function fetchData({pageSize, pageIndex, sortBy, globalFilter, filters}){
    setLoading(true)
    let ordering, statusFilter, readerFilter ;
    for (let i=0 ; i<filters.length ; i++){
      if(filters[i] && filters[i].id=='status')
        statusFilter = filters[i].value
      if(filters[i] && filters[i].id=='reader')
        readerFilter = filters[i].value
      }
    
    if (sortBy[0]){
      ordering = sortBy[0].desc ? '-': '';  
      if(sortBy[0].id=='reader')
        ordering += 'reader__username'
      else
        ordering += sortBy[0].id
      ordering = ordering.replace('.', '__')
    }
    if (readerFilter){
      url = `../server/api/${readerFilter}/requests`;
    }
    else if (!reader || reader==='All'){
      url = baseURL;
    }
    if (statusFilter){
      url+='/'+ statusFilter
    }
    
    axios
    .get(url, {params: {page: pageIndex+1, search: globalFilter, ordering: ordering, page_size: pageSize}})
    .then(res => {
      setCount(res.data.total_pages);
      setRequestsList(res.data.results);
      setTotalPageCount(res.data.count)
      setLoading(false)
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))
  }

  return (
    <div class='bookList'>
     <h1>{reader} Requests List</h1>
      <hr/>
      <Container>
        <TableContainer
          columns={columns}
          data={requestsList}
          fetchData={fetchData}
          loading={loading}
          pageCount={totalCount}
          totalPageCount={totalPageCount}
          filter_user={reader}
        />
      </Container>
    </div>
  )
}
  