import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import './App.css';

const SL = ({ i: i, richMenuId: richMenuId, chatBotText: chatBotText }) => {
  console.log(i);
  console.log(richMenuId);
  console.log(chatBotText);
  return <option key={i} value={richMenuId}>{chatBotText}</option>
}

function App() {
  const
    [value, setValue] = useState(''),
    [rich, setRich]  = useState([]),
    onPress = async () => {
      if (value != '') {
        const
          uri = `http://localhost:4000/broadcast/${value}`,
          ifn = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          };
        setValue('');
        await fetch(uri, ifn);
      } else {
        console.log('何かしら入力してください');
      }
    },
    //認証情報必須
    getUserInfo = async () => {
      const uri = `http://localhost:4000/userinfo`;
      await fetch(uri);
    },
    getBotInfo = async () => {
      const uri = `http://localhost:4000/botinfo`;
      try {
        const
          data  = await fetch(uri),
          { botInfo } = await data.json();
        console.log(botInfo);
      } catch(e) {
        console.error(e);
      }
    },
    //認証情報必須
    gfriend = async () => {
      const uri = `http://localhost:4000/gfriend`;
      await fetch(uri);
    },
    sMessage = async () => {
      const
        dt = document.getElementById('judge_date').value.replace(/-/g, ''),
        uri = `http://localhost:4000/smessage/${dt}`;
      if (dt != '') {
        await fetch(uri);
      } else {
        console.log('日付を入力してくだし');
      }
    },
    grich = async () => {
      try {
        const
          uri = `http://localhost:4000/grich`,
          a = await fetch(uri),
          { rInfo } = await a.json(),
          d = JSON.parse(rInfo);
        console.log(d);
        return d;
      } catch (e) {
        console.error(e);
        return e;
      }
    },
    cRich = async () => {
      const
        uri = `http://localhost:4000/crich`,
        d = await fetch(uri),
        d_2 = await d.json();
      console.log(d_2);
      const rr = await grich();
      setRich(rr);
    },
    dRich = async () => {
      const
        drich_id = document.getElementById('delete_rich').selectedOptions['0'].value,
        uri = `http://localhost:4000/drich/${drich_id}`,
        options = {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST'
        };
      const
        result = await fetch(uri, options),
        res= await result.json();
      console.log(res.message);
    };
  useEffect(() => {
    Axios.get('http://localhost:4000/grich')
    .then(re => {
      const d = JSON.parse(JSON.stringify(re.data.rInfo))
      return d;
    })
    .then(data => {
      const res = JSON.parse(data);
      setRich(res);
    })
    .catch(e => console.error(e));
  }, [rich]);


  return (
    <div className="App">
      <h1>aaaa</h1>
      <input type='text' placeholder='line message...' onChange={e => setValue(e.target.value)} value={value} />
      <button onClick={onPress}>line 全体通知</button>
      <button onClick={getUserInfo}>getUserInfo</button>
      <button onClick={getBotInfo}>Bot情報</button>
      <button onClick={grich}>リッチメニュー情報</button>
      <button onClick={gfriend}>友達の人数</button>
      <div>
        <input type='date' id="judge_date" />
        <button onClick={sMessage}>メッセージ送信数</button>
      </div>
      <button onClick={cRich}>リッチメニュー作成</button>
      <button onClick={dRich}>リッチメニュー削除</button>
      <select id='delete_rich'>
        {rich && rich.map(r => ( <option key={r.richMenuId} value={r.richMenuId}>{r.chatBarText}</option>))}
      </select>
    </div>
  );
}

export default App;
