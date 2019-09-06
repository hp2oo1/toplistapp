// import useState and useEffect hooks from React
import React, { useState, useEffect } from 'react'
// import the API category from AWS Amplify
import { API, Cache } from 'aws-amplify'
//
import {
  Affix,
  Button,
  Checkbox,
  Drawer,
  List,
  Menu,
  // Tag,
  // Tooltip,
} from 'antd'
import 'antd/dist/antd.css'
import SubMenu from 'antd/lib/menu/SubMenu';
import CheckboxGroup from 'antd/lib/checkbox/Group';

import './App.css';

Cache.configure({
  capacityInBytes: 5000000,
  itemMaxSize:     5000000
})

const defaultCheckedList = ["知乎", "天涯", "微信", "微博"]

const Promise = require("bluebird")

function App() {
  // create coins variable and set to empty array
  const [plainOptions, updatePlainOptions] = useState([])
  const [hotdata, updateHotdata] = useState([])
  const [loading, updateLoading] = useState()
  const [visible, updateVisible] = useState(false)
  const [state, updateState] = useState({
    checkedList: defaultCheckedList,
    indeterminate: true,
    checkAll: false,
  })

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

  async function fetchData() {
    updateLoading(true)
    //
    var checkedList = Cache.getItem("checkedList", { callback: () => {
      return defaultCheckedList
    }});
    //
    const data1 = await API.get('hotdata1api', `/hotdata1`)
    //
    var siteData = []
    var options = []
    for (var i in data1.hotdata1.Data) {
      var title = data1.hotdata1.Data[i].title
      options.push(title)
      //
      var id = data1.hotdata1.Data[i].id
      if(checkedList.includes(title)){
        siteData.push({
          id: id,
          title: title
        })
      }
    }
    // sort by site name
    options.sort((x,y)=>x.localeCompare(y, 'zh-CN'))
    updatePlainOptions(options)
    //
    var data = []
    await Promise.map(siteData, site => {
      return API.get('hotdata2api', `/hotdata2?id=${site.id}`)
    }, { concurrency: 100 })
    .then(results => {
      results.forEach((result, i) => {
        let rank = 0
        for (var j in result.hotdata2.Data) {
          rank++
          data.push({
            rank: rank,
            title1: siteData[i].title,
            title2: result.hotdata2.Data[j].title,
            url: result.hotdata2.Data[j].url,
            keywords: ""
          });
        }
      })
    })
    //
    // await Promise.map(data, item => {
    //   try {
    //     return API.get('pullwordapi', `/pullword?source=${decodeURI(unescape(item.title2))}`)
    //   }
    //   catch(error){
    //     console.log(error)
    //   }
    //   return {keywords: ""}
    // }, { concurrency: 100 })
    // .then(results => {
    //   results.forEach((result, i) => {
    //     data[i].keywords = result.keywords
    //   })
    // })
    //
    Cache.setItem("data", data)
    updateHotdata(data)
    //
    updateLoading(false)
  }

  // call fetchCoins function when component loads
  useEffect(() => {
    fetchData()
  }, [])

  function renderItem(item, index) {
    return (
      <div>
        <List.Item style={styles.item}>
          <List.Item.Meta
            title={<a href={item.url} target="_blank" rel="noopener noreferrer">{`${index+1} ${item.title2}`}</a>}
            description={`${item.title1} Top${item.rank} ${item.keywords}`}
          />
        </List.Item>
        {/* {item.keywords.split().map((tag, index) => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag key={tag} closable={index !== 0} onClose={() => this.handleClose(tag)}>
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })} */}
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
      <Affix>
        <Menu mode="horizontal" theme="light">
        <Menu.Item>
          <Button
            type="danger"
            loading={loading}
            onClick={fetchData}
          >Fetch
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
            onClick={sortByRank}
          >Rank
          </Menu.Item>
          <Menu.Item
            type="primary"
            onClick={sortByDefault}
          >Site
          </Menu.Item>
        </SubMenu>
        <Menu.Item
          onClick={()=>updateVisible(true)}
        >Options
        </Menu.Item>
      </Menu>
      </Affix>
      <List dataSource={hotdata} renderItem={renderItem}/>
      <Drawer
        title="Options"
        placement="right"
        closable={true}
        onClose={()=>updateVisible(false)}
        visible={visible}
        >
        <div>
        <Checkbox
          onChange={e => {
            updateState({
              checkedList: e.target.checked ? plainOptions : [],
              indeterminate: false,
              checkAll: e.target.checked
            })
            //
            Cache.setItem("checkedList", e.target.checked ? plainOptions : [])
          }}
        >CheckAll
        </Checkbox>
        </div>
        <CheckboxGroup
          options={plainOptions}
          value={state.checkedList}
          onChange={checkedList => {
            updateState({
              checkedList,
              indeterminate: !!checkedList.length && checkedList.length < plainOptions.length,
              checkAll: checkedList.length === plainOptions.length
            })
            //
            Cache.setItem("checkedList", checkedList)
          }}
        >CheckboxGroup
        </CheckboxGroup>
      </Drawer>
    </div>
  )
}

export default App