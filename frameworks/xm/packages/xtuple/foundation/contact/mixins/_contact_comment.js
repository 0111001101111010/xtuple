// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.ContactComment
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._ContactComment = {
  /** @scope XM.ContactComment.prototype */
  
  className: 'XM.ContactComment',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": true,
      "read": true,
      "update": "EditOthersComments",
      "delete": false
    },
    "personal": {
      "update": "EditOwnComments",
      "properties": [
        "createdBy"
      ]
    }
  },

  //..................................................
  // ATTRIBUTES
  //
  
  /**
    @type Number
  */
  guid: SC.Record.attr(Number),

  /**
    @type XM.Contact
  */
  contact: SC.Record.toOne('XM.Contact'),

  /**
    @type XM.CommentType
  */
  commentType: SC.Record.toOne('XM.CommentType'),

  /**
    @type String
  */
  text: SC.Record.attr(String),

  /**
    @type Boolean
  */
  isPublic: SC.Record.attr(Boolean),

  /**
    @type Date
  */
  created: SC.Record.attr(XT.DateTime, {
    format: '%Y-%m-%d',
    useIsoDate: false
  }),

  /**
    @type String
  */
  createdBy: SC.Record.attr(String)

};
