let page = window.location.pathname;
if(page.includes("LoggedIn"))
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    let pic = urlParams.get('pic');
    let username = urlParams.get('name');
    
    document.querySelector('.UserImage').src = pic;
    document.querySelector('.Name').textContent = username;
    
    document.querySelector('.Logout').addEventListener('click', function () {
        chrome.runtime.sendMessage({ message: 'logout' }, function (response) {
            if (response.message === 'success') window.close();
        });
    });
}
else
{
    document.querySelector('.SignInButton').addEventListener('click', function () {
        chrome.runtime.sendMessage({ message: 'login' }, function (response) {
            if (response.message === 'success') window.close();
        });
    });
}