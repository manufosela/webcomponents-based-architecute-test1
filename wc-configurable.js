var behaviors = behaviors || {};

behaviors['wc-configurable'] = function(key) {
  return {
    ready: function() {
      var cfg = Polymer.dom(this).querySelectorAll(key)
            .map(function(node){
              var result = {};
              var attrs = node.attributes;
              for(var i = attrs.length - 1; i >= 0; i--) {
                result[attrs[i].name] = attrs[i].value;
              }
              return result;
            });
      this.config(cfg);
    }
  }
}