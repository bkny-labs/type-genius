// const { ChatGPTAPI } = await import('chatgpt');
import fetch from "node-fetch";

// const OPENAI_API_URL = `https://api.openai.com/v1/chat/completions`;
const OPENAI_API_URL = `https://api.openai.com/v1/completions`;

function createResponse(statusCode, error) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials" : true
    },
    body: JSON.stringify({ error }),
  };
}

export const handler = async(event) => {
  const body = JSON.parse(event.body);
  const field = body.field;
  const payload = body.payload;

  const prompt = `You're a powerful auto-completion AI in the process of filling in a form field labeled '${field}' on a website; you write: ${payload} `;

  if (field === undefined || prompt == undefined) {
    return createResponse(400, 'Payload missing');
  }

  const model = body.model || "text-davinci-002";
  const max_tokens = body.max_tokens ||  7;
  const temperature = body.temperature ||  0;
  const top_p = body.top_p ||  1;
  const n = body.n ||  1;
  const stream = body.stream ||  false;
  const logprobs = body.logprobs ||  null;
  const stop = body.stop ||  "\n";

  const multi = body.multi || false;

  let gptResponse;

  try {
    gptResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        max_tokens,
        temperature,
        top_p,
        n,
        stream,
        logprobs,
        stop,
      }),
    });
  } catch (e) {
    return createResponse(503, e);
  }

  const gptPayload = await gptResponse.json();

  if (gptPayload.choices === undefined) {
    return createResponse(503, gptPayload);
  }

  if(multi) {
    return createResponse(200, gptPayload.choices);
  }

  return createResponse(200, gptPayload.choices[0].text);

};