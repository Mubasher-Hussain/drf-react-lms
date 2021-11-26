import React, { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";

import axios from "../auth/axiosConfig";

import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";

import {TableContainer} from './'
import { Container } from "reactstrap"
import {SelectColumnFilter} from "./selectFilter"
import Rating from '@mui/material/Rating';

import "bootstrap/dist/css/bootstrap.min.css"

// Displays All Books or specific by author
export function BooksList(props) {
  const author = props.match.params.author;
  const category = props.match.params.category;
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(false)
  const [totalCount, setCount] = useState(10);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const baseURL = '../server/api/books';
  let url = `../server/api/${author}/books`;
  const dispatch = useDispatch()

  const columns = useMemo(
    () => [
      {
        Header: "Id",
        accessor: "id",
        Filter: false,
      },
      {
        Header: "Cover",
        accessor: "cover",
        Filter: false,
        disableSortBy: true,
        Cell: (props) => {
          return(
            <img style={{width: 175, height: 175}} className='tc br3' alt='No Pic found' src={ props.row.original.cover } />
            );
          }
      },
      {
        Header: "Title",
        accessor: "title",
        Filter: false,
        Cell: (props) => {
          return(
          <NavLink to={`/bookDetails/${props.row.original.id}`}>{props.row.original.title}</NavLink>);
          }
      },
      {
        Header: "Author",
        accessor: "author",
        Filter: false,
        //Filter: SelectColumnFilter,
        //filter: 'includes',
        Cell: (props) => {
          return(
            <NavLink to={'/booksList/' + props.row.original.author} >{props.row.original.author}</NavLink>
            );
          }
      },
      {
        Header: "Category",
        accessor: "category",
        Filter: SelectColumnFilter,
        filter: 'includes',
        //disableSortBy: true,
        Cell: (props) => {
          return(
            <NavLink to={`/booksList/${author}/${props.row.original.category}`}>{props.row.original.category}</NavLink>
            );
          }
      },
      {
        Header: "Quantity",
        accessor: "quantity",
        Filter: false,
      },
      {
        Header: "Published On",
        accessor: "published_on",
        Filter: false,
      },
      {
        Header: "Rating",
        accessor: "avg_rating",
        Filter: false,
        Cell: (props) => {
          return(
            <Rating
              value={props.row.original.avg_rating}
              precision={0, .1}
              readOnly
            />
            );
          }
      },
    ],
    [author]
  )


  function fetchData({pageSize, pageIndex, sortBy, globalFilter, filters}){
    setLoading(true)
    let ordering, catFilter, authFilter ;

    for (let i=0 ; i<filters.length ; i++){
    if(filters[i] && filters[i].id=='category')
      catFilter = filters[i].value
    if(filters[i] && filters[i].id=='author')
      authFilter = filters[i].value
    }
    if (sortBy[0]){
      ordering = sortBy[0].desc ? '-': '';
      ordering += sortBy[0].id
    }
    if (authFilter){
      url = `../server/api/${authFilter}/books`;
    }
    else if (!author || author==='All'){
      url = baseURL;
    }
    if (catFilter){
      url+='/'+ catFilter
    }
    else if (category){
      url+='/'+ category
    }
    axios
    .get(url, {params: {page: pageIndex+1, search: globalFilter, ordering: ordering, page_size: pageSize}})
    .then(res => {
      setCount(res.data.total_pages);
      setBooksList(res.data.results);
      setTotalPageCount(res.data.count)
      setLoading(false)
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))
  }

  return (
    <div className='bookList'>
      <h1>Books Catalogue</h1>
        <Container>
          <TableContainer
            columns={columns}
            data={booksList}
            fetchData={fetchData}
            loading={loading}
            pageCount={totalCount}
            totalPageCount={totalPageCount}
            filter_user={author}
            filter_category={category}
          />
        </Container>
    </div>
  )
}
  