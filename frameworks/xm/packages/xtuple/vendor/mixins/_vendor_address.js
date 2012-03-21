// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.VendorAddress
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._VendorAddress = {
  /** @scope XM.VendorAddress.prototype */
  
  className: 'XM.VendorAddress',

  nestedRecordNamespace: XM,

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "MaintainVendorAddresses",
      "read": "ViewVendorAddresses",
      "update": "MaintainVendorAddresses",
      "delete": "MaintainVendorAddresses"
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
  vendor: SC.Record.toOne('XM.Vendor', {
    label: '_vendor'.loc()
  }),

  /**
    @type String
  */
  code: SC.Record.attr(String, {
    label: '_code'.loc()
  }),

  /**
    @type String
  */
  name: SC.Record.attr(String, {
    label: '_name'.loc()
  }),

  /**
    @type String
  */
  notes: SC.Record.attr(String, {
    label: '_notes'.loc()
  }),

  /**
    @type XM.ContactInfo
  */
  contact: SC.Record.toOne('XM.ContactInfo', {
    isNested: true,
    label: '_contact'.loc()
  }),

  /**
    @type XM.AddressInfo
  */
  address: SC.Record.toOne('XM.AddressInfo', {
    isNested: true,
    label: '_address'.loc()
  })

};
