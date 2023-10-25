import { ImageMessage, Message } from '@line/bot-sdk'

export const makeReplyMessage = (text: string): Message => {
  return {
    type: 'text',
    text: text.replace(/<br>/g, '\n')
  }
}

export const makeReplyImageMessage = (url:string): ImageMessage => {
  return {
    type: 'image',
    originalContentUrl: url,
    previewImageUrl:url
  }
}

export const makeStripeMessage = (url: string,text:string): FlexMessage => {
  return {
    type: 'flex',
    altText: "決済",
    contents: {
    "type": "bubble",
    "hero": {
      "type": "image",
      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png",
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover",
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": text,
          "weight": "bold",
          "size": "xl"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
      {
        "type": "button",
        "style": "primary",
        "height": "sm",
        "action": {
          "type": "uri",
          "label": "こちらをタップ",
          "uri": url
        },
      }
    ],
    "flex": 0
  }
}

  }
}
