class TwitchInterfaceClass
{
    BROWSER_API = chrome;

    APP_CLIENT_ID = "qwwlpze7zs8a9kd2geciyx61dk0xie";
    CLIENT_ID = encodeURIComponent(this.APP_CLIENT_ID);
    REDIRECT_URI = encodeURIComponent(this.BROWSER_API.identity.getRedirectURL());
    RESPONSE_TYPE = encodeURIComponent("token id_token");
    SCOPE = encodeURIComponent("openid chat:read chat:edit channel_editor");
    STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));

    CreateTwitchEndpoint() {
        let nonce = encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

        let openid_url =
            `https://id.twitch.tv/oauth2/authorize` +
            `?client_id=${this.CLIENT_ID}` +
            `&redirect_uri=${this.REDIRECT_URI}` +
            `&response_type=${this.RESPONSE_TYPE}` +
            `&scope=${this.SCOPE}` +
            `&state=${this.STATE}` +
            `&nonce=${nonce}`;

        return openid_url;
    }

    Login()
    {
        let thisOb = this;

        return new Promise(function(resolve, reject){

            thisOb.BROWSER_API.identity.launchWebAuthFlow({
                url: thisOb.CreateTwitchEndpoint(),
                interactive: true
            }, function (redirect_url) {
                if (thisOb.BROWSER_API.runtime.lastError || redirect_url.includes('error=')) {
                    let data = redirect_url.split('?')[1].split('&');
                    data.forEach(ele => { console.log(ele); });
                    resolve(null);
                    
                } else {

                    const urlParams = new URLSearchParams(redirect_url.replace('#access_token=','&access_token='));

                    let id_token = urlParams.get('id_token');
                    let access_token = urlParams.get('access_token');
                    const user_info = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(id_token.split(".")[1]));

                    if (user_info.iss === 'https://id.twitch.tv/oauth2' && user_info.aud === thisOb.CLIENT_ID) 
                    {
                        fetch(`https://api.twitch.tv/helix/users?id=${user_info.sub}`, {
                            headers: {
                                'Authorization': `Bearer ${access_token}`,
                                'Client-ID': thisOb.APP_CLIENT_ID
                            }
                        })
                        .then(response => response.json())
                        .then(json => {

                            AppData = {
                                'user' : {
                                    'displayName': json.data[0].display_name,
                                    'channelName': json.data[0].login,
                                    'profilePic': json.data[0].profile_image_url
                                },
                                'token' : access_token
                            }

                            resolve(AppData);
                        })
                        .catch(err => {
                            console.log("Error getting user data",err.body);
                            reject(err);
                        });
                    
                    }
                    else{
                        reject();
                    }
                }
            });
        });
    }

    CheckValidation(token)
    {
        return new 	Promise(function(resolve, reject){
        
            fetch('https://id.twitch.tv/oauth2/validate', {
                headers: {
                    'Authorization': 'OAuth ' + token
                }
            })
            .then(res => {
                resolve(res.status !== 401);			
            })
            .catch(err => {
                console.log("Error Validating token", err)
                reject(err);
            });		
        });
    }

    ClearLogin(token)
    {
        let url = `https://id.twitch.tv/oauth2/revoke?client_id=${this.APP_CLIENT_ID}&token=${token}`;

        fetch(url, {
            method: "POST", 
          }).then(res => {             
            if(res.status == 200)
            {
                this.BROWSER_API.identity.removeCachedAuthToken({token: token}, function (){
                    console.log('Logout complete')
                });
            }
            else
            {
                console.log("Logout error:", res.status);
            }                    
          });
    }
}