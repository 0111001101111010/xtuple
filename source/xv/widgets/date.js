/*jshint node:true, indent:2, curly:true eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, trailing:true, white:true */
/*global XT:true, XV:true, enyo:true, _:true, Globalize:true */

(function () {

  enyo.kind({
    name: "XV.Date",
    kind: "XV.Input",

    /**
      Sets the value programatically.

      @param value Can be Date or String, but if it's a string that doesn't
        look like a date then it will be set to null.
      @param {Object} options
     */
    setValue: function (value, options) {
      if (value) {
        value = new Date(value.valueOf()); // clone. Also converts string to date.
        if (isNaN(value.getTime())) {
          value = null;
        }
      } else {
        value = null;
      }
      XV.Input.prototype.setValue.call(this, value, options);
    },
    textToDate: function (value) {
      var date = null,
        daysInMilliseconds = 1000 * 60 * 60 * 24;

      // Try to parse out a date given the various allowable shortcuts
      if (value === '0' ||
        value.indexOf('+') === 0 ||
        value.indexOf('-') === 0) {
        // 0 means today, +1 means tomorrow, -2 means 2 days ago, etc.
        date = new Date(new Date().getTime() + value * daysInMilliseconds);
      } else if (value.indexOf('#') === 0) {
        // #40 means the fortieth day of this year, so set the month to 0
        // and set the date accordingly. JS appropriately pushes the date
        // into subsequent months as necessary
        date = new Date();
        date.setMonth(0);
        date.setDate(value.substring(1));
      } else if (value.length && !isNaN(value)) {
        // A positive integer by itself means that day of this month
        date = new Date();
        date.setDate(value);
      } else if (value) {
        // Dates in the format of dates as we're used to them.
        // we're counting on JS to parse the date correctly
        date = new Date(value);
      }

      // Validate
      if (date) {
        if (isNaN(date.getTime())) {
          date = false;
        } else {
          date.setHours(0, 0, 0, 0);
        }
      }
      return date;
    },
    validate: function (value) {
      value = this.textToDate(value);
      return (_.isDate(value) || _.isEmpty(value)) ? value : false;
    },
    valueChanged: function (value) {
      if (value) {
        value = new Date(value.valueOf());
        value.setMinutes(value.getTimezoneOffset());
        value = Globalize.format(value, "d");
      } else {
        value = "";
      }
      return XV.Input.prototype.valueChanged.call(this, value);
    }
  });

  enyo.kind({
    name: "XV.DateWidget",
    kind: "XV.Date",
    classes: "xv-inputwidget xv-datewidget",
    published: {
      label: "",
      showLabel: true
    },
    components: [
      {kind: "FittableColumns", components: [
        {name: "label", content: "", classes: "xv-decorated-label"},
        {kind: "onyx.InputDecorator", name: "decorator",
          classes: "xv-input-decorator", components: [
          {name: "input", kind: "onyx.Input", onchange: "inputChanged",
            classes: "xv-subinput"},
          {kind: "onyx.MenuDecorator", components: [
            {name: "icon", kind: "onyx.IconButton", ontap: "iconTapped",
              src: "assets/date-icon.png"},
            {name: "datePickPopup", kind: "onyx.Menu", maxHeight: 400, modal: true, floating: true,
                style: "min-width:400px;",
                components: [
              {kind: "GTS.DatePicker", name: "datePick", onChange: "datePicked"}
            ]}
          ]}
        ]}
      ]}
    ],
    create: function () {
      this.inherited(arguments);
      this.labelChanged();
      this.showLabelChanged();
    },
    datePicked: function (inSender, inEvent) {
      this.setValue(inEvent);
      this.$.datePickPopup.hide();
    },
    iconTapped: function (inSender, inEvent) {
      this.$.datePick.render();
    },
    labelChanged: function () {
      var label = (this.getLabel() || ("_" + this.attr || "").loc()) + ":";
      this.$.label.setContent(label);
    },
    showLabelChanged: function () {
      if (this.getShowLabel()) {
        this.$.label.show();
      } else {
        this.$.label.hide();
      }
    },
    valueChanged: function (value) {
      var dateValue = value;
      value = XV.Date.prototype.valueChanged.call(this, value);
      this.$.datePick.setValue(value ? dateValue : new Date());
      this.$.datePick.render();
    }
  });

}());
