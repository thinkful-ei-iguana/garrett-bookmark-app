/* eslint-disable no-unused-vars */
/* global STORE, API */

const BOOKMARKS = (function() {

  function ratingGenerator(rating) {
    switch(rating) {
    case 1:
      return '★☆☆☆☆';
    case 2:
      return '★★☆☆☆';
    case 3:
      return '★★★☆☆';
    case 4:
      return '★★★★☆';
    case 5:
      return '★★★★★';
    default:
      return 'No Rating';
    }
  }

  function generateBookmark(bookmark) {
    if (!bookmark.expanded) {
      return `
        <li class="bookmark-list-item" id="${bookmark.id}">
          <div class="bookmark-list-item-condensed-view">
            <div class="condensed-view-title">${bookmark.title}</div>
            <div class="condensed-view-rating">${ratingGenerator(bookmark.rating)}</div>
          </div>
        </li>
      `;
    }
    else {
      return `
        <li class="bookmark-list-item" id="${bookmark.id}">
          <div class="bookmark-list-item-expanded-view">
            <div class="expanded-view-title">${bookmark.title}</div>
            <div class="expanded-view-rating">${ratingGenerator(bookmark.rating)}</div>
            <div class="expanded-view-url"><a href="${bookmark.url}" target="_blank">Visit Site</a></div>
            <div class="expanded-view-desc">${bookmark.desc}</div>
          </div>
          <div class="expanded-view-controls">
            <button class="expanded-view-controls-delete-button">Delete</button>
          </div>
        </li>
      `;
    }
  }

  function generateFullBookmarksList(bookmarksInStore) {
    const bookmarks = bookmarksInStore.map(bookmark => generateBookmark(bookmark));
    return `
      <ul class="bookmark-list">
        ${bookmarks.join('')}
      </ul>
    `;
  }

  function generateNewBookmarkForm() {
    return `
      <form id="new-bookmark-form">
        <input type="button" value="X" class="form-close-button">
        <fieldset>
          <legend>Add Bookmark</legend>
          <label for="form-title-field">Title</label>
          <input type="text" name="title" id="form-title-field" required>
          <label for="form-url-field">URL</label>
          <input type="text" name="url" id="form-url-field" placeholder="https://" required>
          <label for="form-rating-field">Rating</label>
          <select name="rating" id="form-rating-field">
            <option value="-1">-- Please Rate this Bookmark --</option>
            <option value="1">★ - 1 star</option>
            <option value="2">★★ - 2 stars</option>
            <option value="3">★★★ - 3 stars</option>
            <option value="4">★★★★ - 4 stars</option>
            <option value="5">★★★★★ - 5 stars</option>
          </select>
          <label for="form-desc-field">Description</label>
          <textarea name="desc" id="form-desc-field"></textarea>
        </fieldset>
        <div class="form-controls">
          <input type="reset" value="Delete Bookmark" class="form-reset-button">
          <input type="submit" value="Add Bookmark" class="form-submit-button">
        <div class="form-controls">
      </form>
    `;
  }

  function render() {
    if (!STORE.isAdding) {
      document.querySelector('.main-controls').removeAttribute('hidden');
      let bookmarksInStore = [ ...STORE.bookmarks ];
      bookmarksInStore = bookmarksInStore.filter(bookmark => bookmark.rating >= STORE.filterBy);
      const fullBookmarksList = generateFullBookmarksList(bookmarksInStore);
      $('.content-view').html(fullBookmarksList);
    }
    else {
      document.querySelector('.main-controls').setAttribute('hidden', true);
      const newBookmarkForm = generateNewBookmarkForm();
      $('.content-view').html(newBookmarkForm);
    }
  }

  function getIDFromElement(bookmark) {
    return $(bookmark).closest('.bookmark-list-item').attr('id');
  }

  function formDataToObject(form) {
    const formData = new FormData(form);
    const obj = {};
    formData.forEach((val, name) => obj[name] = val);
    return obj;
  }

  function makeValidInputURL(inputURL) {
    if (!/^https?:\/\//i.test(inputURL)) {
      return 'https://' + inputURL;
    }
    return inputURL;
  }

  // --------------------------- EVENT LISTENERS --------------------------

  function handleAddClicked() {
    $('.main-controls').on('click', '.main-controls-add-button', () => {
      STORE.toggleIsAdding();
      render();
    });
  }

  function handleAdding_SubmitClicked() {
    $('.content-view').on('submit', '#new-bookmark-form', event => {
      event.preventDefault();
      const formElement = document.querySelector('#new-bookmark-form');
      const formObj = formDataToObject(formElement);
      formObj.url = makeValidInputURL(formObj.url); // prepend 'https://' if it doesn't exist
      API.createBookmark(formObj)
        .then(bookmarkOnServer => {
          return STORE.add(bookmarkOnServer);
        })
        .then(bookmarkOnStore => {
          STORE.findAndUpdate(STORE.currentExpandedID, { expanded: false });
          STORE.findAndUpdate(bookmarkOnStore.id, { expanded: true });
          STORE.setCurrentExpandedID(bookmarkOnStore.id);
          STORE.toggleIsAdding();
          render();
        });
    });
  }

  function handleAdding_CloseClicked() {
    $('.content-view').on('click', '.form-close-button', () => {
      STORE.toggleIsAdding();
      render();
    });
  }

  function handleFilterSelected() {
    $('.main-controls').on('change', '#main-controls-filter-select', () => {
      const rating = $('#main-controls-filter-select').val();
      STORE.setFilterBy(rating);
      render();
    });
  }

  function handleCondenseClicked() {
    $('.content-view').on('click', '.bookmark-list-item-expanded-view', event => {
      const bookmarkID = getIDFromElement(event.currentTarget);
      STORE.findAndUpdate(bookmarkID, { expanded: false });
      STORE.setCurrentExpandedID(null);
      render();
    });
  }

  function handleExpandClicked() {
    $('.content-view').on('click', '.bookmark-list-item-condensed-view', event => {
      STORE.findAndUpdate(STORE.currentExpandedID, { expanded: false });
      const bookmarkID = getIDFromElement(event.currentTarget);
      STORE.findAndUpdate(bookmarkID, { expanded: true });
      STORE.setCurrentExpandedID(bookmarkID);
      render();
    });
  }

  function handleExpanded_DeleteClicked() {
    $('.content-view').on('click', '.expanded-view-controls-delete-button', event => {
      const bookmarkID = getIDFromElement(event.currentTarget);
      API.deleteBookmark(bookmarkID)
        .then(() => {
          STORE.findAndDelete(bookmarkID);
          render();
        });
    });
  }

  function bindEventListeners() {
    handleAddClicked();
    handleAdding_SubmitClicked();
    handleAdding_CloseClicked();
    handleFilterSelected();
    handleCondenseClicked();
    handleExpandClicked();
    handleExpanded_DeleteClicked();
  }

  return {
    render,
    bindEventListeners
  };
}());