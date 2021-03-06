
const youtube=require('./youtube.js');
const youtubedl=require('./youtube-dl.js')
const dynamo=require('./dynamo.js');
const firebase=require('./firebase.js')
const dropbox=require('./dropbox')
const hash=require('object-hash');
var fs = require('fs');

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

function getNewITems(savedItems,currentItems){
  var savedItemsIds = savedItems.map(a => a.id);
  var newItems=[];
  currentItems.forEach(currentItem => {
    if (!savedItemsIds.includes(currentItem.id)){
      newItems.push(currentItem);
    }
  });
  return newItems;
}
function updateItemsThatDidNotChange(savedItems,currentItems){
  var currentItemsIds = currentItems.map(a => a.id);
  savedItems.forEach(savedItem => {
    if (currentItemsIds.includes(savedItem.id)){
      var currentItem=getItemById(currentItems,savedItem.id);
      savedItem.position=currentItem.position;
    }
  });
}

function getItemById(items,id){
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id==id)
      return item;
  }
  return null;
}

var _previousYoutubePlayListHash;
var syncFx=async ()=>{
  var playlistId=process.env.PLAYLISTID;
  var currentItems=await youtube.getPlaylistinfoAsync(playlistId);
  var currentYoutubePlayListHash=hash(currentItems);
  if (_previousYoutubePlayListHash && _previousYoutubePlayListHash===currentYoutubePlayListHash){
    setTimeout(() => {
      syncFx();
    }, 1000);
    return;
  }
  console.log("started sync");
  var savedItems=await dynamo.getyoutubePlaylistAsync(playlistId);
  
  var itemsToDelete = getItemsToDelete(savedItems, currentItems);
  await deleteItemsAsync(itemsToDelete);
  removeDeletedItemsFromSavedList(savedItems,itemsToDelete);

  updateItemsThatDidNotChange(savedItems,currentItems);
  await syncWithDynamo(savedItems, playlistId);

  var newItems=getNewITems(savedItems,currentItems);
  await SyncNewItemsAsync(newItems, savedItems, playlistId);
  
  _previousYoutubePlayListHash=currentYoutubePlayListHash;
  console.log("ended sync");
  setTimeout(() => {
    syncFx();
  }, 1000);
 
}
syncFx();


async function SyncNewItemsAsync(newItems, savedItems, playlistId) {
  for (let index = 0; index < newItems.length; index++) {
    var newItem = newItems[index];
    try {
        await SyncNewItemAsync(newItem,savedItems,playlistId);
    } catch (error) {
        console.log('Error syncing item');
        console.log(JSON.stringify(error));
    }
  }
}

async function SyncNewItemAsync(newItem,savedItems,playlistId){
  await syncNewItem(newItem);
  savedItems.push(newItem);
  await syncWithDynamo(savedItems, playlistId);
}


async function syncWithDynamo(savedItems, playlistId) {
  var sortedItems = savedItems.sort(function (obj1, obj2) {
    return obj1.position - obj2.position;
  });
  await dynamo.updateyoutubePlaylistAsync(playlistId, sortedItems);
}

function removeDeletedItemsFromSavedList(savedItems,itemsToDelete){
  itemsToDelete.forEach(itemToDelete => {    
    savedItems.splice( savedItems.indexOf(itemToDelete), 1 );
  });
}


async function deleteItemsAsync(itemsToDelete) {
  for (let index = 0; index < itemsToDelete.length; index++) {
    var itemToDelete = itemsToDelete[index];
      await dropbox.deleteAsync(itemToDelete.bucketFileName);
  }
}

async function syncNewItem(item){
  var localFile;
  try {    
    localFile= await youtubedl.downloadVideoAsync(item.id);  
  } catch (error) {
    if (error.countryRestriction){
      localFile=await youtubedl.downloadVideoAsync(item.id,'http://piscos.tk:3128');
    }
    else{
      throw error;
    }
  }        
  var firebaseResult = await firebase.uploadFileAsync(localFile);
  fs.unlinkSync(localFile);
  var dropboxurl=await dropbox.uploadToDropbox(firebaseResult.fileName,firebaseResult.downloadurl);
  await firebase.deleteFileAsync(firebaseResult.fileName);
  item.url=dropboxurl;
  item.bucketFileName=firebaseResult.fileName;
}


 


