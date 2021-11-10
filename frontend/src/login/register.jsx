import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { useHistory,  useLocation,} from 'react-router-dom';

import axios from "../auth/axiosConfig";
import loginImg from "../login.svg";
import { changeState, createNotification } from "../reduxStore/appSlice";

const ValidEmailRegex = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);


export function Register (props) {

  const [state, setState] = useState(
    {
      formData: {
        username: '',
        email: '',
        password: '',
        password2: '',
      },
      error: {
        name: 'Please Enter Name',
        email: 'Enter email',
        pass: 'Enter pass',
        conpass: 'enter confirm pass',
      },
      isFormValid: false,
    });
  const dispatch = useDispatch()
  const location = useLocation()
  
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
      isFormValid: !(error.name || error.email || error.pass || error.conpass)
    });
  }

  return (
    <div className="base-container">
      <div className="header">Register</div>
      <div className="content">
        {!location.pathname.includes('addStaff') &&
        <div className="image">
          <img src={loginImg} alt=''/>
        </div>
        }
        <div className="form">
          <div className="form-group">
            <input type="text"
              name="username"
              placeholder="Username"
              value={state.formData.username}
              onChange={handleInputChange.bind(this)}
              />
          </div>
          <div className="form-group">
            <input type="text"
              name="email"
              placeholder="Email"
              value={state.formData.email}
              onChange={handleInputChange.bind(this)}
              />
          </div>
          <div className="form-group">
            <input type="password"
              name="password"
              placeholder="Password"
              value={state.formData.password}
              onChange={handleInputChange.bind(this)}
              />
          </div>
          <div className="form-group">
            <input type="password"
              name="password2"
              placeholder="Confirm Password"
              value={state.formData.password2}
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
    delete(formData['password2']);
    var url ;
    if (type === 'reader')
      url = 'reader/';
    else
      url = 'librarian/';
    axios
    .post(`server/api/register/${url}`, formData)
    .then(res => {
      if (res.data.error){
        dispatch(createNotification([res.data.error, 'error']));
      }
      else if (localStorage.getItem('isAdmin')!='True')
      {
        dispatch(createNotification([res.data.success, 'success']));
        dispatch(changeState())
        history.push('/');
        history.push('/login');
      }
      else{
        dispatch(createNotification([res.data.success, 'success']));
        history.push('/');
        
      }
    })
    .catch( (error) => dispatch(createNotification([error.message, 'error'])))    
  }

  return (
    <div>
      {!(location.pathname.includes('addStaff')) && 
      <button type="button" className="btn" onClick={() => handleClick('reader')}>
        Register as User
      </button>
      }
      {location.pathname.includes('addStaff') &&
      <button type="button" className="btn" onClick={() => handleClick('staff')}>
        Add Staff
      </button>
      }
    </div>
  );
}
