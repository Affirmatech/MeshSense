import { Logger } from 'tslog';
import * as Protobuf from '@meshtastic/protobufs';
export { Protobuf };
import { SimpleEventDispatcher } from 'ste-simple-events';

interface QueueItem {
    id: number;
    data: Uint8Array;
    sent: boolean;
    added: Date;
    promise: Promise<number>;
}
interface HttpRetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
}
declare enum DeviceStatusEnum {
    DeviceRestarting = 1,
    DeviceDisconnected = 2,
    DeviceConnecting = 3,
    DeviceReconnecting = 4,
    DeviceConnected = 5,
    DeviceConfiguring = 6,
    DeviceConfigured = 7
}
type ConnectionParameters = HttpConnectionParameters | BleConnectionParameters | SerialConnectionParameters;
interface HttpConnectionParameters {
    /** Address The IP Address/Domain to connect to, without protocol */
    address: string;
    /**
     * Enables transport layer security. Notes: Slower, devices' certificate must
     * be trusted by the browser
     */
    tls?: boolean;
    /** Enables receiving messages all at once, versus one per request */
    receiveBatchRequests?: boolean;
    /**
     * (ms) Sets a fixed interval in that the device is fetched for new messages,
     * defaults to 5 seconds
     */
    fetchInterval: number;
}
interface BleConnectionParameters {
    /** Optional filter options for the web bluetooth api requestDevice() method */
    deviceFilter?: RequestDeviceOptions;
    /** Connect directly to a Bluetooth deivce, obtained from `getDevices()` */
    device?: BluetoothDevice;
}
interface SerialConnectionParameters {
    baudRate?: number;
    /** Connect directly to a Serial port, obtained from `getPorts()` */
    port?: SerialPort;
    concurrentLogOutput: boolean;
}
type LogEventPacket = LogEvent & {
    date: Date;
};
type PacketDestination = "broadcast" | "direct";
interface PacketMetadata<T> {
    id: number;
    rxTime: Date;
    type: PacketDestination;
    from: number;
    to: number;
    channel: ChannelNumber;
    data: T;
}
declare enum EmitterScope {
    MeshDevice = 1,
    SerialConnection = 2,
    NodeSerialConnection = 3,
    BleConnection = 4,
    HttpConnection = 5
}
declare enum Emitter {
    Constructor = 0,
    SendText = 1,
    SendWaypoint = 2,
    SendPacket = 3,
    SendRaw = 4,
    SetConfig = 5,
    SetModuleConfig = 6,
    ConfirmSetConfig = 7,
    SetOwner = 8,
    SetChannel = 9,
    ConfirmSetChannel = 10,
    ClearChannel = 11,
    GetChannel = 12,
    GetAllChannels = 13,
    GetConfig = 14,
    GetModuleConfig = 15,
    GetOwner = 16,
    Configure = 17,
    HandleFromRadio = 18,
    HandleMeshPacket = 19,
    Connect = 20,
    Ping = 21,
    ReadFromRadio = 22,
    WriteToRadio = 23,
    SetDebugMode = 24,
    GetMetadata = 25,
    ResetNodes = 26,
    Shutdown = 27,
    Reboot = 28,
    RebootOta = 29,
    FactoryReset = 30,
    EnterDfuMode = 31,
    RemoveNodeByNum = 32,
    SetCannedMessages = 33
}
interface LogEvent {
    scope: EmitterScope;
    emitter: Emitter;
    message: string;
    level: Protobuf.Mesh.LogRecord_Level;
    packet?: Uint8Array;
}
declare enum ChannelNumber {
    Primary = 0,
    Channel1 = 1,
    Channel2 = 2,
    Channel3 = 3,
    Channel4 = 4,
    Channel5 = 5,
    Channel6 = 6,
    Admin = 7
}
type ConnectionType = BleConnection | HttpConnection | SerialConnection;
type ConnectionTypeName = "ble" | "http" | "serial";
type Destination = number | "self" | "broadcast";
interface PacketError {
    id: number;
    error: Protobuf.Mesh.Routing_Error;
}

