const crypto_merged = require("./external/crypto_merged");
const http = require("http");
const fetch = require('node-fetch');
const FormData = require('form-data');

// todo: move to config
const LOGIN = "";
const PASSWORD = "";

http.createServer(async function(request,response){

    await foo();
    response.end("Hello NodeJS! | hash: " + encrypt_password("123", "sdgngfhnfgb"));

}).listen(3000, "127.0.0.1",function(){
    console.log("Server started listening requests from port: 3000");
});

async function foo(){
    const loginPage = await fetch("https://dl.tntu.edu.ua/login.php", {
        "body": null,
        "method": "GET",
        "credentials": "include"
    })
        .catch(error => console.log("fetch error", error));
    const cookies = loginPage.headers.get('set-cookie')
    console.log("cookies: ", cookies);
    const html = await loginPage.text();
    const key = getSessionKey(html)
    const hash = encrypt_password(PASSWORD, key);
    console.log("hash: ", hash);
    // login
    //await login(LOGIN, hash, cookies);
    // logout
}

function encrypt_password(pass, sessionKey) {

    var e = '10001';
    var k = 'B1CBE3B5456CDF6D5A85F32715415A0F85ADAB289B7AD21CA2B925BD28231994B72856093C46D2A67CF8136CBDCF430C0EF7990403DAF4830CE4633D98A16703';
    var rsa = new crypto_merged.RSAKey(); // Why I need use new there?
    rsa.setPublic(k, e);
    var str = (pass + "|" + sessionKey);
    var res = rsa.encrypt(str);
    const hash = crypto_merged.hex2b64(res);
    return hash;
}

function getSessionKey(html){
    const pattern = 'var str = (document.form.form_password.value + "|';
    const start = html.indexOf(pattern) + pattern.length;
    const keyLen = 32;
    const sessionKey = html.substring(start, start + keyLen)
    return sessionKey;
}

function parseCookies(cookies){ // todo 1 - cookies
    const id = "ATutorID";
    const row = "row-12756";
}

async function login(login, hash, cookies){ // todo 2 - login
    // todo set cookies from param
    const myHeaders = {
        "content-type": "application/x-www-form-urlencoded",
        //"Cookie": "row-12756=1551019; ATutorID=jevijgk5mjqtqpm99qmdij0gs8"
        "Cookie": cookies
    };

    const form = new FormData();
    form.append("form_login_action", "true");
    form.append("form_course_id", "0");
    form.append("form_password_hidden", hash);
    form.append("form_hash_password", "");
    form.append("form_password_ldap", "");
    form.append("form_login", login);
    form.append("form_password", "");
    form.append("submit", "Вхід");

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: form,
        redirect: 'follow'
    };

    await fetch("https://dl.tntu.edu.ua/login.php", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

}

