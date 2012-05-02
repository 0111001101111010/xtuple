// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.CustomerCreditCardPayment
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._CustomerCreditCardPayment = {
  /** @scope XM.CustomerCreditCardPayment.prototype */
  
  className: 'XM.CustomerCreditCardPayment',

  nestedRecordNamespace: XM,

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "false",
      "read": "ProcessCreditCards",
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
    @type XM.CustomerInfo
  */
  customer: SC.Record.toOne('XM.CustomerInfo', {
    isNested: true
  }),

  /**
    @type String
  */
  customerCreditCardPaymentType: SC.Record.attr(String),

  /**
    @type String
  */
  customerCreditCardPaymentStatus: SC.Record.attr(String),

  /**
    @type String
  */
  documentNumber: SC.Record.attr(String),

  /**
    @type String
  */
  reference: SC.Record.attr(String),

  /**
    @type Number
  */
  amount: SC.Record.attr(Number),

  /**
    @type XM.Currency
  */
  currency: SC.Record.toOne('XM.Currency'),

  /**
    @type Date
  */
  created: SC.Record.attr(XT.DateTime, {
    useIsoDate: true
  }),

  /**
    @type String
  */
  createdBy: SC.Record.attr(String)

};
