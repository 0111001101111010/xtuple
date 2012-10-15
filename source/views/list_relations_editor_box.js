/*jshint bitwise:false, indent:2, curly:true eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true white:true*/
/*global XT:true, XM:true, XV:true, _:true, enyo:true*/

(function () {

  /**
    Use this class to define the editor for `XV.ListRelationsEditorBox`.

    @class
    @name XV.RelationsEditor
    @extends XV.Groupbox
    @see XV.ListRelationsEditorBox
  */
  var editor = enyo.mixin(XV.EditorMixin, {
    name: "XV.RelationsEditor",
    kind: "XV.Groupbox",
    handlers: {
      onValueChange: "controlValueChanged"
    },
    setValue: function (value) {
      var changes = {},
        options = {},
        attrs,
        i;
      this.value = value;
      attrs = value.getAttributeNames();
      for (i = 0; i < attrs.length; i++) {
        changes[attrs[i]] = true;
      }
      options.changes = changes;
      this.attributesChanged(value, options);
    }
  });
  enyo.kind(editor);

  /**
    Must include a component called `list`.
    List must be of sub-kind `XV.ListRelations`.
    The `value` must be set to a collection of `XM.Model`.

    @class
    @name XV.ListRelationsEditorBox
    @extends XV.Groupbox
    @see XV.RelationsEditor
  */
  enyo.kind(/** @lends XV.ListRelationsEditorBox# */{
    name: "XV.ListRelationsEditorBox",
    kind: "XV.Groupbox",
    classes: "panel xv-relations-editor-box",
    published: {
      attr: null,
      value: null,
      title: "",
      parentKey: "",
      listRelations: "",
      editor: null
    },
    handlers: {
      onSelect: "selectionChanged",
      onDeselect: "selectionChanged",
      onValueChange: "controlValueChanged"
    },
    attrChanged: function () {
      this.$.list.setAttr(this.attr);
    },
    controlValueChanged: function () {
      this.$.list.refresh();
      return true;
    },
    create: function () {
      this.inherited(arguments);
      var editor = this.getEditor(),
        panels,
        control;

      // Header
      this.createComponent({
        kind: "onyx.GroupboxHeader",
        content: this.getTitle()
      });

      // List
      panels = {
        kind: "Panels",
        fit: true,
        arrangerKind: "CollapsingArranger",
        components: [
          {kind: editor, name: "editor"},
          {kind: this.getListRelations(), name: "list",
            attr: this.getAttr(), fit: true}
        ]
      };
      control = this.createComponent(panels);
      control.setIndex(1);

      // Buttons
      this.createComponent({
        kind: "FittableColumns",
        classes: "xv-groupbox-buttons",
        components: [
          {kind: "onyx.Button", name: "newButton", onclick: "newItem",
            content: "_new".loc(), classes: "xv-groupbox-button-left"},
          {kind: "onyx.Button", name: "deleteButton", onclick: "deleteItem",
            content: "_delete".loc(), classes: "xv-groupbox-button-right",
            disabled: true}
        ]
      });

    },
    deleteItem: function () {
      var index = this.$.list.getFirstSelected(),
        model = index ? this.$.list.getModel(index) : null;
      this.$.list.getSelection().deselect(index, false);
      model.destroy();
      this.$.list.lengthChanged();
    },
    newItem: function () {
      var collection = this.$.list.getValue(),
        Klass = collection.model,
        model = new Klass(null, {isNew: true});
      this.$.editor.clear();
      collection.add(model);
      this.$.list.select(collection.length - 1);
    },
    selectionChanged: function (inSender, inEvent) {
      var index = this.$.list.getFirstSelected(),
        model = index ? this.$.list.getModel(index) : null,
        that = this;
      this.$.deleteButton.setDisabled(true);
      if (index) {
        this.$.editor.setValue(model);
        model.used({
          success: function (resp) {
            that.$.deleteButton.setDisabled(resp);
          }
        });
        this.$.panels.previous();
      } else {
        this.$.panels.setIndex(1);
      }
    },
    valueChanged: function () {
      var value = this.getValue();
      this.$.list.setValue(value);
    }
  });

}());
