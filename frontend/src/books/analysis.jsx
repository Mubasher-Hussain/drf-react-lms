import React, { useEffect, useState } from "react";
import {
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";
import Plotly from 'plotly.js';

// Displays All Records or specific by reader
export function Analysis(props) {
  const reader = props.match.params.reader;
  const [recordsList, setGraphDetails] = useState({records: null, bookGraph: null});
  const baseURL = 'server/api/records';
  const baseURL2 = 'server/api/analysis/books-issued';
  const baseURL3 = 'server/api/analysis/stats'
  const status = props.match.params.status;
  let url2 = `server/api/analysis/${reader}/books-issued`;
  let url = `server/api/${reader}/records`;
  let url3 = `server/api/analysis/${reader}/stats`;
  let graphData = {};

  function displayGraph1(){
      
    if (recordsList && recordsList.records){
      recordsList.records.map((record)=>{
        let issue_date = new Date(record.issue_date)
        let dateString = issue_date.toString()
        dateString = dateString.substring(0,16)
        if (dateString in graphData)
          graphData[dateString] += 1
        else
          graphData[dateString] = 1
    });
      var data = [
        {
          x: Object.keys(graphData),
          y: Object.values(graphData),
          type: 'bar'
        }
      ];
      var layout = {
        title: 'Books Issued Per Day',
        xaxis: {
          title: 'Date'
        },
        yaxis: {
          title: 'Number Of Books Issued'
        }
      };
      Plotly.newPlot(document.getElementById('graph1'), data, layout);
    }
  }

  function displayGraph2(){

    if(recordsList && recordsList.bookGraph){
      var bookGraphData = [
        {
          x: Object.keys(recordsList.bookGraph),
          y: Object.values(recordsList.bookGraph),
          type: 'bar'
        }
      ];
      var layout = {
        title:'Books Issued The Most',
        xaxis: {
          title: 'Title of Books'
        },
        yaxis: {
          title: 'Number of Times Book was issued'
        }
      };
      Plotly.newPlot(document.getElementById('graph2'), bookGraphData, layout);
    }
  }


  function displayStats(){
    if(recordsList && recordsList.stats)
    return (
      <div class="row">
        {recordsList.stats.books &&
        <div class="col-sm-6 col-md-3 col-6">
          <div class="info-box">
            <span class="info-box-icon bg-info elevation-1"><i class="fas fa-book"></i></span>
            <div>
              <span>Total Books: </span>
              <span>{recordsList.stats.books}</span>
            </div>
          </div>
        </div>
        }
        <div class="col-sm-6 col-md-3 col-6">
          <div class="info-box mb-3">
            <span class="info-box-icon bg-danger elevation-1"><i class="far fa-money-bill-alt"></i></span>
            <div >
              <span>Total Fine Imposed: </span>
              <span>{recordsList.stats.fine}</span>
            </div>
          </div>
        </div>            
        <div class="clearfix hidden-md-up"></div>
          <div class="col-sm-6 col-md-3 col-6">
            <div class="info-box mb-3">
              <span class="info-box-icon bg-success elevation-1"><i class="fas fa-shopping-cart"></i></span>
              <div>
                {localStorage.getItem('isStaff') &&
                <NavLink to = '/recordsList'>
                  <span>Books Currently Issued: </span>
                </NavLink>
                }
                {!localStorage.getItem('isStaff') &&
                <NavLink to = {`/recordsList/${localStorage.getItem('name')}`} >
                  <span>Books Currently Issued: </span>
                </NavLink>
                }
                <span>{recordsList.stats.issue}</span>
              </div>
            </div>
          </div>
          {recordsList.stats.books &&
          <div class="col-sm-6 col-md-3 col-6">
            <div class="info-box mb-3">
            <span class="info-box-icon bg-warning elevation-1"><i class="fas fa-users"></i></span>
            <div>
              <NavLink to="/usersList"><span>Normal Users: </span></NavLink>
              <span>{recordsList.stats.user}</span>
            </div>
          </div>
        </div>
          }
      </div>
    );
  }


  useEffect(async() => {
    if (!reader || reader=='All'){
      url = baseURL;
      url2 = baseURL2;
      url3 = baseURL3;
    }
    if (status){
      url += `/${status}`
    }
    const recordsData = await axios(url);
    const bookGraph = await axios(url2);
    const stats = await axios(url3);
    setGraphDetails({ records: recordsData.data, bookGraph: bookGraph.data, stats:stats.data})
  
  }, [reader, status])
  
  return (
    <div class='bookList'>
      <h1>{reader} Analysis</h1>
      <hr/>
      <div class = 'container'>
        {displayStats()}
      </div>
        <div class='container' id='graph1'>
        </div>
        <div class='container' id='graph2'>
        </div>
        {displayGraph1()}
        {displayGraph2()}
    </div>
  )
}
  