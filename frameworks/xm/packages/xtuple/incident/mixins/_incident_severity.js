// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.IncidentSeverity
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._IncidentSeverity = {
  /** @scope XM.IncidentSeverity.prototype */
  
  className: 'XM.IncidentSeverity',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "MaintainIncidentSeverities",
      "read": "MaintainIncidentSeverities",
      "update": "MaintainIncidentSeverities",
      "delete": "MaintainIncidentSeverities"
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
    @type String
  */
  name: SC.Record.attr(String, {
    label: '_name'.loc()
  }),

  /**
    @type Number
  */
  order: SC.Record.attr(Number, {
    label: '_order'.loc()
  }),

  /**
    @type String
  */
  description: SC.Record.attr(String, {
    label: '_description'.loc()
  })

};
