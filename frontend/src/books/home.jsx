import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import axios from "../auth/axiosConfig";

import Carousel from "react-bootstrap/Carousel";
// Displays All Books or specific by author
export function Home(props) {
  const [categories, setCategories] = useState();

  function displayCategories(){     
    if (categories){
      return categories.map((cat)=>{
        return(
          <div style={{width: '25%', left: '50%', height: '490px', margin:'0 auto', marginBottom:'100px'}} className='border'>
            <h2 className='text-warning'>{cat}</h2>  
            <hr/>
            <Item category={cat}/>
          </div>
        )
    })}
  } 
 
  useEffect(() => {
    axios
    .get('../server/api/books/categories')
    .then(res => {
      setCategories(res.data.categories);
    })
    .catch( (error) => alert(error))  
  }, [])
  
  return (
    <div class='home'>
      <Carousel fade>
        <Carousel.Item interval={1000}>
            <img
            className="d-block w-100"
            src="https://wordpress.library-management.com/wp-content/uploads/2020/03/nlib_1-1.jpg"
            alt="First slide"
            />
            <Carousel.Caption>
            <h3>Library Management System</h3>
            </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item interval={500}>
            <img
            className="d-block w-100"
            src="https://wordpress.library-management.com/wp-content/uploads/2020/03/nlib_2-1.jpg"
            alt="Second slide"
            />

            <Carousel.Caption>
            <h3>Library Management System</h3>
            </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
      {displayCategories()}
    </div>
  )
}

function Item(props){
    const [books, setBooks] = useState();    
    
    useEffect(() => {
        axios
        .get(`../server/api/books/${props.category}`)
        .then(res => {
              setBooks(res.data)
            })
        .catch( (error) => alert(error))         
    }, [])

    function displayBooks(){     
      if (books && books.length)
        return books.map ((book, key) =>{
          return(
            <Carousel.Item interval={key*1000 + 1000}>
              <div >
                <img
                  className="d-block"
                  src={book.cover}
                  alt="First slide"
                  style={{height: '330px', width: '300px', border: '1px solid black', padding:'10px'}}
                />
                <h4>{book.title}</h4>
                <NavLink to={'/bookDetails/' + book.id} className="border border-secondary" ><img src="https://wordpress.library-management.com/wp-content/themes/library/img/eye.png" class="frnt_det_btn"/><span class="f_detail">Detail</span></NavLink>
              </div>
            </Carousel.Item>
          ) 
        })  
    }
    return(
        <Carousel style={{'height': '430px'}}>
          {displayBooks()}
        </Carousel>  
    )
}
  