type types_BleConnectionParameters = BleConnectionParameters;
type types_ChannelNumber = ChannelNumber;
declare const types_ChannelNumber: typeof ChannelNumber;
type types_ConnectionParameters = ConnectionParameters;
type types_ConnectionType = ConnectionType;
type types_ConnectionTypeName = ConnectionTypeName;
type types_Destination = Destination;
type types_DeviceStatusEnum = DeviceStatusEnum;
declare const types_DeviceStatusEnum: typeof DeviceStatusEnum;
type types_Emitter = Emitter;
declare const types_Emitter: typeof Emitter;
type types_EmitterScope = EmitterScope;
declare const types_EmitterScope: typeof EmitterScope;
type types_HttpConnectionParameters = HttpConnectionParameters;
type types_HttpRetryConfig = HttpRetryConfig;
type types_LogEvent = LogEvent;
type types_LogEventPacket = LogEventPacket;
type types_PacketDestination = PacketDestination;
type types_PacketError = PacketError;
type types_PacketMetadata<T> = PacketMetadata<T>;
type types_QueueItem = QueueItem;
type types_SerialConnectionParameters = SerialConnectionParameters;
declare namespace types {
  export { type types_BleConnectionParameters as BleConnectionParameters, types_ChannelNumber as ChannelNumber, type types_ConnectionParameters as ConnectionParameters, type types_ConnectionType as ConnectionType, type types_ConnectionTypeName as ConnectionTypeName, type types_Destination as Destination, types_DeviceStatusEnum as DeviceStatusEnum, types_Emitter as Emitter, types_EmitterScope as EmitterScope, type types_HttpConnectionParameters as HttpConnectionParameters, type types_HttpRetryConfig as HttpRetryConfig, type types_LogEvent as LogEvent, type types_LogEventPacket as LogEventPacket, type types_PacketDestination as PacketDestination, type types_PacketError as PacketError, type types_PacketMetadata as PacketMetadata, type types_QueueItem as QueueItem, type types_SerialConnectionParameters as SerialConnectionParameters };
}

