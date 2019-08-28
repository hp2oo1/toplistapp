// import useState and useEffect hooks from React
import React, { useState, useEffect } from 'react'
// import the API category from AWS Amplify
import { API, Cache } from 'aws-amplify'
import './App.css';
//
import { List, Button, Layout, Menu } from 'antd'
import 'antd/dist/antd.css'
import SubMenu from 'antd/lib/menu/SubMenu';

const { Sider } = Layout;

function App() {
  // create coins variable and set to empty array
  const [hotdata, updateHotdata] = useState([])
  const [loading, updateLoading] = useState()
  const [collapsed, updateCollapsed] = useState()

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
      updateHotdata(data)
      // break;
    }
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
      <Menu mode="horizontal">
        <Menu.Item>
          <Button
            type="danger"
            loading={loading}
            onClick={() => {
              updateLoading(true)
              fetchHotdata()
            }}>
            Fetch New Data
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
      </Menu>
      <Layout>
        <Layout>
          <List
            dataSource={hotdata}
            renderItem={renderItem}
          />
        </Layout>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        collapsed={collapsed}
        onCollapse={updateCollapsed}>
          Sider
        </Sider>
      </Layout>
    </div>
  )
}

export default App