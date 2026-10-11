require("dotenv").config();
const axios = require("axios");
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/nirobot-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/nirobot-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/nirobot-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/nirobot-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/nirobot-ping - Check bot latency
/nirobot-catfact - Get a cat fact`
  });
});

app.command('/nirobot-test', async ({ ack, respond }) => {
    await ack();
    let animes = [];

    try {
        const response = await axios.get('https://shikimori.io/api/animes?status=ongoing');
        
        for (let item of response.data) {
            const img = item.image ? `https://shikimori.io${item.image.preview}` : 'https://placehold.co';
            
            let anime = { 
                name: item.name, 
                score: item.score,
                img_url: img 
            };
            animes.push(anime);
        }
    }
    catch (err) {
        animes = [];
        await respond({
            response_type: "ephemeral", 
            text: `got error here, the error text is this:  ${err.message}`
        });
        return; 
    }

    const anime_blocks = [];
    for (let anime_info of animes) {
        let anime_block = {
            type: "section", 
            fields: [
                { type: "plain_text", text: `Name: ${anime_info.name}` },
                { type: "plain_text", text: `Score: ${anime_info.score}` }
            ]
        };
        let image_part = { 
            type: "image", 
            image_url: anime_info.img_url, 
            alt_text: anime_info.name 
        };
        
        anime_blocks.push(anime_block);
        anime_blocks.push(image_part);
    }

    await respond({
        response_type: "ephemeral",
      
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: 'All ongoing Animes!'
                }
            },
            ...anime_blocks
        ]
    });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();