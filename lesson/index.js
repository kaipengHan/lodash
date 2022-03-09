const lodash = {
    MAX_SAFE_INTEGER: 9007199254740991,
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
        if(this.isSymbol(value)){
            return this.NAN;
        }
        if(this.isObject(value)){
            const other = typeof value.valueOf === 'function' ? value.valueOf() : value;
            value = this.isObject(value) ? (other + '') : other;
        }
        if(typeof value != 'string') {
            return value === 0 ? value : +value;
        }
    },
    slice(array,start,end){
        let index = -1, length = array.length;
        if (start < 0) {
            start = -start > length ? 0 : (length + start);
        }
        end = end > length ? length : end;
        if(end < 0){
            end+=length;
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

const NAN = 0 / 0

/** Used to match leading and trailing whitespace. */
const reTrim = /^\s+|\s+$/g

/** Used to detect bad signed hexadecimal string values. */
const reIsBadHex = /^[-+]0x[0-9a-f]+$/i

/** Used to detect binary string values. */
const reIsBinary = /^0b[01]+$/i

/** Used to detect octal string values. */
const reIsOctal = /^0o[0-7]+$/i

/** Built-in method references without a dependency on `root`. */
const freeParseInt = parseInt

function toNumber(value) {
  if (typeof value === 'number') {
    return value
  }
  if (typeof (value) == 'symbol') {
    return NAN
  }
  // if (typeof value !== 'string') {
  //   return value === 0 ? value : +value
  // }
  value = value.replace(reTrim, '')
  const isBinary = reIsBinary.test(value)
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value)
}
console.log(toNumber(' 2 '))
