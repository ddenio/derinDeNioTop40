import '../src/css/style.css'

import { Client, Databases, ID } from "appwrite";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67b40d72002657ee59f5');

const databases = new Databases(client);

const form = document.querySelector('form');

form.addEventListener('submit', addSong);

function addSong(e) {
    e.preventDefault();
    const song = databases.createDocument(
        '67b40e1f0009fb11ac1a',
        '67b40e7a0011a8bb16f5',
        ID.unique(),
        {
            "artist-name": e.target.artistName.value,
            "song-name": e.target.songName.value,
            "song-year": e.target.songYear.value
        }
    );
    song.then(function (response) {
        loadSongsFromBackend(); // Reload the songs after adding
    }, function (error) {
        console.log(error);
    });
    form.reset();
}

async function loadSongsFromBackend() {
  const ul = document.querySelector('ul');
  ul.innerHTML = ""; // Clear any existing songs to avoid duplicates

  let response = await databases.listDocuments(
      '67b40e1f0009fb11ac1a', // Database ID
      '67b40e7a0011a8bb16f5', // Collection ID
  );

  // Store songs in an array so they can be sorted later
  let songsArray = response.documents.map((song) => {
      const li = document.createElement('li');

      const songNumber = document.createElement('span');
      songNumber.classList.add('song-number');
      songNumber.textContent = `#`;

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

          // Update the upvote value in the songArray
          const songIndex = songsArray.findIndex(s => s.songData.$id === song.$id);
          if (songIndex !== -1) {
              songsArray[songIndex].upvoteValue = upvoteValue;
          }

          updateSongOrder(); // Update order when upvote is clicked
      });

      // Function to decrease upvote (but not below 0)
      downVote.addEventListener('click', async () => {
          if (upvoteValue > 0) {
              upvoteValue--;
              upvoteDisplay.textContent = ` Upvotes: ${upvoteValue}`;
              await updateSongInBackend(song.$id, upvoteValue); // Update backend with new upvote value
          }

          // Update the upvote value in the songArray
          const songIndex = songsArray.findIndex(s => s.songData.$id === song.$id);
          if (songIndex !== -1) {
              songsArray[songIndex].upvoteValue = upvoteValue;
          }

          updateSongOrder(); // Update order when downvote is clicked
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

      // Return song data for sorting
      return {
          li,
          upvoteValue, // Store upvote value with the song
          songData: song
      };
  });

  // Function to update song order based on upvotes
  function updateSongOrder() {
      // Sort songs by upvote value in descending order
      songsArray.sort((a, b) => b.upvoteValue - a.upvoteValue);

      // Slice the array to only include the top 40 songs
      const top40Songs = songsArray.slice(0, 40);

      // Remove all existing songs from the DOM
      ul.innerHTML = "";

      // Re-add the sorted top 40 songs to the DOM
      top40Songs.forEach((song, index) => {
          song.li.querySelector('.song-number').textContent = `#${index + 1}`; // Update song number
          ul.appendChild(song.li); // Add sorted songs back to the DOM
      });
  }

  // Initially render the songs in the sorted order
  updateSongOrder();

  // Add the "visible" class for transition effect once songs are loaded
  ul.classList.add('visible');
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

// Call this function when the page loads to populate the list of songs
loadSongsFromBackend();