declare class EventSystem {
    /**
     * Fires when a new FromRadio message has been received from the device
     *
     * @event onLogEvent
     */
    readonly onLogEvent: SimpleEventDispatcher<LogEventPacket>;
    /**
     * Fires when a new FromRadio message has been received from the device
     *
     * @event onFromRadio
     */
    readonly onFromRadio: SimpleEventDispatcher<Protobuf.Mesh.FromRadio>;
    /**
     * Fires when a new FromRadio message containing a Data packet has been
     * received from the device
     *
     * @event onMeshPacket
     */
    readonly onMeshPacket: SimpleEventDispatcher<Protobuf.Mesh.MeshPacket>;
    /**
     * Fires when a new MyNodeInfo message has been received from the device
     *
     * @event onMyNodeInfo
     */
    readonly onMyNodeInfo: SimpleEventDispatcher<Protobuf.Mesh.MyNodeInfo>;
    /**
     * Fires when a new MeshPacket message containing a NodeInfo packet has been
     * received from device
     *
     * @event onNodeInfoPacket
     */
    readonly onNodeInfoPacket: SimpleEventDispatcher<Protobuf.Mesh.NodeInfo>;
    /**
     * Fires when a new Channel message is received
     *
     * @event onChannelPacket
     */
    readonly onChannelPacket: SimpleEventDispatcher<Protobuf.Channel.Channel>;
    /**
     * Fires when a new Config message is received
     *
     * @event onConfigPacket
     */
    readonly onConfigPacket: SimpleEventDispatcher<Protobuf.Config.Config>;
    /**
     * Fires when a new ModuleConfig message is received
     *
     * @event onModuleConfigPacket
     */
    readonly onModuleConfigPacket: SimpleEventDispatcher<Protobuf.ModuleConfig.ModuleConfig>;
    /**
     * Fires when a new MeshPacket message containing a ATAK packet has been
     * received from device
     *
     * @event onAtakPacket
     */
    readonly onAtakPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Text packet has been
     * received from device
     *
     * @event onMessagePacket
     */
    readonly onMessagePacket: SimpleEventDispatcher<PacketMetadata<string>>;
    /**
     * Fires when a new MeshPacket message containing a Remote Hardware packet has
     * been received from device
     *
     * @event onRemoteHardwarePacket
     */
    readonly onRemoteHardwarePacket: SimpleEventDispatcher<PacketMetadata<Protobuf.RemoteHardware.HardwareMessage>>;
    /**
     * Fires when a new MeshPacket message containing a Position packet has been
     * received from device
     *
     * @event onPositionPacket
     */
    readonly onPositionPacket: SimpleEventDispatcher<PacketMetadata<Protobuf.Mesh.Position>>;
    /**
     * Fires when a new MeshPacket message containing a User packet has been
     * received from device
     *
     * @event onUserPacket
     */
    readonly onUserPacket: SimpleEventDispatcher<PacketMetadata<Protobuf.Mesh.User>>;
    /**
     * Fires when a new MeshPacket message containing a Routing packet has been
     * received from device
     *
     * @event onRoutingPacket
     */
    readonly onRoutingPacket: SimpleEventDispatcher<PacketMetadata<Protobuf.Mesh.Routing>>;
    /**
     * Fires when the device receives a Metadata packet
     *
     * @event onDeviceMetadataPacket
     */
    readonly onDeviceMetadataPacket: SimpleEventDispatcher<PacketMetadata<Protobuf.Mesh.DeviceMetadata>>;
    /**
     * Fires when a new MeshPacket message containing a Waypoint packet has been
     * received from device
     *
     * @event onWaypointPacket
     */
    readonly onWaypointPacket: SimpleEventDispatcher<PacketMetadata<Protobuf.Mesh.Waypoint>>;
    /**
     * Fires when a new MeshPacket message containing an Audio packet has been
     * received from device
     *
     * @event onAudioPacket
     */
    readonly onAudioPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Detection Sensor packet has been
     * received from device
     *
     * @event onDetectionSensorPacket
     */
    readonly onDetectionSensorPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Ping packet has been
     * received from device
     *
     * @event onPingPacket
     */
    readonly onPingPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a IP Tunnel packet has been
     * received from device
     *
     * @event onIpTunnelPacket
     */
    readonly onIpTunnelPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Paxcounter packet has been
     * received from device
     *
     * @event onPaxcounterPacket
     */
    readonly onPaxcounterPacket: SimpleEventDispatcher<PacketMetadata<Protobuf.PaxCount.Paxcount>>;
    /**
     * Fires when a new MeshPacket message containing a Serial packet has been
     * received from device
     *
     * @event onSerialPacket
     */
    readonly onSerialPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Store and Forward packet
     * has been received from device
     *
     * @event onStoreForwardPacket
     */
    readonly onStoreForwardPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Store and Forward packet
     * has been received from device
     *
     * @event onRangeTestPacket
     */
    readonly onRangeTestPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Telemetry packet has been
     * received from device
     *
     * @event onTelemetryPacket
     */
    readonly onTelemetryPacket: SimpleEventDispatcher<PacketMetadata<Protobuf.Telemetry.Telemetry>>;
    /**
     * Fires when a new MeshPacket message containing a ZPS packet has been
     * received from device
     *
     * @event onZPSPacket
     */
    readonly onZpsPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Simulator packet has been
     * received from device
     *
     * @event onSimulatorPacket
     */
    readonly onSimulatorPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Trace Route packet has been
     * received from device
     *
     * @event onTraceRoutePacket
     */
    readonly onTraceRoutePacket: SimpleEventDispatcher<PacketMetadata<Protobuf.Mesh.RouteDiscovery>>;
    /**
     * Fires when a new MeshPacket message containing a Neighbor Info packet has been
     * received from device
     *
     * @event onNeighborInfoPacket
     */
    readonly onNeighborInfoPacket: SimpleEventDispatcher<PacketMetadata<Protobuf.Mesh.NeighborInfo>>;
    /**
     * Fires when a new MeshPacket message containing an ATAK packet has been
     * received from device
     *
     * @event onAtakPluginPacket
     */
    readonly onAtakPluginPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Map Report packet has been
     * received from device
     *
     * @event onMapReportPacket
     */
    readonly onMapReportPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing a Private packet has been
     * received from device
     *
     * @event onPrivatePacket
     */
    readonly onPrivatePacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when a new MeshPacket message containing an ATAK Forwarder packet has been
     * received from device
     *
     * @event onAtakForwarderPacket
     */
    readonly onAtakForwarderPacket: SimpleEventDispatcher<PacketMetadata<Uint8Array>>;
    /**
     * Fires when the devices connection or configuration status changes
     *
     * @event onDeviceStatus
     */
    readonly onDeviceStatus: SimpleEventDispatcher<DeviceStatusEnum>;
    /**
     * Fires when a new FromRadio message containing a LogRecord packet has been
     * received from device
     *
     * @event onLogRecord
     */
    readonly onLogRecord: SimpleEventDispatcher<Protobuf.Mesh.LogRecord>;
    /**
     * Fires when the device receives a meshPacket, returns a timestamp
     *
     * @event onMeshHeartbeat
     */
    readonly onMeshHeartbeat: SimpleEventDispatcher<Date>;
    /**
     * Outputs any debug log data (currently serial connections only)
     *
     * @event onDeviceDebugLog
     */
    readonly onDeviceDebugLog: SimpleEventDispatcher<Uint8Array>;
    /**
     * Outputs status of pending settings changes
     *
     * @event onpendingSettingsChange
     */
    readonly onPendingSettingsChange: SimpleEventDispatcher<boolean>;
    /**
     * Fires when a QueueStatus message is generated
     *
     * @event onQueueStatus
     */
    readonly onQueueStatus: SimpleEventDispatcher<Protobuf.Mesh.QueueStatus>;
}

