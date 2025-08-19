// ==UserScript==
// @name         WME Store Closer
// @namespace    https://github.com/jm6087/
// @version      2025.08.18.02
// @description  Small script to set store to closed status and change hours.
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @exclude      https://www.waze.com/user/editor*
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @require      https://greasyfork.org/scripts/37486-wme-utils-hoursparser/code/WME%20Utils%20-%20HoursParser.js
// @author       jm6087
// @grant        unsafeWindow
// ==/UserScript==

/* global W */
/* global WazeWrap */
/* global $ */
/* global wazedevtoastr */
/* global MultiAction */
/* global require */

(function(){
    'use strict';
    var UPDATE_NOTES = ''
    var VERSION = GM_info.script.version;
    var SCRIPT_NAME = GM_info.script.name;
    let UpdateObj;
    var hoursparser;
    let typeClosed = ' (closed)';

    let sdk;
    unsafeWindow.SDK_INITIALIZED.then(() => {
        if (!unsafeWindow.getWmeSdk) {
            throw new Error("SDK is not installed");
        }
        sdk = unsafeWindow.getWmeSdk({ scriptId: "wme-store-closer", scriptName: SCRIPT_NAME });
        console.log(`SDK v ${sdk.getSDKVersion()} on ${sdk.getWMEVersion()} initialized`);
        //     sdk.Events.once({ eventName: "wme-ready" }).then(wmestore);
    });

    function ClosedVenue(){
        var selectedVenueID = sdk.Editing.getSelection().ids[0]
        var selectedVenue = sdk.DataModel.Venues. getById({ venueId:  selectedVenueID });
        var origName = selectedVenue.name;
        let closedName1 = origName + typeClosed;
        let pasteHours = "W 3:11 to 3:12";
        var parserResult = hoursparser.parseHours(pasteHours);

        sdk.DataModel.Venues.updateVenue({
            venueId: selectedVenue.id, // assuming `selected` is a venue object
            name: closedName1,
            openingHours: parserResult.hours
        });

    }
    // Function the selection listener runs to display the button when an object is selected
    function displayButton() {
        console.log(SCRIPT_NAME, "Selection Changed");
        const sel1 = sdk.Editing.getSelection();

        if (sel1 && sel1.ids.length > 0) {
            if(sel1.objectType == 'venue') {
                $('#MyclosedVenueContainer').css('display', 'block');
            } else {
                $('#MyclosedVenueContainer').css('display', 'none');
            }
        }else {
            $('#MyclosedVenueContainer').css('display', 'none');
        }
    }

    function init() {
        hoursparser = new HoursParser();
        const $closedVenuebttnDiv = $('<div>');
        $closedVenuebttnDiv.html([
            `<div id='MyclosedVenueContainer' style='position: absolute; display:none; left: 20px; top: 330px; background-color:#35B6EE; width:30px; height:30px; cursor:pointer'>`,
            `<i class="fas fa-times-circle fa-2x"></i>`,
            `</div>`
        ].join(' '));
        // Attach the button to the map element
        $('#map').append($closedVenuebttnDiv.html());

        // Setup listener to run the function when the button is clicked
        $('#MyclosedVenueContainer').click(function () {
            ClosedVenue();
        });
        WazeWrap.Interface.ShowScriptUpdate(SCRIPT_NAME, VERSION, UPDATE_NOTES);
        console.log(SCRIPT_NAME, "loaded");
        sdk.Events.on({ eventName: "wme-selection-changed", eventHandler: displayButton})

    }

    document.addEventListener("wme-ready", init, { once: true });
})();
