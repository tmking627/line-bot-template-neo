
//TeamAが実装していたAWSの設定
//https://github.com/line-api-camp/CAMP1-TeamA/blob/main/src/utils/comprehend.ts

import AWS, { Comprehend, Credentials } from 'aws-sdk';

import {AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY} from "~/utils/secrets";

interface SentimentResult {
  sentiment: string;
  scoreStr: string[];
}

const comprehend = new Comprehend({ region: 'ap-northeast-1' });

const SENTIMENT_LABELS: Record<string, string> = {
  POSITIVE: '好き',
  NEGATIVE: '嫌い',
  NEUTRAL: 'どうでもいい',
  MIXED: '気になってる'
};

export const detectSentiment = async (text: string): Promise<SentimentResult> => {
  const credentials = new Credentials({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  })
  AWS.config.update({
    credentials: credentials,
    region: AWS_REGION
  });

  const languageResult = await comprehend.detectDominantLanguage({ Text: text }).promise();
  const languageCode = languageResult.Languages?.[0].LanguageCode || 'ja';
  const sentimentResult = await comprehend.detectSentiment({ Text: text, LanguageCode: languageCode }).promise();
  if (!sentimentResult.Sentiment) {
    return { sentiment: 'わからない', scoreStr: [] };
  }
  const sentiment = SENTIMENT_LABELS[sentimentResult.Sentiment] || 'わからない';
  if (!sentimentResult.SentimentScore) {
    return { sentiment, scoreStr: [] };
  }
  const score = sentimentResult.SentimentScore || {};
  const scoreStr = Object.entries(score)
    .map(([key, value]) => {
      return `${SENTIMENT_LABELS[key.toUpperCase()]}：${Math.round(Number(value) * 100)}％`
    });
  return { sentiment, scoreStr };
};
