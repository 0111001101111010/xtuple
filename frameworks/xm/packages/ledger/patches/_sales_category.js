// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @patch

  This code is automatically generated and will be over-written. Do not edit directly.
*/
SC.Patch.create( /** @scope XM.SalesCategory.prototype */ { 
  
  target: 'XM.SalesCategory',

  body: {
  
    /**
      @type XM.LedgerAccount
    */
    salesLedgerAccount: SC.Record.toOne('XM.LedgerAccount', {
      isRequired: true,
      label: '_salesLedgerAccount'.loc()
    }),
  
    /**
      @type XM.LedgerAccount
    */
    prepaidLedgerAccount: SC.Record.toOne('XM.LedgerAccount', {
      isRequired: true,
      label: '_prepaidLedgerAccount'.loc()
    }),
  
    /**
      @type XM.LedgerAccount
    */
    receivableLedgerAccount: SC.Record.toOne('XM.LedgerAccount', {
      isRequired: true,
      label: '_receivableLedgerAccount'.loc()
    })

  }

});
