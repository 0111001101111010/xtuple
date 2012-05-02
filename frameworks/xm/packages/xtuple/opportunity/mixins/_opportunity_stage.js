// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.OpportunityStage
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._OpportunityStage = {
  /** @scope XM.OpportunityStage.prototype */
  
  className: 'XM.OpportunityStage',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "MaintainOpportunityStages",
      "read": true,
      "update": "MaintainOpportunityStages",
      "delete": "MaintainOpportunityStages"
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
    @type String
  */
  name: SC.Record.attr(String),

  /**
    @type String
  */
  description: SC.Record.attr(String),

  /**
    @type Boolean
  */
  deactivate: SC.Record.attr(Boolean)

};
