class DataStoreClass 
{
    SaveData(data)
    {
        return new Promise(function (resolve){
            chrome.storage.sync.set({'RightClickSave': data}, function() {
                resolve(true);
              });
        });
    }

    LoadData()
    {
        return new Promise(function (resolve){
            chrome.storage.sync.get(['RightClickSave'], function(result) {
                let data = result.RightClickSave;
                resolve(data);
              });
        });
    }

    Clear()
    {
        chrome.storage.sync.clear();
    }
}
