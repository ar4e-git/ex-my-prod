require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');

const port = process.env.PORT || 3000;

const url_target = process.env.URL_TARGET;
const url_send = process.env.URL_SEND;
const url_suffix = process.env.URL_SUFFIX;
const whitelist = process.env.WHITELIST;

const getURL = async (channel, shift = 0) => {

	const baseURL = `${url_target}${channel}.m3u8`;
    
	const options = {
      headers: {
		  
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
		'Accept': '*/*',
		'Accept-Encoding': 'gzip, deflate, br',
		'Accept-Language': 'ru,en-US;q=0.9,en;q=0.8,ru-RU;q=0.7',
		'Connection': 'keep-alive',
		'Sec-Fetch-Dest': 'empty',
		'Sec-Fetch-Mode': 'cors',
		'Sec-Fetch-Site': 'cross-site',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
		'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Windows"'
      }
    }

    try{
        const { data: html } = await axios.get(baseURL, options);

		const $ = cheerio.load(html);
		
		let link = $('source').attr('src');
		
		console.log(link);
		
		if (shift) {
			link = `${link}${url_suffix}${shift}`;
		}
		
		return link;
		
    } catch (error){
        console.log('error', error)
    }
};

const allowed = whitelist.split(';'); 

const corsOptions = {
  origin: (origin, cb) => {
    if (allowed.indexOf(origin) > -1) {
      cb(null, true)
    } else {
      cb(new Error('Forbidden CORS'))
    }
  },
}

app.disable('x-powered-by');

app.use(cors(corsOptions));

app.get('/channel/:id.m3u8/:shift?', async (req, res, next) => {
	
	const channel = req.params.id;

	try {
		
		const url = await getURL(channel, req.params.shift);
		const retUrl = `${url_send}${url.split('/')[3]}`;

		res.redirect(301, retUrl);
		
	} catch (err) {
		console.log('Error in get: ', err);
		res.sendStatus(500);
	}
});

app.listen(port, () => console.log(`Listening at port: ${port}`));