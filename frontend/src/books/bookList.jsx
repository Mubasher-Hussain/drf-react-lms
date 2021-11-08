import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import SearchField from 'react-search-field';

import axios from "../auth/axiosConfig";

import Table from "react-bootstrap/Table";
import Pagination from "@mui/material/Pagination"

// Displays All Books or specific by author
export function BooksList(props) {
  const author = props.match.params.author;
  const category = props.match.params.category;
  const [booksList, setBooksList] = useState();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalCount, setCount] = useState(10);
  const [ordering, setOrdering] = useState('');

  const handleChange = (event, value) => {
    setPage(value);
  };

  const baseURL = '../server/api/books';
  let url = `../server/api/${author}/books`;
  let categoryUrl = '/booksList';
  if (author)
    categoryUrl += '/' + author
  else
    categoryUrl += '/' + 'All'
  function displayList(filter){     
    if (booksList && booksList.length){
      return booksList.map((book)=>{
        return(         
          <tr>
            <td>{book.id}</td>
            <td><img style={{width: 175, height: 175}} className='tc br3' alt='none' src={ book.cover } /></td>
            <td className='title'><NavLink to={'/bookDetails/' + book.id} >{book.title}</NavLink></td>
            <td><NavLink to={'/booksList/' + book.author} >{book.author}</NavLink></td>
            <td><NavLink to={`${categoryUrl}/${book.category}`}>{book.category}</NavLink></td>
            <td >{book.quantity}</td>
            <td >{book.published_on}</td>
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
    if (!author || author==='All'){
      url = baseURL;
    }
    if (category){
      url+='/'+ category
    }
    axios
    .get(url, {params: {page: page, search: search, ordering: ordering}})
    .then(res => {
      setCount(res.data.total_pages);
      setBooksList(res.data.results);
    })
    .catch( (error) => alert(error))  
  }, [author, category, page, search, ordering])
  
  return (
    <div class='bookList '>
      <h1>{author} Books List</h1>
      <SearchField 
        placeholder='e.g field1 field2 field3'
        onChange={filter}
      /><hr/>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={() => orderBy('id')}>ID</th>
              <th>Cover</th>
              <th onClick={() => orderBy('title')}>Title</th>
              <th onClick={() => orderBy('author')}>Author</th>
              <th onClick={() => orderBy('category')}>Category</th>
              <th onClick={() => orderBy('quantity')}>Quantity</th>
              <th onClick={() => orderBy('published_on')}>Published Date</th>
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
  