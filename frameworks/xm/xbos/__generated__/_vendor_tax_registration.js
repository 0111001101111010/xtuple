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
XM._VendorTaxRegistration = XM.Record.extend(
  /** @scope XM._VendorTaxRegistration.prototype */ {
  
  className: 'XM.VendorTaxRegistration',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
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
    @type XM.Vendor
  */
  vendor: SC.Record.toOne('XM.Vendor'),

  /**
    @type XM.TaxAuthority
  */
  taxAuthority: SC.Record.toOne('XM.TaxAuthority'),

  /**
    @type String
  */
  number: SC.Record.attr(String),

  /**
    @type XM.TaxZone
  */
  taxZone: SC.Record.toOne('XM.TaxZone'),

  /**
    @type Date
  */
  effective: SC.Record.attr(Date),

  /**
    @type Date
  */
  expires: SC.Record.attr(Date),

  /**
    @type String
  */
  notes: SC.Record.attr(String)

});
