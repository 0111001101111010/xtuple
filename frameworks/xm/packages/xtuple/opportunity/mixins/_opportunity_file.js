// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.OpportunityFile
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._OpportunityFile = {
  /** @scope XM.OpportunityFile.prototype */
  
  className: 'XM.OpportunityFile',

  nestedRecordNamespace: XM,

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": true,
      "read": true,
      "update": false,
      "delete": true
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
    @type XM.Opportunity
  */
  source: SC.Record.toOne('XM.Opportunity'),

  /**
    @type XM.FileInfo
  */
  file: SC.Record.toOne('XM.FileInfo', {
    isNested: true
  }),

  /**
    @type String
  */
  purpose: SC.Record.attr(String)

};
