const TuyaDiscover = require('./lib/discovery');

const GenericAccessory = require('./lib/generic');
const { DimmerAccessory, checkDimmerOptionsUpgrade } = require('./lib/dimmer');
const CurtainAccessory = require('./lib/curtain');

class TuyaPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config || {};
    this.api = api;

    // Keep track of all registered accessories
    this.homebridgeAccessories = new Map();

    // Create instance of TuyaDiscover
    this.discovery = new TuyaDiscover(this.log, this.config.devices);

    // Start discovery process after Homebridge's finished launching
    this.api.on('didFinishLaunching', () => {
      this.log.debug('didFinishLaunching');

      if (this.config.devices) {
        this.discovery.startDiscovery();
      }
    });

    // When a new device is found, add it to Homebridge
    this.discovery.on('device-new', device => {
      this.log.info('New Device Online: %s (%s)', device.name || 'unnamed', device.id);
      this.addAccessory(device);
    });

    // If a device is unreachable, remove it from Homebridge
    this.discovery.on('device-offline', device => {
      this.log.info('Device Offline: %s (%s)', device.name || 'unnamed', device.id);

      const uuid = this.api.hap.uuid.generate(device.id + device.name);
      this.removeAccessory(this.homebridgeAccessories.get(uuid));
    });
  }

  // Called from device classes
  registerPlatformAccessory(platformAccessory) {
    this.log.debug('registerPlatformAccessory(%s)', platformAccessory.displayName);
    this.api.registerPlatformAccessories('homebridge-tuya', 'TuyaPlatform', [platformAccessory]);
  }

  // Function invoked when homebridge tries to restore cached accessory
  configureAccessory(accessory) {
    this.log.info(
      'Configuring cached accessory: [%s] %s %s',
      accessory.displayName,
      accessory.context.deviceId,
      accessory.UUID
    );
    const device = this.config.devices.find((d) => d.id === accessory.context.deviceId);
    if (device && device.type === 'dimmer') {
      checkDimmerOptionsUpgrade(device, this.log);
    }
    this.log.debug('%j', accessory);
    this.homebridgeAccessories.set(accessory.UUID, accessory);
  }

  addAccessory(device, knownId) {
    const deviceType = device.type || 'generic';
    this.log.info('Adding: %s (%s / %s)', device.name || 'unnamed', deviceType, device.id);

    // Get UUID
    const uuid = knownId || this.api.hap.uuid.generate(device.id + device.name);
    const homebridgeAccessory = this.homebridgeAccessories.get(uuid);

    // Construct new accessory
    let deviceAccessory;
    switch (deviceType) {
      case 'curtain':
        deviceAccessory = new CurtainAccessory(this, homebridgeAccessory, device);
        break;
      case 'dimmer':
        deviceAccessory = new DimmerAccessory(this, homebridgeAccessory, device);
        break;
      case 'generic':
      default:
        deviceAccessory = new GenericAccessory(this, homebridgeAccessory, device);
        break;
    }

    // Add to global map
    this.homebridgeAccessories.set(uuid, deviceAccessory.homebridgeAccessory);
  }

  removeAccessory(homebridgeAccessory) {
    if (!homebridgeAccessory) {
      return;
    }

    this.log.info('Removing: %s', homebridgeAccessory.displayName);

    this.homebridgeAccessories.delete(homebridgeAccessory.deviceId);
    this.api.unregisterPlatformAccessories('homebridge-tuya', 'TuyaPlatform', [
      homebridgeAccessory
    ]);
  }
}

module.exports = function (homebridge) {
  homebridge.registerPlatform('homebridge-tuya', 'TuyaPlatform', TuyaPlatform, true);
};
