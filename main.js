
'use strict';

/*
 * Created with @iobroker/create-adapter v1.31.0
 */

var adapter = null;

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const xmlrpc = require('xmlrpc');

class PowerDog extends utils.adapter {

    /**
     * @param {Partial<utils.adapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'powerdog',
        });

        adapter = this;

        // Number of tasks
        this.tasks = 2; // Counters and Sensors
        // XML.RPC client
        this.client = null;

        this.on('ready', this.onReady.bind(this));
        // adapter.on('stateChange', adapter.onStateChange.bind(this));
        // adapter.on('objectChange', adapter.onObjectChange.bind(this));
        // adapter.on('message', adapter.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.on('internalDone', this.onDone.bind(this));
    }

    /**
     * Used for synchronous call to XML-RPC
     */
    async clientXmlRpcP(tag) {
        return new Promise((resolve, reject) => {
            return this.client.methodCall(tag, [this.config.ApiKey], (error, obj) => {
                if (error) {
                    return reject(error);
                }
                return resolve(obj);
            });
        });
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onDone() {
        if (--this.tasks == 0) {
            this.stop();
            this.log.debug('onDone');
        }
    }

    /**
     * Creates and sets Objects. This is serialized!
     */
    async createQueryObjects() {
        // Sends a method call to the XML-RPC server
        var obj = await this.clientXmlRpcP('getPowerDogInfo').catch((err) => { this.log.error('XML-RPC-P: ' + err); });
        for (let key in obj) {
            // checking if it's nested
            if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                let objInfo = obj[key];
                for (let keyInfo in objInfo) {
                    this.log.debug(keyInfo + ': ' + objInfo[keyInfo]);
                    var name = 'Info.' + keyInfo;
                    await this.setObjectNotExists(name, {
                        type: 'state',
                        common: {
                            name: keyInfo,
                            type: 'string',
                            role: 'text',
                            read: true,
                            write: false,
                        },
                        native: {}
                    });
                    this.setState(name, { val: objInfo[keyInfo], ack: true });
                }
            }
        }

        // Sends a method call to the XML-RPC server
        var obj = await this.clientXmlRpcP('getSensors').catch((err) => { this.log.error('XML-RPC: ' + err); });
        for (let key in obj) {
            // checking if it's nested
            if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                let objSensor = obj[key];
                for (let keySensor in objSensor) {
                    this.log.debug(keySensor);
                    if (objSensor.hasOwnProperty(keySensor) && (typeof objSensor[keySensor] === "object")) {
                        let objSensorInfo = objSensor[keySensor];
                        this.log.debug(objSensorInfo);
                        for (let keyInfo in objSensorInfo) {
                            this.log.debug(keyInfo + ': ' + objSensorInfo[keyInfo]);
                            var name = 'Sensors.' + keySensor + '.' + keyInfo;
                            var type_nan = null;
                            var role_nan = null;
                            if (isNaN(objSensorInfo[keyInfo])) {
                                type_nan = 'string'
                                role_nan = 'text'
                            }
                            else {
                                type_nan = 'number'
                                role_nan = 'value'
                            }
                            await this.setObjectNotExistsAsync(name, {
                                type: 'state',
                                common: {
                                    name: keyInfo,
                                    type: type_nan,
                                    role: role_nan,
                                    read: true,
                                    write: false,
                                },
                                native: {}
                            });
                            this.setState(name, { val: objSensorInfo[keyInfo], ack: true });
                        }
                    }
                }
            }
        }

