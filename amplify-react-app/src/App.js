// import useState and useEffect hooks from React
import React, { useState, useEffect } from 'react'
// import the API category from AWS Amplify
import { API } from 'aws-amplify'
import './App.css';
//
import { List } from 'antd'
import 'antd/dist/antd.css'

function App() {
  // create coins variable and set to empty array
  const [hotdata, updateHotdata] = useState([])

  // define function to all API
  async function fetchHotdata() {
    const data1 = await API.get('hotdata1api', `/hotdata1`)

    var data = []
    for (var i in data1.hotdata1.Data)
    {
      var id = data1.hotdata1.Data[i].id
      var data2 = await API.get('hotdata2api', `/hotdata2?id=${id}`)
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
    // shuffle
    for(let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * data.length)
      const temp = data[i]
      data[i] = data[j]
      data[j] = temp
    }
    updateHotdata(data)
  }

  // call fetchCoins function when component loads
  useEffect(() => {
    fetchHotdata()
  }, [])

  function renderItem(item, index) {
    return (
      <div>
        <List.Item style={styles.item}>
          <List.Item.Meta
            title={<a href={item.url} target="_blank" rel="noopener noreferrer">{`${index+1} ${item.title2}`}</a>}
            description={`Top ${item.index} ${item.title1}`}
          />
        </List.Item>
      </div>
    )
  }

  const styles = {
    container: {padding: 20},
    input: {marginBottom: 10},
    item: { textAlign: 'left' },
    p: { color: '#1890ff' }
  }

  return (
    <div style={styles.container}>
      <List
        dataSource={hotdata}
        renderItem={renderItem}
      />
    </div>
  );
}

export default App