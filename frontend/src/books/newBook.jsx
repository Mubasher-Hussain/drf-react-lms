import React from "react";

import { useHistory } from "react-router-dom";

import axios from "../auth/axiosConfig";
import { BookFormat } from "./bookFormat";
import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";

// For creating new book
export function NewBook (props){
  const history = useHistory();
  const dispatch = useDispatch();
  
  function handleClick (bookData) {
    let form_data = new FormData();
    if (bookData.cover && typeof(bookData.cover) !== 'string')
      form_data.append('cover', bookData.cover, bookData.cover.name);
    form_data.append('title', bookData.title);
    form_data.append('summary', bookData.summary);
    form_data.append('category', bookData.category);
    form_data.append('author', bookData.author);
    form_data.append('published_on', bookData.published_on);
    form_data.append('quantity', bookData.quantity);
    axios
    .post('server/api/books/create', form_data)
    .then(res => {
      dispatch(createNotification(['Book Created', 'success']))
      history.goBack(); 
    })
    .catch((error) => {
      dispatch(createNotification([error.message + '.Either Unauthorised or Empty Field', 'error']))
    })
  }

  return (
    <BookFormat handleClick={handleClick}/>
  );
}
  