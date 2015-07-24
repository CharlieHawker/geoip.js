;(function() {

  var GeoIp = function(options) {

    if ( options.locationTimeout == undefined )
      options.locationTimeout = 2592000000; // 30 days
    if ( options.maxmindSettings == undefined )
      options.maxmindSettings = {}; // default max mind api options
    if ( options.locationStorePriority == undefined )
      options.locationStorePriority = ['preferred', 'maxmind'];

    this.options = options;
    this.location = false;

    this.getLocation();
  };


  // Handler to get location either from local storage or maxmind
  GeoIp.prototype.getLocation = function() {
    var geoip = this;

    if ( ! ( 'localStorage' in window && window['localStorage'] !== null ) || ! geoip.loadFromLocalStorage() )
      geoip.performLookup();
  };


  // Attempts to retrieve the location from local storage if its there
  GeoIp.prototype.loadFromLocalStorage = function() {
    var geoip = this,
        i = 0;

    while ( geoip.options.locationStorePriority[i] !== undefined ) {
      if ( ( storedResultJson = window.localStorage.getItem(geoip.options.locationStorePriority[i]) ) !== null ) 
      {
        var json = JSON.parse(storedResultJson);
        geoip.storageDate = json['date'];
        geoip.location = json['location'];
        
        // If within acceptable date range, redirect to correct region
        if ( geoip.verifyAge() ) 
        {
          geoip.redirectIfNeeded();
          return true;
          break;
        }
        else // Clear the out of date data from local storage
          window.localStorage.removeItem(geoip.options.locationStorePriority[i]); 
      }
      i++;
    }
    return false;
  };


  // Verifies the location is not too old
  GeoIp.prototype.verifyAge = function() {
    var geoip = this,
        today = new Date().getTime(),
        storedOn = new Date(geoip.storageDate).getTime();

      return ( ( today - storedOn ) < geoip.options.locationTimeout );
  };


  // Sets the location, retrieval date and stores into local storage if available
  GeoIp.prototype.setLocation = function(type, location) {
    var geoip = this;

    geoip.location = location;
    geoip.storageDate = new Date().getTime();

    if ( 'localStorage' in window && window['localStorage'] !== null )
    {
      window.localStorage.setItem(type, JSON.stringify({
        location: geoip.location,
        date: geoip.storageDate
      }));
    }

    geoip.redirectIfNeeded();
  };

  // Redirects the user to the correct region if required
  GeoIp.prototype.redirectIfNeeded = function() {
    var geoip = this,
        parts = window.location.pathname.split('/'),
        userRegion = '',
        currentRegion = geoip.options.defaultRegion;

    // Loop over available regions and determine correct one for current user
    for ( var region in geoip.options.regions ) 
    {
      // Make a log of the current region
      if ( region === parts[1] )
        currentRegion = region;

      // Region set already as preferred, or location is a country within this region
      if ( region === geoip.location || geoip.options.regions[region].indexOf(geoip.location) !== -1 )
        userRegion = region;
    }

    // Redirect to region if the current one is not that one
    if ( userRegion !== currentRegion ) {
      if ( userRegion === geoip.options.defaultRegion )
        parts[1] = '';
      else if ( currentRegion === geoip.options.defaultRegion )
        parts.unshift('/' + userRegion);
      else
        parts[1] = userRegion;

      window.location = parts.join('/').replace('//', '/');
    }
  };


  // Performs a maxmind ip lookup in the absence of locally stored location data
  GeoIp.prototype.performLookup = function() {
    var geoip = this,
        script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function() {
      geoip2.country(function(result) {
        geoip.successHandler(result);
      }, function(error) {
        geoip.errorHandler(error);
      }, geoip.options.maxmindSettings);
    };
    script.src = '//js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js';
    document.getElementsByTagName('head')[0].appendChild(script);
  };


  // Success handler for maxmind ip lookup
  GeoIp.prototype.successHandler = function(result) {
    var geoip = this;
    geoip.setLocation('maxmind', result.country.iso_code);
  };


  // Error handler for maxmind ip lookup
  GeoIp.prototype.errorHandler = function(error) {
    var geoip = this;
    geoip.setLocation('maxmind', geoip.options.defaultRegion);
  };


  window.GeoIp = GeoIp;
}());