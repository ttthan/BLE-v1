$(document).ready(function() {

    $(document).on('pageshow', '#first', function(data) {});



});


var map;
var longitudeB;
var latitudeB;
var latLongB;
var longitudeC;
var latitudeC;
var latLongC;
var strFile = '';
var start_p_360;
var stop_p_360;
var heading_g;

var p = {
    x: 0,
    y: 0
};
var p1 = {
    x: 0,
    y: 0,
    d: 0
};
var p2 = {
    x: 0,
    y: 0,
    d: 0
};
var p3 = {
    x: 0,
    y: 0,
    d: 0
};
var p_3p = {
    x: 0,
    y: 0
}

var c_360 = "";


var base64 = cordova.require('cordova/base64');
var BLUETOOTH_BASE_UUID = '-0000-1000-8000-00805f9b34fb';
var beacons = {};
var beaconS = {};

var scan = false;
var addressS = null;
var startTime = null;
var t = 0;
var updateTimer = null;

var data = {
    "latitude": [],
    "longitude": [],
    "rssi": [],
    "heading": []
};

var options = {
    animation: false,
    scaleShowGridLines: true,
    scaleShowVerticalLines: true,
    showTooltips: false,
    datasetFill: true,
    onAnimationComplete: function() { // console.log(this.toBase64Image())
    }
};

var app = {

    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.getElementById("scanButton").addEventListener("click", scanDevice);
        document.getElementById("shareFile").addEventListener("click", shareFile);
        document.getElementById("saveFile").addEventListener("click", saveFile);
        document.addEventListener("stop", stopScan, false);
        document.addEventListener("pause", stopScan, false);
        document.addEventListener("resume", scanDevice, false);
        document.getElementById("scanButton").innerHTML = "Scan";
        document.getElementById("point1").addEventListener("click", getP1);
        document.getElementById("point2").addEventListener("click", getP2);
        document.getElementById("point3").addEventListener("click", getP3);
        document.getElementById("getPosition_3p").addEventListener("click", getBeaconPosition_3p);
        document.getElementById("start_360").addEventListener("click", start_360);
        document.getElementById("stop_360").addEventListener("click", stop_360);

        navigator.geolocation.watchPosition(setCurrentPosition, fail, {
            frequency: 3000,
            enableHighAccuracy: true
        });

        var options = {
            frequency: 3000
        };

        navigator.geolocation.getCurrentPosition(function(position) {

            longitudeC = position.coords.longitude;
            latitudeC = position.coords.latitude;
        });


        Compass = (function() {
            var lastHeading = -1,
                // cache the jQuery selectors
                $headText = $("compass_header > h1"),
                $compass = $("#compass"),
                // displays the degree
                updateHeadingText = function(event, heading) {
                    event.preventDefault();
                    document.getElementById("heading").innerHTML = heading + "&deg;";
                    return false;
                },
                // adjusts the rotation of the compass
                updateCompass = function(event, heading) {
                    event.preventDefault();
                    // to make the compass dial point the right way
                    var rotation = 360 - heading,
                        rotateDeg = 'rotate(' + rotation + 'deg)';
                    // TODO: fix - this code only works on webkit browsers, not wp7
                    $compass.css('-webkit-transform', rotateDeg);
                    return false;
                };
            // bind both of the event handlers to the "newHeading" event
            $("body").bind("newHeading", updateCompass).bind("newHeading", updateHeadingText);
        }());


        document.addEventListener("deviceready", function() {

            navigator.compass.watchHeading(function(heading) {
                // only magnetic heading works universally on iOS and Android
                // round off the heading then trigger newHeading event for any listeners
                var newHeading = Math.round(heading.magneticHeading);
                $("body").trigger("newHeading", [newHeading]);
                heading_g = newHeading;

            }, function(error) {
                // if we get an error, show its code
                alert("Compass error: " + error.code);
            }, {
                frequency: 100
            });

            //                    navigator.compass.watchHeading(compassSuccess, compassError,{frequency: 3000});


            navigator.geolocation.getCurrentPosition(setCurrentPosition, fail, {
                frequency: 15 * 60 * 1000,
                timeout: 1 * 60 * 1000,
                maximumAge: 600000,
                enableHighAccuracy: true
            });

            navigator.geolocation.watchPosition(setCurrentPosition, fail, {
                frequency: 15 * 60 * 1000,
                timeout: 1 * 60 * 1000,
                maximumAge: 600000,
                enableHighAccuracy: true
            });
            plugin.google.maps.Map.isAvailable(function(isAvailable, message) {
                if (isAvailable) {
                    var mapDiv = document.getElementById("map_canvas");
                    latLongC = new plugin.google.maps.LatLng(latitudeC, longitudeC);

                    map = plugin.google.maps.Map.getMap(mapDiv, {
                        'backgroundColor': 'white',
                        'controls': {
                            'compass': true,
                            'myLocationButton': true,
                            'indoorPicker': true,
                            'zoom': true
                        },
                        'gestures': {
                            'scroll': true,
                            'tilt': true,
                            'rotate': true,
                            'zoom': true
                        },
                        'camera': {
                            'latLng': latLongC,
                            'zoom': 25
                        }
                    });

                    map.animateCamera({
                        'target': latLongC,
                        'zoom': 18,
                        'bearing': 140,
                        'duration': 1000
                    }, function() {
                        var mapType = plugin.google.maps.MapTypeId.HYBRID;
                        map.setMapTypeId(mapType);
                        map.showDialog();
                    });
                } else {
                    alert(message);
                }
            });
        });

    },

};

