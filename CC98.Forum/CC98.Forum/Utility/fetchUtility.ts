import {
    getLocalStorage,
    setLocalStorage
} from './storageUtility'

import { 
    Constants // used in cc98Fetch
} from '../Components/Constant';

import { 
    UserInfo // type definition for userInfo
} from '../States/AppState';

import {
    getUserInfo as getIndexedDBUserInfo,
    addUserInfo
} from '../IndexedDB/UserStorage';


export async function getToken() {
    const refreshToken = getLocalStorage("refresh_token");
    if (!refreshToken) {
        return null;
    }

    let token = getLocalStorage("accessToken")
    if (token) {
        return token;
    }

    const url = 'https://openid.cc98.org/connect/token';
    const requestBody = {
        client_id: '9a1fd200-8687-44b1-4c20-08d50a96e5cd',
        client_secret: '8b53f727-08e2-4509-8857-e34bf92b27f2',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    }
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    const response = await fetch(url, {
        method: "POST",
        headers,
        // body: $.param(requestBody)
        body: Object.keys(requestBody).map(key =>`${key}=${requestBody[key]}`).join('&')
    });
    const data = await response.json();
    
    token = "Bearer " + encodeURIComponent(data.access_token);
    setLocalStorage("accessToken", token, data.expires_in);

    return token;
}

export async function formAuthorizeHeader() {
    const token = await getToken();
    const headers = new Headers();
    headers.append("Authorization", token);
    return headers;
}

export async function cc98Fetch(url, init?: RequestInit) {
    // const response1 = await fetch("/config.production.json");
    // let data;
    // if (response1.status !== 404) {
    //     const data1 = await response1.json();
    //     const response2 = await fetch("/config.json");
    //     const data2 = await response2.json();
    //     data = { ...data2, ...data1 };
    // } else {
    //     const response2 = await fetch("/config.json");
    //     data = await response2.json();
    // }
    // const baseUrl = data.apiUrl;
   
    const baseUrl = Constants.config.apiUrl;
    const fetchUrl = `${baseUrl}${url}`;
    let response: Response;
    if (init) {
        response = await fetch(fetchUrl, init);
    } else {
        response = await fetch(fetchUrl);
    }
    return response;
}

async function getUserInfo(userId: number): Promise<UserInfo>;
async function getUserInfo(userName: string): Promise<UserInfo>;
async function getUserInfo(key: number | string): Promise<UserInfo> {
    let userInfo: UserInfo;
    try {
        // 在缓存中查询
        if(window.indexedDB) {
            userInfo = await getIndexedDBUserInfo(key);
            if(userInfo) return userInfo;
        } else {
            userInfo = getLocalStorage(typeof key === 'number' ? `userId_${key}`: `userName_${key}`);
            if(userInfo) return userInfo;
        }

        // api请求
        const url = typeof key === 'number' ? `/user/${key}` : `/user/name/${encodeURIComponent(key)}`;
        let headers = await formAuthorizeHeader();
        let res = await cc98Fetch(url, { headers });
        userInfo = await res.json();

        //缓存
        if(window.indexedDB) {
            addUserInfo(userInfo)
            return userInfo;
        } else {
            setLocalStorage(`userId_${userInfo.id}`, userInfo, 3600);
            setLocalStorage(`userName_${userInfo.name}`, userInfo, 3600)
            if(userInfo) return userInfo;
        }

        return userInfo;
    } catch(e) {

    }
}