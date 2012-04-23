// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.UserAccountUserAccountRoleAssignment
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._UserAccountUserAccountRoleAssignment = {
  /** @scope XM.UserAccountUserAccountRoleAssignment.prototype */
  
  className: 'XM.UserAccountUserAccountRoleAssignment',

  nestedRecordNamespace: XM,

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": true,
      "read": true,
      "update": false,
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
    @type String
  */
  userAccount: SC.Record.attr(String, {
    label: '_userAccount'.loc()
  }),

  /**
    @type XM.UserAccountRoleInfo
  */
  userAccountRole: SC.Record.toOne('XM.UserAccountRoleInfo', {
    isNested: true,
    label: '_userAccountRole'.loc()
  })

};
