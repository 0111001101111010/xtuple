// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.UserAccountRoleInfo
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._UserAccountRoleInfo = {
  /** @scope XM.UserAccountRoleInfo.prototype */
  
  className: 'XM.UserAccountRoleInfo',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": false,
      "read": true,
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
    @type String
  */
  name: SC.Record.attr(String),

  /**
    @type XM.UserAccountRolePrivilegeAssignment
  */
  privileges: SC.Record.toMany('XM.UserAccountRolePrivilegeAssignment')

};
