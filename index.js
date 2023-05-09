require("dotenv").config();
const express = require('express');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const app = express();

const PORT = process.env.PORT

const APP_ID = process.env.APP_ID
const APP_CERTIFICATE = process.env.APP_CERTIFICATE

const nocache = (_, resp, next) => {
    resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    resp.header('Expires', '-1');
    resp.header('Pragma', 'no-cache');
    next();
  }

const generateRTCToken = (req, resp) => {
    resp.header('Access-Control-Allow-Origin', '*');

    //get channel name
    const channelName = req.params.channel;
    if (!channelName) {
        return resp.status(500).json({ 'error': 'channel is required' });
    }

    // get uid
    let uid = req.params.uid;
    if(!uid || uid === '') {
        return resp.status(500).json({ 'error': 'uid is required' });
    }

    // get role
    let role;
    if (req.params.role === 'publisher') {
        role = RtcRole.PUBLISHER;
    } else if (req.params.role === 'audience') {
        role = RtcRole.SUBSCRIBER
    } else {
        return resp.status(500).json({ 'error': 'role is incorrect' });
    }

    // get expiry
    let expireTime = req.query.expiry;
    if (!expireTime || expireTime === '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    let token;
    if (req.params.tokentype === 'uid') {
        token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    } else {
        return resp.status(500).json({ 'error': 'token type is invalid' });
    }

    return resp.json({ 'rtcToken': token });
};

app.get('/rtc/:channel/:role/:tokentype/:uid', nocache , generateRTCToken)

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});