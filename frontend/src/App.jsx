import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";

import { createNotification, changeState, setRef } from './reduxStore/appSlice'
import "./App.scss";
import { Login, Register } from "./login/index";
import { Home, BookDetails, BooksList, NewBook, EditBook, RequestsList, RecordsList, UserDetails, UsersList, Sidebar, Analysis } from "./books";

import NotificationSystem from 'react-notification-system';

const notificationSystem = React.createRef()
  

function App (){
  const isLogginActive = useSelector((state) => state.app.isLogginActive)
  const name = useSelector((state) => state.app.name)
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(setRef(notificationSystem))
  }, [notificationSystem])
  
  useEffect(() => {
    connect();
  }, [name])
  
  function connect(){
    var socketRef = new WebSocket('ws://localhost:8000/ws/chat' + "?token=" + localStorage.getItem('access_token'))
    socketRef.onopen = () => {
      dispatch(createNotification(['WebSocket open', 'success']));
    };
    socketRef.onmessage = e => {
      dispatch(createNotification([e.data, 'warning']));
    };

    socketRef.onerror = e => {
      dispatch(createNotification(['Error in socket', 'error']));
    };
    socketRef.onclose = () => {
      dispatch(createNotification(['WebSocket Closed, Retrying', 'error']));
      if(localStorage.getItem('access_token'))
        connect();
    };
  }

  const current = isLogginActive ? "Register" : "Login";
  const currentActive = isLogginActive ? "login" : "register";

  return (
    <Router>
      <div className="App">
        <NotificationSystem ref={notificationSystem} />
        <Sidebar createNotification={createNotification}/>
        <Switch>
          <Route exact path='/'><Redirect to='/booksList'></Redirect></Route>
          <Route exact path="/booksList/:author?/:category?" component={BooksList}/>
          <Route exact path="/home" component={Home}/>
          <Route exact path="/addStaff" component={Register}/>
          <Route exact path="/usersList" component={UsersList}/>
          <Route
            exact path="/requestsList/:reader?/:status?"
            children={({match}) => (
              <RequestsList createNotification={createNotification} match={match} />
            )}
          />
          <Route
            exact path="/recordsList/:reader?/:status?"
            children={({match}) => (
              <RecordsList createNotification={createNotification} match={match} />
            )}
          />
          <Route
            exact path="/analysis/:reader?/:status?"
            children={({match}) => (
              <Analysis createNotification={createNotification} match={match} />
            )}
          />
          <Route
            exact path="/bookDetails/:pk"
            children={({match}) => (
              <BookDetails createNotification={createNotification} match={match} />
            )}
          />
          <Route
            exact path="/userDetails/:pk"
            children={({match}) => (
              <UserDetails createNotification={createNotification} match={match} />
            )}
          />
          <PrivateRoute
            path="/createBook"
            createNotification={createNotification}
            component={NewBook}
          />
          <PrivateRoute
            path="/editBook/:pk"
            createNotification={createNotification}
            component={EditBook} 
          />
          <Route path="/login">
            <div className="login">
              <div className="container">
                {isLogginActive && (
                  <Login createNotification={createNotification}
                  />
                )}
                {!isLogginActive && (
                  <Register createNotification={createNotification}  />
                )}
              </div>
              <RightSide
                current={current}
                currentActive={currentActive}
                isLogginActive={isLogginActive}
              />
            </div>
          </Route>

        </Switch>
        
    </div>
  </Router>
  )
}


// Container for login and register tab
const RightSide = props => {
  let containerSide;
  const dispatch = useDispatch();
  if (props.isLogginActive) {
    containerSide = "left";
  } else {
    containerSide = "right";
  }
  return (

    <div
      className= {"right-side " + containerSide}
      onClick={() => dispatch(changeState())}
    >
      <div className="inner-container">
        <div className="text">{props.current}</div>
      </div>
    </div>
  );
};


// Reroutes to login page if non authorized user accesses certain elements
const PrivateRoute = ({ component: Component, createNotification=createNotification ,...rest }) => {
  const isStaff = localStorage.getItem('isStaff');
  return <Route {...rest} render={({match}) => (
      isStaff
        ? <Component createNotification={createNotification} match={match} />
        : <Redirect to='/login' />
    )} />
}


export default App;
