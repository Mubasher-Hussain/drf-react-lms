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
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const labels = {
  0: 'Pathetic',
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
};

// Display Details of Book and its comments
export function BookDetails(props) {
  const pk = props.match.params.pk;
  const history = useHistory();
  const [logged] = useAuth();
  const [bookDetails, setBookDetails] = useState({ book: null, user_rating: null});
  const [hover, setHover] = useState(-1);
  const [newRating, setNewRating] = useState();
  const [issuePeriod, setIssuePeriod] = useState();

  const dispatch = useDispatch()
  useEffect(async() => {
    const bookData = await axios(
      `server/api/book/${pk}`
    );
    //alert(JSON.stringify(bookData))
    if (!localStorage.getItem('isStaff') && bookData.data.quantity==0)
      dispatch(createNotification(['Book is currently unavailable now. You can still request for issue but it will only be accepted when book is available', 'warning']))
    setNewRating(bookData.data.user_rating)
    setBookDetails({ book: bookData.data.book, user_rating: bookData.data.user_rating})
  }, [])
  
  function deleteBook(){
    let url = `server/api/book/${pk}/delete`;
    axios
    .delete(url)
    .then(() => {
      dispatch(createNotification(['Book Deleted', 'success']));
      history.goBack();
    })
    .catch( (error) => dispatch(createNotification([error.message + '.Either Unauthorised or Empty Field', 'error'])))
  }
  
  function handleChange(event){
    setIssuePeriod(event.target.value)
  }

  function rateBook(){
    let url = `server/api/book/updateRating`;
    let url2 = `server/api/book/createRating`;
    let baseURL = bookDetails.user_rating==null ? url2: url;
    let rating = newRating==null ? 0: newRating
    axios
    .post(baseURL, {rating: rating, book: bookDetails.book.title})
    .then(() => {
      dispatch(createNotification(['Book Rated', 'success']));
      history.push('/');
      history.goBack();
    })
    .catch((error) => dispatch(createNotification([error.message + '.Either Unauthorised or Empty Field', 'error'])))
  }
  
  function displayDetail(){
    if (bookDetails && bookDetails.book){
      return (
        <div>
          <div className="col-md-12" style={{ marginBottom:'5px', padding:'5px'}}>
            <div className="content">
              <figure className="t-cover">
                <img style={{width: 350, height: 400}} className='tc br3' alt='none' src={ bookDetails.book.cover } />
              </figure>
              <div className="metadata" style={{'marginLeft': '30px'}}>
                <h1 className="text-success">{bookDetails.book.title}</h1>
                <hr/>
                <div className="t-authors">Author: <NavLink to={'/booksList/' + bookDetails.book.author} >{bookDetails.book.author}</NavLink></div>
                <div className="t-release-date">Published On :{bookDetails.book.published_on}</div>
                <div >Quantity :{bookDetails.book.quantity}</div>
                <div id="titlePromo">
                  <hr/>
                  <hr/>
                  <p className='text-warning' style={{minHeight: '50px', textAlign: 'left', overflow: 'auto'}}>{bookDetails.book.summary}</p>
                  <hr/>
                </div>
                <div className="t-release-date">
                  Category :
                  <NavLink to={`/booksList/All/${bookDetails.book.category}`}>
                    {bookDetails.book.category}
                  </NavLink>
                </div>
                <hr />
                <Typography component="legend">Book Rating:</Typography>
                <Rating
                    value={bookDetails.book.avg_rating}
                    precision={0.25}
                    readOnly
                  />
                  <Box>({bookDetails.book.total_reviewers} Reviewers)</Box>
                <hr/>
                {!localStorage.getItem('isStaff') && localStorage.getItem('name') &&
                <Box>
                  <Typography component="legend">Your Rating:</Typography>
                  <Rating
                    name="hover-feedback"
                    value={newRating}
                    defaultValue={newRating}
                    precision={0.5}
                    onChange={(event, newValue) => {
                      setNewRating(newValue);
                    }}
                    onChangeActive={(event, newHover) => {
                      setHover(newHover);
                    }}
                  />
                  {newRating !== null && (
                    <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : newRating]}</Box>
                  )}
                  <button type="button" className="btn-primary" onClick={rateBook}>
                    Submit Rating
                  </button>
                </Box>
                }
                <hr/>
                <div className="controls">
                  {localStorage.getItem('isStaff') && (
                    <p>
                      <button className='btn-primary' onClick={() => {
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
                      <button type="button" className="btn-primary" onClick={deleteBook}>
                      Delete
                      </button>
                    </p>
                  )}
                  {logged && !localStorage.getItem('isStaff') && (
                    <div className="container">
                      <select className="form-select" id="issue-period" aria-label="Default select example" value={issuePeriod} onChange={handleChange}>
                        <option value="1" selected>1 Week</option>
                        <option value="2">2 Week</option>
                        <option value="4">4 Week</option>
                      </select>
                      <button
                        className='btn-primary'
                        onClick={() =>{
                          axios
                          .post('server/api/requests/create', {'book': bookDetails.book.title, 'issue_period_weeks':issuePeriod})
                          .then(() => {
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
                    </div>
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
    <div className="bookList">
      <div className='container border'>
        { displayDetail()}
      </div>
      
    </div>
  )
}
