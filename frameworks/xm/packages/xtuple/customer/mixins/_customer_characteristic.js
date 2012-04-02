// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.CustomerCharacteristic
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._CustomerCharacteristic = {
  /** @scope XM.CustomerCharacteristic.prototype */
  
  className: 'XM.CustomerCharacteristic',

  nestedRecordNamespace: XM,

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
    @type Number
  */
  customer: SC.Record.attr(Number, {
    label: '_customer'.loc()
  }),

  /**
    @type XM.Characteristic
  */
  characteristic: SC.Record.toOne('XM.Characteristic', {
    isNested: true,
    isRequired: true,
    label: '_characteristic'.loc()
  }),

  /**
    @type Number
  */
  value: SC.Record.attr(Number, {
    label: '_value'.loc()
  })

};
