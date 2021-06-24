function create(user)
{
    chrome.runtime.sendMessage({'message': 'create', 'parameters': { 
        'user': user, 
    }});
}


function remove()
{
    chrome.runtime.sendMessage({'message': 'remove'});
}


function findUser(clickedOn)
{    
    let sideBar = clickedOn.closest('.side-bar-contents');
    let channelInfo = clickedOn.closest('.channel-info-content');
    let chatLine = clickedOn.closest('.chat-line__message'); 

    let user = null;

    if(sideBar != null || channelInfo != null)
    {
        let closestA = clickedOn.closest('a');

        let linkAddress = new URL(closestA.href);
        let pathName = linkAddress.pathname;
        let parts = pathName.split('/')

        if(pathName.startsWith('/') && parts.length == 2 && parts[1].length > 0)
        {
            user = parts[1];
        }    
    }
    else if(chatLine != null)
    {
        if(clickedOn.classList.contains('chat-author__display-name'))
        {
            user = clickedOn.dataset['aUser'];
        }
        else if(clickedOn.nodeName == 'A')
        {
            let url = clickedOn.href;
            if(url.startsWith('https://www.twitch.tv/'))
            {
                if(url.lastIndexOf('/') == 21)
                {
                    user = url.substring(22);
                }
            }
        }
    }

    return user;
}

window.onmousedown = (e) => {
    
    if(e.button == 2) // 2 == right mouse 
    {
        let user = findUser(e.target);
        user != null ? create(user) : remove();
    }
    else
    {
        remove();
    }
}
