import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { useHistory,  useLocation,} from 'react-router-dom';

import axios from "../auth/axiosConfig";
import { createNotification } from "../reduxStore/appSlice";
import TextField from '@mui/material/TextField';


export function SetPass () {

  const [state, setState] = useState(
    {
      formData: {
        password: '',
        password2: '',
        uid: '',
        token: '',
      },
      error: {
        pass: 'Enter pass',
        conpass: 'enter confirm pass',
      },
      isFormValid: false,
    });
  const location = useLocation()
  const dispatch = useDispatch()
  const params = new URLSearchParams(location.search)
  const uidb64 = params.get('uidb64')
  const token = params.get('token')
  
  useEffect(() => {
    let formData = state.formData;
    formData['uid'] = uidb64
    formData['token'] = token
    setState({
        formData: formData,
        error: state.error,
        isFormValid: state.isFormValid
    })
    
  }, [])
  // Updates state.error if any in form fields
  function handleInputChange(event) {
    let formData = state.formData;
    const {name, value} = event.target
    let error = state.error;
    formData[name] = value;
    switch(name){
        case 'password':
            error.pass = value.length < 7
                    ? 'Password should have at least 7 characters'
                    : '';
            break;

            case 'password2':
            error.conpass = value === formData.password
                    ? ''
                    : 'Confirm password does not match password';
            break;

            default:
            dispatch(createNotification([name,'warning']));
    }

    setState({
      formData: formData,
      error: error,
      isFormValid: !(error.pass || error.conpass )
    });
  }

  return (
    <div className="base-container">
      <div className="header">Password Setup</div>
      <div className="content">
        <div className="form" >
          <div className="container" style={{'background': '#81E9FE', display:'flex', flexDirection:'column'}}>
          <TextField
          required
          id="filled-required"
          name="password"
          className="form-data"
          label="Password"
          value={state.formData.password1}
          variant="filled"
          onChange={handleInputChange.bind(this)}
        />
        <TextField
          required
          className="form-data"
          id="filled-required"
          name="password2"
          label="Confirm Password"
          value={state.formData.password2}
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
  const dispatch = useDispatch();
  function handleClick() {
    if(!props.isFormValid){
      let errors = props.error;
      var errorValues = Object.keys(errors).map(function(key){
        return errors[key];
       });
      dispatch(createNotification ([errorValues.join('.'), 'error']));
      return null;
    }
    let formData = props.formData;
    axios
    .post(`server/api/set-password`, formData)
    .then(res => {
      if (res.data.error){
        dispatch(createNotification([res.data.error, 'error']));
      }
      else 
      {
        dispatch(createNotification(['Password setup', 'success']));
        history.push('/');
        history.push('/login');
      }
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))    
  }

  return (
    <div>
      <button type="button" className="btn-primary" onClick={() => handleClick('staff')}>
        Set Password
      </button>
    </div>
  );
}
