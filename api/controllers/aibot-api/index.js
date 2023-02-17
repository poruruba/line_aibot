'use strict';

const HELPER_BASE = process.env.HELPER_BASE || "/opt/";
const Response = require(HELPER_BASE + 'response');

const OPENAI_APIKEY = "【OpenAIのAPIキー】";

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: OPENAI_APIKEY
});
const openai = new OpenAIApi(configuration);

const LINE_CHANNEL_ACCESS_TOKEN = "【LINEのチャネルアクセストークン】";
const LINE_CHANNEL_SECRET = "【LINEのチャネルアクセストークン】";

const config = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};
const LineUtils = require(HELPER_BASE + 'line-utils');
const line = require('@line/bot-sdk');
const app = new LineUtils(line, config);

app.message(async (event, client) =>{
  console.log(event);
  console.log(event.message.text);

  var text = event.message.text.trim();
  var type = "normal";
  if( text.endsWith("の画像") || text.endsWith("の写真") ){
    text = text.slice(0, -3);
    type = "image";
  }else if( text.endsWith("の絵") ){
    text = text.slice(0, -2);
    type = "image";
  }
  if( type == "image" ){
    const image = await openai.createImage({
      prompt: text,
      size: "256x256",
    });
    console.log(JSON.stringify(image.data), null, '\t');

    var url = image.data.data[0].url;
    var message = app.createImageResponse(url);
    return client.replyMessage(event.replyToken, message);
  }else{
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      temperature: 0.9,
      max_tokens: 1024,
    });
    console.log(JSON.stringify(response.data), null, '\t');

    var text = response.data.choices[0].text.trim();

    var message = app.createSimpleResponse(text)
    return client.replyMessage(event.replyToken, message);
  }
});

exports.handler = app.lambda();