function focus() {
    var mapDiv = document.getElementById("map_canvas");
    latLongC = new plugin.google.maps.LatLng(latitudeC, longitudeC);

    map = plugin.google.maps.Map.getMap(mapDiv, {
        'backgroundColor': 'white',
        'controls': {
            'compass': true,
            'myLocationButton': true,
            'indoorPicker': true,
            'zoom': true
        },
        'gestures': {
            'scroll': true,
            'tilt': true,
            'rotate': true,
            'zoom': true
        },
        'camera': {
            'latLng': latLongC,
            'zoom': 25
        }
    });

    map.animateCamera({
        'target': latLongC,
        'zoom': 25,
        // 'bearing': 140,
        'duration': 100
    }, function() {
        var mapType;
        mapType = plugin.google.maps.MapTypeId.HYBRID;
        // console.log(mapType);
        map.setMapTypeId(mapType);
    });
}

function start_360() {
    start_p_360 = data.rssi.length;
    console.log(start_p_360);
}

function stop_360() {
    stop_p_360 = data.rssi.length;
    console.log(stop_p_360);
    var data_tmp = {
        "rssi": [],
        "heading": []

    };
    var j = 0;
    for (var i = (start_p_360 - 1); i < stop_p_360; i++) {
        data_tmp.rssi[j] = data.rssi[i];
        data_tmp.heading[j] = data.heading[i];
        j++;
        c_360 += data.rssi[i] + "\n";
    }

    console.log(data_tmp.rssi);

    var kf = new KalmanFilter({
        R: 0.01,
        Q: 2.3846
    });

    //    data_tmp.rssi.sort(function (a, b) {
    //        return a - b;
    //    });
    //    var tmp = [];
    //    var q1 = numbers.statistic.quantile(data_tmp.rssi, 25, 100);
    //    var q3 = numbers.statistic.quantile(data_tmp.rssi, 75, 100);
    //    console.log(q1);
    //    console.log(q3);
    //    j = 0;
    //    for (var i = 0; i < data_tmp.rssi.length; i++) {
    //        if ((data_tmp.rssi[i] > q1) && (data_tmp.rssi[i] < q3)) {
    //            tmp[j] = data_tmp.rssi[i];
    //            j++;
    //        }
    //    }
    //
    //    console.log(tmp);

    var dataKalman = data_tmp.rssi.map(function(v) {
        return kf.filter(v);
    });

    var x_0 = $V([data_tmp.rssi[0]]);
    var P_0 = $M([
        [1]
    ]);
    var F_k = $M([
        [1]
    ]);
    var Q_k = $M([
        [0.01]
    ]);
    var KM = new KalmanModel(x_0, P_0, F_k, Q_k);
    var z_k = $V([1]);
    var H_k = $M([
        [1]
    ]);
    var R_k = $M([
        [11.6]
    ]);
    var KO = new KalmanObservation(z_k, H_k, R_k);

    j = 0;
    var dataKalman_1 = [];
    for (var i = 0; i < data_tmp.rssi.length; i++) {
        KO.z_k = $V([data_tmp.rssi[i]]);
        KM.update(KO);
        dataKalman_1[j] = KM.x_k.elements[0];
        j++;
    }

    console.log(dataKalman_1);


    var min = numbers.basic.min(dataKalman);

    var max = numbers.basic.max(dataKalman);

    console.log(min);

    console.log(dataKalman.indexOf(min));

    var min_p = dataKalman.indexOf(min);

    var max_p = dataKalman.indexOf(max);

    console.log(data_tmp.heading[min_p]);

    console.log(dataKalman);


    saveFile(data_tmp.rssi);

    saveFile(dataKalman);

    saveFile(dataKalman_1);

    var result;
    var tmp = [];

    j = 0;

    if (data_tmp.heading[min_p] > 180)
        result = data_tmp.heading[min_p] - 180;
    else
        result = data_tmp.heading[min_p] + 180;

    for (var i = 0; i < data_tmp.rssi.length; i++) {

        var angle_d = angle_diff(result, data_tmp.heading[i]);
        //        console.log(angle_d);
        if (angle_d <= 40) {
            tmp[j] = data_tmp.rssi[i];
            j++;
        }
    }

    console.log(tmp);

    dataKalman = tmp.map(function(v) {
        return kf.filter(v);
    });

    console.log(dataKalman);

    var d = calculateDistance(numbers.statistic.mean(dataKalman));
    console.log(d);

    var html = "<ul><li><li>Result [min]: " + result + "</li><li>Distance: " + (d * 1000) + "m</li></li><li>Result [max]: " + data_tmp.heading[max_p] + "</li></ul>";

    console.log(html);

    document.getElementById("result_360").innerHTML = html;



    //    var dataConstant = Array.apply(null, {
    //        length: 50
    //    }).map(function () {
    //        return 4;
    //    });
    //
    //    var noisyDataConstant = dataConstant.map(function (v) {
    //        return v + randn(0,3);
    //    });
    //
    //    var kalmanFilter = new KalmanFilter({
    //        R: 0.01,
    //        Q: 3
    //    });
    //
    //    var dataConstantKalman = noisyDataConstant.map(function (v) {
    //        return kalmanFilter.filter(v);
    //    });
    //
    //    saveFile(noisyDataConstant);
    //    saveFile(dataConstantKalman);

}


function compassSuccess(heading) {
    var magneticHeading = heading.magneticHeading;
    var trueHeading = heading.trueHeading;
    var accuracy = heading.headingAccuracy;
    //    console.log(magneticHeading + " " + trueHeading + " " + accuracy);
    //    document.getElementById("compass").innerHTML = magneticHeading+" "+trueHeading+" "+accuracy
}