        // Sends a method call to the XML-RPC server
        var obj = await this.clientXmlRpcP('getCounters').catch((err) => { this.log.error('XML-RPC: ' + err); });
        for (let key in obj) {
            // checking if it's nested
            if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                let objCounter = obj[key];
                for (let keyCounter in objCounter) {
                    this.log.debug(keyCounter);
                    if (objCounter.hasOwnProperty(keyCounter) && (typeof objCounter[keyCounter] === "object")) {
                        let objCounterInfo = objCounter[keyCounter];
                        this.log.debug(objCounterInfo);
                        for (let keyInfo in objCounterInfo) {
                            this.log.debug(keyInfo + ': ' + objCounterInfo[keyInfo]);
                            var name = 'Counters.' + keyCounter + '.' + keyInfo;
                            var type_nan = null;
                            var role_nan = null;
                            if (isNaN(objCounterInfo[keyInfo])) {
                                type_nan = 'string'
                                role_nan = 'text'
                            }
                            else {
                                type_nan = 'number'
                                role_nan = 'value'
                            }
                            await this.setObjectNotExistsAsync(name, {
                                type: 'state',
                                common: {
                                    name: keyInfo,
                                    type: type_nan,
                                    role: role_nan,
                                    read: true,
                                    write: false,
                                },
                                native: {}
                            });
                            this.setState(name, { val: objCounterInfo[keyInfo], ack: true });
                        }
                    }
                }
            }
        }
    }

    /**
     * Queries the values parallized
     */
    queryObjects() {
        // Query Sensors from XML-RPC server
        adapter.client.methodCall('getSensors', [this.config.ApiKey], function (error, obj, reply) {
            if (error) {
                adapter.log.error('XML-RPC');
            }
            else {
                for (let key in obj) {
                    // checking if it's nested
                    if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                        let objSensor = obj[key];
                        for (let keySensor in objSensor) {
                            adapter.log.debug(keySensor);
                            if (objSensor.hasOwnProperty(keySensor) && (typeof objSensor[keySensor] === "object")) {
                                let objSensorInfo = objSensor[keySensor];
                                adapter.log.debug(objSensorInfo);
                                for (let keyInfo in objSensorInfo) {
                                    adapter.log.debug(keyInfo + ': ' + objSensorInfo[keyInfo]);
                                    var name = 'Sensors.' + keySensor + '.' + keyInfo;
                                    adapter.setState(name, { val: objSensorInfo[keyInfo], ack: true });
                                }
                            }
                        }
                    }
                }
            }
            adapter.emit('internalDone');
        });
        // adapter.log.debug('PowerDog sensor data: ' + JSON.stringify(obj));

        // Query Counters from XML-RPC server
        // Query Sensors from XML-RPC server
        adapter.client.methodCall('getCounters', [this.config.ApiKey], function (error, obj, reply) {
            if (error) {
                adapter.log.error('XML-RPC');
            }
            else {
                for (let key in obj) {
                    // checking if it's nested
                    if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                        let objCounter = obj[key];
                        for (let keyCounter in objCounter) {
                            adapter.log.debug(keyCounter);
                            if (objCounter.hasOwnProperty(keyCounter) && (typeof objCounter[keyCounter] === "object")) {
                                let objCounterInfo = objCounter[keyCounter];
                                adapter.log.debug(objCounterInfo);
                                for (let keyInfo in objCounterInfo) {
                                    adapter.log.debug(keyInfo + ': ' + objCounterInfo[keyInfo]);
                                    var name = 'Counters.' + keyCounter + '.' + keyInfo;
                                    adapter.setState(name, { val: objCounterInfo[keyInfo], ack: true });
                                }
                            }
                        }
                    }
                }
            }
            adapter.emit('internalDone');
        });
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here    
        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        this.log.debug('IP-Address of Powerdog: ' + adapter.config.IpAddress);
        this.log.debug('API-Key of Powerdog: ' + adapter.config.ApiKey);
        this.log.debug('Port of Powerdog: ' + adapter.config.Port);
        this.log.debug('Create Objects: ' + adapter.config.CreateObjs);

        // Creates an XML-RPC client. Passes the host information on where to
        // make the XML-RPC calls.
        this.client = xmlrpc.createClient({ host: this.config.IpAddress, port: adapter.config.Port, path: '/' })

        if (this.config.CreateObjs) {
            await this.createQueryObjects();
            // If it has been a force reinit run, set it to false and restart
            if (this.config.CreateObjs) {
                this.log.info('Restarting now, because we generated the objects and read the static info');
                try {
                    this.extendForeignObjectAsync(`system.adapter.${this.namespace}`, { native: { CreateObjs: false } });
                } catch (e) {
                    this.log.error(`Could not restart: ${e.message}`);
                }
            }
            this.stop()
            //adapter.killTimeout = setTimeout(adapter.stop.bind(this), 10000 );
        }
        else {
            this.queryObjects();
        }
    }
    // this.log.debug('PowerDog sensor data: ' + JSON.stringify(obj));

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        adapter.log.debug('cleaned everything up...');
        callback();
    } catch(e) {
        callback();
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new PowerDog(options);
} else {
    // otherwise start the instance directly
    new PowerDog();
}