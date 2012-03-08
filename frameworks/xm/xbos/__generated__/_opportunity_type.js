// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.OpportunityType
  @class

  This code is automatically generated and will be over-written. Do not edit directly.

  @extends XM.Record
*/
XM._OpportunityType = XM.Record.extend(
  /** @scope XM.OpportunityType.prototype */ {
  
  className: 'XM.OpportunityType',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "MaintainOpportunityTypes",
      "read": true,
      "update": "MaintainOpportunityTypes",
      "delete": "MaintainOpportunityTypes"
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
    @type Number
  */
  name: SC.Record.attr(Number),

  /**
    @type String
  */
  description: SC.Record.attr(String)

});
