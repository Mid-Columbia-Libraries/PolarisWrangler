# Polaris Wrangler

Polaris Wrangler is an Electron based application for Windows that helps Polaris libraries to leverage the Polaris API for the purpose of improving the collection.

It also optionally uses the New York Times bestseller's list APIs and the Novelist API.

## Series Wrangler

The Series Wrangler tool can be used to locate series that the libraries has in the collection, but that are missing items.

It is smart enough to understand that a series can be split across different material types, and display information about whether the series is complete in each type, or even as a "Frakenstein". For example, you might have a copy of The _Fellowship of the Ring_ in print, _The Two Towers in eBook_, and the _Return of the King_ in Audiobook. This series would be considered complete as a Frakenstein, though the tool would show you that you lack a complete series in Print, Ebook and Audiobook as well.

In addition, you can deep dive into the data for each series, taking a look at your exact holding count of each material type and title.

![Series Wrangler Example](/docs/Series-Wrangler.png?raw=true "Incomplete Series Wrangler Tool")

## NYT Wrangler

The NYT Wrangler uses the New York Times Bestseller's APIs to help you identify items that are currently popular but may be missing or under-represented in the collection. You can select from any of the several dozen NYT Bestseller's lists, or a combination of them, and get a visual display of the rank, number of weeks on the list, and the holding counts in the collection for Print, Large Type, eBook, eAudio book, and CD.

![NYT Wrangler Example](/docs/NYT-Wrangler.png?raw=true "New York Times Bestsellers Wrangler Tool")

## API Wrangler

The API Wrangler provides an easy to use way to debug queries to the Polaris API using the jsPAPI library. It displays both the data response as well as the XHR metadata such as headers for both the request and the response.

![API Wrangler Example](/docs/API-Wrangler.png?raw=true "Polaris API Wrangler Tool")

## Configuration

In order to utilize the tool you will need to enter some configuration values for connecting to your library's APIs, for example URLs and keys.

Once you have entered your configuration, you can click "Test" and the tool will attempt to run a test query and confirm that it is working. Once you have entered working details, you can export your configuration to share with colleagues at your system which they can easily import.