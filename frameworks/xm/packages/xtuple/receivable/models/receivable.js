// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

sc_require('xbos/__generated__/_receivable');
sc_require('mixins/document');

/**
  @class

  @extends XM._Receivable
  @extends XM.Document
*/
XM.Receivable = XM._Receivable.extend(XM.Document,
  /** @scope XM.Receivable.prototype */ {

  numberPolicy: XM.AUTO_OVERRIDE_NUMBER

  // .................................................
  // CALCULATED PROPERTIES
  //

  //..................................................
  // METHODS
  //

  //..................................................
  // OBSERVERS
  //

});

