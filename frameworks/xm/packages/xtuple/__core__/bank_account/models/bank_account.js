// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

sc_require('mixins/_bank_account');

/**
  @class

  @extends XM.Document
*/
XM.BankAccount = XM.Document.extend(XM._BankAccount,
  /** @scope XM.BankAccount.prototype */ { 

  // see document mixin for object behavior(s)
  documentKey: 'name',
  
  // .................................................
  // CALCULATED PROPERTIES
  //

  //..................................................
  // METHODS
  //

  //..................................................
  // OBSERVERS
  //

  statusDidChange: function() {
    var status = this.get('status');

    if (status !== SC.Record.READY_NEW) {
      this.currency.set('isEditable', false);
    }
  }.observes('status')

});

XM.BankAccount.mixin( /** @scope XM.BankAccount */ {

/**
  @static
  @constant
  @type Number
  @default 0
*/
  CHECKING: 0,

/**
  @static
  @constant
  @type Number
  @default 1
*/
  CASH: 1,

/**
  @static
  @constant
  @type Number
  @default 2
*/
  CREDIT_CARD: 2

});
