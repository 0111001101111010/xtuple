// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.Budget
  @class

  This code is automatically generated and will be over-written. Do not edit directly.

  @extends XM.Record
*/
XM._Budget = XM.Record.extend(
  /** @scope XM.Budget.prototype */ {
  
  className: 'XM.Budget',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "MaintainBudgets",
      "read": "MaintainBudgets",
      "update": "MaintainBudgets",
      "delete": "MaintainBudgets"
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
    @type XM.BudgetItem
  */
  items: SC.Record.toMany('XM.BudgetItem')

});
