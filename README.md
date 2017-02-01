# ZoneMTA Locks

## Usage

```javascript
let locker = new ZMTALocks(options)
```

Where

  * **options** is an object to configure ZMTALocks object
    * **client** is a already created connection to Redis
    * **redis** is a Redis client configuration URL or object if `client` is not provided

## Create new lock

```javascript
locker.acquire(zone, domain, messageId, maxConnections, callback)
```

Where

  * **zone** is a Zone name
  * **domain** is a domain name
  * **messageId** is a messageId to lock
  * **maxConnections** is a number that indicates how many locks against zone+domain can be made
  * **callback** *(err, lock)* is a callback function to run with the lock. If lock was already acquired, then `lock` is false

## Release a lock

```javascript
lock.release(callback)
```

Where

  * **callback** *(err, lock)* is a callback function to run once the lock is released
