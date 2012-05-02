// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @scope XM.StandardJournalGroup
  @mixin

  This code is automatically generated and will be over-written. Do not edit directly.
*/
XM._StandardJournalGroup = {
  /** @scope XM.StandardJournalGroup.prototype */
  
  className: 'XM.StandardJournalGroup',

  nestedRecordNamespace: XM,

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "MaintainStandardJournalGroups",
      "read": "MaintainStandardJournalGroups",
      "update": "MaintainStandardJournalGroups",
      "delete": "MaintainStandardJournalGroups"
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
    @type Date
  */
  name: SC.Record.attr(XT.DateTime, {
    format: '%Y-%m-%d',
    useIsoDate: false
  }),

  /**
    @type String
  */
  description: SC.Record.attr(String),

  /**
    @type XM.StandardJournalGroupItem
  */
  items: SC.Record.toMany('XM.StandardJournalGroupItem', {
    isNested: true,
    inverse: 'standardJournalGroup'
  })

};
