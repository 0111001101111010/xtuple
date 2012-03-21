// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.GeneralLedger
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._GeneralLedger = {
  /** @scope XM.GeneralLedger.prototype */
  
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
  date: SC.Record.attr(SC.DateTime, {
    format: '%Y-%m-%d',
    label: '_date'.loc()
  }),

  /**
    @type String
  */
  notes: SC.Record.attr(String, {
    label: '_notes'.loc()
  }),

  /**
    @type XM.LedgerAccountInfo
  */
  ledgerAccount: SC.Record.toOne('XM.LedgerAccountInfo', {
    isNested: true,
    label: '_ledgerAccount'.loc()
  }),

  /**
    @type String
  */
  sense: SC.Record.attr(String, {
    label: '_sense'.loc()
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
  journalNumber: SC.Record.attr(Number, {
    label: '_journalNumber'.loc()
  }),

  /**
    @type Number
  */
  created: SC.Record.attr(Number, {
    label: '_created'.loc()
  }),

  /**
    @type Number
  */
  createdBy: SC.Record.attr(Number, {
    label: '_createdBy'.loc()
  }),

  /**
    @type Boolean
  */
  isDeleted: SC.Record.attr(Boolean, {
    label: '_isDeleted'.loc()
  })

};
