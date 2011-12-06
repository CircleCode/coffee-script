(function() {
  var AstTamer, Deferrals, Rendezvous, makeDeferReturn;
  var __slice = Array.prototype.slice;

  exports.AstTamer = AstTamer = (function() {

    function AstTamer() {
      var rest;
      rest = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    }

    AstTamer.prototype.transform = function(x) {
      return x.tameTransform();
    };

    return AstTamer;

  })();

  exports["const"] = {
    k: "__tame_k",
    ns: "tame",
    Deferrals: "Deferrals",
    deferrals: "__tame_deferrals",
    fulfill: "_fulfill",
    b_while: "_break",
    t_while: "_while",
    c_while: "_continue",
    defer_method: "defer",
    slot: "__slot",
    assign_fn: "assign_fn",
    runtime: "tamerun"
  };

  makeDeferReturn = function(obj, defer_args, id) {
    var k, ret, _i, _len, _ref;
    ret = function() {
      var inner_args, _ref;
      inner_args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (defer_args != null) {
        if ((_ref = defer_args.assign_fn) != null) _ref.apply(null, inner_args);
      }
      return obj._fulfill(id);
    };
    if (defer_args) {
      ret.__tame_trace = {};
      _ref = ["parent_cb", "file", "line", "func_name"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        ret.__tame_trace[k] = defer_args[k];
      }
    }
    return ret;
  };

  Deferrals = (function() {

    function Deferrals(k) {
      this.continuation = k;
      this.count = 1;
    }

    Deferrals.prototype._fulfill = function() {
      if (--this.count === 0) return this.continuation();
    };

    Deferrals.prototype.defer = function(args) {
      var self;
      this.count++;
      self = this;
      return makeDeferReturn(self, args, null);
    };

    return Deferrals;

  })();

  Rendezvous = (function() {
    var RvId;

    function Rendezvous() {
      this.completed = [];
      this.waiters = [];
      this.defer_id = 0;
      this.__tame_defers = this;
    }

    RvId = (function() {

      function RvId(rv, id) {
        this.rv = rv;
        this.id = id;
      }

      RvId.prototype.defer = function(defer_args) {
        return this.rv._deferWithId(this.id, defer_args);
      };

      return RvId;

    })();

    Rendezvous.prototype.wait = function(cb) {
      var x;
      if (this.completed.length) {
        x = this.completed.shift();
        return cb(x);
      } else {
        return this.waiters.push(cb);
      }
    };

    Rendezvous.prototype.defer = function(defer_args) {
      var id;
      id = this.defer_id++;
      return this.deferWithId(id, defer_args);
    };

    Rendezvous.prototype.id = function(i) {
      return {
        __tame_defers: new this.RvId(this, i)
      };
    };

    Rendezvous.prototype._fulfill = function(id) {
      var cb;
      if (this.waiters.length) {
        cb = this.waiters.shift();
        return cb(id);
      } else {
        return this.completed.push(id);
      }
    };

    Rendezvous.prototype._deferWithId = function(id, defer_args) {
      this.count++;
      return makeDeferReturn(this, defer_args, id);
    };

    return Rendezvous;

  })();

  exports.runtime = {
    Deferrals: Deferrals,
    Rendezvous: Rendezvous
  };

}).call(this);