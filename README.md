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
locker.acquire(zone, domain, messageId, callback)
```

Where

  * **zone** is a Zone name
  * **domain** is a domain name
  * **messageId** is a messageId to lock
  * **callback** *(err, lock)* is a callback function to run with the lock. If lock was already acquired, then `lock` is false

## Release a lock

```javascript
lock.release(callback)
```

Where

  * **callback** *(err, lock)* is a callback function to run once the lock is released
