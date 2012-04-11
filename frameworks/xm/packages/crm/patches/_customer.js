// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @patch

  This code is automatically generated and will be over-written. Do not edit directly.
*/
SC.Patch.create( /** @scope XM.Customer.prototype */ { 
  
  target: 'XM.Customer',

  body: {
  
    /**
      @type XM.Account
    */
    account: SC.Record.toOne('XM.Account', {
      label: '_account'.loc()
    }),
  
    /**
      @type XM.ContactInfo
    */
    contactRelations: SC.Record.toMany('XM.ContactInfo', {
      label: '_contactRelations'.loc()
    }),
  
    /**
      @type XM.IncidentInfo
    */
    incidentRelations: SC.Record.toMany('XM.IncidentInfo', {
      label: '_incidentRelations'.loc()
    }),
  
    /**
      @type XM.OpportunityInfo
    */
    opportunitytRelations: SC.Record.toMany('XM.OpportunityInfo', {
      label: '_opportunitytRelations'.loc()
    }),
  
    /**
      @type XM.ToDoInfo
    */
    toDoRelations: SC.Record.toMany('XM.ToDoInfo', {
      label: '_toDoRelations'.loc()
    })

  }

});
