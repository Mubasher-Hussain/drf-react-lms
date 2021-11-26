import React, { useEffect, useState } from "react";
import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";
import {
  NavLink,
  useHistory,
} from "react-router-dom";

import axios from "../auth/axiosConfig";


// Display Details of User and its comments
export function UserDetails(props) {
  const pk = props.match.params.pk;
  const history = useHistory();
  const dispatch = useDispatch();
  const [userDetails, setUserDetails] = useState({ user: null, fine: null});
  const [message, setMessage] = useState()
  useEffect(async() => {
    const userData = await axios(
      `server/api/user/${pk}`
    );
    setUserDetails({ user: userData.data.user, fine: userData.data.fine})
  }, [])
  
  function deleteUser(){
    let url = `server/api/user/${pk}/delete`;
    axios
    .delete(url)
    .then(() => {
      dispatch(createNotification(['User Deleted', 'success']));
      history.goBack();
    })
    .catch( (error) => dispatch(createNotification([error.message + '.Unauthorised', 'error'])))
  }
  function pushNotify(){
    axios
    .post('server/api/notify', {'recipient': userDetails.user.username, 'message': message})
    .then(res => {
      if (res.data.success){
        dispatch(createNotification([res.data.success, 'success']));
        history.push('/');
        history.goBack();
      }else      
        dispatch(createNotification([res.data.error, 'error']));
    })
    .catch( (error) => dispatch(createNotification([error.message + '.Unauthorised', 'error'])))
  }
  function handleChange(event){
    setMessage(event.target.value)
  }
  function displayDetail(){
    if (userDetails && userDetails.user){
      return (
        <div>
          <div className="col-md-12" style={{border: "1px solid black", marginBottom:'5px'}}>
            <h1>{userDetails.user.username}</h1>
            <hr/>
            <p style={{ textAlign: 'left' }}>Email: {userDetails.user.email}</p>
            <p style={{ textAlign: 'left' }}>Fine: {userDetails.fine}</p>
            <hr/>
            <div style={{textAlign: "left"}}>
              <span className="badge"><NavLink to={'/dashboard/' + userDetails.user.username} >Analysis</NavLink></span>
              <span className="badge"><NavLink to={'/recordsList/' + userDetails.user.username} >Records</NavLink></span>
              <span className="badge"><NavLink to={'/requestsList/' + userDetails.user.username} >Requests</NavLink></span>
            </div>  
            <hr/>
          </div>  
          {localStorage.getItem('isStaff') && (
            <p>
              <button type="button" className="btn-secondary" onClick={deleteUser}>
              Delete
              </button>
              <div className="form-group">
                <label style= {{float: 'left'}} htmlFor="notify">Push Notification</label>
                <textarea
                  className="form-control"
                  id="notify"
                  placeholder="Message"
                  value={message}
                  onChange={handleChange}
                />
              </div>
              <button type="button" className="btn-success" onClick={pushNotify}>
                Send Message
              </button>
              
            </p>
          )}
                  
        </div>
      )
    }
  }
  
  
  return (
    <div className="bookList">
      <div className='container'>
        { displayDetail()}
      </div>
    </div>
  )
}