function compassError(compassError) {
    console.log('Compass error: ' + compassError.code);
}

function getBeaconPosition_3p() {
    console.log(p1);
    console.log(p2);
    console.log(p3);
    console.log("*****************");
    console.log(trilateral(p1, p2, p3));
    console.log("*****************");
    var b_p;
    b_p = trilateral(p1, p2, p3);
    p_3p.x = b_p.x;
    p_3p.y = b_p.y;
    var html = "<ul><li>Latitude: " + b_p.y + "</li><li>Longitude: " + b_p.x + "</li></ul>";
    document.getElementById("beacon_p_3p").innerHTML = html;
}

function getP1() {
    p1.y = data.latitude[data.latitude.length - 1];
    p1.x = data.longitude[data.longitude.length - 1];
    p1.d = calculateDistance(data.rssi[data.rssi.length - 1]);
    var html = "<ul><li>Latitude: " + p1.y + "</li><li>Longitude: " + p1.x + "</li></ul>";
    document.getElementById("point1_p").innerHTML = html;
}

function getP2() {
    p2.y = data.latitude[data.latitude.length - 1];
    p2.x = data.longitude[data.longitude.length - 1];
    p2.d = calculateDistance(data.rssi[data.rssi.length - 1]);
    var html = "<ul><li>Latitude: " + p2.y + "</li><li>Longitude: " + p2.x + "</li></ul>";
    document.getElementById("point2_p").innerHTML = html;
}

function getP3() {
    p3.y = data.latitude[data.latitude.length - 1];
    p3.x = data.longitude[data.longitude.length - 1];
    p3.d = calculateDistance(data.rssi[data.rssi.length - 1]);
    var html = "<ul><li>Latitude: " + p3.y + "</li><li>Longitude: " + p3.x + "</li></ul>";
    document.getElementById("point3_p").innerHTML = html;
}

function getBeaconPosition() {

}

app.initialize();

function setCurrentPosition(position) {
    longitudeC = position.coords.longitude;
    latitudeC = position.coords.latitude;
    console.log(longitudeC);
    console.log(latitudeC);
}

function scanDevice() {

    if (scan) {
        // Set button text
        document.getElementById("scanButton").innerHTML = "Scan";
        scan = false;
        stopScan();
    } else {
        console.log('scan');
        document.getElementById("scanButton").innerHTML = "Stop";
        scan = true;
        startScan();

        // Set display interval
        updateTimer = setInterval(display, 500);
        upadateTimer = setInterval(displayMap, 5000);
        upadateTimer = setInterval(focus, 10000);
        // upadateTimer2                                                                = setInterval(displayBeacon, 500);
    }

}

function displayMap() {
    latLongC = new plugin.google.maps.LatLng(latitudeC, longitudeC);
    latLongB_3p = new plugin.google.maps.LatLng(p_3p.y, p_3p.x);
    var mapDiv = document.getElementById("map_canvas");
    map = plugin.google.maps.Map.getMap(mapDiv, {
        'backgroundColor': 'white',
        'controls': {
            'compass': true,
            'myLocationButton': true,
            'indoorPicker': true,
            'zoom': true
        },
        'gestures': {
            'scroll': true,
            'tilt': true,
            'rotate': true,
            'zoom': true
        },
        'camera': {
            'latLng': latLongC,
            // 'tilt': 30,
            'zoom': 20
        }
    });
    map.clear();

    map.addMarker({
        "position": latLongB_3p,
        "title": "beacon position",
        "icon": "red"
    });
}

function display() {

    displayBeaconList();
    displayBeacon();
}

function startScan() {
    evothings.ble.startScan(
        [],
        function(device) {
            var sr = base64DecToArr(device.scanRecord);
            // console.log('scanRecord: ' + uint8ArrToHexString(sr));
            device.timeStamp = Date.now();
            beacons[device.address] = device;
            // classify beacons
            // isIBeacon                                                                = true : iBeacon
            // type                                                                     = 1: Eddystone TLM
            // type                                                                     = 2: Eddystone UID
            //  type                                                                    = 3: Eddystone URL
            classify(beacons[device.address]);
        },
        function(error) {
            // console.log('BLE scan error: ' + error);
        });
}

function stopScan() {

    console.log("stop");
    // clear interval
    clearInterval(updateTimer);
    // clearInterval(updateTimer1);
    // clearInterval(updateTimer2);
    // stop scan
    evothings.ble.stopScan();
    scan = false;
}

function displayBeaconList() {

    $("#deviceList").empty();
    $('#found-beacons').empty();
    var html = '';
    var res;
    var timeNow = Date.now();
    // getSortedBeaconList: sort beacon list
    $.each(getSortedBeaconList(beacons), function(key, beacon) {
        res = '';
        if (beacon.timeStamp + 6000 > timeNow) {
            var rssiWidth = 1;
            if (beacon.rssi < -100) {
                rssiWidth = 100;
            } else if (beacon.rssi < 0) {
                rssiWidth = 100 + beacon.rssi;
            }

            var type;
            switch (beacon.type) {
                case 1:
                    type = "iBeacon ";
                    break;
                case 2:
                    type = "Eddystone TLM ";
                    break;
                case 3:
                    type = "Eddystone URI";
                    break;
                case 4:
                    type = "Eddystone URL";
                    break;
                default:
                    type = "undefined";

            }

            if (beacon.type == 1) {
                res = '<ul>' + '<li>Major: ' + beacon.major + '</li>' + '<li>Minor: ' + beacon.minor + '</li>' + '</ul>';
            }

            // var res                                                                  = '<ul>' + '<li>Address : ' + beacon.address + '</li>' + '<li>RSSI : ' + beacon.rssi + '</li>' + '</ul>';
            res += '<ul>' + '<li>Type: ' + type + '</li>' + '<li>Name: ' + beacon.name + '</li>' + '<li>Address: ' + beacon.address + '</li>' + '<li>RSSI: ' + beacon.rssi + '</li>' + '</ul>';


            var p = document.getElementById('deviceList');
            var li = document.createElement('li');
            var $a = $("<a href=\"#connected\" data-transition=\"flip\">" + res + "</a>");
            $(li).append($a);
            $a.bind("click", {
                address: beacon.address
            }, eventBeaconClicked);
            p.appendChild(li);
            $("#deviceList").listview("refresh");
        }
    });

}

