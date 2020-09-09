var client = require('cheerio-httpcli');
var RSS = require('rss');
var util = require('util')
var logger = require('./logger');

let SITE_URL = 'http://fishingi.net'
let MONTH = 11;
let REST_URL = util.format('/index.php?mid=bk&year=2020&month=%s&day=01#list', MONTH);

var param = {};
var SERVER_PORT = 33034

// 서버설정
var http= require('http');
function onRequest(request, response) {
    client.fetch(SITE_URL + REST_URL, param, function(err, $, res){
        if (err){
            logger.error(err);
            response.writeHead(500);
            response.end('Internal Server Error');

            return;
        }
        // 뉴스 RSS 설정 
        var feed = new RSS({
            title: '낚시 예약 RSS',
            description: '낚시 예약 RSS - 월별',
            author: 'rbits',
            pubDate: new Date().toISOString(),
            language: 'KR'
        });
        
        // RSS item iterator
        $('.r_mytable').each(function(day){
            let reserve_date = $(this).find('tr > td').first().text().trim();
            $(this).children('tr:nth-child(n+4)').each(function(boat){
                let name = $(this).find('td > span').first().text().trim()
                let reserve = $(this).find('td > a').length > 0 ? true : false;
                let rest = $(this).find('td').last().text().trim();
                if(reserve) {
                    let link = $(this).find('td > a').attr('onclick');
                    let link_url = SITE_URL + link.match(/f_popup\(\'(.*)\', \'bk\', \'800\', \'1000\'\)/)[1];
                    feed.item({
                        title: reserve_date + ' ' + name + ' 예약정보',
                        description:
                            '선박명: ' + name + '\n' +
                            '예약: ' + reserve ? '예약가능' : '예약불가' + '\n' + 
                            '남은자리: ' + rest + '\n',
                        url: link_url,
                        author: 'rbits',
                        date: reserve_date
                    });
                }
            });
        });
        
        // logger.debug(JSON.stringify(feed, null, 4));

        response.writeHead(200, {'Content-Type': 'text/xml'})
        response.write(feed.xml());
        response.end();
    });
}
    
http.createServer(onRequest).listen(SERVER_PORT);
logger.info(util.format('[ ] 낚시 서버 RSS 시작 - 포트(%s)', SERVER_PORT));


