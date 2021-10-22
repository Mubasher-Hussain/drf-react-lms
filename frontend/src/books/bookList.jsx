import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import SearchField from 'react-search-field';

import axios from "../auth/axiosConfig";

import Table from "react-bootstrap/Table";

// Displays All Books or specific by author
export function BooksList(props) {
  const author = props.match.params.author;
  const category = props.match.params.category;
  const [booksList, setBooksList] = useState();
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

  function search (item) {
    var titles = document.getElementsByClassName("title");
    for (var i=0 ; i<titles.length ;  i++){
      if (!titles[i].textContent.toUpperCase().match(item.toUpperCase())){
        titles[i].parentElement.style.display = "none"
      }
      else
        titles[i].parentElement.style.display = ""  
    }
  }
 
  useEffect(() => {
    if (!author || author=='All'){
      url = baseURL;
    }
    if (category){
      url+='/'+ category
    }
    axios
    .get(url)
    .then(res => {
      setBooksList(res.data);
    })
    .catch( (error) => alert(error))  
  }, [author, category])
  
  return (
    <div class='bookList'>
      <h1>{author} Books List</h1>
      <SearchField 
        placeholder='Search By Book Title'
        onChange={search}
      /><hr/>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Published Date</th>
            </tr>
          </thead>
          <tbody>
            {displayList()}
          </tbody>
        </Table>
    </div>
  )
}
  