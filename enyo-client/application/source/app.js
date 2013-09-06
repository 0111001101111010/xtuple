/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, trailing:true,
white:true*/
/*global enyo:true, XT:true, _:true, document:true */

(function () {

  enyo.kind({
    name: "App",
    kind: "XV.App",
    keyCapturePatterns: [
      {method: "captureMagstripe", start: [16, 53, 16, 66], end: [191, 13]}
    ],
    components: [
      { name: "postbooks", kind: "XV.Postbooks",  onTransitionStart: "handlePullout" },
      { name: "pullout", kind: "XV.Pullout", onAnimateFinish: "pulloutAnimateFinish" },
      { name: "signals", kind: enyo.Signals, onkeydown: "handleKeyDown" }
    ],
    captureMagstripe: function (value) {
      var parseMagstripe = function (input) {
        var parseObj = {};

        parseObj.number = input.substring(0, 16);
        input = input.substring(18);
        parseObj.name = input.substring(0, input.indexOf('6'));
        parseObj.name = parseObj.name.split("¿").reverse().join(" ");
        input = input.substring(1 + input.indexOf('6'));
        parseObj.year = "20" + input.substring(0, 2);
        input = input.substring(2);
        parseObj.month = input.substring(0, 2);

        return parseObj;
      };

      XT.log(parseMagstripe(value));
      // TODO: do something
    },
    processHotKey: function (keyCode) {
      var active = this.$.postbooks.getActive();
      active.waterfall("onHotKey", {keyCode: keyCode});
    },
  });

}());
