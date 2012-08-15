/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";
  
  var _ = X._;
  
  X.sessionRoute = X.Route.create({
    
    handle: function (xtr) {
      var session; 

      //X.debug("handle(route, session): ", xtr.get("data"), X.typeOf(xtr.get("data")));
      
      session = X.Session.create(xtr.get("payload"));
      session.once("isReady", _.bind(this.ready, this, session, xtr));
      session.once("error", _.bind(this.error, this, session, xtr));
    },
    
    ready: function (session, xtr) {
      //X.log("ready(): ");
      session.removeAllListeners("isReady");
      
      // ugly much?
      xtr.write({code: 1, data: session.get("details")}).close();
    },
    
    error: function (session, xtr) {
      //X.warn("error(): ", session.get("error"));
      session.removeAllListeners();
      xtr.error({isError: true, reason: session.get("error")});
    },
    
    needsSession: false,
    handles: "/session".w()
  });
}());

