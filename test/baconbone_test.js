(function() {
  var SampleCollectionView, SampleModelView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  describe('Backbone.Events', function() {
    describe('#asEventStream', function() {
      beforeEach(function() {
        return this.obj = _.extend({}, Backbone.Events);
      });
      it('adds a subscriber', function() {
        var spy, stream;
        stream = this.obj.asEventStream('foo');
        expect(stream).toBeTruthy();
        spy = jasmine.createSpy();
        stream.onValue(spy);
        this.obj.trigger('foo', 'bar');
        return expect(spy).toHaveBeenCalledWith('bar');
      });
      it('unsubscribes when calling unsubscribe', function() {
        var spy, unsubscriber;
        spy = jasmine.createSpy();
        unsubscriber = this.obj.asEventStream('foo').onValue(spy);
        expect(typeof unsubscriber).toBe('function');
        unsubscriber();
        this.obj.trigger('foo');
        return expect(spy).not.toHaveBeenCalled();
      });
      return it('does not contain other events', function() {
        var spy, unsubscribe;
        spy = jasmine.createSpy();
        unsubscribe = this.obj.asEventStream('foo').onValue(spy);
        this.obj.trigger('bar');
        return expect(spy).not.toHaveBeenCalled();
      });
    });
    return describe('mixing in asEventSteream', function() {
      var name, subject, subjects, _results;
      subjects = {
        'Backbone': Backbone,
        'Backbone.Events': Backbone.Events,
        'Backbone.Router': Backbone.Router.prototype,
        'Backbone.Model': Backbone.Model.prototype,
        'Backbone.Collection': Backbone.Collection.prototype,
        'Backbone.View': Backbone.View.prototype
      };
      _results = [];
      for (name in subjects) {
        subject = subjects[name];
        _results.push(it("mixes extensions into " + name, function() {
          expect(_.isFunction(subject.asEventStream)).toBe(true);
          expect(_.isFunction(subject.takeStream)).toBe(true);
          return expect(_.isFunction(subject.dispose)).toBe(true);
        }));
      }
      return _results;
    });
  });

  describe('Backbone.Model', function() {
    return describe('#asProperty', function() {
      beforeEach(function() {
        return this.model = new Backbone.Model({
          foo: 'bar'
        });
      });
      it('creates a property', function() {
        var prop;
        prop = this.model.asProperty('foo');
        return expect(prop instanceof Bacon.Property).toBe(true);
      });
      it('has initial value', function() {
        var spy;
        spy = jasmine.createSpy();
        this.model.asProperty('foo').onValue(spy);
        return expect(spy).toHaveBeenCalledWith('bar');
      });
      it('triggers events on changes', function() {
        var spy;
        spy = jasmine.createSpy();
        this.model.asProperty('foo').onValue(spy);
        this.model.set({
          foo: 'bazinga'
        });
        expect(spy.calls.count()).toBe(2);
        return expect(spy).toHaveBeenCalledWith('bazinga');
      });
      return it('tracks all attributes without arguments', function() {
        var spy;
        spy = jasmine.createSpy();
        this.model.asProperty().onValue(spy);
        expect(spy).toHaveBeenCalledWith({
          foo: 'bar'
        });
        this.model.set({
          bar: 'baz'
        });
        expect(spy).toHaveBeenCalledWith({
          foo: 'bar',
          bar: 'baz'
        });
        this.model.set({
          foo: 'bazinga'
        });
        return expect(spy).toHaveBeenCalledWith({
          foo: 'bazinga',
          bar: 'baz'
        });
      });
    });
  });

  SampleModelView = (function(_super) {
    __extends(SampleModelView, _super);

    function SampleModelView() {
      return SampleModelView.__super__.constructor.apply(this, arguments);
    }

    SampleModelView.prototype.modelEvents = {
      'sampleEvent': 'handleEvent'
    };

    SampleModelView.prototype.domBindings = {
      '#name': 'name'
    };

    SampleModelView.prototype.handleEvent = function() {
      return this.trigger('eventHandled', this);
    };

    SampleModelView.prototype.renderTemplate = function(data) {
      return "<span id='name'>" + data.name + "</span><span id='email'>" + data.email + "</span>";
    };

    return SampleModelView;

  })(Baconbone.ModelView);

  SampleCollectionView = (function(_super) {
    __extends(SampleCollectionView, _super);

    function SampleCollectionView() {
      return SampleCollectionView.__super__.constructor.apply(this, arguments);
    }

    SampleCollectionView.prototype.collectionEvents = {
      'otherEvent': 'handleEvent'
    };

    SampleCollectionView.prototype.modelView = SampleModelView;

    SampleCollectionView.prototype.handleEvent = function() {
      return this.trigger('eventHandled', this);
    };

    return SampleCollectionView;

  })(Baconbone.CollectionView);

  describe('Baconbone.CollectionView', function() {
    beforeEach(function() {
      this.collection = new Backbone.Collection();
      return this.view = new SampleCollectionView({
        collection: this.collection
      });
    });
    describe('binding to collection events', function() {
      beforeEach(function() {
        this.spy = jasmine.createSpy('eventHandler');
        return this.view.on('eventHandled', this.spy);
      });
      afterEach(function() {
        return this.view.off('eventHandler', this.spy);
      });
      return it('binds to collection event', function() {
        this.collection.trigger('otherEvent');
        return expect(this.spy).toHaveBeenCalled();
      });
    });
    return describe('rendering collection', function() {
      var lastId, newModel;
      lastId = 0;
      newModel = function() {
        lastId += 1;
        return new Backbone.Model({
          id: lastId,
          name: "name" + lastId,
          email: "email" + lastId
        });
      };
      beforeEach(function() {
        this.collection.add(newModel());
        return this.view.render();
      });
      it('renders existing models', function() {
        expect(this.view.$el.children().length).toBe(1);
        return expect(this.view._children.length).toBe(1);
      });
      it('adds a new model', function() {
        this.collection.add(newModel());
        expect(this.view.$el.children().length).toBe(2);
        return expect(this.view._children.length).toBe(2);
      });
      return it('removes a view', function() {
        this.collection.remove(this.collection.first());
        expect(this.view.$el.children().length).toBe(0);
        return expect(this.view._children.length).toBe(0);
      });
    });
  });

  SampleModelView = (function(_super) {
    __extends(SampleModelView, _super);

    function SampleModelView() {
      return SampleModelView.__super__.constructor.apply(this, arguments);
    }

    SampleModelView.prototype.modelEvents = {
      'sampleEvent': 'handleEvent'
    };

    SampleModelView.prototype.domBindings = {
      '#name': 'name'
    };

    SampleModelView.prototype.handleEvent = function() {
      return this.trigger('eventHandled', this);
    };

    SampleModelView.prototype.renderTemplate = function(data) {
      return "<span id='name'>" + data.name + "</span><span id='email'>" + data.email + "</span>";
    };

    return SampleModelView;

  })(Baconbone.ModelView);

  describe('Baconbone.ModelView', function() {
    beforeEach(function() {
      this.model = new Backbone.Model({
        name: 'name',
        email: 'email'
      });
      return this.view = new SampleModelView({
        model: this.model
      });
    });
    describe('rendering', function() {
      beforeEach(function() {
        return this.view.render();
      });
      return it('renders automatically based on template and data', function() {
        expect(this.view.$('#name').text()).toBe(this.model.get('name'));
        return expect(this.view.$('#email').text()).toBe(this.model.get('email'));
      });
    });
    describe('model events', function() {
      beforeEach(function() {
        this.spy = jasmine.createSpy('eventHandler');
        return this.view.on('eventHandled', this.spy);
      });
      afterEach(function() {
        return this.view.off('eventHandled', this.spy);
      });
      it('binds to model events with proper context', function() {
        this.model.trigger('sampleEvent');
        return expect(this.spy).toHaveBeenCalledWith(this.view);
      });
      return it('binds to plain functions', function() {
        var spy;
        spy = jasmine.createSpy('otherEventHandler');
        this.view.bindModelEvent('otherEvent', spy);
        this.model.trigger('otherEvent');
        return expect(spy).toHaveBeenCalled();
      });
    });
    return describe('dom binding', function() {
      beforeEach(function() {
        return this.view.render();
      });
      it('updates the view html when model changes', function() {
        this.model.set({
          name: 'new name'
        });
        return expect(this.view.$('#name').text()).toBe('new name');
      });
      return it('handles a more complex dom binding with html and transformation', function() {
        var $el;
        $el = this.view.$('#email');
        this.view.bindToDom(this.model.asProperty('email'), $el, {
          html: true,
          transformer: function(email) {
            return "<a href='mailto:" + email + "'>" + email + "</a>";
          }
        });
        this.model.set({
          email: 'john.doe@example.com'
        });
        expect($el.find('a').length).toBe(1);
        return expect($el.find('a').text()).toBe('john.doe@example.com');
      });
    });
  });

  describe('Baconbone.View', function() {
    beforeEach(function() {
      this.view = new Baconbone.View();
      return this.otherView = new Baconbone.View();
    });
    describe('#addChild', function() {
      beforeEach(function() {
        return this.view.addChild(this.otherView);
      });
      it('adds a child', function() {
        expect(this.view._children.length).toBe(1);
        return expect(this.view._children).toContain(this.otherView);
      });
      return it('does not add same view twice', function() {
        this.view.addChild(this.otherView);
        return expect(this.view._children.length).toBe(1);
      });
    });
    describe('#removeChild', function() {
      beforeEach(function() {
        spyOn(this.otherView, 'remove');
        this.view.addChild(new Baconbone.View());
        this.view.addChild(this.otherView);
        this.view.addChild(new Baconbone.View());
        return this.view.removeChild(this.otherView);
      });
      it('removes an existing view', function() {
        expect(this.view._children.length).toBe(2);
        return expect(this.view._children).not.toContain(this.otherView);
      });
      it('calls remove() on child view', function() {
        return expect(this.otherView.remove).toHaveBeenCalled();
      });
      return it('does nothing to an unknown view', function() {
        this.view.removeChild(new Baconbone.View());
        return expect(this.view._children.length).toBe(2);
      });
    });
    describe('#findChild', function() {
      beforeEach(function() {
        this.model = new Backbone.Model({
          id: 1
        });
        this.otherModel = new Backbone.Model({
          id: 2
        });
        this.view.addChild(new Baconbone.View({
          model: this.model
        }));
        return this.view.addChild(new Baconbone.View({
          model: this.otherModel
        }));
      });
      it('finds a view based on model', function() {
        return expect(this.view.findChild(this.model).model).toBe(this.model);
      });
      it('returns the view if passed a child', function() {
        var view;
        view = this.view.addChild(new Baconbone.View());
        return expect(this.view.findChild(view)).toBe(view);
      });
      return it('returns undefined if a view is not found', function() {
        expect(this.view.findChild(new Backbone.Model({
          id: 3
        }))).toBeUndefined();
        return expect(this.view.findChild(new Baconbone.View())).toBeUndefined();
      });
    });
    return describe('#remove', function() {
      beforeEach(function() {
        this.view.addChild(this.otherView);
        spyOn(this.view, 'dispose');
        spyOn(this.otherView, 'remove');
        return this.view.remove();
      });
      it('removes subviews', function() {
        return expect(this.otherView.remove).toHaveBeenCalled();
      });
      return it('disposes of streams', function() {
        return expect(this.view.dispose).toHaveBeenCalled();
      });
    });
  });

}).call(this);

//# sourceMappingURL=maps/baconbone_test.js.map
