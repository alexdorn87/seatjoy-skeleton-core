let path = require('path')
import { ChatConnector, Session, Message, UniversalBot } from 'botbuilder';
import * as builder from 'botbuilder';
import * as express from 'express';
import * as bodyparser from 'body-parser';
import * as cmfacebok from '@connie/modules/dist/facebook';

interface IOptionsArgs {
    message: string;
}

let connector = new ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


// bot
let bot = new UniversalBot(connector);

bot.set('localizerSettings', { botLocalePath: path.join(__dirname, '../locale') });

// dialogs

let intents = new builder.IntentDialog();

bot.dialog('/', intents)

intents
    .matches(/\/getstarted/, '/getstarted') //for testing purposes
    .onDefault('/None')


// root dialogs

bot.dialog('/None', (session: Session, args) => {
    session.endConversation("Sorry, I didn't get that")
})

// Facebook specific dialgos

// answer get started postback
bot.beginDialogAction('getstarted', '/getstarted');

// set the dialog itself.
bot.dialog('/getstarted', [
    (session, args) => {
        session.send("Greetings %s!", session.message.user.name.split(' ')[0]);
        session.endDialog();
    }
]);


// hard reset
bot.endConversationAction('forget', 'Converation deleted.', { matches: /^forget/i });

// versioning 
bot.use(builder.Middleware.dialogVersion({ version: 2, resetCommand: /^reset/i }));

if (process.env.DB_URI) {
    // MongoClient.connect(process.env.DB_URI).then((db) => {
    //     startBot(db);
    // });
}
else {
    startBot(null);
}

function startBot(db) {
    let server = express()

    server.use(bodyparser.json())

    // this is for localtunnel
    server.get('/', (req, res) => res.send('hello'))

    // Handle Bot Framework messages
    server.post('/api/messages', connector.listen());

    //
    cmfacebok.install(bot,
        {
            FACEBOOK_PAGE_TOKEN: process.env.FACEBOOK_PAGE_TOKEN,
            menu:
            [
                {
                    locale: 'default',
                    call_to_actions:
                    [
                        {
                            type: 'postback',
                            title: 'Language / Idioma',
                            payload: 'action?changelanguage'
                        }
                    ]
                }
            ],
            greetingText:
            [
                {
                    locale: "default",
                    text: process.env.WELCOME_MESSAGE_DEFAULT
                },
                {
                    locale: "es_la",
                    text: process.env.WELCOME_MESSAGE_DEFAULT_ES_LA
                },
                {
                    locale: "es_es",
                    text: process.env.WELCOME_MESSAGE_DEFAULT_ES_ES
                }
            ],
            getStarted: 'action?getstarted'
        });

    const listener = server.listen(process.env.PORT, function () {

        console.log('Bot started listening on', listener.address().address, listener.address().port);
    })
}