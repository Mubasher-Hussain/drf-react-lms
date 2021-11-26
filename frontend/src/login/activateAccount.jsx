import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useHistory,  useLocation,} from 'react-router-dom';

import axios from "../auth/axiosConfig";
import { createNotification } from "../reduxStore/appSlice";
import CircularProgress from '@mui/material/CircularProgress';

export function Activate () {

  const location = useLocation()
  const dispatch = useDispatch()
  const history = useHistory()
  const params = new URLSearchParams(location.search)
  const uidb64 = params.get('uidb64')
  const token = params.get('token')
  
  useEffect(() => {
    axios
    .get(`server/activate/${uidb64}/${token}`)
    .then(() => {
        dispatch(createNotification(['Account Activated. Now Login', 'success']));
        history.push('/');
        history.push('/login');
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))

  }, [])
  
  return (
    <div className="base-container">
      <div className="header">Account Activation In Progress ....</div>
      <div className="footer">
        <CircularProgress color='warning'/>
      </div>     
    </div>
  )
}

