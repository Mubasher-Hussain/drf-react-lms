import React from "react";

import { useHistory } from "react-router-dom";

import axios from "../auth/axiosConfig";
import { changeState } from "../reduxStore/bookSlice";
import { BookFormat } from "./bookFormat";
import { createNotification } from "../reduxStore/appSlice";
import { useDispatch } from "react-redux";


// For editing already created books
export  function EditBook (props){
  let pk = props.match.params.pk;
  const history = useHistory();
  const dispatch = useDispatch();
  function handleClick (bookData) {
    let form_data = new FormData();
    if (bookData && typeof(bookData.cover) !== 'string')
      form_data.append('cover', bookData.cover, bookData.cover.name);
    form_data.append('title', bookData.title);
    form_data.append('summary', bookData.summary);
    form_data.append('author', bookData.author);
    form_data.append('category', bookData.category);
    form_data.append('quantity', bookData.quantity);
    form_data.append('published_on', bookData.published_on);
    axios
    .put(`server/api/book/${pk}/edit`, form_data)
    .then(() => {
      dispatch(createNotification(['book Updated', 'success']));
      dispatch(changeState({}))
      history.goBack();
    })
    .catch( (error) => dispatch(createNotification([error.message + '.Either Unauthorised or Empty Field', 'error']))) 
  }
  return (
    <BookFormat handleClick={handleClick}/>
  );
}
  