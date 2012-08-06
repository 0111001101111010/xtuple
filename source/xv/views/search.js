/*jshint bitwise:true, indent:2, curly:true eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true white:true*/
/*global XT:true, XV:true, XM:true, _:true, enyo:true*/

(function () {
  var ROWS_PER_FETCH = 50,
    FETCH_TRIGGER = 100;

  enyo.kind({
    name: "XV.Search",
    kind: "Panels",
    arrangerKind: "CollapsingArranger",
    label: "",
    classes: "app enyo-unselectable",
    handlers: {
      onParameterChange: "requery",
      onScroll: "didScroll",
      onInfoListRowTapped: "doInfoListRowTapped"
    },
    showPullout: false,
    realtimeFit: true,
    components: [
      {kind: "FittableRows", name: "leftBar", classes: "left", components: [
        {kind: "onyx.Toolbar", classes: "onyx-menu-toolbar", components: [
          {kind: "onyx.Button", content: "_back".loc(), ontap: "showDashboard"},
          {name: "leftLabel"}
        ]}
      ]},
      {kind: "FittableRows", name: "contentArea", fit:true, components: [
        {kind: "FittableColumns", noStretch: true,
           classes: "onyx-toolbar onyx-toolbar-inline", components: [
          {kind: "onyx.Grabber"},
          {kind: "Scroller", thumb: false, fit: true, touch: true,
             vertical: "hidden", style: "margin: 0;", components: [
            {classes: "onyx-toolbar-inline", style: "white-space: nowrap;"},
            {name: "rightLabel", style: "text-align: center"}
          ]},
          {kind: "onyx.InputDecorator", components: [
            {name: 'searchInput', kind: "onyx.Input", style: "width: 200px;",
              placeholder: "Search", onchange: "inputChanged"},
            {kind: "Image", src: "images/search-input-search.png"}
          ]},
        ]},
        { content: "before list" },
        { kind: "XV.ContactInfoList", name: "searchList" },
        { content: "after list" }
        //{ kind: "XV.ContactInfoParameters", name: "searchParameters" }
      ]}
    ],
    setOptions: function (options) {
      var listKind = options.listKind,
        listName = listKind.replace("XV.", "").camelize(),
        parameterKind;

      /**
       * Add the appropriate search list

      if (this.$.contentArea.$.searchList) {
        this.$.contentArea.removeChild(this.$.contentArea.$.searchList);
      }
      this.createComponent({ kind: listKind, name: "searchList", container: this.$.contentArea });
      this.$.contentArea.render();
      */
      XT.log("collection size before fetch is " + this.$.searchList.collection.length);
      this.fetch();
      setTimeout(enyo.bind(this, 'renderContentArea'), 10000); // XXX debugging
      /**
       * Add the appropriate search parameters
       */
      if (this.$.leftBar.$.searchParameters) {
        this.$.leftBar.removeChild(this.$.leftBar.$.searchParameters);
      }
      parameterKind = this.$.searchList.getParameterWidget();
      this.createComponent({ kind: parameterKind, name: "searchParameters", container: this.$.leftBar });
      this.$.leftBar.render();
    },
    renderContentArea: function () {
      XT.log("collection size after fetch is " + this.$.searchList.collection.length);
      this.$.searchList.render();
      this.$.contentArea.render();
    },

    fetch: function (options) {
      var list = this.$.searchList,
        query = list.getQuery() || {},
        input = this.$.searchInput.getValue(),
        parameterWidget = this.$.searchParameters,
        parameters = parameterWidget ? parameterWidget.getParameters() : [];
      options = options ? _.clone(options) : {};
      options.showMore = _.isBoolean(options.showMore) ?
        options.showMore : false;

      // Build parameters
      if (input || parameters.length) {
        query.parameters = [];

        // Input search parameters
        if (input) {
          query.parameters = [{
            attribute: list.getCollection().model.getSearchableAttributes(),
            operator: 'MATCHES',
            value: this.$.searchInput.getValue()
          }];
        }

        // Advanced parameters
        if (parameters) {
          query.parameters = query.parameters.concat(parameters);
        }
      } else {
        delete query.parameters;
      }

      if (options.showMore) {
        query.rowOffset += ROWS_PER_FETCH;
        options.add = true;
      } else {
        query.rowOffset = 0;
        query.rowLimit = ROWS_PER_FETCH;
      }
      list.setQuery(query);
      list.fetch(options);
    },
    // menu
    didScroll: function (inSender, inEvent) {
      if (inEvent.originator.kindName !== "XV.InfoListPrivate") { return; }
      var list = inEvent.originator,
        max = list.getScrollBounds().maxTop - list.rowHeight * FETCH_TRIGGER,
        options = {};
      if (list.getIsMore() && list.getScrollPosition() > max && !list.getIsFetching()) {
        list.setIsFetching(true);
        options.showMore = true;
        this.fetch(list.owner.name, options);
      }
    },
    requery: function (inSender, inEvent) {
      this.fetch();
    },
    showDashboard: function () {
      this.bubble("dashboard", {eventName: "dashboard"});
    },
    showHistory: function (inSender, inEvent) {
      var panel = {name: 'history'};
      this.doTogglePullout(panel);
    },
    /**
     * Catches the tap event from the {XV.InfoListRow}
     * and repackages it into a carousel event to be
     * caught further up.
    */
    doInfoListRowTapped: function (inSender, inEvent) {
      //
      // Determine which item was tapped
      //
      var tappedList = this.$.searchList;

      var itemIndex = inEvent.index;
      var tappedModel = tappedList.collection.models[itemIndex];

      //
      // Bubble up an event so that we can transition to workspace view.
      // Add the tapped model as a payload in the event
      //
      this.bubble("workspace", {eventName: "workspace", options: tappedModel });
      return true;
    },
    newWorkspace: function (inSender, inEvent) {
      var modelType = this.$.selectedList.query.recordType;
      var emptyModel = new XM[XV.util.formatModelName(modelType)]();
      emptyModel.initialize(null, { isNew: true });
      this.bubble("workspace", {eventName: "workspace", options: emptyModel });
    },
  });

}());
