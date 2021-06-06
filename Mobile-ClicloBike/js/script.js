var infowindow;
function initMap() {
    window.myMap = new google.maps.Map(document.getElementById("map"), {
        mapTypeControl: false,
        center: { lat: -19.8573741, lng: -43.9108319 },
        zoom: 15.3,
    });
    new AutocompleteDirectionsHandler(myMap);
    async function getLocation() {
        await navigator.geolocation.getCurrentPosition((position) =>
            setNewCenter(position.coords)
        );
    }

    getLocation();

    function setNewCenter(position) {
        myMap.setCenter({
            lat: position.latitude,
            lng: position.longitude,
        });
    }
}

/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = "BICYCLING";
    var originInput = document.getElementById("origin-input");
    var destinationInput = document.getElementById("destination-input");
    var modeSelector = document.getElementById("mode-selector");
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(originInput, {
        fields: ["place_id", "name", "types"],
    });
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput,
        { fields: ["place_id", "name", "types"] }
    );

    // this.setupClickListener("changemode-walking", "WALKING");
    // this.setupClickListener("changemode-transit", "TRANSIT");
    // this.setupClickListener("changemode-driving", "DRIVING");

    this.setupPlaceChangedListener(originAutocomplete, "ORIG");
    this.setupPlaceChangedListener(destinationAutocomplete, "DEST");

    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (
    id,
    mode
) {
    var radioButton = document.getElementById(id);
    var me = this;
    radioButton.addEventListener("click", function () {
        me.travelMode = mode;
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
    autocomplete,
    mode
) {
    var me = this;
    autocomplete.bindTo("bounds", this.map);
    autocomplete.addListener("place_changed", function () {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === "ORIG") {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    // alert(this.originPlaceId);

    this.directionsService.route(
        {
            origin: { placeId: this.originPlaceId },
            destination: { placeId: this.destinationPlaceId },
            travelMode: this.travelMode,
        },
        function (response, status) {
            if (status === "OK") {
                me.directionsDisplay.setDirections(response);

                document.getElementById("startlat").innerHTML =
                    response.routes[0].legs[0].start_location.lat();
                document.getElementById("startlng").innerHTML =
                    response.routes[0].legs[0].start_location.lng();
                document.getElementById("endlat").innerHTML =
                    response.routes[0].legs[0].end_location.lat();
                document.getElementById("endlng").innerHTML =
                    response.routes[0].legs[0].end_location.lng();

                console.log(response.routes[0].legs[0].start_location.lat());
                console.log(response.routes[0].legs[0].start_location.lng());

                console.log(response.routes[0].legs[0].end_location.lat());
                console.log(response.routes[0].legs[0].end_location.lng());
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
};
