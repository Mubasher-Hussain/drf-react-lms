import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { useHistory,  useLocation,} from 'react-router-dom';

import axios from "../auth/axiosConfig";
import { createNotification } from "../reduxStore/appSlice";
import TextField from '@mui/material/TextField';

const ValidEmailRegex = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);


export function AddStaff (props) {

  const [state, setState] = useState(
    {
      formData: {
        username: '',
        email: '',
      },
      error: {
        name: 'Please Enter Name',
        email: 'Enter email',
      },
      isFormValid: false,
    });
  const dispatch = useDispatch()
  
  // Updates state.error if any in form fields
  function handleInputChange(event) {
 
    let formData = state.formData;
    const {name, value} = event.target
    let error = state.error;
    formData[name] = value;
    switch(name){
      case 'username':
        error.name = value.length < 3
                ? 'Name should have at least 3 characters'
                : '';
        break;

      case 'email':
        error.email = !ValidEmailRegex.test(value)
                ? 'Invalid Email'
                : '';
        break;
      default:
        dispatch(createNotification([name,'warning']));
    }

    setState({
      formData: formData,
      error: error,
      isFormValid: !(error.name || error.email )
    });
  }

  return (
    <div className="base-container">
      <div className="header">Register</div>
      <div className="content">
        <div className="form" >
          <div className="container" style={{'background': '#81E9FE', display:'flex', flexDirection:'column'}}>
          <TextField
          required
          id="filled-required"
          name="username"
          className="form-data"
          label="Username"
          value={state.formData.username}
          variant="filled"
          onChange={handleInputChange.bind(this)}
        />
        <TextField
          required
          className="form-data"
          id="filled-required"
          name="email"
          label="Email"
          value={state.formData.email}
          variant="filled"
          onChange={handleInputChange.bind(this)}
        />
        </div>
        </div>
      </div>
      <div className="footer">
        <RegisterButton
        formData={state.formData}
        error={state.error}
        isFormValid={state.isFormValid}
        />
      </div>
      
    </div>
  )
}


function RegisterButton(props) {
  const history = useHistory();
  const location = useLocation()
  const dispatch = useDispatch();
  function handleClick(type) {
    if(!props.isFormValid){
      let errors = props.error;
      var errorValues = Object.keys(errors).map(function(key){
        return errors[key];
       });
      dispatch(createNotification ([errorValues.join('.'), 'error']));
      return null;
    }
    let formData = props.formData;
    var url ;
    url = 'librarian/';
    axios
    .post(`server/api/register/${url}`, formData)
    .then(res => {
      if (res.data.error){
        dispatch(createNotification([res.data.error, 'error']));
      }
      else 
      {
        dispatch(createNotification([res.data.success, 'success']));
        history.push('/');
        history.push('/login');
      }
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))    
  }

  return (
    <div>
      <button type="button" className="btn-primary" onClick={() => handleClick('staff')}>
        Add Staff
      </button>
    </div>
  );
}
