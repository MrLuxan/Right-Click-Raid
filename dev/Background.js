let TwitchInterface = new TwitchInterfaceClass();
let DataStore = new DataStoreClass();

let AppData = null;
let Interval_id = null;
let UserToRaid;

DataStore.LoadData().then(savedAppData => {
	if(savedAppData != null)
	{
		TwitchInterface.CheckValidation(savedAppData.token).then( valid => {
			if(valid)
			{
				ProcessLogin(savedAppData);
			}
		}).catch(err => {
			console.log('Error validating',err);
		});
	}
})

function menuItemOnClick()
{
  const client = new tmi.Client({
    identity: {
      username: AppData.user.channelName,
      password: `oauth:${AppData.token}`
    },
    channels: [ AppData.user.channelName ]
  });

  client.connect().catch(console.error);
  client.on('join', () => {
	client.say(client.channels[0], `/raid ${UserToRaid}`);
	client.disconnect();
  });
}

function CreateMenuItem(parameters)
{
	UserToRaid = parameters.user;
	chrome.contextMenus.removeAll();

	if(AppData != null)
	{
		chrome.contextMenus.create({'title': `Raid - ${UserToRaid}`,
									'contexts':['link','page'],
									'onclick':menuItemOnClick});  
	}
	else
	{
		chrome.contextMenus.create({'title': `Right click raid - Login required`,
									'contexts':['link','page']});  
	}
}


function RemoveAllMenuItems()
{
  chrome.contextMenus.removeAll();
}


function ProcessLogin(appData)
{
	AppData = appData;

	chrome.browserAction.setPopup({ popup: `./popup/LoggedIn.html?pic=${appData.user.profilePic}&name=${appData.user.displayName}` });

	Interval_id = setInterval(() => {
		TwitchInterface.CheckValidation(appData.token).then( valid => {
			if(!valid)
			{
				AppData = null;
				clearInterval(Interval_id);
			}
		}).catch(err => {
			console.log('Error validating',err);
		});
	}, 3600000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "login") {
		if (AppData != null) {
			console.log("User is already signed in.");
		} else {

			TwitchInterface.Login().then(appData =>{

				if(appData != null)
				{				
					DataStore.SaveData(appData);
					ProcessLogin(appData);				
					sendResponse({ message: "success" });	
				}
				else
				{
					sendResponse({ message: 'fail' });
				}

			}).catch(err => {
				console.log(err);
			});
		}
		return true;
	} else if (request.message === "logout") {


		TwitchInterface.ClearLogin(AppData.token);

		AppData = null;
		DataStore.Clear();
		chrome.browserAction.setPopup({ popup: "./popup/LoggedOut.html" }, () => {
			sendResponse({ message: "success" });
		});
		return true;
	}
	else if(request.message === "create")
	{
		CreateMenuItem(request.parameters);
	}
	else if(request.message === "remove")
	{
		RemoveAllMenuItems();
	}	

});