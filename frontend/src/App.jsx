import React, {useEffect} from "react";
import { useSelector, useDispatch } from 'react-redux';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";

import { createNotification, changeState, setRef } from './reduxStore/appSlice'
import "./App.scss";
import { Activate, Login, Register, AddStaff, SetPass } from "./login/index";
import { BookDetails, BooksList, NewBook, EditBook, RequestsList, RecordsList, UserDetails, UsersList, Sidebar, Dashboard } from "./books";
import { InjectAxiosInterceptors } from "./auth/axiosConfig";

import NotificationSystem from 'react-notification-system';
import "bootstrap/dist/css/bootstrap.min.css"

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
      //dispatch(createNotification(['WebSocket open', 'success']));
      console.log('Websocket Open')
    };
    socketRef.onmessage = e => {
      dispatch(createNotification([e.data, 'warning']));
    };

    socketRef.onerror = () => {
      //dispatch(createNotification(['Error in socket', 'error']));
      console.log('Error in socket')
    };
    socketRef.onclose = () => {
      //dispatch(createNotification(['WebSocket Closed, Retrying', 'error']));
      console.log('Socket closed')
      if(localStorage.getItem('access_token'))
        connect();
    };
  }

  const current = isLogginActive ? "Register" : "Login";
  const currentActive = isLogginActive ? "login" : "register";

  return (
    <Router>
      <div className="App">
        <InjectAxiosInterceptors />
        <NotificationSystem ref={notificationSystem} />
        <Sidebar createNotification={createNotification}/>
        <Switch>
          <Route exact path='/'><Redirect to='/booksList/All'></Redirect></Route>
          <Route exact path="/booksList/:author?/:category?" component={BooksList}/>
          <Route exact path="/addStaff" component={AddStaff}/>
          <Route exact path="/setPassword" component={SetPass}/>
          <Route exact path="/activateAccount" component={Activate}/>
          <Route exact path="/usersList" component={UsersList}/>
          <Route
            exact path="/requestsList/:reader?/:status?"
            children={({match}) => (
              <RequestsList match={match} />
            )}
          />
          <Route
            exact path="/recordsList/:reader?/:status?"
            children={({match}) => (
              <RecordsList match={match} />
            )}
          />
          <Route
            exact path="/dashboard/:reader?/:status?"
            children={({match}) => (
              <Dashboard match={match} />
            )}
          />
          <Route
            exact path="/bookDetails/:pk"
            children={({match}) => (
              <BookDetails match={match} />
            )}
          />
          <Route
            exact path="/userDetails/:pk"
            children={({match}) => (
              <UserDetails match={match} />
            )}
          />
          <PrivateRoute
            path="/createBook"
            component={NewBook}
          />
          <PrivateRoute
            path="/editBook/:pk"
            component={EditBook} 
          />
          <Route path="/login">
            <div className="login">
              <div className="container">
                {isLogginActive && (
                  <Login 
                  />
                )}
                {!isLogginActive && (
                  <Register   />
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
const PrivateRoute = ({ component: Component ,...rest }) => {
  const isStaff = localStorage.getItem('isStaff');
  return <Route {...rest} render={({match}) => (
      isStaff
        ? <Component match={match} />
        : <Redirect to='/login' />
    )} />
}


export default App;
