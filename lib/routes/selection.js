/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  var _fs = X.fs, _path = X.path, salt, crypt;

  /**
    Defines the selection route. The selection route is used for ABC.

    @class
   */
  X.selectionRoute = X.Route.create({
    handle: function (xtr) {
      var data = xtr.get("payload"), K = this.get("model"), session, loc;
      loc = "https://%@/client".f(xtr.get("request").headers.host || "localhost");

      //X.debug("X.selectionRoute.handle(): ", data);

      session = X.Session.create(data);
      session.once("isReady", function () {
        //X.debug("X.selectionRoute.handle.session.isReady(): ", session.get("details"));
        xtr.write(X.mixin(session.get("details"), {loc: loc})).close();
      });
      session.on("error", function () {
        xtr.error(session.get("error"));
      });
    },
    model: function () {
      return X.userCache.model("User");
    }.property(),
    handles: "login/selection /login/selection".w(),
    needsSession: false
  });
}());

