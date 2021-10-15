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
  const [recordsList, setRecordsList] = useState();
  const history = useHistory();
  const location = useLocation();
  const baseURL = 'server/api/records';
  const status = props.match.params.status;
  let url = `server/api/${reader}/records`;
  let graphData = {};

  function displayList(){
      
    if (recordsList && recordsList.length){
      recordsList.map((record)=>{
        let issue_date = new Date(record.issue_date)
        let dateString = issue_date.getDate().toString()
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
        type: 'scatter'
      }
    ];
    var layout = {
      title: 'Books Issued Per Day',
      xaxis: {
        title: 'Date',
        titlefont: {
          family: 'Arial, sans-serif',
          size: 18,
          color: 'lightgrey'
        },
        showticklabels: true,
        tickangle: 'auto',
        tickfont: {
          family: 'Old Standard TT, serif',
          size: 14,
          color: 'black'
        },
        exponentformat: 'e',
        showexponent: 'all'
      },
      yaxis: {
        title: 'Number Of Books Issued',
        titlefont: {
          family: 'Arial, sans-serif',
          size: 18,
          color: 'lightgrey'
        },
        showticklabels: true,
        tickangle: 45,
        tickfont: {
          family: 'Old Standard TT, serif',
          size: 14,
          color: 'black'
        },
        exponentformat: 'e',
        showexponent: 'all'
      }
    };
    
    Plotly.newPlot(document.getElementById('graph'), data, layout);
    
  }

  }
  
  useEffect(() => {
    if (!reader || reader=='All'){
      url = baseURL;
    }
    if (status){
      url += `/${status}`
    }
    axios
    .get(url)
    .then(res => {
      setRecordsList(res.data);
    })
    .catch( (error) => props.createNotification(error.message, 'error'))
  }, [reader, status])
  
  return (
    <div class='bookList'>
      <h1>{reader} Analysis</h1>
      <hr/>
        <div class='container' id='graph'>
          { displayList() }
        </div>
    </div>
  )
}
  