// Import the appropriate service and chosen wrappers
import { Card, Collection, conversation, Image, List, Media, Simple, Suggestion, Table } from '@assistant/conversation';
import { MediaType, Mode, OptionalMediaControl } from '@assistant/conversation/dist/api/schema';
import { AuthHeaderProcessor } from '@assistant/conversation/dist/auth';
import { ASSISTANT_LOGO_IMAGE, buildEntriesList, buildItemsList, decodeUser, handleAddTasks, MongoClientConnection } from './utils';
import { CreateNewTask } from './utils';

const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require('fs')

// Create an app instance
const app = conversation({
    debug: true,

});
let mongoClient: MongoClientConnection;


// Register handlers for Actions SDK
const expressApp = express().use(bodyParser.json());

// Simple
app.handle('simple', (conv) => {
    conv.add(new Simple({
        speech: 'This is the first simple response.',
        text: 'This is the 1st simple response.',
    }));
    conv.add(new Simple({
        speech: 'This is the last simple response.',
        text: 'This is the last simple response.',
    }));
});

// Image
app.handle('image', (conv) => {
    conv.add('This is an image prompt!');
    conv.add(ASSISTANT_LOGO_IMAGE);
});

// Card
app.handle('card', (conv) => {
    conv.add('This is a card.');
    conv.add(new Card({
        'title': 'Card Title',
        'subtitle': 'Card Subtitle',
        'text': 'Card Content',
        'image': ASSISTANT_LOGO_IMAGE,
    }));
});

// Table
app.handle('table', (conv) => {
    conv.add('This is a table.');
    conv.add(new Table({
        'title': 'Table Title',
        'subtitle': 'Table Subtitle',
        'image': ASSISTANT_LOGO_IMAGE,
        'columns': [{
            'header': 'Column A',
        }, {
            'header': 'Column B',
        }, {
            'header': 'Column C',
        }],
        'rows': [{
            'cells': [{
                'text': 'A1',
            }, {
                'text': 'B1',
            }, {
                'text': 'C1',
            }],
        }, {
            'cells': [{
                'text': 'A2',
            }, {
                'text': 'B2',
            }, {
                'text': 'C2',
            }],
        }, {
            'cells': [{
                'text': 'A3',
            }, {
                'text': 'B3',
            }, {
                'text': 'C3',
            }],
        }],
    }));
});

// Collection
app.handle('collection', (conv) => {
    conv.add('This is a collection.');
    // Override prompt_option Type with display
    // information for Collection items.
    conv.session.typeOverrides = [{
        name: 'prompt_option',
        mode: Mode.TypeReplace,
        synonym: {
            entries: [
                {
                    name: 'ITEM_1',
                    synonyms: ['Item 1', 'First item'],
                    display: {
                        title: 'Item #1',
                        description: 'Description of Item #1',
                        image: ASSISTANT_LOGO_IMAGE,
                    },
                },
                {
                    name: 'ITEM_2',
                    synonyms: ['Item 2', 'Second item'],
                    display: {
                        title: 'Item #2',
                        description: 'Description of Item #2',
                        image: ASSISTANT_LOGO_IMAGE,
                    },
                },
                {
                    name: 'ITEM_3',
                    synonyms: ['Item 3', 'Third item'],
                    display: {
                        title: 'Item #3',
                        description: 'Description of Item #3',
                        image: ASSISTANT_LOGO_IMAGE,
                    },
                },
                {
                    name: 'ITEM_4',
                    synonyms: ['Item 4', 'Fourth item'],
                    display: {
                        title: 'Item #4',
                        description: 'Description of Item #4',
                        image: ASSISTANT_LOGO_IMAGE,
                    },
                },
            ],
        },
    }];
    conv.add(new Collection({
        title: 'Collection Title',
        subtitle: 'Collection subtitle',
        items: [
            {
                key: 'ITEM_1',
            },
            {
                key: 'ITEM_2',
            },
            {
                key: 'ITEM_3',
            },
            {
                key: 'ITEM_4',
            },
        ],
    }));
});

// List
app.handle('list', (conv) => {
    conv.add('This is a list.');
    // Override prompt_option Type with display
    // information for List items.
    conv.session.typeOverrides = [{
        name: 'prompt_option',
        mode: Mode.TypeReplace,
        synonym: {
            entries: [
                {
                    name: 'ITEM_1',
                    synonyms: ['Item 1', 'First item'],
                    display: {
                        title: 'Item #1',
                        description: 'Description of Item #1',
                        image: ASSISTANT_LOGO_IMAGE,
                    },
                },
                {
                    name: 'ITEM_2',
                    synonyms: ['Item 2', 'Second item'],
                    display: {
                        title: 'Item #2',
                        description: 'Description of Item #2',
                        image: ASSISTANT_LOGO_IMAGE,
                    },
                },
                {
                    name: 'ITEM_3',
                    synonyms: ['Item 3', 'Third item'],
                    display: {
                        title: 'Item #3',
                        description: 'Description of Item #3',
                        image: ASSISTANT_LOGO_IMAGE,
                    },
                },
                {
                    name: 'ITEM_4',
                    synonyms: ['Item 4', 'Fourth item'],
                    display: {
                        title: 'Item #4',
                        description: 'Description of Item #4',
                        image: ASSISTANT_LOGO_IMAGE,
                    },
                },
            ],
        },
    }];
    conv.add(new List({
        title: 'List title',
        subtitle: 'List subtitle',
        items: [
            {
                key: 'ITEM_1',
            },
            {
                key: 'ITEM_2',
            },
            {
                key: 'ITEM_3',
            },
            {
                key: 'ITEM_4',
            },
        ],
    }));
});

// Option
app.handle('option', (conv) => {
    const selectedOption = conv.session.params?.prompt_option
        .toLowerCase()
        .replace(/_/g, ' #');
    conv.add(`You selected ${selectedOption}.`);
});

// Media
app.handle('media', (conv) => {
    conv.add('This is a media response');
    conv.add(new Media({
        mediaObjects: [
            {
                name: 'Media name',
                description: 'Media description',
                url: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg',
                image: {
                    large: ASSISTANT_LOGO_IMAGE,
                }
            }
        ],
        mediaType: MediaType.Audio,
        optionalMediaControls: [OptionalMediaControl.Paused, OptionalMediaControl.Stopped]
    }));
});

// Media Status
app.handle('media_status', (conv) => {
    const mediaStatus = conv.intent.params?.MEDIA_STATUS.resolved;
    switch (mediaStatus) {
        case 'FINISHED':
            conv.add('Media has finished playing.');
            break;
        case 'FAILED':
            conv.add('Media has failed.');
            break;
        case 'PAUSED' || 'STOPPED':
            conv.add(new Media({
                mediaType: MediaType.MediaStatusACK
            }));
            break;
        default:
            conv.add('Unknown media status received.');
    }
});



// Add a get Response for the assistant
expressApp.get('/', (req: any, res: any) => {
    res.status(200).json({ message: "This is the google assistant" });
});


// Post the fulfillment handler for the Google Assistant
expressApp.post('/fulfillment', app);


// Starting the App
const PORT = process.env.PORT || 3000;

expressApp.listen(PORT, () => {
    mongoClient = new MongoClientConnection();

    mongoClient.connect().then(() => {
        console.log("App is running on port " + PORT);
        console.log("Database is connected");

    })
});

