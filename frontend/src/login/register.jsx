import React from "react";

import { useHistory } from 'react-router-dom';

import axios from "../auth/axiosConfig";
import loginImg from "../login.svg";

const ValidEmailRegex = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);


export class Register extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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
    };
  }

  // Updates state.error if any in form fields
  handleInputChange(event) {
 
    let formData = this.state.formData;
    const {name, value} = event.target
    let error = this.state.error;
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
    }

    this.setState({
      formData: formData,
      error: error,
      isFormValid: !(error.name || error.email || error.pass || error.conpass)
    });
  }

  render() {
    return (
      <div className="base-container" ref={this.props.containerRef}>
        <div className="header">Register</div>
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
              <input type="text"
               name="email"
               placeholder="Email"
               value={this.state.formData.email}
               onChange={this.handleInputChange.bind(this)}
               />
            </div>
            <div className="form-group">
              <input type="password"
               name="password"
               placeholder="Password"
               value={this.state.formData.password}
               onChange={this.handleInputChange.bind(this)}
               />
            </div>
            <div className="form-group">
              <input type="password"
               name="password2"
               placeholder="Confirm Password"
               value={this.state.formData.password2}
               onChange={this.handleInputChange.bind(this)}
               />
            </div>
          </div>
        </div>
        <div className="footer">
          <RegisterButton
          createNotification={this.props.createNotification}
          formData={this.state.formData}
          error={this.state.error}
          isFormValid={this.state.isFormValid}
          changeState={this.props.changeState}
          />
        </div>
      </div>
    );
  }
}


function RegisterButton(props) {
  const history = useHistory();
  
  function handleClick(type) {
    if(!props.isFormValid){
      let errors = props.error;
      var errorValues = Object.keys(errors).map(function(key){
        return errors[key];
       });
      props.createNotification (errorValues.join('\n'), 'error');
      return null;
    }
    let formData = props.formData;
    delete(formData['password2']);
    if (type == 'reader')
      var url = 'reader/';
    else
      var url = 'librarian/';
    axios
    .post(`server/api/register/${url}`, formData)
    .then(res => {
      if (res.data.error){
        props.createNotification(res.data.error, 'error');
      }
      else{
        props.createNotification(res.data.success + '. Now Login', 'success');
        props.changeState();
        history.push('/');
        history.push('/login');
      }

    })    
  }

  return (
    <div>
      <button type="button" className="btn" onClick={() => handleClick('reader')}>
        Register as User
      </button>
      <button type="button" className="btn" onClick={() => handleClick('staff')}>
        Register as Staff
      </button>
    </div>
  );
}
