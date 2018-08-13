
const youtube=require('./youtube.js');
const youtubedl=require('./youtube-dl.js')
const dynamo=require('./dynamo.js');
const firebase=require('./firebase.js')


function simplifyPlaylist(youtubePlaylist){

  var obj={};
  youtubePlaylist.forEach(item => {
    obj[item.snippet.resourceId.videoId]={
      position:item.snippet.position
    };
  });
return obj;
}
function getItemsToDelete(savedItems,currentItems){
  var currentItemsIds = Object.keys(currentItems);
  var savedItemsIds = Object.keys(savedItems)
  var itemsToDelete=[];

  for (let index = 0; index < savedItemsIds.length; index++) {
    const savedItemId = savedItemsIds[index];
    if (!currentItemsIds.includes(savedItemId)){
      itemsToDelete.push(savedItems[savedItemId]);
    }
  }
  return itemsToDelete;
}

(async ()=>{
  var playlistId='PLJLM5RvmYjvxaMig-iCqA9ZrB8_gg6a9g';
  var savedItems=await dynamo.getyoutubePlaylistAsync(playlistId);


  var currentPlayList=await youtube.getPlaylistinfoAsync(playlistId);
  var currentItems=simplifyPlaylist(currentPlayList.items);

  var itemsToDelete=getItemsToDelete(savedItems,currentItems);
  for (let index = 0; index < itemsToDelete.length; index++) {
    const itemToDelete = itemsToDelete[index];
    await firebase.deleteFileAsync(itemToDelete.bucketFileName);
  }

  var currentItemsIds = Object.keys(currentItems);
  for (let index = 0; index < currentItemsIds.length; index++) {
    const currentItemId=currentItemsIds[index];
    const currentItem = currentItems[currentItemId];
    var savedItem=savedItems[currentItemId];
    if (savedItem){
      currentItem.url=savedItem.url;
      currentItem.bucketFileName=savedItem.bucketFileName;
    }
    else{
      try {
        var localFile=await youtubedl.downloadVideoAsync(currentItemId);
        var result= await firebase.uploadFileAsync(localFile);
        currentItem.url=result.downloadurl;
        currentItem.bucketFileName=result.fileName;
      } catch (error) {
        delete currentItems[currentItemId];
      }

    }
  }


  await dynamo.updateyoutubePlaylistAsync(playlistId,currentItems);
  console.log(JSON.stringify(currentItems));
})();


