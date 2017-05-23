﻿let path = require('path')
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
//1
bot.beginDialogAction('mainMenu', '/mainMenu');
//1.1
bot.beginDialogAction('menuOptions', '/menuOptions');
bot.beginDialogAction('regularMenu', '/regularMenu');
bot.beginDialogAction('specialsMenu', '/specialsMenu');
bot.beginDialogAction('snacksAndDrinksMenu', '/snacksAndDrinksMenu');
bot.beginDialogAction('saladsMenu', '/saladsMenu');
bot.beginDialogAction('moreFoodMenu', '/moreFoodMenu');
//Order
bot.beginDialogAction('order', '/order');
bot.beginDialogAction('confirmOrder', '/confirmOrder');


// set the dialog itself.
bot.dialog('/getstarted', [
    (session, args) => {
        session.send("Greetings %s!", session.message.user.name.split(' ')[0]);
        session.replaceDialog('/mainMenu');
    }
]);

bot.dialog('/mainMenu', [
    (session) => {
        var msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Order food")
                    .subtitle("Please take a look at our special menu!")
                    .images([
                        builder.CardImage.create(session, "http://imagizer.imageshack.us/295x166f/921/MBKvvN.png")
                            .tap(builder.CardAction.showImage(session, "http://imagizer.imageshack.us/295x166f/921/MBKvvN.png")),
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, 'menuOptions', null, 'View')
                    ])
            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/menuOptions', [
    (session) => {
        var msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Menu")
                    .subtitle("Our regular menu")
                    .images([
                        builder.CardImage.create(session, "https://imagizer.imageshack.us/480x317f/922/MxK7no.png")
                            .tap(builder.CardAction.showImage(session, "https://imagizer.imageshack.us/480x317f/922/MxK7no.png")),
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, 'regularMenu', null, 'View')
                    ]),
                new builder.HeroCard(session)
                    .title("Specials")
                    .subtitle("Our special menu")
                    .images([
                        builder.CardImage.create(session, "http://imagizer.imageshack.us/600x599f/924/sCC747.jpg")
                            .tap(builder.CardAction.showImage(session, "http://imagizer.imageshack.us/600x599f/924/sCC747.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, 'specialsMenu', null, 'View')
                    ]),
                new builder.HeroCard(session)
                    .title("Snacks & Drinks")
                    .subtitle("Snacks & drinks menu")
                    .images([
                        builder.CardImage.create(session, "http://whatisthaifood.com/wp-content/uploads/2013/05/Egg-Rolls-575x262.jpg")
                            .tap(builder.CardAction.showImage(session, "http://whatisthaifood.com/wp-content/uploads/2013/05/Egg-Rolls-575x262.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, 'snacksAndDrinksMenu', null, 'View')
                    ]),
                new builder.HeroCard(session)
                    .title("Salads")
                    .subtitle("Our salads menu")
                    .images([
                        builder.CardImage.create(session, "https://imagizer.imageshack.us/362x600f/923/pV0Ugi.jpg")
                            .tap(builder.CardAction.showImage(session, "https://imagizer.imageshack.us/362x600f/923/pV0Ugi.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, 'saladsMenu', null, 'View')
                    ]),
                new builder.HeroCard(session)
                    .title("More food")
                    .subtitle("We have more options for you")
                    .images([
                        builder.CardImage.create(session, "http://imagizer.imageshack.us/426x323f/924/tdYL0N.png")
                            .tap(builder.CardAction.showImage(session, "http://imagizer.imageshack.us/426x323f/924/tdYL0N.png")),
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, 'moreFoodMenu', null, 'View')
                    ]),
                new builder.HeroCard(session)
                    .title("")
                    .subtitle("")
                    //.images([
                    //    builder.CardImage.create(session, "https://imagizer.imageshack.us/480x317f/922/MxK7no.png")
                    //        .tap(builder.CardAction.showImage(session, "https://imagizer.imageshack.us/480x317f/922/MxK7no.png")),
                    //])
                    .buttons([
                        builder.CardAction.dialogAction(session, 'mainMenu', null, 'Back')
                    ])

            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/regularMenu', [
    (session) => {
        session.send('Select your choice:');
        let attachments = [];
        regularMenuItems.forEach(item => {
            let card = new builder.HeroCard(session)
                .title(item.itemName + ' ' + item.title)
                .subtitle(item.description)
                .images([
                    builder.CardImage.create(session, item.image)
                        .tap(builder.CardAction.showImage(session, item.image)),
                ])
                .buttons([
                    builder.CardAction.dialogAction(session, 'order', JSON.stringify(item), 'Select')
                ]);
            attachments.push(card);
        });

        var msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(attachments);
        session.endDialog(msg);
    }
]);

bot.dialog('/selectItemOptions', [
    (session, args) => {
        var item = args as IOrderDetails;
        session.userData.orderDetails = item;
        let choices = [];
        item.options.forEach(option => {
            choices.push(option.name + ' $' + option.price);
        });

        builder.Prompts.choice(session, 'Now, select your protein.', choices, { maxRetries: 0 });
    },
    (session, results) => {
        if (results.response) {
            let choiceSelected = session.userData.orderDetails.options[results.response.index];
            session.userData.orderDetails.options = [choiceSelected];
            session.beginDialog('/order', { data: JSON.stringify(session.userData.orderDetails) });
        }
    }
]);


bot.dialog('/order', [
    (session, args) => {
        let item = JSON.parse(args.data) as IOrderDetails;
        if (item.options.length > 1) {
            session.beginDialog('/selectItemOptions', item);
        }
        else {
            sendReceiptCard(session, JSON.parse(args.data) as IOrderDetails);
            session.endDialog();
        }
    }
]);

function sendReceiptCard(session: Session, orderDetails: IOrderDetails) {
    let totalPrice = orderDetails.price;

    let items = [];
    items.push(builder.ReceiptItem.create(session, '$ ' + orderDetails.price, orderDetails.itemName)
        .quantity('1')
        .image(builder.CardImage.create(session, orderDetails.image)));
    orderDetails.options.forEach(option => {
        items.push(builder.ReceiptItem.create(session, '$ ' + option.price, option.name)
            .quantity('1'));
        totalPrice += option.price;
    });

    let card = new builder.ReceiptCard(session)
        .title('Order details')
        .facts([
            builder.Fact.create(session, '1234', 'Order Number'),
            builder.Fact.create(session, 'VISA 5555-****', 'Payment Method')
        ])
        .items(items)
        .tax('$ ' + orderDetails.taxes)
        .total('$ ' + (totalPrice + orderDetails.taxes))
        .buttons([
            builder.CardAction.dialogAction(session, 'confirmOrder', null, 'Confirm')
        ]);


    // attach the card to the reply message
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
}


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
                            title: 'Menu',
                            payload: 'action?mainMenu'
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

interface IOrderDetails {
    itemName: string,
    title: string,
    description: string,
    price: number,
    taxes: number,
    image: string,
    options: IOrderOption[]
}


interface IOrderOption {
    name: string,
    price: number
}

var regularMenuItems: IOrderDetails[] = [
    {
        itemName: 'Pad Thai',
        title: '',
        description: 'Fresh stir-fried rice noodles with original homemade pad thai sauce, tofu, egg,',
        image: 'http://imagizer.imageshack.us/480x317f/922/MxK7no.png',
        price: 9,
        taxes: 0,
        options: [
            { name: 'Chicken 🐔', price: 1 },
            { name: 'Beef 🍖', price: 1 },
            { name: 'Shrimp 🦐', price: 2 },
            { name: 'Veggie 🍲', price: 0 }
        ]
    },
    {
        itemName: 'Pad Se Eew',
        title: '',
        description: 'Flat rice noodles stir fried in a soy based sauce with eggs, mixed with eggs,',
        image: 'http://imagizer.imageshack.us/461x308f/922/sSX8RA.png',
        price: 9,
        taxes: 0,
        options: [
            { name: 'Chicken 🐔', price: 1 },
            { name: 'Beef 🍖', price: 1 },
            { name: 'Shrimp 🦐', price: 2 },
            { name: 'Veggie 🍲', price: 0 }
        ]
    },
    {
        itemName: 'Green Curry',
        title: '',
        description: 'Curry includes coconut milk,cabbage,carrots,eggplant,beans,squash,basil.',
        image: 'http://imagizer.imageshack.us/480x317f/922/XYV5D1.png',
        price: 9,
        taxes: 0,
        options: [
            { name: 'Chicken 🐔', price: 1 },
            { name: 'Beef 🍖', price: 1 },
            { name: 'Shrimp 🦐', price: 2 },
            { name: 'Veggie 🍲', price: 0 }
        ]
    },
    {
        itemName: 'Yellow Curry',
        title: '',
        description: 'yellow curry sauce with patotoes served with a side of cucumber salad',
        image: 'http://imagizer.imageshack.us/600x450f/922/7Ut6Rt.jpg',
        price: 9,
        taxes: 0,
        options: [
            { name: 'Chicken 🐔', price: 1 },
            { name: 'Beef 🍖', price: 1 },
            { name: 'Shrimp 🦐', price: 2 },
            { name: 'Veggie 🍲', price: 0 }
        ]
    },
    {
        itemName: 'Masamun Curry',
        title: '',
        description: 'Brown curry sauce with coconut milk, onions, potatoes, pineapple, and peanuts',
        image: 'http://imagizer.imageshack.us/600x397f/923/U0Z8ZI.jpg',
        price: 9,
        taxes: 0,
        options: [
            { name: 'Chicken 🐔', price: 1 },
            { name: 'Beef 🍖', price: 1 },
            { name: 'Shrimp 🦐', price: 2 },
            { name: 'Veggie 🍲', price: 0 }
        ]
    }
];