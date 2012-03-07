// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @class

  This code is automatically generated and will be over-written. Do not edit directly.

  @extends XM.Record
*/
XM._GeneralLedger = XM.Record.extend(
  /** @scope XM._GeneralLedger.prototype */ {
  
  className: 'XM.GeneralLedger',

  nestedRecordNamespace: XM,

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": false,
      "read": "Viewglactions",
      "update": false,
      "delete": false
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
    @type Date
  */
  date: SC.Record.attr(Date),

  /**
    @type String
  */
  notes: SC.Record.attr(String),

  /**
    @type XM.LedgerAccountInfo
  */
  ledgerAccount: SC.Record.toOne('XM.LedgerAccountInfo', {
    isNested: true
  }),

  /**
    @type String
  */
  sense: SC.Record.attr(String),

  /**
    @type Number
  */
  amount: SC.Record.attr(Number),

  /**
    @type Number
  */
  journalNumber: SC.Record.attr(Number),

  /**
    @type Number
  */
  created: SC.Record.attr(Number),

  /**
    @type Number
  */
  createdBy: SC.Record.attr(Number),

  /**
    @type Boolean
  */
  isDeleted: SC.Record.attr(Boolean)

});