function eventBeaconClicked(event) {

    strFile = "";
    // Set selected beacon

    // addressS : address of selected beacon
    addressS = event.data.address;
    startTime = Date.now();
    t = 0;
    count = 0;
    // console.log(t);
    console.log(addressS);
    // clear data log
    data.latitude = [];
    data.longitude = [];
    data.rssi = [];
    data.heading = [];
    document.getElementById('iBeacon').innerHTML = '';
    document.getElementById('Eddystone').innerHTML = '';

}

function displayBeacon() {



    var html = ''
    var res = 'Signal perdu';
    var resIBeacon = '';
    var resEddystone = '';
    var timeNow = Date.now();
    // console.log(t);
    $.each(beacons, function(key, beacon) {
        if (beacon.timeStamp + 6000 > timeNow) {
            var rssiWidth = 1; // Used when RSSI is zero or greater.
            if (beacon.rssi < -100) {
                rssiWidth = 100;
            } else if (beacon.rssi < 0) {
                rssiWidth = 100 + beacon.rssi;
            }
            console.log(longitudeC);
            if ((beacon.address == addressS)) {
                beaconS = beacon;
                //                console.log("display " + beacon.rssi);

                if (beacon.rssi) {
                    data.rssi.push(beacon.rssi);
                } else {
                    data.rssi.push(0);
                }
                // data.time.push(t);
                data.longitude.push(longitudeC);
                data.latitude.push(latitudeC);
                data.heading.push(heading_g);
                // dataChart.labels.push(t);

                //                console.log(data);

                strFile += latitudeC + "\t" + longitudeC + "\t" + beacon.rssi + "\n";

                t += 1;

                res = '<a href=\"#map\" data-transition=\"flip\"><ul>' + '<li> geolocation' + '<ul>' + '<li>Latitude : ' + latitudeC + '</li>' + '<li>Longitude : ' + longitudeC + '</li>' + '</ul></a>';
                res += '</li>' + '<li>Name: ' + beacon.name + '</li>' + '<li>Address: ' + beacon.address + '</li>' + '<li>RSSI: ' + beacon.rssi + '</li>' + '<li>Distance: ' + calculateDistance(beacon.rssi) + '</li>' + '</ul>';
                res += '<p>X: ' + p.x + ' Y: ' + p.y + '</p>';


                document.getElementById("rssi_360").innerHTML = beacon.rssi;

                if (beacon.type == 1) {
                    resIBeacon =
                        '<li>iBeacon' + '<ul>' + '<li>UUID : ' + beacon.uuid + '</li>' + '<li>Major :' + beacon.major + '</li>' + '<li>Minor : ' + beacon.minor + '</li>' + '<li>RSSI : ' + beacon.rssi + '</li>' + '<li>Distance : ' + beacon.accuracy + '</li>' + '</ul>' + '</li>';
                }

                if (beacon.type == 2) {
                    resEddystone =
                        '<li>Eddystone TLM' + '<ul>' + '<li>TxPower: ' + beacon.txPower + '</li>' + '<li>UUID: ' + beacon.uuid + '</li>' + '<li>Temperature : ' + beacon.temperature + '</li>' + '<li>PDU :' + beacon.adv_cnt + '</li>' + '<li>Battery : ' + beacon.battery + '</li>' + '<li>Time since power-on or reboot : ' + beacon.dsec_cnt + '</li>' + '</ul>' + '</li>';
                }

                if (beacon.type == 3) {
                    resEddystone =
                        '<li>Eddystone UID' + '<ul>' + '<li>UUID: ' + beacon.uuid + '</li>' + '<li>nid : ' + beacon.nid + '</li>' + '<li>bid :' + beacon.bid + '</li>' + '<li>TxPower : ' + beacon.txPower + '</li>' + '</ul>' + '</li>';
                }

                if (beacon.type == 4) {
                    resEddystone =
                        '<dt>Eddystone URL' + '<ul>' + '<li>UUID: ' + beacon.uuid + '</li>' + '<li>Url : ' + beacon.url + '</li>' + '<li>TxPower : ' + beacon.txPower + '</li>' + '</ul>' + '</li>';
                }

            }

            html = res;
            document.getElementById('deviceName').innerHTML = html;
            if (beacon.type == 1) {
                document.getElementById('iBeacon').innerHTML = resIBeacon;
            } else {
                if (beacon.type) document.getElementById('Eddystone').innerHTML = resEddystone;
            }

        }

    });
}

var logOb;

function fail(e) {
    console.log("FileSystem Error");
    console.dir(e);
}

// create log file
function saveFile(c) {
    var fileName = prompt("save as: ", "data");
    fileName += ".csv";
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {

        dir.getFile(fileName, {
            create: true
        }, function(file) {
            logOb = file;
            logOb.createWriter(truncateFile, fail);
            // console.log(logOb);
            //            writeLog(strFile);
            writeLog(c);
            alert('your file has been saved');
        });
    });


}

