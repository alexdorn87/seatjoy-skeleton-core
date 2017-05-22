import { MongoClient, Db } from 'mongodb';
require('source-map-support').install();
let path = require('path')

import { ILuisModelMap, IAddress, IIdentity, ChatConnector, IPromptConfirmResult, IPromptChoiceResult, Session, Message, IEntity, IDialogResult, UniversalBot, IntentRecognizerSet } from 'botbuilder';
import * as builder from 'botbuilder';
import { Api } from './lib/api';
import * as _ from 'lodash';
import * as async from 'async';
import * as moment from 'moment';
import * as uuid from 'uuid/v1';

import * as imagesServer from './lib/imagesServer';
import * as info from './lib/info';
import { List } from 'linqts';
import { User } from '@connie/modules/dist/users';

import * as cmanalytics from '@connie/modules/dist/analytics';
import * as cmusers from '@connie/modules/dist/users';
import * as cmbotframework from '@connie/modules/dist/botframework';
import * as cmproactive from '@connie/modules/dist/proactive';
import * as cmfacebok from '@connie/modules/dist/facebook';
import * as cmconversation from '@connie/modules/dist/conversation';
import * as cmerrors from '@connie/modules/dist/errors';
import * as cmi18n from '@connie/modules/dist/i18n';

import * as express from 'express';
import * as bodyparser from 'body-parser';

interface IOptionsArgs {
    message: string;
}

let connector = new ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

let api: Api;

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
    MongoClient.connect(process.env.DB_URI).then((db) => {
        startBot(db);
    });
}
else {
    startBot(null);
}

function startBot(db: Db) {
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