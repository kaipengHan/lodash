const lodash = {
    MAX_SAFE_INTEGER: 9007199254740991,
    INFINITY: 1 / 0,
    MAX_INTEGER: 1.7976931348623157e+308,
    MAX_ARRAY_LENGTH: Math.pow(2, 32) - 1,
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
    isArguments(value) {
        return this.isObjectLike(value) && this._getTag(value) === '[object Arguments]';
    },
    // 检查 `value` 是否是一个有效的类数组索引 length: 有效索引的上限
    isIndex(value, length) {
        const type = typeof value;
        length = length == null ? this.MAX_SAFE_INTEGER : length;
        const reIsUint = /^(?:0|[1-9]\d*)$/;
        return !!length && (type === 'number' || (type !== 'symbol' && reIsUint.test(value))) && (value > -1 && value % 1 === 0 && value < length);
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
    baseClamp(number, lower, upper) {
        if (number === number) {
            if (lower !== undefined) {
                number = number < lower ? lower : number;
            }
            if (upper !== undefined) {
                number = number > upper ? upper : number;
            }
        }
        return number;
    },
    toLength(value) {
        return value ? this.baseClamp(this.toInteger(value), 0, this.MAX_ARRAY_LENGTH) : 0;
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
    baseIsNaN(value) {
        return value !== value;
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
    strictLastIndexOf(array, value, fromIndex) {
        let index = fromIndex + 1;
        while (index--) {
            if (array[index] === value) {
                return index;
            }
        }
        return index;
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
        const {length} = array;
        let index = fromRight ? length : -1;
        while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {
        }
        if (isDrop) {
            return this.slice(array, fromRight ? 0 : index, fromRight ? index + 1 : length);
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
    baseFill(array, value, start, end) {
        let length = array.length;
        start = this.toInteger(start);
        if (start < 0) {
            start = -start < length ? (length + start) : 0;
        }
        end = (end === undefined || end > length) ? length : this.toInteger(end);
        if (end < 0) {
            end += length;
        }
        end = start > end ? 0 : this.toInteger(end);
        while (start < end) {
            array[start++] = value;
        }
        return array;
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
    fill(array, value, start, end) {
        const length = array == null ? 0 : array.length;
        if (!length) return [];
        if (start && typeof start !== 'number') {
            start = 0;
            end = length;
        }
        return this.baseFill(array, value, start, end);
    },
    baseFindIndex(array, predicate, fromIndex, fromRight) {
        let index = fromIndex + (fromRight ? 1 : -1);
        while (fromRight ? index-- : ++index < array.length) {
            if (predicate(array[index], index, array)) {
                return index;
            }
        }
        return -1;
    },
    findIndex(array, predicate, fromIndex) {
        const length = array == null ? 0 : array.length;
        if (!length) return -1;
        let index = fromIndex == null ? 0 : this.toInteger(fromIndex);
        if (index < 0) {
            index = Math.max((length + index), 0);
        }
        return this.baseFindIndex(array, predicate, index);
    },
    findLastIndex(array, predicate, fromIndex) {
        const length = array == null ? 0 : array.length;
        if (!length) return -1;
        let index = length - 1;
        if (fromIndex !== undefined) {
            index = this.toInteger(fromIndex);
            index = fromIndex > 0 ? (Math.min(index, length - 1)) : (Math.max(0, length + index));
        }
        return this.baseFindIndex(array, predicate, index, true);
    },
    // 获取数组的第一个元素
    head(array) {
        return (array != null && array.length) ? array[0] : undefined;
    },
    // 减少数组一级嵌套深度
    flatten(array) {
        const length = array == null ? 0 : array.length;
        return length ? this.baseFlatten(array, 1) : [];
    },
    // 数组为一维数组
    flattenDeep(array) {
        const length = array == null ? 0 : array.length;
        return length ? this.baseFlatten(array, this.INFINITY) : [];
    },
    // 根据depth减少数组的层级
    flattenDepth(array, depth) {
        const length = array == null ? 0 : array.length;
        if (!length) return [];
        depth = depth === undefined ? 1 : +depth;
        return this.baseFlatten(array, depth);
    },
    // [['a',1],['b',2]]  {a:1,b:2}
    fromPairs(array) {
        let index = -1, length = array == null ? 0 : array.length, result = {};
        while (++index < length) {
            const pair = array[index];
            result[pair[0]] = pair[1];
        }
        return result;
    },
    indexOf(array, value, fromIndex) {
        const length = array == null ? 0 : array.length;
        if (!length) return -1;
        let index = fromIndex == null ? 0 : this.toInteger(fromIndex);
        if (index < 0) {
            index = Math.max(length + index, 0);
        }
        if (value === value) {
            return this.strictIndexOf(array, value, index);
        } else { // NaN
            return this.baseFindIndex(array, this.baseIsNaN, index);
        }
    },
    lastIndexOf(array, value, fromIndex) {
        const baseIsNaN = value => {
            return value !== value;
        };
        let length = array == null ? 0 : array.length;
        if (!length) return -1;
        let index = length;
        if (fromIndex !== undefined) {
            index = this.toInteger(fromIndex);
            index = index > 0 ? Math.min(index, length - 1) : Math.max(0, length + index);
        }
        return value === value ? this.strictLastIndexOf(array, value, index) : this.baseFindIndex(array, baseIsNaN, index, true)
    },
    // 去掉数组最后一个元素
    initial(array) {
        const length = array == null ? 0 : array.length;
        return length ? this.slice(array, 0, array.length - 1) : [];
    },
    map(array, iteratee) {
        let length = array == null ? 0 : array.length, index = -1, result = new Array(length);
        while (++index < length) {
            result[index] = iteratee(array[index], index, array);
        }
        return result;
    },
    // TODO: 数组交集
    // intersection(...arrays) {
    //   // 如果它不是类似对象的数组 则将 `value` 强制转换为空数组
    //   const castArrayLikeObject = value => {
    //     return this.isArrayLikeObject(value) ? value : [];
    //   }
    //   const m = this.map(arrays, castArrayLikeObject);
    // },
    // 获取数组某一位
    nth(array, n){
        const length = array == null ? 0 : array.length;
        if(!length) return '';
        n += n < 0 ? length : 0;
        return this.isIndex(n, length) ? array[n] : '';
    },
    // 类似于baseIndexOf 但会接受一个比较器
    baseIndexOfWith(array,value,fromIndex,comparator){
        let index = fromIndex - 1; // ?
        const {length} = array;
        while (++index < length){
            if(comparator(array[index],value)){
                return index;
            }
        }
        return -1;
    },
    baseIndexOf(array,value,fromIndex){
        return value === value ? this.strictIndexOf(array,value,fromIndex) : this.baseFindIndex(array,this.baseIsNaN, fromIndex);
    },
    basePullAll(array,values,iteratee,comparator){
        const length = values.length;
        let index = -1;
        const seen = array;

        while(++index < length){
            let fromIndex = 0;
            const value = values[index];
            while((fromIndex = this.baseIndexOf(seen,value,fromIndex,comparator)) > -1){
                if(seen !== array){
                    seen.splice(fromIndex,1);
                }
                array.splice(fromIndex,1);
            }
        }
        return array;
    },
    pullAll(array,values){
        if(array !== null && array.length && values !== null && values.length){
            return this.basePullAll(array,values);
        }
        return array;
    },
    // 移除数组array中所有和给定值相等的元素
    pull(array, ...values){
       return this.pullAll(array,values);
    },
    copyArray(source,array){
      let index = -1;
      const {length} = source;
      array || new Array(length);
      while (++index < length){
          array[index] = source[index];
      }
      return array;
    },
}
console.log(lodash.pull(['a','b','c','a','b','c'], 'a','c'));
