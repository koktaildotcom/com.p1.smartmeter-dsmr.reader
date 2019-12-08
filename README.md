# Homey p1 smartmeter DSMR reader for [com.p1.smartmeter ](https://github.com/koktaildotcom/com.p1.smartmeter)


## Introduction
This package can be used to post data about usage gas and received/delivered electricity to the homey app [com.p1.smartmeter ](https://github.com/koktaildotcom/com.p1.smartmeter)
And it is based on the [node-dsmr](https://github.com/reneklootwijk/node-dsmr) library.

### Install dependencies

`npm install`

### Get your Homey id

 1: Goto: http://developer.athom.com
 
 2: Login into Homey
 
 3: Open the inspector (chrome f12)
 
 4: Click the `network` tab
 
 5: Refresh the page (you see couple of webpages being called)
 
 6: Copy the `homeyId` from the url: https://[localId].homey.homeylocal.com/api/manager/system/ping?id=[homeyId]
 
### Configure the /src/p1.js

Fill in the field: const homeyId = '[homeyId]' your homeyId

```
const homeyId = '[homeyId]'
/* becomes */
const homeyId = '1c1f4a7e3325c469fd8ad55'
```


### Fill in the correct configuration

###### DSMR 2.2 and DSMR 3

```
const usbPort = '/dev/ttyUSB0'
const bps = 9600
const bits = 7;
const parity = 'even';
```


###### DSMR 4 and higher


```
const usbPort = '/dev/ttyUSB0'
const bps = 115200
const bits = 8;
const parity = 'none';
```

### Run the program

`node p1.js`


## History

### v1.0.0 - 08.12.2019
- initial commit

## Final note ##
The repository is available at: https://github.com/koktaildotcom/com.p1.smartmeter-dsmr.reader


Do you like the app? You can make me happy by buying me a beer! [![](https://img.shields.io/badge/paypal-donate-green.svg)](https://www.paypal.me/koktaildotcom)
