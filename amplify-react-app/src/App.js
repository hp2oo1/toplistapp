// import useState and useEffect hooks from React
import React, { useState, useEffect } from 'react'
// import the API category from AWS Amplify
import { API, Cache } from 'aws-amplify'
import './App.css';
//
import { List, Button, Menu, Switch, Drawer } from 'antd'
import 'antd/dist/antd.css'
import SubMenu from 'antd/lib/menu/SubMenu';

Cache.configure({
  capacityInBytes: 5000000,
  itemMaxSize:     5000000
})

function App() {
  // create coins variable and set to empty array
  const [hotdata, updateHotdata] = useState([])
  const [loading, updateLoading] = useState()
  const [visible, updateVisible] = useState(false)
  const [theme, updateTheme] = useState("light")

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
    updateLoading(true)
    //
    const data1 = await API.get('hotdata1api', `/hotdata1`)
    //
    const promises = []
    for (var i in data1.hotdata1.Data) {
      var id = data1.hotdata1.Data[i].id
      promises.push(
        API.get('hotdata2api', `/hotdata2?id=${id}`)
      )
    }
    //
    var data = []
    await Promise.all(promises).then(results => {
      let index = -1
      for (var i in data1.hotdata1.Data) {
        index++
        let rank = 0;
        var data2 = results[index]
        for (var j in data2.hotdata2.Data) {
          rank++
          // if (rank > 20) break
          data.push({
            rank: rank,
            title1: data1.hotdata1.Data[i].title,
            title2: data2.hotdata2.Data[j].title,
            url: data2.hotdata2.Data[j].url
          });
        }
      }
    })
    //
    Cache.setItem("data", data)
    updateHotdata(data)
    updateLoading(false)
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

  return (
    <div style={styles.container}>
      <Menu mode="horizontal" theme={theme}>
        <Menu.Item>
          <Button
            type="danger"
            loading={loading}
            onClick={fetchHotdata}>
            Fetch
          </Button>
        </Menu.Item>
        <SubMenu title="Sort By">
          <Menu.Item
            type="primary"
            onClick={shuffleHotdata}>
            Shuffle
          </Menu.Item>
          <Menu.Item
            type="primary"
            onClick={sortByRank}>
            Rank
          </Menu.Item>
          <Menu.Item
            type="primary"
            onClick={sortByDefault}>
            Site
          </Menu.Item>
        </SubMenu>
        <Menu.Item
          onClick={()=>updateVisible(true)}
        > Drawer
        </Menu.Item>
      </Menu>
      <List dataSource={hotdata} renderItem={renderItem}/>
      <Drawer
        title="Basic Drawer"
        placement="right"
        closable={true}
        onClose={()=>updateVisible(false)}
        visible={visible}
        >
        <Switch
          checked={theme === 'dark'}
          onChange={()=>{
            if (theme === 'dark')
              updateTheme("light")
            else
              updateTheme("dark")
          }}
          checkedChildren="Dark"
          unCheckedChildren="Light"
        />
      </Drawer>
    </div>
  )
}

export default App