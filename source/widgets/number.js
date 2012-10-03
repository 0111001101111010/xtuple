/*jshint node:true, indent:2, curly:true eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, trailing:true, white:true */
/*global XT:true, XV:true, Globalize:true, enyo:true, _:true */

(function () {

  /**
    An input field built for dealing with numbers

    @class
    @name XV.Number
    @extends XV.Input
    @see XV.NumberWidget
   */
  enyo.kind(/** @lends XV.Number */{
    name: "XV.Number",
    kind: "XV.Input",
    published: {
      scale: 0
    },
    setValue: function (value, options) {
      value = _.isNumber(value) ? XT.math.round(value, this.getScale()) : null;
      XV.Input.prototype.setValue.call(this, value, options);
    },
    validate: function (value) {
      value = Number(value);
      return isNaN(value) ? false : value;
    },
    valueChanged: function (value) {
      value = value || value === 0 ? Globalize.format(value, "n" + this.getScale()) : "";
      return XV.Input.prototype.valueChanged.call(this, value);
    }
  });

  /**
    An input with styled label and decorator built for dealing with numbers

    @class
    @name XV.NumberWidget
    @extends XV.Number
   */
  enyo.kind(/** @lends XV.NumberWidget */{
    name: "XV.NumberWidget",
    kind: "XV.Number",
    classes: "xv-inputwidget xv-numberwidget",
    published: {
      label: "",
      showLabel: true,
      placeholder: ""
    },
    components: [
      {kind: "FittableColumns", components: [
        {name: "label", content: "", classes: "xv-label"},
        {kind: "onyx.InputDecorator", classes: "xv-input-decorator",
          components: [
          {name: "input", kind: "onyx.Input", onchange: "inputChanged"}
        ]}
      ]}
    ],
    create: function () {
      this.inherited(arguments);
      this.labelChanged();
      this.showLabelChanged();
    },
    labelChanged: function () {
      var label = (this.getLabel() || ("_" + this.attr + "").loc()) + ":";
      this.$.label.setContent(label);
    },
    showLabelChanged: function () {
      if (this.getShowLabel()) {
        this.$.label.show();
      } else {
        this.$.label.hide();
      }
    }

  });

}());
