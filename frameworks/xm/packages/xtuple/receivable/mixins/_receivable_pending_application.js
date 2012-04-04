// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.ReceivablePendingApplication
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._ReceivablePendingApplication = {
  /** @scope XM.ReceivablePendingApplication.prototype */
  
  className: 'XM.ReceivablePendingApplication',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "false",
      "read": "true",
      "update": "false",
      "delete": "false"
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
    @type XM.CashReceipt
  */
  cashReceipt: SC.Record.toOne('XM.CashReceipt', {
    label: '_cashReceipt'.loc()
  }),

  /**
    @type XM.Receivable
  */
  receivable: SC.Record.toOne('XM.Receivable', {
    label: '_receivable'.loc()
  }),

  /**
    @type Number
  */
  amount: SC.Record.attr(Number, {
    label: '_amount'.loc()
  }),

  /**
    @type Number
  */
  discount: SC.Record.attr(Number, {
    isRequired: true,
    label: '_discount'.loc()
  })

};
