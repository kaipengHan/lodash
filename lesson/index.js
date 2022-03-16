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
  _this: this,
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
  isArguments(value) {
    return this.isObjectLike(value) && this._getTag(value) === '[object Arguments]';
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
  isArrayLikeObject(value) {
    return this.isObjectLike(value) && this.isArrayLike(value);
  },
  // 是否可展开的arguments对象或数组
  isFlattenable(value) {
    return Array.isArray(value) || this.isArguments(value) || !!(value && value[Symbol.isConcatSpreadable]);
  },
  eq(value, other) {
    return value === other || (value !== value && other !== other);
  },
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
  // slice(array, start, end) {
  //   let index = -1, length = array.length;
  //   if (start < 0) {
  //     start = -start > length ? 0 : (length + start);
  //   }
  //   end = end > length ? length : end;
  //   if (end < 0) {
  //     end += length;
  //   }
  //   length = start > end ? 0 : ((end - start) >>> 0);
  //   start >>>= 0;
  //   const result = Array(length);
  //   while (++index < length) {
  //     result[index] = array[index + start];
  //   }
  //   return result;
  // },
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
  compact(array) {
    if (!array) return [];
    const result = [];
    let resIndex = 0;
    for (const p of array) {
      if (p) {
        result[resIndex++] = p;
      }
    }
    return result;
  },
  copyArray(source, array) {
    let index = -1;
    const length = source.length;
    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  },
  // isStrict 是否严格 如果是false 则不会使用predicate函数处理array中的每一项数据
  // predicate 按照此函数的规则决定是否保留array的每一项
  baseFlatten(array, depth, predicate, isStrict, result = []) {
    predicate || (predicate = this.isFlattenable);
    if (array == null) return result;
    for (const value of array) {
      if (depth > 0 && predicate.call(this, value)) {
        if (depth > 1) {
          this.baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          result.push(...value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  },
  // 严格模式 indexOf ===
  strictIndexOf(array, value, fromIndex) {
    let index = fromIndex - 1;
    const {length} = array;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  },
  slice(array, start, end) {
    let length = array == null ? 0 : array.length;
    if (!length) return [];

    start = start == null ? 0 : start;
    end = end === undefined ? length : end;

    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    if (end < 0) {
      end = -end > length ? length : (length + end);
    }
    length = start > end ? 0 : (end - start);
    let index = -1;
    const result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  },
  baseWhile(array, predicate, isDrop, fromRight) {
    // const { length } = array
    // let index = fromRight ? length : -1
    //
    // while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}
    //
    // return isDrop
    //   ? this.slice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
    //   : this.slice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index))
    const { length } = array;
    let index = fromRight ? length : -1;
    while((fromRight ? index-- : ++index < length) && predicate(array[index],index,array)){}
    if(isDrop){
      return this.slice(array,fromRight ? 0 : index, fromRight ? index + 1 : length);
    }

    // const {length} = array;
    // // 控制截取的开始或者结束的位置
    // let index = 0;
    // // 找第一个predicate返回假值的索引
    // if (fromRight) {
    //   for (let i = length-1; i > 0; i--) {
    //     index = i;
    //     if (!predicate(array[i], i, array)) {
    //       break;
    //     }
    //   }
    // } else {
    //   for (let i = 0; i < length; i++) {
    //     index = i;
    //     if (!predicate(array[i], i, array)) {
    //       break;
    //     }
    //   }
    // }
    // if (isDrop) {
    //   return this.slice(array, fromRight ? 0 : index, fromRight ? index + 1 : length);
    // }
    // return [];
  },
  drop(array, n = 1) {
    const length = array == null ? 0 : array.length;
    return length ? this.slice(array, n == null ? 0 : this.toInteger(n), length) : [];
  },
  dropRight(array, n = 1) {
    const length = array == null ? 0 : array.length;
    n = length - this.toInteger(n);
    return length ? this.slice(array, 0, n < 0 ? 0 : n) : [];
  },
  // 从array左边开始 发现predicate第一个假值的位置一直截取到最后
  dropWhile(array, predicate) {
    if (array && array.length) {
      return this.baseWhile(array, predicate, true);
    }
    return [];
  },
  // 从array右边开始 发现predicate第一个假值的位置一直截取到最开始
  dropRightWhile(array, predicate) {
    if (array && array.length) {
      return this.baseWhile(array, predicate, true, true);
    }
    return [];
  },
}

console.log(lodash.dropRightWhile([1, 2, 3, 4, 5], function (e) {
  return e < 2
}));
