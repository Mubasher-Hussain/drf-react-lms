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
    let form_data = new FormData();
    form_data.append('cover', bookData.cover, bookData.cover.name);
    form_data.append('title', bookData.title);
    form_data.append('summary', bookData.summary);
    form_data.append('author', bookData.author);
    form_data.append('published_on', bookData.published_on);
    axios
    .put(`server/api/book/${pk}/edit`, form_data)
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
  