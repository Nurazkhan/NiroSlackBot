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

app.command("/nirobot-currency", async ({ack, respond}) =>{
  await ack();
  try{
    const response1 = await axios.get('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    
    const response = await axios.get('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/cny.json');
    let CNYinKZT = response.data.cny.kzt;
    let USDinKZT = response1.data.usd.kzt;
    let date = response.data.date;
    await respond({response_type: 'ephemeral', blocks: [
      {type: 'header', text: {type: 'plain_text', text: `Current exchange rate for CNY to KZT`}},
      {type: 'section', text: {type: 'plain_text', text: `date: ` + date} },
      {type: 'section', text: {type: 'plain_text', text: `1 USD: ` + USDinKZT + ` KZT`} },
      {type: 'section', text: {type: 'plain_text', text: `1 CNY: ` + CNYinKZT + ` KZT`} }
    ]})
  }catch(err){
    await respond({text: `failed to get currency rate ${err.message}` })
  }

})


app.command('/nirobot-trend', async ({ack, respond}) => {
  await ack();

  try{
    let response = await axios.get('https://api.github.com/search/repositories?q=created:>2026-10-10&sort=stars&order=desc&per_page=30', {headers: {
        'User-Agent': 'SlackBot-App' 
      }})
  
    
    const items = response.data?.items;
    if (!items || items.length === 0) {
      await respond({ text: 'No trending repositories found for the specified timeframe.' });
      return;
    }
    const random = Math.floor(Math.random()*items.length)
    let project = items[random];
    
 
    await respond({
      response_type: 'ephemeral',
      blocks: [
        {type: 'header', text:{type: 'plain_text', text: `Random Trending Git`}},
        {type: 'section', text:{type: 'mrkdwn', text: `*Fullname:* ${project.full_name}`}},
        {type: 'section', text:{type: 'mrkdwn', text: `*Stars:* ${project.stargazers_count} `}},
        {type: 'section', text:{type: 'mrkdwn', text: `*Description:* ${project.description} `}},
        {type: 'section', text:{type: 'mrkdwn', text: `*URL:* <${project.url}|Link> `}},
        
        
      ]
    })

  }catch(err){
    await respond({text: `failed to fetch git trends ${err.message}`})
  }

})

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
/nirobot-catfact - Get a cat fact
/nirobot-trend - Get Latest trending repos from github
/nirobot-currency - Get USD and CNY values in terms of KZT
/nirobot-anime - Get least of ongoing animes.
/nirobot-joke - Get random Joke
/nirobot-help - Get Info about all comands.`
  });
});

app.command('/nirobot-anime', async ({ ack, respond }) => {
    await ack();
    let animes = [];

    try {
        const response = await axios.get('https://shikimori.io/api/animes?status=ongoing');
        
        for (let item of response.data) {
            const img = `https://shikimori.io${item.image.preview}`;
            
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