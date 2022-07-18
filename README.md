# TAO PCI: Itembuilder Integration (including TAO extension)

To get this extension in your TAO installation, modify your root composer.json as follow:

## 1. Add the repository
```
"repositories": [
    ...,
    {
       "type": "vcs",
       "url": "https://gitlab.tba-hosting.de/fwagner/oat-ibtaoconnector.git"
    }
],

```

## 2. Add the extension
```
require" : {
    ...,
    "fwagner/oat-ibtaoconnector": "dev-develop"
],

```

## 3. Update composer
```
composer update --prefer-source
