// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.OpportunityCharacteristic
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._OpportunityCharacteristic = {
  /** @scope XM.OpportunityCharacteristic.prototype */
  
  className: 'XM.OpportunityCharacteristic',

  

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
    @type XM.Opportunity
  */
  opportunity: SC.Record.toOne('XM.Opportunity'),

  /**
    @type XM.Characteristic
  */
  characteristic: SC.Record.toOne('XM.Characteristic', {
    isRequired: true
  }),

  /**
    @type String
  */
  value: SC.Record.attr(String)

};
