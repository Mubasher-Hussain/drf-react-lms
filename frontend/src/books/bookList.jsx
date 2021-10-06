import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import axios from "../auth/axiosConfig";


// Displays All Books or specific by author
export function BooksList({match}) {
  const author = match.params.author;
  const [booksList, setBooksList] = useState();
  const baseURL = 'server/api/books';
  let url = `server/api/${author}/books`;
  
  function displayList(){
      
    if (booksList && booksList.length){
      return booksList.map((book)=>{
        return(         
          <div class="col-md-12">
            <h2><NavLink to={'../bookDetails/' + book.id} >{book.title}</NavLink></h2>
            <p style={{ textAlign: 'left' }}>{book.summary.substring(0,50)}{book.summary.length>50 &&('........')}</p>
            <div style={{textAlign: "left"}}>
              <span class="badge">Published On: {book.published_on}</span>
              <div class="pull-right">
                <span class="label label-default">Author: <NavLink to={'../booksList/' + book.author} >{book.author}</NavLink></span>
              </div>         
            </div>    
            <hr/>
          </div>            
        )
    })}
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
      <h1>{author} Books List</h1>
      <hr/>
        <div class='container'>
          { displayList() }
        </div>
    </div>
  )
}
  