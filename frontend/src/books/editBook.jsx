import React from "react";

import { useHistory, useLocation } from "react-router-dom";

import axios from "../auth/axiosConfig";
import { BookFormat } from "./bookFormat";


// For editing already created books
export  function EditBook (props){
  let pk = props.match.params.pk;
  const {query} = useLocation();
  const history = useHistory();
  function handleClick (bookData) {
    axios
    .put(`server/api/book/${pk}/edit`, bookData)
    .then(res => {
      props.createNotification('book Updated', 'success');
      history.goBack();
    })
    .catch( (error) => props.createNotification(error.message + '.Either Unauthorised or Empty Field', 'error')) 
  }
  return (
    <BookFormat handleClick={handleClick} bookData={query}/>
  );
}
  