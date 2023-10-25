import { Configuration, OpenAIApi } from 'openai'

import { OPENAI_API_KEY } from '~/utils/secrets'

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export const getCompletion = async (prompt: string): Promise<string | null> => {
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${prompt}\nAI:\n`,
    temperature: 0.9,
    max_tokens: 4000,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.6,
    stop: [' Human:', ' AI:']
  })

  const { text } = completion.data.choices[0]
  if (!text) {
    return null
  }

  if (text.substring(0, 1) === `\n`) {
    return text.substring(1)
  }

  return text
}


/**
 * gpt-3.5-turboを利用した関数。
 * createChatCompletionの引数は適宜調整
 */
export const getCompletionGPT3_5Turbo = async (prompt: string): Promise<string | null> => {

  //
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: prompt}],
    stop: ["\n", " Human:", " AI:"],
    max_tokens: 2000,
    n:1,
    temperature: 0.5
  });

  const { message } = completion.data.choices[0]
  if (!message) {
    return null
  }

  return message.content.trim();
}


/**
 * 画像生成AIを使ったもの
 */
export const getImageCompletion = async (text: string): Promise<string | null> => {

  const response = await openai.createImage({
    prompt: text,
    n: 2,
    size: "1024x1024",
  });

  return response.data.data[0].url!;
}


//音声文字起こしAIを使ったもの
// export const getTranscriptionsCompletion = async (text: string): Promise<string | null> => {

//   const response = await openai.createTranscription(
//   fs.createReadStream("audio.mp3"),
//   "whisper-1"
// );

//   return response.data.data[0].url!;
// }
