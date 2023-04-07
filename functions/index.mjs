const { ChatGPTAPI } = await import('chatgpt');

export const handler = async(event) => {
  const body = JSON.parse(event.body);
  const field = body.field;
  const payload = body.payload;

  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  });
  if (field !== undefined && payload !== undefined) {
    // const prompt = `You are TypeGenius, an AI that helps people fill in inputs and text areas on any website. You will complete the sentence sent by the User and no other output to your response. Complete this sentence: ${payload}`;
    const prompt = `You are TypeGenius, an AI that helps people fill in inputs and text areas on any website. You will complete the sentence sent by the User and no other output to your response, if you can't, you will reply "Error" with nothing more. Do not repeat what the user has filled in. The input name is "${field}", complete this value: ${payload}`;

    return api.sendMessage(prompt)
      .then((response) => {
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials" : true
          },
          body: JSON.stringify({ response: response.text }),
        };
      })
      .catch(error => {
        return {
          statusCode: 503,
          headers: {
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials" : true
          },
          body: JSON.stringify({ error }),
        };
      });
  } else {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Credentials" : true
      },
      body: JSON.stringify({ error: 'Payload missing' }),
    };
  }
};
