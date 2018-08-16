
const youtube=require('./youtube.js');
const youtubedl=require('./youtube-dl.js')
const dynamo=require('./dynamo.js');
const firebase=require('./firebase.js')
const dropbox=require('./dropbox')
const hash=require('object-hash');


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

var previousYoutubePlayListHash;
var syncFx=async ()=>{
  var playlistId=process.env.PLAYLISTID;
  var currentItems=await youtube.getPlaylistinfoAsync(playlistId);
  var currentYoutubePlayListHash=hash(currentItems);
  if (previousYoutubePlayListHash && previousYoutubePlayListHash===currentYoutubePlayListHash){
    setTimeout(() => {
      syncFx();
    }, 1000);
    return;
  }
  previousYoutubePlayListHash=currentYoutubePlayListHash;
  var savedItems=await dynamo.getyoutubePlaylistAsync(playlistId);
  await deleteItems(savedItems, currentItems);
  await updateAndAddNewItems(currentItems, savedItems);
  await dynamo.updateyoutubePlaylistAsync(playlistId,currentItems);
  neededToSyncWithDropBox=await syncWithDropbox(currentItems);
  if (neededToSyncWithDropBox){
    await dynamo.updateyoutubePlaylistAsync(playlistId,currentItems);
  }

  setTimeout(() => {
    syncFx();
  }, 1000);
 
}
syncFx();


async function syncWithDropbox(currentItems){
  var neededToSyncWithDropBox=false;
  for (let index = 0; index < currentItems.length; index++) {
    const currentItem = currentItems[index];
    if (currentItem.hostingAt!=='dropbox'){
      var dropboxurl=await dropbox.uploadToDropbox(currentItem.bucketFileName,currentItem.url);
      currentItem.url=dropboxurl;
      currentItem.hostingAt='dropbox';
      neededToSyncWithDropBox=true;
    }
  }
  return neededToSyncWithDropBox;
}


async function deleteItems(savedItems, currentItems) {
  var itemsToDelete = getItemsToDelete(savedItems, currentItems);
  for (let index = 0; index < itemsToDelete.length; index++) {
    const itemToDelete = itemsToDelete[index];
    try{
      await firebase.deleteFileAsync(itemToDelete.bucketFileName);
    }catch(error)
    {
      console.log(error);
    }
    try{
      await dropbox.deleteAsync(itemToDelete.bucketFileName);
    }
    catch (error) {
      console.log(error);
    }
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
        currentItem.hostingAt=savedItem.hostingAt;
      }
      else {
        try {
          var localFile = await youtubedl.downloadVideoAsync(currentItem.id);          
          var result = await firebase.uploadFileAsync(localFile);
          currentItem.url = result.downloadurl;
          currentItem.bucketFileName = result.fileName;
          currentItem.hostingAt='firebase';
        }
        catch (error) {
          itemsWithError.push(currentItem);
        }
      }
    }
    return itemsWithError;
  }
}


