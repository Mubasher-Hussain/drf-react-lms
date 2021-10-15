import React, { useEffect, useState } from "react";
import {
  NavLink,
  useHistory,
} from "react-router-dom";

import axios from "../auth/axiosConfig";
import { useAuth } from "../auth"


// Display Details of Book and its comments
export function BookDetails(props) {
  const pk = props.match.params.pk;
  const history = useHistory();
  const [logged] = useAuth();
  const [bookDetails, setBookDetails] = useState({ book: null});
  useEffect(async() => {
    const bookData = await axios(
      `server/api/book/${pk}`
    );
    
    setBookDetails({ book: bookData.data})
  
  }, [])
  
  function deleteBook(){
    let url = `server/api/book/${pk}/delete`;
    axios
    .delete(url)
    .then(res => {
      props.createNotification('Book Deleted', 'success');
      history.goBack();
    })
    .catch( (error) => props.createNotification(error.message + '.Either Unauthorised or Empty Field', 'error'))
  }
  
  function displayDetail(){
    if (bookDetails && bookDetails.book){
      return (
        <div>
          <div class="col-md-12" style={{border: "1px solid black", marginBottom:'5px'}}>
            <h1>{bookDetails.book.title}</h1>
            <div>
              <img style={{width: 175, height: 175}} className='tc br3' alt='none' src={ bookDetails.book.cover } />
            </div>
            <hr/>
            <p style={{minHeight: '100px', textAlign: 'left', overflow: 'auto'}}>{bookDetails.book.summary}</p>
            <hr/>
            <div style={{textAlign: "left"}}>
              <span class="badge" tyle={{float: 'left'}}>Published: {bookDetails.book.published_on}</span>
              <div class="pull-right">
                <span class="label label-default">Author: <NavLink to={'/booksList/' + bookDetails.book.author} >{bookDetails.book.author}</NavLink></span>
              </div>         
            </div>    
            <hr/>
          </div>  
          {localStorage.getItem('isStaff') && (
            <p>
              <button className='btn' onClick={() => 
                history.push({pathname: `/editBook/${pk}`,
                              query: {title: bookDetails.book.title,
                                      summary: bookDetails.book.summary,
                                      author: bookDetails.book.author,
                                      published_on: bookDetails.book.published_on}
                             })
                              }>
                Edit
              </button>
              <button type="button" className="btn" onClick={deleteBook}>
              Delete
              </button>
            </p>
          )}
          {logged && !localStorage.getItem('isStaff') && (
            <p>
              <button
                className='btn'
                onClick={() => 
                  axios
                  .post('server/api/requests/create', {'book': bookDetails.book.title})
                  .then(res => {
                    props.createNotification(`Issue Request for book ${bookDetails.book.title} Created`, 'success');
                    history.goBack(); 
                  })
                  .catch((error) => {
                    props.createNotification(error.message, 'error')
                  })
                }
              >
                Issue Request
              </button>
            </p>
          )}
                  
        </div>
      )
    }
  }
  
  
  return (
    <div class="bookList">
      <div class='container'>
        { displayDetail()}
      </div>

    </div>
  )
}
