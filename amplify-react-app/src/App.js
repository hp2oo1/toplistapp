// import useState and useEffect hooks from React
import React, { useState, useEffect } from 'react'

// import the API category from AWS Amplify
import { API } from 'aws-amplify'

import './App.css';

function App() {
  // create coins variable and set to empty array
  const [hotdata, updateHotdata] = useState([])

  // define function to all API
  async function fetchHotdata() {
    const data1 = await API.get('hotdata1api', `/hotdata1`)
    var data = []
    var data2
    for (var i in data1.hotdata1.Data)
    {
      var id = data1.hotdata1.Data[i].id
      data2 = await API.get('hotdata2api', `/hotdata2?id=${id}`)
      var index = 0;
      for (var j in data2.hotdata2.Data)
      {
        data.push({
          index: ++index,
          title1: data1.hotdata1.Data[i].title,
          title2: data2.hotdata2.Data[j].title,
          url: data2.hotdata2.Data[j].url
        });
        // break;
      }
      // break;
    }
    data.sort((a,b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0));
    updateHotdata(data)
  }

  // call fetchCoins function when component loads
  useEffect(() => {
    fetchHotdata()
  }, [])

  return (
    <div className="App">
      {
        hotdata.map((data, index) => (
          <div key={index}>
            <a href={data.url} rel="noopener noreferrer" target="_blank">
              {index+1} Top{data.index}: {data.title2} ({data.title1})
            </a>
          </div>
        ))
      }
    </div>
  );
}

export default App