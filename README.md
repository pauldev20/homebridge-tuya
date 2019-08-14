**This plugin is deprecated so I can spend my time on core TuyAPI work. Please use [homebridge-tuya-web](https://github.com/basdelfos/homebridge-tuya-web) instead.**

# homebridge-tuya

🏠 Offical Homebridge plugin for [TuyAPI](https://github.com/codetheweb/tuyapi).

## Installation

```
npm i homebridge-tuya -g
```

## Basic config.json

```javascript
{
  "platform": "TuyaPlatform",
  "name": "TuyaPlatform",
  "devices": [
    {
      "name": "Tuya Outlet Device 1",
      "id": "xxxxxxxxxxxxxxxxxxxx",
      "key": "xxxxxxxxxxxxxxxx"
    },
    {
      "name": "Tuya Dimmer Switch Device 2",
      "id": "xxxxxxxxxxxxxxxxxxxx",
      "key": "xxxxxxxxxxxxxxxx",
      "type": "dimmer"
    }
  ]
}
```

Each `device` object passed to the `devices` array has these properties:

- `name`: the name that should appear in HomeKit.
- `id`: the ID of the device. See [this guide](https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md) for finding the `id` and `key`.
- `key`: the key of the device. See above guide.
- `ip`: IP of device. Usually not necessary, add it if you have issues.
- `version`: the firmware version of the device, add it if you have issues.
- `type`: the type of device. Currently supported device types:
  - `generic`: default type. A device that has a single, boolean property (such as outlets, light switches, etc). Options (used in the `options` property):
	  - `dps`: property index to control (defaults to 1).
  - `dimmer`: a device that has an on/off value and a brightness value, such as light switches with dimmers and lightbulbs. Options (used in the `options` property):
	  - `dpsOn`: property index to use for on/off commands (defaults to 1).
	  - `dpsBright`: property index to use for brightness control (defaults to 2).
	  - `minVal`: minimum brightness value (defaults to 11).
	  - `maxVal`: maximum brightness value (defaults to 244).
  - `curtain`
	  - `dps`: property index to control (defaults to 1).
	  - `upValue`: value when curtains are up (defaults to 1).
	  - `downValue`: value when curtains are down (defaults to 2).
	  - `stopValue`: value when curtains are stopped somewhere between fully open and fully closed (defaults to 3).

[Options for known devices](https://github.com/codetheweb/tuyapi/wiki/Device-Details).

## Advanced

For devices with more than one switch (for example, powerstrips), a config would look like this:

```javascript
"devices": [
  {
    "name": "Power strip main",
    "id": "power-strip-id",
    "key": "power-strip-key",
    "options": {      
      "dps": 1
    }
  },
  {
    "name": "Power strip USB",
    "id": "same-power-strip-id",
    "key": "same-power-strip-key",
    "options": {      
      "dps": 2
    }
  }
]
```

Dimmer device example:

```javascript
"devices": [
  {
    "name": "Tuya Dimmer Switch Device",
    "id": "xxxxxxxxxxxxxxxxxxxx",
    "key": "xxxxxxxxxxxxxxxx",
    "type": "dimmer",
    "options": {           // Any or all of 'options' can be omitted
      "dpsOn": 2,          // Defaults to 1
      "dpsBright": 3,      // Defaults to 2
      "dpsMinBright": 101, // Defaults to 3. With the Tuya app you can set the minimal brightness, HomeKit can not change this value.
      "minVal": 0,         // Note: this is not a dps setting. Defaults to 11
      "maxVal": 100        // Note: this is not a dps setting. Defaults to 244
    }
  }
]
```

For devices with new Tuya protocol version 3.3, you will need to explicitly specify the version with each device, otherwise the devices will only be discovered but can not parse the received data for the device.

Protocol version 3.3 device example:

```javascript
"devices": [
  {
    {
      "name": "Tuya Outlet Device 1",
      "id": "xxxxxxxxxxxxxxxxxxxx",
      "key": "xxxxxxxxxxxxxxxx",
      "version": "3.3"
    },
  }
]
```
