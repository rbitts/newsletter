var client = require('cheerio-httpcli');

var logger = require('./logger');
var RSS = require('rss');
let url = 'https://www.sedaily.com/NewsList/GA01';
var param = {};
var SERVER_PORT = 33033

// 서버설정
var http= require('http');
function onRequest(request, response) {
    client.fetch(url, param, function(err, $, res){
        if (err){
            logger.error(err);
            response.writeHead(500);
            response.end('Internal Server Error');

            return;
        }
        // 뉴스 RSS 설정 
        var feed = new RSS({
            title: '서울경제 국내증시 RSS',
            description: '서울경제 국내증시 RSS',
            author: 'rbits',
            site_url: 'https://sedaily.com',
            image_url: 'https://img.sedaily.com/Html/common/new_logo.png',
            pubDate: new Date().toISOString(),
            language: 'KR'
        });
        
        // 896252255:AAGU_ctxRPHoa3G_Oert32je-WVggnS-UIE
            // RSS item iterator
        $('.news_list li').each(function(post){
            let author = $(this).find('div dl dd[class=name] span').first().text();
            if(author.indexOf('양한나') != -1){

                let not_used_image = $(this).find('p a img').first().attr('src');
                feed.item({
                    title: $(this).find('div dl dt').text(),
                    description: $(this).find('div dl dd').first().next().text(),
                    url: 'https://www.sedaily.com' + $(this).find('div dl dd').first().next().find('a').first().attr('href'),
                    author: $(this).find('div dl dd[class=name] span').first().text(),
                    date: $(this).find('div dl dd[class=name] span[class=letter]').first().text()
                });
            }
        });
        

        // logger.debug(JSON.stringify(feed, null, 4));

        response.writeHead(200, {'Content-Type': 'text/xml'})
        response.write(feed.xml());
        response.end();
    });
}
    
http.createServer(onRequest).listen(SERVER_PORT);
logger.info('[ ] RSS 뉴스레터 서버 시작');


