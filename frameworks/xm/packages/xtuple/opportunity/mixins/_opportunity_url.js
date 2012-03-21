// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.OpportunityUrl
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._OpportunityUrl = {
  /** @scope XM.OpportunityUrl.prototype */
  
  className: 'XM.OpportunityUrl',

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
  source: SC.Record.toOne('XM.Opportunity', {
    label: '_source'.loc()
  }),

  /**
    @type XM.Url
  */
  url: SC.Record.toOne('XM.Url', {
    isNested: true,
    label: '_url'.loc()
  }),

  /**
    @type String
  */
  purpose: SC.Record.attr(String, {
    label: '_purpose'.loc()
  })

};
