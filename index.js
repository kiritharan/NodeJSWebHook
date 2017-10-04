
'use strict';

const
 bodyParser = require('body-parser'),
 express = require('express'),
 xhub = require('express-x-hub'),
 crypto = require('crypto');
 
 //require('dotenv').load();

const APP_SECRET = (process.env.APP_SECRET) ? 
  process.env.APP_SECRET :
  config.get('APP_SECRET');
  
const VERIFY_TOKEN = (process.env.VERIFY_TOKEN) ?
  (process.env.VERIFY_TOKEN) :
  config.get('VERIFY_TOKEN');
  
const ACCESS_TOKEN = (process.env.ACCESS_TOKEN) ?
  (process.env.ACCESS_TOKEN) :
  config.get('ACCESS_TOKEN');

  
var received_updates = [];

var app = express();
var port = process.env.PORT || 1338;
app.use(xhub({ algorithm: 'sha1', secret: APP_SECRET }));
app.use(bodyParser.json());
//app.use(bodyParser.json({ verify: verifyRequestSignature }));

function verifyRequestSignature(req, res, buf) {
  var signature = req.headers['x-hub-signature'];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error('Couldn\'t validate the signature.');
  } else {
    var elements = signature.split('=');
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET).update(buf).digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error('Couldn\'t validate the request signature.');
    }
  }
}

process.on('uncaughtException', function(err) 
{
    console.log(err);
});

app.listen(port, function () {
    
    console.log( "Express server listening on port " + port);
});

app.get('/', function(req, res) {

console.log('hub verify token: ' + req.param['hub.verify_token']);
 if(req.query['hub.verify_token'] === VERIFY_TOKEN)
 {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
 }
 else
 {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
  //console.log(req);
  //console.log('Recieving1...' + req.param('hub.verify_token'));
  //res.send(req.param('hub.challenge'));
  
});

app.post('/', function(req, res) 
{

  console.log('Inside app post function to extract receieved WP post');
  /*
  if (!req.isXHubValid()) 
  {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }
     
   // console.log("RES: " + res);
   // console.log("REQ BODY: " + req.body);
   // console.log('request header X-Hub-Signature validated');
    
    // Process the Facebook updates here
    received_updates.unshift(req.body);
    res.sendStatus(200);
  */
   if (req.isXHubValid()) 
   {
    try{
        var data = req.body;
        console.log('DATA OBJECT: ' + data.object);
        // On Workplace, webhooks can be sent for page, group, user and
    		// workplace_security objects
        switch (data.object) {
        case 'page':
          processPageEvents(data);
          break;
        case 'group':
          processGroupEvents(data);
          break;
        case 'user':
          processUserEvents(data);
          break;
        case 'workplace_security':
          processWorkplaceSecurityEvents(data);
          break;
        default:
          console.log('Unhandled Webhook Object', data.object);
        }
      } catch (e) {
        // Write out any exceptions for now
        console.error(e);
      } finally {
        // Always respond with a 200 OK for handled webhooks, to avoid retries
    		// from Facebook
        res.sendStatus(200);
      }
   }
   else
   {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
   }
});



function processPageEvents(data) 
{
  data.entry.forEach(function(entry){
    let page_id = entry.id;
		// Chat messages sent to the page
    if(entry.messaging) {
      entry.messaging.forEach(function(messaging_event){
        console.log('Page Messaging Event',page_id,messaging_event);
      });
    }
		// Page related changes, or mentions of the page
    if(entry.changes) {
      entry.changes.forEach(function(change){
        console.log('Page Change',page_id,change);
      });
    }
  });
}

function processGroupEvents(data) 
{
  data.entry.forEach(function(entry)
  {
    if(entry.changes[0].field === 'comments')
    {
      console.log('This is comment');
      console.log("Group ID: " + entry.id);
      console.log("From : " + entry.changes[0].value["from"]);
      console.log("Post ID: " + entry.changes[0].value["post_id"] );
      console.log("Created at: " + entry.changes[0].value["created_time"]);
      console.log("Message: " + entry.changes[0].value["message"]);

    }
    else   if(entry.changes[0].field === 'posts')
    {
       console.log('This is post');
       console.log("From : " + entry.changes[0].value["from"]);
       console.log("Post ID: " + entry.changes[0].value["post_id"] );
       console.log("Created at: " + entry.changes[0].value["created_time"]);
       console.log("Message: " + entry.changes[0].value["message"]);
    }
    
    if(entry.changes[0].value["attachments"] !=null && 
      entry.changes[0].value["attachments"].data.length > 0)
    {
      console.log('Attachments length: ' + entry.changes[0].value["attachments"].data.length);
      console.log(entry.changes[0].value["attachments"].data);
      var length = entry.changes[0].value["attachments"].data.length;
      for(var x=0; x<length; x++)
      {
        console.log("Attachment URL:"  + entry.changes[0].value["attachments"].data['url']);
      }
    }
     
    
      entry.changes.forEach(function(change){
        console.log(change);
      
      });
  });
}

function processUserEvents(data) 
{
  data.entry.forEach(function(entry){
    let group_id = entry.id;
    entry.changes.forEach(function(change){
      console.log('User Change',group_id,change);
    });
  });
}

function processWorkplaceSecurityEvents(data) 
{
  data.entry.forEach(function(entry){
    let group_id = entry.id;
    entry.changes.forEach(function(change){
      console.log('Workplace Security Change',group_id,change);
    });
  });
}