// clear log file
function truncateFile(writer) {
    // console.log("truncate file");
    writer.truncate(0);
};

// write log file
function writeLog(str) {
    if (!logOb)
        return;
    // var log                                                                          = str + " \n";

    logOb.createWriter(function(fileWriter) {

        fileWriter.seek(fileWriter.length);

        var blob = new Blob([str], {
            type: 'text/plain'
        });
        fileWriter.write(blob);
        console.log("going to log " + str);
        readLog();
    }, fail);
}

// read log file
function readLog() {
    logOb.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
            // console.log("File log: " + this.result);
        };

        reader.readAsText(file);
    }, fail);

}

// share log file
function shareFile() {
    // var saisie                                                                       = prompt("File name :", "");
    // alert(saisie);
    saveFile();
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
        // console.log("got main dir", dir);
        // logOb.copyTo(dir, saisie + ".txt", function (entry) {
        // console.log(logOb.nativeURL);
        // window.cordova.plugins.FileOpener.openFile(entry.nativeURL, success, error);

        cordova.plugins.email.addAlias('gmail', 'com.google.android.gm');

        // Specify app by name or alias

        cordova.plugins.email.open({
            app: 'gmail',
            attachments: [
                logOb.nativeURL
            ]
        });

        // }, fail);

    });

}

function success(data) {
    // console.log(data.message);
}

function error(code) {
    // console.log(code.message);
}

// share chart
function saveGraph() {
    var img = myLineChart.toBase64Image();
    var dataGraph = img.replace(/^data:image\/\w+;base64,/, "");

    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {

        dir.getFile("graph.png", {
            create: true
        }, function(file) {
            file.createWriter(function(writer) {
                // console.log(file);
                writer.seek(0);
                var binary = fixBinary(atob(dataGraph));
                var blob = new Blob([binary], {
                    type: 'image/png'
                });
                writer.write(blob);
                // console.log("End creating image file. File created");
            }, fail);

            cordova.plugins.email.addAlias('gmail', 'com.google.android.gm');
            cordova.plugins.email.open({
                app: 'gmail',
                attachments: [
                    file.nativeURL
                ]
            });

        });

    });

}

function fixBinary(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return buf;
}

// If device already has advertisementData, does nothing.
// If device instead has scanRecord, creates advertisementData.
function ensureAdvertisementData(device) {

    if (device.advertisementData) {
        return;
    }

    if (!device.scanRecord) {
        return;
    }
    // Bluetooth Specification, v4.0, Volume 3, Part C, Section 11
    // https://www.bluetooth.org/docman/handlers/downloaddoc.ashx?doc_id                =229737
    var byteArray = evothings.util.base64DecToArr(device.scanRecord);
    var pos = 0;
    var advertisementData = {};
    var serviceUUIDs;
    var serviceData;
    // console.log(uint8ArrToHexString(base64DecToArr(device.scanRecord)));
    // console.log(byteArray);

    while (pos < byteArray.length) {
        // length :  Length field
        var length = byteArray[pos++];
        if (length == 0) {
            break;
        }
        length -= 1;
        // type: Flags AD type
        var type = byteArray[pos++];
        // console.log(type);
        // var BLUETOOTH_BASE_UUID                                                      = '-0000-1000-8000-00805f9b34fb'
        // console.log('pos: ' + pos + ' length: ' + length);


        function arrayToUUID(array, offset) {
            var k = 0;
            var string = '';
            var UUID_format = [4, 2, 2, 2, 6];
            for (var l = 0; l < UUID_format.length; l++) {
                if (l != 0) {
                    string += '-';
                }
                for (var j = 0; j < UUID_format[l]; j++, k++) {
                    string += evothings.util.toHexString(array[offset + k], 1);
                }
            }
            return string;
        }


        // Service UUIDs may be either 16-bit UUIDs, 32-bit UUIDs or 128-bit UUIDs

        // flag 16-bit Service UUIDs
        // 0x02 : More 16-bit UUIDs available
        // 0x03 : Complete list of 16-bit UUIDs available
        if (type == 0x02 || type == 0x03) {
            // the 16-bit Attribute UUID replaces the x’s in the following:
            // 0000xxxx-0000-1000-8000-00805F9B34FB
            // For example, the 16-bit Attribute UUID of 0x1234 is equivalent to the 128-bit UUID of
            // 00001234-0000-1000-8000-00805F9B34FB
            serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
            for (var i = 0; i < length; i += 2) {
                serviceUUIDs.push(
                    '0000' +
                    evothings.util.toHexString(
                        evothings.util.littleEndianToUint16(byteArray, pos + i),
                        2) +
                    BLUETOOTH_BASE_UUID);
            }

            // console.log('serviceUUIDs: ' + serviceUUIDs);
        }

        // 32-bit Service UUIDs
        // 0x04 : More 32-bit UUIDs available
        // 0x05 : Complete list of 32-bit UUIDs available
        if (type == 0x04 || type == 0x05) {
            serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
            for (var i = 0; i < length; i += 4) {
                serviceUUIDs.push(
                    evothings.util.toHexString(
                        evothings.util.littleEndianToUint32(byteArray, pos + i),
                        4) +
                    BLUETOOTH_BASE_UUID);
            }
            // console.log('serviceUUIDs: ' + serviceUUIDs);
        }


        // 128-bit Service UUIDs
        // 0x06 : More 128-bit UUIDs available
        // 0x07 : Complete list of 128-bit UUIDs available
        if (type == 0x06 || type == 0x07) {
            serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
            for (var i = 0; i < length; i += 16) {
                serviceUUIDs.push(arrayToUUID(byteArray, pos + i));
            }
            // console.log('serviceUUIDs:' + serviceUUIDs);
        }

        // The Local Name AD type contains the device name, either complete or shortened
        // 0x08 : Shortened local name
        // 0x09 : Complete local name
        if (type == 0x08 || type == 0x09) {
            advertisementData.kCBAdvDataLocalName = evothings.ble.fromUtf8(
                new Uint8Array(byteArray.buffer, pos, length));
            // console.log('kCBAdvDataLocalName: ' + advertisementData.kCBAdvDataLocalName);
        }

        // TX Power Level
        // when the TX Power Level tag is not present,
        // the TX power level of the packet is unknown.
        if (type == 0x0a) {
            advertisementData.kCBAdvDataTxPowerLevel =
                evothings.util.littleEndianToInt8(byteArray, pos);
            // console.log('kCBAdvDataTxPowerLevel: ' + advertisementData.kCBAdvDataTxPowerLevel);
        }

        // Service Data, 16-bit UUID
        // The first 2 octets contain the 16 bit Service UUID followed by additional service data
        if (type == 0x16) {
            serviceData = serviceData ? serviceData : {};
            var uuid =
                '0000' +
                evothings.util.toHexString(
                    evothings.util.littleEndianToUint16(byteArray, pos),
                    2) +
                BLUETOOTH_BASE_UUID;
            var data = new Uint8Array(byteArray.buffer, pos + 2, length - 2);
            serviceData[uuid] = base64.fromArrayBuffer(data);
            // console.log('serviceData: ' + uint8ArrToHexString(data));
        }

        // Service Data, 32-bit UUID
        if (type == 0x20) {
            serviceData = serviceData ? serviceData : {};
            var uuid =
                evothings.util.toHexString(
                    evothings.util.littleEndianToUint32(byteArray, pos),
                    4) +
                BLUETOOTH_BASE_UUID;
            var data = new Uint8Array(byteArray.buffer, pos + 4, length - 4);
            serviceData[uuid] = base64.fromArrayBuffer(data);
            // console.log('serviceData: ' + uint8ArrToHexString(data));
        }

        // Service Data, 128-bit UUID
        if (type == 0x21) {
            serviceData = serviceData ? serviceData : {};
            var uuid = arrayToUUID(byteArray, pos);
            var data = new Uint8Array(byteArray.buffer, pos + 16, length - 16);
            serviceData[uuid] = base64.fromArrayBuffer(data);
            // console.log('data: ' + serviceData);
        }

        // Manufacturer-specific Data
        // The first 2 octets contain the Company Identifier
        // Code followed by additional manufacturer specific data
        if (type == 0xff) {
            advertisementData.kCBAdvDataManufacturerData =
                base64.fromArrayBuffer(new Uint8Array(byteArray.buffer, pos, length));
            // console.log('kCBAdvDataManufacturerData: ' + advertisementData.kCBAdvDataManufacturerData);
        }

        pos += length;
    }
    advertisementData.kCBAdvDataServiceUUIDs = serviceUUIDs;
    advertisementData.kCBAdvDataServiceData = serviceData;
    device.advertisementData = advertisementData;

}

