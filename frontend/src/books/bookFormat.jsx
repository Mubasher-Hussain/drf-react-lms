import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeState } from '../reduxStore/bookSlice'

// Title and summary field for creating or editing a book
export function BookFormat(props){
  const dispatch = useDispatch(); 
  const bookData = useSelector(state => state.book.bookData)
  function handleInputChange(event) {
    var bookDataT = {...bookData};
    if(event.target.name === 'cover')
      bookDataT[event.target.name] = event.target.files[0];
    else
      bookDataT[event.target.name] = event.target.value;
    dispatch(changeState(bookDataT))
  }
  
  return (
    <div className="container">
      <div class="form-group" >
        <label style= {{float: 'left'}} htmlFor="cover">Cover Photo</label>
        <input type="file"
          class="form-control"
          name="cover"
          placeholder="Cover Photo"
          onChange={handleInputChange.bind(this)}
          accept="image/png, image/jpeg"
          style={{fontSize: '16px'}}
        />
      </div>
      <div class="form-group" >
        <label style= {{float: 'left'}} htmlFor="title">Title</label>
        <input type="text"
          class="form-control"
          name="title"
          placeholder="Title"
          value={bookData.title}
          onChange={handleInputChange.bind(this)}
          style={{fontSize: '16px'}}
        />
      </div>
      <div class="form-group" >
        <label style= {{float: 'left'}} htmlFor="author">Author</label>
        <input type="text"
          class="form-control"
          name="author"
          placeholder="Author"
          value={bookData.author}
          onChange={handleInputChange.bind(this)}
          style={{fontSize: '16px'}}
        />
      </div>
      <div class="form-group" >
        <label style= {{float: 'left'}} htmlFor="category">Category</label>
        <input type="text"
          class="form-control"
          name="category"
          placeholder="Category"
          value={bookData.category}
          onChange={handleInputChange.bind(this)}
          style={{fontSize: '16px'}}
        />
      </div>
      <div class="form-group" >
        <label style= {{float: 'left'}} htmlFor="quantity">Quantity</label>
        <input type="number"
          step="1"
          class="form-control"
          name="quantity"
          placeholder="Quantity"
          value={bookData.quantity}
          onChange={handleInputChange.bind(this)}
          style={{fontSize: '16px'}}
        />
      </div>
      <label style= {{float: 'left'}} htmlFor="published_on">Publish Date:</label>
      <input
        type="date"
        class="form-control"
        name="published_on"
        value={bookData.published_on}
        onChange={handleInputChange.bind(this)}
      />
      <div class="form-group">
        <label style= {{float: 'left'}} htmlFor="summary">Summary</label>
        <textarea
          class="form-control"
          name="summary"
          placeholder="Summary"
          value={bookData.summary}
          onChange={handleInputChange.bind(this)}
          style={{minHeight: '200px', fontSize: '16px'}}
         />
      </div>
      <button type="button" className="btn" onClick={() => props.handleClick(bookData)}>
      Submit
      </button>
    </div>
    )
  
}

