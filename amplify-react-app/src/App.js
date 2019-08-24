// import useState and useEffect hooks from React
import React, { useState, useEffect } from 'react'
// import the API category from AWS Amplify
import { API, Cache } from 'aws-amplify'
import './App.css';
//
import { List, Button, Menu, Dropdown, Icon } from 'antd'
import 'antd/dist/antd.css'

function App() {
  // create coins variable and set to empty array
  const [hotdata, updateHotdata] = useState([])
  const [loading, updateLoading] = useState()

  async function fetchHotdataCache() {
    var data = Cache.getItem("data")
    updateHotdata(data)
  }

  // shuffle
  async function shuffleHotdata() {
    var data = Cache.getItem("data")
    for(let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * data.length)
      const temp = data[i]
      data[i] = data[j]
      data[j] = temp
    }
    updateHotdata(data)
  }

  // order by default
  async function sortByDefault()
  {
    var data = Cache.getItem("data")
    updateHotdata(data)
  }

  // order by rank
  async function sortByRank()
  {
    var data = Cache.getItem("data")
    data.sort((a,b) => (a.rank > b.rank)
      ? 1 : ((b.rank > a.rank) ? -1 : 0))
    updateHotdata(data)
  }

  // define function to all API
  async function fetchHotdata() {
    const data1 = await API.get('hotdata1api', `/hotdata1`)
    //
    var data = []
    for (var i in data1.hotdata1.Data)
    {
      var id = data1.hotdata1.Data[i].id
      var data2 = await API.get('hotdata2api', `/hotdata2?id=${id}`)
      var rank = 0;
      for (var j in data2.hotdata2.Data)
      {
        data.push({
          rank: ++rank,
          title1: data1.hotdata1.Data[i].title,
          title2: data2.hotdata2.Data[j].title,
          url: data2.hotdata2.Data[j].url
        });
        // break;
      }
      // break;
    }
    //
    Cache.clear()
    Cache.setItem("data", data)
    updateHotdata(data)
    updateLoading(false)
  }

  // call fetchCoins function when component loads
  useEffect(() => {
    fetchHotdataCache()
  }, [])

  function renderItem(item, index) {
    return (
      <div>
        <List.Item style={styles.item}>
          <List.Item.Meta
            title={<a href={item.url} target="_blank" rel="noopener noreferrer">{`${index+1} ${item.title2}`}</a>}
            description={`Top ${item.rank} ${item.title1}`}
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

  const menu = (
    <Menu>
      <Menu.Item
        onClick={sortByDefault}>
        Website
      </Menu.Item>
      <Menu.Item
        onClick={sortByRank}>
        Rank
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={styles.container}>
      <Button
        type="danger"
        loading={loading}
        onClick={() => {
          updateLoading(true)
          fetchHotdata()
        }}>
        Fetch New Data
      </Button>
      &nbsp;
      <Dropdown.Button
        type="primary"
        overlay={menu}
        onClick={shuffleHotdata}>
        Shuffle
      </Dropdown.Button>
      <List
        dataSource={hotdata}
        renderItem={renderItem}
      />
    </div>
  )
}

export default App