function mapBeaconRSSI(rssi) {
    if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
    if (rssi < -100) return 0; // Max RSSI
    return 100 + rssi;
}

// sort beacon list
function getSortedBeaconList(beacons) {
    var beaconList = [];
    for (var key in beacons) {
        beaconList.push(beacons[key]);
    }
    beaconList.sort(function(beacon1, beacon2) {
        return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
    });
    return beaconList;
}

// https://github.com/google/eddystone/tree/master/eddystone-uid
// Return true on frame type recognition, false otherwise.
function parseFrameUID(device, data, win, fail) {

    // The specific type of Eddystone frame is encoded in the high-order four bits
    // of the first octet in the Service Data
    // 0x00 : UID
    if (data[0] != 0x00) return false;

    // The UID frame has 18 bytes + 2 bytes reserved for future use
    // https://github.com/google/eddystone/tree/master/eddystone-uid
    // Check that we got at least 18 bytes.
    if (data.byteLength < 18) {
        return true;
    }

    // byte offset 1 : Calibrated Tx power at 0 m
    device.txPower = evothings.util.littleEndianToInt8(data, 1);
    // byte offset 2-11 : Namespace ID
    device.nid = data.subarray(2, 12);
    // byte offset 12-17 : Beacon ID
    device.bid = data.subarray(12, 18);
    device.accuracy = calculateAccuracy(device.rssi, device.txPower);
    // console.log('nid: ' + device.nid);
    // console.log('bid: ' + device.bid);
    // console.log('txPower: ' + device.txPower);

    return true;
}