/**
 * Converts a Uint8Array to an ArrayBuffer efficiently, with additional safety checks.
 * @param array - The Uint8Array to convert
 * @returns A new ArrayBuffer containing the Uint8Array data
 * @throws { TypeError } If input is not a Uint8Array
 */
declare const typedArrayToBuffer: (array: Uint8Array) => ArrayBuffer;

declare class Queue {
    private queue;
    private lock;
    private ackNotifier;
    private errorNotifier;
    private timeout;
    constructor();
    getState(): QueueItem[];
    clear(): void;
    push(item: Omit<QueueItem, "promise" | "sent" | "added">): void;
    remove(id: number): void;
    processAck(id: number): void;
    processError(e: PacketError): void;
    wait(id: number): Promise<number>;
    processQueue(writeToRadio: (data: Uint8Array) => Promise<void>): Promise<void>;
}

declare const transformHandler: (log: Logger<unknown>, onReleaseEvent: SimpleEventDispatcher<boolean>, onDeviceDebugLog: SimpleEventDispatcher<Uint8Array>, concurrentLogOutput: boolean) => TransformStream<Uint8Array, Uint8Array>;

type XmodemProps = (toRadio: Uint8Array, id?: number) => Promise<number>;
declare class Xmodem {
    private sendRaw;
    private rxBuffer;
    private txBuffer;
    private textEncoder;
    private counter;
    constructor(sendRaw: XmodemProps);
    downloadFile(filename: string): Promise<number>;
    uploadFile(filename: string, data: Uint8Array): Promise<number>;
    sendCommand(command: Protobuf.Xmodem.XModem_Control, buffer?: Uint8Array, sequence?: number, crc16?: number): Promise<number>;
    handlePacket(packet: Protobuf.Xmodem.XModem): Promise<number>;
    validateCrc16(packet: Protobuf.Xmodem.XModem): boolean;
    clear(): void;
}

type index_EventSystem = EventSystem;
declare const index_EventSystem: typeof EventSystem;
type index_Queue = Queue;
declare const index_Queue: typeof Queue;
type index_Xmodem = Xmodem;
declare const index_Xmodem: typeof Xmodem;
declare const index_transformHandler: typeof transformHandler;
declare const index_typedArrayToBuffer: typeof typedArrayToBuffer;
declare namespace index {
  export { index_EventSystem as EventSystem, index_Queue as Queue, index_Xmodem as Xmodem, index_transformHandler as transformHandler, index_typedArrayToBuffer as typedArrayToBuffer };
}

