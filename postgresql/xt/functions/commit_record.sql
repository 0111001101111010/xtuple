create or replace function xt.commit_record(data_hash text) returns text as $$
  var dataHash = JSON.parse(data_hash),
      recordType = dataHash.recordType,
      encryptionKey = dataHash.encryptionKey,
      data = Object.create(XT.Data),
      key, orm;

  if (dataHash.username) { XT.username = dataHash.username; }
 
  delete dataHash.recordType;
  data.commitRecord(recordType, dataHash.dataHash, encryptionKey);
  orm = XT.Orm.fetch(recordType.beforeDot(), recordType.afterDot());
  key = XT.Orm.primaryKey(orm);
  return JSON.stringify(data.retrieveRecord(recordType, dataHash.dataHash[key]));
  
$$ language plv8;
/*
select xt.js_init();
select xt.commit_record(
 E'{"recordType":"XM.Contact",
    "dataHash":{
      "id":12171,
      "number":"14832",
      "honorific":"Mr.",
      "firstName":"John",
      "middleName":"D",
      "lastName":"Rockefeller",
      "suffix":"",
      "isActive":true,
      "jobTitle":"Founder",
      "initials":"JDR","isActive":true,
      "phone":"555-555-5555",
      "alternate":"555-444-4445",
      "fax":"555-333-3333",
      "webAddress":"www.xtuple.com",
      "notes":"A famous person",
      "owner":{
        "username":"admin",
        "isActive":true,
        "propername":"administrator",
        "type": "UserAccount",
        "dataState":"create"
      },
      "primaryEmail":"jdr@gmail.com",
      "address": null,
      "comments":[{
        "id":739893,
        "contact":12171,
        "created":"2011-12-21 12:47:12.756437-05",
        "createdBy":"admin", 
        "commentType":"3",
        "text":"booya!",
        "isPublic":false,
        "type": "ContactComment",
        "dataState":"create"
        },{
        "id":739894,
        "contact":12171,
        "created":"2011-12-21 12:47:12.756437-05",
        "createdBy":"admin", 
        "commentType":"3",
        "text":"Now is the time for all good men...",
        "isPublic":false,
        "type": "ContactComment",
        "dataState":"create"
        }
      ],
      "characteristics":[],
      "email":[],
      "type": "Contact",
      "dataState":"create"
    }
  }'
);

select xt.commit_record(
 E'{"recordType":"XM.Contact",
    "dataHash":{
      "id":12171,
      "number":"14832",
      "honorific":"Mrs.",
      "firstName":"Jane",
      "middleName":"L",
      "lastName":"Knight",
      "suffix":"",
      "isActive":true,
      "jobTitle":"Heiress to a fortune",
      "initials":"JLK","isActive":true,
      "phone":"555-555-5551",
      "alternate":"555-444-4441",
      "fax":"555-333-3331",
      "webAddress":
      "www.xtuple.com",
      "notes":"A distinguished person",
      "owner":{
        "username":"postgres",
        "isActive":true,
        "propername":"",
        "type": "UserAccountInfo",
        "dataState":"read"
      },
      "primaryEmail":"jane@gmail.com",
      "address":{
        "id":1,
        "number": "1",
        "isActive": true,
        "line1":"Tremendous Toys Inc.",
        "line2":"101 Toys Place",
        "line3":"",
        "city":"Walnut Hills",
        "state":"VA",
        "postalcode":"22209",
        "country":"United States",
        "type": "AddressInfo",
        "dataState":"read"
      },
      "comments":[{
        "id":739893,
        "contact":12171,
        "created":"2011-12-21 12:47:12.756437-05",
        "createdBy":"admin", 
        "commentType":"3",
        "text":"booya!",
        "isPublic":false,
        "dataState":"update"
        },{
        "id":739894,
        "contact":12171,
        "created":"2011-12-21 12:47:12.756437-05",
        "createdBy":"admin", 
        "commentType":"3",
        "text":"Now is NOT the time for all good men...",
        "isPublic":false,
        "type": "ContactComment",
        "dataState":"update"
      }],
      "characteristics":[],
      "email":[],
      "type": "Contact",
      "dataState":"update"
    }
  }'
);

select xt.commit_record(
 E'{"recordType":"XM.Contact",
    "dataHash":{
      "id":12171,
      "number":"14832",
      "honorific":"Mrs.",
      "firstName":"Jane",
      "middleName":"L",
      "lastName":"Knight",
      "suffix":"",
      "isActive":true,
      "jobTitle":"Heiress to a fortune",
      "initials":"JLK","isActive":true,
      "phone":"555-555-5551",
      "alternate":"555-444-4441",
      "fax":"555-333-3331",
      "webAddress":
      "www.xtuple.com",
      "notes":"A distinguished person",
      "owner":{
        "username":"postgres",
        "isActive":true,
        "propername":"",
        "type": "UserAccountInfo",
        "dataState":"read"
      },
      "primaryEmail":"jane@gmail.com",
      "address":{
        "id":1,
        "number": "1",
        "isActive": true,
        "line1":"Tremendous Toys Inc.",
        "line2":"101 Toys Place",
        "line3":"",
        "city":"Walnut Hills",
        "state":"VA",
        "postalcode":"22209",
        "country":"United States",
        "type": "AddressInfo",
        "dataState":"read"
      },
      "comments":[{
        "dataState":"delete",
        "id":739893,
        "contact":12171,
        "created":"2011-12-21 12:47:12.756437-05",
        "createdBy":"admin", 
        "commentType":"3",
        "text":"booya!",
        "isPublic":false,
        "type": "ContactComment",
        "dataState":"read"
        },{
        "dataState":"delete",
        "id":739894,
        "contact":12171,
        "date":"2011-12-21 12:47:12.756437-05",
        "username":"admin", 
        "comment_type":"3",
        "text":"Now is the time for all good men...",
        "isPublic":false,
        "type": "ContactComment",
        "dataState":"read"
      }],
      "characteristics":[],
      "email":[],
      "type": "Contact",
      "dataState":"delete"
    }
  }'
);
*/