// https://github.com/google/eddystone/tree/master/eddystone-url
function parseFrameURL(device, data, win, fail) {
    // The specific type of Eddystone frame is encoded in the high-order four bits
    // of the first octet in the Service Data
    // 0x10 : URL
    if (data[0] != 0x10) return false;

    if (data.byteLength < 4) {
        return true;
    }
    // byte offset 1 : Calibrated Tx power at 0 m
    device.txPower = evothings.util.littleEndianToInt8(data, 1);
    device.accuracy = calculateAccuracy(device.rssi, device.txPower);
    // console.log('txPower: ' + device.txPower);
    // byte offset 2 : Encoded Scheme Prefix
    var url;
    switch (data[2]) {
        case 0:
            url = 'http://www.';
            break;
        case 1:
            url = 'https://www.';
            break;
        case 2:
            url = 'http://';
            break;
        case 3:
            url = 'https://';
            break;
        default:
            return true;
    }

    // byte offset 3+ : Encoded URL
    // Process each byte in sequence.
    var i = 3;
    while (i < data.byteLength) {
        var c = data[i];
        // A byte is either a top-domain shortcut, or a printable ascii character.
        if (c < 14) {
            switch (c) {
                case 0:
                    url += '.com/';
                    break;
                case 1:
                    url += '.org/';
                    break;
                case 2:
                    url += '.edu/';
                    break;
                case 3:
                    url += '.net/';
                    break;
                case 4:
                    url += '.info/';
                    break;
                case 5:
                    url += '.biz/';
                    break;
                case 6:
                    url += '.gov/';
                    break;
                case 7:
                    url += '.com';
                    break;
                case 8:
                    url += '.org';
                    break;
                case 9:
                    url += '.edu';
                    break;
                case 10:
                    url += '.net';
                    break;
                case 11:
                    url += '.info';
                    break;
                case 12:
                    url += '.biz';
                    break;
                case 13:
                    url += '.gov';
                    break;
            }
        } else if (c < 32 || c >= 127) {
            // Unprintables are not allowed.
            return true;
        } else {
            url += String.fromCharCode(c);
        }

        i += 1;
    }

    // Set URL field of the device.
    device.url = url;

    // console.log('url: ' + device.url);

    return true;
}


function parseFrameTLM(device, data) {
    // https://github.com/google/eddystone/blob/master/eddystone-tlm/tlm-plain.md
    // The specific type of Eddystone frame is encoded in the high-order four bits
    // of the first octet in the Service Data
    // 0x20 : TLM
    // console.log('data[0]                                                             = ' + data[0]);
    if (data[0] != 0x20) return false;

    // byte offset 1 : TLM version, value                                               = 0x00
    // TLM version allows for future development of this frame type.
    // At present the value must be 0x00
    // console.log('data[1]                                                             = ' + data[1]);
    if (data[1] != 0x00) {
        return true;
    }
    if (data.byteLength != 14) {
        return true;
    }

    // byte offset 2 : Battery voltage, 1 mV/bit
    device.voltage = evothings.util.bigEndianToUint16(data, 2);

    // byte offset 4 : Beacon temperature
    // Beacon temperature is the temperature in degrees Celsius sensed by the beacon
    // and expressed in a signed 8.8 fixed-point notation.
    // If not supported the value should be set to 0x8000, -128 °C
    // https://courses.cit.cornell.edu/ee476/Math/

    var temp = evothings.util.bigEndianToUint16(data, 4);

    // numbers are stored as 16-bit signed ints, with the binary-point between bit 7 and bit 8
    // There will be 8 bits of integer and 8 bits of fraction, so we will refer to this as 8:8 fixed point.
    // This representation allows a dynamic range of +/- 127, with a resolution of 1/256=0.00396
    if (temp == 0x8000) {
        // 0x8000                                                                       = 32768
        // temperature                                                                  = 32768 / 256 = 128
        device.temperature = 0x8000;
    } else {
        device.temperature = evothings.util.bigEndianToInt16(data, 4) / 256.0;
    }

    // byte offset 6 : Advertising PDU count
    device.adv_cnt = evothings.util.bigEndianToUint32(data, 6);
    // device.dsec_cnt                                                                  = new Date(evothings.util.bigEndianToUint32(data, 10));
    var now = new Date();

    // byte offset 10 : Time since power-on or reboot
    // SEC_CNT is a 0.1 second resolution counter that represents time since beacon power-up or reboot.
    device.dsec_cnt = new Date(now - evothings.util.bigEndianToUint32(data, 10));
    return true;
}

// classify beacons
// isIBeacon                                                                            = true : iBeacon
// type                                                                                 = 1: Eddystone TLM
// type                                                                                 = 2: Eddystone UID
//  type                                                                                = 3: Eddystone URL

function classify(device) {
    var sr = base64DecToArr(device.scanRecord);
    // device.isIBeacon                                                                 = false;
    device.type = 0;

    // Check if it is an iBeacon
    if (parseScanRecord(device, sr)) {
        // device.isIBeacon                                                             = true;
        device.type = 1;
    }

    // Check if it is an Eddystone
    ensureAdvertisementData(device);
    var ad = device.advertisementData;
    if (!ad) return;
    var sd = ad.kCBAdvDataServiceData;
    if (!sd) return;
    // console.log(ad.kCBAdvDataServiceUUIDs);
    device.uuid = ad.kCBAdvDataServiceUUIDs;
    // console.log(ad.kCBAdvDataLocalName);
    var base64data = sd['0000feaa' + BLUETOOTH_BASE_UUID];
    if (!base64data) return;
    var byteArray = base64DecToArr(base64data);

    // Check if it is an Eddystone TLM
    if (parseFrameTLM(device, byteArray)) {
        device.type = 2;
        return;
    }

    // Check if it is an Eddystone UID
    if (parseFrameUID(device, byteArray)) {
        device.type = 3;
        return;
    }

    // Check if it is an Eddystone URL
    if (parseFrameURL(device, byteArray)) {
        device.type = 4;
        return;
    }

}

