import React, { useEffect, useState } from "react";
import {
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";
import Plotly from 'plotly.js';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@material-ui/core/Paper';
import {
    ArgumentAxis,
    ValueAxis,
    Chart,
    BarSeries,
    Title,
  } from '@devexpress/dx-react-chart-material-ui';
  import { Animation } from '@devexpress/dx-react-chart';
// Displays All Records or specific by reader
export function Dashboard(props) {
  const reader = props.match.params.reader;
  const [graphList, setGraphDetails] = useState({bookCount: null, popularBooks: null, bookDaily: [{argument: '', value: 0}], stats: null});
  const [filter, setFilter] = useState();
  const baseURL2 = 'server/api/analysis/books-issued';
  const baseURL3 = 'server/api/analysis/stats'
  let url2 = `server/api/analysis/${reader}/books-issued`;
  let url3 = `server/api/analysis/${reader}/stats`;

  function displayGraph1(){
      
    if (graphList && graphList.bookDaily){
      
      return (
        <Paper>
            <Chart
            data={graphList.bookDaily}
            >
            <ArgumentAxis />
            <ValueAxis />
            <Title text="Books Issued per Day" />
            <BarSeries valueField="value" argumentField="argument" />
            <Animation />
            </Chart>
        </Paper>)
    }
  }

  function displayGraph2(){

    if(graphList && graphList.bookCount){
      
      return (
        <Paper>
            <Chart
                data={graphList.bookCount}
            >
                <ArgumentAxis />
                <ValueAxis />
                <Title text={filter ? `Most Issued Books For ${filter}` : "Most Issued Books"} />
                <BarSeries valueField="value" argumentField="argument" />
                <Animation />
            </Chart>
        </Paper>
      )
    }
  }


  function displayStats(){
    if(graphList && graphList.stats)
    return (
      <div class="row" style={{maxWidth: '1000px', maxHeight: '1000px', marginLeft:'10%'}}>
        {graphList.stats.books &&
        <div class="col-sm-6 col-md-3 col-6">
          <div class="info-box">
            <span class="info-box-icon bg-info elevation-1"><i class="fas fa-book"></i></span>
            <div>
              <span>Total Books: </span>
              <span>{graphList.stats.books}</span>
            </div>
          </div>
        </div>
        }
        <div class="col-sm-6 col-md-3 col-6">
          <div class="info-box mb-3">
            <span class="info-box-icon bg-danger elevation-1"><i class="far fa-money-bill-alt"></i></span>
            <div >
              <span>Total Fine Imposed: </span>
              <span>{graphList.stats.fine}</span>
            </div>
          </div>
        </div>            
        <div class="clearfix hidden-md-up"></div>
          <div class="col-sm-6 col-md-3 col-6">
            <div class="info-box mb-3">
              <span class="info-box-icon bg-success elevation-1"><i class="fas fa-shopping-cart"></i></span>
              <div>
                {localStorage.getItem('isStaff') &&
                <NavLink to = '/graphList'>
                  <span>Books Currently Issued: </span>
                </NavLink>
                }
                {!localStorage.getItem('isStaff') &&
                <NavLink to = {`/graphList/${localStorage.getItem('name')}`} >
                  <span>Books Currently Issued: </span>
                </NavLink>
                }
                <span>{graphList.stats.issue}</span>
              </div>
            </div>
          </div>
          {graphList.stats.books &&
          <div class="col-sm-6 col-md-3 col-6">
            <div class="info-box mb-3">
            <span class="info-box-icon bg-warning elevation-1"><i class="fas fa-users"></i></span>
            <div>
              <NavLink to="/usersList"><span>Normal Users: </span></NavLink>
              <span>{graphList.stats.user}</span>
            </div>
          </div>
        </div>
          }
      </div>
    );
    else
    return( 
        <div>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular"  />
        </div>
        )
  }


  function displayPopular(){
    if(graphList && graphList.popularBooks)
    return graphList.popularBooks.map((book)=>{
    return (
        <ListItem alignItems="flex-start">
        <ListItemAvatar>
            <Avatar alt="Remy Sharp" src={book.cover} />
        </ListItemAvatar>
        <NavLink to={`/bookDetails/${book.id}`} >
        <ListItemText
            primary={book.title}
            secondary={
            <React.Fragment>
                <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="text.primary"
                >
                by {book.author}
                </Typography>
            </React.Fragment>
            }
        />
        </NavLink>
        <Rating
                    value={book.avg_rating}
                    precision={0, .01}
                    readOnly
                    style={{'float': 'right'}}
                  />
        </ListItem>
    );
        })
    else
    return <div><Skeleton /><Skeleton /><Skeleton /></div>
        
  }
 function changeDate(event){
    setFilter(event.target.value)
 }
  useEffect(async() => {
    if (!reader || reader=='All'){
      url2 = baseURL2;
      url3 = baseURL3;
    }
    
    const bookGraph = await axios(url2, {params: {date: filter}});
    const stats = await axios(url3);
    setGraphDetails({ bookDaily: bookGraph.data.book_issued_daily, bookCount: bookGraph.data.book_issued_count, stats:stats.data, popularBooks: bookGraph.data.popular_books})
  }, [reader, filter])


  return (
    <div class='bookList'>
      <h1>Dashboard</h1>
      <hr/>
      <Box
        sx={{
            maxWidth: 500,
            height: 300,
            border: '1px solid blue',
            backgroundColor: 'lightblue',
            '&:hover': {
            opacity: [0.9, 0.8, 0.7],
            },
        }}
        >
        <h3>Stats</h3>
        <hr/>
        {displayStats()}
         
       </Box>
       <hr/>
       <List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
          <h3>Popular Books</h3>
          <hr/>
          {displayPopular()}
      </List>
      <hr/>
       
        {displayGraph1()}
        <hr/>
        <h3> Select Month For Most Issued Books </h3>
        <input
        type="date"
        class="form-control"
        name="published_on"
        value={filter}
        onChange={changeDate}
        />
      <hr/>
        {displayGraph2()}
    
    </div>
  )

  
}

  