/*jshint bitwise:true, indent:2, curly:true eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true white:true*/
/*global XT:true, XM:true, XV:true, _:true, enyo:true, Globalize:true*/

(function () {

  var ROWS_PER_FETCH = 50;
  var FETCH_TRIGGER = 100;

  enyo.kind({
    name: "XV.ListItem",
    classes: "xv-list-item",
    ontap: "itemTap",
    setSelected: function (inSelected) {
      this.addRemoveClass("item-selected", inSelected);
    }
  });

  enyo.kind({
    name: "XV.ListColumn",
    classes: "xv-list-column"
  });

  enyo.kind({
    name: "XV.ListAttr",
    classes: "xv-list-attr",
    published: {
      attr: ""
    }
  });

  enyo.kind({
    name: "XV.List",
    kind: "List",
    classes: "xv-list",
    published: {
      label: "",
      collection: null,
      filterDescription: "",
      query: null,
      isFetching: false,
      isMore: true,
      parameterWidget: null,
      canAddNew: true,
      value: null
    },
    events: {
      onItemTap: "",
      onWorkspace: ""
    },
    fixedHeight: true,
    handlers: {
      onModelChange: "modelChanged",
      onSetupItem: "setupItem"
    },
    collectionChanged: function () {
      var collection = this.getCollection(),
        Klass = collection ? XT.getObjectByName(collection) : false;

      if (Klass) {
        this.setValue(new Klass());
      } else {
        this.setValue(null);
      }
    },
    create: function () {
      this.inherited(arguments);
      this.collectionChanged();
    },
    getModel: function (index) {
      return this.getValue().models[index];
    },
    getSearchableAttributes: function () {
      return this.getValue().model.getSearchableAttributes();
    },
    getWorkspace: function () {
      var collection = this.getCollection(),
        Klass = collection ? XT.getObjectByName(collection) : null,
        recordType = Klass ? Klass.prototype.model.prototype.recordType : null;
      return XV.getWorkspace(recordType);
    },
    fetch: function (options) {
      var that = this,
        query = this.getQuery() || {},
        success;
      options = options ? _.clone(options) : {};
      options.showMore = _.isBoolean(options.showMore) ?
        options.showMore : false;
      success = options.success;

      // Lazy Loading
      if (options.showMore) {
        query.rowOffset += ROWS_PER_FETCH;
        options.add = true;
      } else {
        query.rowOffset = 0;
        query.rowLimit = ROWS_PER_FETCH;
      }

      _.extend(options, {
        success: function (resp, status, xhr) {
          that.fetched();
          if (success) { success(resp, status, xhr); }
        },
        query: query
      });
      this.getValue().fetch(options);
    },
    fetched: function () {
      var query = this.getQuery() || {},
        offset = query.rowOffset || 0,
        limit = query.rowLimit || 0,
        count = this.getValue().length,
        isMore = limit ?
          (offset + limit <= count) && (this.getCount() !== count) : false,
        rowsPerPage;
      this.isMore = isMore;
      this.fetching = false;

      // Reset the size of the list
      this.setCount(count);

      // Hack: Solves scroll problem for small number of rows
      // but doesn't seem quite right
      rowsPerPage = count && 50 > count ? count : 50;
      if (rowsPerPage !== this.rowsPerPage) {
        this.setRowsPerPage(rowsPerPage);
      }
      if (offset) {
        this.refresh();
      } else {
        this.reset();
      }
    },
    itemTap: function (inSender, inEvent) {
      inEvent.list = this;
      this.doItemTap(inEvent);
    },
    modelChanged: function (inSender, inEvent) {
      var that = this,
        workspace = this.getWorkspace(),
        options = {},
        model;
      // If the model that changed was related to and exists on this list
      // refresh the item.
      workspace = workspace ? XT.getObjectByName(workspace) : null;
      if (workspace && workspace.prototype.model === inEvent.model &&
          this.getValue()) {
        model = this.getValue().get(inEvent.id);
        if (model) {
          options.success = function () {
            that.refresh();
          };
          model.fetch(options);
        }
      }
    },
    /**
      Makes sure the collection can handle the sort order
      defined in the query.
    */
    queryChanged: function () {
      var query = this.getQuery();
      if (this.getValue() && query.orderBy) {
        this.getValue().comparator = function (a, b) {
          var aval,
            bval,
            attr,
            i;
          for (i = 0; i < query.orderBy.length; i++) {
            attr = query.orderBy[i].attribute;
            aval = query.orderBy[i].descending ? b.getValue(attr) : a.getValue(attr);
            bval = query.orderBy[i].descending ? a.getValue(attr) : b.getValue(attr);
            aval = !isNaN(aval) ? aval - 0 : aval;
            bval = !isNaN(aval) ? bval - 0 : bval;
            if (aval !== bval) {
              return aval > bval ? 1 : -1;
            }
          }
          return 0;
        };
      }
    },
    scroll: function (inSender, inEvent) {
      var r = this.inherited(arguments);
      // Manage lazy loading
      var max = this.getScrollBounds().maxTop - this.rowHeight * FETCH_TRIGGER,
        options = {};
      if (this.isMore && this.getScrollPosition() > max && !this.fetching) {
        this.fetching = true;
        options.showMore = true;
        this.fetch(options);
      }
      return r;
    },
    setupItem: function (inSender, inEvent) {
      var model = this.getValue().models[inEvent.index],
        prop,
        isPlaceholder,
        view,
        value,
        formatter,
        attr;

      // Loop through all attribute container children and set content
      for (prop in this.$) {
        if (this.$.hasOwnProperty(prop) && this.$[prop].getAttr) {
          view = this.$[prop];
          isPlaceholder = false;
          attr = this.$[prop].getAttr();
          value = model.getValue ? model.getValue(attr) : model.get(attr);
          formatter = view.formatter;
          if (!value && view.placeholder) {
            value = view.placeholder;
            isPlaceholder = true;
          }
          view.addRemoveClass("placeholder", isPlaceholder);
          if (formatter) {
            value = this[formatter](value, view, model);
          }
          if (value && value instanceof Date) {
            value = Globalize.format(value, 'd');
          }
          view.setContent(value);
        }
      }
      return true;
    },
    setQuery: function () {
      var old = _.clone(this.query);
      this.inherited(arguments);
      // Standard call doesn't do deep comparison
      if (_.isEqual(old, this.query)) {
        this.queryChanged();
      }
    }

  });

}());
