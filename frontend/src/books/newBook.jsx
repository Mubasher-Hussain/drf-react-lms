import React from "react";

import { useHistory } from "react-router-dom";

import axios from "../auth/axiosConfig";
import { BookFormat } from "./bookFormat";

// For creating new book
export function NewBook (props){
  const history = useHistory();
  function handleClick (blogData) {
    axios
    .post('server/api/books/create', blogData)
    .then(res => {
      props.createNotification('Book Created', 'success')
      history.goBack(); 
    })
    .catch((error) => {
      props.createNotification(error.message + '.Either Unauthorised or Empty Field', 'error')
    })
  
  }
  return (
    <BookFormat handleClick={handleClick}/>
  );
}
  