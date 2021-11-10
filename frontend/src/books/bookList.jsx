import React, { useEffect, useState, useMemo } from "react";
import { 
  useHistory,
  NavLink } from "react-router-dom";

import axios from "../auth/axiosConfig";

import {TableContainer} from './'
import { Container } from "reactstrap"
import {SelectColumnFilter} from "./selectFilter"
import "bootstrap/dist/css/bootstrap.min.css"

// Displays All Books or specific by author
export function BooksList(props) {
  const author = props.match.params.author;
  const [authorsList, setAuthorsList] = useState();
  const category = props.match.params.category;
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(false)
  const [totalCount, setCount] = useState(10);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const history = useHistory();
  const baseURL = '../server/api/books';
  let url = `../server/api/${author}/books`;


  const columns = useMemo(
    () => [
      {
        Header: "Id",
        accessor: "id",
        Filter: false,
      },
      {
        Header: "Cover",
        accessor: "cover",
        Filter: false,
        Cell: (props) => {
          return(
            <img style={{width: 175, height: 175}} className='tc br3' alt='No Pic found' src={ props.row.original.cover } />
            );
          }
      },
      {
        Header: "Title",
        accessor: "title",
        Filter: false,
        Cell: (props) => {
          return(
          <NavLink to={`/bookDetails/${props.row.original.id}`}>{props.row.original.title}</NavLink>);
          }
      },
      {
        Header: "Author",
        accessor: "author",
        Filter: SelectColumnFilter,
        filter: 'includes',
        Cell: (props) => {
          return(
            <NavLink to={'/booksList/' + props.row.original.author} >{props.row.original.author}</NavLink>
            );
          }
      },
      {
        Header: "Category",
        accessor: "category",
        Filter: SelectColumnFilter,
        filter: 'includes',
        //disableSortBy: true,
        Cell: (props) => {
          return(
            <NavLink to={`/booksList/${author}/${props.row.original.category}`}>{props.row.original.category}</NavLink>
            );
          }
      },
      {
        Header: "Quantity",
        accessor: "quantity",
        Filter: false,
      },
      {
        Header: "Published On",
        accessor: "published_on",
        Filter: false,
      },
    ],
    [author]
  )


  function filter2(event){
    let command = event.target.value ;
    if(author!==command){
      if(command!=='All')
        history.push(`./${command}`);
      else
        history.push(`./All`);  
    }
  }
 
  function displayAuthor(){
    if (authorsList && authorsList.length){
      return authorsList.map((author) => <option value={author.name}>{author.name}</option>)
    }
  }
  
  useEffect(async() => {
    const authorsData = await axios('../server/api/authors');
    setAuthorsList(authorsData.data)
  }, [author])

  function fetchData({pageSize, pageIndex, sortBy, globalFilter, filters}){
    setLoading(true)
    let ordering, catFilter, authFilter ;

    for (let i=0 ; i<filters.length ; i++){
    if(filters[i] && filters[i].id=='category')
      catFilter = filters[i].value
    if(filters[i] && filters[i].id=='author')
      authFilter = filters[i].value
    }
    if (sortBy[0]){
      ordering = sortBy[0].desc ? '-': '';
      ordering += sortBy[0].id
    }
    if (authFilter){
      url = `../server/api/${authFilter}/books`;
    }
    else if (!author || author==='All'){
      url = baseURL;
    }
    if (catFilter){
      url+='/'+ catFilter
    }
    else if (category){
      url+='/'+ category
    }
    axios
    .get(url, {params: {page: pageIndex+1, search: globalFilter, ordering: ordering, page_size: pageSize}})
    .then(res => {
      setCount(res.data.total_pages);
      setBooksList(res.data.results);
      setTotalPageCount(res.data.count)
      setLoading(false)
    })
    .catch( (error) => alert(error))
  }

  return (
    <div class='bookList '>
      <h1>{author} Books List</h1>
        <Container style={{ marginTop: 100 }}>
          <TableContainer
            columns={columns}
            data={booksList}
            fetchData={fetchData}
            loading={loading}
            pageCount={totalCount}
            totalPageCount={totalPageCount}
            filter_user={author}
            filter_category={category}
          />
        </Container>
    </div>
  )
}
  