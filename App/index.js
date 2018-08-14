
const youtube=require('./youtube.js');
const youtubedl=require('./youtube-dl.js')
const dynamo=require('./dynamo.js');
const firebase=require('./firebase.js')



function getItemsToDelete(savedItems,currentItems){
  var currentItemsIds = currentItems.map(a => a.id);
  var itemsToDelete=[];
  savedItems.forEach(savedItem => {
    if (!currentItemsIds.includes(savedItem.id)){
        itemsToDelete.push(savedItem);
    }
  });
  return itemsToDelete;
}
function getItemById(items,id){
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id==id)
      return item;
  }
  return null;
}

(async ()=>{
  var playlistId='PLJLM5RvmYjvxaMig-iCqA9ZrB8_gg6a9g';
  var savedItems=await dynamo.getyoutubePlaylistAsync(playlistId);
  var currentItems=await youtube.getPlaylistinfoAsync(playlistId);
  await deleteItems(savedItems, currentItems);
  await updateAndAddNewItems(currentItems, savedItems);
  await dynamo.updateyoutubePlaylistAsync(playlistId,currentItems);
  console.log(JSON.stringify(currentItems));
})();

async function deleteItems(savedItems, currentItems) {
  var itemsToDelete = getItemsToDelete(savedItems, currentItems);
  for (let index = 0; index < itemsToDelete.length; index++) {
    const itemToDelete = itemsToDelete[index];
    await firebase.deleteFileAsync(itemToDelete.bucketFileName);
  }
}

async function updateAndAddNewItems(currentItems, savedItems) {
  var itemsWithError = await processAndGetItemsWithError();
  for (let index = 0; index < itemsWithError.length; index++) {
    const itemWithError = itemsWithError[index];
    remove(currentItems,itemWithError);
  }
  function remove(array, element) {
    const index = array.indexOf(element);
    array.splice(index, 1);
  }
  

  async function processAndGetItemsWithError() {
    var itemsWithError = [];
    for (let index = 0; index < currentItems.length; index++) {
      const currentItem = currentItems[index];
      var savedItem = getItemById(savedItems, currentItem.id);
      if (savedItem) {
        currentItem.url = savedItem.url;
        currentItem.bucketFileName = savedItem.bucketFileName;
      }
      else {
        try {
          var localFile = await youtubedl.downloadVideoAsync(currentItem.id);
          var result = await firebase.uploadFileAsync(localFile);
          currentItem.url = result.downloadurl;
          currentItem.bucketFileName = result.fileName;
        }
        catch (error) {
          itemsWithError.push(currentItem);
        }
      }
    }
    return itemsWithError;
  }
}


