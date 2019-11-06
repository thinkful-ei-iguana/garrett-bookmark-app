/* global BOOKMARKS, STORE, API */
$(() => {
  BOOKMARKS.bindEventListeners();
  API.getAllBookmarks()
    .then(allBookmarks => {
      allBookmarks.forEach(bookmark => STORE.add(bookmark));
      BOOKMARKS.render();
    })
    .catch(error => console.error(`${error.code} ${error.message}`));
});