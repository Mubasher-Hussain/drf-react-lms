import React, { useEffect, useState } from "react";
import {
  useHistory,
  useLocation,
  NavLink,
} from "react-router-dom";

import axios from "../auth/axiosConfig";
import Plotly from 'plotly.js';

// Displays All Records or specific by reader
export function Analysis(props) {
  const reader = props.match.params.reader;
  const [recordsList, setGraphDetails] = useState({records: null, bookGraph: null});
  const history = useHistory();
  const location = useLocation();
  const baseURL = 'server/api/records';
  const baseURL2 = 'server/api/analysis/books-issued'
  const status = props.match.params.status;
  let url2 = `server/api/analysis/${reader}/books-issued`;
  let url = `server/api/${reader}/records`;
  let graphData = {};

  function displayGraph1(){
      
    if (recordsList && recordsList.records){
      recordsList.records.map((record)=>{
        let issue_date = new Date(record.issue_date)
        let dateString = issue_date.toString()
        dateString = dateString.substring(0,16)
        const diffTime = Math.abs(new Date() - issue_date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));   
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

  useEffect(async() => {
    if (!reader || reader=='All'){
      url = baseURL;
      url2 = baseURL2;
    }
    if (status){
      url += `/${status}`
    }
    const recordsData = await axios(url);
    const bookGraph = await axios(url2);
    
    setGraphDetails({ records: recordsData.data, bookGraph: bookGraph.data})
  
  }, [reader, status])
  
  return (
    <div class='bookList'>
      <h1>{reader} Analysis</h1>
      <hr/>
        <div class='container' id='graph1'>
        </div>
        <div class='container' id='graph2'>
        </div>
        {displayGraph1()}
        {displayGraph2()}
    </div>
  )
}
  