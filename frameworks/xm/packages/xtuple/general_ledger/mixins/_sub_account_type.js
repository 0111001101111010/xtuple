// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.SubAccountType
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._SubAccountType = {
  /** @scope XM.SubAccountType.prototype */
  
  className: 'XM.SubAccountType',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "MaintainChartOfAccounts",
      "read": true,
      "update": "MaintainChartOfAccounts",
      "delete": "MaintainChartOfAccounts"
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
  accountType: SC.Record.attr(String, {
    defaultValue: true
  }),

  /**
    @type String
  */
  code: SC.Record.attr(String),

  /**
    @type String
  */
  description: SC.Record.attr(String)

};
