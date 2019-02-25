const Promise = require('bluebird');
const request = Promise.promisify(require('request'));


let prefix = 'https://api.weixin.qq.com/cgi-bin/'


let api = {
    accessToken:prefix + 'token?grant_type=client_credential'
}



function Wechat(opts) {
    let that = this;
    this.appID = opts.appID;
    this.appsecret= opts.appsecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;


    //获取access_to
    this.getAccessToken()
        .then((data) => {
            try {
                data = JSON.parse(data);

            } catch(e) {
                return that.updateAccessToken()
            }

            if(that.isValidAccessToken(data)) {
                Promise.resolve(data);

            } else {
                return that.updateAccessToken();

            }

        })
        .then((data) => {
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;
            that.saveAccessToken(data);



        })
}

Wechat.prototype.isValidAccessToken = function (data) {
    if(!data || !data.access_token || data.expires_in) {
        return false;

    }

    let access_token = data.access_token;
    let expires_in = data.expires_in;
    let now = new Date().getTime();

    if(now < expires_in) {
        return true;
    } else {
        return false;

    }

}

Wechat.prototype.updateAccessToken = function () {
    let appID = this.appID;
    let appsecret = this.appsecret;
    let url = api.accessToken + '&appid='+ appID + '&secret='+appsecret;
    
    return new Promise(function(resolve,reject) {
        request({url:url,json:true}).then((response) => {
        
            let data = response.body;
          
            let now = new Date().getTime();
            let expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;

            resolve(data);
    
        })
    })
  


}

module.exports = Wechat;




