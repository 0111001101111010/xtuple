/*jshint bitwise:false, indent:2, curly:true eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true white:true*/
/*global XV:true, XM:true, _:true, onyx:true, enyo:true, XT:true */

(function () {

  XV._modelLists = {};
  XV._modelWorkspaces = {};

  // Class methods
  enyo.mixin(XV, {

    /**
      Add component or array of component view(s) to a view class that
      has implemented the `extensionsMixin`.

      Examples of classes that support extensions are:
        * `Workspace`
        * `ParameterWidget`

      @param {String} Class name
      @param {Object|Array} Component(s)
    */
    appendExtension: function (workspace, extension) {
      var Klass = XT.getObjectByName(workspace),
        extensions = Klass.prototype.extensions || [];
      if (!_.isArray(extension)) {
        extension = [extension];
      }
      Klass.prototype.extensions = extensions.concat(extension);
    },

    getList: function (recordType) {
      return XV._modelLists[recordType];
    },

    getWorkspace: function (recordType) {
      return XV._modelWorkspaces[recordType];
    },

    registerModelList: function (recordType, list) {
      XV._modelLists[recordType] = list;
    },

    registerModelWorkspace: function (recordType, workspace) {
      XV._modelWorkspaces[recordType] = workspace;
    }

  });
  
  /**
    @class
    
    A mixin that allows the components of a class to be extended.
  */
  XV.ExtensionsMixin = {
    extensions: null,
    
    /**
      This function should be run in the create function of a class
      using this mixin. It will add any extensions to the class at run time.
    */
    processExtensions: function () {
      var extensions = this.extensions || [],
        ext,
        i;
      if (this._extLength === extensions.length) { return; }
      for (i = 0; i < extensions.length; i++) {
        ext = _.clone(this.extensions[i]);
        // Resolve name of container to the instance
        if (ext.container && typeof ext.container === 'string') {
          ext.container = this.$[ext.container];
        }
        this.createComponent(ext);
      }
      this._extLength = extensions.length;
    }
  };

}());