// Check if it is an iBeacon
function parseScanRecord(device, sr) {

    // The first 4 bytes of AD Data of iBeacon are 0x4C, 0x00, 0x02 and 0x15.
    // The first 2 bytes (0x4C, 0x00) mean "Apple, Inc."
    // and the next 2 bytes (0x02, 0x15) mean "iBeacon format".
    for (var pos = 2; pos < 6; pos++) {
        if (sr[pos + 0] == 0x4c &&
            sr[pos + 1] == 0x00 &&
            sr[pos + 2] == 0x02 &&
            sr[pos + 3] == 0x15) {
            // var b                                                                    = device;

            // Proximity UUID (16 bytes)
            var uuid = new Uint8Array(sr.buffer, pos + 4, 16);
            // major number (2 bytes)
            var major = new Uint8Array(sr.buffer, pos + 20, 2);
            // minor number (2 bytes)
            var minor = new Uint8Array(sr.buffer, pos + 22, 2);
            // power (1 byte) follow the first 4 bytes
            var txPower = new Int8Array(sr.buffer, pos + 24, 1)[0];

            var accuracy = calculateAccuracy(device.rssi, txPower);
            device.uuid = uint8ArrToHexString(uuid);
            device.major = parseInt(uint8ArrToHexString(major), 16);
            device.minor = parseInt(uint8ArrToHexString(minor), 16);
            device.txPower = txPower;
            device.accuracy = accuracy;
            return device;
        }
    }
    return null;
}

function uint8ArrToHexString(arr) {
    return Array.prototype.map.call(arr, function(n) {
        var s = n.toString(16);
        if (s.length == 1) {
            s = '0' + s;
        }
        return s;
    }).join('');
}

function b64ToUint6(nChr) {

    return nChr > 64 && nChr < 91 ?
        nChr - 65 : nChr > 96 && nChr < 123 ?
        nChr - 71 : nChr > 47 && nChr < 58 ?
        nChr + 4 : nChr === 43 ?
        62 : nChr === 47 ?
        63 :
        0;
}

function base64DecToArr(sBase64, nBlocksSize) {

    var
        sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
        nInLen = sB64Enc.length,
        nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
        taBytes = new Uint8Array(nOutLen);

    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3;
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            }
            nUint24 = 0;

        }
    }

    return taBytes;
}

function calculateAccuracy(rssi, txPower) {
    var ratio = rssi * 1.0 / txPower;
    if (ratio < 1.0) {
        return Math.pow(ratio, 10);
    } else {
        return (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
    }
}

function distance(p1, p2) {
    return Math.pow(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2), 0.5);
}

function calculateDistance(rssi) {

    return 1.0 * Math.exp(((-63.22445) - rssi + 2.38464) / (10 * 1.55881)) / 1000;

}

function trilateral(p1, p2, p3) {

    var R = 6371;
    var P1 = [R * (math.cos(rad(p1.y)) * math.cos(rad(p1.x))), R * (math.cos(rad(p1.y)) * math.sin(rad(p1.x))), R * (math.sin(rad(p1.y)))];
    var P2 = [R * (math.cos(rad(p2.y)) * math.cos(rad(p2.x))), R * (math.cos(rad(p2.y)) * math.sin(rad(p2.x))), R * (math.sin(rad(p2.y)))];
    var P3 = [R * (math.cos(rad(p3.y)) * math.cos(rad(p3.x))), R * (math.cos(rad(p3.y)) * math.sin(rad(p3.x))), R * (math.sin(rad(p3.y)))];

    var ex = math.divide(math.subtract(P2, P1), math.norm(math.subtract(P2, P1)));
    var i = math.dot(ex, math.subtract(P3, P1));
    var ey = math.divide(
        math.subtract(
            math.subtract(P3, P1),
            math.multiply(i, ex)
        ),
        math.norm(
            math.subtract(
                math.subtract(P3, P1),
                math.multiply(i, ex)
            )
        )
    );

    var ez = math.cross(ex, ey);
    var d = math.norm(math.subtract(P2, P1));
    var j = math.dot(ey, math.subtract(P3, P1));

    var x = (math.pow(p1.d, 2) - math.pow(p2.d, 2) + math.pow(d, 2)) / (2 * d);
    var y = ((math.pow(p1.d, 2) - math.pow(p3.d, 2) + math.pow(i, 2) + math.pow(j, 2)) / (2 * j)) - ((i / j) * x);

    var z = math.sqrt(math.abs(math.pow(p1.d, 2) - math.pow(x, 2) - math.pow(y, 2)));
    //    console.log(P1);
    //    console.log(P2);
    //    console.log(P3);
    //    console.log(ex);
    //    console.log(i);
    //    console.log(ey);
    //    console.log(ez);
    //    console.log(d);
    //    console.log(j);
    //    console.log(x);
    //    console.log(y);
    var triPt = math.add(
        math.add(
            math.add(P1,
                math.multiply(x, ex)
            ),
            math.multiply(y, ey)
        ),
        math.multiply(z, ez)
    );

    //    console.log(triPt[1]);
    //    console.log(triPt[0]);
    var res = {
        lat: 0,
        lon: 0
    };
    res.y = deg(math.asin(math.divide(triPt[2], R)));
    res.x = deg(math.atan2(triPt[1], triPt[0]));

    return res;

}


function rad(deg) {
    return deg * (Math.PI / 180);
}

function deg(rad) {
    return rad * (180 / Math.PI);
}

if (typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }
}

function angle_diff(alpha, beta) {
    var phi = Math.abs(beta - alpha) % 360;
    var distance = phi > 180 ? 360 - phi : phi;
    return distance;
}

function randn(mean, variance) {
    if (mean == undefined)
        mean = 0.0;
    if (variance == undefined)
        variance = 1.0;
    var V1, V2, S;
    do {
        var U1 = Math.random();
        var U2 = Math.random();
        V1 = 2 * U1 - 1;
        V2 = 2 * U2 - 1;
        S = V1 * V1 + V2 * V2;
    } while (S > 1);

    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    //Y = Math.sqrt(-2 * Math.log(S) / S) * V2;
    X = mean + Math.sqrt(variance) * X;
    //Y = mean + Math.sqrt(variance) * Y ;
    return X;
}
