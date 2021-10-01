import React from "react";

import { useHistory } from 'react-router-dom';

import axios from "../auth/axiosConfig";
import loginImg from "../login.svg";
import { login } from "../auth"
    
export class Login extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        username: '',
        password: '',
      },
    };
  }

  handleInputChange(event) {
    let formData=this.state.formData;
    formData[event.target.name]=event.target.value;
    this.setState({
      formData: formData
    });
  }

  render() {
    return (

      <div className="base-container" ref={this.props.containerRef}>
        <div className="header">Login</div>
        <div className="content">
          <div className="image">
            <img src={loginImg} />
          </div>
          <div className="form">
            <div className="form-group">
              <input type="text"
               name="username"
               placeholder="Username"
               value={this.state.formData.username}
               onChange={this.handleInputChange.bind(this)}
               />
            </div>
            <div className="form-group">
              <input type="Password"
               name="password"
               placeholder="Password"
               value={this.state.formData.password}
               onChange={this.handleInputChange.bind(this)}
               />
            </div>
          </div>
        </div>
        <div className="footer">
          <LoginButton formData={this.state.formData} createNotification={this.props.createNotification} />
        </div>
      </div>
    );
  }
}


function LoginButton(props) {
  const history = useHistory();
  
  function handleClick() {
    let formData = props.formData;
    axios
    .post('server/api/login/', formData)
    .then(res => {
      if (!res.data.error){
        login(res);
        props.createNotification("Successfully logged in", 'success');
        localStorage.setItem('isStaff', res.data.Staff ? true : '');
        localStorage.setItem('name', formData.username);
        history.push('../booksList');
        history.go(0);
      }
      else{
        props.createNotification("Incorrect Username or password", 'error');
      }
    })
    
  }

  return (
    <button type="button" className="btn" onClick={handleClick}>
      Login
    </button>
  );
}