/** Base class for connection methods to extend */
declare abstract class MeshDevice {
    /** Abstract property that states the connection type */
    protected abstract connType: ConnectionTypeName;
    protected abstract portId: string;
    /** Logs to the console and the logging event emitter */
    protected log: Logger<unknown>;
    /** Describes the current state of the device */
    protected deviceStatus: DeviceStatusEnum;
    /** Describes the current state of the device */
    protected isConfigured: boolean;
    /** Are there any settings that have yet to be applied? */
    protected pendingSettingsChanges: boolean;
    /** Device's node number */
    private myNodeInfo;
    /** Randomly generated number to ensure confiuration lockstep */
    configId: number;
    /**
     * Packert queue, to space out transmissions and routing handle errors and
     * acks
     */
    queue: Queue;
    events: EventSystem;
    xModem: Xmodem;
    constructor(configId?: number);
    /** Abstract method that writes data to the radio */
    protected abstract writeToRadio(data: Uint8Array): Promise<void>;
    /** Abstract method that connects to the radio */
    protected abstract connect(parameters: ConnectionParameters): Promise<void>;
    /** Abstract method that disconnects from the radio */
    protected abstract disconnect(): void;
    /** Abstract method that pings the radio */
    protected abstract ping(): Promise<boolean>;
    /**
     * Sends a text over the radio
     */
    sendText(text: string, destination?: Destination, wantAck?: boolean, channel?: ChannelNumber): Promise<number>;
    /**
     * Sends a text over the radio
     */
    sendWaypoint(waypointMessage: Protobuf.Mesh.Waypoint, destination: Destination, channel?: ChannelNumber): Promise<number>;
    /**
     * Sends packet over the radio
     */
    sendPacket(byteData: Uint8Array, portNum: Protobuf.Portnums.PortNum, destination: Destination, channel?: ChannelNumber, wantAck?: boolean, wantResponse?: boolean, echoResponse?: boolean, replyId?: number, emoji?: number): Promise<number>;
    /**
     * Sends raw packet over the radio
     */
    sendRaw(toRadio: Uint8Array, id?: number): Promise<number>;
    /**
     * Writes config to device
     */
    setConfig(config: Protobuf.Config.Config): Promise<number>;
    /**
     * Writes module config to device
     */
    setModuleConfig(moduleConfig: Protobuf.ModuleConfig.ModuleConfig): Promise<number>;
    setCannedMessages(cannedMessages: Protobuf.CannedMessages.CannedMessageModuleConfig): Promise<number>;
    /**
     * Sets devices owner data
     */
    setOwner(owner: Protobuf.Mesh.User): Promise<number>;
    /**
     * Sets devices ChannelSettings
     */
    setChannel(channel: Protobuf.Channel.Channel): Promise<number>;
    enterDfuMode(): Promise<number>;
    setPosition(positionMessage: Protobuf.Mesh.Position): Promise<number>;
    /**
     * Gets specified channel information from the radio
     */
    getChannel(index: number): Promise<number>;
    /**
     * Gets devices config
     *   request
     */
    getConfig(configType: Protobuf.Admin.AdminMessage_ConfigType): Promise<number>;
    /**
     * Gets Module config
     */
    getModuleConfig(moduleConfigType: Protobuf.Admin.AdminMessage_ModuleConfigType): Promise<number>;
    /** Gets devices Owner */
    getOwner(): Promise<number>;
    /**
     * Gets devices metadata
     */
    getMetadata(nodeNum: number): Promise<number>;
    /**
     * Clears specific channel with the designated index
     */
    clearChannel(index: number): Promise<number>;
    private beginEditSettings;
    commitEditSettings(): Promise<number>;
    /**
     * Resets the internal NodeDB of the radio, usefull for removing old nodes
     * that no longer exist.
     */
    resetNodes(): Promise<number>;
    /**
     * Removes a node from the internal NodeDB of the radio by node number
     */
    removeNodeByNum(nodeNum: number): Promise<number>;
    /** Shuts down the current node after the specified amount of time has elapsed. */
    shutdown(time: number): Promise<number>;
    /** Reboots the current node after the specified amount of time has elapsed. */
    reboot(time: number): Promise<number>;
    /**
     * Reboots the current node into OTA mode after the specified amount of time
     * has elapsed.
     */
    rebootOta(time: number): Promise<number>;
    /** Factory resets the current device */
    /** Factory resets the current config */
    /** Triggers the device configure process */
    configure(): Promise<number>;
    /** Serial connection requires a heartbeat ping to stay connected, otherwise times out after 15 minutes */
    heartbeat(): Promise<number>;
    /** Sends a trace route packet to the designated node */
    traceRoute(destination: number): Promise<number>;
    /** Requests position from the designated node */
    requestPosition(destination: number): Promise<number>;
    /**
     * Updates the device status eliminating duplicate status events
     */
    updateDeviceStatus(status: DeviceStatusEnum): void;
    /**
     * Generates random packet identifier
     *
     * @returns {number} Random packet ID
     */
    private generateRandId;
    /**
     * Gets called whenever a fromRadio message is received from device, returns
     * fromRadio data
     */
    protected handleFromRadio(fromRadio: Uint8Array): void;
    /** Completes all Events */
    complete(): void;
    /**
     * Gets called when a MeshPacket is received from device
     */
    private handleMeshPacket;
    private handleDecodedPacket;
}

