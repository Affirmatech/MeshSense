var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/constants.ts
var ToRadioUuid = "f75c76d2-129e-4dad-a1dd-7866124401e7";
var FromRadioUuid = "2c55e69e-4993-11ed-b878-0242ac120002";
var FromNumUuid = "ed9da18c-a800-4f66-a670-aa7547e34453";
var ServiceUuid = "6ba1b218-15a8-461f-9fa8-5dcae273eafd";
var broadcastNum = 4294967295;
var minFwVer = 2.2;
var Constants = {
  ToRadioUuid,
  FromRadioUuid,
  FromNumUuid,
  ServiceUuid,
  broadcastNum,
  minFwVer
};

// src/meshDevice.ts
import { Logger } from "tslog";

// node_modules/@bufbuild/protobuf/dist/esm/is-message.js
function isMessage(arg, schema) {
  const isMessage2 = arg !== null && typeof arg == "object" && "$typeName" in arg && typeof arg.$typeName == "string";
  if (!isMessage2) {
    return false;
  }
  if (schema === void 0) {
    return true;
  }
  return schema.typeName === arg.$typeName;
}

// node_modules/@bufbuild/protobuf/dist/esm/descriptors.js
var ScalarType;
(function(ScalarType2) {
  ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
  ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
  ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
  ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
  ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
  ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
  ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
  ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
  ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
  ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
  ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
  ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
  ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
  ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
  ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
})(ScalarType || (ScalarType = {}));

// node_modules/@bufbuild/protobuf/dist/esm/wire/varint.js
function varint64read() {
  let lowBits = 0;
  let highBits = 0;
  for (let shift = 0; shift < 28; shift += 7) {
    let b = this.buf[this.pos++];
    lowBits |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
  }
  let middleByte = this.buf[this.pos++];
  lowBits |= (middleByte & 15) << 28;
  highBits = (middleByte & 112) >> 4;
  if ((middleByte & 128) == 0) {
    this.assertBounds();
    return [lowBits, highBits];
  }
  for (let shift = 3; shift <= 31; shift += 7) {
    let b = this.buf[this.pos++];
    highBits |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
  }
  throw new Error("invalid varint");
}
function varint64write(lo, hi, bytes) {
  for (let i = 0; i < 28; i = i + 7) {
    const shift = lo >>> i;
    const hasNext = !(shift >>> 7 == 0 && hi == 0);
    const byte = (hasNext ? shift | 128 : shift) & 255;
    bytes.push(byte);
    if (!hasNext) {
      return;
    }
  }
  const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
  const hasMoreBits = !(hi >> 3 == 0);
  bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
  if (!hasMoreBits) {
    return;
  }
  for (let i = 3; i < 31; i = i + 7) {
    const shift = hi >>> i;
    const hasNext = !(shift >>> 7 == 0);
    const byte = (hasNext ? shift | 128 : shift) & 255;
    bytes.push(byte);
    if (!hasNext) {
      return;
    }
  }
  bytes.push(hi >>> 31 & 1);
}
var TWO_PWR_32_DBL = 4294967296;
function int64FromString(dec) {
  const minus = dec[0] === "-";
  if (minus) {
    dec = dec.slice(1);
  }
  const base = 1e6;
  let lowBits = 0;
  let highBits = 0;
  function add1e6digit(begin, end) {
    const digit1e6 = Number(dec.slice(begin, end));
    highBits *= base;
    lowBits = lowBits * base + digit1e6;
    if (lowBits >= TWO_PWR_32_DBL) {
      highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
      lowBits = lowBits % TWO_PWR_32_DBL;
    }
  }
  add1e6digit(-24, -18);
  add1e6digit(-18, -12);
  add1e6digit(-12, -6);
  add1e6digit(-6);
  return minus ? negate(lowBits, highBits) : newBits(lowBits, highBits);
}
function int64ToString(lo, hi) {
  let bits = newBits(lo, hi);
  const negative = bits.hi & 2147483648;
  if (negative) {
    bits = negate(bits.lo, bits.hi);
  }
  const result = uInt64ToString(bits.lo, bits.hi);
  return negative ? "-" + result : result;
}
function uInt64ToString(lo, hi) {
  ({ lo, hi } = toUnsigned(lo, hi));
  if (hi <= 2097151) {
    return String(TWO_PWR_32_DBL * hi + lo);
  }
  const low = lo & 16777215;
  const mid = (lo >>> 24 | hi << 8) & 16777215;
  const high = hi >> 16 & 65535;
  let digitA = low + mid * 6777216 + high * 6710656;
  let digitB = mid + high * 8147497;
  let digitC = high * 2;
  const base = 1e7;
  if (digitA >= base) {
    digitB += Math.floor(digitA / base);
    digitA %= base;
  }
  if (digitB >= base) {
    digitC += Math.floor(digitB / base);
    digitB %= base;
  }
  return digitC.toString() + decimalFrom1e7WithLeadingZeros(digitB) + decimalFrom1e7WithLeadingZeros(digitA);
}
function toUnsigned(lo, hi) {
  return { lo: lo >>> 0, hi: hi >>> 0 };
}
function newBits(lo, hi) {
  return { lo: lo | 0, hi: hi | 0 };
}
function negate(lowBits, highBits) {
  highBits = ~highBits;
  if (lowBits) {
    lowBits = ~lowBits + 1;
  } else {
    highBits += 1;
  }
  return newBits(lowBits, highBits);
}
var decimalFrom1e7WithLeadingZeros = (digit1e7) => {
  const partial = String(digit1e7);
  return "0000000".slice(partial.length) + partial;
};
function varint32write(value, bytes) {
  if (value >= 0) {
    while (value > 127) {
      bytes.push(value & 127 | 128);
      value = value >>> 7;
    }
    bytes.push(value);
  } else {
    for (let i = 0; i < 9; i++) {
      bytes.push(value & 127 | 128);
      value = value >> 7;
    }
    bytes.push(1);
  }
}
function varint32read() {
  let b = this.buf[this.pos++];
  let result = b & 127;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 7;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 14;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 21;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 15) << 28;
  for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
    b = this.buf[this.pos++];
  if ((b & 128) != 0)
    throw new Error("invalid varint");
  this.assertBounds();
  return result >>> 0;
}

// node_modules/@bufbuild/protobuf/dist/esm/proto-int64.js
var protoInt64 = /* @__PURE__ */ makeInt64Support();
function makeInt64Support() {
  const dv = new DataView(new ArrayBuffer(8));
  const ok = typeof BigInt === "function" && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function" && (typeof process != "object" || typeof process.env != "object" || process.env.BUF_BIGINT_DISABLE !== "1");
  if (ok) {
    const MIN = BigInt("-9223372036854775808"), MAX = BigInt("9223372036854775807"), UMIN = BigInt("0"), UMAX = BigInt("18446744073709551615");
    return {
      zero: BigInt(0),
      supported: true,
      parse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > MAX || bi < MIN) {
          throw new Error(`invalid int64: ${value}`);
        }
        return bi;
      },
      uParse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > UMAX || bi < UMIN) {
          throw new Error(`invalid uint64: ${value}`);
        }
        return bi;
      },
      enc(value) {
        dv.setBigInt64(0, this.parse(value), true);
        return {
          lo: dv.getInt32(0, true),
          hi: dv.getInt32(4, true)
        };
      },
      uEnc(value) {
        dv.setBigInt64(0, this.uParse(value), true);
        return {
          lo: dv.getInt32(0, true),
          hi: dv.getInt32(4, true)
        };
      },
      dec(lo, hi) {
        dv.setInt32(0, lo, true);
        dv.setInt32(4, hi, true);
        return dv.getBigInt64(0, true);
      },
      uDec(lo, hi) {
        dv.setInt32(0, lo, true);
        dv.setInt32(4, hi, true);
        return dv.getBigUint64(0, true);
      }
    };
  }
  return {
    zero: "0",
    supported: false,
    parse(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertInt64String(value);
      return value;
    },
    uParse(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertUInt64String(value);
      return value;
    },
    enc(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertInt64String(value);
      return int64FromString(value);
    },
    uEnc(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertUInt64String(value);
      return int64FromString(value);
    },
    dec(lo, hi) {
      return int64ToString(lo, hi);
    },
    uDec(lo, hi) {
      return uInt64ToString(lo, hi);
    }
  };
}
function assertInt64String(value) {
  if (!/^-?[0-9]+$/.test(value)) {
    throw new Error("invalid int64: " + value);
  }
}
function assertUInt64String(value) {
  if (!/^[0-9]+$/.test(value)) {
    throw new Error("invalid uint64: " + value);
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/reflect/scalar.js
function scalarZeroValue(type, longAsString) {
  switch (type) {
    case ScalarType.STRING:
      return "";
    case ScalarType.BOOL:
      return false;
    default:
      return 0;
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return 0;
    case ScalarType.INT64:
    case ScalarType.UINT64:
    case ScalarType.SFIXED64:
    case ScalarType.FIXED64:
    case ScalarType.SINT64:
      return longAsString ? "0" : protoInt64.zero;
    case ScalarType.BYTES:
      return new Uint8Array(0);
  }
}
function isScalarZeroValue(type, value) {
  switch (type) {
    case ScalarType.BOOL:
      return value === false;
    case ScalarType.STRING:
      return value === "";
    case ScalarType.BYTES:
      return value instanceof Uint8Array && !value.byteLength;
    default:
      return value == 0;
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/reflect/error.js
var FieldError = class extends Error {
  constructor(fieldOrOneof, message, name = "FieldValueInvalidError") {
    super(message);
    this.name = name;
    this.field = () => fieldOrOneof;
  }
};

// node_modules/@bufbuild/protobuf/dist/esm/reflect/unsafe.js
var IMPLICIT = 2;
var unsafeLocal = Symbol.for("reflect unsafe local");
function unsafeOneofCase(target, oneof) {
  const c = target[oneof.localName].case;
  if (c === void 0) {
    return c;
  }
  return oneof.fields.find((f) => f.localName === c);
}
function unsafeIsSet(target, field) {
  const name = field.localName;
  if (field.oneof) {
    return target[field.oneof.localName].case === name;
  }
  if (field.presence != IMPLICIT) {
    return target[name] !== void 0 && Object.prototype.hasOwnProperty.call(target, name);
  }
  switch (field.fieldKind) {
    case "list":
      return target[name].length > 0;
    case "map":
      return Object.keys(target[name]).length > 0;
    // eslint-disable-line @typescript-eslint/no-unsafe-argument
    case "scalar":
      return !isScalarZeroValue(field.scalar, target[name]);
    case "enum":
      return target[name] !== field.enum.values[0].number;
  }
  throw new Error("message field with implicit presence");
}
function unsafeIsSetExplicit(target, localName) {
  return Object.prototype.hasOwnProperty.call(target, localName) && target[localName] !== void 0;
}
function unsafeGet(target, field) {
  if (field.oneof) {
    const oneof = target[field.oneof.localName];
    if (oneof.case === field.localName) {
      return oneof.value;
    }
    return void 0;
  }
  return target[field.localName];
}
function unsafeSet(target, field, value) {
  if (field.oneof) {
    target[field.oneof.localName] = {
      case: field.localName,
      value
    };
  } else {
    target[field.localName] = value;
  }
}
function unsafeClear(target, field) {
  const name = field.localName;
  if (field.oneof) {
    const oneofLocalName = field.oneof.localName;
    if (target[oneofLocalName].case === name) {
      target[oneofLocalName] = { case: void 0 };
    }
  } else if (field.presence != IMPLICIT) {
    delete target[name];
  } else {
    switch (field.fieldKind) {
      case "map":
        target[name] = {};
        break;
      case "list":
        target[name] = [];
        break;
      case "enum":
        target[name] = field.enum.values[0].number;
        break;
      case "scalar":
        target[name] = scalarZeroValue(field.scalar, field.longAsString);
        break;
    }
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/reflect/guard.js
function isObject(arg) {
  return arg !== null && typeof arg == "object" && !Array.isArray(arg);
}
function isReflectList(arg, field) {
  var _a, _b, _c, _d;
  if (isObject(arg) && unsafeLocal in arg && "add" in arg && "field" in arg && typeof arg.field == "function") {
    if (field !== void 0) {
      const a = field, b = arg.field();
      return a.listKind == b.listKind && a.scalar === b.scalar && ((_a = a.message) === null || _a === void 0 ? void 0 : _a.typeName) === ((_b = b.message) === null || _b === void 0 ? void 0 : _b.typeName) && ((_c = a.enum) === null || _c === void 0 ? void 0 : _c.typeName) === ((_d = b.enum) === null || _d === void 0 ? void 0 : _d.typeName);
    }
    return true;
  }
  return false;
}
function isReflectMap(arg, field) {
  var _a, _b, _c, _d;
  if (isObject(arg) && unsafeLocal in arg && "has" in arg && "field" in arg && typeof arg.field == "function") {
    if (field !== void 0) {
      const a = field, b = arg.field();
      return a.mapKey === b.mapKey && a.mapKind == b.mapKind && a.scalar === b.scalar && ((_a = a.message) === null || _a === void 0 ? void 0 : _a.typeName) === ((_b = b.message) === null || _b === void 0 ? void 0 : _b.typeName) && ((_c = a.enum) === null || _c === void 0 ? void 0 : _c.typeName) === ((_d = b.enum) === null || _d === void 0 ? void 0 : _d.typeName);
    }
    return true;
  }
  return false;
}
function isReflectMessage(arg, messageDesc2) {
  return isObject(arg) && unsafeLocal in arg && "desc" in arg && isObject(arg.desc) && arg.desc.kind === "message" && (messageDesc2 === void 0 || arg.desc.typeName == messageDesc2.typeName);
}

// node_modules/@bufbuild/protobuf/dist/esm/wkt/wrappers.js
function isWrapper(arg) {
  return isWrapperTypeName(arg.$typeName);
}
function isWrapperDesc(messageDesc2) {
  const f = messageDesc2.fields[0];
  return isWrapperTypeName(messageDesc2.typeName) && f !== void 0 && f.fieldKind == "scalar" && f.name == "value" && f.number == 1;
}
function isWrapperTypeName(name) {
  return name.startsWith("google.protobuf.") && [
    "DoubleValue",
    "FloatValue",
    "Int64Value",
    "UInt64Value",
    "Int32Value",
    "UInt32Value",
    "BoolValue",
    "StringValue",
    "BytesValue"
  ].includes(name.substring(16));
}

// node_modules/@bufbuild/protobuf/dist/esm/create.js
var EDITION_PROTO3 = 999;
var EDITION_PROTO2 = 998;
var IMPLICIT2 = 2;
function create(schema, init) {
  if (isMessage(init, schema)) {
    return init;
  }
  const message = createZeroMessage(schema);
  if (init !== void 0) {
    initMessage(schema, message, init);
  }
  return message;
}
function initMessage(messageDesc2, message, init) {
  for (const member of messageDesc2.members) {
    let value = init[member.localName];
    if (value == null) {
      continue;
    }
    let field;
    if (member.kind == "oneof") {
      const oneofField = unsafeOneofCase(init, member);
      if (!oneofField) {
        continue;
      }
      field = oneofField;
      value = unsafeGet(init, oneofField);
    } else {
      field = member;
    }
    switch (field.fieldKind) {
      case "message":
        value = toMessage(field, value);
        break;
      case "scalar":
        value = initScalar(field, value);
        break;
      case "list":
        value = initList(field, value);
        break;
      case "map":
        value = initMap(field, value);
        break;
    }
    unsafeSet(message, field, value);
  }
  return message;
}
function initScalar(field, value) {
  if (field.scalar == ScalarType.BYTES) {
    return toU8Arr(value);
  }
  return value;
}
function initMap(field, value) {
  if (isObject(value)) {
    if (field.scalar == ScalarType.BYTES) {
      return convertObjectValues(value, toU8Arr);
    }
    if (field.mapKind == "message") {
      return convertObjectValues(value, (val) => toMessage(field, val));
    }
  }
  return value;
}
function initList(field, value) {
  if (Array.isArray(value)) {
    if (field.scalar == ScalarType.BYTES) {
      return value.map(toU8Arr);
    }
    if (field.listKind == "message") {
      return value.map((item) => toMessage(field, item));
    }
  }
  return value;
}
function toMessage(field, value) {
  if (field.fieldKind == "message" && !field.oneof && isWrapperDesc(field.message)) {
    return initScalar(field.message.fields[0], value);
  }
  if (isObject(value)) {
    if (field.message.typeName == "google.protobuf.Struct" && field.parent.typeName !== "google.protobuf.Value") {
      return value;
    }
    if (!isMessage(value, field.message)) {
      return create(field.message, value);
    }
  }
  return value;
}
function toU8Arr(value) {
  return Array.isArray(value) ? new Uint8Array(value) : value;
}
function convertObjectValues(obj, fn) {
  const ret = {};
  for (const entry of Object.entries(obj)) {
    ret[entry[0]] = fn(entry[1]);
  }
  return ret;
}
var tokenZeroMessageField = Symbol();
var messagePrototypes = /* @__PURE__ */ new WeakMap();
function createZeroMessage(desc) {
  let msg;
  if (!needsPrototypeChain(desc)) {
    msg = {
      $typeName: desc.typeName
    };
    for (const member of desc.members) {
      if (member.kind == "oneof" || member.presence == IMPLICIT2) {
        msg[member.localName] = createZeroField(member);
      }
    }
  } else {
    const cached = messagePrototypes.get(desc);
    let prototype;
    let members;
    if (cached) {
      ({ prototype, members } = cached);
    } else {
      prototype = {};
      members = /* @__PURE__ */ new Set();
      for (const member of desc.members) {
        if (member.kind == "oneof") {
          continue;
        }
        if (member.fieldKind != "scalar" && member.fieldKind != "enum") {
          continue;
        }
        if (member.presence == IMPLICIT2) {
          continue;
        }
        members.add(member);
        prototype[member.localName] = createZeroField(member);
      }
      messagePrototypes.set(desc, { prototype, members });
    }
    msg = Object.create(prototype);
    msg.$typeName = desc.typeName;
    for (const member of desc.members) {
      if (members.has(member)) {
        continue;
      }
      if (member.kind == "field") {
        if (member.fieldKind == "message") {
          continue;
        }
        if (member.fieldKind == "scalar" || member.fieldKind == "enum") {
          if (member.presence != IMPLICIT2) {
            continue;
          }
        }
      }
      msg[member.localName] = createZeroField(member);
    }
  }
  return msg;
}
function needsPrototypeChain(desc) {
  switch (desc.file.edition) {
    case EDITION_PROTO3:
      return false;
    case EDITION_PROTO2:
      return true;
    default:
      return desc.fields.some((f) => f.presence != IMPLICIT2 && f.fieldKind != "message" && !f.oneof);
  }
}
function createZeroField(field) {
  if (field.kind == "oneof") {
    return { case: void 0 };
  }
  if (field.fieldKind == "list") {
    return [];
  }
  if (field.fieldKind == "map") {
    return {};
  }
  if (field.fieldKind == "message") {
    return tokenZeroMessageField;
  }
  const defaultValue = field.getDefaultValue();
  if (defaultValue !== void 0) {
    return field.fieldKind == "scalar" && field.longAsString ? defaultValue.toString() : defaultValue;
  }
  return field.fieldKind == "scalar" ? scalarZeroValue(field.scalar, field.longAsString) : field.enum.values[0].number;
}

// node_modules/@bufbuild/protobuf/dist/esm/wire/text-encoding.js
var symbol = Symbol.for("@bufbuild/protobuf/text-encoding");
function getTextEncoding() {
  if (globalThis[symbol] == void 0) {
    const te = new globalThis.TextEncoder();
    const td = new globalThis.TextDecoder();
    globalThis[symbol] = {
      encodeUtf8(text) {
        return te.encode(text);
      },
      decodeUtf8(bytes) {
        return td.decode(bytes);
      },
      checkUtf8(text) {
        try {
          encodeURIComponent(text);
          return true;
        } catch (e) {
          return false;
        }
      }
    };
  }
  return globalThis[symbol];
}

// node_modules/@bufbuild/protobuf/dist/esm/wire/binary-encoding.js
var WireType;
(function(WireType2) {
  WireType2[WireType2["Varint"] = 0] = "Varint";
  WireType2[WireType2["Bit64"] = 1] = "Bit64";
  WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
  WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
  WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
  WireType2[WireType2["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));
var FLOAT32_MAX = 34028234663852886e22;
var FLOAT32_MIN = -34028234663852886e22;
var UINT32_MAX = 4294967295;
var INT32_MAX = 2147483647;
var INT32_MIN = -2147483648;
var BinaryWriter = class {
  constructor(encodeUtf8 = getTextEncoding().encodeUtf8) {
    this.encodeUtf8 = encodeUtf8;
    this.stack = [];
    this.chunks = [];
    this.buf = [];
  }
  /**
   * Return all bytes written and reset this writer.
   */
  finish() {
    if (this.buf.length) {
      this.chunks.push(new Uint8Array(this.buf));
      this.buf = [];
    }
    let len = 0;
    for (let i = 0; i < this.chunks.length; i++)
      len += this.chunks[i].length;
    let bytes = new Uint8Array(len);
    let offset = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      bytes.set(this.chunks[i], offset);
      offset += this.chunks[i].length;
    }
    this.chunks = [];
    return bytes;
  }
  /**
   * Start a new fork for length-delimited data like a message
   * or a packed repeated field.
   *
   * Must be joined later with `join()`.
   */
  fork() {
    this.stack.push({ chunks: this.chunks, buf: this.buf });
    this.chunks = [];
    this.buf = [];
    return this;
  }
  /**
   * Join the last fork. Write its length and bytes, then
   * return to the previous state.
   */
  join() {
    let chunk = this.finish();
    let prev = this.stack.pop();
    if (!prev)
      throw new Error("invalid state, fork stack empty");
    this.chunks = prev.chunks;
    this.buf = prev.buf;
    this.uint32(chunk.byteLength);
    return this.raw(chunk);
  }
  /**
   * Writes a tag (field number and wire type).
   *
   * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
   *
   * Generated code should compute the tag ahead of time and call `uint32()`.
   */
  tag(fieldNo, type) {
    return this.uint32((fieldNo << 3 | type) >>> 0);
  }
  /**
   * Write a chunk of raw bytes.
   */
  raw(chunk) {
    if (this.buf.length) {
      this.chunks.push(new Uint8Array(this.buf));
      this.buf = [];
    }
    this.chunks.push(chunk);
    return this;
  }
  /**
   * Write a `uint32` value, an unsigned 32 bit varint.
   */
  uint32(value) {
    assertUInt32(value);
    while (value > 127) {
      this.buf.push(value & 127 | 128);
      value = value >>> 7;
    }
    this.buf.push(value);
    return this;
  }
  /**
   * Write a `int32` value, a signed 32 bit varint.
   */
  int32(value) {
    assertInt32(value);
    varint32write(value, this.buf);
    return this;
  }
  /**
   * Write a `bool` value, a variant.
   */
  bool(value) {
    this.buf.push(value ? 1 : 0);
    return this;
  }
  /**
   * Write a `bytes` value, length-delimited arbitrary data.
   */
  bytes(value) {
    this.uint32(value.byteLength);
    return this.raw(value);
  }
  /**
   * Write a `string` value, length-delimited data converted to UTF-8 text.
   */
  string(value) {
    let chunk = this.encodeUtf8(value);
    this.uint32(chunk.byteLength);
    return this.raw(chunk);
  }
  /**
   * Write a `float` value, 32-bit floating point number.
   */
  float(value) {
    assertFloat32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setFloat32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `double` value, a 64-bit floating point number.
   */
  double(value) {
    let chunk = new Uint8Array(8);
    new DataView(chunk.buffer).setFloat64(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
   */
  fixed32(value) {
    assertUInt32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setUint32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
   */
  sfixed32(value) {
    assertInt32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setInt32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
   */
  sint32(value) {
    assertInt32(value);
    value = (value << 1 ^ value >> 31) >>> 0;
    varint32write(value, this.buf);
    return this;
  }
  /**
   * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
   */
  sfixed64(value) {
    let chunk = new Uint8Array(8), view = new DataView(chunk.buffer), tc = protoInt64.enc(value);
    view.setInt32(0, tc.lo, true);
    view.setInt32(4, tc.hi, true);
    return this.raw(chunk);
  }
  /**
   * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
   */
  fixed64(value) {
    let chunk = new Uint8Array(8), view = new DataView(chunk.buffer), tc = protoInt64.uEnc(value);
    view.setInt32(0, tc.lo, true);
    view.setInt32(4, tc.hi, true);
    return this.raw(chunk);
  }
  /**
   * Write a `int64` value, a signed 64-bit varint.
   */
  int64(value) {
    let tc = protoInt64.enc(value);
    varint64write(tc.lo, tc.hi, this.buf);
    return this;
  }
  /**
   * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64(value) {
    let tc = protoInt64.enc(value), sign = tc.hi >> 31, lo = tc.lo << 1 ^ sign, hi = (tc.hi << 1 | tc.lo >>> 31) ^ sign;
    varint64write(lo, hi, this.buf);
    return this;
  }
  /**
   * Write a `uint64` value, an unsigned 64-bit varint.
   */
  uint64(value) {
    let tc = protoInt64.uEnc(value);
    varint64write(tc.lo, tc.hi, this.buf);
    return this;
  }
};
var BinaryReader = class {
  constructor(buf, decodeUtf8 = getTextEncoding().decodeUtf8) {
    this.decodeUtf8 = decodeUtf8;
    this.varint64 = varint64read;
    this.uint32 = varint32read;
    this.buf = buf;
    this.len = buf.length;
    this.pos = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  /**
   * Reads a tag - field number and wire type.
   */
  tag() {
    let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
    if (fieldNo <= 0 || wireType < 0 || wireType > 5)
      throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
    return [fieldNo, wireType];
  }
  /**
   * Skip one element and return the skipped data.
   *
   * When skipping StartGroup, provide the tags field number to check for
   * matching field number in the EndGroup tag.
   */
  skip(wireType, fieldNo) {
    let start = this.pos;
    switch (wireType) {
      case WireType.Varint:
        while (this.buf[this.pos++] & 128) {
        }
        break;
      // eslint-disable-next-line
      // @ts-expect-error TS7029: Fallthrough case in switch
      case WireType.Bit64:
        this.pos += 4;
      // eslint-disable-next-line no-fallthrough
      case WireType.Bit32:
        this.pos += 4;
        break;
      case WireType.LengthDelimited:
        let len = this.uint32();
        this.pos += len;
        break;
      case WireType.StartGroup:
        for (; ; ) {
          const [fn, wt] = this.tag();
          if (wt === WireType.EndGroup) {
            if (fieldNo !== void 0 && fn !== fieldNo) {
              throw new Error("invalid end group tag");
            }
            break;
          }
          this.skip(wt, fn);
        }
        break;
      default:
        throw new Error("cant skip wire type " + wireType);
    }
    this.assertBounds();
    return this.buf.subarray(start, this.pos);
  }
  /**
   * Throws error if position in byte array is out of range.
   */
  assertBounds() {
    if (this.pos > this.len)
      throw new RangeError("premature EOF");
  }
  /**
   * Read a `int32` field, a signed 32 bit varint.
   */
  int32() {
    return this.uint32() | 0;
  }
  /**
   * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
   */
  sint32() {
    let zze = this.uint32();
    return zze >>> 1 ^ -(zze & 1);
  }
  /**
   * Read a `int64` field, a signed 64-bit varint.
   */
  int64() {
    return protoInt64.dec(...this.varint64());
  }
  /**
   * Read a `uint64` field, an unsigned 64-bit varint.
   */
  uint64() {
    return protoInt64.uDec(...this.varint64());
  }
  /**
   * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64() {
    let [lo, hi] = this.varint64();
    let s = -(lo & 1);
    lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
    hi = hi >>> 1 ^ s;
    return protoInt64.dec(lo, hi);
  }
  /**
   * Read a `bool` field, a variant.
   */
  bool() {
    let [lo, hi] = this.varint64();
    return lo !== 0 || hi !== 0;
  }
  /**
   * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
   */
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
   */
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
   */
  fixed64() {
    return protoInt64.uDec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
   */
  sfixed64() {
    return protoInt64.dec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `float` field, 32-bit floating point number.
   */
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `double` field, a 64-bit floating point number.
   */
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, true);
  }
  /**
   * Read a `bytes` field, length-delimited arbitrary data.
   */
  bytes() {
    let len = this.uint32(), start = this.pos;
    this.pos += len;
    this.assertBounds();
    return this.buf.subarray(start, start + len);
  }
  /**
   * Read a `string` field, length-delimited data converted to UTF-8 text.
   */
  string() {
    return this.decodeUtf8(this.bytes());
  }
};
function assertInt32(arg) {
  if (typeof arg == "string") {
    arg = Number(arg);
  } else if (typeof arg != "number") {
    throw new Error("invalid int32: " + typeof arg);
  }
  if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
    throw new Error("invalid int32: " + arg);
}
function assertUInt32(arg) {
  if (typeof arg == "string") {
    arg = Number(arg);
  } else if (typeof arg != "number") {
    throw new Error("invalid uint32: " + typeof arg);
  }
  if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
    throw new Error("invalid uint32: " + arg);
}
function assertFloat32(arg) {
  if (typeof arg == "string") {
    const o = arg;
    arg = Number(arg);
    if (isNaN(arg) && o !== "NaN") {
      throw new Error("invalid float32: " + o);
    }
  } else if (typeof arg != "number") {
    throw new Error("invalid float32: " + typeof arg);
  }
  if (Number.isFinite(arg) && (arg > FLOAT32_MAX || arg < FLOAT32_MIN))
    throw new Error("invalid float32: " + arg);
}

// node_modules/@bufbuild/protobuf/dist/esm/reflect/reflect-check.js
function checkField(field, value) {
  const check = field.fieldKind == "list" ? isReflectList(value, field) : field.fieldKind == "map" ? isReflectMap(value, field) : checkSingular(field, value);
  if (check === true) {
    return void 0;
  }
  let reason;
  switch (field.fieldKind) {
    case "list":
      reason = `expected ${formatReflectList(field)}, got ${formatVal(value)}`;
      break;
    case "map":
      reason = `expected ${formatReflectMap(field)}, got ${formatVal(value)}`;
      break;
    default: {
      reason = reasonSingular(field, value, check);
    }
  }
  return new FieldError(field, reason);
}
function checkListItem(field, index, value) {
  const check = checkSingular(field, value);
  if (check !== true) {
    return new FieldError(field, `list item #${index + 1}: ${reasonSingular(field, value, check)}`);
  }
  return void 0;
}
function checkMapEntry(field, key, value) {
  const checkKey = checkScalarValue(key, field.mapKey);
  if (checkKey !== true) {
    return new FieldError(field, `invalid map key: ${reasonSingular({ scalar: field.mapKey }, key, checkKey)}`);
  }
  const checkVal = checkSingular(field, value);
  if (checkVal !== true) {
    return new FieldError(field, `map entry ${formatVal(key)}: ${reasonSingular(field, value, checkVal)}`);
  }
  return void 0;
}
function checkSingular(field, value) {
  if (field.scalar !== void 0) {
    return checkScalarValue(value, field.scalar);
  }
  if (field.enum !== void 0) {
    if (field.enum.open) {
      return Number.isInteger(value);
    }
    return field.enum.values.some((v) => v.number === value);
  }
  return isReflectMessage(value, field.message);
}
function checkScalarValue(value, scalar) {
  switch (scalar) {
    case ScalarType.DOUBLE:
      return typeof value == "number";
    case ScalarType.FLOAT:
      if (typeof value != "number") {
        return false;
      }
      if (Number.isNaN(value) || !Number.isFinite(value)) {
        return true;
      }
      if (value > FLOAT32_MAX || value < FLOAT32_MIN) {
        return `${value.toFixed()} out of range`;
      }
      return true;
    case ScalarType.INT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
      if (typeof value !== "number" || !Number.isInteger(value)) {
        return false;
      }
      if (value > INT32_MAX || value < INT32_MIN) {
        return `${value.toFixed()} out of range`;
      }
      return true;
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
      if (typeof value !== "number" || !Number.isInteger(value)) {
        return false;
      }
      if (value > UINT32_MAX || value < 0) {
        return `${value.toFixed()} out of range`;
      }
      return true;
    case ScalarType.BOOL:
      return typeof value == "boolean";
    case ScalarType.STRING:
      if (typeof value != "string") {
        return false;
      }
      return getTextEncoding().checkUtf8(value) || "invalid UTF8";
    case ScalarType.BYTES:
      return value instanceof Uint8Array;
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      if (typeof value != "string" && typeof value !== "bigint" && typeof value !== "number") {
        return false;
      }
      try {
        protoInt64.parse(value);
      } catch (e) {
        return `${value} out of range`;
      }
      return true;
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      if (typeof value != "string" && typeof value !== "bigint" && typeof value !== "number") {
        return false;
      }
      try {
        protoInt64.uParse(value);
      } catch (e) {
        return `${value} out of range`;
      }
      return true;
  }
}
function reasonSingular(field, val, details) {
  details = typeof details == "string" ? `: ${details}` : `, got ${formatVal(val)}`;
  if (field.scalar !== void 0) {
    return `expected ${scalarTypeDescription(field.scalar)}` + details;
  } else if (field.enum !== void 0) {
    return `expected ${field.enum.toString()}` + details;
  }
  return `expected ${formatReflectMessage(field.message)}` + details;
}
function formatVal(val) {
  switch (typeof val) {
    case "object":
      if (val === null) {
        return "null";
      }
      if (val instanceof Uint8Array) {
        return `Uint8Array(${val.length})`;
      }
      if (Array.isArray(val)) {
        return `Array(${val.length})`;
      }
      if (isReflectList(val)) {
        return formatReflectList(val.field());
      }
      if (isReflectMap(val)) {
        return formatReflectMap(val.field());
      }
      if (isReflectMessage(val)) {
        return formatReflectMessage(val.desc);
      }
      if (isMessage(val)) {
        return `message ${val.$typeName}`;
      }
      return "object";
    case "string":
      return val.length > 30 ? "string" : `"${val.split('"').join('\\"')}"`;
    case "boolean":
      return String(val);
    case "number":
      return String(val);
    case "bigint":
      return String(val) + "n";
    default:
      return typeof val;
  }
}
function formatReflectMessage(desc) {
  return `ReflectMessage (${desc.typeName})`;
}
function formatReflectList(field) {
  switch (field.listKind) {
    case "message":
      return `ReflectList (${field.message.toString()})`;
    case "enum":
      return `ReflectList (${field.enum.toString()})`;
    case "scalar":
      return `ReflectList (${ScalarType[field.scalar]})`;
  }
}
function formatReflectMap(field) {
  switch (field.mapKind) {
    case "message":
      return `ReflectMap (${ScalarType[field.mapKey]}, ${field.message.toString()})`;
    case "enum":
      return `ReflectMap (${ScalarType[field.mapKey]}, ${field.enum.toString()})`;
    case "scalar":
      return `ReflectMap (${ScalarType[field.mapKey]}, ${ScalarType[field.scalar]})`;
  }
}
function scalarTypeDescription(scalar) {
  switch (scalar) {
    case ScalarType.STRING:
      return "string";
    case ScalarType.BOOL:
      return "boolean";
    case ScalarType.INT64:
    case ScalarType.SINT64:
    case ScalarType.SFIXED64:
      return "bigint (int64)";
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      return "bigint (uint64)";
    case ScalarType.BYTES:
      return "Uint8Array";
    case ScalarType.DOUBLE:
      return "number (float64)";
    case ScalarType.FLOAT:
      return "number (float32)";
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
      return "number (uint32)";
    case ScalarType.INT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
      return "number (int32)";
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/reflect/reflect.js
function reflect(messageDesc2, message, check = true) {
  return new ReflectMessageImpl(messageDesc2, message, check);
}
var ReflectMessageImpl = class {
  get sortedFields() {
    var _a;
    return (_a = this._sortedFields) !== null && _a !== void 0 ? _a : this._sortedFields = this.desc.fields.concat().sort((a, b) => a.number - b.number);
  }
  constructor(messageDesc2, message, check = true) {
    this.lists = /* @__PURE__ */ new Map();
    this.maps = /* @__PURE__ */ new Map();
    this.check = check;
    this.desc = messageDesc2;
    this.message = this[unsafeLocal] = message !== null && message !== void 0 ? message : create(messageDesc2);
    this.fields = messageDesc2.fields;
    this.oneofs = messageDesc2.oneofs;
    this.members = messageDesc2.members;
  }
  findNumber(number) {
    if (!this._fieldsByNumber) {
      this._fieldsByNumber = new Map(this.desc.fields.map((f) => [f.number, f]));
    }
    return this._fieldsByNumber.get(number);
  }
  oneofCase(oneof) {
    assertOwn(this.message, oneof);
    return unsafeOneofCase(this.message, oneof);
  }
  isSet(field) {
    assertOwn(this.message, field);
    return unsafeIsSet(this.message, field);
  }
  clear(field) {
    assertOwn(this.message, field);
    unsafeClear(this.message, field);
  }
  get(field) {
    assertOwn(this.message, field);
    const value = unsafeGet(this.message, field);
    switch (field.fieldKind) {
      case "list":
        let list = this.lists.get(field);
        if (!list || list[unsafeLocal] !== value) {
          this.lists.set(field, list = new ReflectListImpl(field, value, this.check));
        }
        return list;
      case "map":
        let map = this.maps.get(field);
        if (!map || map[unsafeLocal] !== value) {
          this.maps.set(field, map = new ReflectMapImpl(field, value, this.check));
        }
        return map;
      case "message":
        return messageToReflect(field, value, this.check);
      case "scalar":
        return value === void 0 ? scalarZeroValue(field.scalar, false) : longToReflect(field, value);
      case "enum":
        return value !== null && value !== void 0 ? value : field.enum.values[0].number;
    }
  }
  set(field, value) {
    assertOwn(this.message, field);
    if (this.check) {
      const err = checkField(field, value);
      if (err) {
        throw err;
      }
    }
    let local;
    if (field.fieldKind == "message") {
      local = messageToLocal(field, value);
    } else if (isReflectMap(value) || isReflectList(value)) {
      local = value[unsafeLocal];
    } else {
      local = longToLocal(field, value);
    }
    unsafeSet(this.message, field, local);
  }
  getUnknown() {
    return this.message.$unknown;
  }
  setUnknown(value) {
    this.message.$unknown = value;
  }
};
function assertOwn(owner, member) {
  if (member.parent.typeName !== owner.$typeName) {
    throw new FieldError(member, `cannot use ${member.toString()} with message ${owner.$typeName}`, "ForeignFieldError");
  }
}
var ReflectListImpl = class {
  field() {
    return this._field;
  }
  get size() {
    return this._arr.length;
  }
  constructor(field, unsafeInput, check) {
    this._field = field;
    this._arr = this[unsafeLocal] = unsafeInput;
    this.check = check;
  }
  get(index) {
    const item = this._arr[index];
    return item === void 0 ? void 0 : listItemToReflect(this._field, item, this.check);
  }
  set(index, item) {
    if (index < 0 || index >= this._arr.length) {
      throw new FieldError(this._field, `list item #${index + 1}: out of range`);
    }
    if (this.check) {
      const err = checkListItem(this._field, index, item);
      if (err) {
        throw err;
      }
    }
    this._arr[index] = listItemToLocal(this._field, item);
  }
  add(item) {
    if (this.check) {
      const err = checkListItem(this._field, this._arr.length, item);
      if (err) {
        throw err;
      }
    }
    this._arr.push(listItemToLocal(this._field, item));
    return void 0;
  }
  clear() {
    this._arr.splice(0, this._arr.length);
  }
  [Symbol.iterator]() {
    return this.values();
  }
  keys() {
    return this._arr.keys();
  }
  *values() {
    for (const item of this._arr) {
      yield listItemToReflect(this._field, item, this.check);
    }
  }
  *entries() {
    for (let i = 0; i < this._arr.length; i++) {
      yield [i, listItemToReflect(this._field, this._arr[i], this.check)];
    }
  }
};
var ReflectMapImpl = class {
  constructor(field, unsafeInput, check = true) {
    this.obj = this[unsafeLocal] = unsafeInput !== null && unsafeInput !== void 0 ? unsafeInput : {};
    this.check = check;
    this._field = field;
  }
  field() {
    return this._field;
  }
  set(key, value) {
    if (this.check) {
      const err = checkMapEntry(this._field, key, value);
      if (err) {
        throw err;
      }
    }
    this.obj[mapKeyToLocal(key)] = mapValueToLocal(this._field, value);
    return this;
  }
  delete(key) {
    const k = mapKeyToLocal(key);
    const has = Object.prototype.hasOwnProperty.call(this.obj, k);
    if (has) {
      delete this.obj[k];
    }
    return has;
  }
  clear() {
    for (const key of Object.keys(this.obj)) {
      delete this.obj[key];
    }
  }
  get(key) {
    let val = this.obj[mapKeyToLocal(key)];
    if (val !== void 0) {
      val = mapValueToReflect(this._field, val, this.check);
    }
    return val;
  }
  has(key) {
    return Object.prototype.hasOwnProperty.call(this.obj, mapKeyToLocal(key));
  }
  *keys() {
    for (const objKey of Object.keys(this.obj)) {
      yield mapKeyToReflect(objKey, this._field.mapKey);
    }
  }
  *entries() {
    for (const objEntry of Object.entries(this.obj)) {
      yield [
        mapKeyToReflect(objEntry[0], this._field.mapKey),
        mapValueToReflect(this._field, objEntry[1], this.check)
      ];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  get size() {
    return Object.keys(this.obj).length;
  }
  *values() {
    for (const val of Object.values(this.obj)) {
      yield mapValueToReflect(this._field, val, this.check);
    }
  }
  forEach(callbackfn, thisArg) {
    for (const mapEntry of this.entries()) {
      callbackfn.call(thisArg, mapEntry[1], mapEntry[0], this);
    }
  }
};
function messageToLocal(field, value) {
  if (!isReflectMessage(value)) {
    return value;
  }
  if (isWrapper(value.message) && !field.oneof && field.fieldKind == "message") {
    return value.message.value;
  }
  if (value.desc.typeName == "google.protobuf.Struct" && field.parent.typeName != "google.protobuf.Value") {
    return wktStructToLocal(value.message);
  }
  return value.message;
}
function messageToReflect(field, value, check) {
  if (value !== void 0) {
    if (isWrapperDesc(field.message) && !field.oneof && field.fieldKind == "message") {
      value = {
        $typeName: field.message.typeName,
        value: longToReflect(field.message.fields[0], value)
      };
    } else if (field.message.typeName == "google.protobuf.Struct" && field.parent.typeName != "google.protobuf.Value" && isObject(value)) {
      value = wktStructToReflect(value);
    }
  }
  return new ReflectMessageImpl(field.message, value, check);
}
function listItemToLocal(field, value) {
  if (field.listKind == "message") {
    return messageToLocal(field, value);
  }
  return longToLocal(field, value);
}
function listItemToReflect(field, value, check) {
  if (field.listKind == "message") {
    return messageToReflect(field, value, check);
  }
  return longToReflect(field, value);
}
function mapValueToLocal(field, value) {
  if (field.mapKind == "message") {
    return messageToLocal(field, value);
  }
  return longToLocal(field, value);
}
function mapValueToReflect(field, value, check) {
  if (field.mapKind == "message") {
    return messageToReflect(field, value, check);
  }
  return value;
}
function mapKeyToLocal(key) {
  return typeof key == "string" || typeof key == "number" ? key : String(key);
}
function mapKeyToReflect(key, type) {
  switch (type) {
    case ScalarType.STRING:
      return key;
    case ScalarType.INT32:
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32: {
      const n = Number.parseInt(key);
      if (Number.isFinite(n)) {
        return n;
      }
      break;
    }
    case ScalarType.BOOL:
      switch (key) {
        case "true":
          return true;
        case "false":
          return false;
      }
      break;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      try {
        return protoInt64.uParse(key);
      } catch (_a) {
      }
      break;
    default:
      try {
        return protoInt64.parse(key);
      } catch (_b) {
      }
      break;
  }
  return key;
}
function longToReflect(field, value) {
  switch (field.scalar) {
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      if ("longAsString" in field && field.longAsString && typeof value == "string") {
        value = protoInt64.parse(value);
      }
      break;
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      if ("longAsString" in field && field.longAsString && typeof value == "string") {
        value = protoInt64.uParse(value);
      }
      break;
  }
  return value;
}
function longToLocal(field, value) {
  switch (field.scalar) {
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      if ("longAsString" in field && field.longAsString) {
        value = String(value);
      } else if (typeof value == "string" || typeof value == "number") {
        value = protoInt64.parse(value);
      }
      break;
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      if ("longAsString" in field && field.longAsString) {
        value = String(value);
      } else if (typeof value == "string" || typeof value == "number") {
        value = protoInt64.uParse(value);
      }
      break;
  }
  return value;
}
function wktStructToReflect(json) {
  const struct = {
    $typeName: "google.protobuf.Struct",
    fields: {}
  };
  if (isObject(json)) {
    for (const [k, v] of Object.entries(json)) {
      struct.fields[k] = wktValueToReflect(v);
    }
  }
  return struct;
}
function wktStructToLocal(val) {
  const json = {};
  for (const [k, v] of Object.entries(val.fields)) {
    json[k] = wktValueToLocal(v);
  }
  return json;
}
function wktValueToLocal(val) {
  switch (val.kind.case) {
    case "structValue":
      return wktStructToLocal(val.kind.value);
    case "listValue":
      return val.kind.value.values.map(wktValueToLocal);
    case "nullValue":
    case void 0:
      return null;
    default:
      return val.kind.value;
  }
}
function wktValueToReflect(json) {
  const value = {
    $typeName: "google.protobuf.Value",
    kind: { case: void 0 }
  };
  switch (typeof json) {
    case "number":
      value.kind = { case: "numberValue", value: json };
      break;
    case "string":
      value.kind = { case: "stringValue", value: json };
      break;
    case "boolean":
      value.kind = { case: "boolValue", value: json };
      break;
    case "object":
      if (json === null) {
        const nullValue = 0;
        value.kind = { case: "nullValue", value: nullValue };
      } else if (Array.isArray(json)) {
        const listValue = {
          $typeName: "google.protobuf.ListValue",
          values: []
        };
        if (Array.isArray(json)) {
          for (const e of json) {
            listValue.values.push(wktValueToReflect(e));
          }
        }
        value.kind = {
          case: "listValue",
          value: listValue
        };
      } else {
        value.kind = {
          case: "structValue",
          value: wktStructToReflect(json)
        };
      }
      break;
  }
  return value;
}

// node_modules/@bufbuild/protobuf/dist/esm/wire/base64-encoding.js
function base64Decode(base64Str) {
  const table = getDecodeTable();
  let es = base64Str.length * 3 / 4;
  if (base64Str[base64Str.length - 2] == "=")
    es -= 2;
  else if (base64Str[base64Str.length - 1] == "=")
    es -= 1;
  let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
  for (let i = 0; i < base64Str.length; i++) {
    b = table[base64Str.charCodeAt(i)];
    if (b === void 0) {
      switch (base64Str[i]) {
        // @ts-expect-error TS7029: Fallthrough case in switch
        case "=":
          groupPos = 0;
        // reset state when padding found
        // eslint-disable-next-line no-fallthrough
        case "\n":
        case "\r":
        case "	":
        case " ":
          continue;
        // skip white-space, and padding
        default:
          throw Error("invalid base64 string");
      }
    }
    switch (groupPos) {
      case 0:
        p = b;
        groupPos = 1;
        break;
      case 1:
        bytes[bytePos++] = p << 2 | (b & 48) >> 4;
        p = b;
        groupPos = 2;
        break;
      case 2:
        bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
        p = b;
        groupPos = 3;
        break;
      case 3:
        bytes[bytePos++] = (p & 3) << 6 | b;
        groupPos = 0;
        break;
    }
  }
  if (groupPos == 1)
    throw Error("invalid base64 string");
  return bytes.subarray(0, bytePos);
}
var encodeTableStd;
var encodeTableUrl;
var decodeTable;
function getEncodeTable(encoding) {
  if (!encodeTableStd) {
    encodeTableStd = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    encodeTableUrl = encodeTableStd.slice(0, -2).concat("-", "_");
  }
  return encoding == "url" ? encodeTableUrl : encodeTableStd;
}
function getDecodeTable() {
  if (!decodeTable) {
    decodeTable = [];
    const encodeTable = getEncodeTable("std");
    for (let i = 0; i < encodeTable.length; i++)
      decodeTable[encodeTable[i].charCodeAt(0)] = i;
    decodeTable["-".charCodeAt(0)] = encodeTable.indexOf("+");
    decodeTable["_".charCodeAt(0)] = encodeTable.indexOf("/");
  }
  return decodeTable;
}

// node_modules/@bufbuild/protobuf/dist/esm/reflect/names.js
function protoCamelCase(snakeCase) {
  let capNext = false;
  const b = [];
  for (let i = 0; i < snakeCase.length; i++) {
    let c = snakeCase.charAt(i);
    switch (c) {
      case "_":
        capNext = true;
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        b.push(c);
        capNext = false;
        break;
      default:
        if (capNext) {
          capNext = false;
          c = c.toUpperCase();
        }
        b.push(c);
        break;
    }
  }
  return b.join("");
}
var reservedObjectProperties = /* @__PURE__ */ new Set([
  // names reserved by JavaScript
  "constructor",
  "toString",
  "toJSON",
  "valueOf"
]);
function safeObjectProperty(name) {
  return reservedObjectProperties.has(name) ? name + "$" : name;
}

// node_modules/@bufbuild/protobuf/dist/esm/codegenv1/restore-json-names.js
function restoreJsonNames(message) {
  for (const f of message.field) {
    if (!unsafeIsSetExplicit(f, "jsonName")) {
      f.jsonName = protoCamelCase(f.name);
    }
  }
  message.nestedType.forEach(restoreJsonNames);
}

// node_modules/@bufbuild/protobuf/dist/esm/wire/text-format.js
function parseTextFormatEnumValue(descEnum, value) {
  const enumValue = descEnum.values.find((v) => v.name === value);
  if (!enumValue) {
    throw new Error(`cannot parse ${descEnum} default value: ${value}`);
  }
  return enumValue.number;
}
function parseTextFormatScalarValue(type, value) {
  switch (type) {
    case ScalarType.STRING:
      return value;
    case ScalarType.BYTES: {
      const u = unescapeBytesDefaultValue(value);
      if (u === false) {
        throw new Error(`cannot parse ${ScalarType[type]} default value: ${value}`);
      }
      return u;
    }
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return protoInt64.parse(value);
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      return protoInt64.uParse(value);
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      switch (value) {
        case "inf":
          return Number.POSITIVE_INFINITY;
        case "-inf":
          return Number.NEGATIVE_INFINITY;
        case "nan":
          return Number.NaN;
        default:
          return parseFloat(value);
      }
    case ScalarType.BOOL:
      return value === "true";
    case ScalarType.INT32:
    case ScalarType.UINT32:
    case ScalarType.SINT32:
    case ScalarType.FIXED32:
    case ScalarType.SFIXED32:
      return parseInt(value, 10);
  }
}
function unescapeBytesDefaultValue(str) {
  const b = [];
  const input = {
    tail: str,
    c: "",
    next() {
      if (this.tail.length == 0) {
        return false;
      }
      this.c = this.tail[0];
      this.tail = this.tail.substring(1);
      return true;
    },
    take(n) {
      if (this.tail.length >= n) {
        const r = this.tail.substring(0, n);
        this.tail = this.tail.substring(n);
        return r;
      }
      return false;
    }
  };
  while (input.next()) {
    switch (input.c) {
      case "\\":
        if (input.next()) {
          switch (input.c) {
            case "\\":
              b.push(input.c.charCodeAt(0));
              break;
            case "b":
              b.push(8);
              break;
            case "f":
              b.push(12);
              break;
            case "n":
              b.push(10);
              break;
            case "r":
              b.push(13);
              break;
            case "t":
              b.push(9);
              break;
            case "v":
              b.push(11);
              break;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7": {
              const s = input.c;
              const t = input.take(2);
              if (t === false) {
                return false;
              }
              const n = parseInt(s + t, 8);
              if (isNaN(n)) {
                return false;
              }
              b.push(n);
              break;
            }
            case "x": {
              const s = input.c;
              const t = input.take(2);
              if (t === false) {
                return false;
              }
              const n = parseInt(s + t, 16);
              if (isNaN(n)) {
                return false;
              }
              b.push(n);
              break;
            }
            case "u": {
              const s = input.c;
              const t = input.take(4);
              if (t === false) {
                return false;
              }
              const n = parseInt(s + t, 16);
              if (isNaN(n)) {
                return false;
              }
              const chunk = new Uint8Array(4);
              const view = new DataView(chunk.buffer);
              view.setInt32(0, n, true);
              b.push(chunk[0], chunk[1], chunk[2], chunk[3]);
              break;
            }
            case "U": {
              const s = input.c;
              const t = input.take(8);
              if (t === false) {
                return false;
              }
              const tc = protoInt64.uEnc(s + t);
              const chunk = new Uint8Array(8);
              const view = new DataView(chunk.buffer);
              view.setInt32(0, tc.lo, true);
              view.setInt32(4, tc.hi, true);
              b.push(chunk[0], chunk[1], chunk[2], chunk[3], chunk[4], chunk[5], chunk[6], chunk[7]);
              break;
            }
          }
        }
        break;
      default:
        b.push(input.c.charCodeAt(0));
    }
  }
  return new Uint8Array(b);
}

// node_modules/@bufbuild/protobuf/dist/esm/reflect/nested-types.js
function* nestedTypes(desc) {
  switch (desc.kind) {
    case "file":
      for (const message of desc.messages) {
        yield message;
        yield* nestedTypes(message);
      }
      yield* desc.enums;
      yield* desc.services;
      yield* desc.extensions;
      break;
    case "message":
      for (const message of desc.nestedMessages) {
        yield message;
        yield* nestedTypes(message);
      }
      yield* desc.nestedEnums;
      yield* desc.nestedExtensions;
      break;
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/registry.js
function createFileRegistry(...args) {
  const registry = createBaseRegistry();
  if (!args.length) {
    return registry;
  }
  if ("$typeName" in args[0] && args[0].$typeName == "google.protobuf.FileDescriptorSet") {
    for (const file of args[0].file) {
      addFile(file, registry);
    }
    return registry;
  }
  if ("$typeName" in args[0]) {
    let recurseDeps2 = function(file) {
      const deps = [];
      for (const protoFileName of file.dependency) {
        if (registry.getFile(protoFileName) != void 0) {
          continue;
        }
        if (seen.has(protoFileName)) {
          continue;
        }
        const dep = resolve(protoFileName);
        if (!dep) {
          throw new Error(`Unable to resolve ${protoFileName}, imported by ${file.name}`);
        }
        if ("kind" in dep) {
          registry.addFile(dep, false, true);
        } else {
          seen.add(dep.name);
          deps.push(dep);
        }
      }
      return deps.concat(...deps.map(recurseDeps2));
    };
    var recurseDeps = recurseDeps2;
    const input = args[0];
    const resolve = args[1];
    const seen = /* @__PURE__ */ new Set();
    for (const file of [input, ...recurseDeps2(input)].reverse()) {
      addFile(file, registry);
    }
  } else {
    for (const fileReg of args) {
      for (const file of fileReg.files) {
        registry.addFile(file);
      }
    }
  }
  return registry;
}
function createBaseRegistry() {
  const types = /* @__PURE__ */ new Map();
  const extendees = /* @__PURE__ */ new Map();
  const files = /* @__PURE__ */ new Map();
  return {
    kind: "registry",
    types,
    extendees,
    [Symbol.iterator]() {
      return types.values();
    },
    get files() {
      return files.values();
    },
    addFile(file, skipTypes, withDeps) {
      files.set(file.proto.name, file);
      if (!skipTypes) {
        for (const type of nestedTypes(file)) {
          this.add(type);
        }
      }
      if (withDeps) {
        for (const f of file.dependencies) {
          this.addFile(f, skipTypes, withDeps);
        }
      }
    },
    add(desc) {
      if (desc.kind == "extension") {
        let numberToExt = extendees.get(desc.extendee.typeName);
        if (!numberToExt) {
          extendees.set(desc.extendee.typeName, numberToExt = /* @__PURE__ */ new Map());
        }
        numberToExt.set(desc.number, desc);
      }
      types.set(desc.typeName, desc);
    },
    get(typeName) {
      return types.get(typeName);
    },
    getFile(fileName) {
      return files.get(fileName);
    },
    getMessage(typeName) {
      const t = types.get(typeName);
      return (t === null || t === void 0 ? void 0 : t.kind) == "message" ? t : void 0;
    },
    getEnum(typeName) {
      const t = types.get(typeName);
      return (t === null || t === void 0 ? void 0 : t.kind) == "enum" ? t : void 0;
    },
    getExtension(typeName) {
      const t = types.get(typeName);
      return (t === null || t === void 0 ? void 0 : t.kind) == "extension" ? t : void 0;
    },
    getExtensionFor(extendee, no) {
      var _a;
      return (_a = extendees.get(extendee.typeName)) === null || _a === void 0 ? void 0 : _a.get(no);
    },
    getService(typeName) {
      const t = types.get(typeName);
      return (t === null || t === void 0 ? void 0 : t.kind) == "service" ? t : void 0;
    }
  };
}
var EDITION_PROTO22 = 998;
var EDITION_PROTO32 = 999;
var TYPE_STRING = 9;
var TYPE_GROUP = 10;
var TYPE_MESSAGE = 11;
var TYPE_BYTES = 12;
var TYPE_ENUM = 14;
var LABEL_REPEATED = 3;
var LABEL_REQUIRED = 2;
var JS_STRING = 1;
var IDEMPOTENCY_UNKNOWN = 0;
var EXPLICIT = 1;
var IMPLICIT3 = 2;
var LEGACY_REQUIRED = 3;
var PACKED = 1;
var DELIMITED = 2;
var OPEN = 1;
var featureDefaults = {
  // EDITION_PROTO2
  998: {
    fieldPresence: 1,
    // EXPLICIT,
    enumType: 2,
    // CLOSED,
    repeatedFieldEncoding: 2,
    // EXPANDED,
    utf8Validation: 3,
    // NONE,
    messageEncoding: 1,
    // LENGTH_PREFIXED,
    jsonFormat: 2
    // LEGACY_BEST_EFFORT,
  },
  // EDITION_PROTO3
  999: {
    fieldPresence: 2,
    // IMPLICIT,
    enumType: 1,
    // OPEN,
    repeatedFieldEncoding: 1,
    // PACKED,
    utf8Validation: 2,
    // VERIFY,
    messageEncoding: 1,
    // LENGTH_PREFIXED,
    jsonFormat: 1
    // ALLOW,
  },
  // EDITION_2023
  1e3: {
    fieldPresence: 1,
    // EXPLICIT,
    enumType: 1,
    // OPEN,
    repeatedFieldEncoding: 1,
    // PACKED,
    utf8Validation: 2,
    // VERIFY,
    messageEncoding: 1,
    // LENGTH_PREFIXED,
    jsonFormat: 1
    // ALLOW,
  }
};
function addFile(proto, reg) {
  var _a, _b;
  const file = {
    kind: "file",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    edition: getFileEdition(proto),
    name: proto.name.replace(/\.proto$/, ""),
    dependencies: findFileDependencies(proto, reg),
    enums: [],
    messages: [],
    extensions: [],
    services: [],
    toString() {
      return `file ${proto.name}`;
    }
  };
  const mapEntriesStore = /* @__PURE__ */ new Map();
  const mapEntries = {
    get(typeName) {
      return mapEntriesStore.get(typeName);
    },
    add(desc) {
      var _a2;
      assert(((_a2 = desc.proto.options) === null || _a2 === void 0 ? void 0 : _a2.mapEntry) === true);
      mapEntriesStore.set(desc.typeName, desc);
    }
  };
  for (const enumProto of proto.enumType) {
    addEnum(enumProto, file, void 0, reg);
  }
  for (const messageProto of proto.messageType) {
    addMessage(messageProto, file, void 0, reg, mapEntries);
  }
  for (const serviceProto of proto.service) {
    addService(serviceProto, file, reg);
  }
  addExtensions(file, reg);
  for (const mapEntry of mapEntriesStore.values()) {
    addFields(mapEntry, reg, mapEntries);
  }
  for (const message of file.messages) {
    addFields(message, reg, mapEntries);
    addExtensions(message, reg);
  }
  reg.addFile(file, true);
}
function addExtensions(desc, reg) {
  switch (desc.kind) {
    case "file":
      for (const proto of desc.proto.extension) {
        const ext = newField(proto, desc, reg);
        desc.extensions.push(ext);
        reg.add(ext);
      }
      break;
    case "message":
      for (const proto of desc.proto.extension) {
        const ext = newField(proto, desc, reg);
        desc.nestedExtensions.push(ext);
        reg.add(ext);
      }
      for (const message of desc.nestedMessages) {
        addExtensions(message, reg);
      }
      break;
  }
}
function addFields(message, reg, mapEntries) {
  const allOneofs = message.proto.oneofDecl.map((proto) => newOneof(proto, message));
  const oneofsSeen = /* @__PURE__ */ new Set();
  for (const proto of message.proto.field) {
    const oneof = findOneof(proto, allOneofs);
    const field = newField(proto, message, reg, oneof, mapEntries);
    message.fields.push(field);
    message.field[field.localName] = field;
    if (oneof === void 0) {
      message.members.push(field);
    } else {
      oneof.fields.push(field);
      if (!oneofsSeen.has(oneof)) {
        oneofsSeen.add(oneof);
        message.members.push(oneof);
      }
    }
  }
  for (const oneof of allOneofs.filter((o) => oneofsSeen.has(o))) {
    message.oneofs.push(oneof);
  }
  for (const child of message.nestedMessages) {
    addFields(child, reg, mapEntries);
  }
}
function addEnum(proto, file, parent, reg) {
  var _a, _b, _c;
  const sharedPrefix = findEnumSharedPrefix(proto.name, proto.value);
  const desc = {
    kind: "enum",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    file,
    parent,
    open: true,
    name: proto.name,
    typeName: makeTypeName(proto, parent, file),
    value: {},
    values: [],
    sharedPrefix,
    toString() {
      return `enum ${this.typeName}`;
    }
  };
  desc.open = isEnumOpen(desc);
  reg.add(desc);
  proto.value.forEach((proto2) => {
    var _a2, _b2;
    const name = proto2.name;
    desc.values.push(desc.value[proto2.number] = {
      kind: "enum_value",
      proto: proto2,
      deprecated: (_b2 = (_a2 = proto2.options) === null || _a2 === void 0 ? void 0 : _a2.deprecated) !== null && _b2 !== void 0 ? _b2 : false,
      parent: desc,
      name,
      localName: safeObjectProperty(sharedPrefix == void 0 ? name : name.substring(sharedPrefix.length)),
      number: proto2.number,
      toString() {
        return `enum value ${desc.typeName}.${name}`;
      }
    });
  });
  ((_c = parent === null || parent === void 0 ? void 0 : parent.nestedEnums) !== null && _c !== void 0 ? _c : file.enums).push(desc);
}
function addMessage(proto, file, parent, reg, mapEntries) {
  var _a, _b, _c, _d;
  const desc = {
    kind: "message",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    file,
    parent,
    name: proto.name,
    typeName: makeTypeName(proto, parent, file),
    fields: [],
    field: {},
    oneofs: [],
    members: [],
    nestedEnums: [],
    nestedMessages: [],
    nestedExtensions: [],
    toString() {
      return `message ${this.typeName}`;
    }
  };
  if (((_c = proto.options) === null || _c === void 0 ? void 0 : _c.mapEntry) === true) {
    mapEntries.add(desc);
  } else {
    ((_d = parent === null || parent === void 0 ? void 0 : parent.nestedMessages) !== null && _d !== void 0 ? _d : file.messages).push(desc);
    reg.add(desc);
  }
  for (const enumProto of proto.enumType) {
    addEnum(enumProto, file, desc, reg);
  }
  for (const messageProto of proto.nestedType) {
    addMessage(messageProto, file, desc, reg, mapEntries);
  }
}
function addService(proto, file, reg) {
  var _a, _b;
  const desc = {
    kind: "service",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    file,
    name: proto.name,
    typeName: makeTypeName(proto, void 0, file),
    methods: [],
    method: {},
    toString() {
      return `service ${this.typeName}`;
    }
  };
  file.services.push(desc);
  reg.add(desc);
  for (const methodProto of proto.method) {
    const method = newMethod(methodProto, desc, reg);
    desc.methods.push(method);
    desc.method[method.localName] = method;
  }
}
function newMethod(proto, parent, reg) {
  var _a, _b, _c, _d;
  let methodKind;
  if (proto.clientStreaming && proto.serverStreaming) {
    methodKind = "bidi_streaming";
  } else if (proto.clientStreaming) {
    methodKind = "client_streaming";
  } else if (proto.serverStreaming) {
    methodKind = "server_streaming";
  } else {
    methodKind = "unary";
  }
  const input = reg.getMessage(trimLeadingDot(proto.inputType));
  const output = reg.getMessage(trimLeadingDot(proto.outputType));
  assert(input, `invalid MethodDescriptorProto: input_type ${proto.inputType} not found`);
  assert(output, `invalid MethodDescriptorProto: output_type ${proto.inputType} not found`);
  const name = proto.name;
  return {
    kind: "rpc",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    parent,
    name,
    localName: safeObjectProperty(name.length ? safeObjectProperty(name[0].toLowerCase() + name.substring(1)) : name),
    methodKind,
    input,
    output,
    idempotency: (_d = (_c = proto.options) === null || _c === void 0 ? void 0 : _c.idempotencyLevel) !== null && _d !== void 0 ? _d : IDEMPOTENCY_UNKNOWN,
    toString() {
      return `rpc ${parent.typeName}.${name}`;
    }
  };
}
function newOneof(proto, parent) {
  return {
    kind: "oneof",
    proto,
    deprecated: false,
    parent,
    fields: [],
    name: proto.name,
    localName: safeObjectProperty(protoCamelCase(proto.name)),
    toString() {
      return `oneof ${parent.typeName}.${this.name}`;
    }
  };
}
function newField(proto, parentOrFile, reg, oneof, mapEntries) {
  var _a, _b, _c;
  const isExtension = mapEntries === void 0;
  const field = {
    kind: "field",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    name: proto.name,
    number: proto.number,
    scalar: void 0,
    message: void 0,
    enum: void 0,
    presence: getFieldPresence(proto, oneof, isExtension, parentOrFile),
    listKind: void 0,
    mapKind: void 0,
    mapKey: void 0,
    delimitedEncoding: void 0,
    packed: void 0,
    longAsString: false,
    getDefaultValue: void 0
  };
  if (isExtension) {
    const file = parentOrFile.kind == "file" ? parentOrFile : parentOrFile.file;
    const parent = parentOrFile.kind == "file" ? void 0 : parentOrFile;
    const typeName = makeTypeName(proto, parent, file);
    field.kind = "extension";
    field.file = file;
    field.parent = parent;
    field.oneof = void 0;
    field.typeName = typeName;
    field.jsonName = `[${typeName}]`;
    field.toString = () => `extension ${typeName}`;
    const extendee = reg.getMessage(trimLeadingDot(proto.extendee));
    assert(extendee, `invalid FieldDescriptorProto: extendee ${proto.extendee} not found`);
    field.extendee = extendee;
  } else {
    const parent = parentOrFile;
    assert(parent.kind == "message");
    field.parent = parent;
    field.oneof = oneof;
    field.localName = oneof ? protoCamelCase(proto.name) : safeObjectProperty(protoCamelCase(proto.name));
    field.jsonName = proto.jsonName;
    field.toString = () => `field ${parent.typeName}.${proto.name}`;
  }
  const label = proto.label;
  const type = proto.type;
  const jstype = (_c = proto.options) === null || _c === void 0 ? void 0 : _c.jstype;
  if (label === LABEL_REPEATED) {
    const mapEntry = type == TYPE_MESSAGE ? mapEntries === null || mapEntries === void 0 ? void 0 : mapEntries.get(trimLeadingDot(proto.typeName)) : void 0;
    if (mapEntry) {
      field.fieldKind = "map";
      const { key, value } = findMapEntryFields(mapEntry);
      field.mapKey = key.scalar;
      field.mapKind = value.fieldKind;
      field.message = value.message;
      field.delimitedEncoding = false;
      field.enum = value.enum;
      field.scalar = value.scalar;
      return field;
    }
    field.fieldKind = "list";
    switch (type) {
      case TYPE_MESSAGE:
      case TYPE_GROUP:
        field.listKind = "message";
        field.message = reg.getMessage(trimLeadingDot(proto.typeName));
        assert(field.message);
        field.delimitedEncoding = isDelimitedEncoding(proto, parentOrFile);
        break;
      case TYPE_ENUM:
        field.listKind = "enum";
        field.enum = reg.getEnum(trimLeadingDot(proto.typeName));
        assert(field.enum);
        break;
      default:
        field.listKind = "scalar";
        field.scalar = type;
        field.longAsString = jstype == JS_STRING;
        break;
    }
    field.packed = isPackedField(proto, parentOrFile);
    return field;
  }
  switch (type) {
    case TYPE_MESSAGE:
    case TYPE_GROUP:
      field.fieldKind = "message";
      field.message = reg.getMessage(trimLeadingDot(proto.typeName));
      assert(
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        field.message,
        `invalid FieldDescriptorProto: type_name ${proto.typeName} not found`
      );
      field.delimitedEncoding = isDelimitedEncoding(proto, parentOrFile);
      field.getDefaultValue = () => void 0;
      break;
    case TYPE_ENUM: {
      const enumeration = reg.getEnum(trimLeadingDot(proto.typeName));
      assert(enumeration !== void 0, `invalid FieldDescriptorProto: type_name ${proto.typeName} not found`);
      field.fieldKind = "enum";
      field.enum = reg.getEnum(trimLeadingDot(proto.typeName));
      field.getDefaultValue = () => {
        return unsafeIsSetExplicit(proto, "defaultValue") ? parseTextFormatEnumValue(enumeration, proto.defaultValue) : void 0;
      };
      break;
    }
    default: {
      field.fieldKind = "scalar";
      field.scalar = type;
      field.longAsString = jstype == JS_STRING;
      field.getDefaultValue = () => {
        return unsafeIsSetExplicit(proto, "defaultValue") ? parseTextFormatScalarValue(type, proto.defaultValue) : void 0;
      };
      break;
    }
  }
  return field;
}
function getFileEdition(proto) {
  switch (proto.syntax) {
    case "":
    case "proto2":
      return EDITION_PROTO22;
    case "proto3":
      return EDITION_PROTO32;
    case "editions":
      if (proto.edition in featureDefaults) {
        return proto.edition;
      }
      throw new Error(`${proto.name}: unsupported edition`);
    default:
      throw new Error(`${proto.name}: unsupported syntax "${proto.syntax}"`);
  }
}
function findFileDependencies(proto, reg) {
  return proto.dependency.map((wantName) => {
    const dep = reg.getFile(wantName);
    if (!dep) {
      throw new Error(`Cannot find ${wantName}, imported by ${proto.name}`);
    }
    return dep;
  });
}
function findEnumSharedPrefix(enumName, values) {
  const prefix = camelToSnakeCase(enumName) + "_";
  for (const value of values) {
    if (!value.name.toLowerCase().startsWith(prefix)) {
      return void 0;
    }
    const shortName = value.name.substring(prefix.length);
    if (shortName.length == 0) {
      return void 0;
    }
    if (/^\d/.test(shortName)) {
      return void 0;
    }
  }
  return prefix;
}
function camelToSnakeCase(camel) {
  return (camel.substring(0, 1) + camel.substring(1).replace(/[A-Z]/g, (c) => "_" + c)).toLowerCase();
}
function makeTypeName(proto, parent, file) {
  let typeName;
  if (parent) {
    typeName = `${parent.typeName}.${proto.name}`;
  } else if (file.proto.package.length > 0) {
    typeName = `${file.proto.package}.${proto.name}`;
  } else {
    typeName = `${proto.name}`;
  }
  return typeName;
}
function trimLeadingDot(typeName) {
  return typeName.startsWith(".") ? typeName.substring(1) : typeName;
}
function findOneof(proto, allOneofs) {
  if (!unsafeIsSetExplicit(proto, "oneofIndex")) {
    return void 0;
  }
  if (proto.proto3Optional) {
    return void 0;
  }
  const oneof = allOneofs[proto.oneofIndex];
  assert(
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    oneof,
    `invalid FieldDescriptorProto: oneof #${proto.oneofIndex} for field #${proto.number} not found`
  );
  return oneof;
}
function getFieldPresence(proto, oneof, isExtension, parent) {
  if (proto.label == LABEL_REQUIRED) {
    return LEGACY_REQUIRED;
  }
  if (proto.label == LABEL_REPEATED) {
    return IMPLICIT3;
  }
  if (!!oneof || proto.proto3Optional) {
    return EXPLICIT;
  }
  if (proto.type == TYPE_MESSAGE) {
    return EXPLICIT;
  }
  if (isExtension) {
    return EXPLICIT;
  }
  return resolveFeature("fieldPresence", { proto, parent });
}
function isPackedField(proto, parent) {
  if (proto.label != LABEL_REPEATED) {
    return false;
  }
  switch (proto.type) {
    case TYPE_STRING:
    case TYPE_BYTES:
    case TYPE_GROUP:
    case TYPE_MESSAGE:
      return false;
  }
  const o = proto.options;
  if (o && unsafeIsSetExplicit(o, "packed")) {
    return o.packed;
  }
  return PACKED == resolveFeature("repeatedFieldEncoding", {
    proto,
    parent
  });
}
function findMapEntryFields(mapEntry) {
  const key = mapEntry.fields.find((f) => f.number === 1);
  const value = mapEntry.fields.find((f) => f.number === 2);
  assert(key && key.fieldKind == "scalar" && key.scalar != ScalarType.BYTES && key.scalar != ScalarType.FLOAT && key.scalar != ScalarType.DOUBLE && value && value.fieldKind != "list" && value.fieldKind != "map");
  return { key, value };
}
function isEnumOpen(desc) {
  var _a;
  return OPEN == resolveFeature("enumType", {
    proto: desc.proto,
    parent: (_a = desc.parent) !== null && _a !== void 0 ? _a : desc.file
  });
}
function isDelimitedEncoding(proto, parent) {
  if (proto.type == TYPE_GROUP) {
    return true;
  }
  return DELIMITED == resolveFeature("messageEncoding", {
    proto,
    parent
  });
}
function resolveFeature(name, ref) {
  var _a, _b;
  const featureSet = (_a = ref.proto.options) === null || _a === void 0 ? void 0 : _a.features;
  if (featureSet) {
    const val = featureSet[name];
    if (val != 0) {
      return val;
    }
  }
  if ("kind" in ref) {
    if (ref.kind == "message") {
      return resolveFeature(name, (_b = ref.parent) !== null && _b !== void 0 ? _b : ref.file);
    }
    const editionDefaults = featureDefaults[ref.edition];
    if (!editionDefaults) {
      throw new Error(`feature default for edition ${ref.edition} not found`);
    }
    return editionDefaults[name];
  }
  return resolveFeature(name, ref.parent);
}
function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg);
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/codegenv1/boot.js
function boot(boot2) {
  const root = bootFileDescriptorProto(boot2);
  root.messageType.forEach(restoreJsonNames);
  const reg = createFileRegistry(root, () => void 0);
  return reg.getFile(root.name);
}
function bootFileDescriptorProto(init) {
  const proto = /* @__PURE__ */ Object.create({
    syntax: "",
    edition: 0
  });
  return Object.assign(proto, Object.assign(Object.assign({ $typeName: "google.protobuf.FileDescriptorProto", dependency: [], publicDependency: [], weakDependency: [], service: [], extension: [] }, init), { messageType: init.messageType.map(bootDescriptorProto), enumType: init.enumType.map(bootEnumDescriptorProto) }));
}
function bootDescriptorProto(init) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  return {
    $typeName: "google.protobuf.DescriptorProto",
    name: init.name,
    field: (_b = (_a = init.field) === null || _a === void 0 ? void 0 : _a.map(bootFieldDescriptorProto)) !== null && _b !== void 0 ? _b : [],
    extension: [],
    nestedType: (_d = (_c = init.nestedType) === null || _c === void 0 ? void 0 : _c.map(bootDescriptorProto)) !== null && _d !== void 0 ? _d : [],
    enumType: (_f = (_e = init.enumType) === null || _e === void 0 ? void 0 : _e.map(bootEnumDescriptorProto)) !== null && _f !== void 0 ? _f : [],
    extensionRange: (_h = (_g = init.extensionRange) === null || _g === void 0 ? void 0 : _g.map((e) => Object.assign({ $typeName: "google.protobuf.DescriptorProto.ExtensionRange" }, e))) !== null && _h !== void 0 ? _h : [],
    oneofDecl: [],
    reservedRange: [],
    reservedName: []
  };
}
function bootFieldDescriptorProto(init) {
  const proto = /* @__PURE__ */ Object.create({
    label: 1,
    typeName: "",
    extendee: "",
    defaultValue: "",
    oneofIndex: 0,
    jsonName: "",
    proto3Optional: false
  });
  return Object.assign(proto, Object.assign(Object.assign({ $typeName: "google.protobuf.FieldDescriptorProto" }, init), { options: init.options ? bootFieldOptions(init.options) : void 0 }));
}
function bootFieldOptions(init) {
  var _a, _b, _c;
  const proto = /* @__PURE__ */ Object.create({
    ctype: 0,
    packed: false,
    jstype: 0,
    lazy: false,
    unverifiedLazy: false,
    deprecated: false,
    weak: false,
    debugRedact: false,
    retention: 0
  });
  return Object.assign(proto, Object.assign(Object.assign({ $typeName: "google.protobuf.FieldOptions" }, init), { targets: (_a = init.targets) !== null && _a !== void 0 ? _a : [], editionDefaults: (_c = (_b = init.editionDefaults) === null || _b === void 0 ? void 0 : _b.map((e) => Object.assign({ $typeName: "google.protobuf.FieldOptions.EditionDefault" }, e))) !== null && _c !== void 0 ? _c : [], uninterpretedOption: [] }));
}
function bootEnumDescriptorProto(init) {
  return {
    $typeName: "google.protobuf.EnumDescriptorProto",
    name: init.name,
    reservedName: [],
    reservedRange: [],
    value: init.value.map((e) => Object.assign({ $typeName: "google.protobuf.EnumValueDescriptorProto" }, e))
  };
}

// node_modules/@bufbuild/protobuf/dist/esm/codegenv1/message.js
function messageDesc(file, path, ...paths) {
  return paths.reduce((acc, cur) => acc.nestedMessages[cur], file.messages[path]);
}

// node_modules/@bufbuild/protobuf/dist/esm/codegenv1/enum.js
function enumDesc(file, path, ...paths) {
  if (paths.length == 0) {
    return file.enums[path];
  }
  const e = paths.pop();
  return paths.reduce((acc, cur) => acc.nestedMessages[cur], file.messages[path]).nestedEnums[e];
}

// node_modules/@bufbuild/protobuf/dist/esm/wkt/gen/google/protobuf/descriptor_pb.js
var file_google_protobuf_descriptor = /* @__PURE__ */ boot({ "name": "google/protobuf/descriptor.proto", "package": "google.protobuf", "messageType": [{ "name": "FileDescriptorSet", "field": [{ "name": "file", "number": 1, "type": 11, "label": 3, "typeName": ".google.protobuf.FileDescriptorProto" }] }, { "name": "FileDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "package", "number": 2, "type": 9, "label": 1 }, { "name": "dependency", "number": 3, "type": 9, "label": 3 }, { "name": "public_dependency", "number": 10, "type": 5, "label": 3 }, { "name": "weak_dependency", "number": 11, "type": 5, "label": 3 }, { "name": "message_type", "number": 4, "type": 11, "label": 3, "typeName": ".google.protobuf.DescriptorProto" }, { "name": "enum_type", "number": 5, "type": 11, "label": 3, "typeName": ".google.protobuf.EnumDescriptorProto" }, { "name": "service", "number": 6, "type": 11, "label": 3, "typeName": ".google.protobuf.ServiceDescriptorProto" }, { "name": "extension", "number": 7, "type": 11, "label": 3, "typeName": ".google.protobuf.FieldDescriptorProto" }, { "name": "options", "number": 8, "type": 11, "label": 1, "typeName": ".google.protobuf.FileOptions" }, { "name": "source_code_info", "number": 9, "type": 11, "label": 1, "typeName": ".google.protobuf.SourceCodeInfo" }, { "name": "syntax", "number": 12, "type": 9, "label": 1 }, { "name": "edition", "number": 14, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }] }, { "name": "DescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "field", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.FieldDescriptorProto" }, { "name": "extension", "number": 6, "type": 11, "label": 3, "typeName": ".google.protobuf.FieldDescriptorProto" }, { "name": "nested_type", "number": 3, "type": 11, "label": 3, "typeName": ".google.protobuf.DescriptorProto" }, { "name": "enum_type", "number": 4, "type": 11, "label": 3, "typeName": ".google.protobuf.EnumDescriptorProto" }, { "name": "extension_range", "number": 5, "type": 11, "label": 3, "typeName": ".google.protobuf.DescriptorProto.ExtensionRange" }, { "name": "oneof_decl", "number": 8, "type": 11, "label": 3, "typeName": ".google.protobuf.OneofDescriptorProto" }, { "name": "options", "number": 7, "type": 11, "label": 1, "typeName": ".google.protobuf.MessageOptions" }, { "name": "reserved_range", "number": 9, "type": 11, "label": 3, "typeName": ".google.protobuf.DescriptorProto.ReservedRange" }, { "name": "reserved_name", "number": 10, "type": 9, "label": 3 }], "nestedType": [{ "name": "ExtensionRange", "field": [{ "name": "start", "number": 1, "type": 5, "label": 1 }, { "name": "end", "number": 2, "type": 5, "label": 1 }, { "name": "options", "number": 3, "type": 11, "label": 1, "typeName": ".google.protobuf.ExtensionRangeOptions" }] }, { "name": "ReservedRange", "field": [{ "name": "start", "number": 1, "type": 5, "label": 1 }, { "name": "end", "number": 2, "type": 5, "label": 1 }] }] }, { "name": "ExtensionRangeOptions", "field": [{ "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }, { "name": "declaration", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.ExtensionRangeOptions.Declaration", "options": { "retention": 2 } }, { "name": "features", "number": 50, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "verification", "number": 3, "type": 14, "label": 1, "typeName": ".google.protobuf.ExtensionRangeOptions.VerificationState", "defaultValue": "UNVERIFIED", "options": { "retention": 2 } }], "nestedType": [{ "name": "Declaration", "field": [{ "name": "number", "number": 1, "type": 5, "label": 1 }, { "name": "full_name", "number": 2, "type": 9, "label": 1 }, { "name": "type", "number": 3, "type": 9, "label": 1 }, { "name": "reserved", "number": 5, "type": 8, "label": 1 }, { "name": "repeated", "number": 6, "type": 8, "label": 1 }] }], "enumType": [{ "name": "VerificationState", "value": [{ "name": "DECLARATION", "number": 0 }, { "name": "UNVERIFIED", "number": 1 }] }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "FieldDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "number", "number": 3, "type": 5, "label": 1 }, { "name": "label", "number": 4, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldDescriptorProto.Label" }, { "name": "type", "number": 5, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldDescriptorProto.Type" }, { "name": "type_name", "number": 6, "type": 9, "label": 1 }, { "name": "extendee", "number": 2, "type": 9, "label": 1 }, { "name": "default_value", "number": 7, "type": 9, "label": 1 }, { "name": "oneof_index", "number": 9, "type": 5, "label": 1 }, { "name": "json_name", "number": 10, "type": 9, "label": 1 }, { "name": "options", "number": 8, "type": 11, "label": 1, "typeName": ".google.protobuf.FieldOptions" }, { "name": "proto3_optional", "number": 17, "type": 8, "label": 1 }], "enumType": [{ "name": "Type", "value": [{ "name": "TYPE_DOUBLE", "number": 1 }, { "name": "TYPE_FLOAT", "number": 2 }, { "name": "TYPE_INT64", "number": 3 }, { "name": "TYPE_UINT64", "number": 4 }, { "name": "TYPE_INT32", "number": 5 }, { "name": "TYPE_FIXED64", "number": 6 }, { "name": "TYPE_FIXED32", "number": 7 }, { "name": "TYPE_BOOL", "number": 8 }, { "name": "TYPE_STRING", "number": 9 }, { "name": "TYPE_GROUP", "number": 10 }, { "name": "TYPE_MESSAGE", "number": 11 }, { "name": "TYPE_BYTES", "number": 12 }, { "name": "TYPE_UINT32", "number": 13 }, { "name": "TYPE_ENUM", "number": 14 }, { "name": "TYPE_SFIXED32", "number": 15 }, { "name": "TYPE_SFIXED64", "number": 16 }, { "name": "TYPE_SINT32", "number": 17 }, { "name": "TYPE_SINT64", "number": 18 }] }, { "name": "Label", "value": [{ "name": "LABEL_OPTIONAL", "number": 1 }, { "name": "LABEL_REPEATED", "number": 3 }, { "name": "LABEL_REQUIRED", "number": 2 }] }] }, { "name": "OneofDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "options", "number": 2, "type": 11, "label": 1, "typeName": ".google.protobuf.OneofOptions" }] }, { "name": "EnumDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "value", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.EnumValueDescriptorProto" }, { "name": "options", "number": 3, "type": 11, "label": 1, "typeName": ".google.protobuf.EnumOptions" }, { "name": "reserved_range", "number": 4, "type": 11, "label": 3, "typeName": ".google.protobuf.EnumDescriptorProto.EnumReservedRange" }, { "name": "reserved_name", "number": 5, "type": 9, "label": 3 }], "nestedType": [{ "name": "EnumReservedRange", "field": [{ "name": "start", "number": 1, "type": 5, "label": 1 }, { "name": "end", "number": 2, "type": 5, "label": 1 }] }] }, { "name": "EnumValueDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "number", "number": 2, "type": 5, "label": 1 }, { "name": "options", "number": 3, "type": 11, "label": 1, "typeName": ".google.protobuf.EnumValueOptions" }] }, { "name": "ServiceDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "method", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.MethodDescriptorProto" }, { "name": "options", "number": 3, "type": 11, "label": 1, "typeName": ".google.protobuf.ServiceOptions" }] }, { "name": "MethodDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "input_type", "number": 2, "type": 9, "label": 1 }, { "name": "output_type", "number": 3, "type": 9, "label": 1 }, { "name": "options", "number": 4, "type": 11, "label": 1, "typeName": ".google.protobuf.MethodOptions" }, { "name": "client_streaming", "number": 5, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "server_streaming", "number": 6, "type": 8, "label": 1, "defaultValue": "false" }] }, { "name": "FileOptions", "field": [{ "name": "java_package", "number": 1, "type": 9, "label": 1 }, { "name": "java_outer_classname", "number": 8, "type": 9, "label": 1 }, { "name": "java_multiple_files", "number": 10, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "java_generate_equals_and_hash", "number": 20, "type": 8, "label": 1, "options": { "deprecated": true } }, { "name": "java_string_check_utf8", "number": 27, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "optimize_for", "number": 9, "type": 14, "label": 1, "typeName": ".google.protobuf.FileOptions.OptimizeMode", "defaultValue": "SPEED" }, { "name": "go_package", "number": 11, "type": 9, "label": 1 }, { "name": "cc_generic_services", "number": 16, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "java_generic_services", "number": 17, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "py_generic_services", "number": 18, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "deprecated", "number": 23, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "cc_enable_arenas", "number": 31, "type": 8, "label": 1, "defaultValue": "true" }, { "name": "objc_class_prefix", "number": 36, "type": 9, "label": 1 }, { "name": "csharp_namespace", "number": 37, "type": 9, "label": 1 }, { "name": "swift_prefix", "number": 39, "type": 9, "label": 1 }, { "name": "php_class_prefix", "number": 40, "type": 9, "label": 1 }, { "name": "php_namespace", "number": 41, "type": 9, "label": 1 }, { "name": "php_metadata_namespace", "number": 44, "type": 9, "label": 1 }, { "name": "ruby_package", "number": 45, "type": 9, "label": 1 }, { "name": "features", "number": 50, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "enumType": [{ "name": "OptimizeMode", "value": [{ "name": "SPEED", "number": 1 }, { "name": "CODE_SIZE", "number": 2 }, { "name": "LITE_RUNTIME", "number": 3 }] }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "MessageOptions", "field": [{ "name": "message_set_wire_format", "number": 1, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "no_standard_descriptor_accessor", "number": 2, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "deprecated", "number": 3, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "map_entry", "number": 7, "type": 8, "label": 1 }, { "name": "deprecated_legacy_json_field_conflicts", "number": 11, "type": 8, "label": 1, "options": { "deprecated": true } }, { "name": "features", "number": 12, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "FieldOptions", "field": [{ "name": "ctype", "number": 1, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldOptions.CType", "defaultValue": "STRING" }, { "name": "packed", "number": 2, "type": 8, "label": 1 }, { "name": "jstype", "number": 6, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldOptions.JSType", "defaultValue": "JS_NORMAL" }, { "name": "lazy", "number": 5, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "unverified_lazy", "number": 15, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "deprecated", "number": 3, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "weak", "number": 10, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "debug_redact", "number": 16, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "retention", "number": 17, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldOptions.OptionRetention" }, { "name": "targets", "number": 19, "type": 14, "label": 3, "typeName": ".google.protobuf.FieldOptions.OptionTargetType" }, { "name": "edition_defaults", "number": 20, "type": 11, "label": 3, "typeName": ".google.protobuf.FieldOptions.EditionDefault" }, { "name": "features", "number": 21, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "feature_support", "number": 22, "type": 11, "label": 1, "typeName": ".google.protobuf.FieldOptions.FeatureSupport" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "nestedType": [{ "name": "EditionDefault", "field": [{ "name": "edition", "number": 3, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "value", "number": 2, "type": 9, "label": 1 }] }, { "name": "FeatureSupport", "field": [{ "name": "edition_introduced", "number": 1, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "edition_deprecated", "number": 2, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "deprecation_warning", "number": 3, "type": 9, "label": 1 }, { "name": "edition_removed", "number": 4, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }] }], "enumType": [{ "name": "CType", "value": [{ "name": "STRING", "number": 0 }, { "name": "CORD", "number": 1 }, { "name": "STRING_PIECE", "number": 2 }] }, { "name": "JSType", "value": [{ "name": "JS_NORMAL", "number": 0 }, { "name": "JS_STRING", "number": 1 }, { "name": "JS_NUMBER", "number": 2 }] }, { "name": "OptionRetention", "value": [{ "name": "RETENTION_UNKNOWN", "number": 0 }, { "name": "RETENTION_RUNTIME", "number": 1 }, { "name": "RETENTION_SOURCE", "number": 2 }] }, { "name": "OptionTargetType", "value": [{ "name": "TARGET_TYPE_UNKNOWN", "number": 0 }, { "name": "TARGET_TYPE_FILE", "number": 1 }, { "name": "TARGET_TYPE_EXTENSION_RANGE", "number": 2 }, { "name": "TARGET_TYPE_MESSAGE", "number": 3 }, { "name": "TARGET_TYPE_FIELD", "number": 4 }, { "name": "TARGET_TYPE_ONEOF", "number": 5 }, { "name": "TARGET_TYPE_ENUM", "number": 6 }, { "name": "TARGET_TYPE_ENUM_ENTRY", "number": 7 }, { "name": "TARGET_TYPE_SERVICE", "number": 8 }, { "name": "TARGET_TYPE_METHOD", "number": 9 }] }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "OneofOptions", "field": [{ "name": "features", "number": 1, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "EnumOptions", "field": [{ "name": "allow_alias", "number": 2, "type": 8, "label": 1 }, { "name": "deprecated", "number": 3, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "deprecated_legacy_json_field_conflicts", "number": 6, "type": 8, "label": 1, "options": { "deprecated": true } }, { "name": "features", "number": 7, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "EnumValueOptions", "field": [{ "name": "deprecated", "number": 1, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "features", "number": 2, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "debug_redact", "number": 3, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "feature_support", "number": 4, "type": 11, "label": 1, "typeName": ".google.protobuf.FieldOptions.FeatureSupport" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "ServiceOptions", "field": [{ "name": "features", "number": 34, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "deprecated", "number": 33, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "MethodOptions", "field": [{ "name": "deprecated", "number": 33, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "idempotency_level", "number": 34, "type": 14, "label": 1, "typeName": ".google.protobuf.MethodOptions.IdempotencyLevel", "defaultValue": "IDEMPOTENCY_UNKNOWN" }, { "name": "features", "number": 35, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "enumType": [{ "name": "IdempotencyLevel", "value": [{ "name": "IDEMPOTENCY_UNKNOWN", "number": 0 }, { "name": "NO_SIDE_EFFECTS", "number": 1 }, { "name": "IDEMPOTENT", "number": 2 }] }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "UninterpretedOption", "field": [{ "name": "name", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption.NamePart" }, { "name": "identifier_value", "number": 3, "type": 9, "label": 1 }, { "name": "positive_int_value", "number": 4, "type": 4, "label": 1 }, { "name": "negative_int_value", "number": 5, "type": 3, "label": 1 }, { "name": "double_value", "number": 6, "type": 1, "label": 1 }, { "name": "string_value", "number": 7, "type": 12, "label": 1 }, { "name": "aggregate_value", "number": 8, "type": 9, "label": 1 }], "nestedType": [{ "name": "NamePart", "field": [{ "name": "name_part", "number": 1, "type": 9, "label": 2 }, { "name": "is_extension", "number": 2, "type": 8, "label": 2 }] }] }, { "name": "FeatureSet", "field": [{ "name": "field_presence", "number": 1, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.FieldPresence", "options": { "retention": 1, "targets": [4, 1], "editionDefaults": [{ "value": "EXPLICIT", "edition": 900 }, { "value": "IMPLICIT", "edition": 999 }, { "value": "EXPLICIT", "edition": 1e3 }] } }, { "name": "enum_type", "number": 2, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.EnumType", "options": { "retention": 1, "targets": [6, 1], "editionDefaults": [{ "value": "CLOSED", "edition": 900 }, { "value": "OPEN", "edition": 999 }] } }, { "name": "repeated_field_encoding", "number": 3, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.RepeatedFieldEncoding", "options": { "retention": 1, "targets": [4, 1], "editionDefaults": [{ "value": "EXPANDED", "edition": 900 }, { "value": "PACKED", "edition": 999 }] } }, { "name": "utf8_validation", "number": 4, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.Utf8Validation", "options": { "retention": 1, "targets": [4, 1], "editionDefaults": [{ "value": "NONE", "edition": 900 }, { "value": "VERIFY", "edition": 999 }] } }, { "name": "message_encoding", "number": 5, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.MessageEncoding", "options": { "retention": 1, "targets": [4, 1], "editionDefaults": [{ "value": "LENGTH_PREFIXED", "edition": 900 }] } }, { "name": "json_format", "number": 6, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.JsonFormat", "options": { "retention": 1, "targets": [3, 6, 1], "editionDefaults": [{ "value": "LEGACY_BEST_EFFORT", "edition": 900 }, { "value": "ALLOW", "edition": 999 }] } }], "enumType": [{ "name": "FieldPresence", "value": [{ "name": "FIELD_PRESENCE_UNKNOWN", "number": 0 }, { "name": "EXPLICIT", "number": 1 }, { "name": "IMPLICIT", "number": 2 }, { "name": "LEGACY_REQUIRED", "number": 3 }] }, { "name": "EnumType", "value": [{ "name": "ENUM_TYPE_UNKNOWN", "number": 0 }, { "name": "OPEN", "number": 1 }, { "name": "CLOSED", "number": 2 }] }, { "name": "RepeatedFieldEncoding", "value": [{ "name": "REPEATED_FIELD_ENCODING_UNKNOWN", "number": 0 }, { "name": "PACKED", "number": 1 }, { "name": "EXPANDED", "number": 2 }] }, { "name": "Utf8Validation", "value": [{ "name": "UTF8_VALIDATION_UNKNOWN", "number": 0 }, { "name": "VERIFY", "number": 2 }, { "name": "NONE", "number": 3 }] }, { "name": "MessageEncoding", "value": [{ "name": "MESSAGE_ENCODING_UNKNOWN", "number": 0 }, { "name": "LENGTH_PREFIXED", "number": 1 }, { "name": "DELIMITED", "number": 2 }] }, { "name": "JsonFormat", "value": [{ "name": "JSON_FORMAT_UNKNOWN", "number": 0 }, { "name": "ALLOW", "number": 1 }, { "name": "LEGACY_BEST_EFFORT", "number": 2 }] }], "extensionRange": [{ "start": 1e3, "end": 9995 }, { "start": 9995, "end": 1e4 }, { "start": 1e4, "end": 10001 }] }, { "name": "FeatureSetDefaults", "field": [{ "name": "defaults", "number": 1, "type": 11, "label": 3, "typeName": ".google.protobuf.FeatureSetDefaults.FeatureSetEditionDefault" }, { "name": "minimum_edition", "number": 4, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "maximum_edition", "number": 5, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }], "nestedType": [{ "name": "FeatureSetEditionDefault", "field": [{ "name": "edition", "number": 3, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "overridable_features", "number": 4, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "fixed_features", "number": 5, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }] }] }, { "name": "SourceCodeInfo", "field": [{ "name": "location", "number": 1, "type": 11, "label": 3, "typeName": ".google.protobuf.SourceCodeInfo.Location" }], "nestedType": [{ "name": "Location", "field": [{ "name": "path", "number": 1, "type": 5, "label": 3, "options": { "packed": true } }, { "name": "span", "number": 2, "type": 5, "label": 3, "options": { "packed": true } }, { "name": "leading_comments", "number": 3, "type": 9, "label": 1 }, { "name": "trailing_comments", "number": 4, "type": 9, "label": 1 }, { "name": "leading_detached_comments", "number": 6, "type": 9, "label": 3 }] }] }, { "name": "GeneratedCodeInfo", "field": [{ "name": "annotation", "number": 1, "type": 11, "label": 3, "typeName": ".google.protobuf.GeneratedCodeInfo.Annotation" }], "nestedType": [{ "name": "Annotation", "field": [{ "name": "path", "number": 1, "type": 5, "label": 3, "options": { "packed": true } }, { "name": "source_file", "number": 2, "type": 9, "label": 1 }, { "name": "begin", "number": 3, "type": 5, "label": 1 }, { "name": "end", "number": 4, "type": 5, "label": 1 }, { "name": "semantic", "number": 5, "type": 14, "label": 1, "typeName": ".google.protobuf.GeneratedCodeInfo.Annotation.Semantic" }], "enumType": [{ "name": "Semantic", "value": [{ "name": "NONE", "number": 0 }, { "name": "SET", "number": 1 }, { "name": "ALIAS", "number": 2 }] }] }] }], "enumType": [{ "name": "Edition", "value": [{ "name": "EDITION_UNKNOWN", "number": 0 }, { "name": "EDITION_LEGACY", "number": 900 }, { "name": "EDITION_PROTO2", "number": 998 }, { "name": "EDITION_PROTO3", "number": 999 }, { "name": "EDITION_2023", "number": 1e3 }, { "name": "EDITION_2024", "number": 1001 }, { "name": "EDITION_1_TEST_ONLY", "number": 1 }, { "name": "EDITION_2_TEST_ONLY", "number": 2 }, { "name": "EDITION_99997_TEST_ONLY", "number": 99997 }, { "name": "EDITION_99998_TEST_ONLY", "number": 99998 }, { "name": "EDITION_99999_TEST_ONLY", "number": 99999 }, { "name": "EDITION_MAX", "number": 2147483647 }] }] });
var FileDescriptorProtoSchema = /* @__PURE__ */ messageDesc(file_google_protobuf_descriptor, 1);
var ExtensionRangeOptions_VerificationState;
(function(ExtensionRangeOptions_VerificationState2) {
  ExtensionRangeOptions_VerificationState2[ExtensionRangeOptions_VerificationState2["DECLARATION"] = 0] = "DECLARATION";
  ExtensionRangeOptions_VerificationState2[ExtensionRangeOptions_VerificationState2["UNVERIFIED"] = 1] = "UNVERIFIED";
})(ExtensionRangeOptions_VerificationState || (ExtensionRangeOptions_VerificationState = {}));
var FieldDescriptorProto_Type;
(function(FieldDescriptorProto_Type2) {
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["DOUBLE"] = 1] = "DOUBLE";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["FLOAT"] = 2] = "FLOAT";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["INT64"] = 3] = "INT64";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["UINT64"] = 4] = "UINT64";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["INT32"] = 5] = "INT32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["FIXED64"] = 6] = "FIXED64";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["FIXED32"] = 7] = "FIXED32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["BOOL"] = 8] = "BOOL";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["STRING"] = 9] = "STRING";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["GROUP"] = 10] = "GROUP";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["MESSAGE"] = 11] = "MESSAGE";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["BYTES"] = 12] = "BYTES";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["UINT32"] = 13] = "UINT32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["ENUM"] = 14] = "ENUM";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["SFIXED32"] = 15] = "SFIXED32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["SFIXED64"] = 16] = "SFIXED64";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["SINT32"] = 17] = "SINT32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["SINT64"] = 18] = "SINT64";
})(FieldDescriptorProto_Type || (FieldDescriptorProto_Type = {}));
var FieldDescriptorProto_Label;
(function(FieldDescriptorProto_Label2) {
  FieldDescriptorProto_Label2[FieldDescriptorProto_Label2["OPTIONAL"] = 1] = "OPTIONAL";
  FieldDescriptorProto_Label2[FieldDescriptorProto_Label2["REPEATED"] = 3] = "REPEATED";
  FieldDescriptorProto_Label2[FieldDescriptorProto_Label2["REQUIRED"] = 2] = "REQUIRED";
})(FieldDescriptorProto_Label || (FieldDescriptorProto_Label = {}));
var FileOptions_OptimizeMode;
(function(FileOptions_OptimizeMode2) {
  FileOptions_OptimizeMode2[FileOptions_OptimizeMode2["SPEED"] = 1] = "SPEED";
  FileOptions_OptimizeMode2[FileOptions_OptimizeMode2["CODE_SIZE"] = 2] = "CODE_SIZE";
  FileOptions_OptimizeMode2[FileOptions_OptimizeMode2["LITE_RUNTIME"] = 3] = "LITE_RUNTIME";
})(FileOptions_OptimizeMode || (FileOptions_OptimizeMode = {}));
var FieldOptions_CType;
(function(FieldOptions_CType2) {
  FieldOptions_CType2[FieldOptions_CType2["STRING"] = 0] = "STRING";
  FieldOptions_CType2[FieldOptions_CType2["CORD"] = 1] = "CORD";
  FieldOptions_CType2[FieldOptions_CType2["STRING_PIECE"] = 2] = "STRING_PIECE";
})(FieldOptions_CType || (FieldOptions_CType = {}));
var FieldOptions_JSType;
(function(FieldOptions_JSType2) {
  FieldOptions_JSType2[FieldOptions_JSType2["JS_NORMAL"] = 0] = "JS_NORMAL";
  FieldOptions_JSType2[FieldOptions_JSType2["JS_STRING"] = 1] = "JS_STRING";
  FieldOptions_JSType2[FieldOptions_JSType2["JS_NUMBER"] = 2] = "JS_NUMBER";
})(FieldOptions_JSType || (FieldOptions_JSType = {}));
var FieldOptions_OptionRetention;
(function(FieldOptions_OptionRetention2) {
  FieldOptions_OptionRetention2[FieldOptions_OptionRetention2["RETENTION_UNKNOWN"] = 0] = "RETENTION_UNKNOWN";
  FieldOptions_OptionRetention2[FieldOptions_OptionRetention2["RETENTION_RUNTIME"] = 1] = "RETENTION_RUNTIME";
  FieldOptions_OptionRetention2[FieldOptions_OptionRetention2["RETENTION_SOURCE"] = 2] = "RETENTION_SOURCE";
})(FieldOptions_OptionRetention || (FieldOptions_OptionRetention = {}));
var FieldOptions_OptionTargetType;
(function(FieldOptions_OptionTargetType2) {
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_UNKNOWN"] = 0] = "TARGET_TYPE_UNKNOWN";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_FILE"] = 1] = "TARGET_TYPE_FILE";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_EXTENSION_RANGE"] = 2] = "TARGET_TYPE_EXTENSION_RANGE";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_MESSAGE"] = 3] = "TARGET_TYPE_MESSAGE";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_FIELD"] = 4] = "TARGET_TYPE_FIELD";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_ONEOF"] = 5] = "TARGET_TYPE_ONEOF";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_ENUM"] = 6] = "TARGET_TYPE_ENUM";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_ENUM_ENTRY"] = 7] = "TARGET_TYPE_ENUM_ENTRY";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_SERVICE"] = 8] = "TARGET_TYPE_SERVICE";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_METHOD"] = 9] = "TARGET_TYPE_METHOD";
})(FieldOptions_OptionTargetType || (FieldOptions_OptionTargetType = {}));
var MethodOptions_IdempotencyLevel;
(function(MethodOptions_IdempotencyLevel2) {
  MethodOptions_IdempotencyLevel2[MethodOptions_IdempotencyLevel2["IDEMPOTENCY_UNKNOWN"] = 0] = "IDEMPOTENCY_UNKNOWN";
  MethodOptions_IdempotencyLevel2[MethodOptions_IdempotencyLevel2["NO_SIDE_EFFECTS"] = 1] = "NO_SIDE_EFFECTS";
  MethodOptions_IdempotencyLevel2[MethodOptions_IdempotencyLevel2["IDEMPOTENT"] = 2] = "IDEMPOTENT";
})(MethodOptions_IdempotencyLevel || (MethodOptions_IdempotencyLevel = {}));
var FeatureSet_FieldPresence;
(function(FeatureSet_FieldPresence2) {
  FeatureSet_FieldPresence2[FeatureSet_FieldPresence2["FIELD_PRESENCE_UNKNOWN"] = 0] = "FIELD_PRESENCE_UNKNOWN";
  FeatureSet_FieldPresence2[FeatureSet_FieldPresence2["EXPLICIT"] = 1] = "EXPLICIT";
  FeatureSet_FieldPresence2[FeatureSet_FieldPresence2["IMPLICIT"] = 2] = "IMPLICIT";
  FeatureSet_FieldPresence2[FeatureSet_FieldPresence2["LEGACY_REQUIRED"] = 3] = "LEGACY_REQUIRED";
})(FeatureSet_FieldPresence || (FeatureSet_FieldPresence = {}));
var FeatureSet_EnumType;
(function(FeatureSet_EnumType2) {
  FeatureSet_EnumType2[FeatureSet_EnumType2["ENUM_TYPE_UNKNOWN"] = 0] = "ENUM_TYPE_UNKNOWN";
  FeatureSet_EnumType2[FeatureSet_EnumType2["OPEN"] = 1] = "OPEN";
  FeatureSet_EnumType2[FeatureSet_EnumType2["CLOSED"] = 2] = "CLOSED";
})(FeatureSet_EnumType || (FeatureSet_EnumType = {}));
var FeatureSet_RepeatedFieldEncoding;
(function(FeatureSet_RepeatedFieldEncoding2) {
  FeatureSet_RepeatedFieldEncoding2[FeatureSet_RepeatedFieldEncoding2["REPEATED_FIELD_ENCODING_UNKNOWN"] = 0] = "REPEATED_FIELD_ENCODING_UNKNOWN";
  FeatureSet_RepeatedFieldEncoding2[FeatureSet_RepeatedFieldEncoding2["PACKED"] = 1] = "PACKED";
  FeatureSet_RepeatedFieldEncoding2[FeatureSet_RepeatedFieldEncoding2["EXPANDED"] = 2] = "EXPANDED";
})(FeatureSet_RepeatedFieldEncoding || (FeatureSet_RepeatedFieldEncoding = {}));
var FeatureSet_Utf8Validation;
(function(FeatureSet_Utf8Validation2) {
  FeatureSet_Utf8Validation2[FeatureSet_Utf8Validation2["UTF8_VALIDATION_UNKNOWN"] = 0] = "UTF8_VALIDATION_UNKNOWN";
  FeatureSet_Utf8Validation2[FeatureSet_Utf8Validation2["VERIFY"] = 2] = "VERIFY";
  FeatureSet_Utf8Validation2[FeatureSet_Utf8Validation2["NONE"] = 3] = "NONE";
})(FeatureSet_Utf8Validation || (FeatureSet_Utf8Validation = {}));
var FeatureSet_MessageEncoding;
(function(FeatureSet_MessageEncoding2) {
  FeatureSet_MessageEncoding2[FeatureSet_MessageEncoding2["MESSAGE_ENCODING_UNKNOWN"] = 0] = "MESSAGE_ENCODING_UNKNOWN";
  FeatureSet_MessageEncoding2[FeatureSet_MessageEncoding2["LENGTH_PREFIXED"] = 1] = "LENGTH_PREFIXED";
  FeatureSet_MessageEncoding2[FeatureSet_MessageEncoding2["DELIMITED"] = 2] = "DELIMITED";
})(FeatureSet_MessageEncoding || (FeatureSet_MessageEncoding = {}));
var FeatureSet_JsonFormat;
(function(FeatureSet_JsonFormat2) {
  FeatureSet_JsonFormat2[FeatureSet_JsonFormat2["JSON_FORMAT_UNKNOWN"] = 0] = "JSON_FORMAT_UNKNOWN";
  FeatureSet_JsonFormat2[FeatureSet_JsonFormat2["ALLOW"] = 1] = "ALLOW";
  FeatureSet_JsonFormat2[FeatureSet_JsonFormat2["LEGACY_BEST_EFFORT"] = 2] = "LEGACY_BEST_EFFORT";
})(FeatureSet_JsonFormat || (FeatureSet_JsonFormat = {}));
var GeneratedCodeInfo_Annotation_Semantic;
(function(GeneratedCodeInfo_Annotation_Semantic2) {
  GeneratedCodeInfo_Annotation_Semantic2[GeneratedCodeInfo_Annotation_Semantic2["NONE"] = 0] = "NONE";
  GeneratedCodeInfo_Annotation_Semantic2[GeneratedCodeInfo_Annotation_Semantic2["SET"] = 1] = "SET";
  GeneratedCodeInfo_Annotation_Semantic2[GeneratedCodeInfo_Annotation_Semantic2["ALIAS"] = 2] = "ALIAS";
})(GeneratedCodeInfo_Annotation_Semantic || (GeneratedCodeInfo_Annotation_Semantic = {}));
var Edition;
(function(Edition2) {
  Edition2[Edition2["EDITION_UNKNOWN"] = 0] = "EDITION_UNKNOWN";
  Edition2[Edition2["EDITION_LEGACY"] = 900] = "EDITION_LEGACY";
  Edition2[Edition2["EDITION_PROTO2"] = 998] = "EDITION_PROTO2";
  Edition2[Edition2["EDITION_PROTO3"] = 999] = "EDITION_PROTO3";
  Edition2[Edition2["EDITION_2023"] = 1e3] = "EDITION_2023";
  Edition2[Edition2["EDITION_2024"] = 1001] = "EDITION_2024";
  Edition2[Edition2["EDITION_1_TEST_ONLY"] = 1] = "EDITION_1_TEST_ONLY";
  Edition2[Edition2["EDITION_2_TEST_ONLY"] = 2] = "EDITION_2_TEST_ONLY";
  Edition2[Edition2["EDITION_99997_TEST_ONLY"] = 99997] = "EDITION_99997_TEST_ONLY";
  Edition2[Edition2["EDITION_99998_TEST_ONLY"] = 99998] = "EDITION_99998_TEST_ONLY";
  Edition2[Edition2["EDITION_99999_TEST_ONLY"] = 99999] = "EDITION_99999_TEST_ONLY";
  Edition2[Edition2["EDITION_MAX"] = 2147483647] = "EDITION_MAX";
})(Edition || (Edition = {}));

// node_modules/@bufbuild/protobuf/dist/esm/from-binary.js
var readDefaults = {
  readUnknownFields: true
};
function makeReadOptions(options) {
  return options ? Object.assign(Object.assign({}, readDefaults), options) : readDefaults;
}
function fromBinary(schema, bytes, options) {
  const msg = reflect(schema, void 0, false);
  readMessage(msg, new BinaryReader(bytes), makeReadOptions(options), false, bytes.byteLength);
  return msg.message;
}
function readMessage(message, reader, options, delimited, lengthOrDelimitedFieldNo) {
  var _a;
  const end = delimited ? reader.len : reader.pos + lengthOrDelimitedFieldNo;
  let fieldNo, wireType;
  const unknownFields = (_a = message.getUnknown()) !== null && _a !== void 0 ? _a : [];
  while (reader.pos < end) {
    [fieldNo, wireType] = reader.tag();
    if (delimited && wireType == WireType.EndGroup) {
      break;
    }
    const field = message.findNumber(fieldNo);
    if (!field) {
      const data = reader.skip(wireType, fieldNo);
      if (options.readUnknownFields) {
        unknownFields.push({ no: fieldNo, wireType, data });
      }
      continue;
    }
    readField(message, reader, field, wireType, options);
  }
  if (delimited) {
    if (wireType != WireType.EndGroup || fieldNo !== lengthOrDelimitedFieldNo) {
      throw new Error(`invalid end group tag`);
    }
  }
  if (unknownFields.length > 0) {
    message.setUnknown(unknownFields);
  }
}
function readField(message, reader, field, wireType, options) {
  switch (field.fieldKind) {
    case "scalar":
      message.set(field, readScalar(reader, field.scalar));
      break;
    case "enum":
      message.set(field, readScalar(reader, ScalarType.INT32));
      break;
    case "message":
      message.set(field, readMessageField(reader, options, field, message.get(field)));
      break;
    case "list":
      readListField(reader, wireType, message.get(field), options);
      break;
    case "map":
      readMapEntry(reader, message.get(field), options);
      break;
  }
}
function readMapEntry(reader, map, options) {
  const field = map.field();
  let key, val;
  const end = reader.pos + reader.uint32();
  while (reader.pos < end) {
    const [fieldNo] = reader.tag();
    switch (fieldNo) {
      case 1:
        key = readScalar(reader, field.mapKey);
        break;
      case 2:
        switch (field.mapKind) {
          case "scalar":
            val = readScalar(reader, field.scalar);
            break;
          case "enum":
            val = reader.int32();
            break;
          case "message":
            val = readMessageField(reader, options, field);
            break;
        }
        break;
    }
  }
  if (key === void 0) {
    key = scalarZeroValue(field.mapKey, false);
  }
  if (val === void 0) {
    switch (field.mapKind) {
      case "scalar":
        val = scalarZeroValue(field.scalar, false);
        break;
      case "enum":
        val = field.enum.values[0].number;
        break;
      case "message":
        val = reflect(field.message, void 0, false);
        break;
    }
  }
  map.set(key, val);
}
function readListField(reader, wireType, list, options) {
  var _a;
  const field = list.field();
  if (field.listKind === "message") {
    list.add(readMessageField(reader, options, field));
    return;
  }
  const scalarType = (_a = field.scalar) !== null && _a !== void 0 ? _a : ScalarType.INT32;
  const packed = wireType == WireType.LengthDelimited && scalarType != ScalarType.STRING && scalarType != ScalarType.BYTES;
  if (!packed) {
    list.add(readScalar(reader, scalarType));
    return;
  }
  const e = reader.uint32() + reader.pos;
  while (reader.pos < e) {
    list.add(readScalar(reader, scalarType));
  }
}
function readMessageField(reader, options, field, mergeMessage) {
  const delimited = field.delimitedEncoding;
  const message = mergeMessage !== null && mergeMessage !== void 0 ? mergeMessage : reflect(field.message, void 0, false);
  readMessage(message, reader, options, delimited, delimited ? field.number : reader.uint32());
  return message;
}
function readScalar(reader, type) {
  switch (type) {
    case ScalarType.STRING:
      return reader.string();
    case ScalarType.BOOL:
      return reader.bool();
    case ScalarType.DOUBLE:
      return reader.double();
    case ScalarType.FLOAT:
      return reader.float();
    case ScalarType.INT32:
      return reader.int32();
    case ScalarType.INT64:
      return reader.int64();
    case ScalarType.UINT64:
      return reader.uint64();
    case ScalarType.FIXED64:
      return reader.fixed64();
    case ScalarType.BYTES:
      return reader.bytes();
    case ScalarType.FIXED32:
      return reader.fixed32();
    case ScalarType.SFIXED32:
      return reader.sfixed32();
    case ScalarType.SFIXED64:
      return reader.sfixed64();
    case ScalarType.SINT64:
      return reader.sint64();
    case ScalarType.UINT32:
      return reader.uint32();
    case ScalarType.SINT32:
      return reader.sint32();
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/codegenv1/file.js
function fileDesc(b64, imports) {
  var _a;
  const root = fromBinary(FileDescriptorProtoSchema, base64Decode(b64));
  root.messageType.forEach(restoreJsonNames);
  root.dependency = (_a = imports === null || imports === void 0 ? void 0 : imports.map((f) => f.proto.name)) !== null && _a !== void 0 ? _a : [];
  const reg = createFileRegistry(root, (protoFileName) => imports === null || imports === void 0 ? void 0 : imports.find((f) => f.proto.name === protoFileName));
  return reg.getFile(root.name);
}

// node_modules/@bufbuild/protobuf/dist/esm/to-binary.js
var LEGACY_REQUIRED2 = 3;
var writeDefaults = {
  writeUnknownFields: true
};
function makeWriteOptions(options) {
  return options ? Object.assign(Object.assign({}, writeDefaults), options) : writeDefaults;
}
function toBinary(schema, message, options) {
  return writeFields(new BinaryWriter(), makeWriteOptions(options), reflect(schema, message)).finish();
}
function writeFields(writer, opts, msg) {
  var _a;
  for (const f of msg.sortedFields) {
    if (!msg.isSet(f)) {
      if (f.presence == LEGACY_REQUIRED2) {
        throw new Error(`cannot encode field ${msg.desc.typeName}.${f.name} to binary: required field not set`);
      }
      continue;
    }
    writeField(writer, opts, msg, f);
  }
  if (opts.writeUnknownFields) {
    for (const { no, wireType, data } of (_a = msg.getUnknown()) !== null && _a !== void 0 ? _a : []) {
      writer.tag(no, wireType).raw(data);
    }
  }
  return writer;
}
function writeField(writer, opts, msg, field) {
  var _a;
  switch (field.fieldKind) {
    case "scalar":
    case "enum":
      writeScalar(writer, (_a = field.scalar) !== null && _a !== void 0 ? _a : ScalarType.INT32, field.number, msg.get(field));
      break;
    case "list":
      writeListField(writer, opts, field, msg.get(field));
      break;
    case "message":
      writeMessageField(writer, opts, field, msg.get(field));
      break;
    case "map":
      for (const [key, val] of msg.get(field)) {
        writeMapEntry(writer, opts, field, key, val);
      }
      break;
  }
}
function writeScalar(writer, scalarType, fieldNo, value) {
  writeScalarValue(writer.tag(fieldNo, writeTypeOfScalar(scalarType)), scalarType, value);
}
function writeMessageField(writer, opts, field, message) {
  if (field.delimitedEncoding) {
    writeFields(writer.tag(field.number, WireType.StartGroup), opts, message).tag(field.number, WireType.EndGroup);
  } else {
    writeFields(writer.tag(field.number, WireType.LengthDelimited).fork(), opts, message).join();
  }
}
function writeListField(writer, opts, field, list) {
  var _a;
  if (field.listKind == "message") {
    for (const item of list) {
      writeMessageField(writer, opts, field, item);
    }
    return;
  }
  const scalarType = (_a = field.scalar) !== null && _a !== void 0 ? _a : ScalarType.INT32;
  if (field.packed) {
    if (!list.size) {
      return;
    }
    writer.tag(field.number, WireType.LengthDelimited).fork();
    for (const item of list) {
      writeScalarValue(writer, scalarType, item);
    }
    writer.join();
    return;
  }
  for (const item of list) {
    writeScalar(writer, scalarType, field.number, item);
  }
}
function writeMapEntry(writer, opts, field, key, value) {
  var _a;
  writer.tag(field.number, WireType.LengthDelimited).fork();
  writeScalar(writer, field.mapKey, 1, key);
  switch (field.mapKind) {
    case "scalar":
    case "enum":
      writeScalar(writer, (_a = field.scalar) !== null && _a !== void 0 ? _a : ScalarType.INT32, 2, value);
      break;
    case "message":
      writeFields(writer.tag(2, WireType.LengthDelimited).fork(), opts, value).join();
      break;
  }
  writer.join();
}
function writeScalarValue(writer, type, value) {
  switch (type) {
    case ScalarType.STRING:
      writer.string(value);
      break;
    case ScalarType.BOOL:
      writer.bool(value);
      break;
    case ScalarType.DOUBLE:
      writer.double(value);
      break;
    case ScalarType.FLOAT:
      writer.float(value);
      break;
    case ScalarType.INT32:
      writer.int32(value);
      break;
    case ScalarType.INT64:
      writer.int64(value);
      break;
    case ScalarType.UINT64:
      writer.uint64(value);
      break;
    case ScalarType.FIXED64:
      writer.fixed64(value);
      break;
    case ScalarType.BYTES:
      writer.bytes(value);
      break;
    case ScalarType.FIXED32:
      writer.fixed32(value);
      break;
    case ScalarType.SFIXED32:
      writer.sfixed32(value);
      break;
    case ScalarType.SFIXED64:
      writer.sfixed64(value);
      break;
    case ScalarType.SINT64:
      writer.sint64(value);
      break;
    case ScalarType.UINT32:
      writer.uint32(value);
      break;
    case ScalarType.SINT32:
      writer.sint32(value);
      break;
  }
}
function writeTypeOfScalar(type) {
  switch (type) {
    case ScalarType.BYTES:
    case ScalarType.STRING:
      return WireType.LengthDelimited;
    case ScalarType.DOUBLE:
    case ScalarType.FIXED64:
    case ScalarType.SFIXED64:
      return WireType.Bit64;
    case ScalarType.FIXED32:
    case ScalarType.SFIXED32:
    case ScalarType.FLOAT:
      return WireType.Bit32;
    default:
      return WireType.Varint;
  }
}

// node_modules/@meshtastic/protobufs/mod.js
var mod_exports = {};
__export(mod_exports, {
  ATAK: () => atak_pb_exports,
  Admin: () => admin_pb_exports,
  AppOnly: () => apponly_pb_exports,
  CannedMessages: () => cannedmessages_pb_exports,
  Channel: () => channel_pb_exports,
  ClientOnly: () => clientonly_pb_exports,
  Config: () => config_pb_exports,
  ConnectionStatus: () => connection_status_pb_exports,
  LocalOnly: () => localonly_pb_exports,
  Mesh: () => mesh_pb_exports,
  ModuleConfig: () => module_config_pb_exports,
  Mqtt: () => mqtt_pb_exports,
  PaxCount: () => paxcount_pb_exports,
  Portnums: () => portnums_pb_exports,
  PowerMon: () => powermon_pb_exports,
  RemoteHardware: () => remote_hardware_pb_exports,
  Rtttl: () => rtttl_pb_exports,
  StoreForward: () => storeforward_pb_exports,
  Telemetry: () => telemetry_pb_exports,
  Xmodem: () => xmodem_pb_exports
});

// node_modules/@meshtastic/protobufs/lib/admin_pb.js
var admin_pb_exports = {};
__export(admin_pb_exports, {
  AdminMessageSchema: () => AdminMessageSchema,
  AdminMessage_ConfigType: () => AdminMessage_ConfigType,
  AdminMessage_ConfigTypeSchema: () => AdminMessage_ConfigTypeSchema,
  AdminMessage_ModuleConfigType: () => AdminMessage_ModuleConfigType,
  AdminMessage_ModuleConfigTypeSchema: () => AdminMessage_ModuleConfigTypeSchema,
  HamParametersSchema: () => HamParametersSchema,
  NodeRemoteHardwarePinsResponseSchema: () => NodeRemoteHardwarePinsResponseSchema,
  file_admin: () => file_admin
});

// node_modules/@meshtastic/protobufs/lib/channel_pb.js
var channel_pb_exports = {};
__export(channel_pb_exports, {
  ChannelSchema: () => ChannelSchema,
  ChannelSettingsSchema: () => ChannelSettingsSchema,
  Channel_Role: () => Channel_Role,
  Channel_RoleSchema: () => Channel_RoleSchema,
  ModuleSettingsSchema: () => ModuleSettingsSchema,
  file_channel: () => file_channel
});
var file_channel = /* @__PURE__ */ fileDesc("Cg1jaGFubmVsLnByb3RvEgptZXNodGFzdGljIrgBCg9DaGFubmVsU2V0dGluZ3MSFwoLY2hhbm5lbF9udW0YASABKA1CAhgBEgsKA3BzaxgCIAEoDBIMCgRuYW1lGAMgASgJEgoKAmlkGAQgASgHEhYKDnVwbGlua19lbmFibGVkGAUgASgIEhgKEGRvd25saW5rX2VuYWJsZWQYBiABKAgSMwoPbW9kdWxlX3NldHRpbmdzGAcgASgLMhoubWVzaHRhc3RpYy5Nb2R1bGVTZXR0aW5ncyJFCg5Nb2R1bGVTZXR0aW5ncxIaChJwb3NpdGlvbl9wcmVjaXNpb24YASABKA0SFwoPaXNfY2xpZW50X211dGVkGAIgASgIIqEBCgdDaGFubmVsEg0KBWluZGV4GAEgASgFEi0KCHNldHRpbmdzGAIgASgLMhsubWVzaHRhc3RpYy5DaGFubmVsU2V0dGluZ3MSJgoEcm9sZRgDIAEoDjIYLm1lc2h0YXN0aWMuQ2hhbm5lbC5Sb2xlIjAKBFJvbGUSDAoIRElTQUJMRUQQABILCgdQUklNQVJZEAESDQoJU0VDT05EQVJZEAJCYgoTY29tLmdlZWtzdmlsbGUubWVzaEINQ2hhbm5lbFByb3Rvc1oiZ2l0aHViLmNvbS9tZXNodGFzdGljL2dvL2dlbmVyYXRlZKoCFE1lc2h0YXN0aWMuUHJvdG9idWZzugIAYgZwcm90bzM");
var ChannelSettingsSchema = /* @__PURE__ */ messageDesc(file_channel, 0);
var ModuleSettingsSchema = /* @__PURE__ */ messageDesc(file_channel, 1);
var ChannelSchema = /* @__PURE__ */ messageDesc(file_channel, 2);
var Channel_Role;
(function(Channel_Role2) {
  Channel_Role2[Channel_Role2["DISABLED"] = 0] = "DISABLED";
  Channel_Role2[Channel_Role2["PRIMARY"] = 1] = "PRIMARY";
  Channel_Role2[Channel_Role2["SECONDARY"] = 2] = "SECONDARY";
})(Channel_Role || (Channel_Role = {}));
var Channel_RoleSchema = /* @__PURE__ */ enumDesc(file_channel, 2, 0);

// node_modules/@meshtastic/protobufs/lib/config_pb.js
var config_pb_exports = {};
__export(config_pb_exports, {
  ConfigSchema: () => ConfigSchema,
  Config_BluetoothConfigSchema: () => Config_BluetoothConfigSchema,
  Config_BluetoothConfig_PairingMode: () => Config_BluetoothConfig_PairingMode,
  Config_BluetoothConfig_PairingModeSchema: () => Config_BluetoothConfig_PairingModeSchema,
  Config_DeviceConfigSchema: () => Config_DeviceConfigSchema,
  Config_DeviceConfig_RebroadcastMode: () => Config_DeviceConfig_RebroadcastMode,
  Config_DeviceConfig_RebroadcastModeSchema: () => Config_DeviceConfig_RebroadcastModeSchema,
  Config_DeviceConfig_Role: () => Config_DeviceConfig_Role,
  Config_DeviceConfig_RoleSchema: () => Config_DeviceConfig_RoleSchema,
  Config_DisplayConfigSchema: () => Config_DisplayConfigSchema,
  Config_DisplayConfig_CompassOrientation: () => Config_DisplayConfig_CompassOrientation,
  Config_DisplayConfig_CompassOrientationSchema: () => Config_DisplayConfig_CompassOrientationSchema,
  Config_DisplayConfig_DisplayMode: () => Config_DisplayConfig_DisplayMode,
  Config_DisplayConfig_DisplayModeSchema: () => Config_DisplayConfig_DisplayModeSchema,
  Config_DisplayConfig_DisplayUnits: () => Config_DisplayConfig_DisplayUnits,
  Config_DisplayConfig_DisplayUnitsSchema: () => Config_DisplayConfig_DisplayUnitsSchema,
  Config_DisplayConfig_GpsCoordinateFormat: () => Config_DisplayConfig_GpsCoordinateFormat,
  Config_DisplayConfig_GpsCoordinateFormatSchema: () => Config_DisplayConfig_GpsCoordinateFormatSchema,
  Config_DisplayConfig_OledType: () => Config_DisplayConfig_OledType,
  Config_DisplayConfig_OledTypeSchema: () => Config_DisplayConfig_OledTypeSchema,
  Config_LoRaConfigSchema: () => Config_LoRaConfigSchema,
  Config_LoRaConfig_ModemPreset: () => Config_LoRaConfig_ModemPreset,
  Config_LoRaConfig_ModemPresetSchema: () => Config_LoRaConfig_ModemPresetSchema,
  Config_LoRaConfig_RegionCode: () => Config_LoRaConfig_RegionCode,
  Config_LoRaConfig_RegionCodeSchema: () => Config_LoRaConfig_RegionCodeSchema,
  Config_NetworkConfigSchema: () => Config_NetworkConfigSchema,
  Config_NetworkConfig_AddressMode: () => Config_NetworkConfig_AddressMode,
  Config_NetworkConfig_AddressModeSchema: () => Config_NetworkConfig_AddressModeSchema,
  Config_NetworkConfig_IpV4ConfigSchema: () => Config_NetworkConfig_IpV4ConfigSchema,
  Config_PositionConfigSchema: () => Config_PositionConfigSchema,
  Config_PositionConfig_GpsMode: () => Config_PositionConfig_GpsMode,
  Config_PositionConfig_GpsModeSchema: () => Config_PositionConfig_GpsModeSchema,
  Config_PositionConfig_PositionFlags: () => Config_PositionConfig_PositionFlags,
  Config_PositionConfig_PositionFlagsSchema: () => Config_PositionConfig_PositionFlagsSchema,
  Config_PowerConfigSchema: () => Config_PowerConfigSchema,
  Config_SecurityConfigSchema: () => Config_SecurityConfigSchema,
  Config_SessionkeyConfigSchema: () => Config_SessionkeyConfigSchema,
  file_config: () => file_config
});

// node_modules/@meshtastic/protobufs/lib/device_ui_pb.js
var file_device_ui = /* @__PURE__ */ fileDesc("Cg9kZXZpY2VfdWkucHJvdG8SCm1lc2h0YXN0aWMigQMKDkRldmljZVVJQ29uZmlnEg8KB3ZlcnNpb24YASABKA0SGQoRc2NyZWVuX2JyaWdodG5lc3MYAiABKA0SFgoOc2NyZWVuX3RpbWVvdXQYAyABKA0SEwoLc2NyZWVuX2xvY2sYBCABKAgSFQoNc2V0dGluZ3NfbG9jaxgFIAEoCBIQCghwaW5fY29kZRgGIAEoDRIgCgV0aGVtZRgHIAEoDjIRLm1lc2h0YXN0aWMuVGhlbWUSFQoNYWxlcnRfZW5hYmxlZBgIIAEoCBIWCg5iYW5uZXJfZW5hYmxlZBgJIAEoCBIUCgxyaW5nX3RvbmVfaWQYCiABKA0SJgoIbGFuZ3VhZ2UYCyABKA4yFC5tZXNodGFzdGljLkxhbmd1YWdlEisKC25vZGVfZmlsdGVyGAwgASgLMhYubWVzaHRhc3RpYy5Ob2RlRmlsdGVyEjEKDm5vZGVfaGlnaGxpZ2h0GA0gASgLMhkubWVzaHRhc3RpYy5Ob2RlSGlnaGxpZ2h0IpYBCgpOb2RlRmlsdGVyEhYKDnVua25vd25fc3dpdGNoGAEgASgIEhYKDm9mZmxpbmVfc3dpdGNoGAIgASgIEhkKEXB1YmxpY19rZXlfc3dpdGNoGAMgASgIEhEKCWhvcHNfYXdheRgEIAEoBRIXCg9wb3NpdGlvbl9zd2l0Y2gYBSABKAgSEQoJbm9kZV9uYW1lGAYgASgJIn4KDU5vZGVIaWdobGlnaHQSEwoLY2hhdF9zd2l0Y2gYASABKAgSFwoPcG9zaXRpb25fc3dpdGNoGAIgASgIEhgKEHRlbGVtZXRyeV9zd2l0Y2gYAyABKAgSEgoKaWFxX3N3aXRjaBgEIAEoCBIRCglub2RlX25hbWUYBSABKAkqJQoFVGhlbWUSCAoEREFSSxAAEgkKBUxJR0hUEAESBwoDUkVEEAIq7QEKCExhbmd1YWdlEgsKB0VOR0xJU0gQABIKCgZGUkVOQ0gQARIKCgZHRVJNQU4QAhILCgdJVEFMSUFOEAMSDgoKUE9SVFVHVUVTRRAEEgsKB1NQQU5JU0gQBRILCgdTV0VESVNIEAYSCwoHRklOTklTSBAHEgoKBlBPTElTSBAIEgsKB1RVUktJU0gQCRILCgdTRVJCSUFOEAoSCwoHUlVTU0lBThALEgkKBURVVENIEAwSCQoFR1JFRUsQDRIWChJTSU1QTElGSUVEX0NISU5FU0UQHhIXChNUUkFESVRJT05BTF9DSElORVNFEB9CYwoTY29tLmdlZWtzdmlsbGUubWVzaEIORGV2aWNlVUlQcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z");
var Theme;
(function(Theme2) {
  Theme2[Theme2["DARK"] = 0] = "DARK";
  Theme2[Theme2["LIGHT"] = 1] = "LIGHT";
  Theme2[Theme2["RED"] = 2] = "RED";
})(Theme || (Theme = {}));
var Language;
(function(Language2) {
  Language2[Language2["ENGLISH"] = 0] = "ENGLISH";
  Language2[Language2["FRENCH"] = 1] = "FRENCH";
  Language2[Language2["GERMAN"] = 2] = "GERMAN";
  Language2[Language2["ITALIAN"] = 3] = "ITALIAN";
  Language2[Language2["PORTUGUESE"] = 4] = "PORTUGUESE";
  Language2[Language2["SPANISH"] = 5] = "SPANISH";
  Language2[Language2["SWEDISH"] = 6] = "SWEDISH";
  Language2[Language2["FINNISH"] = 7] = "FINNISH";
  Language2[Language2["POLISH"] = 8] = "POLISH";
  Language2[Language2["TURKISH"] = 9] = "TURKISH";
  Language2[Language2["SERBIAN"] = 10] = "SERBIAN";
  Language2[Language2["RUSSIAN"] = 11] = "RUSSIAN";
  Language2[Language2["DUTCH"] = 12] = "DUTCH";
  Language2[Language2["GREEK"] = 13] = "GREEK";
  Language2[Language2["SIMPLIFIED_CHINESE"] = 30] = "SIMPLIFIED_CHINESE";
  Language2[Language2["TRADITIONAL_CHINESE"] = 31] = "TRADITIONAL_CHINESE";
})(Language || (Language = {}));

// node_modules/@meshtastic/protobufs/lib/config_pb.js
var file_config = /* @__PURE__ */ fileDesc("Cgxjb25maWcucHJvdG8SCm1lc2h0YXN0aWMi2yUKBkNvbmZpZxIxCgZkZXZpY2UYASABKAsyHy5tZXNodGFzdGljLkNvbmZpZy5EZXZpY2VDb25maWdIABI1Cghwb3NpdGlvbhgCIAEoCzIhLm1lc2h0YXN0aWMuQ29uZmlnLlBvc2l0aW9uQ29uZmlnSAASLwoFcG93ZXIYAyABKAsyHi5tZXNodGFzdGljLkNvbmZpZy5Qb3dlckNvbmZpZ0gAEjMKB25ldHdvcmsYBCABKAsyIC5tZXNodGFzdGljLkNvbmZpZy5OZXR3b3JrQ29uZmlnSAASMwoHZGlzcGxheRgFIAEoCzIgLm1lc2h0YXN0aWMuQ29uZmlnLkRpc3BsYXlDb25maWdIABItCgRsb3JhGAYgASgLMh0ubWVzaHRhc3RpYy5Db25maWcuTG9SYUNvbmZpZ0gAEjcKCWJsdWV0b290aBgHIAEoCzIiLm1lc2h0YXN0aWMuQ29uZmlnLkJsdWV0b290aENvbmZpZ0gAEjUKCHNlY3VyaXR5GAggASgLMiEubWVzaHRhc3RpYy5Db25maWcuU2VjdXJpdHlDb25maWdIABI5CgpzZXNzaW9ua2V5GAkgASgLMiMubWVzaHRhc3RpYy5Db25maWcuU2Vzc2lvbmtleUNvbmZpZ0gAEi8KCWRldmljZV91aRgKIAEoCzIaLm1lc2h0YXN0aWMuRGV2aWNlVUlDb25maWdIABqkBQoMRGV2aWNlQ29uZmlnEjIKBHJvbGUYASABKA4yJC5tZXNodGFzdGljLkNvbmZpZy5EZXZpY2VDb25maWcuUm9sZRIaCg5zZXJpYWxfZW5hYmxlZBgCIAEoCEICGAESEwoLYnV0dG9uX2dwaW8YBCABKA0SEwoLYnV6emVyX2dwaW8YBSABKA0SSQoQcmVicm9hZGNhc3RfbW9kZRgGIAEoDjIvLm1lc2h0YXN0aWMuQ29uZmlnLkRldmljZUNvbmZpZy5SZWJyb2FkY2FzdE1vZGUSIAoYbm9kZV9pbmZvX2Jyb2FkY2FzdF9zZWNzGAcgASgNEiIKGmRvdWJsZV90YXBfYXNfYnV0dG9uX3ByZXNzGAggASgIEhYKCmlzX21hbmFnZWQYCSABKAhCAhgBEhwKFGRpc2FibGVfdHJpcGxlX2NsaWNrGAogASgIEg0KBXR6ZGVmGAsgASgJEh4KFmxlZF9oZWFydGJlYXRfZGlzYWJsZWQYDCABKAgirgEKBFJvbGUSCgoGQ0xJRU5UEAASDwoLQ0xJRU5UX01VVEUQARIKCgZST1VURVIQAhIVCg1ST1VURVJfQ0xJRU5UEAMaAggBEgwKCFJFUEVBVEVSEAQSCwoHVFJBQ0tFUhAFEgoKBlNFTlNPUhAGEgcKA1RBSxAHEhEKDUNMSUVOVF9ISURERU4QCBISCg5MT1NUX0FORF9GT1VORBAJEg8KC1RBS19UUkFDS0VSEAoicwoPUmVicm9hZGNhc3RNb2RlEgcKA0FMTBAAEhUKEUFMTF9TS0lQX0RFQ09ESU5HEAESDgoKTE9DQUxfT05MWRACEg4KCktOT1dOX09OTFkQAxIICgROT05FEAQSFgoSQ09SRV9QT1JUTlVNU19PTkxZEAUakQUKDlBvc2l0aW9uQ29uZmlnEh8KF3Bvc2l0aW9uX2Jyb2FkY2FzdF9zZWNzGAEgASgNEigKIHBvc2l0aW9uX2Jyb2FkY2FzdF9zbWFydF9lbmFibGVkGAIgASgIEhYKDmZpeGVkX3Bvc2l0aW9uGAMgASgIEhcKC2dwc19lbmFibGVkGAQgASgIQgIYARIbChNncHNfdXBkYXRlX2ludGVydmFsGAUgASgNEhwKEGdwc19hdHRlbXB0X3RpbWUYBiABKA1CAhgBEhYKDnBvc2l0aW9uX2ZsYWdzGAcgASgNEg8KB3J4X2dwaW8YCCABKA0SDwoHdHhfZ3BpbxgJIAEoDRIoCiBicm9hZGNhc3Rfc21hcnRfbWluaW11bV9kaXN0YW5jZRgKIAEoDRItCiVicm9hZGNhc3Rfc21hcnRfbWluaW11bV9pbnRlcnZhbF9zZWNzGAsgASgNEhMKC2dwc19lbl9ncGlvGAwgASgNEjsKCGdwc19tb2RlGA0gASgOMikubWVzaHRhc3RpYy5Db25maWcuUG9zaXRpb25Db25maWcuR3BzTW9kZSKrAQoNUG9zaXRpb25GbGFncxIJCgVVTlNFVBAAEgwKCEFMVElUVURFEAESEAoMQUxUSVRVREVfTVNMEAISFgoSR0VPSURBTF9TRVBBUkFUSU9OEAQSBwoDRE9QEAgSCQoFSFZET1AQEBINCglTQVRJTlZJRVcQIBIKCgZTRVFfTk8QQBIOCglUSU1FU1RBTVAQgAESDAoHSEVBRElORxCAAhIKCgVTUEVFRBCABCI1CgdHcHNNb2RlEgwKCERJU0FCTEVEEAASCwoHRU5BQkxFRBABEg8KC05PVF9QUkVTRU5UEAIahAIKC1Bvd2VyQ29uZmlnEhcKD2lzX3Bvd2VyX3NhdmluZxgBIAEoCBImCh5vbl9iYXR0ZXJ5X3NodXRkb3duX2FmdGVyX3NlY3MYAiABKA0SHwoXYWRjX211bHRpcGxpZXJfb3ZlcnJpZGUYAyABKAISGwoTd2FpdF9ibHVldG9vdGhfc2VjcxgEIAEoDRIQCghzZHNfc2VjcxgGIAEoDRIPCgdsc19zZWNzGAcgASgNEhUKDW1pbl93YWtlX3NlY3MYCCABKA0SIgoaZGV2aWNlX2JhdHRlcnlfaW5hX2FkZHJlc3MYCSABKA0SGAoQcG93ZXJtb25fZW5hYmxlcxggIAEoBBr+AgoNTmV0d29ya0NvbmZpZxIUCgx3aWZpX2VuYWJsZWQYASABKAgSEQoJd2lmaV9zc2lkGAMgASgJEhAKCHdpZmlfcHNrGAQgASgJEhIKCm50cF9zZXJ2ZXIYBSABKAkSEwoLZXRoX2VuYWJsZWQYBiABKAgSQgoMYWRkcmVzc19tb2RlGAcgASgOMiwubWVzaHRhc3RpYy5Db25maWcuTmV0d29ya0NvbmZpZy5BZGRyZXNzTW9kZRJACgtpcHY0X2NvbmZpZxgIIAEoCzIrLm1lc2h0YXN0aWMuQ29uZmlnLk5ldHdvcmtDb25maWcuSXBWNENvbmZpZxIWCg5yc3lzbG9nX3NlcnZlchgJIAEoCRpGCgpJcFY0Q29uZmlnEgoKAmlwGAEgASgHEg8KB2dhdGV3YXkYAiABKAcSDgoGc3VibmV0GAMgASgHEgsKA2RucxgEIAEoByIjCgtBZGRyZXNzTW9kZRIICgRESENQEAASCgoGU1RBVElDEAEazQcKDURpc3BsYXlDb25maWcSFgoOc2NyZWVuX29uX3NlY3MYASABKA0SSAoKZ3BzX2Zvcm1hdBgCIAEoDjI0Lm1lc2h0YXN0aWMuQ29uZmlnLkRpc3BsYXlDb25maWcuR3BzQ29vcmRpbmF0ZUZvcm1hdBIhChlhdXRvX3NjcmVlbl9jYXJvdXNlbF9zZWNzGAMgASgNEhkKEWNvbXBhc3Nfbm9ydGhfdG9wGAQgASgIEhMKC2ZsaXBfc2NyZWVuGAUgASgIEjwKBXVuaXRzGAYgASgOMi0ubWVzaHRhc3RpYy5Db25maWcuRGlzcGxheUNvbmZpZy5EaXNwbGF5VW5pdHMSNwoEb2xlZBgHIAEoDjIpLm1lc2h0YXN0aWMuQ29uZmlnLkRpc3BsYXlDb25maWcuT2xlZFR5cGUSQQoLZGlzcGxheW1vZGUYCCABKA4yLC5tZXNodGFzdGljLkNvbmZpZy5EaXNwbGF5Q29uZmlnLkRpc3BsYXlNb2RlEhQKDGhlYWRpbmdfYm9sZBgJIAEoCBIdChV3YWtlX29uX3RhcF9vcl9tb3Rpb24YCiABKAgSUAoTY29tcGFzc19vcmllbnRhdGlvbhgLIAEoDjIzLm1lc2h0YXN0aWMuQ29uZmlnLkRpc3BsYXlDb25maWcuQ29tcGFzc09yaWVudGF0aW9uIk0KE0dwc0Nvb3JkaW5hdGVGb3JtYXQSBwoDREVDEAASBwoDRE1TEAESBwoDVVRNEAISCAoETUdSUxADEgcKA09MQxAEEggKBE9TR1IQBSIoCgxEaXNwbGF5VW5pdHMSCgoGTUVUUklDEAASDAoISU1QRVJJQUwQASJNCghPbGVkVHlwZRINCglPTEVEX0FVVE8QABIQCgxPTEVEX1NTRDEzMDYQARIPCgtPTEVEX1NIMTEwNhACEg8KC09MRURfU0gxMTA3EAMiQQoLRGlzcGxheU1vZGUSCwoHREVGQVVMVBAAEgwKCFRXT0NPTE9SEAESDAoISU5WRVJURUQQAhIJCgVDT0xPUhADIroBChJDb21wYXNzT3JpZW50YXRpb24SDQoJREVHUkVFU18wEAASDgoKREVHUkVFU185MBABEg8KC0RFR1JFRVNfMTgwEAISDwoLREVHUkVFU18yNzAQAxIWChJERUdSRUVTXzBfSU5WRVJURUQQBBIXChNERUdSRUVTXzkwX0lOVkVSVEVEEAUSGAoUREVHUkVFU18xODBfSU5WRVJURUQQBhIYChRERUdSRUVTXzI3MF9JTlZFUlRFRBAHGp0HCgpMb1JhQ29uZmlnEhIKCnVzZV9wcmVzZXQYASABKAgSPwoMbW9kZW1fcHJlc2V0GAIgASgOMikubWVzaHRhc3RpYy5Db25maWcuTG9SYUNvbmZpZy5Nb2RlbVByZXNldBIRCgliYW5kd2lkdGgYAyABKA0SFQoNc3ByZWFkX2ZhY3RvchgEIAEoDRITCgtjb2RpbmdfcmF0ZRgFIAEoDRIYChBmcmVxdWVuY3lfb2Zmc2V0GAYgASgCEjgKBnJlZ2lvbhgHIAEoDjIoLm1lc2h0YXN0aWMuQ29uZmlnLkxvUmFDb25maWcuUmVnaW9uQ29kZRIRCglob3BfbGltaXQYCCABKA0SEgoKdHhfZW5hYmxlZBgJIAEoCBIQCgh0eF9wb3dlchgKIAEoBRITCgtjaGFubmVsX251bRgLIAEoDRIbChNvdmVycmlkZV9kdXR5X2N5Y2xlGAwgASgIEh4KFnN4MTI2eF9yeF9ib29zdGVkX2dhaW4YDSABKAgSGgoSb3ZlcnJpZGVfZnJlcXVlbmN5GA4gASgCEhcKD3BhX2Zhbl9kaXNhYmxlZBgPIAEoCBIXCg9pZ25vcmVfaW5jb21pbmcYZyADKA0SEwoLaWdub3JlX21xdHQYaCABKAgSGQoRY29uZmlnX29rX3RvX21xdHQYaSABKAgi8QEKClJlZ2lvbkNvZGUSCQoFVU5TRVQQABIGCgJVUxABEgoKBkVVXzQzMxACEgoKBkVVXzg2OBADEgYKAkNOEAQSBgoCSlAQBRIHCgNBTloQBhIGCgJLUhAHEgYKAlRXEAgSBgoCUlUQCRIGCgJJThAKEgoKBk5aXzg2NRALEgYKAlRIEAwSCwoHTE9SQV8yNBANEgoKBlVBXzQzMxAOEgoKBlVBXzg2OBAPEgoKBk1ZXzQzMxAQEgoKBk1ZXzkxORAREgoKBlNHXzkyMxASEgoKBlBIXzQzMxATEgoKBlBIXzg2OBAUEgoKBlBIXzkxNRAVIqkBCgtNb2RlbVByZXNldBINCglMT05HX0ZBU1QQABINCglMT05HX1NMT1cQARIWCg5WRVJZX0xPTkdfU0xPVxACGgIIARIPCgtNRURJVU1fU0xPVxADEg8KC01FRElVTV9GQVNUEAQSDgoKU0hPUlRfU0xPVxAFEg4KClNIT1JUX0ZBU1QQBhIRCg1MT05HX01PREVSQVRFEAcSDwoLU0hPUlRfVFVSQk8QCBqtAQoPQmx1ZXRvb3RoQ29uZmlnEg8KB2VuYWJsZWQYASABKAgSPAoEbW9kZRgCIAEoDjIuLm1lc2h0YXN0aWMuQ29uZmlnLkJsdWV0b290aENvbmZpZy5QYWlyaW5nTW9kZRIRCglmaXhlZF9waW4YAyABKA0iOAoLUGFpcmluZ01vZGUSDgoKUkFORE9NX1BJThAAEg0KCUZJWEVEX1BJThABEgoKBk5PX1BJThACGrYBCg5TZWN1cml0eUNvbmZpZxISCgpwdWJsaWNfa2V5GAEgASgMEhMKC3ByaXZhdGVfa2V5GAIgASgMEhEKCWFkbWluX2tleRgDIAMoDBISCgppc19tYW5hZ2VkGAQgASgIEhYKDnNlcmlhbF9lbmFibGVkGAUgASgIEh0KFWRlYnVnX2xvZ19hcGlfZW5hYmxlZBgGIAEoCBIdChVhZG1pbl9jaGFubmVsX2VuYWJsZWQYCCABKAgaEgoQU2Vzc2lvbmtleUNvbmZpZ0IRCg9wYXlsb2FkX3ZhcmlhbnRCYQoTY29tLmdlZWtzdmlsbGUubWVzaEIMQ29uZmlnUHJvdG9zWiJnaXRodWIuY29tL21lc2h0YXN0aWMvZ28vZ2VuZXJhdGVkqgIUTWVzaHRhc3RpYy5Qcm90b2J1ZnO6AgBiBnByb3RvMw", [
  file_device_ui
]);
var ConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0);
var Config_DeviceConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 0);
var Config_DeviceConfig_Role;
(function(Config_DeviceConfig_Role2) {
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["CLIENT"] = 0] = "CLIENT";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["CLIENT_MUTE"] = 1] = "CLIENT_MUTE";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["ROUTER"] = 2] = "ROUTER";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["ROUTER_CLIENT"] = 3] = "ROUTER_CLIENT";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["REPEATER"] = 4] = "REPEATER";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["TRACKER"] = 5] = "TRACKER";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["SENSOR"] = 6] = "SENSOR";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["TAK"] = 7] = "TAK";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["CLIENT_HIDDEN"] = 8] = "CLIENT_HIDDEN";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["LOST_AND_FOUND"] = 9] = "LOST_AND_FOUND";
  Config_DeviceConfig_Role2[Config_DeviceConfig_Role2["TAK_TRACKER"] = 10] = "TAK_TRACKER";
})(Config_DeviceConfig_Role || (Config_DeviceConfig_Role = {}));
var Config_DeviceConfig_RoleSchema = /* @__PURE__ */ enumDesc(file_config, 0, 0, 0);
var Config_DeviceConfig_RebroadcastMode;
(function(Config_DeviceConfig_RebroadcastMode2) {
  Config_DeviceConfig_RebroadcastMode2[Config_DeviceConfig_RebroadcastMode2["ALL"] = 0] = "ALL";
  Config_DeviceConfig_RebroadcastMode2[Config_DeviceConfig_RebroadcastMode2["ALL_SKIP_DECODING"] = 1] = "ALL_SKIP_DECODING";
  Config_DeviceConfig_RebroadcastMode2[Config_DeviceConfig_RebroadcastMode2["LOCAL_ONLY"] = 2] = "LOCAL_ONLY";
  Config_DeviceConfig_RebroadcastMode2[Config_DeviceConfig_RebroadcastMode2["KNOWN_ONLY"] = 3] = "KNOWN_ONLY";
  Config_DeviceConfig_RebroadcastMode2[Config_DeviceConfig_RebroadcastMode2["NONE"] = 4] = "NONE";
  Config_DeviceConfig_RebroadcastMode2[Config_DeviceConfig_RebroadcastMode2["CORE_PORTNUMS_ONLY"] = 5] = "CORE_PORTNUMS_ONLY";
})(Config_DeviceConfig_RebroadcastMode || (Config_DeviceConfig_RebroadcastMode = {}));
var Config_DeviceConfig_RebroadcastModeSchema = /* @__PURE__ */ enumDesc(file_config, 0, 0, 1);
var Config_PositionConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 1);
var Config_PositionConfig_PositionFlags;
(function(Config_PositionConfig_PositionFlags2) {
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["UNSET"] = 0] = "UNSET";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["ALTITUDE"] = 1] = "ALTITUDE";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["ALTITUDE_MSL"] = 2] = "ALTITUDE_MSL";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["GEOIDAL_SEPARATION"] = 4] = "GEOIDAL_SEPARATION";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["DOP"] = 8] = "DOP";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["HVDOP"] = 16] = "HVDOP";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["SATINVIEW"] = 32] = "SATINVIEW";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["SEQ_NO"] = 64] = "SEQ_NO";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["TIMESTAMP"] = 128] = "TIMESTAMP";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["HEADING"] = 256] = "HEADING";
  Config_PositionConfig_PositionFlags2[Config_PositionConfig_PositionFlags2["SPEED"] = 512] = "SPEED";
})(Config_PositionConfig_PositionFlags || (Config_PositionConfig_PositionFlags = {}));
var Config_PositionConfig_PositionFlagsSchema = /* @__PURE__ */ enumDesc(file_config, 0, 1, 0);
var Config_PositionConfig_GpsMode;
(function(Config_PositionConfig_GpsMode2) {
  Config_PositionConfig_GpsMode2[Config_PositionConfig_GpsMode2["DISABLED"] = 0] = "DISABLED";
  Config_PositionConfig_GpsMode2[Config_PositionConfig_GpsMode2["ENABLED"] = 1] = "ENABLED";
  Config_PositionConfig_GpsMode2[Config_PositionConfig_GpsMode2["NOT_PRESENT"] = 2] = "NOT_PRESENT";
})(Config_PositionConfig_GpsMode || (Config_PositionConfig_GpsMode = {}));
var Config_PositionConfig_GpsModeSchema = /* @__PURE__ */ enumDesc(file_config, 0, 1, 1);
var Config_PowerConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 2);
var Config_NetworkConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 3);
var Config_NetworkConfig_IpV4ConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 3, 0);
var Config_NetworkConfig_AddressMode;
(function(Config_NetworkConfig_AddressMode2) {
  Config_NetworkConfig_AddressMode2[Config_NetworkConfig_AddressMode2["DHCP"] = 0] = "DHCP";
  Config_NetworkConfig_AddressMode2[Config_NetworkConfig_AddressMode2["STATIC"] = 1] = "STATIC";
})(Config_NetworkConfig_AddressMode || (Config_NetworkConfig_AddressMode = {}));
var Config_NetworkConfig_AddressModeSchema = /* @__PURE__ */ enumDesc(file_config, 0, 3, 0);
var Config_DisplayConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 4);
var Config_DisplayConfig_GpsCoordinateFormat;
(function(Config_DisplayConfig_GpsCoordinateFormat2) {
  Config_DisplayConfig_GpsCoordinateFormat2[Config_DisplayConfig_GpsCoordinateFormat2["DEC"] = 0] = "DEC";
  Config_DisplayConfig_GpsCoordinateFormat2[Config_DisplayConfig_GpsCoordinateFormat2["DMS"] = 1] = "DMS";
  Config_DisplayConfig_GpsCoordinateFormat2[Config_DisplayConfig_GpsCoordinateFormat2["UTM"] = 2] = "UTM";
  Config_DisplayConfig_GpsCoordinateFormat2[Config_DisplayConfig_GpsCoordinateFormat2["MGRS"] = 3] = "MGRS";
  Config_DisplayConfig_GpsCoordinateFormat2[Config_DisplayConfig_GpsCoordinateFormat2["OLC"] = 4] = "OLC";
  Config_DisplayConfig_GpsCoordinateFormat2[Config_DisplayConfig_GpsCoordinateFormat2["OSGR"] = 5] = "OSGR";
})(Config_DisplayConfig_GpsCoordinateFormat || (Config_DisplayConfig_GpsCoordinateFormat = {}));
var Config_DisplayConfig_GpsCoordinateFormatSchema = /* @__PURE__ */ enumDesc(file_config, 0, 4, 0);
var Config_DisplayConfig_DisplayUnits;
(function(Config_DisplayConfig_DisplayUnits2) {
  Config_DisplayConfig_DisplayUnits2[Config_DisplayConfig_DisplayUnits2["METRIC"] = 0] = "METRIC";
  Config_DisplayConfig_DisplayUnits2[Config_DisplayConfig_DisplayUnits2["IMPERIAL"] = 1] = "IMPERIAL";
})(Config_DisplayConfig_DisplayUnits || (Config_DisplayConfig_DisplayUnits = {}));
var Config_DisplayConfig_DisplayUnitsSchema = /* @__PURE__ */ enumDesc(file_config, 0, 4, 1);
var Config_DisplayConfig_OledType;
(function(Config_DisplayConfig_OledType2) {
  Config_DisplayConfig_OledType2[Config_DisplayConfig_OledType2["OLED_AUTO"] = 0] = "OLED_AUTO";
  Config_DisplayConfig_OledType2[Config_DisplayConfig_OledType2["OLED_SSD1306"] = 1] = "OLED_SSD1306";
  Config_DisplayConfig_OledType2[Config_DisplayConfig_OledType2["OLED_SH1106"] = 2] = "OLED_SH1106";
  Config_DisplayConfig_OledType2[Config_DisplayConfig_OledType2["OLED_SH1107"] = 3] = "OLED_SH1107";
})(Config_DisplayConfig_OledType || (Config_DisplayConfig_OledType = {}));
var Config_DisplayConfig_OledTypeSchema = /* @__PURE__ */ enumDesc(file_config, 0, 4, 2);
var Config_DisplayConfig_DisplayMode;
(function(Config_DisplayConfig_DisplayMode2) {
  Config_DisplayConfig_DisplayMode2[Config_DisplayConfig_DisplayMode2["DEFAULT"] = 0] = "DEFAULT";
  Config_DisplayConfig_DisplayMode2[Config_DisplayConfig_DisplayMode2["TWOCOLOR"] = 1] = "TWOCOLOR";
  Config_DisplayConfig_DisplayMode2[Config_DisplayConfig_DisplayMode2["INVERTED"] = 2] = "INVERTED";
  Config_DisplayConfig_DisplayMode2[Config_DisplayConfig_DisplayMode2["COLOR"] = 3] = "COLOR";
})(Config_DisplayConfig_DisplayMode || (Config_DisplayConfig_DisplayMode = {}));
var Config_DisplayConfig_DisplayModeSchema = /* @__PURE__ */ enumDesc(file_config, 0, 4, 3);
var Config_DisplayConfig_CompassOrientation;
(function(Config_DisplayConfig_CompassOrientation2) {
  Config_DisplayConfig_CompassOrientation2[Config_DisplayConfig_CompassOrientation2["DEGREES_0"] = 0] = "DEGREES_0";
  Config_DisplayConfig_CompassOrientation2[Config_DisplayConfig_CompassOrientation2["DEGREES_90"] = 1] = "DEGREES_90";
  Config_DisplayConfig_CompassOrientation2[Config_DisplayConfig_CompassOrientation2["DEGREES_180"] = 2] = "DEGREES_180";
  Config_DisplayConfig_CompassOrientation2[Config_DisplayConfig_CompassOrientation2["DEGREES_270"] = 3] = "DEGREES_270";
  Config_DisplayConfig_CompassOrientation2[Config_DisplayConfig_CompassOrientation2["DEGREES_0_INVERTED"] = 4] = "DEGREES_0_INVERTED";
  Config_DisplayConfig_CompassOrientation2[Config_DisplayConfig_CompassOrientation2["DEGREES_90_INVERTED"] = 5] = "DEGREES_90_INVERTED";
  Config_DisplayConfig_CompassOrientation2[Config_DisplayConfig_CompassOrientation2["DEGREES_180_INVERTED"] = 6] = "DEGREES_180_INVERTED";
  Config_DisplayConfig_CompassOrientation2[Config_DisplayConfig_CompassOrientation2["DEGREES_270_INVERTED"] = 7] = "DEGREES_270_INVERTED";
})(Config_DisplayConfig_CompassOrientation || (Config_DisplayConfig_CompassOrientation = {}));
var Config_DisplayConfig_CompassOrientationSchema = /* @__PURE__ */ enumDesc(file_config, 0, 4, 4);
var Config_LoRaConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 5);
var Config_LoRaConfig_RegionCode;
(function(Config_LoRaConfig_RegionCode2) {
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["UNSET"] = 0] = "UNSET";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["US"] = 1] = "US";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["EU_433"] = 2] = "EU_433";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["EU_868"] = 3] = "EU_868";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["CN"] = 4] = "CN";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["JP"] = 5] = "JP";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["ANZ"] = 6] = "ANZ";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["KR"] = 7] = "KR";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["TW"] = 8] = "TW";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["RU"] = 9] = "RU";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["IN"] = 10] = "IN";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["NZ_865"] = 11] = "NZ_865";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["TH"] = 12] = "TH";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["LORA_24"] = 13] = "LORA_24";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["UA_433"] = 14] = "UA_433";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["UA_868"] = 15] = "UA_868";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["MY_433"] = 16] = "MY_433";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["MY_919"] = 17] = "MY_919";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["SG_923"] = 18] = "SG_923";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["PH_433"] = 19] = "PH_433";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["PH_868"] = 20] = "PH_868";
  Config_LoRaConfig_RegionCode2[Config_LoRaConfig_RegionCode2["PH_915"] = 21] = "PH_915";
})(Config_LoRaConfig_RegionCode || (Config_LoRaConfig_RegionCode = {}));
var Config_LoRaConfig_RegionCodeSchema = /* @__PURE__ */ enumDesc(file_config, 0, 5, 0);
var Config_LoRaConfig_ModemPreset;
(function(Config_LoRaConfig_ModemPreset2) {
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["LONG_FAST"] = 0] = "LONG_FAST";
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["LONG_SLOW"] = 1] = "LONG_SLOW";
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["VERY_LONG_SLOW"] = 2] = "VERY_LONG_SLOW";
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["MEDIUM_SLOW"] = 3] = "MEDIUM_SLOW";
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["MEDIUM_FAST"] = 4] = "MEDIUM_FAST";
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["SHORT_SLOW"] = 5] = "SHORT_SLOW";
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["SHORT_FAST"] = 6] = "SHORT_FAST";
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["LONG_MODERATE"] = 7] = "LONG_MODERATE";
  Config_LoRaConfig_ModemPreset2[Config_LoRaConfig_ModemPreset2["SHORT_TURBO"] = 8] = "SHORT_TURBO";
})(Config_LoRaConfig_ModemPreset || (Config_LoRaConfig_ModemPreset = {}));
var Config_LoRaConfig_ModemPresetSchema = /* @__PURE__ */ enumDesc(file_config, 0, 5, 1);
var Config_BluetoothConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 6);
var Config_BluetoothConfig_PairingMode;
(function(Config_BluetoothConfig_PairingMode2) {
  Config_BluetoothConfig_PairingMode2[Config_BluetoothConfig_PairingMode2["RANDOM_PIN"] = 0] = "RANDOM_PIN";
  Config_BluetoothConfig_PairingMode2[Config_BluetoothConfig_PairingMode2["FIXED_PIN"] = 1] = "FIXED_PIN";
  Config_BluetoothConfig_PairingMode2[Config_BluetoothConfig_PairingMode2["NO_PIN"] = 2] = "NO_PIN";
})(Config_BluetoothConfig_PairingMode || (Config_BluetoothConfig_PairingMode = {}));
var Config_BluetoothConfig_PairingModeSchema = /* @__PURE__ */ enumDesc(file_config, 0, 6, 0);
var Config_SecurityConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 7);
var Config_SessionkeyConfigSchema = /* @__PURE__ */ messageDesc(file_config, 0, 8);

// node_modules/@meshtastic/protobufs/lib/connection_status_pb.js
var connection_status_pb_exports = {};
__export(connection_status_pb_exports, {
  BluetoothConnectionStatusSchema: () => BluetoothConnectionStatusSchema,
  DeviceConnectionStatusSchema: () => DeviceConnectionStatusSchema,
  EthernetConnectionStatusSchema: () => EthernetConnectionStatusSchema,
  NetworkConnectionStatusSchema: () => NetworkConnectionStatusSchema,
  SerialConnectionStatusSchema: () => SerialConnectionStatusSchema,
  WifiConnectionStatusSchema: () => WifiConnectionStatusSchema,
  file_connection_status: () => file_connection_status
});
var file_connection_status = /* @__PURE__ */ fileDesc("Chdjb25uZWN0aW9uX3N0YXR1cy5wcm90bxIKbWVzaHRhc3RpYyKxAgoWRGV2aWNlQ29ubmVjdGlvblN0YXR1cxIzCgR3aWZpGAEgASgLMiAubWVzaHRhc3RpYy5XaWZpQ29ubmVjdGlvblN0YXR1c0gAiAEBEjsKCGV0aGVybmV0GAIgASgLMiQubWVzaHRhc3RpYy5FdGhlcm5ldENvbm5lY3Rpb25TdGF0dXNIAYgBARI9CglibHVldG9vdGgYAyABKAsyJS5tZXNodGFzdGljLkJsdWV0b290aENvbm5lY3Rpb25TdGF0dXNIAogBARI3CgZzZXJpYWwYBCABKAsyIi5tZXNodGFzdGljLlNlcmlhbENvbm5lY3Rpb25TdGF0dXNIA4gBAUIHCgVfd2lmaUILCglfZXRoZXJuZXRCDAoKX2JsdWV0b290aEIJCgdfc2VyaWFsImcKFFdpZmlDb25uZWN0aW9uU3RhdHVzEjMKBnN0YXR1cxgBIAEoCzIjLm1lc2h0YXN0aWMuTmV0d29ya0Nvbm5lY3Rpb25TdGF0dXMSDAoEc3NpZBgCIAEoCRIMCgRyc3NpGAMgASgFIk8KGEV0aGVybmV0Q29ubmVjdGlvblN0YXR1cxIzCgZzdGF0dXMYASABKAsyIy5tZXNodGFzdGljLk5ldHdvcmtDb25uZWN0aW9uU3RhdHVzInsKF05ldHdvcmtDb25uZWN0aW9uU3RhdHVzEhIKCmlwX2FkZHJlc3MYASABKAcSFAoMaXNfY29ubmVjdGVkGAIgASgIEhkKEWlzX21xdHRfY29ubmVjdGVkGAMgASgIEhsKE2lzX3N5c2xvZ19jb25uZWN0ZWQYBCABKAgiTAoZQmx1ZXRvb3RoQ29ubmVjdGlvblN0YXR1cxILCgNwaW4YASABKA0SDAoEcnNzaRgCIAEoBRIUCgxpc19jb25uZWN0ZWQYAyABKAgiPAoWU2VyaWFsQ29ubmVjdGlvblN0YXR1cxIMCgRiYXVkGAEgASgNEhQKDGlzX2Nvbm5lY3RlZBgCIAEoCEJlChNjb20uZ2Vla3N2aWxsZS5tZXNoQhBDb25uU3RhdHVzUHJvdG9zWiJnaXRodWIuY29tL21lc2h0YXN0aWMvZ28vZ2VuZXJhdGVkqgIUTWVzaHRhc3RpYy5Qcm90b2J1ZnO6AgBiBnByb3RvMw");
var DeviceConnectionStatusSchema = /* @__PURE__ */ messageDesc(file_connection_status, 0);
var WifiConnectionStatusSchema = /* @__PURE__ */ messageDesc(file_connection_status, 1);
var EthernetConnectionStatusSchema = /* @__PURE__ */ messageDesc(file_connection_status, 2);
var NetworkConnectionStatusSchema = /* @__PURE__ */ messageDesc(file_connection_status, 3);
var BluetoothConnectionStatusSchema = /* @__PURE__ */ messageDesc(file_connection_status, 4);
var SerialConnectionStatusSchema = /* @__PURE__ */ messageDesc(file_connection_status, 5);

// node_modules/@meshtastic/protobufs/lib/mesh_pb.js
var mesh_pb_exports = {};
__export(mesh_pb_exports, {
  ChunkedPayloadResponseSchema: () => ChunkedPayloadResponseSchema,
  ChunkedPayloadSchema: () => ChunkedPayloadSchema,
  ClientNotificationSchema: () => ClientNotificationSchema,
  CompressedSchema: () => CompressedSchema,
  Constants: () => Constants2,
  ConstantsSchema: () => ConstantsSchema,
  CriticalErrorCode: () => CriticalErrorCode,
  CriticalErrorCodeSchema: () => CriticalErrorCodeSchema,
  DataSchema: () => DataSchema,
  DeviceMetadataSchema: () => DeviceMetadataSchema,
  FileInfoSchema: () => FileInfoSchema,
  FromRadioSchema: () => FromRadioSchema,
  HardwareModel: () => HardwareModel,
  HardwareModelSchema: () => HardwareModelSchema,
  HeartbeatSchema: () => HeartbeatSchema,
  LogRecordSchema: () => LogRecordSchema,
  LogRecord_Level: () => LogRecord_Level,
  LogRecord_LevelSchema: () => LogRecord_LevelSchema,
  MeshPacketSchema: () => MeshPacketSchema,
  MeshPacket_Delayed: () => MeshPacket_Delayed,
  MeshPacket_DelayedSchema: () => MeshPacket_DelayedSchema,
  MeshPacket_Priority: () => MeshPacket_Priority,
  MeshPacket_PrioritySchema: () => MeshPacket_PrioritySchema,
  MqttClientProxyMessageSchema: () => MqttClientProxyMessageSchema,
  MyNodeInfoSchema: () => MyNodeInfoSchema,
  NeighborInfoSchema: () => NeighborInfoSchema,
  NeighborSchema: () => NeighborSchema,
  NodeInfoSchema: () => NodeInfoSchema,
  NodeRemoteHardwarePinSchema: () => NodeRemoteHardwarePinSchema,
  PositionSchema: () => PositionSchema,
  Position_AltSource: () => Position_AltSource,
  Position_AltSourceSchema: () => Position_AltSourceSchema,
  Position_LocSource: () => Position_LocSource,
  Position_LocSourceSchema: () => Position_LocSourceSchema,
  QueueStatusSchema: () => QueueStatusSchema,
  RouteDiscoverySchema: () => RouteDiscoverySchema,
  RoutingSchema: () => RoutingSchema,
  Routing_Error: () => Routing_Error,
  Routing_ErrorSchema: () => Routing_ErrorSchema,
  ToRadioSchema: () => ToRadioSchema,
  UserSchema: () => UserSchema,
  WaypointSchema: () => WaypointSchema,
  file_mesh: () => file_mesh,
  resend_chunksSchema: () => resend_chunksSchema
});

// node_modules/@meshtastic/protobufs/lib/module_config_pb.js
var module_config_pb_exports = {};
__export(module_config_pb_exports, {
  ModuleConfigSchema: () => ModuleConfigSchema,
  ModuleConfig_AmbientLightingConfigSchema: () => ModuleConfig_AmbientLightingConfigSchema,
  ModuleConfig_AudioConfigSchema: () => ModuleConfig_AudioConfigSchema,
  ModuleConfig_AudioConfig_Audio_Baud: () => ModuleConfig_AudioConfig_Audio_Baud,
  ModuleConfig_AudioConfig_Audio_BaudSchema: () => ModuleConfig_AudioConfig_Audio_BaudSchema,
  ModuleConfig_CannedMessageConfigSchema: () => ModuleConfig_CannedMessageConfigSchema,
  ModuleConfig_CannedMessageConfig_InputEventChar: () => ModuleConfig_CannedMessageConfig_InputEventChar,
  ModuleConfig_CannedMessageConfig_InputEventCharSchema: () => ModuleConfig_CannedMessageConfig_InputEventCharSchema,
  ModuleConfig_DetectionSensorConfigSchema: () => ModuleConfig_DetectionSensorConfigSchema,
  ModuleConfig_DetectionSensorConfig_TriggerType: () => ModuleConfig_DetectionSensorConfig_TriggerType,
  ModuleConfig_DetectionSensorConfig_TriggerTypeSchema: () => ModuleConfig_DetectionSensorConfig_TriggerTypeSchema,
  ModuleConfig_ExternalNotificationConfigSchema: () => ModuleConfig_ExternalNotificationConfigSchema,
  ModuleConfig_MQTTConfigSchema: () => ModuleConfig_MQTTConfigSchema,
  ModuleConfig_MapReportSettingsSchema: () => ModuleConfig_MapReportSettingsSchema,
  ModuleConfig_NeighborInfoConfigSchema: () => ModuleConfig_NeighborInfoConfigSchema,
  ModuleConfig_PaxcounterConfigSchema: () => ModuleConfig_PaxcounterConfigSchema,
  ModuleConfig_RangeTestConfigSchema: () => ModuleConfig_RangeTestConfigSchema,
  ModuleConfig_RemoteHardwareConfigSchema: () => ModuleConfig_RemoteHardwareConfigSchema,
  ModuleConfig_SerialConfigSchema: () => ModuleConfig_SerialConfigSchema,
  ModuleConfig_SerialConfig_Serial_Baud: () => ModuleConfig_SerialConfig_Serial_Baud,
  ModuleConfig_SerialConfig_Serial_BaudSchema: () => ModuleConfig_SerialConfig_Serial_BaudSchema,
  ModuleConfig_SerialConfig_Serial_Mode: () => ModuleConfig_SerialConfig_Serial_Mode,
  ModuleConfig_SerialConfig_Serial_ModeSchema: () => ModuleConfig_SerialConfig_Serial_ModeSchema,
  ModuleConfig_StoreForwardConfigSchema: () => ModuleConfig_StoreForwardConfigSchema,
  ModuleConfig_TelemetryConfigSchema: () => ModuleConfig_TelemetryConfigSchema,
  RemoteHardwarePinSchema: () => RemoteHardwarePinSchema,
  RemoteHardwarePinType: () => RemoteHardwarePinType,
  RemoteHardwarePinTypeSchema: () => RemoteHardwarePinTypeSchema,
  file_module_config: () => file_module_config
});
var file_module_config = /* @__PURE__ */ fileDesc("ChNtb2R1bGVfY29uZmlnLnByb3RvEgptZXNodGFzdGljIpglCgxNb2R1bGVDb25maWcSMwoEbXF0dBgBIAEoCzIjLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLk1RVFRDb25maWdIABI3CgZzZXJpYWwYAiABKAsyJS5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5TZXJpYWxDb25maWdIABJUChVleHRlcm5hbF9ub3RpZmljYXRpb24YAyABKAsyMy5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5FeHRlcm5hbE5vdGlmaWNhdGlvbkNvbmZpZ0gAEkQKDXN0b3JlX2ZvcndhcmQYBCABKAsyKy5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5TdG9yZUZvcndhcmRDb25maWdIABI+CgpyYW5nZV90ZXN0GAUgASgLMigubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuUmFuZ2VUZXN0Q29uZmlnSAASPQoJdGVsZW1ldHJ5GAYgASgLMigubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuVGVsZW1ldHJ5Q29uZmlnSAASRgoOY2FubmVkX21lc3NhZ2UYByABKAsyLC5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5DYW5uZWRNZXNzYWdlQ29uZmlnSAASNQoFYXVkaW8YCCABKAsyJC5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5BdWRpb0NvbmZpZ0gAEkgKD3JlbW90ZV9oYXJkd2FyZRgJIAEoCzItLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLlJlbW90ZUhhcmR3YXJlQ29uZmlnSAASRAoNbmVpZ2hib3JfaW5mbxgKIAEoCzIrLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLk5laWdoYm9ySW5mb0NvbmZpZ0gAEkoKEGFtYmllbnRfbGlnaHRpbmcYCyABKAsyLi5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5BbWJpZW50TGlnaHRpbmdDb25maWdIABJKChBkZXRlY3Rpb25fc2Vuc29yGAwgASgLMi4ubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuRGV0ZWN0aW9uU2Vuc29yQ29uZmlnSAASPwoKcGF4Y291bnRlchgNIAEoCzIpLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLlBheGNvdW50ZXJDb25maWdIABqwAgoKTVFUVENvbmZpZxIPCgdlbmFibGVkGAEgASgIEg8KB2FkZHJlc3MYAiABKAkSEAoIdXNlcm5hbWUYAyABKAkSEAoIcGFzc3dvcmQYBCABKAkSGgoSZW5jcnlwdGlvbl9lbmFibGVkGAUgASgIEhQKDGpzb25fZW5hYmxlZBgGIAEoCBITCgt0bHNfZW5hYmxlZBgHIAEoCBIMCgRyb290GAggASgJEh8KF3Byb3h5X3RvX2NsaWVudF9lbmFibGVkGAkgASgIEh0KFW1hcF9yZXBvcnRpbmdfZW5hYmxlZBgKIAEoCBJHChNtYXBfcmVwb3J0X3NldHRpbmdzGAsgASgLMioubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuTWFwUmVwb3J0U2V0dGluZ3MaTgoRTWFwUmVwb3J0U2V0dGluZ3MSHQoVcHVibGlzaF9pbnRlcnZhbF9zZWNzGAEgASgNEhoKEnBvc2l0aW9uX3ByZWNpc2lvbhgCIAEoDRqCAQoUUmVtb3RlSGFyZHdhcmVDb25maWcSDwoHZW5hYmxlZBgBIAEoCBIiChphbGxvd191bmRlZmluZWRfcGluX2FjY2VzcxgCIAEoCBI1Cg5hdmFpbGFibGVfcGlucxgDIAMoCzIdLm1lc2h0YXN0aWMuUmVtb3RlSGFyZHdhcmVQaW4aPgoSTmVpZ2hib3JJbmZvQ29uZmlnEg8KB2VuYWJsZWQYASABKAgSFwoPdXBkYXRlX2ludGVydmFsGAIgASgNGpcDChVEZXRlY3Rpb25TZW5zb3JDb25maWcSDwoHZW5hYmxlZBgBIAEoCBIeChZtaW5pbXVtX2Jyb2FkY2FzdF9zZWNzGAIgASgNEhwKFHN0YXRlX2Jyb2FkY2FzdF9zZWNzGAMgASgNEhEKCXNlbmRfYmVsbBgEIAEoCBIMCgRuYW1lGAUgASgJEhMKC21vbml0b3JfcGluGAYgASgNEloKFmRldGVjdGlvbl90cmlnZ2VyX3R5cGUYByABKA4yOi5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5EZXRlY3Rpb25TZW5zb3JDb25maWcuVHJpZ2dlclR5cGUSEgoKdXNlX3B1bGx1cBgIIAEoCCKIAQoLVHJpZ2dlclR5cGUSDQoJTE9HSUNfTE9XEAASDgoKTE9HSUNfSElHSBABEhAKDEZBTExJTkdfRURHRRACEg8KC1JJU0lOR19FREdFEAMSGgoWRUlUSEVSX0VER0VfQUNUSVZFX0xPVxAEEhsKF0VJVEhFUl9FREdFX0FDVElWRV9ISUdIEAUa5AIKC0F1ZGlvQ29uZmlnEhYKDmNvZGVjMl9lbmFibGVkGAEgASgIEg8KB3B0dF9waW4YAiABKA0SQAoHYml0cmF0ZRgDIAEoDjIvLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLkF1ZGlvQ29uZmlnLkF1ZGlvX0JhdWQSDgoGaTJzX3dzGAQgASgNEg4KBmkyc19zZBgFIAEoDRIPCgdpMnNfZGluGAYgASgNEg8KB2kyc19zY2sYByABKA0ipwEKCkF1ZGlvX0JhdWQSEgoOQ09ERUMyX0RFRkFVTFQQABIPCgtDT0RFQzJfMzIwMBABEg8KC0NPREVDMl8yNDAwEAISDwoLQ09ERUMyXzE2MDAQAxIPCgtDT0RFQzJfMTQwMBAEEg8KC0NPREVDMl8xMzAwEAUSDwoLQ09ERUMyXzEyMDAQBhIOCgpDT0RFQzJfNzAwEAcSDwoLQ09ERUMyXzcwMEIQCBp2ChBQYXhjb3VudGVyQ29uZmlnEg8KB2VuYWJsZWQYASABKAgSIgoacGF4Y291bnRlcl91cGRhdGVfaW50ZXJ2YWwYAiABKA0SFgoOd2lmaV90aHJlc2hvbGQYAyABKAUSFQoNYmxlX3RocmVzaG9sZBgEIAEoBRruBAoMU2VyaWFsQ29uZmlnEg8KB2VuYWJsZWQYASABKAgSDAoEZWNobxgCIAEoCBILCgNyeGQYAyABKA0SCwoDdHhkGAQgASgNEj8KBGJhdWQYBSABKA4yMS5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5TZXJpYWxDb25maWcuU2VyaWFsX0JhdWQSDwoHdGltZW91dBgGIAEoDRI/CgRtb2RlGAcgASgOMjEubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuU2VyaWFsQ29uZmlnLlNlcmlhbF9Nb2RlEiQKHG92ZXJyaWRlX2NvbnNvbGVfc2VyaWFsX3BvcnQYCCABKAgiigIKC1NlcmlhbF9CYXVkEhAKDEJBVURfREVGQVVMVBAAEgwKCEJBVURfMTEwEAESDAoIQkFVRF8zMDAQAhIMCghCQVVEXzYwMBADEg0KCUJBVURfMTIwMBAEEg0KCUJBVURfMjQwMBAFEg0KCUJBVURfNDgwMBAGEg0KCUJBVURfOTYwMBAHEg4KCkJBVURfMTkyMDAQCBIOCgpCQVVEXzM4NDAwEAkSDgoKQkFVRF81NzYwMBAKEg8KC0JBVURfMTE1MjAwEAsSDwoLQkFVRF8yMzA0MDAQDBIPCgtCQVVEXzQ2MDgwMBANEg8KC0JBVURfNTc2MDAwEA4SDwoLQkFVRF85MjE2MDAQDyJfCgtTZXJpYWxfTW9kZRILCgdERUZBVUxUEAASCgoGU0lNUExFEAESCQoFUFJPVE8QAhILCgdURVhUTVNHEAMSCAoETk1FQRAEEgsKB0NBTFRPUE8QBRIICgRXUzg1EAYa6QIKGkV4dGVybmFsTm90aWZpY2F0aW9uQ29uZmlnEg8KB2VuYWJsZWQYASABKAgSEQoJb3V0cHV0X21zGAIgASgNEg4KBm91dHB1dBgDIAEoDRIUCgxvdXRwdXRfdmlicmEYCCABKA0SFQoNb3V0cHV0X2J1enplchgJIAEoDRIOCgZhY3RpdmUYBCABKAgSFQoNYWxlcnRfbWVzc2FnZRgFIAEoCBIbChNhbGVydF9tZXNzYWdlX3ZpYnJhGAogASgIEhwKFGFsZXJ0X21lc3NhZ2VfYnV6emVyGAsgASgIEhIKCmFsZXJ0X2JlbGwYBiABKAgSGAoQYWxlcnRfYmVsbF92aWJyYRgMIAEoCBIZChFhbGVydF9iZWxsX2J1enplchgNIAEoCBIPCgd1c2VfcHdtGAcgASgIEhMKC25hZ190aW1lb3V0GA4gASgNEhkKEXVzZV9pMnNfYXNfYnV6emVyGA8gASgIGpcBChJTdG9yZUZvcndhcmRDb25maWcSDwoHZW5hYmxlZBgBIAEoCBIRCgloZWFydGJlYXQYAiABKAgSDwoHcmVjb3JkcxgDIAEoDRIaChJoaXN0b3J5X3JldHVybl9tYXgYBCABKA0SHQoVaGlzdG9yeV9yZXR1cm5fd2luZG93GAUgASgNEhEKCWlzX3NlcnZlchgGIAEoCBpACg9SYW5nZVRlc3RDb25maWcSDwoHZW5hYmxlZBgBIAEoCBIOCgZzZW5kZXIYAiABKA0SDAoEc2F2ZRgDIAEoCBrJAwoPVGVsZW1ldHJ5Q29uZmlnEh4KFmRldmljZV91cGRhdGVfaW50ZXJ2YWwYASABKA0SIwobZW52aXJvbm1lbnRfdXBkYXRlX2ludGVydmFsGAIgASgNEicKH2Vudmlyb25tZW50X21lYXN1cmVtZW50X2VuYWJsZWQYAyABKAgSIgoaZW52aXJvbm1lbnRfc2NyZWVuX2VuYWJsZWQYBCABKAgSJgoeZW52aXJvbm1lbnRfZGlzcGxheV9mYWhyZW5oZWl0GAUgASgIEhsKE2Fpcl9xdWFsaXR5X2VuYWJsZWQYBiABKAgSHAoUYWlyX3F1YWxpdHlfaW50ZXJ2YWwYByABKA0SIQoZcG93ZXJfbWVhc3VyZW1lbnRfZW5hYmxlZBgIIAEoCBIdChVwb3dlcl91cGRhdGVfaW50ZXJ2YWwYCSABKA0SHAoUcG93ZXJfc2NyZWVuX2VuYWJsZWQYCiABKAgSIgoaaGVhbHRoX21lYXN1cmVtZW50X2VuYWJsZWQYCyABKAgSHgoWaGVhbHRoX3VwZGF0ZV9pbnRlcnZhbBgMIAEoDRIdChVoZWFsdGhfc2NyZWVuX2VuYWJsZWQYDSABKAga1gQKE0Nhbm5lZE1lc3NhZ2VDb25maWcSFwoPcm90YXJ5MV9lbmFibGVkGAEgASgIEhkKEWlucHV0YnJva2VyX3Bpbl9hGAIgASgNEhkKEWlucHV0YnJva2VyX3Bpbl9iGAMgASgNEh0KFWlucHV0YnJva2VyX3Bpbl9wcmVzcxgEIAEoDRJZChRpbnB1dGJyb2tlcl9ldmVudF9jdxgFIAEoDjI7Lm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLkNhbm5lZE1lc3NhZ2VDb25maWcuSW5wdXRFdmVudENoYXISWgoVaW5wdXRicm9rZXJfZXZlbnRfY2N3GAYgASgOMjsubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuQ2FubmVkTWVzc2FnZUNvbmZpZy5JbnB1dEV2ZW50Q2hhchJcChdpbnB1dGJyb2tlcl9ldmVudF9wcmVzcxgHIAEoDjI7Lm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLkNhbm5lZE1lc3NhZ2VDb25maWcuSW5wdXRFdmVudENoYXISFwoPdXBkb3duMV9lbmFibGVkGAggASgIEg8KB2VuYWJsZWQYCSABKAgSGgoSYWxsb3dfaW5wdXRfc291cmNlGAogASgJEhEKCXNlbmRfYmVsbBgLIAEoCCJjCg5JbnB1dEV2ZW50Q2hhchIICgROT05FEAASBgoCVVAQERIICgRET1dOEBISCAoETEVGVBATEgkKBVJJR0hUEBQSCgoGU0VMRUNUEAoSCAoEQkFDSxAbEgoKBkNBTkNFTBAYGmUKFUFtYmllbnRMaWdodGluZ0NvbmZpZxIRCglsZWRfc3RhdGUYASABKAgSDwoHY3VycmVudBgCIAEoDRILCgNyZWQYAyABKA0SDQoFZ3JlZW4YBCABKA0SDAoEYmx1ZRgFIAEoDUIRCg9wYXlsb2FkX3ZhcmlhbnQiZAoRUmVtb3RlSGFyZHdhcmVQaW4SEAoIZ3Bpb19waW4YASABKA0SDAoEbmFtZRgCIAEoCRIvCgR0eXBlGAMgASgOMiEubWVzaHRhc3RpYy5SZW1vdGVIYXJkd2FyZVBpblR5cGUqSQoVUmVtb3RlSGFyZHdhcmVQaW5UeXBlEgsKB1VOS05PV04QABIQCgxESUdJVEFMX1JFQUQQARIRCg1ESUdJVEFMX1dSSVRFEAJCZwoTY29tLmdlZWtzdmlsbGUubWVzaEISTW9kdWxlQ29uZmlnUHJvdG9zWiJnaXRodWIuY29tL21lc2h0YXN0aWMvZ28vZ2VuZXJhdGVkqgIUTWVzaHRhc3RpYy5Qcm90b2J1ZnO6AgBiBnByb3RvMw");
var ModuleConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0);
var ModuleConfig_MQTTConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 0);
var ModuleConfig_MapReportSettingsSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 1);
var ModuleConfig_RemoteHardwareConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 2);
var ModuleConfig_NeighborInfoConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 3);
var ModuleConfig_DetectionSensorConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 4);
var ModuleConfig_DetectionSensorConfig_TriggerType;
(function(ModuleConfig_DetectionSensorConfig_TriggerType2) {
  ModuleConfig_DetectionSensorConfig_TriggerType2[ModuleConfig_DetectionSensorConfig_TriggerType2["LOGIC_LOW"] = 0] = "LOGIC_LOW";
  ModuleConfig_DetectionSensorConfig_TriggerType2[ModuleConfig_DetectionSensorConfig_TriggerType2["LOGIC_HIGH"] = 1] = "LOGIC_HIGH";
  ModuleConfig_DetectionSensorConfig_TriggerType2[ModuleConfig_DetectionSensorConfig_TriggerType2["FALLING_EDGE"] = 2] = "FALLING_EDGE";
  ModuleConfig_DetectionSensorConfig_TriggerType2[ModuleConfig_DetectionSensorConfig_TriggerType2["RISING_EDGE"] = 3] = "RISING_EDGE";
  ModuleConfig_DetectionSensorConfig_TriggerType2[ModuleConfig_DetectionSensorConfig_TriggerType2["EITHER_EDGE_ACTIVE_LOW"] = 4] = "EITHER_EDGE_ACTIVE_LOW";
  ModuleConfig_DetectionSensorConfig_TriggerType2[ModuleConfig_DetectionSensorConfig_TriggerType2["EITHER_EDGE_ACTIVE_HIGH"] = 5] = "EITHER_EDGE_ACTIVE_HIGH";
})(ModuleConfig_DetectionSensorConfig_TriggerType || (ModuleConfig_DetectionSensorConfig_TriggerType = {}));
var ModuleConfig_DetectionSensorConfig_TriggerTypeSchema = /* @__PURE__ */ enumDesc(file_module_config, 0, 4, 0);
var ModuleConfig_AudioConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 5);
var ModuleConfig_AudioConfig_Audio_Baud;
(function(ModuleConfig_AudioConfig_Audio_Baud2) {
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_DEFAULT"] = 0] = "CODEC2_DEFAULT";
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_3200"] = 1] = "CODEC2_3200";
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_2400"] = 2] = "CODEC2_2400";
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_1600"] = 3] = "CODEC2_1600";
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_1400"] = 4] = "CODEC2_1400";
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_1300"] = 5] = "CODEC2_1300";
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_1200"] = 6] = "CODEC2_1200";
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_700"] = 7] = "CODEC2_700";
  ModuleConfig_AudioConfig_Audio_Baud2[ModuleConfig_AudioConfig_Audio_Baud2["CODEC2_700B"] = 8] = "CODEC2_700B";
})(ModuleConfig_AudioConfig_Audio_Baud || (ModuleConfig_AudioConfig_Audio_Baud = {}));
var ModuleConfig_AudioConfig_Audio_BaudSchema = /* @__PURE__ */ enumDesc(file_module_config, 0, 5, 0);
var ModuleConfig_PaxcounterConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 6);
var ModuleConfig_SerialConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 7);
var ModuleConfig_SerialConfig_Serial_Baud;
(function(ModuleConfig_SerialConfig_Serial_Baud2) {
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_DEFAULT"] = 0] = "BAUD_DEFAULT";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_110"] = 1] = "BAUD_110";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_300"] = 2] = "BAUD_300";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_600"] = 3] = "BAUD_600";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_1200"] = 4] = "BAUD_1200";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_2400"] = 5] = "BAUD_2400";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_4800"] = 6] = "BAUD_4800";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_9600"] = 7] = "BAUD_9600";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_19200"] = 8] = "BAUD_19200";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_38400"] = 9] = "BAUD_38400";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_57600"] = 10] = "BAUD_57600";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_115200"] = 11] = "BAUD_115200";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_230400"] = 12] = "BAUD_230400";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_460800"] = 13] = "BAUD_460800";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_576000"] = 14] = "BAUD_576000";
  ModuleConfig_SerialConfig_Serial_Baud2[ModuleConfig_SerialConfig_Serial_Baud2["BAUD_921600"] = 15] = "BAUD_921600";
})(ModuleConfig_SerialConfig_Serial_Baud || (ModuleConfig_SerialConfig_Serial_Baud = {}));
var ModuleConfig_SerialConfig_Serial_BaudSchema = /* @__PURE__ */ enumDesc(file_module_config, 0, 7, 0);
var ModuleConfig_SerialConfig_Serial_Mode;
(function(ModuleConfig_SerialConfig_Serial_Mode2) {
  ModuleConfig_SerialConfig_Serial_Mode2[ModuleConfig_SerialConfig_Serial_Mode2["DEFAULT"] = 0] = "DEFAULT";
  ModuleConfig_SerialConfig_Serial_Mode2[ModuleConfig_SerialConfig_Serial_Mode2["SIMPLE"] = 1] = "SIMPLE";
  ModuleConfig_SerialConfig_Serial_Mode2[ModuleConfig_SerialConfig_Serial_Mode2["PROTO"] = 2] = "PROTO";
  ModuleConfig_SerialConfig_Serial_Mode2[ModuleConfig_SerialConfig_Serial_Mode2["TEXTMSG"] = 3] = "TEXTMSG";
  ModuleConfig_SerialConfig_Serial_Mode2[ModuleConfig_SerialConfig_Serial_Mode2["NMEA"] = 4] = "NMEA";
  ModuleConfig_SerialConfig_Serial_Mode2[ModuleConfig_SerialConfig_Serial_Mode2["CALTOPO"] = 5] = "CALTOPO";
  ModuleConfig_SerialConfig_Serial_Mode2[ModuleConfig_SerialConfig_Serial_Mode2["WS85"] = 6] = "WS85";
})(ModuleConfig_SerialConfig_Serial_Mode || (ModuleConfig_SerialConfig_Serial_Mode = {}));
var ModuleConfig_SerialConfig_Serial_ModeSchema = /* @__PURE__ */ enumDesc(file_module_config, 0, 7, 1);
var ModuleConfig_ExternalNotificationConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 8);
var ModuleConfig_StoreForwardConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 9);
var ModuleConfig_RangeTestConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 10);
var ModuleConfig_TelemetryConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 11);
var ModuleConfig_CannedMessageConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 12);
var ModuleConfig_CannedMessageConfig_InputEventChar;
(function(ModuleConfig_CannedMessageConfig_InputEventChar2) {
  ModuleConfig_CannedMessageConfig_InputEventChar2[ModuleConfig_CannedMessageConfig_InputEventChar2["NONE"] = 0] = "NONE";
  ModuleConfig_CannedMessageConfig_InputEventChar2[ModuleConfig_CannedMessageConfig_InputEventChar2["UP"] = 17] = "UP";
  ModuleConfig_CannedMessageConfig_InputEventChar2[ModuleConfig_CannedMessageConfig_InputEventChar2["DOWN"] = 18] = "DOWN";
  ModuleConfig_CannedMessageConfig_InputEventChar2[ModuleConfig_CannedMessageConfig_InputEventChar2["LEFT"] = 19] = "LEFT";
  ModuleConfig_CannedMessageConfig_InputEventChar2[ModuleConfig_CannedMessageConfig_InputEventChar2["RIGHT"] = 20] = "RIGHT";
  ModuleConfig_CannedMessageConfig_InputEventChar2[ModuleConfig_CannedMessageConfig_InputEventChar2["SELECT"] = 10] = "SELECT";
  ModuleConfig_CannedMessageConfig_InputEventChar2[ModuleConfig_CannedMessageConfig_InputEventChar2["BACK"] = 27] = "BACK";
  ModuleConfig_CannedMessageConfig_InputEventChar2[ModuleConfig_CannedMessageConfig_InputEventChar2["CANCEL"] = 24] = "CANCEL";
})(ModuleConfig_CannedMessageConfig_InputEventChar || (ModuleConfig_CannedMessageConfig_InputEventChar = {}));
var ModuleConfig_CannedMessageConfig_InputEventCharSchema = /* @__PURE__ */ enumDesc(file_module_config, 0, 12, 0);
var ModuleConfig_AmbientLightingConfigSchema = /* @__PURE__ */ messageDesc(file_module_config, 0, 13);
var RemoteHardwarePinSchema = /* @__PURE__ */ messageDesc(file_module_config, 1);
var RemoteHardwarePinType;
(function(RemoteHardwarePinType2) {
  RemoteHardwarePinType2[RemoteHardwarePinType2["UNKNOWN"] = 0] = "UNKNOWN";
  RemoteHardwarePinType2[RemoteHardwarePinType2["DIGITAL_READ"] = 1] = "DIGITAL_READ";
  RemoteHardwarePinType2[RemoteHardwarePinType2["DIGITAL_WRITE"] = 2] = "DIGITAL_WRITE";
})(RemoteHardwarePinType || (RemoteHardwarePinType = {}));
var RemoteHardwarePinTypeSchema = /* @__PURE__ */ enumDesc(file_module_config, 0);

// node_modules/@meshtastic/protobufs/lib/portnums_pb.js
var portnums_pb_exports = {};
__export(portnums_pb_exports, {
  PortNum: () => PortNum,
  PortNumSchema: () => PortNumSchema,
  file_portnums: () => file_portnums
});
var file_portnums = /* @__PURE__ */ fileDesc("Cg5wb3J0bnVtcy5wcm90bxIKbWVzaHRhc3RpYyqiBAoHUG9ydE51bRIPCgtVTktOT1dOX0FQUBAAEhQKEFRFWFRfTUVTU0FHRV9BUFAQARIXChNSRU1PVEVfSEFSRFdBUkVfQVBQEAISEAoMUE9TSVRJT05fQVBQEAMSEAoMTk9ERUlORk9fQVBQEAQSDwoLUk9VVElOR19BUFAQBRINCglBRE1JTl9BUFAQBhIfChtURVhUX01FU1NBR0VfQ09NUFJFU1NFRF9BUFAQBxIQCgxXQVlQT0lOVF9BUFAQCBINCglBVURJT19BUFAQCRIYChRERVRFQ1RJT05fU0VOU09SX0FQUBAKEg0KCVJFUExZX0FQUBAgEhEKDUlQX1RVTk5FTF9BUFAQIRISCg5QQVhDT1VOVEVSX0FQUBAiEg4KClNFUklBTF9BUFAQQBIVChFTVE9SRV9GT1JXQVJEX0FQUBBBEhIKDlJBTkdFX1RFU1RfQVBQEEISEQoNVEVMRU1FVFJZX0FQUBBDEgsKB1pQU19BUFAQRBIRCg1TSU1VTEFUT1JfQVBQEEUSEgoOVFJBQ0VST1VURV9BUFAQRhIUChBORUlHSEJPUklORk9fQVBQEEcSDwoLQVRBS19QTFVHSU4QSBISCg5NQVBfUkVQT1JUX0FQUBBJEhMKD1BPV0VSU1RSRVNTX0FQUBBKEhAKC1BSSVZBVEVfQVBQEIACEhMKDkFUQUtfRk9SV0FSREVSEIECEggKA01BWBD/A0JdChNjb20uZ2Vla3N2aWxsZS5tZXNoQghQb3J0bnVtc1oiZ2l0aHViLmNvbS9tZXNodGFzdGljL2dvL2dlbmVyYXRlZKoCFE1lc2h0YXN0aWMuUHJvdG9idWZzugIAYgZwcm90bzM");
var PortNum;
(function(PortNum2) {
  PortNum2[PortNum2["UNKNOWN_APP"] = 0] = "UNKNOWN_APP";
  PortNum2[PortNum2["TEXT_MESSAGE_APP"] = 1] = "TEXT_MESSAGE_APP";
  PortNum2[PortNum2["REMOTE_HARDWARE_APP"] = 2] = "REMOTE_HARDWARE_APP";
  PortNum2[PortNum2["POSITION_APP"] = 3] = "POSITION_APP";
  PortNum2[PortNum2["NODEINFO_APP"] = 4] = "NODEINFO_APP";
  PortNum2[PortNum2["ROUTING_APP"] = 5] = "ROUTING_APP";
  PortNum2[PortNum2["ADMIN_APP"] = 6] = "ADMIN_APP";
  PortNum2[PortNum2["TEXT_MESSAGE_COMPRESSED_APP"] = 7] = "TEXT_MESSAGE_COMPRESSED_APP";
  PortNum2[PortNum2["WAYPOINT_APP"] = 8] = "WAYPOINT_APP";
  PortNum2[PortNum2["AUDIO_APP"] = 9] = "AUDIO_APP";
  PortNum2[PortNum2["DETECTION_SENSOR_APP"] = 10] = "DETECTION_SENSOR_APP";
  PortNum2[PortNum2["REPLY_APP"] = 32] = "REPLY_APP";
  PortNum2[PortNum2["IP_TUNNEL_APP"] = 33] = "IP_TUNNEL_APP";
  PortNum2[PortNum2["PAXCOUNTER_APP"] = 34] = "PAXCOUNTER_APP";
  PortNum2[PortNum2["SERIAL_APP"] = 64] = "SERIAL_APP";
  PortNum2[PortNum2["STORE_FORWARD_APP"] = 65] = "STORE_FORWARD_APP";
  PortNum2[PortNum2["RANGE_TEST_APP"] = 66] = "RANGE_TEST_APP";
  PortNum2[PortNum2["TELEMETRY_APP"] = 67] = "TELEMETRY_APP";
  PortNum2[PortNum2["ZPS_APP"] = 68] = "ZPS_APP";
  PortNum2[PortNum2["SIMULATOR_APP"] = 69] = "SIMULATOR_APP";
  PortNum2[PortNum2["TRACEROUTE_APP"] = 70] = "TRACEROUTE_APP";
  PortNum2[PortNum2["NEIGHBORINFO_APP"] = 71] = "NEIGHBORINFO_APP";
  PortNum2[PortNum2["ATAK_PLUGIN"] = 72] = "ATAK_PLUGIN";
  PortNum2[PortNum2["MAP_REPORT_APP"] = 73] = "MAP_REPORT_APP";
  PortNum2[PortNum2["POWERSTRESS_APP"] = 74] = "POWERSTRESS_APP";
  PortNum2[PortNum2["PRIVATE_APP"] = 256] = "PRIVATE_APP";
  PortNum2[PortNum2["ATAK_FORWARDER"] = 257] = "ATAK_FORWARDER";
  PortNum2[PortNum2["MAX"] = 511] = "MAX";
})(PortNum || (PortNum = {}));
var PortNumSchema = /* @__PURE__ */ enumDesc(file_portnums, 0);

// node_modules/@meshtastic/protobufs/lib/telemetry_pb.js
var telemetry_pb_exports = {};
__export(telemetry_pb_exports, {
  AirQualityMetricsSchema: () => AirQualityMetricsSchema,
  DeviceMetricsSchema: () => DeviceMetricsSchema,
  EnvironmentMetricsSchema: () => EnvironmentMetricsSchema,
  HealthMetricsSchema: () => HealthMetricsSchema,
  LocalStatsSchema: () => LocalStatsSchema,
  Nau7802ConfigSchema: () => Nau7802ConfigSchema,
  PowerMetricsSchema: () => PowerMetricsSchema,
  TelemetrySchema: () => TelemetrySchema,
  TelemetrySensorType: () => TelemetrySensorType,
  TelemetrySensorTypeSchema: () => TelemetrySensorTypeSchema,
  file_telemetry: () => file_telemetry
});
var file_telemetry = /* @__PURE__ */ fileDesc("Cg90ZWxlbWV0cnkucHJvdG8SCm1lc2h0YXN0aWMi8wEKDURldmljZU1ldHJpY3MSGgoNYmF0dGVyeV9sZXZlbBgBIAEoDUgAiAEBEhQKB3ZvbHRhZ2UYAiABKAJIAYgBARIgChNjaGFubmVsX3V0aWxpemF0aW9uGAMgASgCSAKIAQESGAoLYWlyX3V0aWxfdHgYBCABKAJIA4gBARIbCg51cHRpbWVfc2Vjb25kcxgFIAEoDUgEiAEBQhAKDl9iYXR0ZXJ5X2xldmVsQgoKCF92b2x0YWdlQhYKFF9jaGFubmVsX3V0aWxpemF0aW9uQg4KDF9haXJfdXRpbF90eEIRCg9fdXB0aW1lX3NlY29uZHMipAUKEkVudmlyb25tZW50TWV0cmljcxIYCgt0ZW1wZXJhdHVyZRgBIAEoAkgAiAEBEh4KEXJlbGF0aXZlX2h1bWlkaXR5GAIgASgCSAGIAQESIAoTYmFyb21ldHJpY19wcmVzc3VyZRgDIAEoAkgCiAEBEhsKDmdhc19yZXNpc3RhbmNlGAQgASgCSAOIAQESFAoHdm9sdGFnZRgFIAEoAkgEiAEBEhQKB2N1cnJlbnQYBiABKAJIBYgBARIQCgNpYXEYByABKA1IBogBARIVCghkaXN0YW5jZRgIIAEoAkgHiAEBEhAKA2x1eBgJIAEoAkgIiAEBEhYKCXdoaXRlX2x1eBgKIAEoAkgJiAEBEhMKBmlyX2x1eBgLIAEoAkgKiAEBEhMKBnV2X2x1eBgMIAEoAkgLiAEBEhsKDndpbmRfZGlyZWN0aW9uGA0gASgNSAyIAQESFwoKd2luZF9zcGVlZBgOIAEoAkgNiAEBEhMKBndlaWdodBgPIAEoAkgOiAEBEhYKCXdpbmRfZ3VzdBgQIAEoAkgPiAEBEhYKCXdpbmRfbHVsbBgRIAEoAkgQiAEBQg4KDF90ZW1wZXJhdHVyZUIUChJfcmVsYXRpdmVfaHVtaWRpdHlCFgoUX2Jhcm9tZXRyaWNfcHJlc3N1cmVCEQoPX2dhc19yZXNpc3RhbmNlQgoKCF92b2x0YWdlQgoKCF9jdXJyZW50QgYKBF9pYXFCCwoJX2Rpc3RhbmNlQgYKBF9sdXhCDAoKX3doaXRlX2x1eEIJCgdfaXJfbHV4QgkKB191dl9sdXhCEQoPX3dpbmRfZGlyZWN0aW9uQg0KC193aW5kX3NwZWVkQgkKB193ZWlnaHRCDAoKX3dpbmRfZ3VzdEIMCgpfd2luZF9sdWxsIooCCgxQb3dlck1ldHJpY3MSGAoLY2gxX3ZvbHRhZ2UYASABKAJIAIgBARIYCgtjaDFfY3VycmVudBgCIAEoAkgBiAEBEhgKC2NoMl92b2x0YWdlGAMgASgCSAKIAQESGAoLY2gyX2N1cnJlbnQYBCABKAJIA4gBARIYCgtjaDNfdm9sdGFnZRgFIAEoAkgEiAEBEhgKC2NoM19jdXJyZW50GAYgASgCSAWIAQFCDgoMX2NoMV92b2x0YWdlQg4KDF9jaDFfY3VycmVudEIOCgxfY2gyX3ZvbHRhZ2VCDgoMX2NoMl9jdXJyZW50Qg4KDF9jaDNfdm9sdGFnZUIOCgxfY2gzX2N1cnJlbnQihQUKEUFpclF1YWxpdHlNZXRyaWNzEhoKDXBtMTBfc3RhbmRhcmQYASABKA1IAIgBARIaCg1wbTI1X3N0YW5kYXJkGAIgASgNSAGIAQESGwoOcG0xMDBfc3RhbmRhcmQYAyABKA1IAogBARIfChJwbTEwX2Vudmlyb25tZW50YWwYBCABKA1IA4gBARIfChJwbTI1X2Vudmlyb25tZW50YWwYBSABKA1IBIgBARIgChNwbTEwMF9lbnZpcm9ubWVudGFsGAYgASgNSAWIAQESGwoOcGFydGljbGVzXzAzdW0YByABKA1IBogBARIbCg5wYXJ0aWNsZXNfMDV1bRgIIAEoDUgHiAEBEhsKDnBhcnRpY2xlc18xMHVtGAkgASgNSAiIAQESGwoOcGFydGljbGVzXzI1dW0YCiABKA1ICYgBARIbCg5wYXJ0aWNsZXNfNTB1bRgLIAEoDUgKiAEBEhwKD3BhcnRpY2xlc18xMDB1bRgMIAEoDUgLiAEBEhAKA2NvMhgNIAEoDUgMiAEBQhAKDl9wbTEwX3N0YW5kYXJkQhAKDl9wbTI1X3N0YW5kYXJkQhEKD19wbTEwMF9zdGFuZGFyZEIVChNfcG0xMF9lbnZpcm9ubWVudGFsQhUKE19wbTI1X2Vudmlyb25tZW50YWxCFgoUX3BtMTAwX2Vudmlyb25tZW50YWxCEQoPX3BhcnRpY2xlc18wM3VtQhEKD19wYXJ0aWNsZXNfMDV1bUIRCg9fcGFydGljbGVzXzEwdW1CEQoPX3BhcnRpY2xlc18yNXVtQhEKD19wYXJ0aWNsZXNfNTB1bUISChBfcGFydGljbGVzXzEwMHVtQgYKBF9jbzIinwIKCkxvY2FsU3RhdHMSFgoOdXB0aW1lX3NlY29uZHMYASABKA0SGwoTY2hhbm5lbF91dGlsaXphdGlvbhgCIAEoAhITCgthaXJfdXRpbF90eBgDIAEoAhIWCg5udW1fcGFja2V0c190eBgEIAEoDRIWCg5udW1fcGFja2V0c19yeBgFIAEoDRIaChJudW1fcGFja2V0c19yeF9iYWQYBiABKA0SGAoQbnVtX29ubGluZV9ub2RlcxgHIAEoDRIXCg9udW1fdG90YWxfbm9kZXMYCCABKA0SEwoLbnVtX3J4X2R1cGUYCSABKA0SFAoMbnVtX3R4X3JlbGF5GAogASgNEh0KFW51bV90eF9yZWxheV9jYW5jZWxlZBgLIAEoDSJ7Cg1IZWFsdGhNZXRyaWNzEhYKCWhlYXJ0X2JwbRgBIAEoDUgAiAEBEhEKBHNwTzIYAiABKA1IAYgBARIYCgt0ZW1wZXJhdHVyZRgDIAEoAkgCiAEBQgwKCl9oZWFydF9icG1CBwoFX3NwTzJCDgoMX3RlbXBlcmF0dXJlIu0CCglUZWxlbWV0cnkSDAoEdGltZRgBIAEoBxIzCg5kZXZpY2VfbWV0cmljcxgCIAEoCzIZLm1lc2h0YXN0aWMuRGV2aWNlTWV0cmljc0gAEj0KE2Vudmlyb25tZW50X21ldHJpY3MYAyABKAsyHi5tZXNodGFzdGljLkVudmlyb25tZW50TWV0cmljc0gAEjwKE2Fpcl9xdWFsaXR5X21ldHJpY3MYBCABKAsyHS5tZXNodGFzdGljLkFpclF1YWxpdHlNZXRyaWNzSAASMQoNcG93ZXJfbWV0cmljcxgFIAEoCzIYLm1lc2h0YXN0aWMuUG93ZXJNZXRyaWNzSAASLQoLbG9jYWxfc3RhdHMYBiABKAsyFi5tZXNodGFzdGljLkxvY2FsU3RhdHNIABIzCg5oZWFsdGhfbWV0cmljcxgHIAEoCzIZLm1lc2h0YXN0aWMuSGVhbHRoTWV0cmljc0gAQgkKB3ZhcmlhbnQiPgoNTmF1NzgwMkNvbmZpZxISCgp6ZXJvT2Zmc2V0GAEgASgFEhkKEWNhbGlicmF0aW9uRmFjdG9yGAIgASgCKswDChNUZWxlbWV0cnlTZW5zb3JUeXBlEhAKDFNFTlNPUl9VTlNFVBAAEgoKBkJNRTI4MBABEgoKBkJNRTY4MBACEgsKB01DUDk4MDgQAxIKCgZJTkEyNjAQBBIKCgZJTkEyMTkQBRIKCgZCTVAyODAQBhIJCgVTSFRDMxAHEgkKBUxQUzIyEAgSCwoHUU1DNjMxMBAJEgsKB1FNSTg2NTgQChIMCghRTUM1ODgzTBALEgkKBVNIVDMxEAwSDAoIUE1TQTAwM0kQDRILCgdJTkEzMjIxEA4SCgoGQk1QMDg1EA8SDAoIUkNXTDk2MjAQEBIJCgVTSFQ0WBAREgwKCFZFTUw3NzAwEBISDAoITUxYOTA2MzIQExILCgdPUFQzMDAxEBQSDAoITFRSMzkwVVYQFRIOCgpUU0wyNTkxMUZOEBYSCQoFQUhUMTAQFxIQCgxERlJPQk9UX0xBUksQGBILCgdOQVU3ODAyEBkSCgoGQk1QM1hYEBoSDAoISUNNMjA5NDgQGxIMCghNQVgxNzA0OBAcEhEKDUNVU1RPTV9TRU5TT1IQHRIMCghNQVgzMDEwMhAeEgwKCE1MWDkwNjE0EB8SCQoFU0NENFgQIEJkChNjb20uZ2Vla3N2aWxsZS5tZXNoQg9UZWxlbWV0cnlQcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z");
var DeviceMetricsSchema = /* @__PURE__ */ messageDesc(file_telemetry, 0);
var EnvironmentMetricsSchema = /* @__PURE__ */ messageDesc(file_telemetry, 1);
var PowerMetricsSchema = /* @__PURE__ */ messageDesc(file_telemetry, 2);
var AirQualityMetricsSchema = /* @__PURE__ */ messageDesc(file_telemetry, 3);
var LocalStatsSchema = /* @__PURE__ */ messageDesc(file_telemetry, 4);
var HealthMetricsSchema = /* @__PURE__ */ messageDesc(file_telemetry, 5);
var TelemetrySchema = /* @__PURE__ */ messageDesc(file_telemetry, 6);
var Nau7802ConfigSchema = /* @__PURE__ */ messageDesc(file_telemetry, 7);
var TelemetrySensorType;
(function(TelemetrySensorType2) {
  TelemetrySensorType2[TelemetrySensorType2["SENSOR_UNSET"] = 0] = "SENSOR_UNSET";
  TelemetrySensorType2[TelemetrySensorType2["BME280"] = 1] = "BME280";
  TelemetrySensorType2[TelemetrySensorType2["BME680"] = 2] = "BME680";
  TelemetrySensorType2[TelemetrySensorType2["MCP9808"] = 3] = "MCP9808";
  TelemetrySensorType2[TelemetrySensorType2["INA260"] = 4] = "INA260";
  TelemetrySensorType2[TelemetrySensorType2["INA219"] = 5] = "INA219";
  TelemetrySensorType2[TelemetrySensorType2["BMP280"] = 6] = "BMP280";
  TelemetrySensorType2[TelemetrySensorType2["SHTC3"] = 7] = "SHTC3";
  TelemetrySensorType2[TelemetrySensorType2["LPS22"] = 8] = "LPS22";
  TelemetrySensorType2[TelemetrySensorType2["QMC6310"] = 9] = "QMC6310";
  TelemetrySensorType2[TelemetrySensorType2["QMI8658"] = 10] = "QMI8658";
  TelemetrySensorType2[TelemetrySensorType2["QMC5883L"] = 11] = "QMC5883L";
  TelemetrySensorType2[TelemetrySensorType2["SHT31"] = 12] = "SHT31";
  TelemetrySensorType2[TelemetrySensorType2["PMSA003I"] = 13] = "PMSA003I";
  TelemetrySensorType2[TelemetrySensorType2["INA3221"] = 14] = "INA3221";
  TelemetrySensorType2[TelemetrySensorType2["BMP085"] = 15] = "BMP085";
  TelemetrySensorType2[TelemetrySensorType2["RCWL9620"] = 16] = "RCWL9620";
  TelemetrySensorType2[TelemetrySensorType2["SHT4X"] = 17] = "SHT4X";
  TelemetrySensorType2[TelemetrySensorType2["VEML7700"] = 18] = "VEML7700";
  TelemetrySensorType2[TelemetrySensorType2["MLX90632"] = 19] = "MLX90632";
  TelemetrySensorType2[TelemetrySensorType2["OPT3001"] = 20] = "OPT3001";
  TelemetrySensorType2[TelemetrySensorType2["LTR390UV"] = 21] = "LTR390UV";
  TelemetrySensorType2[TelemetrySensorType2["TSL25911FN"] = 22] = "TSL25911FN";
  TelemetrySensorType2[TelemetrySensorType2["AHT10"] = 23] = "AHT10";
  TelemetrySensorType2[TelemetrySensorType2["DFROBOT_LARK"] = 24] = "DFROBOT_LARK";
  TelemetrySensorType2[TelemetrySensorType2["NAU7802"] = 25] = "NAU7802";
  TelemetrySensorType2[TelemetrySensorType2["BMP3XX"] = 26] = "BMP3XX";
  TelemetrySensorType2[TelemetrySensorType2["ICM20948"] = 27] = "ICM20948";
  TelemetrySensorType2[TelemetrySensorType2["MAX17048"] = 28] = "MAX17048";
  TelemetrySensorType2[TelemetrySensorType2["CUSTOM_SENSOR"] = 29] = "CUSTOM_SENSOR";
  TelemetrySensorType2[TelemetrySensorType2["MAX30102"] = 30] = "MAX30102";
  TelemetrySensorType2[TelemetrySensorType2["MLX90614"] = 31] = "MLX90614";
  TelemetrySensorType2[TelemetrySensorType2["SCD4X"] = 32] = "SCD4X";
})(TelemetrySensorType || (TelemetrySensorType = {}));
var TelemetrySensorTypeSchema = /* @__PURE__ */ enumDesc(file_telemetry, 0);

// node_modules/@meshtastic/protobufs/lib/xmodem_pb.js
var xmodem_pb_exports = {};
__export(xmodem_pb_exports, {
  XModemSchema: () => XModemSchema,
  XModem_Control: () => XModem_Control,
  XModem_ControlSchema: () => XModem_ControlSchema,
  file_xmodem: () => file_xmodem
});
var file_xmodem = /* @__PURE__ */ fileDesc("Cgx4bW9kZW0ucHJvdG8SCm1lc2h0YXN0aWMitgEKBlhNb2RlbRIrCgdjb250cm9sGAEgASgOMhoubWVzaHRhc3RpYy5YTW9kZW0uQ29udHJvbBILCgNzZXEYAiABKA0SDQoFY3JjMTYYAyABKA0SDgoGYnVmZmVyGAQgASgMIlMKB0NvbnRyb2wSBwoDTlVMEAASBwoDU09IEAESBwoDU1RYEAISBwoDRU9UEAQSBwoDQUNLEAYSBwoDTkFLEBUSBwoDQ0FOEBgSCQoFQ1RSTFoQGkJhChNjb20uZ2Vla3N2aWxsZS5tZXNoQgxYbW9kZW1Qcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z");
var XModemSchema = /* @__PURE__ */ messageDesc(file_xmodem, 0);
var XModem_Control;
(function(XModem_Control2) {
  XModem_Control2[XModem_Control2["NUL"] = 0] = "NUL";
  XModem_Control2[XModem_Control2["SOH"] = 1] = "SOH";
  XModem_Control2[XModem_Control2["STX"] = 2] = "STX";
  XModem_Control2[XModem_Control2["EOT"] = 4] = "EOT";
  XModem_Control2[XModem_Control2["ACK"] = 6] = "ACK";
  XModem_Control2[XModem_Control2["NAK"] = 21] = "NAK";
  XModem_Control2[XModem_Control2["CAN"] = 24] = "CAN";
  XModem_Control2[XModem_Control2["CTRLZ"] = 26] = "CTRLZ";
})(XModem_Control || (XModem_Control = {}));
var XModem_ControlSchema = /* @__PURE__ */ enumDesc(file_xmodem, 0, 0);

// node_modules/@meshtastic/protobufs/lib/mesh_pb.js
var file_mesh = /* @__PURE__ */ fileDesc("CgptZXNoLnByb3RvEgptZXNodGFzdGljIocHCghQb3NpdGlvbhIXCgpsYXRpdHVkZV9pGAEgASgPSACIAQESGAoLbG9uZ2l0dWRlX2kYAiABKA9IAYgBARIVCghhbHRpdHVkZRgDIAEoBUgCiAEBEgwKBHRpbWUYBCABKAcSNwoPbG9jYXRpb25fc291cmNlGAUgASgOMh4ubWVzaHRhc3RpYy5Qb3NpdGlvbi5Mb2NTb3VyY2USNwoPYWx0aXR1ZGVfc291cmNlGAYgASgOMh4ubWVzaHRhc3RpYy5Qb3NpdGlvbi5BbHRTb3VyY2USEQoJdGltZXN0YW1wGAcgASgHEh8KF3RpbWVzdGFtcF9taWxsaXNfYWRqdXN0GAggASgFEhkKDGFsdGl0dWRlX2hhZRgJIAEoEUgDiAEBEigKG2FsdGl0dWRlX2dlb2lkYWxfc2VwYXJhdGlvbhgKIAEoEUgEiAEBEgwKBFBET1AYCyABKA0SDAoESERPUBgMIAEoDRIMCgRWRE9QGA0gASgNEhQKDGdwc19hY2N1cmFjeRgOIAEoDRIZCgxncm91bmRfc3BlZWQYDyABKA1IBYgBARIZCgxncm91bmRfdHJhY2sYECABKA1IBogBARITCgtmaXhfcXVhbGl0eRgRIAEoDRIQCghmaXhfdHlwZRgSIAEoDRIUCgxzYXRzX2luX3ZpZXcYEyABKA0SEQoJc2Vuc29yX2lkGBQgASgNEhMKC25leHRfdXBkYXRlGBUgASgNEhIKCnNlcV9udW1iZXIYFiABKA0SFgoOcHJlY2lzaW9uX2JpdHMYFyABKA0iTgoJTG9jU291cmNlEg0KCUxPQ19VTlNFVBAAEg4KCkxPQ19NQU5VQUwQARIQCgxMT0NfSU5URVJOQUwQAhIQCgxMT0NfRVhURVJOQUwQAyJiCglBbHRTb3VyY2USDQoJQUxUX1VOU0VUEAASDgoKQUxUX01BTlVBTBABEhAKDEFMVF9JTlRFUk5BTBACEhAKDEFMVF9FWFRFUk5BTBADEhIKDkFMVF9CQVJPTUVUUklDEARCDQoLX2xhdGl0dWRlX2lCDgoMX2xvbmdpdHVkZV9pQgsKCV9hbHRpdHVkZUIPCg1fYWx0aXR1ZGVfaGFlQh4KHF9hbHRpdHVkZV9nZW9pZGFsX3NlcGFyYXRpb25CDwoNX2dyb3VuZF9zcGVlZEIPCg1fZ3JvdW5kX3RyYWNrItgBCgRVc2VyEgoKAmlkGAEgASgJEhEKCWxvbmdfbmFtZRgCIAEoCRISCgpzaG9ydF9uYW1lGAMgASgJEhMKB21hY2FkZHIYBCABKAxCAhgBEisKCGh3X21vZGVsGAUgASgOMhkubWVzaHRhc3RpYy5IYXJkd2FyZU1vZGVsEhMKC2lzX2xpY2Vuc2VkGAYgASgIEjIKBHJvbGUYByABKA4yJC5tZXNodGFzdGljLkNvbmZpZy5EZXZpY2VDb25maWcuUm9sZRISCgpwdWJsaWNfa2V5GAggASgMIloKDlJvdXRlRGlzY292ZXJ5Eg0KBXJvdXRlGAEgAygHEhMKC3Nucl90b3dhcmRzGAIgAygFEhIKCnJvdXRlX2JhY2sYAyADKAcSEAoIc25yX2JhY2sYBCADKAUi4gMKB1JvdXRpbmcSMwoNcm91dGVfcmVxdWVzdBgBIAEoCzIaLm1lc2h0YXN0aWMuUm91dGVEaXNjb3ZlcnlIABIxCgtyb3V0ZV9yZXBseRgCIAEoCzIaLm1lc2h0YXN0aWMuUm91dGVEaXNjb3ZlcnlIABIxCgxlcnJvcl9yZWFzb24YAyABKA4yGS5tZXNodGFzdGljLlJvdXRpbmcuRXJyb3JIACKwAgoFRXJyb3ISCAoETk9ORRAAEgwKCE5PX1JPVVRFEAESCwoHR09UX05BSxACEgsKB1RJTUVPVVQQAxIQCgxOT19JTlRFUkZBQ0UQBBISCg5NQVhfUkVUUkFOU01JVBAFEg4KCk5PX0NIQU5ORUwQBhINCglUT09fTEFSR0UQBxIPCgtOT19SRVNQT05TRRAIEhQKEERVVFlfQ1lDTEVfTElNSVQQCRIPCgtCQURfUkVRVUVTVBAgEhIKDk5PVF9BVVRIT1JJWkVEECESDgoKUEtJX0ZBSUxFRBAiEhYKElBLSV9VTktOT1dOX1BVQktFWRAjEhkKFUFETUlOX0JBRF9TRVNTSU9OX0tFWRAkEiEKHUFETUlOX1BVQkxJQ19LRVlfVU5BVVRIT1JJWkVEECVCCQoHdmFyaWFudCLLAQoERGF0YRIkCgdwb3J0bnVtGAEgASgOMhMubWVzaHRhc3RpYy5Qb3J0TnVtEg8KB3BheWxvYWQYAiABKAwSFQoNd2FudF9yZXNwb25zZRgDIAEoCBIMCgRkZXN0GAQgASgHEg4KBnNvdXJjZRgFIAEoBxISCgpyZXF1ZXN0X2lkGAYgASgHEhAKCHJlcGx5X2lkGAcgASgHEg0KBWVtb2ppGAggASgHEhUKCGJpdGZpZWxkGAkgASgNSACIAQFCCwoJX2JpdGZpZWxkIrwBCghXYXlwb2ludBIKCgJpZBgBIAEoDRIXCgpsYXRpdHVkZV9pGAIgASgPSACIAQESGAoLbG9uZ2l0dWRlX2kYAyABKA9IAYgBARIOCgZleHBpcmUYBCABKA0SEQoJbG9ja2VkX3RvGAUgASgNEgwKBG5hbWUYBiABKAkSEwoLZGVzY3JpcHRpb24YByABKAkSDAoEaWNvbhgIIAEoB0INCgtfbGF0aXR1ZGVfaUIOCgxfbG9uZ2l0dWRlX2kibAoWTXF0dENsaWVudFByb3h5TWVzc2FnZRINCgV0b3BpYxgBIAEoCRIOCgRkYXRhGAIgASgMSAASDgoEdGV4dBgDIAEoCUgAEhAKCHJldGFpbmVkGAQgASgIQhEKD3BheWxvYWRfdmFyaWFudCLYBAoKTWVzaFBhY2tldBIMCgRmcm9tGAEgASgHEgoKAnRvGAIgASgHEg8KB2NoYW5uZWwYAyABKA0SIwoHZGVjb2RlZBgEIAEoCzIQLm1lc2h0YXN0aWMuRGF0YUgAEhMKCWVuY3J5cHRlZBgFIAEoDEgAEgoKAmlkGAYgASgHEg8KB3J4X3RpbWUYByABKAcSDgoGcnhfc25yGAggASgCEhEKCWhvcF9saW1pdBgJIAEoDRIQCgh3YW50X2FjaxgKIAEoCBIxCghwcmlvcml0eRgLIAEoDjIfLm1lc2h0YXN0aWMuTWVzaFBhY2tldC5Qcmlvcml0eRIPCgdyeF9yc3NpGAwgASgFEjMKB2RlbGF5ZWQYDSABKA4yHi5tZXNodGFzdGljLk1lc2hQYWNrZXQuRGVsYXllZEICGAESEAoIdmlhX21xdHQYDiABKAgSEQoJaG9wX3N0YXJ0GA8gASgNEhIKCnB1YmxpY19rZXkYECABKAwSFQoNcGtpX2VuY3J5cHRlZBgRIAEoCCJzCghQcmlvcml0eRIJCgVVTlNFVBAAEgcKA01JThABEg4KCkJBQ0tHUk9VTkQQChILCgdERUZBVUxUEEASDAoIUkVMSUFCTEUQRhIMCghSRVNQT05TRRBQEggKBEhJR0gQZBIHCgNBQ0sQeBIHCgNNQVgQfyJCCgdEZWxheWVkEgwKCE5PX0RFTEFZEAASFQoRREVMQVlFRF9CUk9BRENBU1QQARISCg5ERUxBWUVEX0RJUkVDVBACQhEKD3BheWxvYWRfdmFyaWFudCKRAgoITm9kZUluZm8SCwoDbnVtGAEgASgNEh4KBHVzZXIYAiABKAsyEC5tZXNodGFzdGljLlVzZXISJgoIcG9zaXRpb24YAyABKAsyFC5tZXNodGFzdGljLlBvc2l0aW9uEgsKA3NuchgEIAEoAhISCgpsYXN0X2hlYXJkGAUgASgHEjEKDmRldmljZV9tZXRyaWNzGAYgASgLMhkubWVzaHRhc3RpYy5EZXZpY2VNZXRyaWNzEg8KB2NoYW5uZWwYByABKA0SEAoIdmlhX21xdHQYCCABKAgSFgoJaG9wc19hd2F5GAkgASgNSACIAQESEwoLaXNfZmF2b3JpdGUYCiABKAhCDAoKX2hvcHNfYXdheSJjCgpNeU5vZGVJbmZvEhMKC215X25vZGVfbnVtGAEgASgNEhQKDHJlYm9vdF9jb3VudBgIIAEoDRIXCg9taW5fYXBwX3ZlcnNpb24YCyABKA0SEQoJZGV2aWNlX2lkGAwgASgMIsABCglMb2dSZWNvcmQSDwoHbWVzc2FnZRgBIAEoCRIMCgR0aW1lGAIgASgHEg4KBnNvdXJjZRgDIAEoCRIqCgVsZXZlbBgEIAEoDjIbLm1lc2h0YXN0aWMuTG9nUmVjb3JkLkxldmVsIlgKBUxldmVsEgkKBVVOU0VUEAASDAoIQ1JJVElDQUwQMhIJCgVFUlJPUhAoEgsKB1dBUk5JTkcQHhIICgRJTkZPEBQSCQoFREVCVUcQChIJCgVUUkFDRRAFIlAKC1F1ZXVlU3RhdHVzEgsKA3JlcxgBIAEoBRIMCgRmcmVlGAIgASgNEg4KBm1heGxlbhgDIAEoDRIWCg5tZXNoX3BhY2tldF9pZBgEIAEoDSL5BQoJRnJvbVJhZGlvEgoKAmlkGAEgASgNEigKBnBhY2tldBgCIAEoCzIWLm1lc2h0YXN0aWMuTWVzaFBhY2tldEgAEikKB215X2luZm8YAyABKAsyFi5tZXNodGFzdGljLk15Tm9kZUluZm9IABIpCglub2RlX2luZm8YBCABKAsyFC5tZXNodGFzdGljLk5vZGVJbmZvSAASJAoGY29uZmlnGAUgASgLMhIubWVzaHRhc3RpYy5Db25maWdIABIrCgpsb2dfcmVjb3JkGAYgASgLMhUubWVzaHRhc3RpYy5Mb2dSZWNvcmRIABIcChJjb25maWdfY29tcGxldGVfaWQYByABKA1IABISCghyZWJvb3RlZBgIIAEoCEgAEjAKDG1vZHVsZUNvbmZpZxgJIAEoCzIYLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnSAASJgoHY2hhbm5lbBgKIAEoCzITLm1lc2h0YXN0aWMuQ2hhbm5lbEgAEi4KC3F1ZXVlU3RhdHVzGAsgASgLMhcubWVzaHRhc3RpYy5RdWV1ZVN0YXR1c0gAEioKDHhtb2RlbVBhY2tldBgMIAEoCzISLm1lc2h0YXN0aWMuWE1vZGVtSAASLgoIbWV0YWRhdGEYDSABKAsyGi5tZXNodGFzdGljLkRldmljZU1ldGFkYXRhSAASRAoWbXF0dENsaWVudFByb3h5TWVzc2FnZRgOIAEoCzIiLm1lc2h0YXN0aWMuTXF0dENsaWVudFByb3h5TWVzc2FnZUgAEigKCGZpbGVJbmZvGA8gASgLMhQubWVzaHRhc3RpYy5GaWxlSW5mb0gAEjwKEmNsaWVudE5vdGlmaWNhdGlvbhgQIAEoCzIeLm1lc2h0YXN0aWMuQ2xpZW50Tm90aWZpY2F0aW9uSAASNAoOZGV2aWNldWlDb25maWcYESABKAsyGi5tZXNodGFzdGljLkRldmljZVVJQ29uZmlnSABCEQoPcGF5bG9hZF92YXJpYW50IoMBChJDbGllbnROb3RpZmljYXRpb24SFQoIcmVwbHlfaWQYASABKA1IAIgBARIMCgR0aW1lGAIgASgHEioKBWxldmVsGAMgASgOMhsubWVzaHRhc3RpYy5Mb2dSZWNvcmQuTGV2ZWwSDwoHbWVzc2FnZRgEIAEoCUILCglfcmVwbHlfaWQiMQoIRmlsZUluZm8SEQoJZmlsZV9uYW1lGAEgASgJEhIKCnNpemVfYnl0ZXMYAiABKA0ilAIKB1RvUmFkaW8SKAoGcGFja2V0GAEgASgLMhYubWVzaHRhc3RpYy5NZXNoUGFja2V0SAASGAoOd2FudF9jb25maWdfaWQYAyABKA1IABIUCgpkaXNjb25uZWN0GAQgASgISAASKgoMeG1vZGVtUGFja2V0GAUgASgLMhIubWVzaHRhc3RpYy5YTW9kZW1IABJEChZtcXR0Q2xpZW50UHJveHlNZXNzYWdlGAYgASgLMiIubWVzaHRhc3RpYy5NcXR0Q2xpZW50UHJveHlNZXNzYWdlSAASKgoJaGVhcnRiZWF0GAcgASgLMhUubWVzaHRhc3RpYy5IZWFydGJlYXRIAEIRCg9wYXlsb2FkX3ZhcmlhbnQiQAoKQ29tcHJlc3NlZBIkCgdwb3J0bnVtGAEgASgOMhMubWVzaHRhc3RpYy5Qb3J0TnVtEgwKBGRhdGEYAiABKAwihwEKDE5laWdoYm9ySW5mbxIPCgdub2RlX2lkGAEgASgNEhcKD2xhc3Rfc2VudF9ieV9pZBgCIAEoDRIkChxub2RlX2Jyb2FkY2FzdF9pbnRlcnZhbF9zZWNzGAMgASgNEicKCW5laWdoYm9ycxgEIAMoCzIULm1lc2h0YXN0aWMuTmVpZ2hib3IiZAoITmVpZ2hib3ISDwoHbm9kZV9pZBgBIAEoDRILCgNzbnIYAiABKAISFAoMbGFzdF9yeF90aW1lGAMgASgHEiQKHG5vZGVfYnJvYWRjYXN0X2ludGVydmFsX3NlY3MYBCABKA0ivQIKDkRldmljZU1ldGFkYXRhEhgKEGZpcm13YXJlX3ZlcnNpb24YASABKAkSHAoUZGV2aWNlX3N0YXRlX3ZlcnNpb24YAiABKA0SEwoLY2FuU2h1dGRvd24YAyABKAgSDwoHaGFzV2lmaRgEIAEoCBIUCgxoYXNCbHVldG9vdGgYBSABKAgSEwoLaGFzRXRoZXJuZXQYBiABKAgSMgoEcm9sZRgHIAEoDjIkLm1lc2h0YXN0aWMuQ29uZmlnLkRldmljZUNvbmZpZy5Sb2xlEhYKDnBvc2l0aW9uX2ZsYWdzGAggASgNEisKCGh3X21vZGVsGAkgASgOMhkubWVzaHRhc3RpYy5IYXJkd2FyZU1vZGVsEhkKEWhhc1JlbW90ZUhhcmR3YXJlGAogASgIEg4KBmhhc1BLQxgLIAEoCCILCglIZWFydGJlYXQiVQoVTm9kZVJlbW90ZUhhcmR3YXJlUGluEhAKCG5vZGVfbnVtGAEgASgNEioKA3BpbhgCIAEoCzIdLm1lc2h0YXN0aWMuUmVtb3RlSGFyZHdhcmVQaW4iZQoOQ2h1bmtlZFBheWxvYWQSEgoKcGF5bG9hZF9pZBgBIAEoDRITCgtjaHVua19jb3VudBgCIAEoDRITCgtjaHVua19pbmRleBgDIAEoDRIVCg1wYXlsb2FkX2NodW5rGAQgASgMIh8KDXJlc2VuZF9jaHVua3MSDgoGY2h1bmtzGAEgAygNIqoBChZDaHVua2VkUGF5bG9hZFJlc3BvbnNlEhIKCnBheWxvYWRfaWQYASABKA0SGgoQcmVxdWVzdF90cmFuc2ZlchgCIAEoCEgAEhkKD2FjY2VwdF90cmFuc2ZlchgDIAEoCEgAEjIKDXJlc2VuZF9jaHVua3MYBCABKAsyGS5tZXNodGFzdGljLnJlc2VuZF9jaHVua3NIAEIRCg9wYXlsb2FkX3ZhcmlhbnQqywwKDUhhcmR3YXJlTW9kZWwSCQoFVU5TRVQQABIMCghUTE9SQV9WMhABEgwKCFRMT1JBX1YxEAISEgoOVExPUkFfVjJfMV8xUDYQAxIJCgVUQkVBTRAEEg8KC0hFTFRFQ19WMl8wEAUSDgoKVEJFQU1fVjBQNxAGEgoKBlRfRUNITxAHEhAKDFRMT1JBX1YxXzFQMxAIEgsKB1JBSzQ2MzEQCRIPCgtIRUxURUNfVjJfMRAKEg0KCUhFTFRFQ19WMRALEhgKFExJTFlHT19UQkVBTV9TM19DT1JFEAwSDAoIUkFLMTEyMDAQDRILCgdOQU5PX0cxEA4SEgoOVExPUkFfVjJfMV8xUDgQDxIPCgtUTE9SQV9UM19TMxAQEhQKEE5BTk9fRzFfRVhQTE9SRVIQERIRCg1OQU5PX0cyX1VMVFJBEBISDQoJTE9SQV9UWVBFEBMSCwoHV0lQSE9ORRAUEg4KCldJT19XTTExMTAQFRILCgdSQUsyNTYwEBYSEwoPSEVMVEVDX0hSVV8zNjAxEBcSGgoWSEVMVEVDX1dJUkVMRVNTX0JSSURHRRAYEg4KClNUQVRJT05fRzEQGRIMCghSQUsxMTMxMBAaEhQKEFNFTlNFTE9SQV9SUDIwNDAQGxIQCgxTRU5TRUxPUkFfUzMQHBINCglDQU5BUllPTkUQHRIPCgtSUDIwNDBfTE9SQRAeEg4KClNUQVRJT05fRzIQHxIRCg1MT1JBX1JFTEFZX1YxECASDgoKTlJGNTI4NDBESxAhEgcKA1BQUhAiEg8KC0dFTklFQkxPQ0tTECMSEQoNTlJGNTJfVU5LTk9XThAkEg0KCVBPUlREVUlOTxAlEg8KC0FORFJPSURfU0lNECYSCgoGRElZX1YxECcSFQoRTlJGNTI4NDBfUENBMTAwNTkQKBIKCgZEUl9ERVYQKRILCgdNNVNUQUNLECoSDQoJSEVMVEVDX1YzECsSEQoNSEVMVEVDX1dTTF9WMxAsEhMKD0JFVEFGUFZfMjQwMF9UWBAtEhcKE0JFVEFGUFZfOTAwX05BTk9fVFgQLhIMCghSUElfUElDTxAvEhsKF0hFTFRFQ19XSVJFTEVTU19UUkFDS0VSEDASGQoVSEVMVEVDX1dJUkVMRVNTX1BBUEVSEDESCgoGVF9ERUNLEDISDgoKVF9XQVRDSF9TMxAzEhEKDVBJQ09NUFVURVJfUzMQNBIPCgtIRUxURUNfSFQ2MhA1EhIKDkVCWVRFX0VTUDMyX1MzEDYSEQoNRVNQMzJfUzNfUElDTxA3Eg0KCUNIQVRURVJfMhA4Eh4KGkhFTFRFQ19XSVJFTEVTU19QQVBFUl9WMV8wEDkSIAocSEVMVEVDX1dJUkVMRVNTX1RSQUNLRVJfVjFfMBA6EgsKB1VOUEhPTkUQOxIMCghURF9MT1JBQxA8EhMKD0NERUJZVEVfRU9SQV9TMxA9Eg8KC1RXQ19NRVNIX1Y0ED4SFgoSTlJGNTJfUFJPTUlDUk9fRElZED8SHwobUkFESU9NQVNURVJfOTAwX0JBTkRJVF9OQU5PEEASHAoYSEVMVEVDX0NBUFNVTEVfU0VOU09SX1YzEEESHQoZSEVMVEVDX1ZJU0lPTl9NQVNURVJfVDE5MBBCEh0KGUhFTFRFQ19WSVNJT05fTUFTVEVSX0UyMTMQQxIdChlIRUxURUNfVklTSU9OX01BU1RFUl9FMjkwEEQSGQoVSEVMVEVDX01FU0hfTk9ERV9UMTE0EEUSFgoSU0VOU0VDQVBfSU5ESUNBVE9SEEYSEwoPVFJBQ0tFUl9UMTAwMF9FEEcSCwoHUkFLMzE3MhBIEgoKBldJT19FNRBJEhoKFlJBRElPTUFTVEVSXzkwMF9CQU5ESVQQShITCg9NRTI1TFMwMV80WTEwVEQQSxIYChRSUDIwNDBfRkVBVEhFUl9SRk05NRBMEhUKEU01U1RBQ0tfQ09SRUJBU0lDEE0SEQoNTTVTVEFDS19DT1JFMhBOEg0KCVJQSV9QSUNPMhBPEhIKDk01U1RBQ0tfQ09SRVMzEFASEQoNU0VFRURfWElBT19TMxBREgsKB01TMjRTRjEQUhIMCghUTE9SQV9DNhBTEg8KClBSSVZBVEVfSFcQ/wEqLAoJQ29uc3RhbnRzEggKBFpFUk8QABIVChBEQVRBX1BBWUxPQURfTEVOEO0BKrQCChFDcml0aWNhbEVycm9yQ29kZRIICgROT05FEAASDwoLVFhfV0FUQ0hET0cQARIUChBTTEVFUF9FTlRFUl9XQUlUEAISDAoITk9fUkFESU8QAxIPCgtVTlNQRUNJRklFRBAEEhUKEVVCTE9YX1VOSVRfRkFJTEVEEAUSDQoJTk9fQVhQMTkyEAYSGQoVSU5WQUxJRF9SQURJT19TRVRUSU5HEAcSEwoPVFJBTlNNSVRfRkFJTEVEEAgSDAoIQlJPV05PVVQQCRISCg5TWDEyNjJfRkFJTFVSRRAKEhEKDVJBRElPX1NQSV9CVUcQCxIgChxGTEFTSF9DT1JSVVBUSU9OX1JFQ09WRVJBQkxFEAwSIgoeRkxBU0hfQ09SUlVQVElPTl9VTlJFQ09WRVJBQkxFEA1CXwoTY29tLmdlZWtzdmlsbGUubWVzaEIKTWVzaFByb3Rvc1oiZ2l0aHViLmNvbS9tZXNodGFzdGljL2dvL2dlbmVyYXRlZKoCFE1lc2h0YXN0aWMuUHJvdG9idWZzugIAYgZwcm90bzM", [
  file_channel,
  file_config,
  file_module_config,
  file_portnums,
  file_telemetry,
  file_xmodem,
  file_device_ui
]);
var PositionSchema = /* @__PURE__ */ messageDesc(file_mesh, 0);
var Position_LocSource;
(function(Position_LocSource2) {
  Position_LocSource2[Position_LocSource2["LOC_UNSET"] = 0] = "LOC_UNSET";
  Position_LocSource2[Position_LocSource2["LOC_MANUAL"] = 1] = "LOC_MANUAL";
  Position_LocSource2[Position_LocSource2["LOC_INTERNAL"] = 2] = "LOC_INTERNAL";
  Position_LocSource2[Position_LocSource2["LOC_EXTERNAL"] = 3] = "LOC_EXTERNAL";
})(Position_LocSource || (Position_LocSource = {}));
var Position_LocSourceSchema = /* @__PURE__ */ enumDesc(file_mesh, 0, 0);
var Position_AltSource;
(function(Position_AltSource2) {
  Position_AltSource2[Position_AltSource2["ALT_UNSET"] = 0] = "ALT_UNSET";
  Position_AltSource2[Position_AltSource2["ALT_MANUAL"] = 1] = "ALT_MANUAL";
  Position_AltSource2[Position_AltSource2["ALT_INTERNAL"] = 2] = "ALT_INTERNAL";
  Position_AltSource2[Position_AltSource2["ALT_EXTERNAL"] = 3] = "ALT_EXTERNAL";
  Position_AltSource2[Position_AltSource2["ALT_BAROMETRIC"] = 4] = "ALT_BAROMETRIC";
})(Position_AltSource || (Position_AltSource = {}));
var Position_AltSourceSchema = /* @__PURE__ */ enumDesc(file_mesh, 0, 1);
var UserSchema = /* @__PURE__ */ messageDesc(file_mesh, 1);
var RouteDiscoverySchema = /* @__PURE__ */ messageDesc(file_mesh, 2);
var RoutingSchema = /* @__PURE__ */ messageDesc(file_mesh, 3);
var Routing_Error;
(function(Routing_Error2) {
  Routing_Error2[Routing_Error2["NONE"] = 0] = "NONE";
  Routing_Error2[Routing_Error2["NO_ROUTE"] = 1] = "NO_ROUTE";
  Routing_Error2[Routing_Error2["GOT_NAK"] = 2] = "GOT_NAK";
  Routing_Error2[Routing_Error2["TIMEOUT"] = 3] = "TIMEOUT";
  Routing_Error2[Routing_Error2["NO_INTERFACE"] = 4] = "NO_INTERFACE";
  Routing_Error2[Routing_Error2["MAX_RETRANSMIT"] = 5] = "MAX_RETRANSMIT";
  Routing_Error2[Routing_Error2["NO_CHANNEL"] = 6] = "NO_CHANNEL";
  Routing_Error2[Routing_Error2["TOO_LARGE"] = 7] = "TOO_LARGE";
  Routing_Error2[Routing_Error2["NO_RESPONSE"] = 8] = "NO_RESPONSE";
  Routing_Error2[Routing_Error2["DUTY_CYCLE_LIMIT"] = 9] = "DUTY_CYCLE_LIMIT";
  Routing_Error2[Routing_Error2["BAD_REQUEST"] = 32] = "BAD_REQUEST";
  Routing_Error2[Routing_Error2["NOT_AUTHORIZED"] = 33] = "NOT_AUTHORIZED";
  Routing_Error2[Routing_Error2["PKI_FAILED"] = 34] = "PKI_FAILED";
  Routing_Error2[Routing_Error2["PKI_UNKNOWN_PUBKEY"] = 35] = "PKI_UNKNOWN_PUBKEY";
  Routing_Error2[Routing_Error2["ADMIN_BAD_SESSION_KEY"] = 36] = "ADMIN_BAD_SESSION_KEY";
  Routing_Error2[Routing_Error2["ADMIN_PUBLIC_KEY_UNAUTHORIZED"] = 37] = "ADMIN_PUBLIC_KEY_UNAUTHORIZED";
})(Routing_Error || (Routing_Error = {}));
var Routing_ErrorSchema = /* @__PURE__ */ enumDesc(file_mesh, 3, 0);
var DataSchema = /* @__PURE__ */ messageDesc(file_mesh, 4);
var WaypointSchema = /* @__PURE__ */ messageDesc(file_mesh, 5);
var MqttClientProxyMessageSchema = /* @__PURE__ */ messageDesc(file_mesh, 6);
var MeshPacketSchema = /* @__PURE__ */ messageDesc(file_mesh, 7);
var MeshPacket_Priority;
(function(MeshPacket_Priority2) {
  MeshPacket_Priority2[MeshPacket_Priority2["UNSET"] = 0] = "UNSET";
  MeshPacket_Priority2[MeshPacket_Priority2["MIN"] = 1] = "MIN";
  MeshPacket_Priority2[MeshPacket_Priority2["BACKGROUND"] = 10] = "BACKGROUND";
  MeshPacket_Priority2[MeshPacket_Priority2["DEFAULT"] = 64] = "DEFAULT";
  MeshPacket_Priority2[MeshPacket_Priority2["RELIABLE"] = 70] = "RELIABLE";
  MeshPacket_Priority2[MeshPacket_Priority2["RESPONSE"] = 80] = "RESPONSE";
  MeshPacket_Priority2[MeshPacket_Priority2["HIGH"] = 100] = "HIGH";
  MeshPacket_Priority2[MeshPacket_Priority2["ACK"] = 120] = "ACK";
  MeshPacket_Priority2[MeshPacket_Priority2["MAX"] = 127] = "MAX";
})(MeshPacket_Priority || (MeshPacket_Priority = {}));
var MeshPacket_PrioritySchema = /* @__PURE__ */ enumDesc(file_mesh, 7, 0);
var MeshPacket_Delayed;
(function(MeshPacket_Delayed2) {
  MeshPacket_Delayed2[MeshPacket_Delayed2["NO_DELAY"] = 0] = "NO_DELAY";
  MeshPacket_Delayed2[MeshPacket_Delayed2["DELAYED_BROADCAST"] = 1] = "DELAYED_BROADCAST";
  MeshPacket_Delayed2[MeshPacket_Delayed2["DELAYED_DIRECT"] = 2] = "DELAYED_DIRECT";
})(MeshPacket_Delayed || (MeshPacket_Delayed = {}));
var MeshPacket_DelayedSchema = /* @__PURE__ */ enumDesc(file_mesh, 7, 1);
var NodeInfoSchema = /* @__PURE__ */ messageDesc(file_mesh, 8);
var MyNodeInfoSchema = /* @__PURE__ */ messageDesc(file_mesh, 9);
var LogRecordSchema = /* @__PURE__ */ messageDesc(file_mesh, 10);
var LogRecord_Level;
(function(LogRecord_Level2) {
  LogRecord_Level2[LogRecord_Level2["UNSET"] = 0] = "UNSET";
  LogRecord_Level2[LogRecord_Level2["CRITICAL"] = 50] = "CRITICAL";
  LogRecord_Level2[LogRecord_Level2["ERROR"] = 40] = "ERROR";
  LogRecord_Level2[LogRecord_Level2["WARNING"] = 30] = "WARNING";
  LogRecord_Level2[LogRecord_Level2["INFO"] = 20] = "INFO";
  LogRecord_Level2[LogRecord_Level2["DEBUG"] = 10] = "DEBUG";
  LogRecord_Level2[LogRecord_Level2["TRACE"] = 5] = "TRACE";
})(LogRecord_Level || (LogRecord_Level = {}));
var LogRecord_LevelSchema = /* @__PURE__ */ enumDesc(file_mesh, 10, 0);
var QueueStatusSchema = /* @__PURE__ */ messageDesc(file_mesh, 11);
var FromRadioSchema = /* @__PURE__ */ messageDesc(file_mesh, 12);
var ClientNotificationSchema = /* @__PURE__ */ messageDesc(file_mesh, 13);
var FileInfoSchema = /* @__PURE__ */ messageDesc(file_mesh, 14);
var ToRadioSchema = /* @__PURE__ */ messageDesc(file_mesh, 15);
var CompressedSchema = /* @__PURE__ */ messageDesc(file_mesh, 16);
var NeighborInfoSchema = /* @__PURE__ */ messageDesc(file_mesh, 17);
var NeighborSchema = /* @__PURE__ */ messageDesc(file_mesh, 18);
var DeviceMetadataSchema = /* @__PURE__ */ messageDesc(file_mesh, 19);
var HeartbeatSchema = /* @__PURE__ */ messageDesc(file_mesh, 20);
var NodeRemoteHardwarePinSchema = /* @__PURE__ */ messageDesc(file_mesh, 21);
var ChunkedPayloadSchema = /* @__PURE__ */ messageDesc(file_mesh, 22);
var resend_chunksSchema = /* @__PURE__ */ messageDesc(file_mesh, 23);
var ChunkedPayloadResponseSchema = /* @__PURE__ */ messageDesc(file_mesh, 24);
var HardwareModel;
(function(HardwareModel2) {
  HardwareModel2[HardwareModel2["UNSET"] = 0] = "UNSET";
  HardwareModel2[HardwareModel2["TLORA_V2"] = 1] = "TLORA_V2";
  HardwareModel2[HardwareModel2["TLORA_V1"] = 2] = "TLORA_V1";
  HardwareModel2[HardwareModel2["TLORA_V2_1_1P6"] = 3] = "TLORA_V2_1_1P6";
  HardwareModel2[HardwareModel2["TBEAM"] = 4] = "TBEAM";
  HardwareModel2[HardwareModel2["HELTEC_V2_0"] = 5] = "HELTEC_V2_0";
  HardwareModel2[HardwareModel2["TBEAM_V0P7"] = 6] = "TBEAM_V0P7";
  HardwareModel2[HardwareModel2["T_ECHO"] = 7] = "T_ECHO";
  HardwareModel2[HardwareModel2["TLORA_V1_1P3"] = 8] = "TLORA_V1_1P3";
  HardwareModel2[HardwareModel2["RAK4631"] = 9] = "RAK4631";
  HardwareModel2[HardwareModel2["HELTEC_V2_1"] = 10] = "HELTEC_V2_1";
  HardwareModel2[HardwareModel2["HELTEC_V1"] = 11] = "HELTEC_V1";
  HardwareModel2[HardwareModel2["LILYGO_TBEAM_S3_CORE"] = 12] = "LILYGO_TBEAM_S3_CORE";
  HardwareModel2[HardwareModel2["RAK11200"] = 13] = "RAK11200";
  HardwareModel2[HardwareModel2["NANO_G1"] = 14] = "NANO_G1";
  HardwareModel2[HardwareModel2["TLORA_V2_1_1P8"] = 15] = "TLORA_V2_1_1P8";
  HardwareModel2[HardwareModel2["TLORA_T3_S3"] = 16] = "TLORA_T3_S3";
  HardwareModel2[HardwareModel2["NANO_G1_EXPLORER"] = 17] = "NANO_G1_EXPLORER";
  HardwareModel2[HardwareModel2["NANO_G2_ULTRA"] = 18] = "NANO_G2_ULTRA";
  HardwareModel2[HardwareModel2["LORA_TYPE"] = 19] = "LORA_TYPE";
  HardwareModel2[HardwareModel2["WIPHONE"] = 20] = "WIPHONE";
  HardwareModel2[HardwareModel2["WIO_WM1110"] = 21] = "WIO_WM1110";
  HardwareModel2[HardwareModel2["RAK2560"] = 22] = "RAK2560";
  HardwareModel2[HardwareModel2["HELTEC_HRU_3601"] = 23] = "HELTEC_HRU_3601";
  HardwareModel2[HardwareModel2["HELTEC_WIRELESS_BRIDGE"] = 24] = "HELTEC_WIRELESS_BRIDGE";
  HardwareModel2[HardwareModel2["STATION_G1"] = 25] = "STATION_G1";
  HardwareModel2[HardwareModel2["RAK11310"] = 26] = "RAK11310";
  HardwareModel2[HardwareModel2["SENSELORA_RP2040"] = 27] = "SENSELORA_RP2040";
  HardwareModel2[HardwareModel2["SENSELORA_S3"] = 28] = "SENSELORA_S3";
  HardwareModel2[HardwareModel2["CANARYONE"] = 29] = "CANARYONE";
  HardwareModel2[HardwareModel2["RP2040_LORA"] = 30] = "RP2040_LORA";
  HardwareModel2[HardwareModel2["STATION_G2"] = 31] = "STATION_G2";
  HardwareModel2[HardwareModel2["LORA_RELAY_V1"] = 32] = "LORA_RELAY_V1";
  HardwareModel2[HardwareModel2["NRF52840DK"] = 33] = "NRF52840DK";
  HardwareModel2[HardwareModel2["PPR"] = 34] = "PPR";
  HardwareModel2[HardwareModel2["GENIEBLOCKS"] = 35] = "GENIEBLOCKS";
  HardwareModel2[HardwareModel2["NRF52_UNKNOWN"] = 36] = "NRF52_UNKNOWN";
  HardwareModel2[HardwareModel2["PORTDUINO"] = 37] = "PORTDUINO";
  HardwareModel2[HardwareModel2["ANDROID_SIM"] = 38] = "ANDROID_SIM";
  HardwareModel2[HardwareModel2["DIY_V1"] = 39] = "DIY_V1";
  HardwareModel2[HardwareModel2["NRF52840_PCA10059"] = 40] = "NRF52840_PCA10059";
  HardwareModel2[HardwareModel2["DR_DEV"] = 41] = "DR_DEV";
  HardwareModel2[HardwareModel2["M5STACK"] = 42] = "M5STACK";
  HardwareModel2[HardwareModel2["HELTEC_V3"] = 43] = "HELTEC_V3";
  HardwareModel2[HardwareModel2["HELTEC_WSL_V3"] = 44] = "HELTEC_WSL_V3";
  HardwareModel2[HardwareModel2["BETAFPV_2400_TX"] = 45] = "BETAFPV_2400_TX";
  HardwareModel2[HardwareModel2["BETAFPV_900_NANO_TX"] = 46] = "BETAFPV_900_NANO_TX";
  HardwareModel2[HardwareModel2["RPI_PICO"] = 47] = "RPI_PICO";
  HardwareModel2[HardwareModel2["HELTEC_WIRELESS_TRACKER"] = 48] = "HELTEC_WIRELESS_TRACKER";
  HardwareModel2[HardwareModel2["HELTEC_WIRELESS_PAPER"] = 49] = "HELTEC_WIRELESS_PAPER";
  HardwareModel2[HardwareModel2["T_DECK"] = 50] = "T_DECK";
  HardwareModel2[HardwareModel2["T_WATCH_S3"] = 51] = "T_WATCH_S3";
  HardwareModel2[HardwareModel2["PICOMPUTER_S3"] = 52] = "PICOMPUTER_S3";
  HardwareModel2[HardwareModel2["HELTEC_HT62"] = 53] = "HELTEC_HT62";
  HardwareModel2[HardwareModel2["EBYTE_ESP32_S3"] = 54] = "EBYTE_ESP32_S3";
  HardwareModel2[HardwareModel2["ESP32_S3_PICO"] = 55] = "ESP32_S3_PICO";
  HardwareModel2[HardwareModel2["CHATTER_2"] = 56] = "CHATTER_2";
  HardwareModel2[HardwareModel2["HELTEC_WIRELESS_PAPER_V1_0"] = 57] = "HELTEC_WIRELESS_PAPER_V1_0";
  HardwareModel2[HardwareModel2["HELTEC_WIRELESS_TRACKER_V1_0"] = 58] = "HELTEC_WIRELESS_TRACKER_V1_0";
  HardwareModel2[HardwareModel2["UNPHONE"] = 59] = "UNPHONE";
  HardwareModel2[HardwareModel2["TD_LORAC"] = 60] = "TD_LORAC";
  HardwareModel2[HardwareModel2["CDEBYTE_EORA_S3"] = 61] = "CDEBYTE_EORA_S3";
  HardwareModel2[HardwareModel2["TWC_MESH_V4"] = 62] = "TWC_MESH_V4";
  HardwareModel2[HardwareModel2["NRF52_PROMICRO_DIY"] = 63] = "NRF52_PROMICRO_DIY";
  HardwareModel2[HardwareModel2["RADIOMASTER_900_BANDIT_NANO"] = 64] = "RADIOMASTER_900_BANDIT_NANO";
  HardwareModel2[HardwareModel2["HELTEC_CAPSULE_SENSOR_V3"] = 65] = "HELTEC_CAPSULE_SENSOR_V3";
  HardwareModel2[HardwareModel2["HELTEC_VISION_MASTER_T190"] = 66] = "HELTEC_VISION_MASTER_T190";
  HardwareModel2[HardwareModel2["HELTEC_VISION_MASTER_E213"] = 67] = "HELTEC_VISION_MASTER_E213";
  HardwareModel2[HardwareModel2["HELTEC_VISION_MASTER_E290"] = 68] = "HELTEC_VISION_MASTER_E290";
  HardwareModel2[HardwareModel2["HELTEC_MESH_NODE_T114"] = 69] = "HELTEC_MESH_NODE_T114";
  HardwareModel2[HardwareModel2["SENSECAP_INDICATOR"] = 70] = "SENSECAP_INDICATOR";
  HardwareModel2[HardwareModel2["TRACKER_T1000_E"] = 71] = "TRACKER_T1000_E";
  HardwareModel2[HardwareModel2["RAK3172"] = 72] = "RAK3172";
  HardwareModel2[HardwareModel2["WIO_E5"] = 73] = "WIO_E5";
  HardwareModel2[HardwareModel2["RADIOMASTER_900_BANDIT"] = 74] = "RADIOMASTER_900_BANDIT";
  HardwareModel2[HardwareModel2["ME25LS01_4Y10TD"] = 75] = "ME25LS01_4Y10TD";
  HardwareModel2[HardwareModel2["RP2040_FEATHER_RFM95"] = 76] = "RP2040_FEATHER_RFM95";
  HardwareModel2[HardwareModel2["M5STACK_COREBASIC"] = 77] = "M5STACK_COREBASIC";
  HardwareModel2[HardwareModel2["M5STACK_CORE2"] = 78] = "M5STACK_CORE2";
  HardwareModel2[HardwareModel2["RPI_PICO2"] = 79] = "RPI_PICO2";
  HardwareModel2[HardwareModel2["M5STACK_CORES3"] = 80] = "M5STACK_CORES3";
  HardwareModel2[HardwareModel2["SEEED_XIAO_S3"] = 81] = "SEEED_XIAO_S3";
  HardwareModel2[HardwareModel2["MS24SF1"] = 82] = "MS24SF1";
  HardwareModel2[HardwareModel2["TLORA_C6"] = 83] = "TLORA_C6";
  HardwareModel2[HardwareModel2["PRIVATE_HW"] = 255] = "PRIVATE_HW";
})(HardwareModel || (HardwareModel = {}));
var HardwareModelSchema = /* @__PURE__ */ enumDesc(file_mesh, 0);
var Constants2;
(function(Constants3) {
  Constants3[Constants3["ZERO"] = 0] = "ZERO";
  Constants3[Constants3["DATA_PAYLOAD_LEN"] = 237] = "DATA_PAYLOAD_LEN";
})(Constants2 || (Constants2 = {}));
var ConstantsSchema = /* @__PURE__ */ enumDesc(file_mesh, 1);
var CriticalErrorCode;
(function(CriticalErrorCode2) {
  CriticalErrorCode2[CriticalErrorCode2["NONE"] = 0] = "NONE";
  CriticalErrorCode2[CriticalErrorCode2["TX_WATCHDOG"] = 1] = "TX_WATCHDOG";
  CriticalErrorCode2[CriticalErrorCode2["SLEEP_ENTER_WAIT"] = 2] = "SLEEP_ENTER_WAIT";
  CriticalErrorCode2[CriticalErrorCode2["NO_RADIO"] = 3] = "NO_RADIO";
  CriticalErrorCode2[CriticalErrorCode2["UNSPECIFIED"] = 4] = "UNSPECIFIED";
  CriticalErrorCode2[CriticalErrorCode2["UBLOX_UNIT_FAILED"] = 5] = "UBLOX_UNIT_FAILED";
  CriticalErrorCode2[CriticalErrorCode2["NO_AXP192"] = 6] = "NO_AXP192";
  CriticalErrorCode2[CriticalErrorCode2["INVALID_RADIO_SETTING"] = 7] = "INVALID_RADIO_SETTING";
  CriticalErrorCode2[CriticalErrorCode2["TRANSMIT_FAILED"] = 8] = "TRANSMIT_FAILED";
  CriticalErrorCode2[CriticalErrorCode2["BROWNOUT"] = 9] = "BROWNOUT";
  CriticalErrorCode2[CriticalErrorCode2["SX1262_FAILURE"] = 10] = "SX1262_FAILURE";
  CriticalErrorCode2[CriticalErrorCode2["RADIO_SPI_BUG"] = 11] = "RADIO_SPI_BUG";
  CriticalErrorCode2[CriticalErrorCode2["FLASH_CORRUPTION_RECOVERABLE"] = 12] = "FLASH_CORRUPTION_RECOVERABLE";
  CriticalErrorCode2[CriticalErrorCode2["FLASH_CORRUPTION_UNRECOVERABLE"] = 13] = "FLASH_CORRUPTION_UNRECOVERABLE";
})(CriticalErrorCode || (CriticalErrorCode = {}));
var CriticalErrorCodeSchema = /* @__PURE__ */ enumDesc(file_mesh, 2);

// node_modules/@meshtastic/protobufs/lib/admin_pb.js
var file_admin = /* @__PURE__ */ fileDesc("CgthZG1pbi5wcm90bxIKbWVzaHRhc3RpYyKTFAoMQWRtaW5NZXNzYWdlEhcKD3Nlc3Npb25fcGFzc2tleRhlIAEoDBIdChNnZXRfY2hhbm5lbF9yZXF1ZXN0GAEgASgNSAASMwoUZ2V0X2NoYW5uZWxfcmVzcG9uc2UYAiABKAsyEy5tZXNodGFzdGljLkNoYW5uZWxIABIbChFnZXRfb3duZXJfcmVxdWVzdBgDIAEoCEgAEi4KEmdldF9vd25lcl9yZXNwb25zZRgEIAEoCzIQLm1lc2h0YXN0aWMuVXNlckgAEkEKEmdldF9jb25maWdfcmVxdWVzdBgFIAEoDjIjLm1lc2h0YXN0aWMuQWRtaW5NZXNzYWdlLkNvbmZpZ1R5cGVIABIxChNnZXRfY29uZmlnX3Jlc3BvbnNlGAYgASgLMhIubWVzaHRhc3RpYy5Db25maWdIABJOChlnZXRfbW9kdWxlX2NvbmZpZ19yZXF1ZXN0GAcgASgOMikubWVzaHRhc3RpYy5BZG1pbk1lc3NhZ2UuTW9kdWxlQ29uZmlnVHlwZUgAEj4KGmdldF9tb2R1bGVfY29uZmlnX3Jlc3BvbnNlGAggASgLMhgubWVzaHRhc3RpYy5Nb2R1bGVDb25maWdIABI0CipnZXRfY2FubmVkX21lc3NhZ2VfbW9kdWxlX21lc3NhZ2VzX3JlcXVlc3QYCiABKAhIABI1CitnZXRfY2FubmVkX21lc3NhZ2VfbW9kdWxlX21lc3NhZ2VzX3Jlc3BvbnNlGAsgASgJSAASJQobZ2V0X2RldmljZV9tZXRhZGF0YV9yZXF1ZXN0GAwgASgISAASQgocZ2V0X2RldmljZV9tZXRhZGF0YV9yZXNwb25zZRgNIAEoCzIaLm1lc2h0YXN0aWMuRGV2aWNlTWV0YWRhdGFIABIeChRnZXRfcmluZ3RvbmVfcmVxdWVzdBgOIAEoCEgAEh8KFWdldF9yaW5ndG9uZV9yZXNwb25zZRgPIAEoCUgAEi4KJGdldF9kZXZpY2VfY29ubmVjdGlvbl9zdGF0dXNfcmVxdWVzdBgQIAEoCEgAElMKJWdldF9kZXZpY2VfY29ubmVjdGlvbl9zdGF0dXNfcmVzcG9uc2UYESABKAsyIi5tZXNodGFzdGljLkRldmljZUNvbm5lY3Rpb25TdGF0dXNIABIxCgxzZXRfaGFtX21vZGUYEiABKAsyGS5tZXNodGFzdGljLkhhbVBhcmFtZXRlcnNIABIvCiVnZXRfbm9kZV9yZW1vdGVfaGFyZHdhcmVfcGluc19yZXF1ZXN0GBMgASgISAASXAomZ2V0X25vZGVfcmVtb3RlX2hhcmR3YXJlX3BpbnNfcmVzcG9uc2UYFCABKAsyKi5tZXNodGFzdGljLk5vZGVSZW1vdGVIYXJkd2FyZVBpbnNSZXNwb25zZUgAEiAKFmVudGVyX2RmdV9tb2RlX3JlcXVlc3QYFSABKAhIABIdChNkZWxldGVfZmlsZV9yZXF1ZXN0GBYgASgJSAASEwoJc2V0X3NjYWxlGBcgASgNSAASJQoJc2V0X293bmVyGCAgASgLMhAubWVzaHRhc3RpYy5Vc2VySAASKgoLc2V0X2NoYW5uZWwYISABKAsyEy5tZXNodGFzdGljLkNoYW5uZWxIABIoCgpzZXRfY29uZmlnGCIgASgLMhIubWVzaHRhc3RpYy5Db25maWdIABI1ChFzZXRfbW9kdWxlX2NvbmZpZxgjIAEoCzIYLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnSAASLAoic2V0X2Nhbm5lZF9tZXNzYWdlX21vZHVsZV9tZXNzYWdlcxgkIAEoCUgAEh4KFHNldF9yaW5ndG9uZV9tZXNzYWdlGCUgASgJSAASGwoRcmVtb3ZlX2J5X25vZGVudW0YJiABKA1IABIbChFzZXRfZmF2b3JpdGVfbm9kZRgnIAEoDUgAEh4KFHJlbW92ZV9mYXZvcml0ZV9ub2RlGCggASgNSAASMgoSc2V0X2ZpeGVkX3Bvc2l0aW9uGCkgASgLMhQubWVzaHRhc3RpYy5Qb3NpdGlvbkgAEh8KFXJlbW92ZV9maXhlZF9wb3NpdGlvbhgqIAEoCEgAEhcKDXNldF90aW1lX29ubHkYKyABKAdIABIfChVnZXRfdWlfY29uZmlnX3JlcXVlc3QYLCABKAhIABI8ChZnZXRfdWlfY29uZmlnX3Jlc3BvbnNlGC0gASgLMhoubWVzaHRhc3RpYy5EZXZpY2VVSUNvbmZpZ0gAEjUKD3N0b3JlX3VpX2NvbmZpZxguIAEoCzIaLm1lc2h0YXN0aWMuRGV2aWNlVUlDb25maWdIABIdChNiZWdpbl9lZGl0X3NldHRpbmdzGEAgASgISAASHgoUY29tbWl0X2VkaXRfc2V0dGluZ3MYQSABKAhIABIeChRmYWN0b3J5X3Jlc2V0X2RldmljZRheIAEoBUgAEhwKEnJlYm9vdF9vdGFfc2Vjb25kcxhfIAEoBUgAEhgKDmV4aXRfc2ltdWxhdG9yGGAgASgISAASGAoOcmVib290X3NlY29uZHMYYSABKAVIABIaChBzaHV0ZG93bl9zZWNvbmRzGGIgASgFSAASHgoUZmFjdG9yeV9yZXNldF9jb25maWcYYyABKAVIABIWCgxub2RlZGJfcmVzZXQYZCABKAVIACLWAQoKQ29uZmlnVHlwZRIRCg1ERVZJQ0VfQ09ORklHEAASEwoPUE9TSVRJT05fQ09ORklHEAESEAoMUE9XRVJfQ09ORklHEAISEgoOTkVUV09SS19DT05GSUcQAxISCg5ESVNQTEFZX0NPTkZJRxAEEg8KC0xPUkFfQ09ORklHEAUSFAoQQkxVRVRPT1RIX0NPTkZJRxAGEhMKD1NFQ1VSSVRZX0NPTkZJRxAHEhUKEVNFU1NJT05LRVlfQ09ORklHEAgSEwoPREVWSUNFVUlfQ09ORklHEAkiuwIKEE1vZHVsZUNvbmZpZ1R5cGUSDwoLTVFUVF9DT05GSUcQABIRCg1TRVJJQUxfQ09ORklHEAESEwoPRVhUTk9USUZfQ09ORklHEAISFwoTU1RPUkVGT1JXQVJEX0NPTkZJRxADEhQKEFJBTkdFVEVTVF9DT05GSUcQBBIUChBURUxFTUVUUllfQ09ORklHEAUSFAoQQ0FOTkVETVNHX0NPTkZJRxAGEhAKDEFVRElPX0NPTkZJRxAHEhkKFVJFTU9URUhBUkRXQVJFX0NPTkZJRxAIEhcKE05FSUdIQk9SSU5GT19DT05GSUcQCRIaChZBTUJJRU5UTElHSFRJTkdfQ09ORklHEAoSGgoWREVURUNUSU9OU0VOU09SX0NPTkZJRxALEhUKEVBBWENPVU5URVJfQ09ORklHEAxCEQoPcGF5bG9hZF92YXJpYW50IlsKDUhhbVBhcmFtZXRlcnMSEQoJY2FsbF9zaWduGAEgASgJEhAKCHR4X3Bvd2VyGAIgASgFEhEKCWZyZXF1ZW5jeRgDIAEoAhISCgpzaG9ydF9uYW1lGAQgASgJImYKHk5vZGVSZW1vdGVIYXJkd2FyZVBpbnNSZXNwb25zZRJEChlub2RlX3JlbW90ZV9oYXJkd2FyZV9waW5zGAEgAygLMiEubWVzaHRhc3RpYy5Ob2RlUmVtb3RlSGFyZHdhcmVQaW5CYAoTY29tLmdlZWtzdmlsbGUubWVzaEILQWRtaW5Qcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z", [
  file_channel,
  file_config,
  file_connection_status,
  file_mesh,
  file_module_config,
  file_device_ui
]);
var AdminMessageSchema = /* @__PURE__ */ messageDesc(file_admin, 0);
var AdminMessage_ConfigType;
(function(AdminMessage_ConfigType2) {
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["DEVICE_CONFIG"] = 0] = "DEVICE_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["POSITION_CONFIG"] = 1] = "POSITION_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["POWER_CONFIG"] = 2] = "POWER_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["NETWORK_CONFIG"] = 3] = "NETWORK_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["DISPLAY_CONFIG"] = 4] = "DISPLAY_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["LORA_CONFIG"] = 5] = "LORA_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["BLUETOOTH_CONFIG"] = 6] = "BLUETOOTH_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["SECURITY_CONFIG"] = 7] = "SECURITY_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["SESSIONKEY_CONFIG"] = 8] = "SESSIONKEY_CONFIG";
  AdminMessage_ConfigType2[AdminMessage_ConfigType2["DEVICEUI_CONFIG"] = 9] = "DEVICEUI_CONFIG";
})(AdminMessage_ConfigType || (AdminMessage_ConfigType = {}));
var AdminMessage_ConfigTypeSchema = /* @__PURE__ */ enumDesc(file_admin, 0, 0);
var AdminMessage_ModuleConfigType;
(function(AdminMessage_ModuleConfigType2) {
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["MQTT_CONFIG"] = 0] = "MQTT_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["SERIAL_CONFIG"] = 1] = "SERIAL_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["EXTNOTIF_CONFIG"] = 2] = "EXTNOTIF_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["STOREFORWARD_CONFIG"] = 3] = "STOREFORWARD_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["RANGETEST_CONFIG"] = 4] = "RANGETEST_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["TELEMETRY_CONFIG"] = 5] = "TELEMETRY_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["CANNEDMSG_CONFIG"] = 6] = "CANNEDMSG_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["AUDIO_CONFIG"] = 7] = "AUDIO_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["REMOTEHARDWARE_CONFIG"] = 8] = "REMOTEHARDWARE_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["NEIGHBORINFO_CONFIG"] = 9] = "NEIGHBORINFO_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["AMBIENTLIGHTING_CONFIG"] = 10] = "AMBIENTLIGHTING_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["DETECTIONSENSOR_CONFIG"] = 11] = "DETECTIONSENSOR_CONFIG";
  AdminMessage_ModuleConfigType2[AdminMessage_ModuleConfigType2["PAXCOUNTER_CONFIG"] = 12] = "PAXCOUNTER_CONFIG";
})(AdminMessage_ModuleConfigType || (AdminMessage_ModuleConfigType = {}));
var AdminMessage_ModuleConfigTypeSchema = /* @__PURE__ */ enumDesc(file_admin, 0, 1);
var HamParametersSchema = /* @__PURE__ */ messageDesc(file_admin, 1);
var NodeRemoteHardwarePinsResponseSchema = /* @__PURE__ */ messageDesc(file_admin, 2);

// node_modules/@meshtastic/protobufs/lib/apponly_pb.js
var apponly_pb_exports = {};
__export(apponly_pb_exports, {
  ChannelSetSchema: () => ChannelSetSchema,
  file_apponly: () => file_apponly
});
var file_apponly = /* @__PURE__ */ fileDesc("Cg1hcHBvbmx5LnByb3RvEgptZXNodGFzdGljIm8KCkNoYW5uZWxTZXQSLQoIc2V0dGluZ3MYASADKAsyGy5tZXNodGFzdGljLkNoYW5uZWxTZXR0aW5ncxIyCgtsb3JhX2NvbmZpZxgCIAEoCzIdLm1lc2h0YXN0aWMuQ29uZmlnLkxvUmFDb25maWdCYgoTY29tLmdlZWtzdmlsbGUubWVzaEINQXBwT25seVByb3Rvc1oiZ2l0aHViLmNvbS9tZXNodGFzdGljL2dvL2dlbmVyYXRlZKoCFE1lc2h0YXN0aWMuUHJvdG9idWZzugIAYgZwcm90bzM", [
  file_channel,
  file_config
]);
var ChannelSetSchema = /* @__PURE__ */ messageDesc(file_apponly, 0);

// node_modules/@meshtastic/protobufs/lib/atak_pb.js
var atak_pb_exports = {};
__export(atak_pb_exports, {
  ContactSchema: () => ContactSchema,
  GeoChatSchema: () => GeoChatSchema,
  GroupSchema: () => GroupSchema,
  MemberRole: () => MemberRole,
  MemberRoleSchema: () => MemberRoleSchema,
  PLISchema: () => PLISchema,
  StatusSchema: () => StatusSchema,
  TAKPacketSchema: () => TAKPacketSchema,
  Team: () => Team,
  TeamSchema: () => TeamSchema,
  file_atak: () => file_atak
});
var file_atak = /* @__PURE__ */ fileDesc("CgphdGFrLnByb3RvEgptZXNodGFzdGljIvgBCglUQUtQYWNrZXQSFQoNaXNfY29tcHJlc3NlZBgBIAEoCBIkCgdjb250YWN0GAIgASgLMhMubWVzaHRhc3RpYy5Db250YWN0EiAKBWdyb3VwGAMgASgLMhEubWVzaHRhc3RpYy5Hcm91cBIiCgZzdGF0dXMYBCABKAsyEi5tZXNodGFzdGljLlN0YXR1cxIeCgNwbGkYBSABKAsyDy5tZXNodGFzdGljLlBMSUgAEiMKBGNoYXQYBiABKAsyEy5tZXNodGFzdGljLkdlb0NoYXRIABIQCgZkZXRhaWwYByABKAxIAEIRCg9wYXlsb2FkX3ZhcmlhbnQiXAoHR2VvQ2hhdBIPCgdtZXNzYWdlGAEgASgJEg8KAnRvGAIgASgJSACIAQESGAoLdG9fY2FsbHNpZ24YAyABKAlIAYgBAUIFCgNfdG9CDgoMX3RvX2NhbGxzaWduIk0KBUdyb3VwEiQKBHJvbGUYASABKA4yFi5tZXNodGFzdGljLk1lbWJlclJvbGUSHgoEdGVhbRgCIAEoDjIQLm1lc2h0YXN0aWMuVGVhbSIZCgZTdGF0dXMSDwoHYmF0dGVyeRgBIAEoDSI0CgdDb250YWN0EhAKCGNhbGxzaWduGAEgASgJEhcKD2RldmljZV9jYWxsc2lnbhgCIAEoCSJfCgNQTEkSEgoKbGF0aXR1ZGVfaRgBIAEoDxITCgtsb25naXR1ZGVfaRgCIAEoDxIQCghhbHRpdHVkZRgDIAEoBRINCgVzcGVlZBgEIAEoDRIOCgZjb3Vyc2UYBSABKA0qwAEKBFRlYW0SFAoQVW5zcGVjaWZlZF9Db2xvchAAEgkKBVdoaXRlEAESCgoGWWVsbG93EAISCgoGT3JhbmdlEAMSCwoHTWFnZW50YRAEEgcKA1JlZBAFEgoKBk1hcm9vbhAGEgoKBlB1cnBsZRAHEg0KCURhcmtfQmx1ZRAIEggKBEJsdWUQCRIICgRDeWFuEAoSCAoEVGVhbBALEgkKBUdyZWVuEAwSDgoKRGFya19HcmVlbhANEgkKBUJyb3duEA4qfwoKTWVtYmVyUm9sZRIOCgpVbnNwZWNpZmVkEAASDgoKVGVhbU1lbWJlchABEgwKCFRlYW1MZWFkEAISBgoCSFEQAxIKCgZTbmlwZXIQBBIJCgVNZWRpYxAFEhMKD0ZvcndhcmRPYnNlcnZlchAGEgcKA1JUTxAHEgYKAks5EAhCXwoTY29tLmdlZWtzdmlsbGUubWVzaEIKQVRBS1Byb3Rvc1oiZ2l0aHViLmNvbS9tZXNodGFzdGljL2dvL2dlbmVyYXRlZKoCFE1lc2h0YXN0aWMuUHJvdG9idWZzugIAYgZwcm90bzM");
var TAKPacketSchema = /* @__PURE__ */ messageDesc(file_atak, 0);
var GeoChatSchema = /* @__PURE__ */ messageDesc(file_atak, 1);
var GroupSchema = /* @__PURE__ */ messageDesc(file_atak, 2);
var StatusSchema = /* @__PURE__ */ messageDesc(file_atak, 3);
var ContactSchema = /* @__PURE__ */ messageDesc(file_atak, 4);
var PLISchema = /* @__PURE__ */ messageDesc(file_atak, 5);
var Team;
(function(Team2) {
  Team2[Team2["Unspecifed_Color"] = 0] = "Unspecifed_Color";
  Team2[Team2["White"] = 1] = "White";
  Team2[Team2["Yellow"] = 2] = "Yellow";
  Team2[Team2["Orange"] = 3] = "Orange";
  Team2[Team2["Magenta"] = 4] = "Magenta";
  Team2[Team2["Red"] = 5] = "Red";
  Team2[Team2["Maroon"] = 6] = "Maroon";
  Team2[Team2["Purple"] = 7] = "Purple";
  Team2[Team2["Dark_Blue"] = 8] = "Dark_Blue";
  Team2[Team2["Blue"] = 9] = "Blue";
  Team2[Team2["Cyan"] = 10] = "Cyan";
  Team2[Team2["Teal"] = 11] = "Teal";
  Team2[Team2["Green"] = 12] = "Green";
  Team2[Team2["Dark_Green"] = 13] = "Dark_Green";
  Team2[Team2["Brown"] = 14] = "Brown";
})(Team || (Team = {}));
var TeamSchema = /* @__PURE__ */ enumDesc(file_atak, 0);
var MemberRole;
(function(MemberRole2) {
  MemberRole2[MemberRole2["Unspecifed"] = 0] = "Unspecifed";
  MemberRole2[MemberRole2["TeamMember"] = 1] = "TeamMember";
  MemberRole2[MemberRole2["TeamLead"] = 2] = "TeamLead";
  MemberRole2[MemberRole2["HQ"] = 3] = "HQ";
  MemberRole2[MemberRole2["Sniper"] = 4] = "Sniper";
  MemberRole2[MemberRole2["Medic"] = 5] = "Medic";
  MemberRole2[MemberRole2["ForwardObserver"] = 6] = "ForwardObserver";
  MemberRole2[MemberRole2["RTO"] = 7] = "RTO";
  MemberRole2[MemberRole2["K9"] = 8] = "K9";
})(MemberRole || (MemberRole = {}));
var MemberRoleSchema = /* @__PURE__ */ enumDesc(file_atak, 1);

// node_modules/@meshtastic/protobufs/lib/cannedmessages_pb.js
var cannedmessages_pb_exports = {};
__export(cannedmessages_pb_exports, {
  CannedMessageModuleConfigSchema: () => CannedMessageModuleConfigSchema,
  file_cannedmessages: () => file_cannedmessages
});
var file_cannedmessages = /* @__PURE__ */ fileDesc("ChRjYW5uZWRtZXNzYWdlcy5wcm90bxIKbWVzaHRhc3RpYyItChlDYW5uZWRNZXNzYWdlTW9kdWxlQ29uZmlnEhAKCG1lc3NhZ2VzGAEgASgJQm4KE2NvbS5nZWVrc3ZpbGxlLm1lc2hCGUNhbm5lZE1lc3NhZ2VDb25maWdQcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z");
var CannedMessageModuleConfigSchema = /* @__PURE__ */ messageDesc(file_cannedmessages, 0);

// node_modules/@meshtastic/protobufs/lib/clientonly_pb.js
var clientonly_pb_exports = {};
__export(clientonly_pb_exports, {
  DeviceProfileSchema: () => DeviceProfileSchema,
  file_clientonly: () => file_clientonly
});

// node_modules/@meshtastic/protobufs/lib/localonly_pb.js
var localonly_pb_exports = {};
__export(localonly_pb_exports, {
  LocalConfigSchema: () => LocalConfigSchema,
  LocalModuleConfigSchema: () => LocalModuleConfigSchema,
  file_localonly: () => file_localonly
});
var file_localonly = /* @__PURE__ */ fileDesc("Cg9sb2NhbG9ubHkucHJvdG8SCm1lc2h0YXN0aWMisgMKC0xvY2FsQ29uZmlnEi8KBmRldmljZRgBIAEoCzIfLm1lc2h0YXN0aWMuQ29uZmlnLkRldmljZUNvbmZpZxIzCghwb3NpdGlvbhgCIAEoCzIhLm1lc2h0YXN0aWMuQ29uZmlnLlBvc2l0aW9uQ29uZmlnEi0KBXBvd2VyGAMgASgLMh4ubWVzaHRhc3RpYy5Db25maWcuUG93ZXJDb25maWcSMQoHbmV0d29yaxgEIAEoCzIgLm1lc2h0YXN0aWMuQ29uZmlnLk5ldHdvcmtDb25maWcSMQoHZGlzcGxheRgFIAEoCzIgLm1lc2h0YXN0aWMuQ29uZmlnLkRpc3BsYXlDb25maWcSKwoEbG9yYRgGIAEoCzIdLm1lc2h0YXN0aWMuQ29uZmlnLkxvUmFDb25maWcSNQoJYmx1ZXRvb3RoGAcgASgLMiIubWVzaHRhc3RpYy5Db25maWcuQmx1ZXRvb3RoQ29uZmlnEg8KB3ZlcnNpb24YCCABKA0SMwoIc2VjdXJpdHkYCSABKAsyIS5tZXNodGFzdGljLkNvbmZpZy5TZWN1cml0eUNvbmZpZyL7BgoRTG9jYWxNb2R1bGVDb25maWcSMQoEbXF0dBgBIAEoCzIjLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLk1RVFRDb25maWcSNQoGc2VyaWFsGAIgASgLMiUubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuU2VyaWFsQ29uZmlnElIKFWV4dGVybmFsX25vdGlmaWNhdGlvbhgDIAEoCzIzLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLkV4dGVybmFsTm90aWZpY2F0aW9uQ29uZmlnEkIKDXN0b3JlX2ZvcndhcmQYBCABKAsyKy5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5TdG9yZUZvcndhcmRDb25maWcSPAoKcmFuZ2VfdGVzdBgFIAEoCzIoLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLlJhbmdlVGVzdENvbmZpZxI7Cgl0ZWxlbWV0cnkYBiABKAsyKC5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5UZWxlbWV0cnlDb25maWcSRAoOY2FubmVkX21lc3NhZ2UYByABKAsyLC5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5DYW5uZWRNZXNzYWdlQ29uZmlnEjMKBWF1ZGlvGAkgASgLMiQubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuQXVkaW9Db25maWcSRgoPcmVtb3RlX2hhcmR3YXJlGAogASgLMi0ubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuUmVtb3RlSGFyZHdhcmVDb25maWcSQgoNbmVpZ2hib3JfaW5mbxgLIAEoCzIrLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLk5laWdoYm9ySW5mb0NvbmZpZxJIChBhbWJpZW50X2xpZ2h0aW5nGAwgASgLMi4ubWVzaHRhc3RpYy5Nb2R1bGVDb25maWcuQW1iaWVudExpZ2h0aW5nQ29uZmlnEkgKEGRldGVjdGlvbl9zZW5zb3IYDSABKAsyLi5tZXNodGFzdGljLk1vZHVsZUNvbmZpZy5EZXRlY3Rpb25TZW5zb3JDb25maWcSPQoKcGF4Y291bnRlchgOIAEoCzIpLm1lc2h0YXN0aWMuTW9kdWxlQ29uZmlnLlBheGNvdW50ZXJDb25maWcSDwoHdmVyc2lvbhgIIAEoDUJkChNjb20uZ2Vla3N2aWxsZS5tZXNoQg9Mb2NhbE9ubHlQcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z", [
  file_config,
  file_module_config
]);
var LocalConfigSchema = /* @__PURE__ */ messageDesc(file_localonly, 0);
var LocalModuleConfigSchema = /* @__PURE__ */ messageDesc(file_localonly, 1);

// node_modules/@meshtastic/protobufs/lib/clientonly_pb.js
var file_clientonly = /* @__PURE__ */ fileDesc("ChBjbGllbnRvbmx5LnByb3RvEgptZXNodGFzdGljIqkDCg1EZXZpY2VQcm9maWxlEhYKCWxvbmdfbmFtZRgBIAEoCUgAiAEBEhcKCnNob3J0X25hbWUYAiABKAlIAYgBARIYCgtjaGFubmVsX3VybBgDIAEoCUgCiAEBEiwKBmNvbmZpZxgEIAEoCzIXLm1lc2h0YXN0aWMuTG9jYWxDb25maWdIA4gBARI5Cg1tb2R1bGVfY29uZmlnGAUgASgLMh0ubWVzaHRhc3RpYy5Mb2NhbE1vZHVsZUNvbmZpZ0gEiAEBEjEKDmZpeGVkX3Bvc2l0aW9uGAYgASgLMhQubWVzaHRhc3RpYy5Qb3NpdGlvbkgFiAEBEhUKCHJpbmd0b25lGAcgASgJSAaIAQESHAoPY2FubmVkX21lc3NhZ2VzGAggASgJSAeIAQFCDAoKX2xvbmdfbmFtZUINCgtfc2hvcnRfbmFtZUIOCgxfY2hhbm5lbF91cmxCCQoHX2NvbmZpZ0IQCg5fbW9kdWxlX2NvbmZpZ0IRCg9fZml4ZWRfcG9zaXRpb25CCwoJX3Jpbmd0b25lQhIKEF9jYW5uZWRfbWVzc2FnZXNCZQoTY29tLmdlZWtzdmlsbGUubWVzaEIQQ2xpZW50T25seVByb3Rvc1oiZ2l0aHViLmNvbS9tZXNodGFzdGljL2dvL2dlbmVyYXRlZKoCFE1lc2h0YXN0aWMuUHJvdG9idWZzugIAYgZwcm90bzM", [
  file_localonly,
  file_mesh
]);
var DeviceProfileSchema = /* @__PURE__ */ messageDesc(file_clientonly, 0);

// node_modules/@meshtastic/protobufs/lib/mqtt_pb.js
var mqtt_pb_exports = {};
__export(mqtt_pb_exports, {
  MapReportSchema: () => MapReportSchema,
  ServiceEnvelopeSchema: () => ServiceEnvelopeSchema,
  file_mqtt: () => file_mqtt
});
var file_mqtt = /* @__PURE__ */ fileDesc("CgptcXR0LnByb3RvEgptZXNodGFzdGljImEKD1NlcnZpY2VFbnZlbG9wZRImCgZwYWNrZXQYASABKAsyFi5tZXNodGFzdGljLk1lc2hQYWNrZXQSEgoKY2hhbm5lbF9pZBgCIAEoCRISCgpnYXRld2F5X2lkGAMgASgJIrwDCglNYXBSZXBvcnQSEQoJbG9uZ19uYW1lGAEgASgJEhIKCnNob3J0X25hbWUYAiABKAkSMgoEcm9sZRgDIAEoDjIkLm1lc2h0YXN0aWMuQ29uZmlnLkRldmljZUNvbmZpZy5Sb2xlEisKCGh3X21vZGVsGAQgASgOMhkubWVzaHRhc3RpYy5IYXJkd2FyZU1vZGVsEhgKEGZpcm13YXJlX3ZlcnNpb24YBSABKAkSOAoGcmVnaW9uGAYgASgOMigubWVzaHRhc3RpYy5Db25maWcuTG9SYUNvbmZpZy5SZWdpb25Db2RlEj8KDG1vZGVtX3ByZXNldBgHIAEoDjIpLm1lc2h0YXN0aWMuQ29uZmlnLkxvUmFDb25maWcuTW9kZW1QcmVzZXQSGwoTaGFzX2RlZmF1bHRfY2hhbm5lbBgIIAEoCBISCgpsYXRpdHVkZV9pGAkgASgPEhMKC2xvbmdpdHVkZV9pGAogASgPEhAKCGFsdGl0dWRlGAsgASgFEhoKEnBvc2l0aW9uX3ByZWNpc2lvbhgMIAEoDRIeChZudW1fb25saW5lX2xvY2FsX25vZGVzGA0gASgNQl8KE2NvbS5nZWVrc3ZpbGxlLm1lc2hCCk1RVFRQcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z", [
  file_config,
  file_mesh
]);
var ServiceEnvelopeSchema = /* @__PURE__ */ messageDesc(file_mqtt, 0);
var MapReportSchema = /* @__PURE__ */ messageDesc(file_mqtt, 1);

// node_modules/@meshtastic/protobufs/lib/paxcount_pb.js
var paxcount_pb_exports = {};
__export(paxcount_pb_exports, {
  PaxcountSchema: () => PaxcountSchema,
  file_paxcount: () => file_paxcount
});
var file_paxcount = /* @__PURE__ */ fileDesc("Cg5wYXhjb3VudC5wcm90bxIKbWVzaHRhc3RpYyI1CghQYXhjb3VudBIMCgR3aWZpGAEgASgNEgsKA2JsZRgCIAEoDRIOCgZ1cHRpbWUYAyABKA1CYwoTY29tLmdlZWtzdmlsbGUubWVzaEIOUGF4Y291bnRQcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z");
var PaxcountSchema = /* @__PURE__ */ messageDesc(file_paxcount, 0);

// node_modules/@meshtastic/protobufs/lib/powermon_pb.js
var powermon_pb_exports = {};
__export(powermon_pb_exports, {
  PowerMonSchema: () => PowerMonSchema,
  PowerMon_State: () => PowerMon_State,
  PowerMon_StateSchema: () => PowerMon_StateSchema,
  PowerStressMessageSchema: () => PowerStressMessageSchema,
  PowerStressMessage_Opcode: () => PowerStressMessage_Opcode,
  PowerStressMessage_OpcodeSchema: () => PowerStressMessage_OpcodeSchema,
  file_powermon: () => file_powermon
});
var file_powermon = /* @__PURE__ */ fileDesc("Cg5wb3dlcm1vbi5wcm90bxIKbWVzaHRhc3RpYyLgAQoIUG93ZXJNb24i0wEKBVN0YXRlEggKBE5vbmUQABIRCg1DUFVfRGVlcFNsZWVwEAESEgoOQ1BVX0xpZ2h0U2xlZXAQAhIMCghWZXh0MV9PbhAEEg0KCUxvcmFfUlhPbhAIEg0KCUxvcmFfVFhPbhAQEhEKDUxvcmFfUlhBY3RpdmUQIBIJCgVCVF9PbhBAEgsKBkxFRF9PbhCAARIOCglTY3JlZW5fT24QgAISEwoOU2NyZWVuX0RyYXdpbmcQgAQSDAoHV2lmaV9PbhCACBIPCgpHUFNfQWN0aXZlEIAQIv8CChJQb3dlclN0cmVzc01lc3NhZ2USMgoDY21kGAEgASgOMiUubWVzaHRhc3RpYy5Qb3dlclN0cmVzc01lc3NhZ2UuT3Bjb2RlEhMKC251bV9zZWNvbmRzGAIgASgCIp8CCgZPcGNvZGUSCQoFVU5TRVQQABIOCgpQUklOVF9JTkZPEAESDwoLRk9SQ0VfUVVJRVQQAhINCglFTkRfUVVJRVQQAxINCglTQ1JFRU5fT04QEBIOCgpTQ1JFRU5fT0ZGEBESDAoIQ1BVX0lETEUQIBIRCg1DUFVfREVFUFNMRUVQECESDgoKQ1BVX0ZVTExPThAiEgoKBkxFRF9PThAwEgsKB0xFRF9PRkYQMRIMCghMT1JBX09GRhBAEgsKB0xPUkFfVFgQQRILCgdMT1JBX1JYEEISCgoGQlRfT0ZGEFASCQoFQlRfT04QURIMCghXSUZJX09GRhBgEgsKB1dJRklfT04QYRILCgdHUFNfT0ZGEHASCgoGR1BTX09OEHFCYwoTY29tLmdlZWtzdmlsbGUubWVzaEIOUG93ZXJNb25Qcm90b3NaImdpdGh1Yi5jb20vbWVzaHRhc3RpYy9nby9nZW5lcmF0ZWSqAhRNZXNodGFzdGljLlByb3RvYnVmc7oCAGIGcHJvdG8z");
var PowerMonSchema = /* @__PURE__ */ messageDesc(file_powermon, 0);
var PowerMon_State;
(function(PowerMon_State2) {
  PowerMon_State2[PowerMon_State2["None"] = 0] = "None";
  PowerMon_State2[PowerMon_State2["CPU_DeepSleep"] = 1] = "CPU_DeepSleep";
  PowerMon_State2[PowerMon_State2["CPU_LightSleep"] = 2] = "CPU_LightSleep";
  PowerMon_State2[PowerMon_State2["Vext1_On"] = 4] = "Vext1_On";
  PowerMon_State2[PowerMon_State2["Lora_RXOn"] = 8] = "Lora_RXOn";
  PowerMon_State2[PowerMon_State2["Lora_TXOn"] = 16] = "Lora_TXOn";
  PowerMon_State2[PowerMon_State2["Lora_RXActive"] = 32] = "Lora_RXActive";
  PowerMon_State2[PowerMon_State2["BT_On"] = 64] = "BT_On";
  PowerMon_State2[PowerMon_State2["LED_On"] = 128] = "LED_On";
  PowerMon_State2[PowerMon_State2["Screen_On"] = 256] = "Screen_On";
  PowerMon_State2[PowerMon_State2["Screen_Drawing"] = 512] = "Screen_Drawing";
  PowerMon_State2[PowerMon_State2["Wifi_On"] = 1024] = "Wifi_On";
  PowerMon_State2[PowerMon_State2["GPS_Active"] = 2048] = "GPS_Active";
})(PowerMon_State || (PowerMon_State = {}));
var PowerMon_StateSchema = /* @__PURE__ */ enumDesc(file_powermon, 0, 0);
var PowerStressMessageSchema = /* @__PURE__ */ messageDesc(file_powermon, 1);
var PowerStressMessage_Opcode;
(function(PowerStressMessage_Opcode2) {
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["UNSET"] = 0] = "UNSET";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["PRINT_INFO"] = 1] = "PRINT_INFO";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["FORCE_QUIET"] = 2] = "FORCE_QUIET";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["END_QUIET"] = 3] = "END_QUIET";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["SCREEN_ON"] = 16] = "SCREEN_ON";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["SCREEN_OFF"] = 17] = "SCREEN_OFF";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["CPU_IDLE"] = 32] = "CPU_IDLE";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["CPU_DEEPSLEEP"] = 33] = "CPU_DEEPSLEEP";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["CPU_FULLON"] = 34] = "CPU_FULLON";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["LED_ON"] = 48] = "LED_ON";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["LED_OFF"] = 49] = "LED_OFF";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["LORA_OFF"] = 64] = "LORA_OFF";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["LORA_TX"] = 65] = "LORA_TX";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["LORA_RX"] = 66] = "LORA_RX";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["BT_OFF"] = 80] = "BT_OFF";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["BT_ON"] = 81] = "BT_ON";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["WIFI_OFF"] = 96] = "WIFI_OFF";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["WIFI_ON"] = 97] = "WIFI_ON";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["GPS_OFF"] = 112] = "GPS_OFF";
  PowerStressMessage_Opcode2[PowerStressMessage_Opcode2["GPS_ON"] = 113] = "GPS_ON";
})(PowerStressMessage_Opcode || (PowerStressMessage_Opcode = {}));
var PowerStressMessage_OpcodeSchema = /* @__PURE__ */ enumDesc(file_powermon, 1, 0);

// node_modules/@meshtastic/protobufs/lib/remote_hardware_pb.js
var remote_hardware_pb_exports = {};
__export(remote_hardware_pb_exports, {
  HardwareMessageSchema: () => HardwareMessageSchema,
  HardwareMessage_Type: () => HardwareMessage_Type,
  HardwareMessage_TypeSchema: () => HardwareMessage_TypeSchema,
  file_remote_hardware: () => file_remote_hardware
});
var file_remote_hardware = /* @__PURE__ */ fileDesc("ChVyZW1vdGVfaGFyZHdhcmUucHJvdG8SCm1lc2h0YXN0aWMi1gEKD0hhcmR3YXJlTWVzc2FnZRIuCgR0eXBlGAEgASgOMiAubWVzaHRhc3RpYy5IYXJkd2FyZU1lc3NhZ2UuVHlwZRIRCglncGlvX21hc2sYAiABKAQSEgoKZ3Bpb192YWx1ZRgDIAEoBCJsCgRUeXBlEgkKBVVOU0VUEAASDwoLV1JJVEVfR1BJT1MQARIPCgtXQVRDSF9HUElPUxACEhEKDUdQSU9TX0NIQU5HRUQQAxIOCgpSRUFEX0dQSU9TEAQSFAoQUkVBRF9HUElPU19SRVBMWRAFQmMKE2NvbS5nZWVrc3ZpbGxlLm1lc2hCDlJlbW90ZUhhcmR3YXJlWiJnaXRodWIuY29tL21lc2h0YXN0aWMvZ28vZ2VuZXJhdGVkqgIUTWVzaHRhc3RpYy5Qcm90b2J1ZnO6AgBiBnByb3RvMw");
var HardwareMessageSchema = /* @__PURE__ */ messageDesc(file_remote_hardware, 0);
var HardwareMessage_Type;
(function(HardwareMessage_Type2) {
  HardwareMessage_Type2[HardwareMessage_Type2["UNSET"] = 0] = "UNSET";
  HardwareMessage_Type2[HardwareMessage_Type2["WRITE_GPIOS"] = 1] = "WRITE_GPIOS";
  HardwareMessage_Type2[HardwareMessage_Type2["WATCH_GPIOS"] = 2] = "WATCH_GPIOS";
  HardwareMessage_Type2[HardwareMessage_Type2["GPIOS_CHANGED"] = 3] = "GPIOS_CHANGED";
  HardwareMessage_Type2[HardwareMessage_Type2["READ_GPIOS"] = 4] = "READ_GPIOS";
  HardwareMessage_Type2[HardwareMessage_Type2["READ_GPIOS_REPLY"] = 5] = "READ_GPIOS_REPLY";
})(HardwareMessage_Type || (HardwareMessage_Type = {}));
var HardwareMessage_TypeSchema = /* @__PURE__ */ enumDesc(file_remote_hardware, 0, 0);

// node_modules/@meshtastic/protobufs/lib/rtttl_pb.js
var rtttl_pb_exports = {};
__export(rtttl_pb_exports, {
  RTTTLConfigSchema: () => RTTTLConfigSchema,
  file_rtttl: () => file_rtttl
});
var file_rtttl = /* @__PURE__ */ fileDesc("CgtydHR0bC5wcm90bxIKbWVzaHRhc3RpYyIfCgtSVFRUTENvbmZpZxIQCghyaW5ndG9uZRgBIAEoCUJmChNjb20uZ2Vla3N2aWxsZS5tZXNoQhFSVFRUTENvbmZpZ1Byb3Rvc1oiZ2l0aHViLmNvbS9tZXNodGFzdGljL2dvL2dlbmVyYXRlZKoCFE1lc2h0YXN0aWMuUHJvdG9idWZzugIAYgZwcm90bzM");
var RTTTLConfigSchema = /* @__PURE__ */ messageDesc(file_rtttl, 0);

// node_modules/@meshtastic/protobufs/lib/storeforward_pb.js
var storeforward_pb_exports = {};
__export(storeforward_pb_exports, {
  StoreAndForwardSchema: () => StoreAndForwardSchema,
  StoreAndForward_HeartbeatSchema: () => StoreAndForward_HeartbeatSchema,
  StoreAndForward_HistorySchema: () => StoreAndForward_HistorySchema,
  StoreAndForward_RequestResponse: () => StoreAndForward_RequestResponse,
  StoreAndForward_RequestResponseSchema: () => StoreAndForward_RequestResponseSchema,
  StoreAndForward_StatisticsSchema: () => StoreAndForward_StatisticsSchema,
  file_storeforward: () => file_storeforward
});
var file_storeforward = /* @__PURE__ */ fileDesc("ChJzdG9yZWZvcndhcmQucHJvdG8SCm1lc2h0YXN0aWMinAcKD1N0b3JlQW5kRm9yd2FyZBI3CgJychgBIAEoDjIrLm1lc2h0YXN0aWMuU3RvcmVBbmRGb3J3YXJkLlJlcXVlc3RSZXNwb25zZRI3CgVzdGF0cxgCIAEoCzImLm1lc2h0YXN0aWMuU3RvcmVBbmRGb3J3YXJkLlN0YXRpc3RpY3NIABI2CgdoaXN0b3J5GAMgASgLMiMubWVzaHRhc3RpYy5TdG9yZUFuZEZvcndhcmQuSGlzdG9yeUgAEjoKCWhlYXJ0YmVhdBgEIAEoCzIlLm1lc2h0YXN0aWMuU3RvcmVBbmRGb3J3YXJkLkhlYXJ0YmVhdEgAEg4KBHRleHQYBSABKAxIABrNAQoKU3RhdGlzdGljcxIWCg5tZXNzYWdlc190b3RhbBgBIAEoDRIWCg5tZXNzYWdlc19zYXZlZBgCIAEoDRIUCgxtZXNzYWdlc19tYXgYAyABKA0SDwoHdXBfdGltZRgEIAEoDRIQCghyZXF1ZXN0cxgFIAEoDRIYChByZXF1ZXN0c19oaXN0b3J5GAYgASgNEhEKCWhlYXJ0YmVhdBgHIAEoCBISCgpyZXR1cm5fbWF4GAggASgNEhUKDXJldHVybl93aW5kb3cYCSABKA0aSQoHSGlzdG9yeRIYChBoaXN0b3J5X21lc3NhZ2VzGAEgASgNEg4KBndpbmRvdxgCIAEoDRIUCgxsYXN0X3JlcXVlc3QYAyABKA0aLgoJSGVhcnRiZWF0Eg4KBnBlcmlvZBgBIAEoDRIRCglzZWNvbmRhcnkYAiABKA0ivAIKD1JlcXVlc3RSZXNwb25zZRIJCgVVTlNFVBAAEhAKDFJPVVRFUl9FUlJPUhABEhQKEFJPVVRFUl9IRUFSVEJFQVQQAhIPCgtST1VURVJfUElORxADEg8KC1JPVVRFUl9QT05HEAQSDwoLUk9VVEVSX0JVU1kQBRISCg5ST1VURVJfSElTVE9SWRAGEhAKDFJPVVRFUl9TVEFUUxAHEhYKElJPVVRFUl9URVhUX0RJUkVDVBAIEhkKFVJPVVRFUl9URVhUX0JST0FEQ0FTVBAJEhAKDENMSUVOVF9FUlJPUhBAEhIKDkNMSUVOVF9ISVNUT1JZEEESEAoMQ0xJRU5UX1NUQVRTEEISDwoLQ0xJRU5UX1BJTkcQQxIPCgtDTElFTlRfUE9ORxBEEhAKDENMSUVOVF9BQk9SVBBqQgkKB3ZhcmlhbnRCagoTY29tLmdlZWtzdmlsbGUubWVzaEIVU3RvcmVBbmRGb3J3YXJkUHJvdG9zWiJnaXRodWIuY29tL21lc2h0YXN0aWMvZ28vZ2VuZXJhdGVkqgIUTWVzaHRhc3RpYy5Qcm90b2J1ZnO6AgBiBnByb3RvMw");
var StoreAndForwardSchema = /* @__PURE__ */ messageDesc(file_storeforward, 0);
var StoreAndForward_StatisticsSchema = /* @__PURE__ */ messageDesc(file_storeforward, 0, 0);
var StoreAndForward_HistorySchema = /* @__PURE__ */ messageDesc(file_storeforward, 0, 1);
var StoreAndForward_HeartbeatSchema = /* @__PURE__ */ messageDesc(file_storeforward, 0, 2);
var StoreAndForward_RequestResponse;
(function(StoreAndForward_RequestResponse2) {
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["UNSET"] = 0] = "UNSET";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_ERROR"] = 1] = "ROUTER_ERROR";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_HEARTBEAT"] = 2] = "ROUTER_HEARTBEAT";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_PING"] = 3] = "ROUTER_PING";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_PONG"] = 4] = "ROUTER_PONG";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_BUSY"] = 5] = "ROUTER_BUSY";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_HISTORY"] = 6] = "ROUTER_HISTORY";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_STATS"] = 7] = "ROUTER_STATS";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_TEXT_DIRECT"] = 8] = "ROUTER_TEXT_DIRECT";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["ROUTER_TEXT_BROADCAST"] = 9] = "ROUTER_TEXT_BROADCAST";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["CLIENT_ERROR"] = 64] = "CLIENT_ERROR";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["CLIENT_HISTORY"] = 65] = "CLIENT_HISTORY";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["CLIENT_STATS"] = 66] = "CLIENT_STATS";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["CLIENT_PING"] = 67] = "CLIENT_PING";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["CLIENT_PONG"] = 68] = "CLIENT_PONG";
  StoreAndForward_RequestResponse2[StoreAndForward_RequestResponse2["CLIENT_ABORT"] = 106] = "CLIENT_ABORT";
})(StoreAndForward_RequestResponse || (StoreAndForward_RequestResponse = {}));
var StoreAndForward_RequestResponseSchema = /* @__PURE__ */ enumDesc(file_storeforward, 0, 0);

// src/types.ts
var types_exports = {};
__export(types_exports, {
  ChannelNumber: () => ChannelNumber,
  DeviceStatusEnum: () => DeviceStatusEnum,
  Emitter: () => Emitter,
  EmitterScope: () => EmitterScope
});
var DeviceStatusEnum = /* @__PURE__ */ ((DeviceStatusEnum2) => {
  DeviceStatusEnum2[DeviceStatusEnum2["DeviceRestarting"] = 1] = "DeviceRestarting";
  DeviceStatusEnum2[DeviceStatusEnum2["DeviceDisconnected"] = 2] = "DeviceDisconnected";
  DeviceStatusEnum2[DeviceStatusEnum2["DeviceConnecting"] = 3] = "DeviceConnecting";
  DeviceStatusEnum2[DeviceStatusEnum2["DeviceReconnecting"] = 4] = "DeviceReconnecting";
  DeviceStatusEnum2[DeviceStatusEnum2["DeviceConnected"] = 5] = "DeviceConnected";
  DeviceStatusEnum2[DeviceStatusEnum2["DeviceConfiguring"] = 6] = "DeviceConfiguring";
  DeviceStatusEnum2[DeviceStatusEnum2["DeviceConfigured"] = 7] = "DeviceConfigured";
  return DeviceStatusEnum2;
})(DeviceStatusEnum || {});
var EmitterScope = /* @__PURE__ */ ((EmitterScope2) => {
  EmitterScope2[EmitterScope2["MeshDevice"] = 1] = "MeshDevice";
  EmitterScope2[EmitterScope2["SerialConnection"] = 2] = "SerialConnection";
  EmitterScope2[EmitterScope2["NodeSerialConnection"] = 3] = "NodeSerialConnection";
  EmitterScope2[EmitterScope2["BleConnection"] = 4] = "BleConnection";
  EmitterScope2[EmitterScope2["HttpConnection"] = 5] = "HttpConnection";
  return EmitterScope2;
})(EmitterScope || {});
var Emitter = /* @__PURE__ */ ((Emitter2) => {
  Emitter2[Emitter2["Constructor"] = 0] = "Constructor";
  Emitter2[Emitter2["SendText"] = 1] = "SendText";
  Emitter2[Emitter2["SendWaypoint"] = 2] = "SendWaypoint";
  Emitter2[Emitter2["SendPacket"] = 3] = "SendPacket";
  Emitter2[Emitter2["SendRaw"] = 4] = "SendRaw";
  Emitter2[Emitter2["SetConfig"] = 5] = "SetConfig";
  Emitter2[Emitter2["SetModuleConfig"] = 6] = "SetModuleConfig";
  Emitter2[Emitter2["ConfirmSetConfig"] = 7] = "ConfirmSetConfig";
  Emitter2[Emitter2["SetOwner"] = 8] = "SetOwner";
  Emitter2[Emitter2["SetChannel"] = 9] = "SetChannel";
  Emitter2[Emitter2["ConfirmSetChannel"] = 10] = "ConfirmSetChannel";
  Emitter2[Emitter2["ClearChannel"] = 11] = "ClearChannel";
  Emitter2[Emitter2["GetChannel"] = 12] = "GetChannel";
  Emitter2[Emitter2["GetAllChannels"] = 13] = "GetAllChannels";
  Emitter2[Emitter2["GetConfig"] = 14] = "GetConfig";
  Emitter2[Emitter2["GetModuleConfig"] = 15] = "GetModuleConfig";
  Emitter2[Emitter2["GetOwner"] = 16] = "GetOwner";
  Emitter2[Emitter2["Configure"] = 17] = "Configure";
  Emitter2[Emitter2["HandleFromRadio"] = 18] = "HandleFromRadio";
  Emitter2[Emitter2["HandleMeshPacket"] = 19] = "HandleMeshPacket";
  Emitter2[Emitter2["Connect"] = 20] = "Connect";
  Emitter2[Emitter2["Ping"] = 21] = "Ping";
  Emitter2[Emitter2["ReadFromRadio"] = 22] = "ReadFromRadio";
  Emitter2[Emitter2["WriteToRadio"] = 23] = "WriteToRadio";
  Emitter2[Emitter2["SetDebugMode"] = 24] = "SetDebugMode";
  Emitter2[Emitter2["GetMetadata"] = 25] = "GetMetadata";
  Emitter2[Emitter2["ResetNodes"] = 26] = "ResetNodes";
  Emitter2[Emitter2["Shutdown"] = 27] = "Shutdown";
  Emitter2[Emitter2["Reboot"] = 28] = "Reboot";
  Emitter2[Emitter2["RebootOta"] = 29] = "RebootOta";
  Emitter2[Emitter2["FactoryReset"] = 30] = "FactoryReset";
  Emitter2[Emitter2["EnterDfuMode"] = 31] = "EnterDfuMode";
  Emitter2[Emitter2["RemoveNodeByNum"] = 32] = "RemoveNodeByNum";
  Emitter2[Emitter2["SetCannedMessages"] = 33] = "SetCannedMessages";
  return Emitter2;
})(Emitter || {});
var ChannelNumber = /* @__PURE__ */ ((ChannelNumber2) => {
  ChannelNumber2[ChannelNumber2["Primary"] = 0] = "Primary";
  ChannelNumber2[ChannelNumber2["Channel1"] = 1] = "Channel1";
  ChannelNumber2[ChannelNumber2["Channel2"] = 2] = "Channel2";
  ChannelNumber2[ChannelNumber2["Channel3"] = 3] = "Channel3";
  ChannelNumber2[ChannelNumber2["Channel4"] = 4] = "Channel4";
  ChannelNumber2[ChannelNumber2["Channel5"] = 5] = "Channel5";
  ChannelNumber2[ChannelNumber2["Channel6"] = 6] = "Channel6";
  ChannelNumber2[ChannelNumber2["Admin"] = 7] = "Admin";
  return ChannelNumber2;
})(ChannelNumber || {});

// src/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  EventSystem: () => EventSystem,
  Queue: () => Queue,
  Xmodem: () => Xmodem,
  transformHandler: () => transformHandler,
  typedArrayToBuffer: () => typedArrayToBuffer
});

// src/utils/eventSystem.ts
import { SimpleEventDispatcher } from "ste-simple-events";
var EventSystem = class {
  /**
   * Fires when a new FromRadio message has been received from the device
   *
   * @event onLogEvent
   */
  onLogEvent = new SimpleEventDispatcher();
  /**
   * Fires when a new FromRadio message has been received from the device
   *
   * @event onFromRadio
   */
  onFromRadio = new SimpleEventDispatcher();
  /**
   * Fires when a new FromRadio message containing a Data packet has been
   * received from the device
   *
   * @event onMeshPacket
   */
  onMeshPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MyNodeInfo message has been received from the device
   *
   * @event onMyNodeInfo
   */
  onMyNodeInfo = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a NodeInfo packet has been
   * received from device
   *
   * @event onNodeInfoPacket
   */
  onNodeInfoPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new Channel message is received
   *
   * @event onChannelPacket
   */
  onChannelPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new Config message is received
   *
   * @event onConfigPacket
   */
  onConfigPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new ModuleConfig message is received
   *
   * @event onModuleConfigPacket
   */
  onModuleConfigPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a ATAK packet has been
   * received from device
   *
   * @event onAtakPacket
   */
  onAtakPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Text packet has been
   * received from device
   *
   * @event onMessagePacket
   */
  onMessagePacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Remote Hardware packet has
   * been received from device
   *
   * @event onRemoteHardwarePacket
   */
  onRemoteHardwarePacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Position packet has been
   * received from device
   *
   * @event onPositionPacket
   */
  onPositionPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a User packet has been
   * received from device
   *
   * @event onUserPacket
   */
  onUserPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Routing packet has been
   * received from device
   *
   * @event onRoutingPacket
   */
  onRoutingPacket = new SimpleEventDispatcher();
  /**
   * Fires when the device receives a Metadata packet
   *
   * @event onDeviceMetadataPacket
   */
  onDeviceMetadataPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Waypoint packet has been
   * received from device
   *
   * @event onWaypointPacket
   */
  onWaypointPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing an Audio packet has been
   * received from device
   *
   * @event onAudioPacket
   */
  onAudioPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Detection Sensor packet has been
   * received from device
   *
   * @event onDetectionSensorPacket
   */
  onDetectionSensorPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Ping packet has been
   * received from device
   *
   * @event onPingPacket
   */
  onPingPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a IP Tunnel packet has been
   * received from device
   *
   * @event onIpTunnelPacket
   */
  onIpTunnelPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Paxcounter packet has been
   * received from device
   *
   * @event onPaxcounterPacket
   */
  onPaxcounterPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Serial packet has been
   * received from device
   *
   * @event onSerialPacket
   */
  onSerialPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Store and Forward packet
   * has been received from device
   *
   * @event onStoreForwardPacket
   */
  onStoreForwardPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Store and Forward packet
   * has been received from device
   *
   * @event onRangeTestPacket
   */
  onRangeTestPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Telemetry packet has been
   * received from device
   *
   * @event onTelemetryPacket
   */
  onTelemetryPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a ZPS packet has been
   * received from device
   *
   * @event onZPSPacket
   */
  onZpsPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Simulator packet has been
   * received from device
   *
   * @event onSimulatorPacket
   */
  onSimulatorPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Trace Route packet has been
   * received from device
   *
   * @event onTraceRoutePacket
   */
  onTraceRoutePacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Neighbor Info packet has been
   * received from device
   *
   * @event onNeighborInfoPacket
   */
  onNeighborInfoPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing an ATAK packet has been
   * received from device
   *
   * @event onAtakPluginPacket
   */
  onAtakPluginPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Map Report packet has been
   * received from device
   *
   * @event onMapReportPacket
   */
  onMapReportPacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing a Private packet has been
   * received from device
   *
   * @event onPrivatePacket
   */
  onPrivatePacket = new SimpleEventDispatcher();
  /**
   * Fires when a new MeshPacket message containing an ATAK Forwarder packet has been
   * received from device
   *
   * @event onAtakForwarderPacket
   */
  onAtakForwarderPacket = new SimpleEventDispatcher();
  /**
   * Fires when the devices connection or configuration status changes
   *
   * @event onDeviceStatus
   */
  onDeviceStatus = new SimpleEventDispatcher();
  /**
   * Fires when a new FromRadio message containing a LogRecord packet has been
   * received from device
   *
   * @event onLogRecord
   */
  onLogRecord = new SimpleEventDispatcher();
  /**
   * Fires when the device receives a meshPacket, returns a timestamp
   *
   * @event onMeshHeartbeat
   */
  onMeshHeartbeat = new SimpleEventDispatcher();
  /**
   * Outputs any debug log data (currently serial connections only)
   *
   * @event onDeviceDebugLog
   */
  onDeviceDebugLog = new SimpleEventDispatcher();
  /**
   * Outputs status of pending settings changes
   *
   * @event onpendingSettingsChange
   */
  onPendingSettingsChange = new SimpleEventDispatcher();
  /**
   * Fires when a QueueStatus message is generated
   *
   * @event onQueueStatus
   */
  onQueueStatus = new SimpleEventDispatcher();
};

// src/utils/general.ts
var typedArrayToBuffer = (array) => {
  if (!(array instanceof Uint8Array)) {
    throw new TypeError("Input must be a Uint8Array");
  }
  if (array.byteLength === 0) {
    return new ArrayBuffer(0);
  }
  if (array.buffer instanceof SharedArrayBuffer) {
    const newBuffer = new ArrayBuffer(array.byteLength);
    new Uint8Array(newBuffer).set(array);
    return newBuffer;
  }
  if (array.byteOffset === 0 && array.byteLength === array.buffer.byteLength) {
    return array.buffer;
  }
  return array.buffer.slice(
    array.byteOffset,
    array.byteOffset + array.byteLength
  );
};

// src/utils/queue.ts
import { SimpleEventDispatcher as SimpleEventDispatcher2 } from "ste-simple-events";
var Queue = class {
  queue = [];
  lock = false;
  ackNotifier = new SimpleEventDispatcher2();
  errorNotifier = new SimpleEventDispatcher2();
  timeout;
  constructor() {
    this.timeout = 6e4;
  }
  getState() {
    return this.queue;
  }
  clear() {
    this.queue = [];
  }
  push(item) {
    const queueItem = {
      ...item,
      sent: false,
      added: /* @__PURE__ */ new Date(),
      promise: new Promise((resolve, reject) => {
        this.ackNotifier.subscribe((id) => {
          if (item.id === id) {
            this.remove(item.id);
            resolve(id);
          }
        });
        this.errorNotifier.subscribe((e) => {
          if (item.id === e.id) {
            this.remove(item.id);
            reject(e);
          }
        });
        setTimeout(() => {
          if (this.queue.findIndex((qi) => qi.id === item.id) !== -1) {
            this.remove(item.id);
            const decoded = fromBinary(mesh_pb_exports.ToRadioSchema, item.data);
            console.warn(
              `Packet ${item.id} of type ${decoded.payloadVariant.case} timed out`
            );
            reject({
              id: item.id,
              error: mesh_pb_exports.Routing_Error.TIMEOUT
            });
          }
        }, this.timeout);
      })
    };
    this.queue.push(queueItem);
  }
  remove(id) {
    if (this.lock) {
      setTimeout(() => this.remove(id), 100);
      return;
    }
    this.queue = this.queue.filter((item) => item.id !== id);
  }
  processAck(id) {
    this.ackNotifier.dispatch(id);
  }
  processError(e) {
    console.error(
      `Error received for packet ${e.id}: ${mesh_pb_exports.Routing_Error[e.error]}`
    );
    this.errorNotifier.dispatch(e);
  }
  async wait(id) {
    const queueItem = this.queue.find((qi) => qi.id === id);
    if (!queueItem) {
      throw new Error("Packet does not exist");
    }
    return queueItem.promise;
  }
  async processQueue(writeToRadio) {
    if (this.lock) {
      return;
    }
    this.lock = true;
    while (this.queue.filter((p) => !p.sent).length > 0) {
      const item = this.queue.filter((p) => !p.sent)[0];
      if (item) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        try {
          await writeToRadio(item.data);
          item.sent = true;
        } catch (error) {
          console.error(`Error sending packet ${item.id}`, error);
        }
      }
    }
    this.lock = false;
  }
};

// src/utils/transformHandler.ts
var transformHandler = (log, onReleaseEvent, onDeviceDebugLog, concurrentLogOutput) => {
  let byteBuffer = new Uint8Array([]);
  return new TransformStream({
    transform(chunk, controller) {
      log = log.getSubLogger({ name: "streamTransformer" });
      onReleaseEvent.subscribe(() => {
        controller.terminate();
      });
      byteBuffer = new Uint8Array([...byteBuffer, ...chunk]);
      let processingExhausted = false;
      while (byteBuffer.length !== 0 && !processingExhausted) {
        const framingIndex = byteBuffer.findIndex((byte) => byte === 148);
        const framingByte2 = byteBuffer[framingIndex + 1];
        if (framingByte2 === 195) {
          if (byteBuffer.subarray(0, framingIndex).length) {
            if (concurrentLogOutput) {
              onDeviceDebugLog.dispatch(byteBuffer.subarray(0, framingIndex));
            } else {
              log.warn(
                2 /* SerialConnection */,
                20 /* Connect */,
                `\u26A0\uFE0F Found unneccesary message padding, removing: ${byteBuffer.subarray(0, framingIndex).toString()}`
              );
            }
            byteBuffer = byteBuffer.subarray(framingIndex);
          }
          const msb = byteBuffer[2];
          const lsb = byteBuffer[3];
          if (msb !== void 0 && lsb !== void 0 && byteBuffer.length >= 4 + (msb << 8) + lsb) {
            const packet = byteBuffer.subarray(4, 4 + (msb << 8) + lsb);
            const malformedDetectorIndex = packet.findIndex(
              (byte) => byte === 148
            );
            if (malformedDetectorIndex !== -1 && packet[malformedDetectorIndex + 1] === 195) {
              log.warn(
                2 /* SerialConnection */,
                20 /* Connect */,
                `\u26A0\uFE0F Malformed packet found, discarding: ${byteBuffer.subarray(0, malformedDetectorIndex - 1).toString()}`,
                mesh_pb_exports.LogRecord_Level.WARNING
              );
              byteBuffer = byteBuffer.subarray(malformedDetectorIndex);
            } else {
              byteBuffer = byteBuffer.subarray(3 + (msb << 8) + lsb + 1);
              controller.enqueue(packet);
            }
          } else {
            processingExhausted = true;
          }
        } else {
          processingExhausted = true;
        }
      }
    }
  });
};

// src/utils/xmodem.ts
import crc16ccitt from "crc/calculators/crc16ccitt";
var Xmodem = class {
  sendRaw;
  rxBuffer;
  txBuffer;
  textEncoder;
  counter;
  constructor(sendRaw) {
    this.sendRaw = sendRaw;
    this.rxBuffer = [];
    this.txBuffer = [];
    this.textEncoder = new TextEncoder();
    this.counter = 0;
  }
  async downloadFile(filename) {
    return await this.sendCommand(
      xmodem_pb_exports.XModem_Control.STX,
      this.textEncoder.encode(filename),
      0
    );
  }
  async uploadFile(filename, data) {
    for (let i = 0; i < data.length; i += 128) {
      this.txBuffer.push(data.slice(i, i + 128));
    }
    return await this.sendCommand(
      xmodem_pb_exports.XModem_Control.SOH,
      this.textEncoder.encode(filename),
      0
    );
  }
  async sendCommand(command, buffer, sequence, crc16) {
    const toRadio = create(mesh_pb_exports.ToRadioSchema, {
      payloadVariant: {
        case: "xmodemPacket",
        value: {
          buffer,
          control: command,
          seq: sequence,
          crc16
        }
      }
    });
    return await this.sendRaw(toBinary(mesh_pb_exports.ToRadioSchema, toRadio));
  }
  async handlePacket(packet) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    switch (packet.control) {
      case xmodem_pb_exports.XModem_Control.NUL: {
        break;
      }
      case xmodem_pb_exports.XModem_Control.SOH: {
        this.counter = packet.seq;
        if (this.validateCrc16(packet)) {
          this.rxBuffer[this.counter] = packet.buffer;
          return this.sendCommand(xmodem_pb_exports.XModem_Control.ACK);
        }
        return await this.sendCommand(
          xmodem_pb_exports.XModem_Control.NAK,
          void 0,
          packet.seq
        );
      }
      case xmodem_pb_exports.XModem_Control.STX: {
        break;
      }
      case xmodem_pb_exports.XModem_Control.EOT: {
        break;
      }
      case xmodem_pb_exports.XModem_Control.ACK: {
        this.counter++;
        if (this.txBuffer[this.counter - 1]) {
          return this.sendCommand(
            xmodem_pb_exports.XModem_Control.SOH,
            this.txBuffer[this.counter - 1],
            this.counter,
            crc16ccitt(this.txBuffer[this.counter - 1] ?? new Uint8Array())
          );
        }
        if (this.counter === this.txBuffer.length + 1) {
          return this.sendCommand(xmodem_pb_exports.XModem_Control.EOT);
        }
        this.clear();
        break;
      }
      case xmodem_pb_exports.XModem_Control.NAK: {
        return this.sendCommand(
          xmodem_pb_exports.XModem_Control.SOH,
          this.txBuffer[this.counter],
          this.counter,
          crc16ccitt(this.txBuffer[this.counter - 1] ?? new Uint8Array())
        );
      }
      case xmodem_pb_exports.XModem_Control.CAN: {
        this.clear();
        break;
      }
      case xmodem_pb_exports.XModem_Control.CTRLZ: {
        break;
      }
    }
    return Promise.resolve(0);
  }
  validateCrc16(packet) {
    return crc16ccitt(packet.buffer) === packet.crc16;
  }
  clear() {
    this.counter = 0;
    this.rxBuffer = [];
    this.txBuffer = [];
  }
};

// src/meshDevice.ts
var MeshDevice = class {
  /** Logs to the console and the logging event emitter */
  log;
  /** Describes the current state of the device */
  deviceStatus;
  /** Describes the current state of the device */
  isConfigured;
  /** Are there any settings that have yet to be applied? */
  pendingSettingsChanges;
  /** Device's node number */
  myNodeInfo;
  /** Randomly generated number to ensure confiuration lockstep */
  configId;
  /**
   * Packert queue, to space out transmissions and routing handle errors and
   * acks
   */
  queue;
  events;
  xModem;
  constructor(configId) {
    this.log = new Logger({
      name: "iMeshDevice",
      prettyLogTemplate: "{{hh}}:{{MM}}:{{ss}}:{{ms}}	{{logLevelName}}	[{{name}}]	"
    });
    this.deviceStatus = 2 /* DeviceDisconnected */;
    this.isConfigured = false;
    this.pendingSettingsChanges = false;
    this.myNodeInfo = create(mesh_pb_exports.MyNodeInfoSchema);
    this.configId = configId ?? this.generateRandId();
    this.queue = new Queue();
    this.events = new EventSystem();
    this.xModem = new Xmodem(this.sendRaw.bind(this));
    this.events.onDeviceStatus.subscribe((status) => {
      this.deviceStatus = status;
      if (status === 7 /* DeviceConfigured */) {
        this.isConfigured = true;
      } else if (status === 6 /* DeviceConfiguring */) {
        this.isConfigured = false;
      }
    });
    this.events.onMyNodeInfo.subscribe((myNodeInfo) => {
      this.myNodeInfo = myNodeInfo;
    });
    this.events.onPendingSettingsChange.subscribe((state) => {
      this.pendingSettingsChanges = state;
    });
  }
  /**
   * Sends a text over the radio
   */
  async sendText(text, destination, wantAck, channel) {
    this.log.debug(
      Emitter[1 /* SendText */],
      `\u{1F4E4} Sending message to ${destination ?? "broadcast"} on channel ${channel?.toString() ?? 0}`
    );
    const enc = new TextEncoder();
    return await this.sendPacket(
      enc.encode(text),
      portnums_pb_exports.PortNum.TEXT_MESSAGE_APP,
      destination ?? "broadcast",
      channel,
      wantAck,
      false,
      true
    );
  }
  /**
   * Sends a text over the radio
   */
  sendWaypoint(waypointMessage, destination, channel) {
    this.log.debug(
      Emitter[2 /* SendWaypoint */],
      `\u{1F4E4} Sending waypoint to ${destination} on channel ${channel?.toString() ?? 0}`
    );
    waypointMessage.id = this.generateRandId();
    return this.sendPacket(
      toBinary(mesh_pb_exports.WaypointSchema, waypointMessage),
      portnums_pb_exports.PortNum.WAYPOINT_APP,
      destination,
      channel,
      true,
      false
    );
  }
  /**
   * Sends packet over the radio
   */
  async sendPacket(byteData, portNum, destination, channel = 0 /* Primary */, wantAck = true, wantResponse = true, echoResponse = false, replyId, emoji) {
    this.log.trace(
      Emitter[3 /* SendPacket */],
      `\u{1F4E4} Sending ${portnums_pb_exports.PortNum[portNum]} to ${destination}`
    );
    const meshPacket = create(mesh_pb_exports.MeshPacketSchema, {
      payloadVariant: {
        case: "decoded",
        value: {
          payload: byteData,
          portnum: portNum,
          wantResponse,
          emoji,
          replyId,
          dest: 0,
          //change this!
          requestId: 0,
          //change this!
          source: 0
          //change this!
        }
      },
      from: this.myNodeInfo.myNodeNum,
      to: destination === "broadcast" ? broadcastNum : destination === "self" ? this.myNodeInfo.myNodeNum : destination,
      id: this.generateRandId(),
      wantAck,
      channel
    });
    const toRadioMessage = create(mesh_pb_exports.ToRadioSchema, {
      payloadVariant: {
        case: "packet",
        value: meshPacket
      }
    });
    if (echoResponse) {
      meshPacket.rxTime = Math.trunc((/* @__PURE__ */ new Date()).getTime() / 1e3);
      this.handleMeshPacket(meshPacket);
    }
    return await this.sendRaw(
      toBinary(mesh_pb_exports.ToRadioSchema, toRadioMessage),
      meshPacket.id
    );
  }
  /**
   * Sends raw packet over the radio
   */
  async sendRaw(toRadio, id = this.generateRandId()) {
    if (toRadio.length > 512) {
      throw new Error("Message longer than 512 bytes, it will not be sent!");
    }
    this.queue.push({
      id,
      data: toRadio
    });
    await this.queue.processQueue(async (data) => {
      await this.writeToRadio(data);
    });
    return this.queue.wait(id);
  }
  /**
   * Writes config to device
   */
  async setConfig(config) {
    this.log.debug(
      Emitter[5 /* SetConfig */],
      `\u2699\uFE0F Setting config, Variant: ${config.payloadVariant.case ?? "Unknown"}`
    );
    if (!this.pendingSettingsChanges) {
      await this.beginEditSettings();
    }
    const configMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "setConfig",
        value: config
      }
    });
    return this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, configMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Writes module config to device
   */
  async setModuleConfig(moduleConfig) {
    this.log.debug(
      Emitter[6 /* SetModuleConfig */],
      "\u2699\uFE0F Setting module config"
    );
    const moduleConfigMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "setModuleConfig",
        value: moduleConfig
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, moduleConfigMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  // Write cannedMessages to device
  async setCannedMessages(cannedMessages) {
    this.log.debug(
      Emitter[33 /* SetCannedMessages */],
      "\u2699\uFE0F Setting CannedMessages"
    );
    const cannedMessagesMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "setCannedMessageModuleMessages",
        value: cannedMessages.messages
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, cannedMessagesMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Sets devices owner data
   */
  async setOwner(owner) {
    this.log.debug(Emitter[8 /* SetOwner */], "\u{1F464} Setting owner");
    const setOwnerMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "setOwner",
        value: owner
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, setOwnerMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Sets devices ChannelSettings
   */
  async setChannel(channel) {
    this.log.debug(
      Emitter[9 /* SetChannel */],
      `\u{1F4FB} Setting Channel: ${channel.index}`
    );
    const setChannelMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "setChannel",
        value: channel
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, setChannelMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  async enterDfuMode() {
    this.log.debug(
      Emitter[31 /* EnterDfuMode */],
      "\u{1F50C} Entering DFU mode"
    );
    const enterDfuModeRequest = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "enterDfuModeRequest",
        value: true
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, enterDfuModeRequest),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  async setPosition(positionMessage) {
    return await this.sendPacket(
      toBinary(mesh_pb_exports.PositionSchema, positionMessage),
      portnums_pb_exports.PortNum.POSITION_APP,
      "self"
    );
  }
  /**
   * Gets specified channel information from the radio
   */
  async getChannel(index) {
    this.log.debug(
      Emitter[12 /* GetChannel */],
      `\u{1F4FB} Requesting Channel: ${index}`
    );
    const getChannelRequestMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "getChannelRequest",
        value: index + 1
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, getChannelRequestMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Gets devices config
   *   request
   */
  async getConfig(configType) {
    this.log.debug(
      Emitter[14 /* GetConfig */],
      "\u2699\uFE0F Requesting config"
    );
    const getRadioRequestMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "getConfigRequest",
        value: configType
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, getRadioRequestMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Gets Module config
   */
  async getModuleConfig(moduleConfigType) {
    this.log.debug(
      Emitter[15 /* GetModuleConfig */],
      "\u2699\uFE0F Requesting module config"
    );
    const getRadioRequestMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "getModuleConfigRequest",
        value: moduleConfigType
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, getRadioRequestMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /** Gets devices Owner */
  async getOwner() {
    this.log.debug(
      Emitter[16 /* GetOwner */],
      "\u{1F464} Requesting owner"
    );
    const getOwnerRequestMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "getOwnerRequest",
        value: true
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, getOwnerRequestMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Gets devices metadata
   */
  async getMetadata(nodeNum) {
    this.log.debug(
      Emitter[25 /* GetMetadata */],
      `\u{1F3F7}\uFE0F Requesting metadata from ${nodeNum}`
    );
    const getDeviceMetricsRequestMessage = create(
      admin_pb_exports.AdminMessageSchema,
      {
        payloadVariant: {
          case: "getDeviceMetadataRequest",
          value: true
        }
      }
    );
    return await this.sendPacket(
      toBinary(
        admin_pb_exports.AdminMessageSchema,
        getDeviceMetricsRequestMessage
      ),
      portnums_pb_exports.PortNum.ADMIN_APP,
      nodeNum,
      7 /* Admin */
    );
  }
  /**
   * Clears specific channel with the designated index
   */
  async clearChannel(index) {
    this.log.debug(
      Emitter[11 /* ClearChannel */],
      `\u{1F4FB} Clearing Channel ${index}`
    );
    const channel = create(channel_pb_exports.ChannelSchema, {
      index,
      role: channel_pb_exports.Channel_Role.DISABLED
    });
    const setChannelMessage = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "setChannel",
        value: channel
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, setChannelMessage),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  async beginEditSettings() {
    this.events.onPendingSettingsChange.dispatch(true);
    const beginEditSettings = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "beginEditSettings",
        value: true
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, beginEditSettings),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  async commitEditSettings() {
    this.events.onPendingSettingsChange.dispatch(false);
    const commitEditSettings = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "commitEditSettings",
        value: true
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, commitEditSettings),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Resets the internal NodeDB of the radio, usefull for removing old nodes
   * that no longer exist.
   */
  async resetNodes() {
    this.log.debug(
      Emitter[26 /* ResetNodes */],
      "\u{1F4FB} Resetting NodeDB"
    );
    const resetNodes = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "nodedbReset",
        value: 1
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, resetNodes),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Removes a node from the internal NodeDB of the radio by node number
   */
  async removeNodeByNum(nodeNum) {
    this.log.debug(
      Emitter[32 /* RemoveNodeByNum */],
      `\u{1F4FB} Removing Node ${nodeNum} from NodeDB`
    );
    const removeNodeByNum = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "removeByNodenum",
        value: nodeNum
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, removeNodeByNum),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /** Shuts down the current node after the specified amount of time has elapsed. */
  async shutdown(time) {
    this.log.debug(
      Emitter[27 /* Shutdown */],
      `\u{1F50C} Shutting down ${time > 2 ? "now" : `in ${time} seconds`}`
    );
    const shutdown = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "shutdownSeconds",
        value: time
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, shutdown),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /** Reboots the current node after the specified amount of time has elapsed. */
  async reboot(time) {
    this.log.debug(
      Emitter[28 /* Reboot */],
      `\u{1F50C} Rebooting node ${time > 0 ? "now" : `in ${time} seconds`}`
    );
    const reboot = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "rebootSeconds",
        value: time
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, reboot),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Reboots the current node into OTA mode after the specified amount of time
   * has elapsed.
   */
  async rebootOta(time) {
    this.log.debug(
      Emitter[29 /* RebootOta */],
      `\u{1F50C} Rebooting into OTA mode ${time > 0 ? "now" : `in ${time} seconds`}`
    );
    const rebootOta = create(admin_pb_exports.AdminMessageSchema, {
      payloadVariant: {
        case: "rebootOtaSeconds",
        value: time
      }
    });
    return await this.sendPacket(
      toBinary(admin_pb_exports.AdminMessageSchema, rebootOta),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /** Factory resets the current device */
  // public async factoryResetDevice(): Promise<number> {
  //   this.log.debug(
  //     Types.Emitter[Types.Emitter.FactoryReset],
  //     "♻️ Factory resetting device",
  //   );
  //   const factoryReset = new Protobuf.Admin.AdminMessage({
  //     payloadVariant: {
  //       case: "factoryResetDevice",
  //       value: 1,
  //     },
  //   });
  //   return await this.sendPacket(
  //     factoryReset.toBinary(),
  //     Protobuf.Portnums.PortNum.ADMIN_APP,
  //     "self",
  //   );
  // }
  /** Factory resets the current config */
  // public async factoryResetConfig(): Promise<number> {
  //   this.log.debug(
  //     Types.Emitter[Types.Emitter.FactoryReset],
  //     "♻️ Factory resetting config",
  //   );
  //   const factoryReset = new Protobuf.Admin.AdminMessage({
  //     payloadVariant: {
  //       case: "factoryResetConfig",
  //       value: 1,
  //     },
  //   });
  //   return await this.sendPacket(
  //     factoryReset.toBinary(),
  //     Protobuf.Portnums.PortNum.ADMIN_APP,
  //     "self",
  //   );
  // }
  /** Triggers the device configure process */
  configure() {
    this.log.debug(
      Emitter[17 /* Configure */],
      "\u2699\uFE0F Requesting device configuration"
    );
    this.updateDeviceStatus(6 /* DeviceConfiguring */);
    const toRadio = create(mesh_pb_exports.ToRadioSchema, {
      payloadVariant: {
        case: "wantConfigId",
        value: this.configId
      }
    });
    return this.sendRaw(toBinary(mesh_pb_exports.ToRadioSchema, toRadio));
  }
  /** Serial connection requires a heartbeat ping to stay connected, otherwise times out after 15 minutes */
  heartbeat() {
    this.log.debug(
      Emitter[21 /* Ping */],
      "\u2764\uFE0F Send heartbeat ping to radio"
    );
    const toRadio = create(mesh_pb_exports.ToRadioSchema, {
      payloadVariant: {
        case: "heartbeat",
        value: {}
      }
    });
    return this.sendRaw(toBinary(mesh_pb_exports.ToRadioSchema, toRadio));
  }
  /** Sends a trace route packet to the designated node */
  async traceRoute(destination) {
    const routeDiscovery = create(mesh_pb_exports.RouteDiscoverySchema, {
      route: []
    });
    return await this.sendPacket(
      toBinary(mesh_pb_exports.RouteDiscoverySchema, routeDiscovery),
      portnums_pb_exports.PortNum.TRACEROUTE_APP,
      destination
    );
  }
  /** Requests position from the designated node */
  async requestPosition(destination) {
    return await this.sendPacket(
      new Uint8Array(),
      portnums_pb_exports.PortNum.POSITION_APP,
      destination
    );
  }
  /**
   * Updates the device status eliminating duplicate status events
   */
  updateDeviceStatus(status) {
    if (status !== this.deviceStatus) {
      this.events.onDeviceStatus.dispatch(status);
    }
  }
  /**
   * Generates random packet identifier
   *
   * @returns {number} Random packet ID
   */
  generateRandId() {
    const seed = crypto.getRandomValues(new Uint32Array(1));
    if (!seed[0]) {
      throw new Error("Cannot generate CSPRN");
    }
    return Math.floor(seed[0] * 2 ** -32 * 1e9);
  }
  /**
   * Gets called whenever a fromRadio message is received from device, returns
   * fromRadio data
   */
  handleFromRadio(fromRadio) {
    const decodedMessage = fromBinary(mesh_pb_exports.FromRadioSchema, fromRadio);
    this.events.onFromRadio.dispatch(decodedMessage);
    switch (decodedMessage.payloadVariant.case) {
      case "packet": {
        this.handleMeshPacket(decodedMessage.payloadVariant.value);
        break;
      }
      case "myInfo": {
        this.events.onMyNodeInfo.dispatch(decodedMessage.payloadVariant.value);
        this.log.info(
          Emitter[18 /* HandleFromRadio */],
          "\u{1F4F1} Received Node info for this device"
        );
        break;
      }
      case "nodeInfo": {
        this.log.info(
          Emitter[18 /* HandleFromRadio */],
          `\u{1F4F1} Received Node Info packet for node: ${decodedMessage.payloadVariant.value.num}`
        );
        this.events.onNodeInfoPacket.dispatch(
          decodedMessage.payloadVariant.value
        );
        if (decodedMessage.payloadVariant.value?.position) {
          this.events.onPositionPacket.dispatch({
            id: decodedMessage.id,
            rxTime: /* @__PURE__ */ new Date(),
            from: decodedMessage.payloadVariant.value.num,
            to: decodedMessage.payloadVariant.value.num,
            type: "direct",
            channel: 0 /* Primary */,
            data: decodedMessage.payloadVariant.value.position
          });
        }
        if (decodedMessage.payloadVariant.value.user) {
          this.events.onUserPacket.dispatch({
            id: decodedMessage.id,
            rxTime: /* @__PURE__ */ new Date(),
            from: decodedMessage.payloadVariant.value.num,
            to: decodedMessage.payloadVariant.value.num,
            type: "direct",
            channel: 0 /* Primary */,
            data: decodedMessage.payloadVariant.value.user
          });
        }
        break;
      }
      case "config": {
        if (decodedMessage.payloadVariant.value.payloadVariant.case) {
          this.log.trace(
            Emitter[18 /* HandleFromRadio */],
            `\u{1F4BE} Received Config packet of variant: ${decodedMessage.payloadVariant.value.payloadVariant.case}`
          );
        } else {
          this.log.warn(
            Emitter[18 /* HandleFromRadio */],
            `\u26A0\uFE0F Received Config packet of variant: ${"UNK"}`
          );
        }
        this.events.onConfigPacket.dispatch(
          decodedMessage.payloadVariant.value
        );
        break;
      }
      case "logRecord": {
        this.log.trace(
          Emitter[18 /* HandleFromRadio */],
          "Received onLogRecord"
        );
        this.events.onLogRecord.dispatch(decodedMessage.payloadVariant.value);
        break;
      }
      case "configCompleteId": {
        if (decodedMessage.payloadVariant.value !== this.configId) {
          this.log.error(
            Emitter[18 /* HandleFromRadio */],
            `\u274C Invalid config id received from device, expected ${this.configId} but received ${decodedMessage.payloadVariant.value}`
          );
        }
        this.log.info(
          Emitter[18 /* HandleFromRadio */],
          `\u2699\uFE0F Valid config id received from device: ${this.configId}`
        );
        this.updateDeviceStatus(7 /* DeviceConfigured */);
        break;
      }
      case "rebooted": {
        this.configure().catch(() => {
        });
        break;
      }
      case "moduleConfig": {
        if (decodedMessage.payloadVariant.value.payloadVariant.case) {
          this.log.trace(
            Emitter[18 /* HandleFromRadio */],
            `\u{1F4BE} Received Module Config packet of variant: ${decodedMessage.payloadVariant.value.payloadVariant.case}`
          );
        } else {
          this.log.warn(
            Emitter[18 /* HandleFromRadio */],
            "\u26A0\uFE0F Received Module Config packet of variant: UNK"
          );
        }
        this.events.onModuleConfigPacket.dispatch(
          decodedMessage.payloadVariant.value
        );
        break;
      }
      case "channel": {
        this.log.trace(
          Emitter[18 /* HandleFromRadio */],
          `\u{1F510} Received Channel: ${decodedMessage.payloadVariant.value.index}`
        );
        this.events.onChannelPacket.dispatch(
          decodedMessage.payloadVariant.value
        );
        break;
      }
      case "queueStatus": {
        this.log.trace(
          Emitter[18 /* HandleFromRadio */],
          `\u{1F6A7} Received Queue Status: ${decodedMessage.payloadVariant.value}`
        );
        this.events.onQueueStatus.dispatch(decodedMessage.payloadVariant.value);
        break;
      }
      case "xmodemPacket": {
        this.xModem.handlePacket(decodedMessage.payloadVariant.value);
        break;
      }
      case "metadata": {
        if (Number.parseFloat(
          decodedMessage.payloadVariant.value.firmwareVersion
        ) < minFwVer) {
          this.log.fatal(
            Emitter[18 /* HandleFromRadio */],
            `Device firmware outdated. Min supported: ${minFwVer} got : ${decodedMessage.payloadVariant.value.firmwareVersion}`
          );
        }
        this.log.debug(
          Emitter[25 /* GetMetadata */],
          "\u{1F3F7}\uFE0F Received metadata packet"
        );
        this.events.onDeviceMetadataPacket.dispatch({
          id: decodedMessage.id,
          rxTime: /* @__PURE__ */ new Date(),
          from: 0,
          to: 0,
          type: "direct",
          channel: 0 /* Primary */,
          data: decodedMessage.payloadVariant.value
        });
        break;
      }
      case "mqttClientProxyMessage": {
        break;
      }
      default: {
        this.log.warn(
          Emitter[18 /* HandleFromRadio */],
          `\u26A0\uFE0F Unhandled payload variant: ${decodedMessage.payloadVariant.case}`
        );
      }
    }
  }
  /** Completes all Events */
  complete() {
    this.queue.clear();
  }
  /**
   * Gets called when a MeshPacket is received from device
   */
  handleMeshPacket(meshPacket) {
    this.events.onMeshPacket.dispatch(meshPacket);
    if (meshPacket.from !== this.myNodeInfo.myNodeNum) {
      this.events.onMeshHeartbeat.dispatch(/* @__PURE__ */ new Date());
    }
    switch (meshPacket.payloadVariant.case) {
      case "decoded": {
        this.handleDecodedPacket(meshPacket.payloadVariant.value, meshPacket);
        break;
      }
      case "encrypted": {
        this.log.debug(
          Emitter[19 /* HandleMeshPacket */],
          "\u{1F510} Device received encrypted data packet, ignoring."
        );
        break;
      }
      default:
        throw new Error(`Unhandled case ${meshPacket.payloadVariant.case}`);
    }
  }
  handleDecodedPacket(dataPacket, meshPacket) {
    let adminMessage = void 0;
    let routingPacket = void 0;
    const packetMetadata = {
      id: meshPacket.id,
      rxTime: new Date(meshPacket.rxTime * 1e3),
      type: meshPacket.to === broadcastNum ? "broadcast" : "direct",
      from: meshPacket.from,
      to: meshPacket.to,
      channel: meshPacket.channel
    };
    this.log.trace(
      Emitter[19 /* HandleMeshPacket */],
      `\u{1F4E6} Received ${portnums_pb_exports.PortNum[dataPacket.portnum]} packet`
    );
    switch (dataPacket.portnum) {
      case portnums_pb_exports.PortNum.TEXT_MESSAGE_APP: {
        this.events.onMessagePacket.dispatch({
          ...packetMetadata,
          data: new TextDecoder().decode(dataPacket.payload)
        });
        break;
      }
      case portnums_pb_exports.PortNum.REMOTE_HARDWARE_APP: {
        this.events.onRemoteHardwarePacket.dispatch({
          ...packetMetadata,
          data: fromBinary(
            remote_hardware_pb_exports.HardwareMessageSchema,
            dataPacket.payload
          )
        });
        break;
      }
      case portnums_pb_exports.PortNum.POSITION_APP: {
        this.events.onPositionPacket.dispatch({
          ...packetMetadata,
          data: fromBinary(mesh_pb_exports.PositionSchema, dataPacket.payload)
        });
        break;
      }
      case portnums_pb_exports.PortNum.NODEINFO_APP: {
        this.events.onUserPacket.dispatch({
          ...packetMetadata,
          data: fromBinary(mesh_pb_exports.UserSchema, dataPacket.payload)
        });
        break;
      }
      case portnums_pb_exports.PortNum.ROUTING_APP: {
        routingPacket = fromBinary(
          mesh_pb_exports.RoutingSchema,
          dataPacket.payload
        );
        this.events.onRoutingPacket.dispatch({
          ...packetMetadata,
          data: routingPacket
        });
        switch (routingPacket.variant.case) {
          case "errorReason": {
            if (routingPacket.variant.value === mesh_pb_exports.Routing_Error.NONE) {
              this.queue.processAck(dataPacket.requestId);
            } else {
              this.queue.processError({
                id: dataPacket.requestId,
                error: routingPacket.variant.value
              });
            }
            break;
          }
          case "routeReply": {
            break;
          }
          case "routeRequest": {
            break;
          }
          default: {
            throw new Error(`Unhandled case ${routingPacket.variant.case}`);
          }
        }
        break;
      }
      case portnums_pb_exports.PortNum.ADMIN_APP: {
        adminMessage = fromBinary(
          admin_pb_exports.AdminMessageSchema,
          dataPacket.payload
        );
        switch (adminMessage.payloadVariant.case) {
          case "getChannelResponse": {
            this.events.onChannelPacket.dispatch(
              adminMessage.payloadVariant.value
            );
            break;
          }
          case "getOwnerResponse": {
            this.events.onUserPacket.dispatch({
              ...packetMetadata,
              data: adminMessage.payloadVariant.value
            });
            break;
          }
          case "getConfigResponse": {
            this.events.onConfigPacket.dispatch(
              adminMessage.payloadVariant.value
            );
            break;
          }
          case "getModuleConfigResponse": {
            this.events.onModuleConfigPacket.dispatch(
              adminMessage.payloadVariant.value
            );
            break;
          }
          case "getDeviceMetadataResponse": {
            this.log.debug(
              Emitter[25 /* GetMetadata */],
              `\u{1F3F7}\uFE0F Received metadata packet from ${dataPacket.source}`
            );
            this.events.onDeviceMetadataPacket.dispatch({
              ...packetMetadata,
              data: adminMessage.payloadVariant.value
            });
            break;
          }
          default: {
            this.log.error(
              Emitter[19 /* HandleMeshPacket */],
              `\u26A0\uFE0F Received unhandled AdminMessage, type ${adminMessage.payloadVariant.case ?? "undefined"}`,
              dataPacket.payload
            );
          }
        }
        break;
      }
      case portnums_pb_exports.PortNum.WAYPOINT_APP: {
        this.events.onWaypointPacket.dispatch({
          ...packetMetadata,
          data: fromBinary(mesh_pb_exports.WaypointSchema, dataPacket.payload)
        });
        break;
      }
      case portnums_pb_exports.PortNum.AUDIO_APP: {
        this.events.onAudioPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.DETECTION_SENSOR_APP: {
        this.events.onDetectionSensorPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.REPLY_APP: {
        this.events.onPingPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
          //TODO: decode
        });
        break;
      }
      case portnums_pb_exports.PortNum.IP_TUNNEL_APP: {
        this.events.onIpTunnelPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.PAXCOUNTER_APP: {
        this.events.onPaxcounterPacket.dispatch({
          ...packetMetadata,
          data: fromBinary(
            paxcount_pb_exports.PaxcountSchema,
            dataPacket.payload
          )
        });
        break;
      }
      case portnums_pb_exports.PortNum.SERIAL_APP: {
        this.events.onSerialPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.STORE_FORWARD_APP: {
        this.events.onStoreForwardPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.RANGE_TEST_APP: {
        this.events.onRangeTestPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.TELEMETRY_APP: {
        this.events.onTelemetryPacket.dispatch({
          ...packetMetadata,
          data: fromBinary(
            telemetry_pb_exports.TelemetrySchema,
            dataPacket.payload
          )
        });
        break;
      }
      case portnums_pb_exports.PortNum.ZPS_APP: {
        this.events.onZpsPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.SIMULATOR_APP: {
        this.events.onSimulatorPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.TRACEROUTE_APP: {
        this.events.onTraceRoutePacket.dispatch({
          ...packetMetadata,
          data: fromBinary(
            mesh_pb_exports.RouteDiscoverySchema,
            dataPacket.payload
          )
        });
        break;
      }
      case portnums_pb_exports.PortNum.NEIGHBORINFO_APP: {
        this.events.onNeighborInfoPacket.dispatch({
          ...packetMetadata,
          data: fromBinary(
            mesh_pb_exports.NeighborInfoSchema,
            dataPacket.payload
          )
        });
        break;
      }
      case portnums_pb_exports.PortNum.ATAK_PLUGIN: {
        this.events.onAtakPluginPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.MAP_REPORT_APP: {
        this.events.onMapReportPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.PRIVATE_APP: {
        this.events.onPrivatePacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      case portnums_pb_exports.PortNum.ATAK_FORWARDER: {
        this.events.onAtakForwarderPacket.dispatch({
          ...packetMetadata,
          data: dataPacket.payload
        });
        break;
      }
      default:
        throw new Error(`Unhandled case ${dataPacket.portnum}`);
    }
  }
};

// src/adapters/bleConnection.ts
var BleConnection = class extends MeshDevice {
  /** Defines the connection type as ble */
  connType;
  portId;
  /** Currently connected BLE device */
  device;
  gattServer;
  /** Short Description */
  service;
  /** Short Description */
  toRadioCharacteristic;
  /** Short Description */
  fromRadioCharacteristic;
  /** Short Description */
  fromNumCharacteristic;
  timerUpdateFromRadio = null;
  constructor(configId) {
    super(configId);
    this.log = this.log.getSubLogger({ name: "HttpConnection" });
    this.connType = "ble";
    this.portId = "";
    this.device = void 0;
    this.service = void 0;
    this.gattServer = void 0;
    this.toRadioCharacteristic = void 0;
    this.fromRadioCharacteristic = void 0;
    this.fromNumCharacteristic = void 0;
    this.log.debug(
      Emitter[0 /* Constructor */],
      "\u{1F537} BleConnection instantiated"
    );
  }
  /**
   * Gets web bluetooth support avaliability for the device
   *
   * @returns {Promise<void>}
   */
  supported() {
    return navigator.bluetooth.getAvailability();
  }
  /**
   * Gets list of bluetooth devices that can be passed to `connect`
   *
   * @returns {Promise<BluetoothDevice[]>} Array of avaliable BLE devices
   */
  getDevices() {
    return navigator.bluetooth.getDevices();
  }
  /**
   * Opens browser dialog to select a device
   */
  getDevice(filter) {
    return navigator.bluetooth.requestDevice(
      filter ?? {
        filters: [{ services: [ServiceUuid] }]
      }
    );
  }
  /**
   * Initiates the connect process to a Meshtastic device via Bluetooth
   */
  async connect({
    device,
    deviceFilter
  }) {
    this.updateDeviceStatus(3 /* DeviceConnecting */);
    this.device = device ?? await this.getDevice(deviceFilter);
    this.portId = this.device.id;
    this.device.addEventListener("gattserverdisconnected", () => {
      this.log.info(
        Emitter[20 /* Connect */],
        "Device disconnected"
      );
      this.updateDeviceStatus(2 /* DeviceDisconnected */);
      this.complete();
    });
    let error = "";
    await this.device.gatt?.connect().then((server) => {
      this.log.info(
        Emitter[20 /* Connect */],
        `\u2705 Got GATT Server for device: ${server.device.id}`
      );
      this.gattServer = server;
    }).catch((e) => {
      this.log.error(
        Emitter[20 /* Connect */],
        `\u274C Failed to connect: ${e.message}`
      );
      if (e.message == "Connect failed") {
        error = e.message;
      }
    });
    if (error) {
      console.log("Error Message!  Abort Abort!");
      this.disconnect();
      return;
    }
    await this.gattServer?.getPrimaryService(ServiceUuid).then((service) => {
      this.log.info(
        Emitter[20 /* Connect */],
        `\u2705 Got GATT Service for device: ${service.device.id}`
      );
      this.service = service;
    }).catch((e) => {
      this.log.error(
        Emitter[20 /* Connect */],
        `\u274C Failed to get primary service: q${e.message}`
      );
    });
    [ToRadioUuid, FromRadioUuid, FromNumUuid].map(async (uuid) => {
      await this.service?.getCharacteristic(uuid).then((characteristic) => {
        this.log.info(
          Emitter[20 /* Connect */],
          `\u2705 Got Characteristic ${characteristic.uuid} for device: ${characteristic.uuid}`
        );
        switch (uuid) {
          case ToRadioUuid: {
            this.toRadioCharacteristic = characteristic;
            break;
          }
          case FromRadioUuid: {
            this.fromRadioCharacteristic = characteristic;
            break;
          }
          case FromNumUuid: {
            this.fromNumCharacteristic = characteristic;
            break;
          }
        }
      }).catch((e) => {
        this.log.error(
          Emitter[20 /* Connect */],
          `\u274C Failed to get toRadio characteristic: q${e.message}`
        );
      });
    });
    await this.fromNumCharacteristic?.startNotifications();
    this.fromNumCharacteristic?.addEventListener(
      "characteristicvaluechanged",
      () => {
        this.readFromRadio();
      }
    );
    this.updateDeviceStatus(5 /* DeviceConnected */);
    this.configure().catch(() => {
    });
    this.timerUpdateFromRadio = setInterval(() => this.readFromRadio(), 1e3);
  }
  /** Disconnects from the Meshtastic device */
  disconnect() {
    this.device?.gatt?.disconnect();
    this.updateDeviceStatus(2 /* DeviceDisconnected */);
    this.complete();
    if (this.timerUpdateFromRadio) {
      clearInterval(this.timerUpdateFromRadio);
    }
    this.timerUpdateFromRadio = null;
  }
  /**
   * Pings device to check if it is avaliable
   *
   * @todo Implement
   */
  async ping() {
    return await Promise.resolve(true);
  }
  /**
   * Reads data packets from the radio until empty
   * @throws Error if reading fails
   */
  async readFromRadio() {
    try {
      let hasMoreData = true;
      while (hasMoreData && this.fromRadioCharacteristic) {
        const value = await this.fromRadioCharacteristic.readValue();
        if (value.byteLength === 0) {
          hasMoreData = false;
          continue;
        }
        await this.handleFromRadio(new Uint8Array(value.buffer));
        this.updateDeviceStatus(5 /* DeviceConnected */);
      }
    } catch (error) {
      this.log.error(
        Emitter[22 /* ReadFromRadio */],
        `\u274C ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw error;
    } finally {
    }
  }
  /**
   * Sends supplied protobuf message to the radio
   */
  async writeToRadio(data) {
    await this.toRadioCharacteristic?.writeValue(typedArrayToBuffer(data));
    await this.readFromRadio();
  }
};

// src/adapters/httpConnection.ts
var HttpConnection = class extends MeshDevice {
  /** Defines the connection type as http */
  connType;
  /** URL of the device that is to be connected to. */
  portId;
  /** Enables receiving messages all at once, versus one per request */
  receiveBatchRequests;
  readLoop;
  pendingRequest;
  abortController;
  defaultRetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1e3,
    maxDelayMs: 1e4,
    backoffFactor: 2
  };
  constructor(configId) {
    super(configId);
    this.log = this.log.getSubLogger({ name: "HttpConnection" });
    this.connType = "http";
    this.portId = "";
    this.receiveBatchRequests = false;
    this.readLoop = null;
    this.pendingRequest = false;
    this.abortController = new AbortController();
    this.log.debug(
      Emitter[0 /* Constructor */],
      "\u{1F537} HttpConnection instantiated"
    );
  }
  /**
   * Checks if the error should trigger a retry attempt
   * @param response - The fetch response
   * @returns boolean indicating if should retry
   */
  shouldRetry(response) {
    if (response.status >= 500 && response.status <= 599) {
      return true;
    }
    if (!response.ok && response.status < 400) {
      return true;
    }
    return false;
  }
  /**
   * Implements exponential backoff retry logic for HTTP operations
   * @param operation - The async operation to retry
   * @param retryConfig - Configuration for retry behavior
   * @param operationName - Name of the operation for logging
   */
  async withRetry(operation, retryConfig, operationName) {
    let delay = retryConfig.initialDelayMs;
    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await operation();
        if (!this.shouldRetry(response)) {
          return response;
        }
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
        if (attempt === retryConfig.maxRetries) {
          throw error;
        }
        this.log.warn(
          `${operationName} failed (attempt ${attempt}/${retryConfig.maxRetries}): ${error.message}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(
          delay * retryConfig.backoffFactor,
          retryConfig.maxDelayMs
        );
      } catch (error) {
        if (!(error instanceof Error) || !error.message.startsWith("HTTP")) {
          throw error;
        }
        if (attempt === retryConfig.maxRetries) {
          throw error;
        }
        this.log.warn(
          `${operationName} failed (attempt ${attempt}/${retryConfig.maxRetries}): ${error.message}`
        );
      }
    }
    throw new Error("Unexpected end of retry loop");
  }
  /**
   * Attempts a single connection to the device
   */
  async attemptConnection(params) {
    const { address, tls = false } = params;
    this.portId = `${tls ? "https://" : "http://"}${address}`;
    const response = await fetch(`${this.portId}/hotspot-detect.html`, {
      signal: this.abortController.signal,
      mode: "no-cors"
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  }
  /**
   * Initiates the connect process to a Meshtastic device via HTTP(S)
   */
  async connect({
    address,
    fetchInterval = 3e3,
    receiveBatchRequests = false,
    tls = false
  }) {
    this.updateDeviceStatus(3 /* DeviceConnecting */);
    this.receiveBatchRequests = receiveBatchRequests;
    try {
      await this.withRetry(
        () => this.attemptConnection({ address, tls, fetchInterval }),
        {
          ...this.defaultRetryConfig,
          maxRetries: 5,
          // More retries for initial connection
          maxDelayMs: 1e4
          // Max 10s between retries
        },
        "Connect"
      );
      if (this.deviceStatus === 3 /* DeviceConnecting */) {
        this.log.debug(
          Emitter[20 /* Connect */],
          "Connection succeeded, starting configuration and request timer."
        );
        await this.configure().catch((error) => {
          this.log.warn(
            Emitter[20 /* Connect */],
            `Configuration warning: ${error.message}`
          );
        });
        if (!this.readLoop) {
          this.readLoop = setInterval(async () => {
            try {
              await this.readFromRadio();
            } catch (error) {
              if (error instanceof Error) {
                this.log.error(
                  Emitter[20 /* Connect */],
                  `\u274C Read loop error: ${error.message}`
                );
              }
            }
          }, fetchInterval);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.log.error(
          Emitter[20 /* Connect */],
          `\u274C Connection failed: ${error.message}`
        );
      }
      if (this.deviceStatus !== 2 /* DeviceDisconnected */) {
        this.updateDeviceStatus(4 /* DeviceReconnecting */);
        this.connect({
          address,
          fetchInterval,
          receiveBatchRequests,
          tls
        });
      }
    }
  }
  /** Disconnects from the Meshtastic device */
  disconnect() {
    this.abortController.abort();
    this.updateDeviceStatus(2 /* DeviceDisconnected */);
    if (this.readLoop) {
      clearInterval(this.readLoop);
      this.complete();
    }
  }
  /** Pings device to check if it is available with retry logic */
  async ping() {
    this.log.debug(
      Emitter[21 /* Ping */],
      "Attempting device ping."
    );
    const { signal } = this.abortController;
    try {
      const response = await this.withRetry(
        async () => {
          return await fetch(`${this.portId}/hotspot-detect.html`, {
            signal,
            mode: "no-cors"
          });
        },
        { ...this.defaultRetryConfig },
        "Ping"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.updateDeviceStatus(5 /* DeviceConnected */);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.log.error(
          Emitter[21 /* Ping */],
          `\u274C ${error.message}`
        );
      }
      this.updateDeviceStatus(4 /* DeviceReconnecting */);
      return false;
    }
  }
  /** Reads any avaliable protobuf messages from the radio */
  async readFromRadio() {
    if (this.pendingRequest) {
      return;
    }
    let readBuffer = new ArrayBuffer(1);
    const { signal } = this.abortController;
    let error = false;
    while (readBuffer.byteLength > 0 && !error) {
      this.pendingRequest = true;
      await fetch(
        `${this.portId}/api/v1/fromradio?all=${this.receiveBatchRequests ? "true" : "false"}`,
        {
          signal,
          method: "GET",
          headers: {
            Accept: "application/x-protobuf"
          }
        }
      ).then(async (response) => {
        this.pendingRequest = false;
        this.updateDeviceStatus(5 /* DeviceConnected */);
        readBuffer = await response.arrayBuffer();
        if (readBuffer.byteLength > 0) {
          this.handleFromRadio(new Uint8Array(readBuffer));
        }
      }).catch((e) => {
        this.pendingRequest = false;
        this.log.error(
          Emitter[22 /* ReadFromRadio */],
          `\u274C ${e.message}`
        );
        error = true;
        this.updateDeviceStatus(4 /* DeviceReconnecting */);
      });
    }
  }
  /**
   * Sends supplied protobuf message to the radio
   */
  async writeToRadio(data) {
    const { signal } = this.abortController;
    await fetch(`${this.portId}/api/v1/toradio`, {
      signal,
      method: "PUT",
      headers: {
        "Content-Type": "application/x-protobuf"
      },
      body: typedArrayToBuffer(data)
    }).then(async () => {
      this.updateDeviceStatus(5 /* DeviceConnected */);
      await this.readFromRadio().catch((e) => {
        this.log.error(
          Emitter[23 /* WriteToRadio */],
          `\u274C ${e.message}`
        );
      });
    }).catch((e) => {
      this.log.error(
        Emitter[23 /* WriteToRadio */],
        `\u274C ${e.message}`
      );
      this.updateDeviceStatus(4 /* DeviceReconnecting */);
    });
  }
};

// src/adapters/serialConnection.ts
import { SimpleEventDispatcher as SimpleEventDispatcher3 } from "ste-simple-events";
var SerialConnection = class extends MeshDevice {
  /** Defines the connection type as serial */
  connType;
  portId;
  /** Serial port used to communicate with device. */
  port;
  readerHack;
  /** Transform stream for parsing raw serial data */
  transformer;
  /** Should locks be prevented */
  preventLock;
  /** Unfortunately, this is currently the only way to release the lock on a stream after piping it
   *  through a transform stream (https://stackoverflow.com/questions/71262432) */
  pipePromise;
  /* Reference for the heartbeat ping interval so it can be canceled on disconnect. */
  heartbeatInterval;
  /**
   * Fires when `disconnect()` is called, used to instruct serial port and
   * readers to release there locks
   *
   * @event onReleaseEvent
   */
  onReleaseEvent;
  constructor(configId) {
    super(configId);
    this.log = this.log.getSubLogger({ name: "SerialConnection" });
    this.connType = "serial";
    this.portId = "";
    this.port = void 0;
    this.transformer = void 0;
    this.onReleaseEvent = new SimpleEventDispatcher3();
    this.preventLock = false;
    this.heartbeatInterval = void 0;
    this.log.debug(
      Emitter[0 /* Constructor */],
      "\u{1F537} SerialConnection instantiated"
    );
  }
  /**
   * Reads packets from transformed serial port steam and processes them.
   */
  async readFromRadio(reader) {
    this.onReleaseEvent.subscribe(async () => {
      this.preventLock = true;
      await reader.cancel();
      await this.pipePromise?.catch(() => {
      });
      reader.releaseLock();
      await this.port?.close();
    });
    while (this.port?.readable && !this.preventLock) {
      await reader.read().then(({ value }) => {
        if (value) {
          this.handleFromRadio(value);
        }
      }).catch(() => {
        this.log.debug(
          Emitter[22 /* ReadFromRadio */],
          "Releasing reader"
        );
      });
    }
  }
  /** Gets list of serial ports that can be passed to `connect` */
  async getPorts() {
    return await navigator.serial.getPorts();
  }
  /**
   * Opens browsers connection dialogue to select a serial port
   */
  async getPort(filter) {
    return await navigator.serial.requestPort(filter);
  }
  getCurrentPort() {
    return this.port;
  }
  /**
   * Initiates the connect process to a Meshtastic device via Web Serial
   */
  async connect({
    port,
    baudRate = 115200,
    concurrentLogOutput = false
  }) {
    this.updateDeviceStatus(3 /* DeviceConnecting */);
    this.port = port ?? await this.getPort();
    this.port.addEventListener("disconnect", () => {
      this.log.info(
        Emitter[20 /* Connect */],
        "Device disconnected"
      );
      this.updateDeviceStatus(2 /* DeviceDisconnected */);
      this.complete();
    });
    this.preventLock = false;
    await this.port.open({
      baudRate
    }).then(() => {
      if (this.port?.readable && this.port.writable) {
        this.transformer = transformHandler(
          this.log,
          this.onReleaseEvent,
          this.events.onDeviceDebugLog,
          concurrentLogOutput
        );
        this.pipePromise = this.port.readable.pipeTo(
          this.transformer.writable
        );
        const reader = this.readerHack = this.transformer.readable.getReader();
        this.readFromRadio(reader);
        this.updateDeviceStatus(5 /* DeviceConnected */);
        this.configure().catch(() => {
        });
        this.heartbeatInterval = setInterval(() => {
          this.heartbeat().catch((err) => {
            console.error("Heartbeat error", err);
          });
        }, 60 * 1e3);
      } else {
        console.log("not readable or writable");
      }
    }).catch((e) => {
      this.log.error(Emitter[20 /* Connect */], `\u274C ${e.message}`);
    });
  }
  /** Disconnects from the serial port */
  async reconnect() {
    await this.connect({
      port: this.port,
      concurrentLogOutput: false
    });
  }
  /** Disconnects from the serial port */
  async disconnect() {
    this.preventLock = true;
    await this.readerHack?.cancel();
    await this.pipePromise?.catch(() => {
    });
    this.readerHack?.releaseLock();
    if (this.port?.readable) {
      await this.port?.close();
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = void 0;
    }
    this.updateDeviceStatus(2 /* DeviceDisconnected */);
    this.complete();
    return this.port;
  }
  /** Pings device to check if it is avaliable */
  async ping() {
    return await Promise.resolve(true);
  }
  /**
   * Sends supplied protobuf message to the radio
   */
  async writeToRadio(data) {
    while (this.port?.writable?.locked) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const writer = this.port?.writable?.getWriter();
    await writer?.write(
      new Uint8Array([148, 195, 0, data.length, ...data])
    );
    writer?.releaseLock();
  }
};

// src/client.ts
var Client = class {
  /** Array containing all created connection interfaces */
  deviceInterfaces;
  constructor() {
    this.deviceInterfaces = [];
  }
  /**
   * Creates a new Bluetooth Low Enery connection interface
   */
  createBleConnection(configId) {
    const bleConnection = new BleConnection(configId);
    this.deviceInterfaces.push(bleConnection);
    return bleConnection;
  }
  /**
   * Creates a new HTTP(S) connection interface
   */
  createHttpConnection(configId) {
    const httpConnection = new HttpConnection(configId);
    this.deviceInterfaces.push(httpConnection);
    return httpConnection;
  }
  /**
   * Creates a new Serial connection interface
   */
  createSerialConnection(configId) {
    const serialConnection = new SerialConnection(configId);
    this.deviceInterfaces.push(serialConnection);
    return serialConnection;
  }
  /**
   * Adds an already created connection interface to the client
   */
  addConnection(connectionObj) {
    this.deviceInterfaces.push(connectionObj);
  }
  /**
   * Removes a connection interface from the client
   */
  removeConnection(connectionObj) {
    const index = this.deviceInterfaces.indexOf(connectionObj);
    if (index !== -1) {
      this.deviceInterfaces.splice(index, 1);
    }
  }
};
export {
  BleConnection,
  Client,
  Constants,
  FromNumUuid,
  FromRadioUuid,
  HttpConnection,
  MeshDevice,
  mod_exports as Protobuf,
  SerialConnection,
  ServiceUuid,
  ToRadioUuid,
  types_exports as Types,
  utils_exports as Utils,
  broadcastNum,
  minFwVer
};
//# sourceMappingURL=index.js.map