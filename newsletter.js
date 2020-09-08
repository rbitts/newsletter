var client = require('cheerio-httpcli');

// 로거 
var winston = require('winston');
require('winston-daily-rotate-file');
require('date-utils');

const logger = winston.createLogger({
    level: 'debug', // 최소 레벨
    // 파일저장
    transports: [
        new winston.transports.DailyRotateFile({
            filename : 'log.log', // log 폴더에 system.log 이름으로 저장
            zippedArchive: false, // 압축여부
            maxFiles: '2d',       // 2일만 저장
            maxSize: '10m',       // 10M만 저장
            options: {flags: 'w'}, // W
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        }),
        // 콘솔 출력
        new winston.transports.Console({
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        })
    ]
});


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
            pubDate: new Date().toISOString(),
            language: 'KR'
        });
        
        // RSS item iterator
        $('.news_list li').each(function(post){
            let not_used_image = $(this).find('p a img').first().attr('src');
            feed.item({
                title: $(this).find('div dl dt').text(),
                description: $(this).find('div dl dd').first().next().text(),
                url: 'https://www.sedaily.com/' + $(this).find('div dl dd').first().next().find('a').first().attr('href'),
                author: $(this).find('div dl dd[class=name] span').first().text(),
                date: $(this).find('div dl dd[class=name] span[class=letter]').first().text()
            });
        });
        
        // logger.debug(JSON.stringify(feed, null, 4));

        response.writeHead(200, {'Content-Type': 'text/xml'})
        response.write(feed.xml());
        response.end();
    });
}
    
http.createServer(onRequest).listen(SERVER_PORT);
logger.info('[ ] RSS 뉴스레터 서버 시작');