/** Allows to connect to a Meshtastic device via bluetooth */
declare class BleConnection extends MeshDevice {
    /** Defines the connection type as ble */
    connType: ConnectionTypeName;
    portId: string;
    /** Currently connected BLE device */
    device: BluetoothDevice | undefined;
    private gattServer;
    /** Short Description */
    private service;
    /** Short Description */
    private toRadioCharacteristic;
    /** Short Description */
    private fromRadioCharacteristic;
    /** Short Description */
    private fromNumCharacteristic;
    private timerUpdateFromRadio;
    constructor(configId?: number);
    /**
     * Gets web bluetooth support avaliability for the device
     *
     * @returns {Promise<void>}
     */
    supported(): Promise<boolean>;
    /**
     * Gets list of bluetooth devices that can be passed to `connect`
     *
     * @returns {Promise<BluetoothDevice[]>} Array of avaliable BLE devices
     */
    getDevices(): Promise<BluetoothDevice[]>;
    /**
     * Opens browser dialog to select a device
     */
    getDevice(filter?: RequestDeviceOptions): Promise<BluetoothDevice>;
    /**
     * Initiates the connect process to a Meshtastic device via Bluetooth
     */
    connect({ device, deviceFilter, }: BleConnectionParameters): Promise<void>;
    /** Disconnects from the Meshtastic device */
    disconnect(): void;
    /**
     * Pings device to check if it is avaliable
     *
     * @todo Implement
     */
    ping(): Promise<boolean>;
    /**
     * Reads data packets from the radio until empty
     * @throws Error if reading fails
     */
    protected readFromRadio(): Promise<void>;
    /**
     * Sends supplied protobuf message to the radio
     */
    protected writeToRadio(data: Uint8Array): Promise<void>;
}

/** Allows to connect to a Meshtastic device over HTTP(S) */
declare class HttpConnection extends MeshDevice {
    /** Defines the connection type as http */
    connType: ConnectionTypeName;
    /** URL of the device that is to be connected to. */
    protected portId: string;
    /** Enables receiving messages all at once, versus one per request */
    private receiveBatchRequests;
    private readLoop;
    private pendingRequest;
    private abortController;
    private readonly defaultRetryConfig;
    constructor(configId?: number);
    /**
     * Checks if the error should trigger a retry attempt
     * @param response - The fetch response
     * @returns boolean indicating if should retry
     */
    private shouldRetry;
    /**
     * Implements exponential backoff retry logic for HTTP operations
     * @param operation - The async operation to retry
     * @param retryConfig - Configuration for retry behavior
     * @param operationName - Name of the operation for logging
     */
    private withRetry;
    /**
     * Attempts a single connection to the device
     */
    private attemptConnection;
    /**
     * Initiates the connect process to a Meshtastic device via HTTP(S)
     */
    connect({ address, fetchInterval, receiveBatchRequests, tls, }: HttpConnectionParameters): Promise<void>;
    /** Disconnects from the Meshtastic device */
    disconnect(): void;
    /** Pings device to check if it is available with retry logic */
    ping(): Promise<boolean>;
    /** Reads any avaliable protobuf messages from the radio */
    protected readFromRadio(): Promise<void>;
    /**
     * Sends supplied protobuf message to the radio
     */
    protected writeToRadio(data: Uint8Array): Promise<void>;
}

