'use strict';

const 
  line = require('@line/bot-sdk'),
  app = require('express')(),
  cors = require('cors'),
  axios = require('axios'),
  port = 4000;

// create LINE SDK config from env variables
const 
  config = {
    channelAccessToken: 'bOyan2Dp/hA8s+byZnn5hm77WBktYEotBJfcH53b2RoHEO20PccHJGMWkRX3z9L2zVFAXrXgXDJvxNIVjbyVPddWN9bHfXG4bEUZR7NfbtzBzaW8ZF6zq51UsZA/XXog0dszeN3OnPnSe6T7i0ab1QdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'c3f2d4cfb71d82d25e49ebe7fdc15a96',
  },
  userId = 'U15bb70772f7fbf34b6ec5645b3d9fd71',
  suzuki_userId = 'U4b62f79aae7a353bf376676380ac619a',
  client = new line.Client(config),
  LINE = function ({ 
    client: client, 
    message: message, 
    userId: userId,
    richMenuId: richMenuId
  }) {
    this.client = client;
    this.message = message;
    this.userId = userId;
    this.richMenuId = richMenuId;
  };
  
LINE.prototype =  {
  broadcast: function () {
    try{
      this.client.broadcast({
        "type": "text",
        "text": this.message
      }).then(d => console.log(d)).catch(e =>console.error(e))
      return JSON.stringify({ message: this.message });
    } catch (e) {
      return JSON.stringify({ message: e.message });
    }
  },

  getProfile: function() {
    this.client.getProfile(this.userId)
    .then(p => {
      console.log(p.displayName);
      console.log(p.userId);
      console.log(p.pictureUrl);
      console.log(p.statusMessage);
      return p;
    })
    .catch(e => console.error(e));
  },
  
  getBotInfo: async function() {
    const 
      uri = 'https://api.line.me/v2/bot/info',
      options = {
        headers: {
          'Authorization': `Bearer ${this.client.config.channelAccessToken}`,
        }
      }, 
      rq = await axios.get(uri,options),
      data = JSON.stringify({ botInfo: rq.data });
      return  data;
    },
    
    gfriend: async function() {
      const
        uri = 'https://api.line.me/v2/bot/insight/followers?date=20220509',
        options = {
          headers: {
            'Authentication': `Bearer ${this.client.config.channelAccessToken}`,
          }
        },
        rq = await axios.get(uri, options);
        return rq;
    },

    sMessage: async function(date) {
      const
        uri = `https://api.line.me/v2/bot/insight/message/delivery?date=${date}`,
        options = {
          headers: {
            'Authentication': `Bearer ${this.client.config.channelAccessToken}`,
          }
        },
        rq = await axios.get(uri, options);
      return rq;
    },

    grich: async function() {
      const array = await this.client.getRichMenuList();
      return array;
    },

    cRich: async function() {
      const richmenu = {
        size: { width: 2500, height: 1686 }, 
        selected: false,
        name: 'this is menu',
        chatBarText: 'taptaptap',
        areas: [{
            bounds: {
              x: 0,
              y: 0,
              width: 2500,
              height: 1686
            },
          action: {
            type: 'postback',
            data: `action=buy&itemid=123`
          }
        }]
      };
      const richMenuId = await this.client.createRichMenu(richmenu);
      return richMenuId;
    },

    dRich: async function() {
      try{
        this.client.deleteRichMenu(this.richMenuId);
        return 'success!';
      } catch(e) {
        console.error(e);
      }
    }
  }

app
  .use(cors())
  .post('/callback', line.middleware(config), (req, res) => {
    handleBot(req, res)
  })
  .post('/broadcast/:value', async (req, res) => {
    const 
      message = req.params.value,
      u = new LINE({ client: client, message: message }),
      d = u.broadcast();
    res.send(d);
  })
  //認証情報必須
  .get('/userinfo', async (req, res) => {
    const u = new LINE({ client: client, userId: userId });
    const uu = u.getProfile();
    console.log(uu);
  })
  .get('/botinfo', async (req, res) => {
    const 
      b = new LINE({ client: client }),
      data = await b.getBotInfo();
    res.send(data);
  })
  .get('/grich', async (req, res) => {
    const
      b = new LINE({ client: client }),
      d = JSON.stringify(await b.grich());
    res.send({ rInfo: d });
  })
  //認証情報必須
  .get('/gfriend', async (req, res) => {
    const d = new LINE({ client: client });
    await d.gfriend();
  })
  .get('/smessage/:date', async (req, res) => {
    const
      l = new LINE({ client: client }),
      date = req?.params?.date;
    await l.sMessage(date);
  })
  .get('/crich', async (req, res) => {
    const
      l = new LINE({ client: client }),
      richMenuId =  await l?.cRich();
    res.send({ richMenuId: richMenuId });
  })
  .post('/drich/:rich_id', async (req, res) => {
    const 
      drich_id = req?.params?.rich_id,
      l = new LINE({ client: client, richMenuId: drich_id }),
      message = JSON.stringify(await l.dRich());
    res.send({ message: message });
  })
  .listen(port, () => console.log(`listening on ${port}`));



