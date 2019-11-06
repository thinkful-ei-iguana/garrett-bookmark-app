/* eslint-disable no-unused-vars */
/* global STORE */

const API = (function() {

  const BASE_URL = 'https://thinkful-list-api.herokuapp.com/garrett/bookmarks';

  function fetchBookmarks(...args) {
    let error;
    return fetch(...args)
      .then(response => {
        if (!response.ok) {
          error = { code: response.status };
          if (!response.headers.get('content-type').includes('json')) {
            error.message = response.statusText;
            return Promise.reject(error);
          }
        }
        return response.json(); 
      })
      .then(data => {
        if (error) {
          error.message = data.message;
          return Promise.reject(error);
        } 
        return data;
      })
      .catch(error => console.error(`${error.code} ${error.message}`));
  }

  function getAllBookmarks() {
    return fetchBookmarks(`${BASE_URL}`);
  }

  function createBookmark(formObj) {
    const postData = {
      title: formObj.title,
      url: formObj.url,
      desc: formObj.desc,
      rating: null
    };
    if (formObj.rating !== '-1') {
      Object.assign(postData, {rating: formObj.rating});
    }
    return fetchBookmarks(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
  }

  function getBookmark(id) {
    return fetchBookmarks(`${BASE_URL}/${id}`);
  }

  function updateBookmark(id, updateData) {
    return fetchBookmarks(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
  }

  function deleteBookmark(id) {
    return fetchBookmarks(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    });
  }

  return {
    getAllBookmarks,
    createBookmark,
    getBookmark,
    updateBookmark,
    deleteBookmark
  };
}());