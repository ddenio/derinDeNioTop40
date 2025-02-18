import '../src/css/style.css'

import { Client, Databases, ID } from "appwrite";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67b40d72002657ee59f5');

const databases = new Databases(client);

const form = document.querySelector('form')

form.addEventListener('submit', addSong)

function addSong(e){
  e.preventDefault()
  const song = databases.createDocument(
    '67b40e1f0009fb11ac1a',
    '67b40e7a0011a8bb16f5',
    ID.unique(),
    { "artist-name": e.target.artistName.value,
      "song-name": e.target.songName.value,
      "song-year": e.target.songYear.value
     }
  );
  song.then(function (response) {
    addSongsToDom()
  }, function (error) {
      console.log(error);
  });
  form.reset()
}

async function addSongsToDom() {
  document.querySelector('ul').innerHTML = "";
  let response = await databases.listDocuments(
      '67b40e1f0009fb11ac1a',
      '67b40e7a0011a8bb16f5',
  );

  // Store songs in an array so they can be sorted later
  let songsArray = response.documents.map((song, index) => {
      const li = document.createElement('li');
      
      const songNumber = document.createElement('span');
      songNumber.textContent = `${index + 1}.`;

      const artistName = document.createElement('span');
      artistName.textContent = song['artist-name'];

      const songName = document.createElement('span');
      songName.textContent = song['song-name'];

      const songYear = document.createElement('span');
      songYear.textContent = song['song-year'];

      // Initialize upvote value as 1
      let upvoteValue = song.upvoteValue || 1; // Use existing upvote value from backend or default to 1
      
      // Display upvote value next to the song year
      const upvoteDisplay = document.createElement('span');
      upvoteDisplay.textContent = ` Upvotes: ${upvoteValue}`;

      const upVote = document.createElement('button'); 
      upVote.innerHTML = '<i class="fa fa-thumbs-up"></i>';
      const downVote = document.createElement('button'); 
      downVote.innerHTML = '<i class="fa fa-thumbs-down"></i>';

      upVote.classList.add('vote-btn', 'upvote-btn');
      downVote.classList.add('vote-btn', 'downvote-btn');

      // Function to increase upvote
      upVote.addEventListener('click', async () => {
          upvoteValue++;
          upvoteDisplay.textContent = ` Upvotes: ${upvoteValue}`;
          await updateSongInBackend(song.$id, upvoteValue); // Update backend with new upvote value
          updateSongOrder(songsArray); // Update order when upvote is clicked
      });

      // Function to decrease upvote (but not below 0)
      downVote.addEventListener('click', async () => {
          if (upvoteValue > 0) {
              upvoteValue--;
              upvoteDisplay.textContent = ` Upvotes: ${upvoteValue}`;
              await updateSongInBackend(song.$id, upvoteValue); // Update backend with new upvote value
          }
          updateSongOrder(songsArray); // Update order when downvote is clicked
      });

      li.appendChild(songNumber); 
      li.appendChild(artistName);
      li.appendChild(songName);
      li.appendChild(songYear);
      li.appendChild(upvoteDisplay);

      const voteContainer = document.createElement('div');
      voteContainer.appendChild(upVote);
      voteContainer.appendChild(downVote);

      li.appendChild(voteContainer);

      return {
          li, 
          upvoteValue,  // Store upvote value with the song
          songData: song
      };
  });

  // Function to update song order based on upvotes
  function updateSongOrder(songsArray) {
      // Sort songs by upvote value in descending order
      songsArray.sort((a, b) => b.upvoteValue - a.upvoteValue);
      
      // Rebuild the list with sorted songs
      const ul = document.querySelector('ul');
      ul.innerHTML = ""; // Clear the list before adding sorted items
      songsArray.forEach(song => {
          ul.appendChild(song.li); // Add sorted songs back to the DOM
      });
  }

  // Function to update song in backend (e.g., to update the upvote value)
  async function updateSongInBackend(songId, newUpvoteValue) {
      try {
          // Send API request to update the song in the backend
          await databases.updateDocument(
              '67b40e1f0009fb11ac1a', // Database ID
              '67b40e7a0011a8bb16f5', // Collection ID
              songId, // Use the song's $id field as the document ID
              { upvoteValue: newUpvoteValue } // New data to update
          );
      } catch (error) {
          console.error('Error updating song in backend:', error);
      }
  }

  // Initially render the songs in the sorted order
  updateSongOrder(songsArray);
}


//addSongsToDom()
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
