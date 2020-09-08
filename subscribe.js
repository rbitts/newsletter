var logger = require('./logger');
var request = require('request');
var Parser = require('rss-parser'); // RSS 파서 
var parser = new Parser();

const fs = require('fs');

const DB_PATH = './feed.db';        // 피드를 저장할 DB 파일명
const INTERVAL = 5 * 1000;          // 5초에 한번씩 실행 

// 하루 단위로 디비를 삭제하기 위해서 실행시 삭제 crontab에 restart 등록 
//try {
//    fs.unlinkSync(DB_PATH);
//} catch (error) {
//    logger.error(error);
//}

const token = fs.readFileSync('.token', 'utf8');
// const chat_id = '402428760';
const chat_id = '-1001400016267';


var Model = require('./feed_model');
var model = new Model(DB_PATH);
const sendMessage = (text, callback) => {
    const options = {
        url: `https://api.telegram.org/bot${token}/sendmessage`,
        form: { text: text, chat_id: chat_id }
    };

    request.post(options, (error) => {
        if (error) {
            return callback(error);
        }
        logger.info(options.url);

        callback();
    });
};

let subscribe = setInterval(() => {
    (async () => {
        let feed = await parser.parseURL('http://sedaily.rbits.duckdns.org');
        feed.items.forEach(item => {
            model.getByUrl(item.link).then(v => {
                // 새로 입력되는 피드가 있을 시 db 입력 및 텔레그램 공지 
                if (!v) {
                    model.add(item.link, JSON.stringify(item));
                    let message = item.title + '\n' + item.link;
                    sendMessage(message, (error) => {
                        if (error) {
                            logger.error(`send error: ${error}`);
                        }
                    });
                }
            });
        });
    })();
}, INTERVAL);