function handleBot(req, res) {
  res.status(200).end();
  req?.body?.events?.map(event => {
    const etype = event.type;
    console.log(event);
    let options;
    if (etype === 'message') {
      const t = event.message.text;
      if (t === 'イベント作成') {
        options = { type: 'text', text:  'イベント作成' };
      } else if (t === 'イベント一覧') {
        options = {
          "type": "template",
          "altText": "イベントの一覧をご確認ください",
          "template": {
            "type": "carousel",
            "columns": [
              {
                "thumbnailImageUrl": "https://cdn.pixabay.com/photo/2015/11/16/16/28/bird-1045954_1280.jpg",
                "imageBackgroundColor": "#FFFFFF",
                "title": "demo会ver0.1",
                "text": "lorem ipsum ...",
                "actions": [
                    {
                      "type": "postback",
                      "label": "イベントに参加する",
                      "data": "action=buy&itemid=111"
                    },
                    {
                      "type": "postback",
                      "label": "イベントの詳細をこの目で確かめる",
                      "data": "action=add&itemid=111"
                    },
                    {
                      "type": "uri",
                      "label": "ガンガンいこうぜ",
                      "uri": "https://difff.jp/"
                    }
                ]
              },
              {
                "thumbnailImageUrl": "https://cdn.pixabay.com/photo/2017/02/07/16/47/kingfisher-2046453_1280.jpg",
                "imageBackgroundColor": "#000000",
                "title": "demo会ver0.2",
                "text": "lorem ipsum is longer dhiscount shopt ispge",
                "actions": [
                  {
                    "type": "postback",
                    "label": "イベントに参加する",
                    "data": "action=buy&itemid=111"
                  },
                  {
                    "type": "postback",
                    "label": "イベントの詳細をこの目で確かめる",
                    "data": "action=add&itemid=111"
                  },
                  {
                    "type": "uri",
                    "label": "ガンガンいこうぜ",
                    "uri": "https://difff.jp/"
                  }
                ]
              },
              {
                "thumbnailImageUrl": "https://cdn.pixabay.com/photo/2017/07/18/18/24/dove-2516641_1280.jpg",
                "imageBackgroundColor": "#000000",
                "title": "demo会ver0.3",
                "text": "lorem ipsum is longer dhiscount shopt ispge",
                "actions": [
                  {
                    "type": "postback",
                    "label": "イベントに参加する",
                    "data": "action=buy&itemid=111"
                  },
                  {
                    "type": "uri",
                    "label": "イベントの詳細をこの目で確かめる",
                    'uri': 'https://pixabay.com/ja/photos/%e9%b3%a9-%e9%b3%a5-%e3%83%95%e3%83%a9%e3%82%a4%e3%83%88-%e7%bf%bc-%e7%99%bd%e3%81%84%e9%b3%a5-2516641/'
                  },
                  {
                    "type": "uri",
                    "label": "ガンガンいこうぜ",
                    "uri": "tel:07022882166"
                  }
                ]
              }
            ],
            "imageAspectRatio": "rectangle",
            "imageSize": "cover"
          }
        };
      }  else if (t === 'イベント管理') {
        options = { type: 'text', text:  'イベント管理' };
      } else if (t === 'ユーザー情報') {
        options = { type: 'text', text:  'ユーザー情報' };
      } else {
        options = { type: 'text', text:  event.message.text };
      }
      client.replyMessage(event.replyToken, options);
    } else if (etype === 'postback') {
      client.replyMessage(event.replyToken, { type: 'text', text: 'がえら英おrg' });
    }
  })
}

