import React, { useEffect, useState } from "react";
import {
  NavLink,
  useHistory,
} from "react-router-dom";

import axios from "../auth/axiosConfig";
import { useAuth } from "../auth"
import { changeState } from "../reduxStore/bookSlice";
import { useDispatch } from "react-redux";
import { createNotification } from "../reduxStore/appSlice";


// Display Details of Book and its comments
export function BookDetails(props) {
  const pk = props.match.params.pk;
  const history = useHistory();
  const [logged] = useAuth();
  const [bookDetails, setBookDetails] = useState({ book: null});
  const dispatch = useDispatch()
  useEffect(async() => {
    const bookData = await axios(
      `server/api/book/${pk}`
    );
    if (!localStorage.getItem('isStaff') && bookData.data.quantity==0)
      dispatch(createNotification(['Book is currently unavailable now. You can still request for issue but it will only be accepted when book is available', 'warning']))
    setBookDetails({ book: bookData.data})
  
  }, [])
  
  function deleteBook(){
    let url = `server/api/book/${pk}/delete`;
    axios
    .delete(url)
    .then(res => {
      dispatch(createNotification(['Book Deleted', 'success']));
      history.goBack();
    })
    .catch( (error) => dispatch(createNotification([error.message + '.Either Unauthorised or Empty Field', 'error'])))
  }
  
  function displayDetail(){
    if (bookDetails && bookDetails.book){
      return (
        <div>
          <div class="col-md-12" style={{ marginBottom:'5px', padding:'5px'}}>
            <div class="content">
              <figure class="t-cover">
                <img style={{width: 350, height: 400}} className='tc br3' alt='none' src={ bookDetails.book.cover } />
              </figure>
              <div class="metadata" style={{'marginLeft': '30px'}}>
                <h1 class="text-success">{bookDetails.book.title}</h1>
                <hr/>
                <div class="t-authors">Author: <NavLink to={'/booksList/' + bookDetails.book.author} >{bookDetails.book.author}</NavLink></div>
                <div class="t-release-date">Published On :{bookDetails.book.published_on}</div>
                <div >Quantity :{bookDetails.book.quantity}</div>
                <div id="titlePromo">
                  <hr/>
                  <hr/>
                  <p class='text-warning' style={{minHeight: '50px', textAlign: 'left', overflow: 'auto'}}>{bookDetails.book.summary}</p>
                  <hr/>
                </div>
                <div class="t-release-date">
                  Category :
                  <NavLink to={`/booksList/All/${bookDetails.book.category}`}>
                    {bookDetails.book.category}
                  </NavLink>
                </div>
                <hr />
                <div class="controls">
                  {localStorage.getItem('isStaff') && (
                    <p>
                      <button className='btn' onClick={() => {
                        dispatch(changeState({title: bookDetails.book.title,
                          summary: bookDetails.book.summary,
                          author: bookDetails.book.author,
                          cover: bookDetails.book.cover,
                          published_on: bookDetails.book.published_on,
                          category: bookDetails.book.category,
                          quantity: bookDetails.book.quantity}))
                        history.push(`/editBook/${pk}`)
                        
                      }
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
                        onClick={() =>{
                          axios
                          .post('server/api/requests/create', {'book': bookDetails.book.title, 'issue_period_weeks':document.getElementById("issue-period").value})
                          .then(res => {
                            dispatch(createNotification([`Issue Request for book ${bookDetails.book.title} Created`, 'success']));
                            history.goBack(); 
                          })
                          .catch((error) => {
                            dispatch(createNotification([error.message+'. You already have a pending request', 'error']))
                          })
                          }
                        }
                      >
                        Issue Request
                      </button>
                      <select class="form-select" id="issue-period" aria-label="Default select example">
                        <option value="1" selected>1 Week</option>
                        <option value="2">2 Week</option>
                        <option value="4">4 Month</option>
                      </select>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>     
        </div>
      )
    }
  }
  
  
  return (
    <div class="bookList">
      <div class='container border'>
        { displayDetail()}
      </div>
      
    </div>
  )
}
