//import './style.css'

import { Client, Databases, ID } from "appwrite";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67b40d72002657ee59f5');

const databases = new Databases(client);

const form = document.querySelector('form')

form.addEventListener('submit', addSong)

function addSong(e){
  e.preventDefault()
  const promise = databases.createDocument(
    '67b40e1f0009fb11ac1a',
    '67b40e7a0011a8bb16f5',
    ID.unique(),
    { "artist-name": e.target.artistName.value,
      "song-name": e.target.songName.value,
      "song-year": e.target.songYear.value
     }
  );
  promise.then(function (response) {
    console.log(response);
  }, function (error) {
      console.log(error);
  });
  form.reset()
}

async function addSongsToDom(){
    let response = await databases.listDocuments(
      '67b40e1f0009fb11ac1a',
      '67b40e7a0011a8bb16f5',
  );
  //console.log(response.documents[0])
  response.documents.forEach((song)=>{
    const li = document.createElement('li')
    li.textContent = `${song['artist-name']} ${song['song-name']} ${song['song-year']}`
    document.querySelector('ul').appendChild(li)
  })


  // promise.then(function (response) {
  //     console.log(response);
  // }, function (error) {
  //     console.log(error);
  // });
}


addSongsToDom()
// const promise = databases.createDocument(
//     '67b40e1f0009fb11ac1a',
//     '67b40e7a0011a8bb16f5',
//     ID.unique(),
//     { "title": "Hamlet" }
// );

// promise.then(function (response) {
//     console.log(response);
// }, function (error) {
//     console.log(error);
// });
