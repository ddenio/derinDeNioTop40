import './style.css'

import { Client, Databases, ID } from "appwrite";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67b40d72002657ee59f5');

const databases = new Databases(client);

const promise = databases.createDocument(
    '67b40e1f0009fb11ac1a',
    '67b40e7a0011a8bb16f5',
    ID.unique(),
    { "title": "Hamlet" }
);

promise.then(function (response) {
    console.log(response);
}, function (error) {
    console.log(error);
});
