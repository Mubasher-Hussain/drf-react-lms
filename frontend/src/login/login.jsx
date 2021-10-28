import React,  { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { changeName, createNotification } from '../reduxStore/appSlice'
import axios from "../auth/axiosConfig";
import loginImg from "../login.svg";
import { login } from "../auth"
    
export function Login (props) {
  const [state, setState] = useState(
    {
      formData: {
        username: '',
        password: '',
      },
    });

  function handleInputChange(event) {
    let formData=state.formData;
    formData[event.target.name]=event.target.value;
    setState({
      formData: formData
    });
  }

  return (
    <div className="base-container">
      <div className="header">Login</div>
      <div className="content">
        <div className="image">
          <img src={loginImg} alt=''/>
        </div>
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
            <input type="Password"
            name="password"
            placeholder="Password"
            value={state.formData.password}
            onChange={handleInputChange.bind(this)}
            />
          </div>
        </div>
      </div>
      <div className="footer">
      <LoginButton formData={state.formData}/>
      </div>
    </div>
  )
}


function LoginButton(props) {
  const history = useHistory();
  const dispatch = useDispatch();
  function handleClick() {
    let formData = props.formData;
    axios
    .post('server/api/token/obtain/', formData)
    .then(res => {
      login(res);
      dispatch(createNotification(["Successfully logged in", 'success']));
      localStorage.setItem('isStaff', res.data.User=='staff' ? "True" : '');
      localStorage.setItem('name', formData.username);
      localStorage.setItem('id', res.data.id);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      axios.defaults.headers['Authorization'] = "JWT " + res.data.access;
      dispatch(changeName(localStorage.getItem('name')));
      history.push('../login');
      history.replace('../');
    })
    .catch((error) => {
      dispatch(createNotification([error.message+'. Incorrect username or password', 'error']))
    })
  }

  return (
    <button type="button" className="btn" onClick={handleClick}>
      Login
    </button>
  );
}
