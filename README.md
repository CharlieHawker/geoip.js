# GeoIP

GeoIP is a simple javascript library intended for use on multi-region *static*
websites. To perform javascript redirects to the visiting user's correct region.

The library works in the following way:

1. Check for the user's preferred region (if set) in local storage and verifies 
its age.

2. Checks for a cached store of the user's _actual_ region and verifies its age.

3. Failing the above, it will then perform a 
[MaxMind Javascript API](http://dev.maxmind.com/geoip/geoip2/javascript/) request
for the user's _actual_ ISO country code and store the associated location in
the user's local storage with the current timestamp.

4. If the user is not on the discovered regional url, a redirect will be performed
to it; in the case of the default region, this will be simply:

  ```
  /<current_path>
  ```

  Or for non-default regions:

  ```
  /<region>/<current_path>
  ```


## Requirements
- A MaxMind GeoIP2 Precision service account (country level is sufficient).
- Clients will need to be using a browser which 
[supports localStorage](http://caniuse.com/#feat=namevalue-storage) for 
caching to work, but it will function OK without caching (just make more API
requests!)

## Installation

1. Grab the source:

    Either install the package via bower, with:

    ```
    bower install geoip.js
    ```

    Or, alternatively grab the source from GitHub.

2. Add as high up in the `head` of your pages as you dare (usually before CSS but 
after critical meta tags):

    ```
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Basic GeoIP Example</title>
      <meta charset="utf-8" />
      <script type="text/javascript" src="/bower_components/geoip.js/lib/geoip.js"></script>
      ...
    ```

3. Create a new instance of GeoIp with your site's available regions and their 
associated [ISO-3166](http://www.iso.org/iso/country_codes) country codes, as well as the default region:

    ```
      window.geoIp = new GeoIp({
        regions: {
          'europe': [
            'GB','FR','DE','IT','ES'
          ],
          'asia': [
            'JP','CN'
          ],
          'apac': [
            'NZ','AU'
          ],
          'americas': [
            'US','CA','MX'
          ]
        },
        defaultRegion: 'europe'
      });
    ```

3. You can now use that variable to override the user's preferred location:

    ```
    window.geoIp.setLocation('preferred', 'apac');
    ```

## API Options

#### `regions` (required)
An object containing key-value pairs of region handles and the ISO-3166 country 
codes which should result in a redirect to that region.

#### `defaultRegion` (required)
Region which should be treated as the default.

#### `maxmindSettings` (optional)
Optional object of API options to pass to maxmind javascript API when performing 
lookups.

#### `locationTimeout` (optional)
Optional time in milliseconds that a locally stored location will no longer be 
treated as valid.

Defaults to 30 days.

#### `locationStorePriority` (optional)
Optional array of location storage strings which will be searched, in priority order, 
when trying to determine location. 

Defaults to `['preferred', 'maxmind']`.


## Comments / suggestions

Feel free to get in touch [by email](mailto:hello@charliehawker.com) or [twitter (@CharlieHawker)](http://twitter.com/CharlieHawker)
