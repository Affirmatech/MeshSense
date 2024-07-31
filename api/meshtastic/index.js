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

// src/protobufs.ts
var protobufs_exports = {};
__export(protobufs_exports, {
  Admin: () => admin_pb_exports,
  AppOnly: () => apponly_pb_exports,
  CannedMessages: () => cannedmessages_pb_exports,
  Channel: () => channel_pb_exports,
  ClientOnly: () => clientonly_pb_exports,
  Config: () => config_pb_exports,
  ConnectionStatus: () => connection_status_pb_exports,
  DeviceOnly: () => deviceonly_pb_exports,
  LocalOnly: () => localonly_pb_exports,
  Mesh: () => mesh_pb_exports,
  ModuleConfig: () => module_config_pb_exports,
  Mqtt: () => mqtt_pb_exports,
  PaxCount: () => paxcount_pb_exports,
  Portnums: () => portnums_pb_exports,
  RemoteHardware: () => remote_hardware_pb_exports,
  Rtttl: () => rtttl_pb_exports,
  StoreForward: () => storeforward_pb_exports,
  Telemetry: () => telemetry_pb_exports,
  Xmodem: () => xmodem_pb_exports
});

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/admin_pb.js
var admin_pb_exports = {};
__export(admin_pb_exports, {
  AdminMessage: () => AdminMessage,
  AdminMessage_ConfigType: () => AdminMessage_ConfigType,
  AdminMessage_ModuleConfigType: () => AdminMessage_ModuleConfigType,
  HamParameters: () => HamParameters,
  NodeRemoteHardwarePinsResponse: () => NodeRemoteHardwarePinsResponse
});

// node_modules/@bufbuild/protobuf/dist/esm/private/assert.js
function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg);
  }
}
var FLOAT32_MAX = 34028234663852886e22;
var FLOAT32_MIN = -34028234663852886e22;
var UINT32_MAX = 4294967295;
var INT32_MAX = 2147483647;
var INT32_MIN = -2147483648;
function assertInt32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid int 32: " + typeof arg);
  if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
    throw new Error("invalid int 32: " + arg);
}
function assertUInt32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid uint 32: " + typeof arg);
  if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
    throw new Error("invalid uint 32: " + arg);
}
function assertFloat32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid float 32: " + typeof arg);
  if (!Number.isFinite(arg))
    return;
  if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
    throw new Error("invalid float 32: " + arg);
}

// node_modules/@bufbuild/protobuf/dist/esm/private/enum.js
var enumTypeSymbol = Symbol("@bufbuild/protobuf/enum-type");
function getEnumType(enumObject) {
  const t = enumObject[enumTypeSymbol];
  assert(t, "missing enum type on enum object");
  return t;
}
function setEnumType(enumObject, typeName, values, opt) {
  enumObject[enumTypeSymbol] = makeEnumType(typeName, values.map((v) => ({
    no: v.no,
    name: v.name,
    localName: enumObject[v.no]
  })), opt);
}
function makeEnumType(typeName, values, _opt) {
  const names = /* @__PURE__ */ Object.create(null);
  const numbers = /* @__PURE__ */ Object.create(null);
  const normalValues = [];
  for (const value of values) {
    const n = normalizeEnumValue(value);
    normalValues.push(n);
    names[value.name] = n;
    numbers[value.no] = n;
  }
  return {
    typeName,
    values: normalValues,
    // We do not surface options at this time
    // options: opt?.options ?? Object.create(null),
    findName(name) {
      return names[name];
    },
    findNumber(no) {
      return numbers[no];
    }
  };
}
function makeEnum(typeName, values, opt) {
  const enumObject = {};
  for (const value of values) {
    const n = normalizeEnumValue(value);
    enumObject[n.localName] = n.no;
    enumObject[n.no] = n.localName;
  }
  setEnumType(enumObject, typeName, values, opt);
  return enumObject;
}
function normalizeEnumValue(value) {
  if ("localName" in value) {
    return value;
  }
  return Object.assign(Object.assign({}, value), { localName: value.name });
}

