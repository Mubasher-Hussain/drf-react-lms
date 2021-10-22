import React from "react";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";


import "./App.scss";
import { Login, Register } from "./login/index";
import { Home, BookDetails, BooksList, NewBook, EditBook, RequestsList, RecordsList, UserDetails, UsersList, Sidebar, Analysis } from "./books";

import NotificationSystem from 'react-notification-system';
 

const notificationSystem = React.createRef()


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogginActive: true,
      name: '',
    };
  }

  // Changes state to refresh page in case of changes like login or logout
  refresh() {
    this.setState({
      name: localStorage.getItem('name')
    });
  }

  // For animating register and login container via onclick
  changeState() {
    const { isLogginActive } = this.state;
    if (isLogginActive) {
      this.rightSide.classList.remove("right");
      this.rightSide.classList.add("left");
    } else {
      this.rightSide.classList.remove("left");
      this.rightSide.classList.add("right");
    }
    this.setState(prevState => ({ isLogginActive: !prevState.isLogginActive }));
  }

  createNotification(message, level, children=null){
    notificationSystem.current.addNotification({
      message: message,
      level: level,
      children: children
    });
  }

  render() {
    const { isLogginActive } = this.state;
    const current = isLogginActive ? "Register" : "Login";
    const currentActive = isLogginActive ? "login" : "register";
    
    return (
      <Router>
        <div className="App">
          <NotificationSystem ref={notificationSystem} />
          <Sidebar createNotification={this.createNotification} refresh={this.refresh.bind(this)}/>
          <Switch>
            <Route exact path='/'><Redirect to='/booksList'></Redirect></Route>
            <Route exact path="/booksList/:author?/:category?" component={BooksList}/>
            <Route exact path="/home" component={Home}/>
            <Route exact path="/usersList" component={UsersList}/>
            <Route
              exact path="/requestsList/:reader?/:status?"
              children={({match}) => (
                <RequestsList createNotification={this.createNotification} match={match} />
              )}
            />
            <Route
              exact path="/recordsList/:reader?/:status?"
              children={({match}) => (
                <RecordsList createNotification={this.createNotification} match={match} />
              )}
            />
            <Route
              exact path="/analysis/:reader?/:status?"
              children={({match}) => (
                <Analysis createNotification={this.createNotification} match={match} />
              )}
            />
            <Route
              exact path="/bookDetails/:pk"
              children={({match}) => (
                <BookDetails createNotification={this.createNotification} match={match} />
              )}
            />
            <Route
              exact path="/userDetails/:pk"
              children={({match}) => (
                <UserDetails createNotification={this.createNotification} match={match} />
              )}
            />
            <PrivateRoute
              path="/createBook"
              createNotification={this.createNotification}
              component={NewBook}
            />
            <PrivateRoute
              path="/editBook/:pk"
              createNotification={this.createNotification}
              component={EditBook} 
            />
            <Route path="/login">
              <div className="login">
                <div className="container" ref={ref => (this.container = ref)}>
                  {isLogginActive && (
                    <Login containerRef={ref => (this.current = ref)} createNotification={this.createNotification} refresh={this.refresh.bind(this)}
                    />
                  )}
                  {!isLogginActive && (
                    <Register containerRef={ref => (this.current = ref)} createNotification={this.createNotification} changeState={this.changeState.bind(this)} />
                  )}
                </div>
                <RightSide
                  current={current}
                  currentActive={currentActive}
                  containerRef={ref => (this.rightSide = ref)}
                  onClick={this.changeState.bind(this)}
                  isLogginActive={this.state.isLogginActive}
                />
              </div>
            </Route>

          </Switch>
          
      </div>
      
    </Router>
    );
  }
}


// Container for login and register tab
const RightSide = props => {
  let containerSide;
  if (props.isLogginActive) {
    containerSide = "left";
  } else {
    containerSide = "right";
  }
  return (

    <div
      className= {"right-side " + containerSide}
      ref={props.containerRef}
      onClick={props.onClick}
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
