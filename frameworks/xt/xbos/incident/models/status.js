// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework
// Copyright: ©2011 OpenMFG LLC, d/b/a xTuple
// ==========================================================================
/*globals XT */

XM.Status = XM.Record.extend(
/** @scope XM.Status.prototype */ {

  className: 'XM.Status',

  code:         SC.Record.attr(String),
  name:         SC.Record.attr(String),
  order:        SC.Record.attr(Number),
  color:        SC.Record.attr(String)

});

