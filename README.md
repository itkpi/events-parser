# events-parser

[![dependencies Status](https://david-dm.org/itkpi/events-parser/status.svg?style=flat-square)](https://david-dm.org/itkpi/events-parser)
[![devDependencies Status](https://david-dm.org/itkpi/events-parser/dev-status.svg?style=flat-square)](https://david-dm.org/itkpi/events-parser?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c779272f058541ffb6aeb57aa1630c43)](https://www.codacy.com/app/m-vlasov/events-parser?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=itkpi/events-parser&amp;utm_campaign=Badge_Grade)

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Events-parser work with:
* DOU.ua
* Meetup.com
* AIN.ua
* BigCityEvent.com
* FB.com
* VK.com (in future)

Licensed under the Apache License, Version 2.0.



## Prerequisites
* [Git](https://git-scm.com/downloads)

+
* [Vagga](http://vagga.readthedocs.io/en/latest/installation.html) (higly recomended)
<br>OR
* [Node.JS](https://nodejs.org/uk/) 4+ (not recomended)



## Clone repo
```bash
$ git clone https://github.com/itkpi/events-parser.git
```



## Build and run



### Vagga-way


#### Add enviroment keys
##### Add variables to your shell on this pattern:
```bash
$ export VAGGA_ENV_%variable_name%='%value%'
```
**Warning!** Keep in mind how your shell work with variables: kept variables only in active session or global.

##### Or add variables to `environ:` in your `vagga.yaml`
```bash
%variable_name%: %value%
```
**Warning!** `environ:` variables has higher priority than shell variables.

**[All supported enviroment variables](#all-supported-enviroment-variables)**

#### Install dependencies and run
```bash
$ vagga run
```


### NodeJS-way


#### Add enviroment keys
Add variables to your shell on this pattern:
```bash
$ export %variable_name%='%value%'
```
**Warning!** Keep in mind how your shell work with variables: kept variables only in active session or global.

**[All supported enviroment variables](#all-supported-enviroment-variables)**

#### Install dependencies
```bash
$ npm install
```

#### Run
```bash
$ node main.js
```



## All supported enviroment variables



### Need for send events to API
```bash
EMAIL='your@mail.domain' 
HOSTNAME_URL='your.api.host.name'
HOSTNAME_PATH='/path/to/you/suggestions/api'
HOSTNAME_PORT='80'
```


### Need for Blacklist
```bash
BAN_IN_TITLE='Ignore this phrase|and this|case insensitive'
BAN_IN_TITLE_OR_AGENDA='Ignore this phrase or company|and this|case insensitive'
BAN_COURSE_TITLE='Курс|Course' #case insensitive
BAN_COURSE_COMPANY='Ignore courses by this company|and this|you can ban by URLs - it\'s more efective'
```


### Meetup access token
```bash
MEETUP_OPEN_EVENTS='https://api.meetup.com/2/open_events?your-settings'
```
More details about `MEETUP` in [this page](https://github.com/itkpi/events-parser/wiki/Meetup.com).


### Facebook access token
```bash
FB_ACCESS_TOKEN='your_facebook_token'
```
You can get Access Token on [this page](https://developers.facebook.com/tools/explorer/).


### Yandex Translate API-key
```bash
YANDEX_TRANSLATE_KEY='Your Yandex-Translate API-key'
```
You can get API-key on [this page](https://tech.yandex.ru/keys/get/?service=trnsl).