// node_modules/@bufbuild/protobuf/dist/esm/message.js
var Message = class {
  /**
   * Compare with a message of the same type.
   * Note that this function disregards extensions and unknown fields.
   */
  equals(other) {
    return this.getType().runtime.util.equals(this.getType(), this, other);
  }
  /**
   * Create a deep copy.
   */
  clone() {
    return this.getType().runtime.util.clone(this);
  }
  /**
   * Parse from binary data, merging fields.
   *
   * Repeated fields are appended. Map entries are added, overwriting
   * existing keys.
   *
   * If a message field is already present, it will be merged with the
   * new data.
   */
  fromBinary(bytes, options) {
    const type = this.getType(), format = type.runtime.bin, opt = format.makeReadOptions(options);
    format.readMessage(this, opt.readerFactory(bytes), bytes.byteLength, opt);
    return this;
  }
  /**
   * Parse a message from a JSON value.
   */
  fromJson(jsonValue, options) {
    const type = this.getType(), format = type.runtime.json, opt = format.makeReadOptions(options);
    format.readMessage(type, jsonValue, opt, this);
    return this;
  }
  /**
   * Parse a message from a JSON string.
   */
  fromJsonString(jsonString, options) {
    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (e) {
      throw new Error(`cannot decode ${this.getType().typeName} from JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
    return this.fromJson(json, options);
  }
  /**
   * Serialize the message to binary data.
   */
  toBinary(options) {
    const type = this.getType(), bin = type.runtime.bin, opt = bin.makeWriteOptions(options), writer = opt.writerFactory();
    bin.writeMessage(this, writer, opt);
    return writer.finish();
  }
  /**
   * Serialize the message to a JSON value, a JavaScript value that can be
   * passed to JSON.stringify().
   */
  toJson(options) {
    const type = this.getType(), json = type.runtime.json, opt = json.makeWriteOptions(options);
    return json.writeMessage(this, opt);
  }
  /**
   * Serialize the message to a JSON string.
   */
  toJsonString(options) {
    var _a;
    const value = this.toJson(options);
    return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
  }
  /**
   * Override for serialization behavior. This will be invoked when calling
   * JSON.stringify on this message (i.e. JSON.stringify(msg)).
   *
   * Note that this will not serialize google.protobuf.Any with a packed
   * message because the protobuf JSON format specifies that it needs to be
   * unpacked, and this is only possible with a type registry to look up the
   * message type.  As a result, attempting to serialize a message with this
   * type will throw an Error.
   *
   * This method is protected because you should not need to invoke it
   * directly -- instead use JSON.stringify or toJsonString for
   * stringified JSON.  Alternatively, if actual JSON is desired, you should
   * use toJson.
   */
  toJSON() {
    return this.toJson({
      emitDefaultValues: true
    });
  }
  /**
   * Retrieve the MessageType of this message - a singleton that represents
   * the protobuf message declaration and provides metadata for reflection-
   * based operations.
   */
  getType() {
    return Object.getPrototypeOf(this).constructor;
  }
};

// node_modules/@bufbuild/protobuf/dist/esm/private/message-type.js
function makeMessageType(runtime, typeName, fields, opt) {
  var _a;
  const localName = (_a = opt === null || opt === void 0 ? void 0 : opt.localName) !== null && _a !== void 0 ? _a : typeName.substring(typeName.lastIndexOf(".") + 1);
  const type = {
    [localName]: function(data) {
      runtime.util.initFields(this);
      runtime.util.initPartial(data, this);
    }
  }[localName];
  Object.setPrototypeOf(type.prototype, new Message());
  Object.assign(type, {
    runtime,
    typeName,
    fields: runtime.util.newFieldList(fields),
    fromBinary(bytes, options) {
      return new type().fromBinary(bytes, options);
    },
    fromJson(jsonValue, options) {
      return new type().fromJson(jsonValue, options);
    },
    fromJsonString(jsonString, options) {
      return new type().fromJsonString(jsonString, options);
    },
    equals(a, b) {
      return runtime.util.equals(type, a, b);
    }
  });
  return type;
}

// node_modules/@bufbuild/protobuf/dist/esm/google/varint.js
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
          throw new Error(`int64 invalid: ${value}`);
        }
        return bi;
      },
      uParse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > UMAX || bi < UMIN) {
          throw new Error(`uint64 invalid: ${value}`);
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
  const assertInt64String = (value) => assert(/^-?[0-9]+$/.test(value), `int64 invalid: ${value}`);
  const assertUInt64String = (value) => assert(/^[0-9]+$/.test(value), `uint64 invalid: ${value}`);
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
var protoInt64 = makeInt64Support();

// node_modules/@bufbuild/protobuf/dist/esm/scalar.js
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
var LongType;
(function(LongType2) {
  LongType2[LongType2["BIGINT"] = 0] = "BIGINT";
  LongType2[LongType2["STRING"] = 1] = "STRING";
})(LongType || (LongType = {}));

// node_modules/@bufbuild/protobuf/dist/esm/private/scalars.js
function scalarEquals(type, a, b) {
  if (a === b) {
    return true;
  }
  if (type == ScalarType.BYTES) {
    if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  switch (type) {
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return a == b;
  }
  return false;
}
function scalarZeroValue(type, longType) {
  switch (type) {
    case ScalarType.BOOL:
      return false;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return longType == 0 ? protoInt64.zero : "0";
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return 0;
    case ScalarType.BYTES:
      return new Uint8Array(0);
    case ScalarType.STRING:
      return "";
    default:
      return 0;
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

// node_modules/@bufbuild/protobuf/dist/esm/binary-encoding.js
var WireType;
(function(WireType2) {
  WireType2[WireType2["Varint"] = 0] = "Varint";
  WireType2[WireType2["Bit64"] = 1] = "Bit64";
  WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
  WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
  WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
  WireType2[WireType2["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));
var BinaryWriter = class {
  constructor(textEncoder) {
    this.stack = [];
    this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
    this.chunks = [];
    this.buf = [];
  }
  /**
   * Return all bytes written and reset this writer.
   */
  finish() {
    this.chunks.push(new Uint8Array(this.buf));
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
    let chunk = this.textEncoder.encode(value);
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
  constructor(buf, textDecoder) {
    this.varint64 = varint64read;
    this.uint32 = varint32read;
    this.buf = buf;
    this.len = buf.length;
    this.pos = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder();
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
      case WireType.Bit64:
        this.pos += 4;
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
    return this.textDecoder.decode(this.bytes());
  }
};

// node_modules/@bufbuild/protobuf/dist/esm/private/extensions.js
function makeExtension(runtime, typeName, extendee, field) {
  let fi;
  return {
    typeName,
    extendee,
    get field() {
      if (!fi) {
        const i = typeof field == "function" ? field() : field;
        i.name = typeName.split(".").pop();
        i.jsonName = `[${typeName}]`;
        fi = runtime.util.newFieldList([i]).list()[0];
      }
      return fi;
    },
    runtime
  };
}
function createExtensionContainer(extension) {
  const localName = extension.field.localName;
  const container = /* @__PURE__ */ Object.create(null);
  container[localName] = initExtensionField(extension);
  return [container, () => container[localName]];
}
function initExtensionField(ext) {
  const field = ext.field;
  if (field.repeated) {
    return [];
  }
  if (field.default !== void 0) {
    return field.default;
  }
  switch (field.kind) {
    case "enum":
      return field.T.values[0].no;
    case "scalar":
      return scalarZeroValue(field.T, field.L);
    case "message":
      const T = field.T, value = new T();
      return T.fieldWrapper ? T.fieldWrapper.unwrapField(value) : value;
    case "map":
      throw "map fields are not allowed to be extensions";
  }
}
function filterUnknownFields(unknownFields, field) {
  if (!field.repeated && (field.kind == "enum" || field.kind == "scalar")) {
    for (let i = unknownFields.length - 1; i >= 0; --i) {
      if (unknownFields[i].no == field.no) {
        return [unknownFields[i]];
      }
    }
    return [];
  }
  return unknownFields.filter((uf) => uf.no === field.no);
}

// node_modules/@bufbuild/protobuf/dist/esm/proto-base64.js
var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
var decTable = [];
for (let i = 0; i < encTable.length; i++)
  decTable[encTable[i].charCodeAt(0)] = i;
decTable["-".charCodeAt(0)] = encTable.indexOf("+");
decTable["_".charCodeAt(0)] = encTable.indexOf("/");
var protoBase64 = {
  /**
   * Decodes a base64 string to a byte array.
   *
   * - ignores white-space, including line breaks and tabs
   * - allows inner padding (can decode concatenated base64 strings)
   * - does not require padding
   * - understands base64url encoding:
   *   "-" instead of "+",
   *   "_" instead of "/",
   *   no padding
   */
  dec(base64Str) {
    let es = base64Str.length * 3 / 4;
    if (base64Str[base64Str.length - 2] == "=")
      es -= 2;
    else if (base64Str[base64Str.length - 1] == "=")
      es -= 1;
    let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
    for (let i = 0; i < base64Str.length; i++) {
      b = decTable[base64Str.charCodeAt(i)];
      if (b === void 0) {
        switch (base64Str[i]) {
          case "=":
            groupPos = 0;
          case "\n":
          case "\r":
          case "	":
          case " ":
            continue;
          default:
            throw Error("invalid base64 string.");
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
      throw Error("invalid base64 string.");
    return bytes.subarray(0, bytePos);
  },
  /**
   * Encode a byte array to a base64 string.
   */
  enc(bytes) {
    let base64 = "", groupPos = 0, b, p = 0;
    for (let i = 0; i < bytes.length; i++) {
      b = bytes[i];
      switch (groupPos) {
        case 0:
          base64 += encTable[b >> 2];
          p = (b & 3) << 4;
          groupPos = 1;
          break;
        case 1:
          base64 += encTable[p | b >> 4];
          p = (b & 15) << 2;
          groupPos = 2;
          break;
        case 2:
          base64 += encTable[p | b >> 6];
          base64 += encTable[b & 63];
          groupPos = 0;
          break;
      }
    }
    if (groupPos) {
      base64 += encTable[p];
      base64 += "=";
      if (groupPos == 1)
        base64 += "=";
    }
    return base64;
  }
};

// node_modules/@bufbuild/protobuf/dist/esm/extension-accessor.js
function getExtension(message, extension, options) {
  assertExtendee(extension, message);
  const opt = extension.runtime.bin.makeReadOptions(options);
  const ufs = filterUnknownFields(message.getType().runtime.bin.listUnknownFields(message), extension.field);
  const [container, get] = createExtensionContainer(extension);
  for (const uf of ufs) {
    extension.runtime.bin.readField(container, opt.readerFactory(uf.data), extension.field, uf.wireType, opt);
  }
  return get();
}
function setExtension(message, extension, value, options) {
  assertExtendee(extension, message);
  const readOpt = extension.runtime.bin.makeReadOptions(options);
  const writeOpt = extension.runtime.bin.makeWriteOptions(options);
  if (hasExtension(message, extension)) {
    const ufs = message.getType().runtime.bin.listUnknownFields(message).filter((uf) => uf.no != extension.field.no);
    message.getType().runtime.bin.discardUnknownFields(message);
    for (const uf of ufs) {
      message.getType().runtime.bin.onUnknownField(message, uf.no, uf.wireType, uf.data);
    }
  }
  const writer = writeOpt.writerFactory();
  let f = extension.field;
  if (!f.opt && !f.repeated && (f.kind == "enum" || f.kind == "scalar")) {
    f = Object.assign(Object.assign({}, extension.field), { opt: true });
  }
  extension.runtime.bin.writeField(f, value, writer, writeOpt);
  const reader = readOpt.readerFactory(writer.finish());
  while (reader.pos < reader.len) {
    const [no, wireType] = reader.tag();
    const data = reader.skip(wireType, no);
    message.getType().runtime.bin.onUnknownField(message, no, wireType, data);
  }
}
function hasExtension(message, extension) {
  const messageType = message.getType();
  return extension.extendee.typeName === messageType.typeName && !!messageType.runtime.bin.listUnknownFields(message).find((uf) => uf.no == extension.field.no);
}
function assertExtendee(extension, message) {
  assert(extension.extendee.typeName == message.getType().typeName, `extension ${extension.typeName} can only be applied to message ${extension.extendee.typeName}`);
}

// node_modules/@bufbuild/protobuf/dist/esm/private/reflect.js
function isFieldSet(field, target) {
  const localName = field.localName;
  if (field.repeated) {
    return target[localName].length > 0;
  }
  if (field.oneof) {
    return target[field.oneof.localName].case === localName;
  }
  switch (field.kind) {
    case "enum":
    case "scalar":
      if (field.opt || field.req) {
        return target[localName] !== void 0;
      }
      if (field.kind == "enum") {
        return target[localName] !== field.T.values[0].no;
      }
      return !isScalarZeroValue(field.T, target[localName]);
    case "message":
      return target[localName] !== void 0;
    case "map":
      return Object.keys(target[localName]).length > 0;
  }
}
function clearField(field, target) {
  const localName = field.localName;
  const implicitPresence = !field.opt && !field.req;
  if (field.repeated) {
    target[localName] = [];
  } else if (field.oneof) {
    target[field.oneof.localName] = { case: void 0 };
  } else {
    switch (field.kind) {
      case "map":
        target[localName] = {};
        break;
      case "enum":
        target[localName] = implicitPresence ? field.T.values[0].no : void 0;
        break;
      case "scalar":
        target[localName] = implicitPresence ? scalarZeroValue(field.T, field.L) : void 0;
        break;
      case "message":
        target[localName] = void 0;
        break;
    }
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/is-message.js
function isMessage(arg, type) {
  if (arg === null || typeof arg != "object") {
    return false;
  }
  if (!Object.getOwnPropertyNames(Message.prototype).every((m) => m in arg && typeof arg[m] == "function")) {
    return false;
  }
  const actualType = arg.getType();
  if (actualType === null || typeof actualType != "function" || !("typeName" in actualType) || typeof actualType.typeName != "string") {
    return false;
  }
  return type === void 0 ? true : actualType.typeName == type.typeName;
}

// node_modules/@bufbuild/protobuf/dist/esm/private/field-wrapper.js
function wrapField(type, value) {
  if (isMessage(value) || !type.fieldWrapper) {
    return value;
  }
  return type.fieldWrapper.wrapField(value);
}
var wktWrapperToScalarType = {
  "google.protobuf.DoubleValue": ScalarType.DOUBLE,
  "google.protobuf.FloatValue": ScalarType.FLOAT,
  "google.protobuf.Int64Value": ScalarType.INT64,
  "google.protobuf.UInt64Value": ScalarType.UINT64,
  "google.protobuf.Int32Value": ScalarType.INT32,
  "google.protobuf.UInt32Value": ScalarType.UINT32,
  "google.protobuf.BoolValue": ScalarType.BOOL,
  "google.protobuf.StringValue": ScalarType.STRING,
  "google.protobuf.BytesValue": ScalarType.BYTES
};

// node_modules/@bufbuild/protobuf/dist/esm/private/json-format.js
var jsonReadDefaults = {
  ignoreUnknownFields: false
};
var jsonWriteDefaults = {
  emitDefaultValues: false,
  enumAsInteger: false,
  useProtoFieldName: false,
  prettySpaces: 0
};
function makeReadOptions(options) {
  return options ? Object.assign(Object.assign({}, jsonReadDefaults), options) : jsonReadDefaults;
}
function makeWriteOptions(options) {
  return options ? Object.assign(Object.assign({}, jsonWriteDefaults), options) : jsonWriteDefaults;
}
var tokenNull = Symbol();
var tokenIgnoredUnknownEnum = Symbol();
function makeJsonFormat() {
  return {
    makeReadOptions,
    makeWriteOptions,
    readMessage(type, json, options, message) {
      if (json == null || Array.isArray(json) || typeof json != "object") {
        throw new Error(`cannot decode message ${type.typeName} from JSON: ${debugJsonValue(json)}`);
      }
      message = message !== null && message !== void 0 ? message : new type();
      const oneofSeen = /* @__PURE__ */ new Map();
      const registry = options.typeRegistry;
      for (const [jsonKey, jsonValue] of Object.entries(json)) {
        const field = type.fields.findJsonName(jsonKey);
        if (field) {
          if (field.oneof) {
            if (jsonValue === null && field.kind == "scalar") {
              continue;
            }
            const seen = oneofSeen.get(field.oneof);
            if (seen !== void 0) {
              throw new Error(`cannot decode message ${type.typeName} from JSON: multiple keys for oneof "${field.oneof.name}" present: "${seen}", "${jsonKey}"`);
            }
            oneofSeen.set(field.oneof, jsonKey);
          }
          readField(message, jsonValue, field, options, type);
        } else {
          let found = false;
          if ((registry === null || registry === void 0 ? void 0 : registry.findExtension) && jsonKey.startsWith("[") && jsonKey.endsWith("]")) {
            const ext = registry.findExtension(jsonKey.substring(1, jsonKey.length - 1));
            if (ext && ext.extendee.typeName == type.typeName) {
              found = true;
              const [container, get] = createExtensionContainer(ext);
              readField(container, jsonValue, ext.field, options, ext);
              setExtension(message, ext, get(), options);
            }
          }
          if (!found && !options.ignoreUnknownFields) {
            throw new Error(`cannot decode message ${type.typeName} from JSON: key "${jsonKey}" is unknown`);
          }
        }
      }
      return message;
    },
    writeMessage(message, options) {
      const type = message.getType();
      const json = {};
      let field;
      try {
        for (field of type.fields.byNumber()) {
          if (!isFieldSet(field, message)) {
            if (field.req) {
              throw `required field not set`;
            }
            if (!options.emitDefaultValues) {
              continue;
            }
            if (!canEmitFieldDefaultValue(field)) {
              continue;
            }
          }
          const value = field.oneof ? message[field.oneof.localName].value : message[field.localName];
          const jsonValue = writeField(field, value, options);
          if (jsonValue !== void 0) {
            json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
          }
        }
        const registry = options.typeRegistry;
        if (registry === null || registry === void 0 ? void 0 : registry.findExtensionFor) {
          for (const uf of type.runtime.bin.listUnknownFields(message)) {
            const ext = registry.findExtensionFor(type.typeName, uf.no);
            if (ext && hasExtension(message, ext)) {
              const value = getExtension(message, ext, options);
              const jsonValue = writeField(ext.field, value, options);
              if (jsonValue !== void 0) {
                json[ext.field.jsonName] = jsonValue;
              }
            }
          }
        }
      } catch (e) {
        const m = field ? `cannot encode field ${type.typeName}.${field.name} to JSON` : `cannot encode message ${type.typeName} to JSON`;
        const r = e instanceof Error ? e.message : String(e);
        throw new Error(m + (r.length > 0 ? `: ${r}` : ""));
      }
      return json;
    },
    readScalar(type, json, longType) {
      return readScalar(type, json, longType !== null && longType !== void 0 ? longType : LongType.BIGINT, true);
    },
    writeScalar(type, value, emitDefaultValues) {
      if (value === void 0) {
        return void 0;
      }
      if (emitDefaultValues || isScalarZeroValue(type, value)) {
        return writeScalar(type, value);
      }
      return void 0;
    },
    debug: debugJsonValue
  };
}
function debugJsonValue(json) {
  if (json === null) {
    return "null";
  }
  switch (typeof json) {
    case "object":
      return Array.isArray(json) ? "array" : "object";
    case "string":
      return json.length > 100 ? "string" : `"${json.split('"').join('\\"')}"`;
    default:
      return String(json);
  }
}
function readField(target, jsonValue, field, options, parentType) {
  let localName = field.localName;
  if (field.repeated) {
    assert(field.kind != "map");
    if (jsonValue === null) {
      return;
    }
    if (!Array.isArray(jsonValue)) {
      throw new Error(`cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`);
    }
    const targetArray = target[localName];
    for (const jsonItem of jsonValue) {
      if (jsonItem === null) {
        throw new Error(`cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonItem)}`);
      }
      switch (field.kind) {
        case "message":
          targetArray.push(field.T.fromJson(jsonItem, options));
          break;
        case "enum":
          const enumValue = readEnum(field.T, jsonItem, options.ignoreUnknownFields, true);
          if (enumValue !== tokenIgnoredUnknownEnum) {
            targetArray.push(enumValue);
          }
          break;
        case "scalar":
          try {
            targetArray.push(readScalar(field.T, jsonItem, field.L, true));
          } catch (e) {
            let m = `cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonItem)}`;
            if (e instanceof Error && e.message.length > 0) {
              m += `: ${e.message}`;
            }
            throw new Error(m);
          }
          break;
      }
    }
  } else if (field.kind == "map") {
    if (jsonValue === null) {
      return;
    }
    if (typeof jsonValue != "object" || Array.isArray(jsonValue)) {
      throw new Error(`cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`);
    }
    const targetMap = target[localName];
    for (const [jsonMapKey, jsonMapValue] of Object.entries(jsonValue)) {
      if (jsonMapValue === null) {
        throw new Error(`cannot decode field ${parentType.typeName}.${field.name} from JSON: map value null`);
      }
      let key;
      try {
        key = readMapKey(field.K, jsonMapKey);
      } catch (e) {
        let m = `cannot decode map key for field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`;
        if (e instanceof Error && e.message.length > 0) {
          m += `: ${e.message}`;
        }
        throw new Error(m);
      }
      switch (field.V.kind) {
        case "message":
          targetMap[key] = field.V.T.fromJson(jsonMapValue, options);
          break;
        case "enum":
          const enumValue = readEnum(field.V.T, jsonMapValue, options.ignoreUnknownFields, true);
          if (enumValue !== tokenIgnoredUnknownEnum) {
            targetMap[key] = enumValue;
          }
          break;
        case "scalar":
          try {
            targetMap[key] = readScalar(field.V.T, jsonMapValue, LongType.BIGINT, true);
          } catch (e) {
            let m = `cannot decode map value for field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`;
            if (e instanceof Error && e.message.length > 0) {
              m += `: ${e.message}`;
            }
            throw new Error(m);
          }
          break;
      }
    }
  } else {
    if (field.oneof) {
      target = target[field.oneof.localName] = { case: localName };
      localName = "value";
    }
    switch (field.kind) {
      case "message":
        const messageType = field.T;
        if (jsonValue === null && messageType.typeName != "google.protobuf.Value") {
          return;
        }
        let currentValue = target[localName];
        if (isMessage(currentValue)) {
          currentValue.fromJson(jsonValue, options);
        } else {
          target[localName] = currentValue = messageType.fromJson(jsonValue, options);
          if (messageType.fieldWrapper && !field.oneof) {
            target[localName] = messageType.fieldWrapper.unwrapField(currentValue);
          }
        }
        break;
      case "enum":
        const enumValue = readEnum(field.T, jsonValue, options.ignoreUnknownFields, false);
        switch (enumValue) {
          case tokenNull:
            clearField(field, target);
            break;
          case tokenIgnoredUnknownEnum:
            break;
          default:
            target[localName] = enumValue;
            break;
        }
        break;
      case "scalar":
        try {
          const scalarValue = readScalar(field.T, jsonValue, field.L, false);
          switch (scalarValue) {
            case tokenNull:
              clearField(field, target);
              break;
            default:
              target[localName] = scalarValue;
              break;
          }
        } catch (e) {
          let m = `cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`;
          if (e instanceof Error && e.message.length > 0) {
            m += `: ${e.message}`;
          }
          throw new Error(m);
        }
        break;
    }
  }
}
function readMapKey(type, json) {
  if (type === ScalarType.BOOL) {
    switch (json) {
      case "true":
        json = true;
        break;
      case "false":
        json = false;
        break;
    }
  }
  return readScalar(type, json, LongType.BIGINT, true).toString();
}
function readScalar(type, json, longType, nullAsZeroValue) {
  if (json === null) {
    if (nullAsZeroValue) {
      return scalarZeroValue(type, longType);
    }
    return tokenNull;
  }
  switch (type) {
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      if (json === "NaN")
        return Number.NaN;
      if (json === "Infinity")
        return Number.POSITIVE_INFINITY;
      if (json === "-Infinity")
        return Number.NEGATIVE_INFINITY;
      if (json === "") {
        break;
      }
      if (typeof json == "string" && json.trim().length !== json.length) {
        break;
      }
      if (typeof json != "string" && typeof json != "number") {
        break;
      }
      const float = Number(json);
      if (Number.isNaN(float)) {
        break;
      }
      if (!Number.isFinite(float)) {
        break;
      }
      if (type == ScalarType.FLOAT)
        assertFloat32(float);
      return float;
    case ScalarType.INT32:
    case ScalarType.FIXED32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
    case ScalarType.UINT32:
      let int32;
      if (typeof json == "number")
        int32 = json;
      else if (typeof json == "string" && json.length > 0) {
        if (json.trim().length === json.length)
          int32 = Number(json);
      }
      if (int32 === void 0)
        break;
      if (type == ScalarType.UINT32 || type == ScalarType.FIXED32)
        assertUInt32(int32);
      else
        assertInt32(int32);
      return int32;
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      if (typeof json != "number" && typeof json != "string")
        break;
      const long = protoInt64.parse(json);
      return longType ? long.toString() : long;
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      if (typeof json != "number" && typeof json != "string")
        break;
      const uLong = protoInt64.uParse(json);
      return longType ? uLong.toString() : uLong;
    case ScalarType.BOOL:
      if (typeof json !== "boolean")
        break;
      return json;
    case ScalarType.STRING:
      if (typeof json !== "string") {
        break;
      }
      try {
        encodeURIComponent(json);
      } catch (e) {
        throw new Error("invalid UTF8");
      }
      return json;
    case ScalarType.BYTES:
      if (json === "")
        return new Uint8Array(0);
      if (typeof json !== "string")
        break;
      return protoBase64.dec(json);
  }
  throw new Error();
}
function readEnum(type, json, ignoreUnknownFields, nullAsZeroValue) {
  if (json === null) {
    if (type.typeName == "google.protobuf.NullValue") {
      return 0;
    }
    return nullAsZeroValue ? type.values[0].no : tokenNull;
  }
  switch (typeof json) {
    case "number":
      if (Number.isInteger(json)) {
        return json;
      }
      break;
    case "string":
      const value = type.findName(json);
      if (value !== void 0) {
        return value.no;
      }
      if (ignoreUnknownFields) {
        return tokenIgnoredUnknownEnum;
      }
      break;
  }
  throw new Error(`cannot decode enum ${type.typeName} from JSON: ${debugJsonValue(json)}`);
}
function canEmitFieldDefaultValue(field) {
  if (field.repeated || field.kind == "map") {
    return true;
  }
  if (field.oneof) {
    return false;
  }
  if (field.kind == "message") {
    return false;
  }
  if (field.opt || field.req) {
    return false;
  }
  return true;
}
function writeField(field, value, options) {
  if (field.kind == "map") {
    assert(typeof value == "object" && value != null);
    const jsonObj = {};
    const entries = Object.entries(value);
    switch (field.V.kind) {
      case "scalar":
        for (const [entryKey, entryValue] of entries) {
          jsonObj[entryKey.toString()] = writeScalar(field.V.T, entryValue);
        }
        break;
      case "message":
        for (const [entryKey, entryValue] of entries) {
          jsonObj[entryKey.toString()] = entryValue.toJson(options);
        }
        break;
      case "enum":
        const enumType = field.V.T;
        for (const [entryKey, entryValue] of entries) {
          jsonObj[entryKey.toString()] = writeEnum(enumType, entryValue, options.enumAsInteger);
        }
        break;
    }
    return options.emitDefaultValues || entries.length > 0 ? jsonObj : void 0;
  }
  if (field.repeated) {
    assert(Array.isArray(value));
    const jsonArr = [];
    switch (field.kind) {
      case "scalar":
        for (let i = 0; i < value.length; i++) {
          jsonArr.push(writeScalar(field.T, value[i]));
        }
        break;
      case "enum":
        for (let i = 0; i < value.length; i++) {
          jsonArr.push(writeEnum(field.T, value[i], options.enumAsInteger));
        }
        break;
      case "message":
        for (let i = 0; i < value.length; i++) {
          jsonArr.push(value[i].toJson(options));
        }
        break;
    }
    return options.emitDefaultValues || jsonArr.length > 0 ? jsonArr : void 0;
  }
  switch (field.kind) {
    case "scalar":
      return writeScalar(field.T, value);
    case "enum":
      return writeEnum(field.T, value, options.enumAsInteger);
    case "message":
      return wrapField(field.T, value).toJson(options);
  }
}
function writeEnum(type, value, enumAsInteger) {
  var _a;
  assert(typeof value == "number");
  if (type.typeName == "google.protobuf.NullValue") {
    return null;
  }
  if (enumAsInteger) {
    return value;
  }
  const val = type.findNumber(value);
  return (_a = val === null || val === void 0 ? void 0 : val.name) !== null && _a !== void 0 ? _a : value;
}
function writeScalar(type, value) {
  switch (type) {
    case ScalarType.INT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
      assert(typeof value == "number");
      return value;
    case ScalarType.FLOAT:
    case ScalarType.DOUBLE:
      assert(typeof value == "number");
      if (Number.isNaN(value))
        return "NaN";
      if (value === Number.POSITIVE_INFINITY)
        return "Infinity";
      if (value === Number.NEGATIVE_INFINITY)
        return "-Infinity";
      return value;
    case ScalarType.STRING:
      assert(typeof value == "string");
      return value;
    case ScalarType.BOOL:
      assert(typeof value == "boolean");
      return value;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      assert(typeof value == "bigint" || typeof value == "string" || typeof value == "number");
      return value.toString();
    case ScalarType.BYTES:
      assert(value instanceof Uint8Array);
      return protoBase64.enc(value);
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/private/binary-format.js
var unknownFieldsSymbol = Symbol("@bufbuild/protobuf/unknown-fields");
var readDefaults = {
  readUnknownFields: true,
  readerFactory: (bytes) => new BinaryReader(bytes)
};
var writeDefaults = {
  writeUnknownFields: true,
  writerFactory: () => new BinaryWriter()
};
function makeReadOptions2(options) {
  return options ? Object.assign(Object.assign({}, readDefaults), options) : readDefaults;
}
function makeWriteOptions2(options) {
  return options ? Object.assign(Object.assign({}, writeDefaults), options) : writeDefaults;
}
function makeBinaryFormat() {
  return {
    makeReadOptions: makeReadOptions2,
    makeWriteOptions: makeWriteOptions2,
    listUnknownFields(message) {
      var _a;
      return (_a = message[unknownFieldsSymbol]) !== null && _a !== void 0 ? _a : [];
    },
    discardUnknownFields(message) {
      delete message[unknownFieldsSymbol];
    },
    writeUnknownFields(message, writer) {
      const m = message;
      const c = m[unknownFieldsSymbol];
      if (c) {
        for (const f of c) {
          writer.tag(f.no, f.wireType).raw(f.data);
        }
      }
    },
    onUnknownField(message, no, wireType, data) {
      const m = message;
      if (!Array.isArray(m[unknownFieldsSymbol])) {
        m[unknownFieldsSymbol] = [];
      }
      m[unknownFieldsSymbol].push({ no, wireType, data });
    },
    readMessage(message, reader, lengthOrEndTagFieldNo, options, delimitedMessageEncoding) {
      const type = message.getType();
      const end = delimitedMessageEncoding ? reader.len : reader.pos + lengthOrEndTagFieldNo;
      let fieldNo, wireType;
      while (reader.pos < end) {
        [fieldNo, wireType] = reader.tag();
        if (delimitedMessageEncoding === true && wireType == WireType.EndGroup) {
          break;
        }
        const field = type.fields.find(fieldNo);
        if (!field) {
          const data = reader.skip(wireType, fieldNo);
          if (options.readUnknownFields) {
            this.onUnknownField(message, fieldNo, wireType, data);
          }
          continue;
        }
        readField2(message, reader, field, wireType, options);
      }
      if (delimitedMessageEncoding && // eslint-disable-line @typescript-eslint/strict-boolean-expressions
      (wireType != WireType.EndGroup || fieldNo !== lengthOrEndTagFieldNo)) {
        throw new Error(`invalid end group tag`);
      }
    },
    readField: readField2,
    writeMessage(message, writer, options) {
      const type = message.getType();
      for (const field of type.fields.byNumber()) {
        if (!isFieldSet(field, message)) {
          if (field.req) {
            throw new Error(`cannot encode field ${type.typeName}.${field.name} to binary: required field not set`);
          }
          continue;
        }
        const value = field.oneof ? message[field.oneof.localName].value : message[field.localName];
        writeField2(field, value, writer, options);
      }
      if (options.writeUnknownFields) {
        this.writeUnknownFields(message, writer);
      }
      return writer;
    },
    writeField(field, value, writer, options) {
      if (value === void 0) {
        return void 0;
      }
      writeField2(field, value, writer, options);
    }
  };
}
function readField2(target, reader, field, wireType, options) {
  let { repeated, localName } = field;
  if (field.oneof) {
    target = target[field.oneof.localName];
    if (target.case != localName) {
      delete target.value;
    }
    target.case = localName;
    localName = "value";
  }
  switch (field.kind) {
    case "scalar":
    case "enum":
      const scalarType = field.kind == "enum" ? ScalarType.INT32 : field.T;
      let read = readScalar2;
      if (field.kind == "scalar" && field.L > 0) {
        read = readScalarLTString;
      }
      if (repeated) {
        let arr = target[localName];
        const isPacked = wireType == WireType.LengthDelimited && scalarType != ScalarType.STRING && scalarType != ScalarType.BYTES;
        if (isPacked) {
          let e = reader.uint32() + reader.pos;
          while (reader.pos < e) {
            arr.push(read(reader, scalarType));
          }
        } else {
          arr.push(read(reader, scalarType));
        }
      } else {
        target[localName] = read(reader, scalarType);
      }
      break;
    case "message":
      const messageType = field.T;
      if (repeated) {
        target[localName].push(readMessageField(reader, new messageType(), options, field));
      } else {
        if (isMessage(target[localName])) {
          readMessageField(reader, target[localName], options, field);
        } else {
          target[localName] = readMessageField(reader, new messageType(), options, field);
          if (messageType.fieldWrapper && !field.oneof && !field.repeated) {
            target[localName] = messageType.fieldWrapper.unwrapField(target[localName]);
          }
        }
      }
      break;
    case "map":
      let [mapKey, mapVal] = readMapEntry(field, reader, options);
      target[localName][mapKey] = mapVal;
      break;
  }
}
function readMessageField(reader, message, options, field) {
  const format = message.getType().runtime.bin;
  const delimited = field === null || field === void 0 ? void 0 : field.delimited;
  format.readMessage(
    message,
    reader,
    delimited ? field.no : reader.uint32(),
    // eslint-disable-line @typescript-eslint/strict-boolean-expressions
    options,
    delimited
  );
  return message;
}
function readMapEntry(field, reader, options) {
  const length = reader.uint32(), end = reader.pos + length;
  let key, val;
  while (reader.pos < end) {
    const [fieldNo] = reader.tag();
    switch (fieldNo) {
      case 1:
        key = readScalar2(reader, field.K);
        break;
      case 2:
        switch (field.V.kind) {
          case "scalar":
            val = readScalar2(reader, field.V.T);
            break;
          case "enum":
            val = reader.int32();
            break;
          case "message":
            val = readMessageField(reader, new field.V.T(), options, void 0);
            break;
        }
        break;
    }
  }
  if (key === void 0) {
    key = scalarZeroValue(field.K, LongType.BIGINT);
  }
  if (typeof key != "string" && typeof key != "number") {
    key = key.toString();
  }
  if (val === void 0) {
    switch (field.V.kind) {
      case "scalar":
        val = scalarZeroValue(field.V.T, LongType.BIGINT);
        break;
      case "enum":
        val = field.V.T.values[0].no;
        break;
      case "message":
        val = new field.V.T();
        break;
    }
  }
  return [key, val];
}
function readScalarLTString(reader, type) {
  const v = readScalar2(reader, type);
  return typeof v == "bigint" ? v.toString() : v;
}
function readScalar2(reader, type) {
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
function writeField2(field, value, writer, options) {
  assert(value !== void 0);
  const repeated = field.repeated;
  switch (field.kind) {
    case "scalar":
    case "enum":
      let scalarType = field.kind == "enum" ? ScalarType.INT32 : field.T;
      if (repeated) {
        assert(Array.isArray(value));
        if (field.packed) {
          writePacked(writer, scalarType, field.no, value);
        } else {
          for (const item of value) {
            writeScalar2(writer, scalarType, field.no, item);
          }
        }
      } else {
        writeScalar2(writer, scalarType, field.no, value);
      }
      break;
    case "message":
      if (repeated) {
        assert(Array.isArray(value));
        for (const item of value) {
          writeMessageField(writer, options, field, item);
        }
      } else {
        writeMessageField(writer, options, field, value);
      }
      break;
    case "map":
      assert(typeof value == "object" && value != null);
      for (const [key, val] of Object.entries(value)) {
        writeMapEntry(writer, options, field, key, val);
      }
      break;
  }
}
function writeMapEntry(writer, options, field, key, value) {
  writer.tag(field.no, WireType.LengthDelimited);
  writer.fork();
  let keyValue = key;
  switch (field.K) {
    case ScalarType.INT32:
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
      keyValue = Number.parseInt(key);
      break;
    case ScalarType.BOOL:
      assert(key == "true" || key == "false");
      keyValue = key == "true";
      break;
  }
  writeScalar2(writer, field.K, 1, keyValue);
  switch (field.V.kind) {
    case "scalar":
      writeScalar2(writer, field.V.T, 2, value);
      break;
    case "enum":
      writeScalar2(writer, ScalarType.INT32, 2, value);
      break;
    case "message":
      assert(value !== void 0);
      writer.tag(2, WireType.LengthDelimited).bytes(value.toBinary(options));
      break;
  }
  writer.join();
}
function writeMessageField(writer, options, field, value) {
  const message = wrapField(field.T, value);
  if (field.delimited)
    writer.tag(field.no, WireType.StartGroup).raw(message.toBinary(options)).tag(field.no, WireType.EndGroup);
  else
    writer.tag(field.no, WireType.LengthDelimited).bytes(message.toBinary(options));
}
function writeScalar2(writer, type, fieldNo, value) {
  assert(value !== void 0);
  let [wireType, method] = scalarTypeInfo(type);
  writer.tag(fieldNo, wireType)[method](value);
}
function writePacked(writer, type, fieldNo, value) {
  if (!value.length) {
    return;
  }
  writer.tag(fieldNo, WireType.LengthDelimited).fork();
  let [, method] = scalarTypeInfo(type);
  for (let i = 0; i < value.length; i++) {
    writer[method](value[i]);
  }
  writer.join();
}
function scalarTypeInfo(type) {
  let wireType = WireType.Varint;
  switch (type) {
    case ScalarType.BYTES:
    case ScalarType.STRING:
      wireType = WireType.LengthDelimited;
      break;
    case ScalarType.DOUBLE:
    case ScalarType.FIXED64:
    case ScalarType.SFIXED64:
      wireType = WireType.Bit64;
      break;
    case ScalarType.FIXED32:
    case ScalarType.SFIXED32:
    case ScalarType.FLOAT:
      wireType = WireType.Bit32;
      break;
  }
  const method = ScalarType[type].toLowerCase();
  return [wireType, method];
}

// node_modules/@bufbuild/protobuf/dist/esm/private/util-common.js
function makeUtilCommon() {
  return {
    setEnumType,
    initPartial(source, target) {
      if (source === void 0) {
        return;
      }
      const type = target.getType();
      for (const member of type.fields.byMember()) {
        const localName = member.localName, t = target, s = source;
        if (s[localName] == null) {
          continue;
        }
        switch (member.kind) {
          case "oneof":
            const sk = s[localName].case;
            if (sk === void 0) {
              continue;
            }
            const sourceField = member.findField(sk);
            let val = s[localName].value;
            if (sourceField && sourceField.kind == "message" && !isMessage(val, sourceField.T)) {
              val = new sourceField.T(val);
            } else if (sourceField && sourceField.kind === "scalar" && sourceField.T === ScalarType.BYTES) {
              val = toU8Arr(val);
            }
            t[localName] = { case: sk, value: val };
            break;
          case "scalar":
          case "enum":
            let copy = s[localName];
            if (member.T === ScalarType.BYTES) {
              copy = member.repeated ? copy.map(toU8Arr) : toU8Arr(copy);
            }
            t[localName] = copy;
            break;
          case "map":
            switch (member.V.kind) {
              case "scalar":
              case "enum":
                if (member.V.T === ScalarType.BYTES) {
                  for (const [k, v] of Object.entries(s[localName])) {
                    t[localName][k] = toU8Arr(v);
                  }
                } else {
                  Object.assign(t[localName], s[localName]);
                }
                break;
              case "message":
                const messageType = member.V.T;
                for (const k of Object.keys(s[localName])) {
                  let val2 = s[localName][k];
                  if (!messageType.fieldWrapper) {
                    val2 = new messageType(val2);
                  }
                  t[localName][k] = val2;
                }
                break;
            }
            break;
          case "message":
            const mt = member.T;
            if (member.repeated) {
              t[localName] = s[localName].map((val2) => isMessage(val2, mt) ? val2 : new mt(val2));
            } else {
              const val2 = s[localName];
              if (mt.fieldWrapper) {
                if (
                  // We can't use BytesValue.typeName as that will create a circular import
                  mt.typeName === "google.protobuf.BytesValue"
                ) {
                  t[localName] = toU8Arr(val2);
                } else {
                  t[localName] = val2;
                }
              } else {
                t[localName] = isMessage(val2, mt) ? val2 : new mt(val2);
              }
            }
            break;
        }
      }
    },
    // TODO use isFieldSet() here to support future field presence
    equals(type, a, b) {
      if (a === b) {
        return true;
      }
      if (!a || !b) {
        return false;
      }
      return type.fields.byMember().every((m) => {
        const va = a[m.localName];
        const vb = b[m.localName];
        if (m.repeated) {
          if (va.length !== vb.length) {
            return false;
          }
          switch (m.kind) {
            case "message":
              return va.every((a2, i) => m.T.equals(a2, vb[i]));
            case "scalar":
              return va.every((a2, i) => scalarEquals(m.T, a2, vb[i]));
            case "enum":
              return va.every((a2, i) => scalarEquals(ScalarType.INT32, a2, vb[i]));
          }
          throw new Error(`repeated cannot contain ${m.kind}`);
        }
        switch (m.kind) {
          case "message":
            return m.T.equals(va, vb);
          case "enum":
            return scalarEquals(ScalarType.INT32, va, vb);
          case "scalar":
            return scalarEquals(m.T, va, vb);
          case "oneof":
            if (va.case !== vb.case) {
              return false;
            }
            const s = m.findField(va.case);
            if (s === void 0) {
              return true;
            }
            switch (s.kind) {
              case "message":
                return s.T.equals(va.value, vb.value);
              case "enum":
                return scalarEquals(ScalarType.INT32, va.value, vb.value);
              case "scalar":
                return scalarEquals(s.T, va.value, vb.value);
            }
            throw new Error(`oneof cannot contain ${s.kind}`);
          case "map":
            const keys = Object.keys(va).concat(Object.keys(vb));
            switch (m.V.kind) {
              case "message":
                const messageType = m.V.T;
                return keys.every((k) => messageType.equals(va[k], vb[k]));
              case "enum":
                return keys.every((k) => scalarEquals(ScalarType.INT32, va[k], vb[k]));
              case "scalar":
                const scalarType = m.V.T;
                return keys.every((k) => scalarEquals(scalarType, va[k], vb[k]));
            }
            break;
        }
      });
    },
    // TODO use isFieldSet() here to support future field presence
    clone(message) {
      const type = message.getType(), target = new type(), any = target;
      for (const member of type.fields.byMember()) {
        const source = message[member.localName];
        let copy;
        if (member.repeated) {
          copy = source.map(cloneSingularField);
        } else if (member.kind == "map") {
          copy = any[member.localName];
          for (const [key, v] of Object.entries(source)) {
            copy[key] = cloneSingularField(v);
          }
        } else if (member.kind == "oneof") {
          const f = member.findField(source.case);
          copy = f ? { case: source.case, value: cloneSingularField(source.value) } : { case: void 0 };
        } else {
          copy = cloneSingularField(source);
        }
        any[member.localName] = copy;
      }
      for (const uf of type.runtime.bin.listUnknownFields(message)) {
        type.runtime.bin.onUnknownField(any, uf.no, uf.wireType, uf.data);
      }
      return target;
    }
  };
}
function cloneSingularField(value) {
  if (value === void 0) {
    return value;
  }
  if (isMessage(value)) {
    return value.clone();
  }
  if (value instanceof Uint8Array) {
    const c = new Uint8Array(value.byteLength);
    c.set(value);
    return c;
  }
  return value;
}
function toU8Arr(input) {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

// node_modules/@bufbuild/protobuf/dist/esm/private/proto-runtime.js
function makeProtoRuntime(syntax, newFieldList, initFields) {
  return {
    syntax,
    json: makeJsonFormat(),
    bin: makeBinaryFormat(),
    util: Object.assign(Object.assign({}, makeUtilCommon()), {
      newFieldList,
      initFields
    }),
    makeMessageType(typeName, fields, opt) {
      return makeMessageType(this, typeName, fields, opt);
    },
    makeEnum,
    makeEnumType,
    getEnumType,
    makeExtension(typeName, extendee, field) {
      return makeExtension(this, typeName, extendee, field);
    }
  };
}

// node_modules/@bufbuild/protobuf/dist/esm/private/field-list.js
var InternalFieldList = class {
  constructor(fields, normalizer) {
    this._fields = fields;
    this._normalizer = normalizer;
  }
  findJsonName(jsonName) {
    if (!this.jsonNames) {
      const t = {};
      for (const f of this.list()) {
        t[f.jsonName] = t[f.name] = f;
      }
      this.jsonNames = t;
    }
    return this.jsonNames[jsonName];
  }
  find(fieldNo) {
    if (!this.numbers) {
      const t = {};
      for (const f of this.list()) {
        t[f.no] = f;
      }
      this.numbers = t;
    }
    return this.numbers[fieldNo];
  }
  list() {
    if (!this.all) {
      this.all = this._normalizer(this._fields);
    }
    return this.all;
  }
  byNumber() {
    if (!this.numbersAsc) {
      this.numbersAsc = this.list().concat().sort((a, b) => a.no - b.no);
    }
    return this.numbersAsc;
  }
  byMember() {
    if (!this.members) {
      this.members = [];
      const a = this.members;
      let o;
      for (const f of this.list()) {
        if (f.oneof) {
          if (f.oneof !== o) {
            o = f.oneof;
            a.push(o);
          }
        } else {
          a.push(f);
        }
      }
    }
    return this.members;
  }
};

// node_modules/@bufbuild/protobuf/dist/esm/private/names.js
function localFieldName(protoName, inOneof) {
  const name = protoCamelCase(protoName);
  if (inOneof) {
    return name;
  }
  return safeObjectProperty(safeMessageProperty(name));
}
function localOneofName(protoName) {
  return localFieldName(protoName, false);
}
var fieldJsonName = protoCamelCase;
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
var reservedMessageProperties = /* @__PURE__ */ new Set([
  // names reserved by the runtime
  "getType",
  "clone",
  "equals",
  "fromBinary",
  "fromJson",
  "fromJsonString",
  "toBinary",
  "toJson",
  "toJsonString",
  // names reserved by the runtime for the future
  "toObject"
]);
var fallback = (name) => `${name}$`;
var safeMessageProperty = (name) => {
  if (reservedMessageProperties.has(name)) {
    return fallback(name);
  }
  return name;
};
var safeObjectProperty = (name) => {
  if (reservedObjectProperties.has(name)) {
    return fallback(name);
  }
  return name;
};

// node_modules/@bufbuild/protobuf/dist/esm/private/field.js
var InternalOneofInfo = class {
  constructor(name) {
    this.kind = "oneof";
    this.repeated = false;
    this.packed = false;
    this.opt = false;
    this.req = false;
    this.default = void 0;
    this.fields = [];
    this.name = name;
    this.localName = localOneofName(name);
  }
  addField(field) {
    assert(field.oneof === this, `field ${field.name} not one of ${this.name}`);
    this.fields.push(field);
  }
  findField(localName) {
    if (!this._lookup) {
      this._lookup = /* @__PURE__ */ Object.create(null);
      for (let i = 0; i < this.fields.length; i++) {
        this._lookup[this.fields[i].localName] = this.fields[i];
      }
    }
    return this._lookup[localName];
  }
};

// node_modules/@bufbuild/protobuf/dist/esm/private/field-normalize.js
function normalizeFieldInfos(fieldInfos, packedByDefault) {
  var _a, _b, _c, _d, _e, _f;
  const r = [];
  let o;
  for (const field of typeof fieldInfos == "function" ? fieldInfos() : fieldInfos) {
    const f = field;
    f.localName = localFieldName(field.name, field.oneof !== void 0);
    f.jsonName = (_a = field.jsonName) !== null && _a !== void 0 ? _a : fieldJsonName(field.name);
    f.repeated = (_b = field.repeated) !== null && _b !== void 0 ? _b : false;
    if (field.kind == "scalar") {
      f.L = (_c = field.L) !== null && _c !== void 0 ? _c : LongType.BIGINT;
    }
    f.delimited = (_d = field.delimited) !== null && _d !== void 0 ? _d : false;
    f.req = (_e = field.req) !== null && _e !== void 0 ? _e : false;
    f.opt = (_f = field.opt) !== null && _f !== void 0 ? _f : false;
    if (field.packed === void 0) {
      if (packedByDefault) {
        f.packed = field.kind == "enum" || field.kind == "scalar" && field.T != ScalarType.BYTES && field.T != ScalarType.STRING;
      } else {
        f.packed = false;
      }
    }
    if (field.oneof !== void 0) {
      const ooname = typeof field.oneof == "string" ? field.oneof : field.oneof.name;
      if (!o || o.name != ooname) {
        o = new InternalOneofInfo(ooname);
      }
      f.oneof = o;
      o.addField(f);
    }
    r.push(f);
  }
  return r;
}

// node_modules/@bufbuild/protobuf/dist/esm/proto3.js
var proto3 = makeProtoRuntime(
  "proto3",
  (fields) => {
    return new InternalFieldList(fields, (source) => normalizeFieldInfos(source, true));
  },
  // TODO merge with proto2 and initExtensionField, also see initPartial, equals, clone
  (target) => {
    for (const member of target.getType().fields.byMember()) {
      if (member.opt) {
        continue;
      }
      const name = member.localName, t = target;
      if (member.repeated) {
        t[name] = [];
        continue;
      }
      switch (member.kind) {
        case "oneof":
          t[name] = { case: void 0 };
          break;
        case "enum":
          t[name] = 0;
          break;
        case "map":
          t[name] = {};
          break;
        case "scalar":
          t[name] = scalarZeroValue(member.T, member.L);
          break;
        case "message":
          break;
      }
    }
  }
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/channel_pb.js
var channel_pb_exports = {};
__export(channel_pb_exports, {
  Channel: () => Channel,
  ChannelSettings: () => ChannelSettings,
  Channel_Role: () => Channel_Role,
  ModuleSettings: () => ModuleSettings
});
var ChannelSettings = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ChannelSettings",
  () => [
    {
      no: 1,
      name: "channel_num",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "psk",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    },
    {
      no: 3,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "id",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 5,
      name: "uplink_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 6,
      name: "downlink_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 7, name: "module_settings", kind: "message", T: ModuleSettings }
  ]
);
var ModuleSettings = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleSettings",
  () => [
    {
      no: 1,
      name: "position_precision",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "is_client_muted",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
var Channel = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Channel",
  () => [
    {
      no: 1,
      name: "index",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    { no: 2, name: "settings", kind: "message", T: ChannelSettings },
    { no: 3, name: "role", kind: "enum", T: proto3.getEnumType(Channel_Role) }
  ]
);
var Channel_Role = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Channel.Role",
  [
    { no: 0, name: "DISABLED" },
    { no: 1, name: "PRIMARY" },
    { no: 2, name: "SECONDARY" }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mesh_pb.js
var mesh_pb_exports = {};
__export(mesh_pb_exports, {
  ChunkedPayload: () => ChunkedPayload,
  ChunkedPayloadResponse: () => ChunkedPayloadResponse,
  Compressed: () => Compressed,
  Constants: () => Constants2,
  CriticalErrorCode: () => CriticalErrorCode,
  Data: () => Data,
  DeviceMetadata: () => DeviceMetadata,
  FromRadio: () => FromRadio,
  HardwareModel: () => HardwareModel,
  Heartbeat: () => Heartbeat,
  LogRecord: () => LogRecord,
  LogRecord_Level: () => LogRecord_Level,
  MeshPacket: () => MeshPacket,
  MeshPacket_Delayed: () => MeshPacket_Delayed,
  MeshPacket_Priority: () => MeshPacket_Priority,
  MqttClientProxyMessage: () => MqttClientProxyMessage,
  MyNodeInfo: () => MyNodeInfo,
  Neighbor: () => Neighbor,
  NeighborInfo: () => NeighborInfo,
  NodeInfo: () => NodeInfo,
  NodeRemoteHardwarePin: () => NodeRemoteHardwarePin,
  Position: () => Position,
  Position_AltSource: () => Position_AltSource,
  Position_LocSource: () => Position_LocSource,
  QueueStatus: () => QueueStatus,
  RouteDiscovery: () => RouteDiscovery,
  Routing: () => Routing,
  Routing_Error: () => Routing_Error,
  ToRadio: () => ToRadio,
  User: () => User,
  Waypoint: () => Waypoint,
  resend_chunks: () => resend_chunks
});

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/config_pb.js
var config_pb_exports = {};
__export(config_pb_exports, {
  Config: () => Config,
  Config_BluetoothConfig: () => Config_BluetoothConfig,
  Config_BluetoothConfig_PairingMode: () => Config_BluetoothConfig_PairingMode,
  Config_DeviceConfig: () => Config_DeviceConfig,
  Config_DeviceConfig_RebroadcastMode: () => Config_DeviceConfig_RebroadcastMode,
  Config_DeviceConfig_Role: () => Config_DeviceConfig_Role,
  Config_DisplayConfig: () => Config_DisplayConfig,
  Config_DisplayConfig_CompassOrientation: () => Config_DisplayConfig_CompassOrientation,
  Config_DisplayConfig_DisplayMode: () => Config_DisplayConfig_DisplayMode,
  Config_DisplayConfig_DisplayUnits: () => Config_DisplayConfig_DisplayUnits,
  Config_DisplayConfig_GpsCoordinateFormat: () => Config_DisplayConfig_GpsCoordinateFormat,
  Config_DisplayConfig_OledType: () => Config_DisplayConfig_OledType,
  Config_LoRaConfig: () => Config_LoRaConfig,
  Config_LoRaConfig_ModemPreset: () => Config_LoRaConfig_ModemPreset,
  Config_LoRaConfig_RegionCode: () => Config_LoRaConfig_RegionCode,
  Config_NetworkConfig: () => Config_NetworkConfig,
  Config_NetworkConfig_AddressMode: () => Config_NetworkConfig_AddressMode,
  Config_NetworkConfig_IpV4Config: () => Config_NetworkConfig_IpV4Config,
  Config_PositionConfig: () => Config_PositionConfig,
  Config_PositionConfig_GpsMode: () => Config_PositionConfig_GpsMode,
  Config_PositionConfig_PositionFlags: () => Config_PositionConfig_PositionFlags,
  Config_PowerConfig: () => Config_PowerConfig
});
var Config = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config",
  () => [
    { no: 1, name: "device", kind: "message", T: Config_DeviceConfig, oneof: "payload_variant" },
    { no: 2, name: "position", kind: "message", T: Config_PositionConfig, oneof: "payload_variant" },
    { no: 3, name: "power", kind: "message", T: Config_PowerConfig, oneof: "payload_variant" },
    { no: 4, name: "network", kind: "message", T: Config_NetworkConfig, oneof: "payload_variant" },
    { no: 5, name: "display", kind: "message", T: Config_DisplayConfig, oneof: "payload_variant" },
    { no: 6, name: "lora", kind: "message", T: Config_LoRaConfig, oneof: "payload_variant" },
    { no: 7, name: "bluetooth", kind: "message", T: Config_BluetoothConfig, oneof: "payload_variant" }
  ]
);
var Config_DeviceConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config.DeviceConfig",
  () => [
    { no: 1, name: "role", kind: "enum", T: proto3.getEnumType(Config_DeviceConfig_Role) },
    {
      no: 2,
      name: "serial_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 3,
      name: "debug_log_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 4,
      name: "button_gpio",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "buzzer_gpio",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 6, name: "rebroadcast_mode", kind: "enum", T: proto3.getEnumType(Config_DeviceConfig_RebroadcastMode) },
    {
      no: 7,
      name: "node_info_broadcast_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "double_tap_as_button_press",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 9,
      name: "is_managed",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 10,
      name: "disable_triple_click",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 11,
      name: "tzdef",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 12,
      name: "led_heartbeat_disabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ],
  { localName: "Config_DeviceConfig" }
);
var Config_DeviceConfig_Role = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.DeviceConfig.Role",
  [
    { no: 0, name: "CLIENT" },
    { no: 1, name: "CLIENT_MUTE" },
    { no: 2, name: "ROUTER" },
    { no: 3, name: "ROUTER_CLIENT" },
    { no: 4, name: "REPEATER" },
    { no: 5, name: "TRACKER" },
    { no: 6, name: "SENSOR" },
    { no: 7, name: "TAK" },
    { no: 8, name: "CLIENT_HIDDEN" },
    { no: 9, name: "LOST_AND_FOUND" },
    { no: 10, name: "TAK_TRACKER" }
  ]
);
var Config_DeviceConfig_RebroadcastMode = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.DeviceConfig.RebroadcastMode",
  [
    { no: 0, name: "ALL" },
    { no: 1, name: "ALL_SKIP_DECODING" },
    { no: 2, name: "LOCAL_ONLY" },
    { no: 3, name: "KNOWN_ONLY" }
  ]
);
var Config_PositionConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config.PositionConfig",
  () => [
    {
      no: 1,
      name: "position_broadcast_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "position_broadcast_smart_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 3,
      name: "fixed_position",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 4,
      name: "gps_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 5,
      name: "gps_update_interval",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "gps_attempt_time",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 7,
      name: "position_flags",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "rx_gpio",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 9,
      name: "tx_gpio",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 10,
      name: "broadcast_smart_minimum_distance",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 11,
      name: "broadcast_smart_minimum_interval_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 12,
      name: "gps_en_gpio",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 13, name: "gps_mode", kind: "enum", T: proto3.getEnumType(Config_PositionConfig_GpsMode) }
  ],
  { localName: "Config_PositionConfig" }
);
var Config_PositionConfig_PositionFlags = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.PositionConfig.PositionFlags",
  [
    { no: 0, name: "UNSET" },
    { no: 1, name: "ALTITUDE" },
    { no: 2, name: "ALTITUDE_MSL" },
    { no: 4, name: "GEOIDAL_SEPARATION" },
    { no: 8, name: "DOP" },
    { no: 16, name: "HVDOP" },
    { no: 32, name: "SATINVIEW" },
    { no: 64, name: "SEQ_NO" },
    { no: 128, name: "TIMESTAMP" },
    { no: 256, name: "HEADING" },
    { no: 512, name: "SPEED" }
  ]
);
var Config_PositionConfig_GpsMode = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.PositionConfig.GpsMode",
  [
    { no: 0, name: "DISABLED" },
    { no: 1, name: "ENABLED" },
    { no: 2, name: "NOT_PRESENT" }
  ]
);
var Config_PowerConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config.PowerConfig",
  () => [
    {
      no: 1,
      name: "is_power_saving",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "on_battery_shutdown_after_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "adc_multiplier_override",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 4,
      name: "wait_bluetooth_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "sds_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 7,
      name: "ls_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "min_wake_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 9,
      name: "device_battery_ina_address",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "Config_PowerConfig" }
);
var Config_NetworkConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config.NetworkConfig",
  () => [
    {
      no: 1,
      name: "wifi_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 3,
      name: "wifi_ssid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "wifi_psk",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 5,
      name: "ntp_server",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 6,
      name: "eth_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 7, name: "address_mode", kind: "enum", T: proto3.getEnumType(Config_NetworkConfig_AddressMode) },
    { no: 8, name: "ipv4_config", kind: "message", T: Config_NetworkConfig_IpV4Config },
    {
      no: 9,
      name: "rsyslog_server",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ],
  { localName: "Config_NetworkConfig" }
);
var Config_NetworkConfig_AddressMode = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.NetworkConfig.AddressMode",
  [
    { no: 0, name: "DHCP" },
    { no: 1, name: "STATIC" }
  ]
);
var Config_NetworkConfig_IpV4Config = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config.NetworkConfig.IpV4Config",
  () => [
    {
      no: 1,
      name: "ip",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 2,
      name: "gateway",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 3,
      name: "subnet",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 4,
      name: "dns",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    }
  ],
  { localName: "Config_NetworkConfig_IpV4Config" }
);
var Config_DisplayConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config.DisplayConfig",
  () => [
    {
      no: 1,
      name: "screen_on_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 2, name: "gps_format", kind: "enum", T: proto3.getEnumType(Config_DisplayConfig_GpsCoordinateFormat) },
    {
      no: 3,
      name: "auto_screen_carousel_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "compass_north_top",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 5,
      name: "flip_screen",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 6, name: "units", kind: "enum", T: proto3.getEnumType(Config_DisplayConfig_DisplayUnits) },
    { no: 7, name: "oled", kind: "enum", T: proto3.getEnumType(Config_DisplayConfig_OledType) },
    { no: 8, name: "displaymode", kind: "enum", T: proto3.getEnumType(Config_DisplayConfig_DisplayMode) },
    {
      no: 9,
      name: "heading_bold",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 10,
      name: "wake_on_tap_or_motion",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 11, name: "compass_orientation", kind: "enum", T: proto3.getEnumType(Config_DisplayConfig_CompassOrientation) }
  ],
  { localName: "Config_DisplayConfig" }
);
var Config_DisplayConfig_GpsCoordinateFormat = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.DisplayConfig.GpsCoordinateFormat",
  [
    { no: 0, name: "DEC" },
    { no: 1, name: "DMS" },
    { no: 2, name: "UTM" },
    { no: 3, name: "MGRS" },
    { no: 4, name: "OLC" },
    { no: 5, name: "OSGR" }
  ]
);
var Config_DisplayConfig_DisplayUnits = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.DisplayConfig.DisplayUnits",
  [
    { no: 0, name: "METRIC" },
    { no: 1, name: "IMPERIAL" }
  ]
);
var Config_DisplayConfig_OledType = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.DisplayConfig.OledType",
  [
    { no: 0, name: "OLED_AUTO" },
    { no: 1, name: "OLED_SSD1306" },
    { no: 2, name: "OLED_SH1106" },
    { no: 3, name: "OLED_SH1107" }
  ]
);
var Config_DisplayConfig_DisplayMode = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.DisplayConfig.DisplayMode",
  [
    { no: 0, name: "DEFAULT" },
    { no: 1, name: "TWOCOLOR" },
    { no: 2, name: "INVERTED" },
    { no: 3, name: "COLOR" }
  ]
);
var Config_DisplayConfig_CompassOrientation = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.DisplayConfig.CompassOrientation",
  [
    { no: 0, name: "DEGREES_0" },
    { no: 1, name: "DEGREES_90" },
    { no: 2, name: "DEGREES_180" },
    { no: 3, name: "DEGREES_270" },
    { no: 4, name: "DEGREES_0_INVERTED" },
    { no: 5, name: "DEGREES_90_INVERTED" },
    { no: 6, name: "DEGREES_180_INVERTED" },
    { no: 7, name: "DEGREES_270_INVERTED" }
  ]
);
var Config_LoRaConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config.LoRaConfig",
  () => [
    {
      no: 1,
      name: "use_preset",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 2, name: "modem_preset", kind: "enum", T: proto3.getEnumType(Config_LoRaConfig_ModemPreset) },
    {
      no: 3,
      name: "bandwidth",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "spread_factor",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "coding_rate",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "frequency_offset",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    { no: 7, name: "region", kind: "enum", T: proto3.getEnumType(Config_LoRaConfig_RegionCode) },
    {
      no: 8,
      name: "hop_limit",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 9,
      name: "tx_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 10,
      name: "tx_power",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 11,
      name: "channel_num",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 12,
      name: "override_duty_cycle",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 13,
      name: "sx126x_rx_boosted_gain",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 14,
      name: "override_frequency",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    { no: 103, name: "ignore_incoming", kind: "scalar", T: 13, repeated: true },
    {
      no: 104,
      name: "ignore_mqtt",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ],
  { localName: "Config_LoRaConfig" }
);
var Config_LoRaConfig_RegionCode = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.LoRaConfig.RegionCode",
  [
    { no: 0, name: "UNSET" },
    { no: 1, name: "US" },
    { no: 2, name: "EU_433" },
    { no: 3, name: "EU_868" },
    { no: 4, name: "CN" },
    { no: 5, name: "JP" },
    { no: 6, name: "ANZ" },
    { no: 7, name: "KR" },
    { no: 8, name: "TW" },
    { no: 9, name: "RU" },
    { no: 10, name: "IN" },
    { no: 11, name: "NZ_865" },
    { no: 12, name: "TH" },
    { no: 13, name: "LORA_24" },
    { no: 14, name: "UA_433" },
    { no: 15, name: "UA_868" },
    { no: 16, name: "MY_433" },
    { no: 17, name: "MY_919" },
    { no: 18, name: "SG_923" }
  ]
);
var Config_LoRaConfig_ModemPreset = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.LoRaConfig.ModemPreset",
  [
    { no: 0, name: "LONG_FAST" },
    { no: 1, name: "LONG_SLOW" },
    { no: 2, name: "VERY_LONG_SLOW" },
    { no: 3, name: "MEDIUM_SLOW" },
    { no: 4, name: "MEDIUM_FAST" },
    { no: 5, name: "SHORT_SLOW" },
    { no: 6, name: "SHORT_FAST" },
    { no: 7, name: "LONG_MODERATE" }
  ]
);
var Config_BluetoothConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Config.BluetoothConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 2, name: "mode", kind: "enum", T: proto3.getEnumType(Config_BluetoothConfig_PairingMode) },
    {
      no: 3,
      name: "fixed_pin",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "Config_BluetoothConfig" }
);
var Config_BluetoothConfig_PairingMode = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Config.BluetoothConfig.PairingMode",
  [
    { no: 0, name: "RANDOM_PIN" },
    { no: 1, name: "FIXED_PIN" },
    { no: 2, name: "NO_PIN" }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/portnums_pb.js
var portnums_pb_exports = {};
__export(portnums_pb_exports, {
  PortNum: () => PortNum
});
var PortNum = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.PortNum",
  [
    { no: 0, name: "UNKNOWN_APP" },
    { no: 1, name: "TEXT_MESSAGE_APP" },
    { no: 2, name: "REMOTE_HARDWARE_APP" },
    { no: 3, name: "POSITION_APP" },
    { no: 4, name: "NODEINFO_APP" },
    { no: 5, name: "ROUTING_APP" },
    { no: 6, name: "ADMIN_APP" },
    { no: 7, name: "TEXT_MESSAGE_COMPRESSED_APP" },
    { no: 8, name: "WAYPOINT_APP" },
    { no: 9, name: "AUDIO_APP" },
    { no: 10, name: "DETECTION_SENSOR_APP" },
    { no: 32, name: "REPLY_APP" },
    { no: 33, name: "IP_TUNNEL_APP" },
    { no: 34, name: "PAXCOUNTER_APP" },
    { no: 64, name: "SERIAL_APP" },
    { no: 65, name: "STORE_FORWARD_APP" },
    { no: 66, name: "RANGE_TEST_APP" },
    { no: 67, name: "TELEMETRY_APP" },
    { no: 68, name: "ZPS_APP" },
    { no: 69, name: "SIMULATOR_APP" },
    { no: 70, name: "TRACEROUTE_APP" },
    { no: 71, name: "NEIGHBORINFO_APP" },
    { no: 72, name: "ATAK_PLUGIN" },
    { no: 73, name: "MAP_REPORT_APP" },
    { no: 256, name: "PRIVATE_APP" },
    { no: 257, name: "ATAK_FORWARDER" },
    { no: 511, name: "MAX" }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/telemetry_pb.js
var telemetry_pb_exports = {};
__export(telemetry_pb_exports, {
  AirQualityMetrics: () => AirQualityMetrics,
  DeviceMetrics: () => DeviceMetrics,
  EnvironmentMetrics: () => EnvironmentMetrics,
  Nau7802Config: () => Nau7802Config,
  PowerMetrics: () => PowerMetrics,
  Telemetry: () => Telemetry,
  TelemetrySensorType: () => TelemetrySensorType
});
var TelemetrySensorType = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.TelemetrySensorType",
  [
    { no: 0, name: "SENSOR_UNSET" },
    { no: 1, name: "BME280" },
    { no: 2, name: "BME680" },
    { no: 3, name: "MCP9808" },
    { no: 4, name: "INA260" },
    { no: 5, name: "INA219" },
    { no: 6, name: "BMP280" },
    { no: 7, name: "SHTC3" },
    { no: 8, name: "LPS22" },
    { no: 9, name: "QMC6310" },
    { no: 10, name: "QMI8658" },
    { no: 11, name: "QMC5883L" },
    { no: 12, name: "SHT31" },
    { no: 13, name: "PMSA003I" },
    { no: 14, name: "INA3221" },
    { no: 15, name: "BMP085" },
    { no: 16, name: "RCWL9620" },
    { no: 17, name: "SHT4X" },
    { no: 18, name: "VEML7700" },
    { no: 19, name: "MLX90632" },
    { no: 20, name: "OPT3001" },
    { no: 21, name: "LTR390UV" },
    { no: 22, name: "TSL25911FN" },
    { no: 23, name: "AHT10" },
    { no: 24, name: "DFROBOT_LARK" },
    { no: 25, name: "NAU7802" }
  ]
);
var DeviceMetrics = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.DeviceMetrics",
  () => [
    {
      no: 1,
      name: "battery_level",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "voltage",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 3,
      name: "channel_utilization",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 4,
      name: "air_util_tx",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 5,
      name: "uptime_seconds",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var EnvironmentMetrics = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.EnvironmentMetrics",
  () => [
    {
      no: 1,
      name: "temperature",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 2,
      name: "relative_humidity",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 3,
      name: "barometric_pressure",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 4,
      name: "gas_resistance",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 5,
      name: "voltage",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 6,
      name: "current",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 7,
      name: "iaq",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "distance",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 9,
      name: "lux",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 10,
      name: "white_lux",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 11,
      name: "ir_lux",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 12,
      name: "uv_lux",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 13,
      name: "wind_direction",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 14,
      name: "wind_speed",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 15,
      name: "weight",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    }
  ]
);
var PowerMetrics = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.PowerMetrics",
  () => [
    {
      no: 1,
      name: "ch1_voltage",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 2,
      name: "ch1_current",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 3,
      name: "ch2_voltage",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 4,
      name: "ch2_current",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 5,
      name: "ch3_voltage",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 6,
      name: "ch3_current",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    }
  ]
);
var AirQualityMetrics = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.AirQualityMetrics",
  () => [
    {
      no: 1,
      name: "pm10_standard",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "pm25_standard",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "pm100_standard",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "pm10_environmental",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "pm25_environmental",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "pm100_environmental",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 7,
      name: "particles_03um",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "particles_05um",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 9,
      name: "particles_10um",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 10,
      name: "particles_25um",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 11,
      name: "particles_50um",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 12,
      name: "particles_100um",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var Telemetry = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Telemetry",
  () => [
    {
      no: 1,
      name: "time",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    { no: 2, name: "device_metrics", kind: "message", T: DeviceMetrics, oneof: "variant" },
    { no: 3, name: "environment_metrics", kind: "message", T: EnvironmentMetrics, oneof: "variant" },
    { no: 4, name: "air_quality_metrics", kind: "message", T: AirQualityMetrics, oneof: "variant" },
    { no: 5, name: "power_metrics", kind: "message", T: PowerMetrics, oneof: "variant" }
  ]
);
var Nau7802Config = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Nau7802Config",
  () => [
    {
      no: 1,
      name: "zeroOffset",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 2,
      name: "calibrationFactor",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/module_config_pb.js
var module_config_pb_exports = {};
__export(module_config_pb_exports, {
  ModuleConfig: () => ModuleConfig,
  ModuleConfig_AmbientLightingConfig: () => ModuleConfig_AmbientLightingConfig,
  ModuleConfig_AudioConfig: () => ModuleConfig_AudioConfig,
  ModuleConfig_AudioConfig_Audio_Baud: () => ModuleConfig_AudioConfig_Audio_Baud,
  ModuleConfig_CannedMessageConfig: () => ModuleConfig_CannedMessageConfig,
  ModuleConfig_CannedMessageConfig_InputEventChar: () => ModuleConfig_CannedMessageConfig_InputEventChar,
  ModuleConfig_DetectionSensorConfig: () => ModuleConfig_DetectionSensorConfig,
  ModuleConfig_ExternalNotificationConfig: () => ModuleConfig_ExternalNotificationConfig,
  ModuleConfig_MQTTConfig: () => ModuleConfig_MQTTConfig,
  ModuleConfig_MapReportSettings: () => ModuleConfig_MapReportSettings,
  ModuleConfig_NeighborInfoConfig: () => ModuleConfig_NeighborInfoConfig,
  ModuleConfig_PaxcounterConfig: () => ModuleConfig_PaxcounterConfig,
  ModuleConfig_RangeTestConfig: () => ModuleConfig_RangeTestConfig,
  ModuleConfig_RemoteHardwareConfig: () => ModuleConfig_RemoteHardwareConfig,
  ModuleConfig_SerialConfig: () => ModuleConfig_SerialConfig,
  ModuleConfig_SerialConfig_Serial_Baud: () => ModuleConfig_SerialConfig_Serial_Baud,
  ModuleConfig_SerialConfig_Serial_Mode: () => ModuleConfig_SerialConfig_Serial_Mode,
  ModuleConfig_StoreForwardConfig: () => ModuleConfig_StoreForwardConfig,
  ModuleConfig_TelemetryConfig: () => ModuleConfig_TelemetryConfig,
  RemoteHardwarePin: () => RemoteHardwarePin,
  RemoteHardwarePinType: () => RemoteHardwarePinType
});
var RemoteHardwarePinType = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.RemoteHardwarePinType",
  [
    { no: 0, name: "UNKNOWN" },
    { no: 1, name: "DIGITAL_READ" },
    { no: 2, name: "DIGITAL_WRITE" }
  ]
);
var ModuleConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig",
  () => [
    { no: 1, name: "mqtt", kind: "message", T: ModuleConfig_MQTTConfig, oneof: "payload_variant" },
    { no: 2, name: "serial", kind: "message", T: ModuleConfig_SerialConfig, oneof: "payload_variant" },
    { no: 3, name: "external_notification", kind: "message", T: ModuleConfig_ExternalNotificationConfig, oneof: "payload_variant" },
    { no: 4, name: "store_forward", kind: "message", T: ModuleConfig_StoreForwardConfig, oneof: "payload_variant" },
    { no: 5, name: "range_test", kind: "message", T: ModuleConfig_RangeTestConfig, oneof: "payload_variant" },
    { no: 6, name: "telemetry", kind: "message", T: ModuleConfig_TelemetryConfig, oneof: "payload_variant" },
    { no: 7, name: "canned_message", kind: "message", T: ModuleConfig_CannedMessageConfig, oneof: "payload_variant" },
    { no: 8, name: "audio", kind: "message", T: ModuleConfig_AudioConfig, oneof: "payload_variant" },
    { no: 9, name: "remote_hardware", kind: "message", T: ModuleConfig_RemoteHardwareConfig, oneof: "payload_variant" },
    { no: 10, name: "neighbor_info", kind: "message", T: ModuleConfig_NeighborInfoConfig, oneof: "payload_variant" },
    { no: 11, name: "ambient_lighting", kind: "message", T: ModuleConfig_AmbientLightingConfig, oneof: "payload_variant" },
    { no: 12, name: "detection_sensor", kind: "message", T: ModuleConfig_DetectionSensorConfig, oneof: "payload_variant" },
    { no: 13, name: "paxcounter", kind: "message", T: ModuleConfig_PaxcounterConfig, oneof: "payload_variant" }
  ]
);
var ModuleConfig_MQTTConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.MQTTConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "address",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "username",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "password",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 5,
      name: "encryption_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 6,
      name: "json_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 7,
      name: "tls_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 8,
      name: "root",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 9,
      name: "proxy_to_client_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 10,
      name: "map_reporting_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 11, name: "map_report_settings", kind: "message", T: ModuleConfig_MapReportSettings }
  ],
  { localName: "ModuleConfig_MQTTConfig" }
);
var ModuleConfig_MapReportSettings = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.MapReportSettings",
  () => [
    {
      no: 1,
      name: "publish_interval_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "position_precision",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "ModuleConfig_MapReportSettings" }
);
var ModuleConfig_RemoteHardwareConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.RemoteHardwareConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "allow_undefined_pin_access",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 3, name: "available_pins", kind: "message", T: RemoteHardwarePin, repeated: true }
  ],
  { localName: "ModuleConfig_RemoteHardwareConfig" }
);
var ModuleConfig_NeighborInfoConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.NeighborInfoConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "update_interval",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "ModuleConfig_NeighborInfoConfig" }
);
var ModuleConfig_DetectionSensorConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.DetectionSensorConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "minimum_broadcast_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "state_broadcast_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "send_bell",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 5,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 6,
      name: "monitor_pin",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 7,
      name: "detection_triggered_high",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 8,
      name: "use_pullup",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ],
  { localName: "ModuleConfig_DetectionSensorConfig" }
);
var ModuleConfig_AudioConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.AudioConfig",
  () => [
    {
      no: 1,
      name: "codec2_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "ptt_pin",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 3, name: "bitrate", kind: "enum", T: proto3.getEnumType(ModuleConfig_AudioConfig_Audio_Baud) },
    {
      no: 4,
      name: "i2s_ws",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "i2s_sd",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "i2s_din",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 7,
      name: "i2s_sck",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "ModuleConfig_AudioConfig" }
);
var ModuleConfig_AudioConfig_Audio_Baud = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.ModuleConfig.AudioConfig.Audio_Baud",
  [
    { no: 0, name: "CODEC2_DEFAULT" },
    { no: 1, name: "CODEC2_3200" },
    { no: 2, name: "CODEC2_2400" },
    { no: 3, name: "CODEC2_1600" },
    { no: 4, name: "CODEC2_1400" },
    { no: 5, name: "CODEC2_1300" },
    { no: 6, name: "CODEC2_1200" },
    { no: 7, name: "CODEC2_700" },
    { no: 8, name: "CODEC2_700B" }
  ]
);
var ModuleConfig_PaxcounterConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.PaxcounterConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "paxcounter_update_interval",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "wifi_threshold",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 4,
      name: "ble_threshold",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    }
  ],
  { localName: "ModuleConfig_PaxcounterConfig" }
);
var ModuleConfig_SerialConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.SerialConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "echo",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 3,
      name: "rxd",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "txd",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 5, name: "baud", kind: "enum", T: proto3.getEnumType(ModuleConfig_SerialConfig_Serial_Baud) },
    {
      no: 6,
      name: "timeout",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 7, name: "mode", kind: "enum", T: proto3.getEnumType(ModuleConfig_SerialConfig_Serial_Mode) },
    {
      no: 8,
      name: "override_console_serial_port",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ],
  { localName: "ModuleConfig_SerialConfig" }
);
var ModuleConfig_SerialConfig_Serial_Baud = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.ModuleConfig.SerialConfig.Serial_Baud",
  [
    { no: 0, name: "BAUD_DEFAULT" },
    { no: 1, name: "BAUD_110" },
    { no: 2, name: "BAUD_300" },
    { no: 3, name: "BAUD_600" },
    { no: 4, name: "BAUD_1200" },
    { no: 5, name: "BAUD_2400" },
    { no: 6, name: "BAUD_4800" },
    { no: 7, name: "BAUD_9600" },
    { no: 8, name: "BAUD_19200" },
    { no: 9, name: "BAUD_38400" },
    { no: 10, name: "BAUD_57600" },
    { no: 11, name: "BAUD_115200" },
    { no: 12, name: "BAUD_230400" },
    { no: 13, name: "BAUD_460800" },
    { no: 14, name: "BAUD_576000" },
    { no: 15, name: "BAUD_921600" }
  ]
);
var ModuleConfig_SerialConfig_Serial_Mode = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.ModuleConfig.SerialConfig.Serial_Mode",
  [
    { no: 0, name: "DEFAULT" },
    { no: 1, name: "SIMPLE" },
    { no: 2, name: "PROTO" },
    { no: 3, name: "TEXTMSG" },
    { no: 4, name: "NMEA" },
    { no: 5, name: "CALTOPO" }
  ]
);
var ModuleConfig_ExternalNotificationConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.ExternalNotificationConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "output_ms",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "output",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "output_vibra",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 9,
      name: "output_buzzer",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "active",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 5,
      name: "alert_message",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 10,
      name: "alert_message_vibra",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 11,
      name: "alert_message_buzzer",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 6,
      name: "alert_bell",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 12,
      name: "alert_bell_vibra",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 13,
      name: "alert_bell_buzzer",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 7,
      name: "use_pwm",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 14,
      name: "nag_timeout",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 15,
      name: "use_i2s_as_buzzer",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ],
  { localName: "ModuleConfig_ExternalNotificationConfig" }
);
var ModuleConfig_StoreForwardConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.StoreForwardConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "heartbeat",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 3,
      name: "records",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "history_return_max",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "history_return_window",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "ModuleConfig_StoreForwardConfig" }
);
var ModuleConfig_RangeTestConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.RangeTestConfig",
  () => [
    {
      no: 1,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "sender",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "save",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ],
  { localName: "ModuleConfig_RangeTestConfig" }
);
var ModuleConfig_TelemetryConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.TelemetryConfig",
  () => [
    {
      no: 1,
      name: "device_update_interval",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "environment_update_interval",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "environment_measurement_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 4,
      name: "environment_screen_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 5,
      name: "environment_display_fahrenheit",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 6,
      name: "air_quality_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 7,
      name: "air_quality_interval",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "power_measurement_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 9,
      name: "power_update_interval",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 10,
      name: "power_screen_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ],
  { localName: "ModuleConfig_TelemetryConfig" }
);
var ModuleConfig_CannedMessageConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.CannedMessageConfig",
  () => [
    {
      no: 1,
      name: "rotary1_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "inputbroker_pin_a",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "inputbroker_pin_b",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "inputbroker_pin_press",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 5, name: "inputbroker_event_cw", kind: "enum", T: proto3.getEnumType(ModuleConfig_CannedMessageConfig_InputEventChar) },
    { no: 6, name: "inputbroker_event_ccw", kind: "enum", T: proto3.getEnumType(ModuleConfig_CannedMessageConfig_InputEventChar) },
    { no: 7, name: "inputbroker_event_press", kind: "enum", T: proto3.getEnumType(ModuleConfig_CannedMessageConfig_InputEventChar) },
    {
      no: 8,
      name: "updown1_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 9,
      name: "enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 10,
      name: "allow_input_source",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 11,
      name: "send_bell",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ],
  { localName: "ModuleConfig_CannedMessageConfig" }
);
var ModuleConfig_CannedMessageConfig_InputEventChar = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.ModuleConfig.CannedMessageConfig.InputEventChar",
  [
    { no: 0, name: "NONE" },
    { no: 17, name: "UP" },
    { no: 18, name: "DOWN" },
    { no: 19, name: "LEFT" },
    { no: 20, name: "RIGHT" },
    { no: 10, name: "SELECT" },
    { no: 27, name: "BACK" },
    { no: 24, name: "CANCEL" }
  ]
);
var ModuleConfig_AmbientLightingConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ModuleConfig.AmbientLightingConfig",
  () => [
    {
      no: 1,
      name: "led_state",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "current",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "red",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "green",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "blue",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "ModuleConfig_AmbientLightingConfig" }
);
var RemoteHardwarePin = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.RemoteHardwarePin",
  () => [
    {
      no: 1,
      name: "gpio_pin",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 3, name: "type", kind: "enum", T: proto3.getEnumType(RemoteHardwarePinType) }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/xmodem_pb.js
var xmodem_pb_exports = {};
__export(xmodem_pb_exports, {
  XModem: () => XModem,
  XModem_Control: () => XModem_Control
});
var XModem = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.XModem",
  () => [
    { no: 1, name: "control", kind: "enum", T: proto3.getEnumType(XModem_Control) },
    {
      no: 2,
      name: "seq",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "crc16",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "buffer",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    }
  ]
);
var XModem_Control = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.XModem.Control",
  [
    { no: 0, name: "NUL" },
    { no: 1, name: "SOH" },
    { no: 2, name: "STX" },
    { no: 4, name: "EOT" },
    { no: 6, name: "ACK" },
    { no: 21, name: "NAK" },
    { no: 24, name: "CAN" },
    { no: 26, name: "CTRLZ" }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mesh_pb.js
var HardwareModel = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.HardwareModel",
  [
    { no: 0, name: "UNSET" },
    { no: 1, name: "TLORA_V2" },
    { no: 2, name: "TLORA_V1" },
    { no: 3, name: "TLORA_V2_1_1P6" },
    { no: 4, name: "TBEAM" },
    { no: 5, name: "HELTEC_V2_0" },
    { no: 6, name: "TBEAM_V0P7" },
    { no: 7, name: "T_ECHO" },
    { no: 8, name: "TLORA_V1_1P3" },
    { no: 9, name: "RAK4631" },
    { no: 10, name: "HELTEC_V2_1" },
    { no: 11, name: "HELTEC_V1" },
    { no: 12, name: "LILYGO_TBEAM_S3_CORE" },
    { no: 13, name: "RAK11200" },
    { no: 14, name: "NANO_G1" },
    { no: 15, name: "TLORA_V2_1_1P8" },
    { no: 16, name: "TLORA_T3_S3" },
    { no: 17, name: "NANO_G1_EXPLORER" },
    { no: 18, name: "NANO_G2_ULTRA" },
    { no: 19, name: "LORA_TYPE" },
    { no: 20, name: "WIPHONE" },
    { no: 21, name: "WIO_WM1110" },
    { no: 25, name: "STATION_G1" },
    { no: 26, name: "RAK11310" },
    { no: 27, name: "SENSELORA_RP2040" },
    { no: 28, name: "SENSELORA_S3" },
    { no: 29, name: "CANARYONE" },
    { no: 30, name: "RP2040_LORA" },
    { no: 31, name: "STATION_G2" },
    { no: 32, name: "LORA_RELAY_V1" },
    { no: 33, name: "NRF52840DK" },
    { no: 34, name: "PPR" },
    { no: 35, name: "GENIEBLOCKS" },
    { no: 36, name: "NRF52_UNKNOWN" },
    { no: 37, name: "PORTDUINO" },
    { no: 38, name: "ANDROID_SIM" },
    { no: 39, name: "DIY_V1" },
    { no: 40, name: "NRF52840_PCA10059" },
    { no: 41, name: "DR_DEV" },
    { no: 42, name: "M5STACK" },
    { no: 43, name: "HELTEC_V3" },
    { no: 44, name: "HELTEC_WSL_V3" },
    { no: 45, name: "BETAFPV_2400_TX" },
    { no: 46, name: "BETAFPV_900_NANO_TX" },
    { no: 47, name: "RPI_PICO" },
    { no: 48, name: "HELTEC_WIRELESS_TRACKER" },
    { no: 49, name: "HELTEC_WIRELESS_PAPER" },
    { no: 50, name: "T_DECK" },
    { no: 51, name: "T_WATCH_S3" },
    { no: 52, name: "PICOMPUTER_S3" },
    { no: 53, name: "HELTEC_HT62" },
    { no: 54, name: "EBYTE_ESP32_S3" },
    { no: 55, name: "ESP32_S3_PICO" },
    { no: 56, name: "CHATTER_2" },
    { no: 57, name: "HELTEC_WIRELESS_PAPER_V1_0" },
    { no: 58, name: "HELTEC_WIRELESS_TRACKER_V1_0" },
    { no: 59, name: "UNPHONE" },
    { no: 60, name: "TD_LORAC" },
    { no: 61, name: "CDEBYTE_EORA_S3" },
    { no: 62, name: "TWC_MESH_V4" },
    { no: 63, name: "NRF52_PROMICRO_DIY" },
    { no: 64, name: "RADIOMASTER_900_BANDIT_NANO" },
    { no: 65, name: "HELTEC_CAPSULE_SENSOR_V3" },
    { no: 255, name: "PRIVATE_HW" }
  ]
);
var Constants2 = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Constants",
  [
    { no: 0, name: "ZERO" },
    { no: 237, name: "DATA_PAYLOAD_LEN" }
  ]
);
var CriticalErrorCode = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.CriticalErrorCode",
  [
    { no: 0, name: "NONE" },
    { no: 1, name: "TX_WATCHDOG" },
    { no: 2, name: "SLEEP_ENTER_WAIT" },
    { no: 3, name: "NO_RADIO" },
    { no: 4, name: "UNSPECIFIED" },
    { no: 5, name: "UBLOX_UNIT_FAILED" },
    { no: 6, name: "NO_AXP192" },
    { no: 7, name: "INVALID_RADIO_SETTING" },
    { no: 8, name: "TRANSMIT_FAILED" },
    { no: 9, name: "BROWNOUT" },
    { no: 10, name: "SX1262_FAILURE" },
    { no: 11, name: "RADIO_SPI_BUG" }
  ]
);
var Position = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Position",
  () => [
    {
      no: 1,
      name: "latitude_i",
      kind: "scalar",
      T: 15
      /* ScalarType.SFIXED32 */
    },
    {
      no: 2,
      name: "longitude_i",
      kind: "scalar",
      T: 15
      /* ScalarType.SFIXED32 */
    },
    {
      no: 3,
      name: "altitude",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 4,
      name: "time",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    { no: 5, name: "location_source", kind: "enum", T: proto3.getEnumType(Position_LocSource) },
    { no: 6, name: "altitude_source", kind: "enum", T: proto3.getEnumType(Position_AltSource) },
    {
      no: 7,
      name: "timestamp",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 8,
      name: "timestamp_millis_adjust",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 9,
      name: "altitude_hae",
      kind: "scalar",
      T: 17
      /* ScalarType.SINT32 */
    },
    {
      no: 10,
      name: "altitude_geoidal_separation",
      kind: "scalar",
      T: 17
      /* ScalarType.SINT32 */
    },
    {
      no: 11,
      name: "PDOP",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 12,
      name: "HDOP",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 13,
      name: "VDOP",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 14,
      name: "gps_accuracy",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 15,
      name: "ground_speed",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 16,
      name: "ground_track",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 17,
      name: "fix_quality",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 18,
      name: "fix_type",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 19,
      name: "sats_in_view",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 20,
      name: "sensor_id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 21,
      name: "next_update",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 22,
      name: "seq_number",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 23,
      name: "precision_bits",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var Position_LocSource = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Position.LocSource",
  [
    { no: 0, name: "LOC_UNSET" },
    { no: 1, name: "LOC_MANUAL" },
    { no: 2, name: "LOC_INTERNAL" },
    { no: 3, name: "LOC_EXTERNAL" }
  ]
);
var Position_AltSource = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Position.AltSource",
  [
    { no: 0, name: "ALT_UNSET" },
    { no: 1, name: "ALT_MANUAL" },
    { no: 2, name: "ALT_INTERNAL" },
    { no: 3, name: "ALT_EXTERNAL" },
    { no: 4, name: "ALT_BAROMETRIC" }
  ]
);
var User = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.User",
  () => [
    {
      no: 1,
      name: "id",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "long_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "short_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "macaddr",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    },
    { no: 5, name: "hw_model", kind: "enum", T: proto3.getEnumType(HardwareModel) },
    {
      no: 6,
      name: "is_licensed",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 7, name: "role", kind: "enum", T: proto3.getEnumType(Config_DeviceConfig_Role) }
  ]
);
var RouteDiscovery = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.RouteDiscovery",
  () => [
    { no: 1, name: "route", kind: "scalar", T: 7, repeated: true }
  ]
);
var Routing = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Routing",
  () => [
    { no: 1, name: "route_request", kind: "message", T: RouteDiscovery, oneof: "variant" },
    { no: 2, name: "route_reply", kind: "message", T: RouteDiscovery, oneof: "variant" },
    { no: 3, name: "error_reason", kind: "enum", T: proto3.getEnumType(Routing_Error), oneof: "variant" }
  ]
);
var Routing_Error = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.Routing.Error",
  [
    { no: 0, name: "NONE" },
    { no: 1, name: "NO_ROUTE" },
    { no: 2, name: "GOT_NAK" },
    { no: 3, name: "TIMEOUT" },
    { no: 4, name: "NO_INTERFACE" },
    { no: 5, name: "MAX_RETRANSMIT" },
    { no: 6, name: "NO_CHANNEL" },
    { no: 7, name: "TOO_LARGE" },
    { no: 8, name: "NO_RESPONSE" },
    { no: 9, name: "DUTY_CYCLE_LIMIT" },
    { no: 32, name: "BAD_REQUEST" },
    { no: 33, name: "NOT_AUTHORIZED" }
  ]
);
var Data = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Data",
  () => [
    { no: 1, name: "portnum", kind: "enum", T: proto3.getEnumType(PortNum) },
    {
      no: 2,
      name: "payload",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    },
    {
      no: 3,
      name: "want_response",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 4,
      name: "dest",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 5,
      name: "source",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 6,
      name: "request_id",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 7,
      name: "reply_id",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 8,
      name: "emoji",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    }
  ]
);
var Waypoint = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Waypoint",
  () => [
    {
      no: 1,
      name: "id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "latitude_i",
      kind: "scalar",
      T: 15
      /* ScalarType.SFIXED32 */
    },
    {
      no: 3,
      name: "longitude_i",
      kind: "scalar",
      T: 15
      /* ScalarType.SFIXED32 */
    },
    {
      no: 4,
      name: "expire",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "locked_to",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 7,
      name: "description",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 8,
      name: "icon",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    }
  ]
);
var MqttClientProxyMessage = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.MqttClientProxyMessage",
  () => [
    {
      no: 1,
      name: "topic",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 2, name: "data", kind: "scalar", T: 12, oneof: "payload_variant" },
    { no: 3, name: "text", kind: "scalar", T: 9, oneof: "payload_variant" },
    {
      no: 4,
      name: "retained",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
var MeshPacket = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.MeshPacket",
  () => [
    {
      no: 1,
      name: "from",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 2,
      name: "to",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 3,
      name: "channel",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 4, name: "decoded", kind: "message", T: Data, oneof: "payload_variant" },
    { no: 5, name: "encrypted", kind: "scalar", T: 12, oneof: "payload_variant" },
    {
      no: 6,
      name: "id",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 7,
      name: "rx_time",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 8,
      name: "rx_snr",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 9,
      name: "hop_limit",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 10,
      name: "want_ack",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 11, name: "priority", kind: "enum", T: proto3.getEnumType(MeshPacket_Priority) },
    {
      no: 12,
      name: "rx_rssi",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    { no: 13, name: "delayed", kind: "enum", T: proto3.getEnumType(MeshPacket_Delayed) },
    {
      no: 14,
      name: "via_mqtt",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 15,
      name: "hop_start",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var MeshPacket_Priority = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.MeshPacket.Priority",
  [
    { no: 0, name: "UNSET" },
    { no: 1, name: "MIN" },
    { no: 10, name: "BACKGROUND" },
    { no: 64, name: "DEFAULT" },
    { no: 70, name: "RELIABLE" },
    { no: 120, name: "ACK" },
    { no: 127, name: "MAX" }
  ]
);
var MeshPacket_Delayed = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.MeshPacket.Delayed",
  [
    { no: 0, name: "NO_DELAY" },
    { no: 1, name: "DELAYED_BROADCAST" },
    { no: 2, name: "DELAYED_DIRECT" }
  ]
);
var NodeInfo = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.NodeInfo",
  () => [
    {
      no: 1,
      name: "num",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 2, name: "user", kind: "message", T: User },
    { no: 3, name: "position", kind: "message", T: Position },
    {
      no: 4,
      name: "snr",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 5,
      name: "last_heard",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    { no: 6, name: "device_metrics", kind: "message", T: DeviceMetrics },
    {
      no: 7,
      name: "channel",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "via_mqtt",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 9,
      name: "hops_away",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 10,
      name: "is_favorite",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
var MyNodeInfo = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.MyNodeInfo",
  () => [
    {
      no: 1,
      name: "my_node_num",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "reboot_count",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 11,
      name: "min_app_version",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var LogRecord = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.LogRecord",
  () => [
    {
      no: 1,
      name: "message",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "time",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 3,
      name: "source",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 4, name: "level", kind: "enum", T: proto3.getEnumType(LogRecord_Level) }
  ]
);
var LogRecord_Level = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.LogRecord.Level",
  [
    { no: 0, name: "UNSET" },
    { no: 50, name: "CRITICAL" },
    { no: 40, name: "ERROR" },
    { no: 30, name: "WARNING" },
    { no: 20, name: "INFO" },
    { no: 10, name: "DEBUG" },
    { no: 5, name: "TRACE" }
  ]
);
var QueueStatus = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.QueueStatus",
  () => [
    {
      no: 1,
      name: "res",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 2,
      name: "free",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "maxlen",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "mesh_packet_id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var FromRadio = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.FromRadio",
  () => [
    {
      no: 1,
      name: "id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 2, name: "packet", kind: "message", T: MeshPacket, oneof: "payload_variant" },
    { no: 3, name: "my_info", kind: "message", T: MyNodeInfo, oneof: "payload_variant" },
    { no: 4, name: "node_info", kind: "message", T: NodeInfo, oneof: "payload_variant" },
    { no: 5, name: "config", kind: "message", T: Config, oneof: "payload_variant" },
    { no: 6, name: "log_record", kind: "message", T: LogRecord, oneof: "payload_variant" },
    { no: 7, name: "config_complete_id", kind: "scalar", T: 13, oneof: "payload_variant" },
    { no: 8, name: "rebooted", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 9, name: "moduleConfig", kind: "message", T: ModuleConfig, oneof: "payload_variant" },
    { no: 10, name: "channel", kind: "message", T: Channel, oneof: "payload_variant" },
    { no: 11, name: "queueStatus", kind: "message", T: QueueStatus, oneof: "payload_variant" },
    { no: 12, name: "xmodemPacket", kind: "message", T: XModem, oneof: "payload_variant" },
    { no: 13, name: "metadata", kind: "message", T: DeviceMetadata, oneof: "payload_variant" },
    { no: 14, name: "mqttClientProxyMessage", kind: "message", T: MqttClientProxyMessage, oneof: "payload_variant" }
  ]
);
var ToRadio = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ToRadio",
  () => [
    { no: 1, name: "packet", kind: "message", T: MeshPacket, oneof: "payload_variant" },
    { no: 3, name: "want_config_id", kind: "scalar", T: 13, oneof: "payload_variant" },
    { no: 4, name: "disconnect", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 5, name: "xmodemPacket", kind: "message", T: XModem, oneof: "payload_variant" },
    { no: 6, name: "mqttClientProxyMessage", kind: "message", T: MqttClientProxyMessage, oneof: "payload_variant" },
    { no: 7, name: "heartbeat", kind: "message", T: Heartbeat, oneof: "payload_variant" }
  ]
);
var Compressed = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Compressed",
  () => [
    { no: 1, name: "portnum", kind: "enum", T: proto3.getEnumType(PortNum) },
    {
      no: 2,
      name: "data",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    }
  ]
);
var NeighborInfo = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.NeighborInfo",
  () => [
    {
      no: 1,
      name: "node_id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "last_sent_by_id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "node_broadcast_interval_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 4, name: "neighbors", kind: "message", T: Neighbor, repeated: true }
  ]
);
var Neighbor = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Neighbor",
  () => [
    {
      no: 1,
      name: "node_id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "snr",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 3,
      name: "last_rx_time",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 4,
      name: "node_broadcast_interval_secs",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var DeviceMetadata = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.DeviceMetadata",
  () => [
    {
      no: 1,
      name: "firmware_version",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "device_state_version",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "canShutdown",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 4,
      name: "hasWifi",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 5,
      name: "hasBluetooth",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 6,
      name: "hasEthernet",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 7, name: "role", kind: "enum", T: proto3.getEnumType(Config_DeviceConfig_Role) },
    {
      no: 8,
      name: "position_flags",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 9, name: "hw_model", kind: "enum", T: proto3.getEnumType(HardwareModel) },
    {
      no: 10,
      name: "hasRemoteHardware",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
var Heartbeat = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Heartbeat",
  []
);
var NodeRemoteHardwarePin = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.NodeRemoteHardwarePin",
  () => [
    {
      no: 1,
      name: "node_num",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 2, name: "pin", kind: "message", T: RemoteHardwarePin }
  ]
);
var ChunkedPayload = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ChunkedPayload",
  () => [
    {
      no: 1,
      name: "payload_id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "chunk_count",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "chunk_index",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "payload_chunk",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    }
  ]
);
var resend_chunks = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.resend_chunks",
  () => [
    { no: 1, name: "chunks", kind: "scalar", T: 13, repeated: true }
  ]
);
var ChunkedPayloadResponse = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ChunkedPayloadResponse",
  () => [
    {
      no: 1,
      name: "payload_id",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 2, name: "request_transfer", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 3, name: "accept_transfer", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 4, name: "resend_chunks", kind: "message", T: resend_chunks, oneof: "payload_variant" }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/connection_status_pb.js
var connection_status_pb_exports = {};
__export(connection_status_pb_exports, {
  BluetoothConnectionStatus: () => BluetoothConnectionStatus,
  DeviceConnectionStatus: () => DeviceConnectionStatus,
  EthernetConnectionStatus: () => EthernetConnectionStatus,
  NetworkConnectionStatus: () => NetworkConnectionStatus,
  SerialConnectionStatus: () => SerialConnectionStatus,
  WifiConnectionStatus: () => WifiConnectionStatus
});
var DeviceConnectionStatus = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.DeviceConnectionStatus",
  () => [
    { no: 1, name: "wifi", kind: "message", T: WifiConnectionStatus, opt: true },
    { no: 2, name: "ethernet", kind: "message", T: EthernetConnectionStatus, opt: true },
    { no: 3, name: "bluetooth", kind: "message", T: BluetoothConnectionStatus, opt: true },
    { no: 4, name: "serial", kind: "message", T: SerialConnectionStatus, opt: true }
  ]
);
var WifiConnectionStatus = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.WifiConnectionStatus",
  () => [
    { no: 1, name: "status", kind: "message", T: NetworkConnectionStatus },
    {
      no: 2,
      name: "ssid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "rssi",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    }
  ]
);
var EthernetConnectionStatus = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.EthernetConnectionStatus",
  () => [
    { no: 1, name: "status", kind: "message", T: NetworkConnectionStatus }
  ]
);
var NetworkConnectionStatus = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.NetworkConnectionStatus",
  () => [
    {
      no: 1,
      name: "ip_address",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    {
      no: 2,
      name: "is_connected",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 3,
      name: "is_mqtt_connected",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 4,
      name: "is_syslog_connected",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
var BluetoothConnectionStatus = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.BluetoothConnectionStatus",
  () => [
    {
      no: 1,
      name: "pin",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "rssi",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 3,
      name: "is_connected",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
var SerialConnectionStatus = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.SerialConnectionStatus",
  () => [
    {
      no: 1,
      name: "baud",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "is_connected",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/admin_pb.js
var AdminMessage = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.AdminMessage",
  () => [
    { no: 1, name: "get_channel_request", kind: "scalar", T: 13, oneof: "payload_variant" },
    { no: 2, name: "get_channel_response", kind: "message", T: Channel, oneof: "payload_variant" },
    { no: 3, name: "get_owner_request", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 4, name: "get_owner_response", kind: "message", T: User, oneof: "payload_variant" },
    { no: 5, name: "get_config_request", kind: "enum", T: proto3.getEnumType(AdminMessage_ConfigType), oneof: "payload_variant" },
    { no: 6, name: "get_config_response", kind: "message", T: Config, oneof: "payload_variant" },
    { no: 7, name: "get_module_config_request", kind: "enum", T: proto3.getEnumType(AdminMessage_ModuleConfigType), oneof: "payload_variant" },
    { no: 8, name: "get_module_config_response", kind: "message", T: ModuleConfig, oneof: "payload_variant" },
    { no: 10, name: "get_canned_message_module_messages_request", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 11, name: "get_canned_message_module_messages_response", kind: "scalar", T: 9, oneof: "payload_variant" },
    { no: 12, name: "get_device_metadata_request", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 13, name: "get_device_metadata_response", kind: "message", T: DeviceMetadata, oneof: "payload_variant" },
    { no: 14, name: "get_ringtone_request", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 15, name: "get_ringtone_response", kind: "scalar", T: 9, oneof: "payload_variant" },
    { no: 16, name: "get_device_connection_status_request", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 17, name: "get_device_connection_status_response", kind: "message", T: DeviceConnectionStatus, oneof: "payload_variant" },
    { no: 18, name: "set_ham_mode", kind: "message", T: HamParameters, oneof: "payload_variant" },
    { no: 19, name: "get_node_remote_hardware_pins_request", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 20, name: "get_node_remote_hardware_pins_response", kind: "message", T: NodeRemoteHardwarePinsResponse, oneof: "payload_variant" },
    { no: 21, name: "enter_dfu_mode_request", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 22, name: "delete_file_request", kind: "scalar", T: 9, oneof: "payload_variant" },
    { no: 32, name: "set_owner", kind: "message", T: User, oneof: "payload_variant" },
    { no: 33, name: "set_channel", kind: "message", T: Channel, oneof: "payload_variant" },
    { no: 34, name: "set_config", kind: "message", T: Config, oneof: "payload_variant" },
    { no: 35, name: "set_module_config", kind: "message", T: ModuleConfig, oneof: "payload_variant" },
    { no: 36, name: "set_canned_message_module_messages", kind: "scalar", T: 9, oneof: "payload_variant" },
    { no: 37, name: "set_ringtone_message", kind: "scalar", T: 9, oneof: "payload_variant" },
    { no: 38, name: "remove_by_nodenum", kind: "scalar", T: 13, oneof: "payload_variant" },
    { no: 39, name: "set_favorite_node", kind: "scalar", T: 13, oneof: "payload_variant" },
    { no: 40, name: "remove_favorite_node", kind: "scalar", T: 13, oneof: "payload_variant" },
    { no: 41, name: "set_fixed_position", kind: "message", T: Position, oneof: "payload_variant" },
    { no: 42, name: "remove_fixed_position", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 64, name: "begin_edit_settings", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 65, name: "commit_edit_settings", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 95, name: "reboot_ota_seconds", kind: "scalar", T: 5, oneof: "payload_variant" },
    { no: 96, name: "exit_simulator", kind: "scalar", T: 8, oneof: "payload_variant" },
    { no: 97, name: "reboot_seconds", kind: "scalar", T: 5, oneof: "payload_variant" },
    { no: 98, name: "shutdown_seconds", kind: "scalar", T: 5, oneof: "payload_variant" },
    { no: 99, name: "factory_reset", kind: "scalar", T: 5, oneof: "payload_variant" },
    { no: 100, name: "nodedb_reset", kind: "scalar", T: 5, oneof: "payload_variant" }
  ]
);
var AdminMessage_ConfigType = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.AdminMessage.ConfigType",
  [
    { no: 0, name: "DEVICE_CONFIG" },
    { no: 1, name: "POSITION_CONFIG" },
    { no: 2, name: "POWER_CONFIG" },
    { no: 3, name: "NETWORK_CONFIG" },
    { no: 4, name: "DISPLAY_CONFIG" },
    { no: 5, name: "LORA_CONFIG" },
    { no: 6, name: "BLUETOOTH_CONFIG" }
  ]
);
var AdminMessage_ModuleConfigType = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.AdminMessage.ModuleConfigType",
  [
    { no: 0, name: "MQTT_CONFIG" },
    { no: 1, name: "SERIAL_CONFIG" },
    { no: 2, name: "EXTNOTIF_CONFIG" },
    { no: 3, name: "STOREFORWARD_CONFIG" },
    { no: 4, name: "RANGETEST_CONFIG" },
    { no: 5, name: "TELEMETRY_CONFIG" },
    { no: 6, name: "CANNEDMSG_CONFIG" },
    { no: 7, name: "AUDIO_CONFIG" },
    { no: 8, name: "REMOTEHARDWARE_CONFIG" },
    { no: 9, name: "NEIGHBORINFO_CONFIG" },
    { no: 10, name: "AMBIENTLIGHTING_CONFIG" },
    { no: 11, name: "DETECTIONSENSOR_CONFIG" },
    { no: 12, name: "PAXCOUNTER_CONFIG" }
  ]
);
var HamParameters = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.HamParameters",
  () => [
    {
      no: 1,
      name: "call_sign",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "tx_power",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 3,
      name: "frequency",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 4,
      name: "short_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
var NodeRemoteHardwarePinsResponse = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.NodeRemoteHardwarePinsResponse",
  () => [
    { no: 1, name: "node_remote_hardware_pins", kind: "message", T: NodeRemoteHardwarePin, repeated: true }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/apponly_pb.js
var apponly_pb_exports = {};
__export(apponly_pb_exports, {
  ChannelSet: () => ChannelSet
});
var ChannelSet = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ChannelSet",
  () => [
    { no: 1, name: "settings", kind: "message", T: ChannelSettings, repeated: true },
    { no: 2, name: "lora_config", kind: "message", T: Config_LoRaConfig }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/cannedmessages_pb.js
var cannedmessages_pb_exports = {};
__export(cannedmessages_pb_exports, {
  CannedMessageModuleConfig: () => CannedMessageModuleConfig
});
var CannedMessageModuleConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.CannedMessageModuleConfig",
  () => [
    {
      no: 1,
      name: "messages",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/clientonly_pb.js
var clientonly_pb_exports = {};
__export(clientonly_pb_exports, {
  DeviceProfile: () => DeviceProfile
});

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/localonly_pb.js
var localonly_pb_exports = {};
__export(localonly_pb_exports, {
  LocalConfig: () => LocalConfig,
  LocalModuleConfig: () => LocalModuleConfig
});
var LocalConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.LocalConfig",
  () => [
    { no: 1, name: "device", kind: "message", T: Config_DeviceConfig },
    { no: 2, name: "position", kind: "message", T: Config_PositionConfig },
    { no: 3, name: "power", kind: "message", T: Config_PowerConfig },
    { no: 4, name: "network", kind: "message", T: Config_NetworkConfig },
    { no: 5, name: "display", kind: "message", T: Config_DisplayConfig },
    { no: 6, name: "lora", kind: "message", T: Config_LoRaConfig },
    { no: 7, name: "bluetooth", kind: "message", T: Config_BluetoothConfig },
    {
      no: 8,
      name: "version",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var LocalModuleConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.LocalModuleConfig",
  () => [
    { no: 1, name: "mqtt", kind: "message", T: ModuleConfig_MQTTConfig },
    { no: 2, name: "serial", kind: "message", T: ModuleConfig_SerialConfig },
    { no: 3, name: "external_notification", kind: "message", T: ModuleConfig_ExternalNotificationConfig },
    { no: 4, name: "store_forward", kind: "message", T: ModuleConfig_StoreForwardConfig },
    { no: 5, name: "range_test", kind: "message", T: ModuleConfig_RangeTestConfig },
    { no: 6, name: "telemetry", kind: "message", T: ModuleConfig_TelemetryConfig },
    { no: 7, name: "canned_message", kind: "message", T: ModuleConfig_CannedMessageConfig },
    { no: 9, name: "audio", kind: "message", T: ModuleConfig_AudioConfig },
    { no: 10, name: "remote_hardware", kind: "message", T: ModuleConfig_RemoteHardwareConfig },
    { no: 11, name: "neighbor_info", kind: "message", T: ModuleConfig_NeighborInfoConfig },
    { no: 12, name: "ambient_lighting", kind: "message", T: ModuleConfig_AmbientLightingConfig },
    { no: 13, name: "detection_sensor", kind: "message", T: ModuleConfig_DetectionSensorConfig },
    { no: 14, name: "paxcounter", kind: "message", T: ModuleConfig_PaxcounterConfig },
    {
      no: 8,
      name: "version",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/clientonly_pb.js
var DeviceProfile = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.DeviceProfile",
  () => [
    { no: 1, name: "long_name", kind: "scalar", T: 9, opt: true },
    { no: 2, name: "short_name", kind: "scalar", T: 9, opt: true },
    { no: 3, name: "channel_url", kind: "scalar", T: 9, opt: true },
    { no: 4, name: "config", kind: "message", T: LocalConfig, opt: true },
    { no: 5, name: "module_config", kind: "message", T: LocalModuleConfig, opt: true }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/deviceonly_pb.js
var deviceonly_pb_exports = {};
__export(deviceonly_pb_exports, {
  ChannelFile: () => ChannelFile,
  DeviceState: () => DeviceState,
  NodeInfoLite: () => NodeInfoLite,
  OEMStore: () => OEMStore,
  PositionLite: () => PositionLite,
  ScreenFonts: () => ScreenFonts
});
var ScreenFonts = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.ScreenFonts",
  [
    { no: 0, name: "FONT_SMALL" },
    { no: 1, name: "FONT_MEDIUM" },
    { no: 2, name: "FONT_LARGE" }
  ]
);
var PositionLite = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.PositionLite",
  () => [
    {
      no: 1,
      name: "latitude_i",
      kind: "scalar",
      T: 15
      /* ScalarType.SFIXED32 */
    },
    {
      no: 2,
      name: "longitude_i",
      kind: "scalar",
      T: 15
      /* ScalarType.SFIXED32 */
    },
    {
      no: 3,
      name: "altitude",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 4,
      name: "time",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    { no: 5, name: "location_source", kind: "enum", T: proto3.getEnumType(Position_LocSource) }
  ]
);
var NodeInfoLite = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.NodeInfoLite",
  () => [
    {
      no: 1,
      name: "num",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 2, name: "user", kind: "message", T: User },
    { no: 3, name: "position", kind: "message", T: PositionLite },
    {
      no: 4,
      name: "snr",
      kind: "scalar",
      T: 2
      /* ScalarType.FLOAT */
    },
    {
      no: 5,
      name: "last_heard",
      kind: "scalar",
      T: 7
      /* ScalarType.FIXED32 */
    },
    { no: 6, name: "device_metrics", kind: "message", T: DeviceMetrics },
    {
      no: 7,
      name: "channel",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "via_mqtt",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 9,
      name: "hops_away",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 10,
      name: "is_favorite",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
var DeviceState = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.DeviceState",
  () => [
    { no: 2, name: "my_node", kind: "message", T: MyNodeInfo },
    { no: 3, name: "owner", kind: "message", T: User },
    { no: 5, name: "receive_queue", kind: "message", T: MeshPacket, repeated: true },
    {
      no: 8,
      name: "version",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 7, name: "rx_text_message", kind: "message", T: MeshPacket },
    {
      no: 9,
      name: "no_save",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 11,
      name: "did_gps_reset",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 12, name: "rx_waypoint", kind: "message", T: MeshPacket },
    { no: 13, name: "node_remote_hardware_pins", kind: "message", T: NodeRemoteHardwarePin, repeated: true },
    { no: 14, name: "node_db_lite", kind: "message", T: NodeInfoLite, repeated: true }
  ]
);
var ChannelFile = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ChannelFile",
  () => [
    { no: 1, name: "channels", kind: "message", T: Channel, repeated: true },
    {
      no: 2,
      name: "version",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
var OEMStore = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.OEMStore",
  () => [
    {
      no: 1,
      name: "oem_icon_width",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "oem_icon_height",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "oem_icon_bits",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    },
    { no: 4, name: "oem_font", kind: "enum", T: proto3.getEnumType(ScreenFonts) },
    {
      no: 5,
      name: "oem_text",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 6,
      name: "oem_aes_key",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    },
    { no: 7, name: "oem_local_config", kind: "message", T: LocalConfig },
    { no: 8, name: "oem_local_module_config", kind: "message", T: LocalModuleConfig }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mqtt_pb.js
var mqtt_pb_exports = {};
__export(mqtt_pb_exports, {
  MapReport: () => MapReport,
  ServiceEnvelope: () => ServiceEnvelope
});
var ServiceEnvelope = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.ServiceEnvelope",
  () => [
    { no: 1, name: "packet", kind: "message", T: MeshPacket },
    {
      no: 2,
      name: "channel_id",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "gateway_id",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
var MapReport = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.MapReport",
  () => [
    {
      no: 1,
      name: "long_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "short_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 3, name: "role", kind: "enum", T: proto3.getEnumType(Config_DeviceConfig_Role) },
    { no: 4, name: "hw_model", kind: "enum", T: proto3.getEnumType(HardwareModel) },
    {
      no: 5,
      name: "firmware_version",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 6, name: "region", kind: "enum", T: proto3.getEnumType(Config_LoRaConfig_RegionCode) },
    { no: 7, name: "modem_preset", kind: "enum", T: proto3.getEnumType(Config_LoRaConfig_ModemPreset) },
    {
      no: 8,
      name: "has_default_channel",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 9,
      name: "latitude_i",
      kind: "scalar",
      T: 15
      /* ScalarType.SFIXED32 */
    },
    {
      no: 10,
      name: "longitude_i",
      kind: "scalar",
      T: 15
      /* ScalarType.SFIXED32 */
    },
    {
      no: 11,
      name: "altitude",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 12,
      name: "position_precision",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 13,
      name: "num_online_local_nodes",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/paxcount_pb.js
var paxcount_pb_exports = {};
__export(paxcount_pb_exports, {
  Paxcount: () => Paxcount
});
var Paxcount = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.Paxcount",
  () => [
    {
      no: 1,
      name: "wifi",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "ble",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "uptime",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/remote_hardware_pb.js
var remote_hardware_pb_exports = {};
__export(remote_hardware_pb_exports, {
  HardwareMessage: () => HardwareMessage,
  HardwareMessage_Type: () => HardwareMessage_Type
});
var HardwareMessage = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.HardwareMessage",
  () => [
    { no: 1, name: "type", kind: "enum", T: proto3.getEnumType(HardwareMessage_Type) },
    {
      no: 2,
      name: "gpio_mask",
      kind: "scalar",
      T: 4
      /* ScalarType.UINT64 */
    },
    {
      no: 3,
      name: "gpio_value",
      kind: "scalar",
      T: 4
      /* ScalarType.UINT64 */
    }
  ]
);
var HardwareMessage_Type = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.HardwareMessage.Type",
  [
    { no: 0, name: "UNSET" },
    { no: 1, name: "WRITE_GPIOS" },
    { no: 2, name: "WATCH_GPIOS" },
    { no: 3, name: "GPIOS_CHANGED" },
    { no: 4, name: "READ_GPIOS" },
    { no: 5, name: "READ_GPIOS_REPLY" }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/rtttl_pb.js
var rtttl_pb_exports = {};
__export(rtttl_pb_exports, {
  RTTTLConfig: () => RTTTLConfig
});
var RTTTLConfig = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.RTTTLConfig",
  () => [
    {
      no: 1,
      name: "ringtone",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);

// node_modules/@buf/meshtastic_protobufs.bufbuild_es/meshtastic/storeforward_pb.js
var storeforward_pb_exports = {};
__export(storeforward_pb_exports, {
  StoreAndForward: () => StoreAndForward,
  StoreAndForward_Heartbeat: () => StoreAndForward_Heartbeat,
  StoreAndForward_History: () => StoreAndForward_History,
  StoreAndForward_RequestResponse: () => StoreAndForward_RequestResponse,
  StoreAndForward_Statistics: () => StoreAndForward_Statistics
});
var StoreAndForward = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.StoreAndForward",
  () => [
    { no: 1, name: "rr", kind: "enum", T: proto3.getEnumType(StoreAndForward_RequestResponse) },
    { no: 2, name: "stats", kind: "message", T: StoreAndForward_Statistics, oneof: "variant" },
    { no: 3, name: "history", kind: "message", T: StoreAndForward_History, oneof: "variant" },
    { no: 4, name: "heartbeat", kind: "message", T: StoreAndForward_Heartbeat, oneof: "variant" },
    { no: 5, name: "text", kind: "scalar", T: 12, oneof: "variant" }
  ]
);
var StoreAndForward_RequestResponse = /* @__PURE__ */ proto3.makeEnum(
  "meshtastic.StoreAndForward.RequestResponse",
  [
    { no: 0, name: "UNSET" },
    { no: 1, name: "ROUTER_ERROR" },
    { no: 2, name: "ROUTER_HEARTBEAT" },
    { no: 3, name: "ROUTER_PING" },
    { no: 4, name: "ROUTER_PONG" },
    { no: 5, name: "ROUTER_BUSY" },
    { no: 6, name: "ROUTER_HISTORY" },
    { no: 7, name: "ROUTER_STATS" },
    { no: 8, name: "ROUTER_TEXT_DIRECT" },
    { no: 9, name: "ROUTER_TEXT_BROADCAST" },
    { no: 64, name: "CLIENT_ERROR" },
    { no: 65, name: "CLIENT_HISTORY" },
    { no: 66, name: "CLIENT_STATS" },
    { no: 67, name: "CLIENT_PING" },
    { no: 68, name: "CLIENT_PONG" },
    { no: 106, name: "CLIENT_ABORT" }
  ]
);
var StoreAndForward_Statistics = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.StoreAndForward.Statistics",
  () => [
    {
      no: 1,
      name: "messages_total",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "messages_saved",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "messages_max",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "up_time",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "requests",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "requests_history",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 7,
      name: "heartbeat",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 8,
      name: "return_max",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 9,
      name: "return_window",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "StoreAndForward_Statistics" }
);
var StoreAndForward_History = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.StoreAndForward.History",
  () => [
    {
      no: 1,
      name: "history_messages",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "window",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "last_request",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "StoreAndForward_History" }
);
var StoreAndForward_Heartbeat = /* @__PURE__ */ proto3.makeMessageType(
  "meshtastic.StoreAndForward.Heartbeat",
  () => [
    {
      no: 1,
      name: "period",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "secondary",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ],
  { localName: "StoreAndForward_Heartbeat" }
);

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
  return array.buffer.slice(
    array.byteOffset,
    array.byteLength + array.byteOffset
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
            const decoded = mesh_pb_exports.ToRadio.fromBinary(item.data);
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
    const toRadio = new mesh_pb_exports.ToRadio({
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
    return await this.sendRaw(toRadio.toBinary());
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
    this.myNodeInfo = new mesh_pb_exports.MyNodeInfo();
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
      waypointMessage.toBinary(),
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
    const meshPacket = new mesh_pb_exports.MeshPacket({
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
    const toRadioMessage = new mesh_pb_exports.ToRadio({
      payloadVariant: {
        case: "packet",
        value: meshPacket
      }
    });
    if (echoResponse) {
      meshPacket.rxTime = Math.trunc((/* @__PURE__ */ new Date()).getTime() / 1e3);
      this.handleMeshPacket(meshPacket);
    }
    return await this.sendRaw(toRadioMessage.toBinary(), meshPacket.id);
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
    const configMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "setConfig",
        value: config
      }
    });
    return this.sendPacket(
      configMessage.toBinary(),
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
    const moduleConfigMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "setModuleConfig",
        value: moduleConfig
      }
    });
    return await this.sendPacket(
      moduleConfigMessage.toBinary(),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /**
   * Sets devices owner data
   */
  async setOwner(owner) {
    this.log.debug(Emitter[8 /* SetOwner */], "\u{1F464} Setting owner");
    const setOwnerMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "setOwner",
        value: owner
      }
    });
    return await this.sendPacket(
      setOwnerMessage.toBinary(),
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
    const setChannelMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "setChannel",
        value: channel
      }
    });
    return await this.sendPacket(
      setChannelMessage.toBinary(),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  async setPosition(positionMessage) {
    return await this.sendPacket(
      positionMessage.toBinary(),
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
    const getChannelRequestMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "getChannelRequest",
        value: index + 1
      }
    });
    return await this.sendPacket(
      getChannelRequestMessage.toBinary(),
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
    const getRadioRequestMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "getConfigRequest",
        value: configType
      }
    });
    return await this.sendPacket(
      getRadioRequestMessage.toBinary(),
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
    const getRadioRequestMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "getModuleConfigRequest",
        value: moduleConfigType
      }
    });
    return await this.sendPacket(
      getRadioRequestMessage.toBinary(),
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
    const getOwnerRequestMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "getOwnerRequest",
        value: true
      }
    });
    return await this.sendPacket(
      getOwnerRequestMessage.toBinary(),
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
    const getDeviceMetricsRequestMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "getDeviceMetadataRequest",
        value: true
      }
    });
    return await this.sendPacket(
      getDeviceMetricsRequestMessage.toBinary(),
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
    const channel = new channel_pb_exports.Channel({
      index,
      role: channel_pb_exports.Channel_Role.DISABLED
    });
    const setChannelMessage = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "setChannel",
        value: channel
      }
    });
    return await this.sendPacket(
      setChannelMessage.toBinary(),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  async beginEditSettings() {
    this.events.onPendingSettingsChange.dispatch(true);
    const beginEditSettings = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "beginEditSettings",
        value: true
      }
    });
    return await this.sendPacket(
      beginEditSettings.toBinary(),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  async commitEditSettings() {
    this.events.onPendingSettingsChange.dispatch(false);
    const commitEditSettings = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "commitEditSettings",
        value: true
      }
    });
    return await this.sendPacket(
      commitEditSettings.toBinary(),
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
    const resetNodes = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "nodedbReset",
        value: 1
      }
    });
    return await this.sendPacket(
      resetNodes.toBinary(),
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
    const removeNodeByNum = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "removeByNodenum",
        value: nodeNum
      }
    });
    return await this.sendPacket(
      removeNodeByNum.toBinary(),
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
    const shutdown = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "shutdownSeconds",
        value: time
      }
    });
    return await this.sendPacket(
      shutdown.toBinary(),
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
    const reboot = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "rebootSeconds",
        value: time
      }
    });
    return await this.sendPacket(
      reboot.toBinary(),
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
    const rebootOta = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "rebootOtaSeconds",
        value: time
      }
    });
    return await this.sendPacket(
      rebootOta.toBinary(),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /** Factory resets the current node */
  async factoryReset() {
    this.log.debug(
      Emitter[30 /* FactoryReset */],
      "\u267B\uFE0F Factory resetting node"
    );
    const factoryReset = new admin_pb_exports.AdminMessage({
      payloadVariant: {
        case: "factoryReset",
        value: 1
      }
    });
    return await this.sendPacket(
      factoryReset.toBinary(),
      portnums_pb_exports.PortNum.ADMIN_APP,
      "self"
    );
  }
  /** Triggers the device configure process */
  configure() {
    this.log.debug(
      Emitter[17 /* Configure */],
      "\u2699\uFE0F Requesting device configuration"
    );
    this.updateDeviceStatus(6 /* DeviceConfiguring */);
    const toRadio = new mesh_pb_exports.ToRadio({
      payloadVariant: {
        case: "wantConfigId",
        value: this.configId
      }
    });
    return this.sendRaw(toRadio.toBinary());
  }
  /** Sends a trace route packet to the designated node */
  async traceRoute(destination) {
    const routeDiscovery = new mesh_pb_exports.RouteDiscovery({
      route: []
    });
    return await this.sendPacket(
      routeDiscovery.toBinary(),
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
    const decodedMessage = mesh_pb_exports.FromRadio.fromBinary(fromRadio);
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
        if (decodedMessage.payloadVariant.value.position) {
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
          data: remote_hardware_pb_exports.HardwareMessage.fromBinary(
            dataPacket.payload
          )
        });
        break;
      }
      case portnums_pb_exports.PortNum.POSITION_APP: {
        this.events.onPositionPacket.dispatch({
          ...packetMetadata,
          data: mesh_pb_exports.Position.fromBinary(dataPacket.payload)
        });
        break;
      }
      case portnums_pb_exports.PortNum.NODEINFO_APP: {
        this.events.onUserPacket.dispatch({
          ...packetMetadata,
          data: mesh_pb_exports.User.fromBinary(dataPacket.payload)
        });
        break;
      }
      case portnums_pb_exports.PortNum.ROUTING_APP: {
        routingPacket = mesh_pb_exports.Routing.fromBinary(dataPacket.payload);
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
        adminMessage = admin_pb_exports.AdminMessage.fromBinary(
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
          data: mesh_pb_exports.Waypoint.fromBinary(dataPacket.payload)
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
          data: paxcount_pb_exports.Paxcount.fromBinary(dataPacket.payload)
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
          data: telemetry_pb_exports.Telemetry.fromBinary(dataPacket.payload)
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
          data: mesh_pb_exports.RouteDiscovery.fromBinary(dataPacket.payload)
        });
        break;
      }
      case portnums_pb_exports.PortNum.NEIGHBORINFO_APP: {
        this.events.onNeighborInfoPacket.dispatch({
          ...packetMetadata,
          data: mesh_pb_exports.NeighborInfo.fromBinary(dataPacket.payload)
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
    });
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
  /** Short description */
  async readFromRadio() {
    let readBuffer = new ArrayBuffer(1);
    while (readBuffer.byteLength > 0 && this.fromRadioCharacteristic) {
      await this.fromRadioCharacteristic.readValue().then((value) => {
        readBuffer = value.buffer;
        if (value.byteLength > 0) {
          this.handleFromRadio(new Uint8Array(readBuffer));
        }
        this.updateDeviceStatus(5 /* DeviceConnected */);
      }).catch((e) => {
        readBuffer = new ArrayBuffer(0);
        this.log.error(
          Emitter[22 /* ReadFromRadio */],
          `\u274C ${e.message}`
        );
      });
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
    this.portId = `${tls ? "https://" : "http://"}${address}`;
    if (this.deviceStatus === 3 /* DeviceConnecting */ && await this.ping()) {
      this.log.debug(
        Emitter[20 /* Connect */],
        "Ping succeeded, starting configuration and request timer."
      );
      this.configure().catch(() => {
      });
      this.readLoop = setInterval(() => {
        this.readFromRadio().catch((e) => {
          this.log.error(
            Emitter[20 /* Connect */],
            `\u274C ${e.message}`
          );
        });
      }, fetchInterval);
    } else if (this.deviceStatus !== 2 /* DeviceDisconnected */) {
      setTimeout(() => {
        this.connect({
          address,
          fetchInterval,
          receiveBatchRequests,
          tls
        });
      }, 1e4);
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
  /** Pings device to check if it is avaliable */
  async ping() {
    this.log.debug(
      Emitter[21 /* Ping */],
      "Attempting device ping."
    );
    const { signal } = this.abortController;
    let pingSuccessful = false;
    await fetch(`${this.portId}/hotspot-detect.html`, {
      signal,
      mode: "no-cors"
    }).then(() => {
      pingSuccessful = true;
      this.updateDeviceStatus(5 /* DeviceConnected */);
    }).catch((e) => {
      pingSuccessful = false;
      this.log.error(Emitter[21 /* Ping */], `\u274C ${e.message}`);
      this.updateDeviceStatus(4 /* DeviceReconnecting */);
    });
    return pingSuccessful;
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
  protobufs_exports as Protobuf,
  SerialConnection,
  ServiceUuid,
  ToRadioUuid,
  types_exports as Types,
  utils_exports as Utils,
  broadcastNum,
  minFwVer
};
//# sourceMappingURL=index.js.map