/** Allows to connect to a Meshtastic device over WebSerial */
declare class SerialConnection extends MeshDevice {
    /** Defines the connection type as serial */
    connType: ConnectionTypeName;
    protected portId: string;
    /** Serial port used to communicate with device. */
    port: SerialPort | undefined;
    private readerHack;
    /** Transform stream for parsing raw serial data */
    private transformer?;
    /** Should locks be prevented */
    private preventLock?;
    /** Unfortunately, this is currently the only way to release the lock on a stream after piping it
     *  through a transform stream (https://stackoverflow.com/questions/71262432) */
    private pipePromise?;
    private heartbeatInterval?;
    /**
     * Fires when `disconnect()` is called, used to instruct serial port and
     * readers to release there locks
     *
     * @event onReleaseEvent
     */
    private readonly onReleaseEvent;
    constructor(configId?: number);
    /**
     * Reads packets from transformed serial port steam and processes them.
     */
    private readFromRadio;
    /** Gets list of serial ports that can be passed to `connect` */
    getPorts(): Promise<SerialPort[]>;
    /**
     * Opens browsers connection dialogue to select a serial port
     */
    getPort(filter?: SerialPortRequestOptions): Promise<SerialPort>;
    getCurrentPort(): SerialPort | undefined;
    /**
     * Initiates the connect process to a Meshtastic device via Web Serial
     */
    connect({ port, baudRate, concurrentLogOutput, }: SerialConnectionParameters): Promise<void>;
    /** Disconnects from the serial port */
    reconnect(): Promise<void>;
    /** Disconnects from the serial port */
    disconnect(): Promise<SerialPort | undefined>;
    /** Pings device to check if it is avaliable */
    ping(): Promise<boolean>;
    /**
     * Sends supplied protobuf message to the radio
     */
    protected writeToRadio(data: Uint8Array): Promise<void>;
}

/**
 * Allows to create new connections to devices and manages them. Alternatively,
 * new connections can be created directly by instantiating their respective the
 * interface classes.
 */
declare class Client {
    /** Array containing all created connection interfaces */
    deviceInterfaces: ConnectionType[];
    constructor();
    /**
     * Creates a new Bluetooth Low Enery connection interface
     */
    createBleConnection(configId?: number): BleConnection;
    /**
     * Creates a new HTTP(S) connection interface
     */
    createHttpConnection(configId?: number): HttpConnection;
    /**
     * Creates a new Serial connection interface
     */
    createSerialConnection(configId?: number): SerialConnection;
    /**
     * Adds an already created connection interface to the client
     */
    addConnection(connectionObj: ConnectionType): void;
    /**
     * Removes a connection interface from the client
     */
    removeConnection(connectionObj: ConnectionType): void;
}

/** Bluetooth Low Energy ToRadio characteristic */
declare const ToRadioUuid = "f75c76d2-129e-4dad-a1dd-7866124401e7";
/** Bluetooth Low Energy FromRadio characteristic */
declare const FromRadioUuid = "2c55e69e-4993-11ed-b878-0242ac120002";
/**
 * Bluetooth Low Energy FromNum characteristic, provides BLE notification on new
 * FromRadio message and a message counter
 */
declare const FromNumUuid = "ed9da18c-a800-4f66-a670-aa7547e34453";
/** Bluetooth Service characteristic, used to identify Meshtastic devices */
declare const ServiceUuid = "6ba1b218-15a8-461f-9fa8-5dcae273eafd";
/** Broadcast destination number */
declare const broadcastNum = 4294967295;
/** Minimum device firmware version supported by this version of the library. */
declare const minFwVer = 2.2;
declare const Constants: {
    ToRadioUuid: string;
    FromRadioUuid: string;
    FromNumUuid: string;
    ServiceUuid: string;
    broadcastNum: number;
    minFwVer: number;
};

export { BleConnection, Client, Constants, FromNumUuid, FromRadioUuid, HttpConnection, MeshDevice, SerialConnection, ServiceUuid, ToRadioUuid, types as Types, index as Utils, broadcastNum, minFwVer };
