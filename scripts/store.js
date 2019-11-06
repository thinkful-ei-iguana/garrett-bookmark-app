/* eslint-disable no-unused-vars */
const STORE = (function() {

  function add(bookmark) {
    Object.assign(bookmark, { expanded: false });
    this.bookmarks.unshift(bookmark);
    return bookmark;
  }

  function findById(id) {
    return this.bookmarks.find(bookmark => bookmark.id === id);
  }

  function findAndDelete(id) {
    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
  }

  function findAndUpdate(id, newData) {
    const bookmark = this.findById(id);
    if (bookmark !== undefined) {
      Object.assign(bookmark, newData);
    }
  }

  function toggleIsAdding() {
    this.isAdding = !this.isAdding;
  }

  function setFilterBy(rating) {
    this.filterBy = rating;
  }

  function setCurrentExpandedID(id) {
    this.currentExpandedID = id;
  }

  return {
    bookmarks: [],
    isAdding: false,
    filterBy: -1,
    currentExpandedID: null,
    add,
    findById,
    findAndDelete,
    findAndUpdate,
    toggleIsAdding,
    setFilterBy,
    setCurrentExpandedID
  };
}());