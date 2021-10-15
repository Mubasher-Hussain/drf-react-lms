import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import SearchField from 'react-search-field';

import axios from "../auth/axiosConfig";

import Table from "react-bootstrap/Table"
// Displays All Books or specific by author
export function BooksList({match}) {
  const author = match.params.author;
  const [booksList, setBooksList] = useState();
  const baseURL = 'server/api/books';
  let url = `server/api/${author}/books`;
  
  function displayList(filter){     
    if (booksList && booksList.length){
      return booksList.map((book)=>{
        return(         
          <tr>
            <td>{book.id}</td>
            <td><img style={{width: 175, height: 175}} className='tc br3' alt='none' src={ book.cover } /></td>
            <td className='title'><NavLink to={'/bookDetails/' + book.id} >{book.title}</NavLink></td>
            <td><NavLink to={'/booksList/' + book.author} >{book.author}</NavLink></td>
            <td >{book.published_on}</td>
          </tr>            
        )
    })}
  }

  function search (item) {
    var titles = document.getElementsByClassName("title");
    for (var i=0 ; i<titles.length ;  i++){
      if (!titles[i].textContent.match(item)){
        titles[i].parentElement.style.display = "none"
      }
      else
        titles[i].parentElement.style.display = ""  
    }
  }
 
  useEffect(() => {
    if (!author){
      url = baseURL;
    }
    axios
    .get(url)
    .then(res => {
      setBooksList(res.data);
    })
    .catch( (error) => alert(error))  
  }, [author])
  
  return (
    <div class='bookList'>
      <SearchField 
        placeholder='Search By Book Title'
        onChange={search}
      />
      <h1>{author} Books List</h1>
      <hr/>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
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
  