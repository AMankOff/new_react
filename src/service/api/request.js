import { setStorageItem, getStorageItem } from '../../untils/storage'
import { os, version, desIv, desKey } from '../../config'
import CryptoJS from 'crypto-js';

const baseUrl = `${window.location.origin}`;

export const Encrypt3Des = reqDataString => {
    const iv = CryptoJS.enc.Utf8.parse(desIv);
    const key = CryptoJS.enc.Utf8.parse(desKey);
    const encrypted = CryptoJS.TripleDES.encrypt(
        reqDataString,
        key,
        {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: iv
        }
    );
    return encrypted.toString()
};

// const des_decrypt = (str) =>{
//     const iv = CryptoJS.enc.Utf8.parse(desIv);
//     const key = CryptoJS.enc.Utf8.parse(desKey);
// 	const decrypt_str	= CryptoJS.TripleDES.decrypt(str, key, {    
//             iv: 		  iv,    
//             mode: 		CryptoJS.mode.CBC,    
//             padding: 	CryptoJS.pad.Pkcs7
//         });
// 	return 	decrypt_str.toString(CryptoJS.enc.Utf8);	
// }

export const request =  async (url, data = {}, method='POST') => {
    const tokenName = 'Authorization'
    const tokenVal = `Bearer ${getStorageItem('token') || ''}`
    const dataString =  Encrypt3Des(JSON.stringify(Object.assign({
        os, 
        version
    }, data)))
    // console.log(url, Object.assign({
    //     os, 
    //     version,
    // }, data))

    let initReq = {
        headers: {
            [tokenName]: tokenVal,
        },
        method
    }
    if (method === 'POST') {
        initReq.body = dataString
    }
    const responseObj = await fetch(`${baseUrl}/${url}`, initReq)

    let responseJson = {}
    const cloneRes = await responseObj.clone()
    try {
        responseJson = await responseObj.json()
    } catch (err) {
        responseJson = cloneRes.blob()
    }
    // const responseJson = await responseObj.json()

    if (responseObj.headers.has('Authorization')) {
        setStorageItem('token', responseObj.headers.get('Authorization').split(' ')[1])
    }
    return responseJson
}


export const uploadRequest = async (url, data = {}, file) => {
    const tokenName = 'Authorization'
    const tokenVal = `Bearer ${getStorageItem('token') || ''}`
    const dataString =  Encrypt3Des(JSON.stringify(Object.assign({
        os, 
        version,
    }, data)))
    // const reqData = {...data, os, version}
    const formData = new FormData()
    formData.append('file', file)
    formData.append('param', dataString)
    // for (const key in reqData) {
    //     if (reqData.hasOwnProperty(key)) {
    //         const element = reqData[key];
    //         formData.append(key, element)
    //     }
    // }
    
    let initReq = {
        body: formData,
        headers: {
            [tokenName]: tokenVal,
        },
        method: 'POST',
    }
    
    const responseObj = await fetch(`${baseUrl}/${url}`, initReq).catch(err => {
        return false
    })
    if (responseObj) {
        const responseJson = await responseObj.json()
        return responseJson
    }
}
