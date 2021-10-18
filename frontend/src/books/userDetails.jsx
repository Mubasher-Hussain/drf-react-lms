import React, { useEffect, useState } from "react";
import {
  NavLink,
  useHistory,
} from "react-router-dom";

import axios from "../auth/axiosConfig";
import { useAuth } from "../auth"


// Display Details of User and its comments
export function UserDetails(props) {
  const pk = props.match.params.pk;
  const history = useHistory();
  const [logged] = useAuth();
  const [userDetails, setUserDetails] = useState({ user: null, fine: null});
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
    .then(res => {
      props.createNotification('User Deleted', 'success');
      history.goBack();
    })
    .catch( (error) => props.createNotification(error.message + '.Unauthorised', 'error'))
  }
  
  function displayDetail(){
    if (userDetails && userDetails.user){
      return (
        <div>
          <div class="col-md-12" style={{border: "1px solid black", marginBottom:'5px'}}>
            <h1>{userDetails.user.username}</h1>
            <hr/>
            <p style={{ textAlign: 'left' }}>Email: {userDetails.user.email}</p>
            <p style={{ textAlign: 'left' }}>Fine: {userDetails.fine}</p>
            <hr/>
            <div style={{textAlign: "left"}}>
              <span class="badge"><NavLink to={'/recordsList/' + userDetails.user.username} >Records</NavLink></span>
              <span class="badge"><NavLink to={'/requestsList/' + userDetails.user.username} >Requests</NavLink></span>
            </div>  
            <hr/>
          </div>  
          {localStorage.getItem('isStaff') && (
            <p>
              <button type="button" className="btn" onClick={deleteUser}>
              Delete
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
