(function () {
  'use strict';

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }



  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }

  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform$2 = 'browser';
  var browser$1 = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop$1() {}

  var on = noop$1;
  var addListener = noop$1;
  var once = noop$1;
  var off = noop$1;
  var removeListener = noop$1;
  var removeAllListeners = noop$1;
  var emit = noop$1;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var browser$1$1 = {
    nextTick: nextTick,
    title: title,
    browser: browser$1,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform$2,
    release: release,
    config: config,
    uptime: uptime
  };

  function bind(fn, thisArg) {
    return function wrap() {
      return fn.apply(thisArg, arguments);
    };
  }

  // utils is a library of generic helper functions non-specific to axios

  const {toString: toString$1} = Object.prototype;
  const {getPrototypeOf} = Object;

  const kindOf = (cache => thing => {
      const str = toString$1.call(thing);
      return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  })(Object.create(null));

  const kindOfTest = (type) => {
    type = type.toLowerCase();
    return (thing) => kindOf(thing) === type
  };

  const typeOfTest = type => thing => typeof thing === type;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   *
   * @returns {boolean} True if value is an Array, otherwise false
   */
  const {isArray: isArray$1} = Array;

  /**
   * Determine if a value is undefined
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  const isUndefined = typeOfTest('undefined');

  /**
   * Determine if a value is a Buffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer$1(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
      && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  const isArrayBuffer = kindOfTest('ArrayBuffer');


  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    let result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a String, otherwise false
   */
  const isString = typeOfTest('string');

  /**
   * Determine if a value is a Function
   *
   * @param {*} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  const isFunction = typeOfTest('function');

  /**
   * Determine if a value is a Number
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Number, otherwise false
   */
  const isNumber = typeOfTest('number');

  /**
   * Determine if a value is an Object
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an Object, otherwise false
   */
  const isObject = (thing) => thing !== null && typeof thing === 'object';

  /**
   * Determine if a value is a Boolean
   *
   * @param {*} thing The value to test
   * @returns {boolean} True if value is a Boolean, otherwise false
   */
  const isBoolean = thing => thing === true || thing === false;

  /**
   * Determine if a value is a plain Object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a plain Object, otherwise false
   */
  const isPlainObject = (val) => {
    if (kindOf(val) !== 'object') {
      return false;
    }

    const prototype = getPrototypeOf(val);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
  };

  /**
   * Determine if a value is a Date
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Date, otherwise false
   */
  const isDate = kindOfTest('Date');

  /**
   * Determine if a value is a File
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  const isFile = kindOfTest('File');

  /**
   * Determine if a value is a Blob
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  const isBlob = kindOfTest('Blob');

  /**
   * Determine if a value is a FileList
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  const isFileList = kindOfTest('FileList');

  /**
   * Determine if a value is a Stream
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  const isStream = (val) => isObject(val) && isFunction(val.pipe);

  /**
   * Determine if a value is a FormData
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  const isFormData = (thing) => {
    let kind;
    return thing && (
      (typeof FormData === 'function' && thing instanceof FormData) || (
        isFunction(thing.append) && (
          (kind = kindOf(thing)) === 'formdata' ||
          // detect form-data instance
          (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
        )
      )
    )
  };

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  const isURLSearchParams = kindOfTest('URLSearchParams');

  const [isReadableStream, isRequest, isResponse, isHeaders] = ['ReadableStream', 'Request', 'Response', 'Headers'].map(kindOfTest);

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   *
   * @returns {String} The String freed of excess whitespace
   */
  const trim = (str) => str.trim ?
    str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   *
   * @param {Boolean} [allOwnKeys = false]
   * @returns {any}
   */
  function forEach(obj, fn, {allOwnKeys = false} = {}) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    let i;
    let l;

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray$1(obj)) {
      // Iterate over array values
      for (i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;

      for (i = 0; i < len; i++) {
        key = keys[i];
        fn.call(null, obj[key], key, obj);
      }
    }
  }

  function findKey(obj, key) {
    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
      _key = keys[i];
      if (key === _key.toLowerCase()) {
        return _key;
      }
    }
    return null;
  }

  const _global = (() => {
    /*eslint no-undef:0*/
    if (typeof globalThis !== "undefined") return globalThis;
    return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global$1)
  })();

  const isContextDefined = (context) => !isUndefined(context) && context !== _global;

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   *
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    const {caseless} = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key) => {
      const targetKey = caseless && findKey(result, key) || key;
      if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
        result[targetKey] = merge(result[targetKey], val);
      } else if (isPlainObject(val)) {
        result[targetKey] = merge({}, val);
      } else if (isArray$1(val)) {
        result[targetKey] = val.slice();
      } else {
        result[targetKey] = val;
      }
    };

    for (let i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   *
   * @param {Boolean} [allOwnKeys]
   * @returns {Object} The resulting value of object a
   */
  const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
    forEach(b, (val, key) => {
      if (thisArg && isFunction(val)) {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    }, {allOwnKeys});
    return a;
  };

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   *
   * @returns {string} content value without BOM
   */
  const stripBOM = (content) => {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  };

  /**
   * Inherit the prototype methods from one constructor into another
   * @param {function} constructor
   * @param {function} superConstructor
   * @param {object} [props]
   * @param {object} [descriptors]
   *
   * @returns {void}
   */
  const inherits = (constructor, superConstructor, props, descriptors) => {
    constructor.prototype = Object.create(superConstructor.prototype, descriptors);
    constructor.prototype.constructor = constructor;
    Object.defineProperty(constructor, 'super', {
      value: superConstructor.prototype
    });
    props && Object.assign(constructor.prototype, props);
  };

  /**
   * Resolve object with deep prototype chain to a flat object
   * @param {Object} sourceObj source object
   * @param {Object} [destObj]
   * @param {Function|Boolean} [filter]
   * @param {Function} [propFilter]
   *
   * @returns {Object}
   */
  const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
    let props;
    let i;
    let prop;
    const merged = {};

    destObj = destObj || {};
    // eslint-disable-next-line no-eq-null,eqeqeq
    if (sourceObj == null) return destObj;

    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props.length;
      while (i-- > 0) {
        prop = props[i];
        if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
          destObj[prop] = sourceObj[prop];
          merged[prop] = true;
        }
      }
      sourceObj = filter !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

    return destObj;
  };

  /**
   * Determines whether a string ends with the characters of a specified string
   *
   * @param {String} str
   * @param {String} searchString
   * @param {Number} [position= 0]
   *
   * @returns {boolean}
   */
  const endsWith = (str, searchString, position) => {
    str = String(str);
    if (position === undefined || position > str.length) {
      position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };


  /**
   * Returns new array from array like object or null if failed
   *
   * @param {*} [thing]
   *
   * @returns {?Array}
   */
  const toArray = (thing) => {
    if (!thing) return null;
    if (isArray$1(thing)) return thing;
    let i = thing.length;
    if (!isNumber(i)) return null;
    const arr = new Array(i);
    while (i-- > 0) {
      arr[i] = thing[i];
    }
    return arr;
  };

  /**
   * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
   * thing passed in is an instance of Uint8Array
   *
   * @param {TypedArray}
   *
   * @returns {Array}
   */
  // eslint-disable-next-line func-names
  const isTypedArray = (TypedArray => {
    // eslint-disable-next-line func-names
    return thing => {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

  /**
   * For each entry in the object, call the function with the key and value.
   *
   * @param {Object<any, any>} obj - The object to iterate over.
   * @param {Function} fn - The function to call for each entry.
   *
   * @returns {void}
   */
  const forEachEntry = (obj, fn) => {
    const generator = obj && obj[Symbol.iterator];

    const iterator = generator.call(obj);

    let result;

    while ((result = iterator.next()) && !result.done) {
      const pair = result.value;
      fn.call(obj, pair[0], pair[1]);
    }
  };

  /**
   * It takes a regular expression and a string, and returns an array of all the matches
   *
   * @param {string} regExp - The regular expression to match against.
   * @param {string} str - The string to search.
   *
   * @returns {Array<boolean>}
   */
  const matchAll = (regExp, str) => {
    let matches;
    const arr = [];

    while ((matches = regExp.exec(str)) !== null) {
      arr.push(matches);
    }

    return arr;
  };

  /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
  const isHTMLForm = kindOfTest('HTMLFormElement');

  const toCamelCase = str => {
    return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
      function replacer(m, p1, p2) {
        return p1.toUpperCase() + p2;
      }
    );
  };

  /* Creating a function that will check if an object has a property. */
  const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

  /**
   * Determine if a value is a RegExp object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a RegExp object, otherwise false
   */
  const isRegExp = kindOfTest('RegExp');

  const reduceDescriptors = (obj, reducer) => {
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};

    forEach(descriptors, (descriptor, name) => {
      let ret;
      if ((ret = reducer(descriptor, name, obj)) !== false) {
        reducedDescriptors[name] = ret || descriptor;
      }
    });

    Object.defineProperties(obj, reducedDescriptors);
  };

  /**
   * Makes all methods read-only
   * @param {Object} obj
   */

  const freezeMethods = (obj) => {
    reduceDescriptors(obj, (descriptor, name) => {
      // skip restricted props in strict mode
      if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
        return false;
      }

      const value = obj[name];

      if (!isFunction(value)) return;

      descriptor.enumerable = false;

      if ('writable' in descriptor) {
        descriptor.writable = false;
        return;
      }

      if (!descriptor.set) {
        descriptor.set = () => {
          throw Error('Can not rewrite read-only method \'' + name + '\'');
        };
      }
    });
  };

  const toObjectSet = (arrayOrString, delimiter) => {
    const obj = {};

    const define = (arr) => {
      arr.forEach(value => {
        obj[value] = true;
      });
    };

    isArray$1(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

    return obj;
  };

  const noop = () => {};

  const toFiniteNumber = (value, defaultValue) => {
    return value != null && Number.isFinite(value = +value) ? value : defaultValue;
  };

  /**
   * If the thing is a FormData object, return true, otherwise return false.
   *
   * @param {unknown} thing - The thing to check.
   *
   * @returns {boolean}
   */
  function isSpecCompliantForm(thing) {
    return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
  }

  const toJSONObject = (obj) => {
    const stack = new Array(10);

    const visit = (source, i) => {

      if (isObject(source)) {
        if (stack.indexOf(source) >= 0) {
          return;
        }

        if(!('toJSON' in source)) {
          stack[i] = source;
          const target = isArray$1(source) ? [] : {};

          forEach(source, (value, key) => {
            const reducedValue = visit(value, i + 1);
            !isUndefined(reducedValue) && (target[key] = reducedValue);
          });

          stack[i] = undefined;

          return target;
        }
      }

      return source;
    };

    return visit(obj, 0);
  };

  const isAsyncFn = kindOfTest('AsyncFunction');

  const isThenable = (thing) =>
    thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

  // original code
  // https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34

  const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
    if (setImmediateSupported) {
      return setImmediate;
    }

    return postMessageSupported ? ((token, callbacks) => {
      _global.addEventListener("message", ({source, data}) => {
        if (source === _global && data === token) {
          callbacks.length && callbacks.shift()();
        }
      }, false);

      return (cb) => {
        callbacks.push(cb);
        _global.postMessage(token, "*");
      }
    })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
  })(
    typeof setImmediate === 'function',
    isFunction(_global.postMessage)
  );

  const asap = typeof queueMicrotask !== 'undefined' ?
    queueMicrotask.bind(_global) : ( typeof browser$1$1 !== 'undefined' && browser$1$1.nextTick || _setImmediate);

  // *********************

  var utils$1 = {
    isArray: isArray$1,
    isArrayBuffer,
    isBuffer: isBuffer$1,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean,
    isObject,
    isPlainObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined,
    isDate,
    isFile,
    isBlob,
    isRegExp,
    isFunction,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap
  };

  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
  var inited = false;
  function init () {
    inited = true;
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }

    revLookup['-'.charCodeAt(0)] = 62;
    revLookup['_'.charCodeAt(0)] = 63;
  }

  function toByteArray (b64) {
    if (!inited) {
      init();
    }
    var i, j, l, tmp, placeHolders, arr;
    var len = b64.length;

    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

    // base64 is 4/3 + up to two characters of the original data
    arr = new Arr(len * 3 / 4 - placeHolders);

    // if there are placeholders, only get up to the last complete 4 chars
    l = placeHolders > 0 ? len - 4 : len;

    var L = 0;

    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
      arr[L++] = (tmp >> 16) & 0xFF;
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    if (placeHolders === 2) {
      tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
      arr[L++] = tmp & 0xFF;
    } else if (placeHolders === 1) {
      tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    return arr
  }

  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
  }

  function encodeChunk (uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
      output.push(tripletToBase64(tmp));
    }
    return output.join('')
  }

  function fromByteArray (uint8) {
    if (!inited) {
      init();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    var output = '';
    var parts = [];
    var maxChunkLength = 16383; // must be multiple of 3

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup[tmp >> 2];
      output += lookup[(tmp << 4) & 0x3F];
      output += '==';
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
      output += lookup[tmp >> 10];
      output += lookup[(tmp >> 4) & 0x3F];
      output += lookup[(tmp << 2) & 0x3F];
      output += '=';
    }

    parts.push(output);

    return parts.join('')
  }

  function read (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  }

  function write (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128;
  }

  var toString = {}.toString;

  var isArray = Array.isArray || function (arr) {
    return toString.call(arr) == '[object Array]';
  };

  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   */
  /* eslint-disable no-proto */


  var INSPECT_MAX_BYTES = 50;

  /**
   * If `Buffer.TYPED_ARRAY_SUPPORT`:
   *   === true    Use Uint8Array implementation (fastest)
   *   === false   Use Object implementation (most compatible, even IE6)
   *
   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
   * Opera 11.6+, iOS 4.2+.
   *
   * Due to various browser bugs, sometimes the Object implementation will be used even
   * when the browser supports typed arrays.
   *
   * Note:
   *
   *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
   *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
   *
   *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
   *
   *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
   *     incorrect length in some situations.

   * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
   * get the Object implementation, which is slower but behaves correctly.
   */
  Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
    ? global$1.TYPED_ARRAY_SUPPORT
    : true;

  /*
   * Export kMaxLength after typed array support is determined.
   */
  kMaxLength();

  function kMaxLength () {
    return Buffer.TYPED_ARRAY_SUPPORT
      ? 0x7fffffff
      : 0x3fffffff
  }

  function createBuffer (that, length) {
    if (kMaxLength() < length) {
      throw new RangeError('Invalid typed array length')
    }
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      // Return an augmented `Uint8Array` instance, for best performance
      that = new Uint8Array(length);
      that.__proto__ = Buffer.prototype;
    } else {
      // Fallback: Return an object instance of the Buffer class
      if (that === null) {
        that = new Buffer(length);
      }
      that.length = length;
    }

    return that
  }

  /**
   * The Buffer constructor returns instances of `Uint8Array` that have their
   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
   * returns a single octet.
   *
   * The `Uint8Array` prototype remains unmodified.
   */

  function Buffer (arg, encodingOrOffset, length) {
    if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
      return new Buffer(arg, encodingOrOffset, length)
    }

    // Common case.
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new Error(
          'If encoding is specified then the first argument must be a string'
        )
      }
      return allocUnsafe(this, arg)
    }
    return from(this, arg, encodingOrOffset, length)
  }

  Buffer.poolSize = 8192; // not used by this implementation

  // TODO: Legacy, not needed anymore. Remove in next major version.
  Buffer._augment = function (arr) {
    arr.__proto__ = Buffer.prototype;
    return arr
  };

  function from (that, value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError('"value" argument must not be a number')
    }

    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return fromArrayBuffer(that, value, encodingOrOffset, length)
    }

    if (typeof value === 'string') {
      return fromString(that, value, encodingOrOffset)
    }

    return fromObject(that, value)
  }

  /**
   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
   * if value is a number.
   * Buffer.from(str[, encoding])
   * Buffer.from(array)
   * Buffer.from(buffer)
   * Buffer.from(arrayBuffer[, byteOffset[, length]])
   **/
  Buffer.from = function (value, encodingOrOffset, length) {
    return from(null, value, encodingOrOffset, length)
  };

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;
    if (typeof Symbol !== 'undefined' && Symbol.species &&
        Buffer[Symbol.species] === Buffer) ;
  }

  function assertSize (size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be a number')
    } else if (size < 0) {
      throw new RangeError('"size" argument must not be negative')
    }
  }

  function alloc (that, size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(that, size)
    }
    if (fill !== undefined) {
      // Only pay attention to encoding if it's a string. This
      // prevents accidentally sending in a number that would
      // be interpretted as a start offset.
      return typeof encoding === 'string'
        ? createBuffer(that, size).fill(fill, encoding)
        : createBuffer(that, size).fill(fill)
    }
    return createBuffer(that, size)
  }

  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer.alloc = function (size, fill, encoding) {
    return alloc(null, size, fill, encoding)
  };

  function allocUnsafe (that, size) {
    assertSize(size);
    that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < size; ++i) {
        that[i] = 0;
      }
    }
    return that
  }

  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(null, size)
  };
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(null, size)
  };

  function fromString (that, string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8';
    }

    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding')
    }

    var length = byteLength(string, encoding) | 0;
    that = createBuffer(that, length);

    var actual = that.write(string, encoding);

    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      that = that.slice(0, actual);
    }

    return that
  }

  function fromArrayLike (that, array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    that = createBuffer(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that
  }

  function fromArrayBuffer (that, array, byteOffset, length) {
    array.byteLength; // this throws if `array` is not a valid ArrayBuffer

    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('\'offset\' is out of bounds')
    }

    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('\'length\' is out of bounds')
    }

    if (byteOffset === undefined && length === undefined) {
      array = new Uint8Array(array);
    } else if (length === undefined) {
      array = new Uint8Array(array, byteOffset);
    } else {
      array = new Uint8Array(array, byteOffset, length);
    }

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      // Return an augmented `Uint8Array` instance, for best performance
      that = array;
      that.__proto__ = Buffer.prototype;
    } else {
      // Fallback: Return an object instance of the Buffer class
      that = fromArrayLike(that, array);
    }
    return that
  }

  function fromObject (that, obj) {
    if (internalIsBuffer(obj)) {
      var len = checked(obj.length) | 0;
      that = createBuffer(that, len);

      if (that.length === 0) {
        return that
      }

      obj.copy(that, 0, 0, len);
      return that
    }

    if (obj) {
      if ((typeof ArrayBuffer !== 'undefined' &&
          obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
        if (typeof obj.length !== 'number' || isnan(obj.length)) {
          return createBuffer(that, 0)
        }
        return fromArrayLike(that, obj)
      }

      if (obj.type === 'Buffer' && isArray(obj.data)) {
        return fromArrayLike(that, obj.data)
      }
    }

    throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
  }

  function checked (length) {
    // Note: cannot use `length < kMaxLength()` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= kMaxLength()) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                           'size: 0x' + kMaxLength().toString(16) + ' bytes')
    }
    return length | 0
  }
  Buffer.isBuffer = isBuffer;
  function internalIsBuffer (b) {
    return !!(b != null && b._isBuffer)
  }

  Buffer.compare = function compare (a, b) {
    if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
      throw new TypeError('Arguments must be Buffers')
    }

    if (a === b) return 0

    var x = a.length;
    var y = b.length;

    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  Buffer.isEncoding = function isEncoding (encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true
      default:
        return false
    }
  };

  Buffer.concat = function concat (list, length) {
    if (!isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }

    if (list.length === 0) {
      return Buffer.alloc(0)
    }

    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }

    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
      var buf = list[i];
      if (!internalIsBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer
  };

  function byteLength (string, encoding) {
    if (internalIsBuffer(string)) {
      return string.length
    }
    if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
        (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
      return string.byteLength
    }
    if (typeof string !== 'string') {
      string = '' + string;
    }

    var len = string.length;
    if (len === 0) return 0

    // Use a for loop to avoid recursion
    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len
        case 'utf8':
        case 'utf-8':
        case undefined:
          return utf8ToBytes(string).length
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2
        case 'hex':
          return len >>> 1
        case 'base64':
          return base64ToBytes(string).length
        default:
          if (loweredCase) return utf8ToBytes(string).length // assume utf8
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength;

  function slowToString (encoding, start, end) {
    var loweredCase = false;

    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.

    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0;
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return ''
    }

    if (end === undefined || end > this.length) {
      end = this.length;
    }

    if (end <= 0) {
      return ''
    }

    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;

    if (end <= start) {
      return ''
    }

    if (!encoding) encoding = 'utf8';

    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end)

        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end)

        case 'ascii':
          return asciiSlice(this, start, end)

        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end)

        case 'base64':
          return base64Slice(this, start, end)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }

  // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
  // Buffer instances.
  Buffer.prototype._isBuffer = true;

  function swap (b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }

  Buffer.prototype.swap16 = function swap16 () {
    var len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits')
    }
    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this
  };

  Buffer.prototype.swap32 = function swap32 () {
    var len = this.length;
    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }
    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this
  };

  Buffer.prototype.swap64 = function swap64 () {
    var len = this.length;
    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }
    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this
  };

  Buffer.prototype.toString = function toString () {
    var length = this.length | 0;
    if (length === 0) return ''
    if (arguments.length === 0) return utf8Slice(this, 0, length)
    return slowToString.apply(this, arguments)
  };

  Buffer.prototype.equals = function equals (b) {
    if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
    if (this === b) return true
    return Buffer.compare(this, b) === 0
  };

  Buffer.prototype.inspect = function inspect () {
    var str = '';
    var max = INSPECT_MAX_BYTES;
    if (this.length > 0) {
      str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
      if (this.length > max) str += ' ... ';
    }
    return '<Buffer ' + str + '>'
  };

  Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
    if (!internalIsBuffer(target)) {
      throw new TypeError('Argument must be a Buffer')
    }

    if (start === undefined) {
      start = 0;
    }
    if (end === undefined) {
      end = target ? target.length : 0;
    }
    if (thisStart === undefined) {
      thisStart = 0;
    }
    if (thisEnd === undefined) {
      thisEnd = this.length;
    }

    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index')
    }

    if (thisStart >= thisEnd && start >= end) {
      return 0
    }
    if (thisStart >= thisEnd) {
      return -1
    }
    if (start >= end) {
      return 1
    }

    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;

    if (this === target) return 0

    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);

    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);

    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
  //
  // Arguments:
  // - buffer - a Buffer to search
  // - val - a string, Buffer, or number
  // - byteOffset - an index into `buffer`; will be clamped to an int32
  // - encoding - an optional encoding, relevant is val is a string
  // - dir - true for indexOf, false for lastIndexOf
  function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1

    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff;
    } else if (byteOffset < -2147483648) {
      byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;  // Coerce to Number.
    if (isNaN(byteOffset)) {
      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
      byteOffset = dir ? 0 : (buffer.length - 1);
    }

    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir) return -1
      else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;
      else return -1
    }

    // Normalize val
    if (typeof val === 'string') {
      val = Buffer.from(val, encoding);
    }

    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (internalIsBuffer(val)) {
      // Special case: looking for empty string/buffer always fails
      if (val.length === 0) {
        return -1
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
    } else if (typeof val === 'number') {
      val = val & 0xFF; // Search for a byte value [0-255]
      if (Buffer.TYPED_ARRAY_SUPPORT &&
          typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
        }
      }
      return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
    }

    throw new TypeError('val must be string, number or Buffer')
  }

  function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;

    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase();
      if (encoding === 'ucs2' || encoding === 'ucs-2' ||
          encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }

    function read (buf, i) {
      if (indexSize === 1) {
        return buf[i]
      } else {
        return buf.readUInt16BE(i * indexSize)
      }
    }

    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break
          }
        }
        if (found) return i
      }
    }

    return -1
  }

  Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1
  };

  Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
  };

  Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
  };

  function hexWrite (buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }

    // must be an even number of digits
    var strLen = string.length;
    if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed)) return i
      buf[offset + i] = parsed;
    }
    return i
  }

  function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }

  function asciiWrite (buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length)
  }

  function latin1Write (buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length)
  }

  function base64Write (buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length)
  }

  function ucs2Write (buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  }

  Buffer.prototype.write = function write (string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset | 0;
      if (isFinite(length)) {
        length = length | 0;
        if (encoding === undefined) encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    // legacy write(string, encoding, offset, length) - remove in v0.13
    } else {
      throw new Error(
        'Buffer.write(string, encoding, offset[, length]) is no longer supported'
      )
    }

    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;

    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }

    if (!encoding) encoding = 'utf8';

    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length)

        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length)

        case 'ascii':
          return asciiWrite(this, string, offset, length)

        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length)

        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };

  Buffer.prototype.toJSON = function toJSON () {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    }
  };

  function base64Slice (buf, start, end) {
    if (start === 0 && end === buf.length) {
      return fromByteArray(buf)
    } else {
      return fromByteArray(buf.slice(start, end))
    }
  }

  function utf8Slice (buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];

    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
        : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }

      res.push(codePoint);
      i += bytesPerSequence;
    }

    return decodeCodePointsArray(res)
  }

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000;

  function decodeCodePointsArray (codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res
  }

  function asciiSlice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret
  }

  function latin1Slice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret
  }

  function hexSlice (buf, start, end) {
    var len = buf.length;

    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;

    var out = '';
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }
    return out
  }

  function utf16leSlice (buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res
  }

  Buffer.prototype.slice = function slice (start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;

    var newBuf;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      newBuf = this.subarray(start, end);
      newBuf.__proto__ = Buffer.prototype;
    } else {
      var sliceLen = end - start;
      newBuf = new Buffer(sliceLen, undefined);
      for (var i = 0; i < sliceLen; ++i) {
        newBuf[i] = this[i + start];
      }
    }

    return newBuf
  };

  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset (offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
  }

  Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }

    return val
  };

  Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }

    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }

    return val
  };

  Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset]
  };

  Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8)
  };

  Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1]
  };

  Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return ((this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000)
  };

  Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
  };

  Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return (this[offset])
    return ((0xff - this[offset] + 1) * -1)
  };

  Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
  };

  Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
  };

  Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);
    return read(this, offset, true, 23, 4)
  };

  Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);
    return read(this, offset, false, 23, 4)
  };

  Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 8, this.length);
    return read(this, offset, true, 52, 8)
  };

  Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 8, this.length);
    return read(this, offset, false, 52, 8)
  };

  function checkInt (buf, value, offset, ext, max, min) {
    if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
  }

  Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    this[offset] = (value & 0xff);
    return offset + 1
  };

  function objectWriteUInt16 (buf, value, offset, littleEndian) {
    if (value < 0) value = 0xffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
      buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
        (littleEndian ? i : 1 - i) * 8;
    }
  }

  Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2
  };

  Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2
  };

  function objectWriteUInt32 (buf, value, offset, littleEndian) {
    if (value < 0) value = 0xffffffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
      buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
    }
  }

  Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset + 3] = (value >>> 24);
      this[offset + 2] = (value >>> 16);
      this[offset + 1] = (value >>> 8);
      this[offset] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4
  };

  Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4
  };

  Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -128);
    if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1
  };

  Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2
  };

  Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2
  };

  Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      this[offset + 2] = (value >>> 16);
      this[offset + 3] = (value >>> 24);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4
  };

  Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
    if (value < 0) value = 0xffffffff + value + 1;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4
  };

  function checkIEEE754 (buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
    if (offset < 0) throw new RangeError('Index out of range')
  }

  function writeFloat (buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4
  }

  Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert)
  };

  Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert)
  };

  function writeDouble (buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8
  }

  Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert)
  };

  Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert)
  };

  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer.prototype.copy = function copy (target, targetStart, start, end) {
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;

    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0

    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')

    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    var len = end - start;
    var i;

    if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
      // ascending copy from start
      for (i = 0; i < len; ++i) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, start + len),
        targetStart
      );
    }

    return len
  };

  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer.prototype.fill = function fill (val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        encoding = end;
        end = this.length;
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0);
        if (code < 256) {
          val = code;
        }
      }
      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string')
      }
      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
    } else if (typeof val === 'number') {
      val = val & 255;
    }

    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index')
    }

    if (end <= start) {
      return this
    }

    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;

    if (!val) val = 0;

    var i;
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      var bytes = internalIsBuffer(val)
        ? val
        : utf8ToBytes(new Buffer(val, encoding).toString());
      var len = bytes.length;
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }

    return this
  };

  // HELPER FUNCTIONS
  // ================

  var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

  function base64clean (str) {
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = stringtrim(str).replace(INVALID_BASE64_RE, '');
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return ''
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str
  }

  function stringtrim (str) {
    if (str.trim) return str.trim()
    return str.replace(/^\s+|\s+$/g, '')
  }

  function toHex (n) {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16)
  }

  function utf8ToBytes (string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);

      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          }

          // valid lead
          leadSurrogate = codePoint;

          continue
        }

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue
        }

        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
      }

      leadSurrogate = null;

      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else {
        throw new Error('Invalid code point')
      }
    }

    return bytes
  }

  function asciiToBytes (str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      // Node's code seems to be doing this and not & 0x7F..
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray
  }

  function utf16leToBytes (str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break

      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }

    return byteArray
  }


  function base64ToBytes (str) {
    return toByteArray(base64clean(str))
  }

  function blitBuffer (src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i];
    }
    return i
  }

  function isnan (val) {
    return val !== val // eslint-disable-line no-self-compare
  }


  // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  function isBuffer(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
  }

  function isFastBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
  }

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  function AxiosError$1(message, code, config, request, response) {
    Error.call(this);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error()).stack;
    }

    this.message = message;
    this.name = 'AxiosError';
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
      this.response = response;
      this.status = response.status ? response.status : null;
    }
  }

  utils$1.inherits(AxiosError$1, Error, {
    toJSON: function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: utils$1.toJSONObject(this.config),
        code: this.code,
        status: this.status
      };
    }
  });

  const prototype$1 = AxiosError$1.prototype;
  const descriptors = {};

  [
    'ERR_BAD_OPTION_VALUE',
    'ERR_BAD_OPTION',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ERR_NETWORK',
    'ERR_FR_TOO_MANY_REDIRECTS',
    'ERR_DEPRECATED',
    'ERR_BAD_RESPONSE',
    'ERR_BAD_REQUEST',
    'ERR_CANCELED',
    'ERR_NOT_SUPPORT',
    'ERR_INVALID_URL'
  // eslint-disable-next-line func-names
  ].forEach(code => {
    descriptors[code] = {value: code};
  });

  Object.defineProperties(AxiosError$1, descriptors);
  Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

  // eslint-disable-next-line func-names
  AxiosError$1.from = (error, code, config, request, response, customProps) => {
    const axiosError = Object.create(prototype$1);

    utils$1.toFlatObject(error, axiosError, function filter(obj) {
      return obj !== Error.prototype;
    }, prop => {
      return prop !== 'isAxiosError';
    });

    AxiosError$1.call(axiosError, error.message, code, config, request, response);

    axiosError.cause = error;

    axiosError.name = error.name;

    customProps && Object.assign(axiosError, customProps);

    return axiosError;
  };

  // eslint-disable-next-line strict
  var httpAdapter = null;

  /**
   * Determines if the given thing is a array or js object.
   *
   * @param {string} thing - The object or array to be visited.
   *
   * @returns {boolean}
   */
  function isVisitable(thing) {
    return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
  }

  /**
   * It removes the brackets from the end of a string
   *
   * @param {string} key - The key of the parameter.
   *
   * @returns {string} the key without the brackets.
   */
  function removeBrackets(key) {
    return utils$1.endsWith(key, '[]') ? key.slice(0, -2) : key;
  }

  /**
   * It takes a path, a key, and a boolean, and returns a string
   *
   * @param {string} path - The path to the current key.
   * @param {string} key - The key of the current object being iterated over.
   * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
   *
   * @returns {string} The path to the current key.
   */
  function renderKey(path, key, dots) {
    if (!path) return key;
    return path.concat(key).map(function each(token, i) {
      // eslint-disable-next-line no-param-reassign
      token = removeBrackets(token);
      return !dots && i ? '[' + token + ']' : token;
    }).join(dots ? '.' : '');
  }

  /**
   * If the array is an array and none of its elements are visitable, then it's a flat array.
   *
   * @param {Array<any>} arr - The array to check
   *
   * @returns {boolean}
   */
  function isFlatArray(arr) {
    return utils$1.isArray(arr) && !arr.some(isVisitable);
  }

  const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
  });

  /**
   * Convert a data object to FormData
   *
   * @param {Object} obj
   * @param {?Object} [formData]
   * @param {?Object} [options]
   * @param {Function} [options.visitor]
   * @param {Boolean} [options.metaTokens = true]
   * @param {Boolean} [options.dots = false]
   * @param {?Boolean} [options.indexes = false]
   *
   * @returns {Object}
   **/

  /**
   * It converts an object into a FormData object
   *
   * @param {Object<any, any>} obj - The object to convert to form data.
   * @param {string} formData - The FormData object to append to.
   * @param {Object<string, any>} options
   *
   * @returns
   */
  function toFormData$1(obj, formData, options) {
    if (!utils$1.isObject(obj)) {
      throw new TypeError('target must be an object');
    }

    // eslint-disable-next-line no-param-reassign
    formData = formData || new (FormData)();

    // eslint-disable-next-line no-param-reassign
    options = utils$1.toFlatObject(options, {
      metaTokens: true,
      dots: false,
      indexes: false
    }, false, function defined(option, source) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      return !utils$1.isUndefined(source[option]);
    });

    const metaTokens = options.metaTokens;
    // eslint-disable-next-line no-use-before-define
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
    const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);

    if (!utils$1.isFunction(visitor)) {
      throw new TypeError('visitor must be a function');
    }

    function convertValue(value) {
      if (value === null) return '';

      if (utils$1.isDate(value)) {
        return value.toISOString();
      }

      if (!useBlob && utils$1.isBlob(value)) {
        throw new AxiosError$1('Blob is not supported. Use a Buffer instead.');
      }

      if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
        return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
      }

      return value;
    }

    /**
     * Default visitor.
     *
     * @param {*} value
     * @param {String|Number} key
     * @param {Array<String|Number>} path
     * @this {FormData}
     *
     * @returns {boolean} return true to visit the each prop of the value recursively
     */
    function defaultVisitor(value, key, path) {
      let arr = value;

      if (value && !path && typeof value === 'object') {
        if (utils$1.endsWith(key, '{}')) {
          // eslint-disable-next-line no-param-reassign
          key = metaTokens ? key : key.slice(0, -2);
          // eslint-disable-next-line no-param-reassign
          value = JSON.stringify(value);
        } else if (
          (utils$1.isArray(value) && isFlatArray(value)) ||
          ((utils$1.isFileList(value) || utils$1.endsWith(key, '[]')) && (arr = utils$1.toArray(value))
          )) {
          // eslint-disable-next-line no-param-reassign
          key = removeBrackets(key);

          arr.forEach(function each(el, index) {
            !(utils$1.isUndefined(el) || el === null) && formData.append(
              // eslint-disable-next-line no-nested-ternary
              indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
              convertValue(el)
            );
          });
          return false;
        }
      }

      if (isVisitable(value)) {
        return true;
      }

      formData.append(renderKey(path, key, dots), convertValue(value));

      return false;
    }

    const stack = [];

    const exposedHelpers = Object.assign(predicates, {
      defaultVisitor,
      convertValue,
      isVisitable
    });

    function build(value, path) {
      if (utils$1.isUndefined(value)) return;

      if (stack.indexOf(value) !== -1) {
        throw Error('Circular reference detected in ' + path.join('.'));
      }

      stack.push(value);

      utils$1.forEach(value, function each(el, key) {
        const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
          formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers
        );

        if (result === true) {
          build(el, path ? path.concat(key) : [key]);
        }
      });

      stack.pop();
    }

    if (!utils$1.isObject(obj)) {
      throw new TypeError('data must be an object');
    }

    build(obj);

    return formData;
  }

  /**
   * It encodes a string by replacing all characters that are not in the unreserved set with
   * their percent-encoded equivalents
   *
   * @param {string} str - The string to encode.
   *
   * @returns {string} The encoded string.
   */
  function encode$1(str) {
    const charMap = {
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '~': '%7E',
      '%20': '+',
      '%00': '\x00'
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
      return charMap[match];
    });
  }

  /**
   * It takes a params object and converts it to a FormData object
   *
   * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
   * @param {Object<string, any>} options - The options object passed to the Axios constructor.
   *
   * @returns {void}
   */
  function AxiosURLSearchParams(params, options) {
    this._pairs = [];

    params && toFormData$1(params, this, options);
  }

  const prototype = AxiosURLSearchParams.prototype;

  prototype.append = function append(name, value) {
    this._pairs.push([name, value]);
  };

  prototype.toString = function toString(encoder) {
    const _encode = encoder ? function(value) {
      return encoder.call(this, value, encode$1);
    } : encode$1;

    return this._pairs.map(function each(pair) {
      return _encode(pair[0]) + '=' + _encode(pair[1]);
    }, '').join('&');
  };

  /**
   * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
   * URI encoded counterparts
   *
   * @param {string} val The value to be encoded.
   *
   * @returns {string} The encoded value.
   */
  function encode(val) {
    return encodeURIComponent(val).
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @param {?(object|Function)} options
   *
   * @returns {string} The formatted url
   */
  function buildURL(url, params, options) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }
    
    const _encode = options && options.encode || encode;

    if (utils$1.isFunction(options)) {
      options = {
        serialize: options
      };
    } 

    const serializeFn = options && options.serialize;

    let serializedParams;

    if (serializeFn) {
      serializedParams = serializeFn(params, options);
    } else {
      serializedParams = utils$1.isURLSearchParams(params) ?
        params.toString() :
        new AxiosURLSearchParams(params, options).toString(_encode);
    }

    if (serializedParams) {
      const hashmarkIndex = url.indexOf("#");

      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  }

  class InterceptorManager {
    constructor() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    }

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     *
     * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
     */
    eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }

    /**
     * Clear all interceptors from the stack
     *
     * @returns {void}
     */
    clear() {
      if (this.handlers) {
        this.handlers = [];
      }
    }

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     *
     * @returns {void}
     */
    forEach(fn) {
      utils$1.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    }
  }

  var transitionalDefaults = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

  var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

  var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

  var platform$1 = {
    isBrowser: true,
    classes: {
      URLSearchParams: URLSearchParams$1,
      FormData: FormData$1,
      Blob: Blob$1
    },
    protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
  };

  const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

  const _navigator = typeof navigator === 'object' && navigator || undefined;

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   *
   * @returns {boolean}
   */
  const hasStandardBrowserEnv = hasBrowserEnv &&
    (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);

  /**
   * Determine if we're running in a standard browser webWorker environment
   *
   * Although the `isStandardBrowserEnv` method indicates that
   * `allows axios to run in a web worker`, the WebWorker will still be
   * filtered out due to its judgment standard
   * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
   * This leads to a problem when axios post `FormData` in webWorker
   */
  const hasStandardBrowserWebWorkerEnv = (() => {
    return (
      typeof WorkerGlobalScope !== 'undefined' &&
      // eslint-disable-next-line no-undef
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts === 'function'
    );
  })();

  const origin = hasBrowserEnv && window.location.href || 'http://localhost';

  var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    hasBrowserEnv: hasBrowserEnv,
    hasStandardBrowserEnv: hasStandardBrowserEnv,
    hasStandardBrowserWebWorkerEnv: hasStandardBrowserWebWorkerEnv,
    navigator: _navigator,
    origin: origin
  });

  var platform = {
    ...utils,
    ...platform$1
  };

  function toURLEncodedForm(data, options) {
    return toFormData$1(data, new platform.classes.URLSearchParams(), Object.assign({
      visitor: function(value, key, path, helpers) {
        if (platform.isNode && utils$1.isBuffer(value)) {
          this.append(key, value.toString('base64'));
          return false;
        }

        return helpers.defaultVisitor.apply(this, arguments);
      }
    }, options));
  }

  /**
   * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
   *
   * @param {string} name - The name of the property to get.
   *
   * @returns An array of strings.
   */
  function parsePropPath(name) {
    // foo[x][y][z]
    // foo.x.y.z
    // foo-x-y-z
    // foo x y z
    return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
      return match[0] === '[]' ? '' : match[1] || match[0];
    });
  }

  /**
   * Convert an array to an object.
   *
   * @param {Array<any>} arr - The array to convert to an object.
   *
   * @returns An object with the same keys and values as the array.
   */
  function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = arr[key];
    }
    return obj;
  }

  /**
   * It takes a FormData object and returns a JavaScript object
   *
   * @param {string} formData The FormData object to convert to JSON.
   *
   * @returns {Object<string, any> | null} The converted object.
   */
  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      let name = path[index++];

      if (name === '__proto__') return true;

      const isNumericKey = Number.isFinite(+name);
      const isLast = index >= path.length;
      name = !name && utils$1.isArray(target) ? target.length : name;

      if (isLast) {
        if (utils$1.hasOwnProp(target, name)) {
          target[name] = [target[name], value];
        } else {
          target[name] = value;
        }

        return !isNumericKey;
      }

      if (!target[name] || !utils$1.isObject(target[name])) {
        target[name] = [];
      }

      const result = buildPath(path, value, target[name], index);

      if (result && utils$1.isArray(target[name])) {
        target[name] = arrayToObject(target[name]);
      }

      return !isNumericKey;
    }

    if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
      const obj = {};

      utils$1.forEachEntry(formData, (name, value) => {
        buildPath(parsePropPath(name), value, obj, 0);
      });

      return obj;
    }

    return null;
  }

  /**
   * It takes a string, tries to parse it, and if it fails, it returns the stringified version
   * of the input
   *
   * @param {any} rawValue - The value to be stringified.
   * @param {Function} parser - A function that parses a string into a JavaScript object.
   * @param {Function} encoder - A function that takes a value and returns a string.
   *
   * @returns {string} A stringified version of the rawValue.
   */
  function stringifySafely(rawValue, parser, encoder) {
    if (utils$1.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils$1.trim(rawValue);
      } catch (e) {
        if (e.name !== 'SyntaxError') {
          throw e;
        }
      }
    }

    return (encoder || JSON.stringify)(rawValue);
  }

  const defaults$1 = {

    transitional: transitionalDefaults,

    adapter: ['xhr', 'http', 'fetch'],

    transformRequest: [function transformRequest(data, headers) {
      const contentType = headers.getContentType() || '';
      const hasJSONContentType = contentType.indexOf('application/json') > -1;
      const isObjectPayload = utils$1.isObject(data);

      if (isObjectPayload && utils$1.isHTMLForm(data)) {
        data = new FormData(data);
      }

      const isFormData = utils$1.isFormData(data);

      if (isFormData) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
      }

      if (utils$1.isArrayBuffer(data) ||
        utils$1.isBuffer(data) ||
        utils$1.isStream(data) ||
        utils$1.isFile(data) ||
        utils$1.isBlob(data) ||
        utils$1.isReadableStream(data)
      ) {
        return data;
      }
      if (utils$1.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$1.isURLSearchParams(data)) {
        headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
        return data.toString();
      }

      let isFileList;

      if (isObjectPayload) {
        if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
          return toURLEncodedForm(data, this.formSerializer).toString();
        }

        if ((isFileList = utils$1.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
          const _FormData = this.env && this.env.FormData;

          return toFormData$1(
            isFileList ? {'files[]': data} : data,
            _FormData && new _FormData(),
            this.formSerializer
          );
        }
      }

      if (isObjectPayload || hasJSONContentType ) {
        headers.setContentType('application/json', false);
        return stringifySafely(data);
      }

      return data;
    }],

    transformResponse: [function transformResponse(data) {
      const transitional = this.transitional || defaults$1.transitional;
      const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      const JSONRequested = this.responseType === 'json';

      if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
        return data;
      }

      if (data && utils$1.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
        const silentJSONParsing = transitional && transitional.silentJSONParsing;
        const strictJSONParsing = !silentJSONParsing && JSONRequested;

        try {
          return JSON.parse(data);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === 'SyntaxError') {
              throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
            }
            throw e;
          }
        }
      }

      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    env: {
      FormData: platform.classes.FormData,
      Blob: platform.classes.Blob
    },

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': undefined
      }
    }
  };

  utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
    defaults$1.headers[method] = {};
  });

  // RawAxiosHeaders whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  const ignoreDuplicateOf = utils$1.toObjectSet([
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ]);

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} rawHeaders Headers needing to be parsed
   *
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = rawHeaders => {
    const parsed = {};
    let key;
    let val;
    let i;

    rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
      i = line.indexOf(':');
      key = line.substring(0, i).trim().toLowerCase();
      val = line.substring(i + 1).trim();

      if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
        return;
      }

      if (key === 'set-cookie') {
        if (parsed[key]) {
          parsed[key].push(val);
        } else {
          parsed[key] = [val];
        }
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    });

    return parsed;
  };

  const $internals = Symbol('internals');

  function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
  }

  function normalizeValue(value) {
    if (value === false || value == null) {
      return value;
    }

    return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
  }

  function parseTokens(str) {
    const tokens = Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;

    while ((match = tokensRE.exec(str))) {
      tokens[match[1]] = match[2];
    }

    return tokens;
  }

  const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

  function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
    if (utils$1.isFunction(filter)) {
      return filter.call(this, value, header);
    }

    if (isHeaderNameFilter) {
      value = header;
    }

    if (!utils$1.isString(value)) return;

    if (utils$1.isString(filter)) {
      return value.indexOf(filter) !== -1;
    }

    if (utils$1.isRegExp(filter)) {
      return filter.test(value);
    }
  }

  function formatHeader(header) {
    return header.trim()
      .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
        return char.toUpperCase() + str;
      });
  }

  function buildAccessors(obj, header) {
    const accessorName = utils$1.toCamelCase(' ' + header);

    ['get', 'set', 'has'].forEach(methodName => {
      Object.defineProperty(obj, methodName + accessorName, {
        value: function(arg1, arg2, arg3) {
          return this[methodName].call(this, header, arg1, arg2, arg3);
        },
        configurable: true
      });
    });
  }

  let AxiosHeaders$1 = class AxiosHeaders {
    constructor(headers) {
      headers && this.set(headers);
    }

    set(header, valueOrRewrite, rewrite) {
      const self = this;

      function setHeader(_value, _header, _rewrite) {
        const lHeader = normalizeHeader(_header);

        if (!lHeader) {
          throw new Error('header name must be a non-empty string');
        }

        const key = utils$1.findKey(self, lHeader);

        if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
          self[key || _header] = normalizeValue(_value);
        }
      }

      const setHeaders = (headers, _rewrite) =>
        utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

      if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
        setHeaders(header, valueOrRewrite);
      } else if(utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
        setHeaders(parseHeaders(header), valueOrRewrite);
      } else if (utils$1.isHeaders(header)) {
        for (const [key, value] of header.entries()) {
          setHeader(value, key, rewrite);
        }
      } else {
        header != null && setHeader(valueOrRewrite, header, rewrite);
      }

      return this;
    }

    get(header, parser) {
      header = normalizeHeader(header);

      if (header) {
        const key = utils$1.findKey(this, header);

        if (key) {
          const value = this[key];

          if (!parser) {
            return value;
          }

          if (parser === true) {
            return parseTokens(value);
          }

          if (utils$1.isFunction(parser)) {
            return parser.call(this, value, key);
          }

          if (utils$1.isRegExp(parser)) {
            return parser.exec(value);
          }

          throw new TypeError('parser must be boolean|regexp|function');
        }
      }
    }

    has(header, matcher) {
      header = normalizeHeader(header);

      if (header) {
        const key = utils$1.findKey(this, header);

        return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
      }

      return false;
    }

    delete(header, matcher) {
      const self = this;
      let deleted = false;

      function deleteHeader(_header) {
        _header = normalizeHeader(_header);

        if (_header) {
          const key = utils$1.findKey(self, _header);

          if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
            delete self[key];

            deleted = true;
          }
        }
      }

      if (utils$1.isArray(header)) {
        header.forEach(deleteHeader);
      } else {
        deleteHeader(header);
      }

      return deleted;
    }

    clear(matcher) {
      const keys = Object.keys(this);
      let i = keys.length;
      let deleted = false;

      while (i--) {
        const key = keys[i];
        if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
          delete this[key];
          deleted = true;
        }
      }

      return deleted;
    }

    normalize(format) {
      const self = this;
      const headers = {};

      utils$1.forEach(this, (value, header) => {
        const key = utils$1.findKey(headers, header);

        if (key) {
          self[key] = normalizeValue(value);
          delete self[header];
          return;
        }

        const normalized = format ? formatHeader(header) : String(header).trim();

        if (normalized !== header) {
          delete self[header];
        }

        self[normalized] = normalizeValue(value);

        headers[normalized] = true;
      });

      return this;
    }

    concat(...targets) {
      return this.constructor.concat(this, ...targets);
    }

    toJSON(asStrings) {
      const obj = Object.create(null);

      utils$1.forEach(this, (value, header) => {
        value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(', ') : value);
      });

      return obj;
    }

    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }

    toString() {
      return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
    }

    get [Symbol.toStringTag]() {
      return 'AxiosHeaders';
    }

    static from(thing) {
      return thing instanceof this ? thing : new this(thing);
    }

    static concat(first, ...targets) {
      const computed = new this(first);

      targets.forEach((target) => computed.set(target));

      return computed;
    }

    static accessor(header) {
      const internals = this[$internals] = (this[$internals] = {
        accessors: {}
      });

      const accessors = internals.accessors;
      const prototype = this.prototype;

      function defineAccessor(_header) {
        const lHeader = normalizeHeader(_header);

        if (!accessors[lHeader]) {
          buildAccessors(prototype, _header);
          accessors[lHeader] = true;
        }
      }

      utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

      return this;
    }
  };

  AxiosHeaders$1.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

  // reserved names hotfix
  utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({value}, key) => {
    let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
    return {
      get: () => value,
      set(headerValue) {
        this[mapped] = headerValue;
      }
    }
  });

  utils$1.freezeMethods(AxiosHeaders$1);

  /**
   * Transform the data for a request or a response
   *
   * @param {Array|Function} fns A single function or Array of functions
   * @param {?Object} response The response object
   *
   * @returns {*} The resulting transformed data
   */
  function transformData(fns, response) {
    const config = this || defaults$1;
    const context = response || config;
    const headers = AxiosHeaders$1.from(context.headers);
    let data = context.data;

    utils$1.forEach(fns, function transform(fn) {
      data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
    });

    headers.normalize();

    return data;
  }

  function isCancel$1(value) {
    return !!(value && value.__CANCEL__);
  }

  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  function CanceledError$1(message, config, request) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    AxiosError$1.call(this, message == null ? 'canceled' : message, AxiosError$1.ERR_CANCELED, config, request);
    this.name = 'CanceledError';
  }

  utils$1.inherits(CanceledError$1, AxiosError$1, {
    __CANCEL__: true
  });

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   *
   * @returns {object} The response.
   */
  function settle(resolve, reject, response) {
    const validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(new AxiosError$1(
        'Request failed with status code ' + response.status,
        [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
        response.config,
        response.request,
        response
      ));
    }
  }

  function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || '';
  }

  /**
   * Calculate data maxRate
   * @param {Number} [samplesCount= 10]
   * @param {Number} [min= 1000]
   * @returns {Function}
   */
  function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;

    min = min !== undefined ? min : 1000;

    return function push(chunkLength) {
      const now = Date.now();

      const startedAt = timestamps[tail];

      if (!firstSampleTS) {
        firstSampleTS = now;
      }

      bytes[head] = chunkLength;
      timestamps[head] = now;

      let i = tail;
      let bytesCount = 0;

      while (i !== head) {
        bytesCount += bytes[i++];
        i = i % samplesCount;
      }

      head = (head + 1) % samplesCount;

      if (head === tail) {
        tail = (tail + 1) % samplesCount;
      }

      if (now - firstSampleTS < min) {
        return;
      }

      const passed = startedAt && now - startedAt;

      return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
    };
  }

  /**
   * Throttle decorator
   * @param {Function} fn
   * @param {Number} freq
   * @return {Function}
   */
  function throttle(fn, freq) {
    let timestamp = 0;
    let threshold = 1000 / freq;
    let lastArgs;
    let timer;

    const invoke = (args, now = Date.now()) => {
      timestamp = now;
      lastArgs = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(null, args);
    };

    const throttled = (...args) => {
      const now = Date.now();
      const passed = now - timestamp;
      if ( passed >= threshold) {
        invoke(args, now);
      } else {
        lastArgs = args;
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            invoke(lastArgs);
          }, threshold - passed);
        }
      }
    };

    const flush = () => lastArgs && invoke(lastArgs);

    return [throttled, flush];
  }

  const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
    let bytesNotified = 0;
    const _speedometer = speedometer(50, 250);

    return throttle(e => {
      const loaded = e.loaded;
      const total = e.lengthComputable ? e.total : undefined;
      const progressBytes = loaded - bytesNotified;
      const rate = _speedometer(progressBytes);
      const inRange = loaded <= total;

      bytesNotified = loaded;

      const data = {
        loaded,
        total,
        progress: total ? (loaded / total) : undefined,
        bytes: progressBytes,
        rate: rate ? rate : undefined,
        estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
        event: e,
        lengthComputable: total != null,
        [isDownloadStream ? 'download' : 'upload']: true
      };

      listener(data);
    }, freq);
  };

  const progressEventDecorator = (total, throttled) => {
    const lengthComputable = total != null;

    return [(loaded) => throttled[0]({
      lengthComputable,
      total,
      loaded
    }), throttled[1]];
  };

  const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));

  var isURLSameOrigin = platform.hasStandardBrowserEnv ? ((origin, isMSIE) => (url) => {
    url = new URL(url, platform.origin);

    return (
      origin.protocol === url.protocol &&
      origin.host === url.host &&
      (isMSIE || origin.port === url.port)
    );
  })(
    new URL(platform.origin),
    platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
  ) : () => true;

  var cookies = platform.hasStandardBrowserEnv ?

    // Standard browser envs support document.cookie
    {
      write(name, value, expires, path, domain, secure) {
        const cookie = [name + '=' + encodeURIComponent(value)];

        utils$1.isNumber(expires) && cookie.push('expires=' + new Date(expires).toGMTString());

        utils$1.isString(path) && cookie.push('path=' + path);

        utils$1.isString(domain) && cookie.push('domain=' + domain);

        secure === true && cookie.push('secure');

        document.cookie = cookie.join('; ');
      },

      read(name) {
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    }

    :

    // Non-standard browser env (web workers, react-native) lack needed support.
    {
      write() {},
      read() {
        return null;
      },
      remove() {}
    };

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   *
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   *
   * @returns {string} The combined URL
   */
  function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  }

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   *
   * @returns {string} The combined full path
   */
  function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
    let isRelativeUrl = !isAbsoluteURL(requestedURL);
    if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }

  const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   *
   * @returns {Object} New object resulting from merging config2 to config1
   */
  function mergeConfig$1(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    const config = {};

    function getMergedValue(target, source, prop, caseless) {
      if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
        return utils$1.merge.call({caseless}, target, source);
      } else if (utils$1.isPlainObject(source)) {
        return utils$1.merge({}, source);
      } else if (utils$1.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(a, b, prop , caseless) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(a, b, prop , caseless);
      } else if (!utils$1.isUndefined(a)) {
        return getMergedValue(undefined, a, prop , caseless);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(a, b) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(undefined, b);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(a, b) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(undefined, b);
      } else if (!utils$1.isUndefined(a)) {
        return getMergedValue(undefined, a);
      }
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(a, b, prop) {
      if (prop in config2) {
        return getMergedValue(a, b);
      } else if (prop in config1) {
        return getMergedValue(undefined, a);
      }
    }

    const mergeMap = {
      url: valueFromConfig2,
      method: valueFromConfig2,
      data: valueFromConfig2,
      baseURL: defaultToConfig2,
      transformRequest: defaultToConfig2,
      transformResponse: defaultToConfig2,
      paramsSerializer: defaultToConfig2,
      timeout: defaultToConfig2,
      timeoutMessage: defaultToConfig2,
      withCredentials: defaultToConfig2,
      withXSRFToken: defaultToConfig2,
      adapter: defaultToConfig2,
      responseType: defaultToConfig2,
      xsrfCookieName: defaultToConfig2,
      xsrfHeaderName: defaultToConfig2,
      onUploadProgress: defaultToConfig2,
      onDownloadProgress: defaultToConfig2,
      decompress: defaultToConfig2,
      maxContentLength: defaultToConfig2,
      maxBodyLength: defaultToConfig2,
      beforeRedirect: defaultToConfig2,
      transport: defaultToConfig2,
      httpAgent: defaultToConfig2,
      httpsAgent: defaultToConfig2,
      cancelToken: defaultToConfig2,
      socketPath: defaultToConfig2,
      responseEncoding: defaultToConfig2,
      validateStatus: mergeDirectKeys,
      headers: (a, b , prop) => mergeDeepProperties(headersToObject(a), headersToObject(b),prop, true)
    };

    utils$1.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
      const merge = mergeMap[prop] || mergeDeepProperties;
      const configValue = merge(config1[prop], config2[prop], prop);
      (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
    });

    return config;
  }

  var resolveConfig = (config) => {
    const newConfig = mergeConfig$1({}, config);

    let {data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth} = newConfig;

    newConfig.headers = headers = AxiosHeaders$1.from(headers);

    newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);

    // HTTP basic authentication
    if (auth) {
      headers.set('Authorization', 'Basic ' +
        btoa((auth.username || '') + ':' + (auth.password ? unescape(encodeURIComponent(auth.password)) : ''))
      );
    }

    let contentType;

    if (utils$1.isFormData(data)) {
      if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
        headers.setContentType(undefined); // Let the browser set it
      } else if ((contentType = headers.getContentType()) !== false) {
        // fix semicolon duplication issue for ReactNative FormData implementation
        const [type, ...tokens] = contentType ? contentType.split(';').map(token => token.trim()).filter(Boolean) : [];
        headers.setContentType([type || 'multipart/form-data', ...tokens].join('; '));
      }
    }

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.

    if (platform.hasStandardBrowserEnv) {
      withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

      if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(newConfig.url))) {
        // Add xsrf header
        const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);

        if (xsrfValue) {
          headers.set(xsrfHeaderName, xsrfValue);
        }
      }
    }

    return newConfig;
  };

  const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

  var xhrAdapter = isXHRAdapterSupported && function (config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      const _config = resolveConfig(config);
      let requestData = _config.data;
      const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
      let {responseType, onUploadProgress, onDownloadProgress} = _config;
      let onCanceled;
      let uploadThrottled, downloadThrottled;
      let flushUpload, flushDownload;

      function done() {
        flushUpload && flushUpload(); // flush events
        flushDownload && flushDownload(); // flush events

        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

        _config.signal && _config.signal.removeEventListener('abort', onCanceled);
      }

      let request = new XMLHttpRequest();

      request.open(_config.method.toUpperCase(), _config.url, true);

      // Set the request timeout in MS
      request.timeout = _config.timeout;

      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        const responseHeaders = AxiosHeaders$1.from(
          'getAllResponseHeaders' in request && request.getAllResponseHeaders()
        );
        const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
          request.responseText : request.response;
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        };

        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);

        // Clean up request
        request = null;
      }

      if ('onloadend' in request) {
        // Use onloadend if available
        request.onloadend = onloadend;
      } else {
        // Listen for ready state to emulate onloadend
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        };
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(new AxiosError$1('Request aborted', AxiosError$1.ECONNABORTED, config, request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(new AxiosError$1('Network Error', AxiosError$1.ERR_NETWORK, config, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = _config.timeout ? 'timeout of ' + _config.timeout + 'ms exceeded' : 'timeout exceeded';
        const transitional = _config.transitional || transitionalDefaults;
        if (_config.timeoutErrorMessage) {
          timeoutErrorMessage = _config.timeoutErrorMessage;
        }
        reject(new AxiosError$1(
          timeoutErrorMessage,
          transitional.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
          config,
          request));

        // Clean up request
        request = null;
      };

      // Remove Content-Type if data is undefined
      requestData === undefined && requestHeaders.setContentType(null);

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
          request.setRequestHeader(key, val);
        });
      }

      // Add withCredentials to request if needed
      if (!utils$1.isUndefined(_config.withCredentials)) {
        request.withCredentials = !!_config.withCredentials;
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        request.responseType = _config.responseType;
      }

      // Handle progress if needed
      if (onDownloadProgress) {
        ([downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true));
        request.addEventListener('progress', downloadThrottled);
      }

      // Not all browsers support upload events
      if (onUploadProgress && request.upload) {
        ([uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress));

        request.upload.addEventListener('progress', uploadThrottled);

        request.upload.addEventListener('loadend', flushUpload);
      }

      if (_config.cancelToken || _config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = cancel => {
          if (!request) {
            return;
          }
          reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
          request.abort();
          request = null;
        };

        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
        if (_config.signal) {
          _config.signal.aborted ? onCanceled() : _config.signal.addEventListener('abort', onCanceled);
        }
      }

      const protocol = parseProtocol(_config.url);

      if (protocol && platform.protocols.indexOf(protocol) === -1) {
        reject(new AxiosError$1('Unsupported protocol ' + protocol + ':', AxiosError$1.ERR_BAD_REQUEST, config));
        return;
      }


      // Send the request
      request.send(requestData || null);
    });
  };

  const composeSignals = (signals, timeout) => {
    const {length} = (signals = signals ? signals.filter(Boolean) : []);

    if (timeout || length) {
      let controller = new AbortController();

      let aborted;

      const onabort = function (reason) {
        if (!aborted) {
          aborted = true;
          unsubscribe();
          const err = reason instanceof Error ? reason : this.reason;
          controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
        }
      };

      let timer = timeout && setTimeout(() => {
        timer = null;
        onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
      }, timeout);

      const unsubscribe = () => {
        if (signals) {
          timer && clearTimeout(timer);
          timer = null;
          signals.forEach(signal => {
            signal.unsubscribe ? signal.unsubscribe(onabort) : signal.removeEventListener('abort', onabort);
          });
          signals = null;
        }
      };

      signals.forEach((signal) => signal.addEventListener('abort', onabort));

      const {signal} = controller;

      signal.unsubscribe = () => utils$1.asap(unsubscribe);

      return signal;
    }
  };

  const streamChunk = function* (chunk, chunkSize) {
    let len = chunk.byteLength;

    if (len < chunkSize) {
      yield chunk;
      return;
    }

    let pos = 0;
    let end;

    while (pos < len) {
      end = pos + chunkSize;
      yield chunk.slice(pos, end);
      pos = end;
    }
  };

  const readBytes = async function* (iterable, chunkSize) {
    for await (const chunk of readStream(iterable)) {
      yield* streamChunk(chunk, chunkSize);
    }
  };

  const readStream = async function* (stream) {
    if (stream[Symbol.asyncIterator]) {
      yield* stream;
      return;
    }

    const reader = stream.getReader();
    try {
      for (;;) {
        const {done, value} = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      await reader.cancel();
    }
  };

  const trackStream = (stream, chunkSize, onProgress, onFinish) => {
    const iterator = readBytes(stream, chunkSize);

    let bytes = 0;
    let done;
    let _onFinish = (e) => {
      if (!done) {
        done = true;
        onFinish && onFinish(e);
      }
    };

    return new ReadableStream({
      async pull(controller) {
        try {
          const {done, value} = await iterator.next();

          if (done) {
           _onFinish();
            controller.close();
            return;
          }

          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = bytes += len;
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      },
      cancel(reason) {
        _onFinish(reason);
        return iterator.return();
      }
    }, {
      highWaterMark: 2
    })
  };

  const isFetchSupported = typeof fetch === 'function' && typeof Request === 'function' && typeof Response === 'function';
  const isReadableStreamSupported = isFetchSupported && typeof ReadableStream === 'function';

  // used only inside the fetch adapter
  const encodeText = isFetchSupported && (typeof TextEncoder === 'function' ?
      ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) :
      async (str) => new Uint8Array(await new Response(str).arrayBuffer())
  );

  const test = (fn, ...args) => {
    try {
      return !!fn(...args);
    } catch (e) {
      return false
    }
  };

  const supportsRequestStream = isReadableStreamSupported && test(() => {
    let duplexAccessed = false;

    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream(),
      method: 'POST',
      get duplex() {
        duplexAccessed = true;
        return 'half';
      },
    }).headers.has('Content-Type');

    return duplexAccessed && !hasContentType;
  });

  const DEFAULT_CHUNK_SIZE = 64 * 1024;

  const supportsResponseStream = isReadableStreamSupported &&
    test(() => utils$1.isReadableStream(new Response('').body));


  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };

  isFetchSupported && (((res) => {
    ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach(type => {
      !resolvers[type] && (resolvers[type] = utils$1.isFunction(res[type]) ? (res) => res[type]() :
        (_, config) => {
          throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
        });
    });
  })(new Response));

  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }

    if(utils$1.isBlob(body)) {
      return body.size;
    }

    if(utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: 'POST',
        body,
      });
      return (await _request.arrayBuffer()).byteLength;
    }

    if(utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }

    if(utils$1.isURLSearchParams(body)) {
      body = body + '';
    }

    if(utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };

  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());

    return length == null ? getBodyLength(body) : length;
  };

  var fetchAdapter = isFetchSupported && (async (config) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = 'same-origin',
      fetchOptions
    } = resolveConfig(config);

    responseType = responseType ? (responseType + '').toLowerCase() : 'text';

    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);

    let request;

    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
        composedSignal.unsubscribe();
    });

    let requestContentLength;

    try {
      if (
        onUploadProgress && supportsRequestStream && method !== 'get' && method !== 'head' &&
        (requestContentLength = await resolveBodyLength(headers, data)) !== 0
      ) {
        let _request = new Request(url, {
          method: 'POST',
          body: data,
          duplex: "half"
        });

        let contentTypeHeader;

        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
          headers.setContentType(contentTypeHeader);
        }

        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );

          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }

      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? 'include' : 'omit';
      }

      // Cloudflare Workers throws when credentials are defined
      // see https://github.com/cloudflare/workerd/issues/902
      const isCredentialsSupported = "credentials" in Request.prototype;
      request = new Request(url, {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : undefined
      });

      let response = await fetch(request);

      const isStreamResponse = supportsResponseStream && (responseType === 'stream' || responseType === 'response');

      if (supportsResponseStream && (onDownloadProgress || (isStreamResponse && unsubscribe))) {
        const options = {};

        ['status', 'statusText', 'headers'].forEach(prop => {
          options[prop] = response[prop];
        });

        const responseContentLength = utils$1.toFiniteNumber(response.headers.get('content-length'));

        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];

        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }

      responseType = responseType || 'text';

      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || 'text'](response, config);

      !isStreamResponse && unsubscribe && unsubscribe();

      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      })
    } catch (err) {
      unsubscribe && unsubscribe();

      if (err && err.name === 'TypeError' && /fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1('Network Error', AxiosError$1.ERR_NETWORK, config, request),
          {
            cause: err.cause || err
          }
        )
      }

      throw AxiosError$1.from(err, err && err.code, config, request);
    }
  });

  const knownAdapters = {
    http: httpAdapter,
    xhr: xhrAdapter,
    fetch: fetchAdapter
  };

  utils$1.forEach(knownAdapters, (fn, value) => {
    if (fn) {
      try {
        Object.defineProperty(fn, 'name', {value});
      } catch (e) {
        // eslint-disable-next-line no-empty
      }
      Object.defineProperty(fn, 'adapterName', {value});
    }
  });

  const renderReason = (reason) => `- ${reason}`;

  const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;

  var adapters = {
    getAdapter: (adapters) => {
      adapters = utils$1.isArray(adapters) ? adapters : [adapters];

      const {length} = adapters;
      let nameOrAdapter;
      let adapter;

      const rejectedReasons = {};

      for (let i = 0; i < length; i++) {
        nameOrAdapter = adapters[i];
        let id;

        adapter = nameOrAdapter;

        if (!isResolvedHandle(nameOrAdapter)) {
          adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

          if (adapter === undefined) {
            throw new AxiosError$1(`Unknown adapter '${id}'`);
          }
        }

        if (adapter) {
          break;
        }

        rejectedReasons[id || '#' + i] = adapter;
      }

      if (!adapter) {

        const reasons = Object.entries(rejectedReasons)
          .map(([id, state]) => `adapter ${id} ` +
            (state === false ? 'is not supported by the environment' : 'is not available in the build')
          );

        let s = length ?
          (reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0])) :
          'as no adapter specified';

        throw new AxiosError$1(
          `There is no suitable adapter to dispatch the request ` + s,
          'ERR_NOT_SUPPORT'
        );
      }

      return adapter;
    },
    adapters: knownAdapters
  };

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   *
   * @param {Object} config The config that is to be used for the request
   *
   * @returns {void}
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (config.signal && config.signal.aborted) {
      throw new CanceledError$1(null, config);
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    config.headers = AxiosHeaders$1.from(config.headers);

    // Transform request data
    config.data = transformData.call(
      config,
      config.transformRequest
    );

    if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
      config.headers.setContentType('application/x-www-form-urlencoded', false);
    }

    const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter);

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData.call(
        config,
        config.transformResponse,
        response
      );

      response.headers = AxiosHeaders$1.from(response.headers);

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel$1(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            config.transformResponse,
            reason.response
          );
          reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
        }
      }

      return Promise.reject(reason);
    });
  }

  const VERSION$1 = "1.8.4";

  const validators$1 = {};

  // eslint-disable-next-line func-names
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
    validators$1[type] = function validator(thing) {
      return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
  });

  const deprecatedWarnings = {};

  /**
   * Transitional option validator
   *
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   *
   * @returns {function}
   */
  validators$1.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return '[Axios v' + VERSION$1 + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }

    // eslint-disable-next-line func-names
    return (value, opt, opts) => {
      if (validator === false) {
        throw new AxiosError$1(
          formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
          AxiosError$1.ERR_DEPRECATED
        );
      }

      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        // eslint-disable-next-line no-console
        console.warn(
          formatMessage(
            opt,
            ' has been deprecated since v' + version + ' and will be removed in the near future'
          )
        );
      }

      return validator ? validator(value, opt, opts) : true;
    };
  };

  validators$1.spelling = function spelling(correctSpelling) {
    return (value, opt) => {
      // eslint-disable-next-line no-console
      console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
      return true;
    }
  };

  /**
   * Assert object's properties type
   *
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   *
   * @returns {object}
   */

  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
      throw new AxiosError$1('options must be an object', AxiosError$1.ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while (i-- > 0) {
      const opt = keys[i];
      const validator = schema[opt];
      if (validator) {
        const value = options[opt];
        const result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError$1('option ' + opt + ' must be ' + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError$1('Unknown option ' + opt, AxiosError$1.ERR_BAD_OPTION);
      }
    }
  }

  var validator = {
    assertOptions,
    validators: validators$1
  };

  const validators = validator.validators;

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   *
   * @return {Axios} A new instance of Axios
   */
  let Axios$1 = class Axios {
    constructor(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    async request(configOrUrl, config) {
      try {
        return await this._request(configOrUrl, config);
      } catch (err) {
        if (err instanceof Error) {
          let dummy = {};

          Error.captureStackTrace ? Error.captureStackTrace(dummy) : (dummy = new Error());

          // slice off the Error: ... line
          const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
          try {
            if (!err.stack) {
              err.stack = stack;
              // match without the 2 top stack lines
            } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
              err.stack += '\n' + stack;
            }
          } catch (e) {
            // ignore the case where "stack" is an un-writable property
          }
        }

        throw err;
      }
    }

    _request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig$1(this.defaults, config);

      const {transitional, paramsSerializer, headers} = config;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      if (paramsSerializer != null) {
        if (utils$1.isFunction(paramsSerializer)) {
          config.paramsSerializer = {
            serialize: paramsSerializer
          };
        } else {
          validator.assertOptions(paramsSerializer, {
            encode: validators.function,
            serialize: validators.function
          }, true);
        }
      }

      // Set config.allowAbsoluteUrls
      if (config.allowAbsoluteUrls !== undefined) ; else if (this.defaults.allowAbsoluteUrls !== undefined) {
        config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
      } else {
        config.allowAbsoluteUrls = true;
      }

      validator.assertOptions(config, {
        baseUrl: validators.spelling('baseURL'),
        withXsrfToken: validators.spelling('withXSRFToken')
      }, true);

      // Set config.method
      config.method = (config.method || this.defaults.method || 'get').toLowerCase();

      // Flatten headers
      let contextHeaders = headers && utils$1.merge(
        headers.common,
        headers[config.method]
      );

      headers && utils$1.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        (method) => {
          delete headers[method];
        }
      );

      config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

      // filter out skipped interceptors
      const requestInterceptorChain = [];
      let synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      const responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      let promise;
      let i = 0;
      let len;

      if (!synchronousRequestInterceptors) {
        const chain = [dispatchRequest.bind(this), undefined];
        chain.unshift.apply(chain, requestInterceptorChain);
        chain.push.apply(chain, responseInterceptorChain);
        len = chain.length;

        promise = Promise.resolve(config);

        while (i < len) {
          promise = promise.then(chain[i++], chain[i++]);
        }

        return promise;
      }

      len = requestInterceptorChain.length;

      let newConfig = config;

      i = 0;

      while (i < len) {
        const onFulfilled = requestInterceptorChain[i++];
        const onRejected = requestInterceptorChain[i++];
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected.call(this, error);
          break;
        }
      }

      try {
        promise = dispatchRequest.call(this, newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      i = 0;
      len = responseInterceptorChain.length;

      while (i < len) {
        promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
      }

      return promise;
    }

    getUri(config) {
      config = mergeConfig$1(this.defaults, config);
      const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    }
  };

  // Provide aliases for supported request methods
  utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function(url, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        url,
        data: (config || {}).data
      }));
    };
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/

    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        return this.request(mergeConfig$1(config || {}, {
          method,
          headers: isForm ? {
            'Content-Type': 'multipart/form-data'
          } : {},
          url,
          data
        }));
      };
    }

    Axios$1.prototype[method] = generateHTTPMethod();

    Axios$1.prototype[method + 'Form'] = generateHTTPMethod(true);
  });

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @param {Function} executor The executor function.
   *
   * @returns {CancelToken}
   */
  let CancelToken$1 = class CancelToken {
    constructor(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      let resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      const token = this;

      // eslint-disable-next-line func-names
      this.promise.then(cancel => {
        if (!token._listeners) return;

        let i = token._listeners.length;

        while (i-- > 0) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = onfulfilled => {
        let _resolve;
        // eslint-disable-next-line func-names
        const promise = new Promise(resolve => {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message, config, request) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError$1(message, config, request);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    }

    /**
     * Subscribe to the cancel signal
     */

    subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    }

    /**
     * Unsubscribe from the cancel signal
     */

    unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }

    toAbortSignal() {
      const controller = new AbortController();

      const abort = (err) => {
        controller.abort(err);
      };

      this.subscribe(abort);

      controller.signal.unsubscribe = () => this.unsubscribe(abort);

      return controller.signal;
    }

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    static source() {
      let cancel;
      const token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    }
  };

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   *
   * @returns {Function}
   */
  function spread$1(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  }

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   *
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  function isAxiosError$1(payload) {
    return utils$1.isObject(payload) && (payload.isAxiosError === true);
  }

  const HttpStatusCode$1 = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
  };

  Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
    HttpStatusCode$1[value] = key;
  });

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   *
   * @returns {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    const context = new Axios$1(defaultConfig);
    const instance = bind(Axios$1.prototype.request, context);

    // Copy axios.prototype to instance
    utils$1.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

    // Copy context to instance
    utils$1.extend(instance, context, null, {allOwnKeys: true});

    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
    };

    return instance;
  }

  // Create the default instance to be exported
  const axios = createInstance(defaults$1);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios$1;

  // Expose Cancel & CancelToken
  axios.CanceledError = CanceledError$1;
  axios.CancelToken = CancelToken$1;
  axios.isCancel = isCancel$1;
  axios.VERSION = VERSION$1;
  axios.toFormData = toFormData$1;

  // Expose AxiosError class
  axios.AxiosError = AxiosError$1;

  // alias for CanceledError for backward compatibility
  axios.Cancel = axios.CanceledError;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };

  axios.spread = spread$1;

  // Expose isAxiosError
  axios.isAxiosError = isAxiosError$1;

  // Expose mergeConfig
  axios.mergeConfig = mergeConfig$1;

  axios.AxiosHeaders = AxiosHeaders$1;

  axios.formToJSON = thing => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);

  axios.getAdapter = adapters.getAdapter;

  axios.HttpStatusCode = HttpStatusCode$1;

  axios.default = axios;

  // This module is intended to unwrap Axios default export as named.
  // Keep top-level export same with static properties
  // so that it can keep same with es module or cjs
  const {
    Axios,
    AxiosError,
    CanceledError,
    isCancel,
    CancelToken,
    VERSION,
    all,
    Cancel,
    isAxiosError,
    spread,
    toFormData,
    AxiosHeaders,
    HttpStatusCode,
    formToJSON,
    getAdapter,
    mergeConfig
  } = axios;

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs$1 (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var awesomePhonenumber = {exports: {}};

  var lib$2 = {exports: {}};

  (function (module) {
  	(function(){/*

  	 Copyright The Closure Library Authors.
  	 SPDX-License-Identifier: Apache-2.0
  	*/
  	var aa=this||self;function h(a,b){function c(){}c.prototype=b.prototype;a.Ba=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.Ha=function(d,e,f){for(var g=Array(arguments.length-2),l=2;l<arguments.length;l++)g[l-2]=arguments[l];return b.prototype[e].apply(d,g)};}function ba(a){var b=[];let c=0;for(var d in a)b[c++]=a[d];return b}function ca(a,b){this.h=a;this.g={};for(a=0;a<b.length;a++){var c=b[a];this.g[c.g]=c;}}function da(a){a=ba(a.g);a.sort(function(b,c){return b.g-c.g});return a}function ea(a,b){this.g=a;this.m=!!b.ga;this.h=b.i;this.u=b.type;this.s=false;switch(this.h){case fa:case ha:case ia:case ja:case ka:case la:case ma:this.s=true;}this.j=b.defaultValue;}var ma=1,la=2,fa=3,ha=4,ia=6,ja=16,ka=18;function k(){this.h={};this.j=this.o().g;this.g=this.m=null;}k.prototype.has=function(a){return m(this,a.g)};k.prototype.get=function(a,b){return n(this,a.g,b)};k.prototype.set=function(a,b){p(this,a.g,b);};k.prototype.add=function(a,b){na(this,a.g,b);};
  	function oa(a,b){for(var c=da(a.o()),d=0;d<c.length;d++){var e=c[d],f=e.g;if(m(b,f)){a.g&&delete a.g[e.g];var g=11==e.h||10==e.h;if(e.m){e=r(b,f);for(var l=0;l<e.length;l++)na(a,f,g?e[l].clone():e[l]);}else e=t(b,f),g?(g=t(a,f))?oa(g,e):p(a,f,e.clone()):p(a,f,e);}}}k.prototype.clone=function(){var a=new this.constructor;a!=this&&(a.h={},a.g&&(a.g={}),oa(a,this));return a};function m(a,b){return null!=a.h[b]}
  	function t(a,b){var c=a.h[b];if(null==c)return null;if(a.m){if(!(b in a.g)){var d=a.m,e=a.j[b];if(null!=c)if(e.m){for(var f=[],g=0;g<c.length;g++)f[g]=d.h(e,c[g]);c=f;}else c=d.h(e,c);return a.g[b]=c}return a.g[b]}return c}function n(a,b,c){var d=t(a,b);return a.j[b].m?d[c||0]:d}function u(a,b){if(m(a,b))a=n(a,b);else a:{a=a.j[b];if(void 0===a.j)if(b=a.u,b===Boolean)a.j=false;else if(b===Number)a.j=0;else if(b===String)a.j=a.s?"0":"";else {a=new b;break a}a=a.j;}return a}
  	function r(a,b){return t(a,b)||[]}function v(a,b){return a.j[b].m?m(a,b)?a.h[b].length:0:m(a,b)?1:0}function p(a,b,c){a.h[b]=c;a.g&&(a.g[b]=c);}function na(a,b,c){a.h[b]||(a.h[b]=[]);a.h[b].push(c);a.g&&delete a.g[b];}function w(a,b){var c=[],d;for(d in b)0!=d&&c.push(new ea(d,b[d]));return new ca(a,c)}function x(){}x.prototype.g=function(a){new a.h;throw Error("Unimplemented");};x.prototype.h=function(a,b){if(11==a.h||10==a.h)return b instanceof k?b:this.g(a.u.prototype.o(),b);if(14==a.h)return "string"===typeof b&&pa.test(b)&&(a=Number(b),0<a)?a:b;if(!a.s)return b;a=a.u;if(a===String){if("number"===typeof b)return String(b)}else if(a===Number&&"string"===typeof b&&("Infinity"===b||"-Infinity"===b||"NaN"===b||pa.test(b)))return Number(b);return b};var pa=/^-?[0-9]+$/;function qa(){}h(qa,x);qa.prototype.g=function(a,b){a=new a.h;a.m=this;a.h=b;a.g={};return a};function y(){}h(y,qa);y.prototype.h=function(a,b){return 8==a.h?!!b:x.prototype.h.apply(this,arguments)};y.prototype.g=function(a,b){return y.Ba.g.call(this,a,b)};function z(a,b){null!=a&&this.g.apply(this,arguments);}z.prototype.h="";z.prototype.set=function(a){this.h=""+a;};z.prototype.g=function(a,b,c){this.h+=String(a);if(null!=b)for(let d=1;d<arguments.length;d++)this.h+=arguments[d];return this};function A(a){a.h="";}z.prototype.toString=function(){return this.h};/*

  	 Protocol Buffer 2 Copyright 2008 Google Inc.
  	 All other code copyright its respective owners.
  	 Copyright (C) 2010 The Libphonenumber Authors

  	 Licensed under the Apache License, Version 2.0 (the "License");
  	 you may not use this file except in compliance with the License.
  	 You may obtain a copy of the License at

  	 http://www.apache.org/licenses/LICENSE-2.0

  	 Unless required by applicable law or agreed to in writing, software
  	 distributed under the License is distributed on an "AS IS" BASIS,
  	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  	 See the License for the specific language governing permissions and
  	 limitations under the License.
  	*/
  	function B(){k.call(this);}h(B,k);var ra=null;function C(){k.call(this);}h(C,k);var sa=null;function D(){k.call(this);}h(D,k);var ta=null;D.prototype.ia=function(){return n(this,10)};
  	B.prototype.o=function(){var a=ra;a||(ra=a=w(B,{0:{name:"NumberFormat",na:"i18n.phonenumbers.NumberFormat"},1:{name:"pattern",required:true,i:9,type:String},2:{name:"format",required:true,i:9,type:String},3:{name:"leading_digits_pattern",ga:true,i:9,type:String},4:{name:"national_prefix_formatting_rule",i:9,type:String},6:{name:"national_prefix_optional_when_formatting",i:8,defaultValue:false,type:Boolean},5:{name:"domestic_carrier_code_formatting_rule",i:9,type:String}}));return a};B.o=B.prototype.o;
  	C.prototype.o=function(){var a=sa;a||(sa=a=w(C,{0:{name:"PhoneNumberDesc",na:"i18n.phonenumbers.PhoneNumberDesc"},2:{name:"national_number_pattern",i:9,type:String},9:{name:"possible_length",ga:true,i:5,type:Number},10:{name:"possible_length_local_only",ga:true,i:5,type:Number},6:{name:"example_number",i:9,type:String}}));return a};C.o=C.prototype.o;
  	D.prototype.o=function(){var a=ta;a||(ta=a=w(D,{0:{name:"PhoneMetadata",na:"i18n.phonenumbers.PhoneMetadata"},1:{name:"general_desc",i:11,type:C},2:{name:"fixed_line",i:11,type:C},3:{name:"mobile",i:11,type:C},4:{name:"toll_free",i:11,type:C},5:{name:"premium_rate",i:11,type:C},6:{name:"shared_cost",i:11,type:C},7:{name:"personal_number",i:11,type:C},8:{name:"voip",i:11,type:C},21:{name:"pager",i:11,type:C},25:{name:"uan",i:11,type:C},27:{name:"emergency",i:11,type:C},28:{name:"voicemail",i:11,type:C},
  	29:{name:"short_code",i:11,type:C},30:{name:"standard_rate",i:11,type:C},31:{name:"carrier_specific",i:11,type:C},33:{name:"sms_services",i:11,type:C},24:{name:"no_international_dialling",i:11,type:C},9:{name:"id",required:true,i:9,type:String},10:{name:"country_code",i:5,type:Number},11:{name:"international_prefix",i:9,type:String},17:{name:"preferred_international_prefix",i:9,type:String},12:{name:"national_prefix",i:9,type:String},13:{name:"preferred_extn_prefix",i:9,type:String},15:{name:"national_prefix_for_parsing",
  	i:9,type:String},16:{name:"national_prefix_transform_rule",i:9,type:String},18:{name:"same_mobile_and_fixed_line_pattern",i:8,defaultValue:false,type:Boolean},19:{name:"number_format",ga:true,i:11,type:B},20:{name:"intl_number_format",ga:true,i:11,type:B},22:{name:"main_country_for_code",i:8,defaultValue:false,type:Boolean},23:{name:"leading_digits",i:9,type:String}}));return a};D.o=D.prototype.o;function E(){k.call(this);}h(E,k);var ua=null;E.prototype.ia=function(){return n(this,1)};var va={Ga:0,Fa:1,Ea:5,Da:10,Ca:20};
  	E.prototype.o=function(){var a=ua;a||(ua=a=w(E,{0:{name:"PhoneNumber",na:"i18n.phonenumbers.PhoneNumber"},1:{name:"country_code",required:true,i:5,type:Number},2:{name:"national_number",required:true,i:4,type:Number},3:{name:"extension",i:9,type:String},4:{name:"italian_leading_zero",i:8,type:Boolean},8:{name:"number_of_leading_zeros",i:5,defaultValue:1,type:Number},5:{name:"raw_input",i:9,type:String},6:{name:"country_code_source",i:14,defaultValue:0,type:va},7:{name:"preferred_domestic_carrier_code",
  	i:9,type:String}}));return a};E.ctor=E;E.ctor.o=E.prototype.o;/*

  	 Copyright (C) 2010 The Libphonenumber Authors

  	 Licensed under the Apache License, Version 2.0 (the "License");
  	 you may not use this file except in compliance with the License.
  	 You may obtain a copy of the License at

  	 http://www.apache.org/licenses/LICENSE-2.0

  	 Unless required by applicable law or agreed to in writing, software
  	 distributed under the License is distributed on an "AS IS" BASIS,
  	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  	 See the License for the specific language governing permissions and
  	 limitations under the License.
  	*/
  	var F={1:"US AG AI AS BB BM BS CA DM DO GD GU JM KN KY LC MP MS PR SX TC TT VC VG VI".split(" "),7:["RU","KZ"],20:["EG"],27:["ZA"],30:["GR"],31:["NL"],32:["BE"],33:["FR"],34:["ES"],36:["HU"],39:["IT","VA"],40:["RO"],41:["CH"],43:["AT"],44:["GB","GG","IM","JE"],45:["DK"],46:["SE"],47:["NO","SJ"],48:["PL"],49:["DE"],51:["PE"],52:["MX"],53:["CU"],54:["AR"],55:["BR"],56:["CL"],57:["CO"],58:["VE"],60:["MY"],61:["AU","CC","CX"],62:["ID"],63:["PH"],64:["NZ"],65:["SG"],66:["TH"],81:["JP"],82:["KR"],84:["VN"],
  	86:["CN"],90:["TR"],91:["IN"],92:["PK"],93:["AF"],94:["LK"],95:["MM"],98:["IR"],211:["SS"],212:["MA","EH"],213:["DZ"],216:["TN"],218:["LY"],220:["GM"],221:["SN"],222:["MR"],223:["ML"],224:["GN"],225:["CI"],226:["BF"],227:["NE"],228:["TG"],229:["BJ"],230:["MU"],231:["LR"],232:["SL"],233:["GH"],234:["NG"],235:["TD"],236:["CF"],237:["CM"],238:["CV"],239:["ST"],240:["GQ"],241:["GA"],242:["CG"],243:["CD"],244:["AO"],245:["GW"],246:["IO"],247:["AC"],248:["SC"],249:["SD"],250:["RW"],251:["ET"],252:["SO"],
  	253:["DJ"],254:["KE"],255:["TZ"],256:["UG"],257:["BI"],258:["MZ"],260:["ZM"],261:["MG"],262:["RE","YT"],263:["ZW"],264:["NA"],265:["MW"],266:["LS"],267:["BW"],268:["SZ"],269:["KM"],290:["SH","TA"],291:["ER"],297:["AW"],298:["FO"],299:["GL"],350:["GI"],351:["PT"],352:["LU"],353:["IE"],354:["IS"],355:["AL"],356:["MT"],357:["CY"],358:["FI","AX"],359:["BG"],370:["LT"],371:["LV"],372:["EE"],373:["MD"],374:["AM"],375:["BY"],376:["AD"],377:["MC"],378:["SM"],380:["UA"],381:["RS"],382:["ME"],383:["XK"],385:["HR"],
  	386:["SI"],387:["BA"],389:["MK"],420:["CZ"],421:["SK"],423:["LI"],500:["FK"],501:["BZ"],502:["GT"],503:["SV"],504:["HN"],505:["NI"],506:["CR"],507:["PA"],508:["PM"],509:["HT"],590:["GP","BL","MF"],591:["BO"],592:["GY"],593:["EC"],594:["GF"],595:["PY"],596:["MQ"],597:["SR"],598:["UY"],599:["CW","BQ"],670:["TL"],672:["NF"],673:["BN"],674:["NR"],675:["PG"],676:["TO"],677:["SB"],678:["VU"],679:["FJ"],680:["PW"],681:["WF"],682:["CK"],683:["NU"],685:["WS"],686:["KI"],687:["NC"],688:["TV"],689:["PF"],690:["TK"],
  	691:["FM"],692:["MH"],800:["001"],808:["001"],850:["KP"],852:["HK"],853:["MO"],855:["KH"],856:["LA"],870:["001"],878:["001"],880:["BD"],881:["001"],882:["001"],883:["001"],886:["TW"],888:["001"],960:["MV"],961:["LB"],962:["JO"],963:["SY"],964:["IQ"],965:["KW"],966:["SA"],967:["YE"],968:["OM"],970:["PS"],971:["AE"],972:["IL"],973:["BH"],974:["QA"],975:["BT"],976:["MN"],977:["NP"],979:["001"],992:["TJ"],993:["TM"],994:["AZ"],995:["GE"],996:["KG"],998:["UZ"]},G={AC:[,[,,"(?:[01589]\\d|[46])\\d{4}",,
  	,,,,,[5,6]],[,,"6[2-467]\\d{3}",,,,"62889",,,[5]],[,,"4\\d{4}",,,,"40123",,,[5]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"AC",247,"00",,,,,,,,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"(?:0[1-9]|[1589]\\d)\\d{4}",,,,"542011",,,[6]],,,[,,,,,,,,,[-1]]],AD:[,[,,"(?:1|6\\d)\\d{7}|[135-9]\\d{5}",,,,,,,[6,8,9]],[,,"[78]\\d{5}",,,,"712345",,,[6]],[,,"690\\d{6}|[356]\\d{5}",,,,"312345",,,[6,9]],[,,"180[02]\\d{4}",,,,"18001234",,,[8]],[,,"[19]\\d{5}",,,,"912345",,,[6]],
  	[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"AD",376,"00",,,,,,,,[[,"(\\d{3})(\\d{3})","$1 $2",["[135-9]"]],[,"(\\d{4})(\\d{4})","$1 $2",["1"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["6"]]],,[,,,,,,,,,[-1]],,,[,,"1800\\d{4}",,,,,,,[8]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AE:[,[,,"(?:[4-7]\\d|9[0-689])\\d{7}|800\\d{2,9}|[2-4679]\\d{7}",,,,,,,[5,6,7,8,9,10,11,12]],[,,"[2-4679][2-8]\\d{6}",,,,"22345678",,,[8],[7]],[,,"5[024-68]\\d{7}",,,,"501234567",,,[9]],[,,"400\\d{6}|800\\d{2,9}",,,,"800123456"],
  	[,,"900[02]\\d{5}",,,,"900234567",,,[9]],[,,"700[05]\\d{5}",,,,"700012345",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"AE",971,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{2,9})","$1 $2",["60|8"]],[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["[236]|[479][2-8]"],"0$1"],[,"(\\d{3})(\\d)(\\d{5})","$1 $2 $3",["[479]"]],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["5"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"600[25]\\d{5}",,,,"600212345",,,[9]],,,[,,,,,,,,,[-1]]],AF:[,[,,"[2-7]\\d{8}",,,,,,,[9],[7]],[,,"(?:[25][0-8]|[34][0-4]|6[0-5])[2-9]\\d{6}",
  	,,,"234567890",,,,[7]],[,,"7\\d{8}",,,,"701234567",,,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"AF",93,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[1-9]"]],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[2-7]"],"0$1"]],[[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[2-7]"],"0$1"]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AG:[,[,,"(?:268|[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"268(?:4(?:6[0-38]|84)|56[0-2])\\d{4}",,,,"2684601234",
  	,,,[7]],[,,"268(?:464|7(?:1[3-9]|[28]\\d|3[0246]|64|7[0-689]))\\d{4}",,,,"2684641234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,"26848[01]\\d{4}",,,,"2684801234",,,,[7]],
  	"AG",1,"011","1",,,"([457]\\d{6})$|1","268$1",,,,,[,,"26840[69]\\d{4}",,,,"2684061234",,,,[7]],,"268",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AI:[,[,,"(?:264|[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"264(?:292|4(?:6[12]|9[78]))\\d{4}",,,,"2644612345",,,,[7]],[,,"264(?:235|4(?:69|76)|5(?:3[6-9]|8[1-4])|7(?:29|72))\\d{4}",,,,"2642351234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,,,,,,,,[-1]],"AI",1,"011","1",,,"([2457]\\d{6})$|1","264$1",,,,,[,,"264724\\d{4}",,,,"2647241234",,,,[7]],,"264",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AL:[,[,,"(?:700\\d\\d|900)\\d{3}|8\\d{5,7}|(?:[2-5]|6\\d)\\d{7}",,,,,,,[6,7,8,9],[5]],[,,"4505[0-2]\\d{3}|(?:[2358][16-9]\\d[2-9]|4410)\\d{4}|(?:[2358][2-5][2-9]|4(?:[2-57-9][2-9]|6\\d))\\d{5}",,,,"22345678",,,[8],[5,6,7]],[,,"6(?:[78][2-9]|9\\d)\\d{6}",,,,"672123456",,,[9]],[,,"800\\d{4}",,,,"8001234",,,[7]],[,,"900[1-9]\\d\\d",
  	,,,"900123",,,[6]],[,,"808[1-9]\\d\\d",,,,"808123",,,[6]],[,,"700[2-9]\\d{4}",,,,"70021234",,,[8]],[,,,,,,,,,[-1]],"AL",355,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3,4})","$1 $2",["80|9"],"0$1"],[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["4[2-6]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["[2358][2-5]|4"],"0$1"],[,"(\\d{3})(\\d{5})","$1 $2",["[23578]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["6"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AM:[,[,,"(?:[1-489]\\d|55|60|77)\\d{6}",
  	,,,,,,[8],[5,6]],[,,"(?:(?:1[0-25]|47)\\d|2(?:2[2-46]|3[1-8]|4[2-69]|5[2-7]|6[1-9]|8[1-7])|3[12]2)\\d{5}",,,,"10123456",,,,[5,6]],[,,"(?:33|4[1349]|55|77|88|9[13-9])\\d{6}",,,,"77123456"],[,,"800\\d{5}",,,,"80012345"],[,,"90[016]\\d{5}",,,,"90012345"],[,,"80[1-4]\\d{5}",,,,"80112345"],[,,,,,,,,,[-1]],[,,"60(?:2[78]|3[5-9]|4[02-9]|5[0-46-9]|[6-8]\\d|9[0-2])\\d{4}",,,,"60271234"],"AM",374,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3",["[89]0"],"0 $1"],[,"(\\d{3})(\\d{5})","$1 $2",["2|3[12]"],
  	"(0$1)"],[,"(\\d{2})(\\d{6})","$1 $2",["1|47"],"(0$1)"],[,"(\\d{2})(\\d{6})","$1 $2",["[3-9]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AO:[,[,,"[29]\\d{8}",,,,,,,[9]],[,,"2\\d(?:[0134][25-9]|[25-9]\\d)\\d{5}",,,,"222123456"],[,,"9[1-59]\\d{7}",,,,"923123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"AO",244,"00",,,,,,,,[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[29]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],
  	,,[,,,,,,,,,[-1]]],AR:[,[,,"(?:11|[89]\\d\\d)\\d{8}|[2368]\\d{9}",,,,,,,[10,11],[6,7,8]],[,,"3888[013-9]\\d{5}|3(?:7(?:1[15]|81)|8(?:21|4[16]|69|9[12]))[46]\\d{5}|(?:29(?:54|66)|3(?:7(?:55|77)|865))[2-8]\\d{5}|(?:2(?:2(?:2[59]|44|52)|3(?:26|44)|473|9(?:[07]2|2[26]|34|46))|3327)[45]\\d{5}|(?:2(?:284|3(?:02|23)|657|920)|3(?:4(?:8[27]|92)|541|878))[2-7]\\d{5}|(?:2(?:(?:26|62)2|320|477|9(?:42|83))|3(?:329|4(?:[47]6|62|89)|564))[2-6]\\d{5}|(?:(?:11[1-8]|670)\\d|2(?:2(?:0[45]|1[2-6]|3[3-6])|3(?:[06]4|7[45])|494|6(?:04|1[2-8]|[36][45]|4[3-6])|80[45]|9(?:[17][4-6]|[48][45]|9[3-6]))|3(?:364|4(?:1[2-8]|[235][4-6]|84)|5(?:1[2-9]|[38][4-6])|6(?:2[45]|44)|7[069][45]|8(?:0[45]|[17][2-6]|3[4-6]|[58][3-6])))\\d{6}|2(?:2(?:21|4[23]|6[145]|7[1-4]|8[356]|9[267])|3(?:16|3[13-8]|43|5[346-8]|9[3-5])|475|6(?:2[46]|4[78]|5[1568])|9(?:03|2[1457-9]|3[1356]|4[08]|[56][23]|82))4\\d{5}|(?:2(?:2(?:57|81)|3(?:24|46|92)|9(?:01|23|64))|3(?:4(?:42|71)|5(?:25|37|4[347]|71)|7(?:18|5[17])))[3-6]\\d{5}|(?:2(?:2(?:02|2[3467]|4[156]|5[45]|6[6-8]|91)|3(?:1[47]|25|[45][25]|96)|47[48]|625|932)|3(?:38[2578]|4(?:0[0-24-9]|3[78]|4[457]|58|6[03-9]|72|83|9[136-8])|5(?:2[124]|[368][23]|4[2689]|7[2-6])|7(?:16|2[15]|3[145]|4[13]|5[468]|7[2-5]|8[26])|8(?:2[5-7]|3[278]|4[3-5]|5[78]|6[1-378]|[78]7|94)))[4-6]\\d{5}",
  	,,,"1123456789",,,[10],[6,7,8]],[,,"93(?:7(?:1[15]|81)[46]|8(?:(?:21|4[16]|69|9[12])[46]|88[013-9]))\\d{5}|9(?:29(?:54|66)|3(?:7(?:55|77)|865))[2-8]\\d{5}|9(?:2(?:2(?:2[59]|44|52)|3(?:26|44)|473|9(?:[07]2|2[26]|34|46))|3327)[45]\\d{5}|9(?:2(?:284|3(?:02|23)|657|920)|3(?:4(?:8[27]|92)|541|878))[2-7]\\d{5}|9(?:2(?:(?:26|62)2|320|477|9(?:42|83))|3(?:329|4(?:[47]6|62|89)|564))[2-6]\\d{5}|(?:675\\d|9(?:11[1-8]\\d|2(?:2(?:0[45]|1[2-6]|3[3-6])|3(?:[06]4|7[45])|494|6(?:04|1[2-8]|[36][45]|4[3-6])|80[45]|9(?:[17][4-6]|[48][45]|9[3-6]))|3(?:364|4(?:1[2-8]|[235][4-6]|84)|5(?:1[2-9]|[38][4-6])|6(?:2[45]|44)|7[069][45]|8(?:0[45]|[17][2-6]|3[4-6]|[58][3-6]))))\\d{6}|92(?:2(?:21|4[23]|6[145]|7[1-4]|8[356]|9[267])|3(?:16|3[13-8]|43|5[346-8]|9[3-5])|475|6(?:2[46]|4[78]|5[1568])|9(?:03|2[1457-9]|3[1356]|4[08]|[56][23]|82))4\\d{5}|9(?:2(?:2(?:57|81)|3(?:24|46|92)|9(?:01|23|64))|3(?:4(?:42|71)|5(?:25|37|4[347]|71)|7(?:18|5[17])))[3-6]\\d{5}|9(?:2(?:2(?:02|2[3467]|4[156]|5[45]|6[6-8]|91)|3(?:1[47]|25|[45][25]|96)|47[48]|625|932)|3(?:38[2578]|4(?:0[0-24-9]|3[78]|4[457]|58|6[03-9]|72|83|9[136-8])|5(?:2[124]|[368][23]|4[2689]|7[2-6])|7(?:16|2[15]|3[145]|4[13]|5[468]|7[2-5]|8[26])|8(?:2[5-7]|3[278]|4[3-5]|5[78]|6[1-378]|[78]7|94)))[4-6]\\d{5}",
  	,,,"91123456789",,,,[6,7,8]],[,,"800\\d{7,8}",,,,"8001234567"],[,,"60[04579]\\d{7}",,,,"6001234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"AR",54,"00","0",,,"0?(?:(11|2(?:2(?:02?|[13]|2[13-79]|4[1-6]|5[2457]|6[124-8]|7[1-4]|8[13-6]|9[1267])|3(?:02?|1[467]|2[03-6]|3[13-8]|[49][2-6]|5[2-8]|[67])|4(?:7[3-578]|9)|6(?:[0136]|2[24-6]|4[6-8]?|5[15-8])|80|9(?:0[1-3]|[19]|2\\d|3[1-6]|4[02568]?|5[2-4]|6[2-46]|72?|8[23]?))|3(?:3(?:2[79]|6|8[2578])|4(?:0[0-24-9]|[12]|3[5-8]?|4[24-7]|5[4-68]?|6[02-9]|7[126]|8[2379]?|9[1-36-8])|5(?:1|2[1245]|3[237]?|4[1-46-9]|6[2-4]|7[1-6]|8[2-5]?)|6[24]|7(?:[069]|1[1568]|2[15]|3[145]|4[13]|5[14-8]|7[2-57]|8[126])|8(?:[01]|2[15-7]|3[2578]?|4[13-6]|5[4-8]?|6[1-357-9]|7[36-8]?|8[5-8]?|9[124])))15)?",
  	"9$1",,,[[,"(\\d{3})","$1",["0|1(?:0[0-35-7]|1[02-5]|2[015]|3[47]|4[478])|911"]],[,"(\\d{2})(\\d{4})","$1-$2",["[1-9]"]],[,"(\\d{3})(\\d{4})","$1-$2",["[2-9]"]],[,"(\\d{4})(\\d{4})","$1-$2",["[1-8]"]],[,"(\\d{4})(\\d{2})(\\d{4})","$1 $2-$3",["2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9])","2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8]))|2(?:2[24-9]|3[1-59]|47)",
  	"2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5[56][46]|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]","2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|58|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|54(?:4|5[13-7]|6[89])|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:454|85[56])[46]|3(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]"],
  	"0$1",,1],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2-$3",["1"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["[68]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2-$3",["[23]"],"0$1",,1],[,"(\\d)(\\d{4})(\\d{2})(\\d{4})","$2 15-$3-$4",["9(?:2[2-469]|3[3-578])","9(?:2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9]))","9(?:2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8])))|92(?:2[24-9]|3[1-59]|47)",
  	"9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5(?:[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]","9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|5(?:4(?:4|5[13-7]|6[89])|[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]"],
  	"0$1"],[,"(\\d)(\\d{2})(\\d{4})(\\d{4})","$2 15-$3-$4",["91"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{5})","$1-$2-$3",["8"],"0$1"],[,"(\\d)(\\d{3})(\\d{3})(\\d{4})","$2 15-$3-$4",["9"],"0$1"]],[[,"(\\d{4})(\\d{2})(\\d{4})","$1 $2-$3",["2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9])","2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8]))|2(?:2[24-9]|3[1-59]|47)",
  	"2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5[56][46]|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]","2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|58|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|54(?:4|5[13-7]|6[89])|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:454|85[56])[46]|3(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]"],
  	"0$1",,1],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2-$3",["1"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["[68]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2-$3",["[23]"],"0$1",,1],[,"(\\d)(\\d{4})(\\d{2})(\\d{4})","$1 $2 $3-$4",["9(?:2[2-469]|3[3-578])","9(?:2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9]))","9(?:2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8])))|92(?:2[24-9]|3[1-59]|47)",
  	"9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5(?:[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]","9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|5(?:4(?:4|5[13-7]|6[89])|[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]"]],
  	[,"(\\d)(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3-$4",["91"]],[,"(\\d{3})(\\d{3})(\\d{5})","$1-$2-$3",["8"],"0$1"],[,"(\\d)(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3-$4",["9"]]],[,,,,,,,,,[-1]],,,[,,"810\\d{7}",,,,,,,[10]],[,,"810\\d{7}",,,,"8101234567",,,[10]],,,[,,,,,,,,,[-1]]],AS:[,[,,"(?:[58]\\d\\d|684|900)\\d{7}",,,,,,,[10],[7]],[,,"6846(?:22|33|44|55|77|88|9[19])\\d{4}",,,,"6846221234",,,,[7]],[,,"684(?:2(?:48|5[2468]|7[26])|7(?:3[13]|70|82))\\d{4}",,,,"6847331234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",
  	,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"AS",1,"011","1",,,"([267]\\d{6})$|1","684$1",,,,,[,,,,,,,,,[-1]],,"684",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AT:[,[,,"1\\d{3,12}|2\\d{6,12}|43(?:(?:0\\d|5[02-9])\\d{3,9}|2\\d{4,5}|[3467]\\d{4}|8\\d{4,6}|9\\d{4,7})|5\\d{4,12}|8\\d{7,12}|9\\d{8,12}|(?:[367]\\d|4[0-24-9])\\d{4,11}",
  	,,,,,,[4,5,6,7,8,9,10,11,12,13],[3]],[,,"1(?:11\\d|[2-9]\\d{3,11})|(?:316|463|(?:51|66|73)2)\\d{3,10}|(?:2(?:1[467]|2[13-8]|5[2357]|6[1-46-8]|7[1-8]|8[124-7]|9[1458])|3(?:1[1-578]|3[23568]|4[5-7]|5[1378]|6[1-38]|8[3-68])|4(?:2[1-8]|35|7[1368]|8[2457])|5(?:2[1-8]|3[357]|4[147]|5[12578]|6[37])|6(?:13|2[1-47]|4[135-8]|5[468])|7(?:2[1-8]|35|4[13478]|5[68]|6[16-8]|7[1-6]|9[45]))\\d{4,10}",,,,"1234567890",,,,[3]],[,,"6(?:5[0-3579]|6[013-9]|[7-9]\\d)\\d{4,10}",,,,"664123456",,,[7,8,9,10,11,12,13]],[,,"800\\d{6,10}",
  	,,,"800123456",,,[9,10,11,12,13]],[,,"(?:8[69][2-68]|9(?:0[01]|3[019]))\\d{6,10}",,,,"900123456",,,[9,10,11,12,13]],[,,"8(?:10|2[018])\\d{6,10}|828\\d{5}",,,,"810123456",,,[8,9,10,11,12,13]],[,,,,,,,,,[-1]],[,,"5(?:0[1-9]|17|[79]\\d)\\d{2,10}|7[28]0\\d{6,10}",,,,"780123456",,,[5,6,7,8,9,10,11,12,13]],"AT",43,"00","0",,,"0",,,,[[,"(\\d{4})","$1",["14"]],[,"(\\d)(\\d{3,12})","$1 $2",["1(?:11|[2-9])"],"0$1"],[,"(\\d{3})(\\d{2})","$1 $2",["517"],"0$1"],[,"(\\d{2})(\\d{3,5})","$1 $2",["5[079]"],"0$1"],
  	[,"(\\d{6})","$1",["[18]"]],[,"(\\d{3})(\\d{3,10})","$1 $2",["(?:31|4)6|51|6(?:5[0-3579]|[6-9])|7(?:20|32|8)|[89]"],"0$1"],[,"(\\d{4})(\\d{3,9})","$1 $2",["[2-467]|5[2-6]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["5"],"0$1"],[,"(\\d{2})(\\d{4})(\\d{4,7})","$1 $2 $3",["5"],"0$1"]],[[,"(\\d)(\\d{3,12})","$1 $2",["1(?:11|[2-9])"],"0$1"],[,"(\\d{3})(\\d{2})","$1 $2",["517"],"0$1"],[,"(\\d{2})(\\d{3,5})","$1 $2",["5[079]"],"0$1"],[,"(\\d{3})(\\d{3,10})","$1 $2",["(?:31|4)6|51|6(?:5[0-3579]|[6-9])|7(?:20|32|8)|[89]"],
  	"0$1"],[,"(\\d{4})(\\d{3,9})","$1 $2",["[2-467]|5[2-6]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["5"],"0$1"],[,"(\\d{2})(\\d{4})(\\d{4,7})","$1 $2 $3",["5"],"0$1"]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AU:[,[,,"1(?:[0-79]\\d{7}(?:\\d(?:\\d{2})?)?|8[0-24-9]\\d{7})|[2-478]\\d{8}|1\\d{4,7}",,,,,,,[5,6,7,8,9,10,12]],[,,"(?:(?:2(?:[0-26-9]\\d|3[0-8]|4[02-9]|5[0135-9])|3(?:[0-3589]\\d|4[0-578]|6[1-9]|7[0-35-9])|7(?:[013-57-9]\\d|2[0-8]))\\d{3}|8(?:51(?:0(?:0[03-9]|[12479]\\d|3[2-9]|5[0-8]|6[1-9]|8[0-7])|1(?:[0235689]\\d|1[0-69]|4[0-589]|7[0-47-9])|2(?:0[0-79]|[18][13579]|2[14-9]|3[0-46-9]|[4-6]\\d|7[89]|9[0-4]))|(?:6[0-8]|[78]\\d)\\d{3}|9(?:[02-9]\\d{3}|1(?:(?:[0-58]\\d|6[0135-9])\\d|7(?:0[0-24-9]|[1-9]\\d)|9(?:[0-46-9]\\d|5[0-79])))))\\d{3}",
  	,,,"212345678",,,[9],[8]],[,,"4(?:(?:79|94)[01]|83[0-389])\\d{5}|4(?:[0-3]\\d|4[047-9]|5[0-25-9]|6[0-26-9]|7[02-8]|8[0-24-9]|9[0-37-9])\\d{6}",,,,"412345678",,,[9]],[,,"180(?:0\\d{3}|2)\\d{3}",,,,"1800123456",,,[7,10]],[,,"190[0-26]\\d{6}",,,,"1900123456",,,[10]],[,,"13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}",,,,"1300123456",,,[6,8,10,12]],[,,,,,,,,,[-1]],[,,"14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}",,,,"147101234",,,[9]],"AU",61,"001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011","0",,,
  	"(183[12])|0",,"0011",,[[,"(\\d{2})(\\d{3,4})","$1 $2",["16"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",["13"]],[,"(\\d{3})(\\d{3})","$1 $2",["19"]],[,"(\\d{3})(\\d{4})","$1 $2",["180","1802"]],[,"(\\d{4})(\\d{3,4})","$1 $2",["19"]],[,"(\\d{2})(\\d{3})(\\d{2,4})","$1 $2 $3",["16"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["14|4"],"0$1"],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["[2378]"],"(0$1)","$CC ($1)"],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["1(?:30|[89])"]],[,"(\\d{4})(\\d{4})(\\d{4})",
  	"$1 $2 $3",["130"]]],[[,"(\\d{2})(\\d{3,4})","$1 $2",["16"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2,4})","$1 $2 $3",["16"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["14|4"],"0$1"],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["[2378]"],"(0$1)","$CC ($1)"],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["1(?:30|[89])"]]],[,,"163\\d{2,6}",,,,"1631234",,,[5,6,7,8,9]],1,,[,,"1(?:3(?:00\\d{5}|45[0-4])|802)\\d{3}|1[38]00\\d{6}|13\\d{4}",,,,,,,[6,7,8,10,12]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AW:[,[,,"(?:[25-79]\\d\\d|800)\\d{4}",
  	,,,,,,[7]],[,,"5(?:2\\d|8[1-9])\\d{4}",,,,"5212345"],[,,"(?:290|5[69]\\d|6(?:[03]0|22|4[0-2]|[69]\\d)|7(?:[34]\\d|7[07])|9(?:6[45]|9[4-8]))\\d{4}",,,,"5601234"],[,,"800\\d{4}",,,,"8001234"],[,,"900\\d{4}",,,,"9001234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:28\\d|501)\\d{4}",,,,"5011234"],"AW",297,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[25-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],AX:[,[,,"2\\d{4,9}|35\\d{4,5}|(?:60\\d\\d|800)\\d{4,6}|7\\d{5,11}|(?:[14]\\d|3[0-46-9]|50)\\d{4,8}",
  	,,,,,,[5,6,7,8,9,10,11,12]],[,,"18[1-8]\\d{3,6}",,,,"181234567",,,[6,7,8,9]],[,,"4946\\d{2,6}|(?:4[0-8]|50)\\d{4,8}",,,,"412345678",,,[6,7,8,9,10]],[,,"800\\d{4,6}",,,,"800123456",,,[7,8,9]],[,,"[67]00\\d{5,6}",,,,"600123456",,,[8,9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"AX",358,"00|99(?:[01469]|5(?:[14]1|3[23]|5[59]|77|88|9[09]))","0",,,"0",,"00",,,,[,,,,,,,,,[-1]],,"18",[,,,,,,,,,[-1]],[,,"20\\d{4,8}|60[12]\\d{5,6}|7(?:099\\d{4,5}|5[03-9]\\d{3,7})|20[2-59]\\d\\d|(?:606|7(?:0[78]|1|3\\d))\\d{7}|(?:10|29|3[09]|70[1-5]\\d)\\d{4,8}",
  	,,,"10112345"],,,[,,,,,,,,,[-1]]],AZ:[,[,,"365\\d{6}|(?:[124579]\\d|60|88)\\d{7}",,,,,,,[9],[7]],[,,"(?:2[12]428|3655[02])\\d{4}|(?:2(?:22[0-79]|63[0-28])|3654)\\d{5}|(?:(?:1[28]|46)\\d|2(?:[014-6]2|[23]3))\\d{6}",,,,"123123456",,,,[7]],[,,"36554\\d{4}|(?:[16]0|4[04]|5[015]|7[07]|99)\\d{7}",,,,"401234567"],[,,"88\\d{7}",,,,"881234567"],[,,"900200\\d{3}",,,,"900200123"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"AZ",994,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3",["[1-9]"]],[,
  	"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["90"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["1[28]|2|365|46","1[28]|2|365[45]|46","1[28]|2|365(?:4|5[02])|46"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[13-9]"],"0$1"]],[[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["90"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["1[28]|2|365|46","1[28]|2|365[45]|46","1[28]|2|365(?:4|5[02])|46"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",
  	["[13-9]"],"0$1"]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BA:[,[,,"6\\d{8}|(?:[35689]\\d|49|70)\\d{6}",,,,,,,[8,9],[6]],[,,"(?:3(?:[05-79][2-9]|1[4579]|[23][24-9]|4[2-4689]|8[2457-9])|49[2-579]|5(?:0[2-49]|[13][2-9]|[268][2-4679]|4[4689]|5[2-79]|7[2-69]|9[2-4689]))\\d{5}",,,,"30212345",,,[8],[6]],[,,"6040\\d{5}|6(?:03|[1-356]|44|7\\d)\\d{6}",,,,"61123456"],[,,"8[08]\\d{6}",,,,"80123456",,,[8]],[,,"9[0246]\\d{6}",,,,"90123456",,,[8]],[,,"8[12]\\d{6}",,,,"82123456",,,[8]],
  	[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BA",387,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3})","$1-$2",["[2-9]"]],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["6[1-3]|[7-9]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2-$3",["[3-5]|6[56]"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3 $4",["6"],"0$1"]],[[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["6[1-3]|[7-9]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2-$3",["[3-5]|6[56]"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3 $4",["6"],"0$1"]],[,,,,,,,,,[-1]],
  	,,[,,,,,,,,,[-1]],[,,"703[235]0\\d{3}|70(?:2[0-5]|3[0146]|[56]0)\\d{4}",,,,"70341234",,,[8]],,,[,,,,,,,,,[-1]]],BB:[,[,,"(?:246|[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"246521[0369]\\d{3}|246(?:2(?:2[78]|7[0-4])|4(?:1[024-6]|2\\d|3[2-9])|5(?:20|[34]\\d|54|7[1-3])|6(?:2\\d|38)|7[35]7|9(?:1[89]|63))\\d{4}",,,,"2464123456",,,,[7]],[,,"246(?:(?:2(?:[3568]\\d|4[0-57-9])|3(?:5[2-9]|6[0-6])|4(?:46|5\\d)|69[5-7]|8(?:[2-5]\\d|83))\\d|52(?:1[147]|20))\\d{3}",,,,"2462501234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",
  	,,,"8002123456"],[,,"(?:246976|900[2-9]\\d\\d)\\d{4}",,,,"9002123456",,,,[7]],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,"24631\\d{5}",,,,"2463101234",,,,[7]],"BB",1,"011","1",,,"([2-9]\\d{6})$|1","246$1",,,,,[,,,,,,,,,[-1]],,"246",[,,,,,,,,,[-1]],[,,"246(?:292|367|4(?:1[7-9]|3[01]|4[47-9]|67)|7(?:1[2-9]|2\\d|3[016]|53))\\d{4}",
  	,,,"2464301234",,,,[7]],,,[,,,,,,,,,[-1]]],BD:[,[,,"[1-469]\\d{9}|8[0-79]\\d{7,8}|[2-79]\\d{8}|[2-9]\\d{7}|[3-9]\\d{6}|[57-9]\\d{5}",,,,,,,[6,7,8,9,10]],[,,"(?:4(?:31\\d\\d|423)|5222)\\d{3}(?:\\d{2})?|8332[6-9]\\d\\d|(?:3(?:03[56]|224)|4(?:22[25]|653))\\d{3,4}|(?:3(?:42[47]|529|823)|4(?:027|525|65(?:28|8))|562|6257|7(?:1(?:5[3-5]|6[12]|7[156]|89)|22[589]56|32|42675|52(?:[25689](?:56|8)|[347]8)|71(?:6[1267]|75|89)|92374)|82(?:2[59]|32)56|9(?:03[23]56|23(?:256|373)|31|5(?:1|2[4589]56)))\\d{3}|(?:3(?:02[348]|22[35]|324|422)|4(?:22[67]|32[236-9]|6(?:2[46]|5[57])|953)|5526|6(?:024|6655)|81)\\d{4,5}|(?:2(?:7(?:1[0-267]|2[0-289]|3[0-29]|4[01]|5[1-3]|6[013]|7[0178]|91)|8(?:0[125]|1[1-6]|2[0157-9]|3[1-69]|41|6[1-35]|7[1-5]|8[1-8]|9[0-6])|9(?:0[0-2]|1[0-4]|2[568]|3[3-6]|5[5-7]|6[0136-9]|7[0-7]|8[014-9]))|3(?:0(?:2[025-79]|3[2-4])|181|22[12]|32[2356]|824)|4(?:02[09]|22[348]|32[045]|523|6(?:27|54))|666(?:22|53)|7(?:22[57-9]|42[56]|82[35])8|8(?:0[124-9]|2(?:181|2[02-4679]8)|4[12]|[5-7]2)|9(?:[04]2|2(?:2|328)|81))\\d{4}|(?:2(?:222|[45]\\d)\\d|3(?:1(?:2[5-7]|[5-7])|425|822)|4(?:033|1\\d|[257]1|332|4(?:2[246]|5[25])|6(?:2[35]|56|62)|8(?:23|54)|92[2-5])|5(?:02[03489]|22[457]|32[35-79]|42[46]|6(?:[18]|53)|724|826)|6(?:023|2(?:2[2-5]|5[3-5]|8)|32[3478]|42[34]|52[47]|6(?:[18]|6(?:2[34]|5[24]))|[78]2[2-5]|92[2-6])|7(?:02|21\\d|[3-589]1|6[12]|72[24])|8(?:217|3[12]|[5-7]1)|9[24]1)\\d{5}|(?:(?:3[2-8]|5[2-57-9]|6[03-589])1|4[4689][18])\\d{5}|[59]1\\d{5}",
  	,,,"27111234"],[,,"(?:1[13-9]\\d|644)\\d{7}|(?:3[78]|44|66)[02-9]\\d{7}",,,,"1812345678",,,[10]],[,,"80[03]\\d{7}",,,,"8001234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"96(?:0[469]|1[0-47]|3[389]|43|6[69]|7[78])\\d{6}",,,,"9604123456",,,[10]],"BD",880,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{4,6})","$1-$2",["31[5-8]|[459]1"],"0$1"],[,"(\\d{3})(\\d{3,7})","$1-$2",["3(?:[67]|8[013-9])|4(?:6[168]|7|[89][18])|5(?:6[128]|9)|6(?:[15]|28|4[14])|7[2-589]|8(?:0[014-9]|[12])|9[358]|(?:3[2-5]|4[235]|5[2-578]|6[0389]|76|8[3-7]|9[24])1|(?:44|66)[01346-9]"],
  	"0$1"],[,"(\\d{4})(\\d{3,6})","$1-$2",["[13-9]|22"],"0$1"],[,"(\\d)(\\d{7,8})","$1-$2",["2"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BE:[,[,,"4\\d{8}|[1-9]\\d{7}",,,,,,,[8,9]],[,,"80[2-8]\\d{5}|(?:1[0-69]|[23][2-8]|4[23]|5\\d|6[013-57-9]|71|8[1-79]|9[2-4])\\d{6}",,,,"12345678",,,[8]],[,,"4[5-9]\\d{7}",,,,"470123456",,,[9]],[,,"800[1-9]\\d{4}",,,,"80012345",,,[8]],[,,"(?:70(?:2[0-57]|3[04-7]|44|6[4-69]|7[0579])|90\\d\\d)\\d{4}",,,,"90012345",,,[8]],[,,"7879\\d{4}",
  	,,,"78791234",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BE",32,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3",["(?:80|9)0"],"0$1"],[,"(\\d)(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[239]|4[23]"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[15-8]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["4"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"78(?:0[57]|1[014-8]|2[25]|3[15-8]|48|[56]0|7[06-8]|9\\d)\\d{4}",,,,"78102345",,,[8]],,,[,,,,,,,,,[-1]]],BF:[,[,,"[025-7]\\d{7}",
  	,,,,,,[8]],[,,"2(?:0(?:49|5[23]|6[5-7]|9[016-9])|4(?:4[569]|5[4-6]|6[5-7]|7[0179])|5(?:[34]\\d|50|6[5-7]))\\d{4}",,,,"20491234"],[,,"(?:0[1-35-7]|5[0-8]|[67]\\d)\\d{6}",,,,"70123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BF",226,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[025-7]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BG:[,[,,"00800\\d{7}|[2-7]\\d{6,7}|[89]\\d{6,8}|2\\d{5}",,,,,,,[6,7,8,9,12],[4,5]],
  	[,,"2\\d{5,7}|(?:43[1-6]|70[1-9])\\d{4,5}|(?:[36]\\d|4[124-7]|[57][1-9]|8[1-6]|9[1-7])\\d{5,6}",,,,"2123456",,,[6,7,8],[4,5]],[,,"(?:43[07-9]|99[69]\\d)\\d{5}|(?:8[7-9]|98)\\d{7}",,,,"43012345",,,[8,9]],[,,"(?:00800\\d\\d|800)\\d{5}",,,,"80012345",,,[8,12]],[,,"90\\d{6}",,,,"90123456",,,[8]],[,,"700\\d{5}",,,,"70012345",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BG",359,"00","0",,,"0",,,,[[,"(\\d{6})","$1",["1"]],[,"(\\d)(\\d)(\\d{2})(\\d{2})","$1 $2 $3 $4",["2"],"0$1"],[,"(\\d{3})(\\d{4})","$1 $2",
  	["43[1-6]|70[1-9]"],"0$1"],[,"(\\d)(\\d{3})(\\d{3,4})","$1 $2 $3",["2"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2,3})","$1 $2 $3",["[356]|4[124-7]|7[1-9]|8[1-6]|9[1-7]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3",["(?:70|8)0"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{2})","$1 $2 $3",["43[1-7]|7"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[48]|9[08]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["9"],"0$1"]],[[,"(\\d)(\\d)(\\d{2})(\\d{2})","$1 $2 $3 $4",["2"],"0$1"],[,"(\\d{3})(\\d{4})","$1 $2",["43[1-6]|70[1-9]"],
  	"0$1"],[,"(\\d)(\\d{3})(\\d{3,4})","$1 $2 $3",["2"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2,3})","$1 $2 $3",["[356]|4[124-7]|7[1-9]|8[1-6]|9[1-7]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3",["(?:70|8)0"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{2})","$1 $2 $3",["43[1-7]|7"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[48]|9[08]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["9"],"0$1"]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BH:[,[,,"[136-9]\\d{7}",,,,,,,[8]],[,,"(?:1(?:3[1356]|6[0156]|7\\d)\\d|6(?:1[16]\\d|500|6(?:0\\d|3[12]|44|7[7-9]|88)|9[69][69])|7(?:[07]\\d\\d|1(?:11|78)))\\d{4}",
  	,,,"17001234"],[,,"(?:3(?:[0-79]\\d|8[0-57-9])\\d|6(?:3(?:00|33|6[16])|441|6(?:3[03-9]|[69]\\d|7[0-6])))\\d{4}",,,,"36001234"],[,,"8[02369]\\d{6}",,,,"80123456"],[,,"(?:87|9[0-8])\\d{6}",,,,"90123456"],[,,"84\\d{6}",,,,"84123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BH",973,"00",,,,,,,,[[,"(\\d{4})(\\d{4})","$1 $2",["[13679]|8[02-4679]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BI:[,[,,"(?:[267]\\d|31)\\d{6}",,,,,,,[8]],[,,"(?:22|31)\\d{6}",,,,"22201234"],[,,"(?:29|[67][125-9])\\d{6}",
  	,,,"79561234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BI",257,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[2367]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BJ:[,[,,"[24-689]\\d{7}",,,,,,,[8]],[,,"2(?:02|1[037]|2[45]|3[68]|4\\d)\\d{5}",,,,"20211234"],[,,"(?:4[0-356]|[56]\\d|9[013-9])\\d{6}",,,,"90011234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"857[58]\\d{4}",,,,"85751234"],"BJ",
  	229,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[24-689]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"81\\d{6}",,,,"81123456"],,,[,,,,,,,,,[-1]]],BL:[,[,,"590\\d{6}|(?:69|80|9\\d)\\d{7}",,,,,,,[9]],[,,"590(?:2[7-9]|3[3-7]|5[12]|87)\\d{4}",,,,"590271234"],[,,"69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))\\d{4}",,,,"690001234"],[,,"80[0-5]\\d{6}",,,,"800012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"9(?:(?:395|76[018])\\d|475[0-5])\\d{4}",,,,"976012345"],"BL",590,"00","0",,,"0",
  	,,,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BM:[,[,,"(?:441|[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"441(?:[46]\\d\\d|5(?:4\\d|60|89))\\d{4}",,,,"4414123456",,,,[7]],[,,"441(?:[2378]\\d|5[0-39]|92)\\d{5}",,,,"4413701234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,,,,,,,,[-1]],"BM",1,"011","1",,,"([2-9]\\d{6})$|1","441$1",,,,,[,,,,,,,,,[-1]],,"441",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BN:[,[,,"[2-578]\\d{6}",,,,,,,[7]],[,,"22[0-7]\\d{4}|(?:2[013-9]|[34]\\d|5[0-25-9])\\d{5}",,,,"2345678"],[,,"(?:22[89]|[78]\\d\\d)\\d{4}",,,,"7123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"5[34]\\d{5}",,,,"5345678"],"BN",673,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[2-578]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],
  	[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BO:[,[,,"(?:[2-467]\\d\\d|8001)\\d{5}",,,,,,,[8,9],[7]],[,,"(?:2(?:2\\d\\d|5(?:11|[258]\\d|9[67])|6(?:12|2\\d|9[34])|8(?:2[34]|39|62))|3(?:3\\d\\d|4(?:6\\d|8[24])|8(?:25|42|5[257]|86|9[25])|9(?:[27]\\d|3[2-4]|4[248]|5[24]|6[2-6]))|4(?:4\\d\\d|6(?:11|[24689]\\d|72)))\\d{4}",,,,"22123456",,,[8],[7]],[,,"[67]\\d{7}",,,,"71234567",,,[8]],[,,"8001[07]\\d{4}",,,,"800171234",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BO",591,"00(?:1\\d)?","0",
  	,,"0(1\\d)?",,,,[[,"(\\d)(\\d{7})","$1 $2",["[23]|4[46]"],,"0$CC $1"],[,"(\\d{8})","$1",["[67]"],,"0$CC $1"],[,"(\\d{3})(\\d{2})(\\d{4})","$1 $2 $3",["8"],,"0$CC $1"]],,[,,,,,,,,,[-1]],,,[,,"8001[07]\\d{4}",,,,,,,[9]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BQ:[,[,,"(?:[34]1|7\\d)\\d{5}",,,,,,,[7]],[,,"(?:318[023]|41(?:6[023]|70)|7(?:1[578]|2[05]|50)\\d)\\d{3}",,,,"7151234"],[,,"(?:31(?:8[14-8]|9[14578])|416[14-9]|7(?:0[01]|7[07]|8\\d|9[056])\\d)\\d{3}",,,,"3181234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,
  	,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BQ",599,"00",,,,,,,,,,[,,,,,,,,,[-1]],,"[347]",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BR:[,[,,"(?:[1-46-9]\\d\\d|5(?:[0-46-9]\\d|5[0-46-9]))\\d{8}|[1-9]\\d{9}|[3589]\\d{8}|[34]\\d{7}",,,,,,,[8,9,10,11]],[,,"(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-5]\\d{7}",,,,"1123456789",,,[10],[8]],[,,"(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])(?:7|9\\d)\\d{7}",,,,"11961234567",,,[10,11],[8,9]],[,,"800\\d{6,7}",,,,"800123456",,,
  	[9,10]],[,,"300\\d{6}|[59]00\\d{6,7}",,,,"300123456",,,[9,10]],[,,"(?:30[03]\\d{3}|4(?:0(?:0\\d|20)|370))\\d{4}|300\\d{5}",,,,"40041234",,,[8,10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BR",55,"00(?:1[245]|2[1-35]|31|4[13]|[56]5|99)","0",,,"(?:0|90)(?:(1[245]|2[1-35]|31|4[13]|[56]5|99)(\\d{10,11}))?","$2",,,[[,"(\\d{3,6})","$1",["1(?:1[25-8]|2[357-9]|3[02-68]|4[12568]|5|6[0-8]|8[015]|9[0-47-9])|321|610"]],[,"(\\d{4})(\\d{4})","$1-$2",["300|4(?:0[02]|37)","4(?:02|37)0|[34]00"]],[,"(\\d{4})(\\d{4})","$1-$2",
  	["[2-57]","[2357]|4(?:[0-24-9]|3(?:[0-689]|7[1-9]))"]],[,"(\\d{3})(\\d{2,3})(\\d{4})","$1 $2 $3",["(?:[358]|90)0"],"0$1"],[,"(\\d{5})(\\d{4})","$1-$2",["9"]],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2-$3",["(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-57]"],"($1)","0 $CC ($1)"],[,"(\\d{2})(\\d{5})(\\d{4})","$1 $2-$3",["[16][1-9]|[2-57-9]"],"($1)","0 $CC ($1)"]],[[,"(\\d{4})(\\d{4})","$1-$2",["300|4(?:0[02]|37)","4(?:02|37)0|[34]00"]],[,"(\\d{3})(\\d{2,3})(\\d{4})","$1 $2 $3",["(?:[358]|90)0"],
  	"0$1"],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2-$3",["(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-57]"],"($1)","0 $CC ($1)"],[,"(\\d{2})(\\d{5})(\\d{4})","$1 $2-$3",["[16][1-9]|[2-57-9]"],"($1)","0 $CC ($1)"]],[,,,,,,,,,[-1]],,,[,,"30(?:0\\d{5,7}|3\\d{7})|40(?:0\\d|20)\\d{4}|800\\d{6,7}",,,,,,,[8,9,10]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BS:[,[,,"(?:242|[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"242(?:3(?:02|[236][1-9]|4[0-24-9]|5[0-68]|7[347]|8[0-4]|9[2-467])|461|502|6(?:0[1-5]|12|2[013]|[45]0|7[67]|8[78]|9[89])|7(?:02|88))\\d{4}",
  	,,,"2423456789",,,,[7]],[,,"242(?:3(?:5[79]|7[56]|95)|4(?:[23][1-9]|4[1-35-9]|5[1-8]|6[2-8]|7\\d|81)|5(?:2[45]|3[35]|44|5[1-46-9]|65|77)|6[34]6|7(?:27|38)|8(?:0[1-9]|1[02-9]|2\\d|[89]9))\\d{4}",,,,"2423591234",,,,[7]],[,,"242300\\d{4}|8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456",,,,[7]],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,,,,,,,,[-1]],"BS",1,"011","1",,,"([3-8]\\d{6})$|1","242$1",,,,,[,,,,,,,,,[-1]],,"242",[,,,,,,,,,[-1]],[,,"242225\\d{4}",,,,"2422250123"],,,[,,,,,,,,,[-1]]],BT:[,[,,"[17]\\d{7}|[2-8]\\d{6}",,,,,,,[7,8],[6]],[,,"(?:2[3-6]|[34][5-7]|5[236]|6[2-46]|7[246]|8[2-4])\\d{5}",,,,"2345678",,,[7],[6]],[,,"(?:1[67]|77)\\d{6}",,,,"17123456",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BT",975,"00",,,,,,,,[[,"(\\d{3})(\\d{3})","$1 $2",["[2-7]"]],[,"(\\d)(\\d{3})(\\d{3})",
  	"$1 $2 $3",["[2-68]|7[246]"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["1[67]|7"]]],[[,"(\\d)(\\d{3})(\\d{3})","$1 $2 $3",["[2-68]|7[246]"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["1[67]|7"]]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BW:[,[,,"(?:0800|(?:[37]|800)\\d)\\d{6}|(?:[2-6]\\d|90)\\d{5}",,,,,,,[7,8,10]],[,,"(?:2(?:4[0-48]|6[0-24]|9[0578])|3(?:1[0-35-9]|55|[69]\\d|7[013]|81)|4(?:6[03]|7[1267]|9[0-5])|5(?:3[03489]|4[0489]|7[1-47]|88|9[0-49])|6(?:2[1-35]|5[149]|8[067]))\\d{4}",
  	,,,"2401234",,,[7]],[,,"(?:321|7(?:[1-7]\\d|8[0-4]))\\d{5}",,,,"71123456",,,[8]],[,,"(?:0800|800\\d)\\d{6}",,,,"0800012345",,,[10]],[,,"90\\d{5}",,,,"9012345",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"79(?:1(?:[01]\\d|2[0-7])|2[0-7]\\d)\\d{3}",,,,"79101234",,,[8]],"BW",267,"00",,,,,,,,[[,"(\\d{2})(\\d{5})","$1 $2",["90"]],[,"(\\d{3})(\\d{4})","$1 $2",["[24-6]|3[15-9]"]],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["[37]"]],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["0"]],[,"(\\d{3})(\\d{4})(\\d{3})","$1 $2 $3",
  	["8"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BY:[,[,,"(?:[12]\\d|33|44|902)\\d{7}|8(?:0[0-79]\\d{5,7}|[1-7]\\d{9})|8(?:1[0-489]|[5-79]\\d)\\d{7}|8[1-79]\\d{6,7}|8[0-79]\\d{5}|8\\d{5}",,,,,,,[6,7,8,9,10,11],[5]],[,,"(?:1(?:5(?:1[1-5]|[24]\\d|6[2-4]|9[1-7])|6(?:[235]\\d|4[1-7])|7\\d\\d)|2(?:1(?:[246]\\d|3[0-35-9]|5[1-9])|2(?:[235]\\d|4[0-8])|3(?:[26]\\d|3[02-79]|4[024-7]|5[03-7])))\\d{5}",,,,"152450911",,,[9],[5,6,7]],[,,"(?:2(?:5[5-79]|9[1-9])|(?:33|44)\\d)\\d{6}",
  	,,,"294911911",,,[9]],[,,"800\\d{3,7}|8(?:0[13]|20\\d)\\d{7}",,,,"8011234567"],[,,"(?:810|902)\\d{7}",,,,"9021234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"249\\d{6}",,,,"249123456",,,[9]],"BY",375,"810","8",,,"0|80?",,"8~10",,[[,"(\\d{3})(\\d{3})","$1 $2",["800"],"8 $1"],[,"(\\d{3})(\\d{2})(\\d{2,4})","$1 $2 $3",["800"],"8 $1"],[,"(\\d{4})(\\d{2})(\\d{3})","$1 $2-$3",["1(?:5[169]|6[3-5]|7[179])|2(?:1[35]|2[34]|3[3-5])","1(?:5[169]|6(?:3[1-3]|4|5[125])|7(?:1[3-9]|7[0-24-6]|9[2-7]))|2(?:1[35]|2[34]|3[3-5])"],
  	"8 0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2-$3-$4",["1(?:[56]|7[467])|2[1-3]"],"8 0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2-$3-$4",["[1-4]"],"8 0$1"],[,"(\\d{3})(\\d{3,4})(\\d{4})","$1 $2 $3",["[89]"],"8 $1"]],,[,,,,,,,,,[-1]],,,[,,"800\\d{3,7}|(?:8(?:0[13]|10|20\\d)|902)\\d{7}"],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],BZ:[,[,,"(?:0800\\d|[2-8])\\d{6}",,,,,,,[7,11]],[,,"(?:2(?:[02]\\d|36|[68]0)|[3-58](?:[02]\\d|[68]0)|7(?:[02]\\d|32|[68]0))\\d{4}",,,,"2221234",,,[7]],[,,"6[0-35-7]\\d{5}",
  	,,,"6221234",,,[7]],[,,"0800\\d{7}",,,,"08001234123",,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"BZ",501,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1-$2",["[2-8]"]],[,"(\\d)(\\d{3})(\\d{4})(\\d{3})","$1-$2-$3-$4",["0"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CA:[,[,,"(?:[2-8]\\d|90)\\d{8}|3\\d{6}",,,,,,,[7,10]],[,,"(?:2(?:04|[23]6|[48]9|50|63)|3(?:06|43|54|6[578]|82)|4(?:03|1[68]|[26]8|3[178]|50|74)|5(?:06|1[49]|48|79|8[147])|6(?:04|[18]3|39|47|72)|7(?:0[59]|42|53|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}",
  	,,,"5062345678",,,[10],[7]],[,,"(?:2(?:04|[23]6|[48]9|50|63)|3(?:06|43|54|6[578]|82)|4(?:03|1[68]|[26]8|3[178]|50|74)|5(?:06|1[49]|48|79|8[147])|6(?:04|[18]3|39|47|72)|7(?:0[59]|42|53|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}",,,,"5062345678",,,[10],[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456",,,[10]],[,,"900[2-9]\\d{6}",,,,"9002123456",,,[10]],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|(?:5(?:00|2[125-9]|33|44|66|77|88)|622)[2-9]\\d{6}",
  	,,,"5002345678",,,[10]],[,,"600[2-9]\\d{6}",,,,"6002012345",,,[10]],"CA",1,"011","1",,,"1",,,1,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"310\\d{4}",,,,"3101234",,,[7]],,,[,,,,,,,,,[-1]]],CC:[,[,,"1(?:[0-79]\\d{8}(?:\\d{2})?|8[0-24-9]\\d{7})|[148]\\d{8}|1\\d{5,7}",,,,,,,[6,7,8,9,10,12]],[,,"8(?:51(?:0(?:02|31|60|89)|1(?:18|76)|223)|91(?:0(?:1[0-2]|29)|1(?:[28]2|50|79)|2(?:10|64)|3(?:[06]8|22)|4[29]8|62\\d|70[23]|959))\\d{3}",,,,"891621234",,,[9],[8]],[,,"4(?:(?:79|94)[01]|83[0-389])\\d{5}|4(?:[0-3]\\d|4[047-9]|5[0-25-9]|6[0-26-9]|7[02-8]|8[0-24-9]|9[0-37-9])\\d{6}",
  	,,,"412345678",,,[9]],[,,"180(?:0\\d{3}|2)\\d{3}",,,,"1800123456",,,[7,10]],[,,"190[0-26]\\d{6}",,,,"1900123456",,,[10]],[,,"13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}",,,,"1300123456",,,[6,8,10,12]],[,,,,,,,,,[-1]],[,,"14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}",,,,"147101234",,,[9]],"CC",61,"001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011","0",,,"([59]\\d{7})$|0","8$1","0011",,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CD:[,[,,"[189]\\d{8}|[1-68]\\d{6}",,,,,,
  	,[7,9]],[,,"12\\d{7}|[1-6]\\d{6}",,,,"1234567"],[,,"88\\d{5}|(?:8[0-59]|9[017-9])\\d{7}",,,,"991234567"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CD",243,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3",["88"],"0$1"],[,"(\\d{2})(\\d{5})","$1 $2",["[1-6]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["1"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[89]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CF:[,[,,
  	"(?:[27]\\d{3}|8776)\\d{4}",,,,,,,[8]],[,,"2[12]\\d{6}",,,,"21612345"],[,,"7[024-7]\\d{6}",,,,"70012345"],[,,,,,,,,,[-1]],[,,"8776\\d{4}",,,,"87761234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CF",236,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[278]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CG:[,[,,"222\\d{6}|(?:0\\d|80)\\d{7}",,,,,,,[9]],[,,"222[1-589]\\d{5}",,,,"222123456"],[,,"026(?:1[0-5]|6[6-9])\\d{4}|0(?:[14-6]\\d\\d|2(?:40|5[5-8]|6[07-9]))\\d{5}",
  	,,,"061234567"],[,,,,,,,,,[-1]],[,,"80[0-2]\\d{6}",,,,"800123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CG",242,"00",,,,,,,,[[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["8"]],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[02]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CH:[,[,,"8\\d{11}|[2-9]\\d{8}",,,,,,,[9,12]],[,,"(?:2[12467]|3[1-4]|4[134]|5[256]|6[12]|[7-9]1)\\d{7}",,,,"212345678",,,[9]],[,,"7[35-9]\\d{7}",,,,"781234567",,,[9]],[,,"800\\d{6}",,,,"800123456",,,[9]],
  	[,,"90[016]\\d{6}",,,,"900123456",,,[9]],[,,"84[0248]\\d{6}",,,,"840123456",,,[9]],[,,"878\\d{6}",,,,"878123456",,,[9]],[,,,,,,,,,[-1]],"CH",41,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["8[047]|90"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[2-79]|81"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5",["8"],"0$1"]],,[,,"74[0248]\\d{6}",,,,"740123456",,,[9]],,,[,,,,,,,,,[-1]],[,,"5[18]\\d{7}",,,,"581234567",,,[9]],,,[,,"860\\d{9}",,,,"860123456789",
  	,,[12]]],CI:[,[,,"[02]\\d{9}",,,,,,,[10]],[,,"2(?:[15]\\d{3}|7(?:2(?:0[23]|1[2357]|2[245]|3[45]|4[3-5])|3(?:06|1[69]|[2-6]7)))\\d{5}",,,,"2123456789"],[,,"0[157]\\d{8}",,,,"0123456789"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CI",225,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d)(\\d{5})","$1 $2 $3 $4",["2"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{4})","$1 $2 $3 $4",["0"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CK:[,[,,"[2-578]\\d{4}",,,,,,
  	,[5]],[,,"(?:2\\d|3[13-7]|4[1-5])\\d{3}",,,,"21234"],[,,"[578]\\d{4}",,,,"71234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CK",682,"00",,,,,,,,[[,"(\\d{2})(\\d{3})","$1 $2",["[2-578]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CL:[,[,,"12300\\d{6}|6\\d{9,10}|[2-9]\\d{8}",,,,,,,[9,10,11]],[,,"2(?:1982[0-6]|3314[05-9])\\d{3}|(?:2(?:1(?:160|962)|3(?:2\\d\\d|3(?:[03467]\\d|1[0-35-9]|2[1-9]|5[0-24-9]|8[0-3])|600)|646[59])|80[1-9]\\d\\d|9(?:3(?:[0-57-9]\\d\\d|6(?:0[02-9]|[1-9]\\d))|6(?:[0-8]\\d\\d|9(?:[02-79]\\d|1[05-9]))|7[1-9]\\d\\d|9(?:[03-9]\\d\\d|1(?:[0235-9]\\d|4[0-24-9])|2(?:[0-79]\\d|8[0-46-9]))))\\d{4}|(?:22|3[2-5]|[47][1-35]|5[1-3578]|6[13-57]|8[1-9]|9[2458])\\d{7}",
  	,,,"221234567",,,[9]],[,,"2(?:1982[0-6]|3314[05-9])\\d{3}|(?:2(?:1(?:160|962)|3(?:2\\d\\d|3(?:[03467]\\d|1[0-35-9]|2[1-9]|5[0-24-9]|8[0-3])|600)|646[59])|80[1-9]\\d\\d|9(?:3(?:[0-57-9]\\d\\d|6(?:0[02-9]|[1-9]\\d))|6(?:[0-8]\\d\\d|9(?:[02-79]\\d|1[05-9]))|7[1-9]\\d\\d|9(?:[03-9]\\d\\d|1(?:[0235-9]\\d|4[0-24-9])|2(?:[0-79]\\d|8[0-46-9]))))\\d{4}|(?:22|3[2-5]|[47][1-35]|5[1-3578]|6[13-57]|8[1-9]|9[2458])\\d{7}",,,,"221234567",,,[9]],[,,"(?:123|8)00\\d{6}",,,,"800123456",,,[9,11]],[,,,,,,,,,[-1]],[,,
  	"600\\d{7,8}",,,,"6001234567",,,[10,11]],[,,,,,,,,,[-1]],[,,"44\\d{7}",,,,"441234567",,,[9]],"CL",56,"(?:0|1(?:1[0-69]|2[02-5]|5[13-58]|69|7[0167]|8[018]))0",,,,,,,1,[[,"(\\d{4})","$1",["1(?:[03-589]|21)|[29]0|78"]],[,"(\\d{5})(\\d{4})","$1 $2",["219","2196"],"($1)"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["44"]],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["2[1-36]"],"($1)"],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["9[2-9]"]],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["3[2-5]|[47]|5[1-3578]|6[13-57]|8(?:0[1-9]|[1-9])"],
  	"($1)"],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["60|8"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["1"]],[,"(\\d{3})(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3 $4",["60"]]],[[,"(\\d{5})(\\d{4})","$1 $2",["219","2196"],"($1)"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["44"]],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["2[1-36]"],"($1)"],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["9[2-9]"]],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["3[2-5]|[47]|5[1-3578]|6[13-57]|8(?:0[1-9]|[1-9])"],"($1)"],[,"(\\d{3})(\\d{3})(\\d{3,4})",
  	"$1 $2 $3",["60|8"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["1"]],[,"(\\d{3})(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3 $4",["60"]]],[,,,,,,,,,[-1]],,,[,,"600\\d{7,8}",,,,,,,[10,11]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CM:[,[,,"[26]\\d{8}|88\\d{6,7}",,,,,,,[8,9]],[,,"2(?:22|33)\\d{6}",,,,"222123456",,,[9]],[,,"(?:24[23]|6[25-9]\\d)\\d{6}",,,,"671234567",,,[9]],[,,"88\\d{6,7}",,,,"88012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CM",237,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
  	"$1 $2 $3 $4",["88"]],[,"(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5",["[26]|88"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CN:[,[,,"1[127]\\d{8,9}|2\\d{9}(?:\\d{2})?|[12]\\d{6,7}|86\\d{6}|(?:1[03-689]\\d|6)\\d{7,9}|(?:[3-579]\\d|8[0-57-9])\\d{6,9}",,,,,,,[7,8,9,10,11,12],[5,6]],[,,"(?:10(?:[02-79]\\d\\d|[18](?:0[1-9]|[1-9]\\d))|21(?:[18](?:0[1-9]|[1-9]\\d)|[2-79]\\d\\d))\\d{5}|(?:43[35]|754)\\d{7,8}|8(?:078\\d{7}|51\\d{7,8})|(?:10|(?:2|85)1|43[35]|754)(?:100\\d\\d|95\\d{3,4})|(?:2[02-57-9]|3(?:11|7[179])|4(?:[15]1|3[12])|5(?:1\\d|2[37]|3[12]|51|7[13-79]|9[15])|7(?:[39]1|5[57]|6[09])|8(?:71|98))(?:[02-8]\\d{7}|1(?:0(?:0\\d\\d(?:\\d{3})?|[1-9]\\d{5})|[1-9]\\d{6})|9(?:[0-46-9]\\d{6}|5\\d{3}(?:\\d(?:\\d{2})?)?))|(?:3(?:1[02-9]|35|49|5\\d|7[02-68]|9[1-68])|4(?:1[02-9]|2[179]|3[46-9]|5[2-9]|6[47-9]|7\\d|8[23])|5(?:3[03-9]|4[36]|5[02-9]|6[1-46]|7[028]|80|9[2-46-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[17]\\d|2[248]|3[04-9]|4[3-6]|5[0-3689]|6[2368]|9[02-9])|8(?:1[236-8]|2[5-7]|3\\d|5[2-9]|7[02-9]|8[36-8]|9[1-7])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:[02-8]\\d{6}|1(?:0(?:0\\d\\d(?:\\d{2})?|[1-9]\\d{4})|[1-9]\\d{5})|9(?:[0-46-9]\\d{5}|5\\d{3,5}))",
  	,,,"1012345678",,,[7,8,9,10,11],[5,6]],[,,"1740[0-5]\\d{6}|1(?:[38]\\d|4[57]|[59][0-35-9]|6[25-7]|7[0-35-8])\\d{8}",,,,"13123456789",,,[11]],[,,"(?:(?:10|21)8|8)00\\d{7}",,,,"8001234567",,,[10,12]],[,,"16[08]\\d{5}",,,,"16812345",,,[8]],[,,"10(?:10\\d{4}|96\\d{3,4})|400\\d{7}|950\\d{7,8}|(?:2[0-57-9]|3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))96\\d{3,4}",
  	,,,"4001234567",,,[7,8,9,10,11],[5,6]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CN",86,"00|1(?:[12]\\d|79)\\d\\d00","0",,,"(1(?:[12]\\d|79)\\d\\d)|0",,"00",,[[,"(\\d{5,6})","$1",["10|96"]],[,"(\\d{2})(\\d{5,6})","$1 $2",["(?:10|2[0-57-9])[19]","(?:10|2[0-57-9])(?:10|9[56])","10(?:10|9[56])|2[0-57-9](?:100|9[56])"],"0$1","$CC $1"],[,"(\\d{3})(\\d{4})","$1 $2",["[1-9]","1[1-9]|26|[3-9]|(?:10|2[0-57-9])(?:[0-8]|9[0-47-9])","1(?:0(?:[0-8]|9[0-47-9])|[1-9])|2(?:[0-57-9](?:[02-8]|1(?:0[1-9]|[1-9])|9[0-47-9])|6)|[3-9]"]],
  	[,"(\\d{4})(\\d{4})","$1 $2",["16[08]"]],[,"(\\d{3})(\\d{5,6})","$1 $2",["3(?:[157]|35|49|9[1-68])|4(?:[17]|2[179]|6[47-9]|8[23])|5(?:[1357]|2[37]|4[36]|6[1-46]|80)|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]|4[13]|5[1-5])|(?:4[35]|59|85)[1-9]","(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))[19]",
  	"85[23](?:10|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:10|9[56])","85[23](?:100|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:100|9[56])"],
  	"0$1","$CC $1"],[,"(\\d{4})(\\d{4})","$1 $2",["[1-9]","1(?:0(?:[02-8]|1[1-9]|9[0-47-9])|[1-9])|2(?:[0-57-9](?:[0-8]|9[0-47-9])|6)|[3-9]","1(?:0(?:[02-8]|1[1-9]|9[0-47-9])|[1-9])|26|3(?:[0268]|4[0-8]|9[079])|4(?:[049]|2[02-68]|[35]0|6[0-356]|8[014-9])|5(?:0|2[0-24-689]|4[0-2457-9]|6[057-9]|8[1-9]|90)|6(?:[0-24578]|3[06-9]|6[14-79]|9[03-9])|7(?:0[02-9]|2[0135-79]|3[23]|4[0-27-9]|6[1457]|8)|8(?:[046]|1[01459]|2[0-489]|5(?:0|[23][0-8])|8[0-2459]|9[09])|9(?:0[0457]|1[08]|[268]|4[024-9]|5[06-9])|(?:33|85[23]9)[0-46-9]|(?:2[0-57-9]|3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:[0-8]|9[0-47-9])",
  	"1(?:0[02-8]|[1-9])|2(?:[0-57-9][0-8]|6)|3(?:[0268]|3[0-46-9]|4[0-8]|9[079])|4(?:[049]|2[02-68]|[35]0|6[0-356]|8[014-9])|5(?:0|2[0-24-689]|4[0-2457-9]|6[057-9]|90)|6(?:[0-24578]|3[06-9]|6[14-79]|9[03-9])|7(?:0[02-9]|2[0135-79]|3[23]|4[0-27-9]|6[1457]|8)|8(?:[046]|1[01459]|2[0-489]|5(?:0|[23](?:[02-8]|1[1-9]|9[0-46-9]))|8[0-2459]|9[09])|9(?:0[0457]|1[08]|[268]|4[024-9]|5[06-9])|(?:10|2[0-57-9])9[0-47-9]|(?:101|58|85[23]10)[1-9]|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:[02-8]|1(?:0[1-9]|[1-9])|9[0-47-9])"]],
  	[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["(?:4|80)0"]],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["10|2(?:[02-57-9]|1[1-9])","10|2(?:[02-57-9]|1[1-9])","10[0-79]|2(?:[02-57-9]|1[1-79])|(?:10|21)8(?:0[1-9]|[1-9])"],"0$1","$CC $1",1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["3(?:[3-59]|7[02-68])|4(?:[26-8]|3[3-9]|5[2-9])|5(?:3[03-9]|[468]|7[028]|9[2-46-9])|6|7(?:[0-247]|3[04-9]|5[0-4689]|6[2368])|8(?:[1-358]|9[1-7])|9(?:[013479]|5[1-5])|(?:[34]1|55|79|87)[02-9]"],"0$1","$CC $1",1],[,"(\\d{3})(\\d{7,8})",
  	"$1 $2",["9"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["80"],"0$1","$CC $1",1],[,"(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3",["[3-578]"],"0$1","$CC $1",1],[,"(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3",["1[3-9]"],,"$CC $1"],[,"(\\d{2})(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3 $4",["[12]"],"0$1",,1]],[[,"(\\d{2})(\\d{5,6})","$1 $2",["(?:10|2[0-57-9])[19]","(?:10|2[0-57-9])(?:10|9[56])","10(?:10|9[56])|2[0-57-9](?:100|9[56])"],"0$1","$CC $1"],[,"(\\d{3})(\\d{5,6})","$1 $2",["3(?:[157]|35|49|9[1-68])|4(?:[17]|2[179]|6[47-9]|8[23])|5(?:[1357]|2[37]|4[36]|6[1-46]|80)|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]|4[13]|5[1-5])|(?:4[35]|59|85)[1-9]",
  	"(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))[19]","85[23](?:10|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:10|9[56])",
  	"85[23](?:100|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:100|9[56])"],"0$1","$CC $1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["(?:4|80)0"]],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["10|2(?:[02-57-9]|1[1-9])","10|2(?:[02-57-9]|1[1-9])","10[0-79]|2(?:[02-57-9]|1[1-79])|(?:10|21)8(?:0[1-9]|[1-9])"],
  	"0$1","$CC $1",1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["3(?:[3-59]|7[02-68])|4(?:[26-8]|3[3-9]|5[2-9])|5(?:3[03-9]|[468]|7[028]|9[2-46-9])|6|7(?:[0-247]|3[04-9]|5[0-4689]|6[2368])|8(?:[1-358]|9[1-7])|9(?:[013479]|5[1-5])|(?:[34]1|55|79|87)[02-9]"],"0$1","$CC $1",1],[,"(\\d{3})(\\d{7,8})","$1 $2",["9"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["80"],"0$1","$CC $1",1],[,"(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3",["[3-578]"],"0$1","$CC $1",1],[,"(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3",["1[3-9]"],,"$CC $1"],
  	[,"(\\d{2})(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3 $4",["[12]"],"0$1",,1]],[,,,,,,,,,[-1]],,,[,,"(?:(?:10|21)8|[48])00\\d{7}|950\\d{7,8}",,,,,,,[10,11,12]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CO:[,[,,"(?:60\\d\\d|9101)\\d{6}|(?:1\\d|3)\\d{9}",,,,,,,[10,11],[7]],[,,"601055(?:[0-4]\\d|50)\\d\\d|6010(?:[0-4]\\d|5[0-4])\\d{4}|60[124-8][2-9]\\d{6}",,,,"6012345678",,,[10],[7]],[,,"3333(?:0(?:0\\d|1[0-5])|[4-9]\\d\\d)\\d{3}|(?:3(?:24[1-9]|3(?:00|3[0-24-9]))|9101)\\d{6}|3(?:0[0-5]|1\\d|2[0-3]|5[01]|70)\\d{7}",
  	,,,"3211234567",,,[10]],[,,"1800\\d{7}",,,,"18001234567",,,[11]],[,,"19(?:0[01]|4[78])\\d{7}",,,,"19001234567",,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CO",57,"00(?:4(?:[14]4|56)|[579])","0",,,"0(4(?:[14]4|56)|[579])?",,,,[[,"(\\d{3})(\\d{7})","$1 $2",["6"],"($1)","0$CC $1"],[,"(\\d{3})(\\d{7})","$1 $2",["3[0-357]|91"],,"0$CC $1"],[,"(\\d)(\\d{3})(\\d{7})","$1-$2-$3",["1"],"0$1"]],[[,"(\\d{3})(\\d{7})","$1 $2",["6"],"($1)","0$CC $1"],[,"(\\d{3})(\\d{7})","$1 $2",["3[0-357]|91"],,"0$CC $1"],
  	[,"(\\d)(\\d{3})(\\d{7})","$1 $2 $3",["1"]]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CR:[,[,,"(?:8\\d|90)\\d{8}|(?:[24-8]\\d{3}|3005)\\d{4}",,,,,,,[8,10]],[,,"210[7-9]\\d{4}|2(?:[024-7]\\d|1[1-9])\\d{5}",,,,"22123456",,,[8]],[,,"(?:3005\\d|6500[01])\\d{3}|(?:5[07]|6[0-4]|7[0-3]|8[3-9])\\d{6}",,,,"83123456",,,[8]],[,,"800\\d{7}",,,,"8001234567",,,[10]],[,,"90[059]\\d{7}",,,,"9001234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:210[0-6]|4\\d{3}|5100)\\d{4}",,,,"40001234",
  	,,[8]],"CR",506,"00",,,,"(19(?:0[0-2468]|1[09]|20|66|77|99))",,,,[[,"(\\d{4})(\\d{4})","$1 $2",["[2-7]|8[3-9]"],,"$CC $1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["[89]"],,"$CC $1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CU:[,[,,"[27]\\d{6,7}|[34]\\d{5,7}|63\\d{6}|(?:5|8\\d\\d)\\d{7}",,,,,,,[6,7,8,10],[4,5]],[,,"(?:3[23]|4[89])\\d{4,6}|(?:31|4[36]|8(?:0[25]|78)\\d)\\d{6}|(?:2[1-4]|4[1257]|7\\d)\\d{5,6}",,,,"71234567",,,,[4,5]],[,,"(?:5\\d|63)\\d{6}",,,,"51234567",
  	,,[8]],[,,"800\\d{7}",,,,"8001234567",,,[10]],[,,,,,,,,,[-1]],[,,"807\\d{7}",,,,"8071234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CU",53,"119","0",,,"0",,,,[[,"(\\d{2})(\\d{4,6})","$1 $2",["2[1-4]|[34]"],"(0$1)"],[,"(\\d)(\\d{6,7})","$1 $2",["7"],"(0$1)"],[,"(\\d)(\\d{7})","$1 $2",["[56]"],"0$1"],[,"(\\d{3})(\\d{7})","$1 $2",["8"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CV:[,[,,"(?:[2-59]\\d\\d|800)\\d{4}",,,,,,,[7]],[,,"2(?:2[1-7]|3[0-8]|4[12]|5[1256]|6\\d|7[1-3]|8[1-5])\\d{4}",
  	,,,"2211234"],[,,"(?:36|5[1-389]|9\\d)\\d{5}",,,,"9911234"],[,,"800\\d{4}",,,,"8001234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:3[3-5]|4[356])\\d{5}",,,,"3401234"],"CV",238,"0",,,,,,,,[[,"(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3",["[2-589]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CW:[,[,,"(?:[34]1|60|(?:7|9\\d)\\d)\\d{5}",,,,,,,[7,8]],[,,"9(?:4(?:3[0-5]|4[14]|6\\d)|50\\d|7(?:2[014]|3[02-9]|4[4-9]|6[357]|77|8[7-9])|8(?:3[39]|[46]\\d|7[01]|8[57-9]))\\d{4}",
  	,,,"94351234"],[,,"953[01]\\d{4}|9(?:5[12467]|6[5-9])\\d{5}",,,,"95181234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"60[0-2]\\d{4}",,,,"6001234",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"CW",599,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[3467]"]],[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["9[4-8]"]]],,[,,"955\\d{5}",,,,"95581234",,,[8]],1,"[69]",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CX:[,[,,"1(?:[0-79]\\d{8}(?:\\d{2})?|8[0-24-9]\\d{7})|[148]\\d{8}|1\\d{5,7}",,,,,,,[6,7,8,9,10,12]],[,,"8(?:51(?:0(?:01|30|59|88)|1(?:17|46|75)|2(?:22|35))|91(?:00[6-9]|1(?:[28]1|49|78)|2(?:09|63)|3(?:12|26|75)|4(?:56|97)|64\\d|7(?:0[01]|1[0-2])|958))\\d{3}",
  	,,,"891641234",,,[9],[8]],[,,"4(?:(?:79|94)[01]|83[0-389])\\d{5}|4(?:[0-3]\\d|4[047-9]|5[0-25-9]|6[0-26-9]|7[02-8]|8[0-24-9]|9[0-37-9])\\d{6}",,,,"412345678",,,[9]],[,,"180(?:0\\d{3}|2)\\d{3}",,,,"1800123456",,,[7,10]],[,,"190[0-26]\\d{6}",,,,"1900123456",,,[10]],[,,"13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}",,,,"1300123456",,,[6,8,10,12]],[,,,,,,,,,[-1]],[,,"14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}",,,,"147101234",,,[9]],"CX",61,"001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011","0",,,
  	"([59]\\d{7})$|0","8$1","0011",,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],CY:[,[,,"(?:[279]\\d|[58]0)\\d{6}",,,,,,,[8]],[,,"2[2-6]\\d{6}",,,,"22345678"],[,,"9(?:10|[4-79]\\d)\\d{5}",,,,"96123456"],[,,"800\\d{5}",,,,"80001234"],[,,"90[09]\\d{5}",,,,"90012345"],[,,"80[1-9]\\d{5}",,,,"80112345"],[,,"700\\d{5}",,,,"70012345"],[,,,,,,,,,[-1]],"CY",357,"00",,,,,,,,[[,"(\\d{2})(\\d{6})","$1 $2",["[257-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"(?:50|77)\\d{6}",,,,"77123456"],
  	,,[,,,,,,,,,[-1]]],CZ:[,[,,"(?:[2-578]\\d|60)\\d{7}|9\\d{8,11}",,,,,,,[9,10,11,12]],[,,"(?:2\\d|3[1257-9]|4[16-9]|5[13-9])\\d{7}",,,,"212345678",,,[9]],[,,"(?:60[1-8]|7(?:0[2-5]|[2379]\\d))\\d{6}",,,,"601123456",,,[9]],[,,"800\\d{6}",,,,"800123456",,,[9]],[,,"9(?:0[05689]|76)\\d{6}",,,,"900123456",,,[9]],[,,"8[134]\\d{7}",,,,"811234567",,,[9]],[,,"70[01]\\d{6}",,,,"700123456",,,[9]],[,,"9[17]0\\d{6}",,,,"910123456",,,[9]],"CZ",420,"00",,,,,,,,[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[2-8]|9[015-7]"]],
  	[,"(\\d{2})(\\d{3})(\\d{3})(\\d{2})","$1 $2 $3 $4",["96"]],[,"(\\d{2})(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",["9"]],[,"(\\d{3})(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",["9"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"9(?:5\\d|7[2-4])\\d{6}",,,,"972123456",,,[9]],,,[,,"9(?:3\\d{9}|6\\d{7,10})",,,,"93123456789"]],DE:[,[,,"[2579]\\d{5,14}|49(?:[34]0|69|8\\d)\\d\\d?|49(?:37|49|60|7[089]|9\\d)\\d{1,3}|49(?:2[024-9]|3[2-689]|7[1-7])\\d{1,8}|(?:1|[368]\\d|4[0-8])\\d{3,13}|49(?:[015]\\d|2[13]|31|[46][1-8])\\d{1,9}",
  	,,,,,,[4,5,6,7,8,9,10,11,12,13,14,15],[2,3]],[,,"32\\d{9,11}|49[1-6]\\d{10}|322\\d{6}|49[0-7]\\d{3,9}|(?:[34]0|[68]9)\\d{3,13}|(?:2(?:0[1-689]|[1-3569]\\d|4[0-8]|7[1-7]|8[0-7])|3(?:[3569]\\d|4[0-79]|7[1-7]|8[1-8])|4(?:1[02-9]|[2-48]\\d|5[0-6]|6[0-8]|7[0-79])|5(?:0[2-8]|[124-6]\\d|[38][0-8]|[79][0-7])|6(?:0[02-9]|[1-358]\\d|[47][0-8]|6[1-9])|7(?:0[2-8]|1[1-9]|[27][0-7]|3\\d|[4-6][0-8]|8[0-5]|9[013-7])|8(?:0[2-9]|1[0-79]|2\\d|3[0-46-9]|4[0-6]|5[013-9]|6[1-8]|7[0-8]|8[0-24-6])|9(?:0[6-9]|[1-4]\\d|[589][0-7]|6[0-8]|7[0-467]))\\d{3,12}",
  	,,,"30123456",,,[5,6,7,8,9,10,11,12,13,14,15],[2,3,4]],[,,"15[0-25-9]\\d{8}|1(?:6[023]|7\\d)\\d{7,8}",,,,"15123456789",,,[10,11]],[,,"800\\d{7,12}",,,,"8001234567890",,,[10,11,12,13,14,15]],[,,"(?:137[7-9]|900(?:[135]|9\\d))\\d{6}",,,,"9001234567",,,[10,11]],[,,"180\\d{5,11}|13(?:7[1-6]\\d\\d|8)\\d{4}",,,,"18012345",,,[7,8,9,10,11,12,13,14]],[,,"700\\d{8}",,,,"70012345678",,,[11]],[,,,,,,,,,[-1]],"DE",49,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3,13})","$1 $2",["3[02]|40|[68]9"],"0$1"],[,"(\\d{3})(\\d{3,12})",
  	"$1 $2",["2(?:0[1-389]|1[124]|2[18]|3[14])|3(?:[35-9][15]|4[015])|906|(?:2[4-9]|4[2-9]|[579][1-9]|[68][1-8])1","2(?:0[1-389]|12[0-8])|3(?:[35-9][15]|4[015])|906|2(?:[13][14]|2[18])|(?:2[4-9]|4[2-9]|[579][1-9]|[68][1-8])1"],"0$1"],[,"(\\d{4})(\\d{2,11})","$1 $2",["[24-6]|3(?:[3569][02-46-9]|4[2-4679]|7[2-467]|8[2-46-8])|70[2-8]|8(?:0[2-9]|[1-8])|90[7-9]|[79][1-9]","[24-6]|3(?:3(?:0[1-467]|2[127-9]|3[124578]|7[1257-9]|8[1256]|9[145])|4(?:2[135]|4[13578]|9[1346])|5(?:0[14]|2[1-3589]|6[1-4]|7[13468]|8[13568])|6(?:2[1-489]|3[124-6]|6[13]|7[12579]|8[1-356]|9[135])|7(?:2[1-7]|4[145]|6[1-5]|7[1-4])|8(?:21|3[1468]|6|7[1467]|8[136])|9(?:0[12479]|2[1358]|4[134679]|6[1-9]|7[136]|8[147]|9[1468]))|70[2-8]|8(?:0[2-9]|[1-8])|90[7-9]|[79][1-9]|3[68]4[1347]|3(?:47|60)[1356]|3(?:3[46]|46|5[49])[1246]|3[4579]3[1357]"],
  	"0$1"],[,"(\\d{3})(\\d{4})","$1 $2",["138"],"0$1"],[,"(\\d{5})(\\d{2,10})","$1 $2",["3"],"0$1"],[,"(\\d{3})(\\d{5,11})","$1 $2",["181"],"0$1"],[,"(\\d{3})(\\d)(\\d{4,10})","$1 $2 $3",["1(?:3|80)|9"],"0$1"],[,"(\\d{3})(\\d{7,8})","$1 $2",["1[67]"],"0$1"],[,"(\\d{3})(\\d{7,12})","$1 $2",["8"],"0$1"],[,"(\\d{5})(\\d{6})","$1 $2",["185","1850","18500"],"0$1"],[,"(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3",["7"],"0$1"],[,"(\\d{4})(\\d{7})","$1 $2",["18[68]"],"0$1"],[,"(\\d{5})(\\d{6})","$1 $2",["15[0568]"],"0$1"],
  	[,"(\\d{4})(\\d{7})","$1 $2",["15[1279]"],"0$1"],[,"(\\d{3})(\\d{8})","$1 $2",["18"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{7,8})","$1 $2 $3",["1(?:6[023]|7)"],"0$1"],[,"(\\d{4})(\\d{2})(\\d{7})","$1 $2 $3",["15[279]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{8})","$1 $2 $3",["15"],"0$1"]],,[,,"16(?:4\\d{1,10}|[89]\\d{1,11})",,,,"16412345",,,[4,5,6,7,8,9,10,11,12,13,14]],,,[,,,,,,,,,[-1]],[,,"18(?:1\\d{5,11}|[2-9]\\d{8})",,,,"18500123456",,,[8,9,10,11,12,13,14]],,,[,,"1(?:6(?:013|255|399)|7(?:(?:[015]1|[69]3)3|[2-4]55|[78]99))\\d{7,8}|15(?:(?:[03-68]00|113)\\d|2\\d55|7\\d99|9\\d33)\\d{7}",
  	,,,"177991234567",,,[12,13]]],DJ:[,[,,"(?:2\\d|77)\\d{6}",,,,,,,[8]],[,,"2(?:1[2-5]|7[45])\\d{5}",,,,"21360003"],[,,"77\\d{6}",,,,"77831001"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"DJ",253,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[27]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],DK:[,[,,"[2-9]\\d{7}",,,,,,,[8]],[,,"(?:[2-7]\\d|8[126-9]|9[1-46-9])\\d{6}",,,,"32123456"],[,,"(?:[2-7]\\d|8[126-9]|9[1-46-9])\\d{6}",
  	,,,"32123456"],[,,"80\\d{6}",,,,"80123456"],[,,"90\\d{6}",,,,"90123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"DK",45,"00",,,,,,,1,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[2-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],DM:[,[,,"(?:[58]\\d\\d|767|900)\\d{7}",,,,,,,[10],[7]],[,,"767(?:2(?:55|66)|4(?:2[01]|4[0-25-9])|50[0-4])\\d{4}",,,,"7674201234",,,,[7]],[,,"767(?:2(?:[2-4689]5|7[5-7])|31[5-7]|61[1-8]|70[1-6])\\d{4}",,,,"7672251234",,,,[7]],
  	[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"DM",1,"011","1",,,"([2-7]\\d{6})$|1","767$1",,,,,[,,,,,,,,,[-1]],,"767",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],
  	DO:[,[,,"(?:[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"8(?:[04]9[2-9]\\d\\d|29(?:2(?:[0-59]\\d|6[04-9]|7[0-27]|8[0237-9])|3(?:[0-35-9]\\d|4[7-9])|[45]\\d\\d|6(?:[0-27-9]\\d|[3-5][1-9]|6[0135-8])|7(?:0[013-9]|[1-37]\\d|4[1-35689]|5[1-4689]|6[1-57-9]|8[1-79]|9[1-8])|8(?:0[146-9]|1[0-48]|[248]\\d|3[1-79]|5[01589]|6[013-68]|7[124-8]|9[0-8])|9(?:[0-24]\\d|3[02-46-9]|5[0-79]|60|7[0169]|8[57-9]|9[02-9])))\\d{4}",,,,"8092345678",,,,[7]],[,,"8[024]9[2-9]\\d{6}",,,,"8092345678",,,,[7]],[,,"8(?:00(?:14|[2-9]\\d)|(?:33|44|55|66|77|88)[2-9]\\d)\\d{5}",
  	,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"DO",1,"011","1",,,"1",,,,,,[,,,,,,,,,[-1]],,"8001|8[024]9",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],DZ:[,[,,"(?:[1-4]|[5-79]\\d|80)\\d{7}",,,,,,,[8,9]],
  	[,,"9619\\d{5}|(?:1\\d|2[013-79]|3[0-8]|4[013-689])\\d{6}",,,,"12345678"],[,,"(?:5(?:4[0-29]|5\\d|6[0-2])|6(?:[569]\\d|7[0-6])|7[7-9]\\d)\\d{6}",,,,"551234567",,,[9]],[,,"800\\d{6}",,,,"800123456",,,[9]],[,,"80[3-689]1\\d{5}",,,,"808123456",,,[9]],[,,"80[12]1\\d{5}",,,,"801123456",,,[9]],[,,,,,,,,,[-1]],[,,"98[23]\\d{6}",,,,"983123456",,,[9]],"DZ",213,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[1-4]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["9"],"0$1"],
  	[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[5-8]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],EC:[,[,,"1\\d{9,10}|(?:[2-7]|9\\d)\\d{7}",,,,,,,[8,9,10,11],[7]],[,,"[2-7][2-7]\\d{6}",,,,"22123456",,,[8],[7]],[,,"964[0-2]\\d{5}|9(?:39|[57][89]|6[0-36-9]|[89]\\d)\\d{6}",,,,"991234567",,,[9]],[,,"1800\\d{7}|1[78]00\\d{6}",,,,"18001234567",,,[10,11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"[2-7]890\\d{4}",,,,"28901234",,,[8]],"EC",593,"00","0",,,
  	"0",,,,[[,"(\\d{3})(\\d{4})","$1-$2",["[2-7]"]],[,"(\\d)(\\d{3})(\\d{4})","$1 $2-$3",["[2-7]"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["9"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{3,4})","$1 $2 $3",["1"]]],[[,"(\\d)(\\d{3})(\\d{4})","$1-$2-$3",["[2-7]"]],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["9"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{3,4})","$1 $2 $3",["1"]]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],EE:[,[,,"8\\d{9}|[4578]\\d{7}|(?:[3-8]\\d|90)\\d{5}",,,,,,,[7,8,10]],[,,"(?:3[23589]|4[3-8]|6\\d|7[1-9]|88)\\d{5}",
  	,,,"3212345",,,[7]],[,,"(?:5\\d{5}|8(?:1(?:0(?:000|[3-9]\\d\\d)|(?:1(?:0[236]|1\\d)|(?:2[0-59]|[3-79]\\d)\\d)\\d)|2(?:0(?:000|(?:19|[2-7]\\d)\\d)|(?:(?:[124-6]\\d|3[5-9])\\d|7(?:[0-79]\\d|8[13-9])|8(?:[2-6]\\d|7[01]))\\d)|[349]\\d{4}))\\d\\d|5(?:(?:[02]\\d|5[0-478])\\d|1(?:[0-8]\\d|95)|6(?:4[0-4]|5[1-589]))\\d{3}",,,,"51234567",,,[7,8]],[,,"800(?:(?:0\\d\\d|1)\\d|[2-9])\\d{3}",,,,"80012345"],[,,"(?:40\\d\\d|900)\\d{4}",,,,"9001234",,,[7,8]],[,,,,,,,,,[-1]],[,,"70[0-2]\\d{5}",,,,"70012345",,,[8]],
  	[,,,,,,,,,[-1]],"EE",372,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[369]|4[3-8]|5(?:[0-2]|5[0-478]|6[45])|7[1-9]|88","[369]|4[3-8]|5(?:[02]|1(?:[0-8]|95)|5[0-478]|6(?:4[0-4]|5[1-589]))|7[1-9]|88"]],[,"(\\d{4})(\\d{3,4})","$1 $2",["[45]|8(?:00|[1-49])","[45]|8(?:00[1-9]|[1-49])"]],[,"(\\d{2})(\\d{2})(\\d{4})","$1 $2 $3",["7"]],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["8"]]],,[,,,,,,,,,[-1]],,,[,,"800[2-9]\\d{3}",,,,,,,[7]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],EG:[,[,,"[189]\\d{8,9}|[24-6]\\d{8}|[135]\\d{7}",
  	,,,,,,[8,9,10],[6,7]],[,,"13[23]\\d{6}|(?:15|57)\\d{6,7}|(?:2[2-4]|3|4[05-8]|5[05]|6[24-689]|8[2468]|9[235-7])\\d{7}",,,,"234567890",,,[8,9],[6,7]],[,,"1[0-25]\\d{8}",,,,"1001234567",,,[10]],[,,"800\\d{7}",,,,"8001234567",,,[10]],[,,"900\\d{7}",,,,"9001234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"EG",20,"00","0",,,"0",,,,[[,"(\\d)(\\d{7,8})","$1 $2",["[23]"],"0$1"],[,"(\\d{2})(\\d{6,7})","$1 $2",["1[35]|[4-6]|8[2468]|9[235-7]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["[89]"],
  	"0$1"],[,"(\\d{2})(\\d{8})","$1 $2",["1"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],EH:[,[,,"[5-8]\\d{8}",,,,,,,[9]],[,,"528[89]\\d{5}",,,,"528812345"],[,,"(?:6(?:[0-79]\\d|8[0-247-9])|7(?:[017]\\d|2[0-2]|6[0-8]|8[0-3]))\\d{6}",,,,"650123456"],[,,"80\\d{7}",,,,"801234567"],[,,"89\\d{7}",,,,"891234567"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"592(?:4[0-2]|93)\\d{4}",,,,"592401234"],"EH",212,"00","0",,,"0",,,,,,[,,,,,,,,,[-1]],,"528[89]",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],
  	,,[,,,,,,,,,[-1]]],ER:[,[,,"[178]\\d{6}",,,,,,,[7],[6]],[,,"(?:1(?:1[12568]|[24]0|55|6[146])|8\\d\\d)\\d{4}",,,,"8370362",,,,[6]],[,,"(?:17[1-3]|7\\d\\d)\\d{4}",,,,"7123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"ER",291,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{3})","$1 $2 $3",["[178]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],ES:[,[,,"[5-9]\\d{8}",,,,,,,[9]],[,,"96906(?:0[0-8]|1[1-9]|[2-9]\\d)\\d\\d|9(?:69(?:0[0-57-9]|[1-9]\\d)|73(?:[0-8]\\d|9[1-9]))\\d{4}|(?:8(?:[1356]\\d|[28][0-8]|[47][1-9])|9(?:[135]\\d|[268][0-8]|4[1-9]|7[124-9]))\\d{6}",
  	,,,"810123456"],[,,"(?:590[16]00\\d|9(?:6906(?:09|10)|7390\\d\\d))\\d\\d|(?:6\\d|7[1-48])\\d{7}",,,,"612345678"],[,,"[89]00\\d{6}",,,,"800123456"],[,,"80[367]\\d{6}",,,,"803123456"],[,,"90[12]\\d{6}",,,,"901123456"],[,,"70\\d{7}",,,,"701234567"],[,,,,,,,,,[-1]],"ES",34,"00",,,,,,,,[[,"(\\d{4})","$1",["905"]],[,"(\\d{6})","$1",["[79]9"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[89]00"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[5-9]"]]],[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[89]00"]],
  	[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[5-9]"]]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"51\\d{7}",,,,"511234567"],,,[,,,,,,,,,[-1]]],ET:[,[,,"(?:11|[2-579]\\d)\\d{7}",,,,,,,[9],[7]],[,,"11667[01]\\d{3}|(?:11(?:1(?:1[124]|2[2-7]|3[1-5]|5[5-8]|8[6-8])|2(?:13|3[6-8]|5[89]|7[05-9]|8[2-6])|3(?:2[01]|3[0-289]|4[1289]|7[1-4]|87)|4(?:1[69]|3[2-49]|4[0-3]|6[5-8])|5(?:1[578]|44|5[0-4])|6(?:1[578]|2[69]|39|4[5-7]|5[0-5]|6[0-59]|8[015-8]))|2(?:2(?:11[1-9]|22[0-7]|33\\d|44[1467]|66[1-68])|5(?:11[124-6]|33[2-8]|44[1467]|55[14]|66[1-3679]|77[124-79]|880))|3(?:3(?:11[0-46-8]|(?:22|55)[0-6]|33[0134689]|44[04]|66[01467])|4(?:44[0-8]|55[0-69]|66[0-3]|77[1-5]))|4(?:6(?:119|22[0-24-7]|33[1-5]|44[13-69]|55[14-689]|660|88[1-4])|7(?:(?:11|22)[1-9]|33[13-7]|44[13-6]|55[1-689]))|5(?:7(?:227|55[05]|(?:66|77)[14-8])|8(?:11[149]|22[013-79]|33[0-68]|44[013-8]|550|66[1-5]|77\\d)))\\d{4}",
  	,,,"111112345",,,,[7]],[,,"700[1-9]\\d{5}|(?:7(?:0[1-9]|1[0-8]|22|77|86|99)|9\\d\\d)\\d{6}",,,,"911234567"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"ET",251,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[1-579]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],FI:[,[,,"[1-35689]\\d{4}|7\\d{10,11}|(?:[124-7]\\d|3[0-46-9])\\d{8}|[1-9]\\d{5,8}",,,,,,,[5,6,7,8,9,10,11,12]],[,,"(?:1[3-79][1-8]|[235689][1-8]\\d)\\d{2,6}",
  	,,,"131234567",,,[5,6,7,8,9]],[,,"4946\\d{2,6}|(?:4[0-8]|50)\\d{4,8}",,,,"412345678",,,[6,7,8,9,10]],[,,"800\\d{4,6}",,,,"800123456",,,[7,8,9]],[,,"[67]00\\d{5,6}",,,,"600123456",,,[8,9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"FI",358,"00|99(?:[01469]|5(?:[14]1|3[23]|5[59]|77|88|9[09]))","0",,,"0",,"00",,[[,"(\\d{5})","$1",["75[12]"],"0$1"],[,"(\\d)(\\d{4,9})","$1 $2",["[2568][1-8]|3(?:0[1-9]|[1-9])|9"],"0$1"],[,"(\\d{6})","$1",["11"]],[,"(\\d{3})(\\d{3,7})","$1 $2",["[12]00|[368]|70[07-9]"],
  	"0$1"],[,"(\\d{2})(\\d{4,8})","$1 $2",["[1245]|7[135]"],"0$1"],[,"(\\d{2})(\\d{6,10})","$1 $2",["7"],"0$1"]],[[,"(\\d)(\\d{4,9})","$1 $2",["[2568][1-8]|3(?:0[1-9]|[1-9])|9"],"0$1"],[,"(\\d{3})(\\d{3,7})","$1 $2",["[12]00|[368]|70[07-9]"],"0$1"],[,"(\\d{2})(\\d{4,8})","$1 $2",["[1245]|7[135]"],"0$1"],[,"(\\d{2})(\\d{6,10})","$1 $2",["7"],"0$1"]],[,,,,,,,,,[-1]],1,"1[03-79]|[2-9]",[,,"20(?:2[023]|9[89])\\d{1,6}|(?:60[12]\\d|7099)\\d{4,5}|(?:606|7(?:0[78]|1|3\\d))\\d{7}|(?:[1-3]00|7(?:0[1-5]\\d\\d|5[03-9]))\\d{3,7}"],
  	[,,"20\\d{4,8}|60[12]\\d{5,6}|7(?:099\\d{4,5}|5[03-9]\\d{3,7})|20[2-59]\\d\\d|(?:606|7(?:0[78]|1|3\\d))\\d{7}|(?:10|29|3[09]|70[1-5]\\d)\\d{4,8}",,,,"10112345"],,,[,,,,,,,,,[-1]]],FJ:[,[,,"45\\d{5}|(?:0800\\d|[235-9])\\d{6}",,,,,,,[7,11]],[,,"603\\d{4}|(?:3[0-5]|6[25-7]|8[58])\\d{5}",,,,"3212345",,,[7]],[,,"(?:[279]\\d|45|5[01568]|8[034679])\\d{5}",,,,"7012345",,,[7]],[,,"0800\\d{7}",,,,"08001234567",,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"FJ",679,"0(?:0|52)",,,,,
  	,"00",,[[,"(\\d{3})(\\d{4})","$1 $2",["[235-9]|45"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["0"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],FK:[,[,,"[2-7]\\d{4}",,,,,,,[5]],[,,"[2-47]\\d{4}",,,,"31234"],[,,"[56]\\d{4}",,,,"51234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"FK",500,"00",,,,,,,,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],FM:[,[,,"(?:[39]\\d\\d|820)\\d{4}",,,,,,,[7]],[,,"31(?:00[67]|208|309)\\d\\d|(?:3(?:[2357]0[1-9]|602|804|905)|(?:820|9[2-6]\\d)\\d)\\d{3}",
  	,,,"3201234"],[,,"31(?:00[67]|208|309)\\d\\d|(?:3(?:[2357]0[1-9]|602|804|905)|(?:820|9[2-7]\\d)\\d)\\d{3}",,,,"3501234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"FM",691,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[389]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],FO:[,[,,"[2-9]\\d{5}",,,,,,,[6]],[,,"(?:20|[34]\\d|8[19])\\d{4}",,,,"201234"],[,,"(?:[27][1-9]|5\\d|9[16])\\d{4}",,,,"211234"],[,,"80[257-9]\\d{3}",,,,"802123"],[,,"90(?:[13-5][15-7]|2[125-7]|9\\d)\\d\\d",
  	,,,"901123"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:6[0-36]|88)\\d{4}",,,,"601234"],"FO",298,"00",,,,"(10(?:01|[12]0|88))",,,,[[,"(\\d{6})","$1",["[2-9]"],,"$CC $1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],FR:[,[,,"[1-9]\\d{8}",,,,,,,[9]],[,,"59[1-9]\\d{6}|(?:[1-3]\\d|4[1-9]|5[0-8])\\d{7}",,,,"123456789"],[,,"(?:6(?:[0-24-8]\\d|3[0-8]|9[589])|7[3-9]\\d)\\d{6}",,,,"612345678"],[,,"80[0-5]\\d{6}",,,,"801234567"],[,,"836(?:0[0-36-9]|[1-9]\\d)\\d{4}|8(?:1[2-9]|2[2-47-9]|3[0-57-9]|[569]\\d|8[0-35-9])\\d{6}",
  	,,,"891123456"],[,,"8(?:1[01]|2[0156]|4[02]|84)\\d{6}",,,,"884012345"],[,,,,,,,,,[-1]],[,,"9\\d{8}",,,,"912345678"],"FR",33,"00","0",,,"0",,,,[[,"(\\d{4})","$1",["10"]],[,"(\\d{3})(\\d{3})","$1 $2",["1"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["8"],"0 $1"],[,"(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5",["[1-79]"],"0$1"]],[[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["8"],"0 $1"],[,"(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5",["[1-79]"],"0$1"]],[,,,,,,,,
  	,[-1]],,,[,,,,,,,,,[-1]],[,,"80[6-9]\\d{6}",,,,"806123456"],,,[,,,,,,,,,[-1]]],GA:[,[,,"(?:[067]\\d|11)\\d{6}|[2-7]\\d{6}",,,,,,,[7,8]],[,,"[01]1\\d{6}",,,,"01441234",,,[8]],[,,"(?:(?:0[2-7]|7[467])\\d|6(?:0[0-4]|10|[256]\\d))\\d{5}|[2-7]\\d{6}",,,,"06031234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"GA",241,"00",,,,"0(11\\d{6}|60\\d{6}|61\\d{6}|6[256]\\d{6}|7[467]\\d{6})","$1",,,[[,"(\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[2-7]"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
  	"$1 $2 $3 $4",["0"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["11|[67]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GB:[,[,,"[1-357-9]\\d{9}|[18]\\d{8}|8\\d{6}",,,,,,,[7,9,10],[4,5,6,8]],[,,"(?:1(?:1(?:3(?:[0-58]\\d\\d|73[0235])|4(?:[0-5]\\d\\d|69[7-9]|70[0-79])|(?:(?:5[0-26-9]|[78][0-49])\\d|6(?:[0-4]\\d|50))\\d)|(?:2(?:(?:0[024-9]|2[3-9]|3[3-79]|4[1-689]|[58][02-9]|6[0-47-9]|7[013-9]|9\\d)\\d|1(?:[0-7]\\d|8[0-2]))|(?:3(?:0\\d|1[0-8]|[25][02-9]|3[02-579]|[468][0-46-9]|7[1-35-79]|9[2-578])|4(?:0[03-9]|[137]\\d|[28][02-57-9]|4[02-69]|5[0-8]|[69][0-79])|5(?:0[1-35-9]|[16]\\d|2[024-9]|3[015689]|4[02-9]|5[03-9]|7[0-35-9]|8[0-468]|9[0-57-9])|6(?:0[034689]|1\\d|2[0-35689]|[38][013-9]|4[1-467]|5[0-69]|6[13-9]|7[0-8]|9[0-24578])|7(?:0[0246-9]|2\\d|3[0236-8]|4[03-9]|5[0-46-9]|6[013-9]|7[0-35-9]|8[024-9]|9[02-9])|8(?:0[35-9]|2[1-57-9]|3[02-578]|4[0-578]|5[124-9]|6[2-69]|7\\d|8[02-9]|9[02569])|9(?:0[02-589]|[18]\\d|2[02-689]|3[1-57-9]|4[2-9]|5[0-579]|6[2-47-9]|7[0-24578]|9[2-57]))\\d)\\d)|2(?:0[013478]|3[0189]|4[017]|8[0-46-9]|9[0-2])\\d{3})\\d{4}|1(?:2(?:0(?:46[1-4]|87[2-9])|545[1-79]|76(?:2\\d|3[1-8]|6[1-6])|9(?:7(?:2[0-4]|3[2-5])|8(?:2[2-8]|7[0-47-9]|8[3-5])))|3(?:6(?:38[2-5]|47[23])|8(?:47[04-9]|64[0157-9]))|4(?:044[1-7]|20(?:2[23]|8\\d)|6(?:0(?:30|5[2-57]|6[1-8]|7[2-8])|140)|8(?:052|87[1-3]))|5(?:2(?:4(?:3[2-79]|6\\d)|76\\d)|6(?:26[06-9]|686))|6(?:06(?:4\\d|7[4-79])|295[5-7]|35[34]\\d|47(?:24|61)|59(?:5[08]|6[67]|74)|9(?:55[0-4]|77[23]))|7(?:26(?:6[13-9]|7[0-7])|(?:442|688)\\d|50(?:2[0-3]|[3-68]2|76))|8(?:27[56]\\d|37(?:5[2-5]|8[239])|843[2-58])|9(?:0(?:0(?:6[1-8]|85)|52\\d)|3583|4(?:66[1-8]|9(?:2[01]|81))|63(?:23|3[1-4])|9561))\\d{3}",
  	,,,"1212345678",,,[9,10],[4,5,6,7,8]],[,,"7(?:457[0-57-9]|700[01]|911[028])\\d{5}|7(?:[1-3]\\d\\d|4(?:[0-46-9]\\d|5[0-689])|5(?:0[0-8]|[13-9]\\d|2[0-35-9])|7(?:0[1-9]|[1-7]\\d|8[02-9]|9[0-689])|8(?:[014-9]\\d|[23][0-8])|9(?:[024-9]\\d|1[02-9]|3[0-689]))\\d{6}",,,,"7400123456",,,[10]],[,,"80[08]\\d{7}|800\\d{6}|8001111",,,,"8001234567"],[,,"(?:8(?:4[2-5]|7[0-3])|9(?:[01]\\d|8[2-49]))\\d{7}|845464\\d",,,,"9012345678",,,[7,10]],[,,,,,,,,,[-1]],[,,"70\\d{8}",,,,"7012345678",,,[10]],[,,"56\\d{8}",,,,"5612345678",
  	,,[10]],"GB",44,"00","0"," x",,"0",,,,[[,"(\\d{3})(\\d{4})","$1 $2",["800","8001","80011","800111","8001111"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3",["845","8454","84546","845464"],"0$1"],[,"(\\d{3})(\\d{6})","$1 $2",["800"],"0$1"],[,"(\\d{5})(\\d{4,5})","$1 $2",["1(?:38|5[23]|69|76|94)","1(?:(?:38|69)7|5(?:24|39)|768|946)","1(?:3873|5(?:242|39[4-6])|(?:697|768)[347]|9467)"],"0$1"],[,"(\\d{4})(\\d{5,6})","$1 $2",["1(?:[2-69][02-9]|[78])"],"0$1"],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["[25]|7(?:0|6[02-9])",
  	"[25]|7(?:0|6(?:[03-9]|2[356]))"],"0$1"],[,"(\\d{4})(\\d{6})","$1 $2",["7"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["[1389]"],"0$1"]],,[,,"76(?:464|652)\\d{5}|76(?:0[0-28]|2[356]|34|4[01347]|5[49]|6[0-369]|77|8[14]|9[139])\\d{6}",,,,"7640123456",,,[10]],1,,[,,,,,,,,,[-1]],[,,"(?:3[0347]|55)\\d{8}",,,,"5512345678",,,[10]],,,[,,,,,,,,,[-1]]],GD:[,[,,"(?:473|[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"473(?:2(?:3[0-2]|69)|3(?:2[89]|86)|4(?:[06]8|3[5-9]|4[0-49]|5[5-79]|73|90)|63[68]|7(?:58|84)|800|938)\\d{4}",
  	,,,"4732691234",,,,[7]],[,,"473(?:4(?:0[2-79]|1[04-9]|2[0-5]|58)|5(?:2[01]|3[3-8])|901)\\d{4}",,,,"4734031234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],
  	"GD",1,"011","1",,,"([2-9]\\d{6})$|1","473$1",,,,,[,,,,,,,,,[-1]],,"473",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GE:[,[,,"(?:[3-57]\\d\\d|800)\\d{6}",,,,,,,[9],[6,7]],[,,"(?:3(?:[256]\\d|4[124-9]|7[0-4])|4(?:1\\d|2[2-7]|3[1-79]|4[2-8]|7[239]|9[1-7]))\\d{6}",,,,"322123456",,,,[6,7]],[,,"5(?:(?:(?:0555|1(?:[17]77|555))[5-9]|757(?:7[7-9]|8[01]))\\d|22252[0-4])\\d\\d|(?:5(?:00(?:0\\d|11|22|33|44|5[05]|77|88|99)|1(?:1(?:00|[124]\\d|3[01])|4\\d\\d)|(?:44|68)\\d\\d|5(?:[0157-9]\\d\\d|200)|7(?:[0147-9]\\d\\d|5(?:00|[57]5))|8(?:0(?:[01]\\d|2[0-4])|58[89]|8(?:55|88))|9(?:090|[1-35-9]\\d\\d))|790\\d\\d)\\d{4}|5(?:0(?:070|505)|1(?:0[01]0|1(?:07|33|51))|2(?:0[02]0|2[25]2)|3(?:0[03]0|3[35]3)|(?:40[04]|900)0|5222)[0-4]\\d{3}",
  	,,,"555123456"],[,,"800\\d{6}",,,,"800123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"70[67]\\d{6}",,,,"706123456"],"GE",995,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["70"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["32"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[57]"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[348]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,"70[67]\\d{6}"],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GF:[,[,,"[56]94\\d{6}|(?:80|9\\d)\\d{7}",
  	,,,,,,[9]],[,,"594(?:[02-49]\\d|1[0-4]|5[6-9]|6[0-3]|80)\\d{4}",,,,"594101234"],[,,"694(?:[0-249]\\d|3[0-8])\\d{4}",,,,"694201234"],[,,"80[0-5]\\d{6}",,,,"800012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"9(?:(?:396|76\\d)\\d|476[0-5])\\d{4}",,,,"976012345"],"GF",594,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[56]|9[47]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[89]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,
  	,,,,[-1]]],GG:[,[,,"(?:1481|[357-9]\\d{3})\\d{6}|8\\d{6}(?:\\d{2})?",,,,,,,[7,9,10],[6]],[,,"1481[25-9]\\d{5}",,,,"1481256789",,,[10],[6]],[,,"7(?:(?:781|839)\\d|911[17])\\d{5}",,,,"7781123456",,,[10]],[,,"80[08]\\d{7}|800\\d{6}|8001111",,,,"8001234567"],[,,"(?:8(?:4[2-5]|7[0-3])|9(?:[01]\\d|8[0-3]))\\d{7}|845464\\d",,,,"9012345678",,,[7,10]],[,,,,,,,,,[-1]],[,,"70\\d{8}",,,,"7012345678",,,[10]],[,,"56\\d{8}",,,,"5612345678",,,[10]],"GG",44,"00","0",,,"([25-9]\\d{5})$|0","1481$1",,,,,[,,"76(?:464|652)\\d{5}|76(?:0[0-28]|2[356]|34|4[01347]|5[49]|6[0-369]|77|8[14]|9[139])\\d{6}",
  	,,,"7640123456",,,[10]],,,[,,,,,,,,,[-1]],[,,"(?:3[0347]|55)\\d{8}",,,,"5512345678",,,[10]],,,[,,,,,,,,,[-1]]],GH:[,[,,"(?:[235]\\d{3}|800)\\d{5}",,,,,,,[8,9],[7]],[,,"3082[0-5]\\d{4}|3(?:0(?:[237]\\d|8[01])|[167](?:2[0-6]|7\\d|80)|2(?:2[0-5]|7\\d|80)|3(?:2[0-3]|7\\d|80)|4(?:2[013-9]|3[01]|7\\d|80)|5(?:2[0-7]|7\\d|80)|8(?:2[0-2]|7\\d|80)|9(?:[28]0|7\\d))\\d{5}",,,,"302345678",,,[9],[7]],[,,"(?:2(?:[0346-9]\\d|5[67])|5(?:[03-7]\\d|9[1-9]))\\d{6}",,,,"231234567",,,[9]],[,,"800\\d{5}",,,,"80012345",
  	,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"GH",233,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[237]|8[0-2]"]],[,"(\\d{3})(\\d{5})","$1 $2",["8"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[235]"],"0$1"]],[[,"(\\d{3})(\\d{5})","$1 $2",["8"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[235]"],"0$1"]],[,,,,,,,,,[-1]],,,[,,"800\\d{5}",,,,,,,[8]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GI:[,[,,"(?:[25]\\d|60)\\d{6}",,,,,,,[8]],[,,"2190[0-2]\\d{3}|2(?:0(?:[02]\\d|3[01])|16[24-9]|2[2-5]\\d)\\d{4}",
  	,,,"20012345"],[,,"5251[0-4]\\d{3}|(?:5(?:[146-8]\\d\\d|250)|60(?:1[01]|6\\d))\\d{4}",,,,"57123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"GI",350,"00",,,,,,,,[[,"(\\d{3})(\\d{5})","$1 $2",["2"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GL:[,[,,"(?:19|[2-689]\\d|70)\\d{4}",,,,,,,[6]],[,,"(?:19|3[1-7]|[68][1-9]|70|9\\d)\\d{4}",,,,"321000"],[,,"[245]\\d{5}",,,,"221234"],[,,"80\\d{4}",,,,"801234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],
  	[,,,,,,,,,[-1]],[,,"3[89]\\d{4}",,,,"381234"],"GL",299,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",["19|[2-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GM:[,[,,"[2-9]\\d{6}",,,,,,,[7]],[,,"(?:4(?:[23]\\d\\d|4(?:1[024679]|[6-9]\\d))|5(?:5(?:3\\d|4[0-7])|6[67]\\d|7(?:1[04]|2[035]|3[58]|48))|8\\d{3})\\d{3}",,,,"5661234"],[,,"(?:[23679]\\d|5[0-489])\\d{5}",,,,"3012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"GM",220,"00",
  	,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[2-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GN:[,[,,"722\\d{6}|(?:3|6\\d)\\d{7}",,,,,,,[8,9]],[,,"3(?:0(?:24|3[12]|4[1-35-7]|5[13]|6[189]|[78]1|9[1478])|1\\d\\d)\\d{4}",,,,"30241234",,,[8]],[,,"6[0-356]\\d{7}",,,,"601123456",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"722\\d{6}",,,,"722123456",,,[9]],"GN",224,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["3"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})",
  	"$1 $2 $3 $4",["[67]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GP:[,[,,"590\\d{6}|(?:69|80|9\\d)\\d{7}",,,,,,,[9]],[,,"590(?:0[1-68]|[14][0-24-9]|2[0-68]|3[1-9]|5[3-579]|[68][0-689]|7[08]|9\\d)\\d{4}",,,,"590201234"],[,,"69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))\\d{4}",,,,"690001234"],[,,"80[0-5]\\d{6}",,,,"800012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"9(?:(?:395|76[018])\\d|475[0-5])\\d{4}",,,,"976012345"],"GP",590,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})",
  	"$1 $2 $3 $4",["[569]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["8"],"0$1"]],,[,,,,,,,,,[-1]],1,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GQ:[,[,,"222\\d{6}|(?:3\\d|55|[89]0)\\d{7}",,,,,,,[9]],[,,"33[0-24-9]\\d[46]\\d{4}|3(?:33|5\\d)\\d[7-9]\\d{4}",,,,"333091234"],[,,"(?:222|55\\d)\\d{6}",,,,"222123456"],[,,"80\\d[1-9]\\d{5}",,,,"800123456"],[,,"90\\d[1-9]\\d{5}",,,,"900123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"GQ",240,"00",,,,,,,,[[,"(\\d{3})(\\d{3})(\\d{3})",
  	"$1 $2 $3",["[235]"]],[,"(\\d{3})(\\d{6})","$1 $2",["[89]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GR:[,[,,"5005000\\d{3}|8\\d{9,11}|(?:[269]\\d|70)\\d{8}",,,,,,,[10,11,12]],[,,"2(?:1\\d\\d|2(?:2[1-46-9]|[36][1-8]|4[1-7]|5[1-4]|7[1-5]|[89][1-9])|3(?:1\\d|2[1-57]|[35][1-3]|4[13]|7[1-7]|8[124-6]|9[1-79])|4(?:1\\d|2[1-8]|3[1-4]|4[13-5]|6[1-578]|9[1-5])|5(?:1\\d|[29][1-4]|3[1-5]|4[124]|5[1-6])|6(?:1\\d|[269][1-6]|3[1245]|4[1-7]|5[13-9]|7[14]|8[1-5])|7(?:1\\d|2[1-5]|3[1-6]|4[1-7]|5[1-57]|6[135]|9[125-7])|8(?:1\\d|2[1-5]|[34][1-4]|9[1-57]))\\d{6}",
  	,,,"2123456789",,,[10]],[,,"68[57-9]\\d{7}|(?:69|94)\\d{8}",,,,"6912345678",,,[10]],[,,"800\\d{7,9}",,,,"8001234567"],[,,"90[19]\\d{7}",,,,"9091234567",,,[10]],[,,"8(?:0[16]|12|[27]5|50)\\d{7}",,,,"8011234567",,,[10]],[,,"70\\d{8}",,,,"7012345678",,,[10]],[,,,,,,,,,[-1]],"GR",30,"00",,,,,,,,[[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["21|7"]],[,"(\\d{4})(\\d{6})","$1 $2",["2(?:2|3[2-57-9]|4[2-469]|5[2-59]|6[2-9]|7[2-69]|8[2-49])|5"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["[2689]"]],[,"(\\d{3})(\\d{3,4})(\\d{5})",
  	"$1 $2 $3",["8"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"5005000\\d{3}",,,,"5005000123",,,[10]],,,[,,,,,,,,,[-1]]],GT:[,[,,"(?:1\\d{3}|[2-7])\\d{7}",,,,,,,[8,11]],[,,"[267][2-9]\\d{6}",,,,"22456789",,,[8]],[,,"[3-5]\\d{7}",,,,"51234567",,,[8]],[,,"18[01]\\d{8}",,,,"18001112222",,,[11]],[,,"19\\d{9}",,,,"19001112222",,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"GT",502,"00",,,,,,,,[[,"(\\d{4})(\\d{4})","$1 $2",["[2-7]"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["1"]]],,[,,,,,,,,,[-1]],
  	,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GU:[,[,,"(?:[58]\\d\\d|671|900)\\d{7}",,,,,,,[10],[7]],[,,"671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[02-46-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}",,,,"6713001234",,,,[7]],[,,"671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[02-46-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}",
  	,,,"6713001234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"GU",1,"011","1",,,"([3-9]\\d{6})$|1","671$1",,1,,,[,,,,,,,,,[-1]],,"671",[,,,,,,,,,[-1]],[,,,,
  	,,,,,[-1]],,,[,,,,,,,,,[-1]]],GW:[,[,,"[49]\\d{8}|4\\d{6}",,,,,,,[7,9]],[,,"443\\d{6}",,,,"443201234",,,[9]],[,,"9(?:5\\d|6[569]|77)\\d{6}",,,,"955012345",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"40\\d{5}",,,,"4012345",,,[7]],"GW",245,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["40"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[49]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],GY:[,[,,"9008\\d{3}|(?:[2-467]\\d\\d|510|862)\\d{4}",,,,,,,[7]],
  	[,,"(?:2(?:1[6-9]|2[0-35-9]|3[1-4]|5[3-9]|6\\d|7[0-24-79])|3(?:2[25-9]|3\\d)|4(?:4[0-24]|5[56])|77[1-57])\\d{4}",,,,"2201234"],[,,"(?:510|6\\d\\d|7(?:0\\d|1[0-8]|25|49))\\d{4}",,,,"6091234"],[,,"(?:289|862)\\d{4}",,,,"2891234"],[,,"9008\\d{3}",,,,"9008123"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"GY",592,"001",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[2-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],HK:[,[,,"8[0-46-9]\\d{6,7}|9\\d{4,7}|(?:[2-7]|9\\d{3})\\d{7}",
  	,,,,,,[5,6,7,8,9,11]],[,,"(?:2(?:[13-9]\\d|2[013-9])\\d|3(?:(?:[1569][0-24-9]|4[0-246-9]|7[0-24-69])\\d|8(?:[45][0-8]|6[01]|9\\d))|58(?:0[1-9]|1[2-9]))\\d{4}",,,,"21234567",,,[8]],[,,"(?:4(?:44[5-9]|6(?:0[0-7]|1[0-6]|4[0-57-9]|6[0-4]|7[0-8]))|573[0-6]|6(?:26[013-8]|66[0-3])|70(?:7[1-5]|8[0-4])|848[015-9]|9(?:29[013-9]|59[0-4]))\\d{4}|(?:4(?:4[01]|6[2358])|5(?:[1-59][0-46-9]|6[0-4689]|7[0-246-9])|6(?:0[1-9]|[13-59]\\d|[268][0-57-9]|7[0-79])|84[09]|9(?:0[1-9]|1[02-9]|[2358][0-8]|[467]\\d))\\d{5}",,
  	,,"51234567",,,[8]],[,,"800\\d{6}",,,,"800123456",,,[9]],[,,"900(?:[0-24-9]\\d{7}|3\\d{1,4})",,,,"90012345678",,,[5,6,7,8,11]],[,,,,,,,,,[-1]],[,,"8(?:1[0-4679]\\d|2(?:[0-36]\\d|7[0-4])|3(?:[034]\\d|2[09]|70))\\d{4}",,,,"81123456",,,[8]],[,,,,,,,,,[-1]],"HK",852,"00(?:30|5[09]|[126-9]?)",,,,,,"00",,[[,"(\\d{3})(\\d{2,5})","$1 $2",["900","9003"]],[,"(\\d{4})(\\d{4})","$1 $2",["[2-7]|8[1-4]|9(?:0[1-9]|[1-8])"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["8"]],[,"(\\d{3})(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3 $4",
  	["9"]]],,[,,"7(?:1(?:0[0-38]|1[0-3679]|3[013]|69|9[0136])|2(?:[02389]\\d|1[18]|7[27-9])|3(?:[0-38]\\d|7[0-369]|9[2357-9])|47\\d|5(?:[178]\\d|5[0-5])|6(?:0[0-7]|2[236-9]|[35]\\d)|7(?:[27]\\d|8[7-9])|8(?:[23689]\\d|7[1-9])|9(?:[025]\\d|6[0-246-8]|7[0-36-9]|8[238]))\\d{4}",,,,"71123456",,,[8]],,,[,,,,,,,,,[-1]],[,,"30(?:0[1-9]|[15-7]\\d|2[047]|89)\\d{4}",,,,"30161234",,,[8]],,,[,,,,,,,,,[-1]]],HN:[,[,,"8\\d{10}|[237-9]\\d{7}",,,,,,,[8,11]],[,,"2(?:2(?:0[0-59]|1[1-9]|[23]\\d|4[02-6]|5[57]|6[245]|7[0135689]|8[01346-9]|9[0-2])|4(?:0[578]|2[3-59]|3[13-9]|4[0-68]|5[1-3589])|5(?:0[2357-9]|1[1-356]|4[03-5]|5\\d|6[014-69]|7[04]|80)|6(?:[056]\\d|17|2[067]|3[047]|4[0-378]|[78][0-8]|9[01])|7(?:0[5-79]|6[46-9]|7[02-9]|8[034]|91)|8(?:79|8[0-357-9]|9[1-57-9]))\\d{4}",
  	,,,"22123456",,,[8]],[,,"[37-9]\\d{7}",,,,"91234567",,,[8]],[,,"8002\\d{7}",,,,"80021234567",,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"HN",504,"00",,,,,,,,[[,"(\\d{4})(\\d{4})","$1-$2",["[237-9]"]],[,"(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3",["8"]]],[[,"(\\d{4})(\\d{4})","$1-$2",["[237-9]"]]],[,,,,,,,,,[-1]],,,[,,"8002\\d{7}",,,,,,,[11]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],HR:[,[,,"(?:[24-69]\\d|3[0-79])\\d{7}|80\\d{5,7}|[1-79]\\d{7}|6\\d{5,6}",,,,,,,[6,7,8,9]],[,,"1\\d{7}|(?:2[0-3]|3[1-5]|4[02-47-9]|5[1-3])\\d{6,7}",
  	,,,"12345678",,,[8,9],[6,7]],[,,"9(?:(?:0[1-9]|[12589]\\d)\\d\\d|7(?:[0679]\\d\\d|5(?:[01]\\d|44|77|9[67])))\\d{4}|98\\d{6}",,,,"921234567",,,[8,9]],[,,"80[01]\\d{4,6}",,,,"800123456",,,[7,8,9]],[,,"6[01459]\\d{6}|6[01]\\d{4,5}",,,,"611234",,,[6,7,8]],[,,,,,,,,,[-1]],[,,"7[45]\\d{6}",,,,"74123456",,,[8]],[,,,,,,,,,[-1]],"HR",385,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{2})(\\d{2,3})","$1 $2 $3",["6[01]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2,3})","$1 $2 $3",["8"],"0$1"],[,"(\\d)(\\d{4})(\\d{3})","$1 $2 $3",
  	["1"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[67]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["9"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[2-5]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["8"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"62\\d{6,7}|72\\d{6}",,,,"62123456",,,[8,9]],,,[,,,,,,,,,[-1]]],HT:[,[,,"(?:[2-489]\\d|55)\\d{6}",,,,,,,[8]],[,,"2(?:2\\d|5[1-5]|81|9[149])\\d{5}",,,,"22453300"],[,,"(?:[34]\\d|55)\\d{6}",,,,"34101234"],[,,"8\\d{7}",,,,"80012345"],
  	[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"9(?:[67][0-4]|8[0-3589]|9\\d)\\d{5}",,,,"98901234"],"HT",509,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{4})","$1 $2 $3",["[2-589]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],HU:[,[,,"[235-7]\\d{8}|[1-9]\\d{7}",,,,,,,[8,9],[6,7]],[,,"(?:1\\d|[27][2-9]|3[2-7]|4[24-9]|5[2-79]|6[23689]|8[2-57-9]|9[2-69])\\d{6}",,,,"12345678",,,[8],[6,7]],[,,"(?:[257]0|3[01])\\d{7}",,,,"201234567",,,[9]],[,,"(?:[48]0\\d|680[29])\\d{5}",,,,"80123456"],
  	[,,"9[01]\\d{6}",,,,"90123456",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"21\\d{7}",,,,"211234567",,,[9]],"HU",36,"00","06",,,"06",,,,[[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["1"],"(06 $1)"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["[27][2-9]|3[2-7]|4[24-9]|5[2-79]|6|8[2-57-9]|9[2-69]"],"(06 $1)"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[2-9]"],"06 $1"]],,[,,,,,,,,,[-1]],,,[,,"(?:[48]0\\d|680[29])\\d{5}"],[,,"38\\d{7}",,,,"381234567",,,[9]],,,[,,,,,,,,,[-1]]],ID:[,[,,"(?:(?:00[1-9]|8\\d)\\d{4}|[1-36])\\d{6}|00\\d{10}|[1-9]\\d{8,10}|[2-9]\\d{7}",
  	,,,,,,[7,8,9,10,11,12,13],[5,6]],[,,"2[124]\\d{7,8}|619\\d{8}|2(?:1(?:14|500)|2\\d{3})\\d{3}|61\\d{5,8}|(?:2(?:[35][1-4]|6[0-8]|7[1-6]|8\\d|9[1-8])|3(?:1|[25][1-8]|3[1-68]|4[1-3]|6[1-3568]|7[0-469]|8\\d)|4(?:0[1-589]|1[01347-9]|2[0-36-8]|3[0-24-68]|43|5[1-378]|6[1-5]|7[134]|8[1245])|5(?:1[1-35-9]|2[25-8]|3[124-9]|4[1-3589]|5[1-46]|6[1-8])|6(?:[25]\\d|3[1-69]|4[1-6])|7(?:02|[125][1-9]|[36]\\d|4[1-8]|7[0-36-9])|9(?:0[12]|1[013-8]|2[0-479]|5[125-8]|6[23679]|7[159]|8[01346]))\\d{5,8}",,,,"218350123",
  	,,[7,8,9,10,11],[5,6]],[,,"8[1-35-9]\\d{7,10}",,,,"812345678",,,[9,10,11,12]],[,,"00[17]803\\d{7}|(?:177\\d|800)\\d{5,7}|001803\\d{6}",,,,"8001234567",,,[8,9,10,11,12,13]],[,,"809\\d{7}",,,,"8091234567",,,[10]],[,,"804\\d{7}",,,,"8041234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"ID",62,"00[89]","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{3})","$1 $2 $3",["15"]],[,"(\\d{2})(\\d{5,9})","$1 $2",["2[124]|[36]1"],"(0$1)"],[,"(\\d{3})(\\d{5,7})","$1 $2",["800"],"0$1"],[,"(\\d{3})(\\d{5,8})","$1 $2",["[2-79]"],
  	"(0$1)"],[,"(\\d{3})(\\d{3,4})(\\d{3})","$1-$2-$3",["8[1-35-9]"],"0$1"],[,"(\\d{3})(\\d{6,8})","$1 $2",["1"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["804"],"0$1"],[,"(\\d{3})(\\d)(\\d{3})(\\d{3})","$1 $2 $3 $4",["80"],"0$1"],[,"(\\d{3})(\\d{4})(\\d{4,5})","$1-$2-$3",["8"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",["001"]],[,"(\\d{2})(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3 $4",["0"]]],[[,"(\\d)(\\d{3})(\\d{3})","$1 $2 $3",["15"]],[,"(\\d{2})(\\d{5,9})","$1 $2",["2[124]|[36]1"],
  	"(0$1)"],[,"(\\d{3})(\\d{5,7})","$1 $2",["800"],"0$1"],[,"(\\d{3})(\\d{5,8})","$1 $2",["[2-79]"],"(0$1)"],[,"(\\d{3})(\\d{3,4})(\\d{3})","$1-$2-$3",["8[1-35-9]"],"0$1"],[,"(\\d{3})(\\d{6,8})","$1 $2",["1"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["804"],"0$1"],[,"(\\d{3})(\\d)(\\d{3})(\\d{3})","$1 $2 $3 $4",["80"],"0$1"],[,"(\\d{3})(\\d{4})(\\d{4,5})","$1-$2-$3",["8"],"0$1"]],[,,,,,,,,,[-1]],,,[,,"001803\\d{6,7}|(?:007803\\d|8071)\\d{6}",,,,,,,[10,12,13]],[,,"(?:1500|8071\\d{3})\\d{3}",,,,
  	"8071123456",,,[7,10]],,,[,,,,,,,,,[-1]]],IE:[,[,,"(?:1\\d|[2569])\\d{6,8}|4\\d{6,9}|7\\d{8}|8\\d{8,9}",,,,,,,[7,8,9,10],[5,6]],[,,"(?:1\\d|21)\\d{6,7}|(?:2[24-9]|4(?:0[24]|5\\d|7)|5(?:0[45]|1\\d|8)|6(?:1\\d|[237-9])|9(?:1\\d|[35-9]))\\d{5}|(?:23|4(?:[1-469]|8\\d)|5[23679]|6[4-6]|7[14]|9[04])\\d{7}",,,,"2212345",,,,[5,6]],[,,"8(?:22|[35-9]\\d)\\d{6}",,,,"850123456",,,[9]],[,,"1800\\d{6}",,,,"1800123456",,,[10]],[,,"15(?:1[2-8]|[2-8]0|9[089])\\d{6}",,,,"1520123456",,,[10]],[,,"18[59]0\\d{6}",,,,"1850123456",
  	,,[10]],[,,"700\\d{6}",,,,"700123456",,,[9]],[,,"76\\d{7}",,,,"761234567",,,[9]],"IE",353,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{5})","$1 $2",["2[24-9]|47|58|6[237-9]|9[35-9]"],"(0$1)"],[,"(\\d{3})(\\d{5})","$1 $2",["[45]0"],"(0$1)"],[,"(\\d)(\\d{3,4})(\\d{4})","$1 $2 $3",["1"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[2569]|4[1-69]|7[14]"],"(0$1)"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["70"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["81"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",
  	["[78]"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["1"]],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["4"],"(0$1)"],[,"(\\d{2})(\\d)(\\d{3})(\\d{4})","$1 $2 $3 $4",["8"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,"18[59]0\\d{6}",,,,,,,[10]],[,,"818\\d{6}",,,,"818123456",,,[9]],,,[,,"88210[1-9]\\d{4}|8(?:[35-79]5\\d\\d|8(?:[013-9]\\d\\d|2(?:[01][1-9]|[2-9]\\d)))\\d{5}",,,,"8551234567",,,[10]]],IL:[,[,,"1\\d{6}(?:\\d{3,5})?|[57]\\d{8}|[1-489]\\d{7}",,,,,,,[7,8,9,10,11,12]],[,,"153\\d{8,9}|29[1-9]\\d{5}|(?:2[0-8]|[3489]\\d)\\d{6}",
  	,,,"21234567",,,[8,11,12],[7]],[,,"55410\\d{4}|5(?:(?:[02][02-9]|[149][2-9]|[36]\\d|8[3-7])\\d|5(?:01|2[2-9]|3[0-3]|4[34]|5[0-25689]|6[6-8]|7[0-267]|8[7-9]|9[1-9]))\\d{5}",,,,"502345678",,,[9]],[,,"1(?:255|80[019]\\d{3})\\d{3}",,,,"1800123456",,,[7,10]],[,,"1212\\d{4}|1(?:200|9(?:0[0-2]|19))\\d{6}",,,,"1919123456",,,[8,10]],[,,"1700\\d{6}",,,,"1700123456",,,[10]],[,,,,,,,,,[-1]],[,,"7(?:38(?:0\\d|5[09]|88)|8(?:33|55|77|81)\\d)\\d{4}|7(?:18|2[23]|3[237]|47|6[258]|7\\d|82|9[2-9])\\d{6}",,,,"771234567",
  	,,[9]],"IL",972,"0(?:0|1[2-9])","0",,,"0",,,,[[,"(\\d{4})(\\d{3})","$1-$2",["125"]],[,"(\\d{4})(\\d{2})(\\d{2})","$1-$2-$3",["121"]],[,"(\\d)(\\d{3})(\\d{4})","$1-$2-$3",["[2-489]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3",["[57]"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{3})","$1-$2-$3",["12"]],[,"(\\d{4})(\\d{6})","$1-$2",["159"]],[,"(\\d)(\\d{3})(\\d{3})(\\d{3})","$1-$2-$3-$4",["1[7-9]"]],[,"(\\d{3})(\\d{1,2})(\\d{3})(\\d{4})","$1-$2 $3-$4",["15"]]],,[,,,,,,,,,[-1]],,,[,,"1700\\d{6}",,,,,,,[10]],[,
  	,"1599\\d{6}",,,,"1599123456",,,[10]],,,[,,"151\\d{8,9}",,,,"15112340000",,,[11,12]]],IM:[,[,,"1624\\d{6}|(?:[3578]\\d|90)\\d{8}",,,,,,,[10],[6]],[,,"1624(?:230|[5-8]\\d\\d)\\d{3}",,,,"1624756789",,,,[6]],[,,"76245[06]\\d{4}|7(?:4576|[59]24\\d|624[0-4689])\\d{5}",,,,"7924123456"],[,,"808162\\d{4}",,,,"8081624567"],[,,"8(?:440[49]06|72299\\d)\\d{3}|(?:8(?:45|70)|90[0167])624\\d{4}",,,,"9016247890"],[,,,,,,,,,[-1]],[,,"70\\d{8}",,,,"7012345678"],[,,"56\\d{8}",,,,"5612345678"],"IM",44,"00","0",,,"([25-8]\\d{5})$|0",
  	"1624$1",,,,,[,,,,,,,,,[-1]],,"74576|(?:16|7[56])24",[,,,,,,,,,[-1]],[,,"3440[49]06\\d{3}|(?:3(?:08162|3\\d{4}|45624|7(?:0624|2299))|55\\d{4})\\d{4}",,,,"5512345678"],,,[,,,,,,,,,[-1]]],IN:[,[,,"(?:000800|[2-9]\\d\\d)\\d{7}|1\\d{7,12}",,,,,,,[8,9,10,11,12,13],[6,7]],[,,"2717(?:[2-7]\\d|95)\\d{4}|(?:271[0-689]|782[0-6])[2-7]\\d{5}|(?:170[24]|2(?:(?:[02][2-79]|90)\\d|80[13468])|(?:3(?:23|80)|683|79[1-7])\\d|4(?:20[24]|72[2-8])|552[1-7])\\d{6}|(?:11|33|4[04]|80)[2-7]\\d{7}|(?:342|674|788)(?:[0189][2-7]|[2-7]\\d)\\d{5}|(?:1(?:2[0-249]|3[0-25]|4[145]|[59][14]|6[014]|7[1257]|8[01346])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568]|9[14])|3(?:26|4[13]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[014-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|6(?:12|[2-47]1|5[17]|6[13]|80)|7(?:12|2[14]|3[134]|4[47]|5[15]|[67]1)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91))[2-7]\\d{6}|(?:1(?:2[35-8]|3[346-9]|4[236-9]|[59][0235-9]|6[235-9]|7[34689]|8[257-9])|2(?:1[134689]|3[24-8]|4[2-8]|5[25689]|6[2-4679]|7[3-79]|8[2-479]|9[235-9])|3(?:01|1[79]|2[1245]|4[5-8]|5[125689]|6[235-7]|7[157-9]|8[2-46-8])|4(?:1[14578]|2[5689]|3[2-467]|5[4-7]|6[35]|73|8[2689]|9[2389])|5(?:[16][146-9]|2[14-8]|3[1346]|4[14-69]|5[46]|7[2-4]|8[2-8]|9[246])|6(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[124-6])|7(?:1[013-9]|2[0235-9]|3[2679]|4[1-35689]|5[2-46-9]|[67][02-9]|8[013-7]|9[089])|8(?:1[1357-9]|2[235-8]|3[03-57-9]|4[0-24-9]|5\\d|6[2457-9]|7[1-6]|8[1256]|9[2-4]))\\d[2-7]\\d{5}",
  	,,,"7410410123",,,[10],[6,7,8]],[,,"(?:61279|7(?:887[02-9]|9(?:313|79[07-9]))|8(?:079[04-9]|(?:84|91)7[02-8]))\\d{5}|(?:6(?:12|[2-47]1|5[17]|6[13]|80)[0189]|7(?:1(?:2[0189]|9[0-5])|2(?:[14][017-9]|8[0-59])|3(?:2[5-8]|[34][017-9]|9[016-9])|4(?:1[015-9]|[29][89]|39|8[389])|5(?:[15][017-9]|2[04-9]|9[7-9])|6(?:0[0-47]|1[0-257-9]|2[0-4]|3[19]|5[4589])|70[0289]|88[089]|97[02-8])|8(?:0(?:6[67]|7[02-8])|70[017-9]|84[01489]|91[0-289]))\\d{6}|(?:7(?:31|4[47])|8(?:16|2[014]|3[126]|6[136]|7[78]|83))(?:[0189]\\d|7[02-8])\\d{5}|(?:6(?:[09]\\d|1[04679]|2[03689]|3[05-9]|4[0489]|50|6[069]|7[07]|8[7-9])|7(?:0\\d|2[0235-79]|3[05-8]|40|5[0346-8]|6[6-9]|7[1-9]|8[0-79]|9[089])|8(?:0[01589]|1[0-57-9]|2[235-9]|3[03-57-9]|[45]\\d|6[02457-9]|7[1-69]|8[0-25-9]|9[02-9])|9\\d\\d)\\d{7}|(?:6(?:(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|8[124-6])\\d|7(?:[235689]\\d|4[0189]))|7(?:1(?:[013-8]\\d|9[6-9])|28[6-8]|3(?:2[0-49]|9[2-5])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]\\d|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4\\d|5[0-367])|70[13-7]|881))[0189]\\d{5}",
  	,,,"8123456789",,,[10]],[,,"000800\\d{7}|1(?:600\\d{6}|80(?:0\\d{4,9}|3\\d{9}))",,,,"1800123456"],[,,"186[12]\\d{9}",,,,"1861123456789",,,[13]],[,,"1860\\d{7}",,,,"18603451234",,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"IN",91,"00","0",,,"0",,,,[[,"(\\d{7})","$1",["575"]],[,"(\\d{8})","$1",["5(?:0|2[23]|3[03]|[67]1|88)","5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|888)","5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|8888)"],,,1],[,"(\\d{4})(\\d{4,5})","$1 $2",["180","1800"],,,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",
  	["140"],,,1],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["11|2[02]|33|4[04]|79[1-7]|80[2-46]","11|2[02]|33|4[04]|79(?:[1-6]|7[19])|80(?:[2-4]|6[0-589])","11|2[02]|33|4[04]|79(?:[124-6]|3(?:[02-9]|1[0-24-9])|7(?:1|9[1-6]))|80(?:[2-4]|6[0-589])"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["1(?:2[0-249]|3[0-25]|4[145]|[68]|7[1257])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|5[12]|[78]1)|6(?:12|[2-4]1|5[17]|6[13]|80)|7(?:12|3[134]|4[47]|61|88)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91)|(?:43|59|75)[15]|(?:1[59]|29|67|72)[14]",
  	"1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|674|7(?:(?:2[14]|3[34]|5[15])[2-6]|61[346]|88[0-8])|8(?:70[2-6]|84[235-7]|91[3-7])|(?:1(?:29|60|8[06])|261|552|6(?:12|[2-47]1|5[17]|6[13]|80)|7(?:12|31|4[47])|8(?:16|2[014]|3[126]|6[136]|7[78]|83))[2-7]","1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|6(?:12(?:[2-6]|7[0-8])|74[2-7])|7(?:(?:2[14]|5[15])[2-6]|3171|61[346]|88(?:[2-7]|82))|8(?:70[2-6]|84(?:[2356]|7[19])|91(?:[3-6]|7[19]))|73[134][2-6]|(?:74[47]|8(?:16|2[014]|3[126]|6[136]|7[78]|83))(?:[2-6]|7[19])|(?:1(?:29|60|8[06])|261|552|6(?:[2-4]1|5[17]|6[13]|7(?:1|4[0189])|80)|7(?:12|88[01]))[2-7]"],
  	"0$1",,1],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2[2457-9]|3[2-5]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1[013-9]|28|3[129]|4[1-35689]|5[29]|6[02-5]|70)|807","1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2(?:[2457]|84|95)|3(?:[2-4]|55)|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1(?:[013-8]|9[6-9])|28[6-8]|3(?:17|2[0-49]|9[2-57])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4|5[0-367])|70[13-7])|807[19]",
  	"1(?:[2-479]|5(?:[0236-9]|5[013-9]))|[2-5]|6(?:2(?:84|95)|355|83)|73179|807(?:1|9[1-3])|(?:1552|6(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[124-6])\\d|7(?:1(?:[013-8]\\d|9[6-9])|28[6-8]|3(?:2[0-49]|9[2-57])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]\\d|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4\\d|5[0-367])|70[13-7]))[2-7]"],"0$1",,1],[,"(\\d{5})(\\d{5})","$1 $2",["[6-9]"],"0$1",,1],[,"(\\d{4})(\\d{2,4})(\\d{4})","$1 $2 $3",["1(?:6|8[06])","1(?:6|8[06]0)"],,,1],[,"(\\d{3})(\\d{3})(\\d{3})(\\d{4})",
  	"$1 $2 $3 $4",["0"]],[,"(\\d{4})(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",["18"],,,1]],[[,"(\\d{8})","$1",["5(?:0|2[23]|3[03]|[67]1|88)","5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|888)","5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|8888)"],,,1],[,"(\\d{4})(\\d{4,5})","$1 $2",["180","1800"],,,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["140"],,,1],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["11|2[02]|33|4[04]|79[1-7]|80[2-46]","11|2[02]|33|4[04]|79(?:[1-6]|7[19])|80(?:[2-4]|6[0-589])","11|2[02]|33|4[04]|79(?:[124-6]|3(?:[02-9]|1[0-24-9])|7(?:1|9[1-6]))|80(?:[2-4]|6[0-589])"],
  	"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["1(?:2[0-249]|3[0-25]|4[145]|[68]|7[1257])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|5[12]|[78]1)|6(?:12|[2-4]1|5[17]|6[13]|80)|7(?:12|3[134]|4[47]|61|88)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91)|(?:43|59|75)[15]|(?:1[59]|29|67|72)[14]","1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|674|7(?:(?:2[14]|3[34]|5[15])[2-6]|61[346]|88[0-8])|8(?:70[2-6]|84[235-7]|91[3-7])|(?:1(?:29|60|8[06])|261|552|6(?:12|[2-47]1|5[17]|6[13]|80)|7(?:12|31|4[47])|8(?:16|2[014]|3[126]|6[136]|7[78]|83))[2-7]",
  	"1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|6(?:12(?:[2-6]|7[0-8])|74[2-7])|7(?:(?:2[14]|5[15])[2-6]|3171|61[346]|88(?:[2-7]|82))|8(?:70[2-6]|84(?:[2356]|7[19])|91(?:[3-6]|7[19]))|73[134][2-6]|(?:74[47]|8(?:16|2[014]|3[126]|6[136]|7[78]|83))(?:[2-6]|7[19])|(?:1(?:29|60|8[06])|261|552|6(?:[2-4]1|5[17]|6[13]|7(?:1|4[0189])|80)|7(?:12|88[01]))[2-7]"],
  	"0$1",,1],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2[2457-9]|3[2-5]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1[013-9]|28|3[129]|4[1-35689]|5[29]|6[02-5]|70)|807","1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2(?:[2457]|84|95)|3(?:[2-4]|55)|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1(?:[013-8]|9[6-9])|28[6-8]|3(?:17|2[0-49]|9[2-57])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4|5[0-367])|70[13-7])|807[19]",
  	"1(?:[2-479]|5(?:[0236-9]|5[013-9]))|[2-5]|6(?:2(?:84|95)|355|83)|73179|807(?:1|9[1-3])|(?:1552|6(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[124-6])\\d|7(?:1(?:[013-8]\\d|9[6-9])|28[6-8]|3(?:2[0-49]|9[2-57])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]\\d|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4\\d|5[0-367])|70[13-7]))[2-7]"],"0$1",,1],[,"(\\d{5})(\\d{5})","$1 $2",["[6-9]"],"0$1",,1],[,"(\\d{4})(\\d{2,4})(\\d{4})","$1 $2 $3",["1(?:6|8[06])","1(?:6|8[06]0)"],,,1],[,"(\\d{4})(\\d{3})(\\d{3})(\\d{3})",
  	"$1 $2 $3 $4",["18"],,,1]],[,,,,,,,,,[-1]],,,[,,"1(?:600\\d{6}|800\\d{4,9})|(?:000800|18(?:03\\d\\d|6(?:0|[12]\\d\\d)))\\d{7}"],[,,"140\\d{7}",,,,"1409305260",,,[10]],,,[,,,,,,,,,[-1]]],IO:[,[,,"3\\d{6}",,,,,,,[7]],[,,"37\\d{5}",,,,"3709100"],[,,"38\\d{5}",,,,"3801234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"IO",246,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["3"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],IQ:[,[,,"(?:1|7\\d\\d)\\d{7}|[2-6]\\d{7,8}",
  	,,,,,,[8,9,10],[6,7]],[,,"1\\d{7}|(?:2[13-5]|3[02367]|4[023]|5[03]|6[026])\\d{6,7}",,,,"12345678",,,[8,9],[6,7]],[,,"7[3-9]\\d{8}",,,,"7912345678",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"IQ",964,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["1"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[2-6]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["7"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],IR:[,
  	[,,"[1-9]\\d{9}|(?:[1-8]\\d\\d|9)\\d{3,4}",,,,,,,[4,5,6,7,10],[8]],[,,"(?:1[137]|2[13-68]|3[1458]|4[145]|5[1468]|6[16]|7[1467]|8[13467])(?:[03-57]\\d{7}|[16]\\d{3}(?:\\d{4})?|[289]\\d{3}(?:\\d(?:\\d{3})?)?)|94(?:000[09]|2(?:121|[2689]0\\d)|30[0-2]\\d|4(?:111|40\\d))\\d{4}",,,,"2123456789",,,[6,7,10],[4,5,8]],[,,"9(?:(?:0(?:[0-35]\\d|4[4-6])|(?:[13]\\d|2[0-3])\\d)\\d|9(?:[0-46]\\d\\d|5[15]0|8(?:[12]\\d|88)|9(?:0[0-3]|[19]\\d|21|69|77|8[7-9])))\\d{5}",,,,"9123456789",,,[10]],[,,,,,,,,,[-1]],[,,,,,,
  	,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"IR",98,"00","0",,,"0",,,,[[,"(\\d{4,5})","$1",["96"],"0$1"],[,"(\\d{2})(\\d{4,5})","$1 $2",["(?:1[137]|2[13-68]|3[1458]|4[145]|5[1468]|6[16]|7[1467]|8[13467])[12689]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["9"],"0$1"],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["[1-8]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,"9(?:4440\\d{5}|6(?:0[12]|2[16-8]|3(?:08|[14]5|[23]|66)|4(?:0|80)|5[01]|6[89]|86|9[19]))",,,,,,,[4,5,10]],[,,"96(?:0[12]|2[16-8]|3(?:08|[14]5|[23]|66)|4(?:0|80)|5[01]|6[89]|86|9[19])",
  	,,,"9601",,,[4,5]],,,[,,,,,,,,,[-1]]],IS:[,[,,"(?:38\\d|[4-9])\\d{6}",,,,,,,[7,9]],[,,"(?:4(?:1[0-24-69]|2[0-7]|[37][0-8]|4[0-24589]|5[0-68]|6\\d|8[0-36-8])|5(?:05|[156]\\d|2[02578]|3[0-579]|4[03-7]|7[0-2578]|8[0-35-9]|9[013-689])|872)\\d{4}",,,,"4101234",,,[7]],[,,"(?:38[589]\\d\\d|6(?:1[1-8]|2[0-6]|3[026-9]|4[014679]|5[0159]|6[0-69]|70|8[06-8]|9\\d)|7(?:5[057]|[6-9]\\d)|8(?:2[0-59]|[3-69]\\d|8[238]))\\d{4}",,,,"6111234"],[,,"80[0-8]\\d{4}",,,,"8001234",,,[7]],[,,"90(?:0\\d|1[5-79]|2[015-79]|3[135-79]|4[125-7]|5[25-79]|7[1-37]|8[0-35-7])\\d{3}",
  	,,,"9001234",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"49[0-24-79]\\d{4}",,,,"4921234",,,[7]],"IS",354,"00|1(?:0(?:01|[12]0)|100)",,,,,,"00",,[[,"(\\d{3})(\\d{4})","$1 $2",["[4-9]"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["3"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"809\\d{4}",,,,"8091234",,,[7]],,,[,,"(?:689|8(?:7[18]|80)|95[48])\\d{4}",,,,"6891234",,,[7]]],IT:[,[,,"0\\d{5,10}|1\\d{8,10}|3(?:[0-8]\\d{7,10}|9\\d{7,8})|(?:55|70)\\d{8}|8\\d{5}(?:\\d{2,4})?",,,,,,,[6,7,8,9,10,11,12]],[,,"0669[0-79]\\d{1,6}|0(?:1(?:[0159]\\d|[27][1-5]|31|4[1-4]|6[1356]|8[2-57])|2\\d\\d|3(?:[0159]\\d|2[1-4]|3[12]|[48][1-6]|6[2-59]|7[1-7])|4(?:[0159]\\d|[23][1-9]|4[245]|6[1-5]|7[1-4]|81)|5(?:[0159]\\d|2[1-5]|3[2-6]|4[1-79]|6[4-6]|7[1-578]|8[3-8])|6(?:[0-57-9]\\d|6[0-8])|7(?:[0159]\\d|2[12]|3[1-7]|4[2-46]|6[13569]|7[13-6]|8[1-59])|8(?:[0159]\\d|2[3-578]|3[1-356]|[6-8][1-5])|9(?:[0159]\\d|[238][1-5]|4[12]|6[1-8]|7[1-6]))\\d{2,7}",
  	,,,"0212345678",,,[6,7,8,9,10,11]],[,,"3[1-9]\\d{8}|3[2-9]\\d{7}",,,,"3123456789",,,[9,10]],[,,"80(?:0\\d{3}|3)\\d{3}",,,,"800123456",,,[6,9]],[,,"(?:0878\\d{3}|89(?:2\\d|3[04]|4(?:[0-4]|[5-9]\\d\\d)|5[0-4]))\\d\\d|(?:1(?:44|6[346])|89(?:38|5[5-9]|9))\\d{6}",,,,"899123456",,,[6,8,9,10]],[,,"84(?:[08]\\d{3}|[17])\\d{3}",,,,"848123456",,,[6,9]],[,,"1(?:78\\d|99)\\d{6}",,,,"1781234567",,,[9,10]],[,,"55\\d{8}",,,,"5512345678",,,[10]],"IT",39,"00",,,,,,,,[[,"(\\d{4,5})","$1",["1(?:0|9[246])","1(?:0|9(?:2[2-9]|[46]))"]],
  	[,"(\\d{6})","$1",["1(?:1|92)"]],[,"(\\d{2})(\\d{4,6})","$1 $2",["0[26]"]],[,"(\\d{3})(\\d{3,6})","$1 $2",["0[13-57-9][0159]|8(?:03|4[17]|9[2-5])","0[13-57-9][0159]|8(?:03|4[17]|9(?:2|3[04]|[45][0-4]))"]],[,"(\\d{4})(\\d{2,6})","$1 $2",["0(?:[13-579][2-46-8]|8[236-8])"]],[,"(\\d{4})(\\d{4})","$1 $2",["894"]],[,"(\\d{2})(\\d{3,4})(\\d{4})","$1 $2 $3",["0[26]|5"]],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["1(?:44|[679])|[378]"]],[,"(\\d{3})(\\d{3,4})(\\d{4})","$1 $2 $3",["0[13-57-9][0159]|14"]],[,
  	"(\\d{2})(\\d{4})(\\d{5})","$1 $2 $3",["0[26]"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["0"]],[,"(\\d{3})(\\d{4})(\\d{4,5})","$1 $2 $3",["3"]]],[[,"(\\d{2})(\\d{4,6})","$1 $2",["0[26]"]],[,"(\\d{3})(\\d{3,6})","$1 $2",["0[13-57-9][0159]|8(?:03|4[17]|9[2-5])","0[13-57-9][0159]|8(?:03|4[17]|9(?:2|3[04]|[45][0-4]))"]],[,"(\\d{4})(\\d{2,6})","$1 $2",["0(?:[13-579][2-46-8]|8[236-8])"]],[,"(\\d{4})(\\d{4})","$1 $2",["894"]],[,"(\\d{2})(\\d{3,4})(\\d{4})","$1 $2 $3",["0[26]|5"]],[,"(\\d{3})(\\d{3})(\\d{3,4})",
  	"$1 $2 $3",["1(?:44|[679])|[378]"]],[,"(\\d{3})(\\d{3,4})(\\d{4})","$1 $2 $3",["0[13-57-9][0159]|14"]],[,"(\\d{2})(\\d{4})(\\d{5})","$1 $2 $3",["0[26]"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["0"]],[,"(\\d{3})(\\d{4})(\\d{4,5})","$1 $2 $3",["3"]]],[,,,,,,,,,[-1]],1,,[,,"848\\d{6}",,,,,,,[9]],[,,,,,,,,,[-1]],,,[,,"3[2-8]\\d{9,10}",,,,"33101234501",,,[11,12]]],JE:[,[,,"1534\\d{6}|(?:[3578]\\d|90)\\d{8}",,,,,,,[10],[6]],[,,"1534[0-24-8]\\d{5}",,,,"1534456789",,,,[6]],[,,"7(?:(?:(?:50|82)9|937)\\d|7(?:00[378]|97[7-9]))\\d{5}",
  	,,,"7797712345"],[,,"80(?:07(?:35|81)|8901)\\d{4}",,,,"8007354567"],[,,"(?:8(?:4(?:4(?:4(?:05|42|69)|703)|5(?:041|800))|7(?:0002|1206))|90(?:066[59]|1810|71(?:07|55)))\\d{4}",,,,"9018105678"],[,,,,,,,,,[-1]],[,,"701511\\d{4}",,,,"7015115678"],[,,"56\\d{8}",,,,"5612345678"],"JE",44,"00","0",,,"([0-24-8]\\d{5})$|0","1534$1",,,,,[,,"76(?:464|652)\\d{5}|76(?:0[0-28]|2[356]|34|4[01347]|5[49]|6[0-369]|77|8[14]|9[139])\\d{6}",,,,"7640123456"],,,[,,,,,,,,,[-1]],[,,"(?:3(?:0(?:07(?:35|81)|8901)|3\\d{4}|4(?:4(?:4(?:05|42|69)|703)|5(?:041|800))|7(?:0002|1206))|55\\d{4})\\d{4}",
  	,,,"5512345678"],,,[,,,,,,,,,[-1]]],JM:[,[,,"(?:[58]\\d\\d|658|900)\\d{7}",,,,,,,[10],[7]],[,,"8766060\\d{3}|(?:658(?:2(?:[0-8]\\d|9[0-46-9])|[3-9]\\d\\d)|876(?:52[35]|6(?:0[1-3579]|1[0235-9]|[23]\\d|40|5[06]|6[2-589]|7[0-25-9]|8[04]|9[4-9])|7(?:0[2-689]|[1-6]\\d|8[056]|9[45])|9(?:0[1-8]|1[02378]|[2-8]\\d|9[2-468])))\\d{4}",,,,"8765230123",,,,[7]],[,,"(?:658295|876(?:2(?:0[1-9]|[13-9]\\d|2[013-9])|[348]\\d\\d|5(?:0[1-9]|[1-9]\\d)|6(?:4[89]|6[67])|7(?:0[07]|7\\d|8[1-47-9]|9[0-36-9])|9(?:[01]9|9[0579])))\\d{4}",
  	,,,"8762101234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"JM",1,"011","1",,,"1",,,,,,[,,,,,,,,,[-1]],,"658|876",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,
  	,,,,[-1]]],JO:[,[,,"(?:(?:[2689]|7\\d)\\d|32|53)\\d{6}",,,,,,,[8,9]],[,,"87(?:000|90[01])\\d{3}|(?:2(?:6(?:2[0-35-9]|3[0-578]|4[24-7]|5[0-24-8]|[6-8][023]|9[0-3])|7(?:0[1-79]|10|2[014-7]|3[0-689]|4[019]|5[0-3578]))|32(?:0[1-69]|1[1-35-7]|2[024-7]|3\\d|4[0-3]|[5-7][023])|53(?:0[0-3]|[13][023]|2[0-59]|49|5[0-35-9]|6[15]|7[45]|8[1-6]|9[0-36-9])|6(?:2(?:[05]0|22)|3(?:00|33)|4(?:0[0-25]|1[2-7]|2[0569]|[38][07-9]|4[025689]|6[0-589]|7\\d|9[0-2])|5(?:[01][056]|2[034]|3[0-57-9]|4[178]|5[0-69]|6[0-35-9]|7[1-379]|8[0-68]|9[0239]))|87(?:20|7[078]|99))\\d{4}",
  	,,,"62001234",,,[8]],[,,"7(?:[78][0-25-9]|9\\d)\\d{6}",,,,"790123456",,,[9]],[,,"80\\d{6}",,,,"80012345",,,[8]],[,,"9\\d{7}",,,,"90012345",,,[8]],[,,"85\\d{6}",,,,"85012345",,,[8]],[,,"70\\d{7}",,,,"700123456",,,[9]],[,,,,,,,,,[-1]],"JO",962,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["[2356]|87"],"(0$1)"],[,"(\\d{3})(\\d{5,6})","$1 $2",["[89]"],"0$1"],[,"(\\d{2})(\\d{7})","$1 $2",["70"],"0$1"],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["7"],"0$1"]],,[,,"74(?:66|77)\\d{5}",,,,"746612345",
  	,,[9]],,,[,,,,,,,,,[-1]],[,,"8(?:10|8\\d)\\d{5}",,,,"88101234",,,[8]],,,[,,,,,,,,,[-1]]],JP:[,[,,"00[1-9]\\d{6,14}|[257-9]\\d{9}|(?:00|[1-9]\\d\\d)\\d{6}",,,,,,,[8,9,10,11,12,13,14,15,16,17]],[,,"(?:1(?:1[235-8]|2[3-6]|3[3-9]|4[2-6]|[58][2-8]|6[2-7]|7[2-9]|9[1-9])|(?:2[2-9]|[36][1-9])\\d|4(?:[2-578]\\d|6[02-8]|9[2-59])|5(?:[2-589]\\d|6[1-9]|7[2-8])|7(?:[25-9]\\d|3[4-9]|4[02-9])|8(?:[2679]\\d|3[2-9]|4[5-9]|5[1-9]|8[03-9])|9(?:[2-58]\\d|[679][1-9]))\\d{6}",,,,"312345678",,,[9]],[,,"[7-9]0[1-9]\\d{7}",
  	,,,"9012345678",,,[10]],[,,"00777(?:[01]|5\\d)\\d\\d|(?:00(?:7778|882[1245])|(?:120|800\\d)\\d\\d)\\d{4}|00(?:37|66|78)\\d{6,13}",,,,"120123456"],[,,"990\\d{6}",,,,"990123456",,,[9]],[,,,,,,,,,[-1]],[,,"60\\d{7}",,,,"601234567",,,[9]],[,,"50[1-9]\\d{7}",,,,"5012345678",,,[10]],"JP",81,"010","0",,,"(000[259]\\d{6})$|(?:(?:003768)0?)|0","$1",,,[[,"(\\d{4})(\\d{4})","$1-$2",["007","0077","00777","00777[01]"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1-$2-$3",["(?:12|57|99)0"],"0$1"],[,"(\\d{4})(\\d)(\\d{4})",
  	"$1-$2-$3",["1(?:26|3[79]|4[56]|5[4-68]|6[3-5])|499|5(?:76|97)|746|8(?:3[89]|47|51)|9(?:80|9[16])","1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:76|97)9|7468|8(?:3(?:8[7-9]|96)|477|51[2-9])|9(?:802|9(?:1[23]|69))|1(?:45|58)[67]","1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:769|979[2-69])|7468|8(?:3(?:8[7-9]|96[2457-9])|477|51[2-9])|9(?:802|9(?:1[23]|69))|1(?:45|58)[67]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3",["60"],
  	"0$1"],[,"(\\d)(\\d{4})(\\d{4})","$1-$2-$3",["[36]|4(?:2[09]|7[01])","[36]|4(?:2(?:0|9[02-69])|7(?:0[019]|1))"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3",["1(?:1|5[45]|77|88|9[69])|2(?:2[1-37]|3[0-269]|4[59]|5|6[24]|7[1-358]|8[1369]|9[0-38])|4(?:[28][1-9]|3[0-57]|[45]|6[248]|7[2-579]|9[29])|5(?:2|3[0459]|4[0-369]|5[29]|8[02389]|9[0-389])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9[2-6])|8(?:2[124589]|3[26-9]|49|51|6|7[0-468]|8[68]|9[019])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9[1-489])",
  	"1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2(?:[127]|3[014-9])|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9[19])|62|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|8[1-9]|9[29])|5(?:2|3(?:[045]|9[0-8])|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0-2469])|3(?:[29]|60)|49|51|6(?:[0-24]|36|5[0-3589]|7[23]|9[01459])|7[0-468]|8[68])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9(?:[1289]|3[34]|4[0178]))|(?:264|837)[016-9]|2(?:57|93)[015-9]|(?:25[0468]|422|838)[01]|(?:47[59]|59[89]|8(?:6[68]|9))[019]",
  	"1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2[127]|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9(?:17|99))|6(?:2|4[016-9])|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|9[29])|5(?:2|3(?:[045]|9(?:[0-58]|6[4-9]|7[0-35689]))|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0169])|3(?:[29]|60|7(?:[017-9]|6[6-8]))|49|51|6(?:[0-24]|36[2-57-9]|5(?:[0-389]|5[23])|6(?:[01]|9[178])|7(?:2[2-468]|3[78])|9[0145])|7[0-468]|8[68])|9(?:4[15]|5[138]|7[156]|8[189]|9(?:[1289]|3(?:31|4[357])|4[0178]))|(?:8294|96)[1-3]|2(?:57|93)[015-9]|(?:223|8699)[014-9]|(?:25[0468]|422|838)[01]|(?:48|8292|9[23])[1-9]|(?:47[59]|59[89]|8(?:68|9))[019]"],
  	"0$1"],[,"(\\d{3})(\\d{2})(\\d{4})","$1-$2-$3",["[14]|[289][2-9]|5[3-9]|7[2-4679]"],"0$1"],[,"(\\d{4})(\\d{2})(\\d{3,4})","$1-$2-$3",["007","0077"]],[,"(\\d{4})(\\d{2})(\\d{4})","$1-$2-$3",["008"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["800"],"0$1"],[,"(\\d{2})(\\d{4})(\\d{4})","$1-$2-$3",["[257-9]"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{3,4})","$1-$2-$3",["0"]],[,"(\\d{4})(\\d{4})(\\d{4,5})","$1-$2-$3",["0"]],[,"(\\d{4})(\\d{5})(\\d{5,6})","$1-$2-$3",["0"]],[,"(\\d{4})(\\d{6})(\\d{6,7})","$1-$2-$3",
  	["0"]]],[[,"(\\d{3})(\\d{3})(\\d{3})","$1-$2-$3",["(?:12|57|99)0"],"0$1"],[,"(\\d{4})(\\d)(\\d{4})","$1-$2-$3",["1(?:26|3[79]|4[56]|5[4-68]|6[3-5])|499|5(?:76|97)|746|8(?:3[89]|47|51)|9(?:80|9[16])","1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:76|97)9|7468|8(?:3(?:8[7-9]|96)|477|51[2-9])|9(?:802|9(?:1[23]|69))|1(?:45|58)[67]","1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:769|979[2-69])|7468|8(?:3(?:8[7-9]|96[2457-9])|477|51[2-9])|9(?:802|9(?:1[23]|69))|1(?:45|58)[67]"],
  	"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3",["60"],"0$1"],[,"(\\d)(\\d{4})(\\d{4})","$1-$2-$3",["[36]|4(?:2[09]|7[01])","[36]|4(?:2(?:0|9[02-69])|7(?:0[019]|1))"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3",["1(?:1|5[45]|77|88|9[69])|2(?:2[1-37]|3[0-269]|4[59]|5|6[24]|7[1-358]|8[1369]|9[0-38])|4(?:[28][1-9]|3[0-57]|[45]|6[248]|7[2-579]|9[29])|5(?:2|3[0459]|4[0-369]|5[29]|8[02389]|9[0-389])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9[2-6])|8(?:2[124589]|3[26-9]|49|51|6|7[0-468]|8[68]|9[019])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9[1-489])",
  	"1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2(?:[127]|3[014-9])|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9[19])|62|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|8[1-9]|9[29])|5(?:2|3(?:[045]|9[0-8])|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0-2469])|3(?:[29]|60)|49|51|6(?:[0-24]|36|5[0-3589]|7[23]|9[01459])|7[0-468]|8[68])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9(?:[1289]|3[34]|4[0178]))|(?:264|837)[016-9]|2(?:57|93)[015-9]|(?:25[0468]|422|838)[01]|(?:47[59]|59[89]|8(?:6[68]|9))[019]",
  	"1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2[127]|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9(?:17|99))|6(?:2|4[016-9])|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|9[29])|5(?:2|3(?:[045]|9(?:[0-58]|6[4-9]|7[0-35689]))|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0169])|3(?:[29]|60|7(?:[017-9]|6[6-8]))|49|51|6(?:[0-24]|36[2-57-9]|5(?:[0-389]|5[23])|6(?:[01]|9[178])|7(?:2[2-468]|3[78])|9[0145])|7[0-468]|8[68])|9(?:4[15]|5[138]|7[156]|8[189]|9(?:[1289]|3(?:31|4[357])|4[0178]))|(?:8294|96)[1-3]|2(?:57|93)[015-9]|(?:223|8699)[014-9]|(?:25[0468]|422|838)[01]|(?:48|8292|9[23])[1-9]|(?:47[59]|59[89]|8(?:68|9))[019]"],
  	"0$1"],[,"(\\d{3})(\\d{2})(\\d{4})","$1-$2-$3",["[14]|[289][2-9]|5[3-9]|7[2-4679]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["800"],"0$1"],[,"(\\d{2})(\\d{4})(\\d{4})","$1-$2-$3",["[257-9]"],"0$1"]],[,,"20\\d{8}",,,,"2012345678",,,[10]],,,[,,"00(?:777(?:[01]|(?:5|8\\d)\\d)|882[1245]\\d\\d)\\d\\d|00(?:37|66|78)\\d{6,13}"],[,,"570\\d{6}",,,,"570123456",,,[9]],,,[,,,,,,,,,[-1]]],KE:[,[,,"(?:[17]\\d\\d|900)\\d{6}|(?:2|80)0\\d{6,7}|[4-6]\\d{6,8}",,,,,,,[7,8,9,10]],[,,"(?:4[245]|5[1-79]|6[01457-9])\\d{5,7}|(?:4[136]|5[08]|62)\\d{7}|(?:[24]0|66)\\d{6,7}",
  	,,,"202012345",,,[7,8,9]],[,,"(?:1(?:0[0-6]|1[0-5]|2[014]|30)|7\\d\\d)\\d{6}",,,,"712123456",,,[9]],[,,"800[2-8]\\d{5,6}",,,,"800223456",,,[9,10]],[,,"900[02-9]\\d{5}",,,,"900223456",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"KE",254,"000","0",,,"0",,,,[[,"(\\d{2})(\\d{5,7})","$1 $2",["[24-6]"],"0$1"],[,"(\\d{3})(\\d{6})","$1 $2",["[17]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["[89]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KG:[,[,,"8\\d{9}|[235-9]\\d{8}",
  	,,,,,,[9,10],[5,6]],[,,"312(?:5[0-79]\\d|9(?:[0-689]\\d|7[0-24-9]))\\d{3}|(?:3(?:1(?:2[0-46-8]|3[1-9]|47|[56]\\d)|2(?:22|3[0-479]|6[0-7])|4(?:22|5[6-9]|6\\d)|5(?:22|3[4-7]|59|6\\d)|6(?:22|5[35-7]|6\\d)|7(?:22|3[468]|4[1-9]|59|[67]\\d)|9(?:22|4[1-8]|6\\d))|6(?:09|12|2[2-4])\\d)\\d{5}",,,,"312123456",,,[9],[5,6]],[,,"312(?:58\\d|973)\\d{3}|(?:2(?:0[0-35]|2\\d)|5[0-24-7]\\d|600|7(?:[07]\\d|55)|88[08]|9(?:12|9[05-9]))\\d{6}",,,,"700123456",,,[9]],[,,"800\\d{6,7}",,,,"800123456"],[,,,,,,,,,[-1]],[,,,,
  	,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"KG",996,"00","0",,,"0",,,,[[,"(\\d{4})(\\d{5})","$1 $2",["3(?:1[346]|[24-79])"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[235-79]|88"],"0$1"],[,"(\\d{3})(\\d{3})(\\d)(\\d{2,3})","$1 $2 $3 $4",["8"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KH:[,[,,"1\\d{9}|[1-9]\\d{7,8}",,,,,,,[8,9,10],[6,7]],[,,"23(?:4(?:[2-4]|[56]\\d)|[568]\\d\\d)\\d{4}|23[236-9]\\d{5}|(?:2[4-6]|3[2-6]|4[2-4]|[5-7][2-5])(?:(?:[237-9]|4[56]|5\\d)\\d{5}|6\\d{5,6})",
  	,,,"23756789",,,[8,9],[6,7]],[,,"(?:(?:1[28]|3[18]|9[67])\\d|6[016-9]|7(?:[07-9]|[16]\\d)|8(?:[013-79]|8\\d))\\d{6}|(?:1\\d|9[0-57-9])\\d{6}|(?:2[3-6]|3[2-6]|4[2-4]|[5-7][2-5])48\\d{5}",,,,"91234567",,,[8,9]],[,,"1800(?:1\\d|2[019])\\d{4}",,,,"1800123456",,,[10]],[,,"1900(?:1\\d|2[09])\\d{4}",,,,"1900123456",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"KH",855,"00[14-9]","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[1-9]"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["1"]]],
  	,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KI:[,[,,"(?:[37]\\d|6[0-79])\\d{6}|(?:[2-48]\\d|50)\\d{3}",,,,,,,[5,8]],[,,"(?:[24]\\d|3[1-9]|50|65(?:02[12]|12[56]|22[89]|[3-5]00)|7(?:27\\d\\d|3100|5(?:02[12]|12[56]|22[89]|[34](?:00|81)|500))|8[0-5])\\d{3}",,,,"31234"],[,,"(?:6200[01]|7(?:310[1-9]|5(?:02[03-9]|12[0-47-9]|22[0-7]|[34](?:0[1-9]|8[02-9])|50[1-9])))\\d{3}|(?:63\\d\\d|7(?:(?:[0146-9]\\d|2[0-689])\\d|3(?:[02-9]\\d|1[1-9])|5(?:[0-2][013-9]|[34][1-79]|5[1-9]|[6-9]\\d)))\\d{4}",
  	,,,"72001234",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"30(?:0[01]\\d\\d|12(?:11|20))\\d\\d",,,,"30010000",,,[8]],"KI",686,"00","0",,,"0",,,,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KM:[,[,,"[3478]\\d{6}",,,,,,,[7],[4]],[,,"7[4-7]\\d{5}",,,,"7712345",,,,[4]],[,,"[34]\\d{6}",,,,"3212345"],[,,,,,,,,,[-1]],[,,"8\\d{6}",,,,"8001234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"KM",269,"00",,,,,,,,[[,"(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3",
  	["[3478]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KN:[,[,,"(?:[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"869(?:2(?:29|36)|302|4(?:6[015-9]|70)|56[5-7])\\d{4}",,,,"8692361234",,,,[7]],[,,"869(?:48[89]|55[6-8]|66\\d|76[02-7])\\d{4}",,,,"8697652917",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,,,,,,,,[-1]],"KN",1,"011","1",,,"([2-7]\\d{6})$|1","869$1",,,,,[,,,,,,,,,[-1]],,"869",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KP:[,[,,"85\\d{6}|(?:19\\d|[2-7])\\d{7}",,,,,,,[8,10],[6,7]],[,,"(?:(?:195|2)\\d|3[19]|4[159]|5[37]|6[17]|7[39]|85)\\d{6}",,,,"21234567",,,,[6,7]],[,,"19[1-3]\\d{7}",,,,"1921234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"KP",850,"00|99","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["8"],
  	"0$1"],[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["[2-7]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["1"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,"238[02-9]\\d{4}|2(?:[0-24-9]\\d|3[0-79])\\d{5}",,,,,,,[8]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KR:[,[,,"00[1-9]\\d{8,11}|(?:[12]|5\\d{3})\\d{7}|[13-6]\\d{9}|(?:[1-6]\\d|80)\\d{7}|[3-6]\\d{4,5}|(?:00|7)0\\d{8}",,,,,,,[5,6,8,9,10,11,12,13,14],[3,4,7]],[,,"(?:2|3[1-3]|[46][1-4]|5[1-5])[1-9]\\d{6,7}|(?:3[1-3]|[46][1-4]|5[1-5])1\\d{2,3}",,,,"22123456",,,[5,6,8,9,10],
  	[3,4,7]],[,,"1(?:05(?:[0-8]\\d|9[0-6])|22[13]\\d)\\d{4,5}|1(?:0[0-46-9]|[16-9]\\d|2[013-9])\\d{6,7}",,,,"1020000000",,,[9,10]],[,,"00(?:308\\d{6,7}|798\\d{7,9})|(?:00368|80)\\d{7}",,,,"801234567",,,[9,11,12,13,14]],[,,"60[2-9]\\d{6}",,,,"602345678",,,[9]],[,,,,,,,,,[-1]],[,,"50\\d{8,9}",,,,"5012345678",,,[10,11]],[,,"70\\d{8}",,,,"7012345678",,,[10]],"KR",82,"00(?:[125689]|3(?:[46]5|91)|7(?:00|27|3|55|6[126]))","0",,,"0(8(?:[1-46-8]|5\\d\\d))?",,,,[[,"(\\d{5})","$1",["1[016-9]1","1[016-9]11","1[016-9]114"],
  	"0$1"],[,"(\\d{2})(\\d{3,4})","$1-$2",["(?:3[1-3]|[46][1-4]|5[1-5])1"],"0$1","0$CC-$1"],[,"(\\d{4})(\\d{4})","$1-$2",["1"]],[,"(\\d)(\\d{3,4})(\\d{4})","$1-$2-$3",["2"],"0$1","0$CC-$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3",["60|8"],"0$1","0$CC-$1"],[,"(\\d{2})(\\d{3,4})(\\d{4})","$1-$2-$3",["[1346]|5[1-5]"],"0$1","0$CC-$1"],[,"(\\d{2})(\\d{4})(\\d{4})","$1-$2-$3",["[57]"],"0$1","0$CC-$1"],[,"(\\d{5})(\\d{3})(\\d{3})","$1 $2 $3",["003","0030"]],[,"(\\d{2})(\\d{5})(\\d{4})","$1-$2-$3",["5"],"0$1",
  	"0$CC-$1"],[,"(\\d{5})(\\d{3,4})(\\d{4})","$1 $2 $3",["0"]],[,"(\\d{5})(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3 $4",["0"]]],[[,"(\\d{2})(\\d{3,4})","$1-$2",["(?:3[1-3]|[46][1-4]|5[1-5])1"],"0$1","0$CC-$1"],[,"(\\d{4})(\\d{4})","$1-$2",["1"]],[,"(\\d)(\\d{3,4})(\\d{4})","$1-$2-$3",["2"],"0$1","0$CC-$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3",["60|8"],"0$1","0$CC-$1"],[,"(\\d{2})(\\d{3,4})(\\d{4})","$1-$2-$3",["[1346]|5[1-5]"],"0$1","0$CC-$1"],[,"(\\d{2})(\\d{4})(\\d{4})","$1-$2-$3",["[57]"],"0$1","0$CC-$1"],
  	[,"(\\d{2})(\\d{5})(\\d{4})","$1-$2-$3",["5"],"0$1","0$CC-$1"]],[,,"15\\d{7,8}",,,,"1523456789",,,[9,10]],,,[,,"00(?:3(?:08\\d{6,7}|68\\d{7})|798\\d{7,9})",,,,,,,[11,12,13,14]],[,,"1(?:5(?:22|33|44|66|77|88|99)|6(?:[07]0|44|6[168]|88)|8(?:00|33|55|77|99))\\d{4}",,,,"15441234",,,[8]],,,[,,,,,,,,,[-1]]],KW:[,[,,"18\\d{5}|(?:[2569]\\d|41)\\d{6}",,,,,,,[7,8]],[,,"2(?:[23]\\d\\d|4(?:[1-35-9]\\d|44)|5(?:0[034]|[2-46]\\d|5[1-3]|7[1-7]))\\d{4}",,,,"22345678",,,[8]],[,,"(?:41\\d\\d|5(?:(?:[05]\\d|1[0-7]|6[56])\\d|2(?:22|5[25])|7(?:55|77)|88[58])|6(?:(?:0[034679]|5[015-9]|6\\d)\\d|1(?:00|11|66)|222|3[36]3|444|7(?:0[013-9]|[67]\\d)|888|9(?:[069]\\d|3[039]))|9(?:(?:0[09]|[4679]\\d|8[057-9])\\d|1(?:1[01]|99)|2(?:00|2\\d)|3(?:00|3[03])|5(?:00|5\\d)))\\d{4}",
  	,,,"50012345",,,[8]],[,,"18\\d{5}",,,,"1801234",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"KW",965,"00",,,,,,,,[[,"(\\d{4})(\\d{3,4})","$1 $2",["[169]|2(?:[235]|4[1-35-9])|52"]],[,"(\\d{3})(\\d{5})","$1 $2",["[245]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KY:[,[,,"(?:345|[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"345(?:2(?:22|3[23]|44|66)|333|444|6(?:23|38|40)|7(?:30|4[35-79]|6[6-9]|77)|8(?:00|1[45]|[48]8)|9(?:14|4[035-9]))\\d{4}",,,,"3452221234",
  	,,,[7]],[,,"345(?:32[1-9]|42[0-4]|5(?:1[67]|2[5-79]|4[6-9]|50|76)|649|82[56]|9(?:1[679]|2[2-9]|3[06-9]|90))\\d{4}",,,,"3453231234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002345678"],[,,"(?:345976|900[2-9]\\d\\d)\\d{4}",,,,"9002345678"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,,,,,,,,[-1]],"KY",1,"011","1",,,"([2-9]\\d{6})$|1","345$1",,,,,[,,"345849\\d{4}",,,,"3458491234"],,"345",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],KZ:[,[,,"(?:33622|8\\d{8})\\d{5}|[78]\\d{9}",,,,,,,[10,14],[5,6,7]],[,,"(?:33622|7(?:1(?:0(?:[23]\\d|4[0-3]|59|63)|1(?:[23]\\d|4[0-79]|59)|2(?:[23]\\d|59)|3(?:2\\d|3[0-79]|4[0-35-9]|59)|4(?:[24]\\d|3[013-9]|5[1-9]|97)|5(?:2\\d|3[1-9]|4[0-7]|59)|6(?:[2-4]\\d|5[19]|61)|72\\d|8(?:[27]\\d|3[1-46-9]|4[0-5]|59))|2(?:1(?:[23]\\d|4[46-9]|5[3469])|2(?:2\\d|3[0679]|46|5[12679])|3(?:[2-4]\\d|5[139])|4(?:2\\d|3[1-35-9]|59)|5(?:[23]\\d|4[0-8]|59|61)|6(?:2\\d|3[1-9]|4[0-4]|59)|7(?:[2379]\\d|40|5[279])|8(?:[23]\\d|4[0-3]|59)|9(?:2\\d|3[124578]|59))))\\d{5}",
  	,,,"7123456789",,,[10],[5,6,7]],[,,"7(?:0[0-25-8]|47|6[0-4]|7[15-8]|85)\\d{7}",,,,"7710009998",,,[10]],[,,"8(?:00|108\\d{3})\\d{7}",,,,"8001234567"],[,,"809\\d{7}",,,,"8091234567",,,[10]],[,,,,,,,,,[-1]],[,,"808\\d{7}",,,,"8081234567",,,[10]],[,,"751\\d{7}",,,,"7511234567",,,[10]],"KZ",7,"810","8",,,"8",,"8~10",,,,[,,,,,,,,,[-1]],,"33|7",[,,"751\\d{7}",,,,,,,[10]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],LA:[,[,,"[23]\\d{9}|3\\d{8}|(?:[235-8]\\d|41)\\d{6}",,,,,,,[8,9,10],[6]],[,,"(?:2[13]|[35-7][14]|41|8[1468])\\d{6}",
  	,,,"21212862",,,[8],[6]],[,,"(?:20(?:[2359]\\d|7[6-8]|88)|302\\d)\\d{6}",,,,"2023123456",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"LA",856,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["2[13]|3[14]|[4-8]"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3 $4",["30[013-9]"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3 $4",["[23]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"30[013-9]\\d{6}",,,,"301234567",,,[9]],,,[,,,,,,
  	,,,[-1]]],LB:[,[,,"[27-9]\\d{7}|[13-9]\\d{6}",,,,,,,[7,8]],[,,"7(?:62|8[0-7]|9[04-9])\\d{4}|(?:[14-69]\\d|2(?:[14-69]\\d|[78][1-9])|7[2-57]|8[02-9])\\d{5}",,,,"1123456"],[,,"793(?:[01]\\d|2[0-4])\\d{3}|(?:(?:3|81)\\d|7(?:[01]\\d|6[013-9]|8[89]|9[12]))\\d{5}",,,,"71123456"],[,,,,,,,,,[-1]],[,,"9[01]\\d{6}",,,,"90123456",,,[8]],[,,"80\\d{6}",,,,"80123456",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"LB",961,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{3})","$1 $2 $3",["[13-69]|7(?:[2-57]|62|8[0-7]|9[04-9])|8[02-9]"],
  	"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["[27-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],LC:[,[,,"(?:[58]\\d\\d|758|900)\\d{7}",,,,,,,[10],[7]],[,,"758(?:234|4(?:30|5\\d|6[2-9]|8[0-2])|57[0-2]|(?:63|75)8)\\d{4}",,,,"7584305678",,,,[7]],[,,"758(?:28[4-7]|384|4(?:6[01]|8[4-9])|5(?:1[89]|20|84)|7(?:1[2-9]|2\\d|3[0-3])|812)\\d{4}",,,,"7582845678",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],
  	[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"LC",1,"011","1",,,"([2-8]\\d{6})$|1","758$1",,,,,[,,,,,,,,,[-1]],,"758",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],LI:[,[,,"[68]\\d{8}|(?:[2378]\\d|90)\\d{5}",,,,,,,[7,9]],[,,"(?:2(?:01|1[27]|2[02]|3\\d|6[02-578]|96)|3(?:[24]0|33|7[0135-7]|8[048]|9[0269]))\\d{4}",
  	,,,"2345678",,,[7]],[,,"(?:6(?:(?:4[5-9]|5[0-4])\\d|6(?:[0245]\\d|[17]0|3[7-9]))\\d|7(?:[37-9]\\d|42|56))\\d{4}",,,,"660234567"],[,,"8002[28]\\d\\d|80(?:05\\d|9)\\d{4}",,,,"8002222"],[,,"90(?:02[258]|1(?:23|3[14])|66[136])\\d\\d",,,,"9002222",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"LI",423,"00","0",,,"(1001)|0",,,,[[,"(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3",["[2379]|8(?:0[09]|7)","[2379]|8(?:0(?:02|9)|7)"],,"$CC $1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["8"]],[,"(\\d{2})(\\d{3})(\\d{4})",
  	"$1 $2 $3",["69"],,"$CC $1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["6"],,"$CC $1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"870(?:28|87)\\d\\d",,,,"8702812",,,[7]],,,[,,"697(?:42|56|[78]\\d)\\d{4}",,,,"697861234",,,[9]]],LK:[,[,,"[1-9]\\d{8}",,,,,,,[9],[7]],[,,"(?:12[2-9]|602|8[12]\\d|9(?:1\\d|22|9[245]))\\d{6}|(?:11|2[13-7]|3[1-8]|4[157]|5[12457]|6[35-7])[2-57]\\d{6}",,,,"112345678",,,,[7]],[,,"7(?:[0-25-8]\\d|4[0-4])\\d{6}",,,,"712345678"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,
  	,,,,,[-1]],[,,,,,,,,,[-1]],"LK",94,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["7"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[1-689]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"1973\\d{5}",,,,"197312345"],,,[,,,,,,,,,[-1]]],LR:[,[,,"(?:[25]\\d|33|77|88)\\d{7}|(?:2\\d|[4-6])\\d{6}",,,,,,,[7,8,9]],[,,"2\\d{7}",,,,"21234567",,,[8]],[,,"(?:(?:(?:22|33)0|555|(?:77|88)\\d)\\d|4[67])\\d{5}|[56]\\d{6}",,,,"770123456",,,[7,9]],[,,,,,,,,,[-1]],[,,"332(?:02|[34]\\d)\\d{4}",,,,"332021234",
  	,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"LR",231,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{3})","$1 $2 $3",["[4-6]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["2"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[23578]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],LS:[,[,,"(?:[256]\\d\\d|800)\\d{5}",,,,,,,[8]],[,,"2\\d{7}",,,,"22123456"],[,,"[56]\\d{7}",,,,"50123456"],[,,"800[256]\\d{4}",,,,"80021234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,
  	,,[-1]],[,,,,,,,,,[-1]],"LS",266,"00",,,,,,,,[[,"(\\d{4})(\\d{4})","$1 $2",["[2568]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],LT:[,[,,"(?:[3469]\\d|52|[78]0)\\d{6}",,,,,,,[8]],[,,"(?:3[1478]|4[124-6]|52)\\d{6}",,,,"31234567"],[,,"6\\d{7}",,,,"61234567"],[,,"80[02]\\d{5}",,,,"80012345"],[,,"9(?:0[0239]|10)\\d{5}",,,,"90012345"],[,,"808\\d{5}",,,,"80812345"],[,,"70[05]\\d{5}",,,,"70012345"],[,,"[89]01\\d{5}",,,,"80123456"],"LT",370,"00","8",,,"[08]",,,,[[,"(\\d)(\\d{3})(\\d{4})",
  	"$1 $2 $3",["52[0-7]"],"(8-$1)",,1],[,"(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3",["[7-9]"],"8 $1",,1],[,"(\\d{2})(\\d{6})","$1 $2",["37|4(?:[15]|6[1-8])"],"(8-$1)",,1],[,"(\\d{3})(\\d{5})","$1 $2",["[3-6]"],"(8-$1)",,1]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"70[67]\\d{5}",,,,"70712345"],,,[,,,,,,,,,[-1]]],LU:[,[,,"35[013-9]\\d{4,8}|6\\d{8}|35\\d{2,4}|(?:[2457-9]\\d|3[0-46-9])\\d{2,9}",,,,,,,[4,5,6,7,8,9,10,11]],[,,"(?:35[013-9]|80[2-9]|90[89])\\d{1,8}|(?:2[2-9]|3[0-46-9]|[457]\\d|8[13-9]|9[2-579])\\d{2,9}",
  	,,,"27123456"],[,,"6(?:[269][18]|5[1568]|7[189]|81)\\d{6}",,,,"628123456",,,[9]],[,,"800\\d{5}",,,,"80012345",,,[8]],[,,"90[015]\\d{5}",,,,"90012345",,,[8]],[,,"801\\d{5}",,,,"80112345",,,[8]],[,,,,,,,,,[-1]],[,,"20(?:1\\d{5}|[2-689]\\d{1,7})",,,,"20201234",,,[4,5,6,7,8,9,10]],"LU",352,"00",,,,"(15(?:0[06]|1[12]|[35]5|4[04]|6[26]|77|88|99)\\d)",,,,[[,"(\\d{2})(\\d{3})","$1 $2",["2(?:0[2-689]|[2-9])|[3-57]|8(?:0[2-9]|[13-9])|9(?:0[89]|[2-579])"],,"$CC $1"],[,"(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",["2(?:0[2-689]|[2-9])|[3-57]|8(?:0[2-9]|[13-9])|9(?:0[89]|[2-579])"],
  	,"$CC $1"],[,"(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3",["20[2-689]"],,"$CC $1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})","$1 $2 $3 $4",["2(?:[0367]|4[3-8])"],,"$CC $1"],[,"(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3",["80[01]|90[015]"],,"$CC $1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3 $4",["20"],,"$CC $1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["6"],,"$CC $1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})","$1 $2 $3 $4 $5",["2(?:[0367]|4[3-8])"],,"$CC $1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{1,5})","$1 $2 $3 $4",
  	["[3-57]|8[13-9]|9(?:0[89]|[2-579])|(?:2|80)[2-9]"],,"$CC $1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],LV:[,[,,"(?:[268]\\d|90)\\d{6}",,,,,,,[8]],[,,"6\\d{7}",,,,"63123456"],[,,"23(?:23[0-57-9]|33[0238])\\d{3}|2(?:[0-24-9]\\d\\d|3(?:0[07]|[14-9]\\d|2[024-9]|3[0-24-9]))\\d{4}",,,,"21234567"],[,,"80\\d{6}",,,,"80123456"],[,,"90\\d{6}",,,,"90123456"],[,,"81\\d{6}",,,,"81123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"LV",371,"00",,,,,,,,[[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",
  	["[269]|8[01]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],LY:[,[,,"[2-9]\\d{8}",,,,,,,[9],[7]],[,,"(?:2(?:0[56]|[1-6]\\d|7[124579]|8[124])|3(?:1\\d|2[2356])|4(?:[17]\\d|2[1-357]|5[2-4]|8[124])|5(?:[1347]\\d|2[1-469]|5[13-5]|8[1-4])|6(?:[1-479]\\d|5[2-57]|8[1-5])|7(?:[13]\\d|2[13-79])|8(?:[124]\\d|5[124]|84))\\d{6}",,,,"212345678",,,,[7]],[,,"9[1-6]\\d{7}",,,,"912345678"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"LY",218,"00","0",
  	,,"0",,,,[[,"(\\d{2})(\\d{7})","$1-$2",["[2-9]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MA:[,[,,"[5-8]\\d{8}",,,,,,,[9]],[,,"5293[01]\\d{4}|5(?:2(?:[0-25-7]\\d|3[1-578]|4[02-46-8]|8[0235-7]|9[0-289])|3(?:[0-47]\\d|5[02-9]|6[02-8]|8[0189]|9[3-9])|(?:4[067]|5[03])\\d)\\d{5}",,,,"520123456"],[,,"(?:6(?:[0-79]\\d|8[0-247-9])|7(?:[017]\\d|2[0-2]|6[0-8]|8[0-3]))\\d{6}",,,,"650123456"],[,,"80\\d{7}",,,,"801234567"],[,,"89\\d{7}",,,,"891234567"],[,,,,,,,,,[-1]],[,,,
  	,,,,,,[-1]],[,,"592(?:4[0-2]|93)\\d{4}",,,,"592401234"],"MA",212,"00","0",,,"0",,,,[[,"(\\d{5})(\\d{4})","$1-$2",["5(?:29|38)","5(?:29[1289]|389)","529(?:1[1-46-9]|2[013-8]|90)|5(?:298|389)[0-46-9]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["5[45]"],"0$1"],[,"(\\d{4})(\\d{5})","$1-$2",["5(?:2[2-489]|3[5-9]|9)|892","5(?:2(?:[2-49]|8[235-9])|3[5-9]|9)|892"],"0$1"],[,"(\\d{2})(\\d{7})","$1-$2",["8"],"0$1"],[,"(\\d{3})(\\d{6})","$1-$2",["[5-7]"],"0$1"]],,[,,,,,,,,,[-1]],1,,[,,,,,,,,
  	,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MC:[,[,,"(?:[3489]|6\\d)\\d{7}",,,,,,,[8,9]],[,,"(?:870|9[2-47-9]\\d)\\d{5}",,,,"99123456",,,[8]],[,,"4(?:[46]\\d|5[1-9])\\d{5}|(?:3|6\\d)\\d{7}",,,,"612345678"],[,,"(?:800|90\\d)\\d{5}",,,,"90123456",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"MC",377,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3})(\\d{2})","$1 $2 $3",["87"]],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["4"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[389]"]],
  	[,"(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5",["6"],"0$1"]],[[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["4"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[389]"]],[,"(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5",["6"],"0$1"]],[,,,,,,,,,[-1]],,,[,,"8[07]0\\d{5}",,,,,,,[8]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MD:[,[,,"(?:[235-7]\\d|[89]0)\\d{6}",,,,,,,[8]],[,,"(?:(?:2[1-9]|3[1-79])\\d|5(?:33|5[257]))\\d{5}",,,,"22212345"],[,,"562\\d{5}|(?:6\\d|7[16-9])\\d{6}",,,,"62112345"],
  	[,,"800\\d{5}",,,,"80012345"],[,,"90[056]\\d{5}",,,,"90012345"],[,,"808\\d{5}",,,,"80812345"],[,,,,,,,,,[-1]],[,,"3[08]\\d{6}",,,,"30123456"],"MD",373,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{5})","$1 $2",["[89]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["22|3"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3",["[25-7]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"803\\d{5}",,,,"80312345"],,,[,,,,,,,,,[-1]]],ME:[,[,,"(?:20|[3-79]\\d)\\d{6}|80\\d{6,7}",,,,,,,[8,9],[6]],[,,"(?:20[2-8]|3(?:[0-2][2-7]|3[24-7])|4(?:0[2-467]|1[2467])|5(?:0[2467]|1[24-7]|2[2-467]))\\d{5}",
  	,,,"30234567",,,[8],[6]],[,,"6(?:[07-9]\\d|3[024]|6[0-25])\\d{5}",,,,"67622901",,,[8]],[,,"80(?:[0-2578]|9\\d)\\d{5}",,,,"80080002"],[,,"9(?:4[1568]|5[178])\\d{5}",,,,"94515151",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"78[1-49]\\d{5}",,,,"78108780",,,[8]],"ME",382,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[2-9]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"77[1-9]\\d{5}",,,,"77273012",,,[8]],,,[,,,,,,,,,[-1]]],MF:[,[,,"590\\d{6}|(?:69|80|9\\d)\\d{7}",,,,,,,[9]],[,,"590(?:0[079]|[14]3|[27][79]|3[03-7]|5[0-268]|87)\\d{4}",
  	,,,"590271234"],[,,"69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))\\d{4}",,,,"690001234"],[,,"80[0-5]\\d{6}",,,,"800012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"9(?:(?:395|76[018])\\d|475[0-5])\\d{4}",,,,"976012345"],"MF",590,"00","0",,,"0",,,,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MG:[,[,,"[23]\\d{8}",,,,,,,[9],[7]],[,,"2072[29]\\d{4}|20(?:2\\d|4[47]|5[3467]|6[279]|7[35]|8[268]|9[245])\\d{5}",,,,"202123456",,,,[7]],[,,"3[2-47-9]\\d{7}",,,,"321234567"],[,,,,,,,,,
  	[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"22\\d{7}",,,,"221234567"],"MG",261,"00","0",,,"([24-9]\\d{6})$|0","20$1",,,[[,"(\\d{2})(\\d{2})(\\d{3})(\\d{2})","$1 $2 $3 $4",["[23]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MH:[,[,,"329\\d{4}|(?:[256]\\d|45)\\d{5}",,,,,,,[7]],[,,"(?:247|45[78]|528|625)\\d{4}",,,,"2471234"],[,,"(?:(?:23|54)5|329|45[356])\\d{4}",,,,"2351234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"635\\d{4}",
  	,,,"6351234"],"MH",692,"011","1",,,"1",,,,[[,"(\\d{3})(\\d{4})","$1-$2",["[2-6]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MK:[,[,,"[2-578]\\d{7}",,,,,,,[8],[6,7]],[,,"(?:(?:2(?:62|77)0|3444)\\d|4[56]440)\\d{3}|(?:34|4[357])700\\d{3}|(?:2(?:[0-3]\\d|5[0-578]|6[01]|82)|3(?:1[3-68]|[23][2-68]|4[23568])|4(?:[23][2-68]|4[3-68]|5[2568]|6[25-8]|7[24-68]|8[4-68]))\\d{5}",,,,"22012345",,,,[6,7]],[,,"7(?:3555|(?:474|9[019]7)7)\\d{3}|7(?:[0-25-8]\\d\\d|3(?:[1-48]\\d|7[01578])|4(?:2\\d|60|7[01578])|9(?:[2-4]\\d|5[01]|7[015]))\\d{4}",
  	,,,"72345678"],[,,"800\\d{5}",,,,"80012345"],[,,"5\\d{7}",,,,"50012345"],[,,"8(?:0[1-9]|[1-9]\\d)\\d{5}",,,,"80123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"MK",389,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["2|34[47]|4(?:[37]7|5[47]|64)"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["[347]"],"0$1"],[,"(\\d{3})(\\d)(\\d{2})(\\d{2})","$1 $2 $3 $4",["[58]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],ML:[,[,,"[24-9]\\d{7}",,,,,,,[8]],[,,"2(?:07[0-8]|12[67])\\d{4}|(?:2(?:02|1[4-689])|4(?:0[0-4]|4[1-39]))\\d{5}",
  	,,,"20212345"],[,,"2(?:0(?:01|79)|17\\d)\\d{4}|(?:5[01]|[679]\\d|8[2-49])\\d{6}",,,,"65012345"],[,,"80\\d{6}",,,,"80012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"ML",223,"00",,,,,,,,[[,"(\\d{4})","$1",["67[057-9]|74[045]","67(?:0[09]|[59]9|77|8[89])|74(?:0[02]|44|55)"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[24-9]"]]],[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[24-9]"]]],[,,,,,,,,,[-1]],,,[,,"80\\d{6}"],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MM:[,
  	[,,"1\\d{5,7}|95\\d{6}|(?:[4-7]|9[0-46-9])\\d{6,8}|(?:2|8\\d)\\d{5,8}",,,,,,,[6,7,8,9,10],[5]],[,,"(?:1(?:(?:2\\d|3[56]|[89][0-6])\\d|4(?:2[29]|62|7[0-2]|83)|6)|2(?:2(?:00|8[34])|4(?:0\\d|[26]2|7[0-2]|83)|51\\d\\d)|4(?:2(?:2\\d\\d|48[013])|3(?:20\\d|4(?:70|83)|56)|420\\d|5470)|6(?:0(?:[23]|88\\d)|(?:124|[56]2\\d)\\d|2472|3(?:20\\d|470)|4(?:2[04]\\d|472)|7(?:(?:3\\d|8[01459])\\d|4[67]0)))\\d{4}|5(?:2(?:2\\d{5,6}|47[02]\\d{4})|(?:3472|4(?:2(?:1|86)|470)|522\\d|6(?:20\\d|483)|7(?:20\\d|48[01])|8(?:20\\d|47[02])|9(?:20\\d|470))\\d{4})|7(?:(?:0470|4(?:25\\d|470)|5(?:202|470|96\\d))\\d{4}|1(?:20\\d{4,5}|4(?:70|83)\\d{4}))|8(?:1(?:2\\d{5,6}|4(?:10|7[01]\\d)\\d{3})|2(?:2\\d{5,6}|(?:320|490\\d)\\d{3})|(?:3(?:2\\d\\d|470)|4[24-7]|5(?:(?:2\\d|51)\\d|4(?:[1-35-9]\\d|4[0-57-9]))|6[23])\\d{4})|(?:1[2-6]\\d|4(?:2[24-8]|3[2-7]|[46][2-6]|5[3-5])|5(?:[27][2-8]|3[2-68]|4[24-8]|5[23]|6[2-4]|8[24-7]|9[2-7])|6(?:[19]20|42[03-6]|(?:52|7[45])\\d)|7(?:[04][24-8]|[15][2-7]|22|3[2-4])|8(?:1[2-689]|2[2-8]|[35]2\\d))\\d{4}|25\\d{5,6}|(?:2[2-9]|6(?:1[2356]|[24][2-6]|3[24-6]|5[2-4]|6[2-8]|7[235-7]|8[245]|9[24])|8(?:3[24]|5[245]))\\d{4}",
  	,,,"1234567",,,[6,7,8,9],[5]],[,,"(?:17[01]|9(?:2(?:[0-4]|[56]\\d\\d)|(?:3(?:[0-36]|4\\d)|(?:6\\d|8[89]|9[4-8])\\d|7(?:3|40|[5-9]\\d))\\d|4(?:(?:[0245]\\d|[1379])\\d|88)|5[0-6])\\d)\\d{4}|9[69]1\\d{6}|9(?:[68]\\d|9[089])\\d{5}",,,,"92123456",,,[7,8,9,10]],[,,"80080(?:0[1-9]|2\\d)\\d{3}",,,,"8008001234",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"1333\\d{4}|[12]468\\d{4}",,,,"13331234",,,[8]],"MM",95,"00","0",,,"0",,,,[[,"(\\d)(\\d{2})(\\d{3})","$1 $2 $3",["16|2"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{3})",
  	"$1 $2 $3",["[45]|6(?:0[23]|[1-689]|7[235-7])|7(?:[0-4]|5[2-7])|8[1-6]"],"0$1"],[,"(\\d)(\\d{3})(\\d{3,4})","$1 $2 $3",["[12]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[4-7]|8[1-35]"],"0$1"],[,"(\\d)(\\d{3})(\\d{4,6})","$1 $2 $3",["9(?:2[0-4]|[35-9]|4[137-9])"],"0$1"],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["2"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["8"],"0$1"],[,"(\\d)(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",["92"],"0$1"],[,"(\\d)(\\d{5})(\\d{4})","$1 $2 $3",["9"],"0$1"]],,[,,,
  	,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MN:[,[,,"[12]\\d{7,9}|[5-9]\\d{7}",,,,,,,[8,9,10],[4,5,6]],[,,"[12]2[1-3]\\d{5,6}|(?:(?:[12](?:1|27)|5[368])\\d\\d|7(?:0(?:[0-5]\\d|7[078]|80)|128))\\d{4}|[12](?:3[2-8]|4[2-68]|5[1-4689])\\d{6,7}",,,,"53123456",,,,[4,5,6]],[,,"(?:83[01]|92[039])\\d{5}|(?:5[05]|6[069]|8[015689]|9[013-9])\\d{6}",,,,"88123456",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"712[0-79]\\d{4}|7(?:1[013-9]|[25-9]\\d)\\d{5}",,,,"75123456",
  	,,[8]],"MN",976,"001","0",,,"0",,,,[[,"(\\d{2})(\\d{2})(\\d{4})","$1 $2 $3",["[12]1"],"0$1"],[,"(\\d{4})(\\d{4})","$1 $2",["[5-9]"]],[,"(\\d{3})(\\d{5,6})","$1 $2",["[12]2[1-3]"],"0$1"],[,"(\\d{4})(\\d{5,6})","$1 $2",["[12](?:27|3[2-8]|4[2-68]|5[1-4689])","[12](?:27|3[2-8]|4[2-68]|5[1-4689])[0-3]"],"0$1"],[,"(\\d{5})(\\d{4,5})","$1 $2",["[12]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MO:[,[,,"0800\\d{3}|(?:28|[68]\\d)\\d{6}",,,,,,,[7,8]],[,,"(?:28[2-9]|8(?:11|[2-57-9]\\d))\\d{5}",
  	,,,"28212345",,,[8]],[,,"6800[0-79]\\d{3}|6(?:[235]\\d\\d|6(?:0[0-5]|[1-9]\\d)|8(?:0[1-9]|[14-8]\\d|2[5-9]|[39][0-4]))\\d{4}",,,,"66123456",,,[8]],[,,"0800\\d{3}",,,,"0800501",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"MO",853,"00",,,,,,,,[[,"(\\d{4})(\\d{3})","$1 $2",["0"]],[,"(\\d{4})(\\d{4})","$1 $2",["[268]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MP:[,[,,"[58]\\d{9}|(?:67|90)0\\d{7}",,,,,,,[10],[7]],[,,"670(?:2(?:3[3-7]|56|8[4-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}",
  	,,,"6702345678",,,,[7]],[,,"670(?:2(?:3[3-7]|56|8[4-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}",,,,"6702345678",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,,,,,,,,[-1]],"MP",1,"011","1",,,"([2-9]\\d{6})$|1","670$1",,1,,,[,,,,,,,,,[-1]],,"670",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MQ:[,[,,"596\\d{6}|(?:69|80|9\\d)\\d{7}",,,,,,,[9]],[,,"596(?:[03-7]\\d|10|2[7-9]|8[0-39]|9[04-9])\\d{4}",,,,"596301234"],[,,"69(?:6(?:[0-46-9]\\d|5[0-6])|727)\\d{4}",,,,"696201234"],[,,"80[0-5]\\d{6}",,,,"800012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"9(?:397[0-2]|477[0-5]|76(?:6\\d|7[0-367]))\\d{4}",,,,"976612345"],"MQ",596,
  	"00","0",,,"0",,,,[[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[569]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["8"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MR:[,[,,"(?:[2-4]\\d\\d|800)\\d{5}",,,,,,,[8]],[,,"(?:25[08]|35\\d|45[1-7])\\d{5}",,,,"35123456"],[,,"[2-4][0-46-9]\\d{6}",,,,"22123456"],[,,"800\\d{5}",,,,"80012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"MR",222,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
  	"$1 $2 $3 $4",["[2-48]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MS:[,[,,"(?:[58]\\d\\d|664|900)\\d{7}",,,,,,,[10],[7]],[,,"6644(?:1[0-3]|91)\\d{4}",,,,"6644912345",,,,[7]],[,,"664(?:3(?:49|9[1-6])|49[2-6])\\d{4}",,,,"6644923456",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,,,,,,,,[-1]],"MS",1,"011","1",,,"([34]\\d{6})$|1","664$1",,,,,[,,,,,,,,,[-1]],,"664",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MT:[,[,,"3550\\d{4}|(?:[2579]\\d\\d|800)\\d{5}",,,,,,,[8]],[,,"20(?:3[1-4]|6[059])\\d{4}|2(?:0[19]|[1-357]\\d|60)\\d{5}",,,,"21001234"],[,,"(?:7(?:210|[79]\\d\\d)|9(?:[29]\\d\\d|69[67]|8(?:1[1-3]|89|97)))\\d{4}",,,,"96961234"],[,,"800(?:02|[3467]\\d)\\d{3}",,,,"80071234"],[,,"5(?:0(?:0(?:37|43)|(?:6\\d|70|9[0168])\\d)|[12]\\d0[1-5])\\d{3}",,,,
  	"50037123"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"3550\\d{4}",,,,"35501234"],"MT",356,"00",,,,,,,,[[,"(\\d{4})(\\d{4})","$1 $2",["[2357-9]"]]],,[,,"7117\\d{4}",,,,"71171234"],,,[,,,,,,,,,[-1]],[,,"501\\d{5}",,,,"50112345"],,,[,,,,,,,,,[-1]]],MU:[,[,,"(?:[57]|8\\d\\d)\\d{7}|[2-468]\\d{6}",,,,,,,[7,8,10]],[,,"(?:2(?:[0346-8]\\d|1[0-7])|4(?:[013568]\\d|2[4-8])|54(?:[3-5]\\d|71)|6\\d\\d|8(?:14|3[129]))\\d{4}",,,,"54480123",,,[7,8]],[,,"5(?:4(?:2[1-389]|7[1-9])|87[15-8])\\d{4}|(?:5(?:2[5-9]|4[3-689]|[57]\\d|8[0-689]|9[0-8])|7(?:0[0-2]|3[013]))\\d{5}",
  	,,,"52512345",,,[8]],[,,"802\\d{7}|80[0-2]\\d{4}",,,,"8001234",,,[7,10]],[,,"30\\d{5}",,,,"3012345",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"3(?:20|9\\d)\\d{4}",,,,"3201234",,,[7]],"MU",230,"0(?:0|[24-7]0|3[03])",,,,,,"020",,[[,"(\\d{3})(\\d{4})","$1 $2",["[2-46]|8[013]"]],[,"(\\d{4})(\\d{4})","$1 $2",["[57]"]],[,"(\\d{5})(\\d{5})","$1 $2",["8"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MV:[,[,,"(?:800|9[0-57-9]\\d)\\d{7}|[34679]\\d{6}",,,,,,,[7,10]],[,,"(?:3(?:0[0-3]|3[0-59])|6(?:[58][024689]|6[024-68]|7[02468]))\\d{4}",
  	,,,"6701234",,,[7]],[,,"(?:46[46]|[79]\\d\\d)\\d{4}",,,,"7712345",,,[7]],[,,"800\\d{7}",,,,"8001234567",,,[10]],[,,"900\\d{7}",,,,"9001234567",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"MV",960,"0(?:0|19)",,,,,,"00",,[[,"(\\d{3})(\\d{4})","$1-$2",["[34679]"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["[89]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"4(?:0[01]|50)\\d{4}",,,,"4001234",,,[7]],,,[,,,,,,,,,[-1]]],MW:[,[,,"(?:[1289]\\d|31|77)\\d{7}|1\\d{6}",,,,,,,[7,9]],[,,"(?:1[2-9]|2[12]\\d\\d)\\d{5}",
  	,,,"1234567"],[,,"111\\d{6}|(?:31|77|[89][89])\\d{7}",,,,"991234567",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"MW",265,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{3})","$1 $2 $3",["1[2-9]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["2"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[137-9]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MX:[,[,,"1(?:(?:[27]2|44|87|99)[1-9]|65[0-689])\\d{7}|(?:1(?:[01]\\d|2[13-9]|[35][1-9]|4[0-35-9]|6[0-46-9]|7[013-9]|8[1-69]|9[1-8])|[2-9]\\d)\\d{8}",
  	,,,,,,[10,11],[7,8]],[,,"657[12]\\d{6}|(?:2(?:0[01]|2\\d|3[1-35-8]|4[13-9]|7[1-689]|8[1-578]|9[467])|3(?:1[1-79]|[2458][1-9]|3\\d|7[1-8]|9[1-5])|4(?:1[1-57-9]|[25-7][1-9]|3[1-8]|4\\d|8[1-35-9]|9[2-689])|5(?:[56]\\d|88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-3689]|6[1-57-9]|7[1-7]|8[67]|9[4-8])|7(?:[13467][1-9]|2\\d|5[13-9]|8[1-69]|9[17])|8(?:1\\d|2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[0-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|6[1-9]|7[12]|8[1-8]|9\\d))\\d{7}",,,,"2001234567",,,[10],[7,8]],
  	[,,"657[12]\\d{6}|(?:1(?:2(?:2[1-9]|3[1-35-8]|4[13-9]|7[1-689]|8[1-578]|9[467])|3(?:1[1-79]|[2458][1-9]|3\\d|7[1-8]|9[1-5])|4(?:1[1-57-9]|[24-7][1-9]|3[1-8]|8[1-35-9]|9[2-689])|5(?:[56]\\d|88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-3689]|6[1-57-9]|7[1-7]|8[67]|9[4-8])|7(?:[1-467][1-9]|5[13-9]|8[1-69]|9[17])|8(?:1\\d|2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[1-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|[69][1-9]|7[12]|8[1-8]))|2(?:2\\d|3[1-35-8]|4[13-9]|7[1-689]|8[1-578]|9[467])|3(?:1[1-79]|[2458][1-9]|3\\d|7[1-8]|9[1-5])|4(?:1[1-57-9]|[25-7][1-9]|3[1-8]|4\\d|8[1-35-9]|9[2-689])|5(?:[56]\\d|88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-3689]|6[1-57-9]|7[1-7]|8[67]|9[4-8])|7(?:[13467][1-9]|2\\d|5[13-9]|8[1-69]|9[17])|8(?:1\\d|2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[0-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|6[1-9]|7[12]|8[1-8]|9\\d))\\d{7}",
  	,,,"12221234567",,,,[7,8]],[,,"8(?:00|88)\\d{7}",,,,"8001234567",,,[10]],[,,"900\\d{7}",,,,"9001234567",,,[10]],[,,"300\\d{7}",,,,"3001234567",,,[10]],[,,"500\\d{7}",,,,"5001234567",,,[10]],[,,,,,,,,,[-1]],"MX",52,"0[09]","01",,,"0(?:[12]|4[45])|1",,"00",,[[,"(\\d{5})","$1",["53"]],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["33|5[56]|81"],,,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["[2-9]"],,,1],[,"(\\d)(\\d{2})(\\d{4})(\\d{4})","$2 $3 $4",["1(?:33|5[56]|81)"],,,1],[,"(\\d)(\\d{3})(\\d{3})(\\d{4})",
  	"$2 $3 $4",["1"],,,1]],[[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["33|5[56]|81"],,,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["[2-9]"],,,1],[,"(\\d)(\\d{2})(\\d{4})(\\d{4})","$2 $3 $4",["1(?:33|5[56]|81)"],,,1],[,"(\\d)(\\d{3})(\\d{3})(\\d{4})","$2 $3 $4",["1"],,,1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MY:[,[,,"1\\d{8,9}|(?:3\\d|[4-9])\\d{7}",,,,,,,[8,9,10],[6,7]],[,,"(?:3(?:2[0-36-9]|3[0-368]|4[0-278]|5[0-24-8]|6[0-467]|7[1246-9]|8\\d|9[0-57])\\d|4(?:2[0-689]|[3-79]\\d|8[1-35689])|5(?:2[0-589]|[3468]\\d|5[0-489]|7[1-9]|9[23])|6(?:2[2-9]|3[1357-9]|[46]\\d|5[0-6]|7[0-35-9]|85|9[015-8])|7(?:[2579]\\d|3[03-68]|4[0-8]|6[5-9]|8[0-35-9])|8(?:[24][2-8]|3[2-5]|5[2-7]|6[2-589]|7[2-578]|[89][2-9])|9(?:0[57]|13|[25-7]\\d|[3489][0-8]))\\d{5}",
  	,,,"323856789",,,[8,9],[6,7]],[,,"1(?:1888[689]|4400|8(?:47|8[27])[0-4])\\d{4}|1(?:0(?:[23568]\\d|4[0-6]|7[016-9]|9[0-8])|1(?:[1-5]\\d\\d|6(?:0[5-9]|[1-9]\\d)|7(?:[0-4]\\d|5[0-7]))|(?:[269]\\d|[37][1-9]|4[235-9])\\d|5(?:31|9\\d\\d)|8(?:1[23]|[236]\\d|4[06]|5(?:46|[7-9])|7[016-9]|8[01]|9[0-8]))\\d{5}",,,,"123456789",,,[9,10]],[,,"1[378]00\\d{6}",,,,"1300123456",,,[10]],[,,"1600\\d{6}",,,,"1600123456",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"15(?:4(?:6[0-4]\\d|8(?:0[125]|[17]\\d|21|3[01]|4[01589]|5[014]|6[02]))|6(?:32[0-6]|78\\d))\\d{4}",
  	,,,"1546012345",,,[10]],"MY",60,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{4})","$1-$2 $3",["[4-79]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1-$2 $3",["1(?:[02469]|[378][1-9]|53)|8","1(?:[02469]|[37][1-9]|53|8(?:[1-46-9]|5[7-9]))|8"],"0$1"],[,"(\\d)(\\d{4})(\\d{4})","$1-$2 $3",["3"],"0$1"],[,"(\\d)(\\d{3})(\\d{2})(\\d{4})","$1-$2-$3-$4",["1(?:[367]|80)"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1-$2 $3",["15"],"0$1"],[,"(\\d{2})(\\d{4})(\\d{4})","$1-$2 $3",["1"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,
  	,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],MZ:[,[,,"(?:2|8\\d)\\d{7}",,,,,,,[8,9]],[,,"2(?:[1346]\\d|5[0-2]|[78][12]|93)\\d{5}",,,,"21123456",,,[8]],[,,"8[2-79]\\d{7}",,,,"821234567",,,[9]],[,,"800\\d{6}",,,,"800123456",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"MZ",258,"00",,,,,,,,[[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["2|8[2-79]"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["8"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NA:[,[,,"[68]\\d{7,8}",
  	,,,,,,[8,9]],[,,"64426\\d{3}|6(?:1(?:2[2-7]|3[01378]|4[0-4])|254|32[0237]|4(?:27|41|5[25])|52[236-8]|626|7(?:2[2-4]|30))\\d{4,5}|6(?:1(?:(?:0\\d|2[0189]|3[24-69]|4[5-9])\\d|17|69|7[014])|2(?:17|5[0-36-8]|69|70)|3(?:17|2[14-689]|34|6[289]|7[01]|81)|4(?:17|2[0-2]|4[06]|5[0137]|69|7[01])|5(?:17|2[0459]|69|7[01])|6(?:17|25|38|42|69|7[01])|7(?:17|2[569]|3[13]|6[89]|7[01]))\\d{4}",,,,"61221234"],[,,"(?:60|8[1245])\\d{7}",,,,"811234567",,,[9]],[,,"80\\d{7}",,,,"800123456",,,[9]],[,,"8701\\d{5}",,,,"870123456",
  	,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"8(?:3\\d\\d|86)\\d{5}",,,,"88612345"],"NA",264,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["88"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["6"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["87"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["8"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NC:[,[,,"(?:050|[2-57-9]\\d\\d)\\d{3}",,,,,,,[6]],[,,"(?:2[03-9]|3[0-5]|4[1-7]|88)\\d{4}",,,,"201234"],[,
  	,"(?:5[0-4]|[79]\\d|8[0-79])\\d{4}",,,,"751234"],[,,"050\\d{3}",,,,"050012"],[,,"36\\d{4}",,,,"366711"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"NC",687,"00",,,,,,,,[[,"(\\d{3})","$1",["5[6-8]"]],[,"(\\d{2})(\\d{2})(\\d{2})","$1.$2.$3",["[02-57-9]"]]],[[,"(\\d{2})(\\d{2})(\\d{2})","$1.$2.$3",["[02-57-9]"]]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NE:[,[,,"[027-9]\\d{7}",,,,,,,[8]],[,,"2(?:0(?:20|3[1-8]|4[13-5]|5[14]|6[14578]|7[1-578])|1(?:4[145]|5[14]|6[14-68]|7[169]|88))\\d{4}",
  	,,,"20201234"],[,,"(?:23|7[047]|[89]\\d)\\d{6}",,,,"93123456"],[,,"08\\d{6}",,,,"08123456"],[,,"09\\d{6}",,,,"09123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"NE",227,"00",,,,,,,,[[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["08"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[089]|2[013]|7[047]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NF:[,[,,"[13]\\d{5}",,,,,,,[6],[5]],[,,"(?:1(?:06|17|28|39)|3[0-2]\\d)\\d{3}",,,,"106609",,,,[5]],[,,"(?:14|3[58])\\d{4}",
  	,,,"381234",,,,[5]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"NF",672,"00",,,,"([0-258]\\d{4})$","3$1",,,[[,"(\\d{2})(\\d{4})","$1 $2",["1[0-3]"]],[,"(\\d)(\\d{5})","$1 $2",["[13]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NG:[,[,,"(?:[124-7]|9\\d{3})\\d{6}|[1-9]\\d{7}|[78]\\d{9,13}",,,,,,,[7,8,10,11,12,13,14],[5,6]],[,,"(?:(?:[1-356]\\d|4[02-8]|8[2-9])\\d|9(?:0[3-9]|[1-9]\\d))\\d{5}|7(?:0(?:[013-689]\\d|2[0-24-9])\\d{3,4}|[1-79]\\d{6})|(?:[12]\\d|4[147]|5[14579]|6[1578]|7[1-3578])\\d{5}",
  	,,,"18040123",,,[7,8],[5,6]],[,,"(?:702[0-24-9]|819[01])\\d{6}|(?:70[13-689]|8(?:0[1-9]|1[0-8])|9(?:0[1-9]|1[1-356]))\\d{7}",,,,"8021234567",,,[10]],[,,"800\\d{7,11}",,,,"80017591759",,,[10,11,12,13,14]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"NG",234,"009","0",,,"0",,,,[[,"(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3",["78"],"0$1"],[,"(\\d)(\\d{3})(\\d{3,4})","$1 $2 $3",["[12]|9(?:0[3-9]|[1-9])"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2,3})","$1 $2 $3",["[3-7]|8[2-9]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3,4})",
  	"$1 $2 $3",["[7-9]"],"0$1"],[,"(\\d{3})(\\d{4})(\\d{4,5})","$1 $2 $3",["[78]"],"0$1"],[,"(\\d{3})(\\d{5})(\\d{5,6})","$1 $2 $3",["[78]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"700\\d{7,11}",,,,"7001234567",,,[10,11,12,13,14]],,,[,,,,,,,,,[-1]]],NI:[,[,,"(?:1800|[25-8]\\d{3})\\d{4}",,,,,,,[8]],[,,"2\\d{7}",,,,"21234567"],[,,"(?:5(?:5[0-7]|[78]\\d)|6(?:20|3[035]|4[045]|5[05]|77|8[1-9]|9[059])|(?:7[5-8]|8\\d)\\d)\\d{5}",,,,"81234567"],[,,"1800\\d{4}",,,,"18001234"],[,,,,,,,,,[-1]],[,,,,,,,,,
  	[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"NI",505,"00",,,,,,,,[[,"(\\d{4})(\\d{4})","$1 $2",["[125-8]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NL:[,[,,"(?:[124-7]\\d\\d|3(?:[02-9]\\d|1[0-8]))\\d{6}|8\\d{6,9}|9\\d{6,10}|1\\d{4,5}",,,,,,,[5,6,7,8,9,10,11]],[,,"(?:1(?:[035]\\d|1[13-578]|6[124-8]|7[24]|8[0-467])|2(?:[0346]\\d|2[2-46-9]|5[125]|9[479])|3(?:[03568]\\d|1[3-8]|2[01]|4[1-8])|4(?:[0356]\\d|1[1-368]|7[58]|8[15-8]|9[23579])|5(?:[0358]\\d|[19][1-9]|2[1-57-9]|4[13-8]|6[126]|7[0-3578])|7\\d\\d)\\d{6}",
  	,,,"101234567",,,[9]],[,,"(?:6[1-58]|970\\d)\\d{7}",,,,"612345678",,,[9,11]],[,,"800\\d{4,7}",,,,"8001234",,,[7,8,9,10]],[,,"90[069]\\d{4,7}",,,,"9061234",,,[7,8,9,10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:85|91)\\d{7}",,,,"851234567",,,[9]],"NL",31,"00","0",,,"0",,,,[[,"(\\d{4})","$1",["1[238]|[34]"]],[,"(\\d{2})(\\d{3,4})","$1 $2",["14"]],[,"(\\d{6})","$1",["1"]],[,"(\\d{3})(\\d{4,7})","$1 $2",["[89]0"],"0$1"],[,"(\\d{2})(\\d{7})","$1 $2",["66"],"0$1"],[,"(\\d)(\\d{8})","$1 $2",["6"],"0$1"],[,
  	"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["1[16-8]|2[259]|3[124]|4[17-9]|5[124679]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[1-578]|91"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{5})","$1 $2 $3",["9"],"0$1"]],[[,"(\\d{3})(\\d{4,7})","$1 $2",["[89]0"],"0$1"],[,"(\\d{2})(\\d{7})","$1 $2",["66"],"0$1"],[,"(\\d)(\\d{8})","$1 $2",["6"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["1[16-8]|2[259]|3[124]|4[17-9]|5[124679]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[1-578]|91"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{5})",
  	"$1 $2 $3",["9"],"0$1"]],[,,"66\\d{7}",,,,"662345678",,,[9]],,,[,,"140(?:1[035]|2[0346]|3[03568]|4[0356]|5[0358]|8[458])|140(?:1[16-8]|2[259]|3[124]|4[17-9]|5[124679]|7)\\d",,,,,,,[5,6]],[,,"140(?:1[035]|2[0346]|3[03568]|4[0356]|5[0358]|8[458])|(?:140(?:1[16-8]|2[259]|3[124]|4[17-9]|5[124679]|7)|8[478]\\d{6})\\d",,,,"14020",,,[5,6,9]],,,[,,,,,,,,,[-1]]],NO:[,[,,"(?:0|[2-9]\\d{3})\\d{4}",,,,,,,[5,8]],[,,"(?:2[1-4]|3[1-3578]|5[1-35-7]|6[1-4679]|7[0-8])\\d{6}",,,,"21234567",,,[8]],[,,"(?:4[015-8]|9\\d)\\d{6}",
  	,,,"40612345",,,[8]],[,,"80[01]\\d{5}",,,,"80012345",,,[8]],[,,"82[09]\\d{5}",,,,"82012345",,,[8]],[,,"810(?:0[0-6]|[2-8]\\d)\\d{3}",,,,"81021234",,,[8]],[,,"880\\d{5}",,,,"88012345",,,[8]],[,,"85[0-5]\\d{5}",,,,"85012345",,,[8]],"NO",47,"00",,,,,,,,[[,"(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3",["8"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[2-79]"]]],,[,,,,,,,,,[-1]],1,"[02-689]|7[0-8]",[,,,,,,,,,[-1]],[,,"(?:0[2-9]|81(?:0(?:0[7-9]|1\\d)|5\\d\\d))\\d{3}",,,,"02000"],,,[,,"81[23]\\d{5}",,
  	,,"81212345",,,[8]]],NP:[,[,,"(?:1\\d|9)\\d{9}|[1-9]\\d{7}",,,,,,,[8,10,11],[6,7]],[,,"(?:1[0-6]\\d|99[02-6])\\d{5}|(?:2[13-79]|3[135-8]|4[146-9]|5[135-7]|6[13-9]|7[15-9]|8[1-46-9]|9[1-7])[2-6]\\d{5}",,,,"14567890",,,[8],[6,7]],[,,"9(?:6[0-3]|7[024-6]|8[0-24-68])\\d{7}",,,,"9841234567",,,[10]],[,,"1(?:66001|800\\d\\d)\\d{5}",,,,"16600101234",,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"NP",977,"00","0",,,"0",,,,[[,"(\\d)(\\d{7})","$1-$2",["1[2-6]"],"0$1"],[,"(\\d{2})(\\d{6})",
  	"$1-$2",["1[01]|[2-8]|9(?:[1-59]|[67][2-6])"],"0$1"],[,"(\\d{3})(\\d{7})","$1-$2",["9"]],[,"(\\d{4})(\\d{2})(\\d{5})","$1-$2-$3",["1"]]],[[,"(\\d)(\\d{7})","$1-$2",["1[2-6]"],"0$1"],[,"(\\d{2})(\\d{6})","$1-$2",["1[01]|[2-8]|9(?:[1-59]|[67][2-6])"],"0$1"],[,"(\\d{3})(\\d{7})","$1-$2",["9"]]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NR:[,[,,"(?:444|(?:55|8\\d)\\d|666)\\d{4}",,,,,,,[7]],[,,"444\\d{4}",,,,"4441234"],[,,"(?:55[3-9]|666|8\\d\\d)\\d{4}",,,,"5551234"],[,,,,,,
  	,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"NR",674,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[4-68]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NU:[,[,,"(?:[47]|888\\d)\\d{3}",,,,,,,[4,7]],[,,"[47]\\d{3}",,,,"7012",,,[4]],[,,"888[4-9]\\d{3}",,,,"8884012",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"NU",683,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["8"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,
  	,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],NZ:[,[,,"[1289]\\d{9}|50\\d{5}(?:\\d{2,3})?|[27-9]\\d{7,8}|(?:[34]\\d|6[0-35-9])\\d{6}|8\\d{4,6}",,,,,,,[5,6,7,8,9,10]],[,,"24099\\d{3}|(?:3[2-79]|[49][2-9]|6[235-9]|7[2-57-9])\\d{6}",,,,"32345678",,,[8],[7]],[,,"2(?:[0-27-9]\\d|6)\\d{6,7}|2(?:1\\d|75)\\d{5}",,,,"211234567",,,[8,9,10]],[,,"508\\d{6,7}|80\\d{6,8}",,,,"800123456",,,[8,9,10]],[,,"(?:1[13-57-9]\\d{5}|50(?:0[08]|30|66|77|88))\\d{3}|90\\d{6,8}",,,,"900123456",,,[7,8,9,10]],[,,,,,,,,,[-1]],[,,"70\\d{7}",
  	,,,"701234567",,,[9]],[,,,,,,,,,[-1]],"NZ",64,"0(?:0|161)","0",,,"0",,"00",,[[,"(\\d{2})(\\d{3,8})","$1 $2",["8[1-79]"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2,3})","$1 $2 $3",["50[036-8]|8|90","50(?:[0367]|88)|8|90"],"0$1"],[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["24|[346]|7[2-57-9]|9[2-9]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["2(?:10|74)|[589]"],"0$1"],[,"(\\d{2})(\\d{3,4})(\\d{4})","$1 $2 $3",["1|2[028]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,5})","$1 $2 $3",["2(?:[169]|7[0-35-9])|7"],"0$1"]],
  	,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"8(?:1[16-9]|22|3\\d|4[045]|5[459]|6[235-9]|7[0-3579]|90)\\d{2,7}",,,,"83012378"],,,[,,,,,,,,,[-1]]],OM:[,[,,"(?:1505|[279]\\d{3}|500)\\d{4}|800\\d{5,6}",,,,,,,[7,8,9]],[,,"2[1-6]\\d{6}",,,,"23123456",,,[8]],[,,"1505\\d{4}|(?:7(?:[1289]\\d|6[89]|7[0-5])|9(?:0[1-9]|[1-9]\\d))\\d{5}",,,,"92123456",,,[8]],[,,"8007\\d{4,5}|(?:500|800[05])\\d{4}",,,,"80071234"],[,,"900\\d{5}",,,,"90012345",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"OM",968,"00",,,,,,,
  	,[[,"(\\d{3})(\\d{4,6})","$1 $2",["[58]"]],[,"(\\d{2})(\\d{6})","$1 $2",["2"]],[,"(\\d{4})(\\d{4})","$1 $2",["[179]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PA:[,[,,"(?:00800|8\\d{3})\\d{6}|[68]\\d{7}|[1-57-9]\\d{6}",,,,,,,[7,8,10,11]],[,,"(?:1(?:0\\d|1[479]|2[37]|3[0137]|4[17]|5[05]|6[58]|7[0167]|8[2358]|9[1389])|2(?:[0235-79]\\d|1[0-7]|4[013-9]|8[02-9])|3(?:[089]\\d|1[0-7]|2[0-5]|33|4[0-79]|5[0-35]|6[068]|7[0-8])|4(?:00|3[0-579]|4\\d|7[0-57-9])|5(?:[01]\\d|2[0-7]|[56]0|79)|7(?:0[09]|2[0-26-8]|3[03]|4[04]|5[05-9]|6[056]|7[0-24-9]|8[5-9]|90)|8(?:09|2[89]|3\\d|4[0-24-689]|5[014]|8[02])|9(?:0[5-9]|1[0135-8]|2[036-9]|3[35-79]|40|5[0457-9]|6[05-9]|7[04-9]|8[35-8]|9\\d))\\d{4}",
  	,,,"2001234",,,[7]],[,,"(?:1[16]1|21[89]|6\\d{3}|8(?:1[01]|7[23]))\\d{4}",,,,"61234567",,,[7,8]],[,,"800\\d{4,5}|(?:00800|800\\d)\\d{6}",,,,"8001234"],[,,"(?:8(?:22|55|60|7[78]|86)|9(?:00|81))\\d{4}",,,,"8601234",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"PA",507,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1-$2",["[1-57-9]"]],[,"(\\d{4})(\\d{4})","$1-$2",["[68]"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["8"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PE:[,[,,"(?:[14-8]|9\\d)\\d{7}",
  	,,,,,,[8,9],[6,7]],[,,"(?:(?:4[34]|5[14])[0-8]\\d|7(?:173|3[0-8]\\d)|8(?:10[05689]|6(?:0[06-9]|1[6-9]|29)|7(?:0[569]|[56]0)))\\d{4}|(?:1[0-8]|4[12]|5[236]|6[1-7]|7[246]|8[2-4])\\d{6}",,,,"11234567",,,[8],[6,7]],[,,"9\\d{8}",,,,"912345678",,,[9]],[,,"800\\d{5}",,,,"80012345",,,[8]],[,,"805\\d{5}",,,,"80512345",,,[8]],[,,"801\\d{5}",,,,"80112345",,,[8]],[,,"80[24]\\d{5}",,,,"80212345",,,[8]],[,,,,,,,,,[-1]],"PE",51,"00|19(?:1[124]|77|90)00","0"," Anexo ",,"0",,"00",,[[,"(\\d{3})(\\d{5})","$1 $2",["80"],
  	"(0$1)"],[,"(\\d)(\\d{7})","$1 $2",["1"],"(0$1)"],[,"(\\d{2})(\\d{6})","$1 $2",["[4-8]"],"(0$1)"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["9"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PF:[,[,,"4\\d{5}(?:\\d{2})?|8\\d{7,8}",,,,,,,[6,8,9]],[,,"4(?:0[4-689]|9[4-68])\\d{5}",,,,"40412345",,,[8]],[,,"8[7-9]\\d{6}",,,,"87123456",,,[8]],[,,"80[0-5]\\d{6}",,,,"800012345",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"499\\d{5}",,,,"49901234",,,[8]],"PF",689,"00",
  	,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",["44"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["4|8[7-9]"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["8"]]],,[,,,,,,,,,[-1]],,,[,,"44\\d{4}",,,,,,,[6]],[,,"44\\d{4}",,,,"440123",,,[6]],,,[,,,,,,,,,[-1]]],PG:[,[,,"(?:180|[78]\\d{3})\\d{4}|(?:[2-589]\\d|64)\\d{5}",,,,,,,[7,8]],[,,"(?:(?:3[0-2]|4[257]|5[34]|9[78])\\d|64[1-9]|85[02-46-9])\\d{4}",,,,"3123456",,,[7]],[,,"(?:7\\d|8[128])\\d{6}",,,,"70123456",,,[8]],[,,"180\\d{4}",,,
  	,"1801234",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"2(?:0[0-57]|7[568])\\d{4}",,,,"2751234",,,[7]],"PG",675,"00|140[1-3]",,,,,,"00",,[[,"(\\d{3})(\\d{4})","$1 $2",["18|[2-69]|85"]],[,"(\\d{4})(\\d{4})","$1 $2",["[78]"]]],,[,,"27[01]\\d{4}",,,,"2700123",,,[7]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PH:[,[,,"(?:[2-7]|9\\d)\\d{8}|2\\d{5}|(?:1800|8)\\d{7,9}",,,,,,,[6,8,9,10,11,12,13],[4,5,7]],[,,"(?:(?:2[3-8]|3[2-68]|4[2-9]|5[2-6]|6[2-58]|7[24578])\\d{3}|88(?:22\\d\\d|42))\\d{4}|(?:2|8[2-8]\\d\\d)\\d{5}",
  	,,,"232345678",,,[6,8,9,10],[4,5,7]],[,,"(?:8(?:1[37]|9[5-8])|9(?:0[5-9]|1[0-24-9]|[235-7]\\d|4[2-9]|8[135-9]|9[1-9]))\\d{7}",,,,"9051234567",,,[10]],[,,"1800\\d{7,9}",,,,"180012345678",,,[11,12,13]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"PH",63,"00","0",,,"0",,,,[[,"(\\d)(\\d{5})","$1 $2",["2"],"(0$1)"],[,"(\\d{4})(\\d{4,6})","$1 $2",["3(?:23|39|46)|4(?:2[3-6]|[35]9|4[26]|76)|544|88[245]|(?:52|64|86)2","3(?:230|397|461)|4(?:2(?:35|[46]4|51)|396|4(?:22|63)|59[347]|76[15])|5(?:221|446)|642[23]|8(?:622|8(?:[24]2|5[13]))"],
  	"(0$1)"],[,"(\\d{5})(\\d{4})","$1 $2",["346|4(?:27|9[35])|883","3469|4(?:279|9(?:30|56))|8834"],"(0$1)"],[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["2"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[3-7]|8[2-8]"],"(0$1)"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["[89]"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["1"]],[,"(\\d{4})(\\d{1,2})(\\d{3})(\\d{4})","$1 $2 $3 $4",["1"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PK:[,[,,"122\\d{6}|[24-8]\\d{10,11}|9(?:[013-9]\\d{8,10}|2(?:[01]\\d\\d|2(?:[06-8]\\d|1[01]))\\d{7})|(?:[2-8]\\d{3}|92(?:[0-7]\\d|8[1-9]))\\d{6}|[24-9]\\d{8}|[89]\\d{7}",
  	,,,,,,[8,9,10,11,12],[5,6,7]],[,,"(?:(?:21|42)[2-9]|58[126])\\d{7}|(?:2[25]|4[0146-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]\\d{6,7}|(?:2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:2[2-8]|3[27-9]|4[2-6]|6[3569]|9[25-8]))[2-9]\\d{5,6}",,,,"2123456789",,,[9,10],[5,6,7,8]],[,,"3(?:[0-24]\\d|3[0-79]|55|64)\\d{7}",,,,"3012345678",,,[10]],[,,"800\\d{5}(?:\\d{3})?",,,,"80012345",,,[8,11]],[,,"900\\d{5}",,,,"90012345",,,[8]],[,,,,,,,,,[-1]],[,,"122\\d{6}",
  	,,,"122044444",,,[9]],[,,,,,,,,,[-1]],"PK",92,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3})(\\d{2,7})","$1 $2 $3",["[89]0"],"0$1"],[,"(\\d{4})(\\d{5})","$1 $2",["1"]],[,"(\\d{3})(\\d{6,7})","$1 $2",["2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:2[2-8]|3[27-9]|4[2-6]|6[3569]|9[25-8])","9(?:2[3-8]|98)|(?:2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:22|3[27-9]|4[2-6]|6[3569]|9[25-7]))[2-9]"],
  	"(0$1)"],[,"(\\d{2})(\\d{7,8})","$1 $2",["(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]"],"(0$1)"],[,"(\\d{5})(\\d{5})","$1 $2",["58"],"(0$1)"],[,"(\\d{3})(\\d{7})","$1 $2",["3"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",["2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91"],"(0$1)"],[,"(\\d{3})(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",["[24-9]"],"(0$1)"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"(?:2(?:[125]|3[2358]|4[2-4]|9[2-8])|4(?:[0-246-9]|5[3479])|5(?:[1-35-7]|4[2-467])|6(?:0[468]|[1-8])|7(?:[14]|2[236])|8(?:[16]|2[2-689]|3[23578]|4[3478]|5[2356])|9(?:1|22|3[27-9]|4[2-6]|6[3569]|9[2-7]))111\\d{6}",
  	,,,"21111825888",,,[11,12]],,,[,,,,,,,,,[-1]]],PL:[,[,,"(?:6|8\\d\\d)\\d{7}|[1-9]\\d{6}(?:\\d{2})?|[26]\\d{5}",,,,,,,[6,7,8,9,10]],[,,"47\\d{7}|(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])(?:[02-9]\\d{6}|1(?:[0-8]\\d{5}|9\\d{3}(?:\\d{2})?))",,,,"123456789",,,[7,9]],[,,"21(?:1(?:[145]\\d|3[1-5])|2\\d\\d)\\d{4}|(?:45|5[0137]|6[069]|7[2389]|88)\\d{7}",,,,"512345678",,,[9]],[,,"800\\d{6,7}",,,,"800123456",,,[9,10]],[,,"70[01346-8]\\d{6}",,,,"701234567",,,[9]],[,,"801\\d{6}",
  	,,,"801234567",,,[9]],[,,,,,,,,,[-1]],[,,"39\\d{7}",,,,"391234567",,,[9]],"PL",48,"00",,,,,,,,[[,"(\\d{5})","$1",["19"]],[,"(\\d{3})(\\d{3})","$1 $2",["11|20|64"]],[,"(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3",["(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])1","(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])19"]],[,"(\\d{3})(\\d{2})(\\d{2,3})","$1 $2 $3",["64"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["21|39|45|5[0137]|6[0469]|7[02389]|8(?:0[14]|8)"]],
  	[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["1[2-8]|[2-7]|8[1-79]|9[145]"]],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["8"]]],,[,,"64\\d{4,7}",,,,"641234567",,,[6,7,8,9]],,,[,,,,,,,,,[-1]],[,,"804\\d{6}",,,,"804123456",,,[9]],,,[,,,,,,,,,[-1]]],PM:[,[,,"[45]\\d{5}|(?:708|80\\d)\\d{6}",,,,,,,[6,9]],[,,"(?:4[1-35-7]|5[01])\\d{4}",,,,"430123",,,[6]],[,,"(?:4[02-4]|5[056]|708[45][0-5])\\d{4}",,,,"551234"],[,,"80[0-5]\\d{6}",,,,"800012345",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],
  	[,,,,,,,,,[-1]],"PM",508,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",["[45]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["7"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["8"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PR:[,[,,"(?:[589]\\d\\d|787)\\d{7}",,,,,,,[10],[7]],[,,"(?:787|939)[2-9]\\d{6}",,,,"7872345678",,,,[7]],[,,"(?:787|939)[2-9]\\d{6}",,,,"7872345678",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002345678"],[,,"900[2-9]\\d{6}",
  	,,,"9002345678"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"PR",1,"011","1",,,"1",,,1,,,[,,,,,,,,,[-1]],,"787|939",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PS:[,[,,"[2489]2\\d{6}|(?:1\\d|5)\\d{8}",,,,,,,[8,9,10],[7]],[,,"(?:22[2-47-9]|42[45]|82[014-68]|92[3569])\\d{5}",
  	,,,"22234567",,,[8],[7]],[,,"5[69]\\d{7}",,,,"599123456",,,[9]],[,,"1800\\d{6}",,,,"1800123456",,,[10]],[,,,,,,,,,[-1]],[,,"1700\\d{6}",,,,"1700123456",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"PS",970,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["[2489]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["5"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["1"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PT:[,[,,"1693\\d{5}|(?:[26-9]\\d|30)\\d{7}",,,,,,,[9]],
  	[,,"2(?:[12]\\d|3[1-689]|4[1-59]|[57][1-9]|6[1-35689]|8[1-69]|9[1256])\\d{6}",,,,"212345678"],[,,"6(?:[06]92(?:30|9\\d)|[35]92(?:3[03]|9\\d))\\d{3}|(?:(?:16|6[0356])93|9(?:[1-36]\\d\\d|480))\\d{5}",,,,"912345678"],[,,"80[02]\\d{6}",,,,"800123456"],[,,"(?:6(?:0[178]|4[68])\\d|76(?:0[1-57]|1[2-47]|2[237]))\\d{5}",,,,"760123456"],[,,"80(?:8\\d|9[1579])\\d{5}",,,,"808123456"],[,,"884[0-4689]\\d{5}",,,,"884123456"],[,,"30\\d{7}",,,,"301234567"],"PT",351,"00",,,,,,,,[[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",
  	["2[12]"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["16|[236-9]"]]],,[,,"6222\\d{5}",,,,"622212345"],,,[,,,,,,,,,[-1]],[,,"70(?:38[01]|596|(?:7\\d|8[17])\\d)\\d{4}",,,,"707123456"],,,[,,"600\\d{6}|6[06]9233\\d{3}",,,,"600110000"]],PW:[,[,,"(?:[24-8]\\d\\d|345|900)\\d{4}",,,,,,,[7]],[,,"(?:2(?:55|77)|345|488|5(?:35|44|87)|6(?:22|54|79)|7(?:33|47)|8(?:24|55|76)|900)\\d{4}",,,,"2771234"],[,,"(?:(?:46|83)[0-5]|6[2-4689]0)\\d{4}|(?:45|77|88)\\d{5}",,,,"6201234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,
  	,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"PW",680,"01[12]",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[2-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],PY:[,[,,"59\\d{4,6}|9\\d{5,10}|(?:[2-46-8]\\d|5[0-8])\\d{4,7}",,,,,,,[6,7,8,9,10,11],[5]],[,,"(?:[26]1|3[289]|4[1246-8]|7[1-3]|8[1-36])\\d{5,7}|(?:2(?:2[4-68]|[4-68]\\d|7[15]|9[1-5])|3(?:18|3[167]|4[2357]|51|[67]\\d)|4(?:3[12]|5[13]|9[1-47])|5(?:[1-4]\\d|5[02-4])|6(?:3[1-3]|44|7[1-8])|7(?:4[0-4]|5\\d|6[1-578]|75|8[0-8])|858)\\d{5,6}",
  	,,,"212345678",,,[7,8,9],[5,6]],[,,"9(?:51|6[129]|[78][1-6]|9[1-5])\\d{6}",,,,"961456789",,,[9]],[,,"9800\\d{5,7}",,,,"98000123456",,,[9,10,11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"8700[0-4]\\d{4}",,,,"870012345",,,[9]],"PY",595,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3,6})","$1 $2",["[2-9]0"],"0$1"],[,"(\\d{2})(\\d{5})","$1 $2",["[26]1|3[289]|4[1246-8]|7[1-3]|8[1-36]"],"(0$1)"],[,"(\\d{3})(\\d{4,5})","$1 $2",["2[279]|3[13-5]|4[359]|5|6(?:[34]|7[1-46-8])|7[46-8]|85"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{3,4})",
  	"$1 $2 $3",["2[14-68]|3[26-9]|4[1246-8]|6(?:1|75)|7[1-35]|8[1-36]"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["87"]],[,"(\\d{3})(\\d{6})","$1 $2",["9(?:[5-79]|8[1-6])"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[2-8]"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["9"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"[2-9]0\\d{4,7}",,,,"201234567",,,[6,7,8,9]],,,[,,,,,,,,,[-1]]],QA:[,[,,"800\\d{4}|(?:2|800)\\d{6}|(?:0080|[3-7])\\d{7}",,,,,,,[7,8,9,11]],[,,"4(?:1111|2022)\\d{3}|4(?:[04]\\d\\d|14[0-6]|999)\\d{4}",
  	,,,"44123456",,,[8]],[,,"[35-7]\\d{7}",,,,"33123456",,,[8]],[,,"800\\d{4}|(?:0080[01]|800)\\d{6}",,,,"8001234",,,[7,9,11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"QA",974,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["2[16]|8"]],[,"(\\d{4})(\\d{4})","$1 $2",["[3-7]"]]],,[,,"2[16]\\d{5}",,,,"2123456",,,[7]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],RE:[,[,,"(?:26|[689]\\d)\\d{7}",,,,,,,[9]],[,,"26(?:2\\d\\d|3(?:0\\d|1[0-5]))\\d{4}",,,,"262161234"],[,,"69(?:2\\d\\d|3(?:[06][0-6]|1[013]|2[0-2]|3[0-39]|4\\d|5[0-5]|7[0-27]|8[0-8]|9[0-479]))\\d{4}",
  	,,,"692123456"],[,,"80\\d{7}",,,,"801234567"],[,,"89[1-37-9]\\d{6}",,,,"891123456"],[,,"8(?:1[019]|2[0156]|84|90)\\d{6}",,,,"810123456"],[,,,,,,,,,[-1]],[,,"9(?:399[0-3]|479[0-5]|76(?:2[27]|3[0-37]))\\d{4}",,,,"939901234"],"RE",262,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[2689]"],"0$1"]],,[,,,,,,,,,[-1]],1,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],RO:[,[,,"(?:[2378]\\d|90)\\d{7}|[23]\\d{5}",,,,,,,[6,9]],[,,"[23][13-6]\\d{7}|(?:2(?:19\\d|[3-6]\\d9)|31\\d\\d)\\d\\d",
  	,,,"211234567"],[,,"7020\\d{5}|7(?:0[013-9]|1[0-3]|[2-7]\\d|8[03-8]|9[0-29])\\d{6}",,,,"712034567",,,[9]],[,,"800\\d{6}",,,,"800123456",,,[9]],[,,"90[0136]\\d{6}",,,,"900123456",,,[9]],[,,"801\\d{6}",,,,"801123456",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"RO",40,"00","0"," int ",,"0",,,,[[,"(\\d{3})(\\d{3})","$1 $2",["2[3-6]","2[3-6]\\d9"],"0$1"],[,"(\\d{2})(\\d{4})","$1 $2",["219|31"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[23]1"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[237-9]"],
  	"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"(?:37\\d|80[578])\\d{6}",,,,"372123456",,,[9]],,,[,,,,,,,,,[-1]]],RS:[,[,,"38[02-9]\\d{6,9}|6\\d{7,9}|90\\d{4,8}|38\\d{5,6}|(?:7\\d\\d|800)\\d{3,9}|(?:[12]\\d|3[0-79])\\d{5,10}",,,,,,,[6,7,8,9,10,11,12],[4,5]],[,,"(?:11[1-9]\\d|(?:2[389]|39)(?:0[2-9]|[2-9]\\d))\\d{3,8}|(?:1[02-9]|2[0-24-7]|3[0-8])[2-9]\\d{4,9}",,,,"10234567",,,[7,8,9,10,11,12],[4,5,6]],[,,"6(?:[0-689]|7\\d)\\d{6,7}",,,,"601234567",,,[8,9,10]],[,,"800\\d{3,9}",,,,"80012345"],[,,"(?:78\\d|90[0169])\\d{3,7}",
  	,,,"90012345",,,[6,7,8,9,10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"RS",381,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3,9})","$1 $2",["(?:2[389]|39)0|[7-9]"],"0$1"],[,"(\\d{2})(\\d{5,10})","$1 $2",["[1-36]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"7[06]\\d{4,10}",,,,"700123456"],,,[,,,,,,,,,[-1]]],RU:[,[,,"8\\d{13}|[347-9]\\d{9}",,,,,,,[10,14],[7]],[,,"(?:3(?:0[12]|4[1-35-79]|5[1-3]|65|8[1-58]|9[0145])|4(?:01|1[1356]|2[13467]|7[1-5]|8[1-7]|9[1-689])|8(?:1[1-8]|2[01]|3[13-6]|4[0-8]|5[15]|6[1-35-79]|7[1-37-9]))\\d{7}",
  	,,,"3011234567",,,[10],[7]],[,,"9\\d{9}",,,,"9123456789",,,[10]],[,,"8(?:0[04]|108\\d{3})\\d{7}",,,,"8001234567"],[,,"80[39]\\d{7}",,,,"8091234567",,,[10]],[,,,,,,,,,[-1]],[,,"808\\d{7}",,,,"8081234567",,,[10]],[,,,,,,,,,[-1]],"RU",7,"810","8",,,"8",,"8~10",,[[,"(\\d{3})(\\d{2})(\\d{2})","$1-$2-$3",["[0-79]"]],[,"(\\d{4})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["7(?:1[0-8]|2[1-9])","7(?:1(?:[0-356]2|4[29]|7|8[27])|2(?:1[23]|[2-9]2))","7(?:1(?:[0-356]2|4[29]|7|8[27])|2(?:13[03-69]|62[013-9]))|72[1-57-9]2"],
  	"8 ($1)",,1],[,"(\\d{5})(\\d)(\\d{2})(\\d{2})","$1 $2 $3 $4",["7(?:1[0-68]|2[1-9])","7(?:1(?:[06][3-6]|[18]|2[35]|[3-5][3-5])|2(?:[13][3-5]|[24-689]|7[457]))","7(?:1(?:0(?:[356]|4[023])|[18]|2(?:3[013-9]|5)|3[45]|43[013-79]|5(?:3[1-8]|4[1-7]|5)|6(?:3[0-35-9]|[4-6]))|2(?:1(?:3[178]|[45])|[24-689]|3[35]|7[457]))|7(?:14|23)4[0-8]|71(?:33|45)[1-79]"],"8 ($1)",,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["7"],"8 ($1)",,1],[,"(\\d{3})(\\d{3})(\\d{2})(\\d{2})","$1 $2-$3-$4",["[349]|8(?:[02-7]|1[1-8])"],
  	"8 ($1)",,1],[,"(\\d{4})(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3 $4",["8"],"8 ($1)"]],[[,"(\\d{4})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["7(?:1[0-8]|2[1-9])","7(?:1(?:[0-356]2|4[29]|7|8[27])|2(?:1[23]|[2-9]2))","7(?:1(?:[0-356]2|4[29]|7|8[27])|2(?:13[03-69]|62[013-9]))|72[1-57-9]2"],"8 ($1)",,1],[,"(\\d{5})(\\d)(\\d{2})(\\d{2})","$1 $2 $3 $4",["7(?:1[0-68]|2[1-9])","7(?:1(?:[06][3-6]|[18]|2[35]|[3-5][3-5])|2(?:[13][3-5]|[24-689]|7[457]))","7(?:1(?:0(?:[356]|4[023])|[18]|2(?:3[013-9]|5)|3[45]|43[013-79]|5(?:3[1-8]|4[1-7]|5)|6(?:3[0-35-9]|[4-6]))|2(?:1(?:3[178]|[45])|[24-689]|3[35]|7[457]))|7(?:14|23)4[0-8]|71(?:33|45)[1-79]"],
  	"8 ($1)",,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["7"],"8 ($1)",,1],[,"(\\d{3})(\\d{3})(\\d{2})(\\d{2})","$1 $2-$3-$4",["[349]|8(?:[02-7]|1[1-8])"],"8 ($1)",,1],[,"(\\d{4})(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3 $4",["8"],"8 ($1)"]],[,,,,,,,,,[-1]],1,"3[04-689]|[489]",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],RW:[,[,,"(?:06|[27]\\d\\d|[89]00)\\d{6}",,,,,,,[8,9]],[,,"(?:06|2[23568]\\d)\\d{6}",,,,"250123456"],[,,"7[237-9]\\d{7}",,,,"720123456",,,[9]],[,,"800\\d{6}",,,,"800123456",,,[9]],[,
  	,"900\\d{6}",,,,"900123456",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"RW",250,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["0"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["2"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[7-9]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SA:[,[,,"92\\d{7}|(?:[15]|8\\d)\\d{8}",,,,,,,[9,10],[7]],[,,"1(?:1\\d|2[24-8]|3[35-8]|4[3-68]|6[2-5]|7[235-7])\\d{6}",,,,"112345678",,,[9],[7]],[,,"579[01]\\d{5}|5(?:[013-689]\\d|7[0-35-8])\\d{6}",
  	,,,"512345678",,,[9]],[,,"800\\d{7}",,,,"8001234567",,,[10]],[,,"925\\d{6}",,,,"925012345",,,[9]],[,,"920\\d{6}",,,,"920012345",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"SA",966,"00","0",,,"0",,,,[[,"(\\d{4})(\\d{5})","$1 $2",["9"]],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["1"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["5"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["81"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["8"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"811\\d{7}",,,,"8110123456",
  	,,[10]],,,[,,,,,,,,,[-1]]],SB:[,[,,"(?:[1-6]|[7-9]\\d\\d)\\d{4}",,,,,,,[5,7]],[,,"(?:1[4-79]|[23]\\d|4[0-2]|5[03]|6[0-37])\\d{3}",,,,"40123",,,[5]],[,,"48\\d{3}|(?:(?:7[1-9]|8[4-9])\\d|9(?:1[2-9]|2[013-9]|3[0-2]|[46]\\d|5[0-46-9]|7[0-689]|8[0-79]|9[0-8]))\\d{4}",,,,"7421234"],[,,"1[38]\\d{3}",,,,"18123",,,[5]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"5[12]\\d{3}",,,,"51123",,,[5]],"SB",677,"0[01]",,,,,,,,[[,"(\\d{2})(\\d{5})","$1 $2",["7|8[4-9]|9(?:[1-8]|9[0-8])"]]],,[,,,,,,,,,[-1]],,,
  	[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SC:[,[,,"800\\d{4}|(?:[249]\\d|64)\\d{5}",,,,,,,[7]],[,,"4[2-46]\\d{5}",,,,"4217123"],[,,"2[125-8]\\d{5}",,,,"2510123"],[,,"800[08]\\d{3}",,,,"8000000"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"971\\d{4}|(?:64|95)\\d{5}",,,,"6412345"],"SC",248,"010|0[0-2]",,,,,,"00",,[[,"(\\d)(\\d{3})(\\d{3})","$1 $2 $3",["[246]|9[57]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SD:[,[,,"[19]\\d{8}",,,,,,,[9]],[,,"1(?:5\\d|8[35-7])\\d{6}",
  	,,,"153123456"],[,,"(?:1[0-2]|9[0-3569])\\d{7}",,,,"911231234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"SD",249,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[19]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SE:[,[,,"(?:[26]\\d\\d|9)\\d{9}|[1-9]\\d{8}|[1-689]\\d{7}|[1-4689]\\d{6}|2\\d{5}",,,,,,,[6,7,8,9,10,12]],[,,"(?:(?:[12][136]|3[356]|4[0246]|6[03]|8\\d)\\d|90[1-9])\\d{4,6}|(?:1(?:2[0-35]|4[0-4]|5[0-25-9]|7[13-6]|[89]\\d)|2(?:2[0-7]|4[0136-8]|5[0138]|7[018]|8[01]|9[0-57])|3(?:0[0-4]|1\\d|2[0-25]|4[056]|7[0-2]|8[0-3]|9[023])|4(?:1[013-8]|3[0135]|5[14-79]|7[0-246-9]|8[0156]|9[0-689])|5(?:0[0-6]|[15][0-5]|2[0-68]|3[0-4]|4\\d|6[03-5]|7[013]|8[0-79]|9[01])|6(?:1[1-3]|2[0-4]|4[02-57]|5[0-37]|6[0-3]|7[0-2]|8[0247]|9[0-356])|9(?:1[0-68]|2\\d|3[02-5]|4[0-3]|5[0-4]|[68][01]|7[0135-8]))\\d{5,6}",
  	,,,"8123456",,,[7,8,9]],[,,"7[02369]\\d{7}",,,,"701234567",,,[9]],[,,"20\\d{4,7}",,,,"20123456",,,[6,7,8,9]],[,,"649\\d{6}|99[1-59]\\d{4}(?:\\d{3})?|9(?:00|39|44)[1-8]\\d{3,6}",,,,"9001234567",,,[7,8,9,10]],[,,"77[0-7]\\d{6}",,,,"771234567",,,[9]],[,,"75[1-8]\\d{6}",,,,"751234567",,,[9]],[,,,,,,,,,[-1]],"SE",46,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{2,3})(\\d{2})","$1-$2 $3",["20"],"0$1"],[,"(\\d{3})(\\d{4})","$1-$2",["9(?:00|39|44|9)"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})","$1-$2 $3",["[12][136]|3[356]|4[0246]|6[03]|90[1-9]"],
  	"0$1"],[,"(\\d)(\\d{2,3})(\\d{2})(\\d{2})","$1-$2 $3 $4",["8"],"0$1"],[,"(\\d{3})(\\d{2,3})(\\d{2})","$1-$2 $3",["1[2457]|2(?:[247-9]|5[0138])|3[0247-9]|4[1357-9]|5[0-35-9]|6(?:[125689]|4[02-57]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])"],"0$1"],[,"(\\d{3})(\\d{2,3})(\\d{3})","$1-$2 $3",["9(?:00|39|44)"],"0$1"],[,"(\\d{2})(\\d{2,3})(\\d{2})(\\d{2})","$1-$2 $3 $4",["1[13689]|2[0136]|3[1356]|4[0246]|54|6[03]|90[1-9]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1-$2 $3 $4",["10|7"],"0$1"],[,"(\\d)(\\d{3})(\\d{3})(\\d{2})",
  	"$1-$2 $3 $4",["8"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1-$2 $3 $4",["[13-5]|2(?:[247-9]|5[0138])|6(?:[124-689]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{3})","$1-$2 $3 $4",["9"],"0$1"],[,"(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1-$2 $3 $4 $5",["[26]"],"0$1"]],[[,"(\\d{2})(\\d{2,3})(\\d{2})","$1 $2 $3",["20"]],[,"(\\d{3})(\\d{4})","$1 $2",["9(?:00|39|44|9)"]],[,"(\\d{2})(\\d{3})(\\d{2})","$1 $2 $3",["[12][136]|3[356]|4[0246]|6[03]|90[1-9]"]],[,"(\\d)(\\d{2,3})(\\d{2})(\\d{2})",
  	"$1 $2 $3 $4",["8"]],[,"(\\d{3})(\\d{2,3})(\\d{2})","$1 $2 $3",["1[2457]|2(?:[247-9]|5[0138])|3[0247-9]|4[1357-9]|5[0-35-9]|6(?:[125689]|4[02-57]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])"]],[,"(\\d{3})(\\d{2,3})(\\d{3})","$1 $2 $3",["9(?:00|39|44)"]],[,"(\\d{2})(\\d{2,3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["1[13689]|2[0136]|3[1356]|4[0246]|54|6[03]|90[1-9]"]],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["10|7"]],[,"(\\d)(\\d{3})(\\d{3})(\\d{2})","$1 $2 $3 $4",["8"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})",
  	"$1 $2 $3 $4",["[13-5]|2(?:[247-9]|5[0138])|6(?:[124-689]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3 $4",["9"]],[,"(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5",["[26]"]]],[,,"74[02-9]\\d{6}",,,,"740123456",,,[9]],,,[,,,,,,,,,[-1]],[,,"10[1-8]\\d{6}",,,,"102345678",,,[9]],,,[,,"(?:25[245]|67[3-68])\\d{9}",,,,"254123456789",,,[12]]],SG:[,[,,"(?:(?:1\\d|8)\\d\\d|7000)\\d{7}|[3689]\\d{7}",,,,,,,[8,10,11]],[,,"662[0-24-9]\\d{4}|6(?:[0-578]\\d|6[013-57-9]|9[0-35-9])\\d{5}",
  	,,,"61234567",,,[8]],[,,"8(?:08[01]|95[0-2])\\d{4}|(?:8(?:0[1-7]|[1-8]\\d|9[0-4])|9[0-8]\\d)\\d{5}",,,,"81234567",,,[8]],[,,"(?:18|8)00\\d{7}",,,,"18001234567",,,[10,11]],[,,"1900\\d{7}",,,,"19001234567",,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:3[12]\\d|666)\\d{5}",,,,"31234567",,,[8]],"SG",65,"0[0-3]\\d",,,,,,,,[[,"(\\d{4,5})","$1",["1[013-9]|77","1(?:[013-8]|9(?:0[1-9]|[1-9]))|77"]],[,"(\\d{4})(\\d{4})","$1 $2",["[369]|8(?:0[1-8]|[1-9])"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["8"]],[,
  	"(\\d{4})(\\d{4})(\\d{3})","$1 $2 $3",["7"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["1"]]],[[,"(\\d{4})(\\d{4})","$1 $2",["[369]|8(?:0[1-8]|[1-9])"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["8"]],[,"(\\d{4})(\\d{4})(\\d{3})","$1 $2 $3",["7"]],[,"(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3",["1"]]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"7000\\d{7}",,,,"70001234567",,,[11]],,,[,,,,,,,,,[-1]]],SH:[,[,,"(?:[256]\\d|8)\\d{3}",,,,,,,[4,5]],[,,"2(?:[0-57-9]\\d|6[4-9])\\d\\d",,,,"22158"],[,,"[56]\\d{4}",,,,"51234",
  	,,[5]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"262\\d\\d",,,,"26212",,,[5]],"SH",290,"00",,,,,,,,,,[,,,,,,,,,[-1]],1,"[256]",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SI:[,[,,"[1-7]\\d{7}|8\\d{4,7}|90\\d{4,6}",,,,,,,[5,6,7,8]],[,,"(?:[1-357][2-8]|4[24-8])\\d{6}",,,,"12345678",,,[8],[7]],[,,"65(?:[178]\\d|5[56]|6[01])\\d{4}|(?:[37][01]|4[0139]|51|6[489])\\d{6}",,,,"31234567",,,[8]],[,,"80\\d{4,6}",,,,"80123456",,,[6,7,8]],[,,"89[1-3]\\d{2,5}|90\\d{4,6}",,,,"90123456"],
  	[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:59\\d\\d|8(?:1(?:[67]\\d|8[0-589])|2(?:0\\d|2[0-37-9]|8[0-2489])|3[389]\\d))\\d{4}",,,,"59012345",,,[8]],"SI",386,"00|10(?:22|66|88|99)","0",,,"0",,"00",,[[,"(\\d{2})(\\d{3,6})","$1 $2",["8[09]|9"],"0$1"],[,"(\\d{3})(\\d{5})","$1 $2",["59|8"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["[37][01]|4[0139]|51|6"],"0$1"],[,"(\\d)(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[1-57]"],"(0$1)"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],
  	SJ:[,[,,"0\\d{4}|(?:[489]\\d|79)\\d{6}",,,,,,,[5,8]],[,,"79\\d{6}",,,,"79123456",,,[8]],[,,"(?:4[015-8]|9\\d)\\d{6}",,,,"41234567",,,[8]],[,,"80[01]\\d{5}",,,,"80012345",,,[8]],[,,"82[09]\\d{5}",,,,"82012345",,,[8]],[,,"810(?:0[0-6]|[2-8]\\d)\\d{3}",,,,"81021234",,,[8]],[,,"880\\d{5}",,,,"88012345",,,[8]],[,,"85[0-5]\\d{5}",,,,"85012345",,,[8]],"SJ",47,"00",,,,,,,,,,[,,,,,,,,,[-1]],,"79",[,,,,,,,,,[-1]],[,,"(?:0[2-9]|81(?:0(?:0[7-9]|1\\d)|5\\d\\d))\\d{3}",,,,"02000"],,,[,,"81[23]\\d{5}",,,,"81212345",
  	,,[8]]],SK:[,[,,"[2-689]\\d{8}|[2-59]\\d{6}|[2-5]\\d{5}",,,,,,,[6,7,9]],[,,"(?:2(?:16|[2-9]\\d{3})|(?:(?:[3-5][1-8]\\d|819)\\d|601[1-5])\\d)\\d{4}|(?:2|[3-5][1-8])1[67]\\d{3}|[3-5][1-8]16\\d\\d",,,,"221234567"],[,,"909[1-9]\\d{5}|9(?:0[1-8]|1[0-24-9]|4[03-57-9]|5\\d)\\d{6}",,,,"912123456",,,[9]],[,,"800\\d{6}",,,,"800123456",,,[9]],[,,"9(?:00|[78]\\d)\\d{6}",,,,"900123456",,,[9]],[,,"8[5-9]\\d{7}",,,,"850123456",,,[9]],[,,,,,,,,,[-1]],[,,"6(?:02|5[0-4]|9[0-6])\\d{6}",,,,"690123456",,,[9]],"SK",421,
  	"00","0",,,"0",,,,[[,"(\\d)(\\d{2})(\\d{3,4})","$1 $2 $3",["21"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2,3})","$1 $2 $3",["[3-5][1-8]1","[3-5][1-8]1[67]"],"0$1"],[,"(\\d{4})(\\d{3})","$1 $2",["909","9090"],"0$1"],[,"(\\d)(\\d{3})(\\d{3})(\\d{2})","$1/$2 $3 $4",["2"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[689]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1/$2 $3 $4",["[3-5]"],"0$1"]],[[,"(\\d)(\\d{2})(\\d{3,4})","$1 $2 $3",["21"],"0$1"],[,"(\\d{2})(\\d{2})(\\d{2,3})","$1 $2 $3",["[3-5][1-8]1",
  	"[3-5][1-8]1[67]"],"0$1"],[,"(\\d)(\\d{3})(\\d{3})(\\d{2})","$1/$2 $3 $4",["2"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[689]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1/$2 $3 $4",["[3-5]"],"0$1"]],[,,"9090\\d{3}",,,,"9090123",,,[7]],,,[,,"9090\\d{3}|(?:602|8(?:00|[5-9]\\d)|9(?:00|[78]\\d))\\d{6}",,,,,,,[7,9]],[,,"96\\d{7}",,,,"961234567",,,[9]],,,[,,,,,,,,,[-1]]],SL:[,[,,"(?:[237-9]\\d|66)\\d{6}",,,,,,,[8],[6]],[,,"22[2-4][2-9]\\d{4}",,,,"22221234",,,,[6]],[,,"(?:25|3[0-5]|66|7[2-9]|8[08]|9[09])\\d{6}",
  	,,,"25123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"SL",232,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{6})","$1 $2",["[236-9]"],"(0$1)"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SM:[,[,,"(?:0549|[5-7]\\d)\\d{6}",,,,,,,[8,10],[6]],[,,"0549(?:8[0157-9]|9\\d)\\d{4}",,,,"0549886377",,,[10],[6]],[,,"6[16]\\d{6}",,,,"66661212",,,[8]],[,,,,,,,,,[-1]],[,,"7[178]\\d{6}",,,,"71123456",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"5[158]\\d{6}",
  	,,,"58001110",,,[8]],"SM",378,"00",,,,"([89]\\d{5})$","0549$1",,,[[,"(\\d{6})","$1",["[89]"]],[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[5-7]"]],[,"(\\d{4})(\\d{6})","$1 $2",["0"]]],[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[5-7]"]],[,"(\\d{4})(\\d{6})","$1 $2",["0"]]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SN:[,[,,"(?:[378]\\d|93)\\d{7}",,,,,,,[9]],[,,"3(?:0(?:1[0-2]|80)|282|3(?:8[1-9]|9[3-9])|611)\\d{5}",,,,"301012345"],[,,"7(?:(?:[06-8]\\d|21|90)\\d|5(?:01|[19]0|25|[38]3|[4-7]\\d))\\d{5}",
  	,,,"701234567"],[,,"800\\d{6}",,,,"800123456"],[,,"88[4689]\\d{6}",,,,"884123456"],[,,"81[02468]\\d{6}",,,,"810123456"],[,,,,,,,,,[-1]],[,,"(?:3(?:392|9[01]\\d)\\d|93(?:3[13]0|929))\\d{4}",,,,"933301234"],"SN",221,"00",,,,,,,,[[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["8"]],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[379]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SO:[,[,,"[346-9]\\d{8}|[12679]\\d{7}|[1-5]\\d{6}|[1348]\\d{5}",,,,,,,[6,7,8,9]],[,,
  	"(?:1\\d|2[0-79]|3[0-46-8]|4[0-7]|5[57-9])\\d{5}|(?:[134]\\d|8[125])\\d{4}",,,,"4012345",,,[6,7]],[,,"(?:(?:15|(?:3[59]|4[89]|6\\d|7[79]|8[08])\\d|9(?:0\\d|[2-9]))\\d|2(?:4\\d|8))\\d{5}|(?:[67]\\d\\d|904)\\d{5}",,,,"71123456",,,[7,8,9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"SO",252,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{4})","$1 $2",["8[125]"]],[,"(\\d{6})","$1",["[134]"]],[,"(\\d)(\\d{6})","$1 $2",["[15]|2[0-79]|3[0-46-8]|4[0-7]"]],[,"(\\d)(\\d{7})","$1 $2",
  	["(?:2|90)4|[67]"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[348]|64|79|90"]],[,"(\\d{2})(\\d{5,7})","$1 $2",["1|28|6[0-35-9]|77|9[2-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SR:[,[,,"(?:[2-5]|68|[78]\\d)\\d{5}",,,,,,,[6,7]],[,,"(?:2[1-3]|3[0-7]|(?:4|68)\\d|5[2-58])\\d{4}",,,,"211234"],[,,"(?:7[124-7]|8[124-9])\\d{5}",,,,"7412345",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"56\\d{4}",,,,"561234",,,[6]],"SR",597,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})",
  	"$1-$2-$3",["56"]],[,"(\\d{3})(\\d{3})","$1-$2",["[2-5]"]],[,"(\\d{3})(\\d{4})","$1-$2",["[6-8]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SS:[,[,,"[19]\\d{8}",,,,,,,[9]],[,,"1[89]\\d{7}",,,,"181234567"],[,,"(?:12|9[1257-9])\\d{7}",,,,"977123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"SS",211,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[19]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,
  	,,,,,,[-1]]],ST:[,[,,"(?:22|9\\d)\\d{5}",,,,,,,[7]],[,,"22\\d{5}",,,,"2221234"],[,,"900[5-9]\\d{3}|9(?:0[1-9]|[89]\\d)\\d{4}",,,,"9812345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"ST",239,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[29]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SV:[,[,,"[267]\\d{7}|[89]00\\d{4}(?:\\d{4})?",,,,,,,[7,8,11]],[,,"2(?:79(?:0[0347-9]|[1-9]\\d)|89(?:0[024589]|[1-9]\\d))\\d{3}|2(?:[1-69]\\d|[78][0-8])\\d{5}",
  	,,,"21234567",,,[8]],[,,"[67]\\d{7}",,,,"70123456",,,[8]],[,,"800\\d{4}(?:\\d{4})?",,,,"8001234",,,[7,11]],[,,"900\\d{4}(?:\\d{4})?",,,,"9001234",,,[7,11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"SV",503,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[89]"]],[,"(\\d{4})(\\d{4})","$1 $2",["[267]"]],[,"(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3",["[89]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SX:[,[,,"7215\\d{6}|(?:[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"7215(?:4[2-8]|8[239]|9[056])\\d{4}",
  	,,,"7215425678",,,,[7]],[,,"7215(?:1[02]|2\\d|5[034679]|8[014-8])\\d{4}",,,,"7215205678",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002123456"],[,,"900[2-9]\\d{6}",,,,"9002123456"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"SX",1,"011","1",,,"(5\\d{6})$|1",
  	"721$1",,,,,[,,,,,,,,,[-1]],,"721",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SY:[,[,,"[1-39]\\d{8}|[1-5]\\d{7}",,,,,,,[8,9],[6,7]],[,,"21\\d{6,7}|(?:1(?:[14]\\d|[2356])|2[235]|3(?:[13]\\d|4)|4[134]|5[1-3])\\d{6}",,,,"112345678",,,,[6,7]],[,,"9[1-689]\\d{7}",,,,"944567890",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"SY",963,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[1-5]"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["9"],
  	"0$1",,1]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],SZ:[,[,,"0800\\d{4}|(?:[237]\\d|900)\\d{6}",,,,,,,[8,9]],[,,"[23][2-5]\\d{6}",,,,"22171234",,,[8]],[,,"7[6-9]\\d{6}",,,,"76123456",,,[8]],[,,"0800\\d{4}",,,,"08001234",,,[8]],[,,"900\\d{6}",,,,"900012345",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"70\\d{6}",,,,"70012345",,,[8]],"SZ",268,"00",,,,,,,,[[,"(\\d{4})(\\d{4})","$1 $2",["[0237]"]],[,"(\\d{5})(\\d{4})","$1 $2",["9"]]],,[,,,,,,,,,[-1]],,,[,,"0800\\d{4}",,,,,,,
  	[8]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TA:[,[,,"8\\d{3}",,,,,,,[4]],[,,"8\\d{3}",,,,"8999"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"TA",290,"00",,,,,,,,,,[,,,,,,,,,[-1]],,"8",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TC:[,[,,"(?:[58]\\d\\d|649|900)\\d{7}",,,,,,,[10],[7]],[,,"649(?:266|712|9(?:4\\d|50))\\d{4}",,,,"6497121234",,,,[7]],[,,"649(?:2(?:3[129]|4[1-79])|3\\d\\d|4[34][1-3])\\d{4}",,,,"6492311234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",
  	,,,"8002345678"],[,,"900[2-9]\\d{6}",,,,"9002345678"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,"649(?:71[01]|966)\\d{4}",,,,"6497101234",,,,[7]],"TC",1,"011","1",,,"([2-479]\\d{6})$|1","649$1",,,,,[,,,,,,,,,[-1]],,"649",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],
  	TD:[,[,,"(?:22|[69]\\d|77)\\d{6}",,,,,,,[8]],[,,"22(?:[37-9]0|5[0-5]|6[89])\\d{4}",,,,"22501234"],[,,"(?:6[0235689]|77|9\\d)\\d{6}",,,,"63012345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"TD",235,"00|16",,,,,,"00",,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[2679]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TG:[,[,,"[279]\\d{7}",,,,,,,[8]],[,,"2(?:2[2-7]|3[23]|4[45]|55|6[67]|77)\\d{5}",,,,"22212345"],[,,"(?:7[019]|9[0-36-9])\\d{6}",
  	,,,"90112345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"TG",228,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[279]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TH:[,[,,"(?:001800|[2-57]|[689]\\d)\\d{7}|1\\d{7,9}",,,,,,,[8,9,10,13]],[,,"(?:1[0689]|2\\d|3[2-9]|4[2-5]|5[2-6]|7[3-7])\\d{6}",,,,"21234567",,,[8]],[,,"671[0-8]\\d{5}|(?:14|6[1-6]|[89]\\d)\\d{7}",,,,"812345678",,,[9]],[,,"(?:001800\\d|1800)\\d{6}",,,
  	,"1800123456",,,[10,13]],[,,"1900\\d{6}",,,,"1900123456",,,[10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"6[08]\\d{7}",,,,"601234567",,,[9]],"TH",66,"00[1-9]","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{4})","$1 $2 $3",["2"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[13-9]"],"0$1"],[,"(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3",["1"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TJ:[,[,,"[0-57-9]\\d{8}",,,,,,,[9],[3,5,6,7]],[,,"(?:3(?:1[3-5]|2[245]|3[12]|4[24-7]|5[25]|72)|4(?:4[046]|74|87))\\d{6}",
  	,,,"372123456",,,,[3,5,6,7]],[,,"(?:41[18]|81[1-9])\\d{6}|(?:0[0-57-9]|1[017]|2[02]|[34]0|5[05]|7[0178]|8[078]|9\\d)\\d{7}",,,,"917123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"TJ",992,"810",,,,,,"8~10",,[[,"(\\d{6})(\\d)(\\d{2})","$1 $2 $3",["331","3317"]],[,"(\\d{3})(\\d{2})(\\d{4})","$1 $2 $3",["44[04]|[34]7"]],[,"(\\d{4})(\\d)(\\d{4})","$1 $2 $3",["3[1-5]"]],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[0-57-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,
  	,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TK:[,[,,"[2-47]\\d{3,6}",,,,,,,[4,5,6,7]],[,,"(?:2[2-4]|[34]\\d)\\d{2,5}",,,,"3101"],[,,"7[2-4]\\d{2,5}",,,,"7290"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"TK",690,"00",,,,,,,,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TL:[,[,,"7\\d{7}|(?:[2-47]\\d|[89]0)\\d{5}",,,,,,,[7,8]],[,,"(?:2[1-5]|3[1-9]|4[1-4])\\d{5}",,,,"2112345",,,[7]],[,,"7[2-8]\\d{6}",,,,"77212345",,,[8]],[,,"80\\d{5}",,,,"8012345",,
  	,[7]],[,,"90\\d{5}",,,,"9012345",,,[7]],[,,,,,,,,,[-1]],[,,"70\\d{5}",,,,"7012345",,,[7]],[,,,,,,,,,[-1]],"TL",670,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[2-489]|70"]],[,"(\\d{4})(\\d{4})","$1 $2",["7"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TM:[,[,,"[1-6]\\d{7}",,,,,,,[8]],[,,"(?:1(?:2\\d|3[1-9])|2(?:22|4[0-35-8])|3(?:22|4[03-9])|4(?:22|3[128]|4\\d|6[15])|5(?:22|5[7-9]|6[014-689]))\\d{5}",,,,"12345678"],[,,"6\\d{7}",,,,"66123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],
  	[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"TM",993,"810","8",,,"8",,"8~10",,[[,"(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2-$3-$4",["12"],"(8 $1)"],[,"(\\d{3})(\\d)(\\d{2})(\\d{2})","$1 $2-$3-$4",["[1-5]"],"(8 $1)"],[,"(\\d{2})(\\d{6})","$1 $2",["6"],"8 $1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TN:[,[,,"[2-57-9]\\d{7}",,,,,,,[8]],[,,"81200\\d{3}|(?:3[0-2]|7\\d)\\d{6}",,,,"30010123"],[,,"3(?:001|[12]40)\\d{4}|(?:(?:[259]\\d|4[0-8])\\d|3(?:1[1-35]|6[0-4]|91))\\d{5}",
  	,,,"20123456"],[,,"8010\\d{4}",,,,"80101234"],[,,"88\\d{6}",,,,"88123456"],[,,"8[12]10\\d{4}",,,,"81101234"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"TN",216,"00",,,,,,,,[[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["[2-57-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TO:[,[,,"(?:0800|(?:[5-8]\\d\\d|999)\\d)\\d{3}|[2-8]\\d{4}",,,,,,,[5,7]],[,,"(?:2\\d|3[0-8]|4[0-4]|50|6[09]|7[0-24-69]|8[05])\\d{3}",,,,"20123",,,[5]],[,,"(?:55[4-6]|6(?:[09]\\d|3[02]|8[15-9])|(?:7\\d|8[46-9])\\d|999)\\d{4}",
  	,,,"7715123",,,[7]],[,,"0800\\d{3}",,,,"0800222",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"55[0-37-9]\\d{4}",,,,"5510123",,,[7]],"TO",676,"00",,,,,,,,[[,"(\\d{2})(\\d{3})","$1-$2",["[2-4]|50|6[09]|7[0-24-69]|8[05]"]],[,"(\\d{4})(\\d{3})","$1 $2",["0"]],[,"(\\d{3})(\\d{4})","$1 $2",["[5-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TR:[,[,,"4\\d{6}|8\\d{11,12}|(?:[2-58]\\d\\d|900)\\d{7}",,,,,,,[7,10,12,13]],[,,"(?:2(?:[13][26]|[28][2468]|[45][268]|[67][246])|3(?:[13][28]|[24-6][2468]|[78][02468]|92)|4(?:[16][246]|[23578][2468]|4[26]))\\d{7}",
  	,,,"2123456789",,,[10]],[,,"56161\\d{5}|5(?:0[15-7]|1[06]|24|[34]\\d|5[1-59]|9[46])\\d{7}",,,,"5012345678",,,[10]],[,,"8(?:00\\d{7}(?:\\d{2,3})?|11\\d{7})",,,,"8001234567",,,[10,12,13]],[,,"(?:8[89]8|900)\\d{7}",,,,"9001234567",,,[10]],[,,,,,,,,,[-1]],[,,"592(?:21[12]|461)\\d{4}",,,,"5922121234",,,[10]],[,,"850\\d{7}",,,,"8500123456",,,[10]],"TR",90,"00","0",,,"0",,,,[[,"(\\d{3})(\\d)(\\d{3})","$1 $2 $3",["444"],,,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["512|8[01589]|90"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{2})(\\d{2})",
  	"$1 $2 $3 $4",["5(?:[0-59]|61)","5(?:[0-59]|616)","5(?:[0-59]|6161)"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[24][1-8]|3[1-9]"],"(0$1)",,1],[,"(\\d{3})(\\d{3})(\\d{6,7})","$1 $2 $3",["80"],"0$1",,1]],[[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["512|8[01589]|90"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["5(?:[0-59]|61)","5(?:[0-59]|616)","5(?:[0-59]|6161)"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[24][1-8]|3[1-9]"],"(0$1)",,1],[,"(\\d{3})(\\d{3})(\\d{6,7})",
  	"$1 $2 $3",["80"],"0$1",,1]],[,,"512\\d{7}",,,,"5123456789",,,[10]],,,[,,"(?:444|811\\d{3})\\d{4}",,,,,,,[7,10]],[,,"444\\d{4}",,,,"4441444",,,[7]],,,[,,,,,,,,,[-1]]],TT:[,[,,"(?:[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"868(?:2(?:01|1[5-9]|[23]\\d|4[0-2])|6(?:0[7-9]|1[02-8]|2[1-9]|[3-69]\\d|7[0-79])|82[124])\\d{4}",,,,"8682211234",,,,[7]],[,,"868(?:(?:2[5-9]|3\\d)\\d|4(?:3[0-6]|[6-9]\\d)|6(?:20|78|8\\d)|7(?:0[1-9]|1[02-9]|[2-9]\\d))\\d{4}",,,,"8682911234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",
  	,,,"8002345678"],[,,"900[2-9]\\d{6}",,,,"9002345678"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"TT",1,"011","1",,,"([2-46-8]\\d{6})$|1","868$1",,,,,[,,,,,,,,,[-1]],,"868",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,"868619\\d{4}",,,,"8686191234",,,,[7]]],TV:[,[,,
  	"(?:2|7\\d\\d|90)\\d{4}",,,,,,,[5,6,7]],[,,"2[02-9]\\d{3}",,,,"20123",,,[5]],[,,"(?:7[01]\\d|90)\\d{4}",,,,"901234",,,[6,7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"TV",688,"00",,,,,,,,[[,"(\\d{2})(\\d{3})","$1 $2",["2"]],[,"(\\d{2})(\\d{4})","$1 $2",["90"]],[,"(\\d{2})(\\d{5})","$1 $2",["7"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],TW:[,[,,"[2-689]\\d{8}|7\\d{9,10}|[2-8]\\d{7}|2\\d{6}",,,,,,,[7,8,9,10,11]],[,,"(?:2[2-8]\\d|370|55[01]|7[1-9])\\d{6}|4(?:(?:0(?:0[1-9]|[2-48]\\d)|1[023]\\d)\\d{4,5}|(?:[239]\\d\\d|4(?:0[56]|12|49))\\d{5})|6(?:[01]\\d{7}|4(?:0[56]|12|24|4[09])\\d{4,5})|8(?:(?:2(?:3\\d|4[0-269]|[578]0|66)|36[24-9]|90\\d\\d)\\d{4}|4(?:0[56]|12|24|4[09])\\d{4,5})|(?:2(?:2(?:0\\d\\d|4(?:0[68]|[249]0|3[0-467]|5[0-25-9]|6[0235689]))|(?:3(?:[09]\\d|1[0-4])|(?:4\\d|5[0-49]|6[0-29]|7[0-5])\\d)\\d)|(?:(?:3[2-9]|5[2-8]|6[0-35-79]|8[7-9])\\d\\d|4(?:2(?:[089]\\d|7[1-9])|(?:3[0-4]|[78]\\d|9[01])\\d))\\d)\\d{3}",
  	,,,"221234567",,,[8,9]],[,,"(?:40001[0-2]|9[0-8]\\d{4})\\d{3}",,,,"912345678",,,[9]],[,,"80[0-79]\\d{6}|800\\d{5}",,,,"800123456",,,[8,9]],[,,"20(?:[013-9]\\d\\d|2)\\d{4}",,,,"203123456",,,[7,9]],[,,,,,,,,,[-1]],[,,"99\\d{7}",,,,"990123456",,,[9]],[,,"7010(?:[0-2679]\\d|3[0-7]|8[0-5])\\d{5}|70\\d{8}",,,,"7012345678",,,[10,11]],"TW",886,"0(?:0[25-79]|19)","0","#",,"0",,,,[[,"(\\d{2})(\\d)(\\d{4})","$1 $2 $3",["202"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["[258]0"],"0$1"],[,"(\\d)(\\d{3,4})(\\d{4})",
  	"$1 $2 $3",["[23568]|4(?:0[02-48]|[1-47-9])|7[1-9]","[23568]|4(?:0[2-48]|[1-47-9])|(?:400|7)[1-9]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[49]"],"0$1"],[,"(\\d{2})(\\d{4})(\\d{4,5})","$1 $2 $3",["7"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"50[0-46-9]\\d{6}",,,,"500123456",,,[9]],,,[,,,,,,,,,[-1]]],TZ:[,[,,"(?:[25-8]\\d|41|90)\\d{7}",,,,,,,[9]],[,,"2[2-8]\\d{7}",,,,"222345678"],[,,"77[2-9]\\d{6}|(?:6[125-9]|7[13-689])\\d{7}",,,,"621234567"],[,,"80[08]\\d{6}",,,,"800123456"],[,,"90\\d{7}",
  	,,,"900123456"],[,,"8(?:40|6[01])\\d{6}",,,,"840123456"],[,,,,,,,,,[-1]],[,,"41\\d{7}",,,,"412345678"],"TZ",255,"00[056]","0",,,"0",,,,[[,"(\\d{3})(\\d{2})(\\d{4})","$1 $2 $3",["[89]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[24]"],"0$1"],[,"(\\d{2})(\\d{7})","$1 $2",["5"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[67]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,"(?:8(?:[04]0|6[01])|90\\d)\\d{6}"],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],UA:[,[,,"[89]\\d{9}|[3-9]\\d{8}",,,,,,,[9,10],[5,6,7]],[,,"(?:3[1-8]|4[13-8]|5[1-7]|6[12459])\\d{7}",
  	,,,"311234567",,,[9],[5,6,7]],[,,"(?:39|50|6[36-8]|7[1-3]|9[1-9])\\d{7}",,,,"501234567",,,[9]],[,,"800[1-8]\\d{5,6}",,,,"800123456"],[,,"900[239]\\d{5,6}",,,,"900212345"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"89[1-579]\\d{6}",,,,"891234567",,,[9]],"UA",380,"00","0",,,"0",,"0~0",,[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["6[12][29]|(?:3[1-8]|4[136-8]|5[12457]|6[49])2|(?:56|65)[24]","6[12][29]|(?:35|4[1378]|5[12457]|6[49])2|(?:56|65)[24]|(?:3[1-46-8]|46)2[013-9]"],"0$1"],[,"(\\d{4})(\\d{5})","$1 $2",
  	["3[1-8]|4(?:[1367]|[45][6-9]|8[4-6])|5(?:[1-5]|6[0135689]|7[4-6])|6(?:[12][3-7]|[459])","3[1-8]|4(?:[1367]|[45][6-9]|8[4-6])|5(?:[1-5]|6(?:[015689]|3[02389])|7[4-6])|6(?:[12][3-7]|[459])"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[3-7]|89|9[1-9]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["[89]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],UG:[,[,,"800\\d{6}|(?:[29]0|[347]\\d)\\d{7}",,,,,,,[9],[5,6,7]],[,,"20(?:(?:240|30[67])\\d|6(?:00[0-2]|30[0-4]))\\d{3}|(?:20(?:[017]\\d|2[5-9]|32|5[0-4]|6[15-9])|[34]\\d{3})\\d{5}",
  	,,,"312345678",,,,[5,6,7]],[,,"726[01]\\d{5}|7(?:[01578]\\d|20|36|4[0-4]|6[0-5]|9[89])\\d{6}",,,,"712345678"],[,,"800[1-3]\\d{5}",,,,"800123456"],[,,"90[1-3]\\d{6}",,,,"901123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"UG",256,"00[057]","0",,,"0",,,,[[,"(\\d{4})(\\d{5})","$1 $2",["202","2024"],"0$1"],[,"(\\d{3})(\\d{6})","$1 $2",["[27-9]|4(?:6[45]|[7-9])"],"0$1"],[,"(\\d{2})(\\d{7})","$1 $2",["[34]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],US:[,[,,
  	"[2-9]\\d{9}|3\\d{6}",,,,,,,[10],[7]],[,,"5056(?:[0-35-9]\\d|4[46])\\d{4}|(?:4722|505[2-57-9]|983[29])\\d{6}|(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[01356]|3[0-24679]|4[167]|5[0-2]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[023578]|58|6[349]|7[0589]|8[04])|5(?:0[1-47-9]|1[0235-8]|20|3[0149]|4[01]|5[179]|6[1-47]|7[0-5]|8[0256])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[01679]|6[0-279]|78|8[0-29])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[0-59]|8[156])|8(?:0[1-68]|1[02-8]|2[068]|3[0-2589]|4[03578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[01357-9]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}",
  	,,,"2015550123",,,,[7]],[,,"5056(?:[0-35-9]\\d|4[46])\\d{4}|(?:4722|505[2-57-9]|983[29])\\d{6}|(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[01356]|3[0-24679]|4[167]|5[0-2]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[023578]|58|6[349]|7[0589]|8[04])|5(?:0[1-47-9]|1[0235-8]|20|3[0149]|4[01]|5[179]|6[1-47]|7[0-5]|8[0256])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[01679]|6[0-279]|78|8[0-29])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[0-59]|8[156])|8(?:0[1-68]|1[02-8]|2[068]|3[0-2589]|4[03578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[01357-9]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}",
  	,,,"2015550123",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002345678"],[,,"900[2-9]\\d{6}",,,,"9002345678"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"US",1,"011","1",,,"1",,,1,[[,"(\\d{3})(\\d{4})","$1-$2",["310"],,,1],[,"(\\d{3})(\\d{4})","$1-$2",
  	["[24-9]|3(?:[02-9]|1[1-9])"]],[,"(\\d{3})(\\d{3})(\\d{4})","($1) $2-$3",["[2-9]"],,,1]],[[,"(\\d{3})(\\d{4})","$1-$2",["310"],,,1],[,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["[2-9]"]]],[,,,,,,,,,[-1]],1,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],UY:[,[,,"0004\\d{2,9}|4\\d{9}|[1249]\\d{7}|(?:[49]\\d|80)\\d{5}",,,,,,,[6,7,8,9,10,11,12,13]],[,,"(?:1(?:770|9(?:20|87))|(?:2\\d|4[2-7])\\d\\d)\\d{4}",,,,"21231234",,,[8],[7]],[,,"9[1-9]\\d{6}",,,,"94231234",,,[8]],[,,"0004\\d{2,9}|(?:4\\d{5}|80[05])\\d{4}|405\\d{4}",
  	,,,"8001234"],[,,"90[0-8]\\d{4}",,,,"9001234",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"UY",598,"0(?:0|1[3-9]\\d)","0"," int. ",,"0",,"00",,[[,"(\\d{3})(\\d{3,4})","$1 $2",["0"]],[,"(\\d{3})(\\d{4})","$1 $2",["405|8|90"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["9"],"0$1"],[,"(\\d{4})(\\d{4})","$1 $2",["[124]"]],[,"(\\d{3})(\\d{3})(\\d{2,4})","$1 $2 $3",["0"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["4"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})(\\d{2,4})","$1 $2 $3 $4",["0"]]],,[,
  	,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],UZ:[,[,,"200\\d{6}|(?:33|[5-79]\\d|88)\\d{7}",,,,,,,[9]],[,,"(?:55\\d\\d|6(?:1(?:22|3[124]|4[1-4]|5[1-3578]|64)|2(?:22|3[0-57-9]|41)|5(?:22|3[3-7]|5[024-8])|6\\d\\d|7(?:[23]\\d|7[69])|9(?:22|4[1-8]|6[135]))|7(?:0(?:5[4-9]|6[0146]|7[124-6]|9[135-8])|(?:1[12]|8\\d)\\d|2(?:22|3[13-57-9]|4[1-3579]|5[14])|3(?:2\\d|3[1578]|4[1-35-7]|5[1-57]|61)|4(?:2\\d|3[1-579]|7[1-79])|5(?:22|5[1-9]|6[1457])|6(?:22|3[12457]|4[13-8])|9(?:22|5[1-9])))\\d{5}",
  	,,,"669050123"],[,,"(?:(?:200[01]|(?:33|50|88|9[0-57-9])\\d\\d)\\d|6(?:1(?:2(?:2[01]|98)|35[0-4]|50\\d|61[23]|7(?:[01][017]|4\\d|55|9[5-9]))|2(?:(?:11|7\\d)\\d|2(?:[12]1|9[01379])|5(?:[126]\\d|3[0-4]))|5(?:19[01]|2(?:27|9[26])|(?:30|59|7\\d)\\d)|6(?:2(?:1[5-9]|2[0367]|38|41|52|60)|(?:3[79]|9[0-3])\\d|4(?:56|83)|7(?:[07]\\d|1[017]|3[07]|4[047]|5[057]|67|8[0178]|9[79]))|7(?:2(?:24|3[237]|4[5-9]|7[15-8])|5(?:7[12]|8[0589])|7(?:0\\d|[39][07])|9(?:0\\d|7[079]))|9(?:2(?:1[1267]|3[01]|5\\d|7[0-4])|(?:5[67]|7\\d)\\d|6(?:2[0-26]|8\\d)))|7(?:[07]\\d{3}|1(?:13[01]|6(?:0[47]|1[67]|66)|71[3-69]|98\\d)|2(?:2(?:2[79]|95)|3(?:2[5-9]|6[0-6])|57\\d|7(?:0\\d|1[17]|2[27]|3[37]|44|5[057]|66|88))|3(?:2(?:1[0-6]|21|3[469]|7[159])|(?:33|9[4-6])\\d|5(?:0[0-4]|5[579]|9\\d)|7(?:[0-3579]\\d|4[0467]|6[67]|8[078]))|4(?:2(?:29|5[0257]|6[0-7]|7[1-57])|5(?:1[0-4]|8\\d|9[5-9])|7(?:0\\d|1[024589]|2[0-27]|3[0137]|[46][07]|5[01]|7[5-9]|9[079])|9(?:7[015-9]|[89]\\d))|5(?:112|2(?:0\\d|2[29]|[49]4)|3[1568]\\d|52[6-9]|7(?:0[01578]|1[017]|[23]7|4[047]|[5-7]\\d|8[78]|9[079]))|6(?:2(?:2[1245]|4[2-4])|39\\d|41[179]|5(?:[349]\\d|5[0-2])|7(?:0[017]|[13]\\d|22|44|55|67|88))|9(?:22[128]|3(?:2[0-4]|7\\d)|57[02569]|7(?:2[05-9]|3[37]|4\\d|60|7[2579]|87|9[07]))))\\d{4}",
  	,,,"912345678"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"UZ",998,"810","8",,,"8",,"8~10",,[[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["[235-9]"],"8 $1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],VA:[,[,,"0\\d{5,10}|3[0-8]\\d{7,10}|55\\d{8}|8\\d{5}(?:\\d{2,4})?|(?:1\\d|39)\\d{7,8}",,,,,,,[6,7,8,9,10,11,12]],[,,"06698\\d{1,6}",,,,"0669812345",,,[6,7,8,9,10,11]],[,,"3[1-9]\\d{8}|3[2-9]\\d{7}",,,,"3123456789",,,[9,10]],[,,"80(?:0\\d{3}|3)\\d{3}",
  	,,,"800123456",,,[6,9]],[,,"(?:0878\\d{3}|89(?:2\\d|3[04]|4(?:[0-4]|[5-9]\\d\\d)|5[0-4]))\\d\\d|(?:1(?:44|6[346])|89(?:38|5[5-9]|9))\\d{6}",,,,"899123456",,,[6,8,9,10]],[,,"84(?:[08]\\d{3}|[17])\\d{3}",,,,"848123456",,,[6,9]],[,,"1(?:78\\d|99)\\d{6}",,,,"1781234567",,,[9,10]],[,,"55\\d{8}",,,,"5512345678",,,[10]],"VA",39,"00",,,,,,,,,,[,,,,,,,,,[-1]],,"06698",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,"3[2-8]\\d{9,10}",,,,"33101234501",,,[11,12]]],VC:[,[,,"(?:[58]\\d\\d|784|900)\\d{7}",,,,,,,[10],[7]],
  	[,,"784(?:266|3(?:6[6-9]|7\\d|8[0-6])|4(?:38|5[0-36-8]|8[0-8])|5(?:55|7[0-2]|93)|638|784)\\d{4}",,,,"7842661234",,,,[7]],[,,"784(?:4(?:3[0-5]|5[45]|89|9[0-8])|5(?:2[6-9]|3[0-4])|720)\\d{4}",,,,"7844301234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002345678"],[,,"900[2-9]\\d{6}",,,,"9002345678"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,"78451[0-2]\\d{4}",,,,"7845101234",,,,[7]],"VC",1,"011","1",,,"([2-7]\\d{6})$|1","784$1",,,,,[,,,,,,,,,[-1]],,"784",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],VE:[,[,,"[68]00\\d{7}|(?:[24]\\d|[59]0)\\d{8}",,,,,,,[10],[7]],[,,"(?:2(?:12|3[457-9]|[467]\\d|[58][1-9]|9[1-6])|[4-6]00)\\d{7}",,,,"2121234567",,,,[7]],[,,"4(?:1[24-8]|2[46])\\d{7}",,,,"4121234567"],[,,"800\\d{7}",,,,"8001234567"],[,,"90[01]\\d{7}",,,,"9001234567"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],
  	"VE",58,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{7})","$1-$2",["[24-689]"],"0$1","$CC $1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"501\\d{7}",,,,"5010123456",,,,[7]],,,[,,,,,,,,,[-1]]],VG:[,[,,"(?:284|[58]\\d\\d|900)\\d{7}",,,,,,,[10],[7]],[,,"284(?:229|4(?:22|9[45])|774|8(?:52|6[459]))\\d{4}",,,,"2842291234",,,,[7]],[,,"284(?:245|3(?:0[0-3]|4[0-7]|68|9[34])|4(?:4[0-6]|68|9[69])|5(?:4[0-7]|68|9[69]))\\d{4}",,,,"2843001234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002345678"],[,,"900[2-9]\\d{6}",
  	,,,"9002345678"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",,,,"5002345678"],[,,,,,,,,,[-1]],"VG",1,"011","1",,,"([2-578]\\d{6})$|1","284$1",,,,,[,,,,,,,,,[-1]],,"284",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],VI:[,[,,"[58]\\d{9}|(?:34|90)0\\d{7}",,,,,,,[10],[7]],[,,"340(?:2(?:0[0-368]|2[06-8]|4[49]|77)|3(?:32|44)|4(?:2[23]|44|7[34]|89)|5(?:1[34]|55)|6(?:2[56]|4[23]|77|9[023])|7(?:1[2-57-9]|2[57]|7\\d)|884|998)\\d{4}",
  	,,,"3406421234",,,,[7]],[,,"340(?:2(?:0[0-368]|2[06-8]|4[49]|77)|3(?:32|44)|4(?:2[23]|44|7[34]|89)|5(?:1[34]|55)|6(?:2[56]|4[23]|77|9[023])|7(?:1[2-57-9]|2[57]|7\\d)|884|998)\\d{4}",,,,"3406421234",,,,[7]],[,,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",,,,"8002345678"],[,,"900[2-9]\\d{6}",,,,"9002345678"],[,,,,,,,,,[-1]],[,,"52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|33|44|66|77|88)[2-9]\\d{6}",
  	,,,"5002345678"],[,,,,,,,,,[-1]],"VI",1,"011","1",,,"([2-9]\\d{6})$|1","340$1",,1,,,[,,,,,,,,,[-1]],,"340",[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],VN:[,[,,"[12]\\d{9}|[135-9]\\d{8}|[16]\\d{7}|[16-8]\\d{6}",,,,,,,[7,8,9,10]],[,,"2(?:0[3-9]|1[0-689]|2[0-25-9]|[38][2-9]|4[2-8]|5[124-9]|6[0-39]|7[0-7]|9[0-4679])\\d{7}",,,,"2101234567",,,[10]],[,,"(?:5(?:2[238]|59)|89[6-9]|99[013-9])\\d{6}|(?:3\\d|5[689]|7[06-9]|8[1-8]|9[0-8])\\d{7}",,,,"912345678",,,[9]],[,,"1800\\d{4,6}|12(?:0[13]|28)\\d{4}",
  	,,,"1800123456",,,[8,9,10]],[,,"1900\\d{4,6}",,,,"1900123456",,,[8,9,10]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"672\\d{6}",,,,"672012345",,,[9]],"VN",84,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[17]99"],"0$1",,1],[,"(\\d{2})(\\d{5})","$1 $2",["80"],"0$1",,1],[,"(\\d{3})(\\d{4,5})","$1 $2",["69"],"0$1",,1],[,"(\\d{4})(\\d{4,6})","$1 $2",["1"],,,1],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["6"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[357-9]"],"0$1",,1],[,"(\\d{2})(\\d{4})(\\d{4})",
  	"$1 $2 $3",["2[48]"],"0$1",,1],[,"(\\d{3})(\\d{4})(\\d{3})","$1 $2 $3",["2"],"0$1",,1]],[[,"(\\d{2})(\\d{5})","$1 $2",["80"],"0$1",,1],[,"(\\d{4})(\\d{4,6})","$1 $2",["1"],,,1],[,"(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",["6"],"0$1",,1],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[357-9]"],"0$1",,1],[,"(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3",["2[48]"],"0$1",,1],[,"(\\d{3})(\\d{4})(\\d{3})","$1 $2 $3",["2"],"0$1",,1]],[,,,,,,,,,[-1]],,,[,,"[17]99\\d{4}|69\\d{5,6}",,,,,,,[7,8]],[,,"(?:[17]99|80\\d)\\d{4}|69\\d{5,6}",
  	,,,"1992000",,,[7,8]],,,[,,,,,,,,,[-1]]],VU:[,[,,"[57-9]\\d{6}|(?:[238]\\d|48)\\d{3}",,,,,,,[5,7]],[,,"(?:38[0-8]|48[4-9])\\d\\d|(?:2[02-9]|3[4-7]|88)\\d{3}",,,,"22123",,,[5]],[,,"(?:[58]\\d|7[013-7])\\d{5}",,,,"5912345",,,[7]],[,,"81[18]\\d\\d",,,,"81123",,,[5]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"9(?:0[1-9]|1[01])\\d{4}",,,,"9010123",,,[7]],"VU",678,"00",,,,,,,,[[,"(\\d{3})(\\d{4})","$1 $2",["[57-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"(?:3[03]|900\\d)\\d{3}",,,,"30123"],,
  	,[,,,,,,,,,[-1]]],WF:[,[,,"(?:40|72)\\d{4}|8\\d{5}(?:\\d{3})?",,,,,,,[6,9]],[,,"72\\d{4}",,,,"721234",,,[6]],[,,"(?:72|8[23])\\d{4}",,,,"821234",,,[6]],[,,"80[0-5]\\d{6}",,,,"800012345",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"WF",681,"00",,,,,,,,[[,"(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",["[478]"]],[,"(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",["8"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,"[48]0\\d{4}",,,,"401234",,,[6]]],WS:[,[,,"(?:[2-6]|8\\d{5})\\d{4}|[78]\\d{6}|[68]\\d{5}",
  	,,,,,,[5,6,7,10]],[,,"6[1-9]\\d{3}|(?:[2-5]|60)\\d{4}",,,,"22123",,,[5,6]],[,,"(?:7[1-35-7]|8(?:[3-7]|9\\d{3}))\\d{5}",,,,"7212345",,,[7,10]],[,,"800\\d{3}",,,,"800123",,,[6]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"WS",685,"0",,,,,,,,[[,"(\\d{5})","$1",["[2-5]|6[1-9]"]],[,"(\\d{3})(\\d{3,7})","$1 $2",["[68]"]],[,"(\\d{2})(\\d{5})","$1 $2",["7"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],XK:[,[,,"[23]\\d{7,8}|(?:4\\d\\d|[89]00)\\d{5}",,,,,,,[8,
  	9]],[,,"(?:2[89]|39)0\\d{6}|[23][89]\\d{6}",,,,"28012345"],[,,"4[3-9]\\d{6}",,,,"43201234",,,[8]],[,,"800\\d{5}",,,,"80001234",,,[8]],[,,"900\\d{5}",,,,"90001234",,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"XK",383,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{5})","$1 $2",["[89]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",["[2-4]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[23]"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],YE:[,[,,"(?:1|7\\d)\\d{7}|[1-7]\\d{6}",
  	,,,,,,[7,8,9],[6]],[,,"78[0-7]\\d{4}|17\\d{6}|(?:[12][2-68]|3[2358]|4[2-58]|5[2-6]|6[3-58]|7[24-6])\\d{5}",,,,"1234567",,,[7,8],[6]],[,,"7[01378]\\d{7}",,,,"712345678",,,[9]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"YE",967,"00","0",,,"0",,,,[[,"(\\d)(\\d{3})(\\d{3,4})","$1 $2 $3",["[1-6]|7(?:[24-6]|8[0-7])"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["7"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],YT:[,[,,"(?:80|9\\d)\\d{7}|(?:26|63)9\\d{6}",
  	,,,,,,[9]],[,,"269(?:0[0-467]|5[0-4]|6\\d|[78]0)\\d{4}",,,,"269601234"],[,,"639(?:0[0-79]|1[019]|[267]\\d|3[09]|40|5[05-9]|9[04-79])\\d{4}",,,,"639012345"],[,,"80\\d{7}",,,,"801234567"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"9(?:(?:39|47)8[01]|769\\d)\\d{4}",,,,"939801234"],"YT",262,"00","0",,,"0",,,,,,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],ZA:[,[,,"[1-79]\\d{8}|8\\d{4,9}",,,,,,,[5,6,7,8,9,10]],[,,"(?:2(?:0330|4302)|52087)0\\d{3}|(?:1[0-8]|2[1-378]|3[1-69]|4\\d|5[1346-8])\\d{7}",
  	,,,"101234567",,,[9]],[,,"(?:1(?:3492[0-25]|4495[0235]|549(?:20|5[01]))|4[34]492[01])\\d{3}|8[1-4]\\d{3,7}|(?:2[27]|47|54)4950\\d{3}|(?:1(?:049[2-4]|9[12]\\d\\d)|(?:6\\d|7[0-46-9])\\d{3}|8(?:5\\d{3}|7(?:08[67]|158|28[5-9]|310)))\\d{4}|(?:1[6-8]|28|3[2-69]|4[025689]|5[36-8])4920\\d{3}|(?:12|[2-5]1)492\\d{4}",,,,"711234567",,,[5,6,7,8,9]],[,,"80\\d{7}",,,,"801234567",,,[9]],[,,"(?:86[2-9]|9[0-2]\\d)\\d{6}",,,,"862345678",,,[9]],[,,"860\\d{6}",,,,"860123456",,,[9]],[,,,,,,,,,[-1]],[,,"87(?:08[0-589]|15[0-79]|28[0-4]|31[1-9])\\d{4}|87(?:[02][0-79]|1[0-46-9]|3[02-9]|[4-9]\\d)\\d{5}",
  	,,,"871234567",,,[9]],"ZA",27,"00","0",,,"0",,,,[[,"(\\d{2})(\\d{3,4})","$1 $2",["8[1-4]"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{2,3})","$1 $2 $3",["8[1-4]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["860"],"0$1"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["[1-9]"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["8"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"861\\d{6,7}",,,,"861123456",,,[9,10]],,,[,,,,,,,,,[-1]]],ZM:[,[,,"800\\d{6}|(?:21|63|[79]\\d)\\d{7}",,,,,,,[9],[6]],[,,"21[1-8]\\d{6}",,,,
  	"211234567",,,,[6]],[,,"(?:7[5-79]|9[5-8])\\d{7}",,,,"955123456"],[,,"800\\d{6}",,,,"800123456"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"63\\d{7}",,,,"630123456"],"ZM",260,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3})","$1 $2",["[1-9]"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[28]"],"0$1"],[,"(\\d{2})(\\d{7})","$1 $2",["[79]"],"0$1"]],[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[28]"],"0$1"],[,"(\\d{2})(\\d{7})","$1 $2",["[79]"],"0$1"]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,
  	,,,,,,,,[-1]]],ZW:[,[,,"2(?:[0-57-9]\\d{6,8}|6[0-24-9]\\d{6,7})|[38]\\d{9}|[35-8]\\d{8}|[3-6]\\d{7}|[1-689]\\d{6}|[1-3569]\\d{5}|[1356]\\d{4}",,,,,,,[5,6,7,8,9,10],[3,4]],[,,"(?:1(?:(?:3\\d|9)\\d|[4-8])|2(?:(?:(?:0(?:2[014]|5)|(?:2[0157]|31|84|9)\\d\\d|[56](?:[14]\\d\\d|20)|7(?:[089]|2[03]|[35]\\d\\d))\\d|4(?:2\\d\\d|8))\\d|1(?:2|[39]\\d{4}))|3(?:(?:123|(?:29\\d|92)\\d)\\d\\d|7(?:[19]|[56]\\d))|5(?:0|1[2-478]|26|[37]2|4(?:2\\d{3}|83)|5(?:25\\d\\d|[78])|[689]\\d)|6(?:(?:[16-8]21|28|52[013])\\d\\d|[39])|8(?:[1349]28|523)\\d\\d)\\d{3}|(?:4\\d\\d|9[2-9])\\d{4,5}|(?:(?:2(?:(?:(?:0|8[146])\\d|7[1-7])\\d|2(?:[278]\\d|92)|58(?:2\\d|3))|3(?:[26]|9\\d{3})|5(?:4\\d|5)\\d\\d)\\d|6(?:(?:(?:[0-246]|[78]\\d)\\d|37)\\d|5[2-8]))\\d\\d|(?:2(?:[569]\\d|8[2-57-9])|3(?:[013-59]\\d|8[37])|6[89]8)\\d{3}",
  	,,,"1312345",,,,[3,4]],[,,"7(?:[178]\\d|3[1-9])\\d{6}",,,,"712345678",,,[9]],[,,"80(?:[01]\\d|20|8[0-8])\\d{3}",,,,"8001234",,,[7]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"86(?:1[12]|22|30|44|55|77|8[368])\\d{6}",,,,"8686123456",,,[10]],"ZW",263,"00","0",,,"0",,,,[[,"(\\d{3})(\\d{3,5})","$1 $2",["2(?:0[45]|2[278]|[49]8)|3(?:[09]8|17)|6(?:[29]8|37|75)|[23][78]|(?:33|5[15]|6[68])[78]"],"0$1"],[,"(\\d)(\\d{3})(\\d{2,4})","$1 $2 $3",["[49]"],"0$1"],[,"(\\d{3})(\\d{4})","$1 $2",["80"],"0$1"],
  	[,"(\\d{2})(\\d{7})","$1 $2",["24|8[13-59]|(?:2[05-79]|39|5[45]|6[15-8])2","2(?:02[014]|4|[56]20|[79]2)|392|5(?:42|525)|6(?:[16-8]21|52[013])|8[13-59]"],"(0$1)"],[,"(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",["7"],"0$1"],[,"(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3",["2(?:1[39]|2[0157]|[378]|[56][14])|3(?:12|29)","2(?:1[39]|2[0157]|[378]|[56][14])|3(?:123|29)"],"0$1"],[,"(\\d{4})(\\d{6})","$1 $2",["8"],"0$1"],[,"(\\d{2})(\\d{3,5})","$1 $2",["1|2(?:0[0-36-9]|12|29|[56])|3(?:1[0-689]|[24-6])|5(?:[0236-9]|1[2-4])|6(?:[013-59]|7[0-46-9])|(?:33|55|6[68])[0-69]|(?:29|3[09]|62)[0-79]"],
  	"0$1"],[,"(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3",["29[013-9]|39|54"],"0$1"],[,"(\\d{4})(\\d{3,5})","$1 $2",["(?:25|54)8","258|5483"],"0$1"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],800:[,[,,"(?:00|[1-9]\\d)\\d{6}",,,,,,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:00|[1-9]\\d)\\d{6}",,,,"12345678"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"001",800,,,,,,,,1,[[,"(\\d{4})(\\d{4})","$1 $2",["\\d"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],
  	,,[,,,,,,,,,[-1]]],808:[,[,,"[1-9]\\d{7}",,,,,,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"[1-9]\\d{7}",,,,"12345678"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"001",808,,,,,,,,1,[[,"(\\d{4})(\\d{4})","$1 $2",["[1-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],870:[,[,,"7\\d{11}|[35-7]\\d{8}",,,,,,,[9,12]],[,,,,,,,,,[-1]],[,,"(?:[356]|774[45])\\d{8}|7[6-8]\\d{7}",,,,"301234567"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,
  	,,,,,,[-1]],"001",870,,,,,,,,,[[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["[35-7]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],878:[,[,,"10\\d{10}",,,,,,,[12]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"10\\d{10}",,,,"101234567890"],"001",878,,,,,,,,1,[[,"(\\d{2})(\\d{5})(\\d{5})","$1 $2 $3",["1"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],881:[,[,,"[0-36-9]\\d{8}",,,,,,,[9]],[,,,,,,,,
  	,[-1]],[,,"[0-36-9]\\d{8}",,,,"612345678"],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"001",881,,,,,,,,,[[,"(\\d)(\\d{3})(\\d{5})","$1 $2 $3",["[0-36-9]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],882:[,[,,"[13]\\d{6}(?:\\d{2,5})?|[19]\\d{7}|(?:[25]\\d\\d|4)\\d{7}(?:\\d{2})?",,,,,,,[7,8,9,10,11,12]],[,,,,,,,,,[-1]],[,,"342\\d{4}|(?:337|49)\\d{6}|(?:3(?:2|47|7\\d{3})|50\\d{3})\\d{7}",,,,"3421234",,,[7,8,9,10,12]],[,,,,,,,,,[-1]],[,
  	,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"1(?:3(?:0[0347]|[13][0139]|2[035]|4[013568]|6[0459]|7[06]|8[15-8]|9[0689])\\d{4}|6\\d{5,10})|(?:345\\d|9[89])\\d{6}|(?:10|2(?:3|85\\d)|3(?:[15]|[69]\\d\\d)|4[15-8]|51)\\d{8}",,,,"390123456789"],"001",882,,,,,,,,,[[,"(\\d{2})(\\d{5})","$1 $2",["16|342"]],[,"(\\d{2})(\\d{6})","$1 $2",["49"]],[,"(\\d{2})(\\d{2})(\\d{4})","$1 $2 $3",["1[36]|9"]],[,"(\\d{2})(\\d{4})(\\d{3})","$1 $2 $3",["3[23]"]],[,"(\\d{2})(\\d{3,4})(\\d{4})","$1 $2 $3",["16"]],[,"(\\d{2})(\\d{4})(\\d{4})",
  	"$1 $2 $3",["10|23|3(?:[15]|4[57])|4|51"]],[,"(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3",["34"]],[,"(\\d{2})(\\d{4,5})(\\d{5})","$1 $2 $3",["[1-35]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,"348[57]\\d{7}",,,,"34851234567",,,[11]]],883:[,[,,"(?:[1-4]\\d|51)\\d{6,10}",,,,,,,[8,9,10,11,12]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"(?:2(?:00\\d\\d|10)|(?:370[1-9]|51\\d0)\\d)\\d{7}|51(?:00\\d{5}|[24-9]0\\d{4,7})|(?:1[013-79]|2[24-689]|3[02-689]|4[0-4])0\\d{5,9}",
  	,,,"510012345"],"001",883,,,,,,,,1,[[,"(\\d{3})(\\d{3})(\\d{2,8})","$1 $2 $3",["[14]|2[24-689]|3[02-689]|51[24-9]"]],[,"(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",["510"]],[,"(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3",["21"]],[,"(\\d{4})(\\d{4})(\\d{4})","$1 $2 $3",["51[13]"]],[,"(\\d{3})(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",["[235]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]],888:[,[,,"\\d{11}",,,,,,,[11]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,
  	,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"001",888,,,,,,,,1,[[,"(\\d{3})(\\d{3})(\\d{5})","$1 $2 $3"]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,"\\d{11}",,,,"12345678901"],,,[,,,,,,,,,[-1]]],979:[,[,,"[1359]\\d{8}",,,,,,,[9],[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,"[1359]\\d{8}",,,,"123456789",,,,[8]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],"001",979,,,,,,,,1,[[,"(\\d)(\\d{4})(\\d{4})","$1 $2 $3",["[1359]"]]],,[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]],[,,,,,,,,,[-1]],,,[,,,,,,,,,[-1]]]};/*

  	 Copyright (C) 2010 The Libphonenumber Authors.

  	 Licensed under the Apache License, Version 2.0 (the "License");
  	 you may not use this file except in compliance with the License.
  	 You may obtain a copy of the License at

  	 http://www.apache.org/licenses/LICENSE-2.0

  	 Unless required by applicable law or agreed to in writing, software
  	 distributed under the License is distributed on an "AS IS" BASIS,
  	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  	 See the License for the specific language governing permissions and
  	 limitations under the License.
  	*/
  	function H(){this.g={};}H.g=void 0;H.h=function(){return H.g?H.g:H.g=new H};
  	var wa={0:"0",1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9","\uff10":"0","\uff11":"1","\uff12":"2","\uff13":"3","\uff14":"4","\uff15":"5","\uff16":"6","\uff17":"7","\uff18":"8","\uff19":"9","\u0660":"0","\u0661":"1","\u0662":"2","\u0663":"3","\u0664":"4","\u0665":"5","\u0666":"6","\u0667":"7","\u0668":"8","\u0669":"9","\u06f0":"0","\u06f1":"1","\u06f2":"2","\u06f3":"3","\u06f4":"4","\u06f5":"5","\u06f6":"6","\u06f7":"7","\u06f8":"8","\u06f9":"9"},xa={0:"0",1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",
  	7:"7",8:"8",9:"9","+":"+","*":"*","#":"#"},ya={0:"0",1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9","\uff10":"0","\uff11":"1","\uff12":"2","\uff13":"3","\uff14":"4","\uff15":"5","\uff16":"6","\uff17":"7","\uff18":"8","\uff19":"9","\u0660":"0","\u0661":"1","\u0662":"2","\u0663":"3","\u0664":"4","\u0665":"5","\u0666":"6","\u0667":"7","\u0668":"8","\u0669":"9","\u06f0":"0","\u06f1":"1","\u06f2":"2","\u06f3":"3","\u06f4":"4","\u06f5":"5","\u06f6":"6","\u06f7":"7","\u06f8":"8","\u06f9":"9",A:"2",
  	B:"2",C:"2",D:"3",E:"3",F:"3",G:"4",H:"4",I:"4",J:"5",K:"5",L:"5",M:"6",N:"6",O:"6",P:"7",Q:"7",R:"7",S:"7",T:"8",U:"8",V:"8",W:"9",X:"9",Y:"9",Z:"9"},za=/[\d]+(?:[~\u2053\u223C\uFF5E][\d]+)?/,Aa=RegExp("[+\uff0b]+"),I=RegExp("^[+\uff0b]+"),Ba=RegExp("([0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9])"),Ca=RegExp("[+\uff0b0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]"),Da=/[\\\/] *x/,Ea=RegExp("[^0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9A-Za-z#]+$"),Fa=/(?:.*?[A-Za-z]){3}.*/,Ga=RegExp("^\\+([0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]|[\\-\\.\\(\\)]?)*[0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]([0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]|[\\-\\.\\(\\)]?)*$"),
  	Ha=RegExp("^([A-Za-z0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]+((\\-)*[A-Za-z0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9])*\\.)*[A-Za-z]+((\\-)*[A-Za-z0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9])*\\.?$");function J(a){return "([0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]{1,"+a+"})"}
  	function Ia(){return ";ext="+J("20")+"|[ \u00a0\\t,]*(?:e?xt(?:ensi(?:o\u0301?|\u00f3))?n?|\uff45?\uff58\uff54\uff4e?|\u0434\u043e\u0431|anexo)[:\\.\uff0e]?[ \u00a0\\t,-]*"+(J("20")+"#?|[ \u00a0\\t,]*(?:[x\uff58#\uff03~\uff5e]|int|\uff49\uff4e\uff54)[:\\.\uff0e]?[ \u00a0\\t,-]*")+(J("9")+"#?|[- ]+")+(J("6")+"#|[ \u00a0\\t]*(?:,{2}|;)[:\\.\uff0e]?[ \u00a0\\t,-]*")+(J("15")+"#?|[ \u00a0\\t]*(?:,)+[:\\.\uff0e]?[ \u00a0\\t,-]*")+(J("9")+"#?")}
  	var Ja=new RegExp("(?:"+Ia()+")$","i"),Ka=new RegExp("^[0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]{2}$|^[+\uff0b]*(?:[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\\[\\]/~\u2053\u223c\uff5e*]*[0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]){3,}[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\\[\\]/~\u2053\u223c\uff5e*A-Za-z0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]*(?:"+Ia()+")?$","i"),La=/(\$\d)/,
  	Ma=/^\(?\$1\)?$/;function Na(a){return 2>a.length?false:K(Ka,a)}function Oa(a){return K(Fa,a)?Pa(a,ya):Pa(a,wa)}function Qa(a){var b=Oa(a.toString());A(a);a.g(b);}function Ra(){return Object.keys(G).filter(function(a){return isNaN(a)})}function Sa(){return Object.keys(G).filter(function(a){return !isNaN(a)}).map(function(a){return parseInt(a,10)})}function Ta(){var a=Object.keys(F);return [...Sa(),...a.map(function(b){return parseInt(b,10)})]}	function Pa(a,b){for(var c=new z,d,e=a.length,f=0;f<e;++f)d=a.charAt(f),d=b[d.toUpperCase()],null!=d&&c.g(d);return c.toString()}function Va(a){return 0==a.length||Ma.test(a)}function L(a){return null!=a&&isNaN(a)&&a.toUpperCase()in G}function M(a,b,c){if(0==n(b,2)&&m(b,5)){var d=u(b,5);if(0<d.length)return d}d=u(b,1);var e=N(b);if(0==c)return Wa(d,0,e,"");if(!(d in F))return e;a=O(a,d,P(d));b=Xa(b,a,c);e=Ya(e,a,c);return Wa(d,c,e,b)}function O(a,b,c){return "001"==c?Q(a,""+b):Q(a,c)}
  	function Za(a,b){var c=S;if(!L(b))return M(c,a,1);var d=u(a,1),e=N(a);if(!(d in F))return e;if(1==d){if(null!=b&&F[1].includes(b.toUpperCase()))return d+" "+M(c,a,2)}else if(d==T(c,b))return M(c,a,2);var f=Q(c,b),g=u(f,11);b="";m(f,17)?b=u(f,17):K(za,g)&&(b=g);c=O(c,d,P(d));e=Ya(e,c,1);a=Xa(a,c,1);return 0<b.length?b+" "+d+" "+e+a:Wa(d,1,e,a)}function N(a){if(!m(a,2))return "";var b=""+n(a,2);return m(a,4)&&n(a,4)&&0<u(a,8)?Array(u(a,8)+1).join("0")+b:b}
  	function Wa(a,b,c,d){switch(b){case 0:return "+"+a+c+d;case 1:return "+"+a+" "+c+d;case 3:return "tel:+"+a+"-"+c+d;default:return c+d}}
  	function Ya(a,b,c){a:{b=0==r(b,20).length||2==c?r(b,19):r(b,20);for(var d,e=b.length,f=0;f<e;++f){d=b[f];var g=v(d,3);if(0==g||0==a.search(n(d,3,g-1)))if(g=new RegExp(n(d,1)),K(g,a)){b=d;break a}}b=null;}null==b?c=a:(e=b,b=u(e,2),d=new RegExp(n(e,1)),u(e,5),e=u(e,4),a=2==c&&null!=e&&0<e.length?a.replace(d,b.replace(La,e)):a.replace(d,b),3==c&&(a=a.replace(RegExp("^[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\\[\\]/~\u2053\u223c\uff5e]+"),""),a=
  	a.replace(RegExp("[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\\[\\]/~\u2053\u223c\uff5e]+","g"),"-")),c=a);return c}function $a(a,b){var c=S;if(!L(a))return null;b=ab(Q(c,a),b);try{if(m(b,6)){var d=n(b,6);return bb(c,d,a)}}catch(e){}return null}function Xa(a,b,c){return m(a,3)&&0!=n(a,3).length?3==c?";ext="+n(a,3):m(b,13)?n(b,13)+u(a,3):" ext. "+u(a,3):""}
  	function ab(a,b){switch(b){case 4:return n(a,5);case 3:return n(a,4);case 1:return n(a,3);case 0:case 2:return n(a,2);case 5:return n(a,6);case 6:return n(a,8);case 7:return n(a,7);case 8:return n(a,21);case 9:return n(a,25);case 10:return n(a,28);default:return n(a,1)}}function cb(a,b){return U(a,n(b,1))?U(a,n(b,5))?4:U(a,n(b,4))?3:U(a,n(b,6))?5:U(a,n(b,8))?6:U(a,n(b,7))?7:U(a,n(b,21))?8:U(a,n(b,25))?9:U(a,n(b,28))?10:U(a,n(b,2))?n(b,18)||U(a,n(b,3))?2:0:!n(b,18)&&U(a,n(b,3))?1:-1:-1}
  	function Q(a,b){if(null==b)return null;b=b.toUpperCase();var c=a.g[b];if(null==c){c=G[b];if(null==c)return null;c=(new y).g(D.o(),c);a.g[b]=c;}return c}function U(a,b){var c=a.length;return 0<v(b,9)&&-1==r(b,9).indexOf(c)?false:K(u(b,2),a)}function db(a){var b=S,c=eb(b,a);var d=u(a,1);var e=O(b,d,c);null==e||"001"!=c&&d!=T(b,c)?e=false:(a=N(a),e=-1!=cb(a,e));return e}
  	function eb(a,b){if(null==b)return null;var c=u(b,1);c=F[c];if(null==c)a=null;else if(1==c.length)a=c[0];else a:{b=N(b);for(var d,e=c.length,f=0;f<e;f++){d=c[f];var g=Q(a,d);if(m(g,23)){if(0==b.search(n(g,23))){a=d;break a}}else if(-1!=cb(b,g)){a=d;break a}}a=null;}return a}function P(a){a=F[a];return null==a?"ZZ":a[0]}function T(a,b){a=Q(a,b);if(null==a)throw Error("Invalid region code: "+b);return u(a,10)}function fb(a){a=gb(a);return 0==a||4==a}
  	function hb(a,b,c,d){var e=ab(c,d),f=0==v(e,9)?r(n(c,1),9):r(e,9);e=r(e,10);if(-1==f[0])return 5;b=b.length;if(-1<e.indexOf(b))return 4;c=f[0];return c==b?0:c>b?2:f[f.length-1]<b?3:-1<f.indexOf(b,1)?0:5}function gb(a){var b=S,c=N(a);a=u(a,1);if(!(a in F))return 1;a=O(b,a,P(a));return hb(b,c,a,-1)}
  	function ib(a,b){a=a.toString();if(0==a.length||"0"==a.charAt(0))return 0;for(var c,d=a.length,e=1;3>=e&&e<=d;++e)if(c=parseInt(a.substring(0,e),10),c in F)return b.g(a.substring(e)),c;return 0}
  	function jb(a,b,c,d,e){if(0==b.length)return 0;b=new z(b);var f;null!=c&&(f=n(c,11));null==f&&(f="NonMatch");var g=b.toString();if(0==g.length)f=20;else if(I.test(g))g=g.replace(I,""),A(b),b.g(Oa(g)),f=1;else {g=new RegExp(f);Qa(b);f=b.toString();if(0==f.search(g)){g=f.match(g)[0].length;var l=f.substring(g).match(Ba);l&&null!=l[1]&&0<l[1].length&&"0"==Pa(l[1],wa)?f=false:(A(b),b.g(f.substring(g)),f=true);}else f=false;f=f?5:20;}if(20!=f){if(2>=b.h.length)throw Error("Phone number too short after IDD");a=ib(b,
  	d);if(0!=a)return p(e,1,a),a;throw Error("Invalid country calling code");}if(null!=c&&(f=u(c,10),g=""+f,l=b.toString(),0==l.lastIndexOf(g,0)&&(g=new z(l.substring(g.length)),l=n(c,1),l=new RegExp(u(l,2)),kb(g,c,null),g=g.toString(),!K(l,b.toString())&&K(l,g)||3==hb(a,b.toString(),c,-1))))return d.g(g),p(e,1,f),f;p(e,1,0);return 0}
  	function kb(a,b,c){var d=a.toString(),e=d.length,f=n(b,15);if(0!=e&&null!=f&&0!=f.length){var g=new RegExp("^(?:"+f+")");if(e=g.exec(d)){f=new RegExp(u(n(b,1),2));var l=K(f,d),q=e.length-1;b=n(b,16);if(null==b||0==b.length||null==e[q]||0==e[q].length){if(!l||K(f,d.substring(e[0].length)))null!=c&&0<q&&null!=e[q]&&c.g(e[1]),a.set(d.substring(e[0].length));}else if(d=d.replace(g,b),!l||K(f,d))null!=c&&0<q&&c.g(e[1]),a.set(d);}}}
  	function bb(a,b,c){if(null==b)throw Error("The string supplied did not seem to be a phone number");if(250<b.length)throw Error("The string supplied is too long to be a phone number");var d=new z;var e=b.indexOf(";phone-context=");if(-1===e)e=null;else if(e+=15,e>=b.length)e="";else {var f=b.indexOf(";",e);e=-1!==f?b.substring(e,f):b.substring(e);}var g=e;null==g?f=true:0===g.length?f=false:(f=Ga.exec(g),g=Ha.exec(g),f=null!==f||null!==g);if(!f)throw Error("The string supplied did not seem to be a phone number");
  	null!=e?("+"===e.charAt(0)&&d.g(e),e=b.indexOf("tel:"),d.g(b.substring(0<=e?e+4:0,b.indexOf(";phone-context=")))):(e=d.g,b=null!=b?b:"",f=b.search(Ca),0<=f?(b=b.substring(f),b=b.replace(Ea,""),f=b.search(Da),0<=f&&(b=b.substring(0,f))):b="",e.call(d,b));b=d.toString();e=b.indexOf(";isub=");0<e&&(A(d),d.g(b.substring(0,e)));if(!Na(d.toString()))throw Error("The string supplied did not seem to be a phone number");b=d.toString();if(!(L(c)||null!=b&&0<b.length&&I.test(b)))throw Error("Invalid country calling code");
  	b=new E;a:{e=d.toString();f=e.search(Ja);if(0<=f&&Na(e.substring(0,f))){g=e.match(Ja);for(var l=g.length,q=1;q<l;++q)if(null!=g[q]&&0<g[q].length){A(d);d.g(e.substring(0,f));e=g[q];break a}}e="";}0<e.length&&p(b,3,e);f=Q(a,c);e=new z;g=0;l=d.toString();try{g=jb(a,l,f,e,b);}catch(R){if("Invalid country calling code"==R.message&&I.test(l)){if(l=l.replace(I,""),g=jb(a,l,f,e,b),0==g)throw R;}else throw R;}0!=g?(d=P(g),d!=c&&(f=O(a,g,d))):(Qa(d),e.g(d.toString()),null!=c&&(g=u(f,10),p(b,1,g)));if(2>e.h.length)throw Error("The string supplied is too short to be a phone number");
  	null!=f&&(c=new z(e.toString()),kb(c,f,new z),a=hb(a,c.toString(),f,-1),2!=a&&4!=a&&5!=a&&(e=c));a=e.toString();c=a.length;if(2>c)throw Error("The string supplied is too short to be a phone number");if(17<c)throw Error("The string supplied is too long to be a phone number");if(1<a.length&&"0"==a.charAt(0)){p(b,4,true);for(c=1;c<a.length-1&&"0"==a.charAt(c);)c++;1!=c&&p(b,8,c);}p(b,2,parseInt(a,10));return b}
  	H.prototype.ja=function(a){var b=Q(this,eb(this,a));if(null==b)return true;a=N(a);return !U(a,n(b,24))};function K(a,b){return (a="string"==typeof a?b.match("^(?:"+a+")$"):b.match(a))&&a[0].length==b.length?true:false}function lb(a){this.ka=RegExp("\u2008");this.la="";this.$=new z;this.da="";this.u=new z;this.ba=new z;this.v=true;this.ea=this.ca=this.oa=false;this.pa=H.h();this.aa=0;this.h=new z;this.ha=false;this.s="";this.g=new z;this.j=[];this.ma=a;this.wa=this.m=mb(this,this.ma);}var nb=new D;p(nb,11,"NA");
  	var ob=RegExp("^[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\\[\\]/~\u2053\u223c\uff5e]*\\$1[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\\[\\]/~\u2053\u223c\uff5e]*(\\$\\d[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\\[\\]/~\u2053\u223c\uff5e]*)*$"),pb=/[- ]/;function mb(a,b){b=L(b)?T(a.pa,b):0;a=Q(a.pa,P(b));return null!=a?a:nb}
  	function qb(a){for(var b=a.j.length,c=0;c<b;++c){var d=a.j[c],e=u(d,1);if(a.da==e)return false;var f=a;var g=d,l=u(g,1);A(f.$);var q=f;g=u(g,2);var R="999999999999999".match(l)[0];R.length<q.g.h.length?q="":(q=R.replace(new RegExp(l,"g"),g),q=q.replace(RegExp("9","g"),"\u2008"));0<q.length?(f.$.g(q),f=true):f=false;if(f)return a.da=e,a.ha=pb.test(n(d,4)),a.aa=0,true}return a.v=false}
  	function rb(a,b){for(var c=[],d=b.length-3,e=a.j.length,f=0;f<e;++f){var g=a.j[f];0==v(g,3)?c.push(a.j[f]):(g=n(g,3,Math.min(d,v(g,3)-1)),0==b.search(g)&&c.push(a.j[f]));}a.j=c;}
  	function sb(a,b){a.u.g(b);var c=b;Ba.test(c)||1==a.u.h.length&&Aa.test(c)?("+"==b?(c=b,a.ba.g(b)):(c=wa[b],a.ba.g(c),a.g.g(c)),b=c):(a.v=false,a.oa=true);if(!a.v){if(!a.oa)if(tb(a)){if(ub(a))return vb(a)}else if(0<a.s.length&&(b=a.g.toString(),A(a.g),a.g.g(a.s),a.g.g(b),b=a.h.toString(),c=b.lastIndexOf(a.s),A(a.h),a.h.g(b.substring(0,c))),a.s!=wb(a))return a.h.g(" "),vb(a);return a.u.toString()}switch(a.ba.h.length){case 0:case 1:case 2:return a.u.toString();case 3:if(tb(a))a.ea=true;else return a.s=wb(a),
  	xb(a);default:if(a.ea)return ub(a)&&(a.ea=false),a.h.toString()+a.g.toString();if(0<a.j.length){b=yb(a,b);c=zb(a);if(0<c.length)return c;rb(a,a.g.toString());return qb(a)?Ab(a):a.v?Bb(a,b):a.u.toString()}return xb(a)}}function vb(a){a.v=true;a.ea=false;a.j=[];a.aa=0;A(a.$);a.da="";return xb(a)}
  	function zb(a){for(var b=a.g.toString(),c=a.j.length,d=0;d<c;++d){var e=a.j[d],f=u(e,1);if((new RegExp("^(?:"+f+")$")).test(b)&&(a.ha=pb.test(n(e,4)),e=b.replace(new RegExp(f,"g"),n(e,2)),e=Bb(a,e),Pa(e,xa)==a.ba))return e}return ""}function Bb(a,b){var c=a.h.h.length;return a.ha&&0<c&&" "!=a.h.toString().charAt(c-1)?a.h+" "+b:a.h+b}
  	function xb(a){var b=a.g.toString();if(3<=b.length){for(var c=a.ca&&0==a.s.length&&0<v(a.m,20)?r(a.m,20):r(a.m,19),d=c.length,e=0;e<d;++e){var f=c[e];0<a.s.length&&Va(u(f,4))&&!n(f,6)&&!m(f,5)||(0!=a.s.length||a.ca||Va(u(f,4))||n(f,6))&&ob.test(u(f,2))&&a.j.push(f);}rb(a,b);b=zb(a);return 0<b.length?b:qb(a)?Ab(a):a.u.toString()}return Bb(a,b)}function Ab(a){var b=a.g.toString(),c=b.length;if(0<c){for(var d="",e=0;e<c;e++)d=yb(a,b.charAt(e));return a.v?Bb(a,d):a.u.toString()}return a.h.toString()}
  	function wb(a){var b=a.g.toString(),c=0;if(1!=a.m.ia())var d=false;else d=a.g.toString(),d="1"==d.charAt(0)&&"0"!=d.charAt(1)&&"1"!=d.charAt(1);d?(c=1,a.h.g("1").g(" "),a.ca=true):m(a.m,15)&&(d=new RegExp("^(?:"+n(a.m,15)+")"),d=b.match(d),null!=d&&null!=d[0]&&0<d[0].length&&(a.ca=true,c=d[0].length,a.h.g(b.substring(0,c))));A(a.g);a.g.g(b.substring(c));return b.substring(0,c)}
  	function tb(a){var b=a.ba.toString(),c=new RegExp("^(?:\\+|"+n(a.m,11)+")");c=b.match(c);return null!=c&&null!=c[0]&&0<c[0].length?(a.ca=true,c=c[0].length,A(a.g),a.g.g(b.substring(c)),A(a.h),a.h.g(b.substring(0,c)),"+"!=b.charAt(0)&&a.h.g(" "),true):false}function ub(a){if(0==a.g.h.length)return false;var b=new z,c=ib(a.g,b);if(0==c)return false;A(a.g);a.g.g(b.toString());b=P(c);"001"==b?a.m=Q(a.pa,""+c):b!=a.ma&&(a.m=mb(a,b));a.h.g(""+c).g(" ");a.s="";return true}
  	function yb(a,b){var c=a.$.toString();if(0<=c.substring(a.aa).search(a.ka)){var d=c.search(a.ka);b=c.replace(a.ka,b);A(a.$);a.$.g(b);a.aa=d;return b.substring(0,a.aa+1)}1==a.j.length&&(a.v=false);a.da="";return a.u.toString()}var S=H.h();function Cb(a){var b=S,c=eb(b,a);b=O(b,u(a,1),c);null==b?a=-1:(a=N(a),a=cb(a,b));switch(a){case 0:return "fixed-line";case 2:return "fixed-line-or-mobile";case 1:return "mobile";case 8:return "pager";case 7:return "personal-number";case 4:return "premium-rate";case 5:return "shared-cost";case 3:return "toll-free";case 9:return "uan";case 6:return "voip";default:case -1:return "unknown"}}
  	function Db(a){switch(a){case "fixed-line":return 0;case "fixed-line-or-mobile":return 2;case "mobile":return 1;case "pager":return 8;case "personal-number":return 7;case "premium-rate":return 4;case "shared-cost":return 5;case "toll-free":return 3;case "uan":return 9;case "voip":return 6;default:case "unknown":return -1}}
  	function Eb(a){try{switch(gb(a)){case 0:return "is-possible";case 1:return "invalid-country-code";case 3:return "too-long";case 2:return "too-short"}if(fb(a))return "is-possible"}catch(b){}return "unknown"}
  	function Fb(a,b){if("+"!==a.charAt(0)&&"00"!==a.slice(0,2))return {parsed:c,fa:d};try{var c=bb(S,a,b);}catch(e){}if(c){var d=eb(S,c);if(null!=d&&"ZZ"!==d)return {parsed:c,fa:d}}for(b=1;4>b;++b){d=void 0;if(a.length<b+1)return {parsed:c,fa:d};d=P(a.substring(1,b+1));if("ZZ"!==d)return {fa:d}}return {parsed:c,fa:void 0}}var Gb;a:{try{Gb=new WeakMap;break a}catch(a){}Gb=void 0;}var Hb=Gb;
  	function V(a,b){if(!(this instanceof V))return new V(a,b);var c=null==b?void 0:b.regionCode;if("string"===typeof a)var d=false;else try{db(a),d=!0;}catch(f){d=false;}let e;if(!d&&"string"!==typeof a)throw Error("Invalid phone number, expected a string");if(!d&&"object"!==typeof b&&"undefined"!==typeof b)throw Error(`Invalid options, expected object, got ${typeof b}. `+"This may be because of not yet upgraded code.");if(!d&&null!=c&&"string"!==typeof c)throw Error("Invalid region code, expected a string, got "+
  	`${typeof c} ${c}`);d||(a=a.trim(),c&&"+"===a.charAt(0)&&(c=null),c&&"+"!==a.charAt(0)&&"00"!==a.slice(0,2)||({fa:c=null,parsed:e}=Fb(a,c)));this.g={number:{},regionCode:c,valid:false,possible:false};Hb&&Hb.set(this.g,this);if(d)this.l=a;else {this.l=null;this.g.number.input=a;if(!c){this.g.possibility="invalid-country-code";return}if(0===Ib(c)){this.g.possibility="invalid-country-code";return}try{this.l=e?e:bb(S,a,c);}catch(f){this.g.possibility=Eb(a);return}}this.g.number.international=M(S,this.l,1);this.g.number.national=
  	M(S,this.l,2);this.g.number.e164=M(S,this.l,0);this.g.number.rfc3966=M(S,this.l,3);this.g.number.significant=N(this.l);this.g.canBeInternationallyDialled=S.ja(this.l);this.g.valid=db(this.l);this.g.possible=fb(this.l);this.g.possibility=Eb(this.l);!this.g.valid&&this.g.possible&&(this.g.possibility="invalid",this.g.possible=false);this.g.type=Cb(this.l);this.g.typeIsMobile=this.sa();this.g.typeIsFixedLine=this.ra();this.g.countryCode=L(c)?T(S,c):0;}var W=["PhoneNumber$$module$src$index"],X=aa;
  	W[0]in X||"undefined"==typeof X.execScript||X.execScript("var "+W[0]);for(var Y;W.length&&(Y=W.shift());)W.length||void 0===V?X[Y]&&X[Y]!==Object.prototype[Y]?X=X[Y]:X=X[Y]={}:X[Y]=V;function Ib(a){return L(a)?T(S,a):0}V.getCountryCodeForRegionCode=Ib;V.getRegionCodeForCountryCode=function(a){return P(a)};function Jb(a){var b={};return a.filter(c=>{if(b.hasOwnProperty(c))return false;b[c]=1;return true})}V.getSupportedRegionCodes=function(){return Jb(Ra())};V.getSupportedCallingCodes=function(){return Jb(Ta())};
  	V.getExample=function(a,b){var c;b?c=$a(a,Db(b)):c=$a(a,0);return (new V(c,a)).toJSON()};V.getAsYouType=function(a){return new Z(a)};V.getNumberFrom=function(a,b){try{a:{if(Hb){var e=Hb.get(a);if(e){var c=e;break a}}let d;c=new V(null==a?void 0:null==(d=a.number)?void 0:d.e164,{});}return {valid:!0,number:Za(c.l,b)}}catch(d){return {valid:false,error:d}}};V.prototype.toJSON=function(){return this.g};V.prototype.toJSON=V.prototype.toJSON;V.prototype.ja=function(){return this.g.canBeInternationallyDialled};
  	V.prototype.canBeInternationallyDialled=V.prototype.ja;V.prototype.ya=function(){return this.g.valid};V.prototype.isValid=V.prototype.ya;V.prototype.xa=function(){return this.g.possible};V.prototype.isPossible=V.prototype.xa;V.prototype.getType=function(){return this.g.type};V.prototype.getType=V.prototype.getType;V.prototype.sa=function(){return "mobile"===this.g.type||"fixed-line-or-mobile"===this.g.type};V.prototype.isMobile=V.prototype.sa;
  	V.prototype.ra=function(){return "fixed-line"===this.g.type||"fixed-line-or-mobile"===this.g.type};V.prototype.isFixedLine=V.prototype.ra;V.prototype.ta=function(a){return this.g.number[null==a?"e164":a]};V.prototype.getNumber=V.prototype.ta;V.prototype.va=function(){return this.g.regionCode};V.prototype.getRegionCode=V.prototype.va;V.prototype.ia=function(){return Ib(this.g.regionCode)};V.prototype.getCountryCode=V.prototype.ia;function Z(a){this.j=a;this.h=new lb(a);this.l=this.g="";}
  	Z.prototype.qa=function(a){this.g+=a;var b=this.h;b.la=sb(b,a);return this.l=b.la};Z.prototype.addChar=Z.prototype.qa;Z.prototype.za=function(){return this.l};Z.prototype.number=Z.prototype.za;Z.prototype.Aa=function(){return ""===this.g?this.l:this.reset(this.g.slice(0,this.g.length-1))};Z.prototype.removeChar=Z.prototype.Aa;
  	Z.prototype.reset=function(a){var b=this.h;b.la="";A(b.u);A(b.ba);A(b.$);b.aa=0;b.da="";A(b.h);b.s="";A(b.g);b.v=true;b.oa=false;b.ca=false;b.ea=false;b.j=[];b.ha=false;b.m!=b.wa&&(b.m=mb(b,b.ma));this.l=this.g="";if(a){b=0;for(var c=a.length;b<c;++b)this.qa(a.charAt(b));}return this.l};Z.prototype.reset=Z.prototype.reset;Z.prototype.ua=function(){return (new V(this.l,{regionCode:this.j})).toJSON()};Z.prototype.getPhoneNumber=Z.prototype.ua;}).call(
  		(module.exports)
  		|| typeof globalThis !== 'undefined' && globalThis
  		|| typeof commonjsGlobal !== 'undefined' && commonjsGlobal
  		|| typeof window !== 'undefined' && window
  		|| typeof self !== 'undefined' && self
  		|| commonjsGlobal
  	); 
  } (lib$2));

  var libExports = lib$2.exports;

  awesomePhonenumber.exports;

  (function (module) {
  	const exportedName = 'PhoneNumber$$module$src$index';

  	module.exports =
  		libExports[ exportedName ] ||
  		(
  			typeof globalThis !== 'undefined' && globalThis
  			|| typeof commonjsGlobal !== 'undefined' && commonjsGlobal
  			|| typeof window !== 'undefined' && window
  			|| typeof self !== 'undefined' && self
  			|| commonjsGlobal
  		)[ exportedName ];

  	Object.defineProperty(
  		module.exports,
  		"__esModule",
  		{
  			value: true
  		}
  	);

  	module.exports.parsePhoneNumber = ( ...args ) =>
  	{
  		try
  		{
  			const ret = module.exports( ...args ).toJSON( );
  			if ( !ret.valid && !ret.possible )
  			{
  				ret.possible = false;
  				if ( !ret.possibility )
  					ret.possibility = 'invalid';
  			}
  			return ret;
  		}
  		catch ( error )
  		{
  			return {
  				valid: false,
  				possible: false,
  				possibility: 'invalid',
  				error,
  			};
  		}
  	};

  	module.exports.getCountryCodeForRegionCode = module.exports.getCountryCodeForRegionCode;
  	module.exports.getRegionCodeForCountryCode = module.exports.getRegionCodeForCountryCode;
  	module.exports.getSupportedCallingCodes = module.exports.getSupportedCallingCodes;
  	module.exports.getSupportedRegionCodes = module.exports.getSupportedRegionCodes;
  	module.exports.getExample = module.exports.getExample;
  	module.exports.getAsYouType = module.exports.getAsYouType;
  	module.exports.getNumberFrom = module.exports.getNumberFrom; 
  } (awesomePhonenumber));

  var awesomePhonenumberExports = awesomePhonenumber.exports;
  var index = /*@__PURE__*/getDefaultExportFromCjs$1(awesomePhonenumberExports);

  const {
  	PhoneNumber,
  	AsYouType,
  	getCountryCodeForRegionCode,
  	getRegionCodeForCountryCode,
  	getSupportedCallingCodes,
  	getSupportedRegionCodes,
  	getExample,
  	getAsYouType,
  	getNumberFrom,
  } = index;

  const parsePhoneNumber = ( ...args ) =>
  {
  	try
  	{
  		const ret = index( ...args ).toJSON( );
  		if ( !ret.valid && !ret.possible )
  		{
  			ret.possible = false;
  			if ( !ret.possibility )
  				ret.possibility = 'invalid';
  		}
  		return ret;
  	}
  	catch ( error )
  	{
  		return {
  			valid: false,
  			possible: false,
  			possibility: 'invalid',
  			error,
  		};
  	}
  };

  // MIT License
  // Copyright (c) 2021 Emmadi Sumith Kumar
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  // SOFTWARE.
  const phones_list = [
      {
          manufacturer: "Xiaomi",
          model: "M2010J19SG",
      },
      {
          manufacturer: "Xiaomi",
          model: "POCO F1",
      },
      {
          manufacturer: "Xiaomi",
          model: "Redmi 9A",
      },
      {
          manufacturer: "Xiaomi",
          model: "Xiaomi Mi 4",
      },
      {
          manufacturer: "Xiaomi",
          model: "Redmi Note 10 pro",
      },
      {
          manufacturer: "Xiaomi",
          model: "Redmi Note 10",
      },
      {
          manufacturer: "Xiaomi",
          model: "Xiaomi Redmi 1S",
      },
      {
          manufacturer: "Xiaomi",
          model: "Xiaomi Mi 10T",
      },
      {
          manufacturer: "Xiaomi",
          model: "Xiaomi Redmi 6 Pro",
      },
      {
          manufacturer: "Xiaomi",
          model: "Xiaomi Redmi Y3",
      },
      {
          manufacturer: "Xiaomi",
          model: "Xiaomi Redmi 9 Prime",
      },
      {
          manufacturer: "Xiaomi",
          model: "Redmi Note 7",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo Y33s",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo V21 5G",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo Y20T",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo Y73 2021",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo X60",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo X70 Pro 5G",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo U3x",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo V20 Pro",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo Y21 2021",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo Y53s",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo S12 Pro",
      },
      {
          manufacturer: "Vivo",
          model: "Vivo V21e 5G",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus Nord CE 5G",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus 9 Pro",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus 8T",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus 9",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus 7T",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus 6T",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus Nord 2",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus 7 Pro",
      },
      {
          manufacturer: "OnePlus",
          model: "OnePlus Nord",
      },
      {
          manufacturer: "Realme",
          model: "RMX2185",
      },
      {
          manufacturer: "Realme",
          model: "Realme GT Neo2 5G",
      },
      {
          manufacturer: "Realme",
          model: "Realme 8 5G",
      },
      {
          manufacturer: "Realme",
          model: "Realme C11 2021",
      },
      {
          manufacturer: "Realme",
          model: "Realme GT",
      },
      {
          manufacturer: "Realme",
          model: "Realme Narzo 30",
      },
      {
          manufacturer: "Realme",
          model: "Realme Q3i 5G",
      },
      {
          manufacturer: "Realme",
          model: "Realme 8s 5G",
      },
      {
          manufacturer: "Realme",
          model: "Realme 8i",
      },
      {
          manufacturer: "Realme",
          model: "Realme Narzo 50A",
      },
      {
          manufacturer: "Realme",
          model: "Realme C21Y",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO A55",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO A74 5G",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO A53",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO A31",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO A12",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO Reno6 Pro",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO Reno6",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO F19 Pro",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO F19s",
      },
      {
          manufacturer: "Oppo",
          model: "Oppo F19 Pro+",
      },
      {
          manufacturer: "Oppo",
          model: "Oppo A33",
      },
      {
          manufacturer: "Oppo",
          model: "Oppo Reno 3 Pro",
      },
      {
          manufacturer: "Oppo",
          model: "Oppo Reno 4 Pro",
      },
      {
          manufacturer: "Oppo",
          model: "Oppo Find X2",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO F15",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO Reno 2F",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO K3",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO A9",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO A1k",
      },
      {
          manufacturer: "Oppo",
          model: "OPPO A5s",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M31s",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M32",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy F62",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M52 5G",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M12",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M51",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy F12",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy F22",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy A52",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy S20 FE 5G",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M52",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M62",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy S21 Ultra",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy A52s 5G",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy S21",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M21 2021",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy F42",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy A12",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy F41",
      },
      {
          manufacturer: "Samsung",
          model: "Samsung Galaxy M01 Core",
      },
  ];
  const getRandomDevice = () => {
      const randomIndex = Math.floor(Math.random() * phones_list.length);
      return phones_list[randomIndex];
  };
  const device = getRandomDevice();

  // MIT License
  // Copyright (c) 2021 Emmadi Sumith Kumar
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  // SOFTWARE.
  function generateRandomString(length) {
      let result = "";
      const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
  }
  /**
   * Login to Truecaller.
   *
   * @param {string} phoneNumber - Phone number in international format.
   * @returns {Promise<LoginResponse>} - Promise that resolves to the login response containing the requestId used for OTP verification.
   */
  async function login$1(phoneNumber) {
      const pn = parsePhoneNumber(phoneNumber);
      if (!pn?.valid) {
          throw new Error("Invalid phone number.");
      }
      const postUrl = "https://account-asia-south1.truecaller.com/v2/sendOnboardingOtp";
      const data = {
          countryCode: pn.regionCode,
          dialingCode: pn.countryCode,
          installationDetails: {
              app: {
                  buildVersion: 5,
                  majorVersion: 11,
                  minorVersion: 7,
                  store: "GOOGLE_PLAY",
              },
              device: {
                  deviceId: generateRandomString(16),
                  language: "en",
                  manufacturer: device.manufacturer,
                  model: device.model,
                  osName: "Android",
                  osVersion: "10",
                  mobileServices: ["GMS"],
              },
              language: "en",
          },
          phoneNumber: pn.number.significant,
          region: "region-2",
          sequenceNo: 2,
      };
      const options = {
          method: "POST",
          headers: {
              "content-type": "application/json; charset=UTF-8",
              "accept-encoding": "gzip",
              "user-agent": "Truecaller/11.75.5 (Android;10)",
              clientsecret: "lvc22mp3l1sfv6ujg83rd17btt",
          },
          url: postUrl,
          data,
      };
      const res = await axios(options);
      return res.data;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // MIT License
  // Copyright (c) 2021 Emmadi Sumith Kumar
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  // SOFTWARE.
  /**
   * Verifying mobile number with OTP
   *
   * @name truecallerjs.verifyOtp
   * @function verifyOtp
   * @param {string} phonenumber - Phone number in international format.
   * @param {Object} json_data - JSON response of the login(phonenumber) function.
   * @param {string} otp - 6-digit OTP.
   * @returns {Promise<Object>} - JSON output containing the installationId.
   *
   * Follow this documentation for more details: https://github.com/sumithemmadi/truecallerjs/tree/main/docs
   */
  async function verifyOtp$1(phonenumber, json_data, otp) {
      const pn = parsePhoneNumber(phonenumber);
      if (!pn.valid) {
          throw new Error("Phone number should be in international format.");
      }
      const postData = {
          countryCode: pn.regionCode,
          dialingCode: pn.countryCode,
          phoneNumber: pn.number.significant,
          requestId: json_data.requestId,
          token: otp,
      };
      const options = {
          method: "POST",
          headers: {
              "content-type": "application/json; charset=UTF-8",
              "accept-encoding": "gzip",
              "user-agent": "Truecaller/11.75.5 (Android;10)",
              clientsecret: "lvc22mp3l1sfv6ujg83rd17btt",
          },
          url: "https://account-asia-south1.truecaller.com/v1/verifyOnboardingOtp",
          data: postData,
      };
      const res = await axios(options);
      return res.data;
  }

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function getAugmentedNamespace(n) {
    if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
    var f = n.default;
  	if (typeof f == "function") {
  		var a = function a () {
  			if (this instanceof a) {
          return Reflect.construct(f, arguments, this.constructor);
  			}
  			return f.apply(this, arguments);
  		};
  		a.prototype = f.prototype;
    } else a = {};
    Object.defineProperty(a, '__esModule', {value: true});
  	Object.keys(n).forEach(function (k) {
  		var d = Object.getOwnPropertyDescriptor(n, k);
  		Object.defineProperty(a, k, d.get ? d : {
  			enumerable: true,
  			get: function () {
  				return n[k];
  			}
  		});
  	});
  	return a;
  }

  var xml2js = {};

  var defaults = {};

  var hasRequiredDefaults;

  function requireDefaults () {
  	if (hasRequiredDefaults) return defaults;
  	hasRequiredDefaults = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  defaults.defaults = {
  	    "0.1": {
  	      explicitCharkey: false,
  	      trim: true,
  	      normalize: true,
  	      normalizeTags: false,
  	      attrkey: "@",
  	      charkey: "#",
  	      explicitArray: false,
  	      ignoreAttrs: false,
  	      mergeAttrs: false,
  	      explicitRoot: false,
  	      validator: null,
  	      xmlns: false,
  	      explicitChildren: false,
  	      childkey: '@@',
  	      charsAsChildren: false,
  	      includeWhiteChars: false,
  	      async: false,
  	      strict: true,
  	      attrNameProcessors: null,
  	      attrValueProcessors: null,
  	      tagNameProcessors: null,
  	      valueProcessors: null,
  	      emptyTag: ''
  	    },
  	    "0.2": {
  	      explicitCharkey: false,
  	      trim: false,
  	      normalize: false,
  	      normalizeTags: false,
  	      attrkey: "$",
  	      charkey: "_",
  	      explicitArray: true,
  	      ignoreAttrs: false,
  	      mergeAttrs: false,
  	      explicitRoot: true,
  	      validator: null,
  	      xmlns: false,
  	      explicitChildren: false,
  	      preserveChildrenOrder: false,
  	      childkey: '$$',
  	      charsAsChildren: false,
  	      includeWhiteChars: false,
  	      async: false,
  	      strict: true,
  	      attrNameProcessors: null,
  	      attrValueProcessors: null,
  	      tagNameProcessors: null,
  	      valueProcessors: null,
  	      rootName: 'root',
  	      xmldec: {
  	        'version': '1.0',
  	        'encoding': 'UTF-8',
  	        'standalone': true
  	      },
  	      doctype: null,
  	      renderOpts: {
  	        'pretty': true,
  	        'indent': '  ',
  	        'newline': '\n'
  	      },
  	      headless: false,
  	      chunkSize: 10000,
  	      emptyTag: '',
  	      cdata: false
  	    }
  	  };

  	}).call(defaults);
  	return defaults;
  }

  var builder = {};

  var lib$1 = {};

  var Utility = {};

  var hasRequiredUtility;

  function requireUtility () {
  	if (hasRequiredUtility) return Utility;
  	hasRequiredUtility = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var assign, getValue, isArray, isEmpty, isFunction, isObject, isPlainObject,
  	    slice = [].slice,
  	    hasProp = {}.hasOwnProperty;

  	  assign = function() {
  	    var i, key, len, source, sources, target;
  	    target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  	    if (isFunction(Object.assign)) {
  	      Object.assign.apply(null, arguments);
  	    } else {
  	      for (i = 0, len = sources.length; i < len; i++) {
  	        source = sources[i];
  	        if (source != null) {
  	          for (key in source) {
  	            if (!hasProp.call(source, key)) continue;
  	            target[key] = source[key];
  	          }
  	        }
  	      }
  	    }
  	    return target;
  	  };

  	  isFunction = function(val) {
  	    return !!val && Object.prototype.toString.call(val) === '[object Function]';
  	  };

  	  isObject = function(val) {
  	    var ref;
  	    return !!val && ((ref = typeof val) === 'function' || ref === 'object');
  	  };

  	  isArray = function(val) {
  	    if (isFunction(Array.isArray)) {
  	      return Array.isArray(val);
  	    } else {
  	      return Object.prototype.toString.call(val) === '[object Array]';
  	    }
  	  };

  	  isEmpty = function(val) {
  	    var key;
  	    if (isArray(val)) {
  	      return !val.length;
  	    } else {
  	      for (key in val) {
  	        if (!hasProp.call(val, key)) continue;
  	        return false;
  	      }
  	      return true;
  	    }
  	  };

  	  isPlainObject = function(val) {
  	    var ctor, proto;
  	    return isObject(val) && (proto = Object.getPrototypeOf(val)) && (ctor = proto.constructor) && (typeof ctor === 'function') && (ctor instanceof ctor) && (Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object));
  	  };

  	  getValue = function(obj) {
  	    if (isFunction(obj.valueOf)) {
  	      return obj.valueOf();
  	    } else {
  	      return obj;
  	    }
  	  };

  	  Utility.assign = assign;

  	  Utility.isFunction = isFunction;

  	  Utility.isObject = isObject;

  	  Utility.isArray = isArray;

  	  Utility.isEmpty = isEmpty;

  	  Utility.isPlainObject = isPlainObject;

  	  Utility.getValue = getValue;

  	}).call(Utility);
  	return Utility;
  }

  var XMLDOMImplementation$1 = {exports: {}};

  var XMLDOMImplementation = XMLDOMImplementation$1.exports;

  var hasRequiredXMLDOMImplementation;

  function requireXMLDOMImplementation () {
  	if (hasRequiredXMLDOMImplementation) return XMLDOMImplementation$1.exports;
  	hasRequiredXMLDOMImplementation = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {

  	  XMLDOMImplementation$1.exports = (function() {
  	    function XMLDOMImplementation() {}

  	    XMLDOMImplementation.prototype.hasFeature = function(feature, version) {
  	      return true;
  	    };

  	    XMLDOMImplementation.prototype.createDocumentType = function(qualifiedName, publicId, systemId) {
  	      throw new Error("This DOM method is not implemented.");
  	    };

  	    XMLDOMImplementation.prototype.createDocument = function(namespaceURI, qualifiedName, doctype) {
  	      throw new Error("This DOM method is not implemented.");
  	    };

  	    XMLDOMImplementation.prototype.createHTMLDocument = function(title) {
  	      throw new Error("This DOM method is not implemented.");
  	    };

  	    XMLDOMImplementation.prototype.getFeature = function(feature, version) {
  	      throw new Error("This DOM method is not implemented.");
  	    };

  	    return XMLDOMImplementation;

  	  })();

  	}).call(XMLDOMImplementation);
  	return XMLDOMImplementation$1.exports;
  }

  var XMLDocument$1 = {exports: {}};

  var XMLDOMConfiguration$1 = {exports: {}};

  var XMLDOMErrorHandler$1 = {exports: {}};

  var XMLDOMErrorHandler = XMLDOMErrorHandler$1.exports;

  var hasRequiredXMLDOMErrorHandler;

  function requireXMLDOMErrorHandler () {
  	if (hasRequiredXMLDOMErrorHandler) return XMLDOMErrorHandler$1.exports;
  	hasRequiredXMLDOMErrorHandler = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {

  	  XMLDOMErrorHandler$1.exports = (function() {
  	    function XMLDOMErrorHandler() {}

  	    XMLDOMErrorHandler.prototype.handleError = function(error) {
  	      throw new Error(error);
  	    };

  	    return XMLDOMErrorHandler;

  	  })();

  	}).call(XMLDOMErrorHandler);
  	return XMLDOMErrorHandler$1.exports;
  }

  var XMLDOMStringList$1 = {exports: {}};

  var XMLDOMStringList = XMLDOMStringList$1.exports;

  var hasRequiredXMLDOMStringList;

  function requireXMLDOMStringList () {
  	if (hasRequiredXMLDOMStringList) return XMLDOMStringList$1.exports;
  	hasRequiredXMLDOMStringList = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {

  	  XMLDOMStringList$1.exports = (function() {
  	    function XMLDOMStringList(arr) {
  	      this.arr = arr || [];
  	    }

  	    Object.defineProperty(XMLDOMStringList.prototype, 'length', {
  	      get: function() {
  	        return this.arr.length;
  	      }
  	    });

  	    XMLDOMStringList.prototype.item = function(index) {
  	      return this.arr[index] || null;
  	    };

  	    XMLDOMStringList.prototype.contains = function(str) {
  	      return this.arr.indexOf(str) !== -1;
  	    };

  	    return XMLDOMStringList;

  	  })();

  	}).call(XMLDOMStringList);
  	return XMLDOMStringList$1.exports;
  }

  var XMLDOMConfiguration = XMLDOMConfiguration$1.exports;

  var hasRequiredXMLDOMConfiguration;

  function requireXMLDOMConfiguration () {
  	if (hasRequiredXMLDOMConfiguration) return XMLDOMConfiguration$1.exports;
  	hasRequiredXMLDOMConfiguration = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var XMLDOMErrorHandler, XMLDOMStringList;

  	  XMLDOMErrorHandler = requireXMLDOMErrorHandler();

  	  XMLDOMStringList = requireXMLDOMStringList();

  	  XMLDOMConfiguration$1.exports = (function() {
  	    function XMLDOMConfiguration() {
  	      this.defaultParams = {
  	        "canonical-form": false,
  	        "cdata-sections": false,
  	        "comments": false,
  	        "datatype-normalization": false,
  	        "element-content-whitespace": true,
  	        "entities": true,
  	        "error-handler": new XMLDOMErrorHandler(),
  	        "infoset": true,
  	        "validate-if-schema": false,
  	        "namespaces": true,
  	        "namespace-declarations": true,
  	        "normalize-characters": false,
  	        "schema-location": '',
  	        "schema-type": '',
  	        "split-cdata-sections": true,
  	        "validate": false,
  	        "well-formed": true
  	      };
  	      this.params = Object.create(this.defaultParams);
  	    }

  	    Object.defineProperty(XMLDOMConfiguration.prototype, 'parameterNames', {
  	      get: function() {
  	        return new XMLDOMStringList(Object.keys(this.defaultParams));
  	      }
  	    });

  	    XMLDOMConfiguration.prototype.getParameter = function(name) {
  	      if (this.params.hasOwnProperty(name)) {
  	        return this.params[name];
  	      } else {
  	        return null;
  	      }
  	    };

  	    XMLDOMConfiguration.prototype.canSetParameter = function(name, value) {
  	      return true;
  	    };

  	    XMLDOMConfiguration.prototype.setParameter = function(name, value) {
  	      if (value != null) {
  	        return this.params[name] = value;
  	      } else {
  	        return delete this.params[name];
  	      }
  	    };

  	    return XMLDOMConfiguration;

  	  })();

  	}).call(XMLDOMConfiguration);
  	return XMLDOMConfiguration$1.exports;
  }

  var XMLNode$1 = {exports: {}};

  var XMLElement$1 = {exports: {}};

  var NodeType$1 = {exports: {}};

  var NodeType = NodeType$1.exports;

  var hasRequiredNodeType;

  function requireNodeType () {
  	if (hasRequiredNodeType) return NodeType$1.exports;
  	hasRequiredNodeType = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  NodeType$1.exports = {
  	    Element: 1,
  	    Attribute: 2,
  	    Text: 3,
  	    CData: 4,
  	    EntityReference: 5,
  	    EntityDeclaration: 6,
  	    ProcessingInstruction: 7,
  	    Comment: 8,
  	    Document: 9,
  	    DocType: 10,
  	    DocumentFragment: 11,
  	    NotationDeclaration: 12,
  	    Declaration: 201,
  	    Raw: 202,
  	    AttributeDeclaration: 203,
  	    ElementDeclaration: 204,
  	    Dummy: 205
  	  };

  	}).call(NodeType);
  	return NodeType$1.exports;
  }

  var XMLAttribute$1 = {exports: {}};

  var XMLAttribute = XMLAttribute$1.exports;

  var hasRequiredXMLAttribute;

  function requireXMLAttribute () {
  	if (hasRequiredXMLAttribute) return XMLAttribute$1.exports;
  	hasRequiredXMLAttribute = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType;

  	  NodeType = requireNodeType();

  	  requireXMLNode();

  	  XMLAttribute$1.exports = (function() {
  	    function XMLAttribute(parent, name, value) {
  	      this.parent = parent;
  	      if (this.parent) {
  	        this.options = this.parent.options;
  	        this.stringify = this.parent.stringify;
  	      }
  	      if (name == null) {
  	        throw new Error("Missing attribute name. " + this.debugInfo(name));
  	      }
  	      this.name = this.stringify.name(name);
  	      this.value = this.stringify.attValue(value);
  	      this.type = NodeType.Attribute;
  	      this.isId = false;
  	      this.schemaTypeInfo = null;
  	    }

  	    Object.defineProperty(XMLAttribute.prototype, 'nodeType', {
  	      get: function() {
  	        return this.type;
  	      }
  	    });

  	    Object.defineProperty(XMLAttribute.prototype, 'ownerElement', {
  	      get: function() {
  	        return this.parent;
  	      }
  	    });

  	    Object.defineProperty(XMLAttribute.prototype, 'textContent', {
  	      get: function() {
  	        return this.value;
  	      },
  	      set: function(value) {
  	        return this.value = value || '';
  	      }
  	    });

  	    Object.defineProperty(XMLAttribute.prototype, 'namespaceURI', {
  	      get: function() {
  	        return '';
  	      }
  	    });

  	    Object.defineProperty(XMLAttribute.prototype, 'prefix', {
  	      get: function() {
  	        return '';
  	      }
  	    });

  	    Object.defineProperty(XMLAttribute.prototype, 'localName', {
  	      get: function() {
  	        return this.name;
  	      }
  	    });

  	    Object.defineProperty(XMLAttribute.prototype, 'specified', {
  	      get: function() {
  	        return true;
  	      }
  	    });

  	    XMLAttribute.prototype.clone = function() {
  	      return Object.create(this);
  	    };

  	    XMLAttribute.prototype.toString = function(options) {
  	      return this.options.writer.attribute(this, this.options.writer.filterOptions(options));
  	    };

  	    XMLAttribute.prototype.debugInfo = function(name) {
  	      name = name || this.name;
  	      if (name == null) {
  	        return "parent: <" + this.parent.name + ">";
  	      } else {
  	        return "attribute: {" + name + "}, parent: <" + this.parent.name + ">";
  	      }
  	    };

  	    XMLAttribute.prototype.isEqualNode = function(node) {
  	      if (node.namespaceURI !== this.namespaceURI) {
  	        return false;
  	      }
  	      if (node.prefix !== this.prefix) {
  	        return false;
  	      }
  	      if (node.localName !== this.localName) {
  	        return false;
  	      }
  	      if (node.value !== this.value) {
  	        return false;
  	      }
  	      return true;
  	    };

  	    return XMLAttribute;

  	  })();

  	}).call(XMLAttribute);
  	return XMLAttribute$1.exports;
  }

  var XMLNamedNodeMap$1 = {exports: {}};

  var XMLNamedNodeMap = XMLNamedNodeMap$1.exports;

  var hasRequiredXMLNamedNodeMap;

  function requireXMLNamedNodeMap () {
  	if (hasRequiredXMLNamedNodeMap) return XMLNamedNodeMap$1.exports;
  	hasRequiredXMLNamedNodeMap = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {

  	  XMLNamedNodeMap$1.exports = (function() {
  	    function XMLNamedNodeMap(nodes) {
  	      this.nodes = nodes;
  	    }

  	    Object.defineProperty(XMLNamedNodeMap.prototype, 'length', {
  	      get: function() {
  	        return Object.keys(this.nodes).length || 0;
  	      }
  	    });

  	    XMLNamedNodeMap.prototype.clone = function() {
  	      return this.nodes = null;
  	    };

  	    XMLNamedNodeMap.prototype.getNamedItem = function(name) {
  	      return this.nodes[name];
  	    };

  	    XMLNamedNodeMap.prototype.setNamedItem = function(node) {
  	      var oldNode;
  	      oldNode = this.nodes[node.nodeName];
  	      this.nodes[node.nodeName] = node;
  	      return oldNode || null;
  	    };

  	    XMLNamedNodeMap.prototype.removeNamedItem = function(name) {
  	      var oldNode;
  	      oldNode = this.nodes[name];
  	      delete this.nodes[name];
  	      return oldNode || null;
  	    };

  	    XMLNamedNodeMap.prototype.item = function(index) {
  	      return this.nodes[Object.keys(this.nodes)[index]] || null;
  	    };

  	    XMLNamedNodeMap.prototype.getNamedItemNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented.");
  	    };

  	    XMLNamedNodeMap.prototype.setNamedItemNS = function(node) {
  	      throw new Error("This DOM method is not implemented.");
  	    };

  	    XMLNamedNodeMap.prototype.removeNamedItemNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented.");
  	    };

  	    return XMLNamedNodeMap;

  	  })();

  	}).call(XMLNamedNodeMap);
  	return XMLNamedNodeMap$1.exports;
  }

  var XMLElement = XMLElement$1.exports;

  var hasRequiredXMLElement;

  function requireXMLElement () {
  	if (hasRequiredXMLElement) return XMLElement$1.exports;
  	hasRequiredXMLElement = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLAttribute, XMLNamedNodeMap, XMLNode, getValue, isFunction, isObject, ref,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  ref = requireUtility(), isObject = ref.isObject, isFunction = ref.isFunction, getValue = ref.getValue;

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLAttribute = requireXMLAttribute();

  	  XMLNamedNodeMap = requireXMLNamedNodeMap();

  	  XMLElement$1.exports = (function(superClass) {
  	    extend(XMLElement, superClass);

  	    function XMLElement(parent, name, attributes) {
  	      var child, j, len, ref1;
  	      XMLElement.__super__.constructor.call(this, parent);
  	      if (name == null) {
  	        throw new Error("Missing element name. " + this.debugInfo());
  	      }
  	      this.name = this.stringify.name(name);
  	      this.type = NodeType.Element;
  	      this.attribs = {};
  	      this.schemaTypeInfo = null;
  	      if (attributes != null) {
  	        this.attribute(attributes);
  	      }
  	      if (parent.type === NodeType.Document) {
  	        this.isRoot = true;
  	        this.documentObject = parent;
  	        parent.rootObject = this;
  	        if (parent.children) {
  	          ref1 = parent.children;
  	          for (j = 0, len = ref1.length; j < len; j++) {
  	            child = ref1[j];
  	            if (child.type === NodeType.DocType) {
  	              child.name = this.name;
  	              break;
  	            }
  	          }
  	        }
  	      }
  	    }

  	    Object.defineProperty(XMLElement.prototype, 'tagName', {
  	      get: function() {
  	        return this.name;
  	      }
  	    });

  	    Object.defineProperty(XMLElement.prototype, 'namespaceURI', {
  	      get: function() {
  	        return '';
  	      }
  	    });

  	    Object.defineProperty(XMLElement.prototype, 'prefix', {
  	      get: function() {
  	        return '';
  	      }
  	    });

  	    Object.defineProperty(XMLElement.prototype, 'localName', {
  	      get: function() {
  	        return this.name;
  	      }
  	    });

  	    Object.defineProperty(XMLElement.prototype, 'id', {
  	      get: function() {
  	        throw new Error("This DOM method is not implemented." + this.debugInfo());
  	      }
  	    });

  	    Object.defineProperty(XMLElement.prototype, 'className', {
  	      get: function() {
  	        throw new Error("This DOM method is not implemented." + this.debugInfo());
  	      }
  	    });

  	    Object.defineProperty(XMLElement.prototype, 'classList', {
  	      get: function() {
  	        throw new Error("This DOM method is not implemented." + this.debugInfo());
  	      }
  	    });

  	    Object.defineProperty(XMLElement.prototype, 'attributes', {
  	      get: function() {
  	        if (!this.attributeMap || !this.attributeMap.nodes) {
  	          this.attributeMap = new XMLNamedNodeMap(this.attribs);
  	        }
  	        return this.attributeMap;
  	      }
  	    });

  	    XMLElement.prototype.clone = function() {
  	      var att, attName, clonedSelf, ref1;
  	      clonedSelf = Object.create(this);
  	      if (clonedSelf.isRoot) {
  	        clonedSelf.documentObject = null;
  	      }
  	      clonedSelf.attribs = {};
  	      ref1 = this.attribs;
  	      for (attName in ref1) {
  	        if (!hasProp.call(ref1, attName)) continue;
  	        att = ref1[attName];
  	        clonedSelf.attribs[attName] = att.clone();
  	      }
  	      clonedSelf.children = [];
  	      this.children.forEach(function(child) {
  	        var clonedChild;
  	        clonedChild = child.clone();
  	        clonedChild.parent = clonedSelf;
  	        return clonedSelf.children.push(clonedChild);
  	      });
  	      return clonedSelf;
  	    };

  	    XMLElement.prototype.attribute = function(name, value) {
  	      var attName, attValue;
  	      if (name != null) {
  	        name = getValue(name);
  	      }
  	      if (isObject(name)) {
  	        for (attName in name) {
  	          if (!hasProp.call(name, attName)) continue;
  	          attValue = name[attName];
  	          this.attribute(attName, attValue);
  	        }
  	      } else {
  	        if (isFunction(value)) {
  	          value = value.apply();
  	        }
  	        if (this.options.keepNullAttributes && (value == null)) {
  	          this.attribs[name] = new XMLAttribute(this, name, "");
  	        } else if (value != null) {
  	          this.attribs[name] = new XMLAttribute(this, name, value);
  	        }
  	      }
  	      return this;
  	    };

  	    XMLElement.prototype.removeAttribute = function(name) {
  	      var attName, j, len;
  	      if (name == null) {
  	        throw new Error("Missing attribute name. " + this.debugInfo());
  	      }
  	      name = getValue(name);
  	      if (Array.isArray(name)) {
  	        for (j = 0, len = name.length; j < len; j++) {
  	          attName = name[j];
  	          delete this.attribs[attName];
  	        }
  	      } else {
  	        delete this.attribs[name];
  	      }
  	      return this;
  	    };

  	    XMLElement.prototype.toString = function(options) {
  	      return this.options.writer.element(this, this.options.writer.filterOptions(options));
  	    };

  	    XMLElement.prototype.att = function(name, value) {
  	      return this.attribute(name, value);
  	    };

  	    XMLElement.prototype.a = function(name, value) {
  	      return this.attribute(name, value);
  	    };

  	    XMLElement.prototype.getAttribute = function(name) {
  	      if (this.attribs.hasOwnProperty(name)) {
  	        return this.attribs[name].value;
  	      } else {
  	        return null;
  	      }
  	    };

  	    XMLElement.prototype.setAttribute = function(name, value) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.getAttributeNode = function(name) {
  	      if (this.attribs.hasOwnProperty(name)) {
  	        return this.attribs[name];
  	      } else {
  	        return null;
  	      }
  	    };

  	    XMLElement.prototype.setAttributeNode = function(newAttr) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.removeAttributeNode = function(oldAttr) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.getElementsByTagName = function(name) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.getAttributeNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.setAttributeNS = function(namespaceURI, qualifiedName, value) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.removeAttributeNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.getAttributeNodeNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.setAttributeNodeNS = function(newAttr) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.hasAttribute = function(name) {
  	      return this.attribs.hasOwnProperty(name);
  	    };

  	    XMLElement.prototype.hasAttributeNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.setIdAttribute = function(name, isId) {
  	      if (this.attribs.hasOwnProperty(name)) {
  	        return this.attribs[name].isId;
  	      } else {
  	        return isId;
  	      }
  	    };

  	    XMLElement.prototype.setIdAttributeNS = function(namespaceURI, localName, isId) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.setIdAttributeNode = function(idAttr, isId) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.getElementsByTagName = function(tagname) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.getElementsByClassName = function(classNames) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLElement.prototype.isEqualNode = function(node) {
  	      var i, j, ref1;
  	      if (!XMLElement.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
  	        return false;
  	      }
  	      if (node.namespaceURI !== this.namespaceURI) {
  	        return false;
  	      }
  	      if (node.prefix !== this.prefix) {
  	        return false;
  	      }
  	      if (node.localName !== this.localName) {
  	        return false;
  	      }
  	      if (node.attribs.length !== this.attribs.length) {
  	        return false;
  	      }
  	      for (i = j = 0, ref1 = this.attribs.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
  	        if (!this.attribs[i].isEqualNode(node.attribs[i])) {
  	          return false;
  	        }
  	      }
  	      return true;
  	    };

  	    return XMLElement;

  	  })(XMLNode);

  	}).call(XMLElement);
  	return XMLElement$1.exports;
  }

  var XMLCData$1 = {exports: {}};

  var XMLCharacterData$1 = {exports: {}};

  var XMLCharacterData = XMLCharacterData$1.exports;

  var hasRequiredXMLCharacterData;

  function requireXMLCharacterData () {
  	if (hasRequiredXMLCharacterData) return XMLCharacterData$1.exports;
  	hasRequiredXMLCharacterData = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var XMLNode,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  XMLNode = requireXMLNode();

  	  XMLCharacterData$1.exports = (function(superClass) {
  	    extend(XMLCharacterData, superClass);

  	    function XMLCharacterData(parent) {
  	      XMLCharacterData.__super__.constructor.call(this, parent);
  	      this.value = '';
  	    }

  	    Object.defineProperty(XMLCharacterData.prototype, 'data', {
  	      get: function() {
  	        return this.value;
  	      },
  	      set: function(value) {
  	        return this.value = value || '';
  	      }
  	    });

  	    Object.defineProperty(XMLCharacterData.prototype, 'length', {
  	      get: function() {
  	        return this.value.length;
  	      }
  	    });

  	    Object.defineProperty(XMLCharacterData.prototype, 'textContent', {
  	      get: function() {
  	        return this.value;
  	      },
  	      set: function(value) {
  	        return this.value = value || '';
  	      }
  	    });

  	    XMLCharacterData.prototype.clone = function() {
  	      return Object.create(this);
  	    };

  	    XMLCharacterData.prototype.substringData = function(offset, count) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLCharacterData.prototype.appendData = function(arg) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLCharacterData.prototype.insertData = function(offset, arg) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLCharacterData.prototype.deleteData = function(offset, count) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLCharacterData.prototype.replaceData = function(offset, count, arg) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLCharacterData.prototype.isEqualNode = function(node) {
  	      if (!XMLCharacterData.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
  	        return false;
  	      }
  	      if (node.data !== this.data) {
  	        return false;
  	      }
  	      return true;
  	    };

  	    return XMLCharacterData;

  	  })(XMLNode);

  	}).call(XMLCharacterData);
  	return XMLCharacterData$1.exports;
  }

  var XMLCData = XMLCData$1.exports;

  var hasRequiredXMLCData;

  function requireXMLCData () {
  	if (hasRequiredXMLCData) return XMLCData$1.exports;
  	hasRequiredXMLCData = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLCharacterData,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  NodeType = requireNodeType();

  	  XMLCharacterData = requireXMLCharacterData();

  	  XMLCData$1.exports = (function(superClass) {
  	    extend(XMLCData, superClass);

  	    function XMLCData(parent, text) {
  	      XMLCData.__super__.constructor.call(this, parent);
  	      if (text == null) {
  	        throw new Error("Missing CDATA text. " + this.debugInfo());
  	      }
  	      this.name = "#cdata-section";
  	      this.type = NodeType.CData;
  	      this.value = this.stringify.cdata(text);
  	    }

  	    XMLCData.prototype.clone = function() {
  	      return Object.create(this);
  	    };

  	    XMLCData.prototype.toString = function(options) {
  	      return this.options.writer.cdata(this, this.options.writer.filterOptions(options));
  	    };

  	    return XMLCData;

  	  })(XMLCharacterData);

  	}).call(XMLCData);
  	return XMLCData$1.exports;
  }

  var XMLComment$1 = {exports: {}};

  var XMLComment = XMLComment$1.exports;

  var hasRequiredXMLComment;

  function requireXMLComment () {
  	if (hasRequiredXMLComment) return XMLComment$1.exports;
  	hasRequiredXMLComment = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLCharacterData, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  NodeType = requireNodeType();

  	  XMLCharacterData = requireXMLCharacterData();

  	  XMLComment$1.exports = (function(superClass) {
  	    extend(XMLComment, superClass);

  	    function XMLComment(parent, text) {
  	      XMLComment.__super__.constructor.call(this, parent);
  	      if (text == null) {
  	        throw new Error("Missing comment text. " + this.debugInfo());
  	      }
  	      this.name = "#comment";
  	      this.type = NodeType.Comment;
  	      this.value = this.stringify.comment(text);
  	    }

  	    XMLComment.prototype.clone = function() {
  	      return Object.create(this);
  	    };

  	    XMLComment.prototype.toString = function(options) {
  	      return this.options.writer.comment(this, this.options.writer.filterOptions(options));
  	    };

  	    return XMLComment;

  	  })(XMLCharacterData);

  	}).call(XMLComment);
  	return XMLComment$1.exports;
  }

  var XMLDeclaration$1 = {exports: {}};

  var XMLDeclaration = XMLDeclaration$1.exports;

  var hasRequiredXMLDeclaration;

  function requireXMLDeclaration () {
  	if (hasRequiredXMLDeclaration) return XMLDeclaration$1.exports;
  	hasRequiredXMLDeclaration = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLNode, isObject,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  isObject = requireUtility().isObject;

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLDeclaration$1.exports = (function(superClass) {
  	    extend(XMLDeclaration, superClass);

  	    function XMLDeclaration(parent, version, encoding, standalone) {
  	      var ref;
  	      XMLDeclaration.__super__.constructor.call(this, parent);
  	      if (isObject(version)) {
  	        ref = version, version = ref.version, encoding = ref.encoding, standalone = ref.standalone;
  	      }
  	      if (!version) {
  	        version = '1.0';
  	      }
  	      this.type = NodeType.Declaration;
  	      this.version = this.stringify.xmlVersion(version);
  	      if (encoding != null) {
  	        this.encoding = this.stringify.xmlEncoding(encoding);
  	      }
  	      if (standalone != null) {
  	        this.standalone = this.stringify.xmlStandalone(standalone);
  	      }
  	    }

  	    XMLDeclaration.prototype.toString = function(options) {
  	      return this.options.writer.declaration(this, this.options.writer.filterOptions(options));
  	    };

  	    return XMLDeclaration;

  	  })(XMLNode);

  	}).call(XMLDeclaration);
  	return XMLDeclaration$1.exports;
  }

  var XMLDocType$1 = {exports: {}};

  var XMLDTDAttList$1 = {exports: {}};

  var XMLDTDAttList = XMLDTDAttList$1.exports;

  var hasRequiredXMLDTDAttList;

  function requireXMLDTDAttList () {
  	if (hasRequiredXMLDTDAttList) return XMLDTDAttList$1.exports;
  	hasRequiredXMLDTDAttList = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLNode,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLDTDAttList$1.exports = (function(superClass) {
  	    extend(XMLDTDAttList, superClass);

  	    function XMLDTDAttList(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
  	      XMLDTDAttList.__super__.constructor.call(this, parent);
  	      if (elementName == null) {
  	        throw new Error("Missing DTD element name. " + this.debugInfo());
  	      }
  	      if (attributeName == null) {
  	        throw new Error("Missing DTD attribute name. " + this.debugInfo(elementName));
  	      }
  	      if (!attributeType) {
  	        throw new Error("Missing DTD attribute type. " + this.debugInfo(elementName));
  	      }
  	      if (!defaultValueType) {
  	        throw new Error("Missing DTD attribute default. " + this.debugInfo(elementName));
  	      }
  	      if (defaultValueType.indexOf('#') !== 0) {
  	        defaultValueType = '#' + defaultValueType;
  	      }
  	      if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
  	        throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. " + this.debugInfo(elementName));
  	      }
  	      if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
  	        throw new Error("Default value only applies to #FIXED or #DEFAULT. " + this.debugInfo(elementName));
  	      }
  	      this.elementName = this.stringify.name(elementName);
  	      this.type = NodeType.AttributeDeclaration;
  	      this.attributeName = this.stringify.name(attributeName);
  	      this.attributeType = this.stringify.dtdAttType(attributeType);
  	      if (defaultValue) {
  	        this.defaultValue = this.stringify.dtdAttDefault(defaultValue);
  	      }
  	      this.defaultValueType = defaultValueType;
  	    }

  	    XMLDTDAttList.prototype.toString = function(options) {
  	      return this.options.writer.dtdAttList(this, this.options.writer.filterOptions(options));
  	    };

  	    return XMLDTDAttList;

  	  })(XMLNode);

  	}).call(XMLDTDAttList);
  	return XMLDTDAttList$1.exports;
  }

  var XMLDTDEntity$1 = {exports: {}};

  var XMLDTDEntity = XMLDTDEntity$1.exports;

  var hasRequiredXMLDTDEntity;

  function requireXMLDTDEntity () {
  	if (hasRequiredXMLDTDEntity) return XMLDTDEntity$1.exports;
  	hasRequiredXMLDTDEntity = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLNode, isObject,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  isObject = requireUtility().isObject;

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLDTDEntity$1.exports = (function(superClass) {
  	    extend(XMLDTDEntity, superClass);

  	    function XMLDTDEntity(parent, pe, name, value) {
  	      XMLDTDEntity.__super__.constructor.call(this, parent);
  	      if (name == null) {
  	        throw new Error("Missing DTD entity name. " + this.debugInfo(name));
  	      }
  	      if (value == null) {
  	        throw new Error("Missing DTD entity value. " + this.debugInfo(name));
  	      }
  	      this.pe = !!pe;
  	      this.name = this.stringify.name(name);
  	      this.type = NodeType.EntityDeclaration;
  	      if (!isObject(value)) {
  	        this.value = this.stringify.dtdEntityValue(value);
  	        this.internal = true;
  	      } else {
  	        if (!value.pubID && !value.sysID) {
  	          throw new Error("Public and/or system identifiers are required for an external entity. " + this.debugInfo(name));
  	        }
  	        if (value.pubID && !value.sysID) {
  	          throw new Error("System identifier is required for a public external entity. " + this.debugInfo(name));
  	        }
  	        this.internal = false;
  	        if (value.pubID != null) {
  	          this.pubID = this.stringify.dtdPubID(value.pubID);
  	        }
  	        if (value.sysID != null) {
  	          this.sysID = this.stringify.dtdSysID(value.sysID);
  	        }
  	        if (value.nData != null) {
  	          this.nData = this.stringify.dtdNData(value.nData);
  	        }
  	        if (this.pe && this.nData) {
  	          throw new Error("Notation declaration is not allowed in a parameter entity. " + this.debugInfo(name));
  	        }
  	      }
  	    }

  	    Object.defineProperty(XMLDTDEntity.prototype, 'publicId', {
  	      get: function() {
  	        return this.pubID;
  	      }
  	    });

  	    Object.defineProperty(XMLDTDEntity.prototype, 'systemId', {
  	      get: function() {
  	        return this.sysID;
  	      }
  	    });

  	    Object.defineProperty(XMLDTDEntity.prototype, 'notationName', {
  	      get: function() {
  	        return this.nData || null;
  	      }
  	    });

  	    Object.defineProperty(XMLDTDEntity.prototype, 'inputEncoding', {
  	      get: function() {
  	        return null;
  	      }
  	    });

  	    Object.defineProperty(XMLDTDEntity.prototype, 'xmlEncoding', {
  	      get: function() {
  	        return null;
  	      }
  	    });

  	    Object.defineProperty(XMLDTDEntity.prototype, 'xmlVersion', {
  	      get: function() {
  	        return null;
  	      }
  	    });

  	    XMLDTDEntity.prototype.toString = function(options) {
  	      return this.options.writer.dtdEntity(this, this.options.writer.filterOptions(options));
  	    };

  	    return XMLDTDEntity;

  	  })(XMLNode);

  	}).call(XMLDTDEntity);
  	return XMLDTDEntity$1.exports;
  }

  var XMLDTDElement$1 = {exports: {}};

  var XMLDTDElement = XMLDTDElement$1.exports;

  var hasRequiredXMLDTDElement;

  function requireXMLDTDElement () {
  	if (hasRequiredXMLDTDElement) return XMLDTDElement$1.exports;
  	hasRequiredXMLDTDElement = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLNode,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLDTDElement$1.exports = (function(superClass) {
  	    extend(XMLDTDElement, superClass);

  	    function XMLDTDElement(parent, name, value) {
  	      XMLDTDElement.__super__.constructor.call(this, parent);
  	      if (name == null) {
  	        throw new Error("Missing DTD element name. " + this.debugInfo());
  	      }
  	      if (!value) {
  	        value = '(#PCDATA)';
  	      }
  	      if (Array.isArray(value)) {
  	        value = '(' + value.join(',') + ')';
  	      }
  	      this.name = this.stringify.name(name);
  	      this.type = NodeType.ElementDeclaration;
  	      this.value = this.stringify.dtdElementValue(value);
  	    }

  	    XMLDTDElement.prototype.toString = function(options) {
  	      return this.options.writer.dtdElement(this, this.options.writer.filterOptions(options));
  	    };

  	    return XMLDTDElement;

  	  })(XMLNode);

  	}).call(XMLDTDElement);
  	return XMLDTDElement$1.exports;
  }

  var XMLDTDNotation$1 = {exports: {}};

  var XMLDTDNotation = XMLDTDNotation$1.exports;

  var hasRequiredXMLDTDNotation;

  function requireXMLDTDNotation () {
  	if (hasRequiredXMLDTDNotation) return XMLDTDNotation$1.exports;
  	hasRequiredXMLDTDNotation = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLNode,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLDTDNotation$1.exports = (function(superClass) {
  	    extend(XMLDTDNotation, superClass);

  	    function XMLDTDNotation(parent, name, value) {
  	      XMLDTDNotation.__super__.constructor.call(this, parent);
  	      if (name == null) {
  	        throw new Error("Missing DTD notation name. " + this.debugInfo(name));
  	      }
  	      if (!value.pubID && !value.sysID) {
  	        throw new Error("Public or system identifiers are required for an external entity. " + this.debugInfo(name));
  	      }
  	      this.name = this.stringify.name(name);
  	      this.type = NodeType.NotationDeclaration;
  	      if (value.pubID != null) {
  	        this.pubID = this.stringify.dtdPubID(value.pubID);
  	      }
  	      if (value.sysID != null) {
  	        this.sysID = this.stringify.dtdSysID(value.sysID);
  	      }
  	    }

  	    Object.defineProperty(XMLDTDNotation.prototype, 'publicId', {
  	      get: function() {
  	        return this.pubID;
  	      }
  	    });

  	    Object.defineProperty(XMLDTDNotation.prototype, 'systemId', {
  	      get: function() {
  	        return this.sysID;
  	      }
  	    });

  	    XMLDTDNotation.prototype.toString = function(options) {
  	      return this.options.writer.dtdNotation(this, this.options.writer.filterOptions(options));
  	    };

  	    return XMLDTDNotation;

  	  })(XMLNode);

  	}).call(XMLDTDNotation);
  	return XMLDTDNotation$1.exports;
  }

  var XMLDocType = XMLDocType$1.exports;

  var hasRequiredXMLDocType;

  function requireXMLDocType () {
  	if (hasRequiredXMLDocType) return XMLDocType$1.exports;
  	hasRequiredXMLDocType = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLNamedNodeMap, XMLNode, isObject,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  isObject = requireUtility().isObject;

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLDTDAttList = requireXMLDTDAttList();

  	  XMLDTDEntity = requireXMLDTDEntity();

  	  XMLDTDElement = requireXMLDTDElement();

  	  XMLDTDNotation = requireXMLDTDNotation();

  	  XMLNamedNodeMap = requireXMLNamedNodeMap();

  	  XMLDocType$1.exports = (function(superClass) {
  	    extend(XMLDocType, superClass);

  	    function XMLDocType(parent, pubID, sysID) {
  	      var child, i, len, ref, ref1, ref2;
  	      XMLDocType.__super__.constructor.call(this, parent);
  	      this.type = NodeType.DocType;
  	      if (parent.children) {
  	        ref = parent.children;
  	        for (i = 0, len = ref.length; i < len; i++) {
  	          child = ref[i];
  	          if (child.type === NodeType.Element) {
  	            this.name = child.name;
  	            break;
  	          }
  	        }
  	      }
  	      this.documentObject = parent;
  	      if (isObject(pubID)) {
  	        ref1 = pubID, pubID = ref1.pubID, sysID = ref1.sysID;
  	      }
  	      if (sysID == null) {
  	        ref2 = [pubID, sysID], sysID = ref2[0], pubID = ref2[1];
  	      }
  	      if (pubID != null) {
  	        this.pubID = this.stringify.dtdPubID(pubID);
  	      }
  	      if (sysID != null) {
  	        this.sysID = this.stringify.dtdSysID(sysID);
  	      }
  	    }

  	    Object.defineProperty(XMLDocType.prototype, 'entities', {
  	      get: function() {
  	        var child, i, len, nodes, ref;
  	        nodes = {};
  	        ref = this.children;
  	        for (i = 0, len = ref.length; i < len; i++) {
  	          child = ref[i];
  	          if ((child.type === NodeType.EntityDeclaration) && !child.pe) {
  	            nodes[child.name] = child;
  	          }
  	        }
  	        return new XMLNamedNodeMap(nodes);
  	      }
  	    });

  	    Object.defineProperty(XMLDocType.prototype, 'notations', {
  	      get: function() {
  	        var child, i, len, nodes, ref;
  	        nodes = {};
  	        ref = this.children;
  	        for (i = 0, len = ref.length; i < len; i++) {
  	          child = ref[i];
  	          if (child.type === NodeType.NotationDeclaration) {
  	            nodes[child.name] = child;
  	          }
  	        }
  	        return new XMLNamedNodeMap(nodes);
  	      }
  	    });

  	    Object.defineProperty(XMLDocType.prototype, 'publicId', {
  	      get: function() {
  	        return this.pubID;
  	      }
  	    });

  	    Object.defineProperty(XMLDocType.prototype, 'systemId', {
  	      get: function() {
  	        return this.sysID;
  	      }
  	    });

  	    Object.defineProperty(XMLDocType.prototype, 'internalSubset', {
  	      get: function() {
  	        throw new Error("This DOM method is not implemented." + this.debugInfo());
  	      }
  	    });

  	    XMLDocType.prototype.element = function(name, value) {
  	      var child;
  	      child = new XMLDTDElement(this, name, value);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLDocType.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
  	      var child;
  	      child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLDocType.prototype.entity = function(name, value) {
  	      var child;
  	      child = new XMLDTDEntity(this, false, name, value);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLDocType.prototype.pEntity = function(name, value) {
  	      var child;
  	      child = new XMLDTDEntity(this, true, name, value);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLDocType.prototype.notation = function(name, value) {
  	      var child;
  	      child = new XMLDTDNotation(this, name, value);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLDocType.prototype.toString = function(options) {
  	      return this.options.writer.docType(this, this.options.writer.filterOptions(options));
  	    };

  	    XMLDocType.prototype.ele = function(name, value) {
  	      return this.element(name, value);
  	    };

  	    XMLDocType.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
  	      return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
  	    };

  	    XMLDocType.prototype.ent = function(name, value) {
  	      return this.entity(name, value);
  	    };

  	    XMLDocType.prototype.pent = function(name, value) {
  	      return this.pEntity(name, value);
  	    };

  	    XMLDocType.prototype.not = function(name, value) {
  	      return this.notation(name, value);
  	    };

  	    XMLDocType.prototype.up = function() {
  	      return this.root() || this.documentObject;
  	    };

  	    XMLDocType.prototype.isEqualNode = function(node) {
  	      if (!XMLDocType.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
  	        return false;
  	      }
  	      if (node.name !== this.name) {
  	        return false;
  	      }
  	      if (node.publicId !== this.publicId) {
  	        return false;
  	      }
  	      if (node.systemId !== this.systemId) {
  	        return false;
  	      }
  	      return true;
  	    };

  	    return XMLDocType;

  	  })(XMLNode);

  	}).call(XMLDocType);
  	return XMLDocType$1.exports;
  }

  var XMLRaw$1 = {exports: {}};

  var XMLRaw = XMLRaw$1.exports;

  var hasRequiredXMLRaw;

  function requireXMLRaw () {
  	if (hasRequiredXMLRaw) return XMLRaw$1.exports;
  	hasRequiredXMLRaw = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLNode, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  NodeType = requireNodeType();

  	  XMLNode = requireXMLNode();

  	  XMLRaw$1.exports = (function(superClass) {
  	    extend(XMLRaw, superClass);

  	    function XMLRaw(parent, text) {
  	      XMLRaw.__super__.constructor.call(this, parent);
  	      if (text == null) {
  	        throw new Error("Missing raw text. " + this.debugInfo());
  	      }
  	      this.type = NodeType.Raw;
  	      this.value = this.stringify.raw(text);
  	    }

  	    XMLRaw.prototype.clone = function() {
  	      return Object.create(this);
  	    };

  	    XMLRaw.prototype.toString = function(options) {
  	      return this.options.writer.raw(this, this.options.writer.filterOptions(options));
  	    };

  	    return XMLRaw;

  	  })(XMLNode);

  	}).call(XMLRaw);
  	return XMLRaw$1.exports;
  }

  var XMLText$1 = {exports: {}};

  var XMLText = XMLText$1.exports;

  var hasRequiredXMLText;

  function requireXMLText () {
  	if (hasRequiredXMLText) return XMLText$1.exports;
  	hasRequiredXMLText = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLCharacterData, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  NodeType = requireNodeType();

  	  XMLCharacterData = requireXMLCharacterData();

  	  XMLText$1.exports = (function(superClass) {
  	    extend(XMLText, superClass);

  	    function XMLText(parent, text) {
  	      XMLText.__super__.constructor.call(this, parent);
  	      if (text == null) {
  	        throw new Error("Missing element text. " + this.debugInfo());
  	      }
  	      this.name = "#text";
  	      this.type = NodeType.Text;
  	      this.value = this.stringify.text(text);
  	    }

  	    Object.defineProperty(XMLText.prototype, 'isElementContentWhitespace', {
  	      get: function() {
  	        throw new Error("This DOM method is not implemented." + this.debugInfo());
  	      }
  	    });

  	    Object.defineProperty(XMLText.prototype, 'wholeText', {
  	      get: function() {
  	        var next, prev, str;
  	        str = '';
  	        prev = this.previousSibling;
  	        while (prev) {
  	          str = prev.data + str;
  	          prev = prev.previousSibling;
  	        }
  	        str += this.data;
  	        next = this.nextSibling;
  	        while (next) {
  	          str = str + next.data;
  	          next = next.nextSibling;
  	        }
  	        return str;
  	      }
  	    });

  	    XMLText.prototype.clone = function() {
  	      return Object.create(this);
  	    };

  	    XMLText.prototype.toString = function(options) {
  	      return this.options.writer.text(this, this.options.writer.filterOptions(options));
  	    };

  	    XMLText.prototype.splitText = function(offset) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLText.prototype.replaceWholeText = function(content) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    return XMLText;

  	  })(XMLCharacterData);

  	}).call(XMLText);
  	return XMLText$1.exports;
  }

  var XMLProcessingInstruction$1 = {exports: {}};

  var XMLProcessingInstruction = XMLProcessingInstruction$1.exports;

  var hasRequiredXMLProcessingInstruction;

  function requireXMLProcessingInstruction () {
  	if (hasRequiredXMLProcessingInstruction) return XMLProcessingInstruction$1.exports;
  	hasRequiredXMLProcessingInstruction = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLCharacterData, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  NodeType = requireNodeType();

  	  XMLCharacterData = requireXMLCharacterData();

  	  XMLProcessingInstruction$1.exports = (function(superClass) {
  	    extend(XMLProcessingInstruction, superClass);

  	    function XMLProcessingInstruction(parent, target, value) {
  	      XMLProcessingInstruction.__super__.constructor.call(this, parent);
  	      if (target == null) {
  	        throw new Error("Missing instruction target. " + this.debugInfo());
  	      }
  	      this.type = NodeType.ProcessingInstruction;
  	      this.target = this.stringify.insTarget(target);
  	      this.name = this.target;
  	      if (value) {
  	        this.value = this.stringify.insValue(value);
  	      }
  	    }

  	    XMLProcessingInstruction.prototype.clone = function() {
  	      return Object.create(this);
  	    };

  	    XMLProcessingInstruction.prototype.toString = function(options) {
  	      return this.options.writer.processingInstruction(this, this.options.writer.filterOptions(options));
  	    };

  	    XMLProcessingInstruction.prototype.isEqualNode = function(node) {
  	      if (!XMLProcessingInstruction.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
  	        return false;
  	      }
  	      if (node.target !== this.target) {
  	        return false;
  	      }
  	      return true;
  	    };

  	    return XMLProcessingInstruction;

  	  })(XMLCharacterData);

  	}).call(XMLProcessingInstruction);
  	return XMLProcessingInstruction$1.exports;
  }

  var XMLDummy$1 = {exports: {}};

  var XMLDummy = XMLDummy$1.exports;

  var hasRequiredXMLDummy;

  function requireXMLDummy () {
  	if (hasRequiredXMLDummy) return XMLDummy$1.exports;
  	hasRequiredXMLDummy = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLNode,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLDummy$1.exports = (function(superClass) {
  	    extend(XMLDummy, superClass);

  	    function XMLDummy(parent) {
  	      XMLDummy.__super__.constructor.call(this, parent);
  	      this.type = NodeType.Dummy;
  	    }

  	    XMLDummy.prototype.clone = function() {
  	      return Object.create(this);
  	    };

  	    XMLDummy.prototype.toString = function(options) {
  	      return '';
  	    };

  	    return XMLDummy;

  	  })(XMLNode);

  	}).call(XMLDummy);
  	return XMLDummy$1.exports;
  }

  var XMLNodeList$1 = {exports: {}};

  var XMLNodeList = XMLNodeList$1.exports;

  var hasRequiredXMLNodeList;

  function requireXMLNodeList () {
  	if (hasRequiredXMLNodeList) return XMLNodeList$1.exports;
  	hasRequiredXMLNodeList = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {

  	  XMLNodeList$1.exports = (function() {
  	    function XMLNodeList(nodes) {
  	      this.nodes = nodes;
  	    }

  	    Object.defineProperty(XMLNodeList.prototype, 'length', {
  	      get: function() {
  	        return this.nodes.length || 0;
  	      }
  	    });

  	    XMLNodeList.prototype.clone = function() {
  	      return this.nodes = null;
  	    };

  	    XMLNodeList.prototype.item = function(index) {
  	      return this.nodes[index] || null;
  	    };

  	    return XMLNodeList;

  	  })();

  	}).call(XMLNodeList);
  	return XMLNodeList$1.exports;
  }

  var DocumentPosition$1 = {exports: {}};

  var DocumentPosition = DocumentPosition$1.exports;

  var hasRequiredDocumentPosition;

  function requireDocumentPosition () {
  	if (hasRequiredDocumentPosition) return DocumentPosition$1.exports;
  	hasRequiredDocumentPosition = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  DocumentPosition$1.exports = {
  	    Disconnected: 1,
  	    Preceding: 2,
  	    Following: 4,
  	    Contains: 8,
  	    ContainedBy: 16,
  	    ImplementationSpecific: 32
  	  };

  	}).call(DocumentPosition);
  	return DocumentPosition$1.exports;
  }

  var XMLNode = XMLNode$1.exports;

  var hasRequiredXMLNode;

  function requireXMLNode () {
  	if (hasRequiredXMLNode) return XMLNode$1.exports;
  	hasRequiredXMLNode = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var DocumentPosition, NodeType, XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLNodeList, XMLProcessingInstruction, XMLRaw, XMLText, getValue, isEmpty, isFunction, isObject, ref1,
  	    hasProp = {}.hasOwnProperty;

  	  ref1 = requireUtility(), isObject = ref1.isObject, isFunction = ref1.isFunction, isEmpty = ref1.isEmpty, getValue = ref1.getValue;

  	  XMLElement = null;

  	  XMLCData = null;

  	  XMLComment = null;

  	  XMLDeclaration = null;

  	  XMLDocType = null;

  	  XMLRaw = null;

  	  XMLText = null;

  	  XMLProcessingInstruction = null;

  	  XMLDummy = null;

  	  NodeType = null;

  	  XMLNodeList = null;

  	  DocumentPosition = null;

  	  XMLNode$1.exports = (function() {
  	    function XMLNode(parent1) {
  	      this.parent = parent1;
  	      if (this.parent) {
  	        this.options = this.parent.options;
  	        this.stringify = this.parent.stringify;
  	      }
  	      this.value = null;
  	      this.children = [];
  	      this.baseURI = null;
  	      if (!XMLElement) {
  	        XMLElement = requireXMLElement();
  	        XMLCData = requireXMLCData();
  	        XMLComment = requireXMLComment();
  	        XMLDeclaration = requireXMLDeclaration();
  	        XMLDocType = requireXMLDocType();
  	        XMLRaw = requireXMLRaw();
  	        XMLText = requireXMLText();
  	        XMLProcessingInstruction = requireXMLProcessingInstruction();
  	        XMLDummy = requireXMLDummy();
  	        NodeType = requireNodeType();
  	        XMLNodeList = requireXMLNodeList();
  	        requireXMLNamedNodeMap();
  	        DocumentPosition = requireDocumentPosition();
  	      }
  	    }

  	    Object.defineProperty(XMLNode.prototype, 'nodeName', {
  	      get: function() {
  	        return this.name;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'nodeType', {
  	      get: function() {
  	        return this.type;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'nodeValue', {
  	      get: function() {
  	        return this.value;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'parentNode', {
  	      get: function() {
  	        return this.parent;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'childNodes', {
  	      get: function() {
  	        if (!this.childNodeList || !this.childNodeList.nodes) {
  	          this.childNodeList = new XMLNodeList(this.children);
  	        }
  	        return this.childNodeList;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'firstChild', {
  	      get: function() {
  	        return this.children[0] || null;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'lastChild', {
  	      get: function() {
  	        return this.children[this.children.length - 1] || null;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'previousSibling', {
  	      get: function() {
  	        var i;
  	        i = this.parent.children.indexOf(this);
  	        return this.parent.children[i - 1] || null;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'nextSibling', {
  	      get: function() {
  	        var i;
  	        i = this.parent.children.indexOf(this);
  	        return this.parent.children[i + 1] || null;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'ownerDocument', {
  	      get: function() {
  	        return this.document() || null;
  	      }
  	    });

  	    Object.defineProperty(XMLNode.prototype, 'textContent', {
  	      get: function() {
  	        var child, j, len, ref2, str;
  	        if (this.nodeType === NodeType.Element || this.nodeType === NodeType.DocumentFragment) {
  	          str = '';
  	          ref2 = this.children;
  	          for (j = 0, len = ref2.length; j < len; j++) {
  	            child = ref2[j];
  	            if (child.textContent) {
  	              str += child.textContent;
  	            }
  	          }
  	          return str;
  	        } else {
  	          return null;
  	        }
  	      },
  	      set: function(value) {
  	        throw new Error("This DOM method is not implemented." + this.debugInfo());
  	      }
  	    });

  	    XMLNode.prototype.setParent = function(parent) {
  	      var child, j, len, ref2, results;
  	      this.parent = parent;
  	      if (parent) {
  	        this.options = parent.options;
  	        this.stringify = parent.stringify;
  	      }
  	      ref2 = this.children;
  	      results = [];
  	      for (j = 0, len = ref2.length; j < len; j++) {
  	        child = ref2[j];
  	        results.push(child.setParent(this));
  	      }
  	      return results;
  	    };

  	    XMLNode.prototype.element = function(name, attributes, text) {
  	      var childNode, item, j, k, key, lastChild, len, len1, ref2, ref3, val;
  	      lastChild = null;
  	      if (attributes === null && (text == null)) {
  	        ref2 = [{}, null], attributes = ref2[0], text = ref2[1];
  	      }
  	      if (attributes == null) {
  	        attributes = {};
  	      }
  	      attributes = getValue(attributes);
  	      if (!isObject(attributes)) {
  	        ref3 = [attributes, text], text = ref3[0], attributes = ref3[1];
  	      }
  	      if (name != null) {
  	        name = getValue(name);
  	      }
  	      if (Array.isArray(name)) {
  	        for (j = 0, len = name.length; j < len; j++) {
  	          item = name[j];
  	          lastChild = this.element(item);
  	        }
  	      } else if (isFunction(name)) {
  	        lastChild = this.element(name.apply());
  	      } else if (isObject(name)) {
  	        for (key in name) {
  	          if (!hasProp.call(name, key)) continue;
  	          val = name[key];
  	          if (isFunction(val)) {
  	            val = val.apply();
  	          }
  	          if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
  	            lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
  	          } else if (!this.options.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
  	            lastChild = this.dummy();
  	          } else if (isObject(val) && isEmpty(val)) {
  	            lastChild = this.element(key);
  	          } else if (!this.options.keepNullNodes && (val == null)) {
  	            lastChild = this.dummy();
  	          } else if (!this.options.separateArrayItems && Array.isArray(val)) {
  	            for (k = 0, len1 = val.length; k < len1; k++) {
  	              item = val[k];
  	              childNode = {};
  	              childNode[key] = item;
  	              lastChild = this.element(childNode);
  	            }
  	          } else if (isObject(val)) {
  	            if (!this.options.ignoreDecorators && this.stringify.convertTextKey && key.indexOf(this.stringify.convertTextKey) === 0) {
  	              lastChild = this.element(val);
  	            } else {
  	              lastChild = this.element(key);
  	              lastChild.element(val);
  	            }
  	          } else {
  	            lastChild = this.element(key, val);
  	          }
  	        }
  	      } else if (!this.options.keepNullNodes && text === null) {
  	        lastChild = this.dummy();
  	      } else {
  	        if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
  	          lastChild = this.text(text);
  	        } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
  	          lastChild = this.cdata(text);
  	        } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
  	          lastChild = this.comment(text);
  	        } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
  	          lastChild = this.raw(text);
  	        } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && name.indexOf(this.stringify.convertPIKey) === 0) {
  	          lastChild = this.instruction(name.substr(this.stringify.convertPIKey.length), text);
  	        } else {
  	          lastChild = this.node(name, attributes, text);
  	        }
  	      }
  	      if (lastChild == null) {
  	        throw new Error("Could not create any elements with: " + name + ". " + this.debugInfo());
  	      }
  	      return lastChild;
  	    };

  	    XMLNode.prototype.insertBefore = function(name, attributes, text) {
  	      var child, i, newChild, refChild, removed;
  	      if (name != null ? name.type : void 0) {
  	        newChild = name;
  	        refChild = attributes;
  	        newChild.setParent(this);
  	        if (refChild) {
  	          i = children.indexOf(refChild);
  	          removed = children.splice(i);
  	          children.push(newChild);
  	          Array.prototype.push.apply(children, removed);
  	        } else {
  	          children.push(newChild);
  	        }
  	        return newChild;
  	      } else {
  	        if (this.isRoot) {
  	          throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
  	        }
  	        i = this.parent.children.indexOf(this);
  	        removed = this.parent.children.splice(i);
  	        child = this.parent.element(name, attributes, text);
  	        Array.prototype.push.apply(this.parent.children, removed);
  	        return child;
  	      }
  	    };

  	    XMLNode.prototype.insertAfter = function(name, attributes, text) {
  	      var child, i, removed;
  	      if (this.isRoot) {
  	        throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
  	      }
  	      i = this.parent.children.indexOf(this);
  	      removed = this.parent.children.splice(i + 1);
  	      child = this.parent.element(name, attributes, text);
  	      Array.prototype.push.apply(this.parent.children, removed);
  	      return child;
  	    };

  	    XMLNode.prototype.remove = function() {
  	      var i;
  	      if (this.isRoot) {
  	        throw new Error("Cannot remove the root element. " + this.debugInfo());
  	      }
  	      i = this.parent.children.indexOf(this);
  	      [].splice.apply(this.parent.children, [i, i - i + 1].concat([]));
  	      return this.parent;
  	    };

  	    XMLNode.prototype.node = function(name, attributes, text) {
  	      var child, ref2;
  	      if (name != null) {
  	        name = getValue(name);
  	      }
  	      attributes || (attributes = {});
  	      attributes = getValue(attributes);
  	      if (!isObject(attributes)) {
  	        ref2 = [attributes, text], text = ref2[0], attributes = ref2[1];
  	      }
  	      child = new XMLElement(this, name, attributes);
  	      if (text != null) {
  	        child.text(text);
  	      }
  	      this.children.push(child);
  	      return child;
  	    };

  	    XMLNode.prototype.text = function(value) {
  	      var child;
  	      if (isObject(value)) {
  	        this.element(value);
  	      }
  	      child = new XMLText(this, value);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLNode.prototype.cdata = function(value) {
  	      var child;
  	      child = new XMLCData(this, value);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLNode.prototype.comment = function(value) {
  	      var child;
  	      child = new XMLComment(this, value);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLNode.prototype.commentBefore = function(value) {
  	      var i, removed;
  	      i = this.parent.children.indexOf(this);
  	      removed = this.parent.children.splice(i);
  	      this.parent.comment(value);
  	      Array.prototype.push.apply(this.parent.children, removed);
  	      return this;
  	    };

  	    XMLNode.prototype.commentAfter = function(value) {
  	      var i, removed;
  	      i = this.parent.children.indexOf(this);
  	      removed = this.parent.children.splice(i + 1);
  	      this.parent.comment(value);
  	      Array.prototype.push.apply(this.parent.children, removed);
  	      return this;
  	    };

  	    XMLNode.prototype.raw = function(value) {
  	      var child;
  	      child = new XMLRaw(this, value);
  	      this.children.push(child);
  	      return this;
  	    };

  	    XMLNode.prototype.dummy = function() {
  	      var child;
  	      child = new XMLDummy(this);
  	      return child;
  	    };

  	    XMLNode.prototype.instruction = function(target, value) {
  	      var insTarget, insValue, instruction, j, len;
  	      if (target != null) {
  	        target = getValue(target);
  	      }
  	      if (value != null) {
  	        value = getValue(value);
  	      }
  	      if (Array.isArray(target)) {
  	        for (j = 0, len = target.length; j < len; j++) {
  	          insTarget = target[j];
  	          this.instruction(insTarget);
  	        }
  	      } else if (isObject(target)) {
  	        for (insTarget in target) {
  	          if (!hasProp.call(target, insTarget)) continue;
  	          insValue = target[insTarget];
  	          this.instruction(insTarget, insValue);
  	        }
  	      } else {
  	        if (isFunction(value)) {
  	          value = value.apply();
  	        }
  	        instruction = new XMLProcessingInstruction(this, target, value);
  	        this.children.push(instruction);
  	      }
  	      return this;
  	    };

  	    XMLNode.prototype.instructionBefore = function(target, value) {
  	      var i, removed;
  	      i = this.parent.children.indexOf(this);
  	      removed = this.parent.children.splice(i);
  	      this.parent.instruction(target, value);
  	      Array.prototype.push.apply(this.parent.children, removed);
  	      return this;
  	    };

  	    XMLNode.prototype.instructionAfter = function(target, value) {
  	      var i, removed;
  	      i = this.parent.children.indexOf(this);
  	      removed = this.parent.children.splice(i + 1);
  	      this.parent.instruction(target, value);
  	      Array.prototype.push.apply(this.parent.children, removed);
  	      return this;
  	    };

  	    XMLNode.prototype.declaration = function(version, encoding, standalone) {
  	      var doc, xmldec;
  	      doc = this.document();
  	      xmldec = new XMLDeclaration(doc, version, encoding, standalone);
  	      if (doc.children.length === 0) {
  	        doc.children.unshift(xmldec);
  	      } else if (doc.children[0].type === NodeType.Declaration) {
  	        doc.children[0] = xmldec;
  	      } else {
  	        doc.children.unshift(xmldec);
  	      }
  	      return doc.root() || doc;
  	    };

  	    XMLNode.prototype.dtd = function(pubID, sysID) {
  	      var child, doc, doctype, i, j, k, len, len1, ref2, ref3;
  	      doc = this.document();
  	      doctype = new XMLDocType(doc, pubID, sysID);
  	      ref2 = doc.children;
  	      for (i = j = 0, len = ref2.length; j < len; i = ++j) {
  	        child = ref2[i];
  	        if (child.type === NodeType.DocType) {
  	          doc.children[i] = doctype;
  	          return doctype;
  	        }
  	      }
  	      ref3 = doc.children;
  	      for (i = k = 0, len1 = ref3.length; k < len1; i = ++k) {
  	        child = ref3[i];
  	        if (child.isRoot) {
  	          doc.children.splice(i, 0, doctype);
  	          return doctype;
  	        }
  	      }
  	      doc.children.push(doctype);
  	      return doctype;
  	    };

  	    XMLNode.prototype.up = function() {
  	      if (this.isRoot) {
  	        throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
  	      }
  	      return this.parent;
  	    };

  	    XMLNode.prototype.root = function() {
  	      var node;
  	      node = this;
  	      while (node) {
  	        if (node.type === NodeType.Document) {
  	          return node.rootObject;
  	        } else if (node.isRoot) {
  	          return node;
  	        } else {
  	          node = node.parent;
  	        }
  	      }
  	    };

  	    XMLNode.prototype.document = function() {
  	      var node;
  	      node = this;
  	      while (node) {
  	        if (node.type === NodeType.Document) {
  	          return node;
  	        } else {
  	          node = node.parent;
  	        }
  	      }
  	    };

  	    XMLNode.prototype.end = function(options) {
  	      return this.document().end(options);
  	    };

  	    XMLNode.prototype.prev = function() {
  	      var i;
  	      i = this.parent.children.indexOf(this);
  	      if (i < 1) {
  	        throw new Error("Already at the first node. " + this.debugInfo());
  	      }
  	      return this.parent.children[i - 1];
  	    };

  	    XMLNode.prototype.next = function() {
  	      var i;
  	      i = this.parent.children.indexOf(this);
  	      if (i === -1 || i === this.parent.children.length - 1) {
  	        throw new Error("Already at the last node. " + this.debugInfo());
  	      }
  	      return this.parent.children[i + 1];
  	    };

  	    XMLNode.prototype.importDocument = function(doc) {
  	      var clonedRoot;
  	      clonedRoot = doc.root().clone();
  	      clonedRoot.parent = this;
  	      clonedRoot.isRoot = false;
  	      this.children.push(clonedRoot);
  	      return this;
  	    };

  	    XMLNode.prototype.debugInfo = function(name) {
  	      var ref2, ref3;
  	      name = name || this.name;
  	      if ((name == null) && !((ref2 = this.parent) != null ? ref2.name : void 0)) {
  	        return "";
  	      } else if (name == null) {
  	        return "parent: <" + this.parent.name + ">";
  	      } else if (!((ref3 = this.parent) != null ? ref3.name : void 0)) {
  	        return "node: <" + name + ">";
  	      } else {
  	        return "node: <" + name + ">, parent: <" + this.parent.name + ">";
  	      }
  	    };

  	    XMLNode.prototype.ele = function(name, attributes, text) {
  	      return this.element(name, attributes, text);
  	    };

  	    XMLNode.prototype.nod = function(name, attributes, text) {
  	      return this.node(name, attributes, text);
  	    };

  	    XMLNode.prototype.txt = function(value) {
  	      return this.text(value);
  	    };

  	    XMLNode.prototype.dat = function(value) {
  	      return this.cdata(value);
  	    };

  	    XMLNode.prototype.com = function(value) {
  	      return this.comment(value);
  	    };

  	    XMLNode.prototype.ins = function(target, value) {
  	      return this.instruction(target, value);
  	    };

  	    XMLNode.prototype.doc = function() {
  	      return this.document();
  	    };

  	    XMLNode.prototype.dec = function(version, encoding, standalone) {
  	      return this.declaration(version, encoding, standalone);
  	    };

  	    XMLNode.prototype.e = function(name, attributes, text) {
  	      return this.element(name, attributes, text);
  	    };

  	    XMLNode.prototype.n = function(name, attributes, text) {
  	      return this.node(name, attributes, text);
  	    };

  	    XMLNode.prototype.t = function(value) {
  	      return this.text(value);
  	    };

  	    XMLNode.prototype.d = function(value) {
  	      return this.cdata(value);
  	    };

  	    XMLNode.prototype.c = function(value) {
  	      return this.comment(value);
  	    };

  	    XMLNode.prototype.r = function(value) {
  	      return this.raw(value);
  	    };

  	    XMLNode.prototype.i = function(target, value) {
  	      return this.instruction(target, value);
  	    };

  	    XMLNode.prototype.u = function() {
  	      return this.up();
  	    };

  	    XMLNode.prototype.importXMLBuilder = function(doc) {
  	      return this.importDocument(doc);
  	    };

  	    XMLNode.prototype.replaceChild = function(newChild, oldChild) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.removeChild = function(oldChild) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.appendChild = function(newChild) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.hasChildNodes = function() {
  	      return this.children.length !== 0;
  	    };

  	    XMLNode.prototype.cloneNode = function(deep) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.normalize = function() {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.isSupported = function(feature, version) {
  	      return true;
  	    };

  	    XMLNode.prototype.hasAttributes = function() {
  	      return this.attribs.length !== 0;
  	    };

  	    XMLNode.prototype.compareDocumentPosition = function(other) {
  	      var ref, res;
  	      ref = this;
  	      if (ref === other) {
  	        return 0;
  	      } else if (this.document() !== other.document()) {
  	        res = DocumentPosition.Disconnected | DocumentPosition.ImplementationSpecific;
  	        if (Math.random() < 0.5) {
  	          res |= DocumentPosition.Preceding;
  	        } else {
  	          res |= DocumentPosition.Following;
  	        }
  	        return res;
  	      } else if (ref.isAncestor(other)) {
  	        return DocumentPosition.Contains | DocumentPosition.Preceding;
  	      } else if (ref.isDescendant(other)) {
  	        return DocumentPosition.Contains | DocumentPosition.Following;
  	      } else if (ref.isPreceding(other)) {
  	        return DocumentPosition.Preceding;
  	      } else {
  	        return DocumentPosition.Following;
  	      }
  	    };

  	    XMLNode.prototype.isSameNode = function(other) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.lookupPrefix = function(namespaceURI) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.isDefaultNamespace = function(namespaceURI) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.lookupNamespaceURI = function(prefix) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.isEqualNode = function(node) {
  	      var i, j, ref2;
  	      if (node.nodeType !== this.nodeType) {
  	        return false;
  	      }
  	      if (node.children.length !== this.children.length) {
  	        return false;
  	      }
  	      for (i = j = 0, ref2 = this.children.length - 1; 0 <= ref2 ? j <= ref2 : j >= ref2; i = 0 <= ref2 ? ++j : --j) {
  	        if (!this.children[i].isEqualNode(node.children[i])) {
  	          return false;
  	        }
  	      }
  	      return true;
  	    };

  	    XMLNode.prototype.getFeature = function(feature, version) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.setUserData = function(key, data, handler) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.getUserData = function(key) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLNode.prototype.contains = function(other) {
  	      if (!other) {
  	        return false;
  	      }
  	      return other === this || this.isDescendant(other);
  	    };

  	    XMLNode.prototype.isDescendant = function(node) {
  	      var child, isDescendantChild, j, len, ref2;
  	      ref2 = this.children;
  	      for (j = 0, len = ref2.length; j < len; j++) {
  	        child = ref2[j];
  	        if (node === child) {
  	          return true;
  	        }
  	        isDescendantChild = child.isDescendant(node);
  	        if (isDescendantChild) {
  	          return true;
  	        }
  	      }
  	      return false;
  	    };

  	    XMLNode.prototype.isAncestor = function(node) {
  	      return node.isDescendant(this);
  	    };

  	    XMLNode.prototype.isPreceding = function(node) {
  	      var nodePos, thisPos;
  	      nodePos = this.treePosition(node);
  	      thisPos = this.treePosition(this);
  	      if (nodePos === -1 || thisPos === -1) {
  	        return false;
  	      } else {
  	        return nodePos < thisPos;
  	      }
  	    };

  	    XMLNode.prototype.isFollowing = function(node) {
  	      var nodePos, thisPos;
  	      nodePos = this.treePosition(node);
  	      thisPos = this.treePosition(this);
  	      if (nodePos === -1 || thisPos === -1) {
  	        return false;
  	      } else {
  	        return nodePos > thisPos;
  	      }
  	    };

  	    XMLNode.prototype.treePosition = function(node) {
  	      var found, pos;
  	      pos = 0;
  	      found = false;
  	      this.foreachTreeNode(this.document(), function(childNode) {
  	        pos++;
  	        if (!found && childNode === node) {
  	          return found = true;
  	        }
  	      });
  	      if (found) {
  	        return pos;
  	      } else {
  	        return -1;
  	      }
  	    };

  	    XMLNode.prototype.foreachTreeNode = function(node, func) {
  	      var child, j, len, ref2, res;
  	      node || (node = this.document());
  	      ref2 = node.children;
  	      for (j = 0, len = ref2.length; j < len; j++) {
  	        child = ref2[j];
  	        if (res = func(child)) {
  	          return res;
  	        } else {
  	          res = this.foreachTreeNode(child, func);
  	          if (res) {
  	            return res;
  	          }
  	        }
  	      }
  	    };

  	    return XMLNode;

  	  })();

  	}).call(XMLNode);
  	return XMLNode$1.exports;
  }

  var XMLStringifier$1 = {exports: {}};

  var XMLStringifier = XMLStringifier$1.exports;

  var hasRequiredXMLStringifier;

  function requireXMLStringifier () {
  	if (hasRequiredXMLStringifier) return XMLStringifier$1.exports;
  	hasRequiredXMLStringifier = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  	    hasProp = {}.hasOwnProperty;

  	  XMLStringifier$1.exports = (function() {
  	    function XMLStringifier(options) {
  	      this.assertLegalName = bind(this.assertLegalName, this);
  	      this.assertLegalChar = bind(this.assertLegalChar, this);
  	      var key, ref, value;
  	      options || (options = {});
  	      this.options = options;
  	      if (!this.options.version) {
  	        this.options.version = '1.0';
  	      }
  	      ref = options.stringify || {};
  	      for (key in ref) {
  	        if (!hasProp.call(ref, key)) continue;
  	        value = ref[key];
  	        this[key] = value;
  	      }
  	    }

  	    XMLStringifier.prototype.name = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalName('' + val || '');
  	    };

  	    XMLStringifier.prototype.text = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar(this.textEscape('' + val || ''));
  	    };

  	    XMLStringifier.prototype.cdata = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      val = '' + val || '';
  	      val = val.replace(']]>', ']]]]><![CDATA[>');
  	      return this.assertLegalChar(val);
  	    };

  	    XMLStringifier.prototype.comment = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      val = '' + val || '';
  	      if (val.match(/--/)) {
  	        throw new Error("Comment text cannot contain double-hypen: " + val);
  	      }
  	      return this.assertLegalChar(val);
  	    };

  	    XMLStringifier.prototype.raw = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return '' + val || '';
  	    };

  	    XMLStringifier.prototype.attValue = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar(this.attEscape(val = '' + val || ''));
  	    };

  	    XMLStringifier.prototype.insTarget = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar('' + val || '');
  	    };

  	    XMLStringifier.prototype.insValue = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      val = '' + val || '';
  	      if (val.match(/\?>/)) {
  	        throw new Error("Invalid processing instruction value: " + val);
  	      }
  	      return this.assertLegalChar(val);
  	    };

  	    XMLStringifier.prototype.xmlVersion = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      val = '' + val || '';
  	      if (!val.match(/1\.[0-9]+/)) {
  	        throw new Error("Invalid version number: " + val);
  	      }
  	      return val;
  	    };

  	    XMLStringifier.prototype.xmlEncoding = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      val = '' + val || '';
  	      if (!val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) {
  	        throw new Error("Invalid encoding: " + val);
  	      }
  	      return this.assertLegalChar(val);
  	    };

  	    XMLStringifier.prototype.xmlStandalone = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      if (val) {
  	        return "yes";
  	      } else {
  	        return "no";
  	      }
  	    };

  	    XMLStringifier.prototype.dtdPubID = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar('' + val || '');
  	    };

  	    XMLStringifier.prototype.dtdSysID = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar('' + val || '');
  	    };

  	    XMLStringifier.prototype.dtdElementValue = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar('' + val || '');
  	    };

  	    XMLStringifier.prototype.dtdAttType = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar('' + val || '');
  	    };

  	    XMLStringifier.prototype.dtdAttDefault = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar('' + val || '');
  	    };

  	    XMLStringifier.prototype.dtdEntityValue = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar('' + val || '');
  	    };

  	    XMLStringifier.prototype.dtdNData = function(val) {
  	      if (this.options.noValidation) {
  	        return val;
  	      }
  	      return this.assertLegalChar('' + val || '');
  	    };

  	    XMLStringifier.prototype.convertAttKey = '@';

  	    XMLStringifier.prototype.convertPIKey = '?';

  	    XMLStringifier.prototype.convertTextKey = '#text';

  	    XMLStringifier.prototype.convertCDataKey = '#cdata';

  	    XMLStringifier.prototype.convertCommentKey = '#comment';

  	    XMLStringifier.prototype.convertRawKey = '#raw';

  	    XMLStringifier.prototype.assertLegalChar = function(str) {
  	      var regex, res;
  	      if (this.options.noValidation) {
  	        return str;
  	      }
  	      regex = '';
  	      if (this.options.version === '1.0') {
  	        regex = /[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  	        if (res = str.match(regex)) {
  	          throw new Error("Invalid character in string: " + str + " at index " + res.index);
  	        }
  	      } else if (this.options.version === '1.1') {
  	        regex = /[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  	        if (res = str.match(regex)) {
  	          throw new Error("Invalid character in string: " + str + " at index " + res.index);
  	        }
  	      }
  	      return str;
  	    };

  	    XMLStringifier.prototype.assertLegalName = function(str) {
  	      var regex;
  	      if (this.options.noValidation) {
  	        return str;
  	      }
  	      this.assertLegalChar(str);
  	      regex = /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
  	      if (!str.match(regex)) {
  	        throw new Error("Invalid character in name");
  	      }
  	      return str;
  	    };

  	    XMLStringifier.prototype.textEscape = function(str) {
  	      var ampregex;
  	      if (this.options.noValidation) {
  	        return str;
  	      }
  	      ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
  	      return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;');
  	    };

  	    XMLStringifier.prototype.attEscape = function(str) {
  	      var ampregex;
  	      if (this.options.noValidation) {
  	        return str;
  	      }
  	      ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
  	      return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;');
  	    };

  	    return XMLStringifier;

  	  })();

  	}).call(XMLStringifier);
  	return XMLStringifier$1.exports;
  }

  var XMLStringWriter$1 = {exports: {}};

  var XMLWriterBase$1 = {exports: {}};

  var WriterState$1 = {exports: {}};

  var WriterState = WriterState$1.exports;

  var hasRequiredWriterState;

  function requireWriterState () {
  	if (hasRequiredWriterState) return WriterState$1.exports;
  	hasRequiredWriterState = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  WriterState$1.exports = {
  	    None: 0,
  	    OpenTag: 1,
  	    InsideTag: 2,
  	    CloseTag: 3
  	  };

  	}).call(WriterState);
  	return WriterState$1.exports;
  }

  var XMLWriterBase = XMLWriterBase$1.exports;

  var hasRequiredXMLWriterBase;

  function requireXMLWriterBase () {
  	if (hasRequiredXMLWriterBase) return XMLWriterBase$1.exports;
  	hasRequiredXMLWriterBase = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, WriterState, assign,
  	    hasProp = {}.hasOwnProperty;

  	  assign = requireUtility().assign;

  	  NodeType = requireNodeType();

  	  requireXMLDeclaration();

  	  requireXMLDocType();

  	  requireXMLCData();

  	  requireXMLComment();

  	  requireXMLElement();

  	  requireXMLRaw();

  	  requireXMLText();

  	  requireXMLProcessingInstruction();

  	  requireXMLDummy();

  	  requireXMLDTDAttList();

  	  requireXMLDTDElement();

  	  requireXMLDTDEntity();

  	  requireXMLDTDNotation();

  	  WriterState = requireWriterState();

  	  XMLWriterBase$1.exports = (function() {
  	    function XMLWriterBase(options) {
  	      var key, ref, value;
  	      options || (options = {});
  	      this.options = options;
  	      ref = options.writer || {};
  	      for (key in ref) {
  	        if (!hasProp.call(ref, key)) continue;
  	        value = ref[key];
  	        this["_" + key] = this[key];
  	        this[key] = value;
  	      }
  	    }

  	    XMLWriterBase.prototype.filterOptions = function(options) {
  	      var filteredOptions, ref, ref1, ref2, ref3, ref4, ref5, ref6;
  	      options || (options = {});
  	      options = assign({}, this.options, options);
  	      filteredOptions = {
  	        writer: this
  	      };
  	      filteredOptions.pretty = options.pretty || false;
  	      filteredOptions.allowEmpty = options.allowEmpty || false;
  	      filteredOptions.indent = (ref = options.indent) != null ? ref : '  ';
  	      filteredOptions.newline = (ref1 = options.newline) != null ? ref1 : '\n';
  	      filteredOptions.offset = (ref2 = options.offset) != null ? ref2 : 0;
  	      filteredOptions.dontPrettyTextNodes = (ref3 = (ref4 = options.dontPrettyTextNodes) != null ? ref4 : options.dontprettytextnodes) != null ? ref3 : 0;
  	      filteredOptions.spaceBeforeSlash = (ref5 = (ref6 = options.spaceBeforeSlash) != null ? ref6 : options.spacebeforeslash) != null ? ref5 : '';
  	      if (filteredOptions.spaceBeforeSlash === true) {
  	        filteredOptions.spaceBeforeSlash = ' ';
  	      }
  	      filteredOptions.suppressPrettyCount = 0;
  	      filteredOptions.user = {};
  	      filteredOptions.state = WriterState.None;
  	      return filteredOptions;
  	    };

  	    XMLWriterBase.prototype.indent = function(node, options, level) {
  	      var indentLevel;
  	      if (!options.pretty || options.suppressPrettyCount) {
  	        return '';
  	      } else if (options.pretty) {
  	        indentLevel = (level || 0) + options.offset + 1;
  	        if (indentLevel > 0) {
  	          return new Array(indentLevel).join(options.indent);
  	        }
  	      }
  	      return '';
  	    };

  	    XMLWriterBase.prototype.endline = function(node, options, level) {
  	      if (!options.pretty || options.suppressPrettyCount) {
  	        return '';
  	      } else {
  	        return options.newline;
  	      }
  	    };

  	    XMLWriterBase.prototype.attribute = function(att, options, level) {
  	      var r;
  	      this.openAttribute(att, options, level);
  	      r = ' ' + att.name + '="' + att.value + '"';
  	      this.closeAttribute(att, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.cdata = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level) + '<![CDATA[';
  	      options.state = WriterState.InsideTag;
  	      r += node.value;
  	      options.state = WriterState.CloseTag;
  	      r += ']]>' + this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.comment = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level) + '<!-- ';
  	      options.state = WriterState.InsideTag;
  	      r += node.value;
  	      options.state = WriterState.CloseTag;
  	      r += ' -->' + this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.declaration = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level) + '<?xml';
  	      options.state = WriterState.InsideTag;
  	      r += ' version="' + node.version + '"';
  	      if (node.encoding != null) {
  	        r += ' encoding="' + node.encoding + '"';
  	      }
  	      if (node.standalone != null) {
  	        r += ' standalone="' + node.standalone + '"';
  	      }
  	      options.state = WriterState.CloseTag;
  	      r += options.spaceBeforeSlash + '?>';
  	      r += this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.docType = function(node, options, level) {
  	      var child, i, len, r, ref;
  	      level || (level = 0);
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level);
  	      r += '<!DOCTYPE ' + node.root().name;
  	      if (node.pubID && node.sysID) {
  	        r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
  	      } else if (node.sysID) {
  	        r += ' SYSTEM "' + node.sysID + '"';
  	      }
  	      if (node.children.length > 0) {
  	        r += ' [';
  	        r += this.endline(node, options, level);
  	        options.state = WriterState.InsideTag;
  	        ref = node.children;
  	        for (i = 0, len = ref.length; i < len; i++) {
  	          child = ref[i];
  	          r += this.writeChildNode(child, options, level + 1);
  	        }
  	        options.state = WriterState.CloseTag;
  	        r += ']';
  	      }
  	      options.state = WriterState.CloseTag;
  	      r += options.spaceBeforeSlash + '>';
  	      r += this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.element = function(node, options, level) {
  	      var att, child, childNodeCount, firstChildNode, i, j, len, len1, name, prettySuppressed, r, ref, ref1, ref2;
  	      level || (level = 0);
  	      prettySuppressed = false;
  	      r = '';
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r += this.indent(node, options, level) + '<' + node.name;
  	      ref = node.attribs;
  	      for (name in ref) {
  	        if (!hasProp.call(ref, name)) continue;
  	        att = ref[name];
  	        r += this.attribute(att, options, level);
  	      }
  	      childNodeCount = node.children.length;
  	      firstChildNode = childNodeCount === 0 ? null : node.children[0];
  	      if (childNodeCount === 0 || node.children.every(function(e) {
  	        return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === '';
  	      })) {
  	        if (options.allowEmpty) {
  	          r += '>';
  	          options.state = WriterState.CloseTag;
  	          r += '</' + node.name + '>' + this.endline(node, options, level);
  	        } else {
  	          options.state = WriterState.CloseTag;
  	          r += options.spaceBeforeSlash + '/>' + this.endline(node, options, level);
  	        }
  	      } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && (firstChildNode.value != null)) {
  	        r += '>';
  	        options.state = WriterState.InsideTag;
  	        options.suppressPrettyCount++;
  	        prettySuppressed = true;
  	        r += this.writeChildNode(firstChildNode, options, level + 1);
  	        options.suppressPrettyCount--;
  	        prettySuppressed = false;
  	        options.state = WriterState.CloseTag;
  	        r += '</' + node.name + '>' + this.endline(node, options, level);
  	      } else {
  	        if (options.dontPrettyTextNodes) {
  	          ref1 = node.children;
  	          for (i = 0, len = ref1.length; i < len; i++) {
  	            child = ref1[i];
  	            if ((child.type === NodeType.Text || child.type === NodeType.Raw) && (child.value != null)) {
  	              options.suppressPrettyCount++;
  	              prettySuppressed = true;
  	              break;
  	            }
  	          }
  	        }
  	        r += '>' + this.endline(node, options, level);
  	        options.state = WriterState.InsideTag;
  	        ref2 = node.children;
  	        for (j = 0, len1 = ref2.length; j < len1; j++) {
  	          child = ref2[j];
  	          r += this.writeChildNode(child, options, level + 1);
  	        }
  	        options.state = WriterState.CloseTag;
  	        r += this.indent(node, options, level) + '</' + node.name + '>';
  	        if (prettySuppressed) {
  	          options.suppressPrettyCount--;
  	        }
  	        r += this.endline(node, options, level);
  	        options.state = WriterState.None;
  	      }
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.writeChildNode = function(node, options, level) {
  	      switch (node.type) {
  	        case NodeType.CData:
  	          return this.cdata(node, options, level);
  	        case NodeType.Comment:
  	          return this.comment(node, options, level);
  	        case NodeType.Element:
  	          return this.element(node, options, level);
  	        case NodeType.Raw:
  	          return this.raw(node, options, level);
  	        case NodeType.Text:
  	          return this.text(node, options, level);
  	        case NodeType.ProcessingInstruction:
  	          return this.processingInstruction(node, options, level);
  	        case NodeType.Dummy:
  	          return '';
  	        case NodeType.Declaration:
  	          return this.declaration(node, options, level);
  	        case NodeType.DocType:
  	          return this.docType(node, options, level);
  	        case NodeType.AttributeDeclaration:
  	          return this.dtdAttList(node, options, level);
  	        case NodeType.ElementDeclaration:
  	          return this.dtdElement(node, options, level);
  	        case NodeType.EntityDeclaration:
  	          return this.dtdEntity(node, options, level);
  	        case NodeType.NotationDeclaration:
  	          return this.dtdNotation(node, options, level);
  	        default:
  	          throw new Error("Unknown XML node type: " + node.constructor.name);
  	      }
  	    };

  	    XMLWriterBase.prototype.processingInstruction = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level) + '<?';
  	      options.state = WriterState.InsideTag;
  	      r += node.target;
  	      if (node.value) {
  	        r += ' ' + node.value;
  	      }
  	      options.state = WriterState.CloseTag;
  	      r += options.spaceBeforeSlash + '?>';
  	      r += this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.raw = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level);
  	      options.state = WriterState.InsideTag;
  	      r += node.value;
  	      options.state = WriterState.CloseTag;
  	      r += this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.text = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level);
  	      options.state = WriterState.InsideTag;
  	      r += node.value;
  	      options.state = WriterState.CloseTag;
  	      r += this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.dtdAttList = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level) + '<!ATTLIST';
  	      options.state = WriterState.InsideTag;
  	      r += ' ' + node.elementName + ' ' + node.attributeName + ' ' + node.attributeType;
  	      if (node.defaultValueType !== '#DEFAULT') {
  	        r += ' ' + node.defaultValueType;
  	      }
  	      if (node.defaultValue) {
  	        r += ' "' + node.defaultValue + '"';
  	      }
  	      options.state = WriterState.CloseTag;
  	      r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.dtdElement = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level) + '<!ELEMENT';
  	      options.state = WriterState.InsideTag;
  	      r += ' ' + node.name + ' ' + node.value;
  	      options.state = WriterState.CloseTag;
  	      r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.dtdEntity = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level) + '<!ENTITY';
  	      options.state = WriterState.InsideTag;
  	      if (node.pe) {
  	        r += ' %';
  	      }
  	      r += ' ' + node.name;
  	      if (node.value) {
  	        r += ' "' + node.value + '"';
  	      } else {
  	        if (node.pubID && node.sysID) {
  	          r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
  	        } else if (node.sysID) {
  	          r += ' SYSTEM "' + node.sysID + '"';
  	        }
  	        if (node.nData) {
  	          r += ' NDATA ' + node.nData;
  	        }
  	      }
  	      options.state = WriterState.CloseTag;
  	      r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.dtdNotation = function(node, options, level) {
  	      var r;
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      r = this.indent(node, options, level) + '<!NOTATION';
  	      options.state = WriterState.InsideTag;
  	      r += ' ' + node.name;
  	      if (node.pubID && node.sysID) {
  	        r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
  	      } else if (node.pubID) {
  	        r += ' PUBLIC "' + node.pubID + '"';
  	      } else if (node.sysID) {
  	        r += ' SYSTEM "' + node.sysID + '"';
  	      }
  	      options.state = WriterState.CloseTag;
  	      r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
  	      options.state = WriterState.None;
  	      this.closeNode(node, options, level);
  	      return r;
  	    };

  	    XMLWriterBase.prototype.openNode = function(node, options, level) {};

  	    XMLWriterBase.prototype.closeNode = function(node, options, level) {};

  	    XMLWriterBase.prototype.openAttribute = function(att, options, level) {};

  	    XMLWriterBase.prototype.closeAttribute = function(att, options, level) {};

  	    return XMLWriterBase;

  	  })();

  	}).call(XMLWriterBase);
  	return XMLWriterBase$1.exports;
  }

  var XMLStringWriter = XMLStringWriter$1.exports;

  var hasRequiredXMLStringWriter;

  function requireXMLStringWriter () {
  	if (hasRequiredXMLStringWriter) return XMLStringWriter$1.exports;
  	hasRequiredXMLStringWriter = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var XMLWriterBase,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  XMLWriterBase = requireXMLWriterBase();

  	  XMLStringWriter$1.exports = (function(superClass) {
  	    extend(XMLStringWriter, superClass);

  	    function XMLStringWriter(options) {
  	      XMLStringWriter.__super__.constructor.call(this, options);
  	    }

  	    XMLStringWriter.prototype.document = function(doc, options) {
  	      var child, i, len, r, ref;
  	      options = this.filterOptions(options);
  	      r = '';
  	      ref = doc.children;
  	      for (i = 0, len = ref.length; i < len; i++) {
  	        child = ref[i];
  	        r += this.writeChildNode(child, options, 0);
  	      }
  	      if (options.pretty && r.slice(-options.newline.length) === options.newline) {
  	        r = r.slice(0, -options.newline.length);
  	      }
  	      return r;
  	    };

  	    return XMLStringWriter;

  	  })(XMLWriterBase);

  	}).call(XMLStringWriter);
  	return XMLStringWriter$1.exports;
  }

  var XMLDocument = XMLDocument$1.exports;

  var hasRequiredXMLDocument;

  function requireXMLDocument () {
  	if (hasRequiredXMLDocument) return XMLDocument$1.exports;
  	hasRequiredXMLDocument = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, XMLDOMConfiguration, XMLDOMImplementation, XMLNode, XMLStringWriter, XMLStringifier, isPlainObject,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  isPlainObject = requireUtility().isPlainObject;

  	  XMLDOMImplementation = requireXMLDOMImplementation();

  	  XMLDOMConfiguration = requireXMLDOMConfiguration();

  	  XMLNode = requireXMLNode();

  	  NodeType = requireNodeType();

  	  XMLStringifier = requireXMLStringifier();

  	  XMLStringWriter = requireXMLStringWriter();

  	  XMLDocument$1.exports = (function(superClass) {
  	    extend(XMLDocument, superClass);

  	    function XMLDocument(options) {
  	      XMLDocument.__super__.constructor.call(this, null);
  	      this.name = "#document";
  	      this.type = NodeType.Document;
  	      this.documentURI = null;
  	      this.domConfig = new XMLDOMConfiguration();
  	      options || (options = {});
  	      if (!options.writer) {
  	        options.writer = new XMLStringWriter();
  	      }
  	      this.options = options;
  	      this.stringify = new XMLStringifier(options);
  	    }

  	    Object.defineProperty(XMLDocument.prototype, 'implementation', {
  	      value: new XMLDOMImplementation()
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'doctype', {
  	      get: function() {
  	        var child, i, len, ref;
  	        ref = this.children;
  	        for (i = 0, len = ref.length; i < len; i++) {
  	          child = ref[i];
  	          if (child.type === NodeType.DocType) {
  	            return child;
  	          }
  	        }
  	        return null;
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'documentElement', {
  	      get: function() {
  	        return this.rootObject || null;
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'inputEncoding', {
  	      get: function() {
  	        return null;
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'strictErrorChecking', {
  	      get: function() {
  	        return false;
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'xmlEncoding', {
  	      get: function() {
  	        if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
  	          return this.children[0].encoding;
  	        } else {
  	          return null;
  	        }
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'xmlStandalone', {
  	      get: function() {
  	        if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
  	          return this.children[0].standalone === 'yes';
  	        } else {
  	          return false;
  	        }
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'xmlVersion', {
  	      get: function() {
  	        if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
  	          return this.children[0].version;
  	        } else {
  	          return "1.0";
  	        }
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'URL', {
  	      get: function() {
  	        return this.documentURI;
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'origin', {
  	      get: function() {
  	        return null;
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'compatMode', {
  	      get: function() {
  	        return null;
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'characterSet', {
  	      get: function() {
  	        return null;
  	      }
  	    });

  	    Object.defineProperty(XMLDocument.prototype, 'contentType', {
  	      get: function() {
  	        return null;
  	      }
  	    });

  	    XMLDocument.prototype.end = function(writer) {
  	      var writerOptions;
  	      writerOptions = {};
  	      if (!writer) {
  	        writer = this.options.writer;
  	      } else if (isPlainObject(writer)) {
  	        writerOptions = writer;
  	        writer = this.options.writer;
  	      }
  	      return writer.document(this, writer.filterOptions(writerOptions));
  	    };

  	    XMLDocument.prototype.toString = function(options) {
  	      return this.options.writer.document(this, this.options.writer.filterOptions(options));
  	    };

  	    XMLDocument.prototype.createElement = function(tagName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createDocumentFragment = function() {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createTextNode = function(data) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createComment = function(data) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createCDATASection = function(data) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createProcessingInstruction = function(target, data) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createAttribute = function(name) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createEntityReference = function(name) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.getElementsByTagName = function(tagname) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.importNode = function(importedNode, deep) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createElementNS = function(namespaceURI, qualifiedName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createAttributeNS = function(namespaceURI, qualifiedName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.getElementById = function(elementId) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.adoptNode = function(source) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.normalizeDocument = function() {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.renameNode = function(node, namespaceURI, qualifiedName) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.getElementsByClassName = function(classNames) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createEvent = function(eventInterface) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createRange = function() {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createNodeIterator = function(root, whatToShow, filter) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    XMLDocument.prototype.createTreeWalker = function(root, whatToShow, filter) {
  	      throw new Error("This DOM method is not implemented." + this.debugInfo());
  	    };

  	    return XMLDocument;

  	  })(XMLNode);

  	}).call(XMLDocument);
  	return XMLDocument$1.exports;
  }

  var XMLDocumentCB$1 = {exports: {}};

  var XMLDocumentCB = XMLDocumentCB$1.exports;

  var hasRequiredXMLDocumentCB;

  function requireXMLDocumentCB () {
  	if (hasRequiredXMLDocumentCB) return XMLDocumentCB$1.exports;
  	hasRequiredXMLDocumentCB = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, WriterState, XMLAttribute, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDocument, XMLElement, XMLProcessingInstruction, XMLRaw, XMLStringWriter, XMLStringifier, XMLText, getValue, isFunction, isObject, isPlainObject, ref,
  	    hasProp = {}.hasOwnProperty;

  	  ref = requireUtility(), isObject = ref.isObject, isFunction = ref.isFunction, isPlainObject = ref.isPlainObject, getValue = ref.getValue;

  	  NodeType = requireNodeType();

  	  XMLDocument = requireXMLDocument();

  	  XMLElement = requireXMLElement();

  	  XMLCData = requireXMLCData();

  	  XMLComment = requireXMLComment();

  	  XMLRaw = requireXMLRaw();

  	  XMLText = requireXMLText();

  	  XMLProcessingInstruction = requireXMLProcessingInstruction();

  	  XMLDeclaration = requireXMLDeclaration();

  	  XMLDocType = requireXMLDocType();

  	  XMLDTDAttList = requireXMLDTDAttList();

  	  XMLDTDEntity = requireXMLDTDEntity();

  	  XMLDTDElement = requireXMLDTDElement();

  	  XMLDTDNotation = requireXMLDTDNotation();

  	  XMLAttribute = requireXMLAttribute();

  	  XMLStringifier = requireXMLStringifier();

  	  XMLStringWriter = requireXMLStringWriter();

  	  WriterState = requireWriterState();

  	  XMLDocumentCB$1.exports = (function() {
  	    function XMLDocumentCB(options, onData, onEnd) {
  	      var writerOptions;
  	      this.name = "?xml";
  	      this.type = NodeType.Document;
  	      options || (options = {});
  	      writerOptions = {};
  	      if (!options.writer) {
  	        options.writer = new XMLStringWriter();
  	      } else if (isPlainObject(options.writer)) {
  	        writerOptions = options.writer;
  	        options.writer = new XMLStringWriter();
  	      }
  	      this.options = options;
  	      this.writer = options.writer;
  	      this.writerOptions = this.writer.filterOptions(writerOptions);
  	      this.stringify = new XMLStringifier(options);
  	      this.onDataCallback = onData || function() {};
  	      this.onEndCallback = onEnd || function() {};
  	      this.currentNode = null;
  	      this.currentLevel = -1;
  	      this.openTags = {};
  	      this.documentStarted = false;
  	      this.documentCompleted = false;
  	      this.root = null;
  	    }

  	    XMLDocumentCB.prototype.createChildNode = function(node) {
  	      var att, attName, attributes, child, i, len, ref1, ref2;
  	      switch (node.type) {
  	        case NodeType.CData:
  	          this.cdata(node.value);
  	          break;
  	        case NodeType.Comment:
  	          this.comment(node.value);
  	          break;
  	        case NodeType.Element:
  	          attributes = {};
  	          ref1 = node.attribs;
  	          for (attName in ref1) {
  	            if (!hasProp.call(ref1, attName)) continue;
  	            att = ref1[attName];
  	            attributes[attName] = att.value;
  	          }
  	          this.node(node.name, attributes);
  	          break;
  	        case NodeType.Dummy:
  	          this.dummy();
  	          break;
  	        case NodeType.Raw:
  	          this.raw(node.value);
  	          break;
  	        case NodeType.Text:
  	          this.text(node.value);
  	          break;
  	        case NodeType.ProcessingInstruction:
  	          this.instruction(node.target, node.value);
  	          break;
  	        default:
  	          throw new Error("This XML node type is not supported in a JS object: " + node.constructor.name);
  	      }
  	      ref2 = node.children;
  	      for (i = 0, len = ref2.length; i < len; i++) {
  	        child = ref2[i];
  	        this.createChildNode(child);
  	        if (child.type === NodeType.Element) {
  	          this.up();
  	        }
  	      }
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.dummy = function() {
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.node = function(name, attributes, text) {
  	      var ref1;
  	      if (name == null) {
  	        throw new Error("Missing node name.");
  	      }
  	      if (this.root && this.currentLevel === -1) {
  	        throw new Error("Document can only have one root node. " + this.debugInfo(name));
  	      }
  	      this.openCurrent();
  	      name = getValue(name);
  	      if (attributes == null) {
  	        attributes = {};
  	      }
  	      attributes = getValue(attributes);
  	      if (!isObject(attributes)) {
  	        ref1 = [attributes, text], text = ref1[0], attributes = ref1[1];
  	      }
  	      this.currentNode = new XMLElement(this, name, attributes);
  	      this.currentNode.children = false;
  	      this.currentLevel++;
  	      this.openTags[this.currentLevel] = this.currentNode;
  	      if (text != null) {
  	        this.text(text);
  	      }
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.element = function(name, attributes, text) {
  	      var child, i, len, oldValidationFlag, ref1, root;
  	      if (this.currentNode && this.currentNode.type === NodeType.DocType) {
  	        this.dtdElement.apply(this, arguments);
  	      } else {
  	        if (Array.isArray(name) || isObject(name) || isFunction(name)) {
  	          oldValidationFlag = this.options.noValidation;
  	          this.options.noValidation = true;
  	          root = new XMLDocument(this.options).element('TEMP_ROOT');
  	          root.element(name);
  	          this.options.noValidation = oldValidationFlag;
  	          ref1 = root.children;
  	          for (i = 0, len = ref1.length; i < len; i++) {
  	            child = ref1[i];
  	            this.createChildNode(child);
  	            if (child.type === NodeType.Element) {
  	              this.up();
  	            }
  	          }
  	        } else {
  	          this.node(name, attributes, text);
  	        }
  	      }
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.attribute = function(name, value) {
  	      var attName, attValue;
  	      if (!this.currentNode || this.currentNode.children) {
  	        throw new Error("att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(name));
  	      }
  	      if (name != null) {
  	        name = getValue(name);
  	      }
  	      if (isObject(name)) {
  	        for (attName in name) {
  	          if (!hasProp.call(name, attName)) continue;
  	          attValue = name[attName];
  	          this.attribute(attName, attValue);
  	        }
  	      } else {
  	        if (isFunction(value)) {
  	          value = value.apply();
  	        }
  	        if (this.options.keepNullAttributes && (value == null)) {
  	          this.currentNode.attribs[name] = new XMLAttribute(this, name, "");
  	        } else if (value != null) {
  	          this.currentNode.attribs[name] = new XMLAttribute(this, name, value);
  	        }
  	      }
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.text = function(value) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLText(this, value);
  	      this.onData(this.writer.text(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.cdata = function(value) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLCData(this, value);
  	      this.onData(this.writer.cdata(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.comment = function(value) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLComment(this, value);
  	      this.onData(this.writer.comment(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.raw = function(value) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLRaw(this, value);
  	      this.onData(this.writer.raw(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.instruction = function(target, value) {
  	      var i, insTarget, insValue, len, node;
  	      this.openCurrent();
  	      if (target != null) {
  	        target = getValue(target);
  	      }
  	      if (value != null) {
  	        value = getValue(value);
  	      }
  	      if (Array.isArray(target)) {
  	        for (i = 0, len = target.length; i < len; i++) {
  	          insTarget = target[i];
  	          this.instruction(insTarget);
  	        }
  	      } else if (isObject(target)) {
  	        for (insTarget in target) {
  	          if (!hasProp.call(target, insTarget)) continue;
  	          insValue = target[insTarget];
  	          this.instruction(insTarget, insValue);
  	        }
  	      } else {
  	        if (isFunction(value)) {
  	          value = value.apply();
  	        }
  	        node = new XMLProcessingInstruction(this, target, value);
  	        this.onData(this.writer.processingInstruction(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      }
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.declaration = function(version, encoding, standalone) {
  	      var node;
  	      this.openCurrent();
  	      if (this.documentStarted) {
  	        throw new Error("declaration() must be the first node.");
  	      }
  	      node = new XMLDeclaration(this, version, encoding, standalone);
  	      this.onData(this.writer.declaration(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.doctype = function(root, pubID, sysID) {
  	      this.openCurrent();
  	      if (root == null) {
  	        throw new Error("Missing root node name.");
  	      }
  	      if (this.root) {
  	        throw new Error("dtd() must come before the root node.");
  	      }
  	      this.currentNode = new XMLDocType(this, pubID, sysID);
  	      this.currentNode.rootNodeName = root;
  	      this.currentNode.children = false;
  	      this.currentLevel++;
  	      this.openTags[this.currentLevel] = this.currentNode;
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.dtdElement = function(name, value) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLDTDElement(this, name, value);
  	      this.onData(this.writer.dtdElement(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
  	      this.onData(this.writer.dtdAttList(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.entity = function(name, value) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLDTDEntity(this, false, name, value);
  	      this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.pEntity = function(name, value) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLDTDEntity(this, true, name, value);
  	      this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.notation = function(name, value) {
  	      var node;
  	      this.openCurrent();
  	      node = new XMLDTDNotation(this, name, value);
  	      this.onData(this.writer.dtdNotation(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.up = function() {
  	      if (this.currentLevel < 0) {
  	        throw new Error("The document node has no parent.");
  	      }
  	      if (this.currentNode) {
  	        if (this.currentNode.children) {
  	          this.closeNode(this.currentNode);
  	        } else {
  	          this.openNode(this.currentNode);
  	        }
  	        this.currentNode = null;
  	      } else {
  	        this.closeNode(this.openTags[this.currentLevel]);
  	      }
  	      delete this.openTags[this.currentLevel];
  	      this.currentLevel--;
  	      return this;
  	    };

  	    XMLDocumentCB.prototype.end = function() {
  	      while (this.currentLevel >= 0) {
  	        this.up();
  	      }
  	      return this.onEnd();
  	    };

  	    XMLDocumentCB.prototype.openCurrent = function() {
  	      if (this.currentNode) {
  	        this.currentNode.children = true;
  	        return this.openNode(this.currentNode);
  	      }
  	    };

  	    XMLDocumentCB.prototype.openNode = function(node) {
  	      var att, chunk, name, ref1;
  	      if (!node.isOpen) {
  	        if (!this.root && this.currentLevel === 0 && node.type === NodeType.Element) {
  	          this.root = node;
  	        }
  	        chunk = '';
  	        if (node.type === NodeType.Element) {
  	          this.writerOptions.state = WriterState.OpenTag;
  	          chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '<' + node.name;
  	          ref1 = node.attribs;
  	          for (name in ref1) {
  	            if (!hasProp.call(ref1, name)) continue;
  	            att = ref1[name];
  	            chunk += this.writer.attribute(att, this.writerOptions, this.currentLevel);
  	          }
  	          chunk += (node.children ? '>' : '/>') + this.writer.endline(node, this.writerOptions, this.currentLevel);
  	          this.writerOptions.state = WriterState.InsideTag;
  	        } else {
  	          this.writerOptions.state = WriterState.OpenTag;
  	          chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '<!DOCTYPE ' + node.rootNodeName;
  	          if (node.pubID && node.sysID) {
  	            chunk += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
  	          } else if (node.sysID) {
  	            chunk += ' SYSTEM "' + node.sysID + '"';
  	          }
  	          if (node.children) {
  	            chunk += ' [';
  	            this.writerOptions.state = WriterState.InsideTag;
  	          } else {
  	            this.writerOptions.state = WriterState.CloseTag;
  	            chunk += '>';
  	          }
  	          chunk += this.writer.endline(node, this.writerOptions, this.currentLevel);
  	        }
  	        this.onData(chunk, this.currentLevel);
  	        return node.isOpen = true;
  	      }
  	    };

  	    XMLDocumentCB.prototype.closeNode = function(node) {
  	      var chunk;
  	      if (!node.isClosed) {
  	        chunk = '';
  	        this.writerOptions.state = WriterState.CloseTag;
  	        if (node.type === NodeType.Element) {
  	          chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '</' + node.name + '>' + this.writer.endline(node, this.writerOptions, this.currentLevel);
  	        } else {
  	          chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + ']>' + this.writer.endline(node, this.writerOptions, this.currentLevel);
  	        }
  	        this.writerOptions.state = WriterState.None;
  	        this.onData(chunk, this.currentLevel);
  	        return node.isClosed = true;
  	      }
  	    };

  	    XMLDocumentCB.prototype.onData = function(chunk, level) {
  	      this.documentStarted = true;
  	      return this.onDataCallback(chunk, level + 1);
  	    };

  	    XMLDocumentCB.prototype.onEnd = function() {
  	      this.documentCompleted = true;
  	      return this.onEndCallback();
  	    };

  	    XMLDocumentCB.prototype.debugInfo = function(name) {
  	      if (name == null) {
  	        return "";
  	      } else {
  	        return "node: <" + name + ">";
  	      }
  	    };

  	    XMLDocumentCB.prototype.ele = function() {
  	      return this.element.apply(this, arguments);
  	    };

  	    XMLDocumentCB.prototype.nod = function(name, attributes, text) {
  	      return this.node(name, attributes, text);
  	    };

  	    XMLDocumentCB.prototype.txt = function(value) {
  	      return this.text(value);
  	    };

  	    XMLDocumentCB.prototype.dat = function(value) {
  	      return this.cdata(value);
  	    };

  	    XMLDocumentCB.prototype.com = function(value) {
  	      return this.comment(value);
  	    };

  	    XMLDocumentCB.prototype.ins = function(target, value) {
  	      return this.instruction(target, value);
  	    };

  	    XMLDocumentCB.prototype.dec = function(version, encoding, standalone) {
  	      return this.declaration(version, encoding, standalone);
  	    };

  	    XMLDocumentCB.prototype.dtd = function(root, pubID, sysID) {
  	      return this.doctype(root, pubID, sysID);
  	    };

  	    XMLDocumentCB.prototype.e = function(name, attributes, text) {
  	      return this.element(name, attributes, text);
  	    };

  	    XMLDocumentCB.prototype.n = function(name, attributes, text) {
  	      return this.node(name, attributes, text);
  	    };

  	    XMLDocumentCB.prototype.t = function(value) {
  	      return this.text(value);
  	    };

  	    XMLDocumentCB.prototype.d = function(value) {
  	      return this.cdata(value);
  	    };

  	    XMLDocumentCB.prototype.c = function(value) {
  	      return this.comment(value);
  	    };

  	    XMLDocumentCB.prototype.r = function(value) {
  	      return this.raw(value);
  	    };

  	    XMLDocumentCB.prototype.i = function(target, value) {
  	      return this.instruction(target, value);
  	    };

  	    XMLDocumentCB.prototype.att = function() {
  	      if (this.currentNode && this.currentNode.type === NodeType.DocType) {
  	        return this.attList.apply(this, arguments);
  	      } else {
  	        return this.attribute.apply(this, arguments);
  	      }
  	    };

  	    XMLDocumentCB.prototype.a = function() {
  	      if (this.currentNode && this.currentNode.type === NodeType.DocType) {
  	        return this.attList.apply(this, arguments);
  	      } else {
  	        return this.attribute.apply(this, arguments);
  	      }
  	    };

  	    XMLDocumentCB.prototype.ent = function(name, value) {
  	      return this.entity(name, value);
  	    };

  	    XMLDocumentCB.prototype.pent = function(name, value) {
  	      return this.pEntity(name, value);
  	    };

  	    XMLDocumentCB.prototype.not = function(name, value) {
  	      return this.notation(name, value);
  	    };

  	    return XMLDocumentCB;

  	  })();

  	}).call(XMLDocumentCB);
  	return XMLDocumentCB$1.exports;
  }

  var XMLStreamWriter$1 = {exports: {}};

  var XMLStreamWriter = XMLStreamWriter$1.exports;

  var hasRequiredXMLStreamWriter;

  function requireXMLStreamWriter () {
  	if (hasRequiredXMLStreamWriter) return XMLStreamWriter$1.exports;
  	hasRequiredXMLStreamWriter = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, WriterState, XMLWriterBase,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  NodeType = requireNodeType();

  	  XMLWriterBase = requireXMLWriterBase();

  	  WriterState = requireWriterState();

  	  XMLStreamWriter$1.exports = (function(superClass) {
  	    extend(XMLStreamWriter, superClass);

  	    function XMLStreamWriter(stream, options) {
  	      this.stream = stream;
  	      XMLStreamWriter.__super__.constructor.call(this, options);
  	    }

  	    XMLStreamWriter.prototype.endline = function(node, options, level) {
  	      if (node.isLastRootNode && options.state === WriterState.CloseTag) {
  	        return '';
  	      } else {
  	        return XMLStreamWriter.__super__.endline.call(this, node, options, level);
  	      }
  	    };

  	    XMLStreamWriter.prototype.document = function(doc, options) {
  	      var child, i, j, k, len, len1, ref, ref1, results;
  	      ref = doc.children;
  	      for (i = j = 0, len = ref.length; j < len; i = ++j) {
  	        child = ref[i];
  	        child.isLastRootNode = i === doc.children.length - 1;
  	      }
  	      options = this.filterOptions(options);
  	      ref1 = doc.children;
  	      results = [];
  	      for (k = 0, len1 = ref1.length; k < len1; k++) {
  	        child = ref1[k];
  	        results.push(this.writeChildNode(child, options, 0));
  	      }
  	      return results;
  	    };

  	    XMLStreamWriter.prototype.attribute = function(att, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.attribute.call(this, att, options, level));
  	    };

  	    XMLStreamWriter.prototype.cdata = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.cdata.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.comment = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.comment.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.declaration = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.declaration.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.docType = function(node, options, level) {
  	      var child, j, len, ref;
  	      level || (level = 0);
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      this.stream.write(this.indent(node, options, level));
  	      this.stream.write('<!DOCTYPE ' + node.root().name);
  	      if (node.pubID && node.sysID) {
  	        this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"');
  	      } else if (node.sysID) {
  	        this.stream.write(' SYSTEM "' + node.sysID + '"');
  	      }
  	      if (node.children.length > 0) {
  	        this.stream.write(' [');
  	        this.stream.write(this.endline(node, options, level));
  	        options.state = WriterState.InsideTag;
  	        ref = node.children;
  	        for (j = 0, len = ref.length; j < len; j++) {
  	          child = ref[j];
  	          this.writeChildNode(child, options, level + 1);
  	        }
  	        options.state = WriterState.CloseTag;
  	        this.stream.write(']');
  	      }
  	      options.state = WriterState.CloseTag;
  	      this.stream.write(options.spaceBeforeSlash + '>');
  	      this.stream.write(this.endline(node, options, level));
  	      options.state = WriterState.None;
  	      return this.closeNode(node, options, level);
  	    };

  	    XMLStreamWriter.prototype.element = function(node, options, level) {
  	      var att, child, childNodeCount, firstChildNode, j, len, name, ref, ref1;
  	      level || (level = 0);
  	      this.openNode(node, options, level);
  	      options.state = WriterState.OpenTag;
  	      this.stream.write(this.indent(node, options, level) + '<' + node.name);
  	      ref = node.attribs;
  	      for (name in ref) {
  	        if (!hasProp.call(ref, name)) continue;
  	        att = ref[name];
  	        this.attribute(att, options, level);
  	      }
  	      childNodeCount = node.children.length;
  	      firstChildNode = childNodeCount === 0 ? null : node.children[0];
  	      if (childNodeCount === 0 || node.children.every(function(e) {
  	        return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === '';
  	      })) {
  	        if (options.allowEmpty) {
  	          this.stream.write('>');
  	          options.state = WriterState.CloseTag;
  	          this.stream.write('</' + node.name + '>');
  	        } else {
  	          options.state = WriterState.CloseTag;
  	          this.stream.write(options.spaceBeforeSlash + '/>');
  	        }
  	      } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && (firstChildNode.value != null)) {
  	        this.stream.write('>');
  	        options.state = WriterState.InsideTag;
  	        options.suppressPrettyCount++;
  	        this.writeChildNode(firstChildNode, options, level + 1);
  	        options.suppressPrettyCount--;
  	        options.state = WriterState.CloseTag;
  	        this.stream.write('</' + node.name + '>');
  	      } else {
  	        this.stream.write('>' + this.endline(node, options, level));
  	        options.state = WriterState.InsideTag;
  	        ref1 = node.children;
  	        for (j = 0, len = ref1.length; j < len; j++) {
  	          child = ref1[j];
  	          this.writeChildNode(child, options, level + 1);
  	        }
  	        options.state = WriterState.CloseTag;
  	        this.stream.write(this.indent(node, options, level) + '</' + node.name + '>');
  	      }
  	      this.stream.write(this.endline(node, options, level));
  	      options.state = WriterState.None;
  	      return this.closeNode(node, options, level);
  	    };

  	    XMLStreamWriter.prototype.processingInstruction = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.processingInstruction.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.raw = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.raw.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.text = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.text.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.dtdAttList = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.dtdAttList.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.dtdElement = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.dtdElement.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.dtdEntity = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.dtdEntity.call(this, node, options, level));
  	    };

  	    XMLStreamWriter.prototype.dtdNotation = function(node, options, level) {
  	      return this.stream.write(XMLStreamWriter.__super__.dtdNotation.call(this, node, options, level));
  	    };

  	    return XMLStreamWriter;

  	  })(XMLWriterBase);

  	}).call(XMLStreamWriter);
  	return XMLStreamWriter$1.exports;
  }

  var hasRequiredLib$1;

  function requireLib$1 () {
  	if (hasRequiredLib$1) return lib$1;
  	hasRequiredLib$1 = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var NodeType, WriterState, XMLDOMImplementation, XMLDocument, XMLDocumentCB, XMLStreamWriter, XMLStringWriter, assign, isFunction, ref;

  	  ref = requireUtility(), assign = ref.assign, isFunction = ref.isFunction;

  	  XMLDOMImplementation = requireXMLDOMImplementation();

  	  XMLDocument = requireXMLDocument();

  	  XMLDocumentCB = requireXMLDocumentCB();

  	  XMLStringWriter = requireXMLStringWriter();

  	  XMLStreamWriter = requireXMLStreamWriter();

  	  NodeType = requireNodeType();

  	  WriterState = requireWriterState();

  	  lib$1.create = function(name, xmldec, doctype, options) {
  	    var doc, root;
  	    if (name == null) {
  	      throw new Error("Root element needs a name.");
  	    }
  	    options = assign({}, xmldec, doctype, options);
  	    doc = new XMLDocument(options);
  	    root = doc.element(name);
  	    if (!options.headless) {
  	      doc.declaration(options);
  	      if ((options.pubID != null) || (options.sysID != null)) {
  	        doc.dtd(options);
  	      }
  	    }
  	    return root;
  	  };

  	  lib$1.begin = function(options, onData, onEnd) {
  	    var ref1;
  	    if (isFunction(options)) {
  	      ref1 = [options, onData], onData = ref1[0], onEnd = ref1[1];
  	      options = {};
  	    }
  	    if (onData) {
  	      return new XMLDocumentCB(options, onData, onEnd);
  	    } else {
  	      return new XMLDocument(options);
  	    }
  	  };

  	  lib$1.stringWriter = function(options) {
  	    return new XMLStringWriter(options);
  	  };

  	  lib$1.streamWriter = function(stream, options) {
  	    return new XMLStreamWriter(stream, options);
  	  };

  	  lib$1.implementation = new XMLDOMImplementation();

  	  lib$1.nodeType = NodeType;

  	  lib$1.writerState = WriterState;

  	}).call(lib$1);
  	return lib$1;
  }

  var hasRequiredBuilder;

  function requireBuilder () {
  	if (hasRequiredBuilder) return builder;
  	hasRequiredBuilder = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var builder$1, defaults, escapeCDATA, requiresCDATA, wrapCDATA,
  	    hasProp = {}.hasOwnProperty;

  	  builder$1 = requireLib$1();

  	  defaults = requireDefaults().defaults;

  	  requiresCDATA = function(entry) {
  	    return typeof entry === "string" && (entry.indexOf('&') >= 0 || entry.indexOf('>') >= 0 || entry.indexOf('<') >= 0);
  	  };

  	  wrapCDATA = function(entry) {
  	    return "<![CDATA[" + (escapeCDATA(entry)) + "]]>";
  	  };

  	  escapeCDATA = function(entry) {
  	    return entry.replace(']]>', ']]]]><![CDATA[>');
  	  };

  	  builder.Builder = (function() {
  	    function Builder(opts) {
  	      var key, ref, value;
  	      this.options = {};
  	      ref = defaults["0.2"];
  	      for (key in ref) {
  	        if (!hasProp.call(ref, key)) continue;
  	        value = ref[key];
  	        this.options[key] = value;
  	      }
  	      for (key in opts) {
  	        if (!hasProp.call(opts, key)) continue;
  	        value = opts[key];
  	        this.options[key] = value;
  	      }
  	    }

  	    Builder.prototype.buildObject = function(rootObj) {
  	      var attrkey, charkey, render, rootElement, rootName;
  	      attrkey = this.options.attrkey;
  	      charkey = this.options.charkey;
  	      if ((Object.keys(rootObj).length === 1) && (this.options.rootName === defaults['0.2'].rootName)) {
  	        rootName = Object.keys(rootObj)[0];
  	        rootObj = rootObj[rootName];
  	      } else {
  	        rootName = this.options.rootName;
  	      }
  	      render = (function(_this) {
  	        return function(element, obj) {
  	          var attr, child, entry, index, key, value;
  	          if (typeof obj !== 'object') {
  	            if (_this.options.cdata && requiresCDATA(obj)) {
  	              element.raw(wrapCDATA(obj));
  	            } else {
  	              element.txt(obj);
  	            }
  	          } else if (Array.isArray(obj)) {
  	            for (index in obj) {
  	              if (!hasProp.call(obj, index)) continue;
  	              child = obj[index];
  	              for (key in child) {
  	                entry = child[key];
  	                element = render(element.ele(key), entry).up();
  	              }
  	            }
  	          } else {
  	            for (key in obj) {
  	              if (!hasProp.call(obj, key)) continue;
  	              child = obj[key];
  	              if (key === attrkey) {
  	                if (typeof child === "object") {
  	                  for (attr in child) {
  	                    value = child[attr];
  	                    element = element.att(attr, value);
  	                  }
  	                }
  	              } else if (key === charkey) {
  	                if (_this.options.cdata && requiresCDATA(child)) {
  	                  element = element.raw(wrapCDATA(child));
  	                } else {
  	                  element = element.txt(child);
  	                }
  	              } else if (Array.isArray(child)) {
  	                for (index in child) {
  	                  if (!hasProp.call(child, index)) continue;
  	                  entry = child[index];
  	                  if (typeof entry === 'string') {
  	                    if (_this.options.cdata && requiresCDATA(entry)) {
  	                      element = element.ele(key).raw(wrapCDATA(entry)).up();
  	                    } else {
  	                      element = element.ele(key, entry).up();
  	                    }
  	                  } else {
  	                    element = render(element.ele(key), entry).up();
  	                  }
  	                }
  	              } else if (typeof child === "object") {
  	                element = render(element.ele(key), child).up();
  	              } else {
  	                if (typeof child === 'string' && _this.options.cdata && requiresCDATA(child)) {
  	                  element = element.ele(key).raw(wrapCDATA(child)).up();
  	                } else {
  	                  if (child == null) {
  	                    child = '';
  	                  }
  	                  element = element.ele(key, child.toString()).up();
  	                }
  	              }
  	            }
  	          }
  	          return element;
  	        };
  	      })(this);
  	      rootElement = builder$1.create(rootName, this.options.xmldec, this.options.doctype, {
  	        headless: this.options.headless,
  	        allowSurrogateChars: this.options.allowSurrogateChars
  	      });
  	      return render(rootElement, rootObj).end(this.options.renderOpts);
  	    };

  	    return Builder;

  	  })();

  	}).call(builder);
  	return builder;
  }

  var parser = {};

  (function (sax) { // wrapper for non-node envs
    sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
    sax.SAXParser = SAXParser;
    sax.SAXStream = SAXStream;
    sax.createStream = createStream;

    // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
    // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
    // since that's the earliest that a buffer overrun could occur.  This way, checks are
    // as rare as required, but as often as necessary to ensure never crossing this bound.
    // Furthermore, buffers are only tested at most once per write(), so passing a very
    // large string into write() might have undesirable effects, but this is manageable by
    // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
    // edge case, result in creating at most one complete copy of the string passed in.
    // Set to Infinity to have unlimited buffers.
    sax.MAX_BUFFER_LENGTH = 64 * 1024;

    var buffers = [
      'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
      'procInstName', 'procInstBody', 'entity', 'attribName',
      'attribValue', 'cdata', 'script'
    ];

    sax.EVENTS = [
      'text',
      'processinginstruction',
      'sgmldeclaration',
      'doctype',
      'comment',
      'opentagstart',
      'attribute',
      'opentag',
      'closetag',
      'opencdata',
      'cdata',
      'closecdata',
      'error',
      'end',
      'ready',
      'script',
      'opennamespace',
      'closenamespace'
    ];

    function SAXParser (strict, opt) {
      if (!(this instanceof SAXParser)) {
        return new SAXParser(strict, opt)
      }

      var parser = this;
      clearBuffers(parser);
      parser.q = parser.c = '';
      parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
      parser.opt = opt || {};
      parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
      parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
      parser.tags = [];
      parser.closed = parser.closedRoot = parser.sawRoot = false;
      parser.tag = parser.error = null;
      parser.strict = !!strict;
      parser.noscript = !!(strict || parser.opt.noscript);
      parser.state = S.BEGIN;
      parser.strictEntities = parser.opt.strictEntities;
      parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
      parser.attribList = [];

      // namespaces form a prototype chain.
      // it always points at the current tag,
      // which protos to its parent tag.
      if (parser.opt.xmlns) {
        parser.ns = Object.create(rootNS);
      }

      // disallow unquoted attribute values if not otherwise configured
      // and strict mode is true
      if (parser.opt.unquotedAttributeValues === undefined) {
        parser.opt.unquotedAttributeValues = !strict;
      }

      // mostly just for error reporting
      parser.trackPosition = parser.opt.position !== false;
      if (parser.trackPosition) {
        parser.position = parser.line = parser.column = 0;
      }
      emit(parser, 'onready');
    }

    if (!Object.create) {
      Object.create = function (o) {
        function F () {}
        F.prototype = o;
        var newf = new F();
        return newf
      };
    }

    if (!Object.keys) {
      Object.keys = function (o) {
        var a = [];
        for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
        return a
      };
    }

    function checkBufferLength (parser) {
      var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
      var maxActual = 0;
      for (var i = 0, l = buffers.length; i < l; i++) {
        var len = parser[buffers[i]].length;
        if (len > maxAllowed) {
          // Text/cdata nodes can get big, and since they're buffered,
          // we can get here under normal conditions.
          // Avoid issues by emitting the text node now,
          // so at least it won't get any bigger.
          switch (buffers[i]) {
            case 'textNode':
              closeText(parser);
              break

            case 'cdata':
              emitNode(parser, 'oncdata', parser.cdata);
              parser.cdata = '';
              break

            case 'script':
              emitNode(parser, 'onscript', parser.script);
              parser.script = '';
              break

            default:
              error(parser, 'Max buffer length exceeded: ' + buffers[i]);
          }
        }
        maxActual = Math.max(maxActual, len);
      }
      // schedule the next check for the earliest possible buffer overrun.
      var m = sax.MAX_BUFFER_LENGTH - maxActual;
      parser.bufferCheckPosition = m + parser.position;
    }

    function clearBuffers (parser) {
      for (var i = 0, l = buffers.length; i < l; i++) {
        parser[buffers[i]] = '';
      }
    }

    function flushBuffers (parser) {
      closeText(parser);
      if (parser.cdata !== '') {
        emitNode(parser, 'oncdata', parser.cdata);
        parser.cdata = '';
      }
      if (parser.script !== '') {
        emitNode(parser, 'onscript', parser.script);
        parser.script = '';
      }
    }

    SAXParser.prototype = {
      end: function () { end(this); },
      write: write,
      resume: function () { this.error = null; return this },
      close: function () { return this.write(null) },
      flush: function () { flushBuffers(this); }
    };

    var Stream;
    try {
      Stream = require('stream').Stream;
    } catch (ex) {
      Stream = function () {};
    }
    if (!Stream) Stream = function () {};

    var streamWraps = sax.EVENTS.filter(function (ev) {
      return ev !== 'error' && ev !== 'end'
    });

    function createStream (strict, opt) {
      return new SAXStream(strict, opt)
    }

    function SAXStream (strict, opt) {
      if (!(this instanceof SAXStream)) {
        return new SAXStream(strict, opt)
      }

      Stream.apply(this);

      this._parser = new SAXParser(strict, opt);
      this.writable = true;
      this.readable = true;

      var me = this;

      this._parser.onend = function () {
        me.emit('end');
      };

      this._parser.onerror = function (er) {
        me.emit('error', er);

        // if didn't throw, then means error was handled.
        // go ahead and clear error, so we can write again.
        me._parser.error = null;
      };

      this._decoder = null;

      streamWraps.forEach(function (ev) {
        Object.defineProperty(me, 'on' + ev, {
          get: function () {
            return me._parser['on' + ev]
          },
          set: function (h) {
            if (!h) {
              me.removeAllListeners(ev);
              me._parser['on' + ev] = h;
              return h
            }
            me.on(ev, h);
          },
          enumerable: true,
          configurable: false
        });
      });
    }

    SAXStream.prototype = Object.create(Stream.prototype, {
      constructor: {
        value: SAXStream
      }
    });

    SAXStream.prototype.write = function (data) {
      if (typeof Buffer === 'function' &&
        typeof Buffer.isBuffer === 'function' &&
        Buffer.isBuffer(data)) {
        if (!this._decoder) {
          var SD = require('string_decoder').StringDecoder;
          this._decoder = new SD('utf8');
        }
        data = this._decoder.write(data);
      }

      this._parser.write(data.toString());
      this.emit('data', data);
      return true
    };

    SAXStream.prototype.end = function (chunk) {
      if (chunk && chunk.length) {
        this.write(chunk);
      }
      this._parser.end();
      return true
    };

    SAXStream.prototype.on = function (ev, handler) {
      var me = this;
      if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
        me._parser['on' + ev] = function () {
          var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          args.splice(0, 0, ev);
          me.emit.apply(me, args);
        };
      }

      return Stream.prototype.on.call(me, ev, handler)
    };

    // this really needs to be replaced with character classes.
    // XML allows all manner of ridiculous numbers and digits.
    var CDATA = '[CDATA[';
    var DOCTYPE = 'DOCTYPE';
    var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
    var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
    var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };

    // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
    // This implementation works on strings, a single character at a time
    // as such, it cannot ever support astral-plane characters (10000-EFFFF)
    // without a significant breaking change to either this  parser, or the
    // JavaScript language.  Implementation of an emoji-capable xml parser
    // is left as an exercise for the reader.
    var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;

    var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

    var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

    function isWhitespace (c) {
      return c === ' ' || c === '\n' || c === '\r' || c === '\t'
    }

    function isQuote (c) {
      return c === '"' || c === '\''
    }

    function isAttribEnd (c) {
      return c === '>' || isWhitespace(c)
    }

    function isMatch (regex, c) {
      return regex.test(c)
    }

    function notMatch (regex, c) {
      return !isMatch(regex, c)
    }

    var S = 0;
    sax.STATE = {
      BEGIN: S++, // leading byte order mark or whitespace
      BEGIN_WHITESPACE: S++, // leading whitespace
      TEXT: S++, // general stuff
      TEXT_ENTITY: S++, // &amp and such.
      OPEN_WAKA: S++, // <
      SGML_DECL: S++, // <!BLARG
      SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
      DOCTYPE: S++, // <!DOCTYPE
      DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
      DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
      DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
      COMMENT_STARTING: S++, // <!-
      COMMENT: S++, // <!--
      COMMENT_ENDING: S++, // <!-- blah -
      COMMENT_ENDED: S++, // <!-- blah --
      CDATA: S++, // <![CDATA[ something
      CDATA_ENDING: S++, // ]
      CDATA_ENDING_2: S++, // ]]
      PROC_INST: S++, // <?hi
      PROC_INST_BODY: S++, // <?hi there
      PROC_INST_ENDING: S++, // <?hi "there" ?
      OPEN_TAG: S++, // <strong
      OPEN_TAG_SLASH: S++, // <strong /
      ATTRIB: S++, // <a
      ATTRIB_NAME: S++, // <a foo
      ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
      ATTRIB_VALUE: S++, // <a foo=
      ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
      ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
      ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
      ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
      ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
      CLOSE_TAG: S++, // </a
      CLOSE_TAG_SAW_WHITE: S++, // </a   >
      SCRIPT: S++, // <script> ...
      SCRIPT_ENDING: S++ // <script> ... <
    };

    sax.XML_ENTITIES = {
      'amp': '&',
      'gt': '>',
      'lt': '<',
      'quot': '"',
      'apos': "'"
    };

    sax.ENTITIES = {
      'amp': '&',
      'gt': '>',
      'lt': '<',
      'quot': '"',
      'apos': "'",
      'AElig': 198,
      'Aacute': 193,
      'Acirc': 194,
      'Agrave': 192,
      'Aring': 197,
      'Atilde': 195,
      'Auml': 196,
      'Ccedil': 199,
      'ETH': 208,
      'Eacute': 201,
      'Ecirc': 202,
      'Egrave': 200,
      'Euml': 203,
      'Iacute': 205,
      'Icirc': 206,
      'Igrave': 204,
      'Iuml': 207,
      'Ntilde': 209,
      'Oacute': 211,
      'Ocirc': 212,
      'Ograve': 210,
      'Oslash': 216,
      'Otilde': 213,
      'Ouml': 214,
      'THORN': 222,
      'Uacute': 218,
      'Ucirc': 219,
      'Ugrave': 217,
      'Uuml': 220,
      'Yacute': 221,
      'aacute': 225,
      'acirc': 226,
      'aelig': 230,
      'agrave': 224,
      'aring': 229,
      'atilde': 227,
      'auml': 228,
      'ccedil': 231,
      'eacute': 233,
      'ecirc': 234,
      'egrave': 232,
      'eth': 240,
      'euml': 235,
      'iacute': 237,
      'icirc': 238,
      'igrave': 236,
      'iuml': 239,
      'ntilde': 241,
      'oacute': 243,
      'ocirc': 244,
      'ograve': 242,
      'oslash': 248,
      'otilde': 245,
      'ouml': 246,
      'szlig': 223,
      'thorn': 254,
      'uacute': 250,
      'ucirc': 251,
      'ugrave': 249,
      'uuml': 252,
      'yacute': 253,
      'yuml': 255,
      'copy': 169,
      'reg': 174,
      'nbsp': 160,
      'iexcl': 161,
      'cent': 162,
      'pound': 163,
      'curren': 164,
      'yen': 165,
      'brvbar': 166,
      'sect': 167,
      'uml': 168,
      'ordf': 170,
      'laquo': 171,
      'not': 172,
      'shy': 173,
      'macr': 175,
      'deg': 176,
      'plusmn': 177,
      'sup1': 185,
      'sup2': 178,
      'sup3': 179,
      'acute': 180,
      'micro': 181,
      'para': 182,
      'middot': 183,
      'cedil': 184,
      'ordm': 186,
      'raquo': 187,
      'frac14': 188,
      'frac12': 189,
      'frac34': 190,
      'iquest': 191,
      'times': 215,
      'divide': 247,
      'OElig': 338,
      'oelig': 339,
      'Scaron': 352,
      'scaron': 353,
      'Yuml': 376,
      'fnof': 402,
      'circ': 710,
      'tilde': 732,
      'Alpha': 913,
      'Beta': 914,
      'Gamma': 915,
      'Delta': 916,
      'Epsilon': 917,
      'Zeta': 918,
      'Eta': 919,
      'Theta': 920,
      'Iota': 921,
      'Kappa': 922,
      'Lambda': 923,
      'Mu': 924,
      'Nu': 925,
      'Xi': 926,
      'Omicron': 927,
      'Pi': 928,
      'Rho': 929,
      'Sigma': 931,
      'Tau': 932,
      'Upsilon': 933,
      'Phi': 934,
      'Chi': 935,
      'Psi': 936,
      'Omega': 937,
      'alpha': 945,
      'beta': 946,
      'gamma': 947,
      'delta': 948,
      'epsilon': 949,
      'zeta': 950,
      'eta': 951,
      'theta': 952,
      'iota': 953,
      'kappa': 954,
      'lambda': 955,
      'mu': 956,
      'nu': 957,
      'xi': 958,
      'omicron': 959,
      'pi': 960,
      'rho': 961,
      'sigmaf': 962,
      'sigma': 963,
      'tau': 964,
      'upsilon': 965,
      'phi': 966,
      'chi': 967,
      'psi': 968,
      'omega': 969,
      'thetasym': 977,
      'upsih': 978,
      'piv': 982,
      'ensp': 8194,
      'emsp': 8195,
      'thinsp': 8201,
      'zwnj': 8204,
      'zwj': 8205,
      'lrm': 8206,
      'rlm': 8207,
      'ndash': 8211,
      'mdash': 8212,
      'lsquo': 8216,
      'rsquo': 8217,
      'sbquo': 8218,
      'ldquo': 8220,
      'rdquo': 8221,
      'bdquo': 8222,
      'dagger': 8224,
      'Dagger': 8225,
      'bull': 8226,
      'hellip': 8230,
      'permil': 8240,
      'prime': 8242,
      'Prime': 8243,
      'lsaquo': 8249,
      'rsaquo': 8250,
      'oline': 8254,
      'frasl': 8260,
      'euro': 8364,
      'image': 8465,
      'weierp': 8472,
      'real': 8476,
      'trade': 8482,
      'alefsym': 8501,
      'larr': 8592,
      'uarr': 8593,
      'rarr': 8594,
      'darr': 8595,
      'harr': 8596,
      'crarr': 8629,
      'lArr': 8656,
      'uArr': 8657,
      'rArr': 8658,
      'dArr': 8659,
      'hArr': 8660,
      'forall': 8704,
      'part': 8706,
      'exist': 8707,
      'empty': 8709,
      'nabla': 8711,
      'isin': 8712,
      'notin': 8713,
      'ni': 8715,
      'prod': 8719,
      'sum': 8721,
      'minus': 8722,
      'lowast': 8727,
      'radic': 8730,
      'prop': 8733,
      'infin': 8734,
      'ang': 8736,
      'and': 8743,
      'or': 8744,
      'cap': 8745,
      'cup': 8746,
      'int': 8747,
      'there4': 8756,
      'sim': 8764,
      'cong': 8773,
      'asymp': 8776,
      'ne': 8800,
      'equiv': 8801,
      'le': 8804,
      'ge': 8805,
      'sub': 8834,
      'sup': 8835,
      'nsub': 8836,
      'sube': 8838,
      'supe': 8839,
      'oplus': 8853,
      'otimes': 8855,
      'perp': 8869,
      'sdot': 8901,
      'lceil': 8968,
      'rceil': 8969,
      'lfloor': 8970,
      'rfloor': 8971,
      'lang': 9001,
      'rang': 9002,
      'loz': 9674,
      'spades': 9824,
      'clubs': 9827,
      'hearts': 9829,
      'diams': 9830
    };

    Object.keys(sax.ENTITIES).forEach(function (key) {
      var e = sax.ENTITIES[key];
      var s = typeof e === 'number' ? String.fromCharCode(e) : e;
      sax.ENTITIES[key] = s;
    });

    for (var s in sax.STATE) {
      sax.STATE[sax.STATE[s]] = s;
    }

    // shorthand
    S = sax.STATE;

    function emit (parser, event, data) {
      parser[event] && parser[event](data);
    }

    function emitNode (parser, nodeType, data) {
      if (parser.textNode) closeText(parser);
      emit(parser, nodeType, data);
    }

    function closeText (parser) {
      parser.textNode = textopts(parser.opt, parser.textNode);
      if (parser.textNode) emit(parser, 'ontext', parser.textNode);
      parser.textNode = '';
    }

    function textopts (opt, text) {
      if (opt.trim) text = text.trim();
      if (opt.normalize) text = text.replace(/\s+/g, ' ');
      return text
    }

    function error (parser, er) {
      closeText(parser);
      if (parser.trackPosition) {
        er += '\nLine: ' + parser.line +
          '\nColumn: ' + parser.column +
          '\nChar: ' + parser.c;
      }
      er = new Error(er);
      parser.error = er;
      emit(parser, 'onerror', er);
      return parser
    }

    function end (parser) {
      if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag');
      if ((parser.state !== S.BEGIN) &&
        (parser.state !== S.BEGIN_WHITESPACE) &&
        (parser.state !== S.TEXT)) {
        error(parser, 'Unexpected end');
      }
      closeText(parser);
      parser.c = '';
      parser.closed = true;
      emit(parser, 'onend');
      SAXParser.call(parser, parser.strict, parser.opt);
      return parser
    }

    function strictFail (parser, message) {
      if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
        throw new Error('bad call to strictFail')
      }
      if (parser.strict) {
        error(parser, message);
      }
    }

    function newTag (parser) {
      if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
      var parent = parser.tags[parser.tags.length - 1] || parser;
      var tag = parser.tag = { name: parser.tagName, attributes: {} };

      // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
      if (parser.opt.xmlns) {
        tag.ns = parent.ns;
      }
      parser.attribList.length = 0;
      emitNode(parser, 'onopentagstart', tag);
    }

    function qname (name, attribute) {
      var i = name.indexOf(':');
      var qualName = i < 0 ? [ '', name ] : name.split(':');
      var prefix = qualName[0];
      var local = qualName[1];

      // <x "xmlns"="http://foo">
      if (attribute && name === 'xmlns') {
        prefix = 'xmlns';
        local = '';
      }

      return { prefix: prefix, local: local }
    }

    function attrib (parser) {
      if (!parser.strict) {
        parser.attribName = parser.attribName[parser.looseCase]();
      }

      if (parser.attribList.indexOf(parser.attribName) !== -1 ||
        parser.tag.attributes.hasOwnProperty(parser.attribName)) {
        parser.attribName = parser.attribValue = '';
        return
      }

      if (parser.opt.xmlns) {
        var qn = qname(parser.attribName, true);
        var prefix = qn.prefix;
        var local = qn.local;

        if (prefix === 'xmlns') {
          // namespace binding attribute. push the binding into scope
          if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
            strictFail(parser,
              'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
              'Actual: ' + parser.attribValue);
          } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
            strictFail(parser,
              'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
              'Actual: ' + parser.attribValue);
          } else {
            var tag = parser.tag;
            var parent = parser.tags[parser.tags.length - 1] || parser;
            if (tag.ns === parent.ns) {
              tag.ns = Object.create(parent.ns);
            }
            tag.ns[local] = parser.attribValue;
          }
        }

        // defer onattribute events until all attributes have been seen
        // so any new bindings can take effect. preserve attribute order
        // so deferred events can be emitted in document order
        parser.attribList.push([parser.attribName, parser.attribValue]);
      } else {
        // in non-xmlns mode, we can emit the event right away
        parser.tag.attributes[parser.attribName] = parser.attribValue;
        emitNode(parser, 'onattribute', {
          name: parser.attribName,
          value: parser.attribValue
        });
      }

      parser.attribName = parser.attribValue = '';
    }

    function openTag (parser, selfClosing) {
      if (parser.opt.xmlns) {
        // emit namespace binding events
        var tag = parser.tag;

        // add namespace info to tag
        var qn = qname(parser.tagName);
        tag.prefix = qn.prefix;
        tag.local = qn.local;
        tag.uri = tag.ns[qn.prefix] || '';

        if (tag.prefix && !tag.uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(parser.tagName));
          tag.uri = qn.prefix;
        }

        var parent = parser.tags[parser.tags.length - 1] || parser;
        if (tag.ns && parent.ns !== tag.ns) {
          Object.keys(tag.ns).forEach(function (p) {
            emitNode(parser, 'onopennamespace', {
              prefix: p,
              uri: tag.ns[p]
            });
          });
        }

        // handle deferred onattribute events
        // Note: do not apply default ns to attributes:
        //   http://www.w3.org/TR/REC-xml-names/#defaulting
        for (var i = 0, l = parser.attribList.length; i < l; i++) {
          var nv = parser.attribList[i];
          var name = nv[0];
          var value = nv[1];
          var qualName = qname(name, true);
          var prefix = qualName.prefix;
          var local = qualName.local;
          var uri = prefix === '' ? '' : (tag.ns[prefix] || '');
          var a = {
            name: name,
            value: value,
            prefix: prefix,
            local: local,
            uri: uri
          };

          // if there's any attributes with an undefined namespace,
          // then fail on them now.
          if (prefix && prefix !== 'xmlns' && !uri) {
            strictFail(parser, 'Unbound namespace prefix: ' +
              JSON.stringify(prefix));
            a.uri = prefix;
          }
          parser.tag.attributes[name] = a;
          emitNode(parser, 'onattribute', a);
        }
        parser.attribList.length = 0;
      }

      parser.tag.isSelfClosing = !!selfClosing;

      // process the tag
      parser.sawRoot = true;
      parser.tags.push(parser.tag);
      emitNode(parser, 'onopentag', parser.tag);
      if (!selfClosing) {
        // special case for <script> in non-strict mode.
        if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
          parser.state = S.SCRIPT;
        } else {
          parser.state = S.TEXT;
        }
        parser.tag = null;
        parser.tagName = '';
      }
      parser.attribName = parser.attribValue = '';
      parser.attribList.length = 0;
    }

    function closeTag (parser) {
      if (!parser.tagName) {
        strictFail(parser, 'Weird empty close tag.');
        parser.textNode += '</>';
        parser.state = S.TEXT;
        return
      }

      if (parser.script) {
        if (parser.tagName !== 'script') {
          parser.script += '</' + parser.tagName + '>';
          parser.tagName = '';
          parser.state = S.SCRIPT;
          return
        }
        emitNode(parser, 'onscript', parser.script);
        parser.script = '';
      }

      // first make sure that the closing tag actually exists.
      // <a><b></c></b></a> will close everything, otherwise.
      var t = parser.tags.length;
      var tagName = parser.tagName;
      if (!parser.strict) {
        tagName = tagName[parser.looseCase]();
      }
      var closeTo = tagName;
      while (t--) {
        var close = parser.tags[t];
        if (close.name !== closeTo) {
          // fail the first time in strict mode
          strictFail(parser, 'Unexpected close tag');
        } else {
          break
        }
      }

      // didn't find it.  we already failed for strict, so just abort.
      if (t < 0) {
        strictFail(parser, 'Unmatched closing tag: ' + parser.tagName);
        parser.textNode += '</' + parser.tagName + '>';
        parser.state = S.TEXT;
        return
      }
      parser.tagName = tagName;
      var s = parser.tags.length;
      while (s-- > t) {
        var tag = parser.tag = parser.tags.pop();
        parser.tagName = parser.tag.name;
        emitNode(parser, 'onclosetag', parser.tagName);

        var x = {};
        for (var i in tag.ns) {
          x[i] = tag.ns[i];
        }

        var parent = parser.tags[parser.tags.length - 1] || parser;
        if (parser.opt.xmlns && tag.ns !== parent.ns) {
          // remove namespace bindings introduced by tag
          Object.keys(tag.ns).forEach(function (p) {
            var n = tag.ns[p];
            emitNode(parser, 'onclosenamespace', { prefix: p, uri: n });
          });
        }
      }
      if (t === 0) parser.closedRoot = true;
      parser.tagName = parser.attribValue = parser.attribName = '';
      parser.attribList.length = 0;
      parser.state = S.TEXT;
    }

    function parseEntity (parser) {
      var entity = parser.entity;
      var entityLC = entity.toLowerCase();
      var num;
      var numStr = '';

      if (parser.ENTITIES[entity]) {
        return parser.ENTITIES[entity]
      }
      if (parser.ENTITIES[entityLC]) {
        return parser.ENTITIES[entityLC]
      }
      entity = entityLC;
      if (entity.charAt(0) === '#') {
        if (entity.charAt(1) === 'x') {
          entity = entity.slice(2);
          num = parseInt(entity, 16);
          numStr = num.toString(16);
        } else {
          entity = entity.slice(1);
          num = parseInt(entity, 10);
          numStr = num.toString(10);
        }
      }
      entity = entity.replace(/^0+/, '');
      if (isNaN(num) || numStr.toLowerCase() !== entity) {
        strictFail(parser, 'Invalid character entity');
        return '&' + parser.entity + ';'
      }

      return String.fromCodePoint(num)
    }

    function beginWhiteSpace (parser, c) {
      if (c === '<') {
        parser.state = S.OPEN_WAKA;
        parser.startTagPosition = parser.position;
      } else if (!isWhitespace(c)) {
        // have to process this as a text node.
        // weird, but happens.
        strictFail(parser, 'Non-whitespace before first tag.');
        parser.textNode = c;
        parser.state = S.TEXT;
      }
    }

    function charAt (chunk, i) {
      var result = '';
      if (i < chunk.length) {
        result = chunk.charAt(i);
      }
      return result
    }

    function write (chunk) {
      var parser = this;
      if (this.error) {
        throw this.error
      }
      if (parser.closed) {
        return error(parser,
          'Cannot write after close. Assign an onready handler.')
      }
      if (chunk === null) {
        return end(parser)
      }
      if (typeof chunk === 'object') {
        chunk = chunk.toString();
      }
      var i = 0;
      var c = '';
      while (true) {
        c = charAt(chunk, i++);
        parser.c = c;

        if (!c) {
          break
        }

        if (parser.trackPosition) {
          parser.position++;
          if (c === '\n') {
            parser.line++;
            parser.column = 0;
          } else {
            parser.column++;
          }
        }

        switch (parser.state) {
          case S.BEGIN:
            parser.state = S.BEGIN_WHITESPACE;
            if (c === '\uFEFF') {
              continue
            }
            beginWhiteSpace(parser, c);
            continue

          case S.BEGIN_WHITESPACE:
            beginWhiteSpace(parser, c);
            continue

          case S.TEXT:
            if (parser.sawRoot && !parser.closedRoot) {
              var starti = i - 1;
              while (c && c !== '<' && c !== '&') {
                c = charAt(chunk, i++);
                if (c && parser.trackPosition) {
                  parser.position++;
                  if (c === '\n') {
                    parser.line++;
                    parser.column = 0;
                  } else {
                    parser.column++;
                  }
                }
              }
              parser.textNode += chunk.substring(starti, i - 1);
            }
            if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
              parser.state = S.OPEN_WAKA;
              parser.startTagPosition = parser.position;
            } else {
              if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
                strictFail(parser, 'Text data outside of root node.');
              }
              if (c === '&') {
                parser.state = S.TEXT_ENTITY;
              } else {
                parser.textNode += c;
              }
            }
            continue

          case S.SCRIPT:
            // only non-strict
            if (c === '<') {
              parser.state = S.SCRIPT_ENDING;
            } else {
              parser.script += c;
            }
            continue

          case S.SCRIPT_ENDING:
            if (c === '/') {
              parser.state = S.CLOSE_TAG;
            } else {
              parser.script += '<' + c;
              parser.state = S.SCRIPT;
            }
            continue

          case S.OPEN_WAKA:
            // either a /, ?, !, or text is coming next.
            if (c === '!') {
              parser.state = S.SGML_DECL;
              parser.sgmlDecl = '';
            } else if (isWhitespace(c)) ; else if (isMatch(nameStart, c)) {
              parser.state = S.OPEN_TAG;
              parser.tagName = c;
            } else if (c === '/') {
              parser.state = S.CLOSE_TAG;
              parser.tagName = '';
            } else if (c === '?') {
              parser.state = S.PROC_INST;
              parser.procInstName = parser.procInstBody = '';
            } else {
              strictFail(parser, 'Unencoded <');
              // if there was some whitespace, then add that in.
              if (parser.startTagPosition + 1 < parser.position) {
                var pad = parser.position - parser.startTagPosition;
                c = new Array(pad).join(' ') + c;
              }
              parser.textNode += '<' + c;
              parser.state = S.TEXT;
            }
            continue

          case S.SGML_DECL:
            if (parser.sgmlDecl + c === '--') {
              parser.state = S.COMMENT;
              parser.comment = '';
              parser.sgmlDecl = '';
              continue;
            }

            if (parser.doctype && parser.doctype !== true && parser.sgmlDecl) {
              parser.state = S.DOCTYPE_DTD;
              parser.doctype += '<!' + parser.sgmlDecl + c;
              parser.sgmlDecl = '';
            } else if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
              emitNode(parser, 'onopencdata');
              parser.state = S.CDATA;
              parser.sgmlDecl = '';
              parser.cdata = '';
            } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
              parser.state = S.DOCTYPE;
              if (parser.doctype || parser.sawRoot) {
                strictFail(parser,
                  'Inappropriately located doctype declaration');
              }
              parser.doctype = '';
              parser.sgmlDecl = '';
            } else if (c === '>') {
              emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl);
              parser.sgmlDecl = '';
              parser.state = S.TEXT;
            } else if (isQuote(c)) {
              parser.state = S.SGML_DECL_QUOTED;
              parser.sgmlDecl += c;
            } else {
              parser.sgmlDecl += c;
            }
            continue

          case S.SGML_DECL_QUOTED:
            if (c === parser.q) {
              parser.state = S.SGML_DECL;
              parser.q = '';
            }
            parser.sgmlDecl += c;
            continue

          case S.DOCTYPE:
            if (c === '>') {
              parser.state = S.TEXT;
              emitNode(parser, 'ondoctype', parser.doctype);
              parser.doctype = true; // just remember that we saw it.
            } else {
              parser.doctype += c;
              if (c === '[') {
                parser.state = S.DOCTYPE_DTD;
              } else if (isQuote(c)) {
                parser.state = S.DOCTYPE_QUOTED;
                parser.q = c;
              }
            }
            continue

          case S.DOCTYPE_QUOTED:
            parser.doctype += c;
            if (c === parser.q) {
              parser.q = '';
              parser.state = S.DOCTYPE;
            }
            continue

          case S.DOCTYPE_DTD:
            if (c === ']') {
              parser.doctype += c;
              parser.state = S.DOCTYPE;
            } else if (c === '<') {
              parser.state = S.OPEN_WAKA;
              parser.startTagPosition = parser.position;
            } else if (isQuote(c)) {
              parser.doctype += c;
              parser.state = S.DOCTYPE_DTD_QUOTED;
              parser.q = c;
            } else {
              parser.doctype += c;
            }
            continue

          case S.DOCTYPE_DTD_QUOTED:
            parser.doctype += c;
            if (c === parser.q) {
              parser.state = S.DOCTYPE_DTD;
              parser.q = '';
            }
            continue

          case S.COMMENT:
            if (c === '-') {
              parser.state = S.COMMENT_ENDING;
            } else {
              parser.comment += c;
            }
            continue

          case S.COMMENT_ENDING:
            if (c === '-') {
              parser.state = S.COMMENT_ENDED;
              parser.comment = textopts(parser.opt, parser.comment);
              if (parser.comment) {
                emitNode(parser, 'oncomment', parser.comment);
              }
              parser.comment = '';
            } else {
              parser.comment += '-' + c;
              parser.state = S.COMMENT;
            }
            continue

          case S.COMMENT_ENDED:
            if (c !== '>') {
              strictFail(parser, 'Malformed comment');
              // allow <!-- blah -- bloo --> in non-strict mode,
              // which is a comment of " blah -- bloo "
              parser.comment += '--' + c;
              parser.state = S.COMMENT;
            } else if (parser.doctype && parser.doctype !== true) {
              parser.state = S.DOCTYPE_DTD;
            } else {
              parser.state = S.TEXT;
            }
            continue

          case S.CDATA:
            if (c === ']') {
              parser.state = S.CDATA_ENDING;
            } else {
              parser.cdata += c;
            }
            continue

          case S.CDATA_ENDING:
            if (c === ']') {
              parser.state = S.CDATA_ENDING_2;
            } else {
              parser.cdata += ']' + c;
              parser.state = S.CDATA;
            }
            continue

          case S.CDATA_ENDING_2:
            if (c === '>') {
              if (parser.cdata) {
                emitNode(parser, 'oncdata', parser.cdata);
              }
              emitNode(parser, 'onclosecdata');
              parser.cdata = '';
              parser.state = S.TEXT;
            } else if (c === ']') {
              parser.cdata += ']';
            } else {
              parser.cdata += ']]' + c;
              parser.state = S.CDATA;
            }
            continue

          case S.PROC_INST:
            if (c === '?') {
              parser.state = S.PROC_INST_ENDING;
            } else if (isWhitespace(c)) {
              parser.state = S.PROC_INST_BODY;
            } else {
              parser.procInstName += c;
            }
            continue

          case S.PROC_INST_BODY:
            if (!parser.procInstBody && isWhitespace(c)) {
              continue
            } else if (c === '?') {
              parser.state = S.PROC_INST_ENDING;
            } else {
              parser.procInstBody += c;
            }
            continue

          case S.PROC_INST_ENDING:
            if (c === '>') {
              emitNode(parser, 'onprocessinginstruction', {
                name: parser.procInstName,
                body: parser.procInstBody
              });
              parser.procInstName = parser.procInstBody = '';
              parser.state = S.TEXT;
            } else {
              parser.procInstBody += '?' + c;
              parser.state = S.PROC_INST_BODY;
            }
            continue

          case S.OPEN_TAG:
            if (isMatch(nameBody, c)) {
              parser.tagName += c;
            } else {
              newTag(parser);
              if (c === '>') {
                openTag(parser);
              } else if (c === '/') {
                parser.state = S.OPEN_TAG_SLASH;
              } else {
                if (!isWhitespace(c)) {
                  strictFail(parser, 'Invalid character in tag name');
                }
                parser.state = S.ATTRIB;
              }
            }
            continue

          case S.OPEN_TAG_SLASH:
            if (c === '>') {
              openTag(parser, true);
              closeTag(parser);
            } else {
              strictFail(parser, 'Forward-slash in opening tag not followed by >');
              parser.state = S.ATTRIB;
            }
            continue

          case S.ATTRIB:
            // haven't read the attribute name yet.
            if (isWhitespace(c)) {
              continue
            } else if (c === '>') {
              openTag(parser);
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH;
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c;
              parser.attribValue = '';
              parser.state = S.ATTRIB_NAME;
            } else {
              strictFail(parser, 'Invalid attribute name');
            }
            continue

          case S.ATTRIB_NAME:
            if (c === '=') {
              parser.state = S.ATTRIB_VALUE;
            } else if (c === '>') {
              strictFail(parser, 'Attribute without value');
              parser.attribValue = parser.attribName;
              attrib(parser);
              openTag(parser);
            } else if (isWhitespace(c)) {
              parser.state = S.ATTRIB_NAME_SAW_WHITE;
            } else if (isMatch(nameBody, c)) {
              parser.attribName += c;
            } else {
              strictFail(parser, 'Invalid attribute name');
            }
            continue

          case S.ATTRIB_NAME_SAW_WHITE:
            if (c === '=') {
              parser.state = S.ATTRIB_VALUE;
            } else if (isWhitespace(c)) {
              continue
            } else {
              strictFail(parser, 'Attribute without value');
              parser.tag.attributes[parser.attribName] = '';
              parser.attribValue = '';
              emitNode(parser, 'onattribute', {
                name: parser.attribName,
                value: ''
              });
              parser.attribName = '';
              if (c === '>') {
                openTag(parser);
              } else if (isMatch(nameStart, c)) {
                parser.attribName = c;
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, 'Invalid attribute name');
                parser.state = S.ATTRIB;
              }
            }
            continue

          case S.ATTRIB_VALUE:
            if (isWhitespace(c)) {
              continue
            } else if (isQuote(c)) {
              parser.q = c;
              parser.state = S.ATTRIB_VALUE_QUOTED;
            } else {
              if (!parser.opt.unquotedAttributeValues) {
                error(parser, 'Unquoted attribute value');
              }
              parser.state = S.ATTRIB_VALUE_UNQUOTED;
              parser.attribValue = c;
            }
            continue

          case S.ATTRIB_VALUE_QUOTED:
            if (c !== parser.q) {
              if (c === '&') {
                parser.state = S.ATTRIB_VALUE_ENTITY_Q;
              } else {
                parser.attribValue += c;
              }
              continue
            }
            attrib(parser);
            parser.q = '';
            parser.state = S.ATTRIB_VALUE_CLOSED;
            continue

          case S.ATTRIB_VALUE_CLOSED:
            if (isWhitespace(c)) {
              parser.state = S.ATTRIB;
            } else if (c === '>') {
              openTag(parser);
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH;
            } else if (isMatch(nameStart, c)) {
              strictFail(parser, 'No whitespace between attributes');
              parser.attribName = c;
              parser.attribValue = '';
              parser.state = S.ATTRIB_NAME;
            } else {
              strictFail(parser, 'Invalid attribute name');
            }
            continue

          case S.ATTRIB_VALUE_UNQUOTED:
            if (!isAttribEnd(c)) {
              if (c === '&') {
                parser.state = S.ATTRIB_VALUE_ENTITY_U;
              } else {
                parser.attribValue += c;
              }
              continue
            }
            attrib(parser);
            if (c === '>') {
              openTag(parser);
            } else {
              parser.state = S.ATTRIB;
            }
            continue

          case S.CLOSE_TAG:
            if (!parser.tagName) {
              if (isWhitespace(c)) {
                continue
              } else if (notMatch(nameStart, c)) {
                if (parser.script) {
                  parser.script += '</' + c;
                  parser.state = S.SCRIPT;
                } else {
                  strictFail(parser, 'Invalid tagname in closing tag.');
                }
              } else {
                parser.tagName = c;
              }
            } else if (c === '>') {
              closeTag(parser);
            } else if (isMatch(nameBody, c)) {
              parser.tagName += c;
            } else if (parser.script) {
              parser.script += '</' + parser.tagName;
              parser.tagName = '';
              parser.state = S.SCRIPT;
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid tagname in closing tag');
              }
              parser.state = S.CLOSE_TAG_SAW_WHITE;
            }
            continue

          case S.CLOSE_TAG_SAW_WHITE:
            if (isWhitespace(c)) {
              continue
            }
            if (c === '>') {
              closeTag(parser);
            } else {
              strictFail(parser, 'Invalid characters in closing tag');
            }
            continue

          case S.TEXT_ENTITY:
          case S.ATTRIB_VALUE_ENTITY_Q:
          case S.ATTRIB_VALUE_ENTITY_U:
            var returnState;
            var buffer;
            switch (parser.state) {
              case S.TEXT_ENTITY:
                returnState = S.TEXT;
                buffer = 'textNode';
                break

              case S.ATTRIB_VALUE_ENTITY_Q:
                returnState = S.ATTRIB_VALUE_QUOTED;
                buffer = 'attribValue';
                break

              case S.ATTRIB_VALUE_ENTITY_U:
                returnState = S.ATTRIB_VALUE_UNQUOTED;
                buffer = 'attribValue';
                break
            }

            if (c === ';') {
              var parsedEntity = parseEntity(parser);
              if (parser.opt.unparsedEntities && !Object.values(sax.XML_ENTITIES).includes(parsedEntity)) {
                parser.entity = '';
                parser.state = returnState;
                parser.write(parsedEntity);
              } else {
                parser[buffer] += parsedEntity;
                parser.entity = '';
                parser.state = returnState;
              }
            } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
              parser.entity += c;
            } else {
              strictFail(parser, 'Invalid character in entity name');
              parser[buffer] += '&' + parser.entity + c;
              parser.entity = '';
              parser.state = returnState;
            }

            continue

          default: /* istanbul ignore next */ {
            throw new Error(parser, 'Unknown state: ' + parser.state)
          }
        }
      } // while

      if (parser.position >= parser.bufferCheckPosition) {
        checkBufferLength(parser);
      }
      return parser
    }

    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    /* istanbul ignore next */
    if (!String.fromCodePoint) {
      (function () {
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;
        var fromCodePoint = function () {
          var MAX_SIZE = 0x4000;
          var codeUnits = [];
          var highSurrogate;
          var lowSurrogate;
          var index = -1;
          var length = arguments.length;
          if (!length) {
            return ''
          }
          var result = '';
          while (++index < length) {
            var codePoint = Number(arguments[index]);
            if (
              !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
              codePoint < 0 || // not a valid Unicode code point
              codePoint > 0x10FFFF || // not a valid Unicode code point
              floor(codePoint) !== codePoint // not an integer
            ) {
              throw RangeError('Invalid code point: ' + codePoint)
            }
            if (codePoint <= 0xFFFF) { // BMP code point
              codeUnits.push(codePoint);
            } else { // Astral code point; split in surrogate halves
              // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
              codePoint -= 0x10000;
              highSurrogate = (codePoint >> 10) + 0xD800;
              lowSurrogate = (codePoint % 0x400) + 0xDC00;
              codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
              result += stringFromCharCode.apply(null, codeUnits);
              codeUnits.length = 0;
            }
          }
          return result
        };
        /* istanbul ignore next */
        if (Object.defineProperty) {
          Object.defineProperty(String, 'fromCodePoint', {
            value: fromCodePoint,
            configurable: true,
            writable: true
          });
        } else {
          String.fromCodePoint = fromCodePoint;
        }
      }());
    }
  })(typeof exports === 'undefined' ? undefined.sax = {} : exports);

  var sax = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  var require$$0 = /*@__PURE__*/getAugmentedNamespace(sax);

  var domain;

  // This constructor is used to store event handlers. Instantiating this is
  // faster than explicitly calling `Object.create(null)` to get a "clean" empty
  // object (tested with v8 v4.9).
  function EventHandlers() {}
  EventHandlers.prototype = Object.create(null);

  function EventEmitter() {
    EventEmitter.init.call(this);
  }

  // nodejs oddity
  // require('events') === require('events').EventEmitter
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.usingDomains = false;

  EventEmitter.prototype.domain = undefined;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  EventEmitter.defaultMaxListeners = 10;

  EventEmitter.init = function() {
    this.domain = null;
    if (EventEmitter.usingDomains) {
      // if there is an active domain, then attach to it.
      if (domain.active && !(this instanceof domain.Domain)) {
        this.domain = domain.active;
      }
    }

    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n))
      throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
  };

  function $getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
  };

  // These standalone emit* functions are used to optimize calling of event
  // handlers for fast cases because emit() itself often has a variable number of
  // arguments and can be deoptimized because of that. These functions always have
  // the same number of arguments and thus do not get deoptimized, so the code
  // inside them can execute faster.
  function emitNone(handler, isFn, self) {
    if (isFn)
      handler.call(self);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self);
    }
  }
  function emitOne(handler, isFn, self, arg1) {
    if (isFn)
      handler.call(self, arg1);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1);
    }
  }
  function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn)
      handler.call(self, arg1, arg2);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2);
    }
  }
  function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn)
      handler.call(self, arg1, arg2, arg3);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2, arg3);
    }
  }

  function emitMany(handler, isFn, self, args) {
    if (isFn)
      handler.apply(self, args);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].apply(self, args);
    }
  }

  EventEmitter.prototype.emit = function emit(type) {
    var er, handler, len, args, i, events, domain;
    var doError = (type === 'error');

    events = this._events;
    if (events)
      doError = (doError && events.error == null);
    else if (!doError)
      return false;

    domain = this.domain;

    // If there is no 'error' event listener then throw.
    if (doError) {
      er = arguments[1];
      if (domain) {
        if (!er)
          er = new Error('Uncaught, unspecified "error" event');
        er.domainEmitter = this;
        er.domain = domain;
        er.domainThrown = false;
        domain.emit('error', er);
      } else if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
      return false;
    }

    handler = events[type];

    if (!handler)
      return false;

    var isFn = typeof handler === 'function';
    len = arguments.length;
    switch (len) {
      // fast cases
      case 1:
        emitNone(handler, isFn, this);
        break;
      case 2:
        emitOne(handler, isFn, this, arguments[1]);
        break;
      case 3:
        emitTwo(handler, isFn, this, arguments[1], arguments[2]);
        break;
      case 4:
        emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
        break;
      // slower
      default:
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        emitMany(handler, isFn, this, args);
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');

    events = target._events;
    if (!events) {
      events = target._events = new EventHandlers();
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (!existing) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] = prepend ? [listener, existing] :
                                            [existing, listener];
      } else {
        // If we've already got an array, just append.
        if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
      }

      // Check for listener leak
      if (!existing.warned) {
        m = $getMaxListeners(target);
        if (m && m > 0 && existing.length > m) {
          existing.warned = true;
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + type + ' listeners added. ' +
                              'Use emitter.setMaxListeners() to increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          emitWarning(w);
        }
      }
    }

    return target;
  }
  function emitWarning(e) {
    typeof console.warn === 'function' ? console.warn(e) : console.log(e);
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');

        events = this._events;
        if (!events)
          return this;

        list = events[type];
        if (!list)
          return this;

        if (list === listener || (list.listener && list.listener === listener)) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length; i-- > 0;) {
            if (list[i] === listener ||
                (list[i].listener && list[i].listener === listener)) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (list.length === 1) {
            list[0] = undefined;
            if (--this._eventsCount === 0) {
              this._events = new EventHandlers();
              return this;
            } else {
              delete events[type];
            }
          } else {
            spliceOne(list, position);
          }

          if (events.removeListener)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };
      
  // Alias for removeListener added in NodeJS 10.0
  // https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
  EventEmitter.prototype.off = function(type, listener){
      return this.removeListener(type, listener);
  };

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events;

        events = this._events;
        if (!events)
          return this;

        // not listening for removeListener, no need to emit
        if (!events.removeListener) {
          if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          } else if (events[type]) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = new EventHandlers();
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          do {
            this.removeListener(type, listeners[listeners.length - 1]);
          } while (listeners[0]);
        }

        return this;
      };

  EventEmitter.prototype.listeners = function listeners(type) {
    var evlistener;
    var ret;
    var events = this._events;

    if (!events)
      ret = [];
    else {
      evlistener = events[type];
      if (!evlistener)
        ret = [];
      else if (typeof evlistener === 'function')
        ret = [evlistener.listener || evlistener];
      else
        ret = unwrapListeners(evlistener);
    }

    return ret;
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;

    if (events) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  };

  // About 1.5x faster than the two-arg version of Array#splice().
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
      list[i] = list[k];
    list.pop();
  }

  function arrayClone(arr, i) {
    var copy = new Array(i);
    while (i--)
      copy[i] = arr[i];
    return copy;
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  var _polyfillNode_events = /*#__PURE__*/Object.freeze({
    __proto__: null,
    EventEmitter: EventEmitter,
    default: EventEmitter
  });

  var require$$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_events);

  var bom = {};

  var hasRequiredBom;

  function requireBom () {
  	if (hasRequiredBom) return bom;
  	hasRequiredBom = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  bom.stripBOM = function(str) {
  	    if (str[0] === '\uFEFF') {
  	      return str.substring(1);
  	    } else {
  	      return str;
  	    }
  	  };

  	}).call(bom);
  	return bom;
  }

  var processors = {};

  var hasRequiredProcessors;

  function requireProcessors () {
  	if (hasRequiredProcessors) return processors;
  	hasRequiredProcessors = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var prefixMatch;

  	  prefixMatch = new RegExp(/(?!xmlns)^.*:/);

  	  processors.normalize = function(str) {
  	    return str.toLowerCase();
  	  };

  	  processors.firstCharLowerCase = function(str) {
  	    return str.charAt(0).toLowerCase() + str.slice(1);
  	  };

  	  processors.stripPrefix = function(str) {
  	    return str.replace(prefixMatch, '');
  	  };

  	  processors.parseNumbers = function(str) {
  	    if (!isNaN(str)) {
  	      str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
  	    }
  	    return str;
  	  };

  	  processors.parseBooleans = function(str) {
  	    if (/^(?:true|false)$/i.test(str)) {
  	      str = str.toLowerCase() === 'true';
  	    }
  	    return str;
  	  };

  	}).call(processors);
  	return processors;
  }

  /*
  MIT Licence
  Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola
  https://github.com/YuzuJS/setImmediate/blob/f1ccbfdf09cb93aadf77c4aa749ea554503b9234/LICENSE.txt
  */

  var nextHandle = 1; // Spec says greater than zero
  var tasksByHandle = {};
  var currentlyRunningATask = false;
  var doc = global$1.document;
  var registerImmediate;

  function setImmediate$1(callback) {
    // Callback can either be a function or a string
    if (typeof callback !== "function") {
      callback = new Function("" + callback);
    }
    // Copy function arguments
    var args = new Array(arguments.length - 1);
    for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i + 1];
    }
    // Store and register the task
    var task = { callback: callback, args: args };
    tasksByHandle[nextHandle] = task;
    registerImmediate(nextHandle);
    return nextHandle++;
  }

  function clearImmediate(handle) {
      delete tasksByHandle[handle];
  }

  function run(task) {
      var callback = task.callback;
      var args = task.args;
      switch (args.length) {
      case 0:
          callback();
          break;
      case 1:
          callback(args[0]);
          break;
      case 2:
          callback(args[0], args[1]);
          break;
      case 3:
          callback(args[0], args[1], args[2]);
          break;
      default:
          callback.apply(undefined, args);
          break;
      }
  }

  function runIfPresent(handle) {
      // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
      // So if we're currently running a task, we'll need to delay this invocation.
      if (currentlyRunningATask) {
          // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
          // "too much recursion" error.
          setTimeout(runIfPresent, 0, handle);
      } else {
          var task = tasksByHandle[handle];
          if (task) {
              currentlyRunningATask = true;
              try {
                  run(task);
              } finally {
                  clearImmediate(handle);
                  currentlyRunningATask = false;
              }
          }
      }
  }

  function installNextTickImplementation() {
      registerImmediate = function(handle) {
          browser$1$1.nextTick(function () { runIfPresent(handle); });
      };
  }

  function canUsePostMessage() {
      // The test against `importScripts` prevents this implementation from being installed inside a web worker,
      // where `global.postMessage` means something completely different and can't be used for this purpose.
      if (global$1.postMessage && !global$1.importScripts) {
          var postMessageIsAsynchronous = true;
          var oldOnMessage = global$1.onmessage;
          global$1.onmessage = function() {
              postMessageIsAsynchronous = false;
          };
          global$1.postMessage("", "*");
          global$1.onmessage = oldOnMessage;
          return postMessageIsAsynchronous;
      }
  }

  function installPostMessageImplementation() {
      // Installs an event handler on `global` for the `message` event: see
      // * https://developer.mozilla.org/en/DOM/window.postMessage
      // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

      var messagePrefix = "setImmediate$" + Math.random() + "$";
      var onGlobalMessage = function(event) {
          if (event.source === global$1 &&
              typeof event.data === "string" &&
              event.data.indexOf(messagePrefix) === 0) {
              runIfPresent(+event.data.slice(messagePrefix.length));
          }
      };

      if (global$1.addEventListener) {
          global$1.addEventListener("message", onGlobalMessage, false);
      } else {
          global$1.attachEvent("onmessage", onGlobalMessage);
      }

      registerImmediate = function(handle) {
          global$1.postMessage(messagePrefix + handle, "*");
      };
  }

  function installMessageChannelImplementation() {
      var channel = new MessageChannel();
      channel.port1.onmessage = function(event) {
          var handle = event.data;
          runIfPresent(handle);
      };

      registerImmediate = function(handle) {
          channel.port2.postMessage(handle);
      };
  }

  function installReadyStateChangeImplementation() {
      var html = doc.documentElement;
      registerImmediate = function(handle) {
          // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
          // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
          var script = doc.createElement("script");
          script.onreadystatechange = function () {
              runIfPresent(handle);
              script.onreadystatechange = null;
              html.removeChild(script);
              script = null;
          };
          html.appendChild(script);
      };
  }

  function installSetTimeoutImplementation() {
      registerImmediate = function(handle) {
          setTimeout(runIfPresent, 0, handle);
      };
  }

  // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
  var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global$1);
  attachTo = attachTo && attachTo.setTimeout ? attachTo : global$1;

  // Don't get fooled by e.g. browserify environments.
  if ({}.toString.call(global$1.process) === "[object process]") {
      // For Node.js before 0.9
      installNextTickImplementation();

  } else if (canUsePostMessage()) {
      // For non-IE10 modern browsers
      installPostMessageImplementation();

  } else if (global$1.MessageChannel) {
      // For web workers, where supported
      installMessageChannelImplementation();

  } else if (doc && "onreadystatechange" in doc.createElement("script")) {
      // For IE 6–8
      installReadyStateChangeImplementation();

  } else {
      // For older browsers
      installSetTimeoutImplementation();
  }

  // DOM APIs, for completeness
  var apply = Function.prototype.apply;

  function clearInterval(timeout) {
    if (typeof timeout === 'number' && typeof global$1.clearInterval === 'function') {
      global$1.clearInterval(timeout);
    } else {
      clearFn(timeout);
    }
  }
  function clearTimeout$1(timeout) {
    if (typeof timeout === 'number' && typeof global$1.clearTimeout === 'function') {
      global$1.clearTimeout(timeout);
    } else {
      clearFn(timeout);
    }
  }
  function clearFn(timeout) {
    if (timeout && typeof timeout.close === 'function') {
      timeout.close();
    }
  }
  function setTimeout$1() {
    return new Timeout(apply.call(global$1.setTimeout, window, arguments));
  }
  function setInterval() {
    return new Timeout(apply.call(global$1.setInterval, window, arguments));
  }

  function Timeout(id) {
    this._id = id;
  }
  Timeout.prototype.unref = Timeout.prototype.ref = function() {};
  Timeout.prototype.close = function() {
    clearFn(this._id);
  };

  // Does not start the time, just sets up the members needed.
  function enroll(item, msecs) {
    clearTimeout$1(item._idleTimeoutId);
    item._idleTimeout = msecs;
  }

  function unenroll(item) {
    clearTimeout$1(item._idleTimeoutId);
    item._idleTimeout = -1;
  }
  var _unrefActive = active;
  function active(item) {
    clearTimeout$1(item._idleTimeoutId);

    var msecs = item._idleTimeout;
    if (msecs >= 0) {
      item._idleTimeoutId = setTimeout$1(function onTimeout() {
        if (item._onTimeout)
          item._onTimeout();
      }, msecs);
    }
  }

  var _polyfillNode_timers = {
    setImmediate: setImmediate$1,
    clearImmediate: clearImmediate,
    setTimeout: setTimeout$1,
    clearTimeout: clearTimeout$1,
    setInterval: setInterval,
    clearInterval: clearInterval,
    active: active,
    unenroll: unenroll,
    _unrefActive: _unrefActive,
    enroll: enroll
  };

  var _polyfillNode_timers$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    _unrefActive: _unrefActive,
    active: active,
    clearImmediate: clearImmediate,
    clearInterval: clearInterval,
    clearTimeout: clearTimeout$1,
    default: _polyfillNode_timers,
    enroll: enroll,
    setImmediate: setImmediate$1,
    setInterval: setInterval,
    setTimeout: setTimeout$1,
    unenroll: unenroll
  });

  var require$$4 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_timers$1);

  var hasRequiredParser;

  function requireParser () {
  	if (hasRequiredParser) return parser;
  	hasRequiredParser = 1;
  	(function (exports) {
  		// Generated by CoffeeScript 1.12.7
  		(function() {
  		  var bom, defaults, defineProperty, events, isEmpty, processItem, processors, sax, setImmediate,
  		    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  		    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  		    hasProp = {}.hasOwnProperty;

  		  sax = require$$0;

  		  events = require$$1;

  		  bom = requireBom();

  		  processors = requireProcessors();

  		  setImmediate = require$$4.setImmediate;

  		  defaults = requireDefaults().defaults;

  		  isEmpty = function(thing) {
  		    return typeof thing === "object" && (thing != null) && Object.keys(thing).length === 0;
  		  };

  		  processItem = function(processors, item, key) {
  		    var i, len, process;
  		    for (i = 0, len = processors.length; i < len; i++) {
  		      process = processors[i];
  		      item = process(item, key);
  		    }
  		    return item;
  		  };

  		  defineProperty = function(obj, key, value) {
  		    var descriptor;
  		    descriptor = Object.create(null);
  		    descriptor.value = value;
  		    descriptor.writable = true;
  		    descriptor.enumerable = true;
  		    descriptor.configurable = true;
  		    return Object.defineProperty(obj, key, descriptor);
  		  };

  		  exports.Parser = (function(superClass) {
  		    extend(Parser, superClass);

  		    function Parser(opts) {
  		      this.parseStringPromise = bind(this.parseStringPromise, this);
  		      this.parseString = bind(this.parseString, this);
  		      this.reset = bind(this.reset, this);
  		      this.assignOrPush = bind(this.assignOrPush, this);
  		      this.processAsync = bind(this.processAsync, this);
  		      var key, ref, value;
  		      if (!(this instanceof exports.Parser)) {
  		        return new exports.Parser(opts);
  		      }
  		      this.options = {};
  		      ref = defaults["0.2"];
  		      for (key in ref) {
  		        if (!hasProp.call(ref, key)) continue;
  		        value = ref[key];
  		        this.options[key] = value;
  		      }
  		      for (key in opts) {
  		        if (!hasProp.call(opts, key)) continue;
  		        value = opts[key];
  		        this.options[key] = value;
  		      }
  		      if (this.options.xmlns) {
  		        this.options.xmlnskey = this.options.attrkey + "ns";
  		      }
  		      if (this.options.normalizeTags) {
  		        if (!this.options.tagNameProcessors) {
  		          this.options.tagNameProcessors = [];
  		        }
  		        this.options.tagNameProcessors.unshift(processors.normalize);
  		      }
  		      this.reset();
  		    }

  		    Parser.prototype.processAsync = function() {
  		      var chunk, err;
  		      try {
  		        if (this.remaining.length <= this.options.chunkSize) {
  		          chunk = this.remaining;
  		          this.remaining = '';
  		          this.saxParser = this.saxParser.write(chunk);
  		          return this.saxParser.close();
  		        } else {
  		          chunk = this.remaining.substr(0, this.options.chunkSize);
  		          this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
  		          this.saxParser = this.saxParser.write(chunk);
  		          return setImmediate(this.processAsync);
  		        }
  		      } catch (error1) {
  		        err = error1;
  		        if (!this.saxParser.errThrown) {
  		          this.saxParser.errThrown = true;
  		          return this.emit(err);
  		        }
  		      }
  		    };

  		    Parser.prototype.assignOrPush = function(obj, key, newValue) {
  		      if (!(key in obj)) {
  		        if (!this.options.explicitArray) {
  		          return defineProperty(obj, key, newValue);
  		        } else {
  		          return defineProperty(obj, key, [newValue]);
  		        }
  		      } else {
  		        if (!(obj[key] instanceof Array)) {
  		          defineProperty(obj, key, [obj[key]]);
  		        }
  		        return obj[key].push(newValue);
  		      }
  		    };

  		    Parser.prototype.reset = function() {
  		      var attrkey, charkey, ontext, stack;
  		      this.removeAllListeners();
  		      this.saxParser = sax.parser(this.options.strict, {
  		        trim: false,
  		        normalize: false,
  		        xmlns: this.options.xmlns
  		      });
  		      this.saxParser.errThrown = false;
  		      this.saxParser.onerror = (function(_this) {
  		        return function(error) {
  		          _this.saxParser.resume();
  		          if (!_this.saxParser.errThrown) {
  		            _this.saxParser.errThrown = true;
  		            return _this.emit("error", error);
  		          }
  		        };
  		      })(this);
  		      this.saxParser.onend = (function(_this) {
  		        return function() {
  		          if (!_this.saxParser.ended) {
  		            _this.saxParser.ended = true;
  		            return _this.emit("end", _this.resultObject);
  		          }
  		        };
  		      })(this);
  		      this.saxParser.ended = false;
  		      this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
  		      this.resultObject = null;
  		      stack = [];
  		      attrkey = this.options.attrkey;
  		      charkey = this.options.charkey;
  		      this.saxParser.onopentag = (function(_this) {
  		        return function(node) {
  		          var key, newValue, obj, processedKey, ref;
  		          obj = {};
  		          obj[charkey] = "";
  		          if (!_this.options.ignoreAttrs) {
  		            ref = node.attributes;
  		            for (key in ref) {
  		              if (!hasProp.call(ref, key)) continue;
  		              if (!(attrkey in obj) && !_this.options.mergeAttrs) {
  		                obj[attrkey] = {};
  		              }
  		              newValue = _this.options.attrValueProcessors ? processItem(_this.options.attrValueProcessors, node.attributes[key], key) : node.attributes[key];
  		              processedKey = _this.options.attrNameProcessors ? processItem(_this.options.attrNameProcessors, key) : key;
  		              if (_this.options.mergeAttrs) {
  		                _this.assignOrPush(obj, processedKey, newValue);
  		              } else {
  		                defineProperty(obj[attrkey], processedKey, newValue);
  		              }
  		            }
  		          }
  		          obj["#name"] = _this.options.tagNameProcessors ? processItem(_this.options.tagNameProcessors, node.name) : node.name;
  		          if (_this.options.xmlns) {
  		            obj[_this.options.xmlnskey] = {
  		              uri: node.uri,
  		              local: node.local
  		            };
  		          }
  		          return stack.push(obj);
  		        };
  		      })(this);
  		      this.saxParser.onclosetag = (function(_this) {
  		        return function() {
  		          var cdata, emptyStr, key, node, nodeName, obj, objClone, old, s, xpath;
  		          obj = stack.pop();
  		          nodeName = obj["#name"];
  		          if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
  		            delete obj["#name"];
  		          }
  		          if (obj.cdata === true) {
  		            cdata = obj.cdata;
  		            delete obj.cdata;
  		          }
  		          s = stack[stack.length - 1];
  		          if (obj[charkey].match(/^\s*$/) && !cdata) {
  		            emptyStr = obj[charkey];
  		            delete obj[charkey];
  		          } else {
  		            if (_this.options.trim) {
  		              obj[charkey] = obj[charkey].trim();
  		            }
  		            if (_this.options.normalize) {
  		              obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim();
  		            }
  		            obj[charkey] = _this.options.valueProcessors ? processItem(_this.options.valueProcessors, obj[charkey], nodeName) : obj[charkey];
  		            if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
  		              obj = obj[charkey];
  		            }
  		          }
  		          if (isEmpty(obj)) {
  		            if (typeof _this.options.emptyTag === 'function') {
  		              obj = _this.options.emptyTag();
  		            } else {
  		              obj = _this.options.emptyTag !== '' ? _this.options.emptyTag : emptyStr;
  		            }
  		          }
  		          if (_this.options.validator != null) {
  		            xpath = "/" + ((function() {
  		              var i, len, results;
  		              results = [];
  		              for (i = 0, len = stack.length; i < len; i++) {
  		                node = stack[i];
  		                results.push(node["#name"]);
  		              }
  		              return results;
  		            })()).concat(nodeName).join("/");
  		            (function() {
  		              var err;
  		              try {
  		                return obj = _this.options.validator(xpath, s && s[nodeName], obj);
  		              } catch (error1) {
  		                err = error1;
  		                return _this.emit("error", err);
  		              }
  		            })();
  		          }
  		          if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === 'object') {
  		            if (!_this.options.preserveChildrenOrder) {
  		              node = {};
  		              if (_this.options.attrkey in obj) {
  		                node[_this.options.attrkey] = obj[_this.options.attrkey];
  		                delete obj[_this.options.attrkey];
  		              }
  		              if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
  		                node[_this.options.charkey] = obj[_this.options.charkey];
  		                delete obj[_this.options.charkey];
  		              }
  		              if (Object.getOwnPropertyNames(obj).length > 0) {
  		                node[_this.options.childkey] = obj;
  		              }
  		              obj = node;
  		            } else if (s) {
  		              s[_this.options.childkey] = s[_this.options.childkey] || [];
  		              objClone = {};
  		              for (key in obj) {
  		                if (!hasProp.call(obj, key)) continue;
  		                defineProperty(objClone, key, obj[key]);
  		              }
  		              s[_this.options.childkey].push(objClone);
  		              delete obj["#name"];
  		              if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
  		                obj = obj[charkey];
  		              }
  		            }
  		          }
  		          if (stack.length > 0) {
  		            return _this.assignOrPush(s, nodeName, obj);
  		          } else {
  		            if (_this.options.explicitRoot) {
  		              old = obj;
  		              obj = {};
  		              defineProperty(obj, nodeName, old);
  		            }
  		            _this.resultObject = obj;
  		            _this.saxParser.ended = true;
  		            return _this.emit("end", _this.resultObject);
  		          }
  		        };
  		      })(this);
  		      ontext = (function(_this) {
  		        return function(text) {
  		          var charChild, s;
  		          s = stack[stack.length - 1];
  		          if (s) {
  		            s[charkey] += text;
  		            if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && (_this.options.includeWhiteChars || text.replace(/\\n/g, '').trim() !== '')) {
  		              s[_this.options.childkey] = s[_this.options.childkey] || [];
  		              charChild = {
  		                '#name': '__text__'
  		              };
  		              charChild[charkey] = text;
  		              if (_this.options.normalize) {
  		                charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, " ").trim();
  		              }
  		              s[_this.options.childkey].push(charChild);
  		            }
  		            return s;
  		          }
  		        };
  		      })(this);
  		      this.saxParser.ontext = ontext;
  		      return this.saxParser.oncdata = (function(_this) {
  		        return function(text) {
  		          var s;
  		          s = ontext(text);
  		          if (s) {
  		            return s.cdata = true;
  		          }
  		        };
  		      })();
  		    };

  		    Parser.prototype.parseString = function(str, cb) {
  		      var err;
  		      if ((cb != null) && typeof cb === "function") {
  		        this.on("end", function(result) {
  		          this.reset();
  		          return cb(null, result);
  		        });
  		        this.on("error", function(err) {
  		          this.reset();
  		          return cb(err);
  		        });
  		      }
  		      try {
  		        str = str.toString();
  		        if (str.trim() === '') {
  		          this.emit("end", null);
  		          return true;
  		        }
  		        str = bom.stripBOM(str);
  		        if (this.options.async) {
  		          this.remaining = str;
  		          setImmediate(this.processAsync);
  		          return this.saxParser;
  		        }
  		        return this.saxParser.write(str).close();
  		      } catch (error1) {
  		        err = error1;
  		        if (!(this.saxParser.errThrown || this.saxParser.ended)) {
  		          this.emit('error', err);
  		          return this.saxParser.errThrown = true;
  		        } else if (this.saxParser.ended) {
  		          throw err;
  		        }
  		      }
  		    };

  		    Parser.prototype.parseStringPromise = function(str) {
  		      return new Promise((function(_this) {
  		        return function(resolve, reject) {
  		          return _this.parseString(str, function(err, value) {
  		            if (err) {
  		              return reject(err);
  		            } else {
  		              return resolve(value);
  		            }
  		          });
  		        };
  		      })(this));
  		    };

  		    return Parser;

  		  })(events);

  		  exports.parseString = function(str, a, b) {
  		    var cb, options, parser;
  		    if (b != null) {
  		      if (typeof b === 'function') {
  		        cb = b;
  		      }
  		      if (typeof a === 'object') {
  		        options = a;
  		      }
  		    } else {
  		      if (typeof a === 'function') {
  		        cb = a;
  		      }
  		      options = {};
  		    }
  		    parser = new exports.Parser(options);
  		    return parser.parseString(str, cb);
  		  };

  		  exports.parseStringPromise = function(str, a) {
  		    var options, parser;
  		    if (typeof a === 'object') {
  		      options = a;
  		    }
  		    parser = new exports.Parser(options);
  		    return parser.parseStringPromise(str);
  		  };

  		}).call(parser); 
  	} (parser));
  	return parser;
  }

  var hasRequiredXml2js;

  function requireXml2js () {
  	if (hasRequiredXml2js) return xml2js;
  	hasRequiredXml2js = 1;
  	// Generated by CoffeeScript 1.12.7
  	(function() {
  	  var builder, defaults, parser, processors,
  	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  	    hasProp = {}.hasOwnProperty;

  	  defaults = requireDefaults();

  	  builder = requireBuilder();

  	  parser = requireParser();

  	  processors = requireProcessors();

  	  xml2js.defaults = defaults.defaults;

  	  xml2js.processors = processors;

  	  xml2js.ValidationError = (function(superClass) {
  	    extend(ValidationError, superClass);

  	    function ValidationError(message) {
  	      this.message = message;
  	    }

  	    return ValidationError;

  	  })(Error);

  	  xml2js.Builder = builder.Builder;

  	  xml2js.Parser = parser.Parser;

  	  xml2js.parseString = parser.parseString;

  	  xml2js.parseStringPromise = parser.parseStringPromise;

  	}).call(xml2js);
  	return xml2js;
  }

  var xml2jsExports = requireXml2js();

  var ansiStyles = {exports: {}};

  var colorName;
  var hasRequiredColorName;

  function requireColorName () {
  	if (hasRequiredColorName) return colorName;
  	hasRequiredColorName = 1;

  	colorName = {
  		"aliceblue": [240, 248, 255],
  		"antiquewhite": [250, 235, 215],
  		"aqua": [0, 255, 255],
  		"aquamarine": [127, 255, 212],
  		"azure": [240, 255, 255],
  		"beige": [245, 245, 220],
  		"bisque": [255, 228, 196],
  		"black": [0, 0, 0],
  		"blanchedalmond": [255, 235, 205],
  		"blue": [0, 0, 255],
  		"blueviolet": [138, 43, 226],
  		"brown": [165, 42, 42],
  		"burlywood": [222, 184, 135],
  		"cadetblue": [95, 158, 160],
  		"chartreuse": [127, 255, 0],
  		"chocolate": [210, 105, 30],
  		"coral": [255, 127, 80],
  		"cornflowerblue": [100, 149, 237],
  		"cornsilk": [255, 248, 220],
  		"crimson": [220, 20, 60],
  		"cyan": [0, 255, 255],
  		"darkblue": [0, 0, 139],
  		"darkcyan": [0, 139, 139],
  		"darkgoldenrod": [184, 134, 11],
  		"darkgray": [169, 169, 169],
  		"darkgreen": [0, 100, 0],
  		"darkgrey": [169, 169, 169],
  		"darkkhaki": [189, 183, 107],
  		"darkmagenta": [139, 0, 139],
  		"darkolivegreen": [85, 107, 47],
  		"darkorange": [255, 140, 0],
  		"darkorchid": [153, 50, 204],
  		"darkred": [139, 0, 0],
  		"darksalmon": [233, 150, 122],
  		"darkseagreen": [143, 188, 143],
  		"darkslateblue": [72, 61, 139],
  		"darkslategray": [47, 79, 79],
  		"darkslategrey": [47, 79, 79],
  		"darkturquoise": [0, 206, 209],
  		"darkviolet": [148, 0, 211],
  		"deeppink": [255, 20, 147],
  		"deepskyblue": [0, 191, 255],
  		"dimgray": [105, 105, 105],
  		"dimgrey": [105, 105, 105],
  		"dodgerblue": [30, 144, 255],
  		"firebrick": [178, 34, 34],
  		"floralwhite": [255, 250, 240],
  		"forestgreen": [34, 139, 34],
  		"fuchsia": [255, 0, 255],
  		"gainsboro": [220, 220, 220],
  		"ghostwhite": [248, 248, 255],
  		"gold": [255, 215, 0],
  		"goldenrod": [218, 165, 32],
  		"gray": [128, 128, 128],
  		"green": [0, 128, 0],
  		"greenyellow": [173, 255, 47],
  		"grey": [128, 128, 128],
  		"honeydew": [240, 255, 240],
  		"hotpink": [255, 105, 180],
  		"indianred": [205, 92, 92],
  		"indigo": [75, 0, 130],
  		"ivory": [255, 255, 240],
  		"khaki": [240, 230, 140],
  		"lavender": [230, 230, 250],
  		"lavenderblush": [255, 240, 245],
  		"lawngreen": [124, 252, 0],
  		"lemonchiffon": [255, 250, 205],
  		"lightblue": [173, 216, 230],
  		"lightcoral": [240, 128, 128],
  		"lightcyan": [224, 255, 255],
  		"lightgoldenrodyellow": [250, 250, 210],
  		"lightgray": [211, 211, 211],
  		"lightgreen": [144, 238, 144],
  		"lightgrey": [211, 211, 211],
  		"lightpink": [255, 182, 193],
  		"lightsalmon": [255, 160, 122],
  		"lightseagreen": [32, 178, 170],
  		"lightskyblue": [135, 206, 250],
  		"lightslategray": [119, 136, 153],
  		"lightslategrey": [119, 136, 153],
  		"lightsteelblue": [176, 196, 222],
  		"lightyellow": [255, 255, 224],
  		"lime": [0, 255, 0],
  		"limegreen": [50, 205, 50],
  		"linen": [250, 240, 230],
  		"magenta": [255, 0, 255],
  		"maroon": [128, 0, 0],
  		"mediumaquamarine": [102, 205, 170],
  		"mediumblue": [0, 0, 205],
  		"mediumorchid": [186, 85, 211],
  		"mediumpurple": [147, 112, 219],
  		"mediumseagreen": [60, 179, 113],
  		"mediumslateblue": [123, 104, 238],
  		"mediumspringgreen": [0, 250, 154],
  		"mediumturquoise": [72, 209, 204],
  		"mediumvioletred": [199, 21, 133],
  		"midnightblue": [25, 25, 112],
  		"mintcream": [245, 255, 250],
  		"mistyrose": [255, 228, 225],
  		"moccasin": [255, 228, 181],
  		"navajowhite": [255, 222, 173],
  		"navy": [0, 0, 128],
  		"oldlace": [253, 245, 230],
  		"olive": [128, 128, 0],
  		"olivedrab": [107, 142, 35],
  		"orange": [255, 165, 0],
  		"orangered": [255, 69, 0],
  		"orchid": [218, 112, 214],
  		"palegoldenrod": [238, 232, 170],
  		"palegreen": [152, 251, 152],
  		"paleturquoise": [175, 238, 238],
  		"palevioletred": [219, 112, 147],
  		"papayawhip": [255, 239, 213],
  		"peachpuff": [255, 218, 185],
  		"peru": [205, 133, 63],
  		"pink": [255, 192, 203],
  		"plum": [221, 160, 221],
  		"powderblue": [176, 224, 230],
  		"purple": [128, 0, 128],
  		"rebeccapurple": [102, 51, 153],
  		"red": [255, 0, 0],
  		"rosybrown": [188, 143, 143],
  		"royalblue": [65, 105, 225],
  		"saddlebrown": [139, 69, 19],
  		"salmon": [250, 128, 114],
  		"sandybrown": [244, 164, 96],
  		"seagreen": [46, 139, 87],
  		"seashell": [255, 245, 238],
  		"sienna": [160, 82, 45],
  		"silver": [192, 192, 192],
  		"skyblue": [135, 206, 235],
  		"slateblue": [106, 90, 205],
  		"slategray": [112, 128, 144],
  		"slategrey": [112, 128, 144],
  		"snow": [255, 250, 250],
  		"springgreen": [0, 255, 127],
  		"steelblue": [70, 130, 180],
  		"tan": [210, 180, 140],
  		"teal": [0, 128, 128],
  		"thistle": [216, 191, 216],
  		"tomato": [255, 99, 71],
  		"turquoise": [64, 224, 208],
  		"violet": [238, 130, 238],
  		"wheat": [245, 222, 179],
  		"white": [255, 255, 255],
  		"whitesmoke": [245, 245, 245],
  		"yellow": [255, 255, 0],
  		"yellowgreen": [154, 205, 50]
  	};
  	return colorName;
  }

  /* MIT license */

  var conversions;
  var hasRequiredConversions;

  function requireConversions () {
  	if (hasRequiredConversions) return conversions;
  	hasRequiredConversions = 1;
  	/* eslint-disable no-mixed-operators */
  	const cssKeywords = requireColorName();

  	// NOTE: conversions should only return primitive values (i.e. arrays, or
  	//       values that give correct `typeof` results).
  	//       do not use box values types (i.e. Number(), String(), etc.)

  	const reverseKeywords = {};
  	for (const key of Object.keys(cssKeywords)) {
  		reverseKeywords[cssKeywords[key]] = key;
  	}

  	const convert = {
  		rgb: {channels: 3, labels: 'rgb'},
  		hsl: {channels: 3, labels: 'hsl'},
  		hsv: {channels: 3, labels: 'hsv'},
  		hwb: {channels: 3, labels: 'hwb'},
  		cmyk: {channels: 4, labels: 'cmyk'},
  		xyz: {channels: 3, labels: 'xyz'},
  		lab: {channels: 3, labels: 'lab'},
  		lch: {channels: 3, labels: 'lch'},
  		hex: {channels: 1, labels: ['hex']},
  		keyword: {channels: 1, labels: ['keyword']},
  		ansi16: {channels: 1, labels: ['ansi16']},
  		ansi256: {channels: 1, labels: ['ansi256']},
  		hcg: {channels: 3, labels: ['h', 'c', 'g']},
  		apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
  		gray: {channels: 1, labels: ['gray']}
  	};

  	conversions = convert;

  	// Hide .channels and .labels properties
  	for (const model of Object.keys(convert)) {
  		if (!('channels' in convert[model])) {
  			throw new Error('missing channels property: ' + model);
  		}

  		if (!('labels' in convert[model])) {
  			throw new Error('missing channel labels property: ' + model);
  		}

  		if (convert[model].labels.length !== convert[model].channels) {
  			throw new Error('channel and label counts mismatch: ' + model);
  		}

  		const {channels, labels} = convert[model];
  		delete convert[model].channels;
  		delete convert[model].labels;
  		Object.defineProperty(convert[model], 'channels', {value: channels});
  		Object.defineProperty(convert[model], 'labels', {value: labels});
  	}

  	convert.rgb.hsl = function (rgb) {
  		const r = rgb[0] / 255;
  		const g = rgb[1] / 255;
  		const b = rgb[2] / 255;
  		const min = Math.min(r, g, b);
  		const max = Math.max(r, g, b);
  		const delta = max - min;
  		let h;
  		let s;

  		if (max === min) {
  			h = 0;
  		} else if (r === max) {
  			h = (g - b) / delta;
  		} else if (g === max) {
  			h = 2 + (b - r) / delta;
  		} else if (b === max) {
  			h = 4 + (r - g) / delta;
  		}

  		h = Math.min(h * 60, 360);

  		if (h < 0) {
  			h += 360;
  		}

  		const l = (min + max) / 2;

  		if (max === min) {
  			s = 0;
  		} else if (l <= 0.5) {
  			s = delta / (max + min);
  		} else {
  			s = delta / (2 - max - min);
  		}

  		return [h, s * 100, l * 100];
  	};

  	convert.rgb.hsv = function (rgb) {
  		let rdif;
  		let gdif;
  		let bdif;
  		let h;
  		let s;

  		const r = rgb[0] / 255;
  		const g = rgb[1] / 255;
  		const b = rgb[2] / 255;
  		const v = Math.max(r, g, b);
  		const diff = v - Math.min(r, g, b);
  		const diffc = function (c) {
  			return (v - c) / 6 / diff + 1 / 2;
  		};

  		if (diff === 0) {
  			h = 0;
  			s = 0;
  		} else {
  			s = diff / v;
  			rdif = diffc(r);
  			gdif = diffc(g);
  			bdif = diffc(b);

  			if (r === v) {
  				h = bdif - gdif;
  			} else if (g === v) {
  				h = (1 / 3) + rdif - bdif;
  			} else if (b === v) {
  				h = (2 / 3) + gdif - rdif;
  			}

  			if (h < 0) {
  				h += 1;
  			} else if (h > 1) {
  				h -= 1;
  			}
  		}

  		return [
  			h * 360,
  			s * 100,
  			v * 100
  		];
  	};

  	convert.rgb.hwb = function (rgb) {
  		const r = rgb[0];
  		const g = rgb[1];
  		let b = rgb[2];
  		const h = convert.rgb.hsl(rgb)[0];
  		const w = 1 / 255 * Math.min(r, Math.min(g, b));

  		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

  		return [h, w * 100, b * 100];
  	};

  	convert.rgb.cmyk = function (rgb) {
  		const r = rgb[0] / 255;
  		const g = rgb[1] / 255;
  		const b = rgb[2] / 255;

  		const k = Math.min(1 - r, 1 - g, 1 - b);
  		const c = (1 - r - k) / (1 - k) || 0;
  		const m = (1 - g - k) / (1 - k) || 0;
  		const y = (1 - b - k) / (1 - k) || 0;

  		return [c * 100, m * 100, y * 100, k * 100];
  	};

  	function comparativeDistance(x, y) {
  		/*
  			See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
  		*/
  		return (
  			((x[0] - y[0]) ** 2) +
  			((x[1] - y[1]) ** 2) +
  			((x[2] - y[2]) ** 2)
  		);
  	}

  	convert.rgb.keyword = function (rgb) {
  		const reversed = reverseKeywords[rgb];
  		if (reversed) {
  			return reversed;
  		}

  		let currentClosestDistance = Infinity;
  		let currentClosestKeyword;

  		for (const keyword of Object.keys(cssKeywords)) {
  			const value = cssKeywords[keyword];

  			// Compute comparative distance
  			const distance = comparativeDistance(rgb, value);

  			// Check if its less, if so set as closest
  			if (distance < currentClosestDistance) {
  				currentClosestDistance = distance;
  				currentClosestKeyword = keyword;
  			}
  		}

  		return currentClosestKeyword;
  	};

  	convert.keyword.rgb = function (keyword) {
  		return cssKeywords[keyword];
  	};

  	convert.rgb.xyz = function (rgb) {
  		let r = rgb[0] / 255;
  		let g = rgb[1] / 255;
  		let b = rgb[2] / 255;

  		// Assume sRGB
  		r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
  		g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
  		b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

  		const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  		const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  		const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  		return [x * 100, y * 100, z * 100];
  	};

  	convert.rgb.lab = function (rgb) {
  		const xyz = convert.rgb.xyz(rgb);
  		let x = xyz[0];
  		let y = xyz[1];
  		let z = xyz[2];

  		x /= 95.047;
  		y /= 100;
  		z /= 108.883;

  		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
  		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
  		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

  		const l = (116 * y) - 16;
  		const a = 500 * (x - y);
  		const b = 200 * (y - z);

  		return [l, a, b];
  	};

  	convert.hsl.rgb = function (hsl) {
  		const h = hsl[0] / 360;
  		const s = hsl[1] / 100;
  		const l = hsl[2] / 100;
  		let t2;
  		let t3;
  		let val;

  		if (s === 0) {
  			val = l * 255;
  			return [val, val, val];
  		}

  		if (l < 0.5) {
  			t2 = l * (1 + s);
  		} else {
  			t2 = l + s - l * s;
  		}

  		const t1 = 2 * l - t2;

  		const rgb = [0, 0, 0];
  		for (let i = 0; i < 3; i++) {
  			t3 = h + 1 / 3 * -(i - 1);
  			if (t3 < 0) {
  				t3++;
  			}

  			if (t3 > 1) {
  				t3--;
  			}

  			if (6 * t3 < 1) {
  				val = t1 + (t2 - t1) * 6 * t3;
  			} else if (2 * t3 < 1) {
  				val = t2;
  			} else if (3 * t3 < 2) {
  				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
  			} else {
  				val = t1;
  			}

  			rgb[i] = val * 255;
  		}

  		return rgb;
  	};

  	convert.hsl.hsv = function (hsl) {
  		const h = hsl[0];
  		let s = hsl[1] / 100;
  		let l = hsl[2] / 100;
  		let smin = s;
  		const lmin = Math.max(l, 0.01);

  		l *= 2;
  		s *= (l <= 1) ? l : 2 - l;
  		smin *= lmin <= 1 ? lmin : 2 - lmin;
  		const v = (l + s) / 2;
  		const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

  		return [h, sv * 100, v * 100];
  	};

  	convert.hsv.rgb = function (hsv) {
  		const h = hsv[0] / 60;
  		const s = hsv[1] / 100;
  		let v = hsv[2] / 100;
  		const hi = Math.floor(h) % 6;

  		const f = h - Math.floor(h);
  		const p = 255 * v * (1 - s);
  		const q = 255 * v * (1 - (s * f));
  		const t = 255 * v * (1 - (s * (1 - f)));
  		v *= 255;

  		switch (hi) {
  			case 0:
  				return [v, t, p];
  			case 1:
  				return [q, v, p];
  			case 2:
  				return [p, v, t];
  			case 3:
  				return [p, q, v];
  			case 4:
  				return [t, p, v];
  			case 5:
  				return [v, p, q];
  		}
  	};

  	convert.hsv.hsl = function (hsv) {
  		const h = hsv[0];
  		const s = hsv[1] / 100;
  		const v = hsv[2] / 100;
  		const vmin = Math.max(v, 0.01);
  		let sl;
  		let l;

  		l = (2 - s) * v;
  		const lmin = (2 - s) * vmin;
  		sl = s * vmin;
  		sl /= (lmin <= 1) ? lmin : 2 - lmin;
  		sl = sl || 0;
  		l /= 2;

  		return [h, sl * 100, l * 100];
  	};

  	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
  	convert.hwb.rgb = function (hwb) {
  		const h = hwb[0] / 360;
  		let wh = hwb[1] / 100;
  		let bl = hwb[2] / 100;
  		const ratio = wh + bl;
  		let f;

  		// Wh + bl cant be > 1
  		if (ratio > 1) {
  			wh /= ratio;
  			bl /= ratio;
  		}

  		const i = Math.floor(6 * h);
  		const v = 1 - bl;
  		f = 6 * h - i;

  		if ((i & 0x01) !== 0) {
  			f = 1 - f;
  		}

  		const n = wh + f * (v - wh); // Linear interpolation

  		let r;
  		let g;
  		let b;
  		/* eslint-disable max-statements-per-line,no-multi-spaces */
  		switch (i) {
  			default:
  			case 6:
  			case 0: r = v;  g = n;  b = wh; break;
  			case 1: r = n;  g = v;  b = wh; break;
  			case 2: r = wh; g = v;  b = n; break;
  			case 3: r = wh; g = n;  b = v; break;
  			case 4: r = n;  g = wh; b = v; break;
  			case 5: r = v;  g = wh; b = n; break;
  		}
  		/* eslint-enable max-statements-per-line,no-multi-spaces */

  		return [r * 255, g * 255, b * 255];
  	};

  	convert.cmyk.rgb = function (cmyk) {
  		const c = cmyk[0] / 100;
  		const m = cmyk[1] / 100;
  		const y = cmyk[2] / 100;
  		const k = cmyk[3] / 100;

  		const r = 1 - Math.min(1, c * (1 - k) + k);
  		const g = 1 - Math.min(1, m * (1 - k) + k);
  		const b = 1 - Math.min(1, y * (1 - k) + k);

  		return [r * 255, g * 255, b * 255];
  	};

  	convert.xyz.rgb = function (xyz) {
  		const x = xyz[0] / 100;
  		const y = xyz[1] / 100;
  		const z = xyz[2] / 100;
  		let r;
  		let g;
  		let b;

  		r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
  		g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
  		b = (x * 0.0557) + (y * -0.204) + (z * 1.0570);

  		// Assume sRGB
  		r = r > 0.0031308
  			? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
  			: r * 12.92;

  		g = g > 0.0031308
  			? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
  			: g * 12.92;

  		b = b > 0.0031308
  			? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
  			: b * 12.92;

  		r = Math.min(Math.max(0, r), 1);
  		g = Math.min(Math.max(0, g), 1);
  		b = Math.min(Math.max(0, b), 1);

  		return [r * 255, g * 255, b * 255];
  	};

  	convert.xyz.lab = function (xyz) {
  		let x = xyz[0];
  		let y = xyz[1];
  		let z = xyz[2];

  		x /= 95.047;
  		y /= 100;
  		z /= 108.883;

  		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
  		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
  		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

  		const l = (116 * y) - 16;
  		const a = 500 * (x - y);
  		const b = 200 * (y - z);

  		return [l, a, b];
  	};

  	convert.lab.xyz = function (lab) {
  		const l = lab[0];
  		const a = lab[1];
  		const b = lab[2];
  		let x;
  		let y;
  		let z;

  		y = (l + 16) / 116;
  		x = a / 500 + y;
  		z = y - b / 200;

  		const y2 = y ** 3;
  		const x2 = x ** 3;
  		const z2 = z ** 3;
  		y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
  		x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
  		z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

  		x *= 95.047;
  		y *= 100;
  		z *= 108.883;

  		return [x, y, z];
  	};

  	convert.lab.lch = function (lab) {
  		const l = lab[0];
  		const a = lab[1];
  		const b = lab[2];
  		let h;

  		const hr = Math.atan2(b, a);
  		h = hr * 360 / 2 / Math.PI;

  		if (h < 0) {
  			h += 360;
  		}

  		const c = Math.sqrt(a * a + b * b);

  		return [l, c, h];
  	};

  	convert.lch.lab = function (lch) {
  		const l = lch[0];
  		const c = lch[1];
  		const h = lch[2];

  		const hr = h / 360 * 2 * Math.PI;
  		const a = c * Math.cos(hr);
  		const b = c * Math.sin(hr);

  		return [l, a, b];
  	};

  	convert.rgb.ansi16 = function (args, saturation = null) {
  		const [r, g, b] = args;
  		let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

  		value = Math.round(value / 50);

  		if (value === 0) {
  			return 30;
  		}

  		let ansi = 30
  			+ ((Math.round(b / 255) << 2)
  			| (Math.round(g / 255) << 1)
  			| Math.round(r / 255));

  		if (value === 2) {
  			ansi += 60;
  		}

  		return ansi;
  	};

  	convert.hsv.ansi16 = function (args) {
  		// Optimization here; we already know the value and don't need to get
  		// it converted for us.
  		return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  	};

  	convert.rgb.ansi256 = function (args) {
  		const r = args[0];
  		const g = args[1];
  		const b = args[2];

  		// We use the extended greyscale palette here, with the exception of
  		// black and white. normal palette only has 4 greyscale shades.
  		if (r === g && g === b) {
  			if (r < 8) {
  				return 16;
  			}

  			if (r > 248) {
  				return 231;
  			}

  			return Math.round(((r - 8) / 247) * 24) + 232;
  		}

  		const ansi = 16
  			+ (36 * Math.round(r / 255 * 5))
  			+ (6 * Math.round(g / 255 * 5))
  			+ Math.round(b / 255 * 5);

  		return ansi;
  	};

  	convert.ansi16.rgb = function (args) {
  		let color = args % 10;

  		// Handle greyscale
  		if (color === 0 || color === 7) {
  			if (args > 50) {
  				color += 3.5;
  			}

  			color = color / 10.5 * 255;

  			return [color, color, color];
  		}

  		const mult = (~~(args > 50) + 1) * 0.5;
  		const r = ((color & 1) * mult) * 255;
  		const g = (((color >> 1) & 1) * mult) * 255;
  		const b = (((color >> 2) & 1) * mult) * 255;

  		return [r, g, b];
  	};

  	convert.ansi256.rgb = function (args) {
  		// Handle greyscale
  		if (args >= 232) {
  			const c = (args - 232) * 10 + 8;
  			return [c, c, c];
  		}

  		args -= 16;

  		let rem;
  		const r = Math.floor(args / 36) / 5 * 255;
  		const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
  		const b = (rem % 6) / 5 * 255;

  		return [r, g, b];
  	};

  	convert.rgb.hex = function (args) {
  		const integer = ((Math.round(args[0]) & 0xFF) << 16)
  			+ ((Math.round(args[1]) & 0xFF) << 8)
  			+ (Math.round(args[2]) & 0xFF);

  		const string = integer.toString(16).toUpperCase();
  		return '000000'.substring(string.length) + string;
  	};

  	convert.hex.rgb = function (args) {
  		const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
  		if (!match) {
  			return [0, 0, 0];
  		}

  		let colorString = match[0];

  		if (match[0].length === 3) {
  			colorString = colorString.split('').map(char => {
  				return char + char;
  			}).join('');
  		}

  		const integer = parseInt(colorString, 16);
  		const r = (integer >> 16) & 0xFF;
  		const g = (integer >> 8) & 0xFF;
  		const b = integer & 0xFF;

  		return [r, g, b];
  	};

  	convert.rgb.hcg = function (rgb) {
  		const r = rgb[0] / 255;
  		const g = rgb[1] / 255;
  		const b = rgb[2] / 255;
  		const max = Math.max(Math.max(r, g), b);
  		const min = Math.min(Math.min(r, g), b);
  		const chroma = (max - min);
  		let grayscale;
  		let hue;

  		if (chroma < 1) {
  			grayscale = min / (1 - chroma);
  		} else {
  			grayscale = 0;
  		}

  		if (chroma <= 0) {
  			hue = 0;
  		} else
  		if (max === r) {
  			hue = ((g - b) / chroma) % 6;
  		} else
  		if (max === g) {
  			hue = 2 + (b - r) / chroma;
  		} else {
  			hue = 4 + (r - g) / chroma;
  		}

  		hue /= 6;
  		hue %= 1;

  		return [hue * 360, chroma * 100, grayscale * 100];
  	};

  	convert.hsl.hcg = function (hsl) {
  		const s = hsl[1] / 100;
  		const l = hsl[2] / 100;

  		const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

  		let f = 0;
  		if (c < 1.0) {
  			f = (l - 0.5 * c) / (1.0 - c);
  		}

  		return [hsl[0], c * 100, f * 100];
  	};

  	convert.hsv.hcg = function (hsv) {
  		const s = hsv[1] / 100;
  		const v = hsv[2] / 100;

  		const c = s * v;
  		let f = 0;

  		if (c < 1.0) {
  			f = (v - c) / (1 - c);
  		}

  		return [hsv[0], c * 100, f * 100];
  	};

  	convert.hcg.rgb = function (hcg) {
  		const h = hcg[0] / 360;
  		const c = hcg[1] / 100;
  		const g = hcg[2] / 100;

  		if (c === 0.0) {
  			return [g * 255, g * 255, g * 255];
  		}

  		const pure = [0, 0, 0];
  		const hi = (h % 1) * 6;
  		const v = hi % 1;
  		const w = 1 - v;
  		let mg = 0;

  		/* eslint-disable max-statements-per-line */
  		switch (Math.floor(hi)) {
  			case 0:
  				pure[0] = 1; pure[1] = v; pure[2] = 0; break;
  			case 1:
  				pure[0] = w; pure[1] = 1; pure[2] = 0; break;
  			case 2:
  				pure[0] = 0; pure[1] = 1; pure[2] = v; break;
  			case 3:
  				pure[0] = 0; pure[1] = w; pure[2] = 1; break;
  			case 4:
  				pure[0] = v; pure[1] = 0; pure[2] = 1; break;
  			default:
  				pure[0] = 1; pure[1] = 0; pure[2] = w;
  		}
  		/* eslint-enable max-statements-per-line */

  		mg = (1.0 - c) * g;

  		return [
  			(c * pure[0] + mg) * 255,
  			(c * pure[1] + mg) * 255,
  			(c * pure[2] + mg) * 255
  		];
  	};

  	convert.hcg.hsv = function (hcg) {
  		const c = hcg[1] / 100;
  		const g = hcg[2] / 100;

  		const v = c + g * (1.0 - c);
  		let f = 0;

  		if (v > 0.0) {
  			f = c / v;
  		}

  		return [hcg[0], f * 100, v * 100];
  	};

  	convert.hcg.hsl = function (hcg) {
  		const c = hcg[1] / 100;
  		const g = hcg[2] / 100;

  		const l = g * (1.0 - c) + 0.5 * c;
  		let s = 0;

  		if (l > 0.0 && l < 0.5) {
  			s = c / (2 * l);
  		} else
  		if (l >= 0.5 && l < 1.0) {
  			s = c / (2 * (1 - l));
  		}

  		return [hcg[0], s * 100, l * 100];
  	};

  	convert.hcg.hwb = function (hcg) {
  		const c = hcg[1] / 100;
  		const g = hcg[2] / 100;
  		const v = c + g * (1.0 - c);
  		return [hcg[0], (v - c) * 100, (1 - v) * 100];
  	};

  	convert.hwb.hcg = function (hwb) {
  		const w = hwb[1] / 100;
  		const b = hwb[2] / 100;
  		const v = 1 - b;
  		const c = v - w;
  		let g = 0;

  		if (c < 1) {
  			g = (v - c) / (1 - c);
  		}

  		return [hwb[0], c * 100, g * 100];
  	};

  	convert.apple.rgb = function (apple) {
  		return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
  	};

  	convert.rgb.apple = function (rgb) {
  		return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
  	};

  	convert.gray.rgb = function (args) {
  		return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  	};

  	convert.gray.hsl = function (args) {
  		return [0, 0, args[0]];
  	};

  	convert.gray.hsv = convert.gray.hsl;

  	convert.gray.hwb = function (gray) {
  		return [0, 100, gray[0]];
  	};

  	convert.gray.cmyk = function (gray) {
  		return [0, 0, 0, gray[0]];
  	};

  	convert.gray.lab = function (gray) {
  		return [gray[0], 0, 0];
  	};

  	convert.gray.hex = function (gray) {
  		const val = Math.round(gray[0] / 100 * 255) & 0xFF;
  		const integer = (val << 16) + (val << 8) + val;

  		const string = integer.toString(16).toUpperCase();
  		return '000000'.substring(string.length) + string;
  	};

  	convert.rgb.gray = function (rgb) {
  		const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
  		return [val / 255 * 100];
  	};
  	return conversions;
  }

  var route;
  var hasRequiredRoute;

  function requireRoute () {
  	if (hasRequiredRoute) return route;
  	hasRequiredRoute = 1;
  	const conversions = requireConversions();

  	/*
  		This function routes a model to all other models.

  		all functions that are routed have a property `.conversion` attached
  		to the returned synthetic function. This property is an array
  		of strings, each with the steps in between the 'from' and 'to'
  		color models (inclusive).

  		conversions that are not possible simply are not included.
  	*/

  	function buildGraph() {
  		const graph = {};
  		// https://jsperf.com/object-keys-vs-for-in-with-closure/3
  		const models = Object.keys(conversions);

  		for (let len = models.length, i = 0; i < len; i++) {
  			graph[models[i]] = {
  				// http://jsperf.com/1-vs-infinity
  				// micro-opt, but this is simple.
  				distance: -1,
  				parent: null
  			};
  		}

  		return graph;
  	}

  	// https://en.wikipedia.org/wiki/Breadth-first_search
  	function deriveBFS(fromModel) {
  		const graph = buildGraph();
  		const queue = [fromModel]; // Unshift -> queue -> pop

  		graph[fromModel].distance = 0;

  		while (queue.length) {
  			const current = queue.pop();
  			const adjacents = Object.keys(conversions[current]);

  			for (let len = adjacents.length, i = 0; i < len; i++) {
  				const adjacent = adjacents[i];
  				const node = graph[adjacent];

  				if (node.distance === -1) {
  					node.distance = graph[current].distance + 1;
  					node.parent = current;
  					queue.unshift(adjacent);
  				}
  			}
  		}

  		return graph;
  	}

  	function link(from, to) {
  		return function (args) {
  			return to(from(args));
  		};
  	}

  	function wrapConversion(toModel, graph) {
  		const path = [graph[toModel].parent, toModel];
  		let fn = conversions[graph[toModel].parent][toModel];

  		let cur = graph[toModel].parent;
  		while (graph[cur].parent) {
  			path.unshift(graph[cur].parent);
  			fn = link(conversions[graph[cur].parent][cur], fn);
  			cur = graph[cur].parent;
  		}

  		fn.conversion = path;
  		return fn;
  	}

  	route = function (fromModel) {
  		const graph = deriveBFS(fromModel);
  		const conversion = {};

  		const models = Object.keys(graph);
  		for (let len = models.length, i = 0; i < len; i++) {
  			const toModel = models[i];
  			const node = graph[toModel];

  			if (node.parent === null) {
  				// No possible conversion, or this node is the source model.
  				continue;
  			}

  			conversion[toModel] = wrapConversion(toModel, graph);
  		}

  		return conversion;
  	};
  	return route;
  }

  var colorConvert;
  var hasRequiredColorConvert;

  function requireColorConvert () {
  	if (hasRequiredColorConvert) return colorConvert;
  	hasRequiredColorConvert = 1;
  	const conversions = requireConversions();
  	const route = requireRoute();

  	const convert = {};

  	const models = Object.keys(conversions);

  	function wrapRaw(fn) {
  		const wrappedFn = function (...args) {
  			const arg0 = args[0];
  			if (arg0 === undefined || arg0 === null) {
  				return arg0;
  			}

  			if (arg0.length > 1) {
  				args = arg0;
  			}

  			return fn(args);
  		};

  		// Preserve .conversion property if there is one
  		if ('conversion' in fn) {
  			wrappedFn.conversion = fn.conversion;
  		}

  		return wrappedFn;
  	}

  	function wrapRounded(fn) {
  		const wrappedFn = function (...args) {
  			const arg0 = args[0];

  			if (arg0 === undefined || arg0 === null) {
  				return arg0;
  			}

  			if (arg0.length > 1) {
  				args = arg0;
  			}

  			const result = fn(args);

  			// We're assuming the result is an array here.
  			// see notice in conversions.js; don't use box types
  			// in conversion functions.
  			if (typeof result === 'object') {
  				for (let len = result.length, i = 0; i < len; i++) {
  					result[i] = Math.round(result[i]);
  				}
  			}

  			return result;
  		};

  		// Preserve .conversion property if there is one
  		if ('conversion' in fn) {
  			wrappedFn.conversion = fn.conversion;
  		}

  		return wrappedFn;
  	}

  	models.forEach(fromModel => {
  		convert[fromModel] = {};

  		Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
  		Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

  		const routes = route(fromModel);
  		const routeModels = Object.keys(routes);

  		routeModels.forEach(toModel => {
  			const fn = routes[toModel];

  			convert[fromModel][toModel] = wrapRounded(fn);
  			convert[fromModel][toModel].raw = wrapRaw(fn);
  		});
  	});

  	colorConvert = convert;
  	return colorConvert;
  }

  ansiStyles.exports;

  var hasRequiredAnsiStyles;

  function requireAnsiStyles () {
  	if (hasRequiredAnsiStyles) return ansiStyles.exports;
  	hasRequiredAnsiStyles = 1;
  	(function (module) {

  		const wrapAnsi16 = (fn, offset) => (...args) => {
  			const code = fn(...args);
  			return `\u001B[${code + offset}m`;
  		};

  		const wrapAnsi256 = (fn, offset) => (...args) => {
  			const code = fn(...args);
  			return `\u001B[${38 + offset};5;${code}m`;
  		};

  		const wrapAnsi16m = (fn, offset) => (...args) => {
  			const rgb = fn(...args);
  			return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
  		};

  		const ansi2ansi = n => n;
  		const rgb2rgb = (r, g, b) => [r, g, b];

  		const setLazyProperty = (object, property, get) => {
  			Object.defineProperty(object, property, {
  				get: () => {
  					const value = get();

  					Object.defineProperty(object, property, {
  						value,
  						enumerable: true,
  						configurable: true
  					});

  					return value;
  				},
  				enumerable: true,
  				configurable: true
  			});
  		};

  		/** @type {typeof import('color-convert')} */
  		let colorConvert;
  		const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
  			if (colorConvert === undefined) {
  				colorConvert = requireColorConvert();
  			}

  			const offset = isBackground ? 10 : 0;
  			const styles = {};

  			for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
  				const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
  				if (sourceSpace === targetSpace) {
  					styles[name] = wrap(identity, offset);
  				} else if (typeof suite === 'object') {
  					styles[name] = wrap(suite[targetSpace], offset);
  				}
  			}

  			return styles;
  		};

  		function assembleStyles() {
  			const codes = new Map();
  			const styles = {
  				modifier: {
  					reset: [0, 0],
  					// 21 isn't widely supported and 22 does the same thing
  					bold: [1, 22],
  					dim: [2, 22],
  					italic: [3, 23],
  					underline: [4, 24],
  					inverse: [7, 27],
  					hidden: [8, 28],
  					strikethrough: [9, 29]
  				},
  				color: {
  					black: [30, 39],
  					red: [31, 39],
  					green: [32, 39],
  					yellow: [33, 39],
  					blue: [34, 39],
  					magenta: [35, 39],
  					cyan: [36, 39],
  					white: [37, 39],

  					// Bright color
  					blackBright: [90, 39],
  					redBright: [91, 39],
  					greenBright: [92, 39],
  					yellowBright: [93, 39],
  					blueBright: [94, 39],
  					magentaBright: [95, 39],
  					cyanBright: [96, 39],
  					whiteBright: [97, 39]
  				},
  				bgColor: {
  					bgBlack: [40, 49],
  					bgRed: [41, 49],
  					bgGreen: [42, 49],
  					bgYellow: [43, 49],
  					bgBlue: [44, 49],
  					bgMagenta: [45, 49],
  					bgCyan: [46, 49],
  					bgWhite: [47, 49],

  					// Bright color
  					bgBlackBright: [100, 49],
  					bgRedBright: [101, 49],
  					bgGreenBright: [102, 49],
  					bgYellowBright: [103, 49],
  					bgBlueBright: [104, 49],
  					bgMagentaBright: [105, 49],
  					bgCyanBright: [106, 49],
  					bgWhiteBright: [107, 49]
  				}
  			};

  			// Alias bright black as gray (and grey)
  			styles.color.gray = styles.color.blackBright;
  			styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
  			styles.color.grey = styles.color.blackBright;
  			styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

  			for (const [groupName, group] of Object.entries(styles)) {
  				for (const [styleName, style] of Object.entries(group)) {
  					styles[styleName] = {
  						open: `\u001B[${style[0]}m`,
  						close: `\u001B[${style[1]}m`
  					};

  					group[styleName] = styles[styleName];

  					codes.set(style[0], style[1]);
  				}

  				Object.defineProperty(styles, groupName, {
  					value: group,
  					enumerable: false
  				});
  			}

  			Object.defineProperty(styles, 'codes', {
  				value: codes,
  				enumerable: false
  			});

  			styles.color.close = '\u001B[39m';
  			styles.bgColor.close = '\u001B[49m';

  			setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
  			setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
  			setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
  			setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
  			setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
  			setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

  			return styles;
  		}

  		// Make the export immutable
  		Object.defineProperty(module, 'exports', {
  			enumerable: true,
  			get: assembleStyles
  		}); 
  	} (ansiStyles));
  	return ansiStyles.exports;
  }

  var browser;
  var hasRequiredBrowser;

  function requireBrowser () {
  	if (hasRequiredBrowser) return browser;
  	hasRequiredBrowser = 1;
  	browser = {
  		stdout: false,
  		stderr: false
  	};
  	return browser;
  }

  var util;
  var hasRequiredUtil;

  function requireUtil () {
  	if (hasRequiredUtil) return util;
  	hasRequiredUtil = 1;

  	const stringReplaceAll = (string, substring, replacer) => {
  		let index = string.indexOf(substring);
  		if (index === -1) {
  			return string;
  		}

  		const substringLength = substring.length;
  		let endIndex = 0;
  		let returnValue = '';
  		do {
  			returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
  			endIndex = index + substringLength;
  			index = string.indexOf(substring, endIndex);
  		} while (index !== -1);

  		returnValue += string.substr(endIndex);
  		return returnValue;
  	};

  	const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
  		let endIndex = 0;
  		let returnValue = '';
  		do {
  			const gotCR = string[index - 1] === '\r';
  			returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
  			endIndex = index + 1;
  			index = string.indexOf('\n', endIndex);
  		} while (index !== -1);

  		returnValue += string.substr(endIndex);
  		return returnValue;
  	};

  	util = {
  		stringReplaceAll,
  		stringEncaseCRLFWithFirstIndex
  	};
  	return util;
  }

  var templates;
  var hasRequiredTemplates;

  function requireTemplates () {
  	if (hasRequiredTemplates) return templates;
  	hasRequiredTemplates = 1;
  	const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
  	const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
  	const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
  	const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

  	const ESCAPES = new Map([
  		['n', '\n'],
  		['r', '\r'],
  		['t', '\t'],
  		['b', '\b'],
  		['f', '\f'],
  		['v', '\v'],
  		['0', '\0'],
  		['\\', '\\'],
  		['e', '\u001B'],
  		['a', '\u0007']
  	]);

  	function unescape(c) {
  		const u = c[0] === 'u';
  		const bracket = c[1] === '{';

  		if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
  			return String.fromCharCode(parseInt(c.slice(1), 16));
  		}

  		if (u && bracket) {
  			return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
  		}

  		return ESCAPES.get(c) || c;
  	}

  	function parseArguments(name, arguments_) {
  		const results = [];
  		const chunks = arguments_.trim().split(/\s*,\s*/g);
  		let matches;

  		for (const chunk of chunks) {
  			const number = Number(chunk);
  			if (!Number.isNaN(number)) {
  				results.push(number);
  			} else if ((matches = chunk.match(STRING_REGEX))) {
  				results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
  			} else {
  				throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
  			}
  		}

  		return results;
  	}

  	function parseStyle(style) {
  		STYLE_REGEX.lastIndex = 0;

  		const results = [];
  		let matches;

  		while ((matches = STYLE_REGEX.exec(style)) !== null) {
  			const name = matches[1];

  			if (matches[2]) {
  				const args = parseArguments(name, matches[2]);
  				results.push([name].concat(args));
  			} else {
  				results.push([name]);
  			}
  		}

  		return results;
  	}

  	function buildStyle(chalk, styles) {
  		const enabled = {};

  		for (const layer of styles) {
  			for (const style of layer.styles) {
  				enabled[style[0]] = layer.inverse ? null : style.slice(1);
  			}
  		}

  		let current = chalk;
  		for (const [styleName, styles] of Object.entries(enabled)) {
  			if (!Array.isArray(styles)) {
  				continue;
  			}

  			if (!(styleName in current)) {
  				throw new Error(`Unknown Chalk style: ${styleName}`);
  			}

  			current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
  		}

  		return current;
  	}

  	templates = (chalk, temporary) => {
  		const styles = [];
  		const chunks = [];
  		let chunk = [];

  		// eslint-disable-next-line max-params
  		temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
  			if (escapeCharacter) {
  				chunk.push(unescape(escapeCharacter));
  			} else if (style) {
  				const string = chunk.join('');
  				chunk = [];
  				chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
  				styles.push({inverse, styles: parseStyle(style)});
  			} else if (close) {
  				if (styles.length === 0) {
  					throw new Error('Found extraneous } in Chalk template literal');
  				}

  				chunks.push(buildStyle(chalk, styles)(chunk.join('')));
  				chunk = [];
  				styles.pop();
  			} else {
  				chunk.push(character);
  			}
  		});

  		chunks.push(chunk.join(''));

  		if (styles.length > 0) {
  			const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
  			throw new Error(errMessage);
  		}

  		return chunks.join('');
  	};
  	return templates;
  }

  var source;
  var hasRequiredSource;

  function requireSource () {
  	if (hasRequiredSource) return source;
  	hasRequiredSource = 1;
  	const ansiStyles = requireAnsiStyles();
  	const {stdout: stdoutColor, stderr: stderrColor} = requireBrowser();
  	const {
  		stringReplaceAll,
  		stringEncaseCRLFWithFirstIndex
  	} = requireUtil();

  	const {isArray} = Array;

  	// `supportsColor.level` → `ansiStyles.color[name]` mapping
  	const levelMapping = [
  		'ansi',
  		'ansi',
  		'ansi256',
  		'ansi16m'
  	];

  	const styles = Object.create(null);

  	const applyOptions = (object, options = {}) => {
  		if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
  			throw new Error('The `level` option should be an integer from 0 to 3');
  		}

  		// Detect level if not set manually
  		const colorLevel = stdoutColor ? stdoutColor.level : 0;
  		object.level = options.level === undefined ? colorLevel : options.level;
  	};

  	class ChalkClass {
  		constructor(options) {
  			// eslint-disable-next-line no-constructor-return
  			return chalkFactory(options);
  		}
  	}

  	const chalkFactory = options => {
  		const chalk = {};
  		applyOptions(chalk, options);

  		chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

  		Object.setPrototypeOf(chalk, Chalk.prototype);
  		Object.setPrototypeOf(chalk.template, chalk);

  		chalk.template.constructor = () => {
  			throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
  		};

  		chalk.template.Instance = ChalkClass;

  		return chalk.template;
  	};

  	function Chalk(options) {
  		return chalkFactory(options);
  	}

  	for (const [styleName, style] of Object.entries(ansiStyles)) {
  		styles[styleName] = {
  			get() {
  				const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
  				Object.defineProperty(this, styleName, {value: builder});
  				return builder;
  			}
  		};
  	}

  	styles.visible = {
  		get() {
  			const builder = createBuilder(this, this._styler, true);
  			Object.defineProperty(this, 'visible', {value: builder});
  			return builder;
  		}
  	};

  	const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

  	for (const model of usedModels) {
  		styles[model] = {
  			get() {
  				const {level} = this;
  				return function (...arguments_) {
  					const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
  					return createBuilder(this, styler, this._isEmpty);
  				};
  			}
  		};
  	}

  	for (const model of usedModels) {
  		const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
  		styles[bgModel] = {
  			get() {
  				const {level} = this;
  				return function (...arguments_) {
  					const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
  					return createBuilder(this, styler, this._isEmpty);
  				};
  			}
  		};
  	}

  	const proto = Object.defineProperties(() => {}, {
  		...styles,
  		level: {
  			enumerable: true,
  			get() {
  				return this._generator.level;
  			},
  			set(level) {
  				this._generator.level = level;
  			}
  		}
  	});

  	const createStyler = (open, close, parent) => {
  		let openAll;
  		let closeAll;
  		if (parent === undefined) {
  			openAll = open;
  			closeAll = close;
  		} else {
  			openAll = parent.openAll + open;
  			closeAll = close + parent.closeAll;
  		}

  		return {
  			open,
  			close,
  			openAll,
  			closeAll,
  			parent
  		};
  	};

  	const createBuilder = (self, _styler, _isEmpty) => {
  		const builder = (...arguments_) => {
  			if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
  				// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
  				return applyStyle(builder, chalkTag(builder, ...arguments_));
  			}

  			// Single argument is hot path, implicit coercion is faster than anything
  			// eslint-disable-next-line no-implicit-coercion
  			return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
  		};

  		// We alter the prototype because we must return a function, but there is
  		// no way to create a function with a different prototype
  		Object.setPrototypeOf(builder, proto);

  		builder._generator = self;
  		builder._styler = _styler;
  		builder._isEmpty = _isEmpty;

  		return builder;
  	};

  	const applyStyle = (self, string) => {
  		if (self.level <= 0 || !string) {
  			return self._isEmpty ? '' : string;
  		}

  		let styler = self._styler;

  		if (styler === undefined) {
  			return string;
  		}

  		const {openAll, closeAll} = styler;
  		if (string.indexOf('\u001B') !== -1) {
  			while (styler !== undefined) {
  				// Replace any instances already present with a re-opening code
  				// otherwise only the part of the string until said closing code
  				// will be colored, and the rest will simply be 'plain'.
  				string = stringReplaceAll(string, styler.close, styler.open);

  				styler = styler.parent;
  			}
  		}

  		// We can move both next actions out of loop, because remaining actions in loop won't have
  		// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
  		// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
  		const lfIndex = string.indexOf('\n');
  		if (lfIndex !== -1) {
  			string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  		}

  		return openAll + string + closeAll;
  	};

  	let template;
  	const chalkTag = (chalk, ...strings) => {
  		const [firstString] = strings;

  		if (!isArray(firstString) || !isArray(firstString.raw)) {
  			// If chalk() was called by itself or with a string,
  			// return the string itself as a string.
  			return strings.join(' ');
  		}

  		const arguments_ = strings.slice(1);
  		const parts = [firstString.raw[0]];

  		for (let i = 1; i < firstString.length; i++) {
  			parts.push(
  				String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
  				String(firstString.raw[i])
  			);
  		}

  		if (template === undefined) {
  			template = requireTemplates();
  		}

  		return template(chalk, parts.join(''));
  	};

  	Object.defineProperties(Chalk.prototype, styles);

  	const chalk = Chalk(); // eslint-disable-line new-cap
  	chalk.supportsColor = stdoutColor;
  	chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
  	chalk.stderr.supportsColor = stderrColor;

  	source = chalk;
  	return source;
  }

  var sourceExports = requireSource();
  var chalk = /*@__PURE__*/getDefaultExportFromCjs(sourceExports);

  // MIT License
  // Copyright (c) 2021 Emmadi Sumith Kumar
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  // SOFTWARE.
  /**
   * Convert JSON-like data or plain JavaScript objects to formatted plain text representation.
   *
   * @function jsonToPlainText
   * @param data {unknown} - The input data to convert. Can be JSON-like data or plain JavaScript objects.
   * @param options {Options} - (Optional) Configuration options for customizing the output.
   *   - color {boolean} - Whether to apply colors to the output (default: true).
   *   - spacing {boolean} - Whether to include spacing after colons (default: true).
   *   - seperator {string} -  seperator. Default ':',
   *   - squareBracketsForArray {boolean} - Whether to use square brackets for arrays (default: false).
   *   - doubleQuotesForKeys {boolean} - Whether to use double quotes for object keys (default: false).
   *   - doubleQuotesForValues {boolean} - Whether to use double quotes for string values (default: false).
   * @returns {string} - The formatted plain text representation of the input data.
   * @example
   * // Basic usage:
   * const data = { name: "John", age: 30, isEmployed: true };
   * const options = {
   *    color: true,
   *    spacing: true,
   *    seperator?: "=";
   *    squareBracketsForArray: false,
   *    doubleQuotesForKeys: false,
   *    doubleQuotesForValues: false,
   * }
   * const plainText = jsonToPlainText(data);
   * console.log(plainText);
   *
   * // Output:
   * //
   * //   name = "John",
   * //   age = 30,
   * //   isEmployed = true
   */
  function jsonToPlainText(data, options) {
      const visited = new Set();
      let indentLevel = 1;
      const defaultOptions = {
          color: true,
          spacing: true,
          seperator: ":",
          squareBracketsForArray: false,
          doubleQuotesForKeys: false,
          doubleQuotesForValues: false,
      };
      const mergedOptions = { ...defaultOptions, ...options }; // Merge user-provided options with default options
      const outputOptions = {
          color: mergedOptions.color,
          spacing: mergedOptions.spacing,
          seperator: mergedOptions.seperator,
          squareBracketsForArray: mergedOptions.squareBracketsForArray,
          doubleQuotesForKeys: mergedOptions.doubleQuotesForKeys,
          doubleQuotesForValues: mergedOptions.doubleQuotesForValues,
      };
      // Helper function to determine the type of a variable
      function getType(variable) {
          const type = typeof variable;
          // Identify the specific type for object-like variables (null, array, object, date, regexp)
          if (type === "object") {
              if (variable === null)
                  return "null";
              if (Array.isArray(variable))
                  return "array";
              if (variable instanceof Date)
                  return "date";
              if (variable instanceof RegExp)
                  return "regexp";
              return "object";
          }
          return type;
      }
      // Helper function to handle arrays
      function handleArray(arr) {
          let output = "";
          if (arr.length === 0) {
              output += "[]";
              return output;
          }
          arr.forEach((item, index) => {
              const handler = handlers[getType(item)];
              if (!handler) {
                  throw new Error("Unsupported data type: " + getType(item));
              }
              if (index === 0) {
                  output += handler(item, true);
              }
              else {
                  output += ", " + handler(item, true);
              }
          });
          return outputOptions.squareBracketsForArray ? "[ " + output + " ]" : output;
      }
      // Helper function to handle objects
      function handleObject(obj) {
          let output = "";
          if (Object.keys(obj).length === 0) {
              output += "{}";
              return output;
          }
          const keys = Object.keys(obj);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          keys.forEach((key, index) => {
              const value = obj[key];
              const handler = handlers[getType(value)];
              if (typeof value === "undefined") {
                  return;
              }
              if (!handler) {
                  throw new Error("Unsupported data type: " + getType(value));
              }
              if (key.length >= indentLevel) {
                  indentLevel = key.length;
              }
              output +=
                  "\n" +
                      (outputOptions.doubleQuotesForKeys
                          ? '"' + (outputOptions.color ? chalk.greenBright(key) : key) + '"'
                          : outputOptions.color
                              ? chalk.green(key)
                              : key) +
                      "}json-to-plain-text-special-string-" +
                      key.length +
                      "{" +
                      handler(value, true);
          });
          return output;
      }
      // Handlers for different data types
      const handlers = {
          // Handle cases where data is undefined or null
          undefined: function () {
              return outputOptions.color ? chalk.gray("null") : "null";
          },
          null: function () {
              return outputOptions.color ? chalk.gray("null") : "null";
          },
          // Handle numbers
          number: function (x) {
              return outputOptions.color
                  ? chalk.blueBright(x.toString())
                  : x.toString();
          },
          // Handle booleans
          boolean: function (x) {
              return outputOptions.color
                  ? chalk.magenta(x ? "true" : "false")
                  : x
                      ? "true"
                      : "false";
          },
          // Handle strings
          string: function (x) {
              const str = outputOptions.color
                  ? chalk.yellow(x.toString())
                  : x.toString();
              return outputOptions.doubleQuotesForValues ? '"' + str + '"' : str;
          },
          // Handle arrays, check for circular references
          array: function (x) {
              if (visited.has(x)) {
                  return outputOptions.color ? chalk.red("[Circular]") : "[Circular]";
              }
              visited.add(x);
              const output = handleArray(x);
              visited.delete(x);
              return output;
          },
          // Handle objects, check for circular references
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          object: function (x, inArray) {
              if (visited.has(x)) {
                  return outputOptions.color ? chalk.red("[Circular]") : "[Circular]";
              }
              visited.add(x);
              const output = handleObject(x);
              visited.delete(x);
              return output;
          },
          // Handle dates
          date: function (x) {
              return outputOptions.color
                  ? chalk.cyan(x.toISOString())
                  : x.toISOString();
          },
          // Handle regular expressions
          regexp: function (x) {
              return outputOptions.color ? chalk.redBright(x.toString()) : x.toString();
          },
          // Handle functions
          function: function () {
              return outputOptions.color
                  ? chalk.blue("[object Function]")
                  : "[object Function]";
          },
      };
      // Start the conversion with the root data and return the final result
      return handlers[getType(data)](data, false).replace(/}json-to-plain-text-special-string-(\d+){/g, (match, number) => {
          const space = parseInt(number, 10);
          return outputOptions.spacing
              ? " ".repeat(indentLevel - space) + ` ${outputOptions.seperator} `
              : ` ${outputOptions.seperator} `;
      });
  }

  var jsonToPrettyYaml = {};

  var remedial = {exports: {}};

  /*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */

  var hasRequiredRemedial;

  function requireRemedial () {
  	if (hasRequiredRemedial) return remedial.exports;
  	hasRequiredRemedial = 1;
  	(function () {

  	    var global = Function('return this')()
  	      , classes = "Boolean Number String Function Array Date RegExp Object".split(" ")
  	      , i
  	      , name
  	      , class2type = {}
  	      ;

  	    for (i in classes) {
  	      if (classes.hasOwnProperty(i)) {
  	        name = classes[i];
  	        class2type["[object " + name + "]"] = name.toLowerCase();
  	      }
  	    }

  	    function typeOf(obj) {
  	      return (null === obj || undefined === obj) ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
  	    }

  	    function isEmpty(o) {
  	        var i, v;
  	        if (typeOf(o) === 'object') {
  	            for (i in o) { // fails jslint
  	                v = o[i];
  	                if (v !== undefined && typeOf(v) !== 'function') {
  	                    return false;
  	                }
  	            }
  	        }
  	        return true;
  	    }

  	    if (!String.prototype.entityify) {
  	        String.prototype.entityify = function () {
  	            return this.replace(/&/g, "&amp;").replace(/</g,
  	                "&lt;").replace(/>/g, "&gt;");
  	        };
  	    }

  	    if (!String.prototype.quote) {
  	        String.prototype.quote = function () {
  	            var c, i, l = this.length, o = '"';
  	            for (i = 0; i < l; i += 1) {
  	                c = this.charAt(i);
  	                if (c >= ' ') {
  	                    if (c === '\\' || c === '"') {
  	                        o += '\\';
  	                    }
  	                    o += c;
  	                } else {
  	                    switch (c) {
  	                    case '\b':
  	                        o += '\\b';
  	                        break;
  	                    case '\f':
  	                        o += '\\f';
  	                        break;
  	                    case '\n':
  	                        o += '\\n';
  	                        break;
  	                    case '\r':
  	                        o += '\\r';
  	                        break;
  	                    case '\t':
  	                        o += '\\t';
  	                        break;
  	                    default:
  	                        c = c.charCodeAt();
  	                        o += '\\u00' + Math.floor(c / 16).toString(16) +
  	                            (c % 16).toString(16);
  	                    }
  	                }
  	            }
  	            return o + '"';
  	        };
  	    } 

  	    if (!String.prototype.supplant) {
  	        String.prototype.supplant = function (o) {
  	            return this.replace(/{([^{}]*)}/g,
  	                function (a, b) {
  	                    var r = o[b];
  	                    return typeof r === 'string' || typeof r === 'number' ? r : a;
  	                }
  	            );
  	        };
  	    }

  	    if (!String.prototype.trim) {
  	        String.prototype.trim = function () {
  	            return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
  	        };
  	    }

  	    // CommonJS / npm / Ender.JS
  	    remedial.exports = {
  	        typeOf: typeOf,
  	        isEmpty: isEmpty
  	    };
  	    global.typeOf = global.typeOf || typeOf;
  	    global.isEmpty = global.isEmpty || isEmpty;
  	}());
  	return remedial.exports;
  }

  var lib;
  var hasRequiredLib;

  function requireLib () {
  	if (hasRequiredLib) return lib;
  	hasRequiredLib = 1;

  	/**
  	 * removeTrailingSpaces
  	 * Remove the trailing spaces from a string.
  	 *
  	 * @name removeTrailingSpaces
  	 * @function
  	 * @param {String} input The input string.
  	 * @returns {String} The output string.
  	 */

  	lib = function removeTrailingSpaces(input) {
  	  // TODO If possible, use a regex
  	  return input.split("\n").map(function (x) {
  	    return x.trimRight();
  	  }).join("\n");
  	};
  	return lib;
  }

  var hasRequiredJsonToPrettyYaml;

  function requireJsonToPrettyYaml () {
  	if (hasRequiredJsonToPrettyYaml) return jsonToPrettyYaml;
  	hasRequiredJsonToPrettyYaml = 1;
  	(function() {

  	    var typeOf = requireRemedial().typeOf;
  	    var trimWhitespace = requireLib();

  	    function stringify(data) {
  	        var handlers, indentLevel = '';

  	        handlers = {
  	            "undefined": function() {
  	                // objects will not have `undefined` converted to `null`
  	                // as this may have unintended consequences
  	                // For arrays, however, this behavior seems appropriate
  	                return 'null';
  	            },
  	            "null": function() {
  	                return 'null';
  	            },
  	            "number": function(x) {
  	                return x;
  	            },
  	            "boolean": function(x) {
  	                return x ? 'true' : 'false';
  	            },
  	            "string": function(x) {
  	                // to avoid the string "true" being confused with the
  	                // the literal `true`, we always wrap strings in quotes
  	                return JSON.stringify(x);
  	            },
  	            "array": function(x) {
  	                var output = '';

  	                if (0 === x.length) {
  	                    output += '[]';
  	                    return output;
  	                }

  	                indentLevel = indentLevel.replace(/$/, '  ');
  	                x.forEach(function(y, i) {
  	                    // TODO how should `undefined` be handled?
  	                    var handler = handlers[typeOf(y)];

  	                    if (!handler) {
  	                        throw new Error('what the crap: ' + typeOf(y));
  	                    }

  	                    output += '\n' + indentLevel + '- ' + handler(y, true);

  	                });
  	                indentLevel = indentLevel.replace(/  /, '');

  	                return output;
  	            },
  	            "object": function(x, inArray, rootNode) {
  	                var output = '';

  	                if (0 === Object.keys(x).length) {
  	                    output += '{}';
  	                    return output;
  	                }

  	                if (!rootNode) {
  	                    indentLevel = indentLevel.replace(/$/, '  ');
  	                }

  	                Object.keys(x).forEach(function(k, i) {
  	                    var val = x[k],
  	                        handler = handlers[typeOf(val)];

  	                    if ('undefined' === typeof val) {
  	                        // the user should do
  	                        // delete obj.key
  	                        // and not
  	                        // obj.key = undefined
  	                        // but we'll error on the side of caution
  	                        return;
  	                    }

  	                    if (!handler) {
  	                        throw new Error('what the crap: ' + typeOf(val));
  	                    }

  	                    if (!(inArray && i === 0)) {
  	                        output += '\n' + indentLevel;
  	                    }

  	                    output += k + ': ' + handler(val);
  	                });
  	                indentLevel = indentLevel.replace(/  /, '');

  	                return output;
  	            },
  	            "function": function() {
  	                // TODO this should throw or otherwise be ignored
  	                return '[object Function]';
  	            }
  	        };

  	        return trimWhitespace(handlers[typeOf(data)](data, true, true) + '\n');
  	    }

  	    jsonToPrettyYaml.stringify = stringify;
  	}());
  	return jsonToPrettyYaml;
  }

  var jsonToPrettyYamlExports = requireJsonToPrettyYaml();

  // MIT License
  const countries = {
      AD: {
          name: "Andorra",
          native: "Andorra",
          phone: [376],
          continent: "EU",
          capital: "Andorra la Vella",
          currency: ["EUR"],
          languages: ["ca"],
          flag: "🇦🇩",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AD.svg",
      },
      AE: {
          name: "United Arab Emirates",
          native: "دولة الإمارات العربية المتحدة",
          phone: [971],
          continent: "AS",
          capital: "Abu Dhabi",
          currency: ["AED"],
          languages: ["ar"],
          flag: "🇦🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AE.svg",
      },
      AF: {
          name: "Afghanistan",
          native: "افغانستان",
          phone: [93],
          continent: "AS",
          capital: "Kabul",
          currency: ["AFN"],
          languages: ["ps", "uz", "tk"],
          flag: "🇦🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AF.svg",
      },
      AG: {
          name: "Antigua and Barbuda",
          native: "Antigua and Barbuda",
          phone: [1268],
          continent: "NA",
          capital: "Saint John's",
          currency: ["XCD"],
          languages: ["en"],
          flag: "🇦🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AG.svg",
      },
      AI: {
          name: "Anguilla",
          native: "Anguilla",
          phone: [1264],
          continent: "NA",
          capital: "The Valley",
          currency: ["XCD"],
          languages: ["en"],
          flag: "🇦🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AI.svg",
      },
      AL: {
          name: "Albania",
          native: "Shqipëria",
          phone: [355],
          continent: "EU",
          capital: "Tirana",
          currency: ["ALL"],
          languages: ["sq"],
          flag: "🇦🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AL.svg",
      },
      AM: {
          name: "Armenia",
          native: "Հայաստան",
          phone: [374],
          continent: "AS",
          capital: "Yerevan",
          currency: ["AMD"],
          languages: ["hy", "ru"],
          flag: "🇦🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AM.svg",
      },
      AO: {
          name: "Angola",
          native: "Angola",
          phone: [244],
          continent: "AF",
          capital: "Luanda",
          currency: ["AOA"],
          languages: ["pt"],
          flag: "🇦🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AO.svg",
      },
      AQ: {
          name: "Antarctica",
          native: "Antarctica",
          phone: [672],
          continent: "AN",
          capital: "",
          currency: [],
          languages: [],
          flag: "🇦🇶",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AQ.svg",
      },
      AR: {
          name: "Argentina",
          native: "Argentina",
          phone: [54],
          continent: "SA",
          capital: "Buenos Aires",
          currency: ["ARS"],
          languages: ["es", "gn"],
          flag: "🇦🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AR.svg",
      },
      AS: {
          name: "American Samoa",
          native: "American Samoa",
          phone: [1684],
          continent: "OC",
          capital: "Pago Pago",
          currency: ["USD"],
          languages: ["en", "sm"],
          flag: "🇦🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AS.svg",
      },
      AT: {
          name: "Austria",
          native: "Österreich",
          phone: [43],
          continent: "EU",
          capital: "Vienna",
          currency: ["EUR"],
          languages: ["de"],
          flag: "🇦🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AT.svg",
      },
      AU: {
          name: "Australia",
          native: "Australia",
          phone: [61],
          continent: "OC",
          capital: "Canberra",
          currency: ["AUD"],
          languages: ["en"],
          flag: "🇦🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AU.svg",
      },
      AW: {
          name: "Aruba",
          native: "Aruba",
          phone: [297],
          continent: "NA",
          capital: "Oranjestad",
          currency: ["AWG"],
          languages: ["nl", "pa"],
          flag: "🇦🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AW.svg",
      },
      AX: {
          name: "Åland",
          native: "Åland",
          phone: [358],
          continent: "EU",
          capital: "Mariehamn",
          currency: ["EUR"],
          languages: ["sv"],
          flag: "🇦🇽",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AX.svg",
      },
      AZ: {
          name: "Azerbaijan",
          native: "Azərbaycan",
          phone: [994],
          continent: "AS",
          capital: "Baku",
          currency: ["AZN"],
          languages: ["az"],
          flag: "🇦🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AZ.svg",
      },
      BA: {
          name: "Bosnia and Herzegovina",
          native: "Bosna i Hercegovina",
          phone: [387],
          continent: "EU",
          capital: "Sarajevo",
          currency: ["BAM"],
          languages: ["bs", "hr", "sr"],
          flag: "🇧🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BA.svg",
      },
      BB: {
          name: "Barbados",
          native: "Barbados",
          phone: [1246],
          continent: "NA",
          capital: "Bridgetown",
          currency: ["BBD"],
          languages: ["en"],
          flag: "🇧🇧",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BB.svg",
      },
      BD: {
          name: "Bangladesh",
          native: "Bangladesh",
          phone: [880],
          continent: "AS",
          capital: "Dhaka",
          currency: ["BDT"],
          languages: ["bn"],
          flag: "🇧🇩",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BD.svg",
      },
      BE: {
          name: "Belgium",
          native: "België",
          phone: [32],
          continent: "EU",
          capital: "Brussels",
          currency: ["EUR"],
          languages: ["nl", "fr", "de"],
          flag: "🇧🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BE.svg",
      },
      BF: {
          name: "Burkina Faso",
          native: "Burkina Faso",
          phone: [226],
          continent: "AF",
          capital: "Ouagadougou",
          currency: ["XOF"],
          languages: ["fr", "ff"],
          flag: "🇧🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BF.svg",
      },
      BG: {
          name: "Bulgaria",
          native: "България",
          phone: [359],
          continent: "EU",
          capital: "Sofia",
          currency: ["BGN"],
          languages: ["bg"],
          flag: "🇧🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BG.svg",
      },
      BH: {
          name: "Bahrain",
          native: "‏البحرين",
          phone: [973],
          continent: "AS",
          capital: "Manama",
          currency: ["BHD"],
          languages: ["ar"],
          flag: "🇧🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BH.svg",
      },
      BI: {
          name: "Burundi",
          native: "Burundi",
          phone: [257],
          continent: "AF",
          capital: "Bujumbura",
          currency: ["BIF"],
          languages: ["fr", "rn"],
          flag: "🇧🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BI.svg",
      },
      BJ: {
          name: "Benin",
          native: "Bénin",
          phone: [229],
          continent: "AF",
          capital: "Porto-Novo",
          currency: ["XOF"],
          languages: ["fr"],
          flag: "🇧🇯",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BJ.svg",
      },
      BL: {
          name: "Saint Barthélemy",
          native: "Saint-Barthélemy",
          phone: [590],
          continent: "NA",
          capital: "Gustavia",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇧🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BL.svg",
      },
      BM: {
          name: "Bermuda",
          native: "Bermuda",
          phone: [1441],
          continent: "NA",
          capital: "Hamilton",
          currency: ["BMD"],
          languages: ["en"],
          flag: "🇧🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BM.svg",
      },
      BN: {
          name: "Brunei",
          native: "Negara Brunei Darussalam",
          phone: [673],
          continent: "AS",
          capital: "Bandar Seri Begawan",
          currency: ["BND"],
          languages: ["ms"],
          flag: "🇧🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BN.svg",
      },
      BO: {
          name: "Bolivia",
          native: "Bolivia",
          phone: [591],
          continent: "SA",
          capital: "Sucre",
          currency: ["BOB", "BOV"],
          languages: ["es", "ay", "qu"],
          flag: "🇧🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BO.svg",
      },
      BQ: {
          name: "Bonaire",
          native: "Bonaire",
          phone: [5997],
          continent: "NA",
          capital: "Kralendijk",
          currency: ["USD"],
          languages: ["nl"],
          flag: "🇧🇶",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BQ.svg",
      },
      BR: {
          name: "Brazil",
          native: "Brasil",
          phone: [55],
          continent: "SA",
          capital: "Brasília",
          currency: ["BRL"],
          languages: ["pt"],
          flag: "🇧🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BR.svg",
      },
      BS: {
          name: "Bahamas",
          native: "Bahamas",
          phone: [1242],
          continent: "NA",
          capital: "Nassau",
          currency: ["BSD"],
          languages: ["en"],
          flag: "🇧🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BS.svg",
      },
      BT: {
          name: "Bhutan",
          native: "ʼbrug-yul",
          phone: [975],
          continent: "AS",
          capital: "Thimphu",
          currency: ["BTN", "INR"],
          languages: ["dz"],
          flag: "🇧🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BT.svg",
      },
      BV: {
          name: "Bouvet Island",
          native: "Bouvetøya",
          phone: [47],
          continent: "AN",
          capital: "",
          currency: ["NOK"],
          languages: ["no", "nb", "nn"],
          flag: "🇧🇻",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BV.svg",
      },
      BW: {
          name: "Botswana",
          native: "Botswana",
          phone: [267],
          continent: "AF",
          capital: "Gaborone",
          currency: ["BWP"],
          languages: ["en", "tn"],
          flag: "🇧🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BW.svg",
      },
      BY: {
          name: "Belarus",
          native: "Белару́сь",
          phone: [375],
          continent: "EU",
          capital: "Minsk",
          currency: ["BYN"],
          languages: ["be", "ru"],
          flag: "🇧🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BY.svg",
      },
      BZ: {
          name: "Belize",
          native: "Belize",
          phone: [501],
          continent: "NA",
          capital: "Belmopan",
          currency: ["BZD"],
          languages: ["en", "es"],
          flag: "🇧🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/BZ.svg",
      },
      CA: {
          name: "Canada",
          native: "Canada",
          phone: [1],
          continent: "NA",
          capital: "Ottawa",
          currency: ["CAD"],
          languages: ["en", "fr"],
          flag: "🇨🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CA.svg",
      },
      CC: {
          name: "Cocos [Keeling] Islands",
          native: "Cocos (Keeling) Islands",
          phone: [61],
          continent: "AS",
          capital: "West Island",
          currency: ["AUD"],
          languages: ["en"],
          flag: "🇨🇨",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CC.svg",
      },
      CD: {
          name: "Democratic Republic of the Congo",
          native: "République démocratique du Congo",
          phone: [243],
          continent: "AF",
          capital: "Kinshasa",
          currency: ["CDF"],
          languages: ["fr", "ln", "kg", "sw", "lu"],
          flag: "🇨🇩",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CD.svg",
      },
      CF: {
          name: "Central African Republic",
          native: "Ködörösêse tî Bêafrîka",
          phone: [236],
          continent: "AF",
          capital: "Bangui",
          currency: ["XAF"],
          languages: ["fr", "sg"],
          flag: "🇨🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CF.svg",
      },
      CG: {
          name: "Republic of the Congo",
          native: "République du Congo",
          phone: [242],
          continent: "AF",
          capital: "Brazzaville",
          currency: ["XAF"],
          languages: ["fr", "ln"],
          flag: "🇨🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CG.svg",
      },
      CH: {
          name: "Switzerland",
          native: "Schweiz",
          phone: [41],
          continent: "EU",
          capital: "Bern",
          currency: ["CHE", "CHF", "CHW"],
          languages: ["de", "fr", "it"],
          flag: "🇨🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CH.svg",
      },
      CI: {
          name: "Ivory Coast",
          native: "Côte d'Ivoire",
          phone: [225],
          continent: "AF",
          capital: "Yamoussoukro",
          currency: ["XOF"],
          languages: ["fr"],
          flag: "🇨🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CI.svg",
      },
      CK: {
          name: "Cook Islands",
          native: "Cook Islands",
          phone: [682],
          continent: "OC",
          capital: "Avarua",
          currency: ["NZD"],
          languages: ["en"],
          flag: "🇨🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CK.svg",
      },
      CL: {
          name: "Chile",
          native: "Chile",
          phone: [56],
          continent: "SA",
          capital: "Santiago",
          currency: ["CLF", "CLP"],
          languages: ["es"],
          flag: "🇨🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CL.svg",
      },
      CM: {
          name: "Cameroon",
          native: "Cameroon",
          phone: [237],
          continent: "AF",
          capital: "Yaoundé",
          currency: ["XAF"],
          languages: ["en", "fr"],
          flag: "🇨🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CM.svg",
      },
      CN: {
          name: "China",
          native: "中国",
          phone: [86],
          continent: "AS",
          capital: "Beijing",
          currency: ["CNY"],
          languages: ["zh"],
          flag: "🇨🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CN.svg",
      },
      CO: {
          name: "Colombia",
          native: "Colombia",
          phone: [57],
          continent: "SA",
          capital: "Bogotá",
          currency: ["COP"],
          languages: ["es"],
          flag: "🇨🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CO.svg",
      },
      CR: {
          name: "Costa Rica",
          native: "Costa Rica",
          phone: [506],
          continent: "NA",
          capital: "San José",
          currency: ["CRC"],
          languages: ["es"],
          flag: "🇨🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CR.svg",
      },
      CU: {
          name: "Cuba",
          native: "Cuba",
          phone: [53],
          continent: "NA",
          capital: "Havana",
          currency: ["CUC", "CUP"],
          languages: ["es"],
          flag: "🇨🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CU.svg",
      },
      CV: {
          name: "Cape Verde",
          native: "Cabo Verde",
          phone: [238],
          continent: "AF",
          capital: "Praia",
          currency: ["CVE"],
          languages: ["pt"],
          flag: "🇨🇻",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CV.svg",
      },
      CW: {
          name: "Curacao",
          native: "Curaçao",
          phone: [5999],
          continent: "NA",
          capital: "Willemstad",
          currency: ["ANG"],
          languages: ["nl", "pa", "en"],
          flag: "🇨🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CW.svg",
      },
      CX: {
          name: "Christmas Island",
          native: "Christmas Island",
          phone: [61],
          continent: "AS",
          capital: "Flying Fish Cove",
          currency: ["AUD"],
          languages: ["en"],
          flag: "🇨🇽",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CX.svg",
      },
      CY: {
          name: "Cyprus",
          native: "Κύπρος",
          phone: [357],
          continent: "EU",
          capital: "Nicosia",
          currency: ["EUR"],
          languages: ["el", "tr", "hy"],
          flag: "🇨🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CY.svg",
      },
      CZ: {
          name: "Czech Republic",
          native: "Česká republika",
          phone: [420],
          continent: "EU",
          capital: "Prague",
          currency: ["CZK"],
          languages: ["cs"],
          flag: "🇨🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CZ.svg",
      },
      DE: {
          name: "Germany",
          native: "Deutschland",
          phone: [49],
          continent: "EU",
          capital: "Berlin",
          currency: ["EUR"],
          languages: ["de"],
          flag: "🇩🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/DE.svg",
      },
      DJ: {
          name: "Djibouti",
          native: "Djibouti",
          phone: [253],
          continent: "AF",
          capital: "Djibouti",
          currency: ["DJF"],
          languages: ["fr", "ar"],
          flag: "🇩🇯",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/DJ.svg",
      },
      DK: {
          name: "Denmark",
          native: "Danmark",
          phone: [45],
          continent: "EU",
          capital: "Copenhagen",
          currency: ["DKK"],
          languages: ["da"],
          flag: "🇩🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/DK.svg",
      },
      DM: {
          name: "Dominica",
          native: "Dominica",
          phone: [1767],
          continent: "NA",
          capital: "Roseau",
          currency: ["XCD"],
          languages: ["en"],
          flag: "🇩🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/DM.svg",
      },
      DO: {
          name: "Dominican Republic",
          native: "República Dominicana",
          phone: [1809, 1829, 1849],
          continent: "NA",
          capital: "Santo Domingo",
          currency: ["DOP"],
          languages: ["es"],
          flag: "🇩🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/DO.svg",
      },
      DZ: {
          name: "Algeria",
          native: "الجزائر",
          phone: [213],
          continent: "AF",
          capital: "Algiers",
          currency: ["DZD"],
          languages: ["ar"],
          flag: "🇩🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/DZ.svg",
      },
      EC: {
          name: "Ecuador",
          native: "Ecuador",
          phone: [593],
          continent: "SA",
          capital: "Quito",
          currency: ["USD"],
          languages: ["es"],
          flag: "🇪🇨",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/EC.svg",
      },
      EE: {
          name: "Estonia",
          native: "Eesti",
          phone: [372],
          continent: "EU",
          capital: "Tallinn",
          currency: ["EUR"],
          languages: ["et"],
          flag: "🇪🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/EE.svg",
      },
      EG: {
          name: "Egypt",
          native: "مصر‎",
          phone: [20],
          continent: "AF",
          capital: "Cairo",
          currency: ["EGP"],
          languages: ["ar"],
          flag: "🇪🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/EG.svg",
      },
      EH: {
          name: "Western Sahara",
          native: "الصحراء الغربية",
          phone: [212],
          continent: "AF",
          capital: "El Aaiún",
          currency: ["MAD", "DZD", "MRU"],
          languages: ["es"],
          flag: "🇪🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/EH.svg",
      },
      ER: {
          name: "Eritrea",
          native: "ኤርትራ",
          phone: [291],
          continent: "AF",
          capital: "Asmara",
          currency: ["ERN"],
          languages: ["ti", "ar", "en"],
          flag: "🇪🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ER.svg",
      },
      ES: {
          name: "Spain",
          native: "España",
          phone: [34],
          continent: "EU",
          capital: "Madrid",
          currency: ["EUR"],
          languages: ["es", "eu", "ca", "gl", "oc"],
          flag: "🇪🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ES.svg",
      },
      ET: {
          name: "Ethiopia",
          native: "ኢትዮጵያ",
          phone: [251],
          continent: "AF",
          capital: "Addis Ababa",
          currency: ["ETB"],
          languages: ["am"],
          flag: "🇪🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ET.svg",
      },
      FI: {
          name: "Finland",
          native: "Suomi",
          phone: [358],
          continent: "EU",
          capital: "Helsinki",
          currency: ["EUR"],
          languages: ["fi", "sv"],
          flag: "🇫🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/FI.svg",
      },
      FJ: {
          name: "Fiji",
          native: "Fiji",
          phone: [679],
          continent: "OC",
          capital: "Suva",
          currency: ["FJD"],
          languages: ["en", "fj", "hi", "ur"],
          flag: "🇫🇯",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/FJ.svg",
      },
      FK: {
          name: "Falkland Islands",
          native: "Falkland Islands",
          phone: [500],
          continent: "SA",
          capital: "Stanley",
          currency: ["FKP"],
          languages: ["en"],
          flag: "🇫🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/FK.svg",
      },
      FM: {
          name: "Micronesia",
          native: "Micronesia",
          phone: [691],
          continent: "OC",
          capital: "Palikir",
          currency: ["USD"],
          languages: ["en"],
          flag: "🇫🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/FM.svg",
      },
      FO: {
          name: "Faroe Islands",
          native: "Føroyar",
          phone: [298],
          continent: "EU",
          capital: "Tórshavn",
          currency: ["DKK"],
          languages: ["fo"],
          flag: "🇫🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/FO.svg",
      },
      FR: {
          name: "France",
          native: "France",
          phone: [33],
          continent: "EU",
          capital: "Paris",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇫🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/FR.svg",
      },
      GA: {
          name: "Gabon",
          native: "Gabon",
          phone: [241],
          continent: "AF",
          capital: "Libreville",
          currency: ["XAF"],
          languages: ["fr"],
          flag: "🇬🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GA.svg",
      },
      GB: {
          name: "United Kingdom",
          native: "United Kingdom",
          phone: [44],
          continent: "EU",
          capital: "London",
          currency: ["GBP"],
          languages: ["en"],
          flag: "🇬🇧",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GB.svg",
      },
      GD: {
          name: "Grenada",
          native: "Grenada",
          phone: [1473],
          continent: "NA",
          capital: "St. George's",
          currency: ["XCD"],
          languages: ["en"],
          flag: "🇬🇩",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GD.svg",
      },
      GE: {
          name: "Georgia",
          native: "საქართველო",
          phone: [995],
          continent: "AS",
          capital: "Tbilisi",
          currency: ["GEL"],
          languages: ["ka"],
          flag: "🇬🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GE.svg",
      },
      GF: {
          name: "French Guiana",
          native: "Guyane française",
          phone: [594],
          continent: "SA",
          capital: "Cayenne",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇬🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GF.svg",
      },
      GG: {
          name: "Guernsey",
          native: "Guernsey",
          phone: [44],
          continent: "EU",
          capital: "St. Peter Port",
          currency: ["GBP"],
          languages: ["en", "fr"],
          flag: "🇬🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GG.svg",
      },
      GH: {
          name: "Ghana",
          native: "Ghana",
          phone: [233],
          continent: "AF",
          capital: "Accra",
          currency: ["GHS"],
          languages: ["en"],
          flag: "🇬🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GH.svg",
      },
      GI: {
          name: "Gibraltar",
          native: "Gibraltar",
          phone: [350],
          continent: "EU",
          capital: "Gibraltar",
          currency: ["GIP"],
          languages: ["en"],
          flag: "🇬🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GI.svg",
      },
      GL: {
          name: "Greenland",
          native: "Kalaallit Nunaat",
          phone: [299],
          continent: "NA",
          capital: "Nuuk",
          currency: ["DKK"],
          languages: ["kl"],
          flag: "🇬🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GL.svg",
      },
      GM: {
          name: "Gambia",
          native: "Gambia",
          phone: [220],
          continent: "AF",
          capital: "Banjul",
          currency: ["GMD"],
          languages: ["en"],
          flag: "🇬🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GM.svg",
      },
      GN: {
          name: "Guinea",
          native: "Guinée",
          phone: [224],
          continent: "AF",
          capital: "Conakry",
          currency: ["GNF"],
          languages: ["fr", "ff"],
          flag: "🇬🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GN.svg",
      },
      GP: {
          name: "Guadeloupe",
          native: "Guadeloupe",
          phone: [590],
          continent: "NA",
          capital: "Basse-Terre",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇬🇵",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GP.svg",
      },
      GQ: {
          name: "Equatorial Guinea",
          native: "Guinea Ecuatorial",
          phone: [240],
          continent: "AF",
          capital: "Malabo",
          currency: ["XAF"],
          languages: ["es", "fr"],
          flag: "🇬🇶",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GQ.svg",
      },
      GR: {
          name: "Greece",
          native: "Ελλάδα",
          phone: [30],
          continent: "EU",
          capital: "Athens",
          currency: ["EUR"],
          languages: ["el"],
          flag: "🇬🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GR.svg",
      },
      GS: {
          name: "South Georgia and the South Sandwich Islands",
          native: "South Georgia",
          phone: [500],
          continent: "AN",
          capital: "King Edward Point",
          currency: ["GBP"],
          languages: ["en"],
          flag: "🇬🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GS.svg",
      },
      GT: {
          name: "Guatemala",
          native: "Guatemala",
          phone: [502],
          continent: "NA",
          capital: "Guatemala City",
          currency: ["GTQ"],
          languages: ["es"],
          flag: "🇬🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GT.svg",
      },
      GU: {
          name: "Guam",
          native: "Guam",
          phone: [1671],
          continent: "OC",
          capital: "Hagåtña",
          currency: ["USD"],
          languages: ["en", "ch", "es"],
          flag: "🇬🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GU.svg",
      },
      GW: {
          name: "Guinea-Bissau",
          native: "Guiné-Bissau",
          phone: [245],
          continent: "AF",
          capital: "Bissau",
          currency: ["XOF"],
          languages: ["pt"],
          flag: "🇬🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GW.svg",
      },
      GY: {
          name: "Guyana",
          native: "Guyana",
          phone: [592],
          continent: "SA",
          capital: "Georgetown",
          currency: ["GYD"],
          languages: ["en"],
          flag: "🇬🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GY.svg",
      },
      HK: {
          name: "Hong Kong",
          native: "香港",
          phone: [852],
          continent: "AS",
          capital: "City of Victoria",
          currency: ["HKD"],
          languages: ["zh", "en"],
          flag: "🇭🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/HK.svg",
      },
      HM: {
          name: "Heard Island and McDonald Islands",
          native: "Heard Island and McDonald Islands",
          phone: [61],
          continent: "AN",
          capital: "",
          currency: ["AUD"],
          languages: ["en"],
          flag: "🇭🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/HM.svg",
      },
      HN: {
          name: "Honduras",
          native: "Honduras",
          phone: [504],
          continent: "NA",
          capital: "Tegucigalpa",
          currency: ["HNL"],
          languages: ["es"],
          flag: "🇭🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/HN.svg",
      },
      HR: {
          name: "Croatia",
          native: "Hrvatska",
          phone: [385],
          continent: "EU",
          capital: "Zagreb",
          currency: ["HRK"],
          languages: ["hr"],
          flag: "🇭🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/HR.svg",
      },
      HT: {
          name: "Haiti",
          native: "Haïti",
          phone: [509],
          continent: "NA",
          capital: "Port-au-Prince",
          currency: ["HTG", "USD"],
          languages: ["fr", "ht"],
          flag: "🇭🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/HT.svg",
      },
      HU: {
          name: "Hungary",
          native: "Magyarország",
          phone: [36],
          continent: "EU",
          capital: "Budapest",
          currency: ["HUF"],
          languages: ["hu"],
          flag: "🇭🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/HU.svg",
      },
      ID: {
          name: "Indonesia",
          native: "Indonesia",
          phone: [62],
          continent: "AS",
          capital: "Jakarta",
          currency: ["IDR"],
          languages: ["id"],
          flag: "🇮🇩",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ID.svg",
      },
      IE: {
          name: "Ireland",
          native: "Éire",
          phone: [353],
          continent: "EU",
          capital: "Dublin",
          currency: ["EUR"],
          languages: ["ga", "en"],
          flag: "🇮🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IE.svg",
      },
      IL: {
          name: "Israel",
          native: "יִשְׂרָאֵל",
          phone: [972],
          continent: "AS",
          capital: "Jerusalem",
          currency: ["ILS"],
          languages: ["he", "ar"],
          flag: "🇮🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IL.svg",
      },
      IM: {
          name: "Isle of Man",
          native: "Isle of Man",
          phone: [44],
          continent: "EU",
          capital: "Douglas",
          currency: ["GBP"],
          languages: ["en", "gv"],
          flag: "🇮🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IM.svg",
      },
      IN: {
          name: "India",
          native: "भारत",
          phone: [91],
          continent: "AS",
          capital: "New Delhi",
          currency: ["INR"],
          languages: ["hi", "en"],
          flag: "🇮🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IN.svg",
      },
      IO: {
          name: "British Indian Ocean Territory",
          native: "British Indian Ocean Territory",
          phone: [246],
          continent: "AS",
          capital: "Diego Garcia",
          currency: ["USD"],
          languages: ["en"],
          flag: "🇮🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IO.svg",
      },
      IQ: {
          name: "Iraq",
          native: "العراق",
          phone: [964],
          continent: "AS",
          capital: "Baghdad",
          currency: ["IQD"],
          languages: ["ar", "ku"],
          flag: "🇮🇶",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IQ.svg",
      },
      IR: {
          name: "Iran",
          native: "ایران",
          phone: [98],
          continent: "AS",
          capital: "Tehran",
          currency: ["IRR"],
          languages: ["fa"],
          flag: "🇮🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IR.svg",
      },
      IS: {
          name: "Iceland",
          native: "Ísland",
          phone: [354],
          continent: "EU",
          capital: "Reykjavik",
          currency: ["ISK"],
          languages: ["is"],
          flag: "🇮🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IS.svg",
      },
      IT: {
          name: "Italy",
          native: "Italia",
          phone: [39],
          continent: "EU",
          capital: "Rome",
          currency: ["EUR"],
          languages: ["it"],
          flag: "🇮🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/IT.svg",
      },
      JE: {
          name: "Jersey",
          native: "Jersey",
          phone: [44],
          continent: "EU",
          capital: "Saint Helier",
          currency: ["GBP"],
          languages: ["en", "fr"],
          flag: "🇯🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/JE.svg",
      },
      JM: {
          name: "Jamaica",
          native: "Jamaica",
          phone: [1876],
          continent: "NA",
          capital: "Kingston",
          currency: ["JMD"],
          languages: ["en"],
          flag: "🇯🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/JM.svg",
      },
      JO: {
          name: "Jordan",
          native: "الأردن",
          phone: [962],
          continent: "AS",
          capital: "Amman",
          currency: ["JOD"],
          languages: ["ar"],
          flag: "🇯🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/JO.svg",
      },
      JP: {
          name: "Japan",
          native: "日本",
          phone: [81],
          continent: "AS",
          capital: "Tokyo",
          currency: ["JPY"],
          languages: ["ja"],
          flag: "🇯🇵",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/JP.svg",
      },
      KE: {
          name: "Kenya",
          native: "Kenya",
          phone: [254],
          continent: "AF",
          capital: "Nairobi",
          currency: ["KES"],
          languages: ["en", "sw"],
          flag: "🇰🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KE.svg",
      },
      KG: {
          name: "Kyrgyzstan",
          native: "Кыргызстан",
          phone: [996],
          continent: "AS",
          capital: "Bishkek",
          currency: ["KGS"],
          languages: ["ky", "ru"],
          flag: "🇰🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KG.svg",
      },
      KH: {
          name: "Cambodia",
          native: "Kâmpŭchéa",
          phone: [855],
          continent: "AS",
          capital: "Phnom Penh",
          currency: ["KHR"],
          languages: ["km"],
          flag: "🇰🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KH.svg",
      },
      KI: {
          name: "Kiribati",
          native: "Kiribati",
          phone: [686],
          continent: "OC",
          capital: "South Tarawa",
          currency: ["AUD"],
          languages: ["en"],
          flag: "🇰🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KI.svg",
      },
      KM: {
          name: "Comoros",
          native: "Komori",
          phone: [269],
          continent: "AF",
          capital: "Moroni",
          currency: ["KMF"],
          languages: ["ar", "fr"],
          flag: "🇰🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KM.svg",
      },
      KN: {
          name: "Saint Kitts and Nevis",
          native: "Saint Kitts and Nevis",
          phone: [1869],
          continent: "NA",
          capital: "Basseterre",
          currency: ["XCD"],
          languages: ["en"],
          flag: "🇰🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KN.svg",
      },
      KP: {
          name: "North Korea",
          native: "북한",
          phone: [850],
          continent: "AS",
          capital: "Pyongyang",
          currency: ["KPW"],
          languages: ["ko"],
          flag: "🇰🇵",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KP.svg",
      },
      KR: {
          name: "South Korea",
          native: "대한민국",
          phone: [82],
          continent: "AS",
          capital: "Seoul",
          currency: ["KRW"],
          languages: ["ko"],
          flag: "🇰🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KR.svg",
      },
      KW: {
          name: "Kuwait",
          native: "الكويت",
          phone: [965],
          continent: "AS",
          capital: "Kuwait City",
          currency: ["KWD"],
          languages: ["ar"],
          flag: "🇰🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KW.svg",
      },
      KY: {
          name: "Cayman Islands",
          native: "Cayman Islands",
          phone: [1345],
          continent: "NA",
          capital: "George Town",
          currency: ["KYD"],
          languages: ["en"],
          flag: "🇰🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KY.svg",
      },
      KZ: {
          name: "Kazakhstan",
          native: "Қазақстан",
          phone: [76, 77],
          continent: "AS",
          capital: "Astana",
          currency: ["KZT"],
          languages: ["kk", "ru"],
          flag: "🇰🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/KZ.svg",
      },
      LA: {
          name: "Laos",
          native: "ສປປລາວ",
          phone: [856],
          continent: "AS",
          capital: "Vientiane",
          currency: ["LAK"],
          languages: ["lo"],
          flag: "🇱🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LA.svg",
      },
      LB: {
          name: "Lebanon",
          native: "لبنان",
          phone: [961],
          continent: "AS",
          capital: "Beirut",
          currency: ["LBP"],
          languages: ["ar", "fr"],
          flag: "🇱🇧",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LB.svg",
      },
      LC: {
          name: "Saint Lucia",
          native: "Saint Lucia",
          phone: [1758],
          continent: "NA",
          capital: "Castries",
          currency: ["XCD"],
          languages: ["en"],
          flag: "🇱🇨",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LC.svg",
      },
      LI: {
          name: "Liechtenstein",
          native: "Liechtenstein",
          phone: [423],
          continent: "EU",
          capital: "Vaduz",
          currency: ["CHF"],
          languages: ["de"],
          flag: "🇱🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LI.svg",
      },
      LK: {
          name: "Sri Lanka",
          native: "śrī laṃkāva",
          phone: [94],
          continent: "AS",
          capital: "Colombo",
          currency: ["LKR"],
          languages: ["si", "ta"],
          flag: "🇱🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LK.svg",
      },
      LR: {
          name: "Liberia",
          native: "Liberia",
          phone: [231],
          continent: "AF",
          capital: "Monrovia",
          currency: ["LRD"],
          languages: ["en"],
          flag: "🇱🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LR.svg",
      },
      LS: {
          name: "Lesotho",
          native: "Lesotho",
          phone: [266],
          continent: "AF",
          capital: "Maseru",
          currency: ["LSL", "ZAR"],
          languages: ["en", "st"],
          flag: "🇱🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LS.svg",
      },
      LT: {
          name: "Lithuania",
          native: "Lietuva",
          phone: [370],
          continent: "EU",
          capital: "Vilnius",
          currency: ["EUR"],
          languages: ["lt"],
          flag: "🇱🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LT.svg",
      },
      LU: {
          name: "Luxembourg",
          native: "Luxembourg",
          phone: [352],
          continent: "EU",
          capital: "Luxembourg",
          currency: ["EUR"],
          languages: ["fr", "de", "lb"],
          flag: "🇱🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LU.svg",
      },
      LV: {
          name: "Latvia",
          native: "Latvija",
          phone: [371],
          continent: "EU",
          capital: "Riga",
          currency: ["EUR"],
          languages: ["lv"],
          flag: "🇱🇻",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LV.svg",
      },
      LY: {
          name: "Libya",
          native: "‏ليبيا",
          phone: [218],
          continent: "AF",
          capital: "Tripoli",
          currency: ["LYD"],
          languages: ["ar"],
          flag: "🇱🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/LY.svg",
      },
      MA: {
          name: "Morocco",
          native: "المغرب",
          phone: [212],
          continent: "AF",
          capital: "Rabat",
          currency: ["MAD"],
          languages: ["ar"],
          flag: "🇲🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MA.svg",
      },
      MC: {
          name: "Monaco",
          native: "Monaco",
          phone: [377],
          continent: "EU",
          capital: "Monaco",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇲🇨",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MC.svg",
      },
      MD: {
          name: "Moldova",
          native: "Moldova",
          phone: [373],
          continent: "EU",
          capital: "Chișinău",
          currency: ["MDL"],
          languages: ["ro"],
          flag: "🇲🇩",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MD.svg",
      },
      ME: {
          name: "Montenegro",
          native: "Црна Гора",
          phone: [382],
          continent: "EU",
          capital: "Podgorica",
          currency: ["EUR"],
          languages: ["sr", "bs", "sq", "hr"],
          flag: "🇲🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ME.svg",
      },
      MF: {
          name: "Saint Martin",
          native: "Saint-Martin",
          phone: [590],
          continent: "NA",
          capital: "Marigot",
          currency: ["EUR"],
          languages: ["en", "fr", "nl"],
          flag: "🇲🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MF.svg",
      },
      MG: {
          name: "Madagascar",
          native: "Madagasikara",
          phone: [261],
          continent: "AF",
          capital: "Antananarivo",
          currency: ["MGA"],
          languages: ["fr", "mg"],
          flag: "🇲🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MG.svg",
      },
      MH: {
          name: "Marshall Islands",
          native: "M̧ajeļ",
          phone: [692],
          continent: "OC",
          capital: "Majuro",
          currency: ["USD"],
          languages: ["en", "mh"],
          flag: "🇲🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MH.svg",
      },
      MK: {
          name: "North Macedonia",
          native: "Северна Македонија",
          phone: [389],
          continent: "EU",
          capital: "Skopje",
          currency: ["MKD"],
          languages: ["mk"],
          flag: "🇲🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MK.svg",
      },
      ML: {
          name: "Mali",
          native: "Mali",
          phone: [223],
          continent: "AF",
          capital: "Bamako",
          currency: ["XOF"],
          languages: ["fr"],
          flag: "🇲🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ML.svg",
      },
      MM: {
          name: "Myanmar [Burma]",
          native: "မြန်မာ",
          phone: [95],
          continent: "AS",
          capital: "Naypyidaw",
          currency: ["MMK"],
          languages: ["my"],
          flag: "🇲🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MM.svg",
      },
      MN: {
          name: "Mongolia",
          native: "Монгол улс",
          phone: [976],
          continent: "AS",
          capital: "Ulan Bator",
          currency: ["MNT"],
          languages: ["mn"],
          flag: "🇲🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MN.svg",
      },
      MO: {
          name: "Macao",
          native: "澳門",
          phone: [853],
          continent: "AS",
          capital: "",
          currency: ["MOP"],
          languages: ["zh", "pt"],
          flag: "🇲🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MO.svg",
      },
      MP: {
          name: "Northern Mariana Islands",
          native: "Northern Mariana Islands",
          phone: [1670],
          continent: "OC",
          capital: "Saipan",
          currency: ["USD"],
          languages: ["en", "ch"],
          flag: "🇲🇵",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MP.svg",
      },
      MQ: {
          name: "Martinique",
          native: "Martinique",
          phone: [596],
          continent: "NA",
          capital: "Fort-de-France",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇲🇶",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MQ.svg",
      },
      MR: {
          name: "Mauritania",
          native: "موريتانيا",
          phone: [222],
          continent: "AF",
          capital: "Nouakchott",
          currency: ["MRU"],
          languages: ["ar"],
          flag: "🇲🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MR.svg",
      },
      MS: {
          name: "Montserrat",
          native: "Montserrat",
          phone: [1664],
          continent: "NA",
          capital: "Plymouth",
          currency: ["XCD"],
          languages: ["en"],
          flag: "🇲🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MS.svg",
      },
      MT: {
          name: "Malta",
          native: "Malta",
          phone: [356],
          continent: "EU",
          capital: "Valletta",
          currency: ["EUR"],
          languages: ["mt", "en"],
          flag: "🇲🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MT.svg",
      },
      MU: {
          name: "Mauritius",
          native: "Maurice",
          phone: [230],
          continent: "AF",
          capital: "Port Louis",
          currency: ["MUR"],
          languages: ["en"],
          flag: "🇲🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MU.svg",
      },
      MV: {
          name: "Maldives",
          native: "Maldives",
          phone: [960],
          continent: "AS",
          capital: "Malé",
          currency: ["MVR"],
          languages: ["dv"],
          flag: "🇲🇻",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MV.svg",
      },
      MW: {
          name: "Malawi",
          native: "Malawi",
          phone: [265],
          continent: "AF",
          capital: "Lilongwe",
          currency: ["MWK"],
          languages: ["en", "ny"],
          flag: "🇲🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MW.svg",
      },
      MX: {
          name: "Mexico",
          native: "México",
          phone: [52],
          continent: "NA",
          capital: "Mexico City",
          currency: ["MXN"],
          languages: ["es"],
          flag: "🇲🇽",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MX.svg",
      },
      MY: {
          name: "Malaysia",
          native: "Malaysia",
          phone: [60],
          continent: "AS",
          capital: "Kuala Lumpur",
          currency: ["MYR"],
          languages: ["ms"],
          flag: "🇲🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MY.svg",
      },
      MZ: {
          name: "Mozambique",
          native: "Moçambique",
          phone: [258],
          continent: "AF",
          capital: "Maputo",
          currency: ["MZN"],
          languages: ["pt"],
          flag: "🇲🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/MZ.svg",
      },
      NA: {
          name: "Namibia",
          native: "Namibia",
          phone: [264],
          continent: "AF",
          capital: "Windhoek",
          currency: ["NAD", "ZAR"],
          languages: ["en", "af"],
          flag: "🇳🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NA.svg",
      },
      NC: {
          name: "New Caledonia",
          native: "Nouvelle-Calédonie",
          phone: [687],
          continent: "OC",
          capital: "Nouméa",
          currency: ["XPF"],
          languages: ["fr"],
          flag: "🇳🇨",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NC.svg",
      },
      NE: {
          name: "Niger",
          native: "Niger",
          phone: [227],
          continent: "AF",
          capital: "Niamey",
          currency: ["XOF"],
          languages: ["fr"],
          flag: "🇳🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NE.svg",
      },
      NF: {
          name: "Norfolk Island",
          native: "Norfolk Island",
          phone: [672],
          continent: "OC",
          capital: "Kingston",
          currency: ["AUD"],
          languages: ["en"],
          flag: "🇳🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NF.svg",
      },
      NG: {
          name: "Nigeria",
          native: "Nigeria",
          phone: [234],
          continent: "AF",
          capital: "Abuja",
          currency: ["NGN"],
          languages: ["en"],
          flag: "🇳🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NG.svg",
      },
      NI: {
          name: "Nicaragua",
          native: "Nicaragua",
          phone: [505],
          continent: "NA",
          capital: "Managua",
          currency: ["NIO"],
          languages: ["es"],
          flag: "🇳🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NI.svg",
      },
      NL: {
          name: "Netherlands",
          native: "Nederland",
          phone: [31],
          continent: "EU",
          capital: "Amsterdam",
          currency: ["EUR"],
          languages: ["nl"],
          flag: "🇳🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NL.svg",
      },
      NO: {
          name: "Norway",
          native: "Norge",
          phone: [47],
          continent: "EU",
          capital: "Oslo",
          currency: ["NOK"],
          languages: ["no", "nb", "nn"],
          flag: "🇳🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NO.svg",
      },
      NP: {
          name: "Nepal",
          native: "नपल",
          phone: [977],
          continent: "AS",
          capital: "Kathmandu",
          currency: ["NPR"],
          languages: ["ne"],
          flag: "🇳🇵",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NP.svg",
      },
      NR: {
          name: "Nauru",
          native: "Nauru",
          phone: [674],
          continent: "OC",
          capital: "Yaren",
          currency: ["AUD"],
          languages: ["en", "na"],
          flag: "🇳🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NR.svg",
      },
      NU: {
          name: "Niue",
          native: "Niuē",
          phone: [683],
          continent: "OC",
          capital: "Alofi",
          currency: ["NZD"],
          languages: ["en"],
          flag: "🇳🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NU.svg",
      },
      NZ: {
          name: "New Zealand",
          native: "New Zealand",
          phone: [64],
          continent: "OC",
          capital: "Wellington",
          currency: ["NZD"],
          languages: ["en", "mi"],
          flag: "🇳🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/NZ.svg",
      },
      OM: {
          name: "Oman",
          native: "عمان",
          phone: [968],
          continent: "AS",
          capital: "Muscat",
          currency: ["OMR"],
          languages: ["ar"],
          flag: "🇴🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/OM.svg",
      },
      PA: {
          name: "Panama",
          native: "Panamá",
          phone: [507],
          continent: "NA",
          capital: "Panama City",
          currency: ["PAB", "USD"],
          languages: ["es"],
          flag: "🇵🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PA.svg",
      },
      PE: {
          name: "Peru",
          native: "Perú",
          phone: [51],
          continent: "SA",
          capital: "Lima",
          currency: ["PEN"],
          languages: ["es"],
          flag: "🇵🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PE.svg",
      },
      PF: {
          name: "French Polynesia",
          native: "Polynésie française",
          phone: [689],
          continent: "OC",
          capital: "Papeetē",
          currency: ["XPF"],
          languages: ["fr"],
          flag: "🇵🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PF.svg",
      },
      PG: {
          name: "Papua New Guinea",
          native: "Papua Niugini",
          phone: [675],
          continent: "OC",
          capital: "Port Moresby",
          currency: ["PGK"],
          languages: ["en"],
          flag: "🇵🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PG.svg",
      },
      PH: {
          name: "Philippines",
          native: "Pilipinas",
          phone: [63],
          continent: "AS",
          capital: "Manila",
          currency: ["PHP"],
          languages: ["en"],
          flag: "🇵🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PH.svg",
      },
      PK: {
          name: "Pakistan",
          native: "Pakistan",
          phone: [92],
          continent: "AS",
          capital: "Islamabad",
          currency: ["PKR"],
          languages: ["en", "ur"],
          flag: "🇵🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PK.svg",
      },
      PL: {
          name: "Poland",
          native: "Polska",
          phone: [48],
          continent: "EU",
          capital: "Warsaw",
          currency: ["PLN"],
          languages: ["pl"],
          flag: "🇵🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PL.svg",
      },
      PM: {
          name: "Saint Pierre and Miquelon",
          native: "Saint-Pierre-et-Miquelon",
          phone: [508],
          continent: "NA",
          capital: "Saint-Pierre",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇵🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PM.svg",
      },
      PN: {
          name: "Pitcairn Islands",
          native: "Pitcairn Islands",
          phone: [64],
          continent: "OC",
          capital: "Adamstown",
          currency: ["NZD"],
          languages: ["en"],
          flag: "🇵🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PN.svg",
      },
      PR: {
          name: "Puerto Rico",
          native: "Puerto Rico",
          phone: [1787, 1939],
          continent: "NA",
          capital: "San Juan",
          currency: ["USD"],
          languages: ["es", "en"],
          flag: "🇵🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PR.svg",
      },
      PS: {
          name: "Palestine",
          native: "فلسطين",
          phone: [970],
          continent: "AS",
          capital: "Ramallah",
          currency: ["ILS"],
          languages: ["ar"],
          flag: "🇵🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PS.svg",
      },
      PT: {
          name: "Portugal",
          native: "Portugal",
          phone: [351],
          continent: "EU",
          capital: "Lisbon",
          currency: ["EUR"],
          languages: ["pt"],
          flag: "🇵🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PT.svg",
      },
      PW: {
          name: "Palau",
          native: "Palau",
          phone: [680],
          continent: "OC",
          capital: "Ngerulmud",
          currency: ["USD"],
          languages: ["en"],
          flag: "🇵🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PW.svg",
      },
      PY: {
          name: "Paraguay",
          native: "Paraguay",
          phone: [595],
          continent: "SA",
          capital: "Asunción",
          currency: ["PYG"],
          languages: ["es", "gn"],
          flag: "🇵🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/PY.svg",
      },
      QA: {
          name: "Qatar",
          native: "قطر",
          phone: [974],
          continent: "AS",
          capital: "Doha",
          currency: ["QAR"],
          languages: ["ar"],
          flag: "🇶🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/QA.svg",
      },
      RE: {
          name: "Réunion",
          native: "La Réunion",
          phone: [262],
          continent: "AF",
          capital: "Saint-Denis",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇷🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/RE.svg",
      },
      RO: {
          name: "Romania",
          native: "România",
          phone: [40],
          continent: "EU",
          capital: "Bucharest",
          currency: ["RON"],
          languages: ["ro"],
          flag: "🇷🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/RO.svg",
      },
      RS: {
          name: "Serbia",
          native: "Србија",
          phone: [381],
          continent: "EU",
          capital: "Belgrade",
          currency: ["RSD"],
          languages: ["sr"],
          flag: "🇷🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/RS.svg",
      },
      RU: {
          name: "Russia",
          native: "Россия",
          phone: [7],
          continent: "EU",
          capital: "Moscow",
          currency: ["RUB"],
          languages: ["ru"],
          flag: "🇷🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/RU.svg",
      },
      RW: {
          name: "Rwanda",
          native: "Rwanda",
          phone: [250],
          continent: "AF",
          capital: "Kigali",
          currency: ["RWF"],
          languages: ["rw", "en", "fr"],
          flag: "🇷🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/RW.svg",
      },
      SA: {
          name: "Saudi Arabia",
          native: "العربية السعودية",
          phone: [966],
          continent: "AS",
          capital: "Riyadh",
          currency: ["SAR"],
          languages: ["ar"],
          flag: "🇸🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SA.svg",
      },
      SB: {
          name: "Solomon Islands",
          native: "Solomon Islands",
          phone: [677],
          continent: "OC",
          capital: "Honiara",
          currency: ["SBD"],
          languages: ["en"],
          flag: "🇸🇧",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SB.svg",
      },
      SC: {
          name: "Seychelles",
          native: "Seychelles",
          phone: [248],
          continent: "AF",
          capital: "Victoria",
          currency: ["SCR"],
          languages: ["fr", "en"],
          flag: "🇸🇨",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SC.svg",
      },
      SD: {
          name: "Sudan",
          native: "السودان",
          phone: [249],
          continent: "AF",
          capital: "Khartoum",
          currency: ["SDG"],
          languages: ["ar", "en"],
          flag: "🇸🇩",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SD.svg",
      },
      SE: {
          name: "Sweden",
          native: "Sverige",
          phone: [46],
          continent: "EU",
          capital: "Stockholm",
          currency: ["SEK"],
          languages: ["sv"],
          flag: "🇸🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SE.svg",
      },
      SG: {
          name: "Singapore",
          native: "Singapore",
          phone: [65],
          continent: "AS",
          capital: "Singapore",
          currency: ["SGD"],
          languages: ["en", "ms", "ta", "zh"],
          flag: "🇸🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SG.svg",
      },
      SH: {
          name: "Saint Helena",
          native: "Saint Helena",
          phone: [290],
          continent: "AF",
          capital: "Jamestown",
          currency: ["SHP"],
          languages: ["en"],
          flag: "🇸🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SH.svg",
      },
      SI: {
          name: "Slovenia",
          native: "Slovenija",
          phone: [386],
          continent: "EU",
          capital: "Ljubljana",
          currency: ["EUR"],
          languages: ["sl"],
          flag: "🇸🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SI.svg",
      },
      SJ: {
          name: "Svalbard and Jan Mayen",
          native: "Svalbard og Jan Mayen",
          phone: [4779],
          continent: "EU",
          capital: "Longyearbyen",
          currency: ["NOK"],
          languages: ["no"],
          flag: "🇸🇯",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SJ.svg",
      },
      SK: {
          name: "Slovakia",
          native: "Slovensko",
          phone: [421],
          continent: "EU",
          capital: "Bratislava",
          currency: ["EUR"],
          languages: ["sk"],
          flag: "🇸🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SK.svg",
      },
      SL: {
          name: "Sierra Leone",
          native: "Sierra Leone",
          phone: [232],
          continent: "AF",
          capital: "Freetown",
          currency: ["SLL"],
          languages: ["en"],
          flag: "🇸🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SL.svg",
      },
      SM: {
          name: "San Marino",
          native: "San Marino",
          phone: [378],
          continent: "EU",
          capital: "City of San Marino",
          currency: ["EUR"],
          languages: ["it"],
          flag: "🇸🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SM.svg",
      },
      SN: {
          name: "Senegal",
          native: "Sénégal",
          phone: [221],
          continent: "AF",
          capital: "Dakar",
          currency: ["XOF"],
          languages: ["fr"],
          flag: "🇸🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SN.svg",
      },
      SO: {
          name: "Somalia",
          native: "Soomaaliya",
          phone: [252],
          continent: "AF",
          capital: "Mogadishu",
          currency: ["SOS"],
          languages: ["so", "ar"],
          flag: "🇸🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SO.svg",
      },
      SR: {
          name: "Suriname",
          native: "Suriname",
          phone: [597],
          continent: "SA",
          capital: "Paramaribo",
          currency: ["SRD"],
          languages: ["nl"],
          flag: "🇸🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SR.svg",
      },
      SS: {
          name: "South Sudan",
          native: "South Sudan",
          phone: [211],
          continent: "AF",
          capital: "Juba",
          currency: ["SSP"],
          languages: ["en"],
          flag: "🇸🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SS.svg",
      },
      ST: {
          name: "São Tomé and Príncipe",
          native: "São Tomé e Príncipe",
          phone: [239],
          continent: "AF",
          capital: "São Tomé",
          currency: ["STN"],
          languages: ["pt"],
          flag: "🇸🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ST.svg",
      },
      SV: {
          name: "El Salvador",
          native: "El Salvador",
          phone: [503],
          continent: "NA",
          capital: "San Salvador",
          currency: ["SVC", "USD"],
          languages: ["es"],
          flag: "🇸🇻",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SV.svg",
      },
      SX: {
          name: "Sint Maarten",
          native: "Sint Maarten",
          phone: [1721],
          continent: "NA",
          capital: "Philipsburg",
          currency: ["ANG"],
          languages: ["nl", "en"],
          flag: "🇸🇽",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SX.svg",
      },
      SY: {
          name: "Syria",
          native: "سوريا",
          phone: [963],
          continent: "AS",
          capital: "Damascus",
          currency: ["SYP"],
          languages: ["ar"],
          flag: "🇸🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SY.svg",
      },
      SZ: {
          name: "Swaziland",
          native: "Swaziland",
          phone: [268],
          continent: "AF",
          capital: "Lobamba",
          currency: ["SZL"],
          languages: ["en", "ss"],
          flag: "🇸🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SZ.svg",
      },
      TC: {
          name: "Turks and Caicos Islands",
          native: "Turks and Caicos Islands",
          phone: [1649],
          continent: "NA",
          capital: "Cockburn Town",
          currency: ["USD"],
          languages: ["en"],
          flag: "🇹🇨",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TC.svg",
      },
      TD: {
          name: "Chad",
          native: "Tchad",
          phone: [235],
          continent: "AF",
          capital: "N'Djamena",
          currency: ["XAF"],
          languages: ["fr", "ar"],
          flag: "🇹🇩",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TD.svg",
      },
      TF: {
          name: "French Southern Territories",
          native: "Territoire des Terres australes et antarctiques fr",
          phone: [262],
          continent: "AN",
          capital: "Port-aux-Français",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇹🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TF.svg",
      },
      TG: {
          name: "Togo",
          native: "Togo",
          phone: [228],
          continent: "AF",
          capital: "Lomé",
          currency: ["XOF"],
          languages: ["fr"],
          flag: "🇹🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TG.svg",
      },
      TH: {
          name: "Thailand",
          native: "ประเทศไทย",
          phone: [66],
          continent: "AS",
          capital: "Bangkok",
          currency: ["THB"],
          languages: ["th"],
          flag: "🇹🇭",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TH.svg",
      },
      TJ: {
          name: "Tajikistan",
          native: "Тоҷикистон",
          phone: [992],
          continent: "AS",
          capital: "Dushanbe",
          currency: ["TJS"],
          languages: ["tg", "ru"],
          flag: "🇹🇯",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TJ.svg",
      },
      TK: {
          name: "Tokelau",
          native: "Tokelau",
          phone: [690],
          continent: "OC",
          capital: "Fakaofo",
          currency: ["NZD"],
          languages: ["en"],
          flag: "🇹🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TK.svg",
      },
      TL: {
          name: "East Timor",
          native: "Timor-Leste",
          phone: [670],
          continent: "OC",
          capital: "Dili",
          currency: ["USD"],
          languages: ["pt"],
          flag: "🇹🇱",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TL.svg",
      },
      TM: {
          name: "Turkmenistan",
          native: "Türkmenistan",
          phone: [993],
          continent: "AS",
          capital: "Ashgabat",
          currency: ["TMT"],
          languages: ["tk", "ru"],
          flag: "🇹🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TM.svg",
      },
      TN: {
          name: "Tunisia",
          native: "تونس",
          phone: [216],
          continent: "AF",
          capital: "Tunis",
          currency: ["TND"],
          languages: ["ar"],
          flag: "🇹🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TN.svg",
      },
      TO: {
          name: "Tonga",
          native: "Tonga",
          phone: [676],
          continent: "OC",
          capital: "Nuku'alofa",
          currency: ["TOP"],
          languages: ["en", "to"],
          flag: "🇹🇴",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TO.svg",
      },
      TR: {
          name: "Turkey",
          native: "Türkiye",
          phone: [90],
          continent: "AS",
          capital: "Ankara",
          currency: ["TRY"],
          languages: ["tr"],
          flag: "🇹🇷",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TR.svg",
      },
      TT: {
          name: "Trinidad and Tobago",
          native: "Trinidad and Tobago",
          phone: [1868],
          continent: "NA",
          capital: "Port of Spain",
          currency: ["TTD"],
          languages: ["en"],
          flag: "🇹🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TT.svg",
      },
      TV: {
          name: "Tuvalu",
          native: "Tuvalu",
          phone: [688],
          continent: "OC",
          capital: "Funafuti",
          currency: ["AUD"],
          languages: ["en"],
          flag: "🇹🇻",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TV.svg",
      },
      TW: {
          name: "Taiwan",
          native: "臺灣",
          phone: [886],
          continent: "AS",
          capital: "Taipei",
          currency: ["TWD"],
          languages: ["zh"],
          flag: "🇹🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TW.svg",
      },
      TZ: {
          name: "Tanzania",
          native: "Tanzania",
          phone: [255],
          continent: "AF",
          capital: "Dodoma",
          currency: ["TZS"],
          languages: ["sw", "en"],
          flag: "🇹🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/TZ.svg",
      },
      UA: {
          name: "Ukraine",
          native: "Україна",
          phone: [380],
          continent: "EU",
          capital: "Kyiv",
          currency: ["UAH"],
          languages: ["uk"],
          flag: "🇺🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/UA.svg",
      },
      UG: {
          name: "Uganda",
          native: "Uganda",
          phone: [256],
          continent: "AF",
          capital: "Kampala",
          currency: ["UGX"],
          languages: ["en", "sw"],
          flag: "🇺🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/UG.svg",
      },
      UM: {
          name: "U.S. Minor Outlying Islands",
          native: "United States Minor Outlying Islands",
          phone: [1],
          continent: "OC",
          capital: "",
          currency: ["USD"],
          languages: ["en"],
          flag: "🇺🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/UM.svg",
      },
      US: {
          name: "United States",
          native: "United States",
          phone: [1],
          continent: "NA",
          capital: "Washington D.C.",
          currency: ["USD", "USN", "USS"],
          languages: ["en"],
          flag: "🇺🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/US.svg",
      },
      UY: {
          name: "Uruguay",
          native: "Uruguay",
          phone: [598],
          continent: "SA",
          capital: "Montevideo",
          currency: ["UYI", "UYU"],
          languages: ["es"],
          flag: "🇺🇾",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/UY.svg",
      },
      UZ: {
          name: "Uzbekistan",
          native: "O‘zbekiston",
          phone: [998],
          continent: "AS",
          capital: "Tashkent",
          currency: ["UZS"],
          languages: ["uz", "ru"],
          flag: "🇺🇿",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/UZ.svg",
      },
      VA: {
          name: "Vatican City",
          native: "Vaticano",
          phone: [379],
          continent: "EU",
          capital: "Vatican City",
          currency: ["EUR"],
          languages: ["it", "la"],
          flag: "🇻🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/VA.svg",
      },
      VC: {
          name: "Saint Vincent and the Grenadines",
          native: "Saint Vincent and the Grenadines",
          phone: [1784],
          continent: "NA",
          capital: "Kingstown",
          currency: ["XCD"],
          languages: ["en"],
          flag: "🇻🇨",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/VC.svg",
      },
      VE: {
          name: "Venezuela",
          native: "Venezuela",
          phone: [58],
          continent: "SA",
          capital: "Caracas",
          currency: ["VES"],
          languages: ["es"],
          flag: "🇻🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/VE.svg",
      },
      VG: {
          name: "British Virgin Islands",
          native: "British Virgin Islands",
          phone: [1284],
          continent: "NA",
          capital: "Road Town",
          currency: ["USD"],
          languages: ["en"],
          flag: "🇻🇬",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/VG.svg",
      },
      VI: {
          name: "U.S. Virgin Islands",
          native: "United States Virgin Islands",
          phone: [1340],
          continent: "NA",
          capital: "Charlotte Amalie",
          currency: ["USD"],
          languages: ["en"],
          flag: "🇻🇮",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/VI.svg",
      },
      VN: {
          name: "Vietnam",
          native: "Việt Nam",
          phone: [84],
          continent: "AS",
          capital: "Hanoi",
          currency: ["VND"],
          languages: ["vi"],
          flag: "🇻🇳",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/VN.svg",
      },
      VU: {
          name: "Vanuatu",
          native: "Vanuatu",
          phone: [678],
          continent: "OC",
          capital: "Port Vila",
          currency: ["VUV"],
          languages: ["bi", "en", "fr"],
          flag: "🇻🇺",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/VU.svg",
      },
      WF: {
          name: "Wallis and Futuna",
          native: "Wallis et Futuna",
          phone: [681],
          continent: "OC",
          capital: "Mata-Utu",
          currency: ["XPF"],
          languages: ["fr"],
          flag: "🇼🇫",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/WF.svg",
      },
      WS: {
          name: "Samoa",
          native: "Samoa",
          phone: [685],
          continent: "OC",
          capital: "Apia",
          currency: ["WST"],
          languages: ["sm", "en"],
          flag: "🇼🇸",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/WS.svg",
      },
      XK: {
          name: "Kosovo",
          native: "Republika e Kosovës",
          phone: [377, 381, 383, 386],
          continent: "EU",
          capital: "Pristina",
          currency: ["EUR"],
          languages: ["sq", "sr"],
          flag: "🇽🇰",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/XK.svg",
      },
      YE: {
          name: "Yemen",
          native: "اليَمَن",
          phone: [967],
          continent: "AS",
          capital: "Sana'a",
          currency: ["YER"],
          languages: ["ar"],
          flag: "🇾🇪",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/YE.svg",
      },
      YT: {
          name: "Mayotte",
          native: "Mayotte",
          phone: [262],
          continent: "AF",
          capital: "Mamoudzou",
          currency: ["EUR"],
          languages: ["fr"],
          flag: "🇾🇹",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/YT.svg",
      },
      ZA: {
          name: "South Africa",
          native: "South Africa",
          phone: [27],
          continent: "AF",
          capital: "Pretoria",
          currency: ["ZAR"],
          languages: ["af", "en", "nr", "st", "ss", "tn", "ts", "ve", "xh", "zu"],
          flag: "🇿🇦",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ZA.svg",
      },
      ZM: {
          name: "Zambia",
          native: "Zambia",
          phone: [260],
          continent: "AF",
          capital: "Lusaka",
          currency: ["ZMW"],
          languages: ["en"],
          flag: "🇿🇲",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ZM.svg",
      },
      ZW: {
          name: "Zimbabwe",
          native: "Zimbabwe",
          phone: [263],
          continent: "AF",
          capital: "Harare",
          currency: ["USD", "ZAR", "BWP", "GBP", "AUD", "CNY", "INR", "JPY"],
          languages: ["en", "sn", "nd"],
          flag: "🇿🇼",
          flagURL: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/ZW.svg",
      },
  };

  // MIT License
  // Copyright (c) 2021 Emmadi Sumith Kumar
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  // SOFTWARE.
  class Format {
      data;
      constructor(data) {
          this.data = data;
      }
      json() {
          return this.data;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      xml(color = false) {
          const builder = new xml2jsExports.Builder();
          const xml = builder.buildObject(JSON.parse(JSON.stringify(this.json())));
          return xml;
      }
      yaml(color = false) {
          return jsonToPrettyYamlExports.stringify(JSON.parse(JSON.stringify(this.json())), color);
      }
      text(color = false, space = false) {
          const options = {
              color: color,
              spacing: space,
              squareBracketsForArray: false,
              doubleQuotesForKeys: false,
              doubleQuotesForValues: false,
          };
          return jsonToPlainText(JSON.parse(JSON.stringify(this.json())), options);
      }
      getName() {
          return this.json()?.data[0]?.name || "unknown name";
      }
      getAlternateName() {
          return this.json()?.data[0]?.altName || "no alternate name";
      }
      getAddresses() {
          return this.json()?.data[0]?.addresses || [];
      }
      getEmailId() {
          const data = this.json()?.data;
          if (data && data.length > 0) {
              const internetAddresses = data[0]?.internetAddresses;
              if (internetAddresses && internetAddresses.length > 0) {
                  const id = internetAddresses[0]?.id;
                  if (id) {
                      return id;
                  }
              }
          }
          return "unknown email";
      }
      getCountryDetails() {
          const data = this.json()?.data;
          if (data && data.length > 0) {
              const addresses = data[0]?.addresses;
              if (addresses && addresses.length > 0) {
                  const countryCode = addresses[0]?.countryCode;
                  if (countryCode) {
                      return countries[countryCode];
                  }
              }
          }
          return {
              name: "unknown",
              native: "unknwon",
              phone: [],
              continent: "unknwon",
              capital: "unknwon",
              currency: ["unknwon"],
              languages: ["unknwon"],
              flag: "🇦🇩",
              flagURL: "unknwon",
          };
      }
  }
  /**
   * Searching phone number on truecallerjs
   * @var response => {...}
   * @method response.json(color) JSON response.
   * @method response.xml(color)  XML output.
   * @method response.yaml(color) YAML output.
   * @method response.html(color) HTML output.
   * @method response.text(color,space) JSON response.
   * @method response.getName() => "Sumith Emmadi"
   * @method response.getAlternateName() => "sumith"
   * @method response.getAddresses() => {....}
   * @method response.getEmailId() => sumithemmadi244@gmail.com
   * @method response.getCountryDetails() => {...}
   * @name search
   * @function truecallerjs.search(search_data)
   * @return {Object} It contains details of the phone number
   */
  function search$1(searchData) {
      const phoneNumber = parsePhoneNumber(searchData.number, {
          regionCode: searchData.countryCode,
      });
      const significantNumber = phoneNumber?.number?.significant;
      return axios
          .get(`https://search5-noneu.truecaller.com/v2/search`, {
          params: {
              q: significantNumber,
              countryCode: phoneNumber.regionCode,
              type: 4,
              locAddr: "",
              placement: "SEARCHRESULTS,HISTORY,DETAILS",
              encoding: "json",
          },
          headers: {
              "content-type": "application/json; charset=UTF-8",
              "accept-encoding": "gzip",
              "user-agent": "Truecaller/11.75.5 (Android;10)",
              Authorization: `Bearer ${searchData.installationId}`,
          },
      })
          .then((response) => {
          // console.log(response);
          return new Format(response.data);
      }, 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error) => {
          return new Format(error);
      });
  }
  /**
   * Bulk search on truecallerjs
   * @name bulkSearch
   * @function truecallerjs.bulkSearch(phoneNumbers,countryCode,installationId)
   * @param {String} phoneNumbers phone number separted with coma.
   * @param {String} installationId 6-digits OTP .
   * @return {Object} It contains phone numbers information in a array
   */
  function bulkSearch$1(phoneNumbers, regionCode, installationId) {
      return axios
          .get(`https://search5-noneu.truecaller.com/v2/bulk`, {
          params: {
              q: phoneNumbers,
              countryCode: regionCode,
              type: 14,
              placement: "SEARCHRESULTS,HISTORY,DETAILS",
              encoding: "json",
          },
          headers: {
              "content-type": "application/json; charset=UTF-8",
              "accept-encoding": "gzip",
              "user-agent": "Truecaller/11.75.5 (Android;10)",
              Authorization: `Bearer ${installationId}`,
          },
      })
          .then((response) => {
          return response.data;
      }, 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error) => {
          return JSON.parse(JSON.stringify(error));
      });
  }

  // MIT License
  // Copyright (c) 2021 Emmadi Sumith Kumar
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  // SOFTWARE.
  const login = login$1;
  const verifyOtp = verifyOtp$1;
  const search = search$1;
  const bulkSearch = bulkSearch$1;
  const truecallerjs = {
      login,
      verifyOtp,
      search,
      bulkSearch,
  };

  var truecallerjs$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bulkSearch: bulkSearch,
    default: truecallerjs,
    login: login,
    search: search,
    verifyOtp: verifyOtp
  });

  // This file is used to create a browser-compatible bundle of truecallerjs

  // Expose truecallerjs as a global variable
  window.truecallerjs = truecallerjs$1;

})();
