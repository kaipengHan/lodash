const lodash = {
  MAX_SAFE_INTEGER: 9007199254740991,
  INFINITY: 1 / 0,
  MAX_INTEGER: 1.7976931348623157e+308,
  toString: Object.prototype.toString(),
  nullTag: '[object Null]',
  undefinedTag: '[object Undefined]',
  asyncTag: '[object AsyncFunction]',
  funcTag: '[object Function]',
  genTag: '[object GeneratorFunction]',
  proxyTag: '[object Proxy]',
  symbolTag: '[object Symbol]',
  NAN: 0 / 0,
  isObject(value) {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
  },
  isObjectLike(value) {
    return value != null && typeof value == 'object';
  },
  isSymbol(value) {
    return typeof value === 'symbol' || (this.isObjectLike(value) && this._getTag(value) === this.symbolTag);
  },
  isLength(value) {
    return typeof value == 'number' && value >= 0 && value % 1 === 0 && value <= this.MAX_SAFE_INTEGER;
  },
  _getTag(value) {
    if (value == null) {
      return value === undefined ? this.undefinedTag : this.nullTag;
    }
    return toString.call(value);
  },
  isFunction(value) {
    if (!this.isObject(value)) return false;
    const tag = this._getTag(value);
    return tag === this.asyncTag || tag === this.funcTag || tag === this.genTag || tag === this.proxyTag;
  },
  isArrayLike(value) {
    return value != null && this.isLength(value.length) && !this.isFunction(value);
  },
  eq(value, other) {
    return value === other || (value !== value && other !== other);
  },
  // ?
  toNumber(value) {
    if (typeof value === 'number') {
      return value;
    }
    if (this.isSymbol(value)) {
      return this.NAN;
    }
    // 对象调用valueOf()转换为原始值
    if (this.isObject(value)) {
      const other = typeof value.valueOf === 'function' ? value.valueOf() : value;
      value = this.isObject(value) ? `${other}` : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(/^\s+|\s+$/g, '');
    const reIsBinary = /^0b[01]+$/i; // 二进制字符串
    const reIsOctal = /^0o[0-7]+$/i; // 八进制字符串
    const reIsBadHex = /^[-+]0x[0-9a-f]/i; // 检测错误的有符号十六进制字符串值
    const inBinary = reIsBinary.test(value);
    // 如果是二进制或者八进制数 用parseInt转换 十六进制可以直接使用 + 转换
    return (inBinary || reIsOctal.test(value))
      ? parseInt(value.slice(2), inBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? this.NAN : +value);
  },
  toFinite(value) {
    if (!value) { // '' false null undefined NaN 0
      return value === 0 ? value : 0;
    }
    value = this.toNumber(value);
    // infinity -infinity
    if (value === this.INFINITY || value === -this.INFINITY) {
      const sign = value > 0 ? 1 : -1;
      return sign * this.MAX_INTEGER;
    }
    // 引用值
    return value === value ? value : 0;
  },
  toInteger(value) {
    const result = this.toFinite(value);
    const remainder = result % 1;
    return remainder ? result - remainder : result;
  },
  slice(array, start, end) {
    let index = -1, length = array.length;
    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;
    const result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  },
  chunk(array, size) {
    if (size === undefined) {
      size = 1;
    }
    if (!array || size < 1) {
      return [];
    }
    let index = 0, resIndex = 0, result = Array(Math.ceil(array.length / size));
    while (index < array.length) {
      result[resIndex++] = lodash.slice(array, index, (index += size));
    }
    return result;
  },
}
console.log(lodash.chunk([1,2,3,4,5], 0b10))
