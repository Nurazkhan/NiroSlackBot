const axios = require("axios");


const response = await axios.get('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/cny.json');
let CNYinKZT = response.data.cny.kzt;
console.log(CNYinKZT)