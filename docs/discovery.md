# Discovery behavior and limits

[Back to the README](../README.md)

Genres use OR matching (up to three). Choosing a genre other than Horror excludes horror hybrids; choosing Horror or “Open to anything” permits them. Recent means the last five years; classics precede 2000. Films must have English as their original language, be released, have at least 50 votes, and satisfy the chosen runtime range. Genre, language and date constraints are checked again before results reach the browser. These are filtered TMDB suggestions, not an AI recommendation model.

Pagination removes duplicate films and skips up to three empty/duplicate pages per request batch. A sparse batch preserves the cursor and offers a Load more action, avoiding an unbounded request loop. Closing the feed returns to the current preferences. Reloading clears the in-memory discovery session.

Only the current and next trailers request metadata. The next iframe is prepared after the current trailer starts or cannot play; old players are destroyed, and inactive/hidden players pause. YouTube owns playback controls, buffering, ads and availability. Autoplay starts muted when permitted. Preparation cannot guarantee that the next video is fully buffered. Swipe outside the embedded player to change films; keyboard arrows and navigation buttons are also available.

Watchlists hold up to 500 films on this browser, without cross-device sync. If storage is unavailable, saving works for the current visit. No account is